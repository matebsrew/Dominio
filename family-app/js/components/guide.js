// Guia de execução: movimento em 3 quadros + atlas anatômico, lado a lado.
// A ideia é ver ao mesmo tempo COMO mover o corpo e ONDE deveria sentir.

import { esc } from '../core/util.js';
import { BY_ID, movementFrames, alternatives } from '../data/exercises.js';
import { atlasFor, muscleLabel } from '../data/muscles.js';

export function guideHtml(exerciseId) {
  const ex = BY_ID[exerciseId];
  if (!ex) return '';
  const frames = movementFrames(ex.slug);
  const atlas = atlasFor(ex.primary);
  const labels = ['INÍCIO', 'MEIO', 'FINAL'];

  return `<div class="guide hidden" data-guide="${esc(exerciseId)}">
    <div class="guide-grid">
      <div class="guide-panel" data-movement>
        <div class="guide-panel-title">MOVIMENTO · INÍCIO → MEIO → FINAL</div>
        <div class="frames">
          ${frames.length
            ? frames.map((src, i) => `<div class="frame">
                <img loading="lazy" decoding="async" src="${src}" alt="${esc(ex.name)} — quadro ${i + 1}">
                <span>${labels[i]}</span></div>`).join('')
            : `<div class="fallback" style="grid-column:1/-1">Sequência visual não cadastrada para este exercício.</div>`}
        </div>
      </div>
      <div class="guide-panel">
        <div class="guide-panel-title">ONDE SENTIR · ATLAS</div>
        <div class="atlas">
          ${atlas
            ? `<img loading="lazy" decoding="async" src="${atlas}" alt="Atlas anatômico — ${esc(muscleLabel(ex.primary))}">`
            : `<div class="fallback">Músculo-alvo: <b>${esc(muscleLabel(ex.primary))}</b></div>`}
        </div>
      </div>
    </div>
    <div class="guide-text">
      <h4>Onde você deve sentir</h4>
      <div>${esc(ex.feel)}</div>
      <h4>Posição inicial</h4>
      <div>${esc(ex.setup)}</div>
      <h4>Execução</h4>
      <div>${esc(ex.exec)}</div>
      <h4>Evite</h4>
      <div class="avoid">${esc(ex.avoid)}</div>
      <span class="guide-credit">Sequência do movimento: Workout Guide (Bryl Lim), arte derivada de Everkinetic — CC BY-SA 4.0.
      Atlas anatômico: Wikimedia Commons, conforme a licença de cada arquivo.</span>
    </div>
  </div>`;
}

// Esconde o painel de movimento se as imagens não carregarem.
export function bindGuides(root) {
  root.querySelectorAll('[data-guide] .frame img').forEach(img => {
    img.addEventListener('error', () => {
      const panel = img.closest('[data-movement]');
      img.closest('.frame')?.remove();
      if (panel && !panel.querySelector('.frame')) {
        panel.querySelector('.frames').innerHTML = '<div class="fallback" style="grid-column:1/-1">Sequência visual indisponível agora (sem internet?). O texto abaixo cobre a execução.</div>';
      }
    });
  });
  root.querySelectorAll('[data-guide] .atlas img').forEach(img => {
    img.addEventListener('error', () => {
      img.closest('.atlas').innerHTML = '<div class="fallback">Imagem do atlas indisponível offline.</div>';
    });
  });
  root.querySelectorAll('[data-toggle-guide]').forEach(btn => {
    btn.addEventListener('click', () => {
      const guide = root.querySelector(`[data-guide="${btn.dataset.toggleGuide}"]`);
      if (!guide) return;
      const closed = guide.classList.toggle('hidden');
      btn.textContent = closed ? '📘 Como executar' : '✕ Fechar guia';
    });
  });
}

export function alternativesHtml(exerciseId, equipment) {
  const alts = alternatives(exerciseId, equipment);
  if (!alts.length) return '';
  return `<div class="chips mt">${alts.map(a =>
    `<button type="button" class="chip sm" data-swap="${esc(a.id)}">${esc(a.name)}</button>`).join('')}</div>`;
}
