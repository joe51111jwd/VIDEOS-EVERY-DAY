import React from 'react';
import {C, TIGHT, clamp01, easeOut} from '../lib/tokens';
import {at} from './beat';

// The opening bar (beats 116-120, film t < 0): the promise in two lines over the full groove, then the song drops to
// its drum break and the clip appears. "No keyboard." is up on the first frame; "Just speak." lands on the swung kick.

const LINE2 = at(118.32);
/** the loop's hits in the opening bar: kicks on 116, 116.5 and the swung 118.32, snares on 117 and 119 */
const HITS_IN = [at(116.5), at(117), at(118.32), at(119)];

const Line: React.FC<{text: string; color: string; p: number; y: number}> = ({text, color, p, y}) => {
	const e = easeOut(clamp01(p));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: Math.min(1, p * 4), transform: `scale(${1.1 - 0.1 * e})`, filter: p < 1 ? `blur(${(1 - e) * 10}px)` : undefined}}>
			<div style={{fontFamily: TIGHT, fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: '-0.045em', color, whiteSpace: 'nowrap', textShadow: '0 10px 60px rgba(0,0,0,0.5)'}}>{text}</div>
		</div>
	);
};

export const Intro: React.FC<{t: number}> = ({t}) => {
	// a small push on every hit of the bar, and a slow drift in
	let punch = 0;
	for (const h of HITS_IN) if (t >= h) punch = Math.max(punch, 1 - easeOut(clamp01((t - h) / 0.3)));
	const drift = clamp01((t - at(116)) / (at(120) - at(116)));
	const s = 1 + 0.035 * drift + 0.025 * punch;
	// the glow under the words warms up when "speak" lands
	const warm = easeOut(clamp01((t - LINE2) / 0.5));
	return (
		<div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 32% at 50% 58%, rgba(255,140,80,${0.07 + 0.12 * warm}) 0%, rgba(255,110,70,${0.03 + 0.05 * warm}) 45%, rgba(0,0,0,0) 100%)`}} />
			<div style={{position: 'absolute', inset: 0, transform: `scale(${s})`}}>
				{/* the first line is settled and sharp on frame 0 (it is the thumbnail) */}
				<Line text="No keyboard." color="#F5F5F7" p={1} y={790} />
				{t >= LINE2 ? <Line text="Just speak." color={C.ember} p={(t - LINE2) / 0.28} y={960} /> : null}
			</div>
		</div>
	);
};
