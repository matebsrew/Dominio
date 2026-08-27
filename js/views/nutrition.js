// Nutrição: metas calculadas, registro rápido e ajuste pela evolução real.

import { esc, fmt, num, toast, today, clamp, formatDate, addDays, weekDays, weekStart } from '../core/util.js';
import { pdata, addMeal, removeMeal, setWater, nutritionDay, updateSettings, saveFavoriteMeal, removeFavoriteMeal } from '../core/store.js';
import { snapshot, dayTotals, weekNutrition } from '../engine/diary.js';
import { mealPlan, GOAL_LABEL, cycledTargets, proteinPerMealRange } from '../engine/energy.js';
import { suggestions } from '../engine/mealSuggest.js';
import { supplementsFor } from '../data/supplements.js';
import { dayForWeekday } from '../engine/program.js';
import { weekdayIndex } from '../core/util.js';
import { searchFoods, portion, FOODS, handPortion, handRef, HAND_SIZES, PLATE_GROUPS, platePortion } from '../data/foods.js';
import { coach, progressBar, sheet, closeSheet, field } from '../ui.js';
import { signed } from '../core/util.js';

let viewDate = today();

export function render({ profile, go }) {
  const data = pdata();
  if (viewDate > today()) viewDate = today();
  const snap = snapshot(profile, data, viewDate);
  const targets = snap.targets;
  if (!targets) {
    return { title: 'Nutrição', html: '<div class="card">Complete altura e peso no perfil para eu calcular suas metas.</div>' };
  }

  const isTrainingDay = !!dayForWeekday(data.program, weekdayIndex(viewDate))
    || data.sessions.some(s => s.date === viewDate);
  const m = cycledTargets(targets.macros, profile, isTrainingDay);
  const day = nutritionDay(viewDate);
  const totals = dayTotals(day);
  const plan = mealPlan(m, profile.mealsPerDay || 4, isTrainingDay);
  const week = weekNutrition(data, weekDays(weekStart(viewDate)));
  const remaining = {
    kcal: Math.max(0, m.kcal - totals.kcal),
    protein: Math.max(0, m.protein - totals.protein),
    carbs: Math.max(0, m.carbs - totals.carbs),
    fat: Math.max(0, m.fat - totals.fat)
  };
  const ideas = suggestions(remaining, profile);
  const favorites = data.settings.favorites || [];
  const perMeal = proteinPerMealRange(m.protein);

  return {
    title: 'Nutrição',
    subtitle: viewDate === today() ? 'hoje' : formatDate(viewDate),
    html: `
      <div class="row between" style="margin-top:10px">
        <button class="sm ghost" data-dia="-1">← ${formatDate(addDays(viewDate, -1))}</button>
        <b>${viewDate === today() ? 'Hoje' : formatDate(viewDate)}</b>
        <button class="sm ghost" data-dia="1" ${viewDate === today() ? 'disabled' : ''}>${formatDate(addDays(viewDate, 1))} →</button>
      </div>

      <div class="card">
        <div class="card-head">
          <div><div class="eyebrow">Meta do dia</div>
            <h2>${fmt(totals.kcal)} / ${fmt(m.kcal)} kcal</h2>
            ${m.cycle ? `<div class="dim tiny" style="margin-top:4px">${esc(m.cycle)}</div>` : ''}</div>
          <span class="pill ${totals.kcal > m.kcal * 1.08 ? 'warn' : 'good'}">${signed(m.kcal - totals.kcal, 0, ' kcal')}</span></div>
        ${progressBar(totals.kcal, m.kcal, totals.kcal > m.kcal * 1.08 ? 'warn' : '')}
        <div class="grid-3 mt">
          ${macroBox('Proteína', totals.protein, m.protein, 'good')}
          ${macroBox('Carbo', totals.carbs, m.carbs, '')}
          ${macroBox('Gordura', totals.fat, m.fat, '')}
        </div>
        <div class="grid-2 mt">
          ${macroBox('Fibra', totals.fiber, m.fiber, 'good')}
          ${macroBox('Água (ml)', totals.water, m.waterMl, '')}
        </div>
        <div class="row tight mt">
          <button class="sm" data-agua="250">+250 ml</button>
          <button class="sm" data-agua="500">+500 ml</button>
          <button class="sm ghost" data-agua="-250">−250 ml</button>
        </div>
        ${m.cycleNote ? `<div class="dim tiny mt">${esc(m.cycleNote)}</div>` : ''}
        <div class="dim tiny mt">Base: ${esc(targets.energy.method)} · gasto estimado ${fmt(targets.energy.maintenance)} kcal
        ${data.settings.kcalOffset ? ` · ajuste acumulado ${signed(data.settings.kcalOffset, 0, ' kcal')}` : ''}
        ${targets.energy.capped ? ' · meta limitada ao piso de segurança' : ''}</div>
      </div>

      ${favorites.length ? `<div class="card tight">
        <div class="eyebrow mb">Rápido</div>
        <div class="chips">
          ${favorites.slice(0, 8).map(f => `<button class="chip sm" data-fav="${esc(f.id)}">${esc(f.name)} · ${fmt(f.kcal)}</button>`).join('')}
        </div>
        <div class="dim tiny mt">Toque para repetir. Segure a lista em Ajustes para remover.</div>
      </div>` : ''}

      <div class="card">
        <div class="card-head"><div class="eyebrow">Refeições</div>
          <button class="primary sm" data-add>+ Adicionar</button></div>
        ${day.meals.length ? day.meals.map(meal => `
          <div class="list-item">
            <div class="grow">
              <b>${esc(meal.name)}</b>
              <span class="sub">${fmt(meal.kcal)} kcal · P ${fmt(meal.protein, 1)} · C ${fmt(meal.carbs, 1)} · G ${fmt(meal.fat, 1)}</span>
            </div>
            <button class="sm ghost" data-favoritar="${meal.id}" title="Salvar como favorito">★</button>
            <button class="sm ghost" data-remove="${meal.id}">✕</button>
          </div>`).join('')
          : '<p class="muted">Nenhuma refeição registrada. Use o botão acima — a busca já traz os macros prontos.</p>'}
      </div>

      <div class="card">
        <div class="card-head"><div class="eyebrow">Divisão sugerida</div>
          <span class="pill">${profile.mealsPerDay || 4} refeições</span></div>
        ${plan.map(p => `<div class="stat-line">
          <span class="muted">${esc(p.name)}</span>
          <b>${fmt(p.kcal)} kcal · ${fmt(p.protein)} g proteína</b></div>`).join('')}
        <p class="dim tiny mt">O corpo aproveita entre ${perMeal.min} g e ${perMeal.max} g de proteína por refeição para construir músculo — daí a distribuição parecida em vez de tudo numa refeição só.
        ${isTrainingDay ? 'Concentre o carboidrato nas refeições antes e depois do treino: é onde ele rende mais.' : ''}</p>
      </div>

      ${ideas.length ? `<div class="card">
        <div class="card-head"><div><div class="eyebrow">Para fechar o dia</div>
          <h2>Faltam ${fmt(remaining.kcal)} kcal e ${fmt(remaining.protein)} g de proteína</h2></div></div>
        ${ideas.map(i => `<div class="card flat tight">
          <b>${esc(i.label)}</b>
          <div class="dim tiny">${i.items.map(x => `${esc(x.name)} ${x.grams} g`).join(' · ')}</div>
          <div class="muted tiny mt">${fmt(i.total.kcal)} kcal · P ${i.total.protein} · C ${i.total.carbs} · G ${i.total.fat}</div>
          <button class="sm mt" data-ideia="${esc(i.label)}">Registrar isso</button>
        </div>`).join('')}
      </div>` : ''}

      ${adjustmentCard(snap, data)}

      <div class="card">
        <div class="card-head"><div><div class="eyebrow">Suplementos</div>
          <h2>O que vale para o seu objetivo</h2></div></div>
        ${supplementsFor(profile).map(sup => `<div class="card flat tight">
          <div class="row between"><b>${esc(sup.name)}</b><span class="pill">${esc(sup.dose)}</span></div>
          <div class="muted tiny mt">${esc(sup.why)}</div>
          <div class="dim tiny mt">${esc(sup.how)}</div>
          ${sup.note ? `<div class="tiny mt" style="color:var(--warn)">${esc(sup.note)}</div>` : ''}
        </div>`).join('')}
        <p class="dim tiny mt">O que não está nesta lista provavelmente não muda nada. Suplemento resolve, na melhor das hipóteses, os últimos poucos por cento — depois de treino, comida e sono estarem no lugar.</p>
      </div>

      ${week ? `<div class="card">
        <div class="eyebrow">Média da semana</div>
        <div class="stat-line"><span class="muted">Calorias</span><b>${fmt(week.kcal)} kcal em ${week.days} dias</b></div>
        <div class="stat-line"><span class="muted">Proteína</span><b>${fmt(week.protein)} g / dia</b></div>
        <div class="stat-line"><span class="muted">Aderência à meta</span><b>${Math.round((week.kcal / m.kcal) * 100)}%</b></div>
      </div>` : ''}`,

    mount(root) {
      root.querySelectorAll('[data-dia]').forEach(btn => btn.addEventListener('click', () => {
        const next = addDays(viewDate, +btn.dataset.dia);
        if (next > today()) return;
        viewDate = next;
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }));

      root.querySelectorAll('[data-agua]').forEach(btn => btn.addEventListener('click', () => {
        setWater(viewDate, Math.max(0, (day.water || 0) + +btn.dataset.agua));
      }));

      root.querySelector('[data-add]')?.addEventListener('click', () => openFoodSheet(viewDate, plan));

      root.querySelectorAll('[data-fav]').forEach(btn => btn.addEventListener('click', () => {
        const fav = favorites.find(f => f.id === btn.dataset.fav);
        if (!fav) return;
        const { id, ...meal } = fav;
        addMeal(viewDate, meal);
        toast('Refeição repetida.');
      }));

      root.querySelectorAll('[data-favoritar]').forEach(btn => btn.addEventListener('click', () => {
        const meal = day.meals.find(x => x.id === btn.dataset.favoritar);
        if (!meal) return;
        const { id, ts, ...rest } = meal;
        saveFavoriteMeal(rest);
        toast('Salvo nos favoritos.');
      }));

      root.querySelectorAll('[data-ideia]').forEach(btn => btn.addEventListener('click', () => {
        const idea = ideas.find(i => i.label === btn.dataset.ideia);
        if (!idea) return;
        addMeal(viewDate, { name: idea.label, ...idea.total });
        toast('Registrado.');
      }));
      root.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => {
        removeMeal(viewDate, btn.dataset.remove);
      }));

      root.querySelector('[data-aplicar]')?.addEventListener('click', () => {
        const delta = +root.querySelector('[data-aplicar]').dataset.aplicar;
        updateSettings({ kcalOffset: (data.settings.kcalOffset || 0) + delta, lastAdjust: weekStart() });
        toast('Meta calórica ajustada.');
      });
      root.querySelector('[data-zerar-ajuste]')?.addEventListener('click', () => {
        updateSettings({ kcalOffset: 0, lastAdjust: null });
        toast('Ajuste manual zerado.');
      });
    }
  };
}

