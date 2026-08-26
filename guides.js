// Guias visuais: movimento em 3 quadros + atlas anatômico.
(function(){
'use strict';

const MOV={
'Supino Reto Máquina ou Barra':'bench-press',
'Puxada Alta Pronada (Lat Pulldown)':'wide-grip-lat-pulldown',
'Desenvolvimento com Halteres':'seated-dumbbell-press',
'Elevação Lateral com Halteres':'lateral-raise',
'Tríceps Testa com Barra W':'skull-crusher',
'Hack Squat / Agachamento no Smith':'hack-squat',
'Mesa Flexora':'lying-leg-curl',
'Cadeira Extensora':'leg-extension',
'Panturrilha em Pé Máquina':'standing-calf-raise',
'Remada com Peito Apoiado / Máquina':'chest-supported-row',
'Supino Inclinado com Halteres':'incline-dumbbell-press',
'Crucifixo na Máquina ou Cabo':'cable-fly',
'Puxada Unilateral no Cabo (cotovelo ao quadril)':'lat-pulldown',
'Crucifixo Inverso Máquina ou Cabo':'reverse-pec-deck',
'Rosca Direta com Barra W':'bicep-curl',
'Stiff / Levantamento Romeno (RDL)':'romanian-deadlift',
'Hip Thrust':'hip-thrust',
'Leg Press 45º (Foco Quadríceps)':'leg-press',
'Cadeira Flexora':'seated-leg-curl',
'Panturrilha no Leg Press':'standing-calf-raise',
'Abdominal na Polia Alta':'cable-crunch'
};

const ATLAS={
'Supino Reto Máquina ou Barra':'https://upload.wikimedia.org/wikipedia/commons/8/8e/Pectoralis-major.png',
'Puxada Alta Pronada (Lat Pulldown)':'https://upload.wikimedia.org/wikipedia/commons/7/7d/Latissimus_dorsi.png',
'Desenvolvimento com Halteres':'https://upload.wikimedia.org/wikipedia/commons/3/39/Deltoid_Muscle.png',
'Elevação Lateral com Halteres':'https://upload.wikimedia.org/wikipedia/commons/3/39/Deltoid_Muscle.png',
'Tríceps Testa com Barra W':'https://upload.wikimedia.org/wikipedia/commons/6/62/Triceps_brachii_muscle09.png',
'Hack Squat / Agachamento no Smith':'https://upload.wikimedia.org/wikipedia/commons/9/99/Quadriceps.png',
'Mesa Flexora':'https://upload.wikimedia.org/wikipedia/commons/0/0d/M%C3%BAsculos_isquiotibiales.png',
'Cadeira Extensora':'https://upload.wikimedia.org/wikipedia/commons/9/99/Quadriceps.png',
'Panturrilha em Pé Máquina':'https://upload.wikimedia.org/wikipedia/commons/8/8e/Gastrocnemius.png',
'Remada com Peito Apoiado / Máquina':'https://upload.wikimedia.org/wikipedia/commons/f/fa/Rhomboid_muscles_back.png',
'Supino Inclinado com Halteres':'https://upload.wikimedia.org/wikipedia/commons/8/8e/Pectoralis-major.png',
'Crucifixo na Máquina ou Cabo':'https://upload.wikimedia.org/wikipedia/commons/8/8e/Pectoralis-major.png',
'Puxada Unilateral no Cabo (cotovelo ao quadril)':'https://upload.wikimedia.org/wikipedia/commons/7/7d/Latissimus_dorsi.png',
'Crucifixo Inverso Máquina ou Cabo':'https://upload.wikimedia.org/wikipedia/commons/d/d6/Deltoideus_posterior.PNG',
'Rosca Direta com Barra W':'https://upload.wikimedia.org/wikipedia/commons/5/58/Biceps_brachii_muscle15.png',
'Stiff / Levantamento Romeno (RDL)':'https://upload.wikimedia.org/wikipedia/commons/0/0d/M%C3%BAsculos_isquiotibiales.png',
'Hip Thrust':'https://upload.wikimedia.org/wikipedia/commons/c/c6/Gluteus_maximus_muscle.PNG',
'Leg Press 45º (Foco Quadríceps)':'https://upload.wikimedia.org/wikipedia/commons/9/99/Quadriceps.png',
'Cadeira Flexora':'https://upload.wikimedia.org/wikipedia/commons/0/0d/M%C3%BAsculos_isquiotibiales.png',
'Panturrilha no Leg Press':'https://upload.wikimedia.org/wikipedia/commons/8/8e/Gastrocnemius.png',
'Abdominal na Polia Alta':'https://upload.wikimedia.org/wikipedia/commons/9/95/Rectus_abdominis.png'
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

const css=document.createElement('style');
css.textContent=`
.safeGuideBtn{width:100%;margin:10px 0 0;text-align:left;background:#0f1728}
.safeGuide{margin-top:10px;padding:12px;border:1px solid var(--border);border-radius:14px;background:#0d1627}
.guideVisualGrid{display:grid;grid-template-columns:minmax(0,2fr) minmax(190px,1fr);gap:10px;align-items:stretch}
.guidePanel{position:relative;border:1px solid var(--border);border-radius:13px;background:#101a2b;overflow:hidden;min-width:0}
.guidePanelTitle{padding:8px 10px;font-size:11px;letter-spacing:.08em;font-weight:900;color:#cfe1ff;border-bottom:1px solid var(--border);background:#152238}
.movementFrames{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:6px;min-height:180px;align-items:center}
.moveFrame{position:relative;min-width:0;background:#0b1322;border-radius:9px;overflow:hidden}
.moveFrame img{display:block;width:100%;aspect-ratio:1/1;object-fit:contain}
.frameTag{position:absolute;left:6px;bottom:6px;background:#07111fcc;border:1px solid #ffffff22;color:#fff;border-radius:999px;padding:3px 6px;font-size:10px;font-weight:800}
.atlasWrap{height:100%;min-height:180px;padding:8px;background:#fff;display:flex;align-items:center;justify-content:center}
.atlasWrap img{display:block;width:100%;height:100%;max-height:300px;object-fit:contain}
.visualFallback{padding:18px 12px;color:var(--muted);font-size:12px;text-align:center}
.safeGuide h4{margin:12px 0 5px}.safeGuide ul{margin:6px 0;padding-left:20px;line-height:1.45}.safeGuide .bad{color:#ffc9c5}
.guideCredit{display:block;margin-top:8px;color:var(--muted);font-size:10px;line-height:1.35}
@media(max-width:620px){.guideVisualGrid{grid-template-columns:1fr}.movementFrames{min-height:150px}.atlasWrap{min-height:220px}.atlasWrap img{max-height:260px}}
`;
document.head.appendChild(css);

function movementUrl(slug,frame){
 return `https://cdn.jsdelivr.net/npm/@bryllim/workout-guide@1.0.0/assets/${slug}/frame-${frame}.svg`;
}

function makeMovement(slug,name){
 const panel=document.createElement('div');panel.className='guidePanel';
 const title=document.createElement('div');title.className='guidePanelTitle';title.textContent='MOVIMENTO • INÍCIO → MEIO → FINAL';panel.appendChild(title);
 const frames=document.createElement('div');frames.className='movementFrames';panel.appendChild(frames);
 if(!slug){frames.innerHTML='<div class="visualFallback" style="grid-column:1/-1">Movimento visual ainda não cadastrado.</div>';return panel;}
 [1,2,3].forEach((n)=>{
  const cell=document.createElement('div');cell.className='moveFrame';
  const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt=`${name} — quadro ${n}`;img.src=movementUrl(slug,n);
  const tag=document.createElement('span');tag.className='frameTag';tag.textContent=n===1?'INÍCIO':n===2?'MEIO':'FINAL';
  img.addEventListener('error',()=>{cell.innerHTML='<div class="visualFallback">Quadro indisponível</div>';});
  cell.appendChild(img);cell.appendChild(tag);frames.appendChild(cell);
 });
 return panel;
}

function makeAtlas(url,target){
 const panel=document.createElement('div');panel.className='guidePanel';
 const title=document.createElement('div');title.className='guidePanelTitle';title.textContent='ONDE SENTIR • ATLAS ANATÔMICO';panel.appendChild(title);
 const wrap=document.createElement('div');wrap.className='atlasWrap';panel.appendChild(wrap);
 if(!url){wrap.innerHTML=`<div class="visualFallback">Músculo-alvo: ${target}</div>`;return panel;}
 const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt=`Atlas anatômico — ${target}`;img.src=url;
 img.addEventListener('error',()=>{wrap.innerHTML=`<div class="visualFallback">Músculo-alvo: <b>${target}</b></div>`;});
 wrap.appendChild(img);return panel;
}

function inject(){
 const arr=PLAN[currentWorkout]||[];
 document.querySelectorAll('.exercise').forEach((card,i)=>{
  if(card.querySelector('.safeGuideBtn'))return;
  const ex=arr[i];if(!ex)return;
  const d=INFO[ex.name]||[ex.target,'Execute com controle.','Mantenha boa técnica.','Evite dor e compensações.'];
  const btn=document.createElement('button');btn.type='button';btn.className='safeGuideBtn';btn.textContent='📘 Como executar';
  const box=document.createElement('div');box.className='safeGuide hidden';
  const visuals=document.createElement('div');visuals.className='guideVisualGrid';
  visuals.appendChild(makeMovement(MOV[ex.name],ex.name));
  visuals.appendChild(makeAtlas(ATLAS[ex.name],d[0]));
  box.appendChild(visuals);
  const details=document.createElement('div');
  details.innerHTML=`<h4>🎯 ${d[0]}</h4><ul><li>${d[1]}</li><li>${d[2]}</li></ul><h4>Evite</h4><ul class="bad"><li>${d[3]}</li></ul><span class="guideCredit">Movimento: Workout Guide / Bryl Lim, arte derivada de Everkinetic quando indicado, CC BY-SA 4.0. Atlas: Wikimedia Commons, conforme licença do arquivo.</span>`;
  box.appendChild(details);
  btn.onclick=()=>box.classList.toggle('hidden');
  const progress=card.querySelector('.progress');card.insertBefore(btn,progress);card.insertBefore(box,progress);
 });
}

const baseRender=renderWorkout;
renderWorkout=function(){baseRender();inject();};
const start=document.getElementById('startBtn');if(start)start.onclick=renderWorkout;
})();
