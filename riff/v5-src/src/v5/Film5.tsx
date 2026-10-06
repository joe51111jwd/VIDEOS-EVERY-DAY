import React from 'react';
import {AbsoluteFill, Audio, Freeze, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp01, easeInOut, FPS, fr, lerp, SANS, step} from './tokens';
import {Website, SITE_H, SITE_W} from './designs/Website';
import {HomeScreen, MenuScreen, OrderScreen, PHONE_H, PHONE_W} from './designs/AppScreens';
import {BeanBag, BizCards, MenuBoard, Poster, POSTER_H, POSTER_W, Sticker, Story, STORY_H, STORY_W} from './designs/Print';
import {CANVAS_CENTER, MenuBar, RiffIcon, RiffWindow, Wallpaper, WIN} from './mac/Mac';
import {ICard, IGlobe, IList, IPhone, IPoster, ISticker, IStory, ITag} from './mac/icons';
import cues from './cues.json';
import envJson from './env5.json';
import sfxList from './sfx.json';

// ------------------------------------------------------------------ voice cue sheet (start/end seconds per line)
type Line = {id: string; who: 'Maya' | 'Riff'; text: string; a: number; b: number; words?: number[]};
export const LINES = cues as Line[];
const L = (id: string) => LINES.find((l) => l.id === id)!;
export const V5_DURATION = 38.5;

const env = envJson as {u: number[]; r: number[]};
const lvl = (k: 'u' | 'r', frame: number) => {
	const a = env[k];
	if (!a || !a.length) return 0;
	const i = Math.max(1, Math.min(a.length - 2, Math.round(frame)));
	return (a[i - 1] + 2 * a[i] + a[i + 1]) / 4;
};

// ------------------------------------------------------------------ when things happen
const T = {
	site: {
		image: -0.15, // already developing on frame 0, so the very first frame is a design being made
		nav: 0.1,
		eyebrow: 0.4,
		head: 0.5,
		body: 0.9,
		ctas: 1.05,
		card: 1.25,
		pill: 1.4,
		warm: L('warm').a + 0.3,
		big: L('big').a + 0.4,
		menu: L('menu').a + 0.45,
	},
	pullback: [L('app?').a + 0.25, L('app?').a + 1.65] as [number, number],
	title: [L('app?').b + 0.15, L('yes').a - 0.25] as [number, number],
	home: L('onit').a + 0.15,
	menuS: L('onit').a + 0.55,
	order: L('onit').a + 0.95,
	usual: L('sure').a + 0.35,
	poster: L('bold').a + 0.3,
	cup: L('cup').a + 0.55,
	story: L('yes2').a + 0.15,
	extras: L('extras').a + 0.3,
	end: L('love').b + 0.6,
};

// ------------------------------------------------------------------ canvas layout (canvas px). Final reveal is one dense board.
//   row 1: three phones | poster | story
//   row 2: website | menu board + sticker | bean label + business cards
// (phones sit above the website, far enough that the site never peeks into the app shots)
const R2 = 1060;
const LAY = {
	home: {x: 0, y: 24},
	menu: {x: PHONE_W + 60, y: 24},
	order: {x: (PHONE_W + 60) * 2, y: 24},
	poster: {x: 1379, y: 25},
	story: {x: 2059, y: 130},
	site: {x: 0, y: R2},
	board: {x: 1520, y: R2},
	sticker: {x: 1615, y: R2 + 666},
	bag: {x: 2080, y: R2},
	cards: {x: 2020, y: R2 + 520},
};
const SITE_C = {x: LAY.site.x + SITE_W / 2, y: LAY.site.y + SITE_H / 2};
const PH = {x: (PHONE_W * 3 + 120) / 2, y: 450}; // phones centre
const PR = {x: (LAY.poster.x + LAY.story.x + STORY_W) / 2, y: 450}; // print centre
const Z = {site: 0.64, phones: 0.76, print: 0.8, all: 0.39};
// whole board (x 0..2440, y -36..1960), lifted so it clears the voice pill at the bottom of the frame
const ALL = {x: 1220, y: 962 + 100};

