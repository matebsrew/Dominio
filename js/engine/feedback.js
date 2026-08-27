// Feedback pós-treino — é isto que faz o volume ser seu, e não do papel.
//
// Israetel chama de RSM (Raw Stimulus Magnitude): depois da sessão, avalie de
// 0 a 3 três coisas em cada músculo treinado — conexão com o músculo, pump e
// perturbação (fadiga/dor). Soma 4–6 significa que você está no ponto certo de
// volume. Bem abaixo disso, faltou estímulo: some séries. Bem acima, sobrou:
// tire séries. Combinado com o desempenho da sessão, isso define a semana seguinte.

import { mean, weekStart, weekDays, today } from '../core/util.js';
import { MUSCLES, landmarks } from '../data/muscles.js';

export const RSM_QUESTIONS = [
  { key: 'connection', label: 'Conexão', hint: 'Sentiu o músculo-alvo trabalhando?',
    scale: ['Nada', 'Pouco', 'Bem', 'Muito'] },
  { key: 'pump', label: 'Pump', hint: 'O músculo ficou inchado/congestionado?',
    scale: ['Nenhum', 'Leve', 'Bom', 'Enorme'] },
  { key: 'disruption', label: 'Perturbação', hint: 'Quanto o músculo ficou fatigado/dolorido?',
    scale: ['Nada', 'Leve', 'Moderada', 'Muita'] }
];

export function rsmScore(answers = {}) {
  const values = RSM_QUESTIONS.map(q => answers[q.key]).filter(Number.isFinite);
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0);
}

/**
 * Leitura do RSM de um músculo: quantas séries somar (ou tirar) na próxima semana.
 */
export function readRsm(score, { performanceDown = false, stillSore = false } = {}) {
  if (!Number.isFinite(score)) return { delta: 0, label: 'sem dados', message: 'Sem feedback registrado para este músculo.' };

  if (performanceDown || stillSore) {
    return {
      delta: -1, tone: 'warn', label: 'recuperação atrasada',
      message: stillSore
        ? 'O músculo ainda estava dolorido na sessão seguinte: a recuperação não fechou. Tire uma série na próxima semana.'
        : 'O desempenho caiu neste músculo. Segure o volume e priorize sono e comida antes de somar séries.'
    };
  }
  if (score <= 3) {
    return {
      delta: 2, tone: 'good', label: 'estímulo baixo',
      message: 'Pouca conexão, pouco pump e quase nenhuma fadiga: o estímulo ficou abaixo do que você recupera. Some 2 séries na próxima semana.'
    };
  }
  if (score <= 6) {
    return {
      delta: 1, tone: 'good', label: 'no ponto',
      message: 'Estímulo na medida. Some 1 série na próxima semana e siga subindo enquanto a recuperação acompanhar.'
    };
  }
  return {
    delta: 0, tone: 'warn', label: 'estímulo alto',
    message: 'Muito pump e muita perturbação: você já está perto do teto de recuperação deste músculo. Mantenha o volume desta semana.'
  };
}

/**
 * Consolida o feedback da semana por músculo e devolve o ajuste de volume
 * a aplicar na semana seguinte.
 */
export function weeklyVolumeDecisions(data, profile, weekKey = weekStart()) {
  const days = new Set(weekDays(weekKey));
  const entries = (data.feedback || []).filter(f => days.has(f.date));
  if (!entries.length) return [];

  const byMuscle = new Map();
  for (const f of entries) {
    if (!byMuscle.has(f.muscle)) byMuscle.set(f.muscle, []);
    byMuscle.get(f.muscle).push(f);
  }

  return [...byMuscle.entries()].map(([muscle, list]) => {
    const score = mean(list.map(f => f.rsm));
    const stillSore = list.some(f => f.stillSore);
    const read = readRsm(Math.round(score), { stillSore });
    const lm = landmarks(muscle, profile);
    const current = (data.settings?.volumeBias?.[muscle] || 0);
    return {
      muscle,
      label: MUSCLES[muscle]?.label || muscle,
      rsm: Math.round(score * 10) / 10,
      ...read,
      currentBias: current,
      nextBias: Math.max(-2, Math.min(lm ? lm.mrv - lm.mev : 6, current + read.delta))
    };
  }).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

// Músculos trabalhados numa sessão, para perguntar o feedback certo.
export function musclesOf(session) {
  const set = new Set();
  for (const ex of session.exercises || []) if (ex.primary) set.add(ex.primary);
  return [...set];
}

// Um músculo ainda dolorido quando chega a hora de treinar de novo é sinal
// de que a recuperação não fechou — dado que alimenta a decisão de volume.
export function pendingFeedback(data) {
  const done = new Set((data.feedback || []).map(f => `${f.date}|${f.muscle}`));
  return (data.sessions || [])
    .slice(0, 3)
    .filter(s => musclesOf(s).some(m => !done.has(`${s.date}|${m}`)))
    .map(s => ({ session: s, muscles: musclesOf(s).filter(m => !done.has(`${s.date}|${m}`)) }));
}
