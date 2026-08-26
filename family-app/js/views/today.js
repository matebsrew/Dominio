// Painel principal — o retrato do dia.

import { esc, fmt, kg, today, formatLongDate, weekdayIndex, clamp, signed, sparkline, ring, minutesLabel } from '../core/util.js';
import { pdata, updateSettings } from '../core/store.js';
import { snapshot } from '../engine/diary.js';
import { dayForWeekday, nextDay, estimateMinutes } from '../engine/program.js';
import { deloadCheck } from '../engine/progression.js';
import { band } from '../engine/readiness.js';
import { GOAL_LABEL } from '../engine/energy.js';
import { fmtRate, projection } from '../engine/adaptive.js';
import { coach, progressBar, metric } from '../ui.js';

export function render({ profile, go }) {
  const data = pdata();
  const snap = snapshot(profile, data);
  const program = data.program;
  const scheduled = dayForWeekday(program, weekdayIndex(today()));
  const upcoming = scheduled || nextDay(program, data.sessions);
  const deload = deloadCheck(data.sessions, data.checkins, profile, data.settings);
  const isDeload = !!data.settings.deloadUntil && data.settings.deloadUntil >= today();

  const firstName = profile.name.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return {
    title: `${greeting}, ${firstName}`,
    subtitle: formatLongDate(today()),
    html: `
      ${alerts(snap, deload, isDeload)}
      ${trainingCard(snap, upcoming, scheduled, isDeload)}
      ${nutritionCard(snap)}
      ${activityCard(snap)}
      ${recoveryCard(snap)}
      ${weightCard(snap, profile)}
      ${goalCard(snap, profile, adjShownOnTop(snap))}
      <div class="row" style="justify-content:center;margin-top:18px;gap:16px">
        <button class="link" data-nav="/historico">Histórico</button>
        <button class="link" data-nav="/ajustes">Ajustes</button>
      </div>`,

    mount(root) {
      root.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => go(b.dataset.nav)));
      root.querySelector('[data-aplicar-ajuste]')?.addEventListener('click', () => {
        const delta = +root.querySelector('[data-aplicar-ajuste]').dataset.aplicarAjuste;
        updateSettings({
          kcalOffset: (data.settings.kcalOffset || 0) + delta,
          lastAdjust: snap.weekStart
        });
      });
      root.querySelector('[data-deload]')?.addEventListener('click', () => {
        const until = new Date();
        until.setDate(until.getDate() + 7);
        updateSettings({ deloadUntil: until.toISOString().slice(0, 10), mesoWeek: 1 });
      });
    }
  };
}

function alerts(snap, deload, isDeload) {
  const out = [];
  if (isDeload) {
    out.push(coach('Semana de deload em andamento',
      'Cargas em torno de 90%, metade das séries e 3–4 repetições na reserva. É aqui que a recuperação acontece.', 'violet'));
  } else if (deload.recommended) {
    out.push(`<div class="card tight">
      ${coach('Hora de um deload', deload.reasons.join(' '), 'warn')}
      <button class="warn block sm" data-deload>Iniciar semana de deload</button>
    </div>`);
  }

  const adj = snap.adjustment;
  if (adj.status === 'ajustar' && adj.deltaKcal) {
    out.push(`<div class="card tight">
      ${coach(adj.title, adj.detail, adj.deltaKcal > 0 ? 'good' : 'warn')}
      <button class="primary block sm" data-aplicar-ajuste="${adj.deltaKcal}">
        Aplicar ${signed(adj.deltaKcal, 0, ' kcal/dia')}
      </button>
    </div>`);
  }
  return out.join('');
}

