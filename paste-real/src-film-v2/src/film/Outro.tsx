import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, CmdGlyph, Keycap, MARK, Wordmark} from '../brand/brand';
import {BRAND, BRAND_MONO, clamp01, easeInOut, easeOut, lerp, spr, step, SYS} from '../lib/tokens';
import {Proof} from './Finale';
import {T} from './T';

// The outro, over the song's ending. Dark: everything that was copied, one after another, inside the selection.
// Trumpets: lights up on paper, the icon, the name, the line, the shortcut. Then early access, and the fade.

import {O} from './timing';
export {O};

const TAGS = ['Design · 8 layers', 'Chart · 6 bars', 'Website · 23 layers', 'Slide · 5 layers', 'Poster · 5 layers', 'Table · 30 cells'];
const SEL = {w: 760, h: 760, cy: 880, r: 34};

/** the orange selection that draws itself around the gallery */
const Selection: React.FC<{t: number; draw: number; fill: number}> = ({t, draw, fill}) => {
	const pad = 18;
	const W = SEL.w + pad * 2,
		H = SEL.h + pad * 2;
	const per = 2 * (W + H);
	const c = lerp(W + H, 0, easeInOut(clamp01(fill)));
	return (
		<svg width={W} height={H} style={{position: 'absolute', left: 540 - W / 2, top: SEL.cy - H / 2, overflow: 'visible'}}>
			<defs>
				<clipPath id="ofill">
					<path d={`M ${c} 0 L ${W + H} 0 L ${W + H} ${W + H} L 0 ${W + H} L 0 ${c} Z`} />
				</clipPath>
			</defs>
			<rect x={0} y={0} width={W} height={H} rx={SEL.r + pad} fill={C.signal} clipPath="url(#ofill)" />
			<rect x={0} y={0} width={W} height={H} rx={SEL.r + pad} fill="none" stroke={C.signal} strokeWidth={5} strokeDasharray={`${per * draw} ${per}`} opacity={0.35} />
			<rect x={0} y={0} width={W} height={H} rx={SEL.r + pad} fill="none" stroke={C.signal} strokeWidth={5} strokeDasharray="22 16" strokeDashoffset={-t * 60} opacity={clamp01((draw - 0.75) / 0.25)} />
			{[
				[0, 0],
				[W, 0],
				[0, H],
				[W, H],
			].map(([x, y], i) => {
				const p = spr(t, O.draw + 0.5 + i * 0.06, 10, 0.55);
				return <rect key={i} x={x - 11 * p} y={y - 11 * p} width={22 * p} height={22 * p} rx={5} fill="#fff" stroke={C.signal} strokeWidth={4} />;
			})}
		</svg>
	);
};

