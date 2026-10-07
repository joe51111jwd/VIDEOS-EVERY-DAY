// The talk: a chart slide (our own design) shown on a keynote stage inside a video player, and the same slide
// rebuilt in the slides app.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {MONO, SANS} from '../lib/tokens';
import {SEL} from './ui';

export const SLIDE_W = 1600;
export const SLIDE_H = 900;
export const BARS = [
	{k: 'Organic', v: 38},
	{k: 'Paid', v: 24},
	{k: 'Referral', v: 17},
	{k: 'Partners', v: 12},
	{k: 'Events', v: 9},
];
export const EDIT = 2; // the bar that gets edited
const MAX = 45;
const CH = {x: 150, y: 290, w: 1300, h: 440};
export const barRect = (i: number, v: number) => {
	const slot = CH.w / BARS.length;
	const bw = 150;
	const h = (v / MAX) * CH.h;
	return {x: CH.x + slot * i + (slot - bw) / 2, y: CH.y + CH.h - h, w: bw, h};
};

/** the slide at 1600 x 900 (a dark keynote theme); v overrides the edited bar's value, sel highlights it */
export const SLIDE_BG = '#0B0F1A';
export const Slide: React.FC<{v?: number; sel?: number; hot?: number}> = ({v, sel = 0, hot = 0}) => (
	<div style={{position: 'relative', width: SLIDE_W, height: SLIDE_H, background: `radial-gradient(120% 90% at 30% 0%, #1A2238 0%, ${SLIDE_BG} 62%)`, fontFamily: SANS, overflow: 'hidden'}}>
		<div style={{position: 'absolute', left: 120, top: 92, fontSize: 30, fontWeight: 600, color: '#8A93A8', letterSpacing: '0.02em'}}>Q3 2026 · NEW REVENUE</div>
		<div style={{position: 'absolute', left: 116, top: 132, fontSize: 84, fontWeight: 740, color: '#FFFFFF', letterSpacing: '-0.035em'}}>Revenue by channel</div>
		<div style={{position: 'absolute', right: 120, top: 112, textAlign: 'right'}}>
			<div style={{fontSize: 66, fontWeight: 740, color: '#FFFFFF', letterSpacing: '-0.035em'}}>$4.8M</div>
			<div style={{fontSize: 26, fontWeight: 600, color: '#34D399'}}>+31% QoQ</div>
		</div>
		{/* baseline + grid */}
		{[0, 0.5, 1].map((g) => (
			<div key={g} style={{position: 'absolute', left: CH.x - 20, width: CH.w + 40, top: CH.y + CH.h * g, height: g === 1 ? 3 : 2, background: g === 1 ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.07)'}} />
		))}
		{BARS.map((b, i) => {
			const val = i === EDIT && v !== undefined ? v : b.v;
			const r = barRect(i, val);
			const isE = i === EDIT;
			return (
				<React.Fragment key={b.k}>
					<div
						style={{
							position: 'absolute',
							left: r.x,
							top: r.y,
							width: r.w,
							height: r.h,
							borderRadius: '14px 14px 4px 4px',
							background: isE && hot > 0 ? `linear-gradient(180deg, #7FA8FF, #2F6BFF)` : 'linear-gradient(180deg, #56627F, #343D57)',
							boxShadow: isE && hot > 0 ? `0 0 ${60 * hot}px rgba(70,130,255,${0.7 * hot})` : undefined,
						}}
					/>
					<div style={{position: 'absolute', left: r.x - 40, width: r.w + 80, top: r.y - 64, textAlign: 'center', fontSize: 40, fontWeight: 720, color: isE && hot > 0 ? '#8DB2FF' : '#E8EBF3', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>
						{Math.round(val)}%
					</div>
					<div style={{position: 'absolute', left: r.x - 50, width: r.w + 100, top: CH.y + CH.h + 22, textAlign: 'center', fontSize: 30, fontWeight: 560, color: '#9AA3B8'}}>{b.k}</div>
					{isE && sel > 0 ? (
						<div style={{position: 'absolute', left: r.x - 8, top: r.y - 8, width: r.w + 16, height: r.h + 16, border: `4px solid ${SEL}`, borderRadius: 8, opacity: sel}}>
							{[
								[0, 0],
								[1, 0],
								[0, 1],
								[1, 1],
							].map(([u, w], j) => (
								<div key={j} style={{position: 'absolute', left: `calc(${u * 100}% - 11px)`, top: `calc(${w * 100}% - 11px)`, width: 18, height: 18, background: '#fff', border: `4px solid ${SEL}`, borderRadius: 4}} />
							))}
						</div>
					) : null}
				</React.Fragment>
			);
		})}
		<div style={{position: 'absolute', left: 120, bottom: 54, fontSize: 24, fontWeight: 600, color: '#5C6478'}}>Growth Summit 2026</div>
		<div style={{position: 'absolute', right: 120, bottom: 54, fontSize: 24, fontWeight: 600, color: '#5C6478'}}>14</div>
	</div>
);

// stage photo 2688 x 1520; the projection screen in it
export const STAGE = {w: 2688, h: 1520, sx: 778, sy: 141, sw: 1733, sh: 840};

/** the stage photo with the slide projected on its screen, drawn at width w */
export const Stage: React.FC<{w: number; zoom?: number}> = ({w, zoom = 1}) => {
	const k = w / STAGE.w;
	const h = STAGE.h * k;
	const fit = (STAGE.sh * k) / SLIDE_H;
	return (
		<div style={{position: 'relative', width: w, height: h, overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '60% 40%'}}>
				<Img src={staticFile('img/stage.jpg')} style={{position: 'absolute', left: 0, top: 0, width: w, height: h}} />
				<div style={{position: 'absolute', left: STAGE.sx * k, top: STAGE.sy * k, width: STAGE.sw * k, height: STAGE.sh * k, background: SLIDE_BG, overflow: 'hidden', display: 'flex', justifyContent: 'center', filter: 'contrast(0.94) brightness(1.06) blur(0.35px)'}}>
					<div style={{width: SLIDE_W * fit, height: SLIDE_H * fit, flexShrink: 0}}>
						<div style={{transform: `scale(${fit})`, transformOrigin: '0 0'}}>
							<Slide />
						</div>
					</div>
				</div>
				{/* a little light spill off the screen */}
				<div style={{position: 'absolute', left: STAGE.sx * k - 30, top: STAGE.sy * k - 30, width: STAGE.sw * k + 60, height: STAGE.sh * k + 60, boxShadow: '0 0 70px rgba(110,140,255,0.16)', borderRadius: 10, pointerEvents: 'none'}} />
			</div>
		</div>
	);
};

/** the screen rect inside the player at width w (unzoomed) */
export const screenIn = (w: number) => {
	const k = w / STAGE.w;
	const fit = (STAGE.sh * k) / SLIDE_H;
	const sw = SLIDE_W * fit;
	return {x: STAGE.sx * k + (STAGE.sw * k - sw) / 2, y: STAGE.sy * k, w: sw, h: STAGE.sh * k};
};

export const PlayerControls: React.FC<{w: number; time: string; prog: number}> = ({w, time, prog}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.7))', fontFamily: SANS}}>
		<div style={{position: 'absolute', left: 22, right: 22, bottom: 58, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.25)'}}>
			<div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 3, background: '#fff'}} />
			<div style={{position: 'absolute', left: `calc(${prog * 100}% - 8px)`, top: -5.5, width: 16, height: 16, borderRadius: 8, background: '#fff'}} />
		</div>
		<div style={{position: 'absolute', left: 22, bottom: 16, display: 'flex', alignItems: 'center', gap: 18, color: '#fff'}}>
			<svg width={22} height={22} viewBox="0 0 22 22">
				<rect x={5} y={4} width={4} height={14} rx={1} fill="#fff" />
				<rect x={13} y={4} width={4} height={14} rx={1} fill="#fff" />
			</svg>
			<span style={{fontFamily: MONO, fontSize: 17, color: 'rgba(255,255,255,0.9)'}}>{time}</span>
		</div>
		<div style={{position: 'absolute', right: 22, bottom: 16, display: 'flex', gap: 18}}>
			<svg width={22} height={22} viewBox="0 0 22 22">
				<path d="M3 8h4l5-4v14l-5-4H3Z" fill="#fff" />
				<path d="M15 7.5a5 5 0 0 1 0 7" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" />
			</svg>
			<svg width={22} height={22} viewBox="0 0 22 22">
				<path d="M3 8V3h5M14 3h5v5M19 14v5h-5M8 19H3v-5" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
			</svg>
		</div>
	</div>
);
