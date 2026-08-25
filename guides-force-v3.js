// Força o bloco de guia a usar o renderer visual novo.
// Este arquivo é carregado depois de guides.js e guides-visual-v2.js.
guideBlock = function(ex, idx){
  const g = EXERCISE_GUIDES[ex.name];
  if(!g) return '';
  const visual = (typeof window.exerciseSVG === 'function') ? window.exerciseSVG(g) : movementSvg(g.pose);
  return `<button type="button" class="guideToggle" onclick="toggleExerciseGuide(${idx})">📘 Como executar</button>
  <div id="exercise-guide-${idx}" class="guideBox hidden"><div class="guideGrid">
    <div class="guideArt">${visual}</div>
    <div><div class="guideFocus">🎯 ${esc(g.focus)}</div>
    <div class="guideLabel">Faça assim</div><ul class="guideList">${g.cues.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    <div class="guideLabel">Evite</div><ul class="guideList bad">${g.avoid.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
  </div></div>`;
};
