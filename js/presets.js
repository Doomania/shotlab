// Shot Lab — Enhancer Presets & Negative Prompts
window.PRESETS = {
  action: [
    {id:"pr_rush",     label:"Rush",       zh:"冲击", inject:"explosive kinetic energy"},
    {id:"pr_impact",   label:"Impact",     zh:"冲撞", inject:"heavy impact momentum"},
    {id:"pr_chase",    label:"Chase",      zh:"追逐", inject:"relentless forward pursuit energy"},
    {id:"pr_burst",    label:"Burst",      zh:"爆发", inject:"sudden burst of motion"},
    {id:"pr_power",    label:"Power",      zh:"力量", inject:"powerful commanding presence"},
    {id:"pr_tension",  label:"Tension",    zh:"张力", inject:"taut suspenseful tension"},
  ],
  energy: [
    {id:"pr_epic",     label:"Epic",       zh:"史诗", inject:"epic grand-scale cinematic energy"},
    {id:"pr_dreamy",   label:"Dreamy",     zh:"梦幻", inject:"dreamy ethereal floating quality"},
    {id:"pr_raw",      label:"Raw",        zh:"原始", inject:"raw visceral handheld energy"},
    {id:"pr_serene",   label:"Serene",     zh:"宁静", inject:"serene meditative stillness"},
    {id:"pr_urgency",  label:"Urgency",    zh:"紧迫", inject:"urgent breathless pacing"},
    {id:"pr_majestic", label:"Majestic",   zh:"壮阔", inject:"majestic sweeping grandeur"},
  ],
  emotion: [
    {id:"pr_melancholy",label:"Melancholy",zh:"忧郁", inject:"melancholic wistful mood"},
    {id:"pr_hope",     label:"Hope",       zh:"希望", inject:"rising hopeful emotion"},
    {id:"pr_dread",    label:"Dread",      zh:"恐惧", inject:"creeping dread and unease"},
    {id:"pr_joy",      label:"Joy",        zh:"喜悦", inject:"warm joyful uplifting feeling"},
    {id:"pr_lonely",   label:"Lonely",     zh:"孤独", inject:"profound isolation and loneliness"},
    {id:"pr_wonder",   label:"Wonder",     zh:"惊叹", inject:"childlike wonder and awe"},
  ],
  style: [
    {id:"pr_grain",    label:"Film Grain", zh:"胶片感", inject:"subtle film grain texture"},
    {id:"pr_noir",     label:"Noir",       zh:"黑色电影",inject:"noir contrast, deep shadows"},
    {id:"pr_bloom",    label:"Bloom",      zh:"光晕",   inject:"lens bloom on highlights"},
    {id:"pr_anam",     label:"Anamorphic", zh:"变形镜", inject:"anamorphic lens flares, oval bokeh"},
    {id:"pr_vhs",      label:"VHS",        zh:"录像带", inject:"VHS tape artifact, scan lines"},
    {id:"pr_haze",     label:"Haze",       zh:"薄雾",   inject:"atmospheric haze, volumetric fog"},
  ],
  texture: [
    {id:"pr_dof",      label:"Deep DoF",   zh:"景深",   inject:"cinematic depth of field"},
    {id:"pr_shallow",  label:"Shallow DoF",zh:"浅景深", inject:"very shallow depth of field, creamy bokeh"},
    {id:"pr_sharp",    label:"Sharp",      zh:"锐利",   inject:"crisp sharp details throughout"},
    {id:"pr_motion",   label:"Motion Blur",zh:"动态模糊",inject:"natural motion blur on fast elements"},
    {id:"pr_hdr",      label:"HDR",        zh:"高动态", inject:"high dynamic range, rich tonal contrast"},
    {id:"pr_flat",     label:"Flat Colour",zh:"扁平色", inject:"flat muted colour grading, desaturated"},
  ],
};

window.NEGATIVES = [
  {id:"n_wm",    label:"No watermark",  zh:"无水印",  t:"watermark, logo, text overlay, subtitle"},
  {id:"n_warp",  label:"No warping",    zh:"防崩坏",  t:"deformed limbs, extra fingers, distorted face, body horror"},
  {id:"n_blur",  label:"No blur",       zh:"防模糊",  t:"blurry, out of focus, low resolution"},
  {id:"n_static",label:"No static",     zh:"防静止",  t:"static frame, no camera movement, locked shot"},
  {id:"n_jump",  label:"No jump cuts",  zh:"防跳切",  t:"jarring jump cuts, discontinuous editing"},
  {id:"n_crowd", label:"No crowds",     zh:"无人群",  t:"crowd, busy background, extra people"},
  {id:"n_black", label:"No black bars", zh:"无黑边",  t:"letterbox bars, pillarbox, black bars"},
  {id:"n_flat",  label:"No flat look",  zh:"防平淡",  t:"flat lighting, no contrast, overexposed"},
];

// Flat lookup map for fast access by id
window.PRESETS_FLAT = {};
Object.values(window.PRESETS).forEach(function(arr){
  arr.forEach(function(p){ window.PRESETS_FLAT[p.id] = p; });
});
