import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, H, TIGHT, W as FW, clamp01, easeInOut, easeOut, hash, lerp, pulse, spr} from '../lib/tokens';
import {HOTFILL, Row, Stack, stackH} from '../lib/Type';
import {BEAT, CUE, W as L, bt} from './beats';
import {APPS, ASK, DECKC, MAKE, PAL, TASTE_NAME, WALL} from './cast';
import {Deck, DeckButtons, Swipe} from '../taste/Deck';
import {Card, SH, SW, SiteAt} from '../taste/Site';
import {SLOP} from '../taste/genes';
import {AIWin, TasteCard} from '../taste/Things';
import {Icon, Tagline, Wordmark} from '../taste/Brand';
import {Learn, Profile} from '../taste/Profile';
import {Cursor, cursorAt} from '../mac/Cursor';

// Every line of type says what the product does; the song's words get one moment: MOVE, alone in the stop.

/** the frame a sung onset falls in: type is on screen from that frame, never after the sound */
const onFrame = (s: number) => Math.floor(s * FPS + 1e-6) / FPS;

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
/** width that keeps a stack of `rows` within maxH */
const fitW = (rows: Row[], w: number, maxH: number, gap?: number) => Math.min(w, (w * maxH) / stackH(rows, w, gap));
/** a stack centered horizontally, vertically centered or at `top` */
const Centered: React.FC<{rows: Row[]; t: number; w?: number; maxH?: number; top?: number; gap?: number}> = ({rows, t, w = 1840, maxH = 1000, top, gap}) => {
	const ww = fitW(rows, w, maxH, gap);
	const h = stackH(rows, ww, gap);
	return <Stack rows={rows} t={t} w={ww} gap={gap} style={{position: 'absolute', left: (FW - ww) / 2, top: top ?? (H - h) / 2}} />;
};

// ---------------------------------------------------------------- A · AI has no taste. Now it has yours. (0 – 2.6)
const OPEN_A: Row[] = [[{t: 'AI HAS', at: 0}], [{t: 'NO TASTE.', at: onFrame(bt(199.5))}]];
const OPEN_B: Row[] = [[{t: 'NOW IT HAS', at: onFrame(bt(201))}], [{t: 'YOURS.', at: onFrame(bt(201.5)), fill: 'hot', wt: 900}]];
const SceneOpen: React.FC<{t: number}> = ({t}) => {
	const b = t >= OPEN_B[0][0].at;
	const t0 = b ? OPEN_B[0][0].at : 0;
	const punch = pulse(t, b ? bt(202) : bt(200), 0.03, 0.3);
	return (
		<Black spot={0.06}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.025 * clamp01((t - t0) / 1.4) + 0.012 * punch})`}}>
				<Centered rows={b ? OPEN_B : OPEN_A} t={t} w={1820} maxH={960} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- B · same prompt: gray AI, then Taste on (2.6 – 5.35)
const ASK_AT = 2.6;
const AW = 1100; // window width
const AK = AW / 620;
const AX = (FW - AW) / 2;
const AY = (H - 470 * AK) / 2;
const SceneAsk: React.FC<{t: number}> = ({t}) => {
	const enter = easeOut(clamp01((t - ASK_AT) / 0.3));
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
	// cursor flips the Taste switch on "you"
	const sw = {x: AX + AW - 16 * AK - 15 * AK, y: AY + 20 * AK};
	const cur = cursorAt(t, [
		{t: ASK_AT + 0.1, x: 1560, y: 1010},
		{t: L.you0 - 0.1, x: sw.x, y: sw.y + 4},
		{t: L.you0 + 0.1, x: sw.x, y: sw.y + 4},
		{t: L.them, x: sw.x + 90, y: sw.y + 220},
	]);
	const press = pulse(t, L.you0 - 0.05, 0.05, 0.12);
	const curO = clamp01((t - ASK_AT - 0.1) / 0.15) * (1 - clamp01((t - L.them) / 0.2));
	return (
		<Black spot={0.06}>
			<div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty + (1 - enter) * 120}px) translate(${ox + ow / 2}px, ${oy + oh / 2}px) scale(${s}) translate(${-(ox + ow / 2)}px, ${-(oy + oh / 2)}px)`, opacity: clamp01(enter * 2)}}>
				<div style={{position: 'absolute', left: AX, top: AY}}>
					<AIWin w={AW} name="Chat" prompt={ASK.prompt} g={flip > 0.5 ? ASK.after : SLOP[3]} flip={flip} on={on} gray={1} shimmer={shimmer} />
				</div>
			</div>
			{curO > 0 ? <Cursor x={cur.x} y={cur.y} press={press} opacity={curO} s={1.7} /> : null}
		</Black>
	);
};

