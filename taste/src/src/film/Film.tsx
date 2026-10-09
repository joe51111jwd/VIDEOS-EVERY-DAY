import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, H, TIGHT, W as FW, clamp01, easeIn, easeInOut, easeOut, hash, lerp, pulse, spr} from '../lib/tokens';
import {HOTFILL, LEAD, Row, Stack, stackH} from '../lib/Type';
import {CUE, W as L, bt} from './beats';
import {APPS, ASK, DECKC, DROP, HOOK, PAL, TASTE_NAME, WALL} from './cast';
import {Deck, DeckButtons, Swipe} from '../taste/Deck';
import {Card, SH, SW, Site, SiteAt} from '../taste/Site';
import {SLOP} from '../taste/genes';
import {AIWin, TasteCard} from '../taste/Things';
import {Icon, Tagline, Wordmark} from '../taste/Brand';
import {Learn, Profile} from '../taste/Profile';
import {Cursor, cursorAt} from '../mac/Cursor';

// ---------------------------------------------------------------- shared
const Black: React.FC<{children?: React.ReactNode; spot?: number}> = ({children, spot = 0.07}) => (
	<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
		<AbsoluteFill style={{background: `radial-gradient(ellipse 70% 60% at 50% 38%, rgba(255,255,255,${spot}), rgba(0,0,0,0) 70%)`}} />
		{children}
	</AbsoluteFill>
);
/** a decaying shake after t0 */
const shake = (t: number, t0: number, amp: number, seed = 1) => {
	if (t < t0) return {x: 0, y: 0};
	const k = Math.exp(-(t - t0) * 14) * amp;
	return {x: Math.sin((t - t0) * 90 + seed) * k, y: Math.cos((t - t0) * 77 + seed * 2) * k * 0.7};
};
/** a stack centered in the frame (or at `top`) */
const Centered: React.FC<{rows: Row[]; t: number; w?: number; top?: number; gap?: number; style?: React.CSSProperties}> = ({rows, t, w = 1840, top, gap, style}) => {
	const h = stackH(rows, w, gap);
	return <Stack rows={rows} t={t} w={w} gap={gap} style={{position: 'absolute', left: (FW - w) / 2, top: top ?? (H - h) / 2, ...style}} />;
};
/** a design filling the frame (cover) */
const Full: React.FC<{g: Card; s?: number; ox?: number; oy?: number}> = ({g, s = 1, ox = 0.5, oy = 0.5}) => {
	const k = Math.max(FW / SW, H / SH) * s;
	return (
		<div style={{position: 'absolute', left: (FW - SW * k) * ox, top: (H - SH * k) * oy, width: SW, height: SH, transform: `scale(${k})`, transformOrigin: '0 0'}}>
			<Site g={g} />
		</div>
	);
};
const HEART = 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z';
/** double-tap heart */
const HeartPop: React.FC<{t: number; at: number; x?: number; y?: number; s?: number}> = ({t, at, x = FW / 2, y = H / 2, s = 260}) => {
	if (t < at) return null;
	const a = spr(t, at, 20, 0.45);
	const o = 1 - clamp01((t - at - 0.38) / 0.18);
	if (o <= 0) return null;
	return (
		<div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, transform: `scale(${0.3 + 0.7 * a})`, opacity: o, filter: 'drop-shadow(0 10px 40px rgba(255,60,90,0.6))'}}>
			<svg width={s} height={s} viewBox="0 0 24 24">
				<defs>
					<linearGradient id="hh" x1="0" y1="0" x2="0.4" y2="1">
						<stop offset="0" stopColor="#FFD06A" />
						<stop offset="0.45" stopColor="#FF7A2E" />
						<stop offset="1" stopColor="#FF2D7E" />
					</linearGradient>
				</defs>
				<path d={HEART} fill="url(#hh)" />
			</svg>
		</div>
	);
};

