import React from 'react';
import {AbsoluteFill} from 'remotion';
import {E, lerp, prog} from '../lib/theme';
import {at, BEAT} from './beats';
import {BlenderUI, BState} from '../apps/Blender';
import {Panel, TutorialPlayer} from '../ap/Panel';
import {Pointer, Click, cursorAt} from '../ap/Cursor';
import {Page, Plate} from '../type/Page';
import {Typed} from '../type/Typed';
import {DONUT} from './data';

const SUB = {name: 'Subdivision', icon: 'sub' as const, levels: 2};
const SOL = {name: 'Solidify', icon: 'solid' as const};

/** the Blender state at film time t: verbs 4 to 11 each do one step of the donut */
export const donutState = (t: number, frame: number): BState => {
	const base = {frame, shading: 'solid' as const, modifiers: [] as BState['modifiers'], tab: 'mod' as const};
	if (t < at(4)) return {...base, stage: 'cube', active: 'Cube', objects: ['Cube']};
	if (t < at(5)) return {...base, stage: 'empty' as BState['stage'], active: '', objects: []};
	if (t < at(6)) return {...base, stage: 'torus', active: 'Torus', objects: ['Torus']};
	if (t < at(7)) return {...base, stage: 'smooth', active: 'Donut', objects: ['Donut'], modifiers: [SUB]};
	if (t < at(8)) return {...base, stage: 'icing', active: 'Icing', objects: ['Donut', 'Icing'], modifiers: [SUB, SOL]};
	if (t < at(9)) return {...base, stage: 'color', shading: 'material', tab: 'mat', active: 'Icing', objects: ['Donut', 'Icing'], modifiers: [SUB, SOL], material: {name: 'Icing', color: '#F39AB8'}};
	if (t < at(11)) return {...base, stage: 'sprinkles', shading: 'material', tab: 'mat', active: 'Sprinkles', objects: ['Donut', 'Icing', 'Sprinkles'], modifiers: [SUB, SOL], material: {name: 'Sprinkles', color: '#3FA7FF'}};
	return {...base, stage: 'final', shading: 'rendered', tab: 'mat', active: 'Sprinkles', objects: ['Donut', 'Icing', 'Sprinkles', 'Plate'], modifiers: [SUB, SOL], material: {name: 'Icing', color: '#F39AB8'}};
};

/** the instructor's screen inside the tutorial player: one step ahead of you */
export const tutorState = (t: number, frame: number): BState => {
	const ahead = donutState(t + 0.45, 0);
	return {...ahead, frame: Math.min(118, frame + 8)};
};

const stepAt = (t: number) => {
	let n = 0;
	for (let i = 4; i <= 11; i++) if (t >= at(i)) n = i - 3;
	return n; // steps done
};

// where Autopilot's pointer goes for each step (Blender UI coordinates)
const PTR = () => [
	{t: at(3), x: 820, y: 640},
	{t: at(4) - 0.12, x: 760, y: 470}, // over the cube, X › Delete
	{t: at(5) - 0.14, x: 303, y: 50}, // Add menu
	{t: at(6) - 0.14, x: 1690, y: 378}, // Add Modifier
	{t: at(7) - 0.14, x: 760, y: 360}, // the donut top (Shift D)
	{t: at(8) - 0.14, x: 1484, y: 664}, // material tab
	{t: at(9) - 0.14, x: 760, y: 420}, // viewport (sprinkles)
	{t: at(10) - 0.1, x: 980, y: 560},
	{t: at(11) - 0.14, x: 1432, y: 49}, // Rendered shading
	{t: at(12), x: 1432, y: 49},
];

export const DonutScreen: React.FC<{t: number; zoom?: number}> = ({t, zoom = 0}) => {
	const span = at(12) - at(3);
	const frame = 18 + ((t - at(3)) / span) * 92;
	const s = donutState(t, frame);
	const done = stepAt(t);
	const cur = Math.min(DONUT.steps.length - 0.01, done + Math.min(0.95, (t - (done ? at(done + 3) : at(3))) / 0.47));
	const tpos = lerp(DONUT.pos[done] ?? 7391, DONUT.pos[done + 1] ?? 7391, Math.min(1, (t - (done ? at(done + 3) : at(3))) / 0.47));
	const zs = 1 + 0.32 * zoom;
	const O = {x: 1440, y: 56}; // zoom pivot: the viewport shading buttons stay put for "press it"
	const Z = (q: {x: number; y: number}) => ({x: O.x + (q.x - O.x) * zs, y: O.y + (q.y - O.y) * zs});
	const p = Z(cursorAt(t, PTR()));
	const clicks = [4, 5, 6, 7, 8, 9, 11].map((i) => at(i) - 0.04);
	const finished = t >= at(11);
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${zs})`, transformOrigin: `${O.x}px ${O.y}px`}}>
				<BlenderUI s={s} />
			</div>
			<Panel
				t={t}
				x={1920 - 470 - 34}
				y={84}
				title={DONUT.title}
				channel={DONUT.channel}
				total={DONUT.total}
				first={1}
				steps={DONUT.steps}
				cur={finished ? DONUT.steps.length : cur}
				status={finished ? 'DONE IN 0:41' : undefined}
				scale={1 - 0.08 * zoom}
				player={
					<TutorialPlayer w={442} pos={finished ? DONUT.dur : tpos} dur={DONUT.dur} playing={!finished}>
						<BlenderUI s={tutorState(t, frame)} />
					</TutorialPlayer>
				}
			/>
			{clicks.map((c, i) => {
				const q = Z(cursorAt(c, PTR()));
				return <Click key={i} t={t} t0={c} x={q.x} y={q.y} />;
			})}
			<Pointer x={p.x} y={p.y} tag press={clicks.some((c) => t >= c && t < c + 0.12) ? 1 : 0} />
		</AbsoluteFill>
	);
};

/** "IT DOES THE TUTORIAL FOR YOU." beside your Blender building the donut; on "zoom it" the plate takes the frame */
export const SBLENDER_IN = () => at(4) - BEAT / 2;
export const SBlender: React.FC<{t: number}> = ({t}) => {
	const z = prog(t, at(10) - 0.18, at(10) + 0.22, E.inOut);
	const box = {
		x: lerp(560, 0, z),
		y: lerp(196, 0, z),
		w: lerp(1264, 1920, z),
		h: lerp(711, 1080, z),
	};
	const t0 = SBLENDER_IN();
	return (
		<Page t={t - t0 + 1} index="01" label="THE PROOF">
			<Typed
				t={t}
				x={96}
				y={214}
				size={84}
				keys={[
					{t: t0, text: 'IT DOES', cps: 40},
					{t: at(4), text: 'IT DOES\nTHE\nTUTORIAL', cps: 40},
					{t: at(5), text: 'IT DOES\nTHE\nTUTORIAL\nFOR YOU.', cps: 40},
				]}
			/>
			<Plate box={box} radius={lerp(14, 0, z)}>
				<DonutScreen t={t} zoom={prog(t, at(10) - 0.05, at(11) + 0.3, E.out)} />
			</Plate>
		</Page>
	);
};
