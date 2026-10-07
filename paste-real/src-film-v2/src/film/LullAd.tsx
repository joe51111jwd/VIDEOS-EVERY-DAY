import React from 'react';
import {Img, staticFile} from 'remotion';
import {BRAND, COND, SERIF} from '../lib/tokens';

// The ad that gets grabbed in the hook: a real-looking DTC ad for a fictional sparkling water ("LULL"),
// with a Blender-rendered can. Built from the same layers Paste Real pastes into Figma, so the flat
// version and the editable version are pixel-identical.
export const AD = {w: 1080, h: 1350};

export type AdProps = {
	w?: number;
	h?: number;
	bg?: string;
	ink?: string;
	headline?: string;
	/** 0 = condensed sans, 1 = serif italic */
	serif?: number;
	caret?: number; // -1 hidden, else blink phase visible 0/1
	can?: string;
	canDx?: number;
	canDy?: number;
	canS?: number;
	/** rotation of the can, degrees, about its own centre */
	canRot?: number;
	/** 0..1 pseudo-3D separation of the layers (the paste moment) */
	explode?: number;
	/** text selection highlight over the headline 0..1 */
	selectAll?: number;
	allCaps?: boolean;
};

/** the can's opaque silhouette inside its image box (measured on the Blender render) */
export const CAN_FIT = {x0: 291 / 1000, y0: 263 / 1600, x1: 708 / 1000, y1: 1349 / 1600};

/** where everything sits for a given frame size; 0 = the 4:5 feed ad, 1 = the 9:16 story (auto layout reflows in between) */
export const adLayout = (w = AD.w, h = AD.h, canS = 1, canDx = 0, canDy = 0) => {
	const tall = Math.max(0, Math.min(1, (h / w - 1.25) / (1.7778 - 1.25)));
	const L = (a: number, b: number) => a + (b - a) * tall;
	const headSize = L(236, 262);
	const headTop = L(160, 330);
	const canH = L(900, 1240) * canS;
	const canW = canH * (1000 / 1600);
	const canBottom = h - L(150, 290);
	// stories keep the logo and the call to action out of the app's top and bottom bars
	const topM = L(58, 140);
	const botM = L(64, 250);
	const canLeft = w / 2 - canW / 2 + canDx;
	const canTop = canBottom - canH + canDy;
	return {
		tall,
		headSize,
		headTop,
		canH,
		canW,
		canBottom,
		canLeft,
		canTop,
		topM,
		botM,
		/** the can's visible silhouette */
		can: {x: canLeft + canW * CAN_FIT.x0, y: canTop + canH * CAN_FIT.y0, w: canW * (CAN_FIT.x1 - CAN_FIT.x0), h: canH * (CAN_FIT.y1 - CAN_FIT.y0)},
	};
};

export const LullAd: React.FC<AdProps> = ({
	w = AD.w,
	h = AD.h,
	bg = '#ECE6DA',
	ink = '#2340FF',
	headline = 'Drink slow.',
	serif = 0,
	caret = -1,
	can = 'img/can_cobalt.png',
	canDx = 0,
	canDy = 0,
	canS = 1,
	canRot = 0,
	explode = 0,
	selectAll = 0,
	allCaps = false,
}) => {
	// 0 = the 4:5 feed ad, 1 = the 9:16 story; the layout reflows continuously in between (auto layout)
	const tall = Math.max(0, Math.min(1, (h / w - 1.25) / (1.7778 - 1.25)));
	const lift = (k: number) => ({
		transform: `translate(${-k * 26 * explode}px, ${-k * 30 * explode}px)`,
		filter: explode > 0.01 ? `drop-shadow(${k * 10 * explode}px ${k * 16 * explode}px ${k * 14 * explode}px rgba(0,0,0,${0.18 * explode}))` : undefined,
	});
	const {headSize, headTop, canH, canW, canLeft, canTop, topM, botM} = adLayout(w, h, canS, canDx, canDy);
	const L = (a: number, b: number) => a + (b - a) * tall;
	const text = allCaps ? headline.toUpperCase() : headline;
	return (
		<div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: bg}}>
			{/* background: soft studio light on the seamless */}
			<div style={{position: 'absolute', inset: 0, background: `radial-gradient(60% 45% at 50% ${L(62, 58)}%, rgba(255,255,255,0.38), rgba(255,255,255,0) 70%)`}} />
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.06) 100%)'}} />
			{/* headline (behind the can) */}
			<div style={{position: 'absolute', left: 0, right: 0, top: headTop, textAlign: 'center', ...lift(1)}}>
				<div
					style={{
						display: 'inline-block',
						position: 'relative',
						fontFamily: serif > 0.5 ? SERIF : COND,
						fontStyle: serif > 0.5 ? 'italic' : 'normal',
						fontWeight: serif > 0.5 ? 400 : 900,
						fontStretch: serif > 0.5 ? undefined : '68%',
						fontSize: serif > 0.5 ? headSize * 1.08 : headSize,
						lineHeight: 0.84,
						letterSpacing: serif > 0.5 ? '-0.03em' : '-0.015em',
						color: ink,
						whiteSpace: 'pre',
					}}
				>
					{selectAll > 0 ? <span style={{position: 'absolute', inset: '-4px -10px', background: `rgba(13,153,255,${0.32 * selectAll})`}} /> : null}
					<span style={{position: 'relative'}}>{text}</span>
					{caret >= 0 ? <span style={{display: 'inline-block', width: 6, height: headSize * 0.78, marginLeft: 6, background: '#0D99FF', opacity: caret, verticalAlign: '-0.08em'}} /> : null}
				</div>
			</div>
			{/* the can (Blender render with its own contact shadow) */}
			<div style={{position: 'absolute', left: canLeft, top: canTop, width: canW, height: canH, ...lift(2.2)}}>
				<Img src={staticFile(can)} style={{width: '100%', height: '100%', transform: canRot ? `rotate(${canRot}deg)` : undefined, transformOrigin: `50% ${((CAN_FIT.y0 + CAN_FIT.y1) / 2) * 100}%`}} />
			</div>
			{/* logo */}
			<div style={{position: 'absolute', left: 64, top: topM, fontFamily: COND, fontWeight: 900, fontStretch: '70%', fontSize: 58, letterSpacing: '0.01em', color: ink, ...lift(1.5)}}>LULL</div>
			{/* flavor tag */}
			<div style={{position: 'absolute', right: 64, top: topM + 12, fontFamily: BRAND, fontWeight: 600, fontSize: 24, letterSpacing: '0.14em', textTransform: 'uppercase', color: ink, opacity: 0.85, ...lift(1.5)}}>N°3 · Yuzu &amp; salt</div>
			{/* subhead */}
			<div style={{position: 'absolute', left: 64, bottom: botM, width: 430, fontFamily: BRAND, fontWeight: 500, fontSize: 28, lineHeight: 1.3, letterSpacing: '-0.01em', color: ink, ...lift(1.8)}}>
				Sparkling water, canned cold.
				<br />
				Zero sugar. Nothing fake.
			</div>
			{/* button */}
			<div
				style={{
					position: 'absolute',
					right: 64,
					bottom: botM - 2,
					height: 76,
					padding: '0 34px',
					borderRadius: 38,
					background: ink,
					color: bg,
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					fontFamily: BRAND,
					fontWeight: 600,
					fontSize: 28,
					letterSpacing: '-0.01em',
					...lift(2),
				}}
			>
				Shop the 12-pack
				<svg width={24} height={24} viewBox="0 0 24 24">
					<path d="M5 12h13M13 6l6 6-6 6" stroke={bg} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
		</div>
	);
};
