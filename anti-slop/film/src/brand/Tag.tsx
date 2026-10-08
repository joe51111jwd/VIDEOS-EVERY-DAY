import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F} from './tokens';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Scene tag, slate style: a solid black card with the red tick, so it never reads as part of the site's own UI.
 * Scene number in red mono, what you're looking at in the wide title face, how it's made in mono.
 */
export const Tag: React.FC<{
  n: string;
  title: string;
  note?: string;
  inF: number; // frame (local) it starts entering
  outF: number; // frame it starts leaving
  bottom?: number;
  left?: number;
  compact?: boolean; // landscape: a black slate that hugs the text, no full-width band over the site
  corner?: 'bl' | 'br' | 'tl' | 'tr'; // compact only: which corner it sits in, whichever is clear of the site's own type
}> = ({n, title, note, inF, outF, bottom: b0, left: l0, compact, corner = 'bl'}) => {
  const bottom = b0 ?? (compact ? 64 : 120);
  const left = l0 ?? (compact ? 64 : 56);
  const f = useCurrentFrame();
  const a = interpolate(f, [inF, inF + 12], [0, 1], clamp);
  const b = interpolate(f, [outF, outF + 8], [1, 0], clamp);
  if (Math.min(a, b) <= 0) return null;
  const e = 1 - Math.pow(1 - a, 3);
  return (
    <>
    {/* lower-third band: solid where the tag sits so the site's own small type never shows through */}
    {compact ? null : <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bottom + 330, opacity: Math.min(a, b),
      background: 'linear-gradient(to top, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.97) 52%, rgba(5,5,5,0) 100%)'}} />}
    <div style={{position: 'absolute', ...(corner[0] === 't' ? {top: bottom} : {bottom}), ...(corner[1] === 'r' ? {right: left} : {left}), opacity: b, display: 'flex', alignItems: 'stretch', clipPath: `inset(0 ${(1 - e) * 100}% 0 0)`,
      ...(compact ? {background: 'rgba(5,5,5,0.94)', padding: '16px 30px 18px 0', boxShadow: '0 10px 40px rgba(0,0,0,0.35)'} : {})}}>
      <div style={{width: 8, background: C.strike, transform: `scaleY(${e})`, transformOrigin: 'top'}} />
      <div style={{padding: '4px 0 6px 26px'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, whiteSpace: 'nowrap'}}>
          <span style={{fontFamily: F.mono, fontSize: 28, letterSpacing: '0.1em', color: C.strike}}>{n}</span>
          <span style={{fontFamily: F.title, fontStretch: '125%', fontWeight: 700, fontSize: 38, letterSpacing: '0.02em', color: C.paper, textTransform: 'uppercase'}}>{title}</span>
        </div>
        {note ? (
          <div style={{fontFamily: F.mono, fontSize: 25, letterSpacing: '0.12em', color: C.dim, textTransform: 'uppercase', marginTop: 12, whiteSpace: 'nowrap'}}>{note}</div>
        ) : null}
      </div>
    </div>
    </>
  );
};
