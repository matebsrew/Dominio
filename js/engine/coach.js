// O treinador: junta treino, comida, cardio, sono e peso numa conversa só.
//
// Duas saídas: o briefing do dia (o que importa agora, em ordem de prioridade)
// e a revisão da semana (o que aconteceu, o que muda na semana seguinte).

import { today, weekStart, weekDays, addDays, mean, fmt, clamp, minutesLabel, formatDate } from '../core/util.js';
import { dayTotals, weekNutrition, snapshot } from './diary.js';
import { phase, deloadPrescription, volumeTargetFor } from './mesocycle.js';
import { volumeReport, personalRecords, performanceDrops, streak, deloadCheck } from './progression.js';
import { weeklyVolumeDecisions, pendingFeedback } from './feedback.js';
import { REGIONS, PAIN_ADVICE } from '../data/joints.js';
import { weekMinutes, weekSteps, weeklyTarget } from './cardio.js';
import { GOAL_LABEL } from './energy.js';
import { fmtRate } from './adaptive.js';
import { dayForWeekday, nextDay } from './program.js';
import { BY_ID } from '../data/exercises.js';
import { weekdayIndex } from '../core/util.js';

/**
 * Briefing do dia: no máximo 4 recados, do mais urgente ao menos.
 */
export function dailyBriefing(profile, data, snap = null) {
  const s = snap || snapshot(profile, data);
  const items = [];
  const ph = phase(profile, data.settings || {});
  const painRegions = Object.keys(data.settings?.pain || {}).filter(r => data.settings.pain[r]);

  // 1. Dor ativa
  if (painRegions.length) {
    items.push({
      priority: 1, tone: 'bad', title: `Dor em ${painRegions.map(r => REGIONS[r].toLowerCase()).join(' e ')}`,
      text: painRegions.map(r => PAIN_ADVICE[r]).join(' ') + ' Se passar de duas semanas, procure avaliação.',
      action: { label: 'Ver trocas sugeridas', href: '#/treino' }
    });
  }

  // 2. Deload em curso
  if (ph.isDeload) {
    const d = deloadPrescription(data.settings || {});
    items.push({ priority: 2, tone: 'violet', title: 'Semana de deload', text: d.text });
  }

  // 3. Feedback pendente do último treino
  const pending = pendingFeedback(data);
  if (pending.length) {
    const p = pending[0];
    items.push({
      priority: 3, tone: 'accent', title: 'Falta o feedback do último treino',
      text: `Como ${p.muscles.length > 1 ? 'ficaram os músculos' : 'ficou o músculo'} do ${p.session.day}? É esse retorno que define se eu somo ou tiro séries na próxima semana.`,
      action: { label: 'Responder agora', href: '#/semana' }
    });
  }

  // 4. Treino do dia
  const scheduled = dayForWeekday(data.program, weekdayIndex(today()));
  const trainedToday = s.sessionsToday.length > 0;
  if (scheduled && !trainedToday) {
    const readiness = s.checkin?.score;
    items.push({
      priority: 4, tone: 'accent', title: `Hoje é ${scheduled.name}`,
      text: readiness == null
        ? `${scheduled.exercises.length} exercícios, ~${scheduled.estimatedMin} min. Faça o check-in antes: ele decide se hoje é dia de subir carga ou de segurar.`
        : `${s.plan.title}. ${s.plan.message}`,
      action: { label: 'Abrir treino', href: '#/treino' }
    });
  } else if (!scheduled && !trainedToday) {
    items.push({
      priority: 6, tone: 'good', title: 'Hoje é dia de descanso',
      text: `Descanso é quando o músculo cresce, não uma pausa no progresso. Bata a meta de passos (${fmt(s.cardio.target.steps)}), coma a proteína do dia e durma bem.`
    });
  }

  // 5. Nutrição do dia
  if (s.targets) {
    const hour = new Date().getHours();
    const m = s.targets.macros;
    const proteinPct = m.protein ? (s.nutrition.protein / m.protein) * 100 : 0;
    if (hour >= 17 && proteinPct < 65 && s.nutrition.count > 0) {
      items.push({
        priority: 5, tone: 'warn', title: 'Proteína atrasada',
        text: `Faltam ${fmt(m.protein - s.nutrition.protein)} g de proteína para fechar o dia. É o macro que mais protege sua massa magra — resolva no jantar ou numa dose de whey.`,
        action: { label: 'Registrar', href: '#/nutricao' }
      });
    } else if (hour >= 12 && s.nutrition.count === 0) {
      items.push({
        priority: 7, tone: 'warn', title: 'Nada registrado hoje',
        text: `Sua meta é ${fmt(m.kcal)} kcal e ${fmt(m.protein)} g de proteína. Registrar leva 30 segundos e é o que me deixa ajustar o resto.`,
        action: { label: 'Registrar refeição', href: '#/nutricao' }
      });
    }
  }

  // 6. Pesagens
  const weighins = (data.body || []).filter(b => weekDays(weekStart()).includes(b.date) && Number.isFinite(b.weight)).length;
  const weekday = weekdayIndex(today());
  if (weekday >= 4 && weighins < 3) {
    items.push({
      priority: 8, tone: 'warn', title: 'Poucas pesagens nesta semana',
      text: `${weighins} de 3. Sem isso eu não consigo separar oscilação de água de mudança real, e o ajuste de calorias fica travado.`,
      action: { label: 'Pesar agora', href: '#/corpo' }
    });
  }

  // 7. Ajuste calórico
  if (s.adjustment.status === 'ajustar' && s.adjustment.deltaKcal) {
    items.push({ priority: 4.5, tone: 'good', title: s.adjustment.title, text: s.adjustment.detail, action: { label: 'Aplicar', href: '#/nutricao' } });
  }

  // 8. Sono
  const sleeps = (data.checkins || []).slice(0, 5).map(c => c.sleepHours).filter(Number.isFinite);
  if (sleeps.length >= 3 && mean(sleeps) < 6.5) {
    items.push({
      priority: 9, tone: 'warn', title: 'Sono curto vem se repetindo',
      text: `Média de ${mean(sleeps).toFixed(1)}h nas últimas noites. Sono é o que mais derruba desempenho e recuperação — mais que qualquer detalhe de treino ou dieta.`
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/**
 * Revisão da semana: aderência, o que os dados dizem e o que muda na próxima.
 */
export function weeklyReview(profile, data, weekKey = weekStart()) {
  const days = weekDays(weekKey);
  const isCurrent = weekKey === weekStart();
  const elapsed = isCurrent ? weekdayIndex(today()) + 1 : 7;

  const sessions = (data.sessions || []).filter(s => days.includes(s.date));
  const planned = profile.daysPerWeek || 3;
  const nutritionDays = days.map(d => dayTotals(data.nutrition?.[d])).filter(t => t.count > 0);
  const weighins = (data.body || []).filter(b => days.includes(b.date) && Number.isFinite(b.weight));
  const checkins = (data.checkins || []).filter(c => days.includes(c.date));
  const cardioMin = weekMinutes(data.activity || {}, days);
  const steps = weekSteps(data.activity || {}, days);
  const target = data.settings ? null : null;
  const snap = snapshot(profile, data);
  const macros = snap.targets?.macros;
  const cardioTarget = weeklyTarget(profile);
  const ph = phase(profile, data.settings || {});

  const avgKcal = nutritionDays.length ? Math.round(mean(nutritionDays.map(t => t.kcal))) : null;
  const avgProtein = nutritionDays.length ? Math.round(mean(nutritionDays.map(t => t.protein))) : null;

  const adherence = {
    training: { done: sessions.length, planned, pct: pct(sessions.length, planned) },
    nutrition: {
      daysLogged: nutritionDays.length, expected: elapsed, avgKcal, avgProtein,
      kcalTarget: macros?.kcal ?? null, proteinTarget: macros?.protein ?? null,
      pct: macros && avgKcal ? 100 - Math.min(100, Math.abs(avgKcal - macros.kcal) / macros.kcal * 100) : null
    },
    protein: macros && avgProtein ? pct(avgProtein, macros.protein) : null,
    steps: { avg: steps.avg, target: cardioTarget.steps, pct: steps.avg ? pct(steps.avg, cardioTarget.steps) : null },
    cardio: { minutes: cardioMin, target: cardioTarget.minutes, pct: pct(cardioMin, cardioTarget.minutes) },
    weighins: { done: weighins.length, target: 3, pct: pct(weighins.length, 3) },
    sleep: { avg: mean(checkins.map(c => c.sleepHours)), nights: checkins.filter(c => Number.isFinite(c.sleepHours)).length },
    readiness: mean(checkins.map(c => c.score))
  };

  const parts = [adherence.training.pct, adherence.nutrition.pct, adherence.protein, adherence.steps.pct, adherence.cardio.pct, adherence.weighins.pct]
    .filter(Number.isFinite);
  const score = parts.length ? Math.round(mean(parts)) : null;

  // Semana sem nenhum registro: não faz sentido dar nota nem cobrar.
  const fresh = !sessions.length && !nutritionDays.length && !weighins.length && !checkins.length && !cardioMin;

  const volume = volumeReport(data.sessions || [], profile, weekKey, BY_ID)
    .filter(r => r.value > 0 || r.mev > 0)
    .map(r => ({ ...r, window: volumeTargetFor(r.key, profile, ph) }));

  return {
    weekKey, isCurrent, label: `semana de ${formatDate(weekKey)}`,
    phase: ph, adherence, score: fresh ? null : score, fresh,
    checklist: fresh ? firstWeekChecklist(profile, snap) : null,
    volume,
    decisions: fresh ? [] : decisions(profile, data, { adherence, volume, ph, snap }),
    wins: wins(data, sessions, weekKey),
    volumeDecisions: weeklyVolumeDecisions(data, profile, weekKey)
  };
}

// Primeira semana: em vez de cobrar aderência que ainda não existe,
// mostra o caminho — cada item destrava uma parte do que o app faz.
function firstWeekChecklist(profile, snap) {
  const macros = snap.targets?.macros;
  return [
    { title: 'Fazer o check-in antes do primeiro treino',
      text: 'Quatro perguntas de dez segundos. É delas que sai a decisão de subir carga ou segurar.', href: '#/treino' },
    { title: 'Registrar o primeiro treino inteiro',
      text: 'Carga, repetições e RIR de cada série. A partir do segundo treino eu já digo quanto colocar na barra.', href: '#/treino' },
    { title: 'Pesar-se em 3 manhãs desta semana',
      text: 'Com duas semanas de pesagens eu passo a ajustar suas calorias sozinho, sem você pedir.', href: '#/corpo' },
    { title: macros ? `Registrar a comida em pelo menos 4 dias (meta ${Math.round(macros.kcal)} kcal, ${Math.round(macros.protein)} g de proteína)` : 'Registrar a comida em pelo menos 4 dias',
      text: 'Não precisa ser perfeito. Precisa ser o suficiente para eu ver se a meta está sendo cumprida.', href: '#/nutricao' },
    { title: 'Responder o feedback depois do treino',
      text: 'Pump, conexão e dor de cada músculo. É esse retorno que faz o volume da semana seguinte ser seu, e não do papel.', href: '#/semana' }
  ];
}

function pct(value, target) {
  if (!target) return null;
  return Math.round(clamp((value / target) * 100, 0, 130));
}

function decisions(profile, data, { adherence, volume, ph, snap }) {
  const out = [];

  // Treino
  if (adherence.training.done < adherence.training.planned) {
    const missed = adherence.training.planned - adherence.training.done;
    out.push({
      area: 'Treino', tone: missed >= 2 ? 'bad' : 'warn',
      title: `${missed} treino${missed > 1 ? 's' : ''} a menos que o planejado`,
      text: missed >= 2
        ? `Duas ou mais sessões perdidas por semana derrubam o volume abaixo do mínimo eficaz. Se a rotina não cabe em ${adherence.training.planned} dias, é melhor reduzir o programa para ${Math.max(2, adherence.training.planned - 1)} dias e cumprir do que planejar demais e falhar.`
        : 'Uma sessão perdida não estraga a semana, mas duas seguidas sim. Se der, reponha em um dia de descanso.'
    });
  } else {
    out.push({ area: 'Treino', tone: 'good', title: 'Semana de treino completa', text: `${adherence.training.done} de ${adherence.training.planned} sessões. É a consistência que constrói — nenhum detalhe de programa compensa treino perdido.` });
  }

  // Mesociclo
  if (ph.isDeload) {
    out.push({ area: 'Mesociclo', tone: 'violet', title: 'Deload nesta semana', text: 'Volume e carga reduzidos de propósito. Na semana que vem começa um novo mesociclo, de volta ao volume mínimo com carga um pouco maior que a do início do anterior.' });
  } else if (ph.week >= ph.accumulation) {
    out.push({ area: 'Mesociclo', tone: 'warn', title: 'Última semana de acumulação', text: `Fim da semana ${ph.week} de ${ph.accumulation}: o próximo passo é o deload. Também é a hora de revisar exercícios que pararam de entregar progresso ou incomodam alguma articulação.` });
  } else {
    out.push({ area: 'Mesociclo', tone: '', title: `Semana ${ph.week + 1} vem aí`, text: `Volume sobe onde a recuperação permitiu e o RIR-alvo cai para ${ph.rir.label === '3–4' ? '2–3' : ph.rir.label}. ${ph.intent}` });
  }

  // Volume
  const below = volume.filter(v => v.window && v.value < v.window.min && v.mev > 0);
  const above = volume.filter(v => v.value >= v.mrv && v.mrv > 0);
  if (above.length) {
    out.push({ area: 'Volume', tone: 'bad', title: `${above.map(v => v.label).join(', ')} acima do máximo recuperável`, text: 'Passar do MRV não acelera nada: gera fadiga que compete com o crescimento. Corte 2 a 4 séries desses músculos na próxima semana.' });
  }
  if (below.length) {
    out.push({ area: 'Volume', tone: 'warn', title: `Volume baixo em ${below.slice(0, 3).map(v => v.label.toLowerCase()).join(', ')}`, text: `Abaixo do mínimo para crescer nesta fase. Some 1 a 2 séries por músculo na próxima semana, começando pelos exercícios em que a recuperação está fácil.` });
  }

  // Nutrição
  const n = adherence.nutrition;
  if (n.daysLogged < 4) {
    out.push({ area: 'Nutrição', tone: 'warn', title: `Só ${n.daysLogged} dias registrados`, text: 'Com menos de 4 dias não dá para saber se a meta está sendo cumprida — e sem isso o ajuste de calorias vira chute. Registre pelo menos os dias de treino.' });
  } else if (n.kcalTarget && n.avgKcal) {
    const diff = n.avgKcal - n.kcalTarget;
    if (Math.abs(diff) > n.kcalTarget * 0.1) {
      out.push({
        area: 'Nutrição', tone: 'warn',
        title: diff > 0 ? `Média ${fmt(diff)} kcal acima da meta` : `Média ${fmt(-diff)} kcal abaixo da meta`,
        text: diff > 0
          ? 'O excedente extra vira gordura, não músculo. Ajuste as porções das refeições maiores antes de mexer na meta.'
          : profile.goal === 'hipertrofia'
            ? 'Comer abaixo da meta é o motivo número um de ganho travado. Adicione calorias densas: azeite, pasta de amendoim, aveia, arroz.'
            : 'Comer bem abaixo da meta parece bom, mas cobra depois em fome e perda de massa magra. Fique perto do número.'
      });
    } else {
      out.push({ area: 'Nutrição', tone: 'good', title: 'Calorias na meta', text: `Média de ${fmt(n.avgKcal)} kcal em ${n.daysLogged} dias. É assim que o ajuste automático passa a funcionar direito.` });
    }
  }
  if (adherence.protein !== null && adherence.protein < 85) {
    out.push({ area: 'Nutrição', tone: 'warn', title: 'Proteína abaixo do alvo', text: `Média de ${fmt(n.avgProtein)} g contra ${fmt(n.proteinTarget)} g. Uma fonte de proteína em cada refeição resolve — é o macro que menos pode faltar.` });
  }

  // Peso
  if (snap.adjustment.status === 'ajustar' && snap.adjustment.deltaKcal) {
    out.push({ area: 'Peso', tone: 'good', title: snap.adjustment.title, text: snap.adjustment.detail });
  } else if (adherence.weighins.done < 3) {
    out.push({ area: 'Peso', tone: 'warn', title: `${adherence.weighins.done} pesagens de 3`, text: 'Pese-se de manhã, depois do banheiro, antes de comer. A média da semana é o que conta.' });
  }

  // Passos e cardio
  if (adherence.steps.pct !== null && adherence.steps.pct < 80) {
    out.push({ area: 'Atividade', tone: 'warn', title: 'Passos abaixo da meta', text: `Média de ${fmt(adherence.steps.avg)} contra ${fmt(adherence.steps.target)}. Passos são o gasto que mais muda o resultado sem atrapalhar a recuperação do treino.` });
  }
  if (adherence.cardio.pct !== null && adherence.cardio.pct < 60 && adherence.cardio.target > 0) {
    out.push({ area: 'Atividade', tone: 'warn', title: 'Cardio abaixo da dose', text: `${minutesLabel(adherence.cardio.minutes)} de ${minutesLabel(adherence.cardio.target)}. Duas caminhadas de 25 min já fecham boa parte da conta.` });
  }

  // Sono e prontidão
  if (Number.isFinite(adherence.sleep.avg) && adherence.sleep.avg < 6.5) {
    out.push({ area: 'Recuperação', tone: 'bad', title: `Sono médio de ${adherence.sleep.avg.toFixed(1)}h`, text: 'Antes de mexer em volume ou calorias, resolva o sono. Nada rende com menos de 7 horas de forma crônica.' });
  }
  if (Number.isFinite(adherence.readiness) && adherence.readiness < 50) {
    out.push({ area: 'Recuperação', tone: 'bad', title: 'Prontidão baixa a semana toda', text: 'Não é falta de vontade: é sinal de que estímulo, comida e descanso estão desequilibrados. Um deload agora resolve mais que insistir.' });
  }

  return out;
}

function wins(data, sessions, weekKey) {
  const out = [];
  const days = weekDays(weekKey);
  const prs = personalRecords(data.sessions || []).filter(pr => days.includes(pr.date));
  for (const pr of prs.slice(0, 4)) {
    out.push({ title: `Recorde em ${pr.name}`, text: `${pr.kg} kg × ${pr.reps} — melhor marca registrada até agora.` });
  }
  const st = streak(data.sessions || []);
  if (st >= 4) out.push({ title: `${st} treinos seguidos sem furar`, text: 'Consistência é a variável que mais explica resultado a longo prazo.' });
  const totalSets = sessions.reduce((a, s) => a + s.exercises.reduce((x, e) => x + e.sets.length, 0), 0);
  if (totalSets) out.push({ title: `${totalSets} séries registradas`, text: 'Cada série registrada melhora a sugestão da próxima sessão.' });
  return out;
}

export function scoreLabel(score) {
  if (!Number.isFinite(score)) return { label: 'sem dados', tone: '' };
  if (score >= 90) return { label: 'semana excelente', tone: 'good' };
  if (score >= 75) return { label: 'semana boa', tone: 'good' };
  if (score >= 55) return { label: 'semana irregular', tone: 'warn' };
  return { label: 'semana fraca', tone: 'bad' };
}
