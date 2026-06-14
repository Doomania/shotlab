// Shot Lab — Mini Generator for sub-pages
// Requires window.MODELS (from /data/models.js) or falls back to embedded minimal set
// Usage: call initMiniGenerator(containerId, lockedMove)

(function(){
  const FALLBACK_MODELS = {
    seedance:{label:"Seedance",ratio:"9:16",sep:". ",
      build:p=>[p.subject,p.move&&("Camera: "+p.move),p.style,"cinematic, film-quality"].filter(Boolean)},
    kling:{label:"Kling",ratio:"16:9",sep:". ",
      build:p=>[p.subject,p.style,p.move&&("Camera movement: "+p.move),"highly detailed, cinematic"].filter(Boolean)},
    runway:{label:"Runway",ratio:"16:9",sep:". ",
      build:p=>[p.subject,p.style,p.move&&("Camera: "+p.move),"smooth motion, cinematic"].filter(Boolean)},
    veo:{label:"Veo",ratio:"16:9",sep:". ",
      build:p=>[p.subject&&("A cinematic shot of "+p.subject.toLowerCase()),p.move&&("the camera performs "+p.move),p.style,"photorealistic detail"].filter(Boolean)},
    pika:{label:"Pika",ratio:"16:9",sep:", ",
      build:p=>[p.subject,p.style,p.move,"cinematic"].filter(Boolean)},
    luma:{label:"Luma",ratio:"16:9",sep:". ",
      build:p=>[p.subject,p.style,p.move&&(p.move.charAt(0).toUpperCase()+p.move.slice(1)),"cinematic, dreamlike motion"].filter(Boolean)},
  };

  window.initMiniGenerator = function(containerId, lockedMove, defaultSubject, defaultStyle){
    const wrap = document.getElementById(containerId);
    if(!wrap) return;
    const MODELS = window.MODELS || FALLBACK_MODELS;
    let model = "seedance";

    wrap.innerHTML = `
      <label class="mg-label" for="${containerId}-subj">Describe your scene</label>
      <textarea id="${containerId}-subj" class="mg-textarea" rows="3"
        placeholder="e.g. a warrior sprinting through a collapsing battlefield">${defaultSubject||''}</textarea>
      <label class="mg-label">Target model</label>
      <div class="mg-models" id="${containerId}-mdls"></div>
      <label class="mg-label" for="${containerId}-style">Style / look (optional)</label>
      <input id="${containerId}-style" class="mg-input" type="text" placeholder="e.g. cinematic anime, noir, photoreal" value="${defaultStyle||''}">
      <button class="mg-gen-btn" id="${containerId}-gen">Generate Prompt &#9656;</button>
      <div class="mg-output-wrap" id="${containerId}-owrap" style="display:none">
        <textarea id="${containerId}-out" class="mg-output" rows="4" readonly></textarea>
        <button class="mg-copy-btn" id="${containerId}-copy">Copy Prompt</button>
      </div>
      <a href="/camera-moves.html" class="mg-link">Open full Shot Lab studio with 38 moves &#8594;</a>
    `;

    // model buttons
    const mdls = document.getElementById(containerId+"-mdls");
    Object.keys(MODELS).forEach(k=>{
      const b=document.createElement("button");
      b.className="mg-model-btn"+(k===model?" active":"");
      b.textContent=MODELS[k].label; b.type="button";
      b.onclick=()=>{model=k;[...mdls.children].forEach(x=>x.classList.remove("active"));b.classList.add("active");};
      mdls.appendChild(b);
    });

    // generate
    document.getElementById(containerId+"-gen").onclick=()=>{
      const subj = document.getElementById(containerId+"-subj").value.trim();
      const style = document.getElementById(containerId+"-style").value.trim();
      const m = MODELS[model] || FALLBACK_MODELS[model];
      const p = {subject:subj||"A cinematic scene", move:lockedMove||null, style:style||null};
      let parts;
      if(m.build){parts=m.build(p);}
      else{parts=[p.subject,p.move&&("Camera: "+p.move),p.style,"cinematic"].filter(Boolean);}
      let out = parts.join(m.sep||". ");
      if(!/[.!?]$/.test(out)) out += ".";
      out += " (" + (m.ratio||"16:9") + ")";
      document.getElementById(containerId+"-out").value = out;
      document.getElementById(containerId+"-owrap").style.display = "block";
      document.getElementById(containerId+"-out").scrollIntoView({behavior:"smooth",block:"nearest"});
    };

    // copy
    document.getElementById(containerId+"-copy").onclick=()=>{
      const t = document.getElementById(containerId+"-out").value;
      if(!t) return;
      const btn = document.getElementById(containerId+"-copy");
      navigator.clipboard?.writeText(t).then(()=>{btn.textContent="Copied!";setTimeout(()=>btn.textContent="Copy Prompt",1600);})
        .catch(()=>{const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();
          document.execCommand("copy");document.body.removeChild(ta);btn.textContent="Copied!";
          setTimeout(()=>btn.textContent="Copy Prompt",1600);});
    };
  };
})();
