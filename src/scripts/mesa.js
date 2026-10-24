
(()=>{
const $=s=>document.querySelector(s);
const body=document.body;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ======================= CONFIG ======================= */
const TAGS=['var(--t0)','var(--t1)','var(--t2)','var(--t3)','var(--t4)'];
let TAGRGB=['220,215,255','157,140,255','111,182,255','255,143,199','255,201,138'];
let INK='235,232,244',BGC='#07060c',STAR='232,230,255',SKYB=null,dockReady=false;
const hex2rgb=h=>{h=h.trim().replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const v=parseInt(h,16);return isNaN(v)?null:[(v>>16)&255,(v>>8)&255,v&255].join(',');};
function readTheme(){
  const cs=getComputedStyle(document.documentElement),gv=k=>cs.getPropertyValue(k).trim();
  TAGRGB=[0,1,2,3,4].map(i=>hex2rgb(gv('--t'+i))||TAGRGB[i]);
  INK=gv('--ink-rgb')||INK;BGC=gv('--bg')||BGC;STAR=gv('--star-rgb')||STAR;
  if(SKYB){const blobs=SKYB;blobs[0].c=TAGRGB[1];blobs[1].c=TAGRGB[2];blobs[2].c=TAGRGB[3];blobs[3].c=TAGRGB[4];}
}
readTheme();
const MODES=[
  {k:'constelacion',name:'Constelación',desc:'Todo junto: ideas sueltas y sus conexiones. Activa la gravedad (G) y se ordenan solas.'},
  {k:'matriz',name:'Matriz',desc:'Dos ejes para decidir. Cambia de plantilla (P) o renombra ejes y cuadrantes con un clic.'},
  {k:'orbitas',name:'Órbitas',desc:'Una idea en el núcleo y el resto a su alrededor, según lo cerca que la sientas.'},
  {k:'horizonte',name:'Horizonte',desc:'Cuándo: ahora, pronto, algún día, quizá nunca.'},
  {k:'esquema',name:'Esquema',desc:'Para pensar escribiendo, en jerarquía.'},
  {k:'capas',name:'Capas',desc:'Arquitectura por capas. Cada idea vive en una franja y las flechas son dependencias.'},
  {k:'flujo',name:'Flujo',desc:'Pipeline o workflow de agentes: las conexiones dirigidas se ordenan solas de izquierda a derecha.'},
  {k:'contextos',name:'Contextos',desc:'Contextos delimitados (DDD / C4). Cada color es un contexto; suelta una idea dentro de otra caja para moverla.'},
  {k:'agentes',name:'Agentes',desc:'Topología de un sistema de agentes: el orquestador al centro y el resto se ramifica por sus conexiones.'}
];
const GROUPS=[['constelacion','matriz','orbitas','horizonte','esquema'],['capas','flujo','contextos','agentes']];
const ENG=new Set(GROUPS[1]);                                       // herramientas de sistemas
const LINKMODES=new Set(['constelacion','capas','flujo','contextos','agentes']);  // soltar sobre otra = conectar
const KINDS=[['idea','idea'],['orq','orquestador'],['agente','agente'],['herr','herramienta'],['mem','memoria / datos'],['serv','servicio'],['humano','humano']];
const KIND_NAME=Object.fromEntries(KINDS);
const KIND_LANE={humano:0,serv:1,orq:2,idea:2,agente:3,herr:4,mem:5};
const MPRESETS=[
  {name:'impacto × esfuerzo',mx:['poco esfuerzo','mucho esfuerzo'],my:['mucho impacto','poco impacto'],mq:['hazlo ya','planéalo','por gusto','olvídalo']},
  {name:'riesgo',mx:['poco probable','muy probable'],my:['impacto alto','impacto bajo'],mq:['plan de contingencia','mitigar ya','aceptar','vigilar']},
  {name:'deuda técnica',mx:['arreglo barato','arreglo caro'],my:['duele mucho','duele poco'],mq:['arréglalo ya','planifícalo','cuando pases por ahí','vive con ello']},
  {name:'construir o comprar',mx:['commodity','diferencial'],my:['crítico','no crítico'],mq:['compra / SaaS','constrúyelo','lo más barato','experimenta']}
];
const DEF_LABELS={
  mx:[...MPRESETS[0].mx],my:[...MPRESETS[0].my],mq:[...MPRESETS[0].mq],mpre:0,
  or:['núcleo','cerca','orbitando','lejos'],
  hz:['ahora','pronto','algún día','quizá nunca'],
  ly:['interfaz','api / gateway','orquestación','agentes','herramientas','datos y memoria'],
  ctx:['—','núcleo agéntico','plataforma','datos y observabilidad','externo'],
  tray:'sin colocar'
};
const HINTS={
  constelacion:'<kbd>suelta una sobre otra</kbd> conectar · <kbd>G</kbd> gravedad · <kbd>arrastra el fondo</kbd> mover todo',
  matriz:'<kbd>arrastra</kbd> a un cuadrante · <kbd>P</kbd> plantilla · <kbd>clic en los textos</kbd> renombrar',
  orbitas:'<kbd>arrastra al centro</kbd> cambiar núcleo · <kbd>a un anillo</kbd> acercar o alejar',
  horizonte:'<kbd>arrastra</kbd> entre columnas · <kbd>rueda</kbd> desplazar',
  esquema:'<kbd>enter</kbd> siguiente · <kbd>tab / ⇧tab</kbd> sangrar · <kbd>alt ↑↓</kbd> mover',
  capas:'<kbd>arrastra</kbd> a otra capa · <kbd>suelta sobre otra</kbd> dependencia A → B · <kbd>T</kbd> tipo',
  flujo:'<kbd>suelta una sobre otra</kbd> conectar A → B · <kbd>otra vez al revés</kbd> invertir · <kbd>T</kbd> tipo',
  contextos:'<kbd>1–4</kbd> contexto · <kbd>suelta dentro de otra caja</kbd> moverla · <kbd>clic en el nombre</kbd> renombrar',
  agentes:'<kbd>T</kbd> tipo (orquestador, agente, herramienta…) · <kbd>suelta una sobre otra</kbd> conectar'
};
const HINT_BASE='<kbd>doble clic</kbd> nueva idea · <kbd>1–4</kbd> color · <kbd>supr</kbd> borrar · <kbd>← →</kbd> herramienta · <kbd>H</kbd> contemplar · <kbd>esc</kbd> salir';
const STORE='diego-nebulosa-mesa';
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ======================= CANVAS ======================= */
const sky=$('#msky'),sx=sky.getContext('2d');
const lines=$('#lines'),lx=lines.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=1,G,booted=false;
function geo(){
  const narrow=W<700;
  const tw=W>820?200:130;
  const mr=narrow?{x0:22,x1:W-22,y0:150,y1:H-250}:{x0:tw+40,x1:W-50,y0:140,y1:H-140};
  const oc={x:W/2,y:H/2+20};const s=Math.min(W-80,H-200);
  const R=[0,s*.19,s*.34,s*.49];
  const hz={x0:narrow?16:40,x1:W-40,y0:175};hz.cw=Math.max((W-2*hz.x0)/4,narrow?172:0);hz.x1=hz.x0+hz.cw*4;
  const es={x:Math.max(narrow?28:60,W/2-300),y0:150,ind:narrow?22:30};
  const cp={x0:W>820?220:narrow?60:150,x1:W-(narrow?40:70),y0:125,y1:H-135,n:6};cp.lh=(cp.y1-cp.y0)/cp.n;
  return {narrow,tw,mr,oc,R,hz,es,cp};
}
function resize(){
  DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
  for(const c of [sky,lines]){c.width=W*DPR;c.height=H*DPR;}
  sx.setTransform(DPR,0,0,DPR,0,0);lx.setTransform(DPR,0,0,DPR,0,0);
  G=geo();
  if(booted)buildGuides(true);
}
resize();
addEventListener('resize',resize);

/* ======================= CIELO ======================= */
const stars=Array.from({length:170},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.1+.2,p:Math.random()*6.28,s:.4+Math.random()*1.4}));
const blobs=[
  {x:.22,y:.3,r:.55,c:TAGRGB[1],a:.11,sp:.00006,ph:0},
  {x:.82,y:.22,r:.45,c:TAGRGB[2],a:.08,sp:.00008,ph:2},
  {x:.66,y:.82,r:.5,c:TAGRGB[3],a:.06,sp:.00005,ph:4},
  {x:.28,y:.88,r:.42,c:TAGRGB[4],a:.045,sp:.00007,ph:1}
];
SKYB=blobs;readTheme();
addEventListener('palettechange',()=>{readTheme();});
let intensity=.55,targetI=.55;
const dust=[];
function spawnDust(x,y,n,spread=1){
  if(REDUCED||!isFinite(x)||!isFinite(y))return;
  for(let i=0;i<n;i++)dust.push({x,y,vx:(Math.random()-.5)*1.4*spread,vy:(Math.random()-.5)*1.4*spread-.25,r:Math.random()*1.2+.3,life:1,decay:.005+Math.random()*.01,c:TAGRGB[(Math.random()*5)|0]});
}
function drawSky(t){
  intensity+=(targetI-intensity)*.03;
  sx.globalCompositeOperation='source-over';sx.fillStyle=BGC;sx.fillRect(0,0,W,H);
  sx.globalCompositeOperation='lighter';
  const M=Math.max(W,H);
  for(const b of blobs){
    const x=(b.x+Math.sin(t*b.sp+b.ph)*.06)*W,y=(b.y+Math.cos(t*b.sp*1.3+b.ph)*.05)*H,r=b.r*M;
    const g=sx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${b.c},${b.a*intensity})`);g.addColorStop(1,'rgba(0,0,0,0)');
    sx.fillStyle=g;sx.fillRect(0,0,W,H);
  }
  for(const s of stars){const a=(.3+.32*Math.sin(t*.001*s.s+s.p))*intensity;sx.fillStyle=`rgba(${STAR},${a})`;sx.beginPath();sx.arc(s.x*W,s.y*H,s.r,0,6.283);sx.fill();}
  for(let i=dust.length-1;i>=0;i--){
    const d=dust[i];d.x+=d.vx;d.y+=d.vy;d.vx*=.985;d.vy*=.985;d.vy-=.003;d.life-=d.decay;
    if(d.life<=0){dust.splice(i,1);continue;}
    sx.fillStyle=`rgba(${d.c},${d.life*.85})`;sx.beginPath();sx.arc(d.x,d.y,d.r,0,6.283);sx.fill();
  }
}

/* ======================= DATOS =======================
   Una sola lista de ideas. Cada herramienta guarda su propia colocación:
   x,y constelación · m matriz · o órbitas · h horizonte · e esquema · c capas · cx,cy contextos
   kind = tipo (idea, orquestador, agente…) · links = [origen, destino] (dirigidos)          */
let nodes=[],links=[],nextId=1,mode='constelacion',grav=false;
let L=JSON.parse(JSON.stringify(DEF_LABELS));
const byId=id=>nodes.find(n=>n.id===id);

function seed(){
  //       id, texto, tag, tipo, constelación, matriz(u,v), órbita(anillo,ángulo), horizonte(col,orden), esquema(orden,nivel), capa, contextos
  const S=(id,text,tag,kind,c,m,o,h,e,lane,ctx)=>({id,text,tag,kind,x:c[0]*W,y:c[1]*H,m:{u:m[0],v:m[1]},o:{ring:o[0],a:o[1]},
    h:{col:h[0],order:h[1]},e:{order:e[0],depth:e[1]},c:{lane,u:.5},cx:ctx[0]*W,cy:ctx[1]*H,vx:0,vy:0});
  nodes=[
    S(1,'Orquestador',1,'orq',[.5,.45],[.7,.12],[0,0],[0,0],[0,0],2,[.3,.34]),
    S(2,'Agente RAG',1,'agente',[.36,.33],[.45,.25],[1,.4],[0,1],[1,1],3,[.2,.52]),
    S(3,'Agente DevOps',1,'agente',[.64,.33],[.55,.2],[1,2.5],[1,0],[4,1],3,[.4,.52]),
    S(4,'MCP servers propios',2,'herr',[.24,.22],[.15,.35],[2,1.2],[1,1],[2,2],4,[.62,.3]),
    S(5,'Skills',2,'herr',[.78,.22],[.62,.3],[2,3.1],[1,2],[5,2],4,[.8,.3]),
    S(6,'Memoria y RAG',3,'mem',[.5,.2],[.4,.38],[2,5.6],[1,3],[3,2],5,[.42,.76]),
    S(7,'Revisión humana',4,'humano',[.16,.66],[.2,.15],[3,2.0],[2,2],[8,1],0,[.14,.78]),
    S(8,'API gateway',2,'serv',[.3,.62],[.3,.6],[3,3.7],[0,2],[6,0],1,[.62,.5]),
    S(9,'Trazas OpenTelemetry',3,'serv',[.7,.62],[.35,.22],[2,4.4],[2,0],[9,0],5,[.6,.76]),
    S(10,'LLM gateway',2,'serv',[.86,.72],[.18,.55],[3,.8],[2,3],[10,1],2,[.86,.6]),
    S(11,'¿memoria propia por agente?',0,'idea',[.5,.8],[.8,.75],[3,5.5],[3,0],[11,0],5,[.86,.8]),
    S(12,'Guardrails',2,'serv',[.4,.54],[.6,.65],[1,4.4],[2,1],[7,1],1,[.8,.5])
  ];
  links=[[7,8],[8,12],[12,1],[1,2],[1,3],[2,4],[3,5],[2,6],[3,6],[1,9],[1,10]];
  nextId=13;
  for(let l=0;l<6;l++){const m=nodes.filter(n=>n.c.lane===l);m.forEach((n,i)=>n.c.u=(i+1)/(m.length+1));}
}
function load(){
  try{
    const d=JSON.parse(localStorage.getItem(STORE));
    if(!d||!Array.isArray(d.nodes))return false;
    nodes=d.nodes.map(n=>({...n,x:n.x*W,y:n.y*H,cx:n.cx!=null?n.cx*W:null,cy:n.cy!=null?n.cy*H:null,vx:0,vy:0}));
    links=d.links||[];mode=d.mode||mode;grav=!!d.grav;
    if(d.labels)L={...L,...d.labels};
    nextId=nodes.reduce((m,n)=>Math.max(m,n.id),0)+1;
    return true;
  }catch(e){return false;}
}
function save(){
  try{localStorage.setItem(STORE,JSON.stringify({
    nodes:nodes.map(({id,text,tag,kind,x,y,m,o,h,e,c,cx,cy})=>({id,text,tag,kind,x:x/W,y:y/H,m,o,h,e,c,cx:cx/W,cy:cy/H})),links,mode,grav,labels:L}));}catch(e){}
}
function ensure(n){
  if(!n.kind)n.kind='idea';
  if(n.tag==null)n.tag=0;
  if(n.x==null){n.x=W/2+(Math.random()-.5)*320;n.y=H/2+(Math.random()-.5)*220;}
  if(n.m===undefined)n.m=null;
  if(!n.o){const k=nodes.filter(q=>q.o&&q.o.ring===3).length;n.o={ring:3,a:k*.9+Math.random()*.3};}
  if(!n.h){const c=nodes.filter(q=>q.h&&q.h.col===2);n.h={col:2,order:c.length?Math.max(...c.map(q=>q.h.order))+1:0};}
  if(!n.e){const a=nodes.filter(q=>q.e);n.e={order:a.length?Math.max(...a.map(q=>q.e.order))+1:0,depth:0};}
  if(!n.c){const lane=KIND_LANE[n.kind]??2,k=nodes.filter(q=>q.c&&q.c.lane===lane).length;n.c={lane,u:clamp(.12+k*.16,.05,.95)};}
  if(n.cx==null){n.cx=n.x;n.cy=n.y;}
}
function normOutline(){
  let prev=-1;
  nodes.filter(n=>n.e).sort((a,b)=>a.e.order-b.e.order).forEach((n,i)=>{n.e.order=i;n.e.depth=clamp(n.e.depth,0,prev+1);prev=n.e.depth;});
}
if(!load())seed();
nodes.forEach(ensure);normOutline();

/* ======================= DOM DE IDEAS ======================= */
const mesa=$('#mesa'),nodesEl=$('#nodes'),guides=$('#guides'),els=new Map(),txts=new Map();
function mk(n){
  const d=document.createElement('div');
  d.className='idea';d.dataset.id=n.id;
  d.innerHTML='<span class="dot"></span><span class="txt" spellcheck="false"></span><span class="kd"></span>';
  const t=d.querySelector('.txt');t.textContent=n.text;
  d.style.setProperty('--c',TAGS[n.tag]);
  nodesEl.appendChild(d);els.set(n.id,d);txts.set(n.id,t);
  paintKind(n);
  t.addEventListener('blur',()=>{if(editing&&editing.n===n)commitEdit();});
  t.addEventListener('paste',e=>{e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain').replace(/\s+/g,' '));});
}
function paintKind(n){
  const el=els.get(n.id);if(!el)return;
  el.dataset.kind=n.kind;el.querySelector('.dot').dataset.kind=n.kind;
  el.querySelector('.kd').textContent=n.kind==='idea'?'':KIND_NAME[n.kind];
}
nodes.forEach(mk);

let sel=null,editing=null;
function select(id){sel=id;els.forEach((el,k)=>el.classList.toggle('sel',k===id));paintLegend();}
function setTag(id,tag){const n=byId(id);if(!n)return;n.tag=tag;els.get(id).style.setProperty('--c',TAGS[tag]);save();}
function setKind(id,k){const n=byId(id);if(!n)return;n.kind=k;paintKind(n);paintLegend();save();}
function cycleKind(dir){
  const n=byId(sel);if(!n){toast('Selecciona una idea primero');return;}
  const i=KINDS.findIndex(k=>k[0]===n.kind);const k=KINDS[(i+dir+KINDS.length)%KINDS.length];
  setKind(n.id,k[0]);toast('Tipo: '+k[1]);
}
function removeNode(id){
  const n=byId(id);if(n&&n.rx!=null)spawnDust(n.rx,n.ry,14);
  els.get(id)?.remove();els.delete(id);txts.delete(id);
  nodes=nodes.filter(k=>k.id!==id);links=links.filter(([a,b])=>a!==id&&b!==id);
  if(sel===id)select(null);
  normOutline();updateEmpty();save();
}
function toggleLink(a,b){          // conexión dirigida a → b
  if(a===b)return;
  const i=links.findIndex(([x,y])=>x===a&&y===b),j=links.findIndex(([x,y])=>x===b&&y===a);
  let msg;
  if(i>=0){links.splice(i,1);msg='Conexión deshecha';}
  else if(j>=0&&ENG.has(mode)){links[j]=[a,b];msg='Dirección invertida';}
  else if(j>=0){links.splice(j,1);msg='Conexión deshecha';}
  else{links.push([a,b]);msg=ENG.has(mode)?'Conectadas  A → B':'Conectadas';}
  const p=byId(a),q=byId(b);spawnDust((p.rx+q.rx)/2,(p.ry+q.ry)/2,msg.startsWith('Conexión')?6:16,.8);
  toast(msg);save();
}
function updateEmpty(){$('#empty').classList.toggle('hide',nodes.length>0);if(dockReady)paintClear();}
updateEmpty();

/* --- crear / editar --- */
function boxAt(x,y){for(const [tag,b] of boxAnim){if(x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1)return tag;}return null;}
function createAt(p){
  const s=byId(sel);
  const n={id:nextId++,text:'',tag:s?s.tag:0,kind:'idea',vx:0,vy:0};
  let d=null;
  if(mode==='constelacion'){n.x=p.x;n.y=p.y;}
  else if(mode==='contextos'){n.cx=p.x;n.cy=p.y;const t=boxAt(p.x,p.y);if(t!=null)n.tag=t;}
  else if(mode!=='flujo'&&mode!=='agentes'){
    d=computeDrop(n,p.x,p.y);
    if(mode==='orbitas'&&d.ring===0&&nodes.some(k=>k.o&&k.o.ring===0))d.ring=1;
  }
  nodes.push(n);ensure(n);
  if(d)applyDrop(n,d);
  if(s&&(mode==='constelacion'||mode==='flujo'||mode==='agentes'))links.push([s.id,n.id]);   // nace conectada a la seleccionada
  n.rx=p.x;n.ry=p.y;
  mk(n);spawnDust(p.x,p.y,18,.9);
  select(n.id);updateEmpty();
  requestAnimationFrame(()=>startEdit(n,true));
}
function createAfter(ref){
  const n={id:nextId++,text:'',tag:ref.tag,kind:'idea',vx:0,vy:0};
  nodes.push(n);ensure(n);
  const rows=nodes.filter(k=>k!==n).sort((a,b)=>a.e.order-b.e.order);
  rows.splice(rows.indexOf(ref)+1,0,n);n.e.depth=ref.e.depth;
  rows.forEach((k,i)=>k.e.order=i);normOutline();
  n.rx=ref.rx;n.ry=ref.ry+20;
  mk(n);select(n.id);updateEmpty();
  requestAnimationFrame(()=>startEdit(n,true));
}
function startEdit(n,isNew=false){
  const t=txts.get(n.id);if(!t)return;
  editing={n,t,old:isNew?'':n.text};
  t.contentEditable='true';t.focus();
  const r=document.createRange();r.selectNodeContents(t);const s=getSelection();s.removeAllRanges();s.addRange(r);
}
function commitEdit(cancel=false){
  if(!editing)return false;
  const {n,t,old}=editing;editing=null;
  t.contentEditable='false';
  const v=(cancel?old:t.textContent).trim();
  if(!v){removeNode(n.id);return false;}
  n.text=v;t.textContent=v;save();return true;
}

/* ======================= LAYOUT POR HERRAMIENTA ======================= */
const LAY=new Map();
const scroll={horizonte:0,esquema:0},minScroll={horizonte:0,esquema:0};
let hzX=0;const hzMin=()=>Math.min(0,W-(G.hz.x1+G.hz.x0));
const rot=(ring,t)=>t*[0,.000014,.000009,.000006][ring];
let breath=1,trayRow=null,agentEmpty=false,agentGeo=null;
function bo(n,t){return breath>.01?[Math.sin(t*.00045+n.id*1.7)*3*breath,Math.cos(t*.0004+n.id*2.3)*3*breath]:[0,0];}
function trayLayout(loose,label){
  trayRow=loose.length?{y:H-165,label}:null;
  const sp=Math.min(170,(W-120)/Math.max(1,loose.length));
  loose.forEach((n,i)=>LAY.set(n.id,{x:W/2+(i-(loose.length-1)/2)*sp,y:H-165}));
}
function flowLayout(){
  const ranks=new Map(nodes.map(n=>[n.id,0])),linked=new Set();
  for(const [a,b] of links)if(ranks.has(a)&&ranks.has(b)&&a!==b){linked.add(a);linked.add(b);}
  for(let it=0;it<nodes.length;it++){
    let ch=false;
    for(const [a,b] of links){if(!ranks.has(a)||!ranks.has(b)||a===b)continue;const r=ranks.get(a)+1;if(r>ranks.get(b)&&r<nodes.length){ranks.set(b,r);ch=true;}}
    if(!ch)break;
  }
  const cols=[];for(const n of nodes){if(!linked.has(n.id))continue;const r=ranks.get(n.id);(cols[r]||(cols[r]=[])).push(n);}
  const C=cols.filter(Boolean),maxR=Math.max(0,C.length-1);
  const colW=maxR?clamp((W-220)/maxR,150,260):0,x0=W/2-maxR*colW/2,cy=H/2-30;
  const maxK=Math.max(1,...C.map(c=>c.length)),rowH=clamp((H-330)/maxK,64,110);
  const posY=new Map();
  C.forEach((col,ci)=>{
    if(ci===0)col.sort((p,q)=>p.id-q.id);
    else{
      const key=n=>{const ps=links.filter(([a,b])=>b===n.id&&posY.has(a)).map(([a])=>posY.get(a));return ps.length?ps.reduce((s,v)=>s+v,0)/ps.length:1e6+n.id;};
      col.sort((p,q)=>key(p)-key(q));
    }
    col.forEach((n,i)=>{const y=cy+(i-(col.length-1)/2)*rowH;posY.set(n.id,y);LAY.set(n.id,{x:x0+ci*colW,y});});
  });
  if(G.narrow){   // en vertical: cada rango es una fila y la fila se reparte a lo ancho
    const rH=maxR?clamp((H-380)/maxR,64,130):0,y0=Math.max(150,H/2-60-maxR*rH/2);
    C.forEach((col,ci)=>{
      const cw=Math.min(170,(W-50)/col.length);
      col.forEach((n,i)=>LAY.set(n.id,{x:W/2+(i-(col.length-1)/2)*cw,y:y0+ci*rH+(col.length>2?(i%2?18:-10):0)}));
    });
  }
  trayLayout(nodes.filter(n=>!linked.has(n.id)),'sueltas');
}
function agentLayout(t){
  const adj=new Map(nodes.map(n=>[n.id,[]]));
  for(const [a,b] of links)if(adj.has(a)&&adj.has(b)&&a!==b){adj.get(a).push(b);adj.get(b).push(a);}
  let roots=nodes.filter(n=>n.kind==='orq').map(n=>n.id);
  if(!roots.length){let best=null,bd=0;for(const n of nodes){const d=adj.get(n.id).length;if(d>bd){bd=d;best=n.id;}}if(best!=null)roots=[best];}
  agentEmpty=!roots.length;
  const depth=new Map(),kids=new Map(nodes.map(n=>[n.id,[]])),q=[];
  roots.forEach(r=>{depth.set(r,0);q.push(r);});
  while(q.length){const c=q.shift();for(const o of adj.get(c))if(!depth.has(o)){depth.set(o,depth.get(c)+1);kids.get(c).push(o);q.push(o);}}
  const lv=new Map();
  const leaves=id=>{if(lv.has(id))return lv.get(id);const k=kids.get(id);const v=k.length?k.reduce((s,c)=>s+leaves(c),0):1;lv.set(id,v);return v;};
  const maxD=Math.max(1,...[...depth.values()]);
  const s=G.narrow?Math.min(W-30,H-300):Math.min(W-200,H-270),R0=roots.length>1?s*.1:0,step=Math.min(150,(s/2-R0)/maxD);
  const cx=W/2,cy=H/2-25,kx=clamp((W-(G.narrow?70:240))/(2*(R0+maxD*step)),1,1.7);   // estira en horizontal
  agentGeo={cx,cy,R0,step,maxD,kx};
  const total=roots.reduce((a,r)=>a+leaves(r),0)||1;
  const place=(id,a0,a1)=>{
    const d=depth.get(id),a=(a0+a1)/2,r=R0+d*step,[bx,by]=bo(byId(id),t);
    LAY.set(id,{x:cx+Math.cos(a)*r*kx+bx,y:cy+Math.sin(a)*r+by});
    let cur=a0;for(const k of kids.get(id)){const sp=(a1-a0)*leaves(k)/leaves(id);place(k,cur,cur+sp);cur+=sp;}
  };
  let st=-Math.PI/2;
  for(const r of roots){const sp=2*Math.PI*leaves(r)/total;place(r,st,st+sp);st+=sp;}
  trayLayout(nodes.filter(n=>!depth.has(n.id)),'sin conectar');
}
function layout(t){
  LAY.clear();trayRow=null;const g=G;
  if(mode==='constelacion'){
    for(const n of nodes){const [a,b]=bo(n,t);LAY.set(n.id,{x:n.x+a,y:n.y+b});}
  }else if(mode==='matriz'){
    const {x0,x1,y0,y1}=g.mr;let k=0;
    for(const n of nodes){
      if(n.m)LAY.set(n.id,{x:x0+n.m.u*(x1-x0),y:y0+n.m.v*(y1-y0)});
      else if(g.narrow){LAY.set(n.id,{x:30+(k%2)*(W/2),y:y1+46+Math.floor(k/2)*28,tray:true});k++;}
      else LAY.set(n.id,{x:30,y:y0+40+(k++)*30,tray:true});
    }
  }else if(mode==='orbitas'){
    for(const n of nodes){
      const [a,b]=bo(n,t);
      if(n.o.ring===0)LAY.set(n.id,{x:g.oc.x+a,y:g.oc.y+b});
      else{const an=n.o.a+rot(n.o.ring,t),R=g.R[n.o.ring];LAY.set(n.id,{x:g.oc.x+Math.cos(an)*R+a,y:g.oc.y+Math.sin(an)*R+b});}
    }
  }else if(mode==='horizonte'){
    let bottom=0;
    for(let c=0;c<4;c++){
      let y=g.hz.y0+scroll.horizonte;
      for(const n of nodes.filter(k=>k.h.col===c).sort((a,b)=>a.h.order-b.h.order)){
        const h=txts.get(n.id).offsetHeight||44;
        LAY.set(n.id,{x:g.hz.x0+g.hz.cw*(c+.5)+hzX,y,h});y+=h+10;
      }
      bottom=Math.max(bottom,y-scroll.horizonte);
    }
    minScroll.horizonte=-Math.max(0,bottom-(H-130));
  }else if(mode==='esquema'){
    let y=g.es.y0+scroll.esquema;
    nodes.slice().sort((a,b)=>a.e.order-b.e.order).forEach((n,i)=>{
      const d=n.e.depth;if(d===0&&i>0)y+=16;
      const rh=d===0?42:32;
      LAY.set(n.id,{x:g.es.x+d*g.es.ind,y:y+rh/2,h:rh});y+=rh;
    });
    minScroll.esquema=-Math.max(0,y-scroll.esquema-(H-130));
  }else if(mode==='capas'){
    const c=g.cp;
    for(const n of nodes)LAY.set(n.id,{x:c.x0+n.c.u*(c.x1-c.x0),y:c.y0+c.lh*(n.c.lane+.5)-(g.narrow?2:10)});
  }else if(mode==='flujo'){
    flowLayout();
  }else if(mode==='contextos'){
    for(const n of nodes){const [a,b]=bo(n,t);LAY.set(n.id,{x:n.cx+a,y:n.cy+b});}
  }else if(mode==='agentes'){
    agentLayout(t);
  }
}

/* --- soltar una idea: dónde cae en cada herramienta --- */
function computeDrop(n,x,y){
  const g=G;
  if(mode==='matriz'){
    const {x0,x1,y0,y1}=g.mr;
    if(x>=x0&&x<=x1&&y>=y0&&y<=y1)return {m:{u:(x-x0)/(x1-x0),v:(y-y0)/(y1-y0)}};
    return {m:null};
  }
  if(mode==='orbitas'){
    const dx=x-g.oc.x,dy=y-g.oc.y,r=Math.hypot(dx,dy);
    const ring=r<g.R[1]*.5?0:[1,2,3].reduce((b,i)=>Math.abs(r-g.R[i])<Math.abs(r-g.R[b])?i:b,1);
    return {ring,a:Math.atan2(dy,dx)-rot(ring,performance.now())};
  }
  if(mode==='horizonte'){
    const col=clamp(Math.floor((x-hzX-g.hz.x0)/g.hz.cw),0,3);
    const list=nodes.filter(k=>k!==n&&k.h.col===col).sort((a,b)=>a.h.order-b.h.order);
    let idx=list.length;
    for(let i=0;i<list.length;i++){const T=LAY.get(list[i].id);if(T&&y<T.y+T.h/2){idx=i;break;}}
    let ly;
    if(idx<list.length)ly=LAY.get(list[idx].id).y-5;
    else if(list.length){const T=LAY.get(list[list.length-1].id);ly=T.y+T.h+5;}
    else ly=g.hz.y0+scroll.horizonte;
    const cx=g.hz.x0+g.hz.cw*(col+.5)+hzX;
    return {col,idx,list,line:[cx-g.hz.cw/2+14,cx+g.hz.cw/2-14,ly]};
  }
  if(mode==='esquema'){
    const rows=nodes.filter(k=>k!==n).sort((a,b)=>a.e.order-b.e.order);
    let idx=rows.length;
    for(let i=0;i<rows.length;i++){const T=LAY.get(rows[i].id);if(T&&y<T.y){idx=i;break;}}
    const prev=rows[idx-1],maxD=prev?prev.e.depth+1:0;
    const depth=clamp(Math.round((x-g.es.x)/g.es.ind),0,maxD);
    let ly;
    if(idx<rows.length){const T=LAY.get(rows[idx].id);ly=T.y-T.h/2;}
    else if(rows.length){const T=LAY.get(rows[rows.length-1].id);ly=T.y+T.h/2;}
    else ly=g.es.y0+scroll.esquema;
    const ix=g.es.x+depth*g.es.ind-6;
    return {idx,rows,depth,line:[ix,ix+260,ly]};
  }
  if(mode==='capas'){
    const c=g.cp;
    return {lane:clamp(Math.floor((y-c.y0)/c.lh),0,c.n-1),u:clamp((x-c.x0)/(c.x1-c.x0),.02,.98)};
  }
  return null;
}
function applyDrop(n,d){
  if(!d)return;
  if(mode==='matriz')n.m=d.m;
  else if(mode==='orbitas'){
    if(d.ring===0){
      const c=nodes.find(k=>k!==n&&k.o&&k.o.ring===0);
      if(c)c.o=n.o&&n.o.ring?{...n.o}:{ring:1,a:0};   // el núcleo anterior ocupa tu sitio
      n.o={ring:0,a:0};
    }else n.o={ring:d.ring,a:d.a};
  }else if(mode==='horizonte'){
    d.list.splice(d.idx,0,n);d.list.forEach((k,i)=>k.h={col:d.col,order:i});
  }else if(mode==='esquema'){
    d.rows.splice(d.idx,0,n);n.e.depth=d.depth;d.rows.forEach((k,i)=>k.e.order=i);normOutline();
  }else if(mode==='capas'){
    n.c={lane:d.lane,u:d.u};
  }
}

/* ======================= GUÍAS (etiquetas editables) ======================= */
function lab(key,i,cls,x,y,style=''){
  const v=i==null?L[key]:L[key][i];
  return `<div class="g-label ${cls}" contenteditable="true" spellcheck="false" data-k="${key}" data-i="${i??''}" style="left:${x}px;top:${y}px;${style}">${esc(v)}</div>`;
}
const hint=(x,y,html)=>`<div class="core-hint" style="left:${x}px;top:${y}px">${html}</div>`;
let guideHint=null,ctxLabels=[];
function buildGuides(instant){
  const g=G;let h='';
  if(mode==='matriz'){
    const {x0,x1,y0,y1}=g.mr,mx=(x0+x1)/2,my=(y0+y1)/2;
    h+=lab('my',0,'al-c',mx,y0-30)+lab('my',1,'al-c',mx,y1+8);
    h+=lab('mx',0,'',x0+4,my-26)+lab('mx',1,'al-r',x1-4,my-26);
    h+=lab('mq',0,'q',x0+16,y0+12)+lab('mq',1,'q al-r',x1-16,y0+12)+lab('mq',2,'q',x0+16,y1-44)+lab('mq',3,'q al-r',x1-16,y1-44);
    h+=g.narrow?lab('tray',null,'',18,y1+14):lab('tray',null,'',20,y0+4);
    h+=`<div class="g-btn al-r" data-preset style="left:${x1}px;top:${g.narrow?y1+10:y0-34}px">plantilla · ${esc(MPRESETS[L.mpre||0].name)}</div>`;
  }else if(mode==='orbitas'){
    for(let i=1;i<4;i++)h+=lab('or',i,'al-c',g.oc.x,g.oc.y-g.R[i]-24);
    h+=hint(g.oc.x,g.oc.y,'doble clic aquí<br>para fijar el núcleo');
  }else if(mode==='horizonte'){
    for(let i=0;i<4;i++)h+=lab('hz',i,'h al-c',g.hz.x0+g.hz.cw*(i+.5),g.hz.y0-62);
  }else if(mode==='capas'){
    for(let i=0;i<g.cp.n;i++)h+=g.narrow?lab('ly',i,'',14,g.cp.y0+g.cp.lh*i+6):lab('ly',i,'',36,g.cp.y0+g.cp.lh*(i+.5)-10);
  }else if(mode==='flujo'){
    h+=hint(W/2,H/2-30,'suelta una idea sobre otra para conectarlas<br>y el flujo se ordena solo');
  }else if(mode==='contextos'){
    for(let i=1;i<5;i++)h+=lab('ctx',i,'ctx-label',0,0,`color:var(--t${i});display:none`);
  }else if(mode==='agentes'){
    h+=hint(W/2,H/2-25,'marca una idea como orquestador (T)<br>y conéctale el resto');
  }
  if(!instant)guides.classList.remove('in');
  guides.innerHTML=h;
  guideHint=guides.querySelector('.core-hint');
  ctxLabels=[...guides.querySelectorAll('.ctx-label')];
  if(!instant)requestAnimationFrame(()=>requestAnimationFrame(()=>guides.classList.add('in')));
  else guides.classList.add('in');
}
function hintNeeded(){
  if(mode==='orbitas')return !nodes.some(n=>n.o.ring===0);
  if(mode==='flujo')return links.length===0;
  if(mode==='agentes')return agentEmpty;
  return false;
}
function cyclePreset(){
  L.mpre=((L.mpre||0)+1)%MPRESETS.length;const p=MPRESETS[L.mpre];
  L.mx=[...p.mx];L.my=[...p.my];L.mq=[...p.mq];
  buildGuides(true);toast('Plantilla: '+p.name);save();
}
guides.addEventListener('input',e=>{
  const el=e.target.closest('.g-label');if(!el)return;
  const v=el.textContent.trim()||'—';
  if(el.dataset.i==='')L[el.dataset.k]=v;else L[el.dataset.k][+el.dataset.i]=v;
  save();
});
guides.addEventListener('click',e=>{if(e.target.closest('[data-preset]'))cyclePreset();});

/* ======================= MODOS / UI ======================= */
const dock=$('#dock');
dock.innerHTML=GROUPS.map(gr=>gr.map(k=>`<button data-mode="${k}">${MODES.find(m=>m.k===k).name}</button>`).join('')).join('<span class="sep"></span>')+
 `<span class="sep"></span>
  <button class="dk-ic" data-act="grav" title="Gravedad (G)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-25 12 12)"/></svg></button>
  <button class="dk-ic" data-act="calm" title="Contemplar (H)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg></button>
  <button class="dk-ic" data-act="clear" title="Vaciar la mesa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5 7h14M9.5 7V5h5v2M7 7l1 12h8l1-12"/></svg></button>`;
dock.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed','false'));
dock.querySelectorAll('[data-act]').forEach(b=>b.setAttribute('aria-label',b.title));
const cbtn=dock.querySelector('[data-act="clear"]');
let clearArm=0,clearT;dockReady=true;
function paintClear(){const t=nodes.length?'Vaciar la mesa':'Recuperar las ideas de ejemplo';cbtn.title=t;cbtn.setAttribute('aria-label',t);}
function clearMesa(){
  if(!nodes.length){seed();nodes.forEach(ensure);normOutline();nodes.forEach(mk);updateEmpty();buildGuides(true);save();toast('Ideas de ejemplo recuperadas');paintClear();return;}
  const now=performance.now();
  if(now-clearArm>2600){clearArm=now;cbtn.classList.add('armed');toast('¿Vaciar la mesa? Pulsa otra vez para confirmar');clearTimeout(clearT);clearT=setTimeout(()=>cbtn.classList.remove('armed'),2600);return;}
  clearArm=0;cbtn.classList.remove('armed');
  [...nodes].forEach(n=>removeNode(n.id));links=[];save();paintClear();toast('Mesa vacía · pulsa la papelera para recuperar el ejemplo');
}
const gbtn=dock.querySelector('[data-act="grav"]');
dock.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.mode)setMode(b.dataset.mode);
  else if(b.dataset.act==='grav')toggleGrav();
  else if(b.dataset.act==='calm')toggleCalm();
  else if(b.dataset.act==='clear')clearMesa();
});

const legend=$('#legend');
legend.innerHTML='<span class="lg-name"></span>'+KINDS.map(([k,name])=>`<button data-kind="${k}" title="${name}"><i data-kind="${k}"></i></button>`).join('');
const lgName=legend.querySelector('.lg-name');
function paintLegend(){
  const n=byId(sel);
  legend.querySelectorAll('button').forEach(b=>b.classList.toggle('on',!!n&&b.dataset.kind===n.kind));
  lgName.textContent=n?KIND_NAME[n.kind]:'tipo · T';
}
legend.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(!byId(sel)){toast('Selecciona una idea primero');return;}
  setKind(sel,b.dataset.kind);
});
legend.addEventListener('mouseover',e=>{const b=e.target.closest('button');if(b)lgName.textContent=KIND_NAME[b.dataset.kind];});
legend.addEventListener('mouseleave',paintLegend);
paintLegend();

let gA=0,linkA=1,arrowA=0,flowA=0,quietT;
function setMode(k){
  commitEdit();
  mode=k;mesa.className='m-'+k+(grav?' grav':'')+(ENG.has(k)?' eng':'');
  dock.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('on',b.dataset.mode===k);b.setAttribute('aria-pressed',String(b.dataset.mode===k));});
  gbtn.classList.toggle('hide',k!=='constelacion');gbtn.classList.toggle('on',grav);gbtn.setAttribute('aria-pressed',String(grav));
  legend.classList.toggle('show',ENG.has(k));
  const m=MODES.find(x=>x.k===k),mi=$('#modeinfo');
  mi.classList.add('swap');mi.classList.remove('quiet');
  setTimeout(()=>{mi.querySelector('.mi-name').textContent=m.name;mi.querySelector('.mi-desc').textContent=m.desc;mi.classList.remove('swap');},230);
  clearTimeout(quietT);quietT=setTimeout(()=>mi.classList.add('quiet'),6000);
  $('#hint').innerHTML=HINTS[k]+'<br>'+HINT_BASE;
  gA=0;buildGuides();save();
}
function toggleGrav(){
  grav=!grav;mesa.classList.toggle('grav',grav);gbtn.classList.toggle('on',grav);
  if(mode!=='constelacion')setMode('constelacion');
  toast(grav?'Gravedad activada':'Gravedad en pausa');save();
}
let toastT;
function toast(msg){const t=$('#mtoast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),msg.length>34?2400:1400);}
function toggleCalm(){body.classList.toggle('calm');if(body.classList.contains('calm'))toast('Modo contemplar · H para volver');}

/* ======================= ENTRAR / SALIR ======================= */
let thinking=false,goneT,unfxT,skyUntil=0,running=false;
const fab=$('#fab');
/* piezas del portfolio que se apartan; bloques muy altos se trocean en sus hijos */
function fxTargets(){
  const out=[...document.querySelectorAll('header.top, #sky, .hero .hello, .hero h1, .hero .role, .hero .thesis, .hero .cta > *, .hero .facts > li, footer .wrap > *')];
  const big=innerHeight*.55;
  const walk=(el,depth)=>{
    if(el.hidden||el.offsetParent===null&&getComputedStyle(el).position!=='fixed')return;
    const r=el.getBoundingClientRect();
    if(r.bottom<-40||r.top>innerHeight+40){return;}
    if(depth<4&&r.height>big&&el.children.length>0&&!el.matches('svg,figure,.arch-scroll,.case,.pcard,.doc,.caps,img,canvas')){for(const c of el.children)walk(c,depth+1);}
    else out.push(el);
  };
  document.querySelectorAll('main section.block > .wrap').forEach(w=>{for(const c of w.children)walk(c,0);});
  // .caps y .case completos solo si son pequeños; si no, sus hijos
  return out;
}
let fxEls=[];
function tagFx(){untagFx(true);fxEls=fxTargets();fxEls.forEach(el=>el.classList.add('fx'));}
function untagFx(now){
  clearTimeout(unfxT);
  const go=()=>{fxEls.forEach(el=>{el.classList.remove('fx');el.style.removeProperty('--d');el.style.removeProperty('--dx');el.style.removeProperty('--dy');});fxEls=[];body.classList.remove('fxing');};
  if(now)go();else unfxT=setTimeout(go,2300);
}
function startLoop(){if(!running){running=true;requestAnimationFrame(frame);}}
function prepFx(reverse){
  const f=fab.getBoundingClientRect(),fx=f.left+f.width/2,fy=f.top+f.height/2;
  const items=fxEls.map(el=>{
    const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    return {el,r,vis:r.bottom>0&&r.top<H,dist:Math.hypot(cx-fx,cy-fy),ux:cx-fx,uy:cy-fy};
  });
  const max=Math.max(1,...items.filter(i=>i.vis).map(i=>i.dist));
  for(const i of items){
    const len=Math.hypot(i.ux,i.uy)||1;
    const d=i.vis?(reverse?(1-i.dist/max):(i.dist/max))*650:0;
    i.el.style.setProperty('--d',d+'ms');
    i.el.style.setProperty('--dx',(i.ux/len*46+(Math.random()-.5)*20).toFixed(1)+'px');
    i.el.style.setProperty('--dy',(i.uy/len*46-20+(Math.random()-.5)*20).toFixed(1)+'px');
    i.delay=d;
  }
  return items;
}
function enter(){
  if(thinking)return;thinking=true;
  readTheme();tagFx();body.classList.add('fxing');
  const items=prepFx(false);
  body.classList.add('thinking');fab.setAttribute('aria-label','Cerrar la mesa de ideas');fab.setAttribute('aria-expanded','true');targetI=1;startLoop();
  for(const i of items){
    if(!i.vis)continue;
    const n=Math.min(42,Math.round(i.r.width*i.r.height/2600));
    setTimeout(()=>{for(let k=0;k<n;k++)spawnDust(i.r.left+Math.random()*i.r.width,i.r.top+Math.random()*i.r.height,1);},i.delay+120);
  }
  setMode(mode);
  clearTimeout(goneT);goneT=setTimeout(()=>body.classList.add('gone'),1500);
}
function exit(){
  if(!thinking)return;thinking=false;
  commitEdit();save();clearTimeout(goneT);
  body.classList.remove('gone','calm');fab.setAttribute('aria-label','Abrir la mesa de ideas');fab.setAttribute('aria-expanded','false');targetI=.55;
  skyUntil=performance.now()+1400;startLoop();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{prepFx(true);body.classList.remove('thinking');untagFx(false);}));
}
fab.addEventListener('click',()=>thinking?exit():enter());

/* ======================= INTERACCIÓN ======================= */
let drag=null,hoverT=null,dropInfo=null,lastTap={t:0,x:0,y:0,id:null};
function hitScreen(x,y,except,r=30){
  let best=null,bd=r;
  for(const n of nodes){if(n.id===except||n.rx==null)continue;const d=Math.hypot(n.rx-x,n.ry-y);if(d<bd){bd=d;best=n;}}
  return best;
}
function isDouble(p,id){
  const now=performance.now();
  const dbl=now-lastTap.t<330&&Math.hypot(p.x-lastTap.x,p.y-lastTap.y)<26&&lastTap.id===id;
  lastTap=dbl?{t:0,x:0,y:0,id:null}:{t:now,x:p.x,y:p.y,id};
  return dbl;
}
mesa.addEventListener('pointerdown',e=>{
  if(e.target.isContentEditable||e.target.closest('.g-label,.g-btn'))return;
  if(editing)commitEdit();
  if(document.activeElement&&document.activeElement.classList.contains('g-label'))document.activeElement.blur();
  const p={x:e.clientX,y:e.clientY},el=e.target.closest('.idea');
  if(el){
    const n=byId(+el.dataset.id);if(!n||n.rx==null)return;
    drag={n,ox:p.x-n.rx,oy:p.y-n.ry,sx:n.x,sy:n.y,link:e.shiftKey&&LINKMODES.has(mode),moved:false,start:p,px:p.x,py:p.y};
    select(n.id);
  }else drag={pan:true,lx:p.x,ly:p.y,moved:false,start:p};
  mesa.setPointerCapture(e.pointerId);
});
mesa.addEventListener('pointermove',e=>{
  if(!drag)return;
  const p={x:e.clientX,y:e.clientY};
  if(!drag.moved&&Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>4){drag.moved=true;body.classList.add('dragging');}
  if(!drag.moved)return;
  if(drag.pan){
    const dx=p.x-drag.lx,dy=p.y-drag.ly;drag.lx=p.x;drag.ly=p.y;
    if(mode==='constelacion')for(const n of nodes){n.x+=dx;n.y+=dy;n.rx+=dx;n.ry+=dy;}
    else if(mode==='contextos')for(const n of nodes){n.cx+=dx;n.cy+=dy;n.rx+=dx;n.ry+=dy;}
    else if(mode in scroll){scroll[mode]=clamp(scroll[mode]+dy,minScroll[mode],0);if(mode==='horizonte')hzX=clamp(hzX+dx,hzMin(),0);}
  }else if(drag.link){
    drag.px=p.x;drag.py=p.y;hoverT=hitScreen(p.x,p.y,drag.n.id,40);
  }else{
    const n=drag.n;n.rx=p.x-drag.ox;n.ry=p.y-drag.oy;
    if(mode==='constelacion'){n.x=n.rx;n.y=n.ry;n.vx=n.vy=0;}
    hoverT=LINKMODES.has(mode)?hitScreen(n.rx,n.ry,n.id,30):null;
    dropInfo=hoverT?null:computeDrop(n,p.x,p.y);
  }
});
function endDrag(e){
  if(!drag)return;
  const d=drag;drag=null;body.classList.remove('dragging');
  const p={x:e.clientX,y:e.clientY};
  if(d.pan){
    if(!d.moved){if(isDouble(p,null))createAt(p);else select(null);}
    else save();
  }else if(d.link){
    if(hoverT)toggleLink(d.n.id,hoverT.id);
  }else if(d.moved){
    const n=d.n;
    if(hoverT){toggleLink(n.id,hoverT.id);if(mode==='constelacion')n.back={x:d.sx,y:d.sy};}
    else if(mode==='contextos'){
      n.cx=n.rx;n.cy=n.ry;
      const t=boxAt(p.x,p.y);
      if(t!=null&&t!==n.tag){setTag(n.id,t);toast('Movida a «'+L.ctx[t]+'»');}
    }
    else if(mode!=='constelacion'&&mode!=='flujo'&&mode!=='agentes')applyDrop(n,computeDrop(n,p.x,p.y));
    save();
  }else if(isDouble(p,d.n.id))startEdit(d.n);
  hoverT=null;dropInfo=null;
}
mesa.addEventListener('pointerup',endDrag);
mesa.addEventListener('pointercancel',endDrag);
mesa.addEventListener('wheel',e=>{
  if(mode in scroll){scroll[mode]=clamp(scroll[mode]-e.deltaY,minScroll[mode],0);if(mode==='horizonte')hzX=clamp(hzX-e.deltaX,hzMin(),0);e.preventDefault();}
},{passive:false});

function outlineRows(){return nodes.slice().sort((a,b)=>a.e.order-b.e.order);}
function indent(n,dir){n.e.depth=Math.max(0,n.e.depth+dir);normOutline();save();}

addEventListener('keydown',e=>{
  const ae=document.activeElement;
  if(ae&&ae.classList&&ae.classList.contains('g-label')){if(e.key==='Enter'||e.key==='Escape'){e.preventDefault();ae.blur();}return;}
  if(editing){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const n=editing.n,kept=commitEdit();if(kept&&mode==='esquema')createAfter(n);}
    else if(e.key==='Escape'){e.preventDefault();commitEdit(true);}
    else if(e.key==='Tab'&&mode==='esquema'){e.preventDefault();indent(editing.n,e.shiftKey?-1:1);}
    return;
  }
  if(!thinking||e.metaKey||e.ctrlKey)return;
  const idx=MODES.findIndex(m=>m.k===mode),s=byId(sel),key=e.key.toLowerCase();
  if(e.key==='Escape'){body.classList.contains('calm')?toggleCalm():exit();}
  else if(/^[0-4]$/.test(e.key)&&s)setTag(s.id,+e.key);
  else if((e.key==='Delete'||e.key==='Backspace')&&s){e.preventDefault();removeNode(s.id);}
  else if(e.key==='Enter'&&s){e.preventDefault();startEdit(s);}
  else if(key==='h')toggleCalm();
  else if(key==='g')toggleGrav();
  else if(key==='t')cycleKind(e.shiftKey?-1:1);
  else if(key==='p'&&mode==='matriz')cyclePreset();
  else if(e.key==='ArrowRight')setMode(MODES[(idx+1)%MODES.length].k);
  else if(e.key==='ArrowLeft')setMode(MODES[(idx+MODES.length-1)%MODES.length].k);
  else if(mode==='esquema'&&e.key==='Tab'&&s){e.preventDefault();indent(s,e.shiftKey?-1:1);}
  else if(mode==='esquema'&&(e.key==='ArrowUp'||e.key==='ArrowDown')){
    e.preventDefault();const rows=outlineRows();
    if(!s){if(rows.length)select(rows[0].id);return;}
    const i=rows.indexOf(s),j=i+(e.key==='ArrowUp'?-1:1);if(j<0||j>=rows.length)return;
    if(e.altKey){[rows[i].e.order,rows[j].e.order]=[rows[j].e.order,rows[i].e.order];normOutline();save();}
    else select(rows[j].id);
  }
  else if(key==='n'){
    e.preventDefault();
    if(mode==='esquema'){const rows=outlineRows();if(s)createAfter(s);else if(rows.length)createAfter(rows[rows.length-1]);else createAt({x:G.es.x,y:G.es.y0});}
    else createAt(s&&s.rx!=null?{x:s.rx+90+Math.random()*40,y:s.ry+(Math.random()-.5)*100}:{x:W/2+(Math.random()-.5)*200,y:H/2+(Math.random()-.5)*160});
  }
});

/* ======================= FÍSICA (gravedad) ======================= */
function physics(){
  const N=nodes;
  for(let i=0;i<N.length;i++){const a=N[i];for(let j=i+1;j<N.length;j++){const b=N[j];
    const dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy+.01;if(d2>260000)continue;
    const d=Math.sqrt(d2),f=Math.min(2200/d2,1.2);a.vx-=dx/d*f;a.vy-=dy/d*f;b.vx+=dx/d*f;b.vy+=dy/d*f;}}
  for(const [ia,ib] of links){const a=byId(ia),b=byId(ib);if(!a||!b)continue;
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,f=(d-150)*.0022;
    a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;}
  for(const n of N){
    if(drag&&drag.n===n&&!drag.link){n.vx=n.vy=0;continue;}
    n.vx+=(W/2-n.x)*.00022+(Math.random()-.5)*.02;n.vy+=(H/2-n.y)*.00022+(Math.random()-.5)*.02;
    n.vx*=.9;n.vy*=.9;const sp=Math.hypot(n.vx,n.vy);if(sp>5){n.vx*=5/sp;n.vy*=5/sp;}
    n.x+=n.vx;n.y+=n.vy;
  }
}

/* ======================= RENDER ======================= */
function line(x0,y0,x1,y1,a){lx.strokeStyle=`rgba(${INK},${a})`;lx.beginPath();lx.moveTo(x0,y0);lx.lineTo(x1,y1);lx.stroke();}
function edgeGeom(p,q,type,r){
  const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
  let a,b,c1,c2;
  if(type==='h'){
    a={x:p.x+r,y:p.y};b={x:q.x-r,y:q.y};const k=Math.max(40,Math.abs(b.x-a.x)/2);
    c1={x:a.x+k,y:a.y};c2={x:b.x-k,y:b.y};
  }else if(type==='v'){
    const sg=Math.sign(dy)||1;a={x:p.x,y:p.y+r*sg};b={x:q.x,y:q.y-r*sg};const k=Math.max(30,Math.abs(b.y-a.y)/2)*sg;
    c1={x:a.x,y:a.y+k};c2={x:b.x,y:b.y-k};
  }else{
    a={x:p.x+ux*r,y:p.y+uy*r};b={x:q.x-ux*r,y:q.y-uy*r};
    const bend=type==='arc'?.14:0,mx=(a.x+b.x)/2-(b.y-a.y)*bend,my=(a.y+b.y)/2+(b.x-a.x)*bend;
    c1={x:(a.x+2*mx)/3,y:(a.y+2*my)/3};c2={x:(b.x+2*mx)/3,y:(b.y+2*my)/3};
  }
  return {a,b,c1,c2};
}
function bz(g,t){const u=1-t;return {x:u*u*u*g.a.x+3*u*u*t*g.c1.x+3*u*t*t*g.c2.x+t*t*t*g.b.x,y:u*u*u*g.a.y+3*u*u*t*g.c1.y+3*u*t*t*g.c2.y+t*t*t*g.b.y};}

/* cajas de contextos (se animan suavemente) */
const boxAnim=new Map();
function updateBoxes(){
  const target=new Map();
  if(mode==='contextos'){
    for(const n of nodes){
      if(!n.tag||n.rx==null)continue;
      if(drag&&drag.n===n&&drag.moved&&!drag.link)continue;
      const w=Math.max((txts.get(n.id).offsetWidth||60)/2,14);
      const x0=n.rx-w-24,x1=n.rx+w+24,y0=n.ry-42,y1=n.ry+(n.kind==='idea'?40:52);
      const b=target.get(n.tag);
      if(!b)target.set(n.tag,{x0,x1,y0,y1});
      else{b.x0=Math.min(b.x0,x0);b.x1=Math.max(b.x1,x1);b.y0=Math.min(b.y0,y0);b.y1=Math.max(b.y1,y1);}
    }
  }
  for(const [t,b] of target){
    const a=boxAnim.get(t);
    if(!a)boxAnim.set(t,{...b});
    else for(const k of ['x0','x1','y0','y1'])a[k]+=(b[k]-a[k])*.2;
  }
  for(const t of [...boxAnim.keys()])if(!target.has(t))boxAnim.delete(t);
  for(const el of ctxLabels){
    const b=boxAnim.get(+el.dataset.i);
    if(!b){el.style.display='none';continue;}
    el.style.display='';el.style.left=(b.x0+10)+'px';el.style.top=(b.y0+6)+'px';
  }
}

function drawGuides(a){
  const g=G;lx.lineWidth=1;
  if(mode==='matriz'){
    const {x0,x1,y0,y1}=g.mr,mx=(x0+x1)/2,my=(y0+y1)/2;
    lx.strokeStyle=`rgba(${INK},${.05*a})`;lx.beginPath();
    if(lx.roundRect)lx.roundRect(x0,y0,x1-x0,y1-y0,14);else lx.rect(x0,y0,x1-x0,y1-y0);lx.stroke();
    line(x0,my,x1,my,.16*a);line(mx,y0,mx,y1,.16*a);
    if(!g.narrow){lx.setLineDash([2,5]);line(g.tw+12,y0,g.tw+12,y1,.08*a);lx.setLineDash([]);}
  }else if(mode==='orbitas'){
    const gr=lx.createRadialGradient(g.oc.x,g.oc.y,0,g.oc.x,g.oc.y,g.R[1]);
    gr.addColorStop(0,`rgba(${TAGRGB[1]},${.12*a})`);gr.addColorStop(1,`rgba(${TAGRGB[1]},0)`);
    lx.fillStyle=gr;lx.beginPath();lx.arc(g.oc.x,g.oc.y,g.R[1],0,6.283);lx.fill();
    for(let i=1;i<4;i++){
      const hot=dropInfo&&dropInfo.ring===i;
      lx.strokeStyle=`rgba(${INK},${(hot?.3:.07)*a})`;lx.beginPath();lx.arc(g.oc.x,g.oc.y,g.R[i],0,6.283);lx.stroke();
    }
    if(dropInfo&&dropInfo.ring===0){lx.strokeStyle=`rgba(${INK},${.3*a})`;lx.beginPath();lx.arc(g.oc.x,g.oc.y,30,0,6.283);lx.stroke();}
  }else if(mode==='horizonte'){
    for(let i=1;i<4;i++){const x=g.hz.x0+g.hz.cw*i+hzX;
      const gr=lx.createLinearGradient(0,g.hz.y0-60,0,H-110);gr.addColorStop(0,`rgba(${INK},0)`);gr.addColorStop(.2,`rgba(${INK},${.09*a})`);gr.addColorStop(1,`rgba(${INK},0)`);
      lx.strokeStyle=gr;lx.beginPath();lx.moveTo(x,g.hz.y0-60);lx.lineTo(x,H-110);lx.stroke();}
  }else if(mode==='esquema'){
    const rows=outlineRows();lx.strokeStyle=`rgba(${INK},${.13*a})`;
    rows.forEach((n,i)=>{
      if(n.e.depth===0||n.rx==null)return;
      let p=null;for(let j=i-1;j>=0;j--){if(rows[j].e.depth===n.e.depth-1){p=rows[j];break;}}
      if(!p||p.rx==null)return;
      lx.beginPath();lx.moveTo(p.rx,p.ry+9);lx.lineTo(p.rx,n.ry);lx.lineTo(n.rx-8,n.ry);lx.stroke();
    });
  }else if(mode==='capas'){
    const c=g.cp;
    if(dropInfo&&dropInfo.lane!=null){lx.fillStyle=`rgba(${INK},${.04*a})`;lx.fillRect(28,c.y0+c.lh*dropInfo.lane,W-56,c.lh);}
    lx.setLineDash([2,6]);for(let i=0;i<=c.n;i++){const y=c.y0+c.lh*i;line(28,y,W-28,y,(i===0||i===c.n?.05:.1)*a);}lx.setLineDash([]);
    if(!g.narrow)line(c.x0-40,c.y0+8,c.x0-40,c.y1-8,.06*a);
  }else if(mode==='contextos'){
    for(const [t,b] of boxAnim){
      const c=TAGRGB[t];
      lx.fillStyle=`rgba(${c},${.035*a})`;lx.strokeStyle=`rgba(${c},${.38*a})`;
      lx.setLineDash([4,5]);lx.beginPath();
      if(lx.roundRect)lx.roundRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0,16);else lx.rect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0);
      lx.fill();lx.stroke();lx.setLineDash([]);
    }
  }else if(mode==='agentes'&&agentGeo&&!agentEmpty){
    const {cx,cy,R0,step,maxD,kx}=agentGeo;
    for(let d=1;d<=maxD;d++){const r=R0+d*step;lx.strokeStyle=`rgba(${INK},${.045*a})`;lx.beginPath();lx.ellipse(cx,cy,r*kx,r,0,0,6.283);lx.stroke();}
    const gr=lx.createRadialGradient(cx,cy,0,cx,cy,step*.9);gr.addColorStop(0,`rgba(${TAGRGB[1]},${.13*a})`);gr.addColorStop(1,`rgba(${TAGRGB[1]},0)`);
    lx.fillStyle=gr;lx.beginPath();lx.arc(cx,cy,step*.9,0,6.283);lx.fill();
  }
  if(trayRow){
    lx.fillStyle=`rgba(${INK},${.4*a})`;lx.font='500 10px "Hanken Grotesk", system-ui, sans-serif';lx.textAlign='center';
    lx.fillText(trayRow.label.toUpperCase(),W/2,trayRow.y-34);lx.textAlign='start';
  }
}

function drawMesa(t){
  const eng=ENG.has(mode);
  breath+=(((mode==='constelacion'&&!grav)||mode==='orbitas'||mode==='contextos'||mode==='agentes'?1:0)-breath)*.05;
  gA+=(1-gA)*.05;
  linkA+=((LINKMODES.has(mode)?1:0)-linkA)*.08;
  arrowA+=((eng?1:0)-arrowA)*.08;
  flowA+=((mode==='flujo'||mode==='agentes'?1:0)-flowA)*.05;

  for(const n of nodes){if(n.back){n.x+=(n.back.x-n.x)*.18;n.y+=(n.back.y-n.y)*.18;if(Math.hypot(n.back.x-n.x,n.back.y-n.y)<.5)delete n.back;}}
  if(mode==='constelacion'&&grav)physics();
  if(mode==='horizonte'){mesa.style.setProperty('--cw',(G.hz.cw-(G.narrow?16:28))+'px');hzX=clamp(hzX,hzMin(),0);guides.style.transform=hzX?`translateX(${hzX}px)`:'';}
  else if(guides.style.transform)guides.style.transform='';
  layout(t);

  for(const n of nodes){
    const T=LAY.get(n.id),el=els.get(n.id);if(!T||!el)continue;
    const dragging=drag&&drag.n===n&&drag.moved&&!drag.link;
    if(!dragging){
      if(n.rx==null){n.rx=T.x;n.ry=T.y;}
      n.rx+=(T.x-n.rx)*.16;n.ry+=(T.y-n.ry)*.16;
    }
    el.style.transform=`translate3d(${n.rx}px,${n.ry}px,0)`;
    el.classList.toggle('tray',!!T.tray);el.classList.toggle('core',n.o.ring===0);el.classList.toggle('root',n.e.depth===0);
  }
  if(guideHint)guideHint.classList.toggle('off',!hintNeeded());
  updateBoxes();

  lx.clearRect(0,0,W,H);
  drawGuides(gA);

  if(linkA>.01){
    const type=mode==='flujo'?(G.narrow?'v':'h'):mode==='capas'?'v':mode==='contextos'?'arc':'line';
    for(const [a,b] of links){
      const p=byId(a),q=byId(b);if(!p||!q||p.rx==null||q.rx==null)continue;
      let ty=type;
      if(ty==='v'&&Math.abs(q.ry-p.ry)<30)ty='arc';
      if(ty==='h'&&q.rx<p.rx+20)ty='arc';
      const g=edgeGeom({x:p.rx,y:p.ry},{x:q.rx,y:q.ry},ty,eng?13:0);
      const al=(eng?.3:.34)*linkA;
      const gr=lx.createLinearGradient(p.rx,p.ry,q.rx,q.ry);
      gr.addColorStop(0,`rgba(${TAGRGB[p.tag]},${al})`);gr.addColorStop(1,`rgba(${TAGRGB[q.tag]},${al})`);
      lx.strokeStyle=gr;lx.lineWidth=eng?1:.8;
      lx.beginPath();lx.moveTo(g.a.x,g.a.y);lx.bezierCurveTo(g.c1.x,g.c1.y,g.c2.x,g.c2.y,g.b.x,g.b.y);lx.stroke();
      if(arrowA>.01){
        const an=Math.atan2(g.b.y-g.c2.y,g.b.x-g.c2.x);
        lx.strokeStyle=`rgba(${TAGRGB[q.tag]},${Math.min(1,al*1.8)*arrowA})`;
        lx.beginPath();lx.moveTo(g.b.x-Math.cos(an-.45)*7,g.b.y-Math.sin(an-.45)*7);lx.lineTo(g.b.x,g.b.y);lx.lineTo(g.b.x-Math.cos(an+.45)*7,g.b.y-Math.sin(an+.45)*7);lx.stroke();
      }
      if(flowA>.01&&!REDUCED){
        const hsh=(a*.618+b*.382)%1;
        for(let k=0;k<2;k++){
          const tt=(t*.00022+hsh+k*.5)%1,P=bz(g,tt);
          lx.fillStyle=`rgba(${TAGRGB[p.tag]},${.85*flowA*Math.sin(tt*Math.PI)})`;
          lx.beginPath();lx.arc(P.x,P.y,1.7,0,6.283);lx.fill();
        }
      }
    }
  }
  if(drag&&drag.link&&drag.moved){
    lx.setLineDash([3,6]);lx.strokeStyle=`rgba(${INK},.45)`;lx.lineWidth=1;
    lx.beginPath();lx.moveTo(drag.n.rx,drag.n.ry);lx.lineTo(drag.px,drag.py);lx.stroke();lx.setLineDash([]);
  }
  if(hoverT){lx.strokeStyle=`rgba(${INK},.4)`;lx.lineWidth=1;lx.beginPath();lx.arc(hoverT.rx,hoverT.ry,20+Math.sin(t*.008)*2,0,6.283);lx.stroke();}
  if(dropInfo&&dropInfo.line){
    const [a,b,y]=dropInfo.line;lx.strokeStyle=`rgba(${INK},.55)`;lx.lineWidth=1;
    lx.beginPath();lx.moveTo(a,y);lx.lineTo(b,y);lx.stroke();
    lx.fillStyle=`rgba(${INK},.7)`;lx.beginPath();lx.arc(a,y,2.5,0,6.283);lx.fill();
  }
}
function frame(t){
  const live=thinking||t<skyUntil||dust.length>0;
  if(!live){running=false;return;}
  drawSky(t);
  if(thinking||body.classList.contains('thinking'))drawMesa(t);
  requestAnimationFrame(frame);
}
setMode(mode);
booted=true;
setInterval(()=>{if(thinking&&grav&&mode==='constelacion')save();},3000);
addEventListener('palettechange',()=>{if(thinking)buildGuides(true);});
})();

