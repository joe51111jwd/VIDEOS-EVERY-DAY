import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {FPS, H, T, TIGHT, W as FW, clamp01, easeIn, easeInOut, easeOut, hash, lerp, pulse, spr} from '../lib/tokens';
import {HOTFILL, Row, Stack, stackH} from '../lib/Type';
import {CUE, W as L, bt} from './beats';
import {DECK_H, DECK_W, Deck, DeckButtons, Swipe} from '../taste/Deck';
import {CH, CW, Flip, GAP, GH, GW, Grid, Liked, Tap, cellXY} from '../taste/Grid';
import {Gene, SH, SW, Site, SiteAt, Taste} from '../taste/Site';
import {DECK, R2, R3, R4, R5, SLOP, WINNER, WINNER2} from '../taste/genes';
import {AIWin, Bag, Phone, Poster, TasteCard} from '../taste/Things';
import {Icon, Tagline, Wordmark} from '../taste/Brand';
import {CK, Cursor, cursorAt} from '../mac/Cursor';

// ---------------------------------------------------------------- shared
const taste = (r: Gene[]) => r.filter((g): g is Taste => g.kind === 'taste');
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

// ---------------------------------------------------------------- A · the deck (0 – 2.10)
const SWIPES: Swipe[] = [
	{at: CUE.slam, dir: -1},
	{at: bt(200), dir: -1},
	{at: bt(201), dir: 1},
	{at: bt(202), dir: 1},
];
const SceneDeck: React.FC<{t: number}> = ({t}) => {
	const push = 1 + 0.06 * easeInOut(clamp01(t / 2.1));
	return (
		<Black spot={0.09}>
			<div style={{position: 'absolute', left: (FW - DECK_W) / 2, top: 150, transform: `scale(${push})`, transformOrigin: '50% 70%'}}>
				<Deck t={t} cards={DECK} swipes={SWIPES} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 150 + DECK_H + 70, display: 'flex', justifyContent: 'center'}}>
				<DeckButtons t={t} swipes={SWIPES} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- B/C · gray grid → breeding rounds (2.10 – 10.93)
const T4 = taste(R4);
const BASE0: Gene[] = SLOP.map((g, i) => (i === 1 ? T4[0] : i === 7 ? T4[3] : i === 3 ? T4[5] : g));
const R5X: Gene[] = R5.map((g, i) => (i === 7 ? WINNER : g));
const dist = (a: number, b: number) => {
	const p = cellXY(a);
	const q = cellXY(b);
	return Math.hypot(p.x - q.x, p.y - q.y) / (CW + GAP);
};
/** the nearest taste cell to `o` that isn't in `not` */
const near = (r: Gene[], o: number, not: number[] = []) =>
	r
		.map((g, i) => ({g, i}))
		.filter(({g, i}) => g.kind === 'taste' && i !== o && !not.includes(i))
		.sort((a, b) => dist(a.i, o) - dist(b.i, o))[0].i;

const TAPS_B: Tap[] = [
	{cell: 1, at: L.you0},
	{cell: 7, at: L.make},
	{cell: 3, at: L.them},
];
const F1: Flip = {at: bt(206), from: BASE0, to: R2, origin: 3};
const c2a = near(R2, 3);
const c2b = near(R2, c2a, [3]);
const F2: Flip = {at: bt(210), from: R2, to: R3, origin: c2b};
const c3a = near(R3, c2b);
const c3b = near(R3, c3a, [c2b]);
const F3: Flip = {at: bt(212), from: R3, to: R4, origin: c3b};
const c4a = near(R4, c3b);
const c4b = near(R4, c4a, [c3b]);
const F4: Flip = {at: bt(214), from: R4, to: R5X, origin: c4b};
const FLIPS = [F1, F2, F3, F4];
const TAPS_C: Tap[] = [
	{cell: c2a, at: 5.35},
	{cell: c2b, at: 5.85},
	{cell: c3a, at: 7.08},
	{cell: c3b, at: 7.42},
	{cell: c4a, at: 8.28},
	{cell: c4b, at: 8.62},
	{cell: 7, at: L.ice},
];
const flipMid = (f: Flip, i: number) => f.at + dist(i, f.origin) * 0.045 + 0.21;

// grid framing: B = big, low, under the type; C = framed under the app header
const GB = {cx: FW / 2, cy: 330 + GH / 2, s: 1};
const GC = {cx: FW / 2, cy: 585, s: 0.84};
const cellScreen = (i: number, g = GC) => {
	const {x, y} = cellXY(i);
	return {x: g.cx + (x - GW / 2) * g.s, y: g.cy + (y - GH / 2) * g.s, w: CW * g.s, h: CH * g.s};
};
const LEARN = [12, 38, 61, 84, 97];

