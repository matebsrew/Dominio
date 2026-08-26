// Utilitários gerais: DOM, datas, números e gráficos.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function round(n, step = 1) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n / step) * step;
}

export function num(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export const mean = arr => {
  const list = arr.filter(Number.isFinite);
  return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
};

export const sum = arr => arr.filter(Number.isFinite).reduce((a, b) => a + b, 0);

// Média móvel exponencial — usada para suavizar o peso corporal diário.
export function ewma(values, alpha = 0.25) {
  const list = values.filter(Number.isFinite);
  if (!list.length) return null;
  return list.reduce((acc, v, i) => (i === 0 ? v : alpha * v + (1 - alpha) * acc), 0);
}

// Regressão linear simples: retorna inclinação por unidade de x.
export function slope(points) {
  const pts = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (pts.length < 2) return null;
  const mx = mean(pts.map(p => p.x));
  const my = mean(pts.map(p => p.y));
  let num = 0, den = 0;
  for (const p of pts) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) ** 2;
  }
  return den === 0 ? null : num / den;
}

/* ---------- Datas (tudo em chave YYYY-MM-DD no fuso local) ---------- */

export function dateKey(d = new Date()) {
  const dt = d instanceof Date ? d : new Date(d);
  const off = dt.getTimezoneOffset() * 60000;
  return new Date(dt.getTime() - off).toISOString().slice(0, 10);
}

export const today = () => dateKey();

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, days) {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

export function daysBetween(a, b) {
  return Math.round((fromKey(b) - fromKey(a)) / 86400000);
}

// Semana começa na segunda-feira.
export function weekStart(key = today()) {
  const d = fromKey(key);
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return dateKey(d);
}

export function weekDays(startKey) {
  return Array.from({ length: 7 }, (_, i) => addDays(startKey, i));
}

export const WEEKDAYS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
export const WEEKDAYS_SHORT = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

export function weekdayIndex(key) {
  return (fromKey(key).getDay() + 6) % 7;
}

export function formatDate(key) {
  const d = fromKey(key);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function formatLongDate(key) {
  const d = fromKey(key);
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function relativeDay(key) {
  const diff = daysBetween(key, today());
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7) return `há ${diff} dias`;
  if (diff < 30) return `há ${Math.round(diff / 7)} sem`;
  return formatDate(key);
}

/* ---------- Formatação ---------- */

export function fmt(n, digits = 0) {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function kg(n, digits = 1) {
  return Number.isFinite(n) ? `${fmt(n, digits)} kg` : '—';
}

export function signed(n, digits = 0, unit = '') {
  if (!Number.isFinite(n)) return '—';
  const s = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${s}${fmt(Math.abs(n), digits)}${unit}`;
}

export function minutesLabel(min) {
  if (!Number.isFinite(min)) return '—';
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/* ---------- Gráficos leves em SVG ---------- */

export function sparkline(values, opts = {}) {
  const { width = 300, height = 70, stroke = 'var(--accent)', fill = true, band = null } = opts;
  const pts = values.map((v, i) => ({ x: i, y: v })).filter(p => Number.isFinite(p.y));
  if (pts.length < 2) return `<div class="chart-empty">Poucos dados para o gráfico</div>`;
  const ys = pts.map(p => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (band) { min = Math.min(min, band[0]); max = Math.max(max, band[1]); }
  const pad = (max - min) * 0.15 || 1;
  min -= pad; max += pad;
  const sx = i => (i / (values.length - 1)) * (width - 8) + 4;
  const sy = v => height - 6 - ((v - min) / (max - min)) * (height - 12);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const area = fill
    ? `<path d="${line} L${sx(pts.at(-1).x).toFixed(1)},${height} L${sx(pts[0].x).toFixed(1)},${height} Z" fill="url(#sparkFill)" opacity=".28"/>`
    : '';
  const bandRect = band
    ? `<rect x="0" y="${sy(band[1]).toFixed(1)}" width="${width}" height="${Math.max(1, sy(band[0]) - sy(band[1])).toFixed(1)}" fill="var(--good)" opacity=".12"/>`
    : '';
  const last = pts.at(-1);
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-hidden="true">
    <defs><linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${stroke}"/><stop offset="100%" stop-color="${stroke}" stop-opacity="0"/>
    </linearGradient></defs>
    ${bandRect}
    ${area}
    <path d="${line}" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${sx(last.x).toFixed(1)}" cy="${sy(last.y).toFixed(1)}" r="3.4" fill="${stroke}"/>
  </svg>`;
}

export function bars(items, opts = {}) {
  const { max = null } = opts;
  const top = max ?? Math.max(1, ...items.map(i => Math.max(i.value, i.target?.[1] ?? 0)));
  return `<div class="bars">${items.map(i => {
    const pct = clamp((i.value / top) * 100, 0, 100);
    const range = i.target
      ? `<span class="bar-range" style="left:${clamp((i.target[0] / top) * 100, 0, 100)}%;width:${clamp(((i.target[1] - i.target[0]) / top) * 100, 0, 100)}%"></span>`
      : '';
    return `<div class="bar-row">
      <span class="bar-label">${esc(i.label)}</span>
      <span class="bar-track">${range}<span class="bar-fill ${i.tone || ''}" style="width:${pct}%"></span></span>
      <span class="bar-value">${esc(i.valueLabel ?? i.value)}</span>
    </div>`;
  }).join('')}</div>`;
}

export function ring(pct, label, sub, tone = 'accent') {
  const p = clamp(pct, 0, 100);
  const r = 26, c = 2 * Math.PI * r;
  return `<div class="ring">
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="${r}" class="ring-bg"/>
      <circle cx="32" cy="32" r="${r}" class="ring-fg ${tone}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p / 100)).toFixed(1)}"/>
    </svg>
    <div class="ring-text"><b>${esc(label)}</b><span>${esc(sub ?? '')}</span></div>
  </div>`;
}

export function toast(message) {
  let box = $('#toast');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toast';
    document.body.appendChild(box);
  }
  box.textContent = message;
  box.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => box.classList.remove('show'), 2600);
}

export function download(filename, content, type = 'application/json') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
