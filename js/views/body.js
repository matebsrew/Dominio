// Corpo: peso, bioimpedância e medidas — a base de todo o ajuste automático.

import { esc, fmt, kg, num, toast, today, formatDate, sparkline, relativeDay } from '../core/util.js';
import { pdata, saveBody } from '../core/store.js';
import { trend, weeklyWeights, bodyCompositionInsight, fmtRate, projection } from '../engine/adaptive.js';
import { bmiInfo, targetRateKg, GOAL_LABEL } from '../engine/energy.js';
import { coach, field, metric, sheet, closeSheet } from '../ui.js';

export function render({ profile }) {
  const data = pdata();
  const log = data.body || [];
  const t = trend(log, 8);
  const latest = log.find(b => Number.isFinite(b.weight));
  const todayEntry = log.find(b => b.date === today());
  const comp = bodyCompositionInsight(log);
  const bmi = bmiInfo(latest?.weight ?? profile.weightKg, profile.heightCm);
  const want = targetRateKg(profile, latest?.weight ?? profile.weightKg);
  const proj = projection(t.lastAvg, profile.targetWeightKg, t.ratePerWeek);

  return {
    title: 'Corpo',
    subtitle: latest ? `última pesagem ${relativeDay(latest.date)}` : 'sem registros',
    html: `
      <div class="card">
        <div class="card-head"><div><div class="eyebrow">Registro de hoje</div>
          <h2>${todayEntry?.weight ? kg(todayEntry.weight) : 'Pesar agora'}</h2></div></div>
        <div class="grid-2">
          ${field('Peso (kg)', `<input type="number" inputmode="decimal" name="weight" step="0.1" value="${todayEntry?.weight ?? ''}" placeholder="${latest?.weight ?? '80,0'}">`)}
          ${field('% de gordura', `<input type="number" inputmode="decimal" name="bodyFat" step="0.1" value="${todayEntry?.bodyFat ?? ''}" placeholder="opcional">`)}
        </div>
        <button class="primary block" data-salvar-peso>Salvar</button>
        <button class="link block" data-mais>Bioimpedância completa e medidas</button>
        <p class="dim tiny">Pese-se sempre nas mesmas condições: de manhã, depois do banheiro, antes de comer ou beber. O que importa é a média da semana, não o número do dia.</p>
      </div>

      ${t.series.length ? `<div class="card">
        <div class="card-head"><div><div class="eyebrow">Tendência</div>
          <h2>${kg(t.lastAvg)}</h2><div class="muted tiny">média das últimas semanas</div></div>
          <span class="pill ${!Number.isFinite(t.ratePerWeek) ? '' : Math.abs(t.ratePerWeek - want) < 0.12 ? 'good' : 'warn'}">${fmtRate(t.ratePerWeek)}</span></div>
        ${sparkline(t.series.map(s => s.avg))}
        <div class="stat-line"><span class="muted">Ritmo desejado (${esc(GOAL_LABEL[profile.goal] || profile.goal)})</span><b>${fmtRate(want)}</b></div>
        ${profile.targetWeightKg ? `<div class="stat-line"><span class="muted">Peso desejado</span><b>${kg(profile.targetWeightKg)}</b></div>` : ''}
        ${proj ? `<div class="stat-line"><span class="muted">Chega lá em</span><b>≈ ${proj.weeks} semanas</b></div>` : ''}
        ${bmi ? `<div class="stat-line"><span class="muted">IMC</span><b>${bmi.bmi} · ${esc(bmi.band)}</b></div>` : ''}
        ${!t.confident ? coach('Poucos dados ainda', 'Com 3 pesagens por semana durante 2 semanas eu passo a ajustar sua alimentação automaticamente.', '') : ''}
      </div>` : ''}

      ${comp ? `<div class="card">
        <div class="eyebrow">Composição corporal</div>
        <div class="metrics mt">
          ${metric(`${comp.leanDelta > 0 ? '+' : ''}${comp.leanDelta} kg`, 'massa magra')}
          ${metric(`${comp.fatDelta > 0 ? '+' : ''}${comp.fatDelta} kg`, 'massa gorda')}
          ${metric(`${comp.bodyFatDelta > 0 ? '+' : ''}${comp.bodyFatDelta} p.p.`, '% de gordura')}
        </div>
        ${coach(compTitle(comp), compMessage(comp, profile), compTone(comp, profile))}
        <p class="dim tiny">Comparação entre ${formatDate(comp.from)} e ${formatDate(comp.to)}. Bioimpedância de balança tem margem de erro grande em valores absolutos — o que vale é a direção ao longo de semanas, medindo sempre no mesmo horário e estado de hidratação.</p>
      </div>` : ''}

      <div class="card">
        <div class="eyebrow">Histórico</div>
        ${log.length ? log.slice(0, 25).map(b => `<div class="list-item">
          <div class="grow"><b>${b.weight ? kg(b.weight) : '—'}</b>
            <span class="sub">${formatDate(b.date)}${b.bodyFat ? ` · ${b.bodyFat}% gordura` : ''}${b.waist ? ` · cintura ${b.waist} cm` : ''}</span></div>
        </div>`).join('') : '<p class="muted">Nenhuma pesagem registrada ainda.</p>'}
      </div>

      ${weeklyTable(weeklyWeights(log, 8))}`,

    mount(root) {
      root.querySelector('[data-salvar-peso]').addEventListener('click', () => {
        const weight = num(root.querySelector('[name="weight"]').value);
        const bodyFat = num(root.querySelector('[name="bodyFat"]').value);
        if (!weight) return toast('Informe o peso.');
        saveBody({ date: today(), weight, bodyFat });
        toast('Registro salvo.');
      });
      root.querySelector('[data-mais]').addEventListener('click', () => openFullSheet(todayEntry));
    }
  };
}

