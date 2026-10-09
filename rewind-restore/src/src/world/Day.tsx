import React from 'react';
import {Img, staticFile} from 'remotion';
import {Banner} from '../apps/Social';
import {easeOut, clamp01, C} from '../lib/tokens';
import {HOOK} from '../film/plan';
import {CHAOS, Ctx, HERO, HERO_FOCUS, WinSpec} from './moments';
import {P, PEOPLE} from '../apps/Social';
import {ICal, IChat} from '../mac/icons';

type Placed = {spec: WinSpec; o: number; s: number; dy: number; focused: boolean};

/** a window drawn with an open/close transform around its own center */
export const Placed: React.FC<{p: Placed; ctx?: Partial<Ctx>}> = ({p, ctx}) => {
	if (p.o <= 0.003) return null;
	const b = p.spec.box;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: p.o, transform: `translateY(${p.dy}px) scale(${p.s})`, transformOrigin: `${b.x + b.w / 2}px ${b.y + b.h / 2}px`}}>
			{p.spec.el(b, {focused: p.focused, ...ctx})}
		</div>
	);
};

/** windows open with the macOS zoom: a quick scale-up from 94% and a fade */
const openP = (w: number, w0: number, dur = 0.14) => easeOut(clamp01((w - w0) / dur));

/** the whole hook desktop at world time w */
export const dayState = (w: number) => {
	const q = clamp01((w - HOOK.blink) / HOOK.blinkDur); // everything closes
	const qe = q * q;
	const placed: Placed[] = [];
	let topChaos = -1;
	CHAOS.forEach((_, i) => {
		if (w >= HOOK.chaos0 + i * HOOK.chaosStep) topChaos = i;
	});
	for (const spec of HERO) {
		placed.push({spec, o: 1 - qe, s: 1 - 0.07 * qe, dy: 0, focused: topChaos < 0 && spec.id === HERO_FOCUS});
	}
	CHAOS.forEach((spec, i) => {
		const p = openP(w, HOOK.chaos0 + i * HOOK.chaosStep);
		if (p <= 0) return;
		placed.push({spec, o: Math.min(1, p * 2.2) * (1 - qe), s: (0.94 + 0.06 * p) * (1 - 0.07 * qe), dy: (1 - p) * 16, focused: i === topChaos});
	});
	const banners = HOOK.banners.map((b0) => openP(w, b0, 0.22) * (1 - qe));
	return {placed, banners, gone: q};
};

const AppTile: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
	<div style={{width: 38, height: 38, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>{children}</div>
);

export const DayBanners: React.FC<{b: number[]}> = ({b}) => {
	const items = [
		{title: 'Design sync', body: 'Now · Maya Lin, Dan Whitfield +2', icon: <AppTile bg="#FF3B30"><ICal s={22} c="#fff" /></AppTile>, when: 'now'},
		{title: 'Maya Lin', body: 'are you joining?? we started', icon: <Img src={P(PEOPLE.maya)} style={{width: 38, height: 38, objectFit: 'cover'}} />, when: 'now'},
		{title: 'Sofia in #launch', body: '@you where did we land on the launch video?', icon: <AppTile bg="#4A154B"><IChat s={20} c="#fff" /></AppTile>, when: 'now'},
	];
	return (
		<>
			{items.map((it, i) => {
				const p = b[i] ?? 0;
				if (p <= 0.01) return null;
				const slot = b.filter((x, j) => j > i && x > 0.01).length; // newer ones push older down
				return (
					<div key={i} style={{position: 'absolute', left: 0, top: 0, opacity: p, transform: `translateX(${(1 - p) * 60}px)`}}>
						<Banner x={1920 - 400} y={48 + slot * 82} app="" icon={it.icon} title={it.title} body={it.body} when={it.when} />
					</div>
				);
			})}
		</>
	);
};

/** windows of a montage moment, all fully open */
export const momentPlaced = (wins: WinSpec[], focus: string): Placed[] => wins.map((spec) => ({spec, o: 1, s: 1, dy: 0, focused: spec.id === focus}));

export const _unused = C;
