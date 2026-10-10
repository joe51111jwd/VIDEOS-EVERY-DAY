import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {E, F, kf} from '../lib/theme';
import {at} from './beats';
import {Page, Plate} from '../type/Page';
import {Typed} from '../type/Typed';
import {Panel, TutorialPlayer, Step} from '../ap/Panel';
import {Pointer, Click, cursorAt, CK} from '../ap/Cursor';
import {EditorApp} from '../apps/Editor';
import {SheetApp} from '../apps/Sheet';
import {CodeApp} from '../apps/Code';
import {CUT, NEXT, PIVOT} from './data';

/** the donut render, used as the footage in the editor */
export const donutFrame = (i: number) => {
	const k = ((Math.floor(i / 2) % 22) + 22) % 22; // ping-pong over the rendered turntable
	const f = 96 + 2 * (k < 12 ? k : 22 - k);
	return staticFile(`bl/cy_final/${String(f).padStart(3, '0')}.jpg`);
};

/** steps done by time t: one per key time */
const stepsDone = (t: number, keys: number[], base = 0) => base + keys.filter((k) => t >= k).length;
const curOf = (t: number, keys: number[], base = 0) => {
	const d = stepsDone(t, keys, base);
	const next = keys.find((k) => k > t);
	const prev = [...keys].reverse().find((k) => k <= t);
	if (next === undefined) return d;
	const a = prev ?? next - 0.47;
	return d + Math.min(0.95, Math.max(0, (t - a) / (next - a)));
};

/** an app with Autopilot driving it: its panel (the tutorial playing along) and its pointer */
export const AppShot: React.FC<{
	t: number;
	app: React.ReactNode;
	tutor: React.ReactNode;
	data: {title: string; channel: string; dur: number; total: number; steps: Step[]};
	cur: number;
	ptr: CK[];
	clicks: number[];
	panel: {x: number; y: number; scale?: number};
	mode?: 'do' | 'teach';
	modeT?: number;
	status?: string;
	playing?: boolean;
	tag?: boolean;
	children?: React.ReactNode;
	over?: React.ReactNode; // drawn above the panel
}> = ({t, app, tutor, data, cur, ptr, clicks, panel, mode = 'do', modeT, status, playing = true, tag = true, children, over}) => {
	const p = cursorAt(t, ptr);
	const tpos = (Math.min(cur, data.steps.length) / data.steps.length) * data.dur;
	return (
		<AbsoluteFill>
			{app}
			{children}
			<Panel
				t={t}
				x={panel.x}
				y={panel.y}
				scale={panel.scale ?? 0.9}
				title={data.title}
				channel={data.channel}
				total={data.total}
				steps={data.steps}
				cur={cur}
				mode={mode}
				modeT={modeT}
				status={status}
				player={
					<TutorialPlayer w={442} pos={tpos} dur={data.dur} playing={playing}>
						{tutor}
					</TutorialPlayer>
				}
			/>
			{over}
			{clicks.map((c, i) => {
				const q = cursorAt(c, ptr);
				return <Click key={i} t={t} t0={c} x={q.x} y={q.y} />;
			})}
			<Pointer x={p.x} y={p.y} tag={tag} press={clicks.some((c) => t >= c && t < c + 0.12) ? 1 : 0} />
		</AbsoluteFill>
	);
};

/** the field chip being dragged into the pivot editor (Sheets' chip style) */
const DragChip: React.FC<{t: number; from: {x: number; y: number}; to: {x: number; y: number}; t0: number; t1: number}> = ({t, from, to, t0, t1}) => {
	const p = kf(t, [t0, t1], [0, 1], E.inOut);
	const arc = Math.sin(p * Math.PI) * 60;
	const x = from.x + (to.x - from.x) * p;
	const y = from.y + (to.y - from.y) * p - arc;
	return (
		<div style={{position: 'absolute', left: x - 18, top: y - 20, padding: '9px 18px', borderRadius: 6, background: '#E8F0FE', color: '#0B57D0', fontFamily: F.inter, fontSize: 17, fontWeight: 600, boxShadow: '0 8px 22px rgba(0,0,0,0.22)', transform: `rotate(${-3 * Math.sin(p * Math.PI)}deg)`}}>
			Region
		</div>
	);
};

/* ---------- the three apps ---------- */

export const EditorShot: React.FC<{t: number}> = ({t}) => {
	const keys = [at(24), at(25), at(26), at(27)];
	const k = {play: at(25), zoom: at(26), cut: at(27), lift: at(27) + 0.14, frameSrc: donutFrame};
	const ptr: CK[] = [
		{t: at(23), x: 760, y: 900},
		{t: at(24) - 0.06, x: 700, y: 782}, // the take on V1
		{t: at(25) - 0.1, x: 1243, y: 548}, // play
		{t: at(26) - 0.1, x: 900, y: 612}, // the ruler (zoom)
		{t: at(27) - 0.1, x: 938, y: 782}, // razor at the playhead
		{t: at(28), x: 980, y: 760},
	];
	const clicks = [at(24) - 0.04, at(25) - 0.04, at(26) - 0.04, at(27) - 0.04];
	return (
		<AppShot
			t={t}
			app={<EditorApp t={t} k={k} />}
			tutor={<EditorApp t={t + 0.5} k={{...k, zoom: at(25), cut: at(26)}} />}
			data={CUT}
			cur={curOf(t, keys)}
			ptr={ptr}
			clicks={clicks}
			panel={{x: 40, y: 52, scale: 0.8}}
		/>
	);
};

