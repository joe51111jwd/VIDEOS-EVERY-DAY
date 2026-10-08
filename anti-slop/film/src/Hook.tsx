import React from 'react';
import {AbsoluteFill, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Lockup} from './brand/Lockup';
import {C, F} from './brand/tokens';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const out3 = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * The series cold open. Frame 0: a generic AI-template site with SLOP across it.
 * On `strikeF` the red bar drives ANTI— in and the picture cuts to the real site's first shot.
 * The mark then lifts away before `leaveF` + 30.
 */
export const Hook: React.FC<{
  slopSrc: string;
  slopFrom: number;
  strikeF: number;
  leaveF: number;
}> = ({slopSrc, slopFrom, strikeF, leaveF}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const anti = interpolate(f, [strikeF, strikeF + 9], [0, 1], {...clamp, easing: out3});
  const sub = interpolate(f, [strikeF + 16, strikeF + 30], [0, 1], {...clamp, easing: out3});
  // punch on the strike: the word kicks bigger for a few frames
  const kick = interpolate(f, [strikeF, strikeF + 3, strikeF + 14], [1, 1.07, 1], clamp);
  // SLOP alone fills the width; as ANTI— drives in, the word steps down so the whole mark fits
  const base = Math.min(236, 960 / (3.45 + 3.75 * anti));
  const size = base * kick;
  // after the strike the mark drops into the dark band between the site's headline and its planet
  const y = interpolate(f, [strikeF, strikeF + 10], [0, 70], {...clamp, easing: out3});
  const op = interpolate(f, [leaveF, leaveF + 12], [1, 0], clamp);
  const leaveScale = interpolate(f, [leaveF, leaveF + 12], [1, 0.94], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {f < strikeF ? (
        <AbsoluteFill>
          <OffthreadVideo src={staticFile(slopSrc)} startFrom={Math.round(slopFrom * fps)} muted style={{width: '100%', height: '100%'}} />
          <AbsoluteFill style={{background: 'rgba(8,4,20,0.28)'}} />
        </AbsoluteFill>
      ) : null}
      {f >= strikeF && f < strikeF + 2 ? <AbsoluteFill style={{background: C.paper, opacity: 0.18}} /> : null}
      {/* the strike: a red line shoots across the frame on the drop and leaves the dash behind */}
      {f >= strikeF - 3 && f < strikeF + 10 ? (
        <div
          style={{
            position: 'absolute', left: 0, top: 960 - 9, width: 1080, height: 18, background: C.strike,
            transformOrigin: 'left center',
            transform: `scaleX(${interpolate(f, [strikeF - 3, strikeF + 1], [0, 1], clamp)})`,
            opacity: interpolate(f, [strikeF + 2, strikeF + 10], [1, 0], clamp),
          }}
        />
      ) : null}
      {f >= strikeF ? (
        <AbsoluteFill style={{background: 'radial-gradient(60% 16% at 50% 54%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)', opacity: op}} />
      ) : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: op}}>
        <div style={{transform: `translateY(${y}px) scale(${leaveScale})`, filter: 'drop-shadow(0 8px 40px rgba(0,0,0,0.6))'}}>
          <Lockup size={size} anti={anti} sub={sub} />
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