function trainingCard(snap, upcoming, scheduled, isDeload) {
  if (!upcoming) {
    return `<div class="card"><div class="eyebrow">Treino</div>
      <p class="muted mt">Nenhum programa montado ainda.</p>
      <button class="primary block" data-nav="/treino">Montar programa</button></div>`;
  }

  const done = snap.sessionsToday.some(x => x.day === upcoming.name);
  const minutes = upcoming.estimatedMin || estimateMinutes(upcoming.exercises);
  const sets = upcoming.exercises.reduce((a, e) => a + e.sets, 0);

  return `<div class="card">
    <div class="card-head">
      <div><div class="eyebrow">Treino</div><h2>${esc(upcoming.name)}</h2></div>
      ${done ? '<span class="pill good">✓ feito hoje</span>' : scheduled ? '<span class="pill">de hoje</span>' : '<span class="pill warn">próximo</span>'}
    </div>
    <div class="muted">${upcoming.exercises.length} exercícios · ${sets} séries · ~${minutes} min${isDeload ? ' · deload' : ''}</div>
    <div class="muted tiny mt">${esc(upcoming.exercises.slice(0, 4).map(e => e.name).join(' · '))}${upcoming.exercises.length > 4 ? ' …' : ''}</div>
    <button class="${done ? '' : 'primary'} block mt" data-nav="/treino">${done ? 'Ver treino de hoje' : 'Abrir treino'}</button>
  </div>`;
}

function nutritionCard(snap) {
  if (!snap.targets) return '';
  const { macros: m } = snap.targets;
  const n = snap.nutrition;
  const pct = clamp((n.kcal / m.kcal) * 100, 0, 100);
  const left = m.kcal - n.kcal;

  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Nutrição</div><h2>${fmt(n.kcal)} / ${fmt(m.kcal)} kcal</h2></div>
      <span class="pill ${left >= 0 ? '' : 'warn'}">${left >= 0 ? `faltam ${fmt(left)}` : `${fmt(-left)} acima`}</span></div>
    ${ring(pct, `${Math.round(pct)}%`, 'do dia', pct > 105 ? 'warn' : 'accent')}
    <div class="mt">
      ${macroLine('Proteína', n.protein, m.protein, 'g', 'good')}
      ${macroLine('Carboidrato', n.carbs, m.carbs, 'g')}
      ${macroLine('Gordura', n.fat, m.fat, 'g')}
      ${macroLine('Água', Math.round(n.water / 100) / 10, Math.round(m.waterMl / 100) / 10, 'L')}
    </div>
    <button class="block mt" data-nav="/nutricao">${n.count ? `Ver as ${n.count} refeições` : 'Registrar refeição'}</button>
  </div>`;
}

function projectionLabel(proj) {
  if (proj.weeks > 78) return 'mais de 18 meses — ritmo muito lento';
  if (proj.weeks > 16) return `≈ ${Math.round(proj.weeks / 4.3)} meses`;
  return `≈ ${proj.weeks} semanas`;
}

function macroLine(label, value, target, unit, tone = '') {
  const pct = target > 0 ? clamp((value / target) * 100, 0, 100) : 0;
  return `<div style="margin:9px 0">
    <div class="row between" style="font-size:12.5px;margin-bottom:4px">
      <span class="muted">${esc(label)}</span>
      <b>${fmt(value, unit === 'L' ? 1 : 0)} / ${fmt(target, unit === 'L' ? 1 : 0)} ${unit}</b>
    </div>
    ${progressBar(pct, 100, tone)}
  </div>`;
}

function activityCard(snap) {
  const c = snap.cardio;
  const stepGoal = c.target.steps;
  const steps = c.todaySteps;
  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Atividade</div>
      <h2>${steps === null ? 'Sem passos hoje' : `${fmt(steps)} / ${fmt(stepGoal)} passos`}</h2></div></div>
    ${steps !== null ? progressBar(steps, stepGoal, steps >= stepGoal ? 'good' : '') : ''}
    <div class="metrics mt">
      ${metric(minutesLabel(c.minutes), `cardio (meta ${c.target.minutes} min)`)}
      ${metric(c.steps.avg ? fmt(c.steps.avg) : '—', 'média de passos')}
      ${metric(c.todayCardio.length ? minutesLabel(c.todayCardio.reduce((a, x) => a + x.minutes, 0)) : '—', 'cardio hoje')}
    </div>
    <button class="block mt" data-nav="/atividade">Cardio e passos</button>
  </div>`;
}

