// Grupos musculares e referências de volume semanal.
// O desenho do corpo vive em bodymap.js.
//
// MEV  = volume mínimo eficaz (séries diretas por semana)
// MAV  = faixa adaptativa — onde a maior parte do trabalho deve ficar
// MRV  = volume máximo recuperável (teto antes de acumular fadiga demais)
// Valores baseados nas faixas de referência de Israetel/Renaissance Periodization,
// arredondados e tratados como ponto de partida individualizável.

export const MUSCLES = {
  peito:         { label: 'Peito',          short: 'Peito',   mev: 8,  mav: [12, 18], mrv: 22 },
  dorsais:       { label: 'Costas',         short: 'Costas',  mev: 10, mav: [14, 20], mrv: 25 },
  trapezio:      { label: 'Trapézio',       short: 'Trapézio',mev: 4,  mav: [8, 16],  mrv: 26 },
  ombro_ant:     { label: 'Ombro anterior', short: 'O. ant.', mev: 0,  mav: [0, 10],  mrv: 16 },
  ombro_lat:     { label: 'Ombro lateral',  short: 'O. lat.', mev: 8,  mav: [14, 20], mrv: 26 },
  ombro_post:    { label: 'Ombro posterior',short: 'O. post.',mev: 6,  mav: [10, 18], mrv: 25 },
  biceps:        { label: 'Bíceps',         short: 'Bíceps',  mev: 8,  mav: [12, 18], mrv: 26 },
  triceps:       { label: 'Tríceps',        short: 'Tríceps', mev: 6,  mav: [10, 16], mrv: 22 },
  antebraco:     { label: 'Antebraço',      short: 'Anteb.',  mev: 2,  mav: [4, 10],  mrv: 16 },
  quadriceps:    { label: 'Quadríceps',     short: 'Quadr.',  mev: 8,  mav: [12, 18], mrv: 20 },
  isquiotibiais: { label: 'Posterior de coxa', short: 'Post.',mev: 6,  mav: [10, 16], mrv: 20 },
  gluteos:       { label: 'Glúteos',        short: 'Glúteo',  mev: 4,  mav: [8, 16],  mrv: 20 },
  abdutores:     { label: 'Glúteo médio',   short: 'G. médio',mev: 0,  mav: [4, 10],  mrv: 16 },
  adutores:      { label: 'Adutores',       short: 'Adut.',   mev: 0,  mav: [4, 10],  mrv: 16 },
  panturrilhas:  { label: 'Panturrilhas',   short: 'Pantur.', mev: 8,  mav: [12, 16], mrv: 20 },
  core:          { label: 'Core',           short: 'Core',    mev: 0,  mav: [6, 14],  mrv: 25 },
  lombar:        { label: 'Lombar',         short: 'Lombar',  mev: 2,  mav: [4, 10],  mrv: 14 }
};

// Ordem de exibição nos relatórios de volume.
export const MUSCLE_ORDER = [
  'peito', 'dorsais', 'ombro_lat', 'ombro_post', 'triceps', 'biceps',
  'quadriceps', 'isquiotibiais', 'gluteos', 'panturrilhas', 'core',
  'trapezio', 'abdutores', 'adutores', 'lombar', 'antebraco', 'ombro_ant'
];

// Músculos que ganham foco extra conforme o objetivo declarado.
export const GOAL_EMPHASIS = {
  hipertrofia: {},
  forca: { quadriceps: 1.1, isquiotibiais: 1.1, peito: 1.1, dorsais: 1.1 },
  emagrecimento: {},
  recomposicao: {},
  saude: { core: 1.2, gluteos: 1.2, dorsais: 1.1, lombar: 1.2 }
};

// Multiplicador de volume por experiência: iniciante trabalha perto do MEV.
export const EXPERIENCE_VOLUME = {
  iniciante: 0.7,
  intermediario: 1.0,
  avancado: 1.15
};

export function landmarks(muscleKey, { experience = 'intermediario', goal = 'hipertrofia' } = {}) {
  const m = MUSCLES[muscleKey];
  if (!m) return null;
  const scale = (EXPERIENCE_VOLUME[experience] ?? 1) * (GOAL_EMPHASIS[goal]?.[muscleKey] ?? 1);
  const r = v => Math.round(v * scale);
  return {
    key: muscleKey,
    label: m.label,
    short: m.short,
    mev: r(m.mev),
    mav: [r(m.mav[0]), r(m.mav[1])],
    mrv: r(m.mrv)
  };
}

export function muscleLabel(key) {
  return MUSCLES[key]?.label || key;
}

// Músculos que fazem sentido eleger como prioridade de um mesociclo.
export const PRIORITY_MUSCLES = [
  'peito', 'dorsais', 'ombro_lat', 'ombro_post', 'biceps', 'triceps',
  'quadriceps', 'isquiotibiais', 'gluteos', 'panturrilhas', 'core'
].map(value => ({ value, label: MUSCLES[value].label }));

// Séries indiretas contam metade — padrão usado no cálculo de volume semanal.
export const INDIRECT_FACTOR = 0.5;
