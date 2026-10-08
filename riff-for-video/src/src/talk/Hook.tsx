import React from 'react';
import {Img} from 'remotion';
import {SANS, clamp01, easeInOut, lerp} from '../lib/tokens';
import {T} from './beat';
import {hookTime} from './plan';
import {Pic} from './Pic';
import {cropX, frameAt} from './shots';

// The opening shot, said into shape: the 16:9 clip fills the phone ("Make it vertical."), the flat log look gets
// its grade in one sweep ("Make it cinematic.") and the move falls into slow motion ("Slow it down.").

const REFRAME = 0.42;
/** 0..1: letterboxed 16:9 → full-screen 9:16 */
export const reframe = (t: number) => {
	const x = clamp01((t - T.vertical) / REFRAME);
	// fast out, settles softly
	return 1 - Math.pow(1 - x, 3.2);
};
/** 0..1: where the grade's sweep has got to */
export const sweep = (t: number) => easeInOut(clamp01((t - T.cine + 0.02) / 0.42));

const Tag: React.FC<{text: string; o: number; y: number}> = ({text, o, y}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - o) * 10}px)`}}>
		<div style={{height: 66, padding: '0 28px', borderRadius: 33, background: 'rgba(12,12,14,0.72)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontSize: 36, fontWeight: 620, color: '#F5F5F7', letterSpacing: '-0.01em'}}>
			{text}
		</div>
	</div>
);

export const Hook: React.FC<{t: number}> = ({t}) => {
	const p = reframe(t);
	const s = hookTime(t);
	const slow = t > T.slow;
	const w = sweep(t);
	let pic: React.ReactNode;
	if (p < 0.999) {
		// the 16:9 frame grows into the vertical crop, which follows her (same crop as the vertical frames)
		const k = lerp(1080 / 1920, 1920 / 1080, p);
		const iw = 1920 * k;
		const ih = 1080 * k;
		const boxH = lerp(1080 * (1080 / 1920), 1920, p);
		const u = lerp(0.5, cropX('hk', s), p);
		const left = Math.min(0, Math.max(1080 - iw, 540 - u * iw));
		const f = frameAt('hk', s, 'wide');
		pic = (
			<div style={{position: 'absolute', left: 0, top: (1920 - boxH) / 2, width: 1080, height: boxH, overflow: 'hidden', background: '#000'}}>
				<Img src={f.a} style={{position: 'absolute', left, top: (boxH - ih) / 2, width: iw, height: ih}} />
			</div>
		);
	} else {
		pic = (
			<>
				<Pic id="hk" s={s} look="flat" blend={slow} />
				{w > 0 ? <Pic id="hk" s={s} look="neon" blend={slow} style={{clipPath: `inset(0 ${(1 - w) * 100}% 0 0)`}} /> : null}
				{w > 0 && w < 1 ? (
					<div style={{position: 'absolute', top: 0, bottom: 0, left: w * 1080 - 2, width: 4, background: 'rgba(255,255,255,0.95)', boxShadow: '0 0 30px 8px rgba(255,190,140,0.55)'}} />
				) : null}
			</>
		);
	}
	// small tags saying what each line did
	const tag = (a: number, d = 1.0) => clamp01((t - a) / 0.16) * (1 - clamp01((t - a - d) / 0.2));
	const ratio = 1 - clamp01((t - T.vertical + 0.05) / 0.12);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#000'}}>
			{pic}
			{ratio > 0 ? (
				<div style={{position: 'absolute', left: 30, top: 656 - 64, opacity: ratio, fontFamily: SANS, fontSize: 26, fontWeight: 650, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.02em'}}>16:9</div>
			) : null}
			<Tag text="9:16 · following her" o={tag(T.vertical + 0.12, 0.95)} y={340} />
			<Tag text="Cinematic grade" o={tag(T.cine + 0.25, 0.85)} y={340} />
			<Tag text="Slow motion · 35%" o={tag(T.slow + 0.1, 1.5)} y={340} />
		</div>
	);
};