export const SheetShot: React.FC<{t: number}> = ({t}) => {
	const keys = [at(29), at(30), at(31), at(33), at(35)];
	const k = {create: at(24), rows: at(29), values: at(30), cols: at(31), format: at(33)};
	const from = {x: 640, y: 560};
	const to = {x: 1640, y: 345};
	const ptr: CK[] = [
		{t: at(27), x: 560, y: 640},
		{t: at(28), x: from.x, y: from.y}, // grabs the Region field
		{t: at(29) - 0.04, x: 1640, y: 345}, // drops it into Rows
		{t: at(30) - 0.1, x: 1862, y: 520}, // Values › Add
		{t: at(31) - 0.1, x: 1862, y: 420}, // Columns › Add
		{t: at(33) - 0.1, x: 600, y: 96}, // currency format
		{t: at(35) - 0.1, x: 880, y: 223}, // Grand Total
		{t: at(36), x: 900, y: 260},
	];
	const clicks = [at(28) - 0.02, at(30) - 0.04, at(31) - 0.04, at(33) - 0.04, at(35) - 0.04];
	return (
		<AppShot
			t={t}
			app={<SheetApp t={t} k={k} />}
			tutor={<SheetApp t={t + 0.5} k={{...k, drag: undefined}} />}
			data={PIVOT}
			cur={curOf(t, keys, 2)}
			ptr={ptr}
			clicks={clicks}
			panel={{x: 1000, y: 230, scale: 0.86}}
			over={t >= at(28) && t < at(29) + 0.02 ? <DragChip t={t} from={from} to={to} t0={at(28)} t1={at(29) - 0.04} /> : null}
		/>
	);
};

export const CodeShot: React.FC<{t: number}> = ({t}) => {
	const keys = [at(36), at(37) + 0.4, at(38) + 0.3, at(39)];
	const k = {type: at(37) - 0.06, typeDur: 0.5, build: at(38), deploy: at(39) - 0.3, live: at(39)};
	const ptr: CK[] = [
		{t: at(35), x: 700, y: 400},
		{t: at(36) - 0.06, x: 150, y: 196}, // page.tsx in the explorer
		{t: at(37) - 0.1, x: 980, y: 330}, // into the editor
		{t: at(38) - 0.1, x: 760, y: 760}, // terminal
		{t: at(39) - 0.06, x: 700, y: 884}, // the live URL
		{t: at(40), x: 720, y: 880},
	];
	const clicks = [at(36) - 0.04, at(38) - 0.04, at(39) - 0.02];
	return (
		<AppShot
			t={t}
			app={<CodeApp t={t} k={k} />}
			tutor={<CodeApp t={t + 0.5} k={k} />}
			data={NEXT}
			cur={curOf(t, keys)}
			ptr={ptr}
			clicks={clicks}
			panel={{x: 1416, y: 84, scale: 0.9}}
			status={t >= at(39) ? 'LIVE' : undefined}
		/>
	);
};

/** "THEN IT DOES THEM." over the editor, "IN YOUR APPS." + "ON YOUR FILES." over the spreadsheet, "WHILE YOU WATCH." over the code */
export const SApps: React.FC<{t: number}> = ({t}) => {
	const t0 = at(24);
	const shot = t < at(28) ? 'editor' : t < at(36) ? 'sheet' : 'code';
	// small push-ins on the beats where the action is tiny
	const crop =
		shot === 'editor'
			? {x: kf(t, [at(26) - 0.1, at(26) + 0.25], [0, 240], E.inOut), y: kf(t, [at(26) - 0.1, at(26) + 0.25], [60, 300], E.inOut), w: kf(t, [at(26) - 0.1, at(26) + 0.25], [1920, 1400], E.inOut)}
			: shot === 'sheet'
				? {x: 0, y: 0, w: 1920}
				: {x: kf(t, [at(38) - 0.1, at(38) + 0.25], [0, 320], E.inOut), y: kf(t, [at(38) - 0.1, at(38) + 0.25], [30, 230], E.inOut), w: kf(t, [at(38) - 0.1, at(38) + 0.25], [1920, 1600], E.inOut)};
	return (
		<Page t={t - t0 + 1} index="04" label="YOUR APPS">
			<Typed
				t={t}
				x={96}
				y={160}
				size={96}
				cps={44}
				keys={[
					{t: at(24), text: 'THEN IT DOES ~THEM~.'},
					{t: at(28), text: 'IN YOUR ~APPS~.'},
					{t: at(32), text: 'ON YOUR ~FILES~.'},
					{t: at(36), text: 'WHILE YOU ~WATCH~.'},
				]}
			/>
			<Plate box={{x: 96, y: 300, w: 1728, h: 820}} crop={crop} radius={16}>
				{shot === 'editor' ? <EditorShot t={t} /> : shot === 'sheet' ? <SheetShot t={t} /> : <CodeShot t={t} />}
			</Plate>
		</Page>
	);
};
