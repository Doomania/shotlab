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

Each model tab reformats the same inputs into that platform's prompt conventions and sets a sensible default aspect ratio. Switching models never overrides a ratio you've manually set.

---

## 38 camera movements

Organized into 11 categories:

`Dolly` `Lens` `Framing` `Environment` `Focus` `Pivot` `Orbital` `Vertical` `Aerial` `Stylized` `Tracking`

Includes: Slow Dolly In/Out · Fast Dolly (Rush) · Vertigo Dolly Zoom · Extreme Macro Zoom · Cosmic Hyper Zoom · Snap Zoom · Fisheye · Over the Shoulder · Rack Focus · Reveal from Blur · Tilt Up/Down · Pan · Truck · Orbit · Slow Cinematic Arc · Pedestal · Crane Up/Down · Drone Fly-Over · God's Eye · FPV Dive · Handheld · Whip Pan · Dutch Angle · Steadicam · Leading · Following · Side Tracking · POV Walk · and more.

---

## Starter templates

One tap fills subject, moves, style, lighting, pacing, and model. App loads pre-filled with Anime Battle Dash so the first screen is never blank.

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

- `✕` Missing subject
- `✕` Conflicting movement directions (e.g. Dolly In + Dolly Out)
- `▲` Too many camera moves (4+)
- `▲` Missing style
- `▲` Missing lighting

---

## URL routes

| URL | Resolves to |
|---|---|
| `shotlab-1qu.pages.dev/` | Landing page |
| `shotlab-1qu.pages.dev/camera-moves.html` | Full app |
| `shotlab-1qu.pages.dev/app` | → redirects to app |
| `shotlab-1qu.pages.dev/studio` | → redirects to app |
| `shotlab-1qu.pages.dev/library` | → redirects to app |
| `shotlab-1qu.pages.dev/moves` | → redirects to app |

Redirects are handled by `_redirects` (Cloudflare Pages native, 301).

---

## Security & caching (`_headers`)

Cloudflare Pages reads `_headers` on every deploy and applies these rules:

```
/*
  X-Frame-Options: SAMEORIGIN          # blocks clickjacking
  X-Content-Type-Options: nosniff      # blocks MIME sniffing
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

/*.html
  Cache-Control: public, max-age=300, stale-while-revalidate=86400

/og-image.svg
  Cache-Control: public, max-age=604800, immutable
```

HTML files are cached for 5 minutes (fast deploys propagate quickly). Static assets like the OG image are cached for 7 days as immutable.

---

## Files

```
index.html          Landing page
camera-moves.html   Full app (library + generator + 3D studio)
og-image.svg        Social preview card (1200×630, director's monitor design)
favicon.svg         Tab/bookmark icon
_redirects          Cloudflare Pages URL routing
_headers            Cloudflare Pages HTTP security + cache headers
robots.txt          Crawler permissions + sitemap pointer
sitemap.xml         Pages index for search engines
README.md           This file
```

No build step. No dependencies. No backend. Open either HTML file directly in any browser.

---

## Usage

**Online:** [shotlab-1qu.pages.dev](https://shotlab-1qu.pages.dev/)

**Local:**

```bash
git clone https://github.com/Doomania/shotlab.git
cd shotlab
open index.html
```

The 3D Camera Studio loads Three.js from cdnjs at runtime — an internet connection is needed the first time you expand it. The library and generator work fully offline.

---

## Deploying to Cloudflare Pages

1. Connect the `Doomania/shotlab` repo to Cloudflare Pages
2. Build command: *(none — static files only)*
3. Output directory: `/` (repo root)
4. `_redirects` and `_headers` are picked up automatically

After each `git push` to `main`, Cloudflare deploys in ~30 seconds.

---

## Roadmap

- [ ] Shareable URL encoding (shot config saved into the hash)
- [ ] Seedance 标准版 / 精简版 Chinese dual-output mode
- [ ] Per-model character limit counter
- [ ] Export animated GIFs per move
- [ ] GLB model swap in 3D studio

---

## Built by

[Eric Han / Doomania](https://github.com/Doomania) · Auckland, NZ

Part of the **Old Wisdom // Retold** creative tools family.

---

*Runs entirely in your browser. Nothing leaves the page.*
