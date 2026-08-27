// Criação de perfil em etapas. Cada resposta muda de verdade o que o app calcula.

import { esc, clamp, toast, num } from '../core/util.js';
import { createProfile, setProgram, profiles, hasLegacyData, importLegacyInto } from '../core/store.js';
import { generateProgram } from '../engine/program.js';
import { ACTIVITY_LABEL, GOAL_LABEL, calorieTarget, macros } from '../engine/energy.js';
import { EQUIPMENT_LABEL } from '../data/exercises.js';
import { field, selectHtml, numberInput } from '../ui.js';
import { WEEKDAYS_SHORT } from '../core/util.js';

const COLORS = ['#6ea8fe', '#3ddc97', '#ffc65c', '#b18cff', '#ff7a6e', '#4fd1d9'];

const draft = {
  name: '', color: COLORS[0], sex: 'M', age: 30,
  heightCm: null, weightKg: null, bodyFat: null, targetWeightKg: null,
  goal: 'hipertrofia', experience: 'iniciante',
  daysPerWeek: 4, sessionMin: 60, equipment: 'academia_completa', preferredDays: null,
  activityLevel: 'leve', cardioLevel: 'pouco',
  dietPreference: 'onivoro', mealsPerDay: 4,
  dislikes: []
};

let step = 0;

