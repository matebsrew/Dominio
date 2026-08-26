// Carga inicial e aquecimento.
//
// Ninguém começa sabendo quanto colocar na barra. Estas proporções dão um
// ponto de partida para ~8 repetições confortáveis (referência: homem
// intermediário), ajustado por sexo, experiência e idade. É um chute educado
// para a primeira série — a partir daí quem manda é o registro real.

import { round, clamp } from '../core/util.js';
import { BY_ID } from '../data/exercises.js';

// Fração do peso corporal. perSide = valor por halter / por lado.
const RATIO = {
  // peito
  'supino-reto-barra': [0.72], 'supino-reto-halteres': [0.30, true], 'supino-maquina': [0.55],
  'supino-inclinado-halteres': [0.26, true], 'supino-inclinado-barra': [0.60],
  'crucifixo-cabo': [0.12, true], 'peck-deck': [0.42], 'crucifixo-halteres': [0.13, true],
  // costas
  'puxada-pronada': [0.62], 'puxada-neutra': [0.65], 'remada-curvada-barra': [0.58],
  'remada-peito-apoiado': [0.50], 'remada-baixa': [0.55], 'remada-unilateral-halter': [0.30, true],
  'remada-maquina': [0.50], 'pulldown-braco-reto': [0.22],
  // ombros
  'desenvolvimento-halteres': [0.20, true], 'desenvolvimento-maquina': [0.34], 'desenvolvimento-militar': [0.42],
  'elevacao-lateral': [0.075, true], 'elevacao-lateral-cabo': [0.07, true], 'elevacao-lateral-maquina': [0.18],
  'crucifixo-inverso': [0.24], 'face-pull': [0.24], 'crucifixo-inverso-halteres': [0.07, true],
  'encolhimento': [0.35, true],
  // braços
  'triceps-pulley': [0.33], 'triceps-corda': [0.28], 'triceps-testa': [0.24], 'triceps-frances': [0.17, true],
  'rosca-direta': [0.28], 'rosca-alternada': [0.13, true], 'rosca-martelo': [0.13, true],
  'rosca-inclinada': [0.11, true], 'rosca-cabo': [0.22],
  // pernas
  'agachamento-livre': [0.85], 'agachamento-smith': [0.75], 'hack-squat': [0.95], 'leg-press': [1.55],
  'agachamento-goblet': [0.32], 'bulgaro': [0.18, true], 'afundo': [0.18, true], 'cadeira-extensora': [0.48],
  'stiff': [0.78], 'stiff-halteres': [0.27, true], 'levantamento-terra': [1.05],
  'mesa-flexora': [0.38], 'cadeira-flexora': [0.42], 'flexora-nordica': [0],
  'hip-thrust': [0.95], 'cable-pull-through': [0.38],
  'abducao-maquina': [0.38], 'aducao-maquina': [0.38],
  'panturrilha-em-pe': [0.75], 'panturrilha-sentado': [0.45],
  'abdominal-polia': [0.28]
};

// Padrões usados quando o exercício não está na tabela acima.
const PATTERN_FALLBACK = {
  peito_horizontal: 0.5, peito_inclinado: 0.45, peito_iso: 0.3,
  costas_vertical: 0.55, costas_horizontal: 0.5, costas_iso: 0.22,
  ombro_press: 0.32, ombro_lateral: 0.1, ombro_posterior: 0.2, trapezio: 0.3,
  triceps: 0.25, biceps: 0.22,
  quad_composto: 0.7, quad_iso: 0.45, posterior_composto: 0.7, posterior_iso: 0.4,
  gluteo: 0.7, panturrilha: 0.6, abdutor: 0.35, adutor: 0.35, core: 0.25, lombar: 0.2
};

export function experienceFactor(profile) {
  return { iniciante: 0.72, intermediario: 1, avancado: 1.25 }[profile.experience] || 1;
}

/**
 * Estimativa da primeira carga. Retorna null para exercícios de peso corporal.
 */
