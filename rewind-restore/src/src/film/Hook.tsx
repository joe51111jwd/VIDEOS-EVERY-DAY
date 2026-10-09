import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Wallpaper, MenuBar} from '../mac/Desktop';
import {Cursor, cursorAt} from '../mac/Cursor';
import {Keys} from '../mac/Keys';
import {Timeline, TL_Y, restoreBtn, stripX} from '../rr/Timeline';
import {Big} from '../rr/Type';
import {AppIcon} from '../rr/Brand';
import {DayBanners, Placed, dayState} from '../world/Day';
import {C, SANS, clamp01, easeOut, easeInOut, pulse, spr, step} from '../lib/tokens';
import {HOOK, KEYS, RW, clockAt, fmtClock, hhmm, stripP, worldAt} from './plan';
import {HOOK_THUMBS, HOOK_TICKS, HOOK_CHIPS} from './thumbs';

const M_NOW = 16 * 60 + 17;

/** the desktop receding into Rewind mode: scale about the screen center, pushed down */
export const rewindXf = (rm: number) => `translateY(${96 * rm}px) scale(${1 - 0.43 * rm})`;
export const ghostFilter = (g: number) => (g > 0.002 ? `saturate(${1 - 0.6 * g}) brightness(${1 - 0.16 * g}) contrast(${1 - 0.08 * g})` : undefined);

/** giant chrome clock that lives behind the mountains */
export const SkyClock: React.FC<{min: number; o: number; dy?: number; label?: string}> = ({min, o, dy = 0, label}) => {
	if (o <= 0.003) return null;
	const pm = Math.floor(min / 60) >= 12;
	return (
		<div style={{position: 'absolute', left: 0, top: 74 + dy, width: 1920, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', opacity: o}}>
			<Big text={label ?? hhmm(min)} size={330} weight={850} stretch="expanded" tracking={-0.02} />
			{label ? null : <Big text={pm ? 'PM' : 'AM'} size={108} weight={250} stretch="expanded" tracking={0.02} style={{marginLeft: 22, marginTop: 12}} />}
		</div>
	);
};

export const Toast: React.FC<{p: number; title: string; sub: string}> = ({p, title, sub}) => {
	if (p <= 0.01) return null;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 50, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -16}px) scale(${0.96 + 0.04 * p})`}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 22px 10px 12px', borderRadius: 30, background: 'rgba(30,30,33,0.92)', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.12), 0 18px 50px rgba(0,0,0,0.5)', fontFamily: SANS}}>
				<AppIcon s={38} />
				<div>
					<div style={{fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em'}}>{title}</div>
					<div style={{fontSize: 13.5, fontWeight: 500, color: '#A9A9B0', marginTop: 1}}>{sub}</div>
				</div>
			</div>
		</div>
	);
};

export const KeysShot: React.FC<{t: number}> = ({t}) => {
	const down = (t0: number) => clamp01((t - t0) / 0.045) * (1 - clamp01((t - (KEYS.t1 - 0.06)) / 0.05));
	const press = {ctrl: down(KEYS.ctrl), cmd: down(KEYS.cmd), z: down(KEYS.z)};
	const u = clamp01((t - KEYS.t0) / (KEYS.t1 - KEYS.t0));
	return <Keys press={press} push={0.15 + 0.55 * easeOut(u)} light={press.z} />;
};

export const HookShot: React.FC<{t: number}> = ({t}) => {
	const w = worldAt(t);
	const st = dayState(w);
	const open = step(t, RW.open, 0.34, easeOut);
	const close = t >= RW.restore ? clamp01(spr(t, RW.restore, 13, 0.72)) : 0;
	const rm = open * (1 - close);
	const g = t < RW.restore ? open : open * (1 - clamp01((t - RW.restore) / 0.12));
	const min = clockAt(w);
	const menuMin = t < KEYS.t0 ? min : M_NOW;
	const head = stripP(min);
	const tlShow = t < RW.restore ? open : 1 - step(t, RW.restore + 0.04, 0.28, easeInOut);
	const clockO = t < RW.restore ? step(t, RW.open + 0.08, 0.3) : 1 - step(t, RW.restore, 0.14);

	// cursor: wandering the afternoon → onto the playhead knob → drag → Restore
	const knob = (tt: number) => ({x: stripX(stripP(clockAt(worldAt(tt)))), y: TL_Y + 22});
	let cur: {x: number; y: number};
	if (t < KEYS.t0) {
		cur = cursorAt(t, [
			{t: 0, x: 760, y: 420},
			{t: 0.35, x: 1180, y: 300},
			{t: 0.7, x: 640, y: 560},
			{t: 1.05, x: 1320, y: 640},
			{t: 1.5, x: 960, y: 560},
		]);
	} else if (t < RW.grab) {
		const k = knob(RW.drag0);
		cur = cursorAt(t, [
			{t: RW.open, x: 960, y: 560},
			{t: RW.grab, x: k.x, y: k.y},
		]);
	} else if (t < RW.drag1) {
		cur = knob(t);
	} else {
		const k = knob(RW.drag1);
		cur = cursorAt(t, [
			{t: RW.drag1 + 0.04, x: k.x, y: k.y},
			{t: RW.restore - 0.1, x: restoreBtn.x + 70, y: restoreBtn.y + 26},
		]);
	}
	const press = pulse(t, RW.restore - 0.09, 0.05, 0.16);
	const dragging = t >= RW.grab && t < RW.drag1 ? 1 : 0;
	const hover = clamp01((t - (RW.restore - 0.25)) / 0.1) * (t < RW.restore + 0.3 ? 1 : 0);
	const flash = pulse(t, RW.restore, 0.03, 0.35);
	const toast = step(t, RW.restore + 0.12, 0.3) * (1 - step(t, RW.restore + 1.25, 0.25, easeInOut));

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Wallpaper behind={<SkyClock min={min} o={clockO} />} />
			<AbsoluteFill style={{transform: rewindXf(rm), transformOrigin: '960px 540px', filter: ghostFilter(g), opacity: 1 - 0.18 * g}}>
				{st.placed.map((p) => (
					<Placed key={p.spec.id} p={p} ctx={t >= RW.restore ? {tabsShown: 1, scroll: 0, termShown: 1} : undefined} />
				))}
			</AbsoluteFill>
			{g > 0.01 ? <AbsoluteFill style={{transform: rewindXf(rm), transformOrigin: '960px 540px', pointerEvents: 'none'}}>{null}</AbsoluteFill> : null}
			<DayBanners b={st.banners} />
			<MenuBar app={t < KEYS.t0 ? 'Mail' : 'Finder'} menus={t < KEYS.t0 ? undefined : ['File', 'Edit', 'View', 'Go', 'Window', 'Help']} clock={fmtClock(menuMin)} rewindOn={rm} />
			<Timeline show={tlShow} thumbs={HOOK_THUMBS} ticks={HOOK_TICKS} chips={HOOK_CHIPS} head={head} time={fmtClock(min, false)} day="Today" press={press} hover={hover} />
			<Toast p={toast} title="Restored to 10:42 AM" sub="4 windows · 12 tabs · 2 documents" />
			{flash > 0.01 ? <AbsoluteFill style={{background: `rgba(255,236,210,${0.22 * flash})`}} /> : null}
			<Cursor x={cur.x} y={cur.y} press={Math.max(press, dragging * 0.6)} opacity={t < RW.restore + 0.5 ? 1 : 1 - step(t, RW.restore + 0.5, 0.3)} />
		</AbsoluteFill>
	);
};

export const _u = [C, HOOK, easeInOut];
