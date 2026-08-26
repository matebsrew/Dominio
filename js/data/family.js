// Perfis da casa, com as medidas informadas.
// Nome e idade vêm editáveis; a associação entre nome e medidas é um palpite
// e pode ser trocada em um toque antes de criar.

export const FAMILY_TEMPLATE = [
  {
    key: 'matheus', name: 'Matheus', color: '#C6A15E', sex: 'M', age: 25,
    heightCm: 170, weightKg: 53, targetWeightKg: 62,
    goal: 'hipertrofia', experience: 'iniciante',
    daysPerWeek: 4, sessionMin: 60, equipment: 'academia_completa',
    activityLevel: 'leve', cardioLevel: 'pouco', dietPreference: 'onivoro', mealsPerDay: 5,
    note: 'IMC 18,3 — abaixo do peso. Superávit mais generoso, prioridade em comer o suficiente e treino de 4 dias com foco em ganho de massa.'
  },
  {
    key: 'thais', name: 'Thais', color: '#A594D6', sex: 'F', age: 25,
    heightCm: 154, weightKg: 55, targetWeightKg: null,
    goal: 'saude', experience: 'iniciante',
    daysPerWeek: 3, sessionMin: 45, equipment: 'academia_completa',
    activityLevel: 'sedentario', cardioLevel: 'nenhum', dietPreference: 'onivoro', mealsPerDay: 4,
    note: 'IMC 23,2 — faixa adequada. Foco em força, condicionamento e composição corporal, sem déficit agressivo.'
  },
  {
    key: 'leandro', name: 'Leandro', color: '#74C4A0', sex: 'M', age: 55,
    heightCm: 180, weightKg: 94, targetWeightKg: 85,
    goal: 'emagrecimento', experience: 'iniciante',
    daysPerWeek: 3, sessionMin: 45, equipment: 'academia_completa',
    activityLevel: 'moderado', cardioLevel: 'pouco', dietPreference: 'onivoro', mealsPerDay: 3,
    note: 'IMC 29,0 — sobrepeso. Déficit moderado com proteína alta para preservar massa magra, mais passos e cardio na faixa da OMS.'
  },
  {
    key: 'priscila', name: 'Priscila', color: '#DCA65C', sex: 'F', age: 52,
    heightCm: 150, weightKg: 60, targetWeightKg: 55,
    goal: 'saude', experience: 'iniciante',
    daysPerWeek: 3, sessionMin: 45, equipment: 'academia_completa',
    activityLevel: 'leve', cardioLevel: 'nenhum', dietPreference: 'onivoro', mealsPerDay: 4,
    note: 'IMC 26,7 — leve sobrepeso. Prioridade em força e massa magra (proteção contra sarcopenia), com déficit suave e caminhada diária.'
  }
];