function macroBox(label, value, target, tone) {
  const pct = target > 0 ? clamp((value / target) * 100, 0, 100) : 0;
  return `<div class="macro">
    <span class="macro-label">${esc(label)}</span>
    <span class="macro-value">${fmt(value)} <i>/ ${fmt(target)}</i></span>
    ${progressBar(pct, 100, tone)}
  </div>`;
}

function adjustmentCard(snap, data) {
  const adj = snap.adjustment;
  const tone = adj.status === 'ok' ? 'good' : adj.status === 'sem_dados' ? '' : 'warn';
  return `<div class="card">
    <div class="eyebrow">Ajuste automático</div>
    ${coach(adj.title, adj.detail, tone)}
    ${adj.deltaKcal ? `<button class="primary block sm" data-aplicar="${adj.deltaKcal}">Aplicar ${signed(adj.deltaKcal, 0, ' kcal/dia')}</button>` : ''}
    ${data.settings.kcalOffset ? `<button class="link" data-zerar-ajuste>Zerar ajuste acumulado (${signed(data.settings.kcalOffset, 0, ' kcal')})</button>` : ''}
    <p class="dim tiny mt">O ajuste compara a média de peso das últimas semanas com o ritmo-alvo do seu objetivo e converte a diferença em calorias (7700 kcal ≈ 1 kg), com limite de 250 kcal por vez.</p>
  </div>`;
}

