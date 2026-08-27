// Gerador de programa: monta o split a partir dos dados do perfil.
//
// Decisões, nessa ordem:
//  1. Split conforme os dias disponíveis (frequência 2x/semana por músculo é o
//     padrão com melhor custo-benefício para hipertrofia).
//  2. Número de exercícios conforme o tempo real de sessão (composto ~11 min,
//     isolado ~7 min, com aquecimento).
//  3. Seleção respeitando equipamento, experiência, preferências e o volume
//     mínimo (MEV) de cada músculo do dia.

import { availableFor, BY_ID } from '../data/exercises.js';
import { landmarks } from '../data/muscles.js';
import { clamp } from '../core/util.js';

const LEVEL_RANK = { iniciante: 1, intermediario: 2, avancado: 3 };

// Teto de séries por músculo em uma única sessão. Acima disso a fadiga degrada
// a qualidade das séries seguintes e o ganho por série despenca (BuffBook 5.5.2).
export const SESSION_SET_CAP = 8;

// Estrutura de cada dia: prioridades de padrão de movimento, na ordem de execução.
const TEMPLATES = {
  2: {
    name: 'Corpo inteiro 2x',
    days: [
      { name: 'Corpo Inteiro A', focus: ['quad_composto', 'peito_horizontal', 'costas_horizontal', 'posterior_composto', 'ombro_lateral', 'core'] },
      { name: 'Corpo Inteiro B', focus: ['posterior_composto', 'costas_vertical', 'peito_inclinado', 'quad_composto', 'triceps', 'biceps'] }
    ]
  },
  3: {
    name: 'Corpo inteiro 3x',
    days: [
      { name: 'Corpo Inteiro A', focus: ['quad_composto', 'peito_horizontal', 'costas_horizontal', 'ombro_lateral', 'core'] },
      { name: 'Corpo Inteiro B', focus: ['posterior_composto', 'costas_vertical', 'ombro_press', 'gluteo', 'triceps'] },
      { name: 'Corpo Inteiro C', focus: ['quad_composto', 'peito_inclinado', 'costas_horizontal', 'posterior_iso', 'biceps', 'panturrilha'] }
    ]
  },
  4: {
    name: 'Upper / Lower',
    days: [
      { name: 'Upper A', focus: ['peito_horizontal', 'costas_vertical', 'ombro_press', 'costas_horizontal', 'peito_iso', 'ombro_lateral', 'triceps', 'biceps'] },
      { name: 'Lower A', focus: ['quad_composto', 'posterior_iso', 'quad_iso', 'panturrilha', 'core'] },
      { name: 'Upper B', focus: ['peito_inclinado', 'costas_horizontal', 'ombro_lateral', 'costas_vertical', 'ombro_posterior', 'biceps', 'triceps'] },
      { name: 'Lower B', focus: ['posterior_composto', 'gluteo', 'quad_composto', 'posterior_iso', 'panturrilha', 'core'] }
    ]
  },
  5: {
    name: 'Upper / Lower + Push',
    days: [
      { name: 'Upper A', focus: ['peito_horizontal', 'costas_vertical', 'ombro_press', 'costas_horizontal', 'triceps', 'biceps'] },
      { name: 'Lower A', focus: ['quad_composto', 'posterior_iso', 'quad_iso', 'panturrilha', 'core'] },
      { name: 'Push', focus: ['peito_inclinado', 'ombro_press', 'peito_iso', 'ombro_lateral', 'triceps'] },
      { name: 'Pull', focus: ['costas_horizontal', 'costas_vertical', 'ombro_posterior', 'costas_iso', 'biceps'] },
      { name: 'Lower B', focus: ['posterior_composto', 'gluteo', 'quad_composto', 'abdutor', 'panturrilha', 'core'] }
    ]
  },
  6: {
    name: 'Push / Pull / Legs 2x',
    days: [
      { name: 'Push A', focus: ['peito_horizontal', 'ombro_press', 'peito_iso', 'ombro_lateral', 'triceps'] },
      { name: 'Pull A', focus: ['costas_vertical', 'costas_horizontal', 'ombro_posterior', 'biceps', 'trapezio'] },
      { name: 'Legs A', focus: ['quad_composto', 'posterior_iso', 'quad_iso', 'panturrilha', 'core'] },
      { name: 'Push B', focus: ['peito_inclinado', 'ombro_press', 'peito_iso', 'ombro_lateral', 'triceps'] },
      { name: 'Pull B', focus: ['costas_horizontal', 'costas_vertical', 'ombro_posterior', 'biceps', 'costas_iso'] },
      { name: 'Legs B', focus: ['posterior_composto', 'gluteo', 'quad_composto', 'abdutor', 'panturrilha'] }
    ]
  }
};

// Padrões extras que entram quando sobra tempo na sessão.
const FILLERS = {
  upper: ['ombro_lateral', 'ombro_posterior', 'biceps', 'triceps', 'core', 'trapezio'],
  lower: ['panturrilha', 'gluteo', 'abdutor', 'core', 'quad_iso', 'posterior_iso'],
  full: ['core', 'panturrilha', 'ombro_lateral', 'biceps', 'triceps']
};

