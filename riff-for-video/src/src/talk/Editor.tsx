import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, MONO, SANS, clamp01, easeIn, easeInOut, easeOut, lerp} from '../lib/tokens';
import {RiffIcon} from '../lib/riff';
import env from '../edit/env/ny.json';
import {at, HITS, T} from './beat';
import {CUT_A, editPicture, FREEZE, kickShake} from './plan';
import {Pic} from './Pic';
import {Title} from './Cut';
import {SHAKE_KEYS, TL_SPAN} from './Hud';
import {speaking} from './Pill';
import {ShotId, thumb} from './shots';

// The pull-back: the full-screen picture is Riff's viewer. Two fingers scrub the timeline, you say the edit,
// and it lands: a freeze on the kick, a shake keyframe on every kick drum, the title over the drop.

export const WIN = {x: 30, y: 262, w: 1020, h: 1110, r: 26};
const TB = 48;
const VIEW = {y: TB, h: 586};
const PIC = {w: 315, h: 560, x: (1020 - 315) / 2, y: TB + 13};
const TRANS = {y: VIEW.y + VIEW.h, h: 52};
const TL = {y: TRANS.y + TRANS.h, h: 1110 - (TRANS.y + TRANS.h)};
const HEAD = 74;
const PPS = (WIN.w - HEAD - 22) / TL_SPAN;
const LANE = {ruler: {y: 0, h: 30}, v2: {y: 40, h: 44}, v1: {y: 96, h: 116}, a1: {y: 226, h: 92}};
export const PAD = {x: 540 - 280, y: 1520, w: 560, h: 330};
const VX = WIN.x + PIC.x;
const VY = WIN.y + PIC.y;

/** 0 = the viewer fills the screen, 1 = pulled back to the whole editor */
export const camE = (t: number) => {
	if (t < T.pull) return 0;
	const out = easeInOut(clamp01((t - T.pull) / 0.8));
	const back = easeIn(clamp01((t - (T.push - 0.62)) / 0.62));
	return out * (1 - back);
};
/** the screen's view of the scene: transform for the camera at e */
export const camTransform = (e: number) => {
	const w = Math.exp(lerp(Math.log(PIC.w), Math.log(1080), e));
	const f = (w - PIC.w) / (1080 - PIC.w);
	const x = lerp(VX, 0, f);
	const y = lerp(VY, 0, f);
	const k = 1080 / w;
	return `translate(${-x * k}px, ${-y * k}px) scale(${k})`;
};

// the playhead (timeline seconds) through the editor: plays out to the end, scrubs back to the kick, plays on,
// scrubs back to the drop and parks there for the title
const SCRUB1 = [T.pull + 0.72, T.pull + 1.5];
const KICK_T = at(128 + FREEZE.from);
const PLAY2 = T.freeze + 0.3;
const SCRUB2 = [T.shake + 0.95, T.shake + 1.7];
const PARK = at(128) + 0.07;
export const playhead = (t: number) => {
	const end = Math.min(TL_SPAN, T.pull + (t - T.pull));
	if (t < SCRUB1[0]) return Math.min(end, TL_SPAN);
	const from1 = Math.min(TL_SPAN, T.pull + (SCRUB1[0] - T.pull));
	if (t < SCRUB1[1]) return lerp(from1, KICK_T, easeInOut((t - SCRUB1[0]) / (SCRUB1[1] - SCRUB1[0])));
	if (t < PLAY2) return KICK_T;
	const from2 = KICK_T + (SCRUB2[0] - PLAY2);
	if (t < SCRUB2[0]) return KICK_T + (t - PLAY2);
	if (t < SCRUB2[1]) return lerp(from2, PARK, easeInOut((t - SCRUB2[0]) / (SCRUB2[1] - SCRUB2[0])));
	return PARK;
};
const scrubbing = (t: number) => (t >= SCRUB1[0] - 0.12 && t <= SCRUB1[1] + 0.15) || (t >= SCRUB2[0] - 0.12 && t <= SCRUB2[1] + 0.15);

const tx = (s: number) => HEAD + s * PPS;
const fmt = (s: number) => {
	const f = Math.max(0, Math.round(s * 30));
	const p = (n: number) => String(n).padStart(2, '0');
	return `${p(Math.floor(f / 1800))}:${p(Math.floor(f / 30) % 60)}:${p(f % 30)}`;
};

const NAMES: Record<string, string> = {hk: 'court_night_03', ts: 'times_sq_rain', kick: 'kick_low', cab: 'cab_7th_ave', grid: 'grid_top', face: 'court_close', low: 'court_low', umb: 'umbrellas', sky: 'skyline_bokeh'};

