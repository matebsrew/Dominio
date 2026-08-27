// Revisão da semana — o momento em que o treinador senta com você e decide
// o que muda na semana seguinte.

import { esc, fmt, formatDate, weekStart, addDays, today, minutesLabel, bars, clamp, toast } from '../core/util.js';
import { pdata, saveFeedback, applyVolumeBias, updateSettings } from '../core/store.js';
import { weeklyReview, scoreLabel } from '../engine/coach.js';
import { RSM_QUESTIONS, rsmScore, pendingFeedback, readRsm } from '../engine/feedback.js';
import { startDeload, phase, mesoLength } from '../engine/mesocycle.js';
import { MUSCLES } from '../data/muscles.js';
import { coach, progressBar, metric, sheet, closeSheet, confirmSheet } from '../ui.js';

let viewWeek = weekStart();

export function render({ profile, go }) {
  const data = pdata();
  if (viewWeek > weekStart()) viewWeek = weekStart();
  const review = weeklyReview(profile, data, viewWeek);
  const sl = scoreLabel(review.score);
  const pending = pendingFeedback(data);
  const a = review.adherence;

  return {
    title: 'Semana',
    subtitle: `${review.label}${review.isCurrent ? ' · em andamento' : ''}`,
    html: `
      <div class="row between" style="margin-top:10px">
        <button class="sm ghost" data-sem="-1">← anterior</button>
        <b>${review.isCurrent ? 'Esta semana' : formatDate(viewWeek)}</b>
        <button class="sm ghost" data-sem="1" ${review.isCurrent ? 'disabled' : ''}>seguinte →</button>
      </div>

      ${pending.length ? feedbackCard(pending) : ''}

      ${review.fresh ? `<div class="card">
        <div class="card-head"><div><div class="eyebrow">Primeira semana</div>
          <h2>Por onde começar</h2></div></div>
        <p class="muted">Ainda não há nada registrado — então não tem nota nem cobrança. Cada item abaixo liga uma parte do treinador.</p>
        ${review.checklist.map((c, i) => `<div class="stat-line">
          <div style="flex:1"><b>${i + 1}. ${esc(c.title)}</b>
            <div class="dim tiny">${esc(c.text)}</div></div>
          <button class="sm ghost" data-ir="${esc(c.href)}">abrir</button>
        </div>`).join('')}
      </div>` : ''}

      <div class="card ${review.fresh ? 'hidden' : ''}">
        <div class="card-head">
          <div><div class="eyebrow">Aderência</div><h2>${Number.isFinite(review.score) ? `${review.score}/100` : 'Sem dados'}</h2></div>
          <span class="pill ${sl.tone}">${esc(sl.label)}</span>
        </div>
        ${line('Treinos', `${a.training.done} de ${a.training.planned}`, a.training.pct)}
        ${line('Calorias', a.nutrition.avgKcal ? `${fmt(a.nutrition.avgKcal)} kcal · meta ${fmt(a.nutrition.kcalTarget)}` : `${a.nutrition.daysLogged} dias registrados`, a.nutrition.pct)}
        ${line('Proteína', a.nutrition.avgProtein ? `${fmt(a.nutrition.avgProtein)} g · meta ${fmt(a.nutrition.proteinTarget)} g` : '—', a.protein)}
        ${line('Passos', a.steps.avg ? `${fmt(a.steps.avg)}/dia · meta ${fmt(a.steps.target)}` : '—', a.steps.pct)}
        ${line('Cardio', `${minutesLabel(a.cardio.minutes)} · meta ${minutesLabel(a.cardio.target)}`, a.cardio.pct)}
        ${line('Pesagens', `${a.weighins.done} de 3`, a.weighins.pct)}
        <div class="metrics mt">
          ${metric(Number.isFinite(a.sleep.avg) ? `${a.sleep.avg.toFixed(1)}h` : '—', `sono (${a.sleep.nights} noites)`)}
          ${metric(Number.isFinite(a.readiness) ? Math.round(a.readiness) : '—', 'prontidão média')}
          ${metric(review.phase.label, 'mesociclo')}
        </div>
      </div>

      <div class="card ${review.decisions.length ? '' : 'hidden'}">
        <div class="card-head"><div><div class="eyebrow">Decisões para a próxima semana</div>
          <h2>O que muda</h2></div></div>
        ${review.decisions.map(d => `
          <div class="coach ${d.tone}">
            <b>${esc(d.area)} · ${esc(d.title)}</b>${esc(d.text)}
          </div>`).join('')}
        ${review.phase.week >= review.phase.accumulation && !review.phase.isDeload
          ? '<button class="warn block mt" data-deload>Iniciar semana de deload</button>' : ''}
      </div>

      <div class="card">
        <div class="card-head"><div><div class="eyebrow">Volume por músculo</div>
          <h2>Séries diretas + indiretas</h2></div>
          <span class="pill">${esc(review.phase.label)}</span></div>
        ${bars(review.volume.slice(0, 14).map(v => ({
          label: v.short, value: v.value, valueLabel: `${v.value}`,
          target: v.window ? [v.window.min, v.window.max] : v.mav,
          tone: v.value >= v.mrv ? 'bad' : v.window && v.value >= v.window.min ? 'good' : v.value > 0 ? 'warn' : ''
        })))}
        <p class="dim tiny mt">A faixa verde é o alvo <b>desta semana do mesociclo</b> — ela sobe a cada semana, do volume mínimo até o topo da faixa produtiva, e cai no deload.</p>
      </div>

      ${review.volumeDecisions.length ? `<div class="card">
        <div class="card-head"><div><div class="eyebrow">Feedback dos músculos</div>
          <h2>Ajuste de séries</h2></div></div>
        ${review.volumeDecisions.map(v => `<div class="stat-line">
          <div><b>${esc(v.label)}</b><div class="dim tiny">RSM ${v.rsm}/9 · ${esc(v.label2 || v.label)} ${esc(v.message)}</div></div>
          <span class="pill ${v.tone || ''}">${v.delta > 0 ? '+' : ''}${v.delta} séries</span>
        </div>`).join('')}
        <button class="primary block mt" data-aplicar-volume>Aplicar na próxima semana</button>
      </div>` : ''}

      ${review.wins.length ? `<div class="card">
        <div class="eyebrow">Conquistas</div>
        ${review.wins.map(w => `<div class="stat-line"><div><b>${esc(w.title)}</b>
          <div class="dim tiny">${esc(w.text)}</div></div><span class="pill good">✓</span></div>`).join('')}
      </div>` : ''}`,

    mount(root) {
      root.querySelectorAll('[data-ir]').forEach(btn =>
        btn.addEventListener('click', () => { location.hash = btn.dataset.ir; }));

      root.querySelectorAll('[data-sem]').forEach(btn => btn.addEventListener('click', () => {
        const next = addDays(viewWeek, +btn.dataset.sem * 7);
        if (next > weekStart()) return;
        viewWeek = next;
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }));

      root.querySelector('[data-deload]')?.addEventListener('click', async () => {
        const ok = await confirmSheet('Iniciar deload?',
          'Uma semana com metade das séries e das repetições. Na primeira metade a carga é a mesma; na segunda, metade dela.', 'Iniciar');
        if (ok) { updateSettings(startDeload()); toast('Deload iniciado.'); }
      });

      root.querySelector('[data-aplicar-volume]')?.addEventListener('click', () => {
        const map = {};
        for (const v of review.volumeDecisions) map[v.muscle] = v.nextBias;
        applyVolumeBias(map);
        toast('Volume da próxima semana ajustado.');
      });

      root.querySelectorAll('[data-feedback]').forEach(btn => btn.addEventListener('click', () => {
        const item = pending.find(p => p.session.id === btn.dataset.feedback);
        if (item) openFeedbackSheet(item);
      }));
    }
  };
}