// ---------------------------------------------------------------- A · cold open: the sites you love (0 – 2.04)
const HOOK_AT = [0, bt(200), bt(201)];
const SceneHook: React.FC<{t: number}> = ({t}) => {
	const i = HOOK_AT.filter((a) => t >= a).length - 1;
	const k = t - HOOK_AT[i];
	const punch = pulse(t, bt(202), 0.04, 0.3);
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${1.06 - 0.05 * easeOut(clamp01(k / 0.9)) + 0.03 * punch})`}}>
				<Full g={HOOK[i]} />
			</div>
			{HOOK_AT.map((a, j) => (
				<HeartPop key={j} t={t} at={a + (j === 0 ? 0.05 : 0.02)} y={H * 0.6} />
			))}
			<HeartPop t={t} at={bt(202)} s={300} y={H * 0.6} />
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- B · the ask: gray AI, then Taste on (2.04 – 5.35)
const AW = 1100; // window width
const AK = AW / 620;
const AX = (FW - AW) / 2;
const AY = 250;
const SceneAsk: React.FC<{t: number}> = ({t}) => {
	const on = easeOut(clamp01((t - L.you0) / 0.12));
	const shimmer = t > L.make - 0.05 && t < L.blue ? -0.3 + 1.6 * clamp01((t - L.make + 0.05) / (L.blue - L.make)) : undefined;
	const flip = easeInOut(clamp01((t - (L.blue - 0.16)) / 0.32));
	// push into the result until it fills the frame
	const push = easeInOut(clamp01((t - L.blue - 0.1) / 0.6));
	const ox = AX + 20 * AK;
	const oy = AY + 116 * AK;
	const ow = 560 * AK;
	const oh = (ow * SH) / SW;
	const s = lerp(1, (FW * 1.005) / ow, push);
	const tx = lerp(0, FW / 2 - (ox + ow / 2), push);
	const ty = lerp(0, H / 2 - (oy + oh / 2), push);
	const typeOut = clamp01((t - (L.blue - 0.1)) / 0.18);
	const rows: Row[] = [
		[
			{t: 'CEILINGS', at: L.ceilings},
			{t: 'ARE', at: L.are, st: 'expanded', wt: 220},
			{t: 'GRAY', at: L.gray, fill: 'dim'},
		],
	];
	// cursor flips the Taste switch on "you"
	const sw = {x: AX + AW - 16 * AK - 15 * AK, y: AY + 20 * AK};
	const cur = cursorAt(t, [
		{t: 2.55, x: 1560, y: 1010},
		{t: L.you0 - 0.1, x: sw.x, y: sw.y + 4},
		{t: L.you0 + 0.1, x: sw.x, y: sw.y + 4},
		{t: L.them, x: sw.x + 90, y: sw.y + 220},
	]);
	const press = pulse(t, L.you0 - 0.05, 0.05, 0.12);
	const curO = clamp01((t - 2.55) / 0.15) * (1 - clamp01((t - L.them) / 0.2));
	return (
		<Black spot={0.06}>
			<div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) translate(${ox + ow / 2}px, ${oy + oh / 2}px) scale(${s}) translate(${-(ox + ow / 2)}px, ${-(oy + oh / 2)}px)`}}>
				<div style={{position: 'absolute', left: AX, top: AY}}>
					<AIWin w={AW} name="Chat" prompt={ASK.prompt} g={flip > 0.5 ? ASK.after : SLOP[3]} flip={flip} on={on} gray={1} shimmer={shimmer} />
				</div>
			</div>
			{typeOut < 1 ? (
				<div style={{opacity: 1 - typeOut, transform: `translateY(${-60 * typeOut}px)`}}>
					<Centered rows={rows} t={t} top={46} />
				</div>
			) : null}
			{curO > 0 ? <Cursor x={cur.x} y={cur.y} press={press} opacity={curO} s={1.7} /> : null}
		</Black>
	);
};