const Header: React.FC<{t: number}> = ({t}) => {
	const a = easeOut(clamp01((t - F1.at - 0.1) / 0.4));
	const round = 1 + FLIPS.filter((f) => t >= f.at).length;
	const last = FLIPS.filter((f) => t >= f.at).pop();
	const prev = LEARN[round - 2] ?? LEARN[0];
	const pct = last ? lerp(prev, LEARN[round - 1], easeOut(clamp01((t - last.at) / 0.6))) : LEARN[0];
	const bump = last ? pulse(t, last.at, 0.05, 0.3) : 0;
	return (
		<div style={{position: 'absolute', left: GC.cx - (GW * GC.s) / 2, right: GC.cx - (GW * GC.s) / 2, top: 64, height: 60, display: 'flex', alignItems: 'center', opacity: a, transform: `translateY(${(1 - a) * -16}px)`, fontFamily: TIGHT, color: '#E8E8EC'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
				<Icon s={46} />
				<Wordmark size={42} />
			</div>
			<div style={{marginLeft: 44, fontSize: 22, fontWeight: 500, color: '#9A9AA2', letterSpacing: '0.01em'}}>
				Round <span style={{color: '#fff', fontWeight: 650, display: 'inline-block', transform: `scale(${1 + 0.25 * bump})`}}>{round}</span> · Tap what you like
			</div>
			<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18, fontSize: 22, fontWeight: 500, color: '#9A9AA2'}}>
				Learning your eye
				<div style={{width: 260, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
					<div style={{width: `${pct}%`, height: '100%', borderRadius: 4, background: HOTFILL, boxShadow: `0 0 ${12 + 20 * bump}px rgba(255,90,60,0.7)`}} />
				</div>
				<span style={{color: '#fff', fontWeight: 650, width: 58, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{Math.round(pct)}%</span>
			</div>
		</div>
	);
};

const SceneGrid: React.FC<{t: number}> = ({t}) => {
	// framing B → C as the first flip lands
	const m = easeInOut(clamp01((t - F1.at + 0.05) / 0.6));
	const g = {cx: lerp(GB.cx, GC.cx, m), cy: lerp(GB.cy, GC.cy, m), s: lerp(GB.s, GC.s, m)};
	// the winner flies out of the grid on beat 216
	const fly = easeInOut(clamp01((t - bt(216)) / 0.55));
	const dim = 1 - 0.8 * fly;
	const gray = (i: number) => {
		if (t >= flipMid(F1, i)) return 0;
		const tap = TAPS_B.find((tp) => tp.cell === i);
		if (tap && t >= tap.at) return 1 - clamp01((t - tap.at) / 0.16);
		return 1;
	};
	const taps = [...TAPS_B, ...TAPS_C];
	// cursor
	const keys: CK[] = [{t: 4.55, x: 1500, y: 1180}];
	for (const tp of TAPS_C) {
		const c = cellScreen(tp.cell);
		const p = {x: c.x + c.w * 0.52, y: c.y + c.h * 0.58};
		keys.push({t: tp.at - 0.11, ...p}, {t: tp.at + 0.06, ...p});
	}
	keys.push({t: 9.95, x: keys[keys.length - 1].x + 60, y: keys[keys.length - 1].y + 140});
	const cur = cursorAt(t, keys);
	const press = Math.max(0, ...TAPS_C.map((tp) => pulse(t, tp.at - 0.05, 0.05, 0.12)));
	const curO = clamp01((t - 4.6) / 0.2) * (1 - clamp01((t - 9.9) / 0.15));
	// type over the gray grid (B only)
	const typeRows: Row[] = [
		[
			{t: 'CEILINGS', at: L.ceilings},
			{t: 'ARE', at: L.are, st: 'expanded', wt: 220},
			{t: 'GRAY', at: L.gray, fill: 'dim'},
		],
	];
	const win = cellScreen(7);
	const ww = lerp(win.w, FW * 1.04, fly);
	const wh = (ww * SH) / SW;
	const wx = lerp(win.x, (FW - ww) / 2, fly);
	const wy = lerp(win.y, (H - wh) / 2 + 40 * (1 - fly), fly);
	const push = 1 + 0.03 * clamp01((t - bt(216) - 0.55) / 0.9);
	return (
		<Black spot={0.05}>
			<div style={{position: 'absolute', left: g.cx - GW / 2, top: g.cy - GH / 2, width: GW, height: GH, transform: `scale(${g.s * (1 - 0.06 * fly)})`, transformOrigin: '50% 50%', perspective: 2400, opacity: dim}}>
				<Grid t={t} base={BASE0} flips={FLIPS} taps={taps} gray={gray} />
			</div>
			{t < F1.at ? (
				<>
					<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 380, background: 'linear-gradient(180deg, #000 70%, rgba(0,0,0,0))'}} />
					<Centered rows={typeRows} t={t} top={70} />
				</>
			) : null}
			{t >= F1.at ? (
				<div style={{opacity: dim}}>
					<Header t={t} />
				</div>
			) : null}
			{curO > 0 ? <Cursor x={cur.x} y={cur.y} press={press} opacity={curO} s={1.6} /> : null}
			{fly > 0 ? (
				<div style={{position: 'absolute', left: wx, top: wy, width: ww, height: wh, borderRadius: lerp(10, 0, fly), overflow: 'hidden', boxShadow: '0 60px 140px rgba(0,0,0,0.7)', transform: `scale(${push})`}}>
					<div style={{transform: `scale(${ww / SW})`, transformOrigin: '0 0'}}>
						<Site g={WINNER} />
					</div>
				</div>
			) : null}
			{fly > 0 && fly < 1 ? (
				<div style={{position: 'absolute', left: wx, top: wy, width: ww, height: wh, opacity: 1 - fly}}>
					<Liked p={1} w={ww} h={wh} r={10} />
				</div>
			) : null}
		</Black>
	);
};

// ---------------------------------------------------------------- D · refrain 1, then MOVE alone in the stop (10.93 – 15.93)
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
	if (t < L.r1.move) {
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
	const sh = CUE.pick.reduce((a, p, i) => {
		const s = shake(t, p, 10, i + 1);
		return {x: a.x + s.x, y: a.y + s.y};
	}, {x: 0, y: 0});
	return (
		<Black spot={0.05}>
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${1 + 0.035 * hit})`}}>
				<Centered rows={[[{t: 'MOVE', at: L.r1.move, fill: 'hot', wt: 900}]]} t={t} w={1840} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- E · on the drop it makes everything in your taste (15.93 – 18.29)
const Browser: React.FC<{w: number; g: Gene; chrome: number}> = ({w, g, chrome}) => {
	const bar = 46 * (w / 1100) * chrome;
	return (
		<div style={{position: 'relative', width: w, borderRadius: 14 * chrome, overflow: 'hidden', background: '#F7F4EE', boxShadow: `0 ${50 * chrome}px ${120 * chrome}px rgba(40,25,10,${0.35 * chrome})`}}>
			<div style={{height: bar, display: 'flex', alignItems: 'center', gap: bar * 0.18, padding: `0 ${bar * 0.4}px`, background: '#EDE7DD', overflow: 'hidden'}}>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
					<div key={c} style={{width: bar * 0.26, height: bar * 0.26, borderRadius: '50%', background: c}} />
				))}
				<div style={{margin: '0 auto', height: bar * 0.6, width: w * 0.36, borderRadius: bar * 0.16, background: 'rgba(22,18,14,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TIGHT, fontSize: bar * 0.3, color: '#6B6157'}}>emberandoak.coffee</div>
			</div>
			<div style={{width: w, height: (w * SH) / SW, overflow: 'hidden'}}>
				<div style={{transform: `scale(${w / SW})`, transformOrigin: '0 0'}}>
					<Site g={g} />
				</div>
			</div>
		</div>
	);
};
const land = (t: number, at: number) => {
	const s = spr(t, at, 17, 0.62);
	return {o: clamp01((t - at) / 0.05), y: (1 - s) * 420, sc: 1.12 - 0.12 * s};
};
const SceneMake: React.FC<{t: number}> = ({t}) => {
	const pull = easeInOut(clamp01((t - bt(227) + 0.08) / 0.5));
	const bw = lerp(FW * 1.0, 1080, pull);
	const bx = lerp(0, 420, pull);
	const by = lerp(-46 * (FW / 1100) + (H - (FW * SH) / SW) / 2, 120, pull);
	const sh = shake(t, CUE.drop, 14, 3);
	const push = 1 + 0.03 * clamp01((t - bt(227)) / 1.8);
	const items = [
		{at: bt(227), x: 120, y: 300, r: -5, el: <Poster w={420} />},
		{at: bt(228), x: 1460, y: 420, r: 4, el: <Bag w={330} />},
		{at: bt(229), x: 1150, y: 430, r: -3, el: <Phone w={250} />},
	];
	return (
		<AbsoluteFill style={{background: T.paper, overflow: 'hidden'}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 40% 30%, rgba(255,250,240,0.9), rgba(0,0,0,0) 70%), linear-gradient(180deg, #EFE8DC, #E3D8C6)'}} />
			<AbsoluteFill style={{backgroundImage: `url(${staticFile('img/grain.png')})`, backgroundSize: '320px 320px', opacity: 0.35, mixBlendMode: 'multiply'}} />
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${push})`}}>
				<div style={{position: 'absolute', left: bx, top: by}}>
					<Browser w={bw} g={WINNER2} chrome={pull} />
				</div>
				{items.map((it, i) => {
					const l = land(t, it.at);
					if (t < it.at) return null;
					return (
						<div key={i} style={{position: 'absolute', left: it.x, top: it.y, opacity: l.o, transform: `translateY(${l.y}px) rotate(${it.r}deg) scale(${l.sc})`}}>
							{it.el}
						</div>
					);
				})}
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
const T5 = taste(R5);
const SceneCard: React.FC<{t: number}> = ({t}) => {
	const c = spr(t, L.r2.ooh, 9, 0.78);
	const cw = 1120;
	const ch = (540 / 860) * cw;
	const back = clamp01((t - L.r2.ooh) / 0.4);
	return (
		<Black spot={0.05}>
			<div style={{position: 'absolute', inset: 0, filter: back > 0 ? `brightness(${1 - 0.55 * back}) blur(${3 * back}px)` : undefined, transform: `scale(${1 + 0.03 * clamp01((t - L.r2.i) / 3)})`}}>
				<Centered rows={R2ROWS} t={t} w={1820} />
			</div>
			{t >= L.r2.ooh ? (
				<div style={{position: 'absolute', left: (FW - cw) / 2, top: (H - ch) / 2 + (1 - c) * 760, transform: `perspective(2000px) rotateX(${(1 - c) * 28}deg) scale(${0.96 + 0.04 * c + 0.012 * clamp01((t - L.r2.ooh - 0.6) / 1.6)})`}}>
					<TasteCard w={cw} t={t} t0={L.r2.ooh + 0.15} thumbs={[WINNER2, T5[1], T5[3], T5[5]]} />
				</div>
			) : null}
		</Black>
	);
};

// ---------------------------------------------------------------- G · refrain 3 + it plugs into every AI (22.99 – 27.70)
const APPS = [
	{name: 'ChatGPT', prompt: 'Landing page for my café', from: SLOP[2], to: WINNER},
	{name: 'Claude', prompt: 'Poster for Friday night', from: SLOP[5], to: T5[2]},
	{name: 'Figma', prompt: 'Homepage for a bike shop', from: SLOP[9], to: T5[4]},
	{name: 'Canva', prompt: 'Menu for the bakery', from: SLOP[14], to: T5[6]},
];
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
					const at = 22.99 + i * 0.06;
					const e = easeOut(clamp01((t - at) / 0.35));
					const fl = clamp01((t - L.r3.move - i * 0.07) / 0.42);
					const on = clamp01((t - L.r3.move - i * 0.07 + 0.05) / 0.12);
					const gr = 1 - on;
					return (
						<div key={i} style={{position: 'absolute', left: x0 + i * (ww + gap), top: wy, opacity: e, transform: `translateY(${(1 - e) * 60}px)`, filter: gr > 0.01 ? `saturate(${1 - 0.7 * gr}) brightness(${1 - 0.2 * gr})` : undefined}}>
							<AIWin w={ww} name={a.name} prompt={a.prompt} g={fl > 0.5 ? a.to : a.from} flip={easeInOut(fl)} on={on} />
						</div>
					);
				})}
				<Centered rows={R3BOT} t={t} top={wy + wh + 44} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- H · refrain 4, the big one, over a wall of your taste (27.70 – 32.40)
const WALL: Gene[] = [...T5, ...taste(R4), ...taste(R3), WINNER, WINNER2];
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
	const hot = pulse(t, L.r4.move, 0.05, 0.9);
	const sh = shake(t, L.r4.move, 16, 7);
	return (
		<Black spot={0}>
			<Wall t={t} bright={0.16 + 0.12 * hot} blur={2} />
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
			<Wall t={t} bright={0.22 + 0.1 * hit} blur={6} cw={300} />
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
export const SC = {grid: 2.1, r1: L.r1.i, make: CUE.drop, card: bt(230), ai: bt(238), r4: bt(246), end: bt(254)};
export const Film: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	if (t < SC.grid) return <SceneDeck t={t} />;
	if (t < SC.r1) return <SceneGrid t={t} />;
	if (t < SC.make) return <SceneR1 t={t} />;
	if (t < SC.card) return <SceneMake t={t} />;
	if (t < SC.ai) return <SceneCard t={t} />;
	if (t < SC.r4) return <SceneAI t={t} />;
	if (t < SC.end) return <SceneR4 t={t} />;
	return <SceneEnd t={t} />;
};

export const _u = [easeIn];
