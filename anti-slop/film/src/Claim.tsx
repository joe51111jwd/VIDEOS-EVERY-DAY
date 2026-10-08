import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, F} from './brand/tokens';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const out3 = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * A song stop: the picture freezes (see Clip.freezeAt) and a two-line claim slams in for the silence.
 * "no" in the serif italic, the word in wide caps sized to the frame; a red strike shoots across first.
 */
export const Claim: React.FC<{lead: string; word: string; durF: number}> = ({lead, word, durF}) => {
  const f = useCurrentFrame();
  const size = Math.min(230, 960 / (word.length * 0.84));
  const inn = interpolate(f, [0, 5], [0, 1], {...clamp, easing: out3});
  const kick = interpolate(f, [0, 2, 10], [1.08, 1.1, 1], clamp);
  const out = interpolate(f, [durF - 3, durF], [1, 0], clamp);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'rgba(5,5,5,0.5)', opacity: out}} />
      {f < 2 ? <AbsoluteFill style={{background: C.paper, opacity: 0.14}} /> : null}
      <div
        style={{
          position: 'absolute', left: 0, top: 1090, width: 1080, height: 14, background: C.strike,
          transformOrigin: 'left center',
          transform: `scaleX(${interpolate(f, [0, 4], [0, 1], {...clamp, easing: out3})})`,
          opacity: interpolate(f, [4, 14], [1, 0], clamp) * out,
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: inn * out}}>
        <div style={{transform: `scale(${kick})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: size * 0.62, lineHeight: 1, color: C.paper, marginBottom: size * 0.06}}>{lead}</div>
          <div style={{fontFamily: F.title, fontStretch: '125%', fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: '0.01em', color: C.paper, whiteSpace: 'nowrap', filter: 'drop-shadow(0 8px 40px rgba(0,0,0,0.6))'}}>
            {word}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
