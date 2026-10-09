import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, H, SANS, W, clamp01} from '../lib/tokens';
import {RewindGlyph} from './Brand';
import {IChevD} from '../mac/icons';

export const TL = {x: 150, w: 1620, h: 112, bottom: 22};
export const TL_Y = H - TL.bottom - TL.h;
const STRIP_X = 250; // inside the bar
const STRIP_W = 1150;
const THUMB_H = 58;

export type TLThumb = {src: string | null; label?: string};

/** x (in frame px) of a strip position 0..1 */
export const stripX = (p: number) => TL.x + STRIP_X + p * STRIP_W;
export const restoreBtn = {x: TL.x + TL.w - 196, y: TL_Y + 33, w: 172, h: 46};

/** the Rewind bar: frosted glass, a filmstrip of the day, a playhead and Restore */
export const Timeline: React.FC<{
	show: number; // 0..1 slide-up
	thumbs: TLThumb[];
	ticks: {p: number; t: string}[];
	chips?: {p0: number; p1: number; t: string}[];
	head: number; // playhead 0..1
	time: string;
	day: string;
	press?: number; // Restore pressed 0..1
	hover?: number;
	scale?: number;
}> = ({show, thumbs, ticks, chips = [], head, time, day, press = 0, hover = 0, scale = 1}) => {
	if (show <= 0.001) return null;
	const y = TL_Y + (1 - show) * (TL.h + 60);
	const n = thumbs.length;
	const tw = THUMB_H * (16 / 9);
	const gap = (STRIP_W - n * tw) / Math.max(1, n - 1);
	const hx = STRIP_X + head * STRIP_W;
	return (
		<div style={{position: 'absolute', left: TL.x, top: y, width: TL.w, height: TL.h, opacity: clamp01(show * 1.6), transform: `scale(${scale})`, transformOrigin: '50% 100%'}}>
			{/* glass */}
			<div style={{position: 'absolute', inset: 0, borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(0,0,0,0.6)'}}>
				<Img src={staticFile('img/wall-blur.jpg')} style={{position: 'absolute', left: -TL.x, top: -y, width: W, height: H}} />
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,30,34,0.62), rgba(14,14,16,0.74))'}} />
				<div style={{position: 'absolute', inset: 0, borderRadius: 30, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.1)'}} />
			</div>
			{/* time readout */}
			<div style={{position: 'absolute', left: 28, top: 22, display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS}}>
				<RewindGlyph s={26} c={C.amber} />
				<div>
					<div style={{fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.05, whiteSpace: 'nowrap'}}>{time}</div>
					<div style={{fontSize: 14.5, fontWeight: 550, color: '#A9A9B0', marginTop: 3}}>{day}</div>
				</div>
			</div>
			{/* chips above the strip */}
			{chips.map((c, i) => (
				<div key={i} style={{position: 'absolute', left: STRIP_X + c.p0 * STRIP_W, width: (c.p1 - c.p0) * STRIP_W, top: 9, height: 16, borderTop: '1.5px solid rgba(255,255,255,0.28)', fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: '#C9C9CF', paddingTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
					{c.t}
				</div>
			))}
			{/* filmstrip */}
			{thumbs.map((th, i) => {
				const x = STRIP_X + i * (tw + gap);
				const after = x + tw / 2 > hx;
				return (
					<div key={i} style={{position: 'absolute', left: x, top: 28, width: tw, height: THUMB_H, borderRadius: 7, overflow: 'hidden', background: '#333', boxShadow: '0 0 0 1px rgba(255,255,255,0.12)', opacity: after ? 0.45 : 1}}>
						{th.src ? <Img src={staticFile('thumbs/' + th.src + '.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
					</div>
				);
			})}
			{/* ticks */}
			{ticks.map((tk, i) => (
				<div key={i} style={{position: 'absolute', left: STRIP_X + tk.p * STRIP_W - 40, width: 80, top: 90, textAlign: 'center', fontFamily: SANS, fontSize: 12, fontWeight: 550, color: '#8F8F96', fontVariantNumeric: 'tabular-nums'}}>
					{tk.t}
				</div>
			))}
			{/* playhead */}
			<div style={{position: 'absolute', left: hx - 1.5, top: 18, width: 3, height: THUMB_H + 20, borderRadius: 2, background: C.amber, boxShadow: `0 0 12px ${C.amber}`}} />
			<div style={{position: 'absolute', left: hx - 9, top: 12, width: 18, height: 18, borderRadius: 18, background: C.amber, boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)'}} />
			{/* Restore */}
			<div
				style={{
					position: 'absolute',
					left: TL.w - 196,
					top: 33,
					width: 172,
					height: 46,
					borderRadius: 23,
					background: `linear-gradient(180deg, ${C.amber}, ${C.amber2})`,
					display: 'flex',
					alignItems: 'center',
					fontFamily: SANS,
					transform: `scale(${1 - 0.06 * press + 0.03 * hover})`,
					filter: `brightness(${1 - 0.12 * press + 0.06 * hover})`,
					boxShadow: `0 6px 22px rgba(255,140,40,${0.35 + 0.3 * hover}), inset 0 1px 0 rgba(255,255,255,0.45)`,
				}}
			>
				<div style={{flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 700, color: C.amberInk, letterSpacing: '-0.01em'}}>Restore</div>
				<div style={{width: 1, height: 26, background: 'rgba(42,22,0,0.25)'}} />
				<div style={{width: 40, display: 'flex', justifyContent: 'center', color: C.amberInk}}>
					<IChevD s={16} w={2.4} />
				</div>
			</div>
		</div>
	);
};
