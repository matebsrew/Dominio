// Check-in de prontidão: 4 perguntas rápidas antes do treino.
//
// Sono e energia pesam mais porque são os que mais se relacionam com desempenho
// na sessão; dor muscular entra invertida (5 = muita dor = pior prontidão).

import { mean, clamp } from '../core/util.js';

export const QUESTIONS = [
  { key: 'sleep', label: 'Sono', hint: 'Como foi a noite?', weight: 0.3, invert: false,
    scale: ['Péssimo', 'Ruim', 'Ok', 'Bom', 'Ótimo'] },
  { key: 'energy', label: 'Energia', hint: 'Disposição agora', weight: 0.3, invert: false,
    scale: ['No chão', 'Baixa', 'Normal', 'Boa', 'Muita'] },
  { key: 'soreness', label: 'Dor muscular', hint: 'Do treino anterior', weight: 0.25, invert: true,
    scale: ['Nenhuma', 'Leve', 'Moderada', 'Forte', 'Muito forte'] },
  { key: 'motivation', label: 'Motivação', hint: 'Vontade de treinar', weight: 0.15, invert: false,
    scale: ['Nenhuma', 'Pouca', 'Normal', 'Boa', 'Muita'] }
];

export function score(answers = {}) {
  let total = 0, weights = 0;
  for (const q of QUESTIONS) {
    const raw = answers[q.key];
    if (!Number.isFinite(raw)) continue;
    const value = q.invert ? 6 - raw : raw;
    total += ((value - 1) / 4) * q.weight;
    weights += q.weight;
  }
  if (!weights) return null;
  return Math.round((total / weights) * 100);
}

export function band(value) {
  if (!Number.isFinite(value)) return { key: 'desconhecida', label: 'Sem check-in', tone: 'muted' };
  if (value >= 80) return { key: 'alta', label: 'Prontidão alta', tone: 'good' };
  if (value >= 60) return { key: 'boa', label: 'Prontidão boa', tone: 'good' };
  if (value >= 45) return { key: 'media', label: 'Prontidão média', tone: 'warn' };
  return { key: 'baixa', label: 'Prontidão baixa', tone: 'bad' };
}

/**
 * Como a sessão de hoje deve mudar em função do check-in.
 * volumeFactor multiplica o número de séries planejadas.
 */
export function sessionPlan(answers = {}, context = {}) {
  const value = score(answers);
  const b = band(value);
  const { sleepHours = null, pain = false } = context;

  if (pain) {
    return {
      score: value, band: b, volumeFactor: 0.6, rirShift: 2, allowProgression: false,
      title: 'Dor articular relatada',
      message: 'Troque os exercícios que doem por variações sem dor, reduza a carga e não busque progressão hoje. Dor que persiste mais de duas semanas merece avaliação profissional.'
    };
  }

  if (!Number.isFinite(value)) {
    return { score: null, band: b, volumeFactor: 1, rirShift: 0, allowProgression: true,
      title: 'Sem check-in hoje', message: 'Faça o check-in para eu ajustar a sessão à sua recuperação.' };
  }

  if (value >= 80) {
    return { score: value, band: b, volumeFactor: 1, rirShift: 0, allowProgression: true,
      title: 'Dia de empurrar',
      message: 'Recuperação boa. Siga as progressões de carga e, se sobrar gás, a última série pode ir até 0–1 na reserva.' };
  }
  if (value >= 60) {
    return { score: value, band: b, volumeFactor: 1, rirShift: 0, allowProgression: true,
      title: 'Sessão normal',
      message: 'Siga o plano como está: progrida onde as repetições fecharam e mantenha o resto.' };
  }
  if (value >= 45) {
    return { score: value, band: b, volumeFactor: 0.85, rirShift: 1, allowProgression: false,
      title: 'Segure a carga hoje',
      message: 'Mantenha as cargas da última sessão, pare com 3 repetições na reserva e corte a última série dos isolados. Um treino consistente vale mais que um recorde forçado.' };
  }
  const lowSleep = Number.isFinite(sleepHours) && sleepHours < 6;
  return { score: value, band: b, volumeFactor: 0.6, rirShift: 2, allowProgression: false,
    title: 'Sessão técnica',
    message: `Recuperação baixa${lowSleep ? ` e menos de 6h de sono` : ''}. Faça cerca de 60% das séries, com carga leve e foco em execução. Se o padrão se repetir por vários dias, o problema é sono/alimentação, não o treino.` };
}

export function averageScore(checkins, n = 7) {
  return mean(checkins.slice(0, n).map(c => c.score));
}

export function trendMessage(checkins) {
  const recent = checkins.slice(0, 3).map(c => c.score).filter(Number.isFinite);
  const older = checkins.slice(3, 7).map(c => c.score).filter(Number.isFinite);
  if (recent.length < 2 || older.length < 2) return null;
  const diff = mean(recent) - mean(older);
  if (diff <= -12) return 'Sua prontidão vem caindo. Olhe sono, calorias e volume de treino antes de aumentar qualquer coisa.';
  if (diff >= 12) return 'Prontidão em alta — boa janela para puxar mais volume ou carga.';
  return null;
}
