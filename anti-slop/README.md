# Cinematic Anti-Slop

A daily X series: one website James built per day, filmed like a movie trailer. Every episode opens on a generic AI-template site with **SLOP** across it; on the song's drop a red strike drives **ANTI—** in and the picture cuts to the real site. Then the site's own animations, cut to the beat, and an end card where the episode's frames tile the screen under the mark and **jamescamarota.com**.

Music only, no voice; it reads on mute. 9:16, 1080x1920, 60 fps.

## Episodes

| # | Site | Live | Status |
| --- | --- | --- | --- |
| 01 | Perihelion (space travel, planets drawn in code) | jamescamarota.com/sites/perihelion | sample: `ep01-perihelion/` |
| 02 | Aether (fragrance, real-time glass bottle) | jamescamarota.com/sites/aether | queued |
| 03 | Gleid (restaurant, courses that burn into each other) | jamescamarota.com/sites/restaurant | queued |
| 04 | Riverstair (VC fund, filmed solarpunk city) | jamescamarota.com/sites/solarpunk | queued |
| 05 | HRCG (Humanoid Robot Construction Games redesign) | hrcg-v2.vercel.app | queued |
| 06 | VnR Home Improvement ("down to the studs") | branch `claude/vnr-home-improvement` of Website-portfolio | queued |
| 07 | Leading Las Vegas (podcast studio) | branch `claude/beautiful-bohr-qxb70z` of Website-portfolio | queued |
| 08 | The portfolio itself (jamescamarota.com) | jamescamarota.com | queued |

## The brand

- Mark: `ANTI—SLOP` in Archivo at 125% width, weight 800; the dash is the red strike bar (`#FF3B2F`). Under it, *cinematic websites* in Instrument Serif italic.
- Slate tags on a dark lower-third band: a red tick, the scene number in red mono, what you're seeing in the wide title face, and how it's made in Geist Mono ("Real-time 3D · not a video").
- Warm film white `#F2EEE6` on black, light grain, every cut lands with a small punch. When the song stops dead, the frame freezes and a claim fills the silence (*no* TEMPLATES., *no* STOCK.).
- `film/src/brand/` holds the shared pieces (`Lockup`, `Tag`, `Grain`, `tokens`); each episode is a plan in `film/src/ep/`.

## How an episode is made

1. **Capture** (`rig/`): `capture.mjs` films the real site in headless Chromium with a virtual clock (`vt-shim.js`): `performance.now`, `Date`, `requestAnimationFrame`, timers, every Web Animation / CSS animation and `<video>` advance exactly one frame per screenshot, so WebGL and scroll animations come out perfectly smooth at 60 fps no matter how slow the software renderer is. A shot is a JSON spec (url, viewport, scroll keyframes, mouse path, clicks); see `rig/specs/`. Phone shots are 432x768 CSS px at DPR 2.5 = 1080x1920. The WebGL renderer string is reported as a real GPU so sites don't drop to their low-quality fallback.
2. **Slop** (`slop/`): the parody AI-template page for the cold open, captured with the same rig.
3. **Cut** (`film/`): Remotion 4. The plan places each shot on the song's beat grid (`t0` = the drop, `beatSec`), with tags, the cold open and the end card.
4. **Sound**: James uploads the song; vocals are removed with demucs (`htdemucs_ft`, drums+bass+other) and `film/tools/song.py` cuts the excerpt and masters it to -14 LUFS / -1 dBTP. Songs and stems are never committed.
5. **Encode**: full quality for posting plus a light 30 fps copy for previewing on a phone.
