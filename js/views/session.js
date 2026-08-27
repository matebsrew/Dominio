// Sessão em andamento: registro série a série com sugestão e timer.

import { esc, num, toast, today, clamp } from '../core/util.js';
import { pdata, saveSession, checkinFor } from '../core/store.js';
import { dayForWeekday, nextDay } from '../engine/program.js';
import { suggest, describeSets, e1rm } from '../engine/progression.js';
import { sessionPlan } from '../engine/readiness.js';
import { phase, setsThisWeek, deloadPrescription } from '../engine/mesocycle.js';
import { estimateLoad, warmupSets } from '../engine/loading.js';
import { conflictsWith, saferAlternatives, REGIONS } from '../data/joints.js';
import { musclesOf } from '../engine/feedback.js';
import { BY_ID, alternatives } from '../data/exercises.js';
import { guideHtml, bindGuides } from '../components/guide.js';
import { coach, sheet, closeSheet, confirmSheet } from '../ui.js';

const DRAFT_KEY = 'dominio.session.draft';
let timer = { interval: null, endsAt: 0, total: 0 };

function loadDraft(profileId, dayName) {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (raw && raw.profileId === profileId && raw.day === dayName && raw.date === today()) return raw;
  } catch { /* ignora */ }
  return null;
}

function saveDraft(draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* ignora */ }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignora */ }
}

export function render({ profile, params, go }) {
  const data = pdata();
  const program = data.program;
  if (!program) { go('/treino'); return { title: 'Treino', html: '' }; }

  const index = clamp(+params[0] || 0, 0, program.days.length - 1);
  const day = { ...program.days[index], index };
  const checkin = checkinFor(today());
  const plan = sessionPlan(checkin || {}, { sleepHours: checkin?.sleepHours, pain: checkin?.pain });
  const ph = phase(profile, data.settings);
  const isDeload = ph.isDeload;
  const pain = data.settings.pain || {};

  const draft = loadDraft(profile.id, day.name) || {
    profileId: profile.id, day: day.name, date: today(), startedAt: Date.now(),
    swaps: {}, sets: {}
  };

  const exercises = day.exercises.map(ex => {
    const id = draft.swaps[ex.id] || ex.id;
    const meta = BY_ID[id] || ex;
    return {
      ...ex,
      id,
      name: meta.name || ex.name,
      primary: meta.primary || ex.primary,
      secondary: meta.secondary || ex.secondary,
      reps: meta.reps || ex.reps,
      rest: meta.rest || ex.rest,
      type: meta.type || ex.type,
      plannedSets: Math.max(1, Math.round(
        setsThisWeek(ex.sets, ph, data.settings.volumeBias?.[meta.primary || ex.primary] || 0) * (plan.volumeFactor ?? 1)
      ))
    };
  });

  return {
    title: esc(day.name),
    subtitle: 'sessão em andamento',
    html: `
      ${plan.score !== null ? coach(plan.title, plan.message, plan.band.tone) : ''}
      ${isDeload ? coach('Deload', deloadPrescription(data.settings).text, 'violet') : ''}
      <div id="exercises">
        ${exercises.map((ex, i) => exerciseCard(ex, i, data, plan, ph, draft, profile, pain)).join('')}
      </div>
      <div class="card">
        <label>Como foi o treino? (opcional)</label>
        <textarea name="notes" rows="2" placeholder="Ombro incomodou no supino, energia boa...">${esc(draft.notes || '')}</textarea>
        <button class="good block mt" data-salvar>Salvar treino</button>
        <button class="link block" data-cancelar>Descartar sessão</button>
      </div>
      <div class="timer-fab hidden" id="timerBox">
        <div class="row between"><span class="dim tiny">Descanso</span><button class="link" id="timerClose" style="padding:0 4px">✕</button></div>
        <strong id="timerText">0:00</strong>
        <div class="row tight mt"><button class="sm" data-add="30">+30s</button><button class="sm" data-add="60">+1m</button></div>
      </div>`,

    mount(root) {
      bindGuides(root);

      const persist = () => {
        draft.sets = collect(root, exercises);
        draft.notes = root.querySelector('[name="notes"]')?.value || '';
        saveDraft(draft);
      };

      root.addEventListener('input', e => {
        if (e.target.matches('.set-row input, textarea')) persist();
        if (e.target.matches('.set-row input')) markRow(e.target);
      });

      root.querySelectorAll('[data-timer]').forEach(btn => {
        btn.addEventListener('click', () => startTimer(+btn.dataset.timer, root));
      });

      root.querySelectorAll('[data-add-set]').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.exercise-card');
          const list = card.querySelector('.sets');
          const n = list.children.length + 1;
          const ex = exercises[+card.dataset.index];
          list.insertAdjacentHTML('beforeend', setRow(n, ex, null, null));
          bindRowButtons(card, root);
          persist();
        });
      });

      root.querySelectorAll('[data-trocar]').forEach(btn => {
        btn.addEventListener('click', () => openSwap(btn.dataset.trocar, profile, draft, root, pain));
      });

      bindRowButtons(root, root);

      root.querySelector('#timerClose')?.addEventListener('click', () => stopTimer(root));
      root.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
        timer.endsAt += (+b.dataset.add) * 1000;
        tick(root);
      }));

      root.querySelector('[data-salvar]').addEventListener('click', () => {
        const sets = collect(root, exercises);
        const payload = exercises
          .map(ex => ({
            id: ex.id, name: ex.name, primary: ex.primary, secondary: ex.secondary,
            sets: (sets[ex.id] || []).filter(s => Number.isFinite(s.reps) && s.reps > 0)
          }))
          .filter(ex => ex.sets.length);

        if (!payload.length) return toast('Registre pelo menos uma série.');

        const durationMin = Math.round((Date.now() - (draft.startedAt || Date.now())) / 60000);
        saveSession({
          day: day.name,
          exercises: payload,
          notes: root.querySelector('[name="notes"]')?.value || '',
          readiness: plan.score,
          deload: isDeload,
          durationMin: durationMin > 0 && durationMin < 300 ? durationMin : null
        });
        clearDraft();
        stopTimer(root);
        const totalSets = payload.reduce((a, e) => a + e.sets.length, 0);
        toast(`Treino salvo: ${totalSets} séries. Responda o feedback quando o músculo assentar.`);
        go('/hoje');
      });

      root.querySelector('[data-cancelar]').addEventListener('click', async () => {
        const ok = await confirmSheet('Descartar esta sessão?', 'As séries digitadas serão perdidas.', 'Descartar');
        if (!ok) return;
        clearDraft();
        stopTimer(root);
        go('/treino');
      });

      return () => stopTimer(root);
    }
  };
}

