/* Shot Lab — Main App Logic v2
 * Depends on: /data/moves.js  /data/models.js  /data/templates.js
 *             /data/camera.js  /data/presets.js  /data/transitions.js
 * Loaded after those data scripts via defer. */
var MOVES     = window.MOVES     || [];
var MODELS    = window.MODELS    || {};
var TEMPLATES = window.TEMPLATES || [];
var OPP       = window.OPP       || [];
var CATS = ["All","Dolly","Lens","Framing","Environment","Focus","Pivot","Orbital","Vertical","Aerial","Stylized","Tracking"];
var CAT_COLORS={Dolly:"#e0a84b",Lens:"#4ab8d4",Framing:"#9b8de0",Environment:"#7bb274",Focus:"#5b9ae0",Pivot:"#8d8a82",Orbital:"#e8b858",Vertical:"#e07a4b",Aerial:"#4ab8d4",Stylized:"#d6473a",Tracking:"#7bb274"};
var currentModel = "seedance";
var ratioUserSet = false;
var activeMods = [];
var activeNeg  = [];
var activeTransition = null;
var transLoaded = false;

/* ---------- shared utils ---------- */
const toast=document.getElementById("toast");
function showToast(msg){toast.textContent=msg||"Copied to clipboard";toast.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove("on"),1400);}
function copy(txt){if(!txt)return;navigator.clipboard?.writeText(txt).then(()=>showToast()).catch(()=>fallbackCopy(txt));}
function fallbackCopy(txt){const ta=document.createElement("textarea");ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");showToast();}catch(e){}document.body.removeChild(ta);}
function val(id){var el=document.getElementById(id);return el?el.value:'';}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
function low(s){return s?s.charAt(0).toLowerCase()+s.slice(1):s;}
function debounce(fn,delay){var t;return function(){clearTimeout(t);t=setTimeout(fn,delay);};}

/* ---------- state readers ---------- */
function readCam(){
  function v(id){var el=document.getElementById(id);return el?el.value:'';}
  return {brand:v('camBrand'),focal:v('camFocal'),lightType:v('camLight'),comp:v('camComp')};
}
function readMods(){
  return activeMods.map(function(id){return window.PRESETS_FLAT&&window.PRESETS_FLAT[id];}).filter(Boolean);
}
function readNeg(){return activeNeg.slice();}

/* ---------- model tabs ---------- */
const modelsEl=document.getElementById("models");
Object.keys(MODELS).forEach(k=>{
  const b=document.createElement("button");
  b.className="model"+(k===currentModel?" on":"");b.textContent=MODELS[k].label;b.dataset.k=k;
  b.onclick=()=>{
    currentModel=k;
    [...modelsEl.children].forEach(c=>c.classList.toggle("on",c.dataset.k===k));
    document.getElementById("ratio").value=MODELS[k].ratio;
    updateModelSiteLabel();
    generate();
  };
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
  currentModel=t.model;
  [...modelsEl.children].forEach(c=>c.classList.toggle("on",c.dataset.k===t.model));
  document.getElementById("ratio").value=t.ratio;
  selected.length=0;t.moves.forEach(id=>selected.push(id));
  // clear enhancements so templates are deterministic
  ['camBrand','camFocal','camLight','camComp'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  activeMods.length=0; renderMods();
  activeNeg.length=0;  renderNeg();
  updateModelSiteLabel();
  syncMoves();generate();analyzePrompt();
  document.getElementById("outBox").scrollIntoView({behavior:"smooth",block:"center"});
}

/* ---------- movement picker ---------- */
const pickerEl=document.getElementById("picker");
const selected=[];
let activeCat="All";
let dragFrom=null;

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
  const p={
    subject:val("subject").trim(),
    moves:movesText(),
    style:val("style").trim(),
    light:val("light").trim(),
    pace:val("pace"),
    ratio:val("ratio"),
    cam:readCam(),
    mods:readMods(),
    neg:readNeg()
  };
  let s=model.build(p).filter(Boolean).join(model.sep);
  s=s.replace(/\s+/g," ").replace(/\s+([.,;])/g,"$1").trim();
  if(s&&!/[.!?]$/.test(s))s+=".";
  // per-model negative rendering
  if(model.neg){
    var ns=model.neg(p);
    if(ns){
      if(ns.match(/^\s*--/))s=s.replace(/\.$/, ''); // --no style: strip trailing period
      s+=ns;
    }
  }
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
function generateFull(){generate();analyzePrompt();}
var debouncedFull=debounce(generateFull,150);

document.getElementById("genBtn").onclick=function(){
  generate();analyzePrompt();
  var b=document.getElementById("outBox");
  b.classList.add("flash");setTimeout(()=>b.classList.remove("flash"),450);
  b.scrollIntoView({behavior:"smooth",block:"center"});
  var row=document.getElementById("modRow");
  if(row&&val("out").trim())row.style.display="flex";
};
document.getElementById("copyBtn").onclick=()=>copy(val("out"));

// Copy & open platform
document.getElementById("copyOpenBtn").onclick=function(){
  var txt=val("out");if(!txt)return;
  copy(txt);
  var url=MODELS[currentModel]&&MODELS[currentModel].url;
  if(url)setTimeout(function(){window.open(url,"_blank");},200);
  showToast("Copied + opening "+(MODELS[currentModel]?MODELS[currentModel].label:"platform")+" ↗");
};

// Debounced text input listeners (one combined handler — no duplicate attachments)
["subject","style","light"].forEach(id=>{
  var el=document.getElementById(id);
  if(el)el.addEventListener("input",debouncedFull);
});
["pace"].forEach(id=>document.getElementById(id).addEventListener("change",generateFull));
document.getElementById("ratio").addEventListener("change",()=>{ratioUserSet=true;generateFull();});

/* ---------- model site label ---------- */
function updateModelSiteLabel(){
  var el=document.getElementById("modelSite");
  if(el&&MODELS[currentModel])el.textContent=MODELS[currentModel].label;
  var el2=document.getElementById("transModelSite");
  if(el2&&MODELS[currentModel])el2.textContent=MODELS[currentModel].label;
}

/* ---------- library grid + pills ---------- */
const pillsEl=document.getElementById("pills");
CATS.forEach(c=>{const b=document.createElement("button");b.className="pill"+(c==="All"?" on":"");b.textContent=c;b.dataset.cat=c;b.onclick=()=>{activeCat=c;[...pillsEl.children].forEach(p=>p.classList.toggle("on",p.dataset.cat===c));renderGrid();};pillsEl.appendChild(b);});
const gridEl=document.getElementById("grid");
function renderGrid(){
  gridEl.innerHTML="";
  MOVES.filter(m=>activeCat==="All"||m.cat===activeCat).forEach(m=>{
    const card=document.createElement("div");if(typeof CAT_COLORS!=="undefined")card.style.setProperty("--cat-c",CAT_COLORS[m.cat]||"#e0a84b");
    card.className="card"+(selected.includes(m.id)?" sel":"");card.dataset.demo=m.demo;
    card.innerHTML='<div class="check">&#10003;</div><div class="stage"><div class="frame"><div class="floor-plane"></div><div class="spotlight"></div><div class="rimlight"></div><div class="ground-shadow"></div><div class="figure2"><div class="fig2-h"></div><div class="fig2-t"></div><div class="fig2-ll"></div><div class="fig2-lr"></div></div><div class="figure"><div class="fig-h"></div><div class="fig-n"></div><div class="fig-t"></div><div class="fig-al"></div><div class="fig-ar"></div><div class="fig-belt"></div><div class="fig-ll"></div><div class="fig-lr"></div><div class="fig-sl"></div><div class="fig-sr"></div></div><div class="occ"></div><div class="ring"></div><div class="hud"><div class="hc tl"></div><div class="hc tr"></div><div class="hc bl"></div><div class="hc br"></div><div class="hcenter"></div></div><div class="vig"></div></div></div><div class="meta"><div class="cat-row"><span class="cat-dot"></span><span class="cat-name">'+(m.alias||m.cat)+'</span></div><div class="move-name">'+m.name+'</div><div class="move-feel">'+m.feel+'</div></div>';
    card.setAttribute('role','button');card.setAttribute('tabindex','0');
    card.setAttribute('aria-pressed',selected.includes(m.id)?'true':'false');
    card.setAttribute('aria-label',m.name+': '+m.desc.replace(/<[^>]*>/g,''));
    card.onclick=()=>toggleMove(m.id);
    card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleMove(m.id);}};
    gridEl.appendChild(card);
  });
}

/* ---------- camera & lens panel ---------- */
function initCamPanel(){
  if(!window.CAMERA)return;
  var C=window.CAMERA;
  function makeSelect(id,opts,placeholder){
    var sel=document.getElementById(id);if(!sel)return;
    sel.innerHTML='<option value="">\u2014 '+placeholder+' \u2014</option>';
    opts.forEach(function(o){
      var opt=document.createElement('option');opt.value=o.id;
      opt.textContent=o.label+(o.zh?' / '+o.zh:'');
      opt.title=o.hint||o.t||'';
      sel.appendChild(opt);
    });
    sel.addEventListener('change',generateFull);
  }
  makeSelect('camBrand',C.brands,'Camera body');
  makeSelect('camFocal',C.focal,'Focal length');
  makeSelect('camLight',C.lighting,'Lighting type');
  makeSelect('camComp',C.comp,'Composition');
}

/* ---------- enhancer chips ---------- */
function renderEnhancerPanel(){
  if(!window.PRESETS)return;
  var grid=document.getElementById('enhancerGrid');
  if(!grid||grid.dataset.built)return;
  grid.dataset.built='1';
  var catLabels={action:'Action',energy:'Energy',emotion:'Emotion',style:'Style',texture:'Texture'};
  Object.keys(window.PRESETS).forEach(function(cat){
    var h=document.createElement('div');h.className='chip-cat';h.textContent=catLabels[cat]||cap(cat);grid.appendChild(h);
    var row=document.createElement('div');row.className='chip-row';
    window.PRESETS[cat].forEach(function(p){
      var b=document.createElement('button');
      b.className='chip'+(activeMods.includes(p.id)?' on':'');
      b.dataset.id=p.id;
      b.innerHTML=p.label+(p.zh?' <span class="chip-zh">'+p.zh+'</span>':'');
      b.title=p.inject;
      b.onclick=function(){
        var idx=activeMods.indexOf(p.id);
        if(idx>=0)activeMods.splice(idx,1);else activeMods.push(p.id);
        b.classList.toggle('on',activeMods.includes(p.id));
        generateFull();
      };
      row.appendChild(b);
    });
    grid.appendChild(row);
  });
}
function renderMods(){
  document.querySelectorAll('#enhancerGrid .chip').forEach(function(b){
    b.classList.toggle('on',activeMods.includes(b.dataset.id));
  });
}

/* ---------- negative chips ---------- */
function renderNegPanel(){
  if(!window.NEGATIVES)return;
  var grid=document.getElementById('negGrid');
  if(!grid||grid.dataset.built)return;
  grid.dataset.built='1';
  var row=document.createElement('div');row.className='chip-row';
  window.NEGATIVES.forEach(function(n){
    var b=document.createElement('button');
    b.className='chip neg-chip'+(activeNeg.includes(n.id)?' on':'');
    b.dataset.id=n.id;
    b.innerHTML=n.label+(n.zh?' <span class="chip-zh">'+n.zh+'</span>':'');
    b.title=n.t;
    b.onclick=function(){
      var idx=activeNeg.indexOf(n.id);
      if(idx>=0)activeNeg.splice(idx,1);else activeNeg.push(n.id);
      b.classList.toggle('on',activeNeg.includes(n.id));
      generateFull();
    };
    row.appendChild(b);
  });
  grid.appendChild(row);
  var note=document.createElement('p');note.className='chip-note';
  note.textContent='Appends --no flags (Seedance/Pika/Kling) or Avoid phrases to your prompt.';
  grid.appendChild(note);
}
function renderNeg(){
  document.querySelectorAll('#negGrid .chip').forEach(function(b){
    b.classList.toggle('on',activeNeg.includes(b.dataset.id));
  });
}

/* ---------- collapsible panel hooks ---------- */
document.getElementById('advEnhancers')?.addEventListener('toggle',function(e){if(e.target.open)renderEnhancerPanel();});
document.getElementById('advNeg')?.addEventListener('toggle',function(e){if(e.target.open)renderNegPanel();});

/* ---------- save / load project ---------- */
window.saveProject=function(){
  var state={
    version:2,
    subject:val('subject'),style:val('style'),light:val('light'),
    pace:val('pace'),ratio:val('ratio'),model:currentModel,
    moves:selected.slice(),
    cam:readCam(),mods:activeMods.slice(),neg:activeNeg.slice()
  };
  var blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='shotlab-project.json';a.click();
  showToast('Project saved');
};
window.loadProject=function(e){
  var file=e.target.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(ev){
    try{
      var s=JSON.parse(ev.target.result);
      if(s.subject)document.getElementById('subject').value=s.subject;
      if(s.style)document.getElementById('style').value=s.style;
      if(s.light)document.getElementById('light').value=s.light;
      if(s.pace)document.getElementById('pace').value=s.pace;
      if(s.ratio){document.getElementById('ratio').value=s.ratio;ratioUserSet=true;}
      if(s.model){
        currentModel=s.model;
        document.querySelectorAll('.model').forEach(function(b){b.classList.toggle('on',b.dataset.k===s.model);});
      }
      if(s.moves){selected.length=0;s.moves.forEach(function(id){selected.push(id);});}
      if(s.cam){
        var camBrand=document.getElementById('camBrand'),camFocal=document.getElementById('camFocal');
        var camLight=document.getElementById('camLight'),camComp=document.getElementById('camComp');
        if(camBrand)camBrand.value=s.cam.brand||'';
        if(camFocal)camFocal.value=s.cam.focal||'';
        if(camLight)camLight.value=s.cam.lightType||'';
        if(camComp)camComp.value=s.cam.comp||'';
      }
      if(s.mods){activeMods=s.mods.slice();renderMods();}
      if(s.neg){activeNeg=s.neg.slice();renderNeg();}
      updateModelSiteLabel();syncMoves();generateFull();
      showToast('Project loaded');
    }catch(err){showToast('Could not load — invalid file');}
  };
  reader.readAsText(file);
  e.target.value='';
};

/* ---------- transitions tab ---------- */
window.switchMode=function(mode){
  document.getElementById('viewGen').classList.toggle('on',mode==='generator');
  document.getElementById('viewTrans').classList.toggle('on',mode==='transitions');
  document.getElementById('tabGen').classList.toggle('on',mode==='generator');
  document.getElementById('tabTrans').classList.toggle('on',mode==='transitions');
  if(mode==='transitions'&&!transLoaded){transLoaded=true;renderTransGrid();}
};

function renderTransGrid(){
  var grid=document.getElementById('transGrid');
  if(!grid||grid.dataset.built||!window.TRANSITIONS)return;
  grid.dataset.built='1';
  var cats={},catOrder=['motion','match','light','space','texture'];
  var catLabels={motion:'Motion',match:'Match Cut',light:'Light',space:'Space / Time',texture:'Texture'};
  window.TRANSITIONS.forEach(function(t){if(!cats[t.cat])cats[t.cat]=[];cats[t.cat].push(t);});
  catOrder.forEach(function(cat){
    if(!cats[cat])return;
    var h=document.createElement('div');h.className='chip-cat';h.textContent=catLabels[cat]||cat;grid.appendChild(h);
    var row=document.createElement('div');row.className='chip-row';
    cats[cat].forEach(function(tr){
      var b=document.createElement('button');
      b.className='chip tp-chip'+(activeTransition===tr.id?' on':'');
      b.dataset.id=tr.id;
      b.innerHTML='<div class="tp" data-tp="'+tr.id+'"><div class="tp-a"></div><div class="tp-b"></div><div class="tp-fx"></div></div>'+
        '<span class="chip-lbl">'+tr.label+(tr.zh?' <span class="chip-zh">'+tr.zh+'</span>':'')+'</span>';
      b.title=tr.t;
      b.onclick=function(){
        activeTransition=activeTransition===tr.id?null:tr.id;
        document.querySelectorAll('#transGrid .chip').forEach(function(x){x.classList.toggle('on',x.dataset.id===activeTransition);});
        buildTransitionPrompt();
      };
      row.appendChild(b);
    });
    grid.appendChild(row);
  });
}

function buildTransitionPrompt(){
  var shotA=(document.getElementById('transA')||{value:''}).value.trim();
  var shotB=(document.getElementById('transB')||{value:''}).value.trim();
  var style=(document.getElementById('transStyle')||{value:''}).value.trim();
  var pace=(document.getElementById('transPace')||{value:'steady'}).value||'steady';
  var tr=window.TRANSITIONS&&activeTransition?window.TRANSITIONS.find(function(t){return t.id===activeTransition;}):null;
  if(!shotA&&!shotB){document.getElementById('transOut').value='';return;}
  var parts=[];
  if(shotA)parts.push('Shot A: '+shotA);
  parts.push('Transition: '+(tr?tr.t:'cut to next shot'));
  if(shotB)parts.push('Shot B: '+shotB);
  if(style)parts.push(style);
  parts.push(pace+' pacing, cinematic');
  var result=parts.join('. ').replace(/\s+/g,' ').trim();
  if(!/[.!?]$/.test(result))result+='.';
  document.getElementById('transOut').value=result;
  var box=document.getElementById('transOutBox');
  if(box){box.classList.add('flash');setTimeout(function(){box.classList.remove('flash');},450);}
}
document.getElementById('genTransBtn').addEventListener('click',buildTransitionPrompt);
var debouncedTrans=debounce(buildTransitionPrompt,200);
['transA','transB','transStyle'].forEach(function(id){
  var el=document.getElementById(id);if(el)el.addEventListener('input',debouncedTrans);
});
document.getElementById('transPace')?.addEventListener('change',buildTransitionPrompt);

window.copyTransOpen=function(){
  var txt=val('transOut');if(!txt)return;
  copy(txt);
  var url=MODELS[currentModel]&&MODELS[currentModel].url;
  if(url)setTimeout(function(){window.open(url,'_blank');},200);
  showToast('Copied + opening '+(MODELS[currentModel]?MODELS[currentModel].label:'platform')+' \u2197');
};

/* ---------- init ---------- */
(function(){var el=document.getElementById("moveCount");if(el&&window.MOVES)el.textContent=window.MOVES.length;})();
initCamPanel();
applyTemplate(TEMPLATES[0]); // default: Anime Battle Dash

/* sticky selection pill */
const selPill=document.createElement('div');
selPill.id='selPill';
selPill.style.cssText='display:none;position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:40;background:var(--amber);color:#000;font-family:var(--disp);font-size:20px;letter-spacing:.5px;padding:12px 22px;border-radius:999px;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.5);white-space:nowrap;transition:opacity .2s';
selPill.onclick=()=>document.querySelector('.out-box').scrollIntoView({behavior:'smooth',block:'center'});
document.body.appendChild(selPill);
function updateSelPill(){var n=selected.length;var p=selPill;if(n>0){p.textContent=n+' move'+(n>1?'s':'')+' selected \u2014 view prompt \u2191';p.style.display='block';}else{p.style.display='none';}}
updateSelPill();

/* resize 3D studio when panel opens */
document.getElementById("advStudio").addEventListener("toggle",e=>{if(e.target.open)requestAnimationFrame(()=>requestAnimationFrame(()=>{try{resize3D();}catch(_){}}));});

/* ============================================================
   3D CAMERA STUDIO  (Three.js)
   ============================================================ */
let scene,dirCam,dirRenderer,povCam,povRenderer,dummy,gizmo,pathLine,startMark,endMark;
let TARGET;
const shot={az:-0.6,pol:1.35,dist:6,ht:1.6};
let startPose=null,endPose=null,playing=false,playT=0,playDur=4;

function makeGizmo(){
  const grp=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(.34,.26,.5),new THREE.MeshStandardMaterial({color:0xd6473a,roughness:.4}));
  const lens=new THREE.Mesh(new THREE.ConeGeometry(.16,.34,18),new THREE.MeshStandardMaterial({color:0x111111,roughness:.3}));
  lens.rotation.x=Math.PI/2;lens.position.z=.38;
  grp.add(body,lens);return grp;
}
function poseVec(p){
  return new THREE.Vector3(TARGET.x+p.dist*Math.sin(p.pol)*Math.cos(p.az),p.ht,TARGET.z+p.dist*Math.sin(p.pol)*Math.sin(p.az));
}
function init3D(){
  TARGET=new THREE.Vector3(0,1.1,0);
  const cv=document.getElementById("director");
  scene=new THREE.Scene();scene.background=new THREE.Color(0x08080a);scene.fog=new THREE.Fog(0x08080a,14,30);
  scene.add(new THREE.AmbientLight(0x6b7a90,.7));
  const key=new THREE.DirectionalLight(0xffe6c0,1.1);key.position.set(5,8,4);scene.add(key);
  const rim=new THREE.DirectionalLight(0xe0a84b,.6);rim.position.set(-6,4,-5);scene.add(rim);
  const grid=new THREE.GridHelper(40,40,0x2a2a32,0x1a1a20);scene.add(grid);
  const disk=new THREE.Mesh(new THREE.CircleGeometry(1.4,40),new THREE.MeshStandardMaterial({color:0x16161a,roughness:1}));
  disk.rotation.x=-Math.PI/2;disk.position.y=.01;scene.add(disk);
  dummy=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({color:0xcfc9bd,roughness:.7,metalness:.05});
  const acc=new THREE.MeshStandardMaterial({color:0xe0a84b,roughness:.5,metalness:.1});
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.34,.28,1.0,18),mat);torso.position.y=1.25;dummy.add(torso);
  const hips=new THREE.Mesh(new THREE.CylinderGeometry(.28,.26,.32,16),mat);hips.position.y=.62;dummy.add(hips);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,.18,12),mat);neck.position.y=1.78;dummy.add(neck);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.26,20,16),acc);head.position.y=2.0;dummy.add(head);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.05,.12,10),mat);nose.rotation.x=Math.PI/2;nose.position.set(0,2.0,.26);dummy.add(nose);
  [[-.46,-.18],[.46,.18]].forEach(([x,rz])=>{const a=new THREE.Mesh(new THREE.CylinderGeometry(.1,.08,.92,12),mat);a.position.set(x,1.18,0);a.rotation.z=rz;dummy.add(a);});
  [-.16,.16].forEach(x=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(.13,.1,1.0,12),mat);l.position.set(x,.5,0);dummy.add(l);});
  scene.add(dummy);
  gizmo=makeGizmo();scene.add(gizmo);
  startMark=markerMesh(0x7bb274);endMark=markerMesh(0xd6473a);
  startMark.visible=false;endMark.visible=false;scene.add(startMark,endMark);
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(64*3),3));
  pathLine=new THREE.Line(pg,new THREE.LineBasicMaterial({color:0xe0a84b}));pathLine.visible=false;scene.add(pathLine);
  [gizmo,startMark,endMark,pathLine].forEach(o=>o.traverse(c=>c.layers.set(1)));
  dirCam=new THREE.PerspectiveCamera(50,16/9,.1,100);
  dirCam.position.set(7.5,5,7.5);dirCam.lookAt(TARGET);dirCam.layers.enable(1);
  povCam=new THREE.PerspectiveCamera(38,172/104,.1,100);
  dirRenderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  povRenderer=new THREE.WebGLRenderer({canvas:document.getElementById("pov"),antialias:true});
  dirRenderer.setPixelRatio(Math.min(devicePixelRatio,2));povRenderer.setPixelRatio(Math.min(devicePixelRatio,2));
  bindInteractions(cv);
  if(window.ResizeObserver){const ro=new ResizeObserver(()=>resize3D());ro.observe(cv.parentElement);ro.observe(document.querySelector(".povbox"));}
  resize3D();applyShot();animate();
}
function markerMesh(c){
  const g=new THREE.Group();
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.3,.04,8,24),new THREE.MeshBasicMaterial({color:c}));
  const pin=new THREE.Mesh(new THREE.SphereGeometry(.1,12,10),new THREE.MeshBasicMaterial({color:c}));
  g.add(ring,pin);return g;
}
function applyShot(){
  shot.pol=Math.max(.25,Math.min(Math.PI-.25,shot.pol));shot.dist=Math.max(2.5,Math.min(14,shot.dist));
  const p=poseVec(shot);gizmo.position.copy(p);gizmo.lookAt(TARGET);povCam.position.copy(p);povCam.lookAt(TARGET);
  document.getElementById("sDist").value=shot.dist.toFixed(1);document.getElementById("sHt").value=shot.ht.toFixed(1);
  document.getElementById("vDist").textContent=shot.dist.toFixed(1);document.getElementById("vHt").textContent=shot.ht.toFixed(1);
}
function bindInteractions(cv){
  let dragging=false,lx=0,ly=0;
  cv.addEventListener("mousedown",e=>{dragging=true;lx=e.clientX;ly=e.clientY;});
  window.addEventListener("mouseup",()=>dragging=false);
  window.addEventListener("mousemove",e=>{if(!dragging||playing)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;shot.az-=dx*0.008;shot.pol-=dy*0.006;shot.ht=TARGET.y+shot.dist*Math.cos(shot.pol);shot.ht=Math.max(.2,shot.ht);applyShot();});
  cv.addEventListener("wheel",e=>{e.preventDefault();if(playing)return;shot.dist+=e.deltaY*0.006;applyShot();},{passive:false});
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
function lerpPose(a,b,t){let da=b.az-a.az;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;return{az:a.az+da*t,pol:a.pol+(b.pol-a.pol)*t,dist:a.dist+(b.dist-a.dist)*t,ht:a.ht+(b.ht-a.ht)*t};}
function updatePath(){
  if(!startPose||!endPose){pathLine.visible=false;return;}
  const pos=pathLine.geometry.attributes.position.array;const N=32;
  for(let i=0;i<N;i++){const t=i/(N-1);const pp=lerpPose(startPose,endPose,t);const v=poseVec(pp);pos[i*3]=v.x;pos[i*3+1]=v.y;pos[i*3+2]=v.z;}
  pathLine.geometry.setDrawRange(0,N);pathLine.geometry.attributes.position.needsUpdate=true;pathLine.visible=true;
}
function playMove(){if(!startPose||!endPose){showToast("Set a Start and End first");return;}playing=true;playT=0;document.getElementById("rec").classList.add("on");}
function analyse(){
  if(!startPose||!endPose)return;
  const dAz=normAng(endPose.az-startPose.az),dDist=endPose.dist-startPose.dist,dHt=endPose.ht-startPose.ht;
  const parts=[],labels=[];
  if(Math.abs(dAz)>0.35){const deg=Math.round(Math.abs(dAz)*180/Math.PI),dir=dAz>0?"right":"left";labels.push("Arc / Orbit");parts.push(`a ${deg}\u00b0 arc orbiting ${dir} around the subject`);}
  if(Math.abs(dDist)>0.6){if(dDist<0){labels.push("Push In");parts.push("a dolly push-in toward the subject");}else{labels.push("Pull Back");parts.push("a dolly pull-back away from the subject");}}
  if(Math.abs(dHt)>0.5){if(dHt>0){labels.push("Crane Up");parts.push("a crane rise to a higher angle");}else{labels.push("Crane Down");parts.push("a crane descent to a lower angle");}}
  let detName,promptMove;
  if(!parts.length){detName="Static / Locked-off";promptMove="a near-static, locked-off frame";}
  else if(parts.length===1){detName=labels[0];promptMove=parts[0];}
  else{detName=labels.join(" + ");promptMove=parts.join(", combined with ");}
  let pace=playDur<=2.5?"fast, energetic":playDur>=7?"slow, deliberate":"steady, controlled";
  const det=document.getElementById("detName");det.textContent=detName;det.classList.remove("idle");
  document.getElementById("studioOut").value=`Cinematic shot of the subject. Camera movement: ${promptMove}, over roughly ${playDur.toFixed(1)} seconds. ${cap(pace)} pacing, filmic depth of field, professional cinematography.`;
}
function normAng(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;}
function resize3D(){
  if(!dirRenderer)return;
  const cv=document.getElementById("director"),sw=cv.parentElement;
  const w=cv.clientWidth||sw.clientWidth||sw.offsetWidth,h=cv.clientHeight||460;
  if(w>0&&h>0){dirRenderer.setSize(w,h,false);dirCam.aspect=w/h;dirCam.updateProjectionMatrix();}
  const box=document.querySelector(".povbox"),pv=document.getElementById("pov");
  const pw=pv.clientWidth||box.clientWidth||170,ph=pv.clientHeight||box.clientHeight||102;
  if(pw>0&&ph>0){povRenderer.setSize(pw,ph,false);povCam.aspect=pw/ph;povCam.updateProjectionMatrix();}
}
window.addEventListener("resize",()=>{if(dirRenderer)resize3D();});
function animate(){
  requestAnimationFrame(animate);
  if(playing){playT+=1/60/playDur;if(playT>=1){playT=1;playing=false;document.getElementById("rec").classList.remove("on");}const pp=lerpPose(startPose,endPose,easeInOut(playT));Object.assign(shot,pp);applyShot();}
  dirCam.lookAt(TARGET);dirRenderer.render(scene,dirCam);povRenderer.render(scene,povCam);
}
function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

/* pause off-screen card animations */
if('IntersectionObserver' in window){
  var _aio=new IntersectionObserver(function(entries){entries.forEach(function(e){var els=e.target.querySelectorAll('.floor-plane,.figure,.figure2,.frame,.occ,.ring');els.forEach(function(el){el.style.animationPlayState=e.isIntersecting?'running':'paused';});});},{rootMargin:'100px'});
  var _mobs=new MutationObserver(function(){document.querySelectorAll('.card:not([data-observed])').forEach(function(c){c.dataset.observed='1';_aio.observe(c);});});
  var _grid=document.getElementById('grid');if(_grid)_mobs.observe(_grid,{childList:true});
}

/* lazy-load Three.js only when 3D panel opens */
(function(){
  var loaded=false;var advEl=document.getElementById('advStudio');if(!advEl)return;
  function tryResize(){requestAnimationFrame(function(){requestAnimationFrame(function(){try{resize3D();}catch(_){}});});}
  function loadThree(){
    if(loaded)return;loaded=true;
    var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload=function(){
      try{init3D();setTimeout(function(){try{resize3D();}catch(_){}},80);}
      catch(e){
        console.error('3D init failed:',e);
        var sw=document.getElementById('studio');
        if(sw)sw.insertAdjacentHTML('afterbegin','<div style="padding:12px 16px;font-family:var(--mono);font-size:11px;color:var(--red);background:rgba(214,71,58,.1);border:1px solid var(--red);border-radius:8px;margin-bottom:12px">3D init error: '+e.message+'</div>');
      }
    };
    s.onerror=function(){var sw=document.getElementById('studio');if(sw)sw.innerHTML='<div style="padding:40px;font-family:var(--mono);color:var(--dust);font-size:13px">3D engine could not load \u2014 check your connection.</div>';};
    document.head.appendChild(s);
  }
  /* toggle event (primary) */
  advEl.addEventListener('toggle',function(e){if(e.target.open){loadThree();tryResize();}});
  /* summary click fallback */
  var sum=advEl.querySelector('summary');
  if(sum)sum.addEventListener('click',function(){setTimeout(function(){if(advEl.open)loadThree();},30);});
})();

/* ═══════════════════════════════════════════════════
   OUTPUT IMPROVEMENT BUTTONS
   ═══════════════════════════════════════════════════ */
window.modifyPrompt=function(type){
  var out=document.getElementById("out");if(!out||!out.value.trim())return;
  var p=out.value.trim();
  var ratioMatch=p.match(/\s*\(\d[\d.:]+\)\s*$/);var ratio=ratioMatch?ratioMatch[0]:'';
  var base=p.replace(/\s*\(\d[\d.:]+\)\s*$/,'').trim().replace(/[.!]$/,'');
  var result=base;
  switch(type){
    case 'cinematic':result+=', film-quality depth of field, precise cinematic lens movement';break;
    case 'dynamic':result+=', dynamic kinetic energy, bold momentum-driven framing';break;
    case 'shorter':var sentences=base.split('. ').filter(Boolean);result=sentences.slice(0,Math.max(2,Math.ceil(sentences.length/2))).join('. ');break;
    case 'anime':result=base.replace(/photoreal[\w\s]*/gi,'').replace(/\bcinematic\b/gi,'anime cinematic');result+=', bold expressive anime linework, dramatic motion blur';break;
    case 'realistic':result=base.replace(/\b(anime|stylised|cartoon)[\w\s]*/gi,'');result+=', photorealistic, natural organic camera movement';break;
    case 'handheld':result+=', natural handheld camera shake, organic operator movement';break;
    case 'musicvideo':result+=', music video aesthetic, rhythmic camera energy, controlled creative lighting';break;
  }
  out.value=(result.trim().replace(/[,\s]+$/,'')+'.'+ratio).trim();
  analyzePrompt();
  var btn=document.querySelector('[onclick="modifyPrompt(\''+type+'\')"]');
  if(btn){btn.textContent='\u2713 Applied';setTimeout(function(){btn.textContent=btn.dataset.label;},1200);}
};

/* ═══════════════════════════════════════════════════
   WHY THIS PROMPT WORKS
   ═══════════════════════════════════════════════════ */
function analyzePrompt(){
  var box=document.getElementById("whyBox");if(!box)return;
  var subj=(document.getElementById("subject")?.value||'').trim();
  var style=(document.getElementById("style")?.value||'').trim();
  var light=(document.getElementById("light")?.value||'').trim();
  var pace=(document.getElementById("pace")?.value||'steady');
  var hasMoves=selected.length>0;
  var moveNames=selected.map(function(id){var m=MOVES.find(function(x){return x.id===id;});return m?m.name:'';}).filter(Boolean);
  var model=MODELS[currentModel]?MODELS[currentModel].label:'Seedance';
  var hasCam=Object.values(readCam()).some(function(v){return v;});
  var hasMods=activeMods.length>0;
  var hasNeg=activeNeg.length>0;
  function row(ok,label,v){var icon=ok?'&#10003;':'&#9650;';var cls=ok?'why-ok':'why-warn';return '<li class="'+cls+'">'+icon+' <strong>'+label+':</strong> '+v+'</li>';}
  var html='<ul class="why-list">';
  html+=row(subj.length>4,'Subject',subj.length>4?'\u201c'+subj.slice(0,55)+(subj.length>55?'\u2026':'')+'\u201d':'Add a specific subject.');
  html+=row(hasMoves,'Camera',hasMoves?moveNames.join(', '):'No camera move selected.');
  html+=row(!!style,'Style',style||'Add a visual style.');
  html+=row(!!light,'Lighting',light||'Add lighting.');
  html+=row(true,'Pacing',pace+' &middot; Format: '+model);
  if(hasCam||hasMods||hasNeg){
    var extras=[];
    if(hasCam)extras.push('lens/camera');
    if(hasMods)extras.push(activeMods.length+' enhancer'+(activeMods.length>1?'s':''));
    if(hasNeg)extras.push(activeNeg.length+' negative'+(activeNeg.length>1?'s':''));
    html+=row(true,'Extras',extras.join(', ')+' active');
  }
  html+='</ul>';
  box.innerHTML=html;box.style.display='block';
}

/* ═══════════════════════════════════════════════════
   SHAREABLE URL — encodes full state including new fields
   ═══════════════════════════════════════════════════ */
function _encodeState(){
  function v(id){var el=document.getElementById(id);return el?el.value:'';}
  var state={
    s:v("subject").trim(),st:v("style").trim(),l:v("light").trim(),
    p:v("pace")||"steady",r:v("ratio")||"9:16",
    m:currentModel||"seedance",mv:selected.slice(),
    cb:v('camBrand'),cf:v('camFocal'),cl:v('camLight'),cc:v('camComp'),
    md:activeMods.slice(),ng:activeNeg.slice()
  };
  try{return btoa(unescape(encodeURIComponent(JSON.stringify(state))));}catch(e){return null;}
}
function _decodeState(hash){
  if(!hash||!hash.startsWith("#v1:"))return null;
  try{return JSON.parse(decodeURIComponent(escape(atob(hash.slice(4)))));}catch(e){return null;}
}

var _origBuildPrompt=buildPrompt;
buildPrompt=function(){
  var result=_origBuildPrompt.apply(this,arguments);
  try{var enc=_encodeState();if(enc)history.replaceState(null,"",location.pathname+"#v1:"+enc);}catch(e){}
  return result;
};

window.copyShareLink=function(){
  var url=location.href;
  navigator.clipboard&&navigator.clipboard.writeText(url).then(function(){showToast("Link copied \u2014 paste anywhere to share this shot");}).catch(function(){_fbCopy(url);});
  if(!navigator.clipboard)_fbCopy(url);
};
function _fbCopy(t){var ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);showToast("Link copied \u2014 paste anywhere to share this shot");}

function loadFromHash(){
  var state=_decodeState(location.hash);if(!state)return false;
  try{
    function sv(id,val){var el=document.getElementById(id);if(el&&val)el.value=val;}
    sv("subject",state.s);sv("style",state.st);sv("light",state.l);sv("pace",state.p);
    if(state.r){sv("ratio",state.r);ratioUserSet=true;}
    if(state.m){
      currentModel=state.m;
      document.querySelectorAll(".model").forEach(function(b){b.classList.toggle("on",b.dataset.k===state.m);});
    }
    if(state.mv&&Array.isArray(state.mv)){
      selected.length=0;
      state.mv.forEach(function(id){if(MOVES.find(function(m){return m.id===id;}))selected.push(id);});
    }
    // new fields — camera selects (already populated by initCamPanel)
    sv('camBrand',state.cb);sv('camFocal',state.cf);sv('camLight',state.cl);sv('camComp',state.cc);
    if(state.md)activeMods=state.md.slice();
    if(state.ng)activeNeg=state.ng.slice();
    return true;
  }catch(e){return false;}
}

setTimeout(function(){
  if(loadFromHash()){
    syncMoves();generateFull();updateModelSiteLabel();
    showToast("Shot loaded from shared link");
  }
},120);
