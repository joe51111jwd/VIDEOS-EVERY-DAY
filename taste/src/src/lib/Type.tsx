import React from 'react';
import {DISPLAY} from './tokens';

export type Stretch = 'condensed' | 'expanded' | 'normal';
const STRETCH_PCT: Record<Stretch, string> = {condensed: '62%', expanded: '125%', normal: '100%'};
const STRETCH_KW: Record<Stretch, string> = {condensed: 'extra-condensed', expanded: 'expanded', normal: 'normal'};

let ctx: CanvasRenderingContext2D | null = null;
/** width of `text` in Archivo at size 100 */
export const measure = (text: string, weight: number, stretch: Stretch, tracking = 0) => {
	if (!ctx) ctx = document.createElement('canvas').getContext('2d');
	if (!ctx) return text.length * 60;
	ctx.font = `${weight} 100px "${DISPLAY}"`;
	// Chrome supports fontStretch keywords on canvas
	(ctx as unknown as {fontStretch: string}).fontStretch = STRETCH_KW[stretch];
	return ctx.measureText(text).width + tracking * 100 * Math.max(0, text.length - 1);
};
/** font size that makes `text` exactly `w` px wide */
export const fitSize = (text: string, w: number, weight = 800, stretch: Stretch = 'condensed', tracking = 0) => (100 * w) / Math.max(1, measure(text, weight, stretch, tracking));

export const CHROME = 'linear-gradient(180deg, #FFFFFF 0%, #F4F4F7 26%, #C9CAD1 52%, #9C9EA6 74%, #E6E7EB 100%)';
export const CHROME_DIM = 'linear-gradient(180deg, #E8E8EC 0%, #C2C3CA 45%, #7E8089 100%)';

/** big chrome display type; `w` fits the line to that width */
export const Big: React.FC<{
	text: string;
	w?: number;
	size?: number;
	weight?: number;
	stretch?: Stretch;
	tracking?: number;
	fill?: string;
	sheen?: number; // -1..2 sweep position of a light sheen
	style?: React.CSSProperties;
	sy?: number; // vertical stretch
}> = ({text, w, size, weight = 800, stretch = 'condensed', tracking = -0.01, fill = CHROME, sheen, style, sy = 1}) => {
	const fs = size ?? fitSize(text, w ?? 1600, weight, stretch, tracking);
	const sheenBg = sheen !== undefined ? `linear-gradient(100deg, rgba(255,255,255,0) ${(sheen - 0.15) * 100}%, rgba(255,255,255,0.95) ${sheen * 100}%, rgba(255,255,255,0) ${(sheen + 0.15) * 100}%), ` : '';
	return (
		<div
			style={{
				fontFamily: DISPLAY,
				fontWeight: weight,
				fontStretch: STRETCH_PCT[stretch],
				fontSize: fs,
				lineHeight: 0.8,
				letterSpacing: `${tracking}em`,
				whiteSpace: 'nowrap',
				backgroundImage: sheenBg + fill,
				WebkitBackgroundClip: 'text',
				backgroundClip: 'text',
				color: 'transparent',
				transform: sy !== 1 ? `scaleY(${sy})` : undefined,
				transformOrigin: '50% 100%',
				paddingTop: fs * 0.04,
				...style,
			}}
		>
			{text}
		</div>
	);
};

// ---- AirTag-style stacks: each row is justified to the full width; items land when they are sung and stay
export const CHROME2 = 'linear-gradient(180deg, #FFFFFF 0%, #ECEDF0 22%, #B9BBC2 50%, #8A8D95 66%, #D9DBE0 86%, #A3A6AE 100%)';
export const HOTFILL = 'linear-gradient(165deg, #FFD06A 0%, #FF8A2A 38%, #FF4B4B 70%, #FF2D7E 100%)';
export type It = {
	t: string;
	at: number; // when it lands (s)
	st?: Stretch;
	wt?: number;
	fill?: 'chrome' | 'hot' | 'white' | 'dim' | string;
	tr?: number; // tracking em
};
export type Row = It[];
/** words start rising this long before their onset (2 frames at 30 fps) */
export const LEAD = 0.067;
export const CAP = 0.72; // Archivo cap height / em
export const ASC = 0.155; // space above the caps inside a 1.0 line box