function exerciseCard(ex, index, data, plan, ph, draft, profile, pain) {
  const meta = BY_ID[ex.id] || ex;
  const s = suggest({ ...meta, reps: ex.reps }, data.sessions, { readiness: plan.score, deload: ph.isDeload });
  const saved = draft.sets?.[ex.id] || [];
  const count = Math.max(ex.plannedSets, saved.length);
  const conflicts = conflictsWith(ex.id, pain);
  const estimate = s.kind === 'primeira' ? estimateLoad(ex.id, profile) : null;
  const workingKg = s.suggestedKg ?? (estimate && !estimate.bodyweight ? estimate.kg : null);
  const warmups = warmupSets(ex.id, workingKg, profile);

  return `<div class="exercise-card" data-index="${index}" data-ex="${esc(ex.id)}">
    <div class="row between">
      <div style="min-width:0"><h3>${esc(ex.name)}</h3>
        <div class="muted tiny">${ex.plannedSets} séries · ${ex.reps[0]}–${ex.reps[1]} reps · RIR ${esc(ph.isDeload ? ph.rir.label : s.targetRir)}</div></div>
      <button class="sm ghost ${conflicts.length ? 'warn' : ''}" data-trocar="${esc(ex.id)}">${conflicts.length ? '⚠ trocar' : 'trocar'}</button>
    </div>
    ${conflicts.length ? `<div class="coach warn"><b>Passa pelo ${conflicts.map(c => REGIONS[c].toLowerCase()).join(' e ')} dolorido</b>Troque por uma variação que poupe a articulação, ou reduza carga e amplitude até parar de incomodar.</div>` : ''}

    <div class="coach ${s.kind === 'subir' ? 'good' : s.kind === 'reduzir' || s.kind === 'segurar' ? 'warn' : ''}">
      <b>${esc(s.headline)}</b>${esc(s.detail)}
      ${s.warning ? `<div class="tiny" style="margin-top:6px;color:var(--warn)">${esc(s.warning)}</div>` : ''}
    </div>
    ${s.last ? `<div class="dim tiny">Última sessão (${esc(s.last.date)}): ${esc(describeSets(s.last.sets))}</div>` : ''}
    ${estimate ? `<div class="dim tiny">${esc(estimate.text)}${estimate.caveat ? ' ' + esc(estimate.caveat) : ''}</div>` : ''}
    ${warmups.length ? `<div class="warmup">
      <span class="eyebrow">Aproximação</span>
      ${warmups.map(w => `<span class="warmup-set"><i>${w.pct}%</i>${w.kg} kg × ${w.reps}</span>`).join('')}
      <span class="dim tiny" style="display:block;margin-top:5px">Séries de aquecimento não contam no volume — não registre abaixo.</span>
    </div>` : ''}

    <button class="link" data-toggle-guide="${esc(ex.id)}">📘 Como executar</button>
    ${guideHtml(ex.id)}

    <div class="sets mt">
      ${Array.from({ length: count }, (_, i) =>
        setRow(i + 1, ex, s, saved[i] || null)).join('')}
    </div>
    <div class="row tight">
      <button class="sm ghost" data-add-set>+ série</button>
      <button class="sm ghost" data-timer="${ex.rest || 120}">⏱ ${Math.round((ex.rest || 120) / 60)} min</button>
    </div>
  </div>`;
}

