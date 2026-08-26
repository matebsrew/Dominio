// Progressão de carga, volume semanal e decisão de deload.
//
// Modelo: dupla progressão (sobe repetições dentro da faixa e depois a carga)
// regulada pelo RIR relatado — repetições em reserva. É o método com melhor
// relação entre simplicidade e resultado para quem treina sem supervisão direta.

import { MUSCLES, MUSCLE_ORDER, landmarks, INDIRECT_FACTOR } from '../data/muscles.js';
import { weekStart, weekDays, mean, clamp, round, today, daysBetween } from '../core/util.js';

/* ---------- Métricas de série ---------- */

// 1RM estimado (Epley ajustado pelo RIR): reps efetivas = reps + RIR.
export function e1rm(kg, reps, rir = 0) {
  if (!Number.isFinite(kg) || !Number.isFinite(reps) || reps <= 0) return null;
  const effective = reps + (Number.isFinite(rir) ? rir : 0);
  return kg * (1 + effective / 30);
}

export function bestE1rm(sets = []) {
  const values = sets.map(s => e1rm(s.kg, s.reps, s.rir)).filter(Number.isFinite);
  return values.length ? Math.max(...values) : null;
}

export function tonnage(sets = []) {
  return sets.reduce((acc, s) => acc + ((s.kg || 0) * (s.reps || 0)), 0);
}

// Incremento mínimo prático de carga.
export function loadStep(exercise, currentKg) {
  if (!Number.isFinite(currentKg) || currentKg <= 0) return 2.5;
  const pct = exercise.type === 'composto' ? 0.035 : 0.05;
  const raw = currentKg * pct;
  const minStep = exercise.equip === 'halter' ? 2 : exercise.type === 'composto' ? 2.5 : 1.25;
  return Math.max(minStep, round(raw, exercise.equip === 'halter' ? 2 : 2.5));
}

/* ---------- Histórico ---------- */

export function historyFor(sessions, exerciseName) {
  const out = [];
  for (const s of sessions) {
    for (const ex of s.exercises || []) {
      if (ex.name === exerciseName) {
        const sets = (ex.sets || []).filter(x => Number.isFinite(x.reps));
        if (sets.length) out.push({ date: s.date, ts: s.ts, sets, e1rm: bestE1rm(sets), tonnage: tonnage(sets) });
      }
    }
  }
  return out.sort((a, b) => b.ts - a.ts);
}

/**
 * Sugestão para a sessão de hoje.
 * readiness: 0–100 (prontidão do check-in); deload: true força semana leve.
 */
