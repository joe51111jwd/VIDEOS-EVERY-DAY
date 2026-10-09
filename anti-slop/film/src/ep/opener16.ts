import type {Episode} from '../Film';

// Reel 00, landscape and longer: every site in one cut, to Black Skinhead (instrumental), 1920x1080.
// Film 0 = song 7.683 s, on the kick of beat 8 (beat 0 is song 3.9955 s, the beat is 0.46216 s).
// The stomp lands at x.5x of every beat from 16.56 (measured on the drum stem: 36.57 37.57 38.55 | 40.57 41.56 42.55
// 43.56 44.56 45.56 46.55 47.55 48.53 49.54 50.54 51.56 52.54 53.55 54.52 55.55 56.53 57.54 58.53 59.54 60.53 61.52
// 62.53 63.52 64.53 65.52 66.53 67.52 68.53 69.52 70.52 71.52 | drums out 72-79.5 | 80.51 81.49 82.51 83.51 84.50
// 85.49 86.49 87.50 88.50 89.50 90.48 91.49, then silence at 92).
// The song stops dead twice (song 20.24-20.57 and 22.03-22.41); the picture cuts to a black card for the silence.
// Mostly hard cuts on the stomps; each site opens on a black name card. Transitions: a dive into the laptop's screen and
// back out (Nightline), a white-out through the waterfall's mist (Riverstair to Aether), a speed ramp on HRCG's slam.
// Long shots kick on the stomps instead of cutting.
const S0 = 7.683;
const T0 = 3.9955 - S0; // film seconds of beat 0
const B = 0.46216;
const film = (song: number) => song - S0;
const L = 'cap/l/';
// the MacBook's screen in l-port-show once the lid is open: x 648-1269.5, y 406.5-820 of the 1920x1080 frame (3:2).
// The dive and the pull-back refill it with the 1080p game footage in sync (the page's own video is soft at x3), and
// scale about its centre until it fills the frame (x3.15). There the footage is 1.206x full frame with its centre 73 px
// below the frame's, so the first full-frame cut starts at exactly that size and offset: the handoff is invisible.
const SCREEN: [number, number, number, number] = [648, 406.5, 1269.5, 820];
const NOTCH: [number, number, number, number] = [922.5, 406.5, 996, 417];
const SCREEN_O = '49.935% 56.78%';
const DIVE = 3.15;
const HANDOFF = 1.206;
// the game, filmed live with today's five cars (Neon District at night, chase cam, the game's own autopilot driving)
const N = 'cap/nl/';
const NL = N + 'nl-laferrari.mp4';
// the recaptured page plays the LaFerrari clip on its laptop and is set back to 0 s at 2.2 s, as the dive starts
const nlAt = (capture: number) => capture - 2.2;
// l-hrcg-hero: the homepage playing the hero film from its first frame; the hand meets the slab at HR_SLAM s
const HR_SLAM = 2.57;
const HR_WIND_SPEED = 0.8;
const HR_WIND_FROM = HR_SLAM - 6.91 * B * HR_WIND_SPEED;