export function exerciseCount(sessionMin) {
  const useful = (sessionMin || 60) - 10;               // aquecimento e transições
  return clamp(Math.round(useful / 10), 3, 8);
}

function setsFor(exercise, profile) {
  const exp = profile.experience || 'intermediario';
  const base = exercise.type === 'composto' ? 3 : 3;
  if (exp === 'iniciante') return exercise.type === 'composto' ? 3 : 2;
  if (exp === 'avancado') return exercise.type === 'composto' ? 4 : 3;
  return base;
}

function dayKind(dayName) {
  if (/lower|legs|perna/i.test(dayName)) return 'lower';
  if (/upper|push|pull/i.test(dayName)) return 'upper';
  return 'full';
}

function pick(pool, pattern, used, profile) {
  const dislikes = new Set(profile.dislikes || []);
  const likes = new Set(profile.likes || []);
  const maxLevel = LEVEL_RANK[profile.experience || 'intermediario'];
  const guided = e => (e.equip === 'maquina' || e.equip === 'cabo' || e.equip === 'smith');

  const candidates = pool
    .filter(e => e.pattern === pattern)
    .filter(e => !used.has(e.id))
    .filter(e => !dislikes.has(e.id));

  if (!candidates.length) return null;

  // Pontuação: preferência declarada > nível compatível > equipamento adequado.
  // Isolados rendem mais em máquina/cabo; compostos, em peso livre para quem já tem base.
  const score = e => {
    let s = 0;
    if (likes.has(e.id)) s += 100;
    if (LEVEL_RANK[e.level] <= maxLevel) s += 30;
    const wantGuided = e.type === 'isolado' || profile.experience === 'iniciante';
    if (guided(e) === wantGuided) s += 8;
    return s;
  };
  return candidates.sort((a, b) => score(b) - score(a))[0];
}

export function generateProgram(profile) {
  const days = clamp(profile.daysPerWeek || 3, 2, 6);
  const template = TEMPLATES[days];
  const pool = availableFor(profile.equipment || 'academia_completa');
  const perDay = exerciseCount(profile.sessionMin);

  const used = new Set();               // evita repetir o mesmo exercício na semana
  const built = template.days.map(day => {
    const kind = dayKind(day.name);
    const focus = [...day.focus, ...FILLERS[kind]];
    const chosen = [];
    for (const pattern of focus) {
      if (chosen.length >= perDay) break;
      const ex = pick(pool, pattern, used, profile);
      if (!ex) continue;
      // Não passa do teto por músculo nesta sessão.
      const jaNaSessao = chosen
        .filter(c => c.primary === ex.primary)
        .reduce((acc, c) => acc + c.sets, 0);
      if (jaNaSessao >= SESSION_SET_CAP) continue;
      used.add(ex.id);
      chosen.push({
        id: ex.id,
        name: ex.name,
        primary: ex.primary,
        secondary: ex.secondary,
        pattern: ex.pattern,
        type: ex.type,
        sets: setsFor(ex, profile),
        reps: ex.reps,
        rest: ex.rest
      });
    }
    // Se faltou exercício (equipamento limitado), permite repetir dentro da semana.
    if (chosen.length < Math.min(3, perDay)) {
      for (const pattern of focus) {
        if (chosen.length >= perDay) break;
        const ex = pick(pool, pattern, new Set(chosen.map(c => c.id)), profile);
        if (ex) chosen.push({
          id: ex.id, name: ex.name, primary: ex.primary, secondary: ex.secondary,
          pattern: ex.pattern, type: ex.type, sets: setsFor(ex, profile), reps: ex.reps, rest: ex.rest
        });
      }
    }
    const ordenados = sequence(chosen, profile);
    return { name: day.name, exercises: ordenados, estimatedMin: estimateMinutes(ordenados) };
  });

  const gaps = balanceVolume(built, profile);

  return {
    gaps,
    split: template.name,
    daysPerWeek: days,
    createdAt: Date.now(),
    equipment: profile.equipment,
    days: built,
    weekdays: assignWeekdays(days, profile.preferredDays)
  };
}

/**
 * Ordem dentro da sessão (BuffBook 5.6): o que você mais quer que cresça vem
 * primeiro, com o sistema nervoso fresco. Depois os compostos, depois o resto.
 */
export function sequence(exercises, profile) {
  const prioridade = profile.priorityMuscle;
  return exercises
    .map((ex, i) => ({ ex, i }))
    .sort((a, b) => {
      const p = m => (prioridade && (m.ex.primary === prioridade || (m.ex.secondary || []).includes(prioridade)) ? 0 : 1);
      const prioDiff = p(a) - p(b);
      if (prioDiff) return prioDiff;
      // dentro do mesmo grupo, preserva a ordem pensada do template
      return a.i - b.i;
    })
    .map(x => x.ex);
}

