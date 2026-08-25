(function(){
  const C={
    bg:'#101827', panel:'#0b1322', outline:'#0a0a0a', body:'#f4f4f5', shade:'#d4d4d8',
    target:'#ef4444', target2:'#b91c1c', metal:'#d1d5db', dark:'#475569', cable:'#64748b', accent:'#93c5fd'
  };

  const escAttr=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const line=(a,b,w=3,color=C.outline,dash='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  const ellipse=(x,y,rx,ry,fill,stroke=C.outline,sw=2,rot=0)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${rot?`transform="rotate(${rot} ${x} ${y})"`:''}/>`;
  const rect=(x,y,w,h,fill,stroke=C.outline,sw=2,rx=4)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const path=(d,fill='none',stroke=C.outline,sw=2)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;

  function focusType(g){
    const f=(g.focus||'').toLowerCase();
    if(f.includes('peito')||f.includes('peitoral'))return'chest';
    if(f.includes('deltoide posterior'))return'reardelt';
    if(f.includes('deltoide'))return'delt';
    if(f.includes('tríceps'))return'triceps';
    if(f.includes('bíceps'))return'biceps';
    if(f.includes('quadr'))return'quads';
    if(f.includes('isquio'))return'hams';
    if(f.includes('glúte'))return'glutes';
    if(f.includes('panturr'))return'calves';
    if(f.includes('abdominal'))return'abs';
    if(f.includes('dorsal')||f.includes('costas')||f.includes('rombo'))return'back';
    return'target';
  }

  function isBackView(kind){return ['back','reardelt','hams','glutes','calves'].includes(kind);}

  function P(h,ls,rs,le,re,lh,rh,hip,lk,rk,la,ra){return{h,ls,rs,le,re,lh,rh,hip,lk,rk,la,ra};}

  function baseStanding(){
    return P([90,24],[72,45],[108,45],[66,76],[114,76],[64,106],[116,106],[90,112],[78,155],[102,155],[76,202],[104,202]);
  }

  function poseFor(g,final){
    const f=(g.focus||'').toLowerCase();
    const p=g.pose;
    if(p==='overhead') return final?
      P([90,24],[72,45],[108,45],[68,20],[112,20],[66,5],[114,5],[90,112],[78,155],[102,155],[76,202],[104,202]):
      P([90,24],[72,45],[108,45],[61,63],[119,63],[56,48],[124,48],[90,112],[78,155],[102,155],[76,202],[104,202]);
    if(p==='lateral') return final?
      P([90,24],[72,45],[108,45],[42,51],[138,51],[18,52],[162,52],[90,112],[78,155],[102,155],[76,202],[104,202]):
      P([90,24],[72,45],[108,45],[65,76],[115,76],[62,105],[118,105],[90,112],[78,155],[102,155],[76,202],[104,202]);
    if(p==='arm' && f.includes('bíceps')) return final?
      P([90,24],[72,45],[108,45],[67,75],[113,75],[72,55],[108,55],[90,112],[78,155],[102,155],[76,202],[104,202]):baseStanding();
    if(p==='squat') return final?
      P([90,23],[72,45],[108,45],[65,70],[115,70],[61,88],[119,88],[90,108],[70,135],[110,135],[60,181],[120,181]):
      P([90,50],[72,69],[108,69],[65,88],[115,88],[60,100],[120,100],[90,124],[68,145],[112,145],[52,179],[128,179]);
    if(p==='hinge') return final?
      P([90,24],[72,45],[108,45],[66,78],[114,78],[64,111],[116,111],[90,112],[78,155],[102,155],[76,202],[104,202]):
      P([123,67],[105,79],[137,82],[91,104],[149,108],[79,130],[160,132],[113,116],[91,154],[126,154],[82,201],[135,201]);
    if(p==='pull'){
      const one=(f==='grande dorsal');
      if(one) return final?
        P([90,24],[72,45],[108,45],[65,70],[116,71],[62,99],[120,102],[90,112],[78,155],[102,155],[76,202],[104,202]):
        P([90,24],[72,45],[108,45],[63,23],[116,71],[58,5],[120,102],[90,112],[78,155],[102,155],[76,202],[104,202]);
      return final?
        P([90,28],[72,48],[108,48],[62,72],[118,72],[58,100],[122,100],[90,115],[78,157],[102,157],[76,202],[104,202]):
        P([90,28],[72,48],[108,48],[64,22],[116,22],[57,4],[123,4],[90,115],[78,157],[102,157],[76,202],[104,202]);
    }
    if(p==='press'){
      return final?
        P([132,89],[115,92],[145,92],[111,62],[149,62],[106,35],[154,35],[96,118],[75,152],[109,151],[58,184],[124,184]):
        P([132,89],[115,92],[145,92],[108,84],[152,84],[104,67],[156,67],[96,118],[75,152],[109,151],[58,184],[124,184]);
    }
    if(p==='row') return final?
      P([110,58],[92,74],[124,77],[77,88],[139,91],[64,95],[153,98],[104,113],[88,151],[120,151],[82,197],[128,197]):
      P([110,58],[92,74],[124,77],[77,102],[139,105],[50,119],[166,122],[104,113],[88,151],[120,151],[82,197],[128,197]);
    if(p==='fly') return final?
      P([90,24],[72,45],[108,45],[61,58],[119,58],[52,77],[128,77],[90,112],[78,155],[102,155],[76,202],[104,202]):
      P([90,24],[72,45],[108,45],[46,54],[134,54],[20,58],[160,58],[90,112],[78,155],[102,155],[76,202],[104,202]);
    if(p==='arm' && f.includes('tríceps')) return final?
      P([132,89],[115,92],[145,92],[111,62],[149,62],[107,37],[153,37],[96,118],[75,152],[109,151],[58,184],[124,184]):
      P([132,89],[115,92],[145,92],[111,62],[149,62],[120,78],[140,78],[96,118],[75,152],[109,151],[58,184],[124,184]);
    if(p==='hip') return final?
      P([48,84],[60,92],[76,95],[76,104],[88,107],[87,112],[97,114],[93,122],[119,128],[136,129],[144,177],[158,177]):
      P([48,84],[60,92],[76,95],[76,104],[88,107],[87,112],[97,114],[93,143],[119,151],[136,151],[144,184],[158,184]);
    if(p==='legext') return final?
      P([65,26],[52,47],[78,47],[48,75],[82,75],[45,103],[85,103],[68,111],[70,148],[100,148],[72,196],[142,148]):
      P([65,26],[52,47],[78,47],[48,75],[82,75],[45,103],[85,103],[68,111],[70,148],[100,148],[72,196],[105,194]);
    if(p==='legcurl'){
      const seated=(g.cues||[]).join(' ').toLowerCase().includes('prenda');
      if(seated) return final?
        P([64,26],[52,47],[77,47],[48,75],[81,75],[45,102],[84,102],[68,111],[70,147],[100,147],[90,182],[128,181]):
        P([64,26],[52,47],[77,47],[48,75],[81,75],[45,102],[84,102],[68,111],[70,147],[100,147],[72,196],[143,147]);
      return final?
        P([48,102],[64,108],[80,111],[82,120],[94,122],[96,124],[103,126],[91,128],[118,132],[140,132],[142,96],[163,98]):
        P([48,102],[64,108],[80,111],[82,120],[94,122],[96,124],[103,126],[91,128],[118,132],[140,132],[163,136],[184,138]);
    }
    if(p==='legpress') return final?
      P([50,65],[65,79],[78,83],[77,98],[90,100],[92,105],[104,108],[96,119],[123,128],[144,129],[169,104],[179,104]):
      P([50,65],[65,79],[78,83],[77,98],[90,100],[92,105],[104,108],[96,119],[117,145],[137,147],[155,169],[166,169]);
    if(p==='calf'){
      const legpress=(g.cues||[]).join(' ').toLowerCase().includes('tornozelo');
      if(legpress) return final?
        P([50,65],[65,79],[78,83],[77,98],[90,100],[92,105],[104,108],[96,119],[123,128],[144,129],[174,113],[184,109]):
        P([50,65],[65,79],[78,83],[77,98],[90,100],[92,105],[104,108],[96,119],[123,128],[144,129],[171,119],[181,119]);
      return final?P([90,24],[72,45],[108,45],[66,76],[114,76],[64,106],[116,106],[90,112],[78,155],[102,155],[76,193],[104,193]):baseStanding();
    }
    if(p==='core') return final?
      P([96,55],[77,72],[111,73],[70,87],[117,88],[74,60],[116,61],[94,117],[78,156],[105,156],[74,199],[109,199]):
      P([90,24],[72,45],[108,45],[67,68],[113,68],[72,48],[108,48],[90,112],[78,155],[102,155],[76,202],[104,202]);
    return baseStanding();
  }

  function segGeom(a,b){
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.max(1,Math.hypot(dx,dy));
    return {mx:(a[0]+b[0])/2,my:(a[1]+b[1])/2,len,ang:Math.atan2(dy,dx)*180/Math.PI};
  }
  function muscleCapsule(a,b,thick=16,fill=C.body,inner=true){
    const q=segGeom(a,b);
    let o=`<ellipse cx="${q.mx}" cy="${q.my}" rx="${q.len/2+3}" ry="${thick/2+2}" fill="${C.outline}" transform="rotate(${q.ang} ${q.mx} ${q.my})"/>`;
    o+=`<ellipse cx="${q.mx}" cy="${q.my}" rx="${q.len/2}" ry="${thick/2}" fill="${fill}" transform="rotate(${q.ang} ${q.mx} ${q.my})"/>`;
    if(inner){
      o+=`<path d="M ${q.mx-q.len*.20} ${q.my-2} Q ${q.mx} ${q.my-thick*.24} ${q.mx+q.len*.20} ${q.my-2}" fill="none" stroke="${C.dark}" stroke-width="1.1" transform="rotate(${q.ang} ${q.mx} ${q.my})"/>`;
    }
    return o;
  }
  function torsoGroup(p,kind,back){
    const sx=(p.ls[0]+p.rs[0])/2, sy=(p.ls[1]+p.rs[1])/2;
    const dx=p.hip[0]-sx,dy=p.hip[1]-sy,h=Math.max(38,Math.hypot(dx,dy));
    const w=Math.max(28,Math.hypot(p.rs[0]-p.ls[0],p.rs[1]-p.ls[1]));
    const rot=Math.atan2(dy,dx)*180/Math.PI-90;
    const L=-w*.52,R=w*.52, waist=w*.31;
    let o=`<g transform="translate(${sx} ${sy}) rotate(${rot})">`;
    o+=path(`M ${L} 0 Q ${-w*.44} ${h*.20} ${-waist} ${h*.70} Q ${-w*.25} ${h*.93} 0 ${h} Q ${w*.25} ${h*.93} ${waist} ${h*.70} Q ${w*.44} ${h*.20} ${R} 0 Q 0 ${-h*.08} ${L} 0 Z`,C.body,C.outline,3);
    if(back){
      o+=path(`M ${-w*.20} ${h*.05} L 0 ${h*.29} L ${w*.20} ${h*.05} L 0 ${-h*.02} Z`,kind==='back'?C.target:C.body,C.outline,1.2);
      o+=path(`M ${-w*.16} ${h*.24} Q ${-w*.47} ${h*.35} ${-w*.31} ${h*.72} L ${-w*.08} ${h*.78} L ${-w*.02} ${h*.34} Z`,kind==='back'?C.target:C.body,C.outline,1.2);
      o+=path(`M ${w*.16} ${h*.24} Q ${w*.47} ${h*.35} ${w*.31} ${h*.72} L ${w*.08} ${h*.78} L ${w*.02} ${h*.34} Z`,kind==='back'?C.target:C.body,C.outline,1.2);
      o+=line([-w*.06,h*.32],[-w*.07,h*.84],1.3,C.dark)+line([w*.06,h*.32],[w*.07,h*.84],1.3,C.dark);
      o+=path(`M ${-w*.23} ${h*.20} Q 0 ${h*.31} ${w*.23} ${h*.20}`, 'none', C.dark,1.1);
    }else{
      const pecFill=kind==='chest'?C.target:C.body;
      o+=path(`M ${-w*.39} ${h*.10} Q ${-w*.16} ${h*.02} ${-w*.02} ${h*.16} L ${-w*.04} ${h*.36} Q ${-w*.26} ${h*.39} ${-w*.42} ${h*.26} Z`,pecFill,C.outline,1.2);
      o+=path(`M ${w*.39} ${h*.10} Q ${w*.16} ${h*.02} ${w*.02} ${h*.16} L ${w*.04} ${h*.36} Q ${w*.26} ${h*.39} ${w*.42} ${h*.26} Z`,pecFill,C.outline,1.2);
      for(let r=0;r<3;r++){
        const y=h*(.43+r*.13), fill=kind==='abs'?C.target:C.body;
        o+=rect(-w*.17,y,w*.14,h*.105,fill,C.outline,1.0,3)+rect(w*.03,y,w*.14,h*.105,fill,C.outline,1.0,3);
      }
      o+=path(`M ${-w*.35} ${h*.38} Q ${-w*.28} ${h*.62} ${-w*.22} ${h*.82}`,'none',C.dark,1.1);
      o+=path(`M ${w*.35} ${h*.38} Q ${w*.28} ${h*.62} ${w*.22} ${h*.82}`,'none',C.dark,1.1);
    }
    o+='</g>';
    return o;
  }

  function anatomicalBody(g,final){
    const kind=focusType(g), back=isBackView(kind), p=poseFor(g,final);
    const hipL=[p.hip[0]-10,p.hip[1]],hipR=[p.hip[0]+10,p.hip[1]];
    let o='<g>';

    o+=muscleCapsule(p.ls,p.le,kind==='biceps'||kind==='triceps'?18:17,kind==='biceps'||kind==='triceps'?C.target:C.body);
    o+=muscleCapsule(p.le,p.lh,13,C.body);
    o+=muscleCapsule(p.rs,p.re,kind==='biceps'||kind==='triceps'?18:17,kind==='biceps'||kind==='triceps'?C.target:C.body);
    o+=muscleCapsule(p.re,p.rh,13,C.body);
    o+=muscleCapsule(hipL,p.lk,kind==='quads'||kind==='hams'?23:21,kind==='quads'||kind==='hams'?C.target:C.body);
    o+=muscleCapsule(p.lk,p.la,kind==='calves'?17:15,kind==='calves'?C.target:C.body);
    o+=muscleCapsule(hipR,p.rk,kind==='quads'||kind==='hams'?23:21,kind==='quads'||kind==='hams'?C.target:C.body);
    o+=muscleCapsule(p.rk,p.ra,kind==='calves'?17:15,kind==='calves'?C.target:C.body);

    o+=torsoGroup(p,kind,back);
    o+=ellipse(p.ls[0],p.ls[1],9,10,kind==='delt'||kind==='reardelt'?C.target:C.body,C.outline,2);
    o+=ellipse(p.rs[0],p.rs[1],9,10,kind==='delt'||kind==='reardelt'?C.target:C.body,C.outline,2);
    o+=ellipse(p.h[0],p.h[1],10,12,C.body,C.outline,2.5);
    const neckY=(p.ls[1]+p.rs[1])/2;
    o+=line([p.h[0],p.h[1]+10],[(p.ls[0]+p.rs[0])/2,neckY-2],7,C.body);
    o+=line([p.h[0],p.h[1]+10],[(p.ls[0]+p.rs[0])/2,neckY-2],1.2,C.dark);

    o+=ellipse(p.hip[0]-7,p.hip[1]+2,8,7,kind==='glutes'?C.target:C.body,C.outline,1.4);
    o+=ellipse(p.hip[0]+7,p.hip[1]+2,8,7,kind==='glutes'?C.target:C.body,C.outline,1.4);

    o+=equipment(g,p,final);
    o+='</g>';
    return o;
  }

  function dumbbell(pt){
    return `<g transform="translate(${pt[0]} ${pt[1]})"><rect x="-5" y="-2" width="10" height="4" rx="1" fill="${C.metal}" stroke="${C.outline}" stroke-width="1"/><rect x="-9" y="-6" width="4" height="12" rx="1" fill="${C.dark}"/><rect x="5" y="-6" width="4" height="12" rx="1" fill="${C.dark}"/></g>`;
  }
  function barbell(a,b,y){
    return `<g>${line([a,y],[b,y],3,C.metal)}${rect(a-5,y-8,5,16,C.dark,C.outline,1,1)}${rect(b,y-8,5,16,C.dark,C.outline,1,1)}</g>`;
  }
  function bench(x1,y1,x2,y2){return line([x1,y1],[x2,y2],9,'#64748b')+line([x1+8,y1+3],[x1+5,y1+18],5,'#64748b')+line([x2-8,y2+3],[x2-4,y2+18],5,'#64748b');}
  function cable(a,b){return line(a,b,2,C.cable,'4 3');}

  function equipment(g,p,final){
    const f=(g.focus||'').toLowerCase(), pose=g.pose; let e='';
    if(pose==='overhead'||(pose==='lateral'&&!f.includes('posterior'))) e+=dumbbell(p.lh)+dumbbell(p.rh);
    if(pose==='arm'&&f.includes('bíceps')) e+=barbell(Math.min(p.lh[0],p.rh[0])-8,Math.max(p.lh[0],p.rh[0])+8,(p.lh[1]+p.rh[1])/2);
    if(pose==='press'){
      const incline=f.includes('clavicular');
      e+=bench(45,final?133:133,150,incline?105:133);
      if(incline)e+=dumbbell(p.lh)+dumbbell(p.rh); else e+=barbell(Math.min(p.lh[0],p.rh[0])-12,Math.max(p.lh[0],p.rh[0])+12,(p.lh[1]+p.rh[1])/2);
    }
    if(pose==='arm'&&f.includes('tríceps')){e+=bench(45,133,150,133);e+=barbell(Math.min(p.lh[0],p.rh[0])-10,Math.max(p.lh[0],p.rh[0])+10,(p.lh[1]+p.rh[1])/2);}
    if(pose==='pull'){
      const one=f==='grande dorsal';
      if(one){e+=cable([30,2],p.lh)+dumbbell(p.lh)+rect(24,0,12,7,C.dark,C.outline,1,2);}
      else{e+=barbell(46,134,2)+cable([46,2],p.lh)+cable([134,2],p.rh);}
    }
    if(pose==='row'){
      e+=line([65,75],[130,135],10,'#64748b'); e+=line([55,final?95:119],[170,final?98:122],5,C.metal);
    }
    if(pose==='fly'){
      e+=cable([4,38],p.lh)+cable([176,38],p.rh)+rect(0,22,8,40,C.dark,C.outline,1,2)+rect(172,22,8,40,C.dark,C.outline,1,2);
    }
    if(pose==='lateral'&&f.includes('posterior')){
      e+=cable([4,38],p.lh)+cable([176,38],p.rh)+rect(0,22,8,40,C.dark,C.outline,1,2)+rect(172,22,8,40,C.dark,C.outline,1,2);
    }
    if(pose==='squat'){
      e+=line([50,12],[50,190],4,'#64748b')+line([130,12],[130,190],4,'#64748b')+barbell(48,132,p.ls[1]-2);
    }
    if(pose==='hinge') e+=barbell(Math.min(p.lh[0],p.rh[0])-14,Math.max(p.lh[0],p.rh[0])+14,(p.lh[1]+p.rh[1])/2);
    if(pose==='hip') e+=bench(8,100,60,100)+barbell(78,111,p.hip[1]);
    if(pose==='legext') e+=line([42,72],[42,135],7,'#64748b')+line([42,135],[107,135],9,'#64748b')+line([115,final?148:194],[152,final?148:194],10,'#64748b');
    if(pose==='legcurl'){
      const seated=(g.cues||[]).join(' ').toLowerCase().includes('prenda');
      if(seated)e+=line([42,72],[42,135],7,'#64748b')+line([42,135],[107,135],9,'#64748b')+line([108,final?181:147],[150,final?181:147],10,'#64748b');
      else e+=bench(20,143,145,143)+line([138,final?98:138],[168,final?98:138],10,'#64748b');
    }
    if(pose==='legpress'||(pose==='calf'&&(g.cues||[]).join(' ').toLowerCase().includes('tornozelo'))){
      e+=line([28,138],[88,72],10,'#64748b')+line([159,90],[173,115],12,'#64748b');
    }
    if(pose==='calf'&&!(g.cues||[]).join(' ').toLowerCase().includes('tornozelo')){
      e+=line([55,35],[55,138],6,'#64748b')+line([125,35],[125,138],6,'#64748b')+line([55,35],[125,35],7,'#64748b');
    }
    if(pose==='core') e+=cable([72,0],p.lh)+cable([108,0],p.rh)+rect(64,0,52,6,C.dark,C.outline,1,2);
    return e;
  }

  function panel(g,final,x){
    return `<g transform="translate(${x} 17)"><rect x="0" y="0" width="190" height="224" rx="16" fill="${C.panel}" stroke="#26344d" stroke-width="1.5"/><g transform="translate(5 4)">${anatomicalBody(g,final)}</g><text x="95" y="216" text-anchor="middle" fill="#cbd5e1" font-size="10" font-weight="800">${final?'FINAL':'INÍCIO'}</text></g>`;
  }

  window.exerciseSVG=function(g){
    const focus=escAttr(g.focus||'Músculo-alvo');
    return `<svg viewBox="0 0 410 255" role="img" aria-label="Personagem anatômico executando o exercício"><rect x="0" y="0" width="410" height="255" rx="18" fill="${C.bg}"/><text x="205" y="14" text-anchor="middle" fill="#fca5a5" font-size="10" font-weight="800">MÚSCULO-ALVO: ${focus.toUpperCase()}</text>${panel(g,false,7)}${panel(g,true,213)}</svg>`;
  };

  const css=document.createElement('style');
  css.textContent=`
    .guideGrid{grid-template-columns:minmax(250px,1.15fr) minmax(190px,.85fr)!important;align-items:start!important}
    .guideArt{background:transparent!important;border:none!important;padding:0!important}
    .guideArt svg{display:block!important;width:100%!important;height:auto!important;max-height:270px!important}
    .guideFocus{color:#fecaca!important;font-weight:800!important}
    @media(max-width:620px){.guideGrid{grid-template-columns:1fr!important}.guideArt svg{max-height:250px!important}}
  `;
  document.head.appendChild(css);
})();
