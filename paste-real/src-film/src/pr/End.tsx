// 5. The song stops dead: COPY ANYTHING YOU CAN SEE. (silence, the line gets grabbed)
//    It slams back on bar 9: PASTE IT REAL. and everything we pasted lands around it.
//    Bar 10: the end card. The film ends in the song's own stop.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp01, COND, easeIn, easeInOut, easeOut, lerp, SANS, spr, step} from '../lib/tokens';
import {Ad} from './Ad';
import {Hero} from './Hero';
import {Slide} from './Talk';
import {AppIcon, Crosshair, Marquee, Rect} from './ui';
import {T, BEAT} from './T';

const Poster: React.FC = () => (
	<div style={{position: 'relative', width: 540, height: 720, overflow: 'hidden'}}>
		<Img src={staticFile('img/desert.jpg')} style={{position: 'absolute', inset: 0, width: 540, height: 720, objectFit: 'cover'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: SANS, fontSize: 17, fontWeight: 650, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.85)'}}>LIVE IN THE MOJAVE</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 104, textAlign: 'center', fontFamily: COND, fontStretch: '122%', fontWeight: 800, fontSize: 84, letterSpacing: '0.02em', color: '#fff', lineHeight: 0.95}}>
			DUNE
			<br />
			NIGHTS
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 62, textAlign: 'center', fontFamily: SANS, fontSize: 22, fontWeight: 650, letterSpacing: '0.24em', color: '#fff'}}>OCT 24 · 2026</div>
	</div>
);

const Coffee: React.FC = () => (
	<div style={{position: 'relative', width: 800, height: 450, background: '#F4EDE4', overflow: 'hidden'}}>
		<Img src={staticFile('img/coffee.jpg')} style={{position: 'absolute', left: 0, top: 0, width: 360, height: 450, objectFit: 'cover'}} />
		<div style={{position: 'absolute', left: 400, top: 120, width: 360, fontFamily: 'Fraunces', fontWeight: 560, fontSize: 58, lineHeight: 1.0, letterSpacing: '-0.02em', color: '#2A1C14'}}>Cold brew season.</div>
	</div>
);

type Card = {node: React.ReactNode; w: number; h: number; s: number; x: number; y: number; r: number; from: [number, number]};
const CARDS: Card[] = [
	{node: <Ad s={{headline: 'Built for the long way home.', caps: 1, color: 1, shoeDx: -34, shoeDy: 92}} />, w: 1080, h: 1350, s: 0.3, x: 52, y: 300, r: -6, from: [-500, -300]},
	{node: <Hero w={1000} />, w: 1000, h: 511, s: 0.43, x: 600, y: 352, r: 4, from: [600, -400]},
	{node: <Slide v={41} hot={1} />, w: 1600, h: 900, s: 0.27, x: 44, y: 1146, r: 3, from: [-600, 400]},
	{node: <Poster />, w: 540, h: 720, s: 0.42, x: 792, y: 1086, r: -5, from: [500, 500]},
	{node: <Coffee />, w: 800, h: 450, s: 0.36, x: 610, y: 1520, r: -3, from: [300, 700]},
	{node: <Hero w={390} />, w: 390, h: 904, s: 0.3, x: 540, y: 1112, r: 4, from: [0, 800]},
];

const LINE_A = 'COPY ANYTHING';
const LINE_B = 'YOU CAN SEE.';

