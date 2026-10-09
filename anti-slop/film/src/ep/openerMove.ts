import type {Episode} from '../Film';

// Reel 00 recut to Jane & The Boy "Move" (vocals in), 1920x1080. Same shots and cards as opener16, re-timed to Move's grid.
// Song beat n is at 0.56018 + 0.58824 n s. Film 0 = song 115.71 s, in the breakdown, so the portfolio's word roll runs
// over it and his name lands on beat 199, where everything slams back in. The song stops at 131.05 and sings "MOVE" alone
// (its M at 131.71, beat 222.95, measured on the vocal stem), back in on beat 226; "move" again with its M at 148.95 (beat 252.25); last hit beat 256; dead stop beat 257.
const S0 = 115.71;
const B = 0.58824;
const T0 = 0.56018 - S0; // film seconds of beat 0
const L = 'cap/l/';
const SCREEN: [number, number, number, number] = [648, 406.5, 1269.5, 820];
const NOTCH: [number, number, number, number] = [922.5, 406.5, 996, 417];
const SCREEN_O = '49.935% 56.78%';
const DIVE = 3.15;
const HANDOFF = 1.206;
const N = 'cap/nl/';
const NL = N + 'nl-laferrari.mp4';
const nlAt = (capture: number) => capture - 2.2;
const HR_SLAM = 2.57;
const NAME = 199; // his name on the slam
const W0 = -T0 / B; // beat at film 0

