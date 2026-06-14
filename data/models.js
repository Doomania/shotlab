// Shot Lab — AI Model Prompt Formats
window.MODELS = {
  seedance:{label:"Seedance",ratio:"9:16",sep:". ",build:p=>[p.subject, p.moves&&("Camera: "+p.moves), p.style, p.light, p.pace&&(p.pace+" pacing"), "cinematic, film-quality detail"]},
  kling:{label:"Kling",ratio:"16:9",sep:". ",build:p=>[p.subject, p.style, p.moves&&("Camera movement: "+p.moves), p.light&&("Lighting: "+p.light), p.pace&&(cap(p.pace)+" pace"), "highly detailed, cinematic"]},
  runway:{label:"Runway",ratio:"16:9",sep:". ",build:p=>[cap(p.subject), p.style, p.light, p.moves&&("Camera: "+p.moves), p.pace&&(p.pace+", smooth motion"), "cinematic, subtle film grain"]},
  veo:{label:"Veo",ratio:"16:9",sep:". ",build:p=>[p.subject&&("A cinematic shot of "+low(p.subject)), p.moves&&("the camera performs "+p.moves), p.style, p.light&&("lit by "+low(p.light)), p.pace&&(low(p.pace)+", natural movement"), "photorealistic detail"]},
  pika:{label:"Pika",ratio:"16:9",sep:", ",build:p=>[p.subject, p.style, p.light, p.moves, p.pace&&(p.pace+" pace"), "cinematic"]},
  luma:{label:"Luma",ratio:"16:9",sep:". ",build:p=>[cap(p.subject), p.style, p.moves&&cap(p.moves), p.light, p.pace&&(cap(p.pace)+", dreamlike motion"), "cinematic"]},
};
