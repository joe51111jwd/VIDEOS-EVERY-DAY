import type {Episode} from '../Film';

// Reel 00, the series opener: every site in one cut, to Black Skinhead (instrumental).
// Film 0 = song 7.683 s, on the kick of beat 8 (beat 0 is song 3.9955 s, the beat is 0.46216 s).
// The groove is light until beat 15.92; from 16.56 the stomp lands on every beat at x.55 (measured from
// the drum stem's onsets), with a pickup at x.89 before each bar. Cuts sit on those hits, not on whole beats.
// The song stops dead twice (song 20.24-20.57 and 22.03-22.41); the picture freezes there under a claim.
const S0 = 7.683;
const T0 = 3.9955 - S0; // film seconds of beat 0
const B = 0.46216;
const film = (song: number) => song - S0;
const O = 'cap/op/';
const P = 'cap/peri/';
// the MacBook's screen in the portfolio capture (o-port-scroll, phone frame px): punch-ins keep only the game
const SCREEN: [number, number, number, number] = [160, 735, 938, 1258];

export const opener: Episode = {
  reel: 'Reel 00',
  site: 'One site a day',
  url: 'jamescamarota.com',
  beatSec: B,
  t0: T0,
  cuts: [
    // the portfolio's own intro: every project's name flashes past, faster and faster, onto his name on the kick
    {id: 'words', at: 8, beats: 4, src: O + 'o-port-intro.mp4', from: 0.0, layout: 'full', push: [1.0, 1.06], punch: false},
    {id: 'name', at: 12, beats: 1.67, src: O + 'o-port-intro.mp4', from: 1.97, speed: 1.3, layout: 'full', push: [1.08, 1.0], flash: 0.35},
    {id: 'hero', at: 13.67, beats: 2.25, src: O + 'o-port-intro.mp4', from: 3.4, speed: 1.2, layout: 'full', push: [1.0, 1.05]},
    // Nightline: the lid opens on the fill, the game plays on the stomp, each hit pushes further into the screen
    {id: 'lid', at: 15.92, beats: 0.64, src: O + 'o-port-scroll.mp4', from: 2.6, speed: 1.6, layout: 'full', push: [1.0, 1.02]},
    {id: 'nl-a', at: 16.56, beats: 1.01, src: O + 'o-port-scroll.mp4', from: 3.9, layout: 'full', push: [1.04, 1.08], flash: 0.5},
    {id: 'nl-b', at: 17.57, beats: 1.0, src: O + 'o-port-scroll.mp4', from: 5.9, layout: 'full', push: [1.6, 1.65], origin: '50.8% 51.9%', mask: SCREEN},
    {id: 'nl-c', at: 18.57, beats: 1.0, src: O + 'o-port-scroll.mp4', from: 8.7, layout: 'full', push: [2.0, 2.06], origin: '50.8% 51.9%', mask: SCREEN},
    {id: 'nl-d', at: 19.57, beats: 1.0, src: O + 'o-port-scroll.mp4', from: 10.9, layout: 'full', push: [1.75, 1.6], origin: '50.8% 51.9%', mask: SCREEN},
    // Riverstair: the name in the cloud, the fly-in to the waterfall city, the headline, then the scroll dives down the falls
    {id: 'rs-veil', at: 20.57, beats: 1.0, src: O + 'o-river.mp4', from: 0.0, speed: 1.2, layout: 'full', push: [1.0, 1.04], flash: 0.4},
    {id: 'rs-fly', at: 21.57, beats: 0.99, src: O + 'o-river.mp4', from: 2.2, speed: 1.6, layout: 'full', push: [1.0, 1.03]},
    {id: 'rs-city', at: 22.56, beats: 1.33, src: O + 'o-river.mp4', from: 4.2, speed: 1.2, layout: 'full', push: [1.0, 1.04]},
    {id: 'rs-head', at: 23.89, beats: 1.67, src: O + 'o-river.mp4', from: 5.9, layout: 'full', push: [1.0, 1.03]},
    {id: 'rs-dive', at: 25.56, beats: 2.99, src: O + 'o-river.mp4', from: 7.9, speed: 1.3, layout: 'full', push: [1.0, 1.08], punch: false},
    // Aether: the bottle holds still and re-lights on every stomp
    {id: 'ae-hero', at: 28.55, beats: 1.01, src: O + 'o-aether.mp4', from: 0.2, layout: 'full', push: [1.0, 1.03]},
    {id: 'ae-berg', at: 29.56, beats: 0.98, src: O + 'o-aether.mp4', from: 2.9, layout: 'full', push: [1.0, 1.03]},
    {id: 'ae-iris', at: 30.54, beats: 1.0, src: O + 'o-aether.mp4', from: 4.2, layout: 'full', push: [1.0, 1.03]},
    {id: 'ae-vessel', at: 31.54, beats: 1.01, src: O + 'o-aether.mp4', from: 7.6, layout: 'full', push: [1.0, 1.03]},
    // Perihelion: each planet swoops in on a stomp, then Saturn at eclipse until the song stops dead
    {id: 'pe-mars', at: 32.55, beats: 1.0, src: P + 'p-mars.mp4', from: 2.86, speed: 1.1, layout: 'full', push: [1.0, 1.05]},
    {id: 'pe-saturn', at: 33.55, beats: 1.0, src: P + 'p-saturn.mp4', from: 2.76, speed: 1.1, layout: 'full', push: [1.0, 1.05]},
    {id: 'pe-ring', at: 34.55, beats: 1.29, src: P + 'p-ring.mp4', from: 3.6, speed: 0.8, layout: 'full', push: [1.16, 1.2], origin: '50% 29%'},
    // Gleid: back in on the fire, then the courses turn over on the stomps and freeze at the second stop
    {id: 'gl-hero', at: 35.84, beats: 1.71, src: O + 'o-gleid.mp4', from: 0.2, layout: 'full', push: [1.0, 1.05], flash: 0.3},
    {id: 'gl-kindling', at: 37.55, beats: 0.99, src: O + 'o-gleid.mp4', from: 1.1, layout: 'full', push: [1.0, 1.03]},
    {id: 'gl-coals', at: 38.54, beats: 1.31, src: O + 'o-gleid.mp4', from: 2.45, layout: 'full', push: [1.0, 1.03]},
    // the building site: robot 07's hand hits the slab as the drums come back, three of the five tasks, then the robot again
    {id: 'hr-impact', at: 39.85, beats: 2.68, src: O + 'o-hrcg.mp4', from: 0.05, layout: 'full', push: [1.06, 1.0], flash: 0.6},
    {id: 'hr-brick', at: 42.53, beats: 1.01, src: O + 'o-hrcg.mp4', from: 3.85, layout: 'full', push: [1.0, 1.04]},
    {id: 'hr-bolt', at: 43.54, beats: 1.0, src: O + 'o-hrcg.mp4', from: 6.3, layout: 'full', push: [1.0, 1.04]},
    {id: 'hr-pipe', at: 44.54, beats: 0.99, src: O + 'o-hrcg.mp4', from: 7.65, layout: 'full', push: [1.0, 1.04]},
    {id: 'hr-lit', at: 45.53, beats: 2.34, src: O + 'o-hrcg.mp4', from: 1.6, layout: 'full', push: [1.0, 1.1], origin: '50% 35%'},
    // the recap: one site per stomp, faster at the end of the bar
    {id: 'k-night', at: 47.87, beats: 0.66, src: O + 'o-port-scroll.mp4', from: 7.0, layout: 'full', push: [1.9, 1.95], origin: '50.8% 51.9%', mask: SCREEN, flash: 0.3},
    {id: 'k-river', at: 48.53, beats: 1.0, src: O + 'o-river.mp4', from: 4.4, layout: 'full', push: [1.0, 1.04]},
    {id: 'k-aether', at: 49.53, beats: 1.0, src: O + 'o-aether.mp4', from: 5.5, layout: 'full', push: [1.0, 1.04]},
    {id: 'k-saturn', at: 50.53, beats: 1.0, src: P + 'p-ring.mp4', from: 4.0, speed: 0.6, layout: 'full', push: [1.12, 1.16], origin: '50% 29%'},
    {id: 'k-gleid', at: 51.53, beats: 0.33, src: O + 'o-gleid.mp4', from: 0.84, layout: 'full', push: [1.04, 1.06]},
    {id: 'k-hrcg', at: 51.86, beats: 0.66, src: O + 'o-hrcg.mp4', from: 0.7, layout: 'full', push: [1.04, 1.08]},
  ],
  tags: [
    {n: '01', title: 'Nightline', note: 'Racing game · plays in a browser', from: 16.8, to: 20.35},
    {n: '02', title: 'Riverstair', note: 'Venture fund · scroll to dive in', from: 21.75, to: 25.35},
    {n: '03', title: 'Aether', note: 'Fragrance · real-time glass', from: 28.75, to: 32.35},
    {n: '04', title: 'Perihelion', note: 'Space travel · zero photos', from: 32.75, to: 34.95},
    {n: '05', title: 'Gleid', note: 'Restaurant · one fire, 14 seats', from: 36.05, to: 38.85},
    {n: '06', title: 'HRCG', note: 'Robot construction games', from: 40.3, to: 45.35},
  ],
  stops: [
    {from: film(20.24), to: film(20.57), lead: 'no', word: 'TEMPLATES.'},
    {from: film(22.03), to: film(22.41), lead: 'no', word: 'SLOP.'},
  ],
  end: {
    atBeat: 52.52,
    tiles: [
      {src: O + 'o-hrcg.mp4', from: 0.3, rate: 0.4},
      {src: O + 'o-aether.mp4', from: 8.8, rate: 0.15},
      {src: P + 'p-saturn.mp4', from: 2.95, rate: 0.4},
      {src: O + 'o-gleid.mp4', from: 0.2, rate: 0.15},
      {src: O + 'o-river.mp4', from: 3.6, rate: 0.4},
      {src: O + 'o-aether.mp4', from: 5.5, rate: 0.1},
      {src: P + 'p-earth.mp4', from: 1.2, rate: 0.5},
      {src: O + 'o-river.mp4', from: 8.6, rate: 0.15},
      {src: O + 'o-hrcg.mp4', from: 6.4, rate: 0.15},
    ],
    stepBeats: 0.5,
    markBeat: 56.53,
  },
  durationSec: film(3.9955 + 60.52 * B) + 0.6,
};
