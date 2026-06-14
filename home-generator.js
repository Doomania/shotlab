/* Shot Lab — Main App Logic
 * Depends on: /data/moves.js  /data/models.js  /data/templates.js
 * Loaded after those data scripts. */
var MOVES     = window.MOVES     || [];
var MODELS    = window.MODELS    || {};
var TEMPLATES = window.TEMPLATES || [];
var OPP       = window.OPP       || [];
var CATS = ["All","Dolly","Lens","Framing","Environment","Focus","Pivot","Orbital","Vertical","Aerial","Stylized","Tracking"];
var currentModel = "seedance";
var ratioUserSet = false;
/* ---------- shared utils ---------- */
const toast=document.getElementById("toast");
function showToast(msg){toast.textContent=msg||"Copied to clipboard";toast.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove("on"),1400);}
function copy(txt){if(!txt)return;navigator.clipboard?.writeText(txt).then(()=>showToast()).catch(()=>fallbackCopy(txt));}
function fallbackCopy(txt){const ta=document.createElement("textarea");ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");showToast();}catch(e){}document.body.removeChild(ta);}
function val(id){return document.getElementById(id).value;}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
function low(s){return s?s.charAt(0).toLowerCase()+s.slice(1):s;}

/* ---------- data ---------- */




/* ---------- model formats ---------- */

/* ---------- starter templates ---------- */


/* conflicting direction pairs */


/* ---------- state ---------- */
const selected=[];
let activeCat="All";
let dragFrom=null;

/* ---------- model tabs ---------- */
const modelsEl=document.getElementById("models");
Object.keys(MODELS).forEach(k=>{
  const b=document.createElement("button");
  b.className="model"+(k===currentModel?" on":"");b.textContent=MODELS[k].label;b.dataset.k=k;
  b.onclick=()=>{currentModel=k;[...modelsEl.children].forEach(c=>c.classList.toggle("on",c.dataset.k===k));document.getElementById("ratio").value=MODELS[k].ratio;generate();};
  modelsEl.appendChild(b);
});

/* ---------- templates ---------- */
const tplRow=document.getElementById("tplRow");
TEMPLATES.forEach(t=>{
  const b=document.createElement("button");b.className="tpl";b.textContent=t.name;
  b.onclick=()=>applyTemplate(t);
  tplRow.appendChild(b);
});
function applyTemplate(t){
  document.getElementById("subject").value=t.subject;
  document.getElementById("style").value=t.style;
  document.getElementById("light").value=t.light;
  document.getElementById("pace").value=t.pace;
  currentModel=t.model;[...modelsEl.children].forEach(c=>c.classList.toggle("on",c.dataset.k===t.model));
  document.getElementById("ratio").value=t.ratio;
  selected.length=0;t.moves.forEach(id=>selected.push(id));
  syncMoves();generate();
  document.getElementById("outBox").scrollIntoView({behavior:"smooth",block:"center"});
}

/* ---------- movement picker ---------- */
const pickerEl=document.getElementById("picker");
function renderPicker(){
  pickerEl.innerHTML="";
  CATS.filter(c=>c!=="All").forEach(cat=>{
    const ms=MOVES.filter(m=>m.cat===cat);if(!ms.length)return;
    const h=document.createElement("div");h.className="pk-cat";h.textContent=cat;pickerEl.appendChild(h);
    const wrap=document.createElement("div");wrap.className="pk-wrap";
    ms.forEach(m=>{const b=document.createElement("button");b.className="pk"+(selected.includes(m.id)?" on":"");b.textContent=m.name;b.onclick=()=>toggleMove(m.id);wrap.appendChild(b);});
    pickerEl.appendChild(wrap);
  });
}
function renderSelChips(){
  const el=document.getElementById("selChips");el.innerHTML="";
  document.getElementById("selCount").textContent=selected.length?"("+selected.length+")":"";
  selected.forEach((id,i)=>{
    const m=MOVES.find(x=>x.id===id);
    const chip=document.createElement("div");chip.className="sel-chip";chip.draggable=true;
    chip.innerHTML='<span class="h">&#10303;</span>'+m.name+'<button title="remove">&times;</button>';
    chip.querySelector("button").onclick=()=>toggleMove(id);
    chip.addEventListener("dragstart",()=>{dragFrom=i;chip.style.opacity=".4";});
    chip.addEventListener("dragend",()=>chip.style.opacity="1");
    chip.addEventListener("dragover",e=>e.preventDefault());
    chip.addEventListener("drop",e=>{e.preventDefault();if(dragFrom!=null&&dragFrom!==i){const[v]=selected.splice(dragFrom,1);selected.splice(i,0,v);dragFrom=null;syncMoves();generate();}});
    el.appendChild(chip);
  });
}
function toggleMove(id){
  const i=selected.indexOf(id);
  if(i>=0){selected.splice(i,1);showToast('Removed — '+MOVES.find(m=>m.id===id).name);}
  else{selected.push(id);showToast('Added — '+MOVES.find(m=>m.id===id).name);}
  syncMoves();generate();updateSelPill();
}
function syncMoves(){renderPicker();renderSelChips();renderGrid();}

/* ---------- prompt build ---------- */
function movesText(){
  const ps=selected.map(id=>MOVES.find(m=>m.id===id).prompt);
  if(!ps.length)return"";
  if(ps.length===1)return ps[0];
  return ps.slice(0,-1).join(", then ")+", then "+ps[ps.length-1];
}
function buildPrompt(){
  const model=MODELS[currentModel];
  const p={subject:val("subject").trim(),moves:movesText(),style:val("style").trim(),light:val("light").trim(),pace:val("pace"),ratio:val("ratio")};
  let s=model.build(p).filter(Boolean).join(model.sep);
  s=s.replace(/\s+/g," ").replace(/\s+([.,;])/g,"$1").trim();
  if(s&&!/[.!?]$/.test(s))s+=".";
  if(p.ratio)s+=" ("+p.ratio+")";
  return s;
}

/* ---------- warnings ---------- */
function checkWarnings(){
  const w=[];
  if(!val("subject").trim())w.push(["w","!","Add a subject — the prompt needs something to film."]);
  if(selected.length>3)w.push(["t","\u25B2",selected.length+" camera moves — most models blend 2\u20133 cleanly. Consider trimming."]);
  const conf=[];OPP.forEach(([a,b])=>{if(selected.includes(a)&&selected.includes(b))conf.push(MOVES.find(m=>m.id===a).name+" + "+MOVES.find(m=>m.id===b).name);});
  if(conf.length)w.push(["w","\u00D7","Conflicting directions: "+conf.join(", ")+". Pick one direction."]);
  if(!val("style").trim())w.push(["t","\u25B2","No style set \u2014 add a look (e.g. anime, photoreal, noir)."]);
  if(!val("light").trim())w.push(["t","\u25B2","No lighting set \u2014 add a source or mood (e.g. golden hour, neon)."]);
  return w;
}
function renderWarns(){
  const el=document.getElementById("warns");el.innerHTML="";
  const w=checkWarnings();
  if(!w.length){el.innerHTML='<div class="okline">&#10003; Looks solid \u2014 ready to copy.</div>';return;}
  w.forEach(([cls,ic,msg])=>{const d=document.createElement("div");d.className="warn "+cls;d.innerHTML='<span class="ic">'+ic+'</span><span>'+msg+'</span>';el.appendChild(d);});
}

/* ---------- generate ---------- */
function generate(){document.getElementById("out").value=buildPrompt();renderWarns();}
document.getElementById("genBtn").onclick=()=>{generate();const b=document.getElementById("outBox");b.classList.add("flash");setTimeout(()=>b.classList.remove("flash"),450);b.scrollIntoView({behavior:"smooth",block:"center"});};
document.getElementById("copyBtn").onclick=()=>copy(val("out"));
["subject","style","light"].forEach(id=>document.getElementById(id).addEventListener("input",generate));
["pace"].forEach(id=>document.getElementById(id).addEventListener("change",generate));
document.getElementById("ratio").addEventListener("change",()=>{ratioUserSet=true;generate();});

/* ---------- library grid + pills ---------- */
const pillsEl=document.getElementById("pills");
CATS.forEach(c=>{const b=document.createElement("button");b.className="pill"+(c==="All"?" on":"");b.textContent=c;b.dataset.cat=c;b.onclick=()=>{activeCat=c;[...pillsEl.children].forEach(p=>p.classList.toggle("on",p.dataset.cat===c));renderGrid();};pillsEl.appendChild(b);});
const gridEl=document.getElementById("grid");
function renderGrid(){
  gridEl.innerHTML="";
  MOVES.filter(m=>activeCat==="All"||m.cat===activeCat).forEach(m=>{
    const idx=MOVES.indexOf(m)+1;
    const card=document.createElement("div");card.style.contentVisibility='auto';card.style.containIntrinsicSize='0 228px';
    card.className="card"+(selected.includes(m.id)?" sel":"");card.dataset.demo=m.demo;
    card.innerHTML='<div class="check">&#10003;</div><div class="stage"><div class="frame"><div class="grid-floor"></div><div class="occ"></div><div class="ring"></div><div class="subj2"></div><div class="subj"></div><div class="lens"></div></div></div><div class="meta"><div class="top"><span class="num">'+String(idx).padStart(2,"0")+'</span><span class="name">'+m.name+'</span></div><div class="alias">'+m.alias+' &middot; '+m.cat+'</div><p class="desc">'+m.desc+'</p><p class="feel">'+m.feel+'</p></div>';
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-pressed',selected.includes(m.id)?'true':'false');
    card.setAttribute('aria-label',m.name+': '+m.desc.replace(/<[^>]*>/g,''));
    card.onclick=()=>toggleMove(m.id);
    card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleMove(m.id);}};
    gridEl.appendChild(card);
  });
}

