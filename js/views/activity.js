// Cardio e passos — como ferramenta de saúde e apoio ao treino de força.

import { esc, fmt, num, toast, today, weekDays, weekStart, WEEKDAYS, weekdayIndex, minutesLabel, formatDate } from '../core/util.js';
import { pdata, setSteps, addCardio, removeCardio, activityDay } from '../core/store.js';
import { schedule, weeklyTarget, zone2Guide, CARDIO_TYPES, CARDIO_LABEL, weekMinutes, weekSteps } from '../engine/cardio.js';
import { weekMap } from '../engine/program.js';
import { activityKcal } from '../engine/energy.js';
import { coach, progressBar, sheet, closeSheet, field, selectHtml, metric } from '../ui.js';

export function render({ profile }) {
  const data = pdata();
  const days = weekDays(weekStart());
  const map = weekMap(data.program);
  const plan = schedule(profile, map);
  const target = plan.target;
  const doneMin = weekMinutes(data.activity || {}, days);
  const steps = weekSteps(data.activity || {}, days);
  const day = activityDay(today());
  const zone = zone2Guide(profile);
  const todayIdx = weekdayIndex(today());

  return {
    title: 'Cardio e passos',
    subtitle: `${minutesLabel(doneMin)} de ${minutesLabel(target.minutes)} nesta semana`,
    html: `
      <div class="card">
        <div class="card-head"><div><div class="eyebrow">Semana</div><h2>${minutesLabel(doneMin)} de cardio</h2></div>
          <span class="pill ${doneMin >= target.minutes ? 'good' : ''}">meta ${target.minutes} min</span></div>
        ${progressBar(doneMin, target.minutes, doneMin >= target.minutes ? 'good' : '')}
        <div class="metrics mt">
          ${metric(steps.avg ? fmt(steps.avg) : '—', `média de passos (meta ${fmt(target.steps)})`)}
          ${metric(fmt(steps.total), 'passos na semana')}
          ${metric(minutesLabel(target.minutes), 'meta semanal')}
        </div>
        ${coach('Por que essa dose', target.note, '')}
      </div>

      <div class="card">
        <div class="card-head"><div class="eyebrow">Hoje</div><span class="pill">${esc(WEEKDAYS[todayIdx])}</span></div>
        ${field('Passos de hoje', `<input type="number" inputmode="numeric" name="steps" value="${day.steps ?? ''}" placeholder="${fmt(target.steps)}">`)}
        ${day.steps !== null ? progressBar(day.steps, target.steps, day.steps >= target.steps ? 'good' : '') : ''}
        <button class="block mt" data-salvar-passos>Salvar passos</button>
        <div class="mt">
          ${day.cardio.length ? day.cardio.map(c => `<div class="list-item">
            <div class="grow"><b>${esc(CARDIO_LABEL[c.type] || c.type)}</b>
              <span class="sub">${c.minutes} min · ${esc(c.intensity || 'leve')}${c.kcal ? ` · ~${fmt(c.kcal)} kcal` : ''}</span></div>
            <button class="sm ghost" data-remove-cardio="${c.id}">✕</button></div>`).join('')
            : '<p class="muted">Nenhum cardio registrado hoje.</p>'}
        </div>
        <button class="primary block mt" data-add-cardio>+ Registrar cardio</button>
      </div>

      <div class="card">
        <div class="card-head"><div class="eyebrow">Plano da semana</div></div>
        ${plan.sessions.length ? plan.sessions.map(s => `
          <div class="stat-line">
            <div><b>${esc(s.weekday)}</b>
              <div class="dim tiny">${s.minutes} min · zona 2${map[s.day] ? ` · depois de ${esc(map[s.day])}` : ' · dia sem musculação'}</div>
              ${s.warning ? `<div class="tiny" style="color:var(--warn)">${esc(s.warning)}</div>` : ''}
            </div>
            <span class="pill">${s.minutes} min</span>
          </div>`).join('')
          : '<p class="muted">Sem cardio prescrito para o seu perfil atual.</p>'}
        <p class="dim tiny mt">O cardio é distribuído longe dos treinos pesados de perna. Corrida ou bike intensa no dia anterior ao treino inferior atrapalha o desempenho e a adaptação de força — é o chamado efeito interferência.</p>
      </div>

      <div class="card">
        <div class="eyebrow">Zona 2 — como acertar o ritmo</div>
        <div class="stat-line"><span class="muted">Faixa de batimentos</span><b>${zone.zone2[0]}–${zone.zone2[1]} bpm</b></div>
        <div class="stat-line"><span class="muted">FC máxima estimada</span><b>${zone.maxHr} bpm</b></div>
        <p class="muted mt">${esc(zone.talkTest)}</p>
      </div>

      <div class="card">
        <div class="eyebrow">Últimos 7 dias</div>
        ${days.map(d => {
          const a = data.activity?.[d];
          const min = (a?.cardio || []).reduce((acc, c) => acc + (c.minutes || 0), 0);
          return `<div class="stat-line"><span class="muted">${esc(WEEKDAYS[weekdayIndex(d)])} ${formatDate(d)}</span>
            <b>${a?.steps ? `${fmt(a.steps)} passos` : '—'}${min ? ` · ${min} min` : ''}</b></div>`;
        }).join('')}
      </div>`,

    mount(root) {
      root.querySelector('[data-salvar-passos]').addEventListener('click', () => {
        const value = num(root.querySelector('[name="steps"]').value);
        setSteps(today(), value);
        toast('Passos salvos.');
      });
      root.querySelector('[data-add-cardio]').addEventListener('click', () => openCardioSheet(profile));
      root.querySelectorAll('[data-remove-cardio]').forEach(btn =>
        btn.addEventListener('click', () => removeCardio(today(), btn.dataset.removeCardio)));
    }
  };
}

function openCardioSheet(profile) {
  sheet(`
    <h2>Registrar cardio</h2>
    ${field('Tipo', selectHtml('type', CARDIO_TYPES.map(c => ({ value: c.id, label: c.label })), 'caminhada'))}
    ${field('Minutos', '<input type="number" inputmode="numeric" name="minutes" value="25" min="1" max="300">')}
    ${field('Intensidade', selectHtml('intensity', [
      { value: 'leve', label: 'Leve — zona 2, dá para conversar' },
      { value: 'moderada', label: 'Moderada — respiração acelerada' },
      { value: 'intensa', label: 'Intensa — não dá para falar frases' }
    ], 'leve'))}
    <button class="primary block mt" data-salvar>Salvar</button>
    <button class="ghost block" data-close>Cancelar</button>`, {
    onMount(sheetEl) {
      sheetEl.querySelector('[data-salvar]').addEventListener('click', () => {
        const type = sheetEl.querySelector('[name="type"]').value;
        const minutes = num(sheetEl.querySelector('[name="minutes"]').value);
        const intensity = sheetEl.querySelector('[name="intensity"]').value;
        if (!minutes || minutes <= 0) return toast('Informe os minutos.');
        const base = CARDIO_TYPES.find(c => c.id === type);
        const factor = intensity === 'intensa' ? 1.4 : intensity === 'moderada' ? 1.15 : 1;
        const kcal = Math.round(activityKcal(base.met * factor, minutes, profile.weightKg || 70));
        addCardio(today(), { type, minutes, intensity, kcal });
        closeSheet();
        toast(`Cardio registrado (~${kcal} kcal).`);
      });
    }
  });
}
