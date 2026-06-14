// Shot Lab — Homepage Mini-Generator
// Self-contained: includes inline minimal models (avoids loading full data on landing page)
(function () {
  var VIBES = [
    { name:"Anime Action",      subj:"a spiky-haired warrior charging through a collapsing battlefield", style:"high-energy shonen anime, speed lines", light:"harsh backlight, drifting embers", pace:"fast",   model:"seedance", moves:"fast dolly rush-in, then side tracking, then whip pan" },
    { name:"Music Video",       subj:"a vocalist alone under a single spotlight on a dark stage",         style:"moody cinematic music video",           light:"single warm spotlight, deep shadow, haze",  pace:"steady", model:"kling",    moves:"slow dolly push-in, then 180-degree orbit" },
    { name:"Product Reveal",    subj:"a sleek premium product on a dark reflective pedestal",             style:"luxury commercial with clean reflections",light:"soft studio key, crisp amber rim on black", pace:"slow",   model:"runway",   moves:"full 360-degree orbit, then macro push-in" },
    { name:"Car Commercial",    subj:"a matte-black sports car carving a coastal mountain road",          style:"premium automotive commercial",          light:"golden-hour sun, long shadows",             pace:"steady", model:"veo",      moves:"drone fly-over, then low-angle side tracking" },
    { name:"Horror",            subj:"a small child at the end of a long flickering hallway",             style:"unsettling atmospheric horror, film grain",light:"flickering overhead light, deep darkness",  pace:"slow",   model:"luma",     moves:"slow dolly push-in with a growing Dutch angle" },
    { name:"Cyberpunk",         subj:"a lone figure in a long coat on a neon-soaked rain-slick street",  style:"cyberpunk with wet neon reflections",     light:"pink and cyan neon, volumetric mist, rain", pace:"steady", model:"pika",     moves:"Steadicam glide following from behind" },
    { name:"Epic Transformation",subj:"a hero erupting with golden energy as their power awakens",       style:"epic anime transformation, glowing aura", light:"intense rim light, volumetric god rays",    pace:"fast",   model:"seedance", moves:"180-degree orbit, then crane up" },
    { name:"Drone Landscape",   subj:"a vast mountain range at golden hour with mist in the valleys",    style:"cinematic nature documentary",            light:"golden-hour warm light, long shadows",      pace:"slow",   model:"veo",      moves:"drone fly-over slowly descending" },
  ];

  var MODELS = {
    seedance:{ label:"Seedance", ratio:"9:16",  sep:". ",  build:function(p){return [p.subj, p.moves&&("Camera: "+p.moves), p.style, p.light, p.pace&&(p.pace+" pacing"), "cinematic, film-quality."].filter(Boolean);} },
    kling:   { label:"Kling",    ratio:"16:9",  sep:". ",  build:function(p){return [p.subj, p.style, p.moves&&("Camera movement: "+p.moves), p.light&&("Lighting: "+p.light), p.pace&&(cap(p.pace)+" pace"), "highly detailed, cinematic."].filter(Boolean);} },
    runway:  { label:"Runway",   ratio:"16:9",  sep:". ",  build:function(p){return [cap(p.subj), p.style, p.light, p.moves&&("Camera: "+p.moves), p.pace&&(p.pace+", smooth motion"), "cinematic."].filter(Boolean);} },
    veo:     { label:"Veo",      ratio:"16:9",  sep:". ",  build:function(p){return [p.subj&&("A cinematic shot of "+p.subj.toLowerCase()), p.moves&&("The camera performs "+p.moves), p.style, p.light&&("Lit by "+p.light.toLowerCase()), p.pace&&(p.pace+" pacing."), "("+p.ratio+")"].filter(Boolean);} },
    pika:    { label:"Pika",     ratio:"16:9",  sep:", ",  build:function(p){return [p.subj, p.style, p.light, p.moves, p.pace&&(p.pace+" pace"), "cinematic"].filter(Boolean);} },
    luma:    { label:"Luma",     ratio:"16:9",  sep:". ",  build:function(p){return [cap(p.subj), p.style, p.moves&&cap(p.moves), p.light, p.pace&&(cap(p.pace)+", dreamlike motion"), "cinematic."].filter(Boolean);} },
  };

  function cap(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }

  var currentModel = "seedance";

  window.initHomeGenerator = function(containerId) {
    var wrap = document.getElementById(containerId);
    if (!wrap) return;

    // Build HTML
    wrap.innerHTML =
      '<div class="hg-vibes" id="hg-vibes"></div>' +
      '<label class="hg-label" for="hg-subj">Describe your scene</label>' +
      '<textarea id="hg-subj" class="hg-ta" rows="3" placeholder="e.g. a spiky-haired warrior sprinting through a collapsing battlefield"></textarea>' +
      '<label class="hg-label">Target model</label>' +
      '<div class="hg-models" id="hg-models"></div>' +
      '<button class="hg-gen" id="hg-gen">Generate Prompt &#9656;</button>' +
      '<div id="hg-out-wrap" style="display:none">' +
        '<textarea id="hg-out" class="hg-out" rows="4" readonly></textarea>' +
        '<button class="hg-copy" id="hg-copy">Copy Prompt</button>' +
      '</div>' +
      '<a href="/camera-moves.html" class="hg-link">Open full Shot Lab studio with 38 moves &#8594;</a>';

    // Vibe chips
    var vibeEl = document.getElementById('hg-vibes');
    VIBES.forEach(function(v) {
      var b = document.createElement('button');
      b.className = 'hg-vibe';
      b.textContent = v.name;
      b.onclick = function() {
        document.getElementById('hg-subj').value = v.subj;
        // switch model
        currentModel = v.model;
        document.querySelectorAll('.hg-model-btn').forEach(function(btn){ btn.classList.remove('active'); });
        var mb = document.querySelector('.hg-model-btn[data-model="'+v.model+'"]');
        if(mb) mb.classList.add('active');
        document.querySelectorAll('.hg-vibe').forEach(function(b2){ b2.classList.remove('active'); });
        b.classList.add('active');
        doGenerate(v.subj, v.moves, v.style, v.light, v.pace);
      };
      vibeEl.appendChild(b);
    });

    // Model buttons
    var modelsEl = document.getElementById('hg-models');
    Object.keys(MODELS).forEach(function(k) {
      var b = document.createElement('button');
      b.className = 'hg-model-btn' + (k === currentModel ? ' active' : '');
      b.dataset.model = k;
      b.textContent = MODELS[k].label;
      b.onclick = function() {
        currentModel = k;
        document.querySelectorAll('.hg-model-btn').forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
      };
      modelsEl.appendChild(b);
    });

    // Generate button
    document.getElementById('hg-gen').onclick = function() {
      var subj = document.getElementById('hg-subj').value.trim();
      doGenerate(subj, null, '', '', 'steady');
    };

    // Copy
    document.getElementById('hg-copy').onclick = function() {
      var t = document.getElementById('hg-out').value;
      if (!t) return;
      var btn = document.getElementById('hg-copy');
      navigator.clipboard && navigator.clipboard.writeText(t)
        .then(function(){ btn.textContent='Copied!'; setTimeout(function(){ btn.textContent='Copy Prompt'; }, 1500); })
        .catch(function(){ fb(t, btn); });
      if (!navigator.clipboard) fb(t, btn);
    };
  };

  function fb(t, btn) {
    var ta = document.createElement('textarea'); ta.value = t;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = 'Copied!'; setTimeout(function(){ btn.textContent = 'Copy Prompt'; }, 1500);
  }

  function doGenerate(subj, moves, style, light, pace) {
    var m = MODELS[currentModel] || MODELS.seedance;
    var p = { subj: subj || 'A cinematic scene', moves: moves||null, style: style||null, light: light||null, pace: pace||'steady', ratio: m.ratio };
    var parts = m.build(p);
    var out = parts.join(m.sep).trim();
    if (!/[.!?]$/.test(out)) out += '.';
    if (!/\d+:\d+/.test(out)) out += ' (' + m.ratio + ')';
    document.getElementById('hg-out').value = out;
    document.getElementById('hg-out-wrap').style.display = 'block';
    document.getElementById('hg-out').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
})();