/* ---------- init ---------- */
/* ---- dynamic move count ---- */
(function(){
  var el=document.getElementById("moveCount");
  if(el&&window.MOVES)el.textContent=window.MOVES.length;
})();

applyTemplate(TEMPLATES[0]);  // default: Anime Battle Dash
/* sticky selection pill */
const selPill=document.createElement('div');
selPill.id='selPill';
selPill.style.cssText='display:none;position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:40;background:var(--amber);color:#000;font-family:var(--disp);font-size:20px;letter-spacing:.5px;padding:12px 22px;border-radius:999px;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.5);white-space:nowrap;transition:opacity .2s';
selPill.onclick=()=>document.querySelector('.out-box').scrollIntoView({behavior:'smooth',block:'center'});
document.body.appendChild(selPill);
function updateSelPill(){const n=selected.length;const p=selPill;if(n>0){p.textContent=n+' move'+(n>1?'s':'')+' selected — view prompt ↑';p.style.display='block';}else{p.style.display='none';}}
updateSelPill();

/* resize the 3D studio when the Advanced panel opens */
document.getElementById("advStudio").addEventListener("toggle",e=>{if(e.target.open)requestAnimationFrame(()=>requestAnimationFrame(()=>{try{resize3D();}catch(_){}}));});

/* ============================================================
   3D CAMERA STUDIO  (Three.js)
   ============================================================ */