export function suggest(exercise, sessions, { readiness = null, deload = false } = {}) {
  const history = historyFor(sessions, exercise.name);
  const [min, max] = exercise.reps;
  const last = history[0];

  if (!last) {
    return {
      kind: 'primeira',
      headline: 'Primeira vez neste exercício',
      detail: `Escolha uma carga que permita ${min}–${max} repetições parando com 2–3 na reserva. Esse número vira a base das próximas sessões.`,
      targetReps: [min, max],
      targetRir: '2–3',
      suggestedKg: null,
      history
    };
  }

  const kgs = last.sets.map(s => s.kg).filter(Number.isFinite);
  const topKg = kgs.length ? Math.max(...kgs) : null;
  const reps = last.sets.map(s => s.reps).filter(Number.isFinite);
  const rirs = last.sets.map(s => s.rir).filter(Number.isFinite);
  const minRir = rirs.length ? Math.min(...rirs) : null;
  const step = loadStep(exercise, topKg);

  if (deload) {
    return {
      kind: 'deload',
      headline: 'Semana de deload',
      detail: `Use cerca de 90% da última carga (${topKg ? round(topKg * 0.9, 2.5) : '—'} kg), metade das séries e pare com 3–4 repetições na reserva. A recuperação é o trabalho da semana.`,
      targetReps: [min, max],
      targetRir: '3–4',
      suggestedKg: topKg ? round(topKg * 0.9, 2.5) : null,
      history
    };
  }

  // Estagnação: sem ganho de e1RM nas últimas 3 sessões.
  const recent = history.slice(0, 3).map(h => h.e1rm).filter(Number.isFinite);
  const stalled = recent.length === 3 && recent[0] <= recent[2] * 1.005;

  const allTop = reps.length && reps.every(r => r >= max);
  const anyBelow = reps.filter(r => r < min).length >= 2;

  let out;
  if (allTop && (minRir === null || minRir >= 1)) {
    out = {
      kind: 'subir',
      headline: `Subir carga para ${topKg ? round(topKg + step, 0.5) : '—'} kg`,
      detail: `Você fechou todas as séries no topo da faixa (${max} reps) com ${minRir ?? '—'} na reserva. Suba ${step} kg e volte para ${min}–${min + 1} repetições.`,
      targetReps: [min, max],
      targetRir: '1–2',
      suggestedKg: topKg ? round(topKg + step, 0.5) : null
    };
  } else if (allTop) {
    out = {
      kind: 'consolidar',
      headline: 'Repetir a carga com mais qualidade',
      detail: 'Você chegou ao topo da faixa, mas foi até a falha. Repita a mesma carga guardando 1 repetição para confirmar o ganho antes de subir.',
      targetReps: [min, max],
      targetRir: '1',
      suggestedKg: topKg
    };
  } else if (anyBelow) {
    out = {
      kind: 'reduzir',
      headline: `Reduzir para ${topKg ? round(topKg * 0.92, 0.5) : '—'} kg`,
      detail: `Duas ou mais séries ficaram abaixo de ${min} repetições. Tire cerca de 8% da carga, reconstrua a faixa completa e volte a subir.`,
      targetReps: [min, max],
      targetRir: '2',
      suggestedKg: topKg ? round(topKg * 0.92, 0.5) : null
    };
  } else {
    const nextReps = Math.min(max, Math.max(...reps) + 1);
    out = {
      kind: 'reps',
      headline: `Manter ${topKg ?? '—'} kg e buscar ${nextReps} repetições`,
      detail: `Última sessão: ${describeSets(last.sets)}. Some uma repetição em cada série antes de aumentar o peso.`,
      targetReps: [min, max],
      targetRir: '1–2',
      suggestedKg: topKg
    };
  }

  // Modulação por prontidão.
  if (Number.isFinite(readiness)) {
    if (readiness < 45 && out.kind === 'subir') {
      out = {
        ...out,
        kind: 'segurar',
        headline: `Manter ${topKg ?? '—'} kg (prontidão baixa)`,
        detail: 'Você progrediria hoje, mas o check-in indica recuperação ruim. Mantenha a carga anterior, pare com 3 na reserva e volte a subir na próxima sessão.',
        targetRir: '3',
        suggestedKg: topKg
      };
    } else if (readiness < 45) {
      out = { ...out, targetRir: '3', detail: out.detail + ' Hoje, com recuperação baixa, pare uma repetição antes do habitual.' };
    } else if (readiness >= 80 && out.kind === 'reps') {
      out = { ...out, detail: out.detail + ' Prontidão alta: se as duas primeiras séries saírem fáceis, já pode testar o próximo degrau de carga.' };
    }
  }

  if (stalled && out.kind !== 'subir') {
    out.warning = 'Sem ganho de força nas últimas 3 sessões neste exercício. Se repetir, vale revisar execução, aumentar o descanso, ou trocar por uma variação equivalente.';
  }

  return { ...out, history, last };
}

export function describeSets(sets = []) {
  return sets
    .map(s => `${s.kg ?? '—'}kg × ${s.reps ?? '—'}${Number.isFinite(s.rir) ? ` (RIR ${s.rir})` : ''}`)
    .join(' · ');
}

/* ---------- Volume semanal ---------- */

export function weeklyVolume(sessions, weekStartKey = weekStart(), exerciseIndex = null) {
  const days = new Set(weekDays(weekStartKey));
  const totals = {};
  for (const key of Object.keys(MUSCLES)) totals[key] = 0;

  for (const s of sessions) {
    if (!days.has(s.date)) continue;
    for (const ex of s.exercises || []) {
      const done = (ex.sets || []).filter(x => Number.isFinite(x.reps) && x.reps > 0).length;
      if (!done) continue;
      const meta = exerciseIndex?.[ex.id] || null;
      const primary = meta?.primary || ex.primary;
      const secondary = meta?.secondary || ex.secondary || [];
      if (primary && totals[primary] !== undefined) totals[primary] += done;
      for (const sec of secondary) {
        if (totals[sec] !== undefined) totals[sec] += done * INDIRECT_FACTOR;
      }
    }
  }
  return totals;
}