/* ---------- Registro de refeição ---------- */

function openFoodSheet(date, plan) {
  const state = { food: null, amount: 100, mode: 'g', handSize: 'm', handCount: 1, mealName: plan[0]?.name || 'Refeição' };

  const listHtml = term => searchFoods(term).slice(0, 40).map(f => `
    <button class="block" style="justify-content:space-between;margin:6px 0" data-food="${esc(f.name)}">
      <span style="text-align:left"><b>${esc(f.name)}</b><br><span class="dim tiny">${f.kcal} kcal · P ${f.p} · C ${f.c} · G ${f.f} (100 g)</span></span>
    </button>`).join('');

  sheet(`
    <h2>Adicionar refeição</h2>
    <div id="foodStep">
      ${field('Refeição', `<select name="mealName">${plan.map(p => `<option>${esc(p.name)}</option>`).join('')}<option>Extra</option></select>`)}
      ${field('Buscar alimento', '<input name="q" placeholder="frango, arroz, whey..." autocomplete="off">')}
      <div id="foodList" style="max-height:38vh;overflow:auto">${listHtml('')}</div>
      <button class="ghost block mt" data-prato>🍽 Monte seu prato (sem balança, sem procurar alimento)</button>
      <button class="ghost block" data-manual>Registrar manualmente (kcal e macros)</button>
    </div>`, {
    onMount(sheetEl) {
      const q = sheetEl.querySelector('[name="q"]');
      const list = sheetEl.querySelector('#foodList');
      const mealSelect = sheetEl.querySelector('[name="mealName"]');
      mealSelect.addEventListener('change', () => { state.mealName = mealSelect.value; });

      const bindFoods = () => list.querySelectorAll('[data-food]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.food = FOODS.find(f => f.name === btn.dataset.food);
          state.mode = state.food.unit ? 'unit' : 'g';
          state.amount = state.mode === 'unit' ? 1 : 100;
          renderAmount(sheetEl, state, date);
        });
      });
      bindFoods();

      q.addEventListener('input', () => { list.innerHTML = listHtml(q.value); bindFoods(); });
      sheetEl.querySelector('[data-manual]').addEventListener('click', () => renderManual(sheetEl, state, date));
      sheetEl.querySelector('[data-prato]').addEventListener('click', () => renderPlate(sheetEl, state, date));
    }
  });
}