/** Séries por músculo em uma sessão — para avisar quando passa do teto. */
export function sessionLoad(exercises) {
  const porMusculo = {};
  for (const ex of exercises) porMusculo[ex.primary] = (porMusculo[ex.primary] || 0) + ex.sets;
  return porMusculo;
}

export function overCap(exercises, cap = SESSION_SET_CAP) {
  return Object.entries(sessionLoad(exercises))
    .filter(([, n]) => n > cap)
    .map(([muscle, n]) => ({ muscle, sets: n }));
}

export function estimateMinutes(exercises) {
  const work = exercises.reduce((acc, e) => {
    const perSet = (e.rest || 120) / 60 + 0.8;
    return acc + e.sets * perSet;
  }, 0);
  return Math.round(work + 8);
}

// Distribui os treinos na semana deixando descanso entre sessões pesadas.
export function assignWeekdays(days, preferred) {
  if (Array.isArray(preferred) && preferred.length === days) return [...preferred].sort((a, b) => a - b);
  const layouts = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 4],
    5: [0, 1, 3, 4, 5],
    6: [0, 1, 2, 3, 4, 5]
  };
  return layouts[days] || layouts[3];
}

// Mapa segunda→domingo com o nome do treino de cada dia (usado pelo cardio).
export function weekMap(program) {
  const map = Array(7).fill(null);
  if (!program) return map;
  program.weekdays.forEach((weekday, i) => {
    map[weekday] = program.days[i]?.name || null;
  });
  return map;
}

export function dayForWeekday(program, weekdayIdx) {
  if (!program) return null;
  const pos = program.weekdays.indexOf(weekdayIdx);
  return pos === -1 ? null : { ...program.days[pos], index: pos };
}

// Próximo treino: o do dia, ou o seguinte na rotação a partir do histórico.
export function nextDay(program, sessions = []) {
  if (!program) return null;
  const last = sessions.find(s => program.days.some(d => d.name === s.day));
  if (!last) return { ...program.days[0], index: 0 };
  const lastIdx = program.days.findIndex(d => d.name === last.day);
  const idx = (lastIdx + 1) % program.days.length;
  return { ...program.days[idx], index: idx };
}

/**
 * Ajusta as séries para cobrir o volume mínimo (MEV) dos músculos que ficaram
 * abaixo, dentro do que o tempo de sessão permite. O que não couber é devolvido
 * como "lacuna" — o app mostra isso com honestidade em vez de fingir que cobriu.
 */
export function balanceVolume(days, profile) {
  const MAX_SETS = profile.experience === 'iniciante' ? 4 : 5;
  const gaps = [];

  for (let round = 0; round < 3; round++) {
    const coverage = {};
    for (const day of days) {
      for (const ex of day.exercises) {
        coverage[ex.primary] = (coverage[ex.primary] || 0) + ex.sets;
        for (const sec of ex.secondary || []) coverage[sec] = (coverage[sec] || 0) + ex.sets * 0.5;
      }
    }
    let changed = false;
    for (const [key, total] of Object.entries(coverage)) {
      const lm = landmarks(key, profile);
      if (!lm || total >= lm.mev) continue;
      // acrescenta uma série em um exercício que trabalha esse músculo diretamente
      const candidates = days.flatMap(d => d.exercises.filter(e => e.primary === key && e.sets < MAX_SETS));
      if (!candidates.length) continue;
      candidates.sort((a, b) => a.sets - b.sets)[0].sets += 1;
      changed = true;
    }
    if (!changed) break;
  }

  // Relatório final das lacunas que sobraram.
  const coverage = {};
  for (const day of days) {
    for (const ex of day.exercises) {
      coverage[ex.primary] = (coverage[ex.primary] || 0) + ex.sets;
      for (const sec of ex.secondary || []) coverage[sec] = (coverage[sec] || 0) + ex.sets * 0.5;
    }
    day.estimatedMin = estimateMinutes(day.exercises);
  }
  for (const key of ['peito', 'dorsais', 'quadriceps', 'isquiotibiais', 'ombro_lat', 'gluteos', 'biceps', 'triceps', 'panturrilhas']) {
    const lm = landmarks(key, profile);
    const total = +(coverage[key] || 0).toFixed(1);
    if (lm && total < lm.mev) gaps.push({ key, label: lm.label, total, mev: lm.mev });
  }
  return gaps;
}

// Cobertura de volume do programa vs MEV de cada músculo.
export function volumeCoverage(program, profile) {
  const totals = {};
  for (const day of program.days) {
    for (const ex of day.exercises) {
      totals[ex.primary] = (totals[ex.primary] || 0) + ex.sets;
      for (const sec of ex.secondary || []) totals[sec] = (totals[sec] || 0) + ex.sets * 0.5;
    }
  }
  return Object.entries(totals).map(([key, value]) => {
    const lm = landmarks(key, profile);
    return { key, label: lm?.label || key, value: +value.toFixed(1), mev: lm?.mev ?? 0, mav: lm?.mav ?? [0, 0] };
  }).sort((a, b) => b.value - a.value);
}
