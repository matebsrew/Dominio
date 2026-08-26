// Componentes compartilhados de interface.

import { esc, $ } from './core/util.js';

export const ICONS = {
  hoje: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
  treino: '<path d="M6 8v8M18 8v8M4 10v4M20 10v4M6 12h12"/>',
  nutricao: '<path d="M5 3v8a3 3 0 0 0 6 0V3M8 11v10"/><path d="M17 3c-1.5 2-2 4-2 6s.5 3 2 3 2-1 2-3-.5-4-2-6ZM17 12v9"/>',
  atividade: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
  corpo: '<circle cx="12" cy="5" r="2.4"/><path d="M12 8v7M8 10l4 1 4-1M9 21l3-6 3 6"/>',
  voltar: '<path d="m15 5-7 7 7 7"/>',
  mais: '<path d="M12 5v14M5 12h14"/>'
};

export function icon(name, size = 21) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

export const TABS = [
  { href: '#/hoje', label: 'Hoje', icon: 'hoje' },
  { href: '#/treino', label: 'Treino', icon: 'treino' },
  { href: '#/nutricao', label: 'Comida', icon: 'nutricao' },
  { href: '#/atividade', label: 'Cardio', icon: 'atividade' },
  { href: '#/corpo', label: 'Corpo', icon: 'corpo' }
];

export function tabbar(current) {
  return `<nav class="tabbar">${TABS.map(t => `
    <a href="${t.href}" class="${current?.startsWith(t.href.slice(1)) ? 'on' : ''}">
      ${icon(t.icon)}<span>${t.label}</span>
    </a>`).join('')}</nav>`;
}

export function avatarHtml(profile, cls = '') {
  const initials = (profile?.name || '?').trim().slice(0, 2).toUpperCase();
  return `<button class="avatar ${cls}" style="background:${profile?.color || '#6ea8fe'}" data-action="trocar-perfil" title="Trocar de perfil">${esc(initials)}</button>`;
}

export function coach(title, message, tone = '') {
  return `<div class="coach ${tone}"><b>${esc(title)}</b>${esc(message)}</div>`;
}

export function metric(value, label) {
  return `<div class="metric"><b>${value}</b><span>${esc(label)}</span></div>`;
}

export function progressBar(value, target, tone = '') {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return `<div class="progress-bar"><span class="${tone}" style="width:${pct.toFixed(1)}%"></span></div>`;
}

export function empty(emoji, title, message, actionHtml = '') {
  return `<div class="empty"><div class="big">${emoji}</div><b>${esc(title)}</b><p class="muted">${esc(message)}</p>${actionHtml}</div>`;
}

/* ---------- Bottom sheet ---------- */

export function sheet(html, { onMount, onClose } = {}) {
  closeSheet();
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.innerHTML = `<div class="sheet"><div class="sheet-grip"></div>${html}</div>`;
  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) { closeSheet(); onClose?.(); }
  });
  backdrop.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { closeSheet(); onClose?.(); }));
  onMount?.(backdrop.querySelector('.sheet'));
  return backdrop;
}

export function closeSheet() {
  document.querySelectorAll('.sheet-backdrop').forEach(el => el.remove());
  document.body.style.overflow = '';
}

export function confirmSheet(title, message, confirmLabel = 'Confirmar') {
  return new Promise(resolve => {
    sheet(`
      <h2>${esc(title)}</h2>
      <p class="muted">${esc(message)}</p>
      <div class="grid-2 mt">
        <button data-close>Cancelar</button>
        <button class="danger" id="sheetConfirm">${esc(confirmLabel)}</button>
      </div>`, {
      onMount(root) {
        root.querySelector('#sheetConfirm').addEventListener('click', () => { closeSheet(); resolve(true); });
      },
      onClose: () => resolve(false)
    });
  });
}

/* ---------- Escala 1–5 ---------- */

export function scaleInput(name, value, scale) {
  return `<div class="scale" data-scale="${name}">
    ${[1, 2, 3, 4, 5].map(n => `<button type="button" data-value="${n}" class="${value === n ? 'on' : ''}">${n}</button>`).join('')}
  </div>
  <div class="scale-legend"><span>${esc(scale[0])}</span><span>${esc(scale[4])}</span></div>`;
}

export function bindScales(root, onChange) {
  root.querySelectorAll('[data-scale]').forEach(group => {
    group.addEventListener('click', e => {
      const btn = e.target.closest('button[data-value]');
      if (!btn) return;
      group.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
      onChange(group.dataset.scale, +btn.dataset.value);
    });
  });
}

/* ---------- Formulário ---------- */

export function field(label, inputHtml, hint = '') {
  return `<div class="field"><label>${esc(label)}</label>${inputHtml}${hint ? `<div class="hint">${esc(hint)}</div>` : ''}</div>`;
}

export function selectHtml(name, options, value) {
  return `<select name="${name}">${options.map(o => {
    const val = o.value ?? o;
    const lbl = o.label ?? o;
    return `<option value="${esc(val)}" ${String(val) === String(value) ? 'selected' : ''}>${esc(lbl)}</option>`;
  }).join('')}</select>`;
}

export function numberInput(name, value, { min, max, step = 'any', placeholder = '', unit = '' } = {}) {
  return `<input type="number" inputmode="decimal" name="${name}" value="${value ?? ''}"
    ${min !== undefined ? `min="${min}"` : ''} ${max !== undefined ? `max="${max}"` : ''}
    step="${step}" placeholder="${esc(placeholder || unit)}">`;
}