function renderAmount(sheetEl, state, date) {
  const f = state.food;
  const hand = handRef(f);
  const step = sheetEl.querySelector('#foodStep');

  const currentPortion = () => {
    if (state.mode === 'hand') return handPortion(f, state.handSize, state.handCount);
    return portion(f, state.amount, state.mode === 'unit');
  };

  const amountField = () => {
    if (state.mode === 'hand') {
      const size = HAND_SIZES.find(s => s.id === state.handSize) || HAND_SIZES[1];
      return `
        ${field(`Tamanho da porção (${esc(hand.label)})`, `<div class="chips">
          ${HAND_SIZES.map(s => `<button type="button" class="chip sm ${s.id === state.handSize ? 'on' : ''}" data-hand-size="${s.id}">${esc(s.label)}</button>`).join('')}
        </div>`)}
        ${field('Quantas', `<div class="row tight">
          <button type="button" class="sm ghost" data-hand-count="-1">−</button>
          <b style="min-width:24px;text-align:center">${state.handCount}</b>
          <button type="button" class="sm ghost" data-hand-count="1">+</button>
        </div>`)}
        <p class="dim tiny">1 porção ≈ ${Math.round(hand.grams * size.mult)} g — ${esc(hand.ref)}.</p>`;
    }
    if (state.mode === 'unit') {
      return field(`Quantidade (${esc(f.unit.label)})`,
        `<input type="number" inputmode="decimal" name="amount" value="${state.amount}" step="0.5" min="0">`);
    }
    return field('Quantidade (g)', `<input type="number" inputmode="decimal" name="amount" value="${state.amount}" step="10" min="0">`);
  };

  const draw = () => {
    const p = currentPortion();
    step.innerHTML = `
      <button class="link" data-voltar>← trocar alimento</button>
      <h3>${esc(f.name)}</h3>
      <div class="chips mb">
        ${f.unit ? `<button class="chip sm ${state.mode === 'unit' ? 'on' : ''}" data-modo="unit">${esc(f.unit.label)}</button>` : ''}
        <button class="chip sm ${state.mode === 'g' ? 'on' : ''}" data-modo="g">gramas</button>
        <button class="chip sm ${state.mode === 'hand' ? 'on' : ''}" data-modo="hand">sem balança</button>
      </div>
      ${amountField()}
      <div class="metrics mb">
        <div class="metric"><b>${p.kcal}</b><span>kcal</span></div>
        <div class="metric"><b>${p.protein}</b><span>proteína</span></div>
        <div class="metric"><b>${p.carbs}</b><span>carbo</span></div>
      </div>
      <button class="primary block" data-confirmar>Adicionar em ${esc(state.mealName)}</button>`;

    step.querySelector('[data-voltar]').addEventListener('click', () => { closeSheet(); });
    step.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => {
      state.mode = b.dataset.modo;
      if (state.mode === 'unit') state.amount = 1;
      if (state.mode === 'g') state.amount = 100;
      draw();
    }));
    step.querySelector('[name="amount"]')?.addEventListener('input', e => {
      state.amount = num(e.target.value) ?? 0;
      const np = currentPortion();
      const metrics = step.querySelectorAll('.metric b');
      metrics[0].textContent = np.kcal;
      metrics[1].textContent = np.protein;
      metrics[2].textContent = np.carbs;
    });
    step.querySelectorAll('[data-hand-size]').forEach(b => b.addEventListener('click', () => {
      state.handSize = b.dataset.handSize;
      draw();
    }));
    step.querySelectorAll('[data-hand-count]').forEach(b => b.addEventListener('click', () => {
      state.handCount = Math.max(1, Math.min(8, state.handCount + (+b.dataset.handCount)));
      draw();
    }));
    step.querySelector('[data-confirmar]').addEventListener('click', () => {
      const final = currentPortion();
      const desc = state.mode === 'unit' ? `${state.amount} ${f.unit.label}`
        : state.mode === 'hand' ? `${final.count} ${final.size.label.toLowerCase()} ${hand.label}(s) (~${final.grams} g)`
          : `${final.grams} g`;
      addMeal(date, { name: `${state.mealName} · ${f.name} ${desc}`, ...final });
      closeSheet();
      toast('Refeição registrada.');
    });
  };
  draw();
}