let scene,dirCam,dirRenderer,povCam,povRenderer,dummy,gizmo,pathLine,startMark,endMark;
let TARGET; // built inside init3D once THREE has loaded
// shot-camera spherical coords around TARGET
const shot={az: -0.6, pol: 1.35, dist: 6, ht: 1.6};
let startPose=null, endPose=null, playing=false, playT=0, playDur=4;

function makeGizmo(){
  const grp=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(.34,.26,.5),new THREE.MeshStandardMaterial({color:0xd6473a,roughness:.4}));
  const lens=new THREE.Mesh(new THREE.ConeGeometry(.16,.34,18),new THREE.MeshStandardMaterial({color:0x111111,roughness:.3}));
  lens.rotation.x=Math.PI/2;lens.position.z=.38;
  grp.add(body,lens);
  return grp;
}

function poseVec(p){
  return new THREE.Vector3(
    TARGET.x + p.dist*Math.sin(p.pol)*Math.cos(p.az),
    p.ht,
    TARGET.z + p.dist*Math.sin(p.pol)*Math.sin(p.az)
  );
}

function init3D(){
  TARGET=new THREE.Vector3(0,1.1,0);
  const cv=document.getElementById("director");
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x08080a);
  scene.fog=new THREE.Fog(0x08080a,14,30);

  // lights
  scene.add(new THREE.AmbientLight(0x6b7a90,.7));
  const key=new THREE.DirectionalLight(0xffe6c0,1.1);key.position.set(5,8,4);scene.add(key);
  const rim=new THREE.DirectionalLight(0xe0a84b,.6);rim.position.set(-6,4,-5);scene.add(rim);

  // floor grid
  const grid=new THREE.GridHelper(40,40,0x2a2a32,0x1a1a20);scene.add(grid);
  const disk=new THREE.Mesh(new THREE.CircleGeometry(1.4,40),new THREE.MeshStandardMaterial({color:0x16161a,roughness:1}));
  disk.rotation.x=-Math.PI/2;disk.position.y=.01;scene.add(disk);

  // dummy
  dummy=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({color:0xcfc9bd,roughness:.7,metalness:.05});
  const acc=new THREE.MeshStandardMaterial({color:0xe0a84b,roughness:.5,metalness:.1});
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.34,.28,1.0,18),mat);torso.position.y=1.25;dummy.add(torso);
  const hips=new THREE.Mesh(new THREE.CylinderGeometry(.28,.26,.32,16),mat);hips.position.y=.62;dummy.add(hips);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,.18,12),mat);neck.position.y=1.78;dummy.add(neck);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.26,20,16),acc);head.position.y=2.0;dummy.add(head);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.05,.12,10),mat);nose.rotation.x=Math.PI/2;nose.position.set(0,2.0,.26);dummy.add(nose); // facing +Z
  [[-.46,-.18],[.46,.18]].forEach(([x,rz])=>{const a=new THREE.Mesh(new THREE.CylinderGeometry(.1,.08,.92,12),mat);a.position.set(x,1.18,0);a.rotation.z=rz;dummy.add(a);});
  [-.16,.16].forEach(x=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(.13,.1,1.0,12),mat);l.position.set(x,.5,0);dummy.add(l);});
  scene.add(dummy);

  // gizmo
  gizmo=makeGizmo();scene.add(gizmo);

  // markers
  startMark=markerMesh(0x7bb274);endMark=markerMesh(0xd6473a);
  startMark.visible=false;endMark.visible=false;scene.add(startMark,endMark);

  // path line
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(64*3),3));
  pathLine=new THREE.Line(pg,new THREE.LineBasicMaterial({color:0xe0a84b}));pathLine.visible=false;scene.add(pathLine);

  // director-only helpers live on layer 1 so the lens POV never sees its own rig
  [gizmo,startMark,endMark,pathLine].forEach(o=>o.traverse(c=>c.layers.set(1)));

  // cameras
  dirCam=new THREE.PerspectiveCamera(50,16/9,.1,100);
  dirCam.position.set(7.5,5,7.5);dirCam.lookAt(TARGET);
  dirCam.layers.enable(1); // also see the rig helpers
  povCam=new THREE.PerspectiveCamera(38,172/104,.1,100); // layer 0 only — no rig

  dirRenderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  povRenderer=new THREE.WebGLRenderer({canvas:document.getElementById("pov"),antialias:true});
  dirRenderer.setPixelRatio(Math.min(devicePixelRatio,2));
  povRenderer.setPixelRatio(Math.min(devicePixelRatio,2));

  bindInteractions(cv);
  if(window.ResizeObserver){const ro=new ResizeObserver(()=>resize3D());ro.observe(cv.parentElement);ro.observe(document.querySelector(".povbox"));}
  resize3D();
  applyShot();
  animate();
}

