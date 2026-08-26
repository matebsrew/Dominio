// Ajuste alimentar baseado na evolução real, não na conta feita uma vez só.
//
// O peso do dia oscila com água, sódio, intestino e ciclo hormonal. Por isso o
// sistema trabalha com a MÉDIA da semana e compara semanas consecutivas antes de
// mexer em qualquer coisa — e só sugere ajuste com dados suficientes.

import { mean, slope, weekStart, addDays, daysBetween, round, clamp } from '../core/util.js';
import { KCAL_PER_KG, targetRateKg } from './energy.js';

export const MIN_WEIGHINS_PER_WEEK = 3;

// Agrupa as pesagens em semanas (segunda a domingo) e devolve a média de cada uma.
export function weeklyWeights(bodyLog, weeks = 8) {
  const byWeek = new Map();
  for (const entry of bodyLog) {
    if (!Number.isFinite(entry.weight)) continue;
    const wk = weekStart(entry.date);
    if (!byWeek.has(wk)) byWeek.set(wk, []);
    byWeek.get(wk).push(entry.weight);
  }
  return [...byWeek.entries()]
    .map(([week, values]) => ({
      week,
      avg: mean(values),
      count: values.length,
      label: week
    }))
    .sort((a, b) => (a.week < b.week ? -1 : 1))
    .slice(-weeks);
}

// Ritmo real em kg/semana, por regressão sobre as médias semanais.
export function trend(bodyLog, weeks = 4) {
  let series = weeklyWeights(bodyLog, weeks + 1);

  // A semana em curso só entra na conta quando já tem pesagens suficientes —
  // senão a média parcial de segunda-feira distorceria a tendência.
  const current = weekStart();
  if (series.length && series.at(-1).week === current && series.at(-1).count < MIN_WEIGHINS_PER_WEEK) {
    series = series.slice(0, -1);
  }
  series = series.slice(-weeks);

  if (series.length < 2) return { ratePerWeek: null, series, confident: false, weeksTracked: series.length };
  const points = series.map((s, i) => ({ x: i, y: s.avg }));
  const rate = slope(points);
  const enoughData = series.slice(-2).every(s => s.count >= MIN_WEIGHINS_PER_WEEK);
  return {
    ratePerWeek: rate,
    series,
    confident: enoughData,
    lastAvg: series.at(-1).avg,
    prevAvg: series.at(-2)?.avg ?? null,
    weeksTracked: series.length
  };
}

/**
 * Compara ritmo real x ritmo desejado e devolve a sugestão de ajuste calórico.
 * A conversão usa 7700 kcal por kg, dividida por 7 para virar kcal/dia,
 * e é limitada a ±250 kcal/dia por vez para não gerar oscilação exagerada.
 */
