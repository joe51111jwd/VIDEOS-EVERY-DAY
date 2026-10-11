import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import code from '../data/code.json';
import {C, F} from '../lib/theme';

export type Tok = [string, string];
export type Line = Tok[];
export const CODE = code as unknown as {messy: Line[]; clean: Line[]; rust: Line[]};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type LineStyle = {bg?: string; sign?: '+' | '-'; dim?: number};

const LineRow: React.FC<{line: Line; ln: number | string; size: number; lh: number; style?: LineStyle; gutter: boolean; height?: number}> = ({
	line,
	ln,
	size,
	lh,
	style,
	gutter,
	height,
}) => (
	<div
		style={{
			display: 'flex',
			height: height ?? lh,
			lineHeight: `${lh}px`,
			background: style?.bg,
			overflow: 'hidden',
			opacity: style?.dim ?? 1,
			whiteSpace: 'pre',
		}}
	>
		{gutter ? (
			<>
				<div style={{width: size * 3.1, textAlign: 'right', color: '#4A515B', flexShrink: 0}}>{ln}</div>
				<div
					style={{
						width: size * 1.6,
						textAlign: 'center',
						flexShrink: 0,
						color: style?.sign === '+' ? C.green : style?.sign === '-' ? C.red : 'transparent',
					}}
				>
					{style?.sign ?? ' '}
				</div>
			</>
		) : null}
		<div>
			{line.map(([t, c], i) => (
				<span key={i} style={{color: style?.sign === '-' ? '#E8A39C' : c}}>
					{t}
				</span>
			))}
		</div>
	</div>
);

/** A highlighted code listing (real tokens from the rig), scrolled by `scroll` lines. */
export const Code: React.FC<{
	lines: Line[];
	size?: number;
	lh?: number;
	scroll?: number;
	gutter?: boolean;
	lnStart?: number;
	style?: (i: number) => LineStyle | undefined;
	height: number;
}> = ({lines, size = 22, lh = 34, scroll = 0, gutter = true, lnStart = 1, style, height}) => (
	<div style={{position: 'relative', height, overflow: 'hidden', fontFamily: F.mono, fontSize: size}}>
		<div style={{transform: `translateY(${-scroll * lh}px)`}}>
			{lines.map((l, i) => (
				<LineRow key={i} line={l} ln={i + lnStart} size={size} lh={lh} gutter={gutter} style={style?.(i)} />
			))}
		</div>
	</div>
);

/**
 * The rewrite as a diff: from `at`, old lines turn red and collapse away top to bottom while
 * the new lines insert green from the top — the new code eats the old one.
 */
export const Morph: React.FC<{old: Line[]; next: Line[]; at: number; dur: number; size?: number; lh?: number; height: number; settle?: number}> = ({
	old,
	next,
	at,
	dur,
	size = 22,
	lh = 34,
	height,
	settle = 14,
}) => {
	const f = useCurrentFrame();
	const t = f - at;
	const eOut = Easing.bezier(0.5, 0, 0.3, 1);
	// old line i: red at d_i - 3, collapses d_i .. d_i + 4
	const rows: React.ReactNode[] = [];
	const nNew = next.length;
	for (let j = 0; j < nNew; j++) {
		const tj = (j / nNew) * dur;
		const g = interpolate(t, [tj, tj + 4], [0, 1], {...clamp, easing: eOut});
		if (g <= 0) continue;
		const fade = interpolate(t, [tj + 4, tj + 4 + settle], [1, 0], clamp);
		rows.push(
			<LineRow key={'n' + j} line={next[j]} ln={j + 1} size={size} lh={lh} gutter height={lh * g} style={{bg: `rgba(46,160,67,${0.1 + 0.22 * fade})`, sign: '+'}} />,
		);
	}
	for (let i = 0; i < old.length; i++) {
		const di = (i / old.length) * dur * 0.92 + 2;
		const red = interpolate(t, [di - 4, di - 1], [0, 1], clamp);
		const g = interpolate(t, [di, di + 4], [1, 0], {...clamp, easing: eOut});
		if (g <= 0) continue;
		rows.push(
			<LineRow
				key={'o' + i}
				line={old[i]}
				ln={i + 1}
				size={size}
				lh={lh}
				gutter
				height={lh * g}
				style={red > 0 ? {bg: `rgba(248,81,73,${0.28 * red})`, sign: '-'} : undefined}
			/>,
		);
	}
	return (
		<div style={{position: 'relative', height, overflow: 'hidden', fontFamily: F.mono, fontSize: size}}>
			{rows}
		</div>
	);
};