function markerMesh(c){
  const g=new THREE.Group();
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.3,.04,8,24),new THREE.MeshBasicMaterial({color:c}));
  const pin=new THREE.Mesh(new THREE.SphereGeometry(.1,12,10),new THREE.MeshBasicMaterial({color:c}));
  g.add(ring,pin);return g;
}

function applyShot(){
  // clamp polar
  shot.pol=Math.max(.25,Math.min(Math.PI-.25,shot.pol));
  shot.dist=Math.max(2.5,Math.min(14,shot.dist));
  const p=poseVec(shot);
  gizmo.position.copy(p);
  gizmo.lookAt(TARGET);
  povCam.position.copy(p);
  povCam.lookAt(TARGET);
  document.getElementById("sDist").value=shot.dist.toFixed(1);
  document.getElementById("sHt").value=shot.ht.toFixed(1);
  document.getElementById("vDist").textContent=shot.dist.toFixed(1);
  document.getElementById("vHt").textContent=shot.ht.toFixed(1);
}

function bindInteractions(cv){
  let dragging=false,lx=0,ly=0;
  cv.addEventListener("mousedown",e=>{dragging=true;lx=e.clientX;ly=e.clientY;});
  window.addEventListener("mouseup",()=>dragging=false);
  window.addEventListener("mousemove",e=>{
    if(!dragging||playing)return;
    const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
    shot.az-=dx*0.008;
    shot.pol-=dy*0.006;
    shot.ht=TARGET.y + shot.dist*Math.cos(shot.pol); // height follows orbit
    shot.ht=Math.max(.2,shot.ht);
    applyShot();
  });
  cv.addEventListener("wheel",e=>{e.preventDefault();if(playing)return;shot.dist+=e.deltaY*0.006;applyShot();},{passive:false});
  // touch
  cv.addEventListener("touchstart",e=>{dragging=true;lx=e.touches[0].clientX;ly=e.touches[0].clientY;},{passive:true});
  cv.addEventListener("touchend",()=>dragging=false);
  cv.addEventListener("touchmove",e=>{if(!dragging||playing)return;const dx=e.touches[0].clientX-lx,dy=e.touches[0].clientY-ly;lx=e.touches[0].clientX;ly=e.touches[0].clientY;shot.az-=dx*0.01;shot.pol-=dy*0.008;shot.ht=Math.max(.2,TARGET.y+shot.dist*Math.cos(shot.pol));applyShot();},{passive:true});

  document.getElementById("sDist").oninput=e=>{shot.dist=+e.target.value;shot.ht=Math.max(.2,TARGET.y+shot.dist*Math.cos(shot.pol));applyShot();};
  document.getElementById("sHt").oninput=e=>{shot.ht=+e.target.value;shot.pol=Math.acos(Math.max(-1,Math.min(1,(shot.ht-TARGET.y)/shot.dist)));applyShot();};
  document.getElementById("sDur").oninput=e=>{playDur=+e.target.value;document.getElementById("vDur").textContent=playDur.toFixed(1)+"s";};

  document.getElementById("setStart").onclick=()=>{startPose={...shot};startMark.position.copy(poseVec(startPose));startMark.visible=true;flagBtn("setStart");updatePath();analyse();};
  document.getElementById("setEnd").onclick=()=>{endPose={...shot};endMark.position.copy(poseVec(endPose));endMark.visible=true;flagBtn("setEnd");updatePath();analyse();};
  document.getElementById("play").onclick=playMove;
  document.getElementById("reset").onclick=()=>{startPose=endPose=null;startMark.visible=endMark.visible=pathLine.visible=false;document.getElementById("setStart").classList.remove("marked");document.getElementById("setEnd").classList.remove("marked");document.getElementById("detName").textContent="Mark a start and end";document.getElementById("detName").classList.add("idle");document.getElementById("studioOut").value="";};
  document.getElementById("copyStudio").onclick=()=>copy(document.getElementById("studioOut").value);
}
function flagBtn(id){document.getElementById(id).classList.add("marked");}

