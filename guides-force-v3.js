// Mantém o motor de guias estável e usa a imagem anatômica do Supino por pós-processamento seguro.
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

(function(){
  const css=document.createElement('style');
  css.textContent=`
    .supinoAnatomicoWrap{width:100%;border-radius:14px;overflow:hidden;background:#f3f4f6;border:1px solid var(--border)}
    .supinoAnatomicoWrap img{display:block;width:100%;height:auto;max-height:430px;object-fit:contain;background:#f3f4f6}
    .supinoAnatomicoCaption{padding:8px 10px;color:var(--muted);font-size:11px;text-align:center;background:#0f1728}
  `;
  document.head.appendChild(css);

  function aplicarImagemSupino(){
    document.querySelectorAll('.exercise').forEach(card=>{
      const titulo=card.querySelector('h3');
      if(!titulo || titulo.textContent.trim()!=='Supino Reto Máquina ou Barra') return;
      const art=card.querySelector('.guideArt');
      if(!art || art.dataset.supinoImagem==='1') return;
      art.dataset.supinoImagem='1';
      art.innerHTML=`<div class="supinoAnatomicoWrap"><img src="./assets/supino-reto-anatomico.webp?v=10" alt="Supino reto com halteres em ilustração anatômica, posição inicial e final" loading="eager"><div class="supinoAnatomicoCaption">Posição inicial → posição final • músculos trabalhados destacados</div></div>`;
    });
  }

  function iniciarObservador(){
    const area=document.getElementById('workoutArea');
    if(!area) return;
    aplicarImagemSupino();
    const observer=new MutationObserver(aplicarImagemSupino);
    observer.observe(area,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciarObservador);
  else iniciarObservador();
})();
