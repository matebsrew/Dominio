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

/**
 * Guia estruturado por modalidade: frequência cardíaca não serve para tudo —
 * na água ela aparece mais baixa (reflexo de mergulho) e em bike/remo cadência
 * e resistência dizem mais que o número do monitor. Cada tipo ganha aquecimento,
 * parte principal e volta à calma, em vez de só "minutos" soltos.
 */
export function sessionSteps(typeId, minutes) {
  const total = Math.max(10, minutes || 25);
  const warm = clamp(Math.round(total * 0.15), 4, 8);
  const cool = clamp(Math.round(total * 0.12), 3, 6);
  const main = Math.max(5, total - warm - cool);
  const reps = (short, mid, long) => total <= 20 ? short : total <= 35 ? mid : long;

  const plans = {
    caminhada: {
      metric: 'Frequência cardíaca (teste de fala)',
      tip: 'É a modalidade mais fácil de dosar: se dá para conversar frases inteiras sem ofegar, está na zona certa.',
      steps: [
        { label: 'Aquecimento', min: warm, detail: 'ritmo bem leve, quase passeio' },
        { label: 'Principal', min: main, detail: 'ritmo que permite conversar frases inteiras — se começar a ofegar, reduza o passo' },
        { label: 'Volta à calma', min: cool, detail: 'reduza o ritmo nos últimos minutos' }
      ]
    },
    esteira_inclinada: {
      metric: 'Inclinação + frequência cardíaca',
      tip: 'A inclinação empurra o gasto calórico sem o impacto da corrida — é ela que faz a sessão valer, não a velocidade.',
      steps: [
        { label: 'Aquecimento', min: warm, detail: 'sem inclinação, ritmo leve' },
        { label: 'Principal', min: main, detail: 'inclinação 8–15%, ritmo em que ainda dá para falar frases curtas' },
        { label: 'Volta à calma', min: cool, detail: 'inclinação zero, ritmo leve' }
      ]
    },
    bike: {
      metric: 'Cadência (RPM) + resistência',
      tip: 'Cadência conta mais que velocidade: ajuste a resistência até o esforço ficar moderado na cadência-alvo, em vez de pedalar rápido com pouca resistência.',
      steps: [
        { label: 'Aquecimento', min: warm, detail: 'cadência 70–80 rpm, resistência leve' },
        { label: 'Principal', min: main, detail: 'cadência 80–90 rpm, resistência moderada — dá para falar frases, não para cantar' },
        { label: 'Volta à calma', min: cool, detail: 'cadência baixa, resistência leve' }
      ]
    },
    eliptico: {
      metric: 'Frequência cardíaca / esforço percebido',
      tip: 'Empurre com braços e pernas junto — só as pernas deixa o gasto bem abaixo do que o aparelho mostra.',
      steps: [
        { label: 'Aquecimento', min: warm, detail: 'ritmo leve, braços soltos' },
        { label: 'Principal', min: main, detail: 'ritmo moderado, braços empurrando ativamente' },
        { label: 'Volta à calma', min: cool, detail: 'ritmo leve' }
      ]
    },
    remo: {
      metric: 'Remadas por minuto (SPM)',
      tip: 'A potência vem das pernas primeiro, tronco depois, braços por último — nessa ordem no puxão e ao contrário na volta.',
      steps: [
        { label: 'Aquecimento', min: warm, detail: '18–20 spm, puxada leve' },
        { label: 'Principal', min: main, detail: reps(
          '3 blocos de 4 min a 22–26 spm, com 1 min bem leve entre eles',
          '4 blocos de 5 min a 22–26 spm, com 1 min bem leve entre eles',
          '5 blocos de 6 min a 22–26 spm, com 1 min bem leve entre eles') },
        { label: 'Volta à calma', min: cool, detail: '16–18 spm, puxada bem leve' }
      ]
    },
    corrida: {
      metric: 'Frequência cardíaca (teste de fala)',
      tip: 'Corrida intensa é a que mais compete com o treino de perna — mantenha em zona 2 na maioria das sessões.',
      steps: [
        { label: 'Aquecimento', min: warm, detail: 'trote bem leve ou caminhada rápida' },
        { label: 'Principal', min: main, detail: 'ritmo em que dá para falar frases curtas, sem ofegar' },
        { label: 'Volta à calma', min: cool, detail: 'caminhada' }
      ]
    },
    natacao: {
      metric: 'Esforço percebido (RPE) — não a frequência cardíaca',
      tip: 'Na água a frequência cardíaca aparece de 10 a 13 bpm mais baixa que em terra (reflexo de mergulho): o monitor engana. Guie-se pela respiração e pelo esforço percebido, não pelo número.',
      steps: [
        { label: 'Aquecimento', min: warm, detail: 'nado livre bem leve, sem pressa' },
        { label: 'Principal', min: main, detail: reps(
          '6 a 8 tiros de 50 m em ritmo moderado, 15–20 s de descanso entre eles',
          '10 a 12 tiros de 50 m em ritmo moderado, 15–20 s de descanso entre eles',
          '14 a 18 tiros de 50 m em ritmo moderado, 15–20 s de descanso entre eles') },
        { label: 'Volta à calma', min: cool, detail: 'nado bem leve, respiração tranquila' }
      ]
    },
    esporte: {
      metric: 'Esforço percebido (RPE)',
      tip: 'Esporte coletivo já intervala esforço sozinho — o que importa é começar e terminar abaixo do pico de intensidade do jogo.',
      steps: [
        { label: 'Aquecimento', min: warm, detail: 'deslocamento leve + mobilidade das articulações que mais usa no esporte' },
        { label: 'Principal', min: main, detail: 'o jogo em si — intensidade varia naturalmente' },
        { label: 'Volta à calma', min: cool, detail: 'caminhada leve + alongamento' }
      ]
    }
  };

  return plans[typeId] || plans.esporte;
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
