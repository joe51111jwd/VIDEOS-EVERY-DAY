import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Wallpaper, MenuBar} from '../mac/Desktop';
import {Cursor, cursorAt} from '../mac/Cursor';
import {Timeline, TL_Y, restoreBtn, stripX} from '../rr/Timeline';
import {AppIcon, Wordmark} from '../rr/Brand';
import {Big} from '../rr/Type';
import {Placed, momentPlaced} from '../world/Day';
import {HERO, HERO_FOCUS, MOMENTS} from '../world/moments';
import {HERO_TABS, PG_SCROLL} from '../world/data';
import {C, SANS, clamp01, easeInOut, easeOut, pulse, spr, step, lerp} from '../lib/tokens';
import {DETAIL, END, MONT, RW} from './plan';
import {SkyClock, Toast, ghostFilter, rewindXf} from './Hook';
import {GCmd, GCtrl} from '../mac/icons';

const NOW = 'Thu Oct 9  4:17 PM';

/** camera: frame a desktop rect (x, y, w) at 16:9 */
const cam = (r: {x: number; y: number; w: number}) => {
	const s = 1920 / r.w;
	return `scale(${s}) translate(${-r.x}px, ${-r.y}px)`;
};
const lerpR = (a: {x: number; y: number; w: number}, b: {x: number; y: number; w: number}, u: number) => ({x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u)});

const Desk: React.FC<{ctx: {tabsShown?: number; tabPop?: (i: number) => number; scroll?: number; termShown?: number}; xf?: string}> = ({ctx, xf}) => (
	<AbsoluteFill style={{transform: xf, transformOrigin: '0 0'}}>
		<Wallpaper />
		{HERO.map((spec) => (
			<Placed key={spec.id} p={{spec, o: 1, s: 1, dy: 0, focused: spec.id === HERO_FOCUS}} ctx={ctx} />
		))}
		<MenuBar app="Safari" clock={NOW} />
	</AbsoluteFill>
);