function setRow(n, ex, suggestion, saved) {
  const hintKg = suggestion?.suggestedKg ?? '';
  return `<div class="set-row">
    <div class="set-n ${saved?.reps ? 'done' : ''}">${n}</div>
    <div><label>kg</label><input class="kg" inputmode="decimal" value="${saved?.kg ?? ''}" placeholder="${hintKg || '0'}"></div>
    <div><label>reps</label><input class="reps" inputmode="numeric" value="${saved?.reps ?? ''}" placeholder="${ex.reps[0]}-${ex.reps[1]}"></div>
    <div><label>RIR</label><input class="rir" inputmode="decimal" value="${saved?.rir ?? ''}" placeholder="${(suggestion?.targetRir || '2').replace('–', '-')}"></div>
    <button class="icon-btn" data-timer="${ex.rest || 120}">⏱</button>
  </div>`;
}

function bindRowButtons(scope, root) {
  scope.querySelectorAll('[data-timer]').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => startTimer(+btn.dataset.timer, root));
  });
}

function markRow(input) {
  const row = input.closest('.set-row');
  const reps = num(row.querySelector('.reps').value);
  row.querySelector('.set-n').classList.toggle('done', Number.isFinite(reps) && reps > 0);
}

function collect(root, exercises) {
  const out = {};
  root.querySelectorAll('.exercise-card').forEach(card => {
    const id = card.dataset.ex;
    out[id] = [...card.querySelectorAll('.set-row')].map(row => ({
      kg: num(row.querySelector('.kg').value),
      reps: num(row.querySelector('.reps').value),
      rir: num(row.querySelector('.rir').value)
    })).filter(s => s.kg !== null || s.reps !== null || s.rir !== null);
  });
  return out;
}

function openSwap(exerciseId, profile, draft, root, pain = {}) {
  const painful = Object.keys(pain).filter(r => pain[r]).length > 0;
  const alts = painful
    ? saferAlternatives(exerciseId, pain, profile.equipment)
    : alternatives(exerciseId, profile.equipment);
  if (!alts.length) return toast('Sem alternativas cadastradas para este movimento.');
  sheet(`
    <h2>Trocar exercício</h2>
    <p class="muted">${painful
      ? 'Alternativas escolhidas para poupar a articulação que você marcou como dolorida.'
      : 'Mesma função no treino — troque se o aparelho estiver ocupado ou se o movimento incomodar.'}</p>
    ${alts.map(a => `<button class="block" style="justify-content:flex-start;margin:8px 0" data-alt="${esc(a.id)}">
      <span style="text-align:left"><b>${esc(a.name)}</b>${a.relief ? ` <span class="pill ${a.relief === 'total' ? 'good' : 'warn'}">${a.relief === 'total' ? 'poupa a articulação' : 'alívio parcial'}</span>` : ''}<br><span class="dim tiny">${esc(a.feel)}</span></span></button>`).join('')}
    <button class="ghost block mt" data-close>Cancelar</button>`, {
    onMount(sheetEl) {
      sheetEl.querySelectorAll('[data-alt]').forEach(btn => {
        btn.addEventListener('click', () => {
          draft.swaps[exerciseId] = btn.dataset.alt;
          saveDraft(draft);
          closeSheet();
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        });
      });
    }
  });
}

/* ---------- Timer de descanso ---------- */

function startTimer(seconds, root) {
  timer.total = seconds;
  timer.endsAt = Date.now() + seconds * 1000;
  root.querySelector('#timerBox')?.classList.remove('hidden');
  clearInterval(timer.interval);
  timer.interval = setInterval(() => tick(root), 250);
  tick(root);
}

function tick(root) {
  const box = root.querySelector('#timerBox');
  if (!box) return stopTimer(root);
  const left = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
  const text = root.querySelector('#timerText');
  if (text) text.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  box.classList.toggle('done', left === 0);
  if (left === 0) {
    clearInterval(timer.interval);
    if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
  }
}

function stopTimer(root) {
  clearInterval(timer.interval);
  timer.interval = null;
  root?.querySelector('#timerBox')?.classList.add('hidden');
}