function lerpPose(a,b,t){
  // shortest-arc azimuth interpolation
  let da=b.az-a.az;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  return{az:a.az+da*t,pol:a.pol+(b.pol-a.pol)*t,dist:a.dist+(b.dist-a.dist)*t,ht:a.ht+(b.ht-a.ht)*t};
}

function updatePath(){
  if(!startPose||!endPose){pathLine.visible=false;return;}
  const pos=pathLine.geometry.attributes.position.array;const N=32;
  for(let i=0;i<N;i++){const t=i/(N-1);const pp=lerpPose(startPose,endPose,t);const v=poseVec(pp);pos[i*3]=v.x;pos[i*3+1]=v.y;pos[i*3+2]=v.z;}
  pathLine.geometry.setDrawRange(0,N);pathLine.geometry.attributes.position.needsUpdate=true;pathLine.visible=true;
}

function playMove(){
  if(!startPose||!endPose){showToast("Set a Start and End first");return;}
  playing=true;playT=0;document.getElementById("rec").classList.add("on");
}

/* ---- analyse the move and write the prompt ---- */
function analyse(){
  if(!startPose||!endPose)return;
  const dAz=normAng(endPose.az-startPose.az);
  const dDist=endPose.dist-startPose.dist;
  const dHt=endPose.ht-startPose.ht;
  const parts=[],labels=[];
  // orbit / arc
  if(Math.abs(dAz)>0.35){
    const deg=Math.round(Math.abs(dAz)*180/Math.PI);
    const dir=dAz>0?"right":"left";
    labels.push("Arc / Orbit");
    parts.push(`a ${deg}\u00b0 arc orbiting ${dir} around the subject`);
  }
  // dolly
  if(Math.abs(dDist)>0.6){
    if(dDist<0){labels.push("Push In");parts.push("a dolly push-in toward the subject");}
    else{labels.push("Pull Back");parts.push("a dolly pull-back away from the subject");}
  }
  // vertical
  if(Math.abs(dHt)>0.5){
    if(dHt>0){labels.push("Crane Up");parts.push("a crane rise to a higher angle");}
    else{labels.push("Crane Down");parts.push("a crane descent to a lower angle");}
  }
  let detName,promptMove;
  if(!parts.length){detName="Static / Locked-off";promptMove="a near-static, locked-off frame";}
  else if(parts.length===1){detName=labels[0];promptMove=parts[0];}
  else{detName=labels.join(" + ");promptMove=parts.join(", combined with ");}

  // pacing from duration
  let pace= playDur<=2.5?"fast, energetic": playDur>=7?"slow, deliberate":"steady, controlled";

  const det=document.getElementById("detName");
  det.textContent=detName;det.classList.remove("idle");
  document.getElementById("studioOut").value=
    `Cinematic shot of the subject. Camera movement: ${promptMove}, over roughly ${playDur.toFixed(1)} seconds. ${cap(pace)} pacing, filmic depth of field, professional cinematography.`;
}
function normAng(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;}

