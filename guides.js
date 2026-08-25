const EXERCISE_GUIDES = {"Supino Reto Máquina ou Barra": {"focus": "Peito, com auxílio de tríceps e deltoide anterior", "cues": ["Apoie bem os pés e mantenha escápulas estáveis no banco.", "Desça com controle até uma amplitude confortável.", "Empurre mantendo antebraços aproximadamente verticais."], "avoid": ["Tirar o ombro do banco para alcançar a carga.", "Quicar a barra/pegadores no peito ou perder o controle da descida."], "pose": "press"}, "Puxada Alta Pronada (Lat Pulldown)": {"focus": "Grande dorsal e musculatura das costas", "cues": ["Comece deprimindo as escápulas antes de dobrar muito os cotovelos.", "Puxe a barra em direção à parte alta do peito.", "Mantenha tronco estável e peito levemente elevado."], "avoid": ["Balançar o tronco para criar impulso.", "Puxar atrás da cabeça ou encurtar excessivamente a amplitude."], "pose": "pull"}, "Desenvolvimento com Halteres": {"focus": "Deltoides, principalmente anterior e lateral", "cues": ["Use uma trajetória confortável no plano da escápula.", "Mantenha abdômen firme e costelas controladas.", "Suba até quase estender os cotovelos sem perder posição."], "avoid": ["Hiperestender a lombar para terminar a repetição.", "Forçar amplitude que cause pinçamento ou dor no ombro."], "pose": "overhead"}, "Elevação Lateral com Halteres": {"focus": "Deltoide lateral", "cues": ["Eleve os braços no plano da escápula, não totalmente para o lado.", "Conduza o movimento pelos cotovelos.", "Pare próximo da altura dos ombros se essa for sua amplitude confortável."], "avoid": ["Encolher os ombros e transformar o movimento em trapézio.", "Usar impulso do tronco para subir halteres pesados demais."], "pose": "lateral"}, "Tríceps Testa com Barra W": {"focus": "Tríceps", "cues": ["Mantenha os braços relativamente estáveis e mova principalmente os cotovelos.", "Desça a barra em direção à testa ou um pouco atrás, conforme conforto.", "Estenda os cotovelos sem perder a posição dos ombros."], "avoid": ["Abrir demais os cotovelos a cada repetição.", "Transformar a série em um supino por excesso de carga."], "pose": "arm"}, "Hack Squat / Agachamento no Smith": {"focus": "Quadríceps e glúteos", "cues": ["Posicione os pés onde consiga descer com joelhos e quadril confortáveis.", "Deixe os joelhos acompanharem a direção dos pés.", "Desça com controle e mantenha o pé inteiro apoiado."], "avoid": ["Colapsar os joelhos para dentro.", "Reduzir a amplitude só para adicionar carga."], "pose": "squat"}, "Mesa Flexora": {"focus": "Isquiotibiais", "cues": ["Ajuste o eixo da máquina próximo ao joelho.", "Mantenha quadril apoiado durante a flexão.", "Flexione até onde consegue sem compensar com a lombar."], "avoid": ["Levantar o quadril do banco.", "Soltar o peso rapidamente na fase de retorno."], "pose": "legcurl"}, "Cadeira Extensora": {"focus": "Quadríceps", "cues": ["Alinhe o joelho com o eixo de rotação da máquina.", "Estenda com controle e contraia o quadríceps no topo.", "Retorne sem deixar as placas baterem."], "avoid": ["Chutar o peso usando impulso.", "Usar amplitude dolorosa só para completar a repetição."], "pose": "legext"}, "Panturrilha em Pé Máquina": {"focus": "Panturrilhas", "cues": ["Desça o calcanhar de forma controlada até um alongamento confortável.", "Suba o máximo que conseguir sem dobrar excessivamente os joelhos.", "Faça uma breve pausa no topo."], "avoid": ["Quicar rapidamente no fundo.", "Fazer repetições muito curtas para usar mais carga."], "pose": "calf"}, "Remada com Peito Apoiado / Máquina": {"focus": "Costas, romboides e dorsal", "cues": ["Mantenha o peito apoiado durante toda a série.", "Puxe levando os cotovelos para trás sem jogar o tronco.", "Controle a volta até alongar as costas sem perder a posição."], "avoid": ["Tirar o peito do apoio para completar a repetição.", "Encolher os ombros em direção às orelhas."], "pose": "row"}, "Supino Inclinado com Halteres": {"focus": "Peitoral, com ênfase na porção clavicular", "cues": ["Use inclinação moderada do banco.", "Mantenha escápulas estáveis e pés firmes.", "Desça os halteres em uma trajetória confortável e empurre sem bater um no outro."], "avoid": ["Banco excessivamente vertical, transformando em desenvolvimento.", "Perder controle do ombro na parte inferior."], "pose": "press"}, "Crucifixo na Máquina ou Cabo": {"focus": "Peitoral", "cues": ["Mantenha uma pequena flexão dos cotovelos.", "Abra até sentir alongamento do peito sem forçar a articulação.", "Feche aproximando os braços e contraindo o peitoral."], "avoid": ["Transformar em supino dobrando muito os cotovelos.", "Buscar uma amplitude exagerada atrás do tronco."], "pose": "fly"}, "Puxada Unilateral no Cabo (cotovelo ao quadril)": {"focus": "Grande dorsal", "cues": ["Comece com o braço alongado e ombro controlado.", "Leve o cotovelo em direção ao quadril, como se fechasse a axila.", "Mantenha o tronco estável e permita alongamento controlado na volta."], "avoid": ["Girar o corpo para puxar mais carga.", "Transformar o movimento em uma remada horizontal."], "pose": "pull"}, "Crucifixo Inverso Máquina ou Cabo": {"focus": "Deltoide posterior e parte média das costas", "cues": ["Mantenha o peito estável e braços levemente flexionados.", "Abra os braços conduzindo pelos cotovelos.", "Use carga que permita sentir o deltoide posterior sem balanço."], "avoid": ["Encolher os ombros.", "Usar impulso do tronco."], "pose": "lateral"}, "Rosca Direta com Barra W": {"focus": "Bíceps e flexores do cotovelo", "cues": ["Mantenha cotovelos próximos ao corpo.", "Flexione sem jogar o ombro para frente.", "Desça até quase estender os cotovelos mantendo tensão."], "avoid": ["Balançar o tronco para vencer a parte difícil.", "Deixar os cotovelos viajarem muito para frente."], "pose": "arm"}, "Stiff / Levantamento Romeno (RDL)": {"focus": "Isquiotibiais e glúteos", "cues": ["Empurre o quadril para trás mantendo a coluna estável.", "Mantenha a carga próxima das pernas.", "Pare a descida quando perder a posição pélvica ou o alongamento útil."], "avoid": ["Transformar o movimento em agachamento dobrando demais os joelhos.", "Arredondar a lombar para alcançar mais profundidade."], "pose": "hinge"}, "Hip Thrust": {"focus": "Glúteos", "cues": ["Apoie a parte alta das costas no banco e firme os pés.", "Suba o quadril até alinhar tronco e coxas.", "No topo, contraia glúteos sem hiperestender a lombar."], "avoid": ["Subir jogando as costelas para cima.", "Colocar os pés tão longe ou perto que perde estabilidade."], "pose": "hip"}, "Leg Press 45º (Foco Quadríceps)": {"focus": "Quadríceps e glúteos", "cues": ["Mantenha lombar e quadril apoiados no encosto.", "Desça até onde a pelve permanece controlada.", "Empurre pelo pé inteiro e mantenha joelhos alinhados com os pés."], "avoid": ["Deixar a lombar arredondar no fundo.", "Travar os joelhos de forma agressiva no topo."], "pose": "legpress"}, "Cadeira Flexora": {"focus": "Isquiotibiais", "cues": ["Prenda bem as coxas sob o apoio.", "Flexione os joelhos sem tirar o quadril do assento.", "Controle a volta e aproveite o alongamento."], "avoid": ["Inclinar o tronco para ajudar a carga.", "Soltar a fase excêntrica."], "pose": "legcurl"}, "Panturrilha no Leg Press": {"focus": "Panturrilhas", "cues": ["Movimente apenas o tornozelo.", "Deixe os calcanhares descerem de forma controlada.", "Empurre a plataforma pela ponta dos pés e faça pausa no topo."], "avoid": ["Dobrar e estender o joelho para ajudar.", "Quicar rapidamente no alongamento."], "pose": "calf"}, "Abdominal na Polia Alta": {"focus": "Reto abdominal", "cues": ["Mantenha quadril relativamente estável.", "Aproxime costelas da pelve, flexionando o tronco.", "Volte devagar sem transformar o movimento em puxada de braços."], "avoid": ["Sentar o quadril nos calcanhares para deslocar a carga.", "Puxar a corda apenas com braços e dorsal."], "pose": "core"}};