/**
 * Monte seu prato: sem escolher um alimento nem pesar nada, só contando
 * porções pela mão por grupo (proteína, carbo, gordura, vegetal). Método de
 * porções pela mão — a própria mão escala com quem come, então serve como
 * régua sem balança.
 */
function renderPlate(sheetEl, state, date) {
  const step = sheetEl.querySelector('#foodStep');
  const counts = { protein: 1, carb: 1, fat: 0, veg: 1 };

  const draw = () => {
    const p = platePortion(counts);
    step.innerHTML = `
      <button class="link" data-voltar>← trocar alimento</button>
      <h3>Monte seu prato</h3>
      <p class="muted">Conte quantas porções de cada grupo têm no prato, usando a mão como régua.</p>
      ${PLATE_GROUPS.map(g => `
        <div class="stat-line">
          <div style="flex:1"><b>${esc(g.label)}</b><div class="dim tiny">1 ${esc(g.unit)} · ${esc(g.hint)}</div></div>
          <div class="row tight">
            <button type="button" class="sm ghost" data-plate="${g.id}:-1">−</button>
            <b style="min-width:20px;text-align:center">${counts[g.id]}</b>
            <button type="button" class="sm ghost" data-plate="${g.id}:1">+</button>
          </div>
        </div>`).join('')}
      <div class="metrics mb mt">
        <div class="metric"><b>${p.kcal}</b><span>kcal</span></div>
        <div class="metric"><b>${p.protein}</b><span>proteína</span></div>
        <div class="metric"><b>${p.carbs}</b><span>carbo</span></div>
      </div>
      <button class="primary block" data-confirmar>Adicionar em ${esc(state.mealName)}</button>`;

    step.querySelector('[data-voltar]').addEventListener('click', () => { closeSheet(); });
    step.querySelectorAll('[data-plate]').forEach(b => b.addEventListener('click', () => {
      const [id, delta] = b.dataset.plate.split(':');
      counts[id] = Math.max(0, Math.min(8, counts[id] + (+delta)));
      draw();
    }));
    step.querySelector('[data-confirmar]').addEventListener('click', () => {
      const final = platePortion(counts);
      if (!final.kcal) return toast('Adicione ao menos uma porção.');
      const desc = PLATE_GROUPS.filter(g => counts[g.id] > 0).map(g => `${counts[g.id]}× ${g.label.toLowerCase()}`).join(' · ');
      addMeal(date, { name: `${state.mealName} · ${desc}`, ...final });
      closeSheet();
      toast('Refeição registrada.');
    });
  };
  draw();
}