export const Outro: React.FC<{t: number}> = ({t}) => {
	// ------------------------------------------------ dark: the gallery of copies
	if (t < O.trumpets) {
		const draw = easeInOut(clamp01((t - O.draw) / 0.9));
		const fill = clamp01((t - O.fillAt) / 0.3);
		const push = 1 + 0.05 * clamp01((t - O.in) / (O.trumpets - O.in));
		let k = -1;
		for (let i = 0; i < O.items.length; i++) if (t >= O.items[i] - 0.05) k = i;
		return (
			<AbsoluteFill style={{background: '#050506'}}>
				<div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: `540px ${SEL.cy}px`}}>
					{O.items.map((t0, i) => {
						if (i !== k && i !== k - 1) return null;
						const a = easeOut(clamp01((t - t0 + 0.05) / 0.35));
						const o = i === k ? a : 1;
						const s = 1.04 - 0.04 * a + 0.02 * clamp01((t - t0) / 1.2);
						return (
							<div key={i} style={{position: 'absolute', left: 540 - SEL.w / 2, top: SEL.cy - SEL.h / 2, width: SEL.w, height: SEL.h, borderRadius: SEL.r, overflow: 'hidden', opacity: o * (1 - fill), transform: `scale(${s})`, zIndex: i}}>
								<Proof i={i} w={SEL.w} h={SEL.h} />
							</div>
						);
					})}
					<Selection t={t} draw={draw} fill={fill} />
				</div>
				{/* what each one became */}
				{k >= 0 ? (
					<div style={{position: 'absolute', left: 0, right: 0, top: SEL.cy + SEL.h / 2 + 84, display: 'flex', justifyContent: 'center', opacity: 1 - fill}}>
						<div key={k} style={{height: 64, padding: '0 26px', borderRadius: 18, background: C.signal, color: '#fff', display: 'flex', alignItems: 'center', gap: 14, fontFamily: BRAND, fontWeight: 600, fontSize: 34, letterSpacing: '-0.02em', opacity: easeOut(clamp01((t - O.items[k] + 0.05) / 0.2))}}>
							<svg width={30} height={30} viewBox="0 0 120 120">
								<path d={MARK.solid} fill="#fff" />
								<path d={MARK.corner} fill="none" stroke="#fff" strokeWidth={MARK.sw * 1.35} strokeLinecap="round" strokeDasharray={MARK.array} strokeDashoffset={MARK.offset} />
							</svg>
							{TAGS[k]}
						</div>
					</div>
				) : null}
				<div style={{position: 'absolute', left: 0, right: 0, top: 236, textAlign: 'center', fontFamily: BRAND, fontWeight: 600, fontSize: 62, letterSpacing: '-0.04em', color: '#fff', opacity: step(t, O.items[0], 0.4) * (1 - fill)}}>
					Copy anything you can see.
				</div>
			</AbsoluteFill>
		);
	}

	// ------------------------------------------------ paper: the trumpets
	const flash = 1 - easeOut(clamp01((t - O.trumpets) / 0.45));
	const icon = spr(t, O.trumpets, 6.5, 0.6);
	const sweep = clamp01((t - O.trumpets - 0.25) / 1.1);
	const word = step(t, O.word, 0.5);
	const line = step(t, O.line, 0.5);
	const keysIn = step(t, O.keys[0] - 0.15, 0.4) * (1 - step(t, O.high - 0.2, 0.35));
	const cta = step(t, O.high, 0.6);
	const lift = easeInOut(clamp01((t - O.high + 0.2) / 0.8));
	const fadeOut = easeInOut(clamp01((t - O.fade) / (O.end - 0.6 - O.fade)));
	const breathe = 1 + 0.03 * clamp01((t - O.trumpets) / (O.end - O.trumpets));
	const iconSize = lerp(600, 470, lift);
	// alternate ⌘C / ⌘V on the beats
	let pressIdx = -1;
	for (let i = 0; i < O.keys.length; i++) if (t >= O.keys[i]) pressIdx = i;
	const down = pressIdx >= 0 && t - O.keys[pressIdx] < 0.16 ? 1 : 0;
	const isV = pressIdx >= 0 && pressIdx % 2 === 1;

	return (
		<AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(70% 45% at 50% 34%, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)'}} />
			<div style={{position: 'absolute', inset: 0, transform: `scale(${breathe})`, transformOrigin: '540px 900px'}}>
				{/* the icon */}
				<div style={{position: 'absolute', left: 540 - iconSize / 2, top: lerp(250, 230, lift) + (600 - iconSize) * 0.1, width: iconSize, height: iconSize, opacity: clamp01(icon * 1.4), transform: `scale(${0.82 + 0.18 * icon}) translateY(${Math.sin((t - O.trumpets) * 1.3) * 6}px)`}}>
					<Img src={staticFile('img/icon_hero.png')} style={{width: '100%', height: '100%'}} />
					{/* a light sweep across the glass */}
					{sweep > 0 && sweep < 1 ? (
						<div
							style={{
								position: 'absolute',
								inset: 0,
								WebkitMaskImage: `url(${staticFile('img/icon_hero.png')})`,
								WebkitMaskSize: '100% 100%',
								background: `linear-gradient(115deg, rgba(255,255,255,0) ${lerp(-30, 110, sweep) - 14}%, rgba(255,255,255,0.55) ${lerp(-30, 110, sweep)}%, rgba(255,255,255,0) ${lerp(-30, 110, sweep) + 14}%)`,
								mixBlendMode: 'screen',
							}}
						/>
					) : null}
				</div>
				{/* the name */}
				<div style={{position: 'absolute', left: 0, right: 0, top: lerp(880, 760, lift), display: 'flex', justifyContent: 'center', opacity: word, transform: `translateY(${(1 - word) * 26}px)`}}>
					<Wordmark size={156} color={C.ink} />
				</div>
				{/* the line */}
				<div style={{position: 'absolute', left: 0, right: 0, top: lerp(1080, 952, lift), textAlign: 'center', fontFamily: BRAND, fontWeight: 600, fontSize: 58, lineHeight: 1.2, letterSpacing: '-0.035em', color: C.graphite, opacity: line, transform: `translateY(${(1 - line) * 20}px)`}}>
					Copy anything you can see.
					<br />
					<span style={{color: C.signal}}>Paste it real.</span>
				</div>
				{/* the shortcut, pressed on the trumpets */}
				{keysIn > 0 ? (
					<div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: keysIn, transform: `translateY(${(1 - keysIn) * 30}px)`}}>
						<Keycap size={150} dark={false} down={down} label={<CmdGlyph size={64} color="#1D1D1F" />} />
						<div style={{fontSize: 60, color: C.mist, fontWeight: 300, fontFamily: SYS}}>+</div>
						<Keycap
							size={150}
							dark={false}
							down={down}
							label={
								<div style={{position: 'relative', width: 70, height: 80, fontFamily: SYS, fontWeight: 500, fontSize: 68, color: '#1D1D1F'}}>
									<span style={{position: 'absolute', inset: 0, textAlign: 'center', opacity: isV ? 0 : 1}}>C</span>
									<span style={{position: 'absolute', inset: 0, textAlign: 'center', opacity: isV ? 1 : 0}}>V</span>
								</div>
							}
						/>
						<div style={{width: 250, fontFamily: BRAND, fontWeight: 600, fontSize: 46, letterSpacing: '-0.03em', color: C.ink, marginLeft: 18}}>{pressIdx < 0 ? 'Copy.' : isV ? 'Paste.' : 'Copy.'}</div>
					</div>
				) : null}
				{/* early access */}
				{cta > 0 ? (
					<div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, opacity: cta, transform: `translateY(${(1 - cta) * 30}px)`}}>
						<div style={{height: 116, padding: '0 54px', borderRadius: 58, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 20, fontFamily: BRAND, fontWeight: 600, fontSize: 50, letterSpacing: '-0.03em', boxShadow: '0 24px 50px rgba(12,12,14,0.18)'}}>
							Get early access
							<svg width={40} height={40} viewBox="0 0 24 24">
								<path d="M12 4v15M6 13l6 6 6-6" stroke={C.signal} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<div style={{fontFamily: BRAND_MONO, fontWeight: 500, fontSize: 30, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.graphite}}>Coming to Mac</div>
					</div>
				) : null}
			</div>
			{/* the trumpets hit: a flash of light */}
			{flash > 0 ? <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash * 0.9}} /> : null}
			{fadeOut > 0 ? <div style={{position: 'absolute', inset: 0, background: '#000', opacity: fadeOut}} /> : null}
		</AbsoluteFill>
	);
};