// ---------------------------------------------------------------- C · how: swipe what you love, it learns your eye (5.35 – 10.84)
const SW_AT = [209, 210, 211, 212, 213, 214, 215].map(bt);
const SW_DIR: (1 | -1)[] = [1, 1, -1, 1, 1, 1, 1];
const SWIPES: Swipe[] = SW_AT.map((at, i) => ({at, dir: SW_DIR[i]}));
const DECK_CARDS: Card[] = DECKC.map((n) => (n === 'SLOP' ? SLOP[6] : n));
const CHIPS = ['Cinematic photo', 'Big serif', '', 'Architectural', 'Glass & 3D', 'Moody light', 'Dark UI'];
const TYPES: (Learn['type'] | undefined)[] = [undefined, 'serif', undefined, 'grotesk', 'mono', undefined, undefined];
const PCT = [16, 31, 31, 52, 70, 86, 97];
const LEARNS: Learn[] = SWIPES.flatMap((s, i) =>
	s.dir > 0 ? [{at: s.at + 0.08, sw: (PAL[DECKC[i]] ?? ['#222', '#888']).slice(0, i === 6 ? 1 : 2), chip: CHIPS[i] || undefined, type: TYPES[i], pct: PCT[i]}] : [],
);
const NAME_AT = bt(215) + 0.42;
const DCW = 900;
const DX = 140;
const DY = 205;
const PX = 1140;
const PY = 175;
const SceneLearn: React.FC<{t: number}> = ({t}) => {
	const a = easeOut(clamp01((t - bt(208)) / 0.4));
	const push = 1 + 0.03 * clamp01((t - bt(208)) / 5.5);
	return (
		<Black spot={0.05}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${push})`}}>
				<div style={{position: 'absolute', left: DX, top: 72, display: 'flex', alignItems: 'center', gap: 18, opacity: a}}>
					<Icon s={50} />
					<Wordmark size={46} />
					<div style={{marginLeft: 26, fontFamily: TIGHT, fontSize: 26, fontWeight: 500, color: '#9A9AA2'}}>Swipe right on what you love</div>
				</div>
				<div style={{position: 'absolute', left: DX, top: DY + (1 - a) * 80, opacity: a}}>
					<Deck t={t} cards={DECK_CARDS} swipes={SWIPES} w={DCW} />
				</div>
				<div style={{position: 'absolute', left: DX, width: DCW, top: DY + (DCW * SH) / SW + 54, display: 'flex', justifyContent: 'center', opacity: a}}>
					<DeckButtons t={t} swipes={SWIPES} />
				</div>
				<div style={{position: 'absolute', left: PX, top: PY + (1 - a) * 80, opacity: a}}>
					<Profile t={t} learns={LEARNS} w={640} from={{x: DX + DCW / 2 - PX, y: DY + (DCW * SH) / SW / 2 - PY}} name={TASTE_NAME} nameAt={NAME_AT} />
				</div>
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- D · refrain 1, then MOVE alone in the stop (10.84 – 15.93)
const R1ROWS: Row[] = [
	[
		{t: 'I', at: L.r1.i, st: 'expanded'},
		{t: 'LIKE', at: L.r1.like, st: 'expanded'},
	],
	[
		{t: 'THE', at: L.r1.the, st: 'expanded', wt: 200},
		{t: 'WAY', at: L.r1.way, st: 'expanded'},
	],
	[
		{t: 'YOU', at: L.r1.you},
		{t: 'LIKE', at: L.r1.like2},
		{t: 'TO', at: L.r1.to, wt: 200, st: 'normal'},
	],
];
const SceneR1: React.FC<{t: number}> = ({t}) => {
	if (t < L.r1.move - LEAD) {
		const tf = Math.min(t, CUE.stop); // everything freezes when the band drops out
		const push = 1 + 0.035 * easeOut(clamp01((tf - L.r1.i) / 2.6));
		return (
			<Black spot={0.06}>
				<div style={{position: 'absolute', inset: 0, transform: `scale(${push})`}}>
					<Centered rows={R1ROWS} t={t} w={1820} />
				</div>
			</Black>
		);
	}
	const hit = Math.max(...CUE.pick.map((p) => pulse(t, p, 0.03, 0.18)));
	const sh = CUE.pick.reduce(
		(acc, p, i) => {
			const s = shake(t, p, 10, i + 1);
			return {x: acc.x + s.x, y: acc.y + s.y};
		},
		{x: 0, y: 0},
	);
	return (
		<Black spot={0.05}>
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${1 + 0.035 * hit})`}}>
				<Centered rows={[[{t: 'MOVE', at: L.r1.move, fill: 'hot', wt: 900}]]} t={t} w={1840} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- E · on the drop: what it makes for you, one per beat (15.93 – 18.29)
