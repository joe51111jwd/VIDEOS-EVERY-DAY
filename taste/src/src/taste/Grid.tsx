import React from 'react';
import {clamp01, easeInOut, easeOut, spr} from '../lib/tokens';
import {HOTFILL} from '../lib/Type';
import {Gene, SH, SW, Site} from './Site';

export const CW = 344;
export const CH = (CW * SH) / SW;
export const GAP = 20;
export const GW = 5 * CW + 4 * GAP;
export const GH = 4 * CH + 3 * GAP;
export const cellXY = (i: number) => ({x: (i % 5) * (CW + GAP), y: Math.floor(i / 5) * (CH + GAP)});

export type Flip = {at: number; from: Gene[]; to: Gene[]; origin: number};
export type Tap = {cell: number; at: number};

/** hot ring + heart on a liked design */
export const Liked: React.FC<{p: number; w: number; h: number; r?: number}> = ({p, w, h, r = 10}) => {
	if (p <= 0.001) return null;
	const pop = 1 + 0.35 * Math.max(0, 1 - p) ;
	return (
		<>
			<div style={{position: 'absolute', inset: -5, borderRadius: r + 5, padding: 4, background: HOTFILL, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', opacity: p, boxShadow: `0 0 ${30 * p}px rgba(255,90,60,${0.55 * p})`}} />
			<div style={{position: 'absolute', right: -w * 0.03, top: -h * 0.05, width: w * 0.14, height: w * 0.14, borderRadius: '50%', background: HOTFILL, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p * pop})`, boxShadow: '0 6px 18px rgba(255,60,80,0.45)'}}>
				<svg width="58%" height="58%" viewBox="0 0 24 24">
					<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill="#fff" />
				</svg>
			</div>
		</>
	);
};

/** 5×4 grid of designs; flips ripple out from the liked cell to the next round */
export const Grid: React.FC<{t: number; base: Gene[]; flips: Flip[]; taps: Tap[]; gray?: (i: number) => number}> = ({t, base, flips, taps, gray}) => (
	<div style={{position: 'relative', width: GW, height: GH, transformStyle: 'preserve-3d'}}>
		{base.map((_, i) => {
			const {x, y} = cellXY(i);
			// walk the flips in order: settled ones swap the design, the live one turns the card
			let g = base[i];
			let rot = 0;
			let lift = 0;
			for (const f of flips) {
				const o = cellXY(f.origin);
				const d = Math.hypot(x - o.x, y - o.y) / (CW + GAP);
				const t0 = f.at + d * 0.045;
				if (t < t0) break;
				const k = clamp01((t - t0) / 0.42);
				if (k >= 1) {
					g = f.to[i];
					continue;
				}
				const e = easeInOut(k);
				rot = 180 * e;
				lift = Math.sin(Math.PI * e);
				g = e < 0.5 ? f.from[i] : f.to[i];
				break;
			}
			const tap = taps.filter((tp) => tp.cell === i && t >= tp.at).pop();
			// a like clears when the next flip reaches the cell
			const nextFlip = tap ? flips.find((f) => f.at > tap.at) : undefined;
			const liked = tap && (!nextFlip || t < nextFlip.at + 0.05) ? clamp01(spr(t, tap.at, 22, 0.5)) : 0;
			const gr = gray ? gray(i) : 0;
			const sc = 1 + 0.04 * liked * Math.max(0, 1 - (t - (tap?.at ?? 0)) * 2);
			const back = rot > 90;
			return (
				<div key={i} style={{position: 'absolute', left: x, top: y, width: CW, height: CH, transform: `translateZ(${lift * 90}px) rotateY(${back ? rot - 180 : rot}deg) scale(${sc})`, transformStyle: 'preserve-3d'}}>
					<div style={{position: 'absolute', inset: 0, borderRadius: 10, overflow: 'hidden', boxShadow: `0 ${10 + 20 * lift}px ${30 + 40 * lift}px rgba(0,0,0,${0.45 + 0.2 * lift})`, filter: gr > 0.01 ? `grayscale(${gr}) brightness(${1 - 0.45 * gr}) contrast(${1 - 0.15 * gr})` : undefined}}>
						<div style={{transform: `scale(${CW / SW})`, transformOrigin: '0 0'}}>
							<Site g={g} />
						</div>
					</div>
					<Liked p={liked} w={CW} h={CH} />
				</div>
			);
		})}
	</div>
);

export const _u = [easeOut];