const fillOf = (f: It['fill']) => (f === 'hot' ? HOTFILL : f === 'white' ? 'linear-gradient(#fff,#fff)' : f === 'dim' ? 'linear-gradient(180deg,#8E9098,#5C5F66)' : !f || f === 'chrome' ? CHROME2 : f);

/** font size + item widths that justify a row to w (items separated by `sp` em) */
export const rowFit = (row: Row, w: number, sp = 0.18) => {
	const ws = row.map((it) => measure(it.t, it.wt ?? 800, it.st ?? 'condensed', it.tr ?? -0.01) / 100);
	const fs = w / (ws.reduce((a, b) => a + b, 0) + sp * (row.length - 1));
	return {fs, ws: ws.map((x) => x * fs), sp: sp * fs, h: fs * CAP};
};
export const stackH = (rows: Row[], w: number, gap = 0.022) => rows.reduce((a, r) => a + rowFit(r, w).h, 0) + gap * w * (rows.length - 1);

/** the Apple stretch: a line lands thin and squeezed, then swells to full weight and full width */
export const EXPAND = 0.45;
const ease4 = (p: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 4);
export type Fx = 'expand' | 'rise';

const Item: React.FC<{it: It; t: number; fs: number; w: number; x: number; h: number; fx: Fx}> = ({it, t, fs, w, x, h, fx}) => {
	const st = it.st ?? 'condensed';
	const wt = it.wt ?? 800;
	const tr = it.tr ?? -0.01;
	let rise = 1;
	let cw = wt;
	if (fx === 'expand') {
		// on screen from the frame the word is sung (or the beat lands), thin, then it fills out
		if (t < it.at) return null;
		cw = Math.round(120 + (wt - 120) * ease4((t - it.at) / EXPAND));
	} else {
		// rise: the 2-frame rise starts LEAD before the onset, so the word is whole when it's heard
		const k = t - it.at + LEAD;
		if (k < -0.001) return null;
		const p = Math.min(1, k / LEAD);
		rise = 1 - Math.pow(1 - p, 2);
	}
	const sx = cw === wt ? 1 : w / Math.max(1, (measure(it.t, cw, st, tr) * fs) / 100);
	return (
		<div style={{position: 'absolute', left: x, top: 0, width: w, height: h, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: -fs * ASC + (1 - rise) * h * 0.95,
					fontFamily: DISPLAY,
					fontWeight: cw,
					fontStretch: STRETCH_PCT[st],
					fontSize: fs,
					lineHeight: 1,
					letterSpacing: `${tr}em`,
					whiteSpace: 'nowrap',
					backgroundImage: fillOf(it.fill),
					backgroundSize: `${w}px ${h}px`,
					backgroundPosition: `0 ${fs * ASC}px`,
					backgroundRepeat: 'no-repeat',
					WebkitBackgroundClip: 'text',
					backgroundClip: 'text',
					color: 'transparent',
					transform: `scaleX(${sx})`,
					transformOrigin: '0 0',
				}}
			>
				{it.t}
			</div>
		</div>
	);
};

/** rows of justified type; `t` is the clock. With fx 'expand' each row grows from the center as it lands */
export const Stack: React.FC<{rows: Row[]; t: number; w: number; gap?: number; fx?: Fx; style?: React.CSSProperties}> = ({rows, t, w, gap = 0.022, fx = 'expand', style}) => {
	let y = 0;
	return (
		<div style={{position: 'relative', width: w, height: stackH(rows, w, gap), ...style}}>
			{rows.map((row, ri) => {
				const f = rowFit(row, w);
				const top = y;
				y += f.h + gap * w;
				const r0 = Math.min(...row.map((it) => it.at));
				const sx = fx === 'expand' ? 0.3 + 0.7 * ease4((t - r0) / EXPAND) : 1;
				let x = 0;
				return (
					<div key={ri} style={{position: 'absolute', left: 0, top, width: w, height: f.h, transform: sx < 1 ? `scaleX(${sx})` : undefined, transformOrigin: '50% 50%'}}>
						{row.map((it, ii) => {
							const xi = x;
							x += f.ws[ii] + f.sp;
							return <Item key={ii} it={it} t={t} fs={f.fs} w={f.ws[ii]} x={xi} h={f.h} fx={fx} />;
						})}
					</div>
				);
			})}
		</div>
	);
};
