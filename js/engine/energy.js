// Gasto energético, metas calóricas e macronutrientes.
//
// Referências usadas:
//  - TMB: Mifflin-St Jeor (padrão quando não há % de gordura) ou Katch-McArdle
//    (usada quando a bioimpedância fornece massa magra, mais precisa nesse caso).
//  - NEAT: multiplicador de atividade diária SEM contar o treino, que é somado à parte.
//  - Treino e cardio: estimativa por METs, descontando o metabolismo basal do período.
//  - Proteína: 1,6–2,4 g/kg conforme objetivo (faixa de consenso para hipertrofia
//    e para preservar massa magra em déficit).
//  - Fibra: 14 g por 1000 kcal. Água: 35 ml/kg + reposição do treino.

import { clamp, round } from '../core/util.js';

export const KCAL_PER_KG = 7700; // energia aproximada de 1 kg de tecido corporal

// Multiplicadores de NEAT (rotina fora do treino).
export const ACTIVITY_FACTORS = {
  sedentario: 1.15,
  leve: 1.28,
  moderado: 1.42,
  ativo: 1.55,
  muito_ativo: 1.7
};

export const ACTIVITY_LABEL = {
  sedentario: 'Sedentário — trabalho sentado, pouca caminhada',
  leve: 'Leve — anda um pouco no dia a dia',
  moderado: 'Moderado — em pé/andando boa parte do dia',
  ativo: 'Ativo — muita caminhada ou trabalho físico',
  muito_ativo: 'Muito ativo — trabalho físico pesado'
};

export const GOAL_LABEL = {
  hipertrofia: 'Hipertrofia',
  forca: 'Força',
  emagrecimento: 'Emagrecimento',
  recomposicao: 'Recomposição corporal',
  saude: 'Saúde e condicionamento'
};

export const MET = {
  musculacao: 5.0,
  cardio_leve: 4.3,     // caminhada rápida, bike leve — zona 2
  cardio_moderado: 6.5,
  cardio_intenso: 9.0
};

export function age(profile) {
  if (Number.isFinite(profile?.age)) return profile.age;
  if (profile?.birthYear) return new Date().getFullYear() - profile.birthYear;
  return 30;
}

export function bmr(profile, body = {}) {
  const w = body.weight ?? profile.weightKg;
  const h = profile.heightCm;
  const a = age(profile);
  if (!w || !h) return null;
  const bodyFat = body.bodyFat ?? profile.bodyFat;
  if (Number.isFinite(bodyFat) && bodyFat > 3 && bodyFat < 60) {
    const lean = w * (1 - bodyFat / 100);
    return { value: 370 + 21.6 * lean, method: 'Katch-McArdle', lean };
  }
  const base = 10 * w + 6.25 * h - 5 * a;
  return { value: profile.sex === 'F' ? base - 161 : base + 5, method: 'Mifflin-St Jeor' };
}

// Gasto líquido de uma atividade (já descontando o basal do mesmo período).
export function activityKcal(met, minutes, weightKg) {
  if (!minutes || !weightKg) return 0;
  return ((met - 1) * 3.5 * weightKg / 200) * minutes;
}

export function trainingKcalWeek(profile) {
  const w = profile.weightKg || 70;
  const perSession = activityKcal(MET.musculacao, profile.sessionMin || 60, w);
  return perSession * (profile.daysPerWeek || 3);
}

export function tdee(profile, body = {}, cardioMinWeek = 0) {
  const b = bmr(profile, body);
  if (!b) return null;
  const factor = ACTIVITY_FACTORS[profile.activityLevel] ?? 1.28;
  const neat = b.value * factor;
  const train = trainingKcalWeek(profile) / 7;
  const cardio = activityKcal(MET.cardio_leve, cardioMinWeek / 7, body.weight ?? profile.weightKg);
  return {
    bmr: b.value,
    method: b.method,
    neat,
    training: train,
    cardio,
    total: neat + train + cardio
  };
}

/* ---------- Metas por objetivo ---------- */

// Ritmo-alvo de mudança de peso, em % do peso corporal por semana.
export function targetRate(profile) {
  const exp = profile.experience || 'intermediario';
  switch (profile.goal) {
    case 'hipertrofia':
      return exp === 'iniciante' ? 0.4 : exp === 'intermediario' ? 0.25 : 0.12;
    case 'forca':
      return exp === 'avancado' ? 0.1 : 0.2;
    case 'emagrecimento':
      return -0.7;
    case 'recomposicao':
      return 0;
    default:
      return 0;
  }
}