(function(){
  const css=document.createElement('style');
  css.textContent=`
  .guideToggle{width:100%;margin-top:10px;text-align:left;background:#0f1728}
  .guideBox{margin-top:10px;padding:12px;border:1px solid var(--border);border-radius:14px;background:#0d1627}
  .guideGrid{display:grid;grid-template-columns:150px 1fr;gap:12px;align-items:start}
  .guideArt{background:#101a2c;border-radius:12px;padding:8px;display:flex;align-items:center;justify-content:center}
  .guideArt svg{width:100%;height:auto;max-height:128px}
  .guideFocus{font-size:12px;color:#a8c7ff;margin-bottom:8px}
  .guideLabel{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.05em;margin-top:8px}
  .guideList{margin:5px 0 0;padding-left:18px;color:#d8e2f0;font-size:13px;line-height:1.45}
  .guideList.bad{color:#ffc9c5}
  @media(max-width:520px){.guideGrid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);
})();

function seg(x1,y1,x2,y2,w=4){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#dce9ff" stroke-width="${w}" stroke-linecap="round"/>`;}
function head(x,y){return `<circle cx="${x}" cy="${y}" r="6" fill="#dce9ff"/>`;}
function floor(y=92){return `<line x1="7" y1="${y}" x2="62" y2="${y}" stroke="#41516c" stroke-width="2"/>`;}
function pose(kind,x,final){
  const X=n=>n+x, a=[];
  if(kind==='press'){
    a.push(seg(X(8),82,X(62),82,3),head(X(48),55),seg(X(44),61,X(29),77),seg(X(29),77,X(19),91),seg(X(29),77,X(40),91));
    final?a.push(seg(X(43),63,X(38),38),seg(X(38),38,X(50),27),seg(X(43),63,X(55),39),seg(X(55),39,X(62),29))
         :a.push(seg(X(43),63,X(34),57),seg(X(34),57,X(36),45),seg(X(43),63,X(55),57),seg(X(55),57,X(57),45));
  } else if(kind==='pull'){
    a.push(head(X(35),25),seg(X(35),31,X(35),66),seg(X(35),66,X(24),91),seg(X(35),66,X(46),91),floor());
    final?a.push(seg(X(35),42,X(23),49),seg(X(23),49,X(18),64),seg(X(35),42,X(47),49),seg(X(47),49,X(52),64))
         :a.push(seg(X(35),42,X(23),20),seg(X(23),20,X(18),8),seg(X(35),42,X(47),20),seg(X(47),20,X(52),8));
  } else if(kind==='row'){
    a.push(head(X(27),31),seg(X(27),37,X(41),60),seg(X(41),60,X(29),83),seg(X(41),60,X(53),83),seg(X(18),36,X(48),64,3));
    final?a.push(seg(X(31),44,X(18),52),seg(X(31),44,X(45),52)):a.push(seg(X(31),44,X(8),61),seg(X(31),44,X(56),61));
  } else if(kind==='overhead'){
    a.push(head(X(35),28),seg(X(35),34,X(35),66),seg(X(35),66,X(24),91),seg(X(35),66,X(46),91),floor());
    final?a.push(seg(X(35),43,X(25),23),seg(X(25),23,X(22),8),seg(X(35),43,X(45),23),seg(X(45),23,X(48),8))
         :a.push(seg(X(35),43,X(22),50),seg(X(22),50,X(18),37),seg(X(35),43,X(48),50),seg(X(48),50,X(52),37));
  } else if(kind==='lateral' || kind==='fly'){
    a.push(head(X(35),27),seg(X(35),33,X(35),66),seg(X(35),66,X(24),91),seg(X(35),66,X(46),91),floor());
    final?a.push(seg(X(35),43,X(10),43),seg(X(35),43,X(60),43)):a.push(seg(X(35),43,X(25),64),seg(X(35),43,X(45),64));
  } else if(kind==='squat'){
    final?a.push(head(X(35),25),seg(X(35),31,X(35),58),seg(X(35),58,X(24),74),seg(X(24),74,X(18),91),seg(X(35),58,X(48),74),seg(X(48),74,X(54),91))
         :a.push(head(X(40),46),seg(X(40),52,X(29),66),seg(X(29),66,X(18),72),seg(X(18),72,X(12),91),seg(X(29),66,X(49),72),seg(X(49),72,X(58),91));
    a.push(floor());
  } else if(kind==='hinge'){
    final?a.push(head(X(35),25),seg(X(35),31,X(35),62),seg(X(35),62,X(24),91),seg(X(35),62,X(46),91))
         :a.push(head(X(49),47),seg(X(44),51,X(25),64),seg(X(25),64,X(19),91),seg(X(25),64,X(42),91),seg(X(37),57,X(37),79));
    a.push(floor());
  } else if(kind==='hip'){
    a.push(seg(X(8),55,X(28),55,4),head(X(22),43),seg(X(25),49,X(37),62));
    final?a.push(seg(X(37),62,X(52),62),seg(X(52),62,X(60),91)):a.push(seg(X(37),62,X(48),79),seg(X(48),79,X(58),91));
    a.push(floor());
  } else if(kind==='legpress'){
    a.push(seg(X(10),82,X(28),55,4),head(X(25),45),seg(X(28),51,X(39),62));
    final?a.push(seg(X(39),62,X(57),48),seg(X(57),48,X(64),43)):a.push(seg(X(39),62,X(48),76),seg(X(48),76,X(60),70));
  } else if(kind==='legcurl'){
    a.push(seg(X(8),62,X(58),62,3),head(X(16),52),seg(X(21),56,X(42),61));
    final?a.push(seg(X(42),61,X(47),42),seg(X(47),42,X(58),39)):a.push(seg(X(42),61,X(55),79),seg(X(55),79,X(62),90));
  } else if(kind==='legext'){
    a.push(head(X(28),28),seg(X(28),34,X(28),58),seg(X(28),58,X(46),58),seg(X(20),58,X(50),58,3),seg(X(20),58,X(20),91,3));
    final?a.push(seg(X(46),58,X(62),58)):a.push(seg(X(46),58,X(48),84));
  } else if(kind==='calf'){
    a.push(head(X(34),25),seg(X(34),31,X(34),62),seg(X(34),62,X(30),86),seg(X(34),62,X(39),86),floor(94));
    final?a.push(seg(X(30),86,X(26),91),seg(X(39),86,X(43),91)):a.push(seg(X(30),86,X(22),94),seg(X(39),86,X(47),94));
  } else if(kind==='arm'){
    a.push(head(X(35),25),seg(X(35),31,X(35),66),seg(X(35),66,X(24),91),seg(X(35),66,X(46),91),floor());
    final?a.push(seg(X(35),43,X(25),55),seg(X(25),55,X(30),38),seg(X(35),43,X(45),55),seg(X(45),55,X(40),38))
         :a.push(seg(X(35),43,X(27),58),seg(X(27),58,X(25),76),seg(X(35),43,X(43),58),seg(X(43),58,X(45),76));
  } else if(kind==='core'){
    a.push(head(X(36),24),floor());
    final?a.push(seg(X(34),30,X(25),54),seg(X(25),54,X(34),70),seg(X(34),70,X(26),91),seg(X(34),70,X(45),91))
         :a.push(seg(X(36),30,X(36),66),seg(X(36),66,X(27),91),seg(X(36),66,X(46),91));
  }
  return a.join('');
}
function movementSvg(kind){
  return `<svg viewBox="0 0 160 112" aria-label="Simulação do exercício">
  <rect width="160" height="112" rx="12" fill="#101a2c"/>
  <g transform="translate(3,0)">${pose(kind,0,false)}</g>
  <path d="M73 52h13l-4-5 11 11-11 11 4-5H73z" fill="#6ea8fe"/>
  <g transform="translate(84,0)">${pose(kind,0,true)}</g>
  <text x="37" y="106" text-anchor="middle" fill="#98a2b3" font-size="8">INÍCIO</text>
  <text x="124" y="106" text-anchor="middle" fill="#98a2b3" font-size="8">FINAL</text>
  </svg>`;
}
function guideBlock(ex,idx){
  const g=EXERCISE_GUIDES[ex.name]; if(!g)return '';
  return `<button type="button" class="guideToggle" onclick="toggleExerciseGuide(${idx})">📘 Como executar</button>
  <div id="exercise-guide-${idx}" class="guideBox hidden"><div class="guideGrid">
    <div class="guideArt">${movementSvg(g.pose)}</div>
    <div><div class="guideFocus">🎯 ${esc(g.focus)}</div>
    <div class="guideLabel">Faça assim</div><ul class="guideList">${g.cues.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
    <div class="guideLabel">Evite</div><ul class="guideList bad">${g.avoid.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
  </div></div>`;
}
window.toggleExerciseGuide=function(idx){document.getElementById(`exercise-guide-${idx}`)?.classList.toggle('hidden');};

renderWorkout=function(){
  const week=+document.getElementById('weekInput').value||1;
  const name=document.getElementById('workoutSelect').value;
  currentWorkout=name;
  const arr=PLAN[name];
  let html=`<div class="card"><div class="row between"><div><b>${esc(name)}</b><div class="muted">${phase(week).name} • ${phase(week).rir}</div></div><button class="good" onclick="finishWorkout()">Salvar treino</button></div><div class="progress" style="margin-top:10px"><b>Revisão:</b> reavalie os exercícios a cada 8–12 semanas, mas só troque se houver motivo real: desconforto persistente, estagnação após ajustes, execução ruim ou equipamento indisponível.</div></div>`;
  arr.forEach((ex,idx)=>{
    const n=phaseSets(ex,week), last=lastExercise(ex.name);
    html+=`<div class="card exercise" data-ex="${idx}">
      <div class="row between"><div><h3>${esc(ex.name)}</h3><small>${ex.target} • ${ex.min}–${ex.max} reps • descanso ~${Math.round(ex.rest/60)} min</small></div><span class="badge">${n} séries</span></div>
      <div class="muted" style="margin-top:6px">Substituição: ${esc(ex.sub)}</div>
      ${guideBlock(ex,idx)}
      <div class="progress ${suggestion(ex).startsWith('Progressão')?'good':'warn'}">${esc(suggestion(ex))}${last?`<br><span class="muted">Último: ${last.sets.map(s=>`${s.kg||0}kg×${s.reps||0} @RIR${s.rir??'—'}`).join(' • ')}</span>`:''}</div>
      <div class="sets">`;
    for(let s=1;s<=n;s++){
      const prev=last?.sets?.[s-1]||{};
      html+=`<div class="setrow"><div class="setn">${s}</div>
        <div><label>kg</label><input inputmode="decimal" class="kg" value="${prev.kg??''}" placeholder="0"></div>
        <div><label>reps</label><input inputmode="numeric" class="reps" value="" placeholder="${ex.min}-${ex.max}"></div>
        <div><label>RIR</label><input inputmode="decimal" class="rir" value="" placeholder="${rirTarget(week,ex)}"></div>
        <button class="iconbtn" onclick="startTimer(${ex.rest})">⏱</button></div>`;
    }
    html+=`</div></div>`;
  });
  document.getElementById('workoutArea').innerHTML=html;
};
