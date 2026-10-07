import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, Mark, Wordmark} from '../brand/brand';
import {BRAND, BRAND_MONO, clamp01, easeInOut, easeOut, lerp, textW} from '../lib/tokens';
import {Hero, HERO_H} from './apps3';
import {Proof} from './Finale';
import {AD, LullAd} from './LullAd';
import {E} from './T';
import {F, O} from './timing';
export {O};

// The finale, on the song's trumpets. The name holds on orange through the silence; then every horn stab is a
// paste: rows of everything Paste Real made slam in from the edges and squeeze the orange into a band around the
// name, the line lands, and the held low note rings out on a full frame.

type Kind = 'ad' | 'ad0' | 'chart' | 'code' | 'slide' | 'poster' | 'sheet' | 'site';
const TH = 300; // tile height
const GAP = 24;
const TILE: Record<Kind, {w: number; app: string}> = {
	ad: {w: 240, app: 'Figma'},
	ad0: {w: 240, app: 'Figma'},
	chart: {w: 533, app: 'Keynote'},
	code: {w: 400, app: 'VS Code'},
	slide: {w: 533, app: 'Google Slides'},
	poster: {w: 300, app: 'Canva'},
	sheet: {w: 400, app: 'Sheets'},
	site: {w: 523, app: 'localhost:3000'},
};

const TileBody: React.FC<{k: Kind}> = ({k}) => {
	const w = TILE[k].w;
	if (k === 'ad0') {
		// the ad as it was before the edits
		const s = TH / AD.h;
		return (
			<div style={{width: w, height: TH, overflow: 'hidden'}}>
				<div style={{transform: `scale(${s})`, transformOrigin: '0 0'}}>
					<LullAd />
				</div>
			</div>
		);
	}
	if (k === 'site') {
		// the hero, running on localhost
		const s = TH / HERO_H;
		return (
			<div style={{width: w, height: TH, overflow: 'hidden', background: '#fff'}}>
				<div style={{transform: `scale(${s})`, transformOrigin: '0 0'}}>
					<Hero w={w / s} />
				</div>
			</div>
		);
	}
	const i = {ad: 0, chart: 1, code: 2, slide: 3, poster: 4, sheet: 5}[k];
	return <Proof i={i} w={w} h={TH} />;
};