// canvas camera: x/y and zoom keyed separately so big moves can dip the zoom without stalling the pan
type XY = {t: number; x: number; y: number};
type ZK = {t: number; z: number};
const CANVAS_XY: XY[] = [
	{t: 0, ...SITE_C},
	{t: T.home - 0.75, ...SITE_C},
	{t: T.home + 0.45, ...PH},
	{t: T.poster - 0.95, ...PH},
	{t: T.poster + 0.35, ...PR},
	{t: T.extras - 0.2, ...PR},
	{t: T.extras + 2.3, ...ALL},
];
const CANVAS_Z: ZK[] = [
	{t: 0, z: Z.site},
	{t: T.home - 0.75, z: Z.site},
	{t: T.home - 0.15, z: 0.56},
	{t: T.home + 0.45, z: Z.phones},
	{t: T.poster - 0.95, z: Z.phones},
	{t: T.poster - 0.3, z: 0.6},
	{t: T.poster + 0.35, z: Z.print},
	{t: T.extras - 0.2, z: Z.print},
	{t: T.extras + 2.3, z: Z.all + 0.01},
	{t: V5_DURATION, z: Z.all},
];

// frame camera: zoom s around desktop point (x, y)
type FC = {t: number; s: number; x: number; y: number};
const ART_CX = WIN.x + CANVAS_CENTER.x;
const ART_CY = WIN.y + CANVAS_CENTER.y;
/** desktop position of canvas point (x, y) while the canvas camera holds at centre c / zoom z */
const desk = (x: number, y: number, c: {x: number; y: number}, z: number) => ({x: ART_CX + (x - c.x) * z, y: ART_CY + (y - c.y) * z});
const HOME_FOCUS = desk(LAY.home.x + PHONE_W / 2, LAY.home.y + 360, PH, Z.phones);
// whole poster on screen, top edge just inside the frame, bottom edge just above the voice pill
const POSTER_FOCUS = desk(LAY.poster.x + POSTER_W / 2, LAY.poster.y + 484, PR, Z.print);
const FRAME_KEYS: FC[] = [
	{t: 0, s: 1.82, x: ART_CX, y: ART_CY},
	{t: T.pullback[0], s: 1.9, x: ART_CX, y: ART_CY},
	{t: T.pullback[1], s: 1.0, x: 960, y: 540},
	{t: T.home - 0.2, s: 1.0, x: 960, y: 540},
	{t: T.order + 1.0, s: 1.1, x: ART_CX, y: ART_CY + 10},
	{t: T.usual - 0.95, s: 1.1, x: ART_CX, y: ART_CY + 10},
	{t: T.usual - 0.05, s: 1.95, ...HOME_FOCUS},
	{t: L('perfect').b + 0.1, s: 1.98, ...HOME_FOCUS},
	{t: L('perfect').b + 1.05, s: 1.0, x: 960, y: 540},
	{t: T.poster + 0.35, s: 1.0, x: 960, y: 540},
	{t: Math.min(T.poster + 1.6, T.cup - 0.75), s: 1.14, x: ART_CX, y: ART_CY},
	{t: T.cup - 0.6, s: 1.14, x: ART_CX, y: ART_CY},
	{t: T.cup + 0.1, s: 1.36, ...POSTER_FOCUS},
	{t: T.story - 0.5, s: 1.37, ...POSTER_FOCUS},
	{t: T.story + 0.4, s: 1.12, x: ART_CX, y: ART_CY},
	{t: T.extras, s: 1.0, x: 960, y: 540},
	{t: V5_DURATION, s: 1.04, x: 960, y: 560},
];

const mono = <K extends {t: number}>(keys: K[]) => {
	const o: K[] = [];
	for (const k of keys) o.push(o.length && k.t <= o[o.length - 1].t + 0.04 ? {...k, t: o[o.length - 1].t + 0.04} : k);
	return o;
};
const keyed = <K extends {t: number}>(rawKeys: K[], t: number, fields: (keyof K)[]) => {
	const keys = mono(rawKeys);
	const out: Record<string, number> = {};
	for (const f of fields) {
		out[f as string] = interpolate(
			t,
			keys.map((k) => k.t),
			keys.map((k) => k[f] as unknown as number),
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut},
		);
	}
	return out;
};

