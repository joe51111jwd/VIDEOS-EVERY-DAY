# Cinematic Anti-Slop

A daily X series: one website James built per day, filmed like a movie trailer. Every episode opens on a generic AI-template site with **SLOP** across it; on the song's drop a red strike drives **ANTI—** in and the picture cuts to the real site. Then the site's own animations, cut to the beat, and an end card where the episode's frames tile the screen under the mark and **jamescamarota.com**.

Music only, no voice; it reads on mute. 60 fps. Reel 00 is landscape (16:9, 1920x1080) since James asked for it; the first episode sample was 9:16 (1080x1920).

## Episodes

| # | Site | Live | Status |
| --- | --- | --- | --- |
| 00 | The opener: every site in one cut (portfolio intro, Nightline, Riverstair, Aether, Perihelion, Gleid, HRCG) | jamescamarota.com | `reel00-opener/reel00-opener-16x9.mp4` (40 s, landscape); the first 9:16 cut is `reel00-opener.mp4` |
| 01 | Perihelion (space travel, planets drawn in code) | jamescamarota.com/sites/perihelion | sample: `ep01-perihelion/` |
| 02 | Aether (fragrance, real-time glass bottle) | jamescamarota.com/sites/aether | queued |
| 03 | Gleid (restaurant, courses that burn into each other) | jamescamarota.com/sites/restaurant | queued |
| 04 | Riverstair (VC fund, filmed solarpunk city) | jamescamarota.com/sites/solarpunk | queued |
| 05 | HRCG (Humanoid Robot Construction Games redesign) | hrcg-v2.vercel.app | queued |
| 06 | VnR Home Improvement ("down to the studs") | branch `claude/vnr-home-improvement` of Website-portfolio | queued |
| 07 | Leading Las Vegas (podcast studio) | branch `claude/beautiful-bohr-qxb70z` of Website-portfolio | queued |
| 08 | The portfolio itself (jamescamarota.com) | jamescamarota.com | queued |

Reel 00 opens the series without the slop cold open: it starts on the portfolio's own intro (every project's name flashing past onto *James Camarota.*), then gives each site a few stomps of the song behind a black name card, lands NO TEMPLATES and NO SLOP on the stomp before each of the song's two dead stops, and ends on ANTI / SLOP, A NEW SITE / EVERY DAY and DAY 1 on the last stomp.

The landscape cut (`film/src/ep/opener16.ts`, comp `OP16`) runs 40 s. The portfolio intro (untouched since James signed it off), then each site opens on a black card with its name, landing on a stomp and held for two (James found one stomp too fast to read). Nightline: the stomp dives into the MacBook's screen, the screen refilled in sync with footage filmed live in the game today, so the dive hands off to full frame without a seam; the five cars take a stomp each (LaFerrari, 911 GT2 RS, McLaren W1, Jesko Absolut, AMG ONE) and the camera pulls back out of the laptop. Riverstair comes through the cloud as its name dissolves, then the scroll takes the camera down the falls in one shot, cuts to NO TEMPLATES held through the dead stop and plunges into the mist, which whites out into Aether. Aether gives a stomp to each note, the exploded bottle and two editions (the stomp cuts from Aurore to Midi as the click lands); Perihelion gives each world two beats; Gleid's fire, then the courses swap on the stomps. In the breakdown HRCG's homepage plays its hero film in slow motion: the robot pulls the chalk line and its hand hits the slab on the drums' return, where the film goes back to real speed. The end cards take three stomps each, DAY 1 lands on the final stomp and holds through the song's dead stop.

## The brand

- Type, from Reel 00's second landscape cut on: Apple-ad cards (James's reference is the AirTag Pro concept ad). Black frame, heavy grotesk caps stacked in lines that all run to the same full width: a name set tall and condensed, a line under it set short and wide. Brushed-silver fill, one hot word in orange-to-pink (SLOP, the 1 of DAY 1). Each line lands on a stomp, snapping from a thin cut to the heavy one, and name and end cards stay up two stomps or more (about a second): at one stomp James found the text moved too fast. `film/src/brand/Slab.tsx` fits every line ink edge to ink edge: it solves Roboto Flex's width axis for the line's cap height, SVG `textLength` takes up the last pixels, and the first and last glyphs' side bearings (`rf-metrics.json`, from the font's own outlines) are cancelled so a stack's edges line up. Episode plans list them as `type` cues.
- The earlier look (slate tags in corners, mono labels, the serif-italic *no*, the red strike) read as AI-made and is retired for the reels; `Tag`, `Claim`, `Lockup` and `End` remain for the 9:16 cuts.
- Light grain, every cut lands with a small punch.
- `film/src/brand/` holds the shared pieces (`Slab`, `Grain`, `tokens`, the older `Lockup`, `Tag`); each episode is a plan in `film/src/ep/`.

## How an episode is made

1. **Capture** (`rig/`): `capture.mjs` films the real site in headless Chromium with a virtual clock (`vt-shim.js`): `performance.now`, `Date`, `requestAnimationFrame`, timers, every Web Animation / CSS animation and `<video>` advance exactly one frame per screenshot, so WebGL and scroll animations come out perfectly smooth at 60 fps no matter how slow the software renderer is. A shot is a JSON spec (url, viewport, scroll keyframes, mouse path, clicks); see `rig/specs/`. Phone shots are 432x768 CSS px at DPR 2.5 = 1080x1920; landscape shots are 1440x810 CSS px at DPR 4/3 = 1920x1080 (the laptop shot at DPR 2 for the dive). The WebGL renderer string is reported as a real GPU so sites don't drop to their low-quality fallback. `login` signs in to a gated preview first (form values written `$NAME` are read from the environment), `warmupViewport` lets a heavy WebGL page warm up at a small size before the capture size, and events can hold keys (`down`/`up`). Nightline is filmed in the live game driven by its own autopilot (`?autopilot=1&autostart=1&car=…`, specs `rig/specs/nl-*.json`). `warmup.earlyStop` freezes the clock from the very first tick the moment a condition holds (the first intro word, a hero film starting), and `initJs` runs before the page (e.g. skipping an intro that was already seen). Headless Chromium has no H.264: route a site's H.264 videos to AV1 copies served by a server that answers Range requests (`routes: [{match, url}]`), or `<video>` can't seek and the frame freezes.
2. **Slop** (`slop/`): the parody AI-template page for the cold open, captured with the same rig.
3. **Cut** (`film/`): Remotion 4. The plan places each shot on the song's beat grid (`t0` = beat 0, `beatSec`), with tags, the cold open and the end card. Cut on the hits you measure in the drum stem, not on the raw grid: in Black Skinhead the stomp lands at beat x.55 of the grid from song 11.65 s on (pickup at x.89), so whole-beat cuts land a quarter second early. `mask` keeps one rectangle of a shot (the laptop screen in the portfolio) with black around it; `flash` whites out the first frames of a cut on a big hit. `trans` brings a cut in through a crossfade or a dip to white or black; `bumps` gives a long shot a small zoom kick on each stomp instead of cutting; `screen` refills a device screen inside a capture with the source footage (in sync, scaled with the shot), so a dive into a laptop stays sharp. `tools/sheet.sh` makes timestamped contact sheets of a capture for picking moments.
4. **Sound**: James uploads the song; vocals are removed with demucs (`htdemucs_ft`, drums+bass+other) and `film/tools/song.py` cuts the excerpt and masters it to -14 LUFS / -1 dBTP. Songs and stems are never committed.
5. **Encode**: full quality for posting plus a light 30 fps copy for previewing on a phone.