const STEPS = [
  {
    title: 'Quem é você?',
    subtitle: 'O nome aparece na tela de escolha de perfil.',
    html: () => `
      ${field('Nome', `<input name="name" value="${esc(draft.name)}" placeholder="Ex.: Mateus" autocomplete="off">`)}
      ${field('Cor do perfil', `<div class="chips" data-colors>${COLORS.map(c => `
        <button type="button" class="chip ${draft.color === c ? 'on' : ''}" data-color="${c}" style="background:${draft.color === c ? c : ''};border-color:${c}">
          <span style="width:14px;height:14px;border-radius:50%;background:${c};display:inline-block"></span>
        </button>`).join('')}</div>`)}
      <div class="grid-2">
        ${field('Sexo biológico', selectHtml('sex', [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }], draft.sex), 'Usado só no cálculo do gasto energético.')}
        ${field('Idade', numberInput('age', draft.age, { min: 10, max: 100, step: 1 }))}
      </div>`
  },
  {
    title: 'Seu corpo hoje',
    subtitle: 'Ponto de partida dos cálculos. Dá para atualizar quando quiser.',
    html: () => `
      <div class="grid-2">
        ${field('Altura (cm)', numberInput('heightCm', draft.heightCm, { min: 120, max: 230, step: 1, placeholder: '175' }))}
        ${field('Peso (kg)', numberInput('weightKg', draft.weightKg, { min: 30, max: 250, step: 0.1, placeholder: '80' }))}
      </div>
      <div class="grid-2">
        ${field('Peso desejado (kg)', numberInput('targetWeightKg', draft.targetWeightKg, { min: 30, max: 250, step: 0.1, placeholder: 'opcional' }))}
        ${field('% de gordura', numberInput('bodyFat', draft.bodyFat, { min: 3, max: 60, step: 0.1, placeholder: 'opcional' }), 'Se a balança de bioimpedância informar, o cálculo fica mais preciso.')}
      </div>`
  },
  {
    title: 'Qual é o objetivo?',
    subtitle: 'Define calorias, volume de treino e prescrição de cardio.',
    html: () => `
      ${field('Objetivo principal', `<div class="chips" data-goal>${Object.entries(GOAL_LABEL).map(([k, v]) =>
        `<button type="button" class="chip ${draft.goal === k ? 'on' : ''}" data-value="${k}">${esc(v)}</button>`).join('')}</div>`)}
      ${field('Experiência com musculação', `<div class="chips" data-experience>${[
        ['iniciante', 'Iniciante — até 1 ano'],
        ['intermediario', 'Intermediário — 1 a 3 anos'],
        ['avancado', 'Avançado — 3+ anos']
      ].map(([k, v]) => `<button type="button" class="chip ${draft.experience === k ? 'on' : ''}" data-value="${k}">${esc(v)}</button>`).join('')}</div>`,
      'Iniciante progride mais rápido e precisa de menos volume para o mesmo resultado.')}`
  },
  {
    title: 'Sua rotina de treino',
    subtitle: 'Com isso eu monto o split e escolho os exercícios.',
    html: () => `
      ${field('Dias de treino por semana', `<div class="chips" data-days>${[2, 3, 4, 5, 6].map(n =>
        `<button type="button" class="chip ${draft.daysPerWeek === n ? 'on' : ''}" data-value="${n}">${n}x</button>`).join('')}</div>`)}
      ${field('Tempo por sessão', `<div class="chips" data-session>${[30, 45, 60, 75, 90].map(n =>
        `<button type="button" class="chip ${draft.sessionMin === n ? 'on' : ''}" data-value="${n}">${n} min</button>`).join('')}</div>`)}
      ${field('Onde treina', selectHtml('equipment', Object.entries(EQUIPMENT_LABEL).map(([value, label]) => ({ value, label })), draft.equipment))}
      ${field('Dias preferidos (opcional)', `<div class="chips" data-weekdays>${WEEKDAYS_SHORT.map((d, i) =>
        `<button type="button" class="chip sm ${draft.preferredDays?.includes(i) ? 'on' : ''}" data-value="${i}">${d}</button>`).join('')}</div>`,
      'Deixe em branco para eu distribuir com o descanso certo entre as sessões.')}`
  },
  {
    title: 'Vida fora do treino',
    subtitle: 'Rotina e alimentação entram direto na conta das calorias.',
    html: () => `
      ${field('Nível de atividade no dia a dia', selectHtml('activityLevel', Object.entries(ACTIVITY_LABEL).map(([value, label]) => ({ value, label })), draft.activityLevel))}
      ${field('Cardio que você já faz hoje', `<div class="chips" data-cardio>${[
        ['nenhum', 'Nenhum'], ['pouco', 'Às vezes'], ['regular', 'Regular'], ['alto', 'Bastante']
      ].map(([k, v]) => `<button type="button" class="chip ${draft.cardioLevel === k ? 'on' : ''}" data-value="${k}">${esc(v)}</button>`).join('')}</div>`)}
      ${field('Preferência alimentar', selectHtml('dietPreference', [
        { value: 'onivoro', label: 'Sem restrição' },
        { value: 'vegetariano', label: 'Vegetariano' },
        { value: 'vegano', label: 'Vegano' },
        { value: 'low_carb', label: 'Low carb' },
        { value: 'sem_lactose', label: 'Sem lactose' }
      ], draft.dietPreference))}
      ${field('Refeições por dia', `<div class="chips" data-meals>${[2, 3, 4, 5, 6].map(n =>
        `<button type="button" class="chip ${draft.mealsPerDay === n ? 'on' : ''}" data-value="${n}">${n}</button>`).join('')}</div>`)}`
  }
];