const Artboard: React.FC<{
	x: number;
	y: number;
	w: number;
	h: number;
	k?: number;
	label: string;
	at?: number;
	radius?: number;
	shadow?: boolean;
	children: React.ReactNode;
}> = ({x, y, w, h, k = 1, label, at, radius = 0, shadow = true, children}) => {
	const t = useCurrentFrame() / FPS;
	if (at !== undefined && t < at) return null;
	const p = at === undefined ? 1 : step(t, at, 0.4);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w * k, height: h * k}}>
			<div style={{position: 'absolute', left: 2, top: -36, fontFamily: SANS, fontSize: 20, fontWeight: 500, color: '#8E8E93', whiteSpace: 'nowrap', opacity: p}}>{label}</div>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: radius * k,
					overflow: 'hidden',
					boxShadow: shadow ? `0 2px 6px rgba(0,0,0,${0.06 * p}), 0 24px 60px rgba(0,0,0,${0.13 * p})` : 'none',
				}}
			>
				<div style={{width: w, height: h, transform: k === 1 ? undefined : `scale(${k})`, transformOrigin: '0 0'}}>{children}</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ the voice HUD: Riff's floating transcript pill (also the captions)
const HUD = {font: 42, h: 84, av: 52, padL: 16, gap: 20, padR: 36, bottom: 44};
let mctx: CanvasRenderingContext2D | null = null;
const textW = (s: string) => {
	try {
		if (!mctx) mctx = document.createElement('canvas').getContext('2d');
		if (mctx) {
			mctx.font = `560 ${HUD.font}px ${SANS}`;
			(mctx as unknown as {letterSpacing: string}).letterSpacing = `${-0.015 * HUD.font}px`;
			return mctx.measureText(s).width;
		}
	} catch {
		// fall through
	}
	return s.length * HUD.font * 0.5;
};
const pillW = (l: Line) => HUD.padL + HUD.av + HUD.gap + textW(l.text) + HUD.padR;

const Speaker: React.FC<{who: Line['who']; u: number; r: number}> = ({who, u, r}) =>
	who === 'Riff' ? (
		<RiffIcon size={HUD.av} level={Math.max(0.12, r)} glow={clamp01(r * 2.2)} />
	) : (
		<div
			style={{
				width: HUD.av,
				height: HUD.av,
				borderRadius: HUD.av / 2,
				background: 'linear-gradient(140deg, #E7A47E, #B4532A)',
				color: '#fff',
				fontFamily: SANS,
				fontSize: 18,
				fontWeight: 700,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: `0 0 0 ${2 + 7 * clamp01(u * 1.6)}px rgba(240,170,130,${0.18 + 0.3 * clamp01(u * 1.6)})`,
			}}
		>
			MC
		</div>
	);