function resize3D(){
  if(!dirRenderer)return;
  const cv=document.getElementById("director"), sw=cv.parentElement;
  const w=cv.clientWidth||sw.clientWidth||sw.offsetWidth, h=cv.clientHeight||460;
  if(w>0&&h>0){dirRenderer.setSize(w,h,false);dirCam.aspect=w/h;dirCam.updateProjectionMatrix();}
  const box=document.querySelector(".povbox"), pv=document.getElementById("pov");
  const pw=pv.clientWidth||box.clientWidth||170, ph=pv.clientHeight||box.clientHeight||102;
  if(pw>0&&ph>0){povRenderer.setSize(pw,ph,false);povCam.aspect=pw/ph;povCam.updateProjectionMatrix();}
}
window.addEventListener("resize",()=>{if(dirRenderer)resize3D();});

function animate(){
  requestAnimationFrame(animate);
  if(playing){
    playT+=1/60/playDur;
    if(playT>=1){playT=1;playing=false;document.getElementById("rec").classList.remove("on");}
    const pp=lerpPose(startPose,endPose,easeInOut(playT));
    Object.assign(shot,pp);applyShot();
  }
  // slow ambient orbit of director cam for life
  dirCam.lookAt(TARGET);
  dirRenderer.render(scene,dirCam);
  povRenderer.render(scene,povCam);
}
function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

/* ---- pause off-screen card animations (perf) ---- */
if('IntersectionObserver' in window){
  const aio=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      const stage=e.target.querySelector('.stage');
      if(stage) stage.style.animationPlayState=e.isIntersecting?'running':'paused';
      // pause all animated children
      e.target.querySelectorAll('[style*="animation"],[class]').forEach(el=>{
        if(!stage||!stage.contains(el)) return;
        el.style.animationPlayState=e.isIntersecting?'running':'paused';
      });
    });
  },{rootMargin:'200px'});
  // observe after grid renders
  const gridObs=new MutationObserver(()=>{
    document.querySelectorAll('.card:not([data-obs])').forEach(c=>{c.dataset.obs='1';aio.observe(c);});
  });
  gridObs.observe(document.getElementById('grid'),{childList:true});
}

