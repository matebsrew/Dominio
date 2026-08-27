// Mesociclo: o treino não é a mesma coisa toda semana.
//
// Modelo de Israetel et al. (Scientific Principles of Hypertrophy Training):
// a semana 1 começa no volume mínimo eficaz (MEV), somam-se séries a cada semana
// conforme a recuperação, o esforço sobe (RIR cai) até a última semana de
// acumulação, e então vem um deload para dissipar fadiga sem perder o ganho.
//
// Protocolo de deload do livro: primeira metade da semana com a mesma carga,
// metade das séries e metade das repetições; segunda metade com metade da carga.

import { clamp, weekStart, today, addDays, daysBetween } from '../core/util.js';
import { landmarks } from '../data/muscles.js';
import { conflictsWith } from '../data/joints.js';

export const MESO_LENGTH = {
  iniciante: 5,      // 4 semanas de acumulação + deload
  intermediario: 5,
  avancado: 6        // 5 + deload
};

export function mesoLength(profile) {
  return MESO_LENGTH[profile.experience] || 5;
}

export function accumulationWeeks(profile) {
  return mesoLength(profile) - 1;
}

/**
 * Em que ponto do mesociclo a pessoa está.
 * settings.mesoWeek é incrementado a cada semana com treino registrado.
 */
export function phase(profile, settings = {}) {
  const total = mesoLength(profile);
  const accum = accumulationWeeks(profile);
  const forcedDeload = settings.deloadUntil && settings.deloadUntil >= today();
  const week = clamp(settings.mesoWeek || 1, 1, total);
  const isDeload = forcedDeload || week > accum;

  return {
    week,
    total,
    accumulation: accum,
    isDeload,
    label: isDeload ? 'Deload' : `Semana ${week} de ${accum}`,
    rir: rirForWeek(week, accum, isDeload),
    intent: isDeload
      ? 'Dissipar fadiga mantendo o estímulo mínimo. Metade das séries, carga leve, longe da falha.'
      : week === 1
        ? 'Retomada de volume: menos séries, técnica impecável, longe da falha. O volume sobe nas próximas semanas.'
        : week >= accum
          ? 'Pico do mesociclo: maior volume e maior esforço. Depois desta semana vem o deload.'
          : 'Acumulação: some séries onde a recuperação permitir e aproxime-se um pouco mais da falha.'
  };
}

// RIR-alvo por semana: começa longe da falha e aperta até o fim da acumulação.
export function rirForWeek(week, accum, isDeload) {
  if (isDeload) return { label: '3–4', min: 3, max: 4 };
  const ratio = accum <= 1 ? 1 : (week - 1) / (accum - 1);
  const start = 3.5, end = 0.5;
  const value = start - (start - end) * clamp(ratio, 0, 1);
  const lo = Math.max(0, Math.round(value - 0.5));
  const hi = Math.round(value + 0.5);
  return { label: lo === hi ? String(hi) : `${lo}–${hi}`, min: lo, max: hi };
}

/**
 * Séries planejadas de um exercício nesta semana.
 * base   = séries do programa (nível MEV)
 * bias   = ajuste acumulado do músculo vindo do feedback pós-treino
 */
export function setsThisWeek(baseSets, { week, isDeload }, bias = 0, cap = null) {
  if (isDeload) return Math.max(1, Math.round(baseSets * 0.5));
  const ramp = Math.min(week - 1, 4);             // no máximo +4 séries por exercício
  const planned = baseSets + Math.min(ramp, Math.max(0, bias));
  return cap ? Math.min(planned, cap) : planned;
}

/**
 * Volume semanal alvo por músculo dentro do mesociclo: sobe do MEV até
 * o topo do MAV (sem encostar no MRV de propósito).
 */
export function volumeTargetFor(muscleKey, profile, ph) {
  const lm = landmarks(muscleKey, profile);
  if (!lm) return null;
  if (ph.isDeload) return { min: Math.round(lm.mev * 0.5), max: lm.mev, label: 'deload' };
  const ratio = ph.accumulation <= 1 ? 1 : (ph.week - 1) / (ph.accumulation - 1);
  const top = lm.mev + (lm.mav[1] - lm.mev) * clamp(ratio, 0, 1);
  return { min: Math.round(lm.mev), max: Math.round(top), mrv: lm.mrv, label: `semana ${ph.week}` };
}

/**
 * Instrução de deload do dia — o protocolo muda no meio da semana.
 */
export function deloadPrescription(settings) {
  const start = settings.deloadStart || weekStart();
  const elapsed = Math.max(0, daysBetween(start, today()));
  const secondHalf = elapsed >= 3;
  return {
    secondHalf,
    loadFactor: secondHalf ? 0.5 : 1,
    setFactor: 0.5,
    repFactor: 0.5,
    text: secondHalf
      ? 'Segunda metade do deload: metade da carga, metade das séries e metade das repetições. É pouco de propósito.'
      : 'Primeira metade do deload: mantenha a carga, faça metade das séries e metade das repetições de cada uma.'
  };
}

export function startDeload(days = 7) {
  return { deloadUntil: addDays(today(), days), deloadStart: today() };
}

/**
 * Fim do mesociclo: hora de revisar exercícios (Ch. 5 — Variação).
 * As três perguntas do livro, respondidas com os dados do próprio histórico:
 * estagnou na carga, dói na articulação, ou o músculo-alvo já não sente nada.
 */
export function exerciseReview(sessions, exercise, { pain = {}, feedback = [] } = {}) {
  const history = sessions
    .flatMap(s => (s.exercises || []).filter(e => e.id === exercise.id || e.name === exercise.name).map(e => ({ date: s.date, sets: e.sets })))
    .slice(0, 6);
  if (history.length < 3) return null;

  const best = arr => Math.max(...arr.map(x => (x.kg || 0) * (1 + (x.reps || 0) / 30)).filter(Number.isFinite), 0);
  const values = history.map(h => best(h.sets));
  const stalled = values[0] <= values[values.length - 1] * 1.01;
  const painful = conflictsWith(exercise.id, pain).length > 0;
  const muscleFeedback = feedback
    .filter(f => f.muscle === exercise.primary)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);
  const stale = muscleFeedback.length >= 2 && muscleFeedback.every(f => (f.rsm ?? 9) <= 3);

  const flags = [stalled, painful, stale].filter(Boolean).length;
  return {
    exercise, stalled, painful, stale,
    verdict: painful ? 'trocar_agora' : flags >= 2 ? 'trocar_no_proximo' : 'manter',
    message: painful
      ? 'Este exercício vem causando dor. Troque agora por uma variação que não incomode.'
      : flags >= 2
        ? 'Sem progresso na carga e pouca conexão/pump nas últimas sessões. Vale trocar por uma variação no próximo mesociclo.'
        : stalled
          ? 'A carga travou nas últimas sessões, mas o estímulo ainda chega — pode ser só platô normal, não precisa trocar ainda.'
          : 'Ainda está entregando: mantenha enquanto houver progresso, boa execução e conforto articular.'
  };
}