function recoveryCard(snap) {
  const c = snap.checkin;
  const b = band(c?.score);
  if (!c) {
    return `<div class="card">
      <div class="eyebrow">Recuperação</div>
      <h2>Check-in de hoje</h2>
      <p class="muted">Quatro perguntas rápidas. É com elas que eu decido se hoje é dia de subir carga ou de segurar.</p>
      <button class="primary block" data-nav="/treino">Fazer check-in</button>
    </div>`;
  }
  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Recuperação</div><h2>${esc(b.label)}</h2></div>
      <span class="pill ${b.tone}">${c.score}/100</span></div>
    <div class="metrics">
      ${metric(c.sleepHours ? `${c.sleepHours}h` : `${c.sleep ?? '—'}/5`, 'sono')}
      ${metric(`${c.energy ?? '—'}/5`, 'energia')}
      ${metric(`${c.soreness ?? '—'}/5`, 'dor muscular')}
    </div>
    ${coach(snap.plan.title, snap.plan.message, b.tone)}
  </div>`;
}

function weightCard(snap, profile) {
  const series = snap.weight.series || [];
  const last = series.at(-1);
  if (!last) {
    return `<div class="card">
      <div class="eyebrow">Peso</div><h2>Sem pesagens</h2>
      <p class="muted">Pese-se de manhã, em jejum, pelo menos 3 vezes por semana. Eu uso a média — o peso de um dia só não diz nada.</p>
      <button class="primary block" data-nav="/corpo">Registrar peso</button>
    </div>`;
  }
  const rate = snap.weight.ratePerWeek;
  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Peso</div><h2>${kg(last.avg)}</h2>
      <div class="muted tiny">média de ${last.count} pesagem${last.count > 1 ? 's' : ''} desta semana</div></div>
      ${Number.isFinite(rate) ? `<span class="pill ${Math.abs(rate) < 0.05 ? '' : rate > 0 ? 'good' : 'warn'}">${fmtRate(rate)}</span>` : ''}</div>
    ${sparkline(series.map(s => s.avg), { stroke: 'var(--accent)' })}
    <div class="row between tiny dim"><span>${series.length} semanas</span>${profile.targetWeightKg ? `<span>alvo ${kg(profile.targetWeightKg)}</span>` : ''}</div>
    <button class="block mt" data-nav="/corpo">Peso, bioimpedância e medidas</button>
  </div>`;
}

function adjShownOnTop(snap) {
  return snap.adjustment.status === 'ajustar' && !!snap.adjustment.deltaKcal;
}

function goalCard(snap, profile, adjOnTop) {
  const rate = snap.weight.ratePerWeek;
  const proj = projection(snap.weight.lastAvg, profile.targetWeightKg, rate);
  const adj = snap.adjustment;
  const tone = adj.status === 'ok' ? 'good' : adj.status === 'sem_dados' ? '' : 'warn';

  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Objetivo</div><h2>${esc(GOAL_LABEL[profile.goal] || profile.goal)}</h2></div>
      <span class="pill ${tone}">${adj.status === 'ok' ? 'no ritmo' : adj.status === 'sem_dados' ? 'coletando' : 'ajustar'}</span></div>
    ${adjOnTop
      ? `<div class="stat-line"><span class="muted">Ajuste sugerido</span><b>${signed(adj.deltaKcal, 0, ' kcal/dia')}</b></div>`
      : coach(adj.title, adj.detail, tone)}
    ${proj ? `<div class="stat-line"><span class="muted">Projeção no ritmo atual</span><b>${esc(projectionLabel(proj))}</b></div>` : ''}
    <div class="stat-line"><span class="muted">Treinos nesta semana</span><b>${snap.sessionsThisWeek} de ${profile.daysPerWeek}</b></div>
  </div>`;
}
