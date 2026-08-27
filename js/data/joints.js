// Estresse articular por exercício — usado quando alguém marca dor no check-in.
//
// Dor articular não é motivo para parar de treinar: é motivo para trocar o
// movimento por outro que treine o mesmo músculo sem passar pela articulação
// que dói. Dor que persiste por mais de duas semanas é caso de avaliação.

import { BY_ID, EXERCISES, availableFor } from './exercises.js';

export const REGIONS = {
  ombro: 'Ombro',
  cotovelo: 'Cotovelo',
  punho: 'Punho',
  lombar: 'Lombar',
  quadril: 'Quadril',
  joelho: 'Joelho',
  tornozelo: 'Tornozelo'
};

// Estresse típico de cada padrão de movimento.
const BY_PATTERN = {
  peito_horizontal: ['ombro', 'cotovelo', 'punho'],
  peito_inclinado: ['ombro', 'cotovelo', 'punho'],
  peito_iso: ['ombro'],
  costas_vertical: ['ombro', 'cotovelo'],
  costas_horizontal: ['ombro', 'cotovelo'],
  costas_iso: ['ombro'],
  ombro_press: ['ombro', 'cotovelo', 'punho'],
  ombro_lateral: ['ombro'],
  ombro_posterior: ['ombro'],
  trapezio: ['ombro'],
  triceps: ['cotovelo'],
  biceps: ['cotovelo', 'punho'],
  quad_composto: ['joelho', 'quadril', 'tornozelo'],
  quad_iso: ['joelho'],
  posterior_composto: ['quadril', 'lombar'],
  posterior_iso: ['joelho'],
  gluteo: ['quadril'],
  panturrilha: ['tornozelo'],
  abdutor: ['quadril'],
  adutor: ['quadril'],
  core: [],
  lombar: ['lombar']
};

// Exercícios que carregam a coluna de forma relevante (em pé ou com barra livre).
const SPINE_LOADED = new Set([
  'agachamento-livre', 'agachamento-smith', 'desenvolvimento-militar', 'remada-curvada-barra',
  'stiff', 'stiff-halteres', 'levantamento-terra', 'afundo', 'bulgaro', 'agachamento-goblet',
  'encolhimento', 'panturrilha-em-pe', 'extensao-lombar', 'hip-thrust'
]);

// Exercícios apoiados/guiados que poupam a coluna.
const SPINE_SPARED = new Set([
  'supino-maquina', 'remada-peito-apoiado', 'remada-maquina', 'hack-squat', 'leg-press',
  'cadeira-extensora', 'mesa-flexora', 'cadeira-flexora', 'peck-deck', 'crucifixo-inverso',
  'desenvolvimento-maquina', 'elevacao-lateral-maquina', 'panturrilha-sentado',
  'abducao-maquina', 'aducao-maquina', 'elevacao-pelvica', 'cable-pull-through'
]);

// Ajustes pontuais conhecidos.
const OVERRIDES = {
  'mergulho-paralelas': ['ombro', 'cotovelo', 'punho'],
  'mergulho-banco': ['ombro', 'cotovelo'],
  'flexao': ['ombro', 'punho'],
  'flexao-inclinada': ['ombro', 'punho'],
  'barra-fixa': ['ombro', 'cotovelo'],
  'triceps-testa': ['cotovelo'],
  'triceps-frances': ['ombro', 'cotovelo'],
  'rosca-direta': ['cotovelo', 'punho'],
  'rosca-martelo': ['cotovelo'],
  'flexora-nordica': ['joelho'],
  'prancha': [],
  'bird-dog': [],
  'abdominal-solo': [],
  'pallof-press': [],
  'elevacao-pernas': ['ombro'],
  'panturrilha-livre': ['tornozelo'],
  'remada-invertida': ['ombro', 'cotovelo']
};

export function stressOf(exerciseId) {
  const ex = BY_ID[exerciseId];
  if (!ex) return [];
  const base = OVERRIDES[exerciseId] || BY_PATTERN[ex.pattern] || [];
  const set = new Set(base);
  if (SPINE_LOADED.has(exerciseId)) set.add('lombar');
  if (SPINE_SPARED.has(exerciseId)) set.delete('lombar');
  return [...set];
}

export function conflictsWith(exerciseId, painRegions = {}) {
  const active = Object.keys(painRegions).filter(r => painRegions[r]);
  if (!active.length) return [];
  const stress = stressOf(exerciseId);
  return active.filter(r => stress.includes(r));
}

/**
 * Troca por causa de dor. Primeiro procura movimentos que não passam pela
 * articulação dolorida; quando não existe nenhum (todo exercício de peito
 * usa o ombro, por exemplo), devolve os de menor estresse articular,
 * marcados como alívio parcial.
 */
export function saferAlternatives(exerciseId, painRegions, equipmentTier) {
  const base = BY_ID[exerciseId];
  if (!base) return [];
  const active = Object.keys(painRegions || {}).filter(r => painRegions[r]);
  const pool = availableFor(equipmentTier)
    .filter(e => e.id !== base.id)
    .filter(e => e.primary === base.primary);

  const clean = pool
    .filter(e => !active.some(r => stressOf(e.id).includes(r)))
    .sort((a, b) => stressOf(a.id).length - stressOf(b.id).length)
    .slice(0, 4)
    .map(e => ({ ...e, relief: 'total' }));

  if (clean.length) return clean;

  const guided = e => (e.equip === 'maquina' || e.equip === 'cabo' ? 0 : 1);
  return pool
    .sort((a, b) => (stressOf(a.id).length - stressOf(b.id).length) || (guided(a) - guided(b)))
    .slice(0, 4)
    .map(e => ({ ...e, relief: 'parcial' }));
}

// Orientação geral por região dolorida.
export const PAIN_ADVICE = {
  ombro: 'Evite pressões acima da cabeça e amplitudes que passam da linha do corpo. Prefira supino com halteres em amplitude parcial, máquinas e trabalho de ombro posterior/face pull, que costuma aliviar.',
  cotovelo: 'Reduza pegadas fixas e supinadas forçadas. Prefira pegada neutra, corda e máquinas. Diminua o volume direto de bíceps e tríceps por 1–2 semanas.',
  punho: 'Use pegada neutra, halteres em vez de barra reta e, se precisar, munhequeira. Evite rosca com barra reta e apoio de punho em extensão máxima.',
  lombar: 'Tire a carga da coluna: máquinas apoiadas, leg press, hack squat, mesa flexora e elevação pélvica no lugar de agachamento livre, stiff e remada curvada.',
  quadril: 'Reduza amplitude de flexão profunda e movimentos unilaterais instáveis. Prefira leg press com amplitude controlada, cadeira extensora e flexora.',
  joelho: 'Evite amplitude profunda com carga e movimentos com muito cisalhamento. Prefira leg press parcial, cadeira extensora com amplitude confortável, flexora e trabalho de quadril.',
  tornozelo: 'Reduza amplitude no fundo da panturrilha e evite saltos. Prefira panturrilha sentado e leg press calf com amplitude parcial.'
};