export const End: React.FC<{t: number}> = ({t}) => {
	const slam = T.slam;
	const after = t >= slam;
	const endP = step(t, T.end, 0.5, easeInOut);
	// silence: the line, then a marquee grabs it
	const q: Rect = {x: 110, y: 790, w: 860, h: 250};
	const du = clamp01((t - (T.stop + 0.3)) / 0.45);
	const dragU = easeInOut(du);
	const cross = {x: lerp(q.x, q.x + q.w, dragU), y: lerp(q.y, q.y + q.h, dragU)};
	const silenceIn = step(t, T.stop, 0.12);
	// slam
	const punch = after ? 1 + 0.1 * Math.exp(-(t - slam) / 0.07) : 1;
	const flash = after ? Math.exp(-(t - slam) / 0.05) : 0;
	const wordUp = endP;
	return (
		<AbsoluteFill style={{background: '#050608', overflow: 'hidden'}}>
			{after ? <AbsoluteFill style={{background: 'radial-gradient(60% 40% at 50% 46%, rgba(47,107,255,0.28), rgba(47,107,255,0) 70%)', opacity: 1 - 0.5 * endP}} /> : null}
			{!after ? (
				<>
					<div style={{position: 'absolute', left: 0, right: 0, top: 812, textAlign: 'center', fontFamily: SANS, fontWeight: 820, fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.035em', color: '#F5F5F7', opacity: silenceIn, filter: silenceIn < 1 ? `blur(${(1 - silenceIn) * 8}px)` : undefined}}>
						{LINE_A}
						<br />
						{LINE_B}
					</div>
					{du > 0 ? <Marquee r={{x: q.x, y: q.y, w: cross.x - q.x, h: cross.y - q.y}} dim={0.0} frame={1} /> : null}
					{t > T.stop + 0.18 ? <Crosshair x={du > 0 ? cross.x : q.x} y={du > 0 ? cross.y : q.y} o={step(t, T.stop + 0.18, 0.1)} /> : null}
				</>
			) : (
				<>
					{/* everything we pasted, landing on the eighths */}
					{CARDS.map((c, i) => {
						const a = slam + i * (BEAT / 2) * 0.5;
						const u = spr(t, a, 5.5, 0.72);
						const drift = (t - a) * 6;
						const recede = endP;
						const x = c.x + c.from[0] * (1 - Math.min(1, u)) + drift * (i % 2 ? 1 : -1);
						const y = c.y + c.from[1] * (1 - Math.min(1, u)) - drift * 0.6;
						return t >= a ? (
							<div key={i} style={{position: 'absolute', left: x, top: y, width: c.w, height: c.h, transform: `rotate(${c.r * (1 + 0.6 * (1 - Math.min(1, u)))}deg) scale(${c.s * (1 - 0.12 * recede)})`, transformOrigin: '0 0', opacity: clamp01(u * 3) * (1 - 0.88 * recede), filter: recede > 0 ? `blur(${recede * 12}px)` : undefined, borderRadius: 18 / c.s, overflow: 'hidden', boxShadow: `0 ${30 / c.s}px ${70 / c.s}px rgba(0,0,0,0.55)`}}>
								{c.node}
							</div>
						) : null;
					})}
					{/* PASTE IT REAL. -> end card */}
					<div style={{position: 'absolute', left: 0, right: 0, top: lerp(850, 1120, wordUp), textAlign: 'center', fontFamily: SANS, fontWeight: 820, fontSize: lerp(124, 52, wordUp), lineHeight: 1.0, letterSpacing: '-0.035em', color: '#F5F5F7', transform: `scale(${punch})`, textShadow: '0 10px 40px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>
						PASTE IT <span style={{color: '#6F9BFF'}}>REAL.</span>
					</div>
					{endP > 0 ? (
						<>
							<div style={{position: 'absolute', left: 0, right: 0, top: 610, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
								<div style={{transform: `scale(${0.7 + 0.3 * spr(t, T.end, 6, 0.7)})`, opacity: step(t, T.end, 0.3)}}>
									<AppIcon size={196} glow={0.5 * step(t, T.end, 0.6)} />
								</div>
								<div style={{fontFamily: SANS, fontWeight: 680, fontSize: 116, letterSpacing: '-0.05em', color: '#F5F5F7', opacity: step(t, T.end + 0.18, 0.5), transform: `translateY(${(1 - step(t, T.end + 0.18, 0.5)) * 18}px)`}}>Paste Real</div>
							</div>
							<div style={{position: 'absolute', left: 0, right: 0, top: 1218, textAlign: 'center', fontFamily: SANS, fontWeight: 560, fontSize: 40, color: 'rgba(245,245,247,0.6)', opacity: step(t, T.end + 0.75, 0.5)}}>Early access ↓</div>
						</>
					) : null}
					{flash > 0.01 ? <AbsoluteFill style={{background: '#fff', opacity: flash * 0.85}} /> : null}
				</>
			)}
		</AbsoluteFill>
	);
};
