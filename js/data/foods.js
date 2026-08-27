// Tabela rápida de alimentos (valores por 100 g/ml, salvo quando há unidade).
// Base: TACO/USDA arredondadas. Serve para registrar rápido — não substitui o rótulo.
// kcal | p = proteína | c = carboidrato | f = gordura | fib = fibra

const F = (name, group, kcal, p, c, f, fib = 0, unit = null) => ({ name, group, kcal, p, c, f, fib, unit });

export const FOODS = [
  // Proteínas
  F('Peito de frango grelhado', 'Proteínas', 165, 31, 0, 3.6),
  F('Coxa/sobrecoxa sem pele', 'Proteínas', 175, 25, 0, 8),
  F('Patinho moído cozido', 'Proteínas', 219, 32, 0, 9),
  F('Alcatra grelhada', 'Proteínas', 241, 32, 0, 12),
  F('Ovo inteiro', 'Proteínas', 143, 12.6, 0.8, 9.6, 0, { label: 'unidade', grams: 50 }),
  F('Clara de ovo', 'Proteínas', 52, 11, 0.7, 0.2, 0, { label: 'clara', grams: 33 }),
  F('Tilápia grelhada', 'Proteínas', 128, 26, 0, 2.7),
  F('Salmão grelhado', 'Proteínas', 211, 22, 0, 13),
  F('Atum em água', 'Proteínas', 116, 26, 0, 1),
  F('Sardinha', 'Proteínas', 208, 24, 0, 12),
  F('Whey protein', 'Proteínas', 400, 80, 10, 5, 0, { label: 'scoop', grams: 30 }),
  F('Tofu', 'Proteínas', 76, 8, 1.9, 4.8, 0.3),
  F('Soja texturizada (seca)', 'Proteínas', 336, 51, 34, 1, 18),

  // Carboidratos
  F('Arroz branco cozido', 'Carboidratos', 128, 2.5, 28.1, 0.2, 1.6),
  F('Arroz integral cozido', 'Carboidratos', 124, 2.6, 25.8, 1, 2.7),
  F('Feijão carioca cozido', 'Carboidratos', 76, 4.8, 13.6, 0.5, 8.5),
  F('Feijão preto cozido', 'Carboidratos', 77, 4.5, 14, 0.5, 8.4),
  F('Lentilha cozida', 'Carboidratos', 116, 9, 20, 0.4, 7.9),
  F('Grão-de-bico cozido', 'Carboidratos', 164, 8.9, 27, 2.6, 7.6),
  F('Macarrão cozido', 'Carboidratos', 158, 5.8, 30, 1, 1.8),
  F('Batata inglesa cozida', 'Carboidratos', 52, 1.2, 12, 0.1, 1.3),
  F('Batata-doce cozida', 'Carboidratos', 77, 0.6, 18.4, 0.1, 2.2),
  F('Mandioca cozida', 'Carboidratos', 125, 0.6, 30, 0.3, 1.6),
  F('Aveia em flocos', 'Carboidratos', 394, 14, 67, 8, 9.1),
  F('Tapioca (goma)', 'Carboidratos', 240, 0, 60, 0, 0.5),
  F('Pão francês', 'Carboidratos', 300, 8, 58, 3, 2.3, { label: 'unidade', grams: 50 }),
  F('Pão integral', 'Carboidratos', 248, 10, 44, 4, 6.9, { label: 'fatia', grams: 25 }),
  F('Cuscuz de milho', 'Carboidratos', 113, 2.4, 25, 0.6, 1.6),

  // Laticínios
  F('Leite integral', 'Laticínios', 61, 3.2, 4.7, 3.3),
  F('Leite desnatado', 'Laticínios', 35, 3.4, 5, 0.2),
  F('Iogurte natural integral', 'Laticínios', 61, 3.5, 4.7, 3.3),
  F('Iogurte grego zero', 'Laticínios', 59, 10, 3.6, 0.4),
  F('Queijo minas frescal', 'Laticínios', 264, 17, 3, 20),
  F('Requeijão', 'Laticínios', 257, 9, 4, 22),
  F('Queijo mussarela', 'Laticínios', 330, 22, 3, 25),

  // Frutas e vegetais
  F('Banana', 'Frutas e vegetais', 92, 1.3, 24, 0.1, 2, { label: 'unidade', grams: 100 }),
  F('Maçã', 'Frutas e vegetais', 52, 0.3, 14, 0.2, 2.4, { label: 'unidade', grams: 130 }),
  F('Laranja', 'Frutas e vegetais', 45, 1, 11, 0.1, 2.4, { label: 'unidade', grams: 150 }),
  F('Mamão', 'Frutas e vegetais', 43, 0.5, 11, 0.1, 1.7),
  F('Morango', 'Frutas e vegetais', 32, 0.7, 7.7, 0.3, 2),
  F('Abacate', 'Frutas e vegetais', 96, 1.2, 6, 8.4, 6.3),
  F('Brócolis cozido', 'Frutas e vegetais', 25, 2.1, 4, 0.4, 3.4),
  F('Salada de folhas', 'Frutas e vegetais', 15, 1, 2, 0.2, 1.6),
  F('Tomate', 'Frutas e vegetais', 18, 0.9, 3.9, 0.2, 1.2),
  F('Cenoura', 'Frutas e vegetais', 34, 1.3, 7.7, 0.2, 2.8),

  // Gorduras e extras
  F('Azeite de oliva', 'Gorduras', 884, 0, 0, 100, 0, { label: 'colher (10 ml)', grams: 10 }),
  F('Pasta de amendoim', 'Gorduras', 588, 25, 20, 50, 6, { label: 'colher (15 g)', grams: 15 }),
  F('Amendoim', 'Gorduras', 544, 27, 20, 44, 8),
  F('Castanha-do-pará', 'Gorduras', 643, 14, 15, 63, 7.9, { label: 'unidade', grams: 5 }),
  F('Chocolate 70%', 'Gorduras', 579, 7.8, 45, 41, 11),
  F('Barra de proteína', 'Extras', 367, 33, 37, 12, 5, { label: 'unidade', grams: 60 }),
  F('Cerveja', 'Extras', 43, 0.5, 3.6, 0),
  F('Refrigerante', 'Extras', 42, 0, 10.6, 0)
];

