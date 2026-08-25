// Usa imagem anatômica pronta no Supino Reto e mantém o renderer atual nos demais exercícios.
(function(){
  const css=document.createElement('style');
  css.textContent=`
    .guidePhotoCard{margin:0 0 14px;border-radius:14px;overflow:hidden;background:#f3f4f6;border:1px solid var(--border)}
    .guidePhotoCard img{display:block;width:100%;height:auto;max-height:430px;object-fit:contain;background:#f3f4f6}
    .guidePhotoCaption{padding:8px 10px;color:var(--muted);font-size:11px;text-align:center;background:#0f1728}
    .guideInfoFull{width:100%}
  `;
  document.head.appendChild(css);
})();

guideBlock = function(ex, idx){
  const g = EXERCISE_GUIDES[ex.name];
  if(!g) return '';

  const isSupinoReto = ex.name === 'Supino Reto Máquina ou Barra';

  if(isSupinoReto){
    return `<button type="button" class="guideToggle" onclick="toggleExerciseGuide(${idx})">📘 Como executar</button>
    <div id="exercise-guide-${idx}" class="guideBox hidden">
      <div class="guidePhotoCard">
        <img src="./assets/supino-reto-anatomico.webp?v=9" alt="Demonstração anatômica do supino reto com halteres, mostrando posição inicial e final e músculos trabalhados" loading="lazy">
        <div class="guidePhotoCaption">Demonstração anatômica • posição inicial → posição final</div>
      </div>
      <div class="guideInfoFull">
        <div class="guideFocus">🎯 ${esc(g.focus)}</div>
        <div class="guideLabel">Faça assim</div>
        <ul class="guideList">${g.cues.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
        <div class="guideLabel">Evite</div>
        <ul class="guideList bad">${g.avoid.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
      </div>
    </div>`;
  }

  const visual = (typeof window.exerciseSVG === 'function') ? window.exerciseSVG(g) : movementSvg(g.pose);
  return `<button type="button" class="guideToggle" onclick="toggleExerciseGuide(${idx})">📘 Como executar</button>
  <div id="exercise-guide-${idx}" class="guideBox hidden"><div class="guideGrid">
    <div class="guideArt">${visual}</div>
    <div><div class="guideFocus">🎯 ${esc(g.focus)}</div>
    <div class="guideLabel">Faça assim</div><ul class="guideList">${g.cues.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    <div class="guideLabel">Evite</div><ul class="guideList bad">${g.avoid.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
  </div></div>`;
};