const DROP_AT = [226, 227, 228, 229].map(bt);
const PromptChip: React.FC<{text: string}> = ({text}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px 16px 18px', borderRadius: 999, background: 'rgba(14,14,16,0.82)', backdropFilter: 'blur(18px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1.5px rgba(255,255,255,0.14)', fontFamily: TIGHT, fontSize: 30, fontWeight: 550, color: '#F4F4F6', whiteSpace: 'nowrap'}}>
		<Icon s={40} />
		{text}
		<span style={{marginLeft: 8, padding: '6px 14px', borderRadius: 999, background: HOTFILL, fontSize: 20, fontWeight: 650, color: '#fff'}}>Taste on</span>
	</div>
);
const SceneDrop: React.FC<{t: number}> = ({t}) => {
	const i = DROP_AT.filter((a) => t >= a).length - 1;
	const k = t - DROP_AT[i];
	const sh = shake(t, CUE.drop, 16, 3);
	const d = DROP[i];
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${1.07 - 0.06 * easeOut(clamp01(k / 0.6))})`}}>
				<Full g={d.n} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center'}}>
				<PromptChip text={d.prompt} />
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- F · refrain 2 + your Taste card (18.29 – 22.99)
const R2ROWS: Row[] = [
	[
		{t: 'I', at: L.r2.i, st: 'normal'},
		{t: 'LIKE', at: L.r2.like, st: 'normal'},
		{t: 'THE', at: L.r2.the, st: 'normal', wt: 200},
	],
	[
		{t: 'WAY', at: L.r2.way, st: 'expanded'},
		{t: 'YOU', at: L.r2.you, st: 'expanded'},
	],
	[
		{t: 'LIKE', at: L.r2.like2, st: 'expanded', wt: 200},
		{t: 'TO', at: L.r2.to, st: 'expanded'},
	],
];
const CARD_PAL = ['#161C29', '#1C478C', '#706755', '#E9E4D8', '#3C403A'];
const SceneCard: React.FC<{t: number}> = ({t}) => {
	const c = spr(t, L.r2.ooh - LEAD, 9, 0.78);
	const cw = 1120;
	const ch = (540 / 860) * cw;
	const back = clamp01((t - L.r2.ooh) / 0.4);
	return (
		<Black spot={0.05}>
			<div style={{position: 'absolute', inset: 0, filter: back > 0 ? `brightness(${1 - 0.55 * back}) blur(${3 * back}px)` : undefined, transform: `scale(${1 + 0.03 * clamp01((t - L.r2.i) / 3)})`}}>
				<Centered rows={R2ROWS} t={t} w={1820} />
			</div>
			{t >= L.r2.ooh - LEAD ? (
				<div style={{position: 'absolute', left: (FW - cw) / 2, top: (H - ch) / 2 + (1 - c) * 760, transform: `perspective(2000px) rotateX(${(1 - c) * 28}deg) scale(${0.96 + 0.04 * c + 0.012 * clamp01((t - L.r2.ooh - 0.6) / 1.6)})`}}>
					<TasteCard w={cw} t={t} t0={L.r2.ooh + 0.1} thumbs={['cominvi', 'era', 'kononenko', 'likova']} name={TASTE_NAME} pal={CARD_PAL} typeNote="Big serif, tight grotesk, mono details" stat="Top 2% cinematic" />
				</div>
			) : null}
		</Black>
	);
};

// ---------------------------------------------------------------- G · refrain 3 + every AI gets your taste (22.99 – 27.70)
const SLOP_FROM = [SLOP[2], SLOP[5], SLOP[9], SLOP[14]];
const R3TOP: Row[] = [
	[
		{t: 'I', at: L.r3.i},
		{t: 'LIKE', at: L.r3.like},
		{t: 'THE', at: L.r3.the, wt: 200, st: 'normal'},
		{t: 'WAY', at: L.r3.way},
		{t: 'YOU', at: L.r3.you},
	],
];
const R3BOT: Row[] = [
	[
		{t: 'LIKE', at: L.r3.like2, st: 'normal'},
		{t: 'TO', at: L.r3.to, st: 'normal', wt: 200},
		{t: 'MOVE', at: L.r3.move, st: 'normal', fill: 'hot', wt: 900},
	],
];
const SceneAI: React.FC<{t: number}> = ({t}) => {
	const ww = 420;
	const wh = (470 / 620) * ww;
	const gap = 28;
	const x0 = (FW - (4 * ww + 3 * gap)) / 2;
	const topH = stackH(R3TOP, 1840);
	const wy = 70 + topH + 44;
	const sh = shake(t, L.r3.move, 12, 5);
	return (
		<Black spot={0.06}>
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${1 + 0.025 * clamp01((t - 22.99) / 4.7)})`}}>
				<Centered rows={R3TOP} t={t} top={70} />
				{APPS.map((a, i) => {
					const at = bt(238) + i * 0.06;
					const e = easeOut(clamp01((t - at) / 0.35));
					const m = L.r3.move - LEAD + i * 0.06;
					const fl = clamp01((t - m + 0.12) / 0.3);
					const on = clamp01((t - m + 0.05) / 0.1);
					return (
						<div key={i} style={{position: 'absolute', left: x0 + i * (ww + gap), top: wy, opacity: e, transform: `translateY(${(1 - e) * 60}px)`}}>
							<AIWin w={ww} name={a.name} prompt={a.prompt} g={fl > 0.5 ? a.to : SLOP_FROM[i]} flip={easeInOut(fl)} on={on} gray={1} />
						</div>
					);
				})}
				<Centered rows={R3BOT} t={t} top={wy + wh + 44} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- H · refrain 4, the big one, over a wall of the best (27.70 – 32.40)