export const FOOD_GROUPS = [...new Set(FOODS.map(f => f.group))];

export function searchFoods(term) {
  const q = String(term || '').toLowerCase().trim();
  if (!q) return FOODS;
  return FOODS.filter(f => f.name.toLowerCase().includes(q) || f.group.toLowerCase().includes(q));
}

// Converte uma quantidade (em gramas ou unidades) nos totais do alimento.
export function portion(food, amount, useUnit = false) {
  const grams = useUnit && food.unit ? amount * food.unit.grams : amount;
  const k = grams / 100;
  return {
    kcal: Math.round(food.kcal * k),
    protein: +(food.p * k).toFixed(1),
    carbs: +(food.c * k).toFixed(1),
    fat: +(food.f * k).toFixed(1),
    fiber: +(food.fib * k).toFixed(1),
    grams: Math.round(grams)
  };
}

/* ---------- Porção pela mão (método sem balança) ----------
 * Baseado no método de "porções pela mão" (Precision Nutrition): a própria
 * mão escala com o corpo de quem come, então serve como referência sem
 * precisar pesar nada. Uma porção "média" por grupo de alimento; o tamanho
 * ajusta o quanto aquilo pesa de verdade. */

export const HAND_PORTIONS = {
  'Proteínas': { label: 'palma da mão', ref: 'do tamanho e da espessura da palma da mão, sem contar os dedos', grams: 120 },
  'Carboidratos': { label: 'punho fechado', ref: 'do tamanho do seu punho fechado', grams: 150 },
  'Laticínios': { label: 'punho fechado', ref: 'do tamanho do seu punho fechado', grams: 150 },
  'Frutas e vegetais': { label: 'punho fechado', ref: 'do tamanho do seu punho fechado', grams: 100 },
  'Gorduras': { label: 'polegar', ref: 'do tamanho do seu polegar, da dobra até a ponta', grams: 15 },
  'Extras': { label: 'punho fechado', ref: 'do tamanho do seu punho fechado', grams: 80 }
};

export const HAND_SIZES = [
  { id: 'p', label: 'Pequena', mult: 0.6 },
  { id: 'm', label: 'Média', mult: 1 },
  { id: 'g', label: 'Grande', mult: 1.5 }
];

export function handRef(food) {
  return HAND_PORTIONS[food.group] || HAND_PORTIONS.Extras;
}

export function handPortion(food, sizeId = 'm', count = 1) {
  const ref = handRef(food);
  const size = HAND_SIZES.find(s => s.id === sizeId) || HAND_SIZES[1];
  const grams = ref.grams * size.mult * Math.max(1, count || 1);
  return { ...portion(food, grams), ref, size, count: Math.max(1, count || 1) };
}

/* ---------- Monte seu prato (sem escolher alimento nem pesar) ----------
 * Quando a pessoa não quer procurar um alimento específico: monta o prato
 * contando porções pela mão por grupo, usando um alimento representativo
 * de cada grupo como referência de densidade calórica. */

export const PLATE_GROUPS = [
  { id: 'protein', label: 'Proteína', unit: 'palma da mão', hint: 'carne, frango, peixe, ovo, tofu...', grams: 120, per100: { kcal: 165, p: 31, c: 0, f: 3.6 } },
  { id: 'carb', label: 'Carboidrato', unit: 'punho fechado', hint: 'arroz, batata, macarrão, pão...', grams: 150, per100: { kcal: 130, p: 2.6, c: 28, f: 0.4 } },
  { id: 'fat', label: 'Gordura', unit: 'polegar', hint: 'azeite, manteiga, pasta de amendoim...', grams: 15, per100: { kcal: 700, p: 5, c: 6, f: 74 } },
  { id: 'veg', label: 'Vegetais/salada', unit: 'punho fechado', hint: 'folhas, legumes, verduras...', grams: 100, per100: { kcal: 25, p: 2, c: 5, f: 0.3 } }
];

export function platePortion(counts = {}) {
  let kcal = 0, protein = 0, carbs = 0, fat = 0;
  for (const g of PLATE_GROUPS) {
    const n = Math.max(0, counts[g.id] || 0);
    const k = (g.grams * n) / 100;
    kcal += g.per100.kcal * k;
    protein += g.per100.p * k;
    carbs += g.per100.c * k;
    fat += g.per100.f * k;
  }
  return { kcal: Math.round(kcal), protein: +protein.toFixed(1), carbs: +carbs.toFixed(1), fat: +fat.toFixed(1) };
}
