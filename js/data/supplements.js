// Os poucos suplementos com evidência que se sustenta.
// Critério (Renaissance Diet 2.0): pesquisa suficiente, 5+ anos de estudo,
// consenso de resultados e retorno prático real. O resto, na prática, não muda nada.

export const SUPPLEMENTS = [
  {
    id: 'creatina', name: 'Creatina monohidratada', dose: '3–5 g por dia, todo dia',
    why: 'O suplemento com mais evidência para força e massa muscular. Recarrega o ATP entre séries, o que rende mais repetições com a mesma carga.',
    how: 'Qualquer horário; constância importa mais que timing. Não precisa de saturação nem de ciclos. Monohidratada é a forma mais estudada e a mais barata.',
    note: 'Pode aumentar 1–3% do peso em água dentro do músculo nas primeiras semanas — não é inchaço.',
    goals: ['hipertrofia', 'forca', 'recomposicao', 'emagrecimento', 'saude']
  },
  {
    id: 'whey', name: 'Whey protein', dose: '20–40 g quando faltar proteína no dia',
    why: 'Não é mágico: é comida prática. Serve para bater a meta de proteína quando a rotina não deixa comer.',
    how: 'Pós-treino ou em qualquer refeição em que falte proteína. Se você já bate a meta com comida, não precisa.',
    goals: ['hipertrofia', 'forca', 'recomposicao', 'emagrecimento']
  },
  {
    id: 'cafeina', name: 'Cafeína', dose: '3–6 mg por kg, 30–60 min antes',
    why: 'Aumenta estado de alerta, tolerância ao esforço e desempenho, sobretudo em treinos difíceis.',
    how: 'Café serve. Evite perto do horário de dormir: prejudicar o sono custa mais do que o ganho no treino.',
    note: 'Quem tem pressão alta, arritmia ou ansiedade deve conversar com o médico antes.',
    goals: ['hipertrofia', 'forca', 'emagrecimento']
  },
  {
    id: 'omega3', name: 'Ômega-3', dose: '1–2 g de EPA+DHA por dia',
    why: 'Gordura essencial que quase todo mundo come de menos. Apoio à saúde cardiovascular e ao controle inflamatório.',
    how: 'Junto de uma refeição com gordura. Só é necessário se você não come peixe gordo (salmão, sardinha) 2–3 vezes por semana.',
    goals: ['saude', 'hipertrofia', 'emagrecimento', 'recomposicao', 'forca']
  },
  {
    id: 'vitd', name: 'Vitamina D', dose: '1000–2000 UI/dia se houver deficiência',
    why: 'Deficiência é comum em quem passa o dia dentro de casa e se associa a pior força e saúde óssea.',
    how: 'Idealmente com exame de sangue antes. Suplementar às cegas em dose alta não é recomendado.',
    goals: ['saude', 'hipertrofia', 'emagrecimento', 'recomposicao', 'forca']
  },
  {
    id: 'multivitaminico', name: 'Multivitamínico', dose: '1 dose por dia',
    why: 'Seguro de micronutrientes durante dietas de corte ou quando a variedade de alimentos é baixa.',
    how: 'Não substitui comida de verdade — é rede de proteção, não estratégia.',
    goals: ['emagrecimento', 'saude']
  },
  {
    id: 'caseina', name: 'Caseína', dose: '30–40 g antes de dormir',
    why: 'Proteína de digestão lenta (~7 h). Útil quando há um intervalo muito longo sem comer.',
    how: 'Só faz diferença se a proteína total do dia já estiver difícil de bater.',
    goals: ['hipertrofia', 'forca']
  }
];

export function supplementsFor(profile) {
  return SUPPLEMENTS.filter(s => s.goals.includes(profile.goal || 'saude'));
}