function line(label, value, pct) {
  const tone = !Number.isFinite(pct) ? '' : pct >= 90 ? 'good' : pct >= 65 ? 'warn' : 'bad';
  return `<div style="margin:11px 0">
    <div class="row between" style="font-size:12.5px;margin-bottom:4px">
      <span class="muted">${esc(label)}</span><b>${esc(value)}</b></div>
    ${progressBar(Number.isFinite(pct) ? clamp(pct, 0, 100) : 0, 100, tone)}
  </div>`;
}

function feedbackCard(pending) {
  const p = pending[0];
  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Falta responder</div>
      <h2>Como ficou o ${esc(p.session.day)}?</h2></div>
      <span class="pill warn">${p.muscles.length} músculo${p.muscles.length > 1 ? 's' : ''}</span></div>
    <p class="muted">Três perguntas por músculo. É esse retorno que decide se eu somo ou tiro séries na próxima semana — sem ele, o volume vira chute.</p>
    <button class="primary block" data-feedback="${esc(p.session.id)}">Responder (leva 1 minuto)</button>
  </div>`;
}

function openFeedbackSheet(item) {
  const answers = {};
  const muscles = item.muscles;

  const body = muscles.map(muscle => `
    <div class="card flat tight" data-muscle="${esc(muscle)}">
      <h3>${esc(MUSCLES[muscle]?.label || muscle)}</h3>
      ${RSM_QUESTIONS.map(q => `
        <div class="field">
          <label>${esc(q.label)} <span class="dim" style="font-weight:600">· ${esc(q.hint)}</span></label>
          <div class="scale" data-rsm="${esc(muscle)}:${q.key}" style="grid-template-columns:repeat(4,1fr)">
            ${[0, 1, 2, 3].map(n => `<button type="button" data-value="${n}">${esc(q.scale[n])}</button>`).join('')}
          </div>
        </div>`).join('')}
      <label class="row" style="gap:8px;font-size:13px;color:var(--text);font-weight:600;margin-top:6px">
        <input type="checkbox" data-sore="${esc(muscle)}" style="width:19px;height:19px">
        Ainda estava dolorido no treino seguinte
      </label>
    </div>`).join('');

  sheet(`
    <h2>Feedback do ${esc(item.session.day)}</h2>
    <p class="muted">Responda pensando nas 24–48 h depois do treino.</p>
    ${body}
    <button class="primary block mt" data-salvar>Salvar feedback</button>
    <button class="ghost block" data-close>Depois</button>`, {
    onMount(sheetEl) {
      sheetEl.querySelectorAll('[data-rsm]').forEach(group => {
        group.addEventListener('click', e => {
          const btn = e.target.closest('button[data-value]');
          if (!btn) return;
          group.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
          const [muscle, key] = group.dataset.rsm.split(':');
          answers[muscle] = { ...(answers[muscle] || {}), [key]: +btn.dataset.value };
        });
      });

      sheetEl.querySelector('[data-salvar]').addEventListener('click', () => {
        let saved = 0;
        for (const muscle of muscles) {
          const score = rsmScore(answers[muscle] || {});
          if (score === null) continue;
          const stillSore = sheetEl.querySelector(`[data-sore="${muscle}"]`)?.checked || false;
          saveFeedback({ date: item.session.date, day: item.session.day, muscle, ...answers[muscle], rsm: score, stillSore });
          saved++;
        }
        if (!saved) return toast('Responda ao menos um músculo.');
        closeSheet();
        toast('Feedback salvo. O volume da próxima semana já considera isso.');
      });
    }
  });
}
