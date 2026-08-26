// V11: camada de guias independente. Não substitui o motor do app.
(function(){
'use strict';
const IMG={
'Supino Reto Máquina ou Barra':'./assets/supino-reto-guia.svg?v=12',
'Puxada Alta Pronada (Lat Pulldown)':'https://img-new.cgtrader.com/items/5282970/f4117ec062/lat-pulldown-3d-model-f4117ec062.jpg',
'Desenvolvimento com Halteres':'https://commons.wikimedia.org/wiki/Special:Redirect/file/Dumbbell-shoulder-press-1.png',
'Elevação Lateral com Halteres':'https://cdn.shopify.com/s/files/1/0754/7279/8002/files/Blog-dumbbells_3.webp?v=1739252606',
'Tríceps Testa com Barra W':'https://weighteasyloss.com/wp-content/uploads/2018/10/5.jpg',
'Hack Squat / Agachamento no Smith':'https://i.pinimg.com/originals/07/48/fe/0748fe254287699c2e6e153ecd157a97.jpg',
'Mesa Flexora':'https://fitliferegime.com/wp-content/uploads/2021/07/Leg-Curl-1024x576.jpg',
'Cadeira Extensora':'https://www.jefit.com/images/exercises/960_590/520.jpg',
'Panturrilha em Pé Máquina':'https://www.liftosaur.com/externalimages/exercises/full/large/standingcalfraise_bodyweight_full_large.png',
'Remada com Peito Apoiado / Máquina':'https://wellfitinsider.com/wp-content/uploads/2025/08/WWhat-Is-a-Chest-Supported-Row.jpg',
'Supino Inclinado com Halteres':'https://pub-47c5c21e53814e8a8e1024b19488867f.r2.dev/2019/10/incline-dumbbell-bench-press-e1571426551412-1024x691.png',
'Crucifixo na Máquina ou Cabo':'https://cdn.shopify.com/s/files/1/0580/4484/2041/files/Cable_Chest_Fly_Muscles_Worked.png?v=1778657320',
'Puxada Unilateral no Cabo (cotovelo ao quadril)':'https://s3assets.skimble.com/assets/3090621/image_iphone.jpg',
'Crucifixo Inverso Máquina ou Cabo':'https://s3.amazonaws.com/prod.skimble/assets/3027450/image_iphone.jpg',
'Rosca Direta com Barra W':'https://cdn.shopify.com/s/files/1/0269/5551/3900/files/EZ-Barbell-Curl_42cb566b-6415-4318-94e0-c93f4b442e59_600x600.png?v=1612137227',
'Stiff / Levantamento Romeno (RDL)':'https://sportmenu.com/uploads/store/Texts/Text1449/1f335b.png',
'Hip Thrust':'https://cdn.zyloai.app/exercise/images/hip-thrusts-3.webp',
'Leg Press 45º (Foco Quadríceps)':'https://hcgym.ee/wp-content/uploads/2022/07/leg-press.jpg',
'Cadeira Flexora':'https://fitliferegime.com/wp-content/uploads/2021/07/Leg-Curl-1024x576.jpg',
'Panturrilha no Leg Press':'https://fitliferegime.com/wp-content/uploads/2021/08/Leg-Press-Machine-Calf-Raise.jpg',
'Abdominal na Polia Alta':'https://www.the-nutrition.com/portal_data/graphics/articles/14611116_1116856885061130_1642933451081016206_n.png'
};
const INFO={
'Supino Reto Máquina ou Barra':['Peito; tríceps e deltoide anterior auxiliam','Pés firmes e escápulas estáveis.','Desça com controle e empurre sem perder a posição.','Evite quicar a carga ou tirar os ombros do banco.'],
'Puxada Alta Pronada (Lat Pulldown)':['Grande dorsal e costas','Peito levemente elevado e tronco estável.','Puxe a barra para a parte alta do peito.','Evite balanço e puxada atrás da cabeça.'],
'Desenvolvimento com Halteres':['Deltoides e tríceps','Abdômen firme e trajetória confortável.','Empurre acima da cabeça sem exagerar a extensão lombar.','Evite arquear a lombar.'],
'Elevação Lateral com Halteres':['Deltoide lateral','Conduza pelos cotovelos.','Suba até perto da altura dos ombros com controle.','Evite impulso do tronco.'],
'Tríceps Testa com Barra W':['Tríceps','Mantenha braços estáveis.','Flexione e estenda principalmente os cotovelos.','Evite transformar em supino.'],
'Hack Squat / Agachamento no Smith':['Quadríceps e glúteos','Pés firmes e joelhos acompanhando os pés.','Desça controlando a amplitude.','Evite joelhos colapsando para dentro.'],
'Mesa Flexora':['Isquiotibiais','Quadril apoiado na máquina.','Flexione os joelhos e controle a volta.','Evite levantar o quadril.'],
'Cadeira Extensora':['Quadríceps','Alinhe o joelho ao eixo da máquina.','Estenda com controle e contraia no topo.','Evite chutar o peso.'],
'Panturrilha em Pé Máquina':['Panturrilhas','Use amplitude confortável.','Desça o calcanhar e suba até a ponta do pé.','Evite quicar.'],
'Remada com Peito Apoiado / Máquina':['Costas, romboides e dorsal','Mantenha o peito no apoio.','Puxe os cotovelos para trás e controle a volta.','Evite tirar o peito do suporte.'],
'Supino Inclinado com Halteres':['Peitoral superior; tríceps e deltoide anterior','Escápulas estáveis e pés firmes.','Desça em trajetória confortável e empurre.','Evite banco vertical demais.'],
'Crucifixo na Máquina ou Cabo':['Peitoral','Cotovelos levemente flexionados.','Abra até alongar sem dor e feche contraindo o peito.','Evite amplitude exagerada.'],
'Puxada Unilateral no Cabo (cotovelo ao quadril)':['Grande dorsal','Mantenha o tronco estável.','Leve o cotovelo em direção ao quadril.','Evite girar o corpo.'],
'Crucifixo Inverso Máquina ou Cabo':['Deltoide posterior e parte média das costas','Peito estável.','Abra conduzindo pelos cotovelos.','Evite encolher os ombros.'],
'Rosca Direta com Barra W':['Bíceps e flexores do cotovelo','Cotovelos próximos ao corpo.','Suba sem jogar o tronco e desça controlando.','Evite balanço.'],
'Stiff / Levantamento Romeno (RDL)':['Isquiotibiais e glúteos','Empurre o quadril para trás.','Mantenha a carga próxima às pernas.','Evite arredondar a lombar.'],
'Hip Thrust':['Glúteos','Pés firmes e parte alta das costas apoiada.','Suba até alinhar tronco e coxas.','Evite hiperestender a lombar.'],
'Leg Press 45º (Foco Quadríceps)':['Quadríceps e glúteos','Quadril e lombar apoiados.','Desça até manter a pelve controlada e empurre pelo pé inteiro.','Evite arredondar a lombar.'],
'Cadeira Flexora':['Isquiotibiais','Prenda bem as coxas.','Flexione os joelhos e controle a volta.','Evite tirar o quadril do assento.'],
'Panturrilha no Leg Press':['Panturrilhas','Movimente principalmente o tornozelo.','Desça controlando e empurre pela ponta dos pés.','Evite usar os joelhos para ajudar.'],
'Abdominal na Polia Alta':['Reto abdominal','Quadril relativamente estável.','Aproxime costelas da pelve.','Evite puxar só com braços e dorsal.']
};
const css=document.createElement('style');css.textContent=`.safeGuideBtn{width:100%;margin:10px 0 0;text-align:left;background:#0f1728}.safeGuide{margin-top:10px;padding:12px;border:1px solid var(--border);border-radius:14px;background:#0d1627}.safeGuide img{display:block;width:100%;height:auto;max-height:360px;object-fit:contain;background:#fff;border-radius:12px}.safeGuide h4{margin:12px 0 5px}.safeGuide ul{margin:6px 0;padding-left:20px;line-height:1.45}.safeGuide .bad{color:#ffc9c5}.safeImgFail{padding:28px 12px;text-align:center;color:var(--muted);border:1px dashed var(--border);border-radius:12px}`;document.head.appendChild(css);
function inject(){
 const arr=PLAN[currentWorkout]||[];
 document.querySelectorAll('.exercise').forEach((card,i)=>{
  if(card.querySelector('.safeGuideBtn'))return;
  const ex=arr[i];if(!ex)return;const d=INFO[ex.name]||[ex.target,'Execute com controle.','Mantenha boa técnica.','Evite dor e compensações.'];
  const btn=document.createElement('button');btn.type='button';btn.className='safeGuideBtn';btn.textContent='📘 Como executar';
  const box=document.createElement('div');box.className='safeGuide hidden';
  const url=IMG[ex.name];box.innerHTML=`${url?`<img src="${url}" alt="${ex.name}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:''}<h4>🎯 ${d[0]}</h4><ul><li>${d[1]}</li><li>${d[2]}</li></ul><h4>Evite</h4><ul class="bad"><li>${d[3]}</li></ul>`;
  btn.onclick=()=>box.classList.toggle('hidden');
  const progress=card.querySelector('.progress');card.insertBefore(btn,progress);card.insertBefore(box,progress);
 });
}
const baseRender=renderWorkout;
renderWorkout=function(){baseRender();inject();};
const start=document.getElementById('startBtn');if(start)start.onclick=renderWorkout;
})();