export function targetRateKg(profile, weight = profile.weightKg) {
  return (targetRate(profile) / 100) * (weight || 70);
}

export function calorieTarget(profile, body = {}, cardioMinWeek = 0, offset = 0) {
  const t = tdee(profile, body, cardioMinWeek);
  if (!t) return null;
  const weight = body.weight ?? profile.weightKg;
  const rateKg = targetRateKg(profile, weight);
  let target = t.total + (rateKg * KCAL_PER_KG) / 7 + offset;

  // Piso de segurança: nunca abaixo da TMB nem de um mínimo absoluto.
  const floor = Math.max(t.bmr * 1.05, profile.sex === 'F' ? 1200 : 1500);
  const capped = target < floor;
  target = Math.max(target, floor);

  return {
    ...t,
    target: round(target, 10),
    rateKg,
    offset,
    capped,
    maintenance: round(t.total, 10)
  };
}

export function proteinPerKg(profile) {
  switch (profile.goal) {
    case 'hipertrofia': return 2.0;
    case 'forca': return 1.9;
    case 'emagrecimento': return 2.3;
    case 'recomposicao': return 2.2;
    default: return 1.6;
  }
}

export function macros(profile, kcal, body = {}) {
  const weight = body.weight ?? profile.weightKg ?? 70;
  const bodyFat = body.bodyFat ?? profile.bodyFat;
  const height = profile.heightCm || 170;
  const bmi = weight / ((height / 100) ** 2);

  // Em pessoas com muita gordura corporal, a proteína é calculada sobre um peso
  // de referência (IMC 25) para não superestimar a necessidade.
  const refWeight = Number.isFinite(bodyFat) && bodyFat > 30
    ? weight * (1 - bodyFat / 100) * 1.25
    : bmi > 30 ? 25 * ((height / 100) ** 2) : weight;

  let protein = round(proteinPerKg(profile) * refWeight, 5);
  let fat = round(Math.max(0.7 * refWeight, (kcal * 0.2) / 9), 5);

  // Restrições de preferência alimentar.
  if (profile.dietPreference === 'low_carb') fat = round(Math.max(fat, (kcal * 0.35) / 9), 5);
  if (profile.dietPreference === 'vegano') protein = round(protein * 1.05, 5);

  let carbs = round((kcal - protein * 4 - fat * 9) / 4, 5);
  if (carbs < 50) {
    carbs = 50;
    fat = round((kcal - protein * 4 - carbs * 4) / 9, 5);
  }

  return {
    kcal: Math.round(kcal),
    protein,
    fat,
    carbs,
    fiber: Math.round((kcal / 1000) * 14),
    waterMl: Math.round(weight * 35 + (profile.sessionMin || 0) * 8),
    proteinPerKg: +(protein / weight).toFixed(2)
  };
}

// Distribuição sugerida das refeições no dia.
export function mealPlan(macroTargets, mealsPerDay = 4, hasTraining = true) {
  const n = clamp(mealsPerDay, 2, 6);
  const names = {
    2: ['Refeição 1', 'Refeição 2'],
    3: ['Café da manhã', 'Almoço', 'Jantar'],
    4: ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'],
    5: ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar'],
    6: ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Pré-treino', 'Pós-treino', 'Jantar']
  }[n];

  // Proteína distribuída de forma uniforme (0,3–0,4 g/kg por refeição estimula
  // melhor a síntese proteica do que concentrar tudo em uma refeição).
  return names.map((name, i) => {
    const isPeri = hasTraining && n >= 5 && (name.includes('Pré') || name.includes('Pós'));
    const share = isPeri ? 1.15 / n : 1 / n;
    return {
      name,
      kcal: Math.round(macroTargets.kcal * share),
      protein: Math.round(macroTargets.protein / n),
      carbs: Math.round(macroTargets.carbs * (isPeri ? share * 1.2 : share)),
      fat: Math.round(macroTargets.fat * (isPeri ? share * 0.6 : share))
    };
  });
}

export function bmiInfo(weight, heightCm) {
  if (!weight || !heightCm) return null;
  const bmi = weight / ((heightCm / 100) ** 2);
  let band = 'peso adequado';
  if (bmi < 18.5) band = 'abaixo do peso';
  else if (bmi >= 25 && bmi < 30) band = 'sobrepeso';
  else if (bmi >= 30) band = 'obesidade';
  return { bmi: +bmi.toFixed(1), band };
}
