import type {Episode} from '../Film';

// Reel 01: Perihelion (jamescamarota.com/sites/perihelion), cut to Black Skinhead (instrumental).
// Film 0 = song 3.0955 s. Beat 0 is the drop (song 3.9955 s); the beat is 0.46216 s (129.8 BPM), fitted to
// the hi-hat triplets. The song stops dead twice: song 20.24-20.57 and 22.03-22.41 (film 17.145 and 18.935);
// the picture freezes there and a claim fills the silence. Planets, rings and coastlines on this site are
// all drawn by shaders (src/three/bake*.ts, ring.ts, geo.ts): no photos, which is what the tags say.
const P = 'cap/peri/';
export const perihelion: Episode = {
  reel: 'Reel 01',
  site: 'Perihelion',
  url: 'jamescamarota.com',
  beatSec: 0.46216,
  t0: 0.9,
  slop: {src: 'cap/slop/slop-space-phone.mp4', from: 0.1},
  strikeBeat: 0,
  leaveBeat: 3,
  cuts: [
    // the globe burns in under the mark
    {id: 'burn', at: 0, beats: 4, src: P + 'p-intro.mp4', from: 1.05, layout: 'full', push: [1.0, 1.04]},
    // scroll off the hero: the sun comes up over the limb
    {id: 'sunrise', at: 4, beats: 4, src: P + 'p-intro.mp4', from: 4.95, speed: 1.9, layout: 'full', push: [1.0, 1.06], origin: '50% 75%',
      tag: {n: '01', title: 'Sunrise over orbit', note: 'Real-time 3D · not a video', inBeat: 0.5, outBeat: 3.5}},
    // Earth turns in under the sun
    {id: 'earth', at: 8, beats: 4, src: P + 'p-earth.mp4', from: 1.0, speed: 1.3, layout: 'full', push: [1.0, 1.04],
      tag: {n: '02', title: 'Earth', note: 'Real coastlines · zero photos', inBeat: 0.75, outBeat: 3.6}},
    // "Three destinations." and the Moon swings past, its name deciphering
    {id: 'moon', at: 12, beats: 8, src: P + 'p-moon.mp4', from: 0.6, speed: 1.4, layout: 'full', push: [1.0, 1.04]},
    // each planet swoops in on the downbeat while its name deciphers
    {id: 'mars', at: 20, beats: 4, src: P + 'p-mars.mp4', from: 2.86, speed: 1.1, layout: 'full', push: [1.0, 1.05]},
    {id: 'saturn', at: 24, beats: 4, src: P + 'p-saturn.mp4', from: 2.76, speed: 1.1, layout: 'full', push: [1.0, 1.05]},
    // Saturn, backlit by the sun, brightens as it turns: held in slow motion until the song stops dead
    {id: 'ring', at: 28, beats: 8, src: P + 'p-ring.mp4', from: 3.05, speed: 0.68, layout: 'full', push: [1.1, 1.2], origin: '50% 29%',
      tag: {n: '03', title: 'Saturn at eclipse', note: 'Cassini gap included', inBeat: 1.5, outBeat: 6.6}},
    // the beat comes back on the boarding pass, which freezes again at the second stop
    {id: 'board-a', at: 36, beats: 4, src: P + 'p-board.mp4', from: 0.9, speed: 1.0, layout: 'full', push: [1.0, 1.03]},
    // back in on the downbeat as the ticket reprints for Mars, then Saturn on beat 42
    {id: 'board-b', at: 40, beats: 4, src: P + 'p-board.mp4', from: 2.25, speed: 1.46, layout: 'full', push: [1.0, 1.02],
      tag: {n: '04', title: 'Boarding pass', note: 'Tap a world · it reprints', inBeat: 0.6, outBeat: 3.5}},
    // same take, eased: scroll to the stub and tear it on beat 46
    {id: 'board-c', at: 44, beats: 4, src: P + 'p-board.mp4', from: 4.95, speed: 0.92, layout: 'full', push: [1.02, 1.04], punch: false},
    // the site's own sign-off: the PERIHELION wordmark rises over the footer
    {id: 'word', at: 48, beats: 4, src: P + 'p-word.mp4', from: 2.1, speed: 1.3, layout: 'full', push: [1.0, 1.04]},
  ],
  stops: [
    {from: 17.145, to: 0.9 + 36 * 0.46216, lead: 'no', word: 'TEMPLATES.'},
    {from: 18.935, to: 0.9 + 40 * 0.46216, lead: 'no', word: 'STOCK.'},
  ],
  // the end card: nine of the episode's shots keep playing, slowed, under the mark (grid order: rows of 3)
  end: {
    atBeat: 52,
    tiles: [
      {src: P + 'p-intro.mp4', from: 1.2, rate: 0.5},
      {src: P + 'p-saturn.mp4', from: 2.95, rate: 0.4},
      {src: P + 'p-earth.mp4', from: 1.2, rate: 0.5},
      {src: P + 'p-board.mp4', from: 4.0, rate: 0.2},
      {src: P + 'p-intro.mp4', from: 6.9, rate: 0.25},
      {src: P + 'p-moon.mp4', from: 4.4, rate: 0.3},
      {src: P + 'p-mars.mp4', from: 2.95, rate: 0.4},
      {src: P + 'p-ring.mp4', from: 3.4, rate: 0.3},
      {src: P + 'p-moon.mp4', from: 2.9, rate: 0.4},
    ],
    stepBeats: 0.5,
    markBeat: 56,
  },
  durationSec: 31.1,
};