/* load three.js then init */
(function(){
  const s=document.createElement("script");
  s.src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  s.onload=()=>{ try{init3D();}catch(e){console.error(e);} };
  s.onerror=()=>{document.getElementById("studio").querySelector(".stagewrap").innerHTML='<div style="padding:40px;font-family:var(--mono);color:var(--dust);font-size:13px">3D engine could not load — check your connection, then reload.</div>';};
  document.head.appendChild(s);
})();

/* ═══════════════════════════════════════════════════
   OUTPUT IMPROVEMENT BUTTONS
   ═══════════════════════════════════════════════════ */
window.modifyPrompt = function(type) {
  var out = document.getElementById("out");
  if (!out || !out.value.trim()) return;
  var p = out.value.trim();
  // preserve trailing ratio tag
  var ratioMatch = p.match(/\s*\(\d[\d.:]+\)\s*$/);
  var ratio = ratioMatch ? ratioMatch[0] : '';
  var base = p.replace(/\s*\(\d[\d.:]+\)\s*$/, '').trim().replace(/[.!]$/, '');
  var result = base;
  switch(type) {
    case 'cinematic':  result += ', film-quality depth of field, precise cinematic lens movement'; break;
    case 'dynamic':    result += ', dynamic kinetic energy, bold momentum-driven framing'; break;
    case 'shorter':
      var sentences = base.split('. ').filter(Boolean);
      result = sentences.slice(0, Math.max(2, Math.ceil(sentences.length/2))).join('. ');
      break;
    case 'anime':
      result = base.replace(/photoreal[\w\s]*/gi,'').replace(/\bcinematic\b/gi,'anime cinematic');
      result += ', bold expressive anime linework, dramatic motion blur'; break;
    case 'realistic':
      result = base.replace(/\b(anime|stylised|cartoon)[\w\s]*/gi,'');
      result += ', photorealistic, natural organic camera movement'; break;
    case 'handheld':   result += ', natural handheld camera shake, organic operator movement'; break;
    case 'musicvideo': result += ', music video aesthetic, rhythmic camera energy, controlled creative lighting'; break;
  }
  out.value = (result.trim().replace(/[,\s]+$/, '') + '.' + ratio).trim();
  analyzePrompt();
  var btn = document.querySelector('[onclick="modifyPrompt(\'' + type + '\')"]');
  if(btn){ btn.textContent = '✓ Applied'; setTimeout(function(){ btn.textContent = btn.dataset.label; }, 1200); }
};

/* ═══════════════════════════════════════════════════
   WHY THIS PROMPT WORKS
   ═══════════════════════════════════════════════════ */
function analyzePrompt() {
  var box = document.getElementById("whyBox");
  if (!box) return;
  var subj = (document.getElementById("subject")?.value || '').trim();
  var style = (document.getElementById("style")?.value || '').trim();
  var light = (document.getElementById("light")?.value || '').trim();
  var pace = (document.getElementById("pace")?.value || 'steady');
  var hasMoves = selected.length > 0;
  var moveNames = selected.map(function(id){ var m=MOVES.find(function(x){return x.id===id;}); return m?m.name:''; }).filter(Boolean);
  var model = MODELS[currentModel] ? MODELS[currentModel].label : 'Seedance';

  function row(ok, label, val) {
    var icon = ok ? '&#10003;' : '&#9650;';
    var cls = ok ? 'why-ok' : 'why-warn';
    return '<li class="' + cls + '">' + icon + ' <strong>' + label + ':</strong> ' + val + '</li>';
  }
  var html = '<ul class="why-list">';
  html += row(subj.length > 4, 'Subject', subj.length > 4 ? '\u201c' + subj.slice(0,55) + (subj.length > 55 ? '\u2026' : '') + '\u201d' : 'Add a specific subject.');
  html += row(hasMoves, 'Camera', hasMoves ? moveNames.join(', ') : 'No camera move selected.');
  html += row(!!style, 'Style', style || 'Add a visual style.');
  html += row(!!light, 'Lighting', light || 'Add lighting.');
  html += row(true, 'Pacing', pace + ' &middot; Format: ' + model);
  html += '</ul>';
  box.innerHTML = html;
  box.style.display = 'block';
}

