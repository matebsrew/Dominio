// Histórico: sessões, recordes e evolução de volume.

import { esc, fmt, formatDate, relativeDay, weekStart, weekDays, addDays, bars, sparkline, minutesLabel } from '../core/util.js';
import { pdata, deleteSession } from '../core/store.js';
import { describeSets, personalRecords, volumeReport, historyFor, e1rm, streak } from '../engine/progression.js';
import { BY_ID } from '../data/exercises.js';
import { confirmSheet, sheet, closeSheet, metric } from '../ui.js';

export function render({ profile, go }) {
  const data = pdata();
  const sessions = data.sessions || [];
  const prs = personalRecords(sessions);
  const weeks = lastWeeks(sessions, profile, 6);
  const totalSets = sessions.reduce((a, s) => a + s.exercises.reduce((x, e) => x + e.sets.length, 0), 0);

  return {
    title: 'Histórico',
    subtitle: `${sessions.length} sessões · ${fmt(totalSets)} séries`,
    html: `
      <div class="card">
        <div class="metrics">
          ${metric(sessions.length, 'treinos')}
          ${metric(fmt(totalSets), 'séries')}
          ${metric(streak(sessions), 'sequência')}
        </div>
        ${weeks.length > 1 ? `<div class="mt"><div class="eyebrow mb">Séries por semana</div>
          ${sparkline(weeks.map(w => w.sets), { stroke: 'var(--good)' })}
          <div class="row between dim tiny"><span>${formatDate(weeks[0].week)}</span><span>${formatDate(weeks.at(-1).week)}</span></div>
        </div>` : ''}
      </div>

      <div class="card">
        <div class="card-head"><div class="eyebrow">Volume desta semana</div></div>
        ${volumeBars(sessions, profile)}
      </div>

      ${prs.length ? `<div class="card">
        <div class="card-head"><div class="eyebrow">Melhores marcas</div>
          <span class="pill">1RM estimado</span></div>
        ${prs.slice(0, 10).map(pr => `<div class="list-item">
          <div class="grow"><b>${esc(pr.name)}</b>
            <span class="sub">${pr.kg} kg × ${pr.reps}${Number.isFinite(pr.rir) ? ` @ RIR ${pr.rir}` : ''} · ${formatDate(pr.date)}</span></div>
          <b class="nowrap">${Math.round(pr.e1rm)} kg</b>
        </div>`).join('')}
        <p class="dim tiny mt">1RM estimado pela fórmula de Epley considerando as repetições em reserva. Serve para comparar sessões, não para tentar o levantamento máximo.</p>
      </div>` : ''}

      <div class="card">
        <div class="card-head"><div class="eyebrow">Sessões</div></div>
        ${sessions.length ? sessions.slice(0, 40).map(s => {
          const sets = s.exercises.reduce((a, e) => a + e.sets.length, 0);
          return `<div class="list-item" data-sessao="${s.id}" style="cursor:pointer">
            <div class="grow"><b>${esc(s.day || 'Treino')}</b>
              <span class="sub">${formatDate(s.date)} · ${relativeDay(s.date)} · ${s.exercises.length} exercícios · ${sets} séries${s.durationMin ? ` · ${minutesLabel(s.durationMin)}` : ''}${s.deload ? ' · deload' : ''}</span></div>
            <span class="dim">›</span>
          </div>`;
        }).join('') : '<p class="muted">Nenhum treino registrado ainda.</p>'}
      </div>

      ${exerciseProgressCard(sessions)}`,

    mount(root) {
      root.querySelectorAll('[data-sessao]').forEach(item => {
        item.addEventListener('click', () => openSession(data.sessions.find(s => s.id === item.dataset.sessao)));
      });
      root.querySelector('[data-ver-exercicio]')?.addEventListener('change', e => {
        const name = e.target.value;
        const box = root.querySelector('#exProgress');
        box.innerHTML = exerciseProgressHtml(data.sessions, name);
      });
    }
  };
}

function volumeBars(sessions, profile) {
  const report = volumeReport(sessions, profile, weekStart(), BY_ID).filter(r => r.value > 0 || r.mev > 0);
  if (!report.length) return '<p class="muted">Sem séries nesta semana.</p>';
  return bars(report.slice(0, 12).map(r => ({
    label: r.short, value: r.value, valueLabel: `${r.value}`, target: r.mav,
    tone: r.status === 'acima' ? 'bad' : r.status === 'ideal' ? 'good' : r.status === 'minimo' ? 'warn' : ''
  })));
}

function lastWeeks(sessions, profile, n) {
  const out = [];
  let start = weekStart();
  for (let i = n - 1; i >= 0; i--) {
    const week = addDays(start, -7 * i);
    const days = new Set(weekDays(week));
    const inWeek = sessions.filter(s => days.has(s.date));
    out.push({
      week,
      sessions: inWeek.length,
      sets: inWeek.reduce((a, s) => a + s.exercises.reduce((x, e) => x + e.sets.length, 0), 0)
    });
  }
  return out;
}

function exerciseProgressCard(sessions) {
  const names = [...new Set(sessions.flatMap(s => s.exercises.map(e => e.name)))].sort();
  if (!names.length) return '';
  return `<div class="card">
    <div class="eyebrow mb">Evolução por exercício</div>
    <select data-ver-exercicio>${names.map(n => `<option>${esc(n)}</option>`).join('')}</select>
    <div id="exProgress" class="mt">${exerciseProgressHtml(sessions, names[0])}</div>
  </div>`;
}

function exerciseProgressHtml(sessions, name) {
  const h = historyFor(sessions, name).slice(0, 12).reverse();
  if (h.length < 2) return '<p class="muted">Poucos registros deste exercício para mostrar evolução.</p>';
  const values = h.map(x => x.e1rm).filter(Number.isFinite);
  const first = values[0], last = values.at(-1);
  const delta = last - first;
  return `
    ${sparkline(values, { stroke: 'var(--accent)' })}
    <div class="row between tiny dim"><span>${formatDate(h[0].date)}</span><span>${formatDate(h.at(-1).date)}</span></div>
    <div class="stat-line"><span class="muted">1RM estimado</span><b>${Math.round(last)} kg (${delta >= 0 ? '+' : '−'}${Math.abs(Math.round(delta))} kg)</b></div>
    <div class="stat-line"><span class="muted">Última sessão</span><b>${esc(describeSets(h.at(-1).sets))}</b></div>`;
}

function openSession(session) {
  if (!session) return;
  sheet(`
    <h2>${esc(session.day || 'Treino')}</h2>
    <p class="muted">${formatDate(session.date)}${session.durationMin ? ` · ${minutesLabel(session.durationMin)}` : ''}${Number.isFinite(session.readiness) ? ` · prontidão ${session.readiness}/100` : ''}</p>
    ${session.exercises.map(ex => `<div class="card flat tight">
      <b>${esc(ex.name)}</b>
      <div class="muted tiny mt">${esc(describeSets(ex.sets))}</div>
    </div>`).join('')}
    ${session.notes ? `<div class="card flat tight"><div class="eyebrow">Anotação</div><div class="muted">${esc(session.notes)}</div></div>` : ''}
    <button class="danger block mt" data-apagar>Apagar esta sessão</button>
    <button class="ghost block" data-close>Fechar</button>`, {
    onMount(sheetEl) {
      sheetEl.querySelector('[data-apagar]').addEventListener('click', async () => {
        closeSheet();
        const ok = await confirmSheet('Apagar sessão?', 'Este treino sai do histórico e deixa de contar nas sugestões.', 'Apagar');
        if (ok) deleteSession(session.id);
      });
    }
  });
}
