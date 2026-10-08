import React from 'react';
import {TIGHT, clamp01, easeOut, lerp} from '../lib/tokens';
import {at, T} from './beat';
import {Cut, CUT_A, CUT_B, cutAt, FREEZE, kickShake, snareFlash} from './plan';
import {Pic} from './Pic';
import {ShotId} from './shots';

/** the title said in the editor: big, white, two lines over the drop */
export const Title: React.FC<{p: number; scale?: number}> = ({p, scale = 1}) => {
	if (p <= 0) return null;
	const e = easeOut(clamp01(p));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 560 * scale, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, p * 3), transform: `scale(${lerp(1.18, 1, e)})`, filter: `blur(${(1 - e) * 10 * scale}px)`}}>
			{['NEW', 'YORK'].map((w) => (
				<div key={w} style={{fontFamily: TIGHT, fontWeight: 860, fontSize: 300 * scale, lineHeight: 0.84, letterSpacing: '-0.035em', color: '#FFFFFF', textShadow: `0 ${10 * scale}px ${60 * scale}px rgba(0,0,0,0.45)`}}>
					{w}
				</div>
			))}
		</div>
	);
};

/** a cut to the beat at film t; `finished` adds what was said in the editor (title, freeze, shakes, flashes) */
export const CutView: React.FC<{t: number; cuts: Cut[]; finished?: boolean}> = ({t, cuts, finished = false}) => {
	const {c, i, s} = cutAt(cuts, t);
	const since = t - c.a;
	let id: ShotId = c.id;
	let ss = s;
	let frozen = false;
	if (finished && c.id === 'kick') {
		const f0 = c.a + at(128 + FREEZE.from) - at(128 + 1);
		if (t >= f0) {
			ss = c.off + (f0 - c.a);
			frozen = true;
		}
	}
	// every cut punches in a little and flashes
	const punch = 1 + 0.07 * (1 - easeOut(clamp01(since / 0.32)));
	const flash = i > 0 || cuts === CUT_A ? 0.32 * (1 - clamp01(since / 0.11)) : 0;
	let tx = 0;
	let ty = 0;
	let rot = 0;
	let fl = 0;
	if (finished) {
		const k = kickShake(t, cuts[0].a - 0.01, T.end);
		const ph = t * 61.0;
		tx = k * 26 * Math.sin(ph * 1.7);
		ty = k * 20 * Math.cos(ph * 2.3);
		rot = k * 0.9 * Math.sin(ph * 1.3);
		fl = 0.22 * snareFlash(t, cuts[0].a + 0.2, T.stat);
	}
	const freezeIn = frozen ? 1 - clamp01((t - (c.a + at(128 + FREEZE.from) - at(129))) / 0.14) : 0;
	return (
		<div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: -40, transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${punch * (frozen ? 1.04 : 1)})`}}>
				<div style={{position: 'absolute', left: 40, top: 40, width: 1080, height: 1920}}>
					<Pic id={id} s={ss} />
				</div>
			</div>
			{/* the title was already up in the viewer when the camera pushed in: it stays, and punches with the cut */}
			{finished && c.a === cuts[0].a ? (
				<div style={{position: 'absolute', inset: 0, transform: `scale(${punch})`}}>
					<Title p={1} />
				</div>
			) : null}
			{flash > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${flash})`}} /> : null}
			{fl > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${fl})`}} /> : null}
			{freezeIn > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${0.75 * freezeIn})`}} /> : null}
		</div>
	);
};

export {CUT_A, CUT_B};
