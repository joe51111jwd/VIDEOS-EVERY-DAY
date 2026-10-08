import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, F} from './brand/tokens';

export type ClipSpec = {
  id: string;
  src: string; // file under public/
  from: number; // source seconds at the clip's first frame
  speed?: number;
  layout: 'full' | 'wide';
  push?: [number, number]; // scale over the clip
  origin?: string; // transform-origin
  shift?: [number, number]; // y offset px (full) from → to
  kenX?: [number, number]; // x offset (wide crop pan)
  wideScale?: number; // >1 crops into the desktop frame inside the band
  title?: string; // wide layout: big line above the band
  meta?: string; // wide layout: mono line above the title
  punch?: boolean;
  freezeAt?: number; // local frame from which the picture holds (a song stop)
  pushEase?: 'in'; // 'in': the push accelerates (a dive into the frame)
  // a device screen inside the capture, re-filled with the crisp source footage (in sync, scaled with the shot) so a dive
  // into it stays sharp: rect/notch in output px of the unscaled frame, the footage covers the rect
  screen?: {src: string; from: number; rect: [number, number, number, number]; notch?: [number, number, number, number]};
  bumpF?: number[]; // local frames of the stomps a long shot rides: a small zoom kick on each, so it still hits the beat
  mask?: [number, number, number, number]; // full layout: keep only this rect of the source frame [x0, y0, x1, y1] px (e.g. a laptop's screen), black around it
};

// the transform-origin string ('50% 52%') as px in the 1080x1920 frame
const originPx = (o: string | undefined, W: number, H: number): [number, number] => {
  const [a, b] = (o ?? '50% 50%').split(' ').map((v) => parseFloat(v) / 100);
  return [a * W, b * H];
};
const easeIn = Easing.bezier(0.55, 0, 0.9, 0.4);

const ease = Easing.bezier(0.33, 0, 0.2, 1);

export const Clip: React.FC<{c: ClipSpec; durF: number}> = ({c, durF}) => {
  const f = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const p = durF > 1 ? Math.min(1, f / (durF - 1)) : 0;
  // every cut lands with a small punch that settles in ~12 frames
  const punch = c.punch === false ? 1 : 1 + 0.05 * Math.pow(1 - Math.min(1, f / 12), 3);
  const bump = 1 + (c.bumpF ?? []).reduce((a, k) => a + (f >= k ? 0.022 * Math.exp(-(f - k) / 6) : 0), 0);
  const s = (c.push ? interpolate((c.pushEase === 'in' ? easeIn : ease)(p), [0, 1], c.push) : 1) * punch * bump;
  const ty = c.shift ? interpolate(ease(p), [0, 1], c.shift) : 0;
  const frozen = c.freezeAt != null && f >= c.freezeAt;
  const raw = (
    <OffthreadVideo
      src={staticFile(c.src)}
      startFrom={Math.round(c.from * fps)}
      playbackRate={c.speed ?? 1}
      muted
      style={{width: '100%', height: '100%', objectFit: 'cover'}}
    />
  );
  const video = frozen ? <Freeze frame={c.freezeAt!}>{raw}</Freeze> : raw;
  if (c.layout === 'full') {
    let clip: string | undefined;
    if (c.mask) {
      const [ox, oy] = originPx(c.origin, W, H);
      const X = (x: number) => ox + (x - ox) * s;
      const Y = (y: number) => oy + (y - oy) * s + ty;
      const z = (v: number) => Math.max(0, v);
      clip = `inset(${z(Y(c.mask[1]))}px ${z(W - X(c.mask[2]))}px ${z(H - Y(c.mask[3]))}px ${z(X(c.mask[0]))}px round 10px)`;
    }
    return (
      <AbsoluteFill style={{background: C.black, overflow: 'hidden', clipPath: clip}}>
        <AbsoluteFill style={{transform: `translateY(${ty}px) scale(${s})`, transformOrigin: c.origin ?? '50% 50%', filter: frozen ? 'grayscale(0.85) brightness(0.7)' : undefined}}>
          {video}
          {c.screen ? (
            <div style={{position: 'absolute', left: c.screen.rect[0], top: c.screen.rect[1], width: c.screen.rect[2] - c.screen.rect[0], height: c.screen.rect[3] - c.screen.rect[1], overflow: 'hidden', borderRadius: 3, background: C.black}}>
              <OffthreadVideo src={staticFile(c.screen.src)} startFrom={Math.round(c.screen.from * fps)} playbackRate={c.speed ?? 1} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              {c.screen.notch ? (
                <div style={{position: 'absolute', left: c.screen.notch[0] - c.screen.rect[0], top: c.screen.notch[1] - c.screen.rect[1], width: c.screen.notch[2] - c.screen.notch[0], height: c.screen.notch[3] - c.screen.notch[1], background: '#000', borderRadius: '0 0 3px 3px'}} />
              ) : null}
            </div>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  // wide: a 16:9 desktop frame across the phone, letterboxed like a film
  const bandH = Math.round((1080 * 9) / 16);
  const top = Math.round((1920 - bandH) / 2);
  const kx = c.kenX ? interpolate(ease(p), [0, 1], c.kenX) : 0;
  return (
    <AbsoluteFill style={{background: C.black}}>
      <div style={{position: 'absolute', left: 0, top, width: 1080, height: bandH, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${kx}px) scale(${s * (c.wideScale ?? 1)})`, transformOrigin: c.origin ?? '50% 50%'}}>{video}</div>
      </div>
      {c.meta || c.title ? (
        <div style={{position: 'absolute', left: 64, right: 64, bottom: 1920 - top + 56}}>
          {c.meta ? <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.16em', color: C.dim, textTransform: 'uppercase', marginBottom: 22}}>{c.meta}</div> : null}
          {c.title ? <div style={{fontFamily: F.title, fontStretch: '125%', fontWeight: 700, fontSize: 64, lineHeight: 1.04, color: C.paper}}>{c.title}</div> : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
