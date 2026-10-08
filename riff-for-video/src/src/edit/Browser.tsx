import React from 'react';
import {Img} from 'remotion';
import {C, MONO, SANS, clamp01, easeInOut, easeMac, easeOut, lerp, spr} from '../lib/tokens';
import {RiffGlyph} from '../lib/riff';
import {CLIPS, lookAt} from './model';
import {ACT} from './timing';
import {LANE, PHX, PPS, TL, WIN} from './layout';
import {frameSrc} from './Viewer';
import {ISearch} from './ui';

// "Find the shot where she smiles." — Riff searches every clip by what's in it.
const GRID: [string, number][] = [
	['c1032', 60],
	['c1076', 120],
	['c1114', 40],
	['c1002', 90],
	['c1127', 100],
	['c1213', 88], // the match
	['c1116', 70],
	['c1128', 150],
	['c1045', 60],
	['c1114', 160],
	['c1076', 30],
	['c1116', 150],
];
const MATCH = 5;
const COLS = 4;
const GX = 20;
const GY = 78;
const GAP = 12;
const TW = (WIN.w - GX * 2 - GAP * (COLS - 1)) / COLS;
const TH = (TW * 9) / 16;

export const tileRect = (i: number) => ({x: GX + (i % COLS) * (TW + GAP), y: GY + Math.floor(i / COLS) * (TH + GAP), w: TW, h: TH});

export const Browser: React.FC<{t: number}> = ({t}) => {
	const open = easeMac(clamp01((t - ACT.browserOpen) / 0.35)) * (1 - easeInOut(clamp01((t - ACT.fly) / 0.35)));
	const L = lookAt(t);
	const H = WIN.h - TL.y;
	const query = 'she smiles';
	const typed = query.slice(0, Math.round(clamp01((t - ACT.browserOpen - 0.05) / 0.3) * query.length));
	const scanP = clamp01((t - ACT.scan) / (ACT.match - ACT.scan));
	const found = t >= ACT.match;
	const fp = spr(t, ACT.match, 16, 0.6);
	const status = found ? '1 match · 0.4 s' : t >= ACT.scan ? `Searching ${Math.round(lerp(0, 214, scanP))} clips…` : 'Ask for any moment';
	const nodes: React.ReactNode[] = [];
	if (open > 0.001) {
		GRID.forEach(([clip, idx], i) => {
			const r = tileRect(i);
			const scanned = scanP * (WIN.w + 200) - 100 > r.x + r.w / 2;
			const isM = i === MATCH;
			if (isM && t >= ACT.fly) return;
			const dim = !isM && scanned ? 0.25 : 1;
			const s = isM ? 1 + 0.06 * fp : 1;
			nodes.push(
				<div key={i} style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 10, overflow: 'hidden', opacity: dim, transform: `scale(${s})`, zIndex: isM ? 2 : 1, boxShadow: isM && found ? `0 0 0 ${3 * clamp01(fp)}px ${C.ember}, 0 12px 40px rgba(0,0,0,0.6)` : 'inset 0 0 0 1px rgba(255,255,255,0.1)'}}>
					<Img src={frameSrc(clip, 'moody', idx)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
					{L.teal > 0.01 ? <Img src={frameSrc(clip, 'teal', idx)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: L.teal}} /> : null}
					<div style={{position: 'absolute', left: 8, bottom: 6, fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.7)'}}>{CLIPS[clip].name}</div>
					{isM && found ? (
						<>
							{/* face box */}
							<div style={{position: 'absolute', left: r.w * 0.2, top: r.h * 0.16, width: r.w * 0.46, height: r.h * 0.76, border: '2px solid rgba(255,255,255,0.9)', borderRadius: 6, opacity: clamp01(fp)}} />
							<div style={{position: 'absolute', left: 8, top: 8, height: 24, padding: '0 8px', borderRadius: 7, background: C.ember, color: C.emberInk, fontFamily: SANS, fontSize: 12.5, fontWeight: 750, display: 'flex', alignItems: 'center', opacity: clamp01(fp)}}>smiling · 00:03</div>
						</>
					) : null}
				</div>,
			);
		});
	}
	// the match flies down into the timeline at the playhead
	let flyer: React.ReactNode = null;
	if (t >= ACT.fly && t < ACT.insert + 0.12) {
		const r = tileRect(MATCH);
		const p = easeInOut(clamp01((t - ACT.fly) / (ACT.insert - ACT.fly)));
		const fromY = TL.y + (1 - open) * H + r.y;
		const to = {x: PHX + 1, y: TL.y + LANE.v1.y - 46, w: 2 * PPS - 2, h: LANE.v1.h};
		const x = lerp(r.x, to.x, p);
		const y = lerp(fromY, to.y, p) - Math.sin(p * Math.PI) * 60;
		const w = lerp(r.w * 1.06, to.w, p);
		const h = lerp(r.h * 1.06, to.h, p);
		flyer = (
			<div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 9, overflow: 'hidden', zIndex: 30, boxShadow: `0 0 0 3px ${C.ember}, 0 20px 50px rgba(0,0,0,0.6)`, opacity: 1 - clamp01((t - ACT.insert) / 0.12)}}>
				<Img src={frameSrc('c1213', 'moody', 88)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</div>
		);
	}
	if (open <= 0.001 && !flyer) return null;
	return (
		<>
			{open > 0.001 ? (
				<div style={{position: 'absolute', left: 0, top: TL.y + (1 - open) * H, width: WIN.w, height: H, background: '#111114', borderTop: `1px solid ${C.line2}`, boxShadow: '0 -20px 50px rgba(0,0,0,0.5)', zIndex: 20, overflow: 'hidden'}}>
					<div style={{position: 'absolute', left: 20, right: 20, top: 16, height: 48, borderRadius: 12, background: '#1C1C21', boxShadow: 'inset 0 0 0 1px rgba(255,154,85,0.45)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px'}}>
						<ISearch />
						<div style={{fontFamily: SANS, fontSize: 19, fontWeight: 550, color: '#F2F2F5', letterSpacing: '-0.01em'}}>
							{typed}
							<span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0.2, color: C.ember}}>|</span>
						</div>
						<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 9, fontFamily: MONO, fontSize: 13.5, color: found ? '#FFD9BD' : '#8A8A92'}}>
							<RiffGlyph size={24} level={found ? 0.2 : 0.6} color={C.ember} />
							{status}
						</div>
					</div>
					{nodes}
					{t >= ACT.scan && t < ACT.match + 0.1 ? (
						<div style={{position: 'absolute', top: GY - 6, height: H - GY, left: scanP * (WIN.w + 200) - 160, width: 120, background: 'linear-gradient(90deg, transparent, rgba(255,170,120,0.28), transparent)', zIndex: 3}} />
					) : null}
				</div>
			) : null}
			{flyer}
		</>
	);
};

export const browserEase = easeOut;