// ---------------------------------------------------------------- C · swipe what you love, it learns your eye (5.35 – 11.23)
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
const LEARN_A: Row[] = [[{t: 'SWIPE WHAT YOU LOVE.', at: bt(208), st: 'normal'}]];
const LEARN_B: Row[] = [[{t: 'IT LEARNS YOUR EYE.', at: bt(213), st: 'normal'}]];
const TOP_H = 150; // headline band
const DCW = 860;
const PW = 620;
const DX = (FW - (DCW + 100 + PW)) / 2;
const PX = DX + DCW + 100;
const DY = 262;
const PY = 246;
const SceneLearn: React.FC<{t: number}> = ({t}) => {
	const a = easeOut(clamp01((t - bt(208)) / 0.4));
	const push = 1 + 0.025 * clamp01((t - bt(208)) / 5.9);
	return (
		<Black spot={0.05}>
			<Centered rows={t < bt(213) ? LEARN_A : LEARN_B} t={t} w={1760} maxH={TOP_H} top={52} />
			<div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 60%'}}>
				<div style={{position: 'absolute', left: DX, top: DY + (1 - a) * 80, opacity: a}}>
					<Deck t={t} cards={DECK_CARDS} swipes={SWIPES} w={DCW} />
				</div>
				<div style={{position: 'absolute', left: DX, width: DCW, top: DY + (DCW * SH) / SW + 44, display: 'flex', justifyContent: 'center', opacity: a}}>
					<DeckButtons t={t} swipes={SWIPES} />
				</div>
				<div style={{position: 'absolute', left: PX, top: PY + (1 - a) * 80, opacity: a}}>
					<Profile t={t} learns={LEARNS} w={PW} from={{x: DX + DCW / 2 - PX, y: DY + (DCW * SH) / SW / 2 - PY}} name={TASTE_NAME} nameAt={NAME_AT} />
				</div>
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- D · plug it into every AI; it freezes in the stop, flips on the drop (11.23 – 14.13, 15.93 – 17.70)
const AI_AT = bt(218);
const AI_TOP: Row[] = [[{t: 'PLUG YOUR TASTE', at: AI_AT, st: 'normal'}]];
const AI_BOT: Row[] = [
	[
		{t: 'INTO', at: bt(219), st: 'normal', wt: 220},
		{t: 'EVERY AI.', at: bt(219), st: 'normal', fill: 'hot'},
	],
];
const SLOP_FROM = [SLOP[2], SLOP[5], SLOP[9], SLOP[14]];
const AI_WW = 420;
const AI_WH = (470 / 620) * AI_WW;
const SceneAI: React.FC<{t: number}> = ({t}) => {
	const tf = t < CUE.drop ? Math.min(t, CUE.stop) : t; // everything freezes when the band drops out
	const gap = 28;
	const x0 = (FW - (4 * AI_WW + 3 * gap)) / 2;
	const rowW = fitW(AI_TOP, 1760, 200);
	const topH = stackH(AI_TOP, rowW);
	const botH = stackH(AI_BOT, fitW(AI_BOT, 1760, 200));
	const total = topH + 56 + AI_WH + 56 + botH;
	const y0 = (H - total) / 2;
	const wy = y0 + topH + 56;
	const sh = shake(t, CUE.drop, 18, 5);
	return (
		<Black spot={0.06}>
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${1 + 0.025 * clamp01((tf - AI_AT) / 6.5)})`}}>
				<Centered rows={AI_TOP} t={tf} w={1760} maxH={200} top={y0} />
				{APPS.map((a, i) => {
					const at = AI_AT + 0.2 + i * 0.08;
					const e = easeOut(clamp01((tf - at) / 0.35));
					const m = CUE.drop + i * 0.07;
					const fl = clamp01((t - m - 0.04) / 0.24);
					const on = clamp01((t - m) / 0.08);
					return (
						<div key={i} style={{position: 'absolute', left: x0 + i * (AI_WW + gap), top: wy, opacity: e, transform: `translateY(${(1 - e) * 60}px)`}}>
							<AIWin w={AI_WW} name={a.name} prompt={a.prompt} g={fl > 0.5 ? a.to : SLOP_FROM[i]} flip={easeInOut(fl)} on={on} gray={1} />
						</div>
					);
				})}
				<Centered rows={AI_BOT} t={tf} w={1760} maxH={200} top={wy + AI_WH + 56} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- E · MOVE, once, alone in the stop: on screen from the frame she starts the M (14.13 – 15.93)
const MOVE_AT = onFrame(L.r1.move);
const SceneMove: React.FC<{t: number}> = ({t}) => {
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
				<Centered rows={[[{t: 'MOVE', at: MOVE_AT, fill: 'hot', wt: 900}]]} t={t} w={1840} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- F · make anything in your taste: a prompt and a result per beat (17.70 – 22.99)
const MAKE_AT = bt(229);
const MK_TOP: Row[] = [[{t: 'MAKE ANYTHING', at: MAKE_AT, st: 'expanded'}]];
const MK_BOT: Row[] = [
	[
		{t: 'IN', at: bt(230), st: 'expanded', wt: 220},
		{t: 'YOUR TASTE.', at: bt(230), st: 'expanded', fill: 'hot'},
	],
];
const PromptChip: React.FC<{text: string}> = ({text}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px 16px 18px', borderRadius: 999, background: 'rgba(14,14,16,0.86)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1.5px rgba(255,255,255,0.14)', fontFamily: TIGHT, fontSize: 30, fontWeight: 550, color: '#F4F4F6', whiteSpace: 'nowrap'}}>
		<Icon s={40} />
		{text}
		<span style={{marginLeft: 8, padding: '6px 14px', borderRadius: 999, background: HOTFILL, fontSize: 20, fontWeight: 650, color: '#fff'}}>Taste on</span>
	</div>
);
const SceneMake: React.FC<{t: number}> = ({t}) => {
	const i = Math.min(MAKE.length - 1, Math.floor((t - MAKE_AT) / BEAT + 1e-6));
	const k = t - (MAKE_AT + i * BEAT);
	const m = MAKE[i];
	const topH = stackH(MK_TOP, fitW(MK_TOP, 1760, 150));
	const botH = stackH(MK_BOT, fitW(MK_BOT, 1760, 150));
	const cw = 1000;
	const ch = (cw * SH) / SW;
	const total = topH + 70 + ch + 36 + botH;
	const y0 = (H - total) / 2;
	const cy = y0 + topH + 70;
	const s = 1.025 - 0.025 * easeOut(clamp01(k / 0.35));
	return (
		<Black spot={0.06}>
			<Centered rows={MK_TOP} t={t} w={1760} maxH={150} top={y0} />
			<div style={{position: 'absolute', left: (FW - cw) / 2, top: cy, width: cw, height: ch, transform: `scale(${s})`, borderRadius: 22, boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(255,255,255,0.12)'}}>
				<SiteAt g={m.n} w={cw} radius={22} />
				{/* the prompt sits on the card's top edge: prompt first, then what it made */}
				<div style={{position: 'absolute', left: 0, right: 0, top: -37, display: 'flex', justifyContent: 'center'}}>
					<PromptChip text={m.prompt} />
				</div>
			</div>
			<Centered rows={MK_BOT} t={t} w={1760} maxH={150} top={cy + ch + 36} />
		</Black>
	);
};

// ---------------------------------------------------------------- G · share your taste (22.99 – 26.52)
const SHARE_AT = bt(238);
const SH_TOP: Row[] = [[{t: 'SHARE YOUR TASTE.', at: SHARE_AT, st: 'normal'}]];
const CARD_PAL = ['#161C29', '#1C478C', '#706755', '#E9E4D8', '#3C403A'];
const SceneShare: React.FC<{t: number}> = ({t}) => {
	const c = spr(t, SHARE_AT + 0.1, 9, 0.78);
	const cw = 1060;
	const ch = (540 / 860) * cw;
	const topH = stackH(SH_TOP, fitW(SH_TOP, 1760, 170));
	const y0 = (H - (topH + 60 + ch)) / 2;
	return (
		<Black spot={0.06}>
			<Centered rows={SH_TOP} t={t} w={1760} maxH={170} top={y0} />
			{t >= SHARE_AT + 0.1 ? (
				<div style={{position: 'absolute', left: (FW - cw) / 2, top: y0 + topH + 60 + (1 - c) * 700, transform: `perspective(2000px) rotateX(${(1 - c) * 28}deg) scale(${0.96 + 0.04 * c + 0.015 * clamp01((t - SHARE_AT - 0.7) / 2.5)})`}}>
					<TasteCard w={cw} t={t} t0={SHARE_AT + 0.3} thumbs={['cominvi', 'era', 'kononenko', 'likova']} name={TASTE_NAME} pal={CARD_PAL} typeNote="Big serif, tight grotesk, mono details" stat="Top 2% cinematic" />
				</div>
			) : null}
		</Black>
	);
};

// ---------------------------------------------------------------- H · no more AI slop, over a wall of the best (26.52 – 31.20)
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
const WALL_AT = bt(244);
const SLOP_ROWS: Row[] = [[{t: 'NO MORE', at: WALL_AT}], [{t: 'AI SLOP.', at: bt(246), fill: 'hot', wt: 900}]];
const SceneWall: React.FC<{t: number}> = ({t}) => {
	const hot = pulse(t, bt(246), 0.05, 0.9);
	const sh = shake(t, bt(246), 12, 7);
	const reveal = easeOut(clamp01((t - WALL_AT) / 1.2));
	return (
		<Black spot={0}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${1.08 - 0.05 * reveal})`}}>
				<Wall t={t} bright={(0.12 + 0.12 * reveal) + 0.12 * hot} blur={2} />
			</div>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 62% 58% at 50% 50%, rgba(0,0,0,0.6), rgba(0,0,0,0.12) 82%)'}} />
			<div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x}px, ${sh.y}px) scale(${1 + 0.03 * clamp01((t - WALL_AT) / 4.6) + 0.015 * hot})`}}>
				<Centered rows={SLOP_ROWS} t={t} w={1700} maxH={900} />
			</div>
		</Black>
	);
};

// ---------------------------------------------------------------- I · lockup on the last MOVE she sings (31.20 – end)
const END_AT = onFrame(L.r4.move);
const SceneEnd: React.FC<{t: number}> = ({t}) => {
	const a = spr(t, END_AT, 12, 0.7);
	const tg = easeOut(clamp01((t - END_AT - 0.3) / 0.4));
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
export const SC = {ask: ASK_AT, learn: bt(208), ai: AI_AT, move: MOVE_AT, drop: CUE.drop, make: MAKE_AT, share: SHARE_AT, wall: WALL_AT, end: END_AT};
export const Film: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	if (t < SC.ask) return <SceneOpen t={t} />;
	if (t < SC.learn) return <SceneAsk t={t} />;
	if (t < SC.ai) return <SceneLearn t={t} />;
	if (t < SC.move) return <SceneAI t={t} />;
	if (t < SC.drop) return <SceneMove t={t} />;
	if (t < SC.make) return <SceneAI t={t} />;
	if (t < SC.share) return <SceneMake t={t} />;
	if (t < SC.wall) return <SceneShare t={t} />;
	if (t < SC.end) return <SceneWall t={t} />;
	return <SceneEnd t={t} />;
};
