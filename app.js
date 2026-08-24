const PLAN = {"Upper A": [{"name": "Supino Reto Máquina ou Barra", "sets": 3, "min": 6, "max": 8, "type": "compound", "rest": 180, "target": "Peito", "sub": "Supino Inclinado Máquina"}, {"name": "Puxada Alta Pronada (Lat Pulldown)", "sets": 3, "min": 8, "max": 10, "type": "compound", "rest": 150, "target": "Costas", "sub": "Puxada Alta Pegada Triângulo"}, {"name": "Desenvolvimento com Halteres", "sets": 3, "min": 8, "max": 10, "type": "compound", "rest": 150, "target": "Deltoides", "sub": "Desenvolvimento Máquina"}, {"name": "Elevação Lateral com Halteres", "sets": 3, "min": 12, "max": 20, "type": "isolation", "rest": 90, "target": "Deltoides", "sub": "Elevação Lateral no Cabo"}, {"name": "Tríceps Testa com Barra W", "sets": 2, "min": 10, "max": 15, "type": "isolation", "rest": 90, "target": "Tríceps", "sub": "Tríceps Pulley Barra Reta"}], "Lower A": [{"name": "Leg Press 45º ou Agachamento", "sets": 3, "min": 6, "max": 8, "type": "compound", "rest": 180, "target": "Quadríceps", "sub": "Leg Press Horizontal"}, {"name": "Mesa Flexora", "sets": 3, "min": 8, "max": 12, "type": "isolation", "rest": 120, "target": "Isquiotibiais", "sub": "Cadeira Flexora"}, {"name": "Cadeira Extensora", "sets": 3, "min": 10, "max": 15, "type": "isolation", "rest": 120, "target": "Quadríceps", "sub": "Passada com Halteres"}, {"name": "Panturrilha em Pé Máquina", "sets": 3, "min": 8, "max": 12, "type": "isolation", "rest": 90, "target": "Panturrilhas", "sub": "Panturrilha no Leg Press"}], "Upper B": [{"name": "Remada Curvada com Barra", "sets": 3, "min": 6, "max": 8, "type": "compound", "rest": 180, "target": "Costas", "sub": "Remada Baixa Pegada Neutra"}, {"name": "Supino Inclinado com Halteres", "sets": 3, "min": 8, "max": 10, "type": "compound", "rest": 150, "target": "Peito", "sub": "Supino Inclinado Máquina"}, {"name": "Crucifixo na Máquina ou Cabo", "sets": 2, "min": 12, "max": 15, "type": "isolation", "rest": 90, "target": "Peito", "sub": "Peck Deck"}, {"name": "Puxada Alta Pegada Neutra (Pulldown)", "sets": 3, "min": 10, "max": 12, "type": "compound", "rest": 120, "target": "Costas", "sub": "Pulldown com Corda Polia"}, {"name": "Crucifixo Inverso Máquina ou Cabo", "sets": 2, "min": 12, "max": 20, "type": "isolation", "rest": 90, "target": "Deltoides", "sub": "Face Pull no Cabo"}, {"name": "Rosca Direta com Barra W", "sets": 2, "min": 10, "max": 15, "type": "isolation", "rest": 90, "target": "Bíceps", "sub": "Rosca Inclinada Halteres"}], "Lower B": [{"name": "Stiff / Levantamento Romeno (RDL)", "sets": 3, "min": 6, "max": 10, "type": "compound", "rest": 180, "target": "Isquiotibiais", "sub": "Stiff com Halteres"}, {"name": "Hip Thrust", "sets": 3, "min": 8, "max": 12, "type": "compound", "rest": 150, "target": "Glúteos", "sub": "Glute Bridge Máquina"}, {"name": "Leg Press 45º (Foco Quadríceps)", "sets": 3, "min": 10, "max": 15, "type": "compound", "rest": 150, "target": "Quadríceps", "sub": "Agachamento Hack"}, {"name": "Cadeira Flexora", "sets": 3, "min": 10, "max": 15, "type": "isolation", "rest": 120, "target": "Isquiotibiais", "sub": "Mesa Flexora Deitada"}, {"name": "Panturrilha no Leg Press", "sets": 3, "min": 10, "max": 15, "type": "isolation", "rest": 90, "target": "Panturrilhas", "sub": "Panturrilha em Pé Máquina"}, {"name": "Abdominal na Polia Alta", "sets": 3, "min": 10, "max": 15, "type": "isolation", "rest": 90, "target": "Core", "sub": "Prancha Abdominal Estática"}]};
const KEY='treinoV4Data';
const SETTINGS='treinoV4Settings';
let currentWorkout=null, timerInt=null, timerEnd=0;

