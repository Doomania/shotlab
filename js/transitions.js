// Shot Lab — Transitions Data
window.TRANSITIONS = [
  // Motion
  {id:"tr_whip",    label:"Whip Pan Cut",     zh:"甩镜转场",  cat:"motion",
   t:"fast whip pan blur exits frame, next shot enters from the matching blur direction"},
  {id:"tr_speed",   label:"Speed Ramp",        zh:"变速转场",  cat:"motion",
   t:"shot accelerates to hyperspeed, freezes into the opening frame of the next shot"},
  {id:"tr_push",    label:"Push Through",      zh:"推进转场",  cat:"motion",
   t:"camera pushes aggressively through the subject into the next scene"},
  {id:"tr_spin",    label:"Spin Blur",         zh:"旋转转场",  cat:"motion",
   t:"subject spins until motion blur wipes to the next location"},
  // Match
  {id:"tr_match",   label:"Match Cut",         zh:"匹配剪辑",  cat:"match",
   t:"shape and motion in shot A match perfectly with the opening geometry of shot B"},
  {id:"tr_eyeline", label:"Eyeline Match",     zh:"视线剪辑",  cat:"match",
   t:"character's gaze direction leads seamlessly into the subject of the next shot"},
  {id:"tr_shape",   label:"Shape Morph",       zh:"形状匹配",  cat:"match",
   t:"a dominant geometric shape in shot A morphs into a matching shape opening shot B"},
  // Light
  {id:"tr_flash",   label:"Light Flash",       zh:"光闪转场",  cat:"light",
   t:"a burst of overexposed white light transitions to the next scene"},
  {id:"tr_fade",    label:"Fade to Black",     zh:"淡入淡出",  cat:"light",
   t:"shot fades to black, next scene fades up from darkness"},
  {id:"tr_lensf",   label:"Lens Flare",        zh:"镜头光晕",  cat:"light",
   t:"a sweeping anamorphic lens flare covers the transition to the next shot"},
  {id:"tr_silh",    label:"Silhouette Wipe",   zh:"剪影擦除",  cat:"light",
   t:"a dark silhouette sweeps across frame, revealing the next scene beneath"},
  // Space / Time
  {id:"tr_occ",     label:"Occlusion Wipe",    zh:"遮挡擦除",  cat:"space",
   t:"a foreground object passes close to camera, blocking frame and revealing the next scene"},
  {id:"tr_zoom",    label:"Crash Zoom",        zh:"冲击变焦",  cat:"space",
   t:"extreme crash zoom collapses into the subject, reborn as the opening wide of the next shot"},
  {id:"tr_door",    label:"Frame Wipe",        zh:"框架擦除",  cat:"space",
   t:"subject passes through a doorway or frame edge and emerges in the next location"},
  {id:"tr_jump",    label:"Jump Cut",          zh:"跳切",      cat:"space",
   t:"abrupt jump cut — same subject, time has skipped forward"},
  // Texture
  {id:"tr_blur",    label:"Rack to Blur",      zh:"虚焦转场",  cat:"texture",
   t:"shot racks to extreme soft focus, next shot racks back into sharp clarity"},
  {id:"tr_grain",   label:"Film Burn",         zh:"胶片灼烧",  cat:"texture",
   t:"film burn and grain overexposure bleeds across the cut into the next scene"},
  {id:"tr_sound",   label:"Sound Bridge",      zh:"声音桥接",  cat:"texture",
   t:"audio from the next scene plays over the end of the current shot, bridging the cut"},
];
