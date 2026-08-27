// Treino: check-in, sessão do dia e visão do programa da semana.

import { esc, today, weekdayIndex, WEEKDAYS_SHORT, num, toast, bars, weekStart, addDays } from '../core/util.js';
import { pdata, saveCheckin, checkinFor, deleteCheckin, setProgram, activeProfile, setPain } from '../core/store.js';
import { generateProgram, dayForWeekday, nextDay, weekMap, estimateMinutes } from '../engine/program.js';
import { suggest, volumeReport, plateauDiagnosis, frequencyPerMuscle } from '../engine/progression.js';
import { QUESTIONS, score as readinessScore, sessionPlan, band } from '../engine/readiness.js';
import { phase, setsThisWeek, deloadPrescription } from '../engine/mesocycle.js';
import { estimateLoad, warmupFor } from '../engine/loading.js';
import { REGIONS, PAIN_ADVICE, conflictsWith, saferAlternatives, stressOf } from '../data/joints.js';
import { BY_ID } from '../data/exercises.js';
import { guideHtml, bindGuides } from '../components/guide.js';
import { coach, scaleInput, bindScales, field, sheet, closeSheet, confirmSheet } from '../ui.js';

let draftCheckin = {};

export function render({ profile, go, params }) {
  const data = pdata();
  const program = data.program;

  if (!program) {
    return {
      title: 'Treino',
      html: `<div class="card mt">
        <h2>Nenhum programa montado</h2>
        <p class="muted">Vou montar um split a partir dos seus dias disponíveis, tempo por sessão e equipamento.</p>
        <button class="primary block" data-gerar>Montar meu programa</button>
      </div>`,
      mount(root) {
        root.querySelector('[data-gerar]').addEventListener('click', () => {
          setProgram(generateProgram(profile));
          toast('Programa montado.');
        });
      }
    };
  }

  const scheduled = dayForWeekday(program, weekdayIndex(today()));
  const day = scheduled || nextDay(program, data.sessions);
  const checkin = checkinFor(today());
  const plan = sessionPlan(checkin || draftCheckin, { sleepHours: checkin?.sleepHours, pain: checkin?.pain });
  const trainedToday = data.sessions.some(s => s.date === today() && s.day === day.name);
  const ph = phase(profile, data.settings);
  const isDeload = ph.isDeload;
  const pain = data.settings.pain || {};
  const painRegions = Object.keys(pain).filter(r => pain[r]);
  const warmup = warmupFor(day.name);
  const bodyweight = data.body.find(b => Number.isFinite(b.weight))?.weight || profile.weightKg || 0;

  return {
    title: esc(day.name),
    subtitle: scheduled ? 'treino de hoje' : 'próximo treino da rotação',
    html: `
      ${checkin ? checkinDone(checkin, plan) : checkinForm(pain)}
      ${painRegions.length ? painCard(painRegions, day, profile) : ''}
      ${trainedToday ? coach('Treino de hoje já registrado', 'Você pode abrir de novo para adicionar séries — o histórico soma tudo do dia.', 'good') : ''}
      <div class="card">
        <div class="card-head">
          <div><div class="eyebrow">Sessão · ${esc(ph.label)}</div><h2>${esc(day.name)}</h2>
            <div class="muted tiny">${day.exercises.length} exercícios · ~${day.estimatedMin || estimateMinutes(day.exercises)} min · RIR-alvo ${esc(ph.rir.label)}</div></div>
        </div>
        ${isDeload ? coach('Protocolo de hoje', deloadPrescription(data.settings).text, 'violet') : ''}
        ${day.exercises.map(ex => previewExercise(ex, data, plan, ph, profile, pain, bodyweight)).join('')}
        <button class="primary block mt" data-iniciar>${trainedToday ? 'Abrir sessão novamente' : 'Iniciar treino'}</button>
      </div>

      <div class="card">
        <div class="card-head"><div><div class="eyebrow">Antes de começar</div><h2>${esc(warmup.title)}</h2></div>
          <span class="pill">${warmup.minutes} min</span></div>
        <ul class="muted" style="margin:6px 0;padding-left:20px;line-height:1.6">
          ${warmup.items.map(i => `<li>${esc(i)}</li>`).join('')}
        </ul>
        <p class="dim tiny">Aquecer não é alongar: é subir temperatura, lubrificar a articulação e ensaiar o padrão do movimento. As séries de aproximação de cada exercício aparecem dentro da sessão.</p>
      </div>

      ${volumeCard(data, profile)}
      ${weekCard(program, data)}
      ${program.gaps?.length ? coach('Limite do seu tempo disponível',
        `Com ${profile.daysPerWeek} dias e ${profile.sessionMin} min por sessão, ${program.gaps.map(g => g.label.toLowerCase()).join(', ')} ${program.gaps.length > 1 ? 'ficam' : 'fica'} abaixo do volume mínimo semanal. Uma sessão a mais, ou 10 minutos extras, resolveria — mas treinar consistente do jeito que cabe na sua rotina vale mais que o plano perfeito no papel.`,
        'warn') : ''}

      <div class="row" style="justify-content:center;gap:14px;margin-top:16px">
        <button class="link" data-regerar>Refazer programa</button>
        <button class="link" data-nav="/historico">Histórico</button>
      </div>`,

    mount(root) {
      bindGuides(root);

      root.querySelector('[data-pain]')?.addEventListener('click', e => {
        const btn = e.target.closest('button[data-region]');
        if (btn) btn.classList.toggle('on');
      });

      root.querySelector('[data-limpar-dor]')?.addEventListener('click', () => {
        setPain({});
        toast('Dor removida. Os exercícios originais voltam.');
      });

      bindScales(root, (key, value) => {
        draftCheckin[key] = value;
        const preview = root.querySelector('[data-preview-score]');
        if (preview) {
          const s = readinessScore(draftCheckin);
          preview.textContent = s === null ? '—' : `${s}/100`;
        }
      });

      root.querySelector('[data-salvar-checkin]')?.addEventListener('click', () => {
        const answered = QUESTIONS.filter(q => Number.isFinite(draftCheckin[q.key])).length;
        if (answered < QUESTIONS.length) return toast('Responda as quatro perguntas.');
        const sleepHours = num(root.querySelector('[name="sleepHours"]')?.value);
        const regions = {};
        root.querySelectorAll('[data-pain] button.on').forEach(b => { regions[b.dataset.region] = true; });
        setPain(regions);
        saveCheckin({ ...draftCheckin, sleepHours, pain: Object.keys(regions).length > 0, painRegions: Object.keys(regions), score: readinessScore(draftCheckin) });
        draftCheckin = {};
        toast('Check-in salvo.');
      });

      root.querySelector('[data-refazer-checkin]')?.addEventListener('click', () => {
        draftCheckin = {};
        deleteCheckin(today());
      });

      root.querySelector('[data-iniciar]')?.addEventListener('click', () => go(`/sessao/${day.index}`));
      root.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => go(b.dataset.nav)));

      root.querySelector('[data-regerar]')?.addEventListener('click', async () => {
        const ok = await confirmSheet('Refazer o programa?',
          'Um novo split será montado com seus dados atuais. O histórico de treinos é mantido.', 'Refazer');
        if (!ok) return;
        setProgram(generateProgram(activeProfile()));
        toast('Programa atualizado.');
      });
    }
  };
}