// ---------------------------------------------------------------- act 2: the restore, up close
export const DetailShot: React.FC<{t: number}> = ({t}) => {
	const tabStep = 0.055;
	const tabPop = (i: number) => easeOut(clamp01((t - (DETAIL.tabs + 0.06 + i * tabStep)) / 0.12));
	const tabsShown = t < DETAIL.tabs ? 1 : HERO_TABS.length;
	const sc = t < DETAIL.scroll ? 0 : PG_SCROLL * easeInOut(clamp01((t - DETAIL.scroll - 0.05) / (DETAIL.scrollLand - DETAIL.scroll - 0.05)));
	const termShown = t < DETAIL.term ? 1 : Math.min(12, 1 + Math.floor((t - DETAIL.term) / 0.055));
	const ctx = {tabsShown, tabPop: t < DETAIL.tabs ? undefined : tabPop, scroll: sc, termShown};
	let xf: string | undefined;
	if (t >= DETAIL.tabs && t < DETAIL.scroll) {
		const u = (t - DETAIL.tabs) / (DETAIL.scroll - DETAIL.tabs);
		xf = cam(lerpR({x: 22, y: 44, w: 560}, {x: 590, y: 44, w: 560}, easeInOut(u)));
	} else if (t >= DETAIL.scroll && t < DETAIL.term) {
		const u = (t - DETAIL.scroll) / (DETAIL.term - DETAIL.scroll);
		xf = cam(lerpR({x: 150, y: 150, w: 900}, {x: 170, y: 160, w: 860}, u));
	} else if (t >= DETAIL.term && t < DETAIL.wide) {
		const u = (t - DETAIL.term) / (DETAIL.wide - DETAIL.term);
		xf = cam(lerpR({x: 28, y: 592, w: 860}, {x: 40, y: 600, w: 830}, u));
	} else if (t >= DETAIL.wide) {
		const u = easeInOut(clamp01((t - DETAIL.wide) / 0.5));
		xf = cam(lerpR({x: 40, y: 600, w: 830}, {x: 0, y: 0, w: 1920}, u));
	}
	const land = pulse(t, DETAIL.scrollLand, 0.05, 0.6);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Desk ctx={ctx} xf={xf} />
			{land > 0.01 && t < DETAIL.term ? <AbsoluteFill style={{background: `radial-gradient(40% 30% at 50% 45%, rgba(255,214,10,${0.12 * land}), rgba(0,0,0,0))`}} /> : null}
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- act 3: any moment
const DAY0 = 0; // Sep 30 00:00
const SPAN = 9 * 24 * 60 + 16 * 60 + 30; // → Oct 9 4:30 PM
const wk = (day: number, h: number, m: number) => (day * 24 * 60 + h * 60 + m - DAY0) / SPAN;
// montage moments, newest → oldest: Yesterday 6:40 PM, Mon 4:15 PM, Sun 11:48 PM, last Thu 10:30 AM, Sep 30 9:05 AM
const MPOS = [wk(8, 18, 40), wk(6, 16, 15), wk(5, 23, 48), wk(2, 10, 30), wk(0, 9, 5)];
const MORDER = ['m-yday', 'm-mon', 'm-sun', 'm-thu', 'm-tue'];
const NOWP = wk(9, 16, 17);
const WEEK_THUMBS = ['m-tue', 'm-tue', 'm-thu', 'm-thu', 'm-sun', 'm-sun', 'm-mon', 'm-yday', 'm-yday', 'h-945', 'hero'].map((s) => ({src: s}));
const WEEK_TICKS = [
	[0, 'Sep 30'],
	[1, 'Oct 1'],
	[2, 'Thu'],
	[3, 'Fri'],
	[4, 'Sat'],
	[5, 'Sun'],
	[6, 'Mon'],
	[7, 'Tue'],
	[8, 'Wed'],
	[9, 'Today'],
].map(([d, t]) => ({p: wk(d as number, 12, 0), t: t as string}));
const SKY_DAY = ['YESTERDAY', 'MONDAY', 'SUNDAY', 'LAST THURSDAY', 'SEPTEMBER 30'];

export const MontageShot: React.FC<{t: number}> = ({t}) => {
	const open = step(t, MONT.open, 0.3, easeOut);
	const close = t >= MONT.restore ? clamp01(spr(t, MONT.restore, 13, 0.72)) : 0;
	const rm = open * (1 - close);
	const g = t < MONT.restore ? open : 1 - clamp01((t - MONT.restore) / 0.12);
	let k = -1;
	MONT.steps.forEach((s, i) => {
		if (t >= s) k = i;
	});
	// playhead: glides between moments, landing on each beat
	const pAt = (i: number) => (i < 0 ? NOWP : MPOS[i]);
	const since = k >= 0 ? t - MONT.steps[k] : 0;
	const head = k < 0 ? NOWP : lerp(pAt(k - 1), pAt(k), easeOut(clamp01(since / 0.16)));
	const mo = k < 0 ? null : MOMENTS.find((m) => m.id === MORDER[k])!;
	const placed = mo ? momentPlaced(mo.wins, mo.focus) : HERO.map((spec) => ({spec, o: 1, s: 1, dy: 0, focused: spec.id === HERO_FOCUS}));
	// each new moment arrives with a short slide from the left (the past is to the left)
	const slide = k >= 0 ? (1 - easeOut(clamp01(since / 0.14))) * -70 : 0;
	const tl = t < MONT.restore ? open : 1 - step(t, MONT.restore + 0.04, 0.28, easeInOut);
	const knob = {x: stripX(head), y: TL_Y + 22};
	const lastStep = MONT.steps[MONT.steps.length - 1];
	const cur = t < MONT.steps[0] ? cursorAt(t, [{t: MONT.open, x: 1100, y: 600}, {t: MONT.steps[0] - 0.02, x: stripX(NOWP), y: TL_Y + 22}]) : t < lastStep + 0.2 ? knob : cursorAt(t, [{t: lastStep + 0.2, x: knob.x, y: knob.y}, {t: MONT.restore - 0.1, x: restoreBtn.x + 70, y: restoreBtn.y + 26}]);
	const press = pulse(t, MONT.restore - 0.09, 0.05, 0.16);
	const flash = pulse(t, MONT.restore, 0.03, 0.35);
	const skyO = t < MONT.restore ? step(t, MONT.open + 0.05, 0.25) : 1 - step(t, MONT.restore, 0.14);
	const toast = step(t, MONT.restore + 0.12, 0.3) * (1 - step(t, MONT.end - 0.3, 0.25, easeInOut));
	const label = mo ? mo.time.split(' ')[0] : '4:17';
	const suffix = mo ? mo.time.split(' ')[1] : 'PM';
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Wallpaper
				behind={
					skyO > 0.01 ? (
						<div style={{position: 'absolute', left: 0, top: 0, width: 1920, opacity: skyO}}>
							<div style={{position: 'absolute', left: 0, right: 0, top: 58, display: 'flex', justifyContent: 'center'}}>
								<Big text={k < 0 ? 'TODAY' : SKY_DAY[k]} size={44} weight={300} stretch="expanded" tracking={0.24} />
							</div>
							<div style={{position: 'absolute', left: 0, right: 0, top: 118, display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
								<Big text={label} size={300} weight={850} stretch="expanded" tracking={-0.02} />
								<Big text={suffix} size={100} weight={250} stretch="expanded" tracking={0.02} style={{marginLeft: 20, marginTop: 10}} />
							</div>
						</div>
					) : undefined
				}
			/>
			<AbsoluteFill style={{transform: rewindXf(rm), transformOrigin: '960px 540px', filter: ghostFilter(g), opacity: 1 - 0.18 * g}}>
				<AbsoluteFill style={{transform: `translateX(${slide}px)`}}>
					{placed.map((p) => (
						<Placed key={p.spec.id} p={p} />
					))}
				</AbsoluteFill>
			</AbsoluteFill>
			<MenuBar app="Finder" menus={['File', 'Edit', 'View', 'Go', 'Window', 'Help']} clock={NOW} rewindOn={rm} />
			<Timeline
				show={tl}
				thumbs={WEEK_THUMBS}
				ticks={WEEK_TICKS}
				head={head}
				time={mo ? mo.time : '4:17 PM'}
				day={mo ? mo.day : 'Today'}
				press={press}
				hover={clamp01((t - (MONT.restore - 0.25)) / 0.1) * (t < MONT.restore + 0.3 ? 1 : 0)}
			/>
			<Toast p={toast} title="Restored to Sep 30, 9:05 AM" sub="2 windows · 2 tabs" />
			{flash > 0.01 ? <AbsoluteFill style={{background: `rgba(255,236,210,${0.22 * flash})`}} /> : null}
			<Cursor x={cur.x} y={cur.y} press={Math.max(press, t >= MONT.steps[0] && t < lastStep + 0.2 ? 0.6 : 0)} opacity={t < MONT.restore + 0.4 ? 1 : 1 - step(t, MONT.restore + 0.4, 0.3)} />
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- act 4: the line, then the lockup
const KeyCap: React.FC<{children: React.ReactNode; w?: number}> = ({children, w = 64}) => (
	<div style={{width: w, height: 64, borderRadius: 14, background: 'linear-gradient(180deg, #2C2C30, #161618)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(0,0,0,0.7), 0 8px 18px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F2F2F4', fontFamily: SANS, fontSize: 30, fontWeight: 500}}>{children}</div>
);

export const EndShot: React.FC<{t: number}> = ({t}) => {
	const words: [number, string][] = [
		[END.w1, 'UNDO'],
		[END.w2, 'FOR YOUR'],
		[END.w3, 'WHOLE MAC.'],
	];
	let word = '';
	for (const [s, w] of words) if (t >= s) word = w;
	const lock = t >= END.lock;
	const lp = step(t, END.lock, 0.5, easeOut);
	const since = t - (words.find(([, w]) => w === word)?.[0] ?? 0);
	const kick = 1 + 0.035 * (1 - easeOut(clamp01(since / 0.3)));
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Wallpaper
				dim={lock ? 0.35 * lp : 0}
				behind={
					!lock ? (
						<div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', transform: `scale(${kick})`, transformOrigin: '50% 40%'}}>
							<Big text={word} w={1780} weight={880} stretch="expanded" tracking={-0.01} />
						</div>
					) : undefined
				}
			/>
			{lock ? (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: lp, transform: `translateY(${(1 - lp) * 24}px)`}}>
					<AppIcon s={196} glow={0.6} />
					<div style={{height: 34}} />
					<Wordmark size={104} />
					<div style={{height: 18}} />
					<div style={{fontFamily: SANS, fontSize: 36, fontWeight: 500, color: '#D9D9DE', letterSpacing: '-0.01em'}}>Undo for your whole Mac.</div>
					<div style={{height: 40}} />
					<div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
						<KeyCap>
							<GCtrl s={30} c="#F2F2F4" w={2} />
						</KeyCap>
						<KeyCap>
							<GCmd s={30} c="#F2F2F4" w={1.7} />
						</KeyCap>
						<KeyCap>Z</KeyCap>
						<div style={{marginLeft: 22, fontFamily: SANS, fontSize: 24, fontWeight: 600, color: C.amber}}>Coming to Mac</div>
					</div>
				</AbsoluteFill>
			) : null}
			<MenuBar app="Finder" menus={['File', 'Edit', 'View', 'Go', 'Window', 'Help']} clock={NOW} />
		</AbsoluteFill>
	);
};

export const _u = [RW];
