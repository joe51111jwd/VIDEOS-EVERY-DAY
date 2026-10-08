import React from 'react';
import {C, F} from './tokens';

/**
 * The series mark: ANTI—SLOP. The dash is the red strike bar.
 * `anti` 0→1 grows "ANTI—" in from the left of "SLOP" (bar first, then the letters), keeping the group centred.
 */
export const Lockup: React.FC<{
  size: number;
  anti?: number;
  color?: string;
  sub?: number; // 0→1 reveal of the "cinematic websites" line
  subText?: string;
  style?: React.CSSProperties;
}> = ({size, anti = 1, color = C.paper, sub = 0, subText = 'cinematic websites', style}) => {
  const word: React.CSSProperties = {
    fontFamily: F.title,
    fontStretch: '125%',
    fontWeight: 800,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: '0.01em',
    color,
    whiteSpace: 'nowrap',
  };
  const a = Math.max(0, Math.min(1, anti));
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...style}}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div style={{maxWidth: `${(a * 3.7).toFixed(4)}em`, overflow: 'hidden', fontSize: size, display: 'flex', justifyContent: 'flex-end'}}>
          <div style={{display: 'flex', alignItems: 'center', flexShrink: 0}}>
            <span style={word}>ANTI</span>
            <span style={{display: 'block', width: size * 0.62, height: size * 0.13, background: C.strike, margin: `0 ${size * 0.1}px`, transform: `translateY(${size * 0.02}px)`}} />
          </div>
        </div>
        <span style={word}>SLOP</span>
      </div>
      {sub > 0 ? (
        <div
          style={{
            marginTop: size * 0.2,
            fontFamily: F.serif,
            fontStyle: 'italic',
            fontSize: size * 0.5,
            lineHeight: 1,
            color,
            opacity: sub,
            transform: `translateY(${(1 - sub) * size * 0.15}px)`,
            letterSpacing: '0.01em',
          }}
        >
          {subText}
        </div>
      ) : null}
    </div>
  );
};