const Words: React.FC<{l: Line; t: number}> = ({l, t}) => {
	const words = l.text.split(' ');
	const speak = Math.max(0.3, (l.b - l.a) * 0.92);
	return (
		<>
			{words.map((wd, k) => {
				const wt = l.words?.[k] ?? l.a + (speak * k) / words.length;
				const o = interpolate(t, [wt - 0.04, wt + 0.12], [0.32, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<span key={k} style={{opacity: o, whiteSpace: 'pre'}}>
						{wd}
						{k < words.length - 1 ? ' ' : ''}
					</span>
				);
			})}
		</>
	);
};

const RiffHUD: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const PRE = 0.16;
	const POST = 0.55;
	const FADE = 0.2;
	let vis = 0;
	for (const l of LINES) vis = Math.max(vis, Math.min(clamp01((t - (l.a - PRE - FADE)) / FADE), 1 - clamp01((t - (l.b + POST)) / FADE)));
	if (vis <= 0.001) return null;
	let i = -1;
	LINES.forEach((l, k) => {
		if (t >= l.a - PRE - FADE) i = k;
	});
	if (i < 0) return null;
	const c = LINES[i];
	const prev = i > 0 ? LINES[i - 1] : undefined;
	const s0 = c.a - PRE - FADE; // the moment the pill starts switching to this line
	const linked = !!prev && prev.b + POST + FADE > s0; // pill stayed up between the two lines
	const m = easeInOut(clamp01((t - s0) / 0.3));
	const w = linked ? lerp(pillW(prev!), pillW(c), m) : pillW(c);
	const oldTxt = linked ? 1 - clamp01((t - s0) / 0.14) : 0;
	const txt = step(t, s0 + (linked ? 0.1 : 0.08), 0.32);
	const swap = linked && prev!.who !== c.who ? m : 1;
	const u = lvl('u', frame);
	const r = lvl('r', frame);
	const entering = linked ? 1 : vis;
	const textBox = (l: Line, o: number, dy: number): React.ReactNode => (
		<div
			style={{
				position: 'absolute',
				left: HUD.padL + HUD.av + HUD.gap,
				top: 0,
				height: HUD.h,
				display: 'flex',
				alignItems: 'center',
				whiteSpace: 'nowrap',
				fontFamily: SANS,
				fontWeight: 560,
				fontSize: HUD.font,
				letterSpacing: '-0.015em',
				color: l.who === 'Riff' ? '#FFD9BF' : '#F5F5F7',
				opacity: o,
				transform: `translateY(${dy}px)`,
				filter: o < 1 ? `blur(${(1 - o) * 5}px)` : undefined,
			}}
		>
			<Words l={l} t={t} />
		</div>
	);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: HUD.bottom, display: 'flex', justifyContent: 'center', zIndex: 80, pointerEvents: 'none'}}>
			<div
				style={{
					position: 'relative',
					width: w,
					height: HUD.h,
					borderRadius: HUD.h / 2,
					background: 'linear-gradient(180deg, rgba(44,40,38,0.84) 0%, rgba(16,14,13,0.88) 100%)',
					backdropFilter: 'blur(30px) saturate(160%)',
					boxShadow: '0 22px 60px rgba(0,0,0,0.34), 0 4px 14px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.16)',
					opacity: vis,
					transform: `translateY(${(1 - entering) * 18}px) scale(${0.94 + 0.06 * entering})`,
					overflow: 'hidden',
				}}
			>
				<div style={{position: 'absolute', left: HUD.padL, top: (HUD.h - HUD.av) / 2, width: HUD.av, height: HUD.av}}>
					{swap < 1 ? (
						<div style={{position: 'absolute', inset: 0, opacity: 1 - swap, transform: `scale(${1 - 0.25 * swap})`}}>
							<Speaker who={prev!.who} u={u} r={r} />
						</div>
					) : null}
					<div style={{position: 'absolute', inset: 0, opacity: swap, transform: `scale(${0.75 + 0.25 * swap})`}}>
						<Speaker who={c.who} u={u} r={r} />
					</div>
				</div>
				{oldTxt > 0 ? textBox(prev!, oldTxt, -(1 - oldTxt) * 8) : null}
				{textBox(c, txt, (1 - txt) * 10)}
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ sound design
// ElevenLabs SFX land in public/v5/sfx/<name>_<1|2>.wav (listed in sfx.json); until then the older synthesized ones stand in.
const HAVE = new Set(sfxList as string[]);
const FALLBACK: Record<string, string | null> = {whoosh_soft: 'whoosh.wav', tap_glass: 'tick.wav', pop_soft: 'pop.wav', shimmer: 'chime.wav', boom_logo: null, riser: null, paper: 'tick.wav', cup_down: 'pop.wav'};
type Sfx = {t: number; n: keyof typeof FALLBACK; v: number};
const SFX: Sfx[] = [
	{t: 0.0, n: 'shimmer', v: 0.25},
	{t: T.site.nav, n: 'tap_glass', v: 0.35},
	{t: T.site.head, n: 'tap_glass', v: 0.4},
	{t: T.site.card, n: 'pop_soft', v: 0.3},
	{t: T.site.warm, n: 'shimmer', v: 0.35},
	{t: T.site.big, n: 'pop_soft', v: 0.4},
	{t: T.site.menu, n: 'whoosh_soft', v: 0.35},
	{t: T.pullback[0], n: 'whoosh_soft', v: 0.55},
	{t: T.title[0] - 1.6, n: 'riser', v: 0.35},
	{t: T.title[0], n: 'boom_logo', v: 0.6},
	{t: T.home - 0.75, n: 'whoosh_soft', v: 0.5},
	{t: T.home, n: 'pop_soft', v: 0.35},
	{t: T.menuS, n: 'pop_soft', v: 0.32},
	{t: T.order, n: 'pop_soft', v: 0.3},
	{t: T.usual - 0.95, n: 'whoosh_soft', v: 0.45},
	{t: T.usual + 0.16, n: 'pop_soft', v: 0.45},
	{t: L('perfect').b + 0.1, n: 'whoosh_soft', v: 0.4},
	{t: T.poster - 0.95, n: 'whoosh_soft', v: 0.5},
	{t: T.poster, n: 'paper', v: 0.45},
	{t: T.poster + 0.6, n: 'pop_soft', v: 0.4},
	{t: T.cup - 0.6, n: 'whoosh_soft', v: 0.35},
	{t: T.cup, n: 'cup_down', v: 0.7},
	{t: T.story, n: 'paper', v: 0.4},
	{t: T.extras - 0.2, n: 'whoosh_soft', v: 0.5},
	{t: T.extras + 0.1, n: 'paper', v: 0.35},
	{t: T.extras + 0.35, n: 'pop_soft', v: 0.3},
	{t: T.extras + 0.6, n: 'paper', v: 0.3},
	{t: T.extras + 0.85, n: 'pop_soft', v: 0.32},
	{t: T.end + 0.45, n: 'boom_logo', v: 0.55},
	{t: T.end + 1.5, n: 'shimmer', v: 0.3},
];
const SfxLayer: React.FC = () => {
	const used: Record<string, number> = {};
	return (
		<>
			{SFX.map((e, i) => {
				used[e.n] = (used[e.n] ?? 0) + 1;
				const pick = `${e.n}_${used[e.n] % 2 === 1 ? 1 : 2}`;
				const src = HAVE.has(pick) ? `v5/sfx/${pick}.wav` : HAVE.has(`${e.n}_1`) ? `v5/sfx/${e.n}_1.wav` : FALLBACK[e.n];
				if (!src) return null;
				return (
					<Sequence key={i} from={Math.max(0, fr(e.t))} durationInFrames={fr(3.5)}>
						<Audio src={staticFile(src)} volume={HAVE.size ? e.v : e.v * 0.7} />
					</Sequence>
				);
			})}
		</>
	);
};