export function render({ go }) {
  const s = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return {
    title: 'Novo perfil',
    html: `
      <div style="padding:calc(24px + env(safe-area-inset-top,0px)) 0 0">
        <div class="row between">
          <button class="link" data-back>${isFirst ? (profiles().length ? '← Perfis' : '') : '← Voltar'}</button>
          <span class="dim">Passo ${step + 1} de ${STEPS.length}</span>
        </div>
        <div class="steps">${STEPS.map((_, i) => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}</div>
        <h1>${esc(s.title)}</h1>
        <p class="muted">${esc(s.subtitle)}</p>
      </div>
      <form id="stepForm" class="mt" autocomplete="off">${s.html()}</form>
      <button class="primary block mt" data-next>${isLast ? 'Criar perfil e montar programa' : 'Continuar'}</button>
      ${isLast ? '<p class="dim tiny mt" style="text-align:center">Você pode ajustar tudo depois em Ajustes.</p>' : ''}`,

    mount(root) {
      const form = root.querySelector('#stepForm');

      // Campos de texto/numéricos
      form.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', () => {
          const value = el.type === 'number' ? num(el.value) : el.value;
          draft[el.name] = value;
        });
      });

      // Grupos de chips
      const chipGroups = {
        colors: 'color', goal: 'goal', experience: 'experience',
        days: 'daysPerWeek', session: 'sessionMin', cardio: 'cardioLevel', meals: 'mealsPerDay'
      };
      for (const [attr, key] of Object.entries(chipGroups)) {
        const group = form.querySelector(`[data-${attr}]`);
        if (!group) continue;
        group.addEventListener('click', e => {
          const btn = e.target.closest('button');
          if (!btn) return;
          const raw = btn.dataset.value ?? btn.dataset.color;
          draft[key] = /^\d+$/.test(raw) ? +raw : raw;
          group.querySelectorAll('button').forEach(b => {
            const on = b === btn;
            b.classList.toggle('on', on);
            if (b.dataset.color) b.style.background = on ? b.dataset.color : '';
          });
        });
      }

      // Dias da semana (múltipla escolha)
      const weekdays = form.querySelector('[data-weekdays]');
      weekdays?.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        btn.classList.toggle('on');
        draft.preferredDays = [...weekdays.querySelectorAll('button.on')].map(b => +b.dataset.value);
        if (!draft.preferredDays.length) draft.preferredDays = null;
      });

      root.querySelector('[data-back]')?.addEventListener('click', () => {
        if (step === 0) return profiles().length ? go('/perfis') : null;
        step--;
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });

      root.querySelector('[data-next]').addEventListener('click', () => {
        const problem = validate(step);
        if (problem) return toast(problem);
        if (step < STEPS.length - 1) {
          step++;
          window.dispatchEvent(new HashChangeEvent('hashchange'));
          return;
        }
        finish(go);
      });
    }
  };
}

function validate(index) {
  if (index === 0) {
    if (!draft.name.trim()) return 'Coloque um nome para o perfil.';
    if (!draft.age || draft.age < 10 || draft.age > 100) return 'Informe uma idade válida.';
  }
  if (index === 1) {
    if (!draft.heightCm || draft.heightCm < 120) return 'Informe a altura em centímetros.';
    if (!draft.weightKg || draft.weightKg < 30) return 'Informe o peso atual.';
  }
  if (index === 3) {
    if (draft.preferredDays && draft.preferredDays.length !== draft.daysPerWeek) {
      return `Escolha exatamente ${draft.daysPerWeek} dias ou deixe todos desmarcados.`;
    }
  }
  return null;
}

function finish(go) {
  const profile = createProfile({
    name: draft.name.trim(),
    color: draft.color,
    sex: draft.sex,
    age: clamp(draft.age || 30, 10, 100),
    heightCm: draft.heightCm,
    weightKg: draft.weightKg,
    bodyFat: draft.bodyFat,
    targetWeightKg: draft.targetWeightKg,
    goal: draft.goal,
    experience: draft.experience,
    daysPerWeek: draft.daysPerWeek,
    sessionMin: draft.sessionMin,
    equipment: draft.equipment,
    preferredDays: draft.preferredDays,
    activityLevel: draft.activityLevel,
    cardioLevel: draft.cardioLevel,
    dietPreference: draft.dietPreference,
    mealsPerDay: draft.mealsPerDay,
    dislikes: []
  });

  setProgram(generateProgram(profile));

  // Traz o histórico do app anterior para o primeiro perfil criado.
  if (hasLegacyData() && profiles().length === 1) {
    const imported = importLegacyInto(profile.id);
    if (imported) toast(`${imported} treinos do app anterior importados.`);
  }

  step = 0;
  Object.assign(draft, { name: '', heightCm: null, weightKg: null, bodyFat: null, targetWeightKg: null, preferredDays: null });
  go('/hoje');
}
