// Cardio como ferramenta de saúde e apoio à hipertrofia — não como programa à parte.
//
// Base: recomendação da OMS (150–300 min/semana de intensidade moderada) ajustada
// ao objetivo, e cuidado com o efeito interferência — cardio intenso de pernas
// próximo ao treino de perna prejudica o desempenho e a adaptação de força.

import { WEEKDAYS, clamp } from '../core/util.js';

export const CARDIO_TYPES = [
  { id: 'caminhada', label: 'Caminhada', met: 4.3, impact: 'baixo' },
  { id: 'esteira_inclinada', label: 'Esteira inclinada', met: 5.5, impact: 'medio' },
  { id: 'bike', label: 'Bicicleta', met: 5.8, impact: 'pernas' },
  { id: 'eliptico', label: 'Elíptico', met: 5.0, impact: 'medio' },
  { id: 'remo', label: 'Remo', met: 6.5, impact: 'corpo_todo' },
  { id: 'corrida', label: 'Corrida', met: 9.0, impact: 'pernas' },
  { id: 'natacao', label: 'Natação', met: 7.0, impact: 'corpo_todo' },
  { id: 'esporte', label: 'Esporte / outro', met: 6.5, impact: 'medio' }
];

export const CARDIO_LABEL = Object.fromEntries(CARDIO_TYPES.map(c => [c.id, c.label]));

// Minutos semanais e meta de passos por objetivo.
export function weeklyTarget(profile) {
  const level = profile.cardioLevel || 'pouco';
  const base = { nenhum: 0, pouco: 1, regular: 2, alto: 3 }[level] ?? 1;

  const byGoal = {
    hipertrofia: { min: 50, max: 90, steps: 8000, note: 'Zona 2 apenas — o suficiente para saúde cardiovascular sem atrapalhar a recuperação das pernas.' },
    forca:       { min: 40, max: 80, steps: 8000, note: 'Cardio leve, longe dos dias pesados de perna.' },
    emagrecimento:{ min: 150, max: 250, steps: 10000, note: 'O cardio soma gasto, mas quem manda no emagrecimento é a alimentação e o número de passos do dia inteiro.' },
    recomposicao:{ min: 100, max: 150, steps: 9000, note: 'Cardio moderado, mantendo a musculação como prioridade.' },
    saude:       { min: 150, max: 300, steps: 8000, note: 'Faixa recomendada pela OMS para adultos: 150 a 300 minutos semanais de intensidade moderada.' }
  }[profile.goal] || { min: 120, max: 180, steps: 8000, note: '' };

  // Quem faz pouco cardio hoje começa perto do piso e sobe aos poucos.
  const rampa = [0.5, 0.75, 1, 1.15][base];
  return {
    minutes: Math.round(clamp(byGoal.min * rampa, 20, byGoal.max)),
    range: [byGoal.min, byGoal.max],
    steps: Math.round(byGoal.steps * (base === 0 ? 0.8 : 1)),
    note: byGoal.note
  };
}

/**
 * Distribui o cardio na semana evitando conflito com os treinos de perna.
 * trainingDays: array de 7 posições (segunda→domingo) com o nome do treino ou null.
 */
export function schedule(profile, trainingDays = []) {
  const target = weeklyTarget(profile);
  if (!target.minutes) return { sessions: [], target };

  const legDay = i => /lower|perna|inferior|full|corpo/i.test(trainingDays[i] || '');
  const restDay = i => !trainingDays[i];

  // Um dia é ruim para cardio se ele mesmo ou o dia seguinte tem treino de perna pesado.
  const cost = i => (legDay(i) ? 3 : 0) + (legDay((i + 1) % 7) ? 2 : 0) + (restDay(i) ? -1 : 0);

  const nSessions = target.minutes >= 150 ? 4 : target.minutes >= 90 ? 3 : 2;
  const perSession = Math.round(target.minutes / nSessions / 5) * 5;

  const ranked = [...Array(7).keys()].sort((a, b) => cost(a) - cost(b));
  const chosen = [];
  for (const day of ranked) {
    if (chosen.length >= nSessions) break;
    // evita dois dias seguidos quando há folga suficiente na semana
    if (nSessions < 5 && chosen.some(d => Math.abs(d - day) === 1)) continue;
    chosen.push(day);
  }
  while (chosen.length < nSessions) {
    const day = ranked.find(d => !chosen.includes(d));
    if (day === undefined) break;
    chosen.push(day);
  }

  const sessions = chosen.sort((a, b) => a - b).map(day => ({
    day,
    weekday: WEEKDAYS[day],
    minutes: perSession,
    intensity: legDay(day) ? 'leve' : 'leve_moderada',
    after: !!trainingDays[day],
    warning: legDay(day)
      ? 'Dia de perna: faça o cardio depois do treino e mantenha bem leve.'
      : legDay((day + 1) % 7)
        ? 'Véspera de treino de perna: mantenha em zona 2, sem corrida intensa.'
        : null
  }));

  return { sessions, target, perSession };
}

export function zone2Guide(profile) {
  const maxHr = 220 - (profile.age || 30);
  return {
    maxHr,
    zone2: [Math.round(maxHr * 0.6), Math.round(maxHr * 0.7)],
    talkTest: 'Zona 2 é o ritmo em que você consegue conversar frases inteiras, mas não cantaria. Se não dá para falar, está acima da zona.'
  };
}

export function weekMinutes(activity, days) {
  let total = 0;
  for (const day of days) {
    for (const c of activity[day]?.cardio || []) total += c.minutes || 0;
  }
  return total;
}

export function weekSteps(activity, days) {
  const values = days.map(d => activity[d]?.steps).filter(Number.isFinite);
  return { total: values.reduce((a, b) => a + b, 0), days: values.length, avg: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null };
}