export const opener16: Episode = {
  reel: 'Reel 00',
  site: 'One site a day',
  url: 'jamescamarota.com',
  beatSec: B,
  t0: T0,
  cuts: [
    // the portfolio's own intro: every project's name flashes past onto his name on the kick, then the deck fans out
    {id: 'words', at: 8, beats: 4, src: L + 'l-port-intro.mp4', from: 0.0, speed: 0.97, layout: 'full', push: [1.0, 1.04], punch: false},
    {id: 'name', at: 12, beats: 1.66, src: L + 'l-port-intro.mp4', from: 1.85, layout: 'full', push: [1.05, 1.0], flash: 0.35},
    {id: 'hero', at: 13.66, beats: 0.99, src: L + 'l-port-intro.mp4', from: 2.9, speed: 1.6, layout: 'full', push: [1.0, 1.02]},
    // Nightline: the MacBook's lid opens on the fill, the stomp dives into its screen, the game takes the frame
    {id: 'lid', at: 15.92, beats: 0.64, src: L + 'l-port-show2.mp4', from: 1.4, speed: 2.0, layout: 'full', push: [1.0, 1.02]},
    {id: 'dive', at: 16.56, beats: 1.01, src: L + 'l-port-show2.mp4', from: 2.2, layout: 'full', push: [1.0, DIVE], pushEase: 'in', origin: SCREEN_O, punch: false, flash: 0.25, screen: {src: NL, from: nlAt(2.2), rect: SCREEN, notch: NOTCH}},
    // a car per stomp, all five on the grid today
    {id: 'nl-laferrari', at: 17.57, beats: 1.0, src: NL, from: nlAt(2.2) + 1.01 * B, layout: 'full', push: [HANDOFF, HANDOFF * 1.1], shift: [73, 0], punch: false},
    {id: 'nl-gt2', at: 18.57, beats: 1.0, src: N + 'nl-gt2.mp4', from: 0.25, layout: 'full', push: [1.0, 1.04]},
    {id: 'nl-w1', at: 19.57, beats: 1.0, src: N + 'nl-w1.mp4', from: 0.25, layout: 'full', push: [1.0, 1.05]},
    {id: 'nl-jesko', at: 20.57, beats: 1.0, src: N + 'nl-jesko.mp4', from: 0.25, layout: 'full', push: [1.0, 1.04]},
    {id: 'nl-amg', at: 21.57, beats: 0.99, src: N + 'nl-amg.mp4', from: 0.25, layout: 'full', push: [1.0, 1.04]},
    // and back out of the screen: it was a website all along
    {id: 'pullback', at: 22.56, beats: 1.99, src: L + 'l-port-show2.mp4', from: 3.0, layout: 'full', push: [DIVE, 1.0], origin: SCREEN_O, punch: false, screen: {src: NL, from: nlAt(3.0), rect: SCREEN, notch: NOTCH}},
    // Riverstair: the name in the cloud, the fly-in to the waterfall city, the headline, then the scroll dives down the falls
    {id: 'rs-veil', at: 25.55, beats: 1.0, src: L + 'l-river.mp4', from: 0.9, speed: 1.3, layout: 'full', push: [1.0, 1.03], flash: 0.4},
    {id: 'rs-fly', at: 26.55, beats: 1.0, src: L + 'l-river.mp4', from: 2.2, speed: 1.4, layout: 'full', push: [1.0, 1.02]},
    {id: 'rs-city', at: 27.55, beats: 1.0, src: L + 'l-river.mp4', from: 4.0, layout: 'full', push: [1.0, 1.02]},
    {id: 'rs-head', at: 28.55, beats: 2.0, src: L + 'l-river.mp4', from: 5.6, layout: 'full', push: [1.0, 1.02]},
    // the scroll takes the camera down the falls in one shot, kicking on each stomp, and the song stops dead on the drop
    {id: 'rs-dive', at: 30.55, beats: 5.29, src: L + 'l-river.mp4', from: 8.5, speed: 0.8, layout: 'full', push: [1.0, 1.05], punch: false, bumps: [31.54, 32.55, 33.55, 34.55]},
    // the song comes back and the camera plunges into the mist, which whites out into the next site
    {id: 'rs-mist', at: 35.84, beats: 0.73, src: L + 'l-river.mp4', from: 10.62, speed: 2.0, layout: 'full', push: [1.0, 1.12], pushEase: 'in', punch: false},
    // Aether: out of the mist onto the bottle, then a note per stomp
    {id: 'ae-hero', at: 36.57, beats: 3.28, src: L + 'l-aether.mp4', from: 0.0, layout: 'full', push: [1.0, 1.02], punch: false, trans: {type: 'white', beats: 1.0}, bumps: [37.57, 38.55]},
    {id: 'ae-berg', at: 39.85, beats: 0.72, src: L + 'l-aether.mp4', from: 2.2, layout: 'full', push: [1.0, 1.02], flash: 0.3},
    {id: 'ae-iris', at: 40.57, beats: 0.99, src: L + 'l-aether.mp4', from: 3.55, layout: 'full', push: [1.0, 1.02]},
    {id: 'ae-amber', at: 41.56, beats: 0.99, src: L + 'l-aether.mp4', from: 4.65, layout: 'full', push: [1.0, 1.02]},
    {id: 'ae-vessel', at: 42.55, beats: 1.01, src: L + 'l-aether.mp4', from: 6.0, layout: 'full', push: [1.0, 1.02]},
    // the bottle comes apart into its parts, then the three editions (a click swaps Aurore for Midi)
    {id: 'ae-exploded', at: 43.56, beats: 2.0, src: L + 'l-aether.mp4', from: 6.85, layout: 'full', push: [1.0, 1.03], bumps: [44.56]},
    {id: 'ae-editions', at: 45.56, beats: 2.97, src: L + 'l-aether.mp4', from: 8.35, speed: 1.4, layout: 'full', push: [1.0, 1.03], bumps: [46.55, 47.55]},
    // Perihelion: the sunrise, Earth, the three destinations, each world on a bar
    {id: 'pe-hero', at: 49.54, beats: 1.0, src: L + 'l-peri.mp4', from: 1.75, speed: 1.4, layout: 'full', push: [1.0, 1.03]},
    {id: 'pe-earth', at: 50.54, beats: 1.02, src: L + 'l-peri.mp4', from: 4.3, layout: 'full', push: [1.0, 1.02]},
    {id: 'pe-dest', at: 51.56, beats: 0.98, src: L + 'l-peri.mp4', from: 6.05, layout: 'full', push: [1.0, 1.02]},
    {id: 'pe-moon', at: 52.54, beats: 1.98, src: L + 'l-peri.mp4', from: 6.85, speed: 1.3, layout: 'full', push: [1.0, 1.03], bumps: [53.55]},
    {id: 'pe-mars', at: 54.52, beats: 2.01, src: L + 'l-peri.mp4', from: 9.95, layout: 'full', push: [1.0, 1.03], bumps: [55.55]},
    {id: 'pe-saturn', at: 56.53, beats: 2.0, src: L + 'l-peri.mp4', from: 12.45, layout: 'full', push: [1.0, 1.03], bumps: [57.54]},
    {id: 'pe-ring', at: 58.53, beats: 2.0, src: L + 'l-peri.mp4', from: 13.35, speed: 0.6, layout: 'full', push: [1.0, 1.05], origin: '50% 40%', bumps: [59.54]},
    // Gleid: through black into the fire, the wordmark forms, then the courses turn over on the stomps
    {id: 'gl-hero', at: 61.52, beats: 3.01, src: L + 'l-gleid.mp4', from: 0.0, speed: 0.62, layout: 'full', push: [1.0, 1.04], punch: false, bumps: [62.53, 63.52]},
    // the menu: each stomp swaps the course word and the plate (kindling, flame, coals, embers, ash, smoor)
    {id: 'gl-kindling', at: 64.53, beats: 0.99, src: L + 'l-gleid.mp4', from: 1.25, layout: 'full', push: [1.0, 1.02]},
    {id: 'gl-bannock', at: 65.52, beats: 1.01, src: L + 'l-gleid.mp4', from: 2.4, layout: 'full', push: [1.0, 1.02]},
    {id: 'gl-flame', at: 66.53, beats: 0.99, src: L + 'l-gleid.mp4', from: 2.85, layout: 'full', push: [1.0, 1.02]},
    {id: 'gl-coals', at: 67.52, beats: 1.01, src: L + 'l-gleid.mp4', from: 3.35, layout: 'full', push: [1.0, 1.02]},
    {id: 'gl-embers', at: 68.53, beats: 0.99, src: L + 'l-gleid.mp4', from: 3.85, layout: 'full', push: [1.0, 1.02]},
    {id: 'gl-ash', at: 69.52, beats: 1.0, src: L + 'l-gleid.mp4', from: 4.35, layout: 'full', push: [1.0, 1.02]},
    {id: 'gl-smoor', at: 70.52, beats: 1.0, src: L + 'l-gleid.mp4', from: 4.78, speed: 0.65, layout: 'full', push: [1.0, 1.02]},
    // back to the fire as the drums drop out
    {id: 'gl-fire', at: 71.52, beats: 1.08, src: L + 'l-gleid.mp4', from: 0.85, speed: 0.5, layout: 'full', push: [1.03, 1.08], punch: false},
    // the breakdown: the drums drop out on the building site's homepage, the robot crouched over the chalk line;
    // in slow motion its arm comes up, and the hand hits the slab on the drums' return, where the real-speed dust takes over
    {id: 'hr-wind', at: 73.6, beats: 6.91, src: L + 'l-hrcg-hero.mp4', from: HR_WIND_FROM, speed: HR_WIND_SPEED, layout: 'full', push: [1.0, 1.06], punch: false},
    {id: 'hr-impact', at: 80.51, beats: 2.0, src: L + 'l-hrcg-hero.mp4', from: HR_SLAM, layout: 'full', push: [1.05, 1.0], flash: 0.6},
    {id: 'hr-brick', at: 82.51, beats: 1.0, src: L + 'l-hrcg.mp4', from: 7.85, layout: 'full', push: [1.0, 1.02]},
    {id: 'hr-bolt', at: 83.51, beats: 0.99, src: L + 'l-hrcg.mp4', from: 10.0, layout: 'full', push: [1.0, 1.02]},
    {id: 'hr-pipe', at: 84.5, beats: 0.99, src: L + 'l-hrcg.mp4', from: 11.05, layout: 'full', push: [1.0, 1.02]},
    {id: 'hr-robot', at: 85.49, beats: 2.01, src: L + 'l-hrcg.mp4', from: 1.4, layout: 'full', push: [1.0, 1.08], origin: '55% 45%'},
  ],
  // the type: the AirTag Pro ad's language. Heavy grotesk stretched edge to edge, stacked, chrome or hot.
  type: [
    // each site opens on its name, black card, the stomp
    {from: 14.65, to: 15.92, place: 'card', lines: [{t: 'NIGHTLINE', h: 330}, {t: 'PLAYS IN YOUR BROWSER', wdth: 151, wght: 800, inBeat: 15.01}]},
    {from: 24.55, to: 25.55, place: 'card', lines: [{t: 'RIVERSTAIR', h: 330}, {t: 'VENTURE FUND', wdth: 151, wght: 800}]},
    {from: 35.149, to: 35.863, place: 'card', lines: [{t: 'NO TEMPLATES', h: 400}]},
    {from: 39.022, to: 39.845, place: 'card', lines: [{t: 'NO {SLOP}', h: 600}]},
    {from: 48.53, to: 49.54, place: 'card', lines: [{t: 'PERIHELION', h: 330}, {t: 'SPACE TRAVEL', wdth: 151, wght: 800}]},
    {from: 60.53, to: 61.52, place: 'card', lines: [{t: 'GLEID', h: 330}, {t: 'ONE FIRE. 14 SEATS.', wdth: 151, wght: 800}]},
    {from: 72.6, to: 73.6, place: 'card', lines: [{t: 'HRCG', h: 330}, {t: 'ROBOT CONSTRUCTION GAMES', wdth: 151, wght: 800}]},
    // the end: the series' name, the promise, and day one on the last stomp, held into the song's dead stop
    {from: 87.5, to: 89.5, place: 'card', lines: [{t: 'ANTI', h: 420}, {t: '{SLOP}', h: 420, inBeat: 88.5}]},
    {from: 89.5, to: 91.49, place: 'card', lines: [{t: 'A NEW SITE', h: 380}, {t: 'EVERY DAY', h: 380, inBeat: 90.48}]},
    {from: 91.49, to: 93.3, place: 'card', width: 1240, lines: [{t: 'DAY {1}', h: 620}, {t: 'JAMESCAMAROTA.COM', wdth: 151, wght: 700}]},
  ],
  durationSec: film(3.9955 + 93.25 * B),
};
