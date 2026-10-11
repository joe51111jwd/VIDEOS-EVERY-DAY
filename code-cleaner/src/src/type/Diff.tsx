import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, F, W} from '../lib/theme';

export type Kind = '+' | '-' | ' ' | '!';

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const KIND: Record<Kind, {band: string; ink: string; sign: string}> = {
	'+': {band: C.addBand, ink: C.addInk, sign: C.addSign},
	'-': {band: C.delBand, ink: C.delInk, sign: C.delSign},
	'!': {band: C.ambBand, ink: C.ambInk, sign: C.ambInk},
	' ': {band: 'transparent', ink: C.ink, sign: C.dim},
};

export type RowProps = {
	kind: Kind;
	text: string;
	ln?: number | string;
	/** local frame the row lands on */
	at: number;
	/** local frame the strike starts (minus rows) */
	strike?: number;
	/** local frame the row is deleted (collapses away) */
	collapse?: number;
	size?: number;
	wdth?: number;
	pad?: number;
	/** row width, defaults to the frame */
	width?: number;
	gutter?: number;
	/** band colour override (e.g. an opaque band for a context row over footage) */
	band?: string;
};

/** One line of a diff, at billboard size: gutter (line number + sign), a full-width band, heavy caps. */
export const DiffRow: React.FC<RowProps> = ({kind, text, ln, at, strike, collapse, size = 168, wdth = 80, pad = 18, width = W, gutter = 250, band}) => {
	const f = useCurrentFrame();
	const k = KIND[kind];
	const t = f - at;
	if (t < 0) return <div style={{height: size * 0.86 + pad * 2}} />;
	const wipe = interpolate(t, [0, 5], [100, 0], {...clamp, easing: ease});
	const textIn = interpolate(t, [0, 7], [0, 1], {...clamp, easing: ease});
	const flash = kind === ' ' ? 0 : interpolate(t, [0, 9], [0.2, 0], clamp);
	const signScale = interpolate(t, [0, 6], [1.7, 1], {...clamp, easing: ease});
	const st = strike === undefined ? 0 : interpolate(f - strike, [0, 6], [0, 1], {...clamp, easing: Easing.bezier(0.6, 0, 0.2, 1)});
	const col = collapse === undefined ? 1 : interpolate(f - collapse, [0, 7], [1, 0], {...clamp, easing: Easing.bezier(0.7, 0, 0.3, 1)});
	const h = (size * 0.86 + pad * 2) * col;
	return (
		<div style={{position: 'relative', width, height: h, overflow: 'hidden', opacity: col < 1 ? col * 0.7 + 0.3 * (col > 0 ? 1 : 0) : 1}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: band ?? k.band,
					clipPath: `inset(0 ${wipe}% 0 0)`,
				}}
			>
				<div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash}} />
			</div>
			{ln !== undefined ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						width: gutter * 0.5,
						top: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-end',
						fontFamily: F.mono,
						fontSize: Math.max(26, size * 0.17),
						color: kind === ' ' ? C.dim : k.sign,
						opacity: 0.75 * textIn,
					}}
				>
					{ln}
				</div>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: gutter * 0.58,
					width: gutter * 0.3,
					top: 0,
					bottom: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: F.type,
					fontWeight: 700,
					fontSize: size * 0.62,
					color: k.sign,
					transform: `scale(${signScale})`,
					opacity: textIn,
				}}
			>
				{kind === '-' ? '−' : kind === ' ' ? '' : kind}
			</div>
			<div
				style={{
					position: 'absolute',
					left: gutter,
					top: 0,
					bottom: 0,
					display: 'flex',
					alignItems: 'center',
					opacity: textIn * (strike !== undefined ? 1 - st * 0.35 : 1),
					transform: `translateX(${(1 - textIn) * -36}px)`,
				}}
			>
				<span
					style={{
						position: 'relative',
						fontFamily: F.type,
						fontWeight: 800,
						fontStretch: `${wdth}%`,
						fontSize: size,
						lineHeight: 1,
						letterSpacing: '-0.015em',
						textTransform: 'uppercase',
						color: k.ink,
						whiteSpace: 'pre',
						paddingTop: size * 0.04,
					}}
				>
					{text}
					{strike !== undefined ? (
						<span
							style={{
								position: 'absolute',
								left: -size * 0.04,
								top: '53%',
								height: Math.max(6, size * 0.075),
								width: `calc(${st * 100}% + ${size * 0.08 * st}px)`,
								background: k.ink,
								borderRadius: 2,
							}}
						/>
					) : null}
				</span>
			</div>
		</div>
	);
};

/** "@@ -1,220 +1,57 @@ checkout.ts" — the hunk header that opens a diff */
export const Hunk: React.FC<{text: string; at: number; size?: number; width?: number}> = ({text, at, size = 34, width = W}) => {
	const f = useCurrentFrame();
	const o = interpolate(f - at, [0, 6], [0, 1], clamp);
	return (
		<div
			style={{
				width,
				height: size * 2.1,
				display: 'flex',
				alignItems: 'center',
				paddingLeft: 250 * 0.58,
				background: 'rgba(56,139,253,0.09)',
				fontFamily: F.mono,
				fontSize: size,
				color: '#8B97A6',
				opacity: o,
				letterSpacing: '0.01em',
			}}
		>
			{text}
		</div>
	);
};

export type CardRow = Omit<RowProps, 'size'> & {size?: number};

/** A full frame of diff rows, centred vertically. */
export const DiffCard: React.FC<{rows: CardRow[]; hunk?: {text: string; at: number}; size?: number; wdth?: number; bg?: string; children?: React.ReactNode}> = ({
	rows,
	hunk,
	size = 168,
	wdth,
	bg = C.bg,
	children,
}) => (
	<AbsoluteFill style={{background: bg, justifyContent: 'center'}}>
		{children}
		<div style={{position: 'relative'}}>
			{hunk ? <Hunk text={hunk.text} at={hunk.at} /> : null}
			{rows.map((r, i) => (
				<DiffRow key={i} size={size} wdth={wdth} {...r} />
			))}
		</div>
	</AbsoluteFill>
);