export function estimateLoad(exerciseId, profile) {
  const ex = BY_ID[exerciseId];
  if (!ex) return null;
  if (ex.equip === 'livre') {
    return { bodyweight: true, text: 'Peso do corpo. Comece com a variação que permite a faixa de repetições com técnica.' };
  }

  const entry = RATIO[exerciseId];
  const ratio = entry ? entry[0] : PATTERN_FALLBACK[ex.pattern];
  if (!ratio) return null;
  const perSide = entry ? !!entry[1] : ex.equip === 'halter';

  const weight = profile.weightKg || 70;
  const upper = !/quad|posterior|gluteo|panturrilha|abdutor|adutor/.test(ex.pattern);

  // Diferença média de força entre sexos é maior no tronco que nas pernas.
  const sexFactor = profile.sex === 'F' ? (upper ? 0.58 : 0.72) : 1;
  const ageFactor = (profile.age || 30) >= 55 ? 0.82 : (profile.age || 30) >= 45 ? 0.92 : 1;

  const raw = weight * ratio * sexFactor * experienceFactor(profile) * ageFactor;
  const step = perSide ? 1 : 2.5;
  const value = Math.max(step, round(raw, step));

  return {
    bodyweight: false,
    kg: value,
    perSide,
    text: perSide
      ? `Comece testando ${value} kg em cada halter/lado.`
      : `Comece testando ${value} kg.`,
    caveat: 'É uma estimativa a partir do seu peso corporal. Faça a primeira série; se sobrarem mais de 4 repetições, suba na próxima.'
  };
}

/**
 * Séries de aquecimento antes da primeira série valendo.
 * Compostos pesados pedem rampa; isolados, uma série leve resolve.
 */
export function warmupSets(exerciseId, workingKg, profile) {
  const ex = BY_ID[exerciseId];
  if (!ex || !Number.isFinite(workingKg) || workingKg <= 0) return [];
  const heavy = ex.type === 'composto' && ex.reps[0] <= 8;

  const scheme = heavy
    ? [[0.4, 8], [0.6, 5], [0.8, 3]]
    : ex.type === 'composto'
      ? [[0.5, 8], [0.75, 4]]
      : [[0.5, 10]];

  return scheme.map(([pct, reps]) => ({
    kg: Math.max(ex.equip === 'halter' ? 1 : 2.5, round(workingKg * pct, ex.equip === 'halter' ? 1 : 2.5)),
    reps,
    pct: Math.round(pct * 100)
  }));
}

// Aquecimento geral da sessão, por tipo de treino.
export const GENERAL_WARMUP = {
  upper: {
    title: 'Aquecimento — parte superior',
    minutes: 6,
    items: [
      '2 min de esteira, bike ou polichinelo até esquentar de verdade',
      'Rotação de ombros e circundução dos braços — 10 para cada lado',
      'Band pull-apart ou abrir os braços contra um elástico — 2 × 15',
      'Flexão inclinada leve — 1 × 10, só para acordar o padrão'
    ]
  },
  lower: {
    title: 'Aquecimento — parte inferior',
    minutes: 7,
    items: [
      '3 min de bike ou caminhada em ritmo confortável',
      'Agachamento com peso corporal — 2 × 10 na amplitude que você usa',
      'Elevação pélvica no solo — 1 × 15, ativando o glúteo',
      'Mobilidade de tornozelo (joelho à parede) — 10 para cada lado'
    ]
  },
  full: {
    title: 'Aquecimento — corpo inteiro',
    minutes: 7,
    items: [
      '3 min de cardio leve',
      'Agachamento com peso corporal — 1 × 12',
      'Rotação de ombros e band pull-apart — 1 × 15',
      'Prancha — 1 × 20 s para ativar o core'
    ]
  }
};

export function warmupFor(dayName) {
  if (/lower|legs|perna|inferior/i.test(dayName)) return GENERAL_WARMUP.lower;
  if (/upper|push|pull/i.test(dayName)) return GENERAL_WARMUP.upper;
  return GENERAL_WARMUP.full;
}