const Tile: React.FC<{k: Kind; ring: number}> = ({k, ring}) => (
	<div style={{position: 'relative', width: TILE[k].w, height: TH, flexShrink: 0}}>
		<div style={{position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 22px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)'}}>
			<TileBody k={k} />
			<div style={{position: 'absolute', left: 12, bottom: 12, height: 32, padding: '0 13px', borderRadius: 16, background: 'rgba(12,12,14,0.86)', color: '#fff', fontFamily: BRAND, fontWeight: 600, fontSize: 19, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>{TILE[k].app}</div>
		</div>
		{/* it lands selected, the way every paste does */}
		{ring > 0.01 ? <div style={{position: 'absolute', inset: -7, borderRadius: 24, border: `4px solid ${C.signal}`, opacity: ring}} /> : null}
	</div>
);

type Row = {y: number; dir: 1 | -1; from: 'top' | 'bottom' | 'left' | 'right'; stab: number; tiles: Kind[]; shift: number};
const BAND = {top1: 352, bot1: 1568, top2: 680, bot2: 1240}; // the orange after the first stab, after the second
// each row is centred on its middle tile; the ends only drift into view
const ROWS: Row[] = [
	{y: 22, dir: -1, from: 'top', stab: 0, tiles: ['site', 'chart', 'ad', 'code', 'slide'], shift: 10},
	{y: 1598, dir: 1, from: 'bottom', stab: 0, tiles: ['slide', 'code', 'chart', 'poster', 'ad0'], shift: -30},
	{y: 346, dir: 1, from: 'right', stab: 1, tiles: ['ad0', 'sheet', 'poster', 'site', 'chart'], shift: 40},
	{y: 1274, dir: -1, from: 'left', stab: 1, tiles: ['code', 'ad0', 'slide', 'ad', 'sheet'], shift: -20},
];
const rowX = (r: Row) => {
	// x of the row's first tile so that its middle tile is centred (plus shift)
	const mid = Math.floor(r.tiles.length / 2);
	let x = 0;
	for (let i = 0; i < mid; i++) x += TILE[r.tiles[i]].w + GAP;
	return 540 - x - TILE[r.tiles[mid]].w / 2 + r.shift;
};
const DRIFT = 24; // px/s once landed
const SLAM = 0.26;
/** where a row is at time tt: it slams in from its edge on its stab, then drifts */
const rowPos = (r: Row, tt: number, land: number) => {
	const p = easeOut(clamp01((tt - land) / SLAM));
	let x = rowX(r) + r.dir * DRIFT * Math.max(0, tt - land);
	let y = r.y;
	if (r.from === 'top') y = lerp(-TH - 30, r.y, p);
	if (r.from === 'bottom') y = lerp(1920 + 30, r.y, p);
	if (r.from === 'right') x += (1 - p) * 640;
	if (r.from === 'left') x -= (1 - p) * 640;
	return {x, y};
};

export const Outro: React.FC<{t: number}> = ({t}) => {
	const S = O.stabs.map((s) => s - E);
	const p1 = easeOut(clamp01((t - S[0]) / SLAM));
	const p2 = easeOut(clamp01((t - S[1]) / SLAM));
	const bandTop = p2 > 0 ? lerp(BAND.top1, BAND.top2, p2) : lerp(0, BAND.top1, p1);
	const bandBot = p2 > 0 ? lerp(BAND.bot1, BAND.bot2, p2) : lerp(1920, BAND.bot1, p1);

	// pulses on the last stabs, and a slow push to the end
	const pulse = (s: number, k: number) => (t >= s ? k * Math.exp(-(t - s) / 0.12) : 0);
	const punch = 1 + pulse(S[5], 0.022) + pulse(S[6], 0.032);
	const push = 1 + 0.018 * easeInOut(clamp01((t - S[6]) / (O.end - S[6])));
	const reRing = (s: number) => (t >= s ? 0.55 * Math.exp(-(t - s) / 0.18) : 0);

	// ---------------------------------------------------------------- the name: stacked, then one line
	// the mark moves first, then the name rises beside it (so they never cross)
	const lk = easeInOut(clamp01((t - S[1] + 0.02) / 0.24));
	const lw = easeInOut(clamp01((t - S[1] - 0.08) / 0.3));
	const wFull = textW('Paste Real', 150, 600, BRAND, -0.045);
	const mS = lerp(260, 112, lk);
	const wS = lerp(1, 112 / 150, lw);
	const rowWidth = 112 + 32 + wFull * (112 / 150);
	const mX = lerp(540, 540 - rowWidth / 2 + 56, lk);
	const mY = lerp(862, 845, lk);
	const wX = lerp(540, 540 - rowWidth / 2 + 112 + 32 + (wFull * (112 / 150)) / 2, lw);
	const wY = lerp(1113, 845, lw);
	const squeeze = 1 - 0.06 * p1 * (1 - lk);
	const l1 = easeOut(clamp01((t - S[2]) / 0.3));
	const l2 = easeOut(clamp01((t - S[3]) / 0.3));
	const mac = easeOut(clamp01((t - S[4]) / 0.4));

	const fade = easeInOut(clamp01((t - (O.noteEnd - 0.16)) / (O.end - (O.noteEnd - 0.16))));

	return (
		<AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '540px 960px'}}>
				{/* everything it made, in rows */}
				{ROWS.map((r, ri) => {
					const land = S[r.stab];
					if (t < land) return null;
					const ring = clamp01(clamp01(1 - (t - land) / 0.55) + reRing(S[5]) + reRing(S[6]));
					// motion blur while it slams in: the row at a few instants across half a frame, averaged
					const at = (tt: number) => rowPos(r, tt, land);
					const a = at(t),
						b = at(t - 0.5 / 60);
					const n = Math.max(1, Math.min(12, Math.ceil(Math.hypot(a.x - b.x, a.y - b.y) / 10)));
					return Array.from({length: n}, (_, k) => {
						const q = at(t - (k / Math.max(1, n - 1)) * (0.5 / 60));
						let cx = q.x;
						return (
							<div key={`${ri}-${k}`} style={{position: 'absolute', left: 0, top: q.y, width: 1080, height: TH, opacity: 1 / (k + 1)}}>
								{r.tiles.map((kind, i) => {
									const left = cx;
									cx += TILE[kind].w + GAP;
									if (left > 1120 || left + TILE[kind].w < -40) return null;
									return (
										<div key={i} style={{position: 'absolute', left, top: 0}}>
											<Tile k={kind} ring={ring} />
										</div>
									);
								})}
							</div>
						);
					});
				})}

				{/* the rows sit back a little toward the edges of the frame */}
				{p1 > 0 ? <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,12,14,0.42) 0%, rgba(12,12,14,0) 30%, rgba(12,12,14,0) 70%, rgba(12,12,14,0.42) 100%)'}} /> : null}
				{/* the orange, squeezed into a band around the name */}
				<div style={{position: 'absolute', left: 0, right: 0, top: bandTop, height: bandBot - bandTop, background: `linear-gradient(180deg, #FF6428 0%, ${C.signal} 45%, #F7531B 100%)`, boxShadow: p1 > 0 ? '0 0 60px rgba(0,0,0,0.35)' : undefined}} />

				<div style={{position: 'absolute', inset: 0, transform: `scale(${punch * squeeze})`, transformOrigin: '540px 960px'}}>
					<div style={{position: 'absolute', left: mX - mS / 2, top: mY - mS / 2}}>
						<Mark size={mS} color={C.ink} ink={C.ink} fill={1} march={(t - F.silence) * 1.2} id="wall" />
					</div>
					<div style={{position: 'absolute', left: wX, top: wY, transform: `translate(-50%, -50%) scale(${wS})`}}>
						<Wordmark size={150} color={C.ink} />
					</div>
					{/* the line */}
					<div style={{position: 'absolute', left: 0, right: 0, top: 941, textAlign: 'center', fontFamily: BRAND, fontWeight: 600, fontSize: 54, lineHeight: 1.15, letterSpacing: '-0.035em'}}>
						<div style={{color: C.ink, opacity: l1, transform: `translateY(${(1 - l1) * 18}px)`}}>Copy anything you can see.</div>
						<div style={{color: '#fff', opacity: l2, transform: `translateY(${(1 - l2) * 18}px)`}}>Paste it real.</div>
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 1103, textAlign: 'center', fontFamily: BRAND_MONO, fontWeight: 500, fontSize: 28, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(12,12,14,0.72)', opacity: mac, transform: `translateY(${(1 - mac) * 12}px)`}}>
						Coming to Mac
					</div>
				</div>
			</div>
			{fade > 0 ? <div style={{position: 'absolute', inset: 0, background: '#000', opacity: fade}} /> : null}
		</AbsoluteFill>
	);
};