// ------------------------------------------------------------------ title + end cards
const TitleCard: React.FC<{a: number; b: number}> = ({a, b}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a - 0.01 || t > b + 0.01) return null;
	const inP = step(t, a, 0.7);
	const icon = step(t, a + 0.05, 0.8);
	const word = step(t, a + 0.25, 0.9);
	const out = step(t, b - 0.25, 0.25, easeInOut);
	return (
		<AbsoluteFill style={{background: '#000', opacity: Math.min(clamp01((t - a) / 0.12), 1), zIndex: 90}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 44}}>
					<div style={{transform: `scale(${0.82 + 0.18 * icon})`, opacity: icon, filter: `blur(${(1 - icon) * 10}px)`}}>
						<RiffIcon size={176} level={0.55} glow={0.35 * inP} />
					</div>
					<div
						style={{
							fontFamily: SANS,
							fontWeight: 620,
							fontSize: 196,
							letterSpacing: '-0.055em',
							color: '#F5F5F7',
							opacity: word,
							transform: `translateX(${(1 - word) * -24}px)`,
							filter: `blur(${(1 - word) * 8}px)`,
						}}
					>
						Riff
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const EndCard: React.FC<{a: number}> = ({a}) => {
	const t = useCurrentFrame() / FPS;
	if (t < a) return null;
	const bg = step(t, a, 0.9, easeInOut);
	const icon = step(t, a + 0.5, 0.9);
	const word = step(t, a + 0.75, 0.9);
	const line = step(t, a + 1.55, 0.9);
	const foot = step(t, a + 2.3, 0.9);
	return (
		<AbsoluteFill style={{zIndex: 95}}>
			<AbsoluteFill style={{background: '#000', opacity: bg}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: -40}}>
					<div style={{transform: `scale(${0.85 + 0.15 * icon})`, opacity: icon}}>
						<RiffIcon size={132} level={0.45} glow={0.3 * icon} />
					</div>
					<div style={{fontFamily: SANS, fontWeight: 620, fontSize: 150, letterSpacing: '-0.055em', color: '#F5F5F7', opacity: word}}>Riff</div>
				</div>
				<div style={{marginTop: 36, fontFamily: SANS, fontWeight: 560, fontSize: 60, letterSpacing: '-0.03em', color: '#F5F5F7', opacity: line, transform: `translateY(${(1 - line) * 14}px)`}}>
					Just talk.
				</div>
				<div style={{position: 'absolute', bottom: 92, fontFamily: SANS, fontWeight: 500, fontSize: 26, color: '#8E8E93', opacity: foot, letterSpacing: '-0.005em'}}>Coming soon for Mac</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ the film
const cams = (t: number) => {
	const cxy = keyed(CANVAS_XY, t, ['x', 'y']);
	const cz = keyed(CANVAS_Z, t, ['z']);
	return {cc: {x: cxy.x, y: cxy.y, z: cz.z}, fc: keyed(FRAME_KEYS, t, ['s', 'x', 'y'])};
};
/** how far (screen px) the picture moves between this frame and the previous one, sampled at a few screen points */
export const motion = (frame: number) => {
	const a = cams(frame / FPS);
	const b = cams((frame - 1) / FPS);
	let mx = 0;
	for (const [sx, sy] of [[960, 540], [260, 160], [1660, 160], [260, 920], [1660, 920]]) {
		// screen -> canvas at frame a, then canvas -> screen at frame b
		const dx = (sx - 960) / a.fc.s + a.fc.x;
		const dy = (sy - 540) / a.fc.s + a.fc.y;
		const cx = (dx - ART_CX) / a.cc.z + a.cc.x;
		const cy = (dy - ART_CY) / a.cc.z + a.cc.y;
		const bx = (ART_CX + (cx - b.cc.x) * b.cc.z - b.fc.x) * b.fc.s + 960;
		const by = (ART_CY + (cy - b.cc.y) * b.cc.z - b.fc.y) * b.fc.s + 540;
		mx = Math.max(mx, Math.hypot(bx - sx, by - sy));
	}
	return mx;
};
/** film-camera motion blur, centred on the current frame (shutter as a fraction of a frame) */
const MBlur: React.FC<{samples: number; shutter?: number; children: React.ReactNode}> = ({samples, shutter = 0.5, children}) => {
	const f = useCurrentFrame();
	if (samples <= 1) return <>{children}</>;
	return (
		<AbsoluteFill style={{isolation: 'isolate'}}>
			{new Array(samples).fill(0).map((_, i) => (
				<AbsoluteFill key={i} style={{mixBlendMode: 'plus-lighter', filter: `opacity(${1 / samples})`}}>
					<Freeze frame={f + (i / (samples - 1) - 0.5) * shutter}>{children}</Freeze>
				</AbsoluteFill>
			))}
		</AbsoluteFill>
	);
};

export const RiffFilm5: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const mv = motion(frame);
	// blur only where the camera actually moves; a sample per ~5 px of travel within the open shutter
	const samples = mv < 5 ? 1 : Math.min(12, Math.max(3, Math.round((mv * 0.5) / 4)));
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<MBlur samples={samples}>
				<Scene />
			</MBlur>
			<TitleCard a={T.title[0]} b={T.title[1]} />
			<EndCard a={T.end} />
			<RiffHUD />
			<Audio src={staticFile('v5/vo.wav')} />
			<Audio src={staticFile('v5/music.wav')} volume={(f) => 0.55 * (1 - 0.4 * Math.min(1, lvl('u', f) + lvl('r', f)))} />
			<SfxLayer />
		</AbsoluteFill>
	);
};