export const openerMove: Episode = {
  reel: 'Reel 00',
  site: 'One site a day',
  url: 'jamescamarota.com',
  beatSec: B,
  t0: T0,
  cuts: [
    // the portfolio's own intro, its timing in seconds kept from the Black Skinhead cut
    {id: 'words', at: W0, beats: NAME - W0, src: L + 'l-port-intro.mp4', from: 0.0, speed: 0.94, layout: 'full', push: [1.0, 1.04], punch: false},
    {id: 'name', at: NAME, beats: 1.3, src: L + 'l-port-intro.mp4', from: 1.85, layout: 'full', push: [1.05, 1.0], flash: 0.35},
    {id: 'hero', at: NAME + 1.3, beats: 0.7, src: L + 'l-port-intro.mp4', from: 2.9, speed: 1.6, layout: 'full', push: [1.0, 1.02]},
    // Nightline (card 201-203)
    {id: 'dive', at: 203, beats: 1, src: L + 'l-port-show2.mp4', from: 2.2, layout: 'full', push: [1.0, DIVE], pushEase: 'in', origin: SCREEN_O, punch: false, flash: 0.25, screen: {src: NL, from: nlAt(2.2), rect: SCREEN, notch: NOTCH}},
    {id: 'nl-laferrari', at: 204, beats: 1, src: NL, from: nlAt(2.2) + 1 * B, layout: 'full', push: [HANDOFF, HANDOFF * 1.1], shift: [73, 0], punch: false},
    {id: 'nl-gt2', at: 205, beats: 1, src: N + 'nl-gt2.mp4', from: 0.25, layout: 'full', push: [1.0, 1.04]},
    {id: 'nl-w1', at: 206, beats: 1, src: N + 'nl-w1.mp4', from: 0.25, layout: 'full', push: [1.0, 1.05]},
    {id: 'nl-jesko', at: 207, beats: 1, src: N + 'nl-jesko.mp4', from: 0.25, layout: 'full', push: [1.0, 1.04]},
    {id: 'nl-amg', at: 208, beats: 1, src: N + 'nl-amg.mp4', from: 0.25, layout: 'full', push: [1.0, 1.04]},
    {id: 'pullback', at: 209, beats: 2, src: L + 'l-port-show2.mp4', from: 3.0, layout: 'full', push: [DIVE, 1.0], origin: SCREEN_O, punch: false, screen: {src: NL, from: nlAt(2.8), rect: SCREEN, notch: NOTCH}},
    // Riverstair (card 211-213), the falls until the song stops
    {id: 'rs-fly', at: 213, beats: 1, src: L + 'l-river.mp4', from: 2.2, speed: 1.4, layout: 'full', push: [1.0, 1.03], flash: 0.4},
    {id: 'rs-city', at: 214, beats: 1, src: L + 'l-river.mp4', from: 4.0, layout: 'full', push: [1.0, 1.02]},
    {id: 'rs-head', at: 215, beats: 1, src: L + 'l-river.mp4', from: 5.6, layout: 'full', push: [1.0, 1.02]},
    {id: 'rs-dive', at: 216, beats: 5, src: L + 'l-river.mp4', from: 8.5, speed: 0.9, layout: 'full', push: [1.0, 1.05], punch: false, bumps: [217, 218, 219, 220]},
    // NO TEMPLATES as the song stops, NO SLOP the instant "MOVE" starts, Aether on the slam back in
    {id: 'ae-hero', at: 226, beats: 2, src: L + 'l-aether.mp4', from: 0.4, layout: 'full', push: [1.0, 1.03], flash: 0.6, bumps: [227]},
    {id: 'ae-iris', at: 228, beats: 1, src: L + 'l-aether.mp4', from: 3.55, layout: 'full', push: [1.0, 1.02]},
    {id: 'ae-amber', at: 229, beats: 1, src: L + 'l-aether.mp4', from: 4.65, layout: 'full', push: [1.0, 1.02]},
    {id: 'ae-exploded', at: 230, beats: 1, src: L + 'l-aether.mp4', from: 6.85, layout: 'full', push: [1.0, 1.03]},
    {id: 'ae-aurore', at: 231, beats: 1, src: L + 'l-aether.mp4', from: 8.8, speed: 1.0, layout: 'full', push: [1.0, 1.02]},
    {id: 'ae-midi', at: 232, beats: 1, src: L + 'l-aether.mp4', from: 10.25, speed: 0.9, layout: 'full', push: [1.0, 1.03]},
    // Perihelion (card 233-235)
    {id: 'pe-hero', at: 235, beats: 1, src: L + 'l-peri.mp4', from: 1.75, speed: 1.4, layout: 'full', push: [1.0, 1.03]},
    {id: 'pe-earth', at: 236, beats: 1, src: L + 'l-peri.mp4', from: 4.3, layout: 'full', push: [1.0, 1.02]},
    {id: 'pe-moon', at: 237, beats: 1, src: L + 'l-peri.mp4', from: 6.85, speed: 1.3, layout: 'full', push: [1.0, 1.03]},
    {id: 'pe-saturn', at: 238, beats: 1, src: L + 'l-peri.mp4', from: 12.45, layout: 'full', push: [1.0, 1.03]},
    {id: 'pe-ring', at: 239, beats: 1, src: L + 'l-peri.mp4', from: 13.35, speed: 0.6, layout: 'full', push: [1.0, 1.05], origin: '50% 40%'},
    // Gleid (card 240-242)
    {id: 'gl-hero', at: 242, beats: 1, src: L + 'l-gleid.mp4', from: 0.45, speed: 0.62, layout: 'full', push: [1.0, 1.04], punch: false},
    {id: 'gl-kindling', at: 243, beats: 1, src: L + 'l-gleid.mp4', from: 1.25, layout: 'full', push: [1.0, 1.02]},
    {id: 'gl-flame', at: 244, beats: 1, src: L + 'l-gleid.mp4', from: 2.85, layout: 'full', push: [1.0, 1.02]},
    {id: 'gl-embers', at: 245, beats: 1, src: L + 'l-gleid.mp4', from: 3.85, layout: 'full', push: [1.0, 1.02]},
    // HRCG (card 246-248): the hand hits the slab on the cut
    {id: 'hr-impact', at: 248, beats: 1, src: L + 'l-hrcg-hero.mp4', from: HR_SLAM, layout: 'full', push: [1.05, 1.0], flash: 0.6},
    {id: 'hr-brick', at: 249, beats: 1, src: L + 'l-hrcg.mp4', from: 7.85, layout: 'full', push: [1.0, 1.02]},
    {id: 'hr-bolt', at: 250, beats: 1, src: L + 'l-hrcg.mp4', from: 10.0, layout: 'full', push: [1.0, 1.02]},
  ],
  type: [
    {from: 201, to: 203, place: 'card', lines: [{t: 'NIGHTLINE', h: 330}, {t: 'PLAYS IN YOUR BROWSER', wdth: 151, wght: 800}]},
    {from: 211, to: 213, place: 'card', lines: [{t: 'RIVERSTAIR', h: 330}, {t: 'VENTURE FUND', wdth: 151, wght: 800}]},
    {from: 221, to: 222.93, place: 'card', lines: [{t: 'NO TEMPLATES', h: 400}]},
    {from: 222.93, to: 226, place: 'card', lines: [{t: 'NO {SLOP}', h: 600}]},
    {from: 233, to: 235, place: 'card', lines: [{t: 'PERIHELION', h: 330}, {t: 'SPACE TRAVEL', wdth: 151, wght: 800}]},
    {from: 240, to: 242, place: 'card', lines: [{t: 'GLEID', h: 330}, {t: 'ONE FIRE. 14 SEATS.', wdth: 151, wght: 800}]},
    {from: 246, to: 248, place: 'card', lines: [{t: 'HRCG', h: 330}, {t: 'ROBOT CONSTRUCTION GAMES', wdth: 151, wght: 800}]},
    // SLOP lands on the M of "move"
    {from: 251, to: 253, place: 'card', lines: [{t: 'ANTI', h: 420}, {t: '{SLOP}', h: 420, inBeat: 252.24}]},
    {from: 253, to: 256, place: 'card', lines: [{t: 'A NEW SITE', h: 380}, {t: 'EVERY DAY', h: 380, inBeat: 254}]},
    {from: 256, to: 260, place: 'card', width: 1240, lines: [{t: 'DAY {1}', h: 620}, {t: 'JAMESCAMAROTA.COM', wdth: 151, wght: 700}]},
  ],
  // DAY 1 on the last hit, held a little past the song's dead stop
  durationSec: T0 + 258.2 * B,
};