function checkinForm(pain = {}) {
  const s = readinessScore(draftCheckin);
  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Antes de treinar</div><h2>Como você está hoje?</h2></div>
      <span class="pill" data-preview-score>${s === null ? '—' : `${s}/100`}</span></div>
    ${QUESTIONS.map(q => `
      <div class="field">
        <label>${esc(q.label)} <span class="dim" style="font-weight:600">· ${esc(q.hint)}</span></label>
        ${scaleInput(q.key, draftCheckin[q.key], q.scale)}
      </div>`).join('')}
    ${field('Horas de sono na noite passada (opcional)', '<input type="number" inputmode="decimal" name="sleepHours" step="0.5" min="0" max="14" placeholder="7,5">')}
    <div class="field">
      <label>Alguma articulação incomodando? (opcional)</label>
      <div class="chips" data-pain>
        ${Object.entries(REGIONS).map(([key, label]) =>
          `<button type="button" class="chip sm ${pain[key] ? 'on' : ''}" data-region="${key}">${esc(label)}</button>`).join('')}
      </div>
      <div class="hint">Marcando, eu troco automaticamente os exercícios que passam por essa articulação.</div>
    </div>
    <button class="primary block" data-salvar-checkin>Salvar check-in</button>
  </div>`;
}

function checkinDone(checkin, plan) {
  const b = band(checkin.score);
  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Check-in de hoje</div><h2>${esc(b.label)}</h2></div>
      <span class="pill ${b.tone}">${checkin.score ?? '—'}/100</span></div>
    ${coach(plan.title, plan.message, b.tone)}
    <button class="link" data-refazer-checkin>Refazer check-in</button>
  </div>`;
}

