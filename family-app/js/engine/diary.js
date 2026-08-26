// Agregações do diário: totais do dia, da semana e o retrato completo de "hoje".

import { today, weekStart, weekDays, sum, mean } from '../core/util.js';
import { calorieTarget, macros } from './energy.js';
import { weeklyTarget, weekMinutes, weekSteps } from './cardio.js';
import { score as readinessScore, sessionPlan } from './readiness.js';
import { suggestAdjustment, trend } from './adaptive.js';

export function dayTotals(day = { meals: [] }) {
  const meals = day.meals || [];
  return {
    kcal: Math.round(sum(meals.map(m => m.kcal))),
    protein: Math.round(sum(meals.map(m => m.protein))),
    carbs: Math.round(sum(meals.map(m => m.carbs))),
    fat: Math.round(sum(meals.map(m => m.fat))),
    fiber: Math.round(sum(meals.map(m => m.fiber))),
    water: day.water || 0,
    count: meals.length
  };
}

export function latestBody(bodyLog) {
  return bodyLog.find(b => Number.isFinite(b.weight)) || null;
}

// Metas do dia já com o ajuste acumulado do perfil aplicado.
export function targetsFor(profile, data) {
  const body = latestBody(data.body) || {};
  const cardioMin = weeklyTarget(profile).minutes;
  const energy = calorieTarget(profile, body, cardioMin, data.settings?.kcalOffset || 0);
  if (!energy) return null;
  return { energy, macros: macros(profile, energy.target, body), body };
}

/**
 * Retrato do dia usado pelo painel principal.
 */
export function snapshot(profile, data, date = today()) {
  const targets = targetsFor(profile, data);
  const nutrition = dayTotals(data.nutrition?.[date]);
  const wkStart = weekStart(date);
  const days = weekDays(wkStart);

  const checkin = data.checkins.find(c => c.date === date) || null;
  const plan = sessionPlan(checkin || {}, { sleepHours: checkin?.sleepHours, pain: checkin?.pain });

  const cardio = {
    target: weeklyTarget(profile),
    minutes: weekMinutes(data.activity || {}, days),
    steps: weekSteps(data.activity || {}, days),
    todaySteps: data.activity?.[date]?.steps ?? null,
    todayCardio: data.activity?.[date]?.cardio || []
  };

  const weight = trend(data.body || [], 4);
  const adjustment = suggestAdjustment(profile, data.body || [], data.settings || {});
  const sessionsToday = data.sessions.filter(s => s.date === date);
  const trainedToday = sessionsToday.length > 0;
  const sessionsThisWeek = data.sessions.filter(s => days.includes(s.date)).length;

  return { date, targets, nutrition, checkin, plan, cardio, weight, adjustment, trainedToday, sessionsToday, sessionsThisWeek, weekStart: wkStart, days };
}

export function weekNutrition(data, days) {
  const totals = days.map(d => dayTotals(data.nutrition?.[d])).filter(t => t.count > 0);
  if (!totals.length) return null;
  return {
    days: totals.length,
    kcal: Math.round(mean(totals.map(t => t.kcal))),
    protein: Math.round(mean(totals.map(t => t.protein))),
    carbs: Math.round(mean(totals.map(t => t.carbs))),
    fat: Math.round(mean(totals.map(t => t.fat)))
  };
}
