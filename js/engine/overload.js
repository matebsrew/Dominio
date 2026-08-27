// Quanto de sobrecarga realmente aconteceu entre duas sessões.
//
// Comparar 80 kg × 8 com 82,5 kg × 6 no olho é chute. A equação de Berger
// (usada no MyFit) coloca carga, repetições e repetições em reserva na mesma
// escala e devolve a diferença em porcentagem — dá para saber se a sessão de
// hoje foi melhor que a da semana passada, e em quanto.

import { BY_ID } from '../data/exercises.js';

/** Carga efetiva: o que está na barra mais a parte do corpo que você levanta. */
export function effectiveLoad(kg, exercise, bodyweight) {
  const fraction = exercise?.bw || 0;
  return (kg || 0) + fraction * (bodyweight || 0);
}

// Termo comum da equação: converte carga em "carga equivalente de 1 repetição".
const K1 = 9745640, K2 = 423641, C = 38.1679;
const decay = effectiveReps => Math.exp((131 * effectiveReps) / 5000);

/**
 * Sobrecarga em % de uma série nova sobre uma antiga.
 * Positivo = progrediu. Devolve null quando faltam dados.
 */
export function overloadPercent(oldSet, newSet, { exercise, oldBodyweight = 0, newBodyweight = 0 } = {}) {
  const oldLoad = effectiveLoad(oldSet?.kg, exercise, oldBodyweight);
  const newLoad = effectiveLoad(newSet?.kg, exercise, newBodyweight);
  const oldReps = (oldSet?.reps ?? 0) + (oldSet?.rir ?? 0);
  const newReps = (newSet?.reps ?? 0) + (newSet?.rir ?? 0);
  if (!oldLoad || !newLoad || !oldSet?.reps || !newSet?.reps) return null;

  const num = Math.exp(newReps / C) * (K1 * newLoad - K2);
  const den = decay(oldReps) * (K1 * oldLoad - K2);
  if (!(den > 0) || !(num > 0)) return null;
  return (num / den - 1) * 100;
}

/**
 * Quantas repetições são necessárias na carga de hoje para atingir a
 * sobrecarga desejada sobre a sessão anterior.
 */
export function repsForOverload(oldSet, { kg, rir = 1 }, target, { exercise, oldBodyweight = 0, newBodyweight = 0 } = {}) {
  const oldLoad = effectiveLoad(oldSet?.kg, exercise, oldBodyweight);
  const newLoad = effectiveLoad(kg, exercise, newBodyweight);
  const oldReps = (oldSet?.reps ?? 0) + (oldSet?.rir ?? 0);
  if (!oldLoad || !newLoad || !oldSet?.reps) return null;

  const num = (1 + target / 100) * (K1 * oldLoad - K2) * decay(oldReps);
  const den = K1 * newLoad - K2;
  if (!(den > 0) || !(num > 0)) return null;
  const reps = C * Math.log(num / den) - rir;
  return Number.isFinite(reps) && reps > 0 ? Math.ceil(reps) : null;
}

/** Sobrecarga média entre duas sessões inteiras do mesmo exercício. */
export function sessionOverload(oldSets = [], newSets = [], ctx = {}) {
  const pares = Math.min(oldSets.length, newSets.length);
  const valores = [];
  for (let i = 0; i < pares; i++) {
    const v = overloadPercent(oldSets[i], newSets[i], ctx);
    if (Number.isFinite(v)) valores.push(v);
  }
  if (!valores.length) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

/**
 * Volume de uma série ponderado pela proximidade da falha (MyFit):
 * repetições em reserva contam, porque uma série a 0 RIR estimula mais
 * que a mesma série a 4 RIR.
 */
export function setVolume(set, exercise, bodyweight = 0) {
  const load = effectiveLoad(set?.kg, exercise, bodyweight);
  const reps = (set?.reps ?? 0) + (set?.rir ?? 0);
  return load * reps;
}

export function exerciseVolume(sets = [], exercise, bodyweight = 0) {
  return sets.reduce((acc, s) => acc + setVolume(s, exercise, bodyweight), 0);
}

export function describeOverload(pct) {
  if (!Number.isFinite(pct)) return null;
  const v = Math.abs(pct).toFixed(1).replace('.', ',');
  if (pct >= 0.5) return { tone: 'good', text: `+${v}% de sobrecarga sobre a última sessão` };
  if (pct <= -0.5) return { tone: 'warn', text: `−${v}% em relação à última sessão` };
  return { tone: '', text: 'mesmo desempenho da última sessão' };
}