function previewExercise(ex, data, plan, ph, profile, pain, bodyweight) {
  const meta = BY_ID[ex.id] || ex;
  const s = suggest({ ...meta, reps: ex.reps }, data.sessions, { readiness: plan.score, deload: ph.isDeload, bodyweight });
  const bias = data.settings.volumeBias?.[ex.primary] || 0;
  const planned = setsThisWeek(ex.sets, ph, bias);
  const sets = Math.max(1, Math.round(planned * (plan.volumeFactor ?? 1)));
  const conflicts = conflictsWith(ex.id, pain);
  const estimate = s.kind === 'primeira' ? estimateLoad(ex.id, profile) : null;

  return `<div class="card flat tight" style="margin:10px 0">
    <div class="row between">
      <div style="min-width:0">
        <b>${esc(ex.name)}</b>
        <div class="muted tiny">${sets} séries · ${ex.reps[0]}–${ex.reps[1]} reps · RIR ${esc(ph.isDeload ? ph.rir.label : s.targetRir)} · descanso ${Math.round((ex.rest || 120) / 60)} min</div>
      </div>
      ${s.suggestedKg ? `<span class="pill ${s.kind === 'subir' ? 'good' : s.kind === 'reduzir' ? 'warn' : ''}">${s.suggestedKg} kg</span>`
        : estimate && !estimate.bodyweight ? `<span class="pill">${estimate.kg} kg${estimate.perSide ? '/lado' : ''}</span>` : ''}
    </div>
    <div class="muted tiny mt">${esc(s.headline)}</div>
    ${s.overloadLabel ? `<div class="overload ${s.overloadLabel.tone}">${esc(s.overloadLabel.text)}</div>` : ''}
    ${s.plateau ? plateauCard(ex, data, profile) : ''}
    ${estimate ? `<div class="dim tiny mt">${esc(estimate.text)} ${esc(estimate.caveat || '')}</div>` : ''}
    ${conflicts.length ? `<div class="tiny mt" style="color:var(--warn)">⚠ Passa pelo ${conflicts.map(c => REGIONS[c].toLowerCase()).join(' e ')} que você marcou como dolorido — troque na sessão.</div>` : ''}
    <button class="link" data-toggle-guide="${esc(ex.id)}">📘 Como executar</button>
    ${guideHtml(ex.id)}
  </div>`;
}