function weeklyTable(series) {
  if (series.length < 2) return '';
  return `<div class="card">
    <div class="eyebrow">Média por semana</div>
    ${[...series].reverse().map(s => `<div class="stat-line">
      <span class="muted">semana de ${formatDate(s.week)}</span>
      <b>${kg(s.avg)} <span class="dim tiny">(${s.count} pesagens)</span></b></div>`).join('')}
  </div>`;
}

function compTitle(comp) {
  if (comp.leanDelta > 0.3 && comp.fatDelta <= 0.2) return 'Ganho de massa magra com gordura controlada';
  if (comp.leanDelta > 0 && comp.fatDelta > 0.5) return 'Ganhando os dois — massa magra e gordura';
  if (comp.leanDelta < -0.3) return 'Perda de massa magra';
  if (comp.fatDelta < -0.3) return 'Perda de gordura';
  return 'Composição estável';
}

function compTone(comp, profile) {
  if (comp.leanDelta < -0.3) return 'bad';
  if (comp.leanDelta > 0.3 && comp.fatDelta <= 0.2) return 'good';
  if (profile.goal === 'emagrecimento' && comp.fatDelta < -0.3) return 'good';
  return 'warn';
}

function compMessage(comp, profile) {
  if (comp.leanDelta < -0.3) {
    return 'Massa magra caindo é sinal de proteína baixa, déficit agressivo demais ou pouco estímulo de força. Priorize proteína e mantenha as cargas antes de cortar mais calorias.';
  }
  if (comp.leanDelta > 0.3 && comp.fatDelta <= 0.2) {
    return 'É exatamente o resultado que o superávit controlado deve produzir. Mantenha o ritmo atual de ganho de peso.';
  }
  if (comp.fatDelta > 0.5 && profile.goal === 'hipertrofia') {
    return 'A gordura está subindo mais rápido que o desejável. Reduza o excedente calórico em torno de 150 kcal e reavalie em duas semanas.';
  }
  if (profile.goal === 'emagrecimento' && comp.fatDelta < -0.3) {
    return 'Perdendo gordura e preservando massa magra — o objetivo do déficit bem conduzido. Siga assim.';
  }
  return 'Variação pequena. Continue medindo nas mesmas condições e reavalie em 3 a 4 semanas.';
}

function openFullSheet(entry) {
  const f = (name, label, placeholder, value) =>
    field(label, `<input type="number" inputmode="decimal" name="${name}" step="0.1" value="${value ?? ''}" placeholder="${placeholder}">`);

  sheet(`
    <h2>Bioimpedância e medidas</h2>
    <p class="muted">Preencha o que sua balança ou fita informar. Tudo é opcional.</p>
    <div class="grid-2">
      ${f('weight', 'Peso (kg)', '80,0', entry?.weight)}
      ${f('bodyFat', '% de gordura', '18,0', entry?.bodyFat)}
    </div>
    <div class="grid-2">
      ${f('muscleKg', 'Massa muscular (kg)', '38,0', entry?.muscleKg)}
      ${f('waterPct', '% de água', '55,0', entry?.waterPct)}
    </div>
    <div class="grid-2">
      ${f('visceral', 'Gordura visceral', '7', entry?.visceral)}
      ${f('boneKg', 'Massa óssea (kg)', '3,2', entry?.boneKg)}
    </div>
    <h3 class="mt">Medidas (cm)</h3>
    <div class="grid-2">
      ${f('waist', 'Cintura', '82', entry?.waist)}
      ${f('hip', 'Quadril', '98', entry?.hip)}
    </div>
    <div class="grid-2">
      ${f('chest', 'Peitoral', '104', entry?.chest)}
      ${f('arm', 'Braço', '38', entry?.arm)}
    </div>
    <div class="grid-2">
      ${f('thigh', 'Coxa', '58', entry?.thigh)}
      ${f('calf', 'Panturrilha', '38', entry?.calf)}
    </div>
    <button class="primary block mt" data-salvar>Salvar tudo</button>
    <button class="ghost block" data-close>Cancelar</button>`, {
    onMount(sheetEl) {
      sheetEl.querySelector('[data-salvar]').addEventListener('click', () => {
        const payload = { date: today() };
        sheetEl.querySelectorAll('input[name]').forEach(input => {
          const value = num(input.value);
          if (value !== null) payload[input.name] = value;
        });
        if (Object.keys(payload).length === 1) return toast('Preencha ao menos um campo.');
        saveBody(payload);
        closeSheet();
        toast('Medidas salvas.');
      });
    }
  });
}
