import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Lockup} from './brand/Lockup';
import {C, F} from './brand/tokens';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const out3 = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * The end card: the episode's frames tile the whole screen (3x3, one lands per step),
 * dim back, and the series mark lands over them with the reel, the site and the URL.
 */
export type EndTile = string | {src: string; from: number; rate?: number}; // a still, or a shot that keeps playing

export const End: React.FC<{
  tiles: EndTile[]; // 9, phone-shaped
  stepF: number; // frames between tiles landing
  markF: number; // when the mark lands (local frame)
  reel: string;
  site: string;
  url: string;
}> = ({tiles, stepF, markF, reel, site, url}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const tw = W / 3, th = H / 3;
  const lock = Math.min(124, W * 0.115) * (W > H ? 1.25 : 1);
  const order = [4, 0, 8, 2, 6, 1, 7, 3, 5];
  const dim = interpolate(f, [markF - 6, markF + 10], [0, 0.66], clamp);
  const mark = interpolate(f, [markF, markF + 12], [0, 1], {...clamp, easing: out3});
  const sub = interpolate(f, [markF + 14, markF + 30], [0, 1], {...clamp, easing: out3});
  const meta = interpolate(f, [markF + 26, markF + 42], [0, 1], {...clamp, easing: out3});
  return (
    <AbsoluteFill style={{background: C.black}}>
      {tiles.map((t, i) => {
        const k = order.indexOf(i);
        const at = k * stepF;
        const p = interpolate(f, [at, at + 10], [0, 1], {...clamp, easing: out3});
        if (p <= 0) return null;
        const col = i % 3, row = Math.floor(i / 3);
        const drift = interpolate(f, [at, at + 400], [1.12, 1.0], {...clamp, easing: Easing.out(Easing.quad)});
        return (
          <div key={i} style={{position: 'absolute', left: col * tw, top: row * th, width: tw, height: th, overflow: 'hidden', opacity: p}}>
            {typeof t === 'string' ? (
              <Img src={staticFile(t)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${drift * (1 + (1 - p) * 0.25)})`}} />
            ) : (
              <OffthreadVideo
                src={staticFile(t.src)}
                startFrom={Math.round(t.from * 60)}
                playbackRate={t.rate ?? 0.6}
                muted
                style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${drift * (1 + (1 - p) * 0.25)})`}}
              />
            )}
          </div>
        );
      })}
      {/* hairline grid, like a contact sheet */}
      <AbsoluteFill style={{opacity: interpolate(f, [0, 20], [0, 1], clamp)}}>
        {[1, 2].map((i) => <div key={`v${i}`} style={{position: 'absolute', left: i * tw - 2, top: 0, width: 4, height: H, background: C.black}} />)}
        {[1, 2].map((i) => <div key={`h${i}`} style={{position: 'absolute', top: i * th - 2, left: 0, height: 4, width: W, background: C.black}} />)}
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(70% 45% at 50% 50%, rgba(5,5,5,${dim + 0.2}) 0%, rgba(5,5,5,${dim}) 100%)`}} />
      {mark > 0 ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: F.mono, fontSize: 28, letterSpacing: '0.24em', color: C.paper, opacity: meta * 0.85, textTransform: 'uppercase', marginBottom: W > H ? 40 : 56}}>
            {reel} <span style={{color: C.strike}}>/</span> {site}
          </div>
          <div style={{transform: `scale(${interpolate(mark, [0, 1], [1.25, 1])})`, opacity: mark}}>
            <Lockup size={lock} anti={1} sub={sub} />
          </div>
          <div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: '0.2em', color: C.paper, opacity: meta, textTransform: 'uppercase', marginTop: W > H ? 60 : 90}}>{url}</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