export function volumeReport(sessions, profile, weekStartKey = weekStart(), exerciseIndex = null) {
  const totals = weeklyVolume(sessions, weekStartKey, exerciseIndex);
  return MUSCLE_ORDER
    .map(key => {
      const lm = landmarks(key, profile);
      const value = +(totals[key] || 0).toFixed(1);
      let status = 'abaixo';
      if (value >= lm.mrv) status = 'acima';
      else if (value >= lm.mav[0]) status = 'ideal';
      else if (value >= lm.mev) status = 'minimo';
      return { ...lm, value, status };
    })
    .filter(r => r.mav[1] > 0);
}

/* ---------- Deload ---------- */

export function deloadCheck(sessions, checkins, profile, settings = {}) {
  const reasons = [];
  const thisWeek = weekStart();
  const lastWeek = weekDays(thisWeek)[0];

  // 1. Volume acima do MRV em pelo menos 2 músculos, 2 semanas seguidas.
  const overThis = volumeReport(sessions, profile, thisWeek).filter(r => r.status === 'acima').length;
  const prevWeekKey = weekDays(thisWeek).length ? weekStart(addDaysSafe(thisWeek, -7)) : thisWeek;
  const overPrev = volumeReport(sessions, profile, prevWeekKey).filter(r => r.status === 'acima').length;
  if (overThis >= 2 && overPrev >= 2) reasons.push('Volume acima do máximo recuperável em vários músculos por 2 semanas.');

  // 2. Prontidão média baixa nos últimos 5 check-ins.
  const recent = checkins.slice(0, 5).map(c => c.score).filter(Number.isFinite);
  if (recent.length >= 3 && mean(recent) < 45) reasons.push('Prontidão média baixa nos últimos check-ins.');

  // 3. Queda de desempenho: e1RM caindo em 2 ou mais exercícios.
  const dropping = performanceDrops(sessions);
  if (dropping.length >= 2) reasons.push(`Força caindo em ${dropping.length} exercícios (${dropping.slice(0, 3).join(', ')}).`);

  // 4. Tempo de mesociclo.
  const mesoWeek = settings.mesoWeek || 1;
  if (mesoWeek >= 6) reasons.push(`${mesoWeek} semanas seguidas acumulando volume — janela normal de deload.`);

  return {
    recommended: reasons.length >= 2 || (reasons.length === 1 && mesoWeek >= 6),
    reasons,
    mesoWeek
  };
}

function addDaysSafe(key, days) {
  const d = new Date(key);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function performanceDrops(sessions) {
  const names = new Set();
  for (const s of sessions.slice(0, 30)) for (const ex of s.exercises || []) names.add(ex.name);
  const dropping = [];
  for (const name of names) {
    const h = historyFor(sessions, name).slice(0, 3).map(x => x.e1rm).filter(Number.isFinite);
    if (h.length === 3 && h[0] < h[1] && h[1] < h[2]) dropping.push(name);
  }
  return dropping;
}

/* ---------- Recordes ---------- */

export function personalRecords(sessions) {
  const map = new Map();
  for (const s of sessions) {
    for (const ex of s.exercises || []) {
      for (const set of ex.sets || []) {
        const value = e1rm(set.kg, set.reps, set.rir);
        if (!Number.isFinite(value)) continue;
        const prev = map.get(ex.name);
        if (!prev || value > prev.e1rm) {
          map.set(ex.name, { name: ex.name, e1rm: value, kg: set.kg, reps: set.reps, rir: set.rir, date: s.date });
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => b.e1rm - a.e1rm);
}

export function streak(sessions) {
  if (!sessions.length) return 0;
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const gap = daysBetween(dates[0], today());
  if (gap > 3) return 0;
  let count = 1;
  for (let i = 1; i < dates.length; i++) {
    if (daysBetween(dates[i], dates[i - 1]) <= 4) count++;
    else break;
  }
  return count;
}