function renderManual(sheetEl, state, date) {
  const step = sheetEl.querySelector('#foodStep');
  step.innerHTML = `
    <h3>Registro manual</h3>
    ${field('Descrição', `<input name="name" placeholder="Marmita do almoço" value="${esc(state.mealName)}">`)}
    <div class="grid-2">
      ${field('Calorias', '<input type="number" inputmode="numeric" name="kcal" placeholder="600">')}
      ${field('Proteína (g)', '<input type="number" inputmode="decimal" name="protein" placeholder="40">')}
    </div>
    <div class="grid-2">
      ${field('Carboidrato (g)', '<input type="number" inputmode="decimal" name="carbs" placeholder="60">')}
      ${field('Gordura (g)', '<input type="number" inputmode="decimal" name="fat" placeholder="18">')}
    </div>
    ${field('Fibra (g) — opcional', '<input type="number" inputmode="decimal" name="fiber" placeholder="6">')}
    <button class="primary block" data-salvar>Adicionar</button>`;

  step.querySelector('[data-salvar]').addEventListener('click', () => {
    const get = n => num(step.querySelector(`[name="${n}"]`).value) ?? 0;
    const name = step.querySelector('[name="name"]').value.trim() || 'Refeição';
    let kcal = get('kcal');
    const protein = get('protein'), carbs = get('carbs'), fat = get('fat');
    if (!kcal) kcal = Math.round(protein * 4 + carbs * 4 + fat * 9);
    if (!kcal) return toast('Informe as calorias ou os macros.');
    addMeal(date, { name, kcal, protein, carbs, fat, fiber: get('fiber') });
    closeSheet();
    toast('Refeição registrada.');
  });
}
