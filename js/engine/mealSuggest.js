// "Faltam 600 kcal e 45 g de proteína" — e agora, o que como?
// Monta combinações reais de alimentos que fecham o que sobrou do dia.

import { FOODS, portion } from '../data/foods.js';
import { clamp } from '../core/util.js';

const PROTEIN_SOURCES = ['Peito de frango grelhado', 'Patinho moído cozido', 'Tilápia grelhada', 'Ovo inteiro', 'Iogurte grego zero', 'Whey protein', 'Atum em água', 'Tofu', 'Soja texturizada (seca)'];
const CARB_SOURCES = ['Arroz branco cozido', 'Arroz integral cozido', 'Batata-doce cozida', 'Macarrão cozido', 'Pão integral', 'Aveia em flocos', 'Feijão carioca cozido', 'Tapioca (goma)'];
const FAT_SOURCES = ['Azeite de oliva', 'Pasta de amendoim', 'Abacate', 'Castanha-do-pará'];

const byName = name => FOODS.find(f => f.name === name);

function pickForDiet(names, diet) {
  if (diet === 'vegano') return names.filter(n => ['Tofu', 'Soja texturizada (seca)', 'Feijão carioca cozido', 'Aveia em flocos', 'Pasta de amendoim', 'Abacate', 'Azeite de oliva', 'Castanha-do-pará', 'Arroz branco cozido', 'Arroz integral cozido', 'Batata-doce cozida', 'Macarrão cozido', 'Pão integral', 'Tapioca (goma)'].includes(n));
  if (diet === 'vegetariano') return names.filter(n => !['Peito de frango grelhado', 'Patinho moído cozido', 'Tilápia grelhada', 'Atum em água'].includes(n));
  if (diet === 'sem_lactose') return names.filter(n => !['Iogurte grego zero', 'Whey protein'].includes(n));
  return names;
}

/**
 * Sugere até 3 combinações para o que falta no dia.
 * remaining = { kcal, protein, carbs, fat }
 */
export function suggestions(remaining, profile) {
  if (!remaining || remaining.kcal < 120) return [];
  const diet = profile.dietPreference || 'onivoro';
  const proteins = pickForDiet(PROTEIN_SOURCES, diet).map(byName).filter(Boolean);
  const carbs = pickForDiet(CARB_SOURCES, diet).map(byName).filter(Boolean);
  const fats = pickForDiet(FAT_SOURCES, diet).map(byName).filter(Boolean);
  if (!proteins.length || !carbs.length) return [];

  const out = [];
  for (let i = 0; i < Math.min(3, proteins.length); i++) {
    const p = proteins[(i * 3) % proteins.length];
    const c = carbs[(i * 2) % carbs.length];
    const f = fats[i % fats.length];

    // Quantidade de proteína que cobre o que falta, limitada ao razoável.
    const proteinGrams = clamp(Math.round((remaining.protein / (p.p / 100)) / 10) * 10, 30, p.unit ? 250 : 300);
    const pPart = portion(p, proteinGrams);

    let restKcal = remaining.kcal - pPart.kcal;
    const fatGrams = restKcal > 400 && f ? (f.unit ? f.unit.grams : 10) : 0;
    const fPart = fatGrams ? portion(f, fatGrams) : null;
    restKcal -= fPart?.kcal || 0;

    const carbGrams = clamp(Math.round((restKcal / (c.kcal / 100)) / 10) * 10, 0, 400);
    const cPart = carbGrams > 0 ? portion(c, carbGrams) : null;

    const items = [{ food: p, ...pPart }, cPart && { food: c, ...cPart }, fPart && { food: f, ...fPart }].filter(Boolean);
    const total = items.reduce((acc, it) => ({
      kcal: acc.kcal + it.kcal, protein: acc.protein + it.protein,
      carbs: acc.carbs + it.carbs, fat: acc.fat + it.fat, fiber: acc.fiber + (it.fiber || 0)
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    out.push({
      label: `${p.name} + ${c.name}${fPart ? ` + ${f.name}` : ''}`,
      items: items.map(it => ({ name: it.food.name, grams: it.grams })),
      total: {
        kcal: Math.round(total.kcal), protein: Math.round(total.protein),
        carbs: Math.round(total.carbs), fat: Math.round(total.fat), fiber: Math.round(total.fiber)
      }
    });
  }
  return out;
}
