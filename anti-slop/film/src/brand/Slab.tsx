import React from 'react';
import {continueRender, delayRender, Easing, interpolate, useCurrentFrame} from 'remotion';
import {fontsReady, whenFontsReady} from './fonts';
import M from './rf-metrics.json';

/**
 * Apple-ad type: lines of heavy grotesk stretched to one shared width, stacked tight, chrome or hot gradient fill.
 * Each line is fitted ink-edge to ink-edge: the width axis of Roboto Flex is solved so the word fills the width at its
 * cap height, SVG textLength takes up the last few pixels, and the first and last glyphs' side bearings are cancelled
 * so every line in a stack starts and ends on the same vertical.
 */

export type Fill = 'chrome' | 'hot' | 'ink' | 'white';
export type Line = {
  t: string; // the text; {braces} mark a run in the hot fill
  h?: number; // cap height, px: the width axis is solved to fill the width at this height
  wdth?: number; // or a fixed width axis: the height follows from the width
  wght?: number;
  fill?: Fill;
  inF?: number; // frame (in the Slab's own time) the line lands; before that it isn't drawn
};

const FAM = 'Roboto Flex';
const CAP = M.cap / M.upm; // cap height per em
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const out3 = Easing.bezier(0.16, 1, 0.3, 1);

const fvs = (wdth: number, wght: number) => `'wdth' ${wdth.toFixed(2)}, 'wght' ${wght.toFixed(1)}, 'opsz' 144`;

// advance width of a run at 100px, measured in the page (so kerning counts); cached once the fonts are in
const cache = new Map<string, number>();
const measure = (text: string, wdth: number, wght: number) => {
  const key = `${text}|${wdth.toFixed(2)}|${wght}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const el = document.createElement('span');
  el.style.cssText = `position:absolute;left:-99999px;top:0;visibility:hidden;white-space:pre;font-family:'${FAM}';font-size:100px;font-variation-settings:${fvs(wdth, wght)};font-kerning:normal`;
  el.textContent = text;
  document.body.appendChild(el);
  const w = el.getBoundingClientRect().width;
  el.remove();
  if (fontsReady()) cache.set(key, w);
  return w;
};

// side bearing of a glyph (units), bilinear over the wdth x wght grid; which = 1 left, 2 right
const bearing = (ch: string, wdth: number, wght: number, which: 1 | 2) => {
  const g = (M.g as Record<string, number[][]>)[ch];
  if (!g) return 0;
  const seg = (arr: number[], v: number) => {
    let i = 0;
    while (i < arr.length - 2 && v > arr[i + 1]) i++;
    const t = Math.max(0, Math.min(1, (v - arr[i]) / (arr[i + 1] - arr[i])));
    return [i, t] as const;
  };
  const [wi, wt] = seg(M.wdth, wdth);
  const [gi, gt] = seg(M.wght, wght);
  const n = M.wght.length;
  const at = (a: number, b: number) => g[a * n + b][which];
  const top = at(wi, gi) * (1 - gt) + at(wi, gi + 1) * gt;
  const bot = at(wi + 1, gi) * (1 - gt) + at(wi + 1, gi + 1) * gt;
  return top * (1 - wt) + bot * wt;
};

const plain = (t: string) => t.replace(/[{}]/g, '');

type Fitted = {text: string; fs: number; h: number; wdth: number; wght: number; len: number; x: number};

/** Fit one line to `width` px of ink. */
export const fit = (l: Line, width: number, wght = l.wght ?? 900): Fitted => {
  const text = plain(l.t);
  const first = text[0];
  const last = text[text.length - 1];
  // ink width at 100px for a width axis value
  const ink = (w: number) => measure(text, w, wght) - ((bearing(first, w, wght, 1) + bearing(last, w, wght, 2)) / M.upm) * 100;
  let wdth: number;
  let fs: number;
  if (l.h !== undefined) {
    fs = l.h / CAP;
    const want = (width / fs) * 100;
    let lo = 25;
    let hi = 151;
    if (ink(lo) >= want) wdth = lo;
    else if (ink(hi) <= want) wdth = hi;
    else {
      for (let i = 0; i < 14; i++) {
        const mid = (lo + hi) / 2;
        if (ink(mid) < want) lo = mid;
        else hi = mid;
      }
      wdth = (lo + hi) / 2;
    }
  } else {
    wdth = l.wdth ?? 151;
    fs = (width / ink(wdth)) * 100;
  }
  // whatever is left over, textLength stretches: the run's advance scaled so the ink lands exactly on width
  const adv = (measure(text, wdth, wght) * fs) / 100;
  const lsb = (bearing(first, wdth, wght, 1) / M.upm) * fs;
  const rsb = (bearing(last, wdth, wght, 2) / M.upm) * fs;
  const s = width / (adv - lsb - rsb);
  return {text, fs, h: fs * CAP, wdth, wght, len: adv * s, x: -lsb * s};
};

const STOPS: Record<Fill, [number, string][]> = {
  // brushed silver: dark at the edges, a hot white band through the middle
  chrome: [[0, '#8e8e93'], [0.32, '#f5f5f7'], [0.5, '#ffffff'], [0.62, '#c7c7cc'], [0.86, '#f2f2f4'], [1, '#9a9aa0']],
  hot: [[0, '#ffb15c'], [0.42, '#ff5a2a'], [0.78, '#ff2d55'], [1, '#d81b60']],
  ink: [[0, '#2c2c2e'], [0.5, '#0b0b0c'], [1, '#3a3a3c']],
  white: [[0, '#f5f5f7'], [1, '#f5f5f7']],
};

let uid = 0;

const LineSvg: React.FC<{l: Line; width: number; f: number; sheen: number}> = ({l, width, f, sheen}) => {
  const fill = l.fill ?? 'chrome';
  const [id] = React.useState(() => `slab${uid++}`);
  // the land: a thin, stretched cut snaps to the heavy weight over a few frames
  // (on the cut frame itself the line is already there, mid-snap, so the hit lands on the beat)
  const k = l.inF === undefined ? 1 : interpolate(f - l.inF, [0, 6], [0.3, 1], {...clamp, easing: out3});
  const wght = (l.wght ?? 900) * (0.3 + 0.7 * k);
  // and it lands narrow, then stretches out to the full width (centred)
  const ex = l.inF === undefined ? 1 : interpolate(f - l.inF, [0, 9], [0.45, 1], {...clamp, easing: out3});
  const base = fit(l, width);
  const cur = fit({...l, h: base.h, wdth: undefined}, width * ex, wght); // same height, the width axis re-solved at this weight and width
  const g = l.inF === undefined ? base : {...cur, h: base.h, x: cur.x + (width * (1 - ex)) / 2};
  const runs = l.t.split(/([{}])/).reduce<{t: string; hot: boolean}[]>((acc, p) => {
    if (p === '{') acc.push({t: '', hot: true});
    else if (p === '}') acc.push({t: '', hot: false});
    else if (acc.length) acc[acc.length - 1].t += p;
    else acc.push({t: p, hot: false});
    return acc;
  }, []).filter((r) => r.t);
  const grad = (gid: string, kind: Fill) => (
    <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={-width * 0.2 + sheen * width * 0.4} y1={-g.h * 1.1} x2={width * 0.55 + sheen * width * 0.4} y2={g.h * 0.25}>
      {STOPS[kind].map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
    </linearGradient>
  );
  return (
    <svg width={width} height={Math.ceil(g.h)} viewBox={`0 ${-g.h} ${width} ${g.h}`} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        {grad(`${id}a`, fill)}
        {grad(`${id}h`, 'hot')}
      </defs>
      <text
        x={g.x}
        y={0}
        textLength={g.len}
        lengthAdjust="spacingAndGlyphs"
        style={{fontFamily: `'${FAM}'`, fontSize: g.fs, fontVariationSettings: fvs(g.wdth, g.wght), fontKerning: 'normal'}}
        fill={`url(#${id}a)`}
      >
        {runs.map((r, i) => (
          <tspan key={i} fill={r.hot ? `url(#${id}h)` : undefined}>{r.t}</tspan>
        ))}
      </text>
    </svg>
  );
};

