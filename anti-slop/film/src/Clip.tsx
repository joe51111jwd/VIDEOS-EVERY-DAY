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
};

const ease = Easing.bezier(0.33, 0, 0.2, 1);

export const Clip: React.FC<{c: ClipSpec; durF: number}> = ({c, durF}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = durF > 1 ? Math.min(1, f / (durF - 1)) : 0;
  // every cut lands with a small punch that settles in ~12 frames
  const punch = c.punch === false ? 1 : 1 + 0.05 * Math.pow(1 - Math.min(1, f / 12), 3);
  const s = (c.push ? interpolate(ease(p), [0, 1], c.push) : 1) * punch;
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
    return (
      <AbsoluteFill style={{background: C.black, overflow: 'hidden'}}>
        <AbsoluteFill style={{transform: `translateY(${ty}px) scale(${s})`, transformOrigin: c.origin ?? '50% 50%', filter: frozen ? 'grayscale(0.85) brightness(0.7)' : undefined}}>{video}</AbsoluteFill>
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
