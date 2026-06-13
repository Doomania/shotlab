# Shot Lab

**A visual camera movement library, AI prompt generator, and 3D camera studio for AI filmmakers.**

🎬 **Live → [shotlab-1qu.pages.dev](https://shotlab-1qu.pages.dev/)**

---

## What it does

Shot Lab helps you design camera movements and turn them into copy-ready prompts for AI video generation — in under 15 seconds.

| Tool | What it gives you |
|---|---|
| **Movement Library** | 38 camera moves with looping animated demos and plain-English descriptions |
| **Prompt Generator** | Subject + moves + style + lighting → formatted prompt for your chosen model |
| **3D Camera Studio** | Drag a camera around a 3D dummy, mark start/end, get the move as a prompt |

---

## Models supported

Seedance · Kling · Runway · Veo · Pika · Luma

Each model tab reformats the same inputs into that platform's prompt conventions and sets a sensible default aspect ratio.

---

## 38 camera movements

Organized into 11 categories:

`Dolly` `Lens` `Framing` `Environment` `Focus` `Pivot` `Orbital` `Vertical` `Aerial` `Stylized` `Tracking`

Includes: Slow Dolly In/Out · Fast Dolly (Rush) · Vertigo Dolly Zoom · Extreme Macro Zoom · Cosmic Hyper Zoom · Snap Zoom · Fisheye · Over the Shoulder · Rack Focus · Reveal from Blur · Tilt Up/Down · Pan · Truck · Orbit · Slow Cinematic Arc · Pedestal · Crane Up/Down · Drone Fly-Over · God's Eye · FPV Dive · Handheld · Whip Pan · Dutch Angle · Steadicam · Leading · Following · Side Tracking · POV Walk · and more.

---

## Starter templates

One tap fills subject, moves, style, lighting, pacing, and model:

- Anime Battle Dash
- Music Video Performance
- Product Reveal
- Car Commercial
- Horror Hallway
- Cyberpunk Street Walk
- Epic Transformation

---

## Prompt quality warnings

Live warnings as you build:

- ⚠ Missing subject
- ⚠ Too many camera moves (4+)
- ✕ Conflicting movement directions (e.g. Dolly In + Dolly Out)
- ▲ Missing style
- ▲ Missing lighting

---

## Files

```
index.html          Landing page
camera-moves.html   The full app (library + generator + 3D studio)
```

No build step. No dependencies. No backend. Open either file directly in a browser.

---

## Usage

**Online:** [shotlab-1qu.pages.dev](https://shotlab-1qu.pages.dev/)

**Local:** Clone or download, open `index.html` in any browser.

```bash
git clone https://github.com/Doomania/shotlab.git
cd shotlab
open index.html
```

The 3D Camera Studio tab loads Three.js from cdnjs at runtime — an internet connection is needed the first time you expand it. The library and generator work fully offline.

---

## Roadmap

- [ ] Exportable animated GIFs per move
- [ ] Seedance 标准版 / 精简版 Chinese dual-output mode
- [ ] Shareable URL encoding for saved shot setups
- [ ] Per-model character limit counter
- [ ] GLB model swap in 3D studio

---

## Built by

[Eric Han / Doomania](https://github.com/Doomania) · Auckland, NZ

Part of the **Old Wisdom // Retold** creative tools family.

---

*Runs entirely in your browser. Nothing leaves the page.*