function getData(){ try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []} }
function saveData(d){localStorage.setItem(KEY,JSON.stringify(d)); refreshAll();}
function getSettings(){try{return JSON.parse(localStorage.getItem(SETTINGS)||'{"week":1}')}catch{return {week:1}}}
function saveSettings(s){localStorage.setItem(SETTINGS,JSON.stringify(s));}
function phase(week){ if(week<=2)return {name:'Reacomodação',rir:'3–4 RIR'}; if(week<=4)return {name:'Reconstrução',rir:'2–3 RIR'}; return {name:'Volume-alvo',rir:'1–3 RIR'}; }
function phaseSets(ex,week){ if(week<=2)return 2; if(week<=4)return ex.type==='compound'?3:2; return ex.sets; }
function rirTarget(week,ex){ if(week<=2)return '3–4'; if(week<=4)return '2–3'; return ex.type==='compound'?'1–3':'1–2'; }
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function lastExercise(name){
  const d=getData().filter(x=>x.exercise===name).sort((a,b)=>b.ts-a.ts);
  return d[0]||null;
}
function suggestion(ex){
  const l=lastExercise(ex.name); if(!l)return 'Primeiro registro: encontre uma carga confortável dentro da faixa.';
  const valid=l.sets&&l.sets.length; if(!valid)return 'Sem dados suficientes.';
  const reps=l.sets.map(s=>+s.reps||0), rirs=l.sets.map(s=>+s.rir);
  const allTop=reps.every(r=>r>=ex.max), minRir=Math.min(...rirs.filter(Number.isFinite));
  if(allTop && Number.isFinite(minRir) && minRir>=1) return 'Progressão possível: aumente a carga no menor incremento disponível.';
  if(reps.some(r=>r<ex.min)) return 'Mantenha ou reduza levemente a carga até consolidar a faixa de repetições.';
  return 'Mantenha a carga e tente adicionar repetições antes de subir o peso.';
}
function renderWorkout(){
  const week=+document.getElementById('weekInput').value||1;
  const name=document.getElementById('workoutSelect').value;
  currentWorkout=name;
  const arr=PLAN[name];
  let html=`<div class="card"><div class="row between"><div><b>${esc(name)}</b><div class="muted">${phase(week).name} • ${phase(week).rir}</div></div><button class="good" onclick="finishWorkout()">Salvar treino</button></div></div>`;
  arr.forEach((ex,idx)=>{
    const n=phaseSets(ex,week), last=lastExercise(ex.name);
    html+=`<div class="card exercise" data-ex="${idx}">
      <div class="row between"><div><h3>${esc(ex.name)}</h3><small>${ex.target} • ${ex.min}–${ex.max} reps • descanso ~${Math.round(ex.rest/60)} min</small></div><span class="badge">${n} séries</span></div>
      <div class="muted" style="margin-top:6px">Substituição: ${esc(ex.sub)}</div>
      <div class="progress ${suggestion(ex).startsWith('Progressão')?'good':'warn'}">${esc(suggestion(ex))}${last?`<br><span class="muted">Último: ${last.sets.map(s=>`${s.kg||0}kg×${s.reps||0} @RIR${s.rir??'—'}`).join(' • ')}</span>`:''}</div>
      <div class="sets">`;
    for(let s=1;s<=n;s++){
      const prev=last?.sets?.[s-1]||{};
      html+=`<div class="setrow">
        <div class="setn">${s}</div>
        <div><label>kg</label><input inputmode="decimal" class="kg" value="${prev.kg??''}" placeholder="0"></div>
        <div><label>reps</label><input inputmode="numeric" class="reps" value="" placeholder="${ex.min}-${ex.max}"></div>
        <div><label>RIR</label><input inputmode="decimal" class="rir" value="" placeholder="${rirTarget(week,ex)}"></div>
        <button class="iconbtn" onclick="startTimer(${ex.rest})">⏱</button>
      </div>`;
    }
    html+=`</div></div>`;
  });
  document.getElementById('workoutArea').innerHTML=html;
}
function finishWorkout(){
  const week=+document.getElementById('weekInput').value||1;
  const cards=[...document.querySelectorAll('.exercise')];
  const now=Date.now(), data=getData(); let added=0;
  cards.forEach((card,i)=>{
    const ex=PLAN[currentWorkout][i]; const sets=[];
    card.querySelectorAll('.setrow').forEach(row=>{
      const kg=parseFloat(row.querySelector('.kg').value.replace(',','.'));
      const reps=parseInt(row.querySelector('.reps').value);
      const rir=parseFloat(row.querySelector('.rir').value.replace(',','.'));
      if(Number.isFinite(kg)||Number.isFinite(reps)||Number.isFinite(rir)) sets.push({kg:Number.isFinite(kg)?kg:null,reps:Number.isFinite(reps)?reps:null,rir:Number.isFinite(rir)?rir:null});
    });
    if(sets.length){data.push({id:crypto.randomUUID?crypto.randomUUID():String(now)+'-'+i,ts:now,week,workout:currentWorkout,exercise:ex.name,target:ex.target,sets});added++;}
  });
  if(!added) return alert('Preencha pelo menos uma série.');
  saveData(data); alert('Treino salvo.'); renderWorkout();
}
function refreshAll(){
  const d=getData(), week=+document.getElementById('weekInput').value||1, dw=d.filter(x=>x.week===week);
  const sessions=new Set(dw.map(x=>new Date(x.ts).toDateString()+'|'+x.workout)).size;
  const sets=dw.reduce((a,x)=>a+x.sets.length,0);
  const rirs=dw.flatMap(x=>x.sets.map(s=>s.rir)).filter(Number.isFinite);
  document.getElementById('sessionsKpi').textContent=sessions;
  document.getElementById('setsKpi').textContent=sets;
  document.getElementById('avgRirKpi').textContent=rirs.length?(rirs.reduce((a,b)=>a+b,0)/rirs.length).toFixed(1):'—';
  document.getElementById('phaseText').textContent=phase(week).name+' • '+phase(week).rir;
  renderHistory(); renderStats();
}
function renderHistory(){
  const d=getData().sort((a,b)=>b.ts-a.ts), el=document.getElementById('historyList');
  if(!d.length){el.innerHTML='<p class="muted">Nenhum treino salvo ainda.</p>';return;}
  el.innerHTML=d.slice(0,80).map(x=>`<div class="historyItem"><b>${esc(x.exercise)}</b><div class="muted">Sem. ${x.week} • ${x.workout} • ${new Date(x.ts).toLocaleDateString('pt-BR')}</div><div style="margin-top:4px">${x.sets.map((s,i)=>`S${i+1}: ${s.kg??'—'}kg × ${s.reps??'—'} @ RIR ${s.rir??'—'}`).join(' · ')}</div></div>`).join('');
}
function renderStats(){
  const week=+document.getElementById('weekInput').value||1, d=getData().filter(x=>x.week===week);
  const groups={};
  d.forEach(x=>{groups[x.target]=(groups[x.target]||0)+x.sets.length});
  const names=['Peito','Costas','Deltoides','Tríceps','Bíceps','Quadríceps','Isquiotibiais','Glúteos','Panturrilhas','Core'];
  document.getElementById('statsArea').innerHTML=names.map(n=>`<div class="row between" style="padding:7px 0;border-bottom:1px solid var(--border)"><span>${n}</span><b>${groups[n]||0} séries diretas</b></div>`).join('');
}
function startTimer(sec){
  timerEnd=Date.now()+sec*1000; document.getElementById('timerBox').classList.remove('hidden');
  clearInterval(timerInt); timerInt=setInterval(tick,250); tick();
}
function tick(){
  const left=Math.max(0,Math.ceil((timerEnd-Date.now())/1000)), m=Math.floor(left/60), s=String(left%60).padStart(2,'0');
  document.getElementById('timerText').textContent=`${m}:${s}`;
  if(left<=0){clearInterval(timerInt); if(navigator.vibrate)navigator.vibrate([200,100,200]);}
}
function download(name,content,type){
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function exportCsv(){
  const rows=[['data','semana','treino','exercicio','serie','kg','reps','rir']];
  getData().forEach(x=>x.sets.forEach((s,i)=>rows.push([new Date(x.ts).toISOString(),x.week,x.workout,x.exercise,i+1,s.kg??'',s.reps??'',s.rir??''])));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
  download('treino-v4.csv',csv,'text/csv;charset=utf-8');
}
document.getElementById('workoutSelect').innerHTML=Object.keys(PLAN).map(n=>`<option>${n}</option>`).join('');
const settings=getSettings(); document.getElementById('weekInput').value=settings.week||1;
document.getElementById('weekInput').addEventListener('change',e=>{saveSettings({week:+e.target.value||1});refreshAll();if(currentWorkout)renderWorkout();});
document.getElementById('startBtn').onclick=renderWorkout;
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  ['workout','history','stats','backup'].forEach(t=>document.getElementById('tab-'+t).classList.toggle('hidden',t!==b.dataset.tab));
});
document.getElementById('clearHistory').onclick=()=>{if(confirm('Apagar todo o histórico deste aparelho?'))saveData([]);};
document.getElementById('exportJson').onclick=()=>download('treino-v4-backup.json',JSON.stringify({data:getData(),settings:getSettings()},null,2),'application/json');
document.getElementById('exportCsv').onclick=exportCsv;
document.getElementById('importJson').onchange=async e=>{
  const f=e.target.files[0]; if(!f)return; try{const x=JSON.parse(await f.text()); if(!Array.isArray(x.data))throw 0; localStorage.setItem(KEY,JSON.stringify(x.data)); if(x.settings)localStorage.setItem(SETTINGS,JSON.stringify(x.settings)); location.reload();}catch{alert('Backup inválido.');}
};
document.getElementById('timerClose').onclick=()=>document.getElementById('timerBox').classList.add('hidden');
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>startTimer(+b.dataset.add));
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
refreshAll();