function plateauCard(ex, data, profile) {
  const passos = plateauDiagnosis(ex.name, {
    sessions: data.sessions, checkins: data.checkins, body: data.body,
    volumeReport: volumeReport(data.sessions, profile, weekStart(), BY_ID), profile
  });
  const primeiro = passos.find(p => p.suspeito) || passos[passos.length - 1];
  return `<details class="plateau">
    <summary>Carga travada — ver o que investigar</summary>
    ${passos.map(p => `<div class="plateau-step ${p.suspeito ? 'on' : ''}">
      <span class="plateau-n">${p.ordem}</span>
      <div><b>${esc(p.titulo)}</b><div class="dim tiny">${esc(p.texto)}</div></div>
    </div>`).join('')}
    <p class="dim tiny" style="margin:10px 0 0">Comece pelo passo ${primeiro.ordem}. Mudar o programa antes de checar os anteriores costuma só trocar um problema por outro.</p>
  </details>`;
}

function painCard(regions, day, profile) {
  const affected = day.exercises
    .map(ex => ({ ex, conflicts: conflictsWith(ex.id, Object.fromEntries(regions.map(r => [r, true]))) }))
    .filter(x => x.conflicts.length);

  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Dor registrada</div>
      <h2>${regions.map(r => REGIONS[r]).join(' e ')}</h2></div>
      <button class="sm ghost" data-limpar-dor>já passou</button></div>
    ${regions.map(r => coach(REGIONS[r], PAIN_ADVICE[r], 'warn')).join('')}
    ${affected.length ? `<div class="mt"><div class="eyebrow mb">Exercícios de hoje afetados</div>
      ${affected.map(({ ex }) => {
        const alts = saferAlternatives(ex.id, Object.fromEntries(regions.map(r => [r, true])), profile.equipment);
        return `<div class="stat-line"><div><b>${esc(ex.name)}</b>
          <div class="dim tiny">Trocar por: ${alts.length ? alts.slice(0, 2).map(a => esc(a.name) + (a.relief === 'parcial' ? ' (alívio parcial)' : '')).join(' ou ') : 'nenhuma alternativa cadastrada — reduza carga e amplitude'}</div>
        </div></div>`;
      }).join('')}
      <p class="dim tiny mt">A troca é feita dentro da sessão, no botão "trocar" de cada exercício.</p></div>` : ''}
    <p class="dim tiny mt">Dor que passa de duas semanas, dor com inchaço ou que impede movimentos do dia a dia merece avaliação de um profissional. Este app não diagnostica nada.</p>
  </div>`;
}

function volumeCard(data, profile) {
  const report = volumeReport(data.sessions, profile, weekStart(), BY_ID).filter(r => r.mev > 0 || r.value > 0);
  if (!report.length) return '';
  const items = report.slice(0, 12).map(r => ({
    label: r.short,
    value: r.value,
    valueLabel: `${r.value}`,
    target: r.mav,
    tone: r.status === 'acima' ? 'bad' : r.status === 'ideal' ? 'good' : r.status === 'minimo' ? 'warn' : ''
  }));
  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Volume desta semana</div><h2>Séries por músculo</h2></div></div>
    ${bars(items)}
    <p class="dim tiny mt">A faixa verde é o intervalo onde a maior parte do trabalho deve ficar (MAV).
    Abaixo dela o estímulo é pequeno; acima do máximo recuperável a fadiga cresce mais que o resultado.
    Séries indiretas contam metade.</p>
  </div>`;
}

function weekCard(program, data) {
  const map = weekMap(program);
  const doneDays = new Set(data.sessions.map(s => s.date));
  const start = weekStart();
  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Programa</div><h2>${esc(program.split)}</h2></div>
      <span class="pill">${program.daysPerWeek}x por semana</span></div>
    ${WEEKDAYS_SHORT.map((d, i) => {
      const name = map[i];
      const date = addDays(start, i);
      const done = doneDays.has(date);
      return `<div class="stat-line">
        <span class="muted">${d}${date === today() ? ' · hoje' : ''}</span>
        <b>${name ? esc(name) : '<span class="dim" style="font-weight:600">descanso</span>'} ${done ? '<span class="pill good">✓</span>' : ''}</b>
      </div>`;
    }).join('')}
  </div>`;
}