const Clip: React.FC<{x: number; w: number; id: ShotId; thumbs?: number[]; children?: React.ReactNode}> = ({x, w, id, thumbs = [0.3], children}) => {
	const tw = LANE.v1.h * (9 / 16);
	return (
		<div style={{position: 'absolute', left: x, top: LANE.v1.y, width: w - 2, height: LANE.v1.h, borderRadius: 8, overflow: 'hidden', background: C.video, boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.18)'}}>
			<div style={{position: 'absolute', left: 0, top: 0, display: 'flex', height: '100%'}}>
				{thumbs.map((s, i) => (
					<Img key={i} src={thumb(id, s)} style={{width: tw, height: LANE.v1.h, objectFit: 'cover', opacity: 0.92, flexShrink: 0}} />
				))}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 24, background: 'linear-gradient(180deg, rgba(0,0,0,0.55), transparent)'}} />
			{w > 62 ? <div style={{position: 'absolute', left: 7, top: 4, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap'}}>{NAMES[id] ?? id}</div> : null}
			{children}
		</div>
	);
};

const Traffic: React.FC = () => (
	<div style={{display: 'flex', gap: 8}}>
		{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
			<div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
		))}
	</div>
);

const Window: React.FC<{t: number}> = ({t}) => {
	const ph = playhead(t);
	const frozen = t >= T.freeze;
	const pic = editPicture(ph, {freeze: frozen});
	const playingAfterShake = t >= T.shake && t >= PLAY2 && t < SCRUB2[0];
	const sh = playingAfterShake ? kickShake(ph, 0, TL_SPAN) : 0;
	const titleOn = t >= T.title && ph >= at(128) - 0.01 && ph < at(131);
	const freezeFlash = frozen ? 1 - clamp01((t - T.freeze) / 0.18) : 0;
	const v = speaking(t);
	// the timeline
	const hookW = tx(T.slam) - tx(0);
	const hookThumbs = Array.from({length: Math.ceil(hookW / (LANE.v1.h * (9 / 16)))}, (_, i) => 0.2 + i * 0.6);
	const shownTitle = clamp01((t - T.title) / 0.25);
	return (
		<div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: WIN.r, overflow: 'hidden', background: C.win, boxShadow: '0 50px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.10)'}}>
			{/* title bar */}
			<div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, height: TB, background: 'linear-gradient(180deg, #1D1D21, #17171A)', borderBottom: `1px solid ${C.line}`}}>
				<div style={{position: 'absolute', left: 18, top: 17}}>
					<Traffic />
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: TB, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: SANS, fontSize: 15}}>
					<span style={{fontWeight: 650, color: '#ECECF0'}}>New York</span>
					<span style={{color: '#77777F', fontWeight: 500}}>— Edited</span>
				</div>
				<div style={{position: 'absolute', right: 14, top: 8, height: 32, padding: '0 15px', borderRadius: 9, background: '#ECECF0', color: '#111', fontFamily: SANS, fontWeight: 650, fontSize: 14, display: 'flex', alignItems: 'center'}}>Export</div>
			</div>
			{/* viewer: the 9:16 picture, rendered at full size and scaled so the camera can fill the screen with it */}
			<div style={{position: 'absolute', left: 0, top: VIEW.y, width: WIN.w, height: VIEW.h, background: '#060607'}} />
			<div style={{position: 'absolute', left: PIC.x, top: PIC.y, width: PIC.w, height: PIC.h, overflow: 'hidden', background: '#000'}}>
				<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${PIC.w / 1080})`, transformOrigin: '0 0'}}>
					<div style={{position: 'absolute', inset: -40, transform: `translate(${sh * 26 * Math.sin(t * 104)}px, ${sh * 20 * Math.cos(t * 140)}px) rotate(${sh * 0.9 * Math.sin(t * 79)}deg)`}}>
						<div style={{position: 'absolute', left: 40, top: 40, width: 1080, height: 1920}}>
							<Pic id={pic.id} s={pic.s} look={pic.look} blend={pic.slow} />
						</div>
					</div>
					{titleOn ? <Title p={(t - T.title) / 0.35} /> : null}
					{freezeFlash > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${0.8 * freezeFlash})`}} /> : null}
				</div>
			</div>
			{/* transport */}
			<div style={{position: 'absolute', left: 0, top: TRANS.y, width: WIN.w, height: TRANS.h, background: '#111114', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center'}}>
				<div style={{marginLeft: 20, fontFamily: MONO, fontSize: 19, color: '#E6E6EA', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums'}}>{fmt(ph)}</div>
				<div style={{position: 'absolute', left: WIN.w / 2 - 14, top: 15, width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid #E6E6EA'}} />
				<div style={{position: 'absolute', right: 14, top: 8, height: 36, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px 0 6px', borderRadius: 18, background: v > 0.05 ? 'rgba(255,154,85,0.13)' : 'rgba(255,255,255,0.05)', boxShadow: v > 0.05 ? 'inset 0 0 0 1px rgba(255,154,85,0.45)' : 'inset 0 0 0 1px rgba(255,255,255,0.08)'}}>
					<RiffIcon size={26} level={v} glow={v * 0.7} />
					<div style={{fontFamily: SANS, fontSize: 14, fontWeight: 650, color: v > 0.05 ? '#FFD9BD' : '#B5B5BC'}}>{v > 0.05 ? 'Listening' : 'Ready'}</div>
				</div>
			</div>
			{/* timeline */}
			<div style={{position: 'absolute', left: 0, top: TL.y, width: WIN.w, height: TL.h, background: C.lane}}>
				{/* track heads */}
				{(
					[
						['V2', LANE.v2],
						['V1', LANE.v1],
						['A1', LANE.a1],
					] as [string, {y: number; h: number}][]
				).map(([n, l]) => (
					<div key={n} style={{position: 'absolute', left: 0, top: l.y, width: HEAD - 10, height: l.h, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 14, fontWeight: 650, color: '#8A8A93', background: C.panel, borderRadius: '0 8px 8px 0'}}>
						{n}
					</div>
				))}
				{/* ruler */}
				<div style={{position: 'absolute', left: 0, top: 0, width: WIN.w, height: LANE.ruler.h, borderBottom: `1px solid ${C.line}`}}>
					{Array.from({length: TL_SPAN + 1}, (_, s) => (
						<div key={s} style={{position: 'absolute', left: tx(s), top: 0, height: LANE.ruler.h}}>
							<div style={{position: 'absolute', left: 0, bottom: 0, width: 1, height: s % 2 === 0 ? 12 : 7, background: 'rgba(255,255,255,0.3)'}} />
							{s % 2 === 0 ? <div style={{position: 'absolute', left: 4, top: 3, fontFamily: MONO, fontSize: 12, color: '#7A7A84'}}>{`00:${String(s).padStart(2, '0')}`}</div> : null}
						</div>
					))}
				</div>
				{/* V2: the title */}
				{shownTitle > 0 ? (
					<div style={{position: 'absolute', left: tx(at(128)), top: LANE.v2.y, width: (tx(at(131)) - tx(at(128))) * easeOut(shownTitle), height: LANE.v2.h, borderRadius: 8, background: 'linear-gradient(180deg, #8B5CF6, #6D3FE0)', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.25)', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingLeft: 10, fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap'}}>
						T&nbsp;&nbsp;New York
					</div>
				) : null}
				{/* V1: the hook clip and the cut to the beat */}
				<Clip x={tx(0)} w={hookW} id="hk" thumbs={hookThumbs}>
					<div style={{position: 'absolute', left: tx(T.slow) - tx(0), right: 0, bottom: 0, height: 26, background: 'rgba(255,154,85,0.9)', display: 'flex', alignItems: 'center', paddingLeft: 8, fontFamily: SANS, fontSize: 13, fontWeight: 750, color: C.emberInk}}>35% ◂ speed</div>
					<div style={{position: 'absolute', right: 6, top: 4, height: 18, padding: '0 6px', borderRadius: 5, background: 'rgba(0,0,0,0.55)', fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: '#FFC79E', display: 'flex', alignItems: 'center'}}>fx Cinematic</div>
				</Clip>
				{CUT_A.map((c, i) => {
					const b = i < CUT_A.length - 1 ? CUT_A[i + 1].a : TL_SPAN;
					const fz = frozen && c.id === 'kick';
					const k0 = at(128 + FREEZE.from);
					return (
						<Clip key={i} x={tx(c.a)} w={tx(b) - tx(c.a)} id={c.id} thumbs={[c.off + 0.2]}>
							{fz ? (
								<div style={{position: 'absolute', left: tx(k0) - tx(c.a), right: 0, top: 0, bottom: 0, background: 'repeating-linear-gradient(135deg, rgba(190,225,255,0.55) 0 6px, rgba(150,200,255,0.3) 6px 12px)', boxShadow: 'inset 0 0 0 2px rgba(220,240,255,0.95)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, fontFamily: SANS, fontSize: 18, color: '#fff', opacity: clamp01((t - T.freeze) / 0.15)}}>❄</div>
							) : null}
						</Clip>
					);
				})}
				{/* shake keyframes: one on every kick */}
				{SHAKE_KEYS.map(({k, pop}) => {
					const p = clamp01((t - pop) / 0.18);
					if (p <= 0) return null;
					const s = p < 1 ? 0.4 + 1.0 * easeOut(p) + 0.25 * Math.sin(p * Math.PI) : 1;
					return <div key={k} style={{position: 'absolute', left: tx(k) - 8, top: LANE.v1.y - 9, width: 16, height: 16, transform: `rotate(45deg) scale(${s})`, background: C.ember, borderRadius: 3, boxShadow: '0 0 10px rgba(255,150,90,0.8), 0 0 0 1.5px rgba(30,15,6,0.9)'}} />;
				})}
				{/* A1: the song, with its kicks */}
				<div style={{position: 'absolute', left: tx(0), top: LANE.a1.y, width: tx(TL_SPAN) - tx(0), height: LANE.a1.h, borderRadius: 8, background: C.music, overflow: 'hidden', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.14)'}}>
					<svg width={tx(TL_SPAN) - tx(0)} height={LANE.a1.h} style={{position: 'absolute', left: 0, top: 0}}>
						{Array.from({length: Math.floor(TL_SPAN * 30)}, (_, i) => {
							const e = (env as number[])[i] ?? 0;
							const h = Math.max(2, e * (LANE.a1.h - 34));
							return <rect key={i} x={(i / 30) * PPS} y={(LANE.a1.h - 8) / 2 - h / 2 + 8} width={Math.max(1, PPS / 30 - 0.6)} height={h} fill={C.musicWave} opacity={0.85} />;
						})}
					</svg>
					<div style={{position: 'absolute', left: 8, top: 4, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.9)'}}>♪ N.Y. State of Mind</div>
					{HITS.kicks
						.filter((k) => k < TL_SPAN)
						.map((k) => (
							<div key={k} style={{position: 'absolute', left: tx(k) - tx(0) - 3, bottom: 5, width: 6, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.75)'}} />
						))}
				</div>
				{/* playhead */}
				<div style={{position: 'absolute', left: tx(ph) - 1.5, top: 0, width: 3, height: LANE.a1.y + LANE.a1.h + 8, background: C.ember, boxShadow: '0 0 12px rgba(255,140,80,0.7)'}} />
				<div style={{position: 'absolute', left: tx(ph) - 9, top: 0, width: 18, height: 14, borderRadius: '4px 4px 9px 9px', background: C.ember}} />
			</div>
		</div>
	);
};

/** two fingers on the trackpad: they slide while the playhead scrubs (natural scrolling: right = earlier) */
const Finger: React.FC<{x: number; y: number; o: number}> = ({x, y, o}) => (
	<div style={{position: 'absolute', left: x - 34, top: y - 38, width: 68, height: 76, opacity: o, borderRadius: '46% 46% 44% 44%', background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.45), rgba(255,255,255,0.16) 62%, rgba(255,255,255,0.05) 100%)', boxShadow: '0 0 0 1.5px rgba(255,255,255,0.5), 0 0 26px rgba(255,255,255,0.2)'}} />
);
const Trackpad: React.FC<{t: number}> = ({t}) => {
	const ph = playhead(t);
	const on = scrubbing(t);
	// finger offset follows the playhead within each scrub
	let dx = 0;
	if (t >= SCRUB1[0] - 0.12 && t <= SCRUB1[1] + 0.15) dx = (TL_SPAN - ph) * 38 - 90;
	else if (t >= SCRUB2[0] - 0.12 && t <= SCRUB2[1] + 0.15) dx = (playhead(SCRUB2[0]) - ph) * 46 - 80;
	const o = on ? 1 : 0.28;
	const cx = PAD.x + PAD.w / 2 + dx;
	const cy = PAD.y + PAD.h / 2;
	return (
		<>
			<div style={{position: 'absolute', left: PAD.x, top: PAD.y + 10, width: PAD.w, height: PAD.h, borderRadius: 34, background: '#050506', boxShadow: '0 40px 90px rgba(0,0,0,0.8)'}} />
			<div style={{position: 'absolute', left: PAD.x, top: PAD.y, width: PAD.w, height: PAD.h, borderRadius: 34, background: 'linear-gradient(165deg, #2A2A2F 0%, #1A1A1E 38%, #121215 100%)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 1.5px 0 rgba(255,255,255,0.16)'}} />
			<Finger x={cx - 42} y={cy + 8} o={o} />
			<Finger x={cx + 42} y={cy - 8} o={o} />
		</>
	);
};

/** the editor scene, under the camera; e = camE(t) */
export const Editor: React.FC<{t: number}> = ({t}) => {
	const e = camE(t);
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: camTransform(e), transformOrigin: '0 0'}}>
				<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #16161A 0%, #070708 60%, #000 100%)'}} />
				<Window t={t} />
				<Trackpad t={t} />
			</div>
		</div>
	);
};

export {staticFile};