export function suggestAdjustment(profile, bodyLog, settings = {}) {
  const t = trend(bodyLog, 4);
  const want = targetRateKg(profile);

  if (!t.confident) {
    return {
      status: 'sem_dados',
      title: 'Ainda coletando dados',
      detail: t.weeksTracked >= 1
        ? `Faltam pesagens para eu ter certeza: preciso de ${MIN_WEIGHINS_PER_WEEK} dias por semana em 2 semanas seguidas. Você tem ${t.weeksTracked} semana${t.weeksTracked > 1 ? 's' : ''} completa${t.weeksTracked > 1 ? 's' : ''} até agora.`
        : `Pese-se em pelo menos ${MIN_WEIGHINS_PER_WEEK} dias por semana, sempre de manhã. Com 2 semanas completas eu passo a ajustar as calorias sozinho.`,
      deltaKcal: 0,
      trend: t
    };
  }

  const real = t.ratePerWeek;
  const diff = want - real;               // quanto falta (kg/semana)
  const tolerance = Math.max(0.12, Math.abs(want) * 0.4);

  // Já respeitou o intervalo mínimo entre ajustes?
  const last = settings.lastAdjust;
  const cooldown = last ? daysBetween(last, weekStart()) < 14 : false;

  if (Math.abs(diff) <= tolerance) {
    return {
      status: 'ok',
      title: 'Ritmo adequado',
      detail: `Você está em ${fmtRate(real)} e o alvo é ${fmtRate(want)}. Mantenha as calorias como estão.`,
      deltaKcal: 0,
      trend: t
    };
  }

  const raw = (diff * KCAL_PER_KG) / 7;
  const deltaKcal = round(clamp(raw, -250, 250), 10);

  const gaining = want > 0;
  let title, detail;
  if (deltaKcal > 0) {
    title = gaining ? 'Ganho travado — subir calorias' : 'Perda rápida demais — subir calorias';
    detail = gaining
      ? `Média das últimas semanas em ${fmtRate(real)}, abaixo do alvo de ${fmtRate(want)}. Some ${deltaKcal} kcal/dia, quase todas em carboidrato, e reavalie em 2 semanas.`
      : `Você está perdendo ${fmtRate(-real)}, mais rápido que o alvo. Some ${deltaKcal} kcal/dia para preservar massa magra e desempenho.`;
  } else {
    title = gaining ? 'Ganho rápido demais — reduzir calorias' : 'Perda travada — reduzir calorias';
    detail = gaining
      ? `Está subindo ${fmtRate(real)}, acima do alvo de ${fmtRate(want)}. Boa parte desse excedente vira gordura: corte ${Math.abs(deltaKcal)} kcal/dia.`
      : `Peso praticamente parado (${fmtRate(real)}). Corte ${Math.abs(deltaKcal)} kcal/dia ou aumente os passos diários antes de cortar mais comida.`;
  }

  return {
    status: cooldown ? 'aguardando' : 'ajustar',
    title: cooldown ? 'Ajuste recente — aguarde' : title,
    detail: cooldown
      ? 'O último ajuste foi há menos de 2 semanas. Dê tempo para o corpo responder antes de mexer de novo.'
      : detail,
    deltaKcal: cooldown ? 0 : deltaKcal,
    trend: t
  };
}

export function fmtRate(kgPerWeek) {
  if (!Number.isFinite(kgPerWeek)) return '—';
  const v = Math.abs(kgPerWeek) < 0.01 ? 0 : kgPerWeek;
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sign}${Math.abs(v).toFixed(2)} kg/semana`;
}

// Projeção simples até o peso-alvo, mantendo o ritmo atual.
export function projection(currentWeight, targetWeight, ratePerWeek) {
  if (!Number.isFinite(currentWeight) || !Number.isFinite(targetWeight) || !ratePerWeek) return null;
  const delta = targetWeight - currentWeight;
  if (Math.sign(delta) !== Math.sign(ratePerWeek) || Math.abs(ratePerWeek) < 0.02) return null;
  const weeks = Math.abs(delta / ratePerWeek);
  return {
    weeks: Math.round(weeks),
    date: addDays(weekStart(), Math.round(weeks * 7)),
    remaining: delta
  };
}

// Leitura da bioimpedância: o que importa é a direção de massa magra x gordura.
export function bodyCompositionInsight(bodyLog) {
  const withFat = bodyLog.filter(b => Number.isFinite(b.bodyFat) && Number.isFinite(b.weight))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  if (withFat.length < 2) return null;
  const first = withFat.at(-Math.min(withFat.length, 5));
  const last = withFat.at(-1);
  const leanFirst = first.weight * (1 - first.bodyFat / 100);
  const leanLast = last.weight * (1 - last.bodyFat / 100);
  const fatFirst = first.weight - leanFirst;
  const fatLast = last.weight - leanLast;
  return {
    from: first.date,
    to: last.date,
    leanDelta: +(leanLast - leanFirst).toFixed(1),
    fatDelta: +(fatLast - fatFirst).toFixed(1),
    bodyFatDelta: +(last.bodyFat - first.bodyFat).toFixed(1)
  };
}