const Scene: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const {cc, fc} = cams(t);

	const items = [
		{label: 'Website', icon: IGlobe, at: T.site.nav},
		{label: 'iOS app', icon: IPhone, at: T.home},
		{label: 'Grand opening poster', icon: IPoster, at: T.poster},
		{label: 'Instagram story', icon: IStory, at: T.story},
		{label: 'Menu board', icon: IList, at: T.extras + 0.1},
		{label: 'Business cards', icon: ICard, at: T.extras + 0.35},
		{label: 'Bean label', icon: ITag, at: T.extras + 0.6},
		{label: 'Stickers', icon: ISticker, at: T.extras + 0.85},
	];
	const active = t >= T.extras ? 4 : t >= T.story ? 3 : t >= T.poster ? 2 : t >= T.home ? 1 : 0;
	const u = lvl('u', frame);
	const r = lvl('r', frame);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					transform: `translate(${960 - fc.x * fc.s}px, ${540 - fc.y * fc.s}px) scale(${fc.s})`,
					transformOrigin: '0 0',
				}}
			>
				<Wallpaper />
				<MenuBar />
				<RiffWindow items={items} active={active} zoom={cc.z} user={u} riff={r}>
					<div
						style={{
							position: 'absolute',
							left: CANVAS_CENTER.x,
							top: CANVAS_CENTER.y,
							transform: `scale(${cc.z}) translate(${-cc.x}px, ${-cc.y}px)`,
							transformOrigin: '0 0',
						}}
					>
						<Artboard {...LAY.site} w={SITE_W} h={SITE_H} label="Website — Desktop">
							<Website tl={T.site} />
						</Artboard>
						<Artboard {...LAY.home} w={PHONE_W} h={PHONE_H} label="App — Home" at={T.home - 0.05} radius={54}>
							<HomeScreen tl={{screen: T.home, head: T.home + 0.12, popular: T.home + 0.3, rewards: T.home + 0.45, tab: T.home + 0.35, usual: T.usual}} />
						</Artboard>
						<Artboard {...LAY.menu} w={PHONE_W} h={PHONE_H} label="App — Menu" at={T.menuS - 0.05} radius={54}>
							<MenuScreen tl={{screen: T.menuS, head: T.menuS + 0.12, chips: T.menuS + 0.25, rows: T.menuS + 0.35, cart: T.menuS + 0.85}} />
						</Artboard>
						<Artboard {...LAY.order} w={PHONE_W} h={PHONE_H} label="App — Order" at={T.order - 0.05} radius={54}>
							<OrderScreen tl={{screen: T.order, head: T.order + 0.12, ring: T.order + 0.3, steps: T.order + 0.55, map: T.order + 0.75}} />
						</Artboard>
						<Artboard {...LAY.poster} w={POSTER_W} h={POSTER_H} label="Poster — A2" at={T.poster - 0.05}>
							<Poster tl={{bg: T.poster, top: T.poster + 0.25, moon: T.poster + 0.35, type: T.poster + 0.6, info: T.poster + 1.0, cup: T.cup}} />
						</Artboard>
						<Artboard {...LAY.story} w={STORY_W} h={STORY_H} label="Instagram story" at={T.story - 0.05} radius={18}>
							<Story at={T.story} />
						</Artboard>
						<Artboard {...LAY.board} w={420} h={594} label="Menu board" at={T.extras + 0.05}>
							<MenuBoard at={T.extras + 0.1} />
						</Artboard>
						<Artboard {...LAY.cards} w={420} h={340} label="Business cards" at={T.extras + 0.3} shadow={false}>
							<BizCards at={T.extras + 0.35} />
						</Artboard>
						<Artboard {...LAY.bag} w={300} h={420} label="Bean label" at={T.extras + 0.55} shadow={false}>
							<BeanBag at={T.extras + 0.6} />
						</Artboard>
						<Artboard {...LAY.sticker} w={230} h={230} label="Sticker" at={T.extras + 0.8} shadow={false}>
							<Sticker at={T.extras + 0.85} />
						</Artboard>
					</div>
				</RiffWindow>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
