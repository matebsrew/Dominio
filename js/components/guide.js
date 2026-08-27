// Guia de execução: o movimento em três quadros, cada um já com o
// músculo-alvo aceso no corpo ao lado. Uma peça só, não duas.

import { esc } from '../core/util.js';
import { BY_ID, movementFrames, alternatives } from '../data/exercises.js';
import { muscleLabel } from '../data/muscles.js';
import { bodySvg, viewLabel } from '../data/bodymap.js';

const FASES = ['INÍCIO', 'MEIO', 'FINAL'];

export function guideHtml(exerciseId) {
  const ex = BY_ID[exerciseId];
  if (!ex) return '';
  const frames = movementFrames(ex.slug);
  const alvo = muscleLabel(ex.primary);

  const quadros = frames.length
    ? frames.map((src, i) => `
        <figure class="frame">
          <img loading="lazy" decoding="async" src="${src}" alt="${esc(ex.name)} — ${FASES[i].toLowerCase()} do movimento">
          <figcaption>${FASES[i]}</figcaption>
        </figure>`).join('')
    : `<div class="frames-fallback">
         <p>Sequência do movimento indisponível. O atlas e o texto abaixo cobrem a execução.</p>
       </div>`;

  return `<div class="guide hidden" data-guide="${esc(exerciseId)}">
    <div class="guide-head">
      <span class="guide-eyebrow">Movimento</span>
      <span class="guide-target">${esc(alvo)} <i>· vista de ${viewLabel(ex.primary)}</i></span>
    </div>
    <div class="frames">${quadros}</div>

    <div class="guide-atlas">
      <div class="atlas-fig">${bodySvg(ex.primary)}</div>
      <div class="atlas-info">
        <span class="guide-eyebrow">Onde sentir</span>
        <b>${esc(alvo)}</b>
        <p>${esc(ex.feel)}</p>
      </div>
    </div>

    <div class="guide-text">
      <h4>Posição inicial</h4>
      <div>${esc(ex.setup)}</div>
      <h4>Execução</h4>
      <div>${esc(ex.exec)}</div>
      <h4>Evite</h4>
      <div class="avoid">${esc(ex.avoid)}</div>
      <span class="guide-credit">Sequência do movimento: Workout Guide (Bryl Lim), arte derivada de Everkinetic — CC BY-SA 4.0. Atlas anatômico desenhado para este app.</span>
    </div>
  </div>`;
}

// Se um quadro não carregar, ele sai de cena sem deixar buraco.
export function bindGuides(root) {
  root.querySelectorAll('[data-guide] .frame img').forEach(img => {
    img.addEventListener('error', () => {
      const frames = img.closest('.frames');
      img.closest('.frame')?.remove();
      if (frames && !frames.querySelector('.frame')) {
        frames.innerHTML = '<div class="frames-fallback"><p>Sequência do movimento indisponível agora. O texto abaixo cobre a execução.</p></div>';
      }
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
