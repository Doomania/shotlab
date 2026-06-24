// Shot Lab — AI Model Prompt Formats
// Helper functions are scoped here so builders stay self-contained
(function(){

  function camStr(cam){
    if(!cam||!window.CAMERA) return '';
    var C=window.CAMERA;
    return [
      (C.brands.find(function(b){return b.id===cam.brand;})||{}).t,
      (C.focal.find(function(f){return f.id===cam.focal;})||{}).t,
      (C.lighting.find(function(l){return l.id===cam.lightType;})||{}).t,
      (C.comp.find(function(c){return c.id===cam.comp;})||{}).t,
    ].filter(Boolean).join(', ');
  }

  function modsStr(mods){
    if(!mods||!mods.length) return '';
    return mods.map(function(m){return m&&m.inject;}).filter(Boolean).join(', ');
  }

  function negTexts(neg){
    if(!neg||!neg.length||!window.NEGATIVES) return [];
    return neg.map(function(id){
      var n=window.NEGATIVES.find(function(x){return x.id===id;});
      return n?n.t:'';
    }).filter(Boolean);
  }

  function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
  function low(s){return s?s.charAt(0).toLowerCase()+s.slice(1):s;}

  window.MODELS = {
    seedance:{
      label:"Seedance", ratio:"9:16", sep:". ",
      url:"https://jimeng.jianying.com/",
      build:function(p){
        var cs=camStr(p.cam), ms=modsStr(p.mods);
        return [
          p.subject,
          p.moves&&("Camera: "+p.moves),
          cs||undefined,
          p.style,
          p.light,
          p.pace&&(p.pace+" pacing"),
          ms||undefined,
          "cinematic, film-quality detail"
        ];
      },
      neg:function(p){var t=negTexts(p.neg);return t.length?' --no '+t.join(', '):'';}
    },
    kling:{
      label:"Kling", ratio:"16:9", sep:". ",
      url:"https://klingai.com/",
      build:function(p){
        var cs=camStr(p.cam), ms=modsStr(p.mods);
        return [
          p.subject,
          p.style,
          p.moves&&("Camera movement: "+p.moves),
          p.light&&("Lighting: "+p.light),
          p.pace&&(cap(p.pace)+" pace"),
          cs||undefined,
          ms||undefined,
          "highly detailed, cinematic"
        ];
      },
      neg:function(p){var t=negTexts(p.neg);return t.length?'. Negative prompt: '+t.join(', '):'';}
    },
    runway:{
      label:"Runway", ratio:"16:9", sep:". ",
      url:"https://runwayml.com/",
      build:function(p){
        var cs=camStr(p.cam), ms=modsStr(p.mods);
        return [
          cap(p.subject),
          p.style,
          p.light,
          p.moves&&("Camera: "+p.moves),
          p.pace&&(p.pace+", smooth motion"),
          cs||undefined,
          ms||undefined,
          "cinematic, subtle film grain"
        ];
      },
      neg:function(p){var t=negTexts(p.neg);return t.length?'. Avoid: '+t.join(', '):'';}
    },
    veo:{
      label:"Veo", ratio:"16:9", sep:". ",
      url:"https://labs.google/fx/tools/video-fx",
      build:function(p){
        var cs=camStr(p.cam), ms=modsStr(p.mods);
        return [
          p.subject&&("A cinematic shot of "+low(p.subject)),
          p.moves&&("The camera performs "+p.moves),
          p.style,
          p.light&&("Lit by "+low(p.light)),
          p.pace&&(low(p.pace)+", natural movement"),
          cs||undefined,
          ms||undefined,
          "photorealistic detail"
        ];
      },
      neg:function(p){var t=negTexts(p.neg);return t.length?', avoiding '+t.join(', '):'';}
    },
    pika:{
      label:"Pika", ratio:"16:9", sep:", ",
      url:"https://pika.art/",
      build:function(p){
        var cs=camStr(p.cam), ms=modsStr(p.mods);
        return [
          p.subject,
          p.style,
          p.light,
          p.moves,
          p.pace&&(p.pace+" pace"),
          cs||undefined,
          ms||undefined,
          "cinematic"
        ];
      },
      neg:function(p){var t=negTexts(p.neg);return t.length?' --no '+t.join(', '):'';}
    },
    luma:{
      label:"Luma", ratio:"16:9", sep:". ",
      url:"https://lumalabs.ai/dream-machine",
      build:function(p){
        var cs=camStr(p.cam), ms=modsStr(p.mods);
        return [
          cap(p.subject),
          p.style,
          p.moves&&cap(p.moves),
          p.light,
          p.pace&&(cap(p.pace)+", dreamlike motion"),
          cs||undefined,
          ms||undefined,
          "cinematic"
        ];
      },
      neg:function(p){var t=negTexts(p.neg);return t.length?'. Avoid: '+t.join(', '):'';}
    },
  };

})();