/* hook analyzePrompt into generate */
var _origGenerate = typeof generate === 'function' ? generate : null;
function generateAndAnalyze() {
  if(_origGenerate) _origGenerate();
  analyzePrompt();
}


/* ---- post-init hooks ---- */
var _origGenBtn = document.getElementById("genBtn");
if (_origGenBtn) {
  var _prevClick = _origGenBtn.onclick;
  _origGenBtn.onclick = function() { if(_prevClick) _prevClick.call(this); analyzePrompt(); };
}
["subject","style","light"].forEach(function(id){
  var el=document.getElementById(id);
  if(el) el.addEventListener("input",analyzePrompt);
});
document.getElementById("pace")?.addEventListener("change",analyzePrompt);

/* ═══════════════════════════════════════════════════
   SHAREABLE URL — Q2
   Encodes current shot state into the URL hash.
   Format: #v1:<base64(JSON)>
   ═══════════════════════════════════════════════════ */

function _encodeState() {
  var state = {
    s:  (document.getElementById("subject")?.value || "").trim(),
    st: (document.getElementById("style")?.value   || "").trim(),
    l:  (document.getElementById("light")?.value   || "").trim(),
    p:  (document.getElementById("pace")?.value    || "steady"),
    r:  (document.getElementById("ratio")?.value   || "9:16"),
    m:  currentModel || "seedance",
    mv: selected.slice()
  };
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  } catch(e) { return null; }
}

function _decodeState(hash) {
  if (!hash || !hash.startsWith("#v1:")) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(hash.slice(4)))));
  } catch(e) { return null; }
}

/* Update the URL bar silently whenever the prompt rebuilds */
var _origBuildPrompt = buildPrompt;
buildPrompt = function() {
  var result = _origBuildPrompt.apply(this, arguments);
  try {
    var enc = _encodeState();
    if (enc) history.replaceState(null, "", location.pathname + "#v1:" + enc);
  } catch(e) {}
  return result;
};

/* Copy the current URL (with state hash) to clipboard */
window.copyShareLink = function() {
  var url = location.href;
  navigator.clipboard && navigator.clipboard.writeText(url)
    .then(function(){ showToast("Link copied — paste anywhere to share this shot"); })
    .catch(function(){ _fbCopy(url); });
  if (!navigator.clipboard) _fbCopy(url);
};
function _fbCopy(t) {
  var ta = document.createElement("textarea"); ta.value = t;
  document.body.appendChild(ta); ta.select();
  document.execCommand("copy"); document.body.removeChild(ta);
  showToast("Link copied — paste anywhere to share this shot");
}

/* Load state from hash on page load */
function loadFromHash() {
  var state = _decodeState(location.hash);
  if (!state) return false;
  try {
    var se = document.getElementById("subject");
    var ste = document.getElementById("style");
    var le = document.getElementById("light");
    var pe = document.getElementById("pace");
    var re = document.getElementById("ratio");
    if (se && state.s)  se.value  = state.s;
    if (ste && state.st) ste.value = state.st;
    if (le && state.l)  le.value  = state.l;
    if (pe && state.p)  pe.value  = state.p;
    if (re && state.r)  { re.value = state.r; ratioUserSet = true; }
    if (state.m) {
      currentModel = state.m;
      document.querySelectorAll(".model").forEach(function(b) {
        b.classList.toggle("on", b.dataset.k === state.m);
      });
    }
    if (state.mv && Array.isArray(state.mv)) {
      selected.length = 0;
      state.mv.forEach(function(id) {
        if (MOVES.find(function(m) { return m.id === id; })) selected.push(id);
      });
    }
    return true;
  } catch(e) { return false; }
}

/* Auto-run on load — after a tick so DOM is settled */
setTimeout(function() {
  if (loadFromHash()) {
    if (typeof syncMoves === "function")   syncMoves();
    if (typeof generate   === "function")  generate();
    if (typeof analyzePrompt === "function") analyzePrompt();
    showToast("Shot loaded from shared link");
  }
}, 120);