/** A stack of fitted lines. Lines with no inF are there from the start; the rest land on their frames. */
export const Slab: React.FC<{
  lines: Line[];
  width: number;
  left: number;
  top?: number;
  bottom?: number;
  vcenter?: number; // centre the stack vertically in a frame this tall
  gap?: number; // between lines, as a fraction of the smaller line's height
  scrim?: boolean; // a soft shadow behind, for type over bright footage
}> = ({lines, width, left, top, bottom, vcenter, gap = 0.16, scrim}) => {
  const f = useCurrentFrame();
  // every size here comes from measuring the face, so nothing is laid out until it has loaded
  const [ok, setOk] = React.useState(fontsReady());
  const [handle] = React.useState(() => (fontsReady() ? null : delayRender('slab fonts')));
  React.useEffect(() => {
    if (!ok) whenFontsReady().then(() => setOk(true));
    else if (handle !== null) continueRender(handle);
  }, [ok, handle]);
  if (!ok) return null;
  const sheen = interpolate(f, [0, 150], [0, 1], clamp);
  const hs = lines.map((l) => fit(l, width).h);
  const gaps = hs.slice(1).map((h, i) => Math.round(Math.max(10, gap * Math.min(hs[i], h))));
  const total = hs.reduce((a, h) => a + Math.ceil(h), 0) + gaps.reduce((a, g) => a + g, 0);
  const y = vcenter !== undefined ? (vcenter - total) / 2 : top;
  return (
    <div style={{position: 'absolute', left, top: y, bottom, width}}>
      {scrim ? (
        <div style={{position: 'absolute', inset: '-60% -25%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0.28) 55%, rgba(0,0,0,0) 100%)'}} />
      ) : null}
      {lines.map((l, i) => {
        const shown = l.inF === undefined || f >= l.inF;
        const mt = i === 0 ? 0 : gaps[i - 1];
        return (
          <div key={i} style={{marginTop: mt, height: Math.ceil(hs[i]), position: 'relative'}}>
            {shown ? <LineSvg l={l} width={width} f={f} sheen={sheen} /> : null}
          </div>
        );
      })}
    </div>
  );
};
