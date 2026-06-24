# Shot Lab

**A visual camera movement library, AI prompt generator, and 3D camera studio for AI filmmakers.**

🎬 **Live → [shotlab-1qu.pages.dev](https://shotlab-1qu.pages.dev/)**

---

## What it does

Shot Lab helps you design camera movements and turn them into copy-ready prompts for AI video generation — in under 15 seconds.

| Tool | What it gives you |
|---|---|
| **Movement Library** | 38 camera moves with looping animated demos and a proper human figure on a cinematic stage |
| **Prompt Generator** | Subject + moves + style + lighting → formatted prompt for your chosen model |
| **Output Improvers** | One-click modifiers: More cinematic, More anime, Shorter, + Handheld, Music video feel |
| **Why This Works** | Live analysis showing subject, camera, style, lighting, pacing, and model format quality |
| **Shareable Links** | URL bar updates as you build — copy a link that restores the exact shot for anyone |
| **3D Camera Studio** | Drag a camera around a 3D dummy, mark start/end, get the move as a prompt |

---

## Models supported

Seedance · Kling · Runway · Veo · Pika · Luma

Each model tab reformats your input to match that platform's preferred prompt style and sets a sensible default aspect ratio. Switching models never overrides a ratio you've manually changed.

---

## 38 camera movements

Organised into 11 categories:

`Dolly` `Lens` `Framing` `Environment` `Focus` `Pivot` `Orbital` `Vertical` `Aerial` `Stylized` `Tracking`

| Category | Movements |
|---|---|
| Dolly | Slow Dolly In · Slow Dolly Out · Fast Dolly In · Vertigo Dolly Zoom · Low Angle Push-In · High Angle Pull-Back |
| Lens | Extreme Macro Zoom · Cosmic Hyper Zoom · Optical Zoom · Snap Zoom |
| Framing | Over the Shoulder · Fisheye |
| Environment | Reveal from Behind · Through Shot |
| Focus | Reveal from Blur · Rack Focus |
| Pivot | Tilt Up · Tilt Down · Pan · Truck · Static |
| Orbital | Orbit Shot · 360 Hero Spin · Slow Cinematic Arc |
| Vertical | Pedestal · Crane Up · Crane Down |
| Aerial | Drone Fly-Over · God's Eye View · Drone Dive (FPV) |
| Stylized | Handheld · Whip Pan · Dutch Angle · Steadicam Glide |
| Tracking | Leading Shot · Following Shot · Side Tracking · POV Walk |

Each card features a **looping CSS animation** on a cinematic mini-stage with a proper multi-element human figure, spotlight, HUD viewfinder corners, perspective floor grid, and vignette. Category colour-coded top border.

---

## Starter templates

One tap fills subject, moves, style, lighting, pacing, model, and aspect ratio. App loads pre-filled with Anime Battle Dash.

Anime Battle Dash · Music Video Performance · Product Reveal · Car Commercial · Horror Hallway · Cyberpunk Street Walk · Epic Transformation · Drone Landscape Reveal

---

## Prompt quality warnings

Live warnings update as you build:

- `✕` Missing subject
- `✕` Conflicting movement directions (e.g. Dolly In + Dolly Out)
- `▲` Too many camera moves (4+)
- `▲` Missing style
- `▲` Missing lighting

---

## Shareable URL

The URL bar updates silently every time you rebuild a prompt:

```
shotlab-1qu.pages.dev/camera-moves#v1:eyJzIjoiYSBsb25lIHN3b3Jkc21hbi4uLiJ9
```

The hash encodes subject, style, lighting, pacing, aspect ratio, model, and selected move IDs. Clicking **Copy share link** copies the current URL. Anyone opening the link gets the full shot restored automatically.

---

## URL routes

| URL | Resolves to |
|---|---|
| `shotlab-1qu.pages.dev/` | Landing page |
| `shotlab-1qu.pages.dev/camera-moves` | Full app (Cloudflare Pretty URLs strips `.html`) |
| `shotlab-1qu.pages.dev/app` | → 301 redirect to app |
| `shotlab-1qu.pages.dev/studio` | → 301 redirect to app |
| `shotlab-1qu.pages.dev/library` | → 301 redirect to app |
| `shotlab-1qu.pages.dev/moves` | → 301 redirect to app |

---

## Security & caching (`_headers`)

```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

/*.html
  Cache-Control: public, max-age=300, stale-while-revalidate=86400

/og-image.svg
  Cache-Control: public, max-age=604800, immutable
```

---

## File structure

```
/                               ← repo root = Cloudflare Pages output
├── index.html                  ← homepage (SEO H1 + mini-generator above fold)
├── camera-moves.html           ← main app (11 KB shell, loads external JS/CSS)
├── about.html
├── contact.html
├── privacy-policy.html
├── terms.html
├── ai-video-prompt-guide.html
├── camera-movement-glossary.html
├── favicon.svg
├── og-image.svg                ← 1200×630 social preview (director's monitor design)
├── sitemap.xml                 ← 34 URLs
├── robots.txt
├── _headers                    ← Cloudflare Pages cache + security rules
├── _redirects                  ← /app /studio /library /moves → camera-moves.html
├── README.md
│
├── css/
│   ├── main.css                ← shared tokens, nav, footer, cards, mini-gen (184 lines)
│   └── app.css                 ← app-specific: generator, picker, chips, stage, animations
│
├── data/
│   ├── moves.js                ← 38 moves → window.MOVES
│   ├── models.js               ← 6 model builders → window.MODELS
│   └── templates.js            ← 8 starter templates → window.TEMPLATES
│
├── js/
│   ├── app.js                  ← full app logic, generator, library, studio, share URL
│   ├── home-generator.js       ← homepage mini-generator (self-initialising)
│   └── mini-generator.js       ← sub-page mini-generator component
│
├── camera-movement/            ← 10 SEO pages, one per movement
│   ├── slow-dolly-in.html
│   ├── fast-dolly-in.html
│   ├── orbit-shot.html
│   ├── crane-up.html
│   ├── whip-pan.html
│   ├── handheld-shot.html
│   ├── drone-dive.html
│   ├── rack-focus.html
│   ├── dutch-angle.html
│   └── pov-walk.html
│
├── model/                      ← 6 SEO pages, one per AI model
│   ├── seedance-camera-prompt-generator.html
│   ├── kling-camera-prompt-generator.html
│   ├── runway-camera-prompt-generator.html
│   ├── veo-camera-prompt-generator.html
│   ├── pika-camera-prompt-generator.html
│   └── luma-camera-prompt-generator.html
│
└── ai-video-prompt/            ← 10 SEO use-case pages
    ├── anime-battle-dash.html
    ├── music-video-performance.html
    ├── product-reveal.html
    ├── car-commercial.html
    ├── horror-hallway.html
    ├── cyberpunk-street-walk.html
    ├── epic-transformation.html
    ├── drone-landscape-reveal.html
    ├── fashion-editorial.html
    └── handheld-war-scene.html
```

**No build step. No dependencies. No backend.** Open any HTML file directly in a browser.

---

## Usage

**Online:** [shotlab-1qu.pages.dev](https://shotlab-1qu.pages.dev/)

**Local:**

```bash
git clone https://github.com/Doomania/shotlab.git
cd shotlab
open index.html   # Mac
start index.html  # Windows
```

The 3D Camera Studio loads Three.js from cdnjs **lazily** — only when you open the Advanced panel. The rest of the site works fully offline.

---

## Deploying to Cloudflare Pages

1. Connect `Doomania/shotlab` to Cloudflare Pages
2. **Build command:** *(blank — static files only)*
3. **Output directory:** `/` (repo root)
4. **Pretty URLs:** ON (default — strips `.html` from routes)
5. `_redirects` and `_headers` are picked up automatically on each deploy

After `git push` to `main`, Cloudflare deploys in ~30 seconds.

To verify a fresh deploy, check the HTML comment near the top of `index.html`:
```html
<!-- Shot Lab deploy version: 2026-06-14-v2 -->
```

---

## SEO pages

Each of the 26 SEO pages includes:
- Unique title and meta description
- Canonical URL
- Open Graph and Twitter Card tags
- BreadcrumbList JSON-LD
- FAQPage JSON-LD (3–6 questions)
- WebApplication JSON-LD
- Working mini-generator pre-configured for the page topic
- 5 copy-ready example prompts
- Internal links to related movements, model guides, and the main app

---

## Roadmap

- [ ] Seedance 标准版 / 精简版 Chinese dual-output toggle
- [ ] Per-model character limit counter with live progress bar
- [ ] `/movement-library.html` as a dedicated standalone preview page
- [ ] Export animated GIFs per move
- [ ] GLB rigged model swap in 3D studio
- [ ] Google Search Console sitemap submission

---

## No affiliation

Shot Lab is not affiliated with, endorsed by, or officially connected to Seedance, Kling, Runway, Veo, Pika, Luma, or any other AI video platform. Names are used for descriptive reference only.

---

## Built by

[Eric Han / Doomania](https://github.com/Doomania) · Auckland, New Zealand

---

*Runs entirely in your browser. Nothing leaves the page.*