const Wall: React.FC<{t: number; bright: number; blur?: number; cw?: number}> = ({t, bright, blur = 0, cw = 372}) => {
	const ch = (cw * SH) / SW;
	const gap = 18;
	const cols = Math.ceil(FW / (cw + gap)) + 1;
	const rows = Math.ceil(H / (ch + gap)) + 2;
	return (
		<AbsoluteFill style={{filter: `brightness(${bright})${blur ? ` blur(${blur}px)` : ''}`}}>
			{Array.from({length: cols}, (_, c) => {
				const dir = c % 2 ? 1 : -1;
				const P = ch + gap;
				const S = t * 38 * dir + c * 97;
				const off = S - Math.floor(S / P) * P - P;
				return (
					<div key={c} style={{position: 'absolute', left: c * (cw + gap) - cw * 0.3, top: off, display: 'flex', flexDirection: 'column', gap}}>
						{Array.from({length: rows}, (_, r) => (
							<SiteAt key={r} g={WALL[Math.floor(hash(c * 13 + (r - Math.floor(S / P)) * 7) * WALL.length)]} w={cw} radius={8} />
						))}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};
const R4ROWS: Row[] = [
	[
		{t: 'I', at: L.r4.i, st: 'expanded'},
		{t: 'LIKE', at: L.r4.like, st: 'expanded'},
		{t: 'THE', at: L.r4.the, st: 'expanded', wt: 200},
		{t: 'WAY', at: L.r4.way, st: 'expanded'},
	],
	[
		{t: 'YOU', at: L.r4.you},
		{t: 'LIKE', at: L.r4.like2},
		{t: 'TO', at: L.r4.to, wt: 200, st: 'normal'},
	],
	[{t: 'MOVE', at: L.r4.move, st: 'normal', fill: 'hot', wt: 900}],
];
const SceneR4: React.FC<{t: number}> = ({t}) => {
	const hot = pulse(t, L.r4.move - LEAD, 0.05, 0.9);
	const sh = shake(t, L.r4.move - LEAD, 16, 7);
	return (
		<Black spot={0}>
			<Wall t={t} bright={0.2 + 0.14 * hot} blur={2} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 80%)'}} />
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${1 + 0.03 * clamp01((t - 27.7) / 4) + 0.02 * hot})`}}>
				<Centered rows={R4ROWS} t={t} w={1800} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- I · lockup (32.40 – end)
const SceneEnd: React.FC<{t: number}> = ({t}) => {
	const a = spr(t, bt(254), 12, 0.7);
	const tg = easeOut(clamp01((t - bt(254) - 0.25) / 0.4));
	const hit = pulse(t, CUE.lastHit, 0.04, 0.5);
	return (
		<Black spot={0}>
			<Wall t={t} bright={0.26 + 0.1 * hit} blur={6} cw={300} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(0,0,0,0.85), rgba(0,0,0,0.35) 85%)'}} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse 40% 30% at 50% 46%, rgba(255,90,60,${0.18 * hit}), rgba(0,0,0,0) 70%)`}} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, transform: `scale(${0.94 + 0.06 * a + 0.035 * hit})`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 44, opacity: clamp01(a * 1.5)}}>
					<Icon s={168} />
					<Wordmark size={190} />
				</div>
				<div style={{opacity: tg, transform: `translateY(${(1 - tg) * 18}px)`}}>
					<Tagline size={58} />
				</div>
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- the film
export const SC = {ask: L.ceilings - LEAD - 0.02, learn: bt(208), r1: L.r1.i - LEAD, drop: CUE.drop, card: bt(230), ai: bt(238), r4: bt(246), end: bt(254)};
export const Film: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	if (t < SC.ask) return <SceneHook t={t} />;
	if (t < SC.learn) return <SceneAsk t={t} />;
	if (t < SC.r1) return <SceneLearn t={t} />;
	if (t < SC.drop) return <SceneR1 t={t} />;
	if (t < SC.card) return <SceneDrop t={t} />;
	if (t < SC.ai) return <SceneCard t={t} />;
	if (t < SC.r4) return <SceneAI t={t} />;
	if (t < SC.end) return <SceneR4 t={t} />;
	return <SceneEnd t={t} />;
};

export const _u = [easeIn];
