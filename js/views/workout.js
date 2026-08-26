// Treino: check-in, sessão do dia e visão do programa da semana.

import { esc, today, weekdayIndex, WEEKDAYS_SHORT, num, toast, bars, weekStart, addDays } from '../core/util.js';
import { pdata, saveCheckin, checkinFor, deleteCheckin, setProgram, activeProfile } from '../core/store.js';
import { generateProgram, dayForWeekday, nextDay, weekMap, estimateMinutes } from '../engine/program.js';
import { suggest, volumeReport } from '../engine/progression.js';
import { QUESTIONS, score as readinessScore, sessionPlan, band } from '../engine/readiness.js';
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
  const isDeload = !!data.settings.deloadUntil && data.settings.deloadUntil >= today();

  return {
    title: esc(day.name),
    subtitle: scheduled ? 'treino de hoje' : 'próximo treino da rotação',
    html: `
      ${checkin ? checkinDone(checkin, plan) : checkinForm()}
      ${trainedToday ? coach('Treino de hoje já registrado', 'Você pode abrir de novo para adicionar séries — o histórico soma tudo do dia.', 'good') : ''}
      <div class="card">
        <div class="card-head">
          <div><div class="eyebrow">Sessão</div><h2>${esc(day.name)}</h2>
            <div class="muted tiny">${day.exercises.length} exercícios · ~${day.estimatedMin || estimateMinutes(day.exercises)} min${isDeload ? ' · semana de deload' : ''}</div></div>
        </div>
        ${day.exercises.map(ex => previewExercise(ex, data, plan, isDeload)).join('')}
        <button class="primary block mt" data-iniciar>${trainedToday ? 'Abrir sessão novamente' : 'Iniciar treino'}</button>
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
        const pain = root.querySelector('[name="pain"]')?.checked || false;
        saveCheckin({ ...draftCheckin, sleepHours, pain, score: readinessScore(draftCheckin) });
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

function checkinForm() {
  const s = readinessScore(draftCheckin);
  return `<div class="card">
    <div class="card-head"><div><div class="eyebrow">Antes de treinar</div><h2>Como você está hoje?</h2></div>
      <span class="pill" data-preview-score>${s === null ? '—' : `${s}/100`}</span></div>
    ${QUESTIONS.map(q => `
      <div class="field">
        <label>${esc(q.label)} <span class="dim" style="font-weight:600">· ${esc(q.hint)}</span></label>
        ${scaleInput(q.key, draftCheckin[q.key], q.scale)}
      </div>`).join('')}
    <div class="grid-2">
      ${field('Horas de sono (opcional)', '<input type="number" inputmode="decimal" name="sleepHours" step="0.5" min="0" max="14" placeholder="7,5">')}
      <div class="field"><label>Dor articular?</label>
        <label class="row" style="gap:8px;font-size:14px;color:var(--text);font-weight:600">
          <input type="checkbox" name="pain" style="width:20px;height:20px"> Sim, algo dói
        </label></div>
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

function previewExercise(ex, data, plan, isDeload) {
  const meta = BY_ID[ex.id] || ex;
  const s = suggest({ ...meta, reps: ex.reps }, data.sessions, { readiness: plan.score, deload: isDeload });
  const sets = Math.max(1, Math.round(ex.sets * (plan.volumeFactor ?? 1)));
  return `<div class="card flat tight" style="margin:10px 0">
    <div class="row between">
      <div style="min-width:0">
        <b>${esc(ex.name)}</b>
        <div class="muted tiny">${sets} séries · ${ex.reps[0]}–${ex.reps[1]} reps · RIR ${s.targetRir} · descanso ${Math.round((ex.rest || 120) / 60)} min</div>
      </div>
      ${s.suggestedKg ? `<span class="pill ${s.kind === 'subir' ? 'good' : s.kind === 'reduzir' ? 'warn' : ''}">${s.suggestedKg} kg</span>` : ''}
    </div>
    <div class="muted tiny mt">${esc(s.headline)}</div>
    <button class="link" data-toggle-guide="${esc(ex.id)}">📘 Como executar</button>
    ${guideHtml(ex.id)}
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
