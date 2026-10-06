import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeOut, FPS, SANS, spr, step} from '../tokens';

export const useT = () => useCurrentFrame() / FPS;

type Kind = 'rise' | 'fade' | 'pop' | 'blur' | 'left' | 'right' | 'down';

/** An element Riff "places": invisible before `at`, then materialises. Keeps its layout box. */
export const Appear: React.FC<{
	at?: number;
	dur?: number;
	kind?: Kind;
	dist?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
	className?: string;
}> = ({at, dur = 0.55, kind = 'rise', dist = 22, style, children}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (at === undefined) return <div style={{...style}}>{children}</div>;
	const p = kind === 'pop' ? Math.min(1.06, spr(frame, at, 14, 0.7)) : step(t, at, dur, easeOut);
	const o = clamp01(kind === 'pop' ? p * 1.6 : p * 1.25);
	let transform = '';
	let filter = '';
	if (kind === 'rise') transform = `translateY(${(1 - p) * dist}px)`;
	if (kind === 'down') transform = `translateY(${-(1 - p) * dist}px)`;
	if (kind === 'left') transform = `translateX(${-(1 - p) * dist}px)`;
	if (kind === 'right') transform = `translateX(${(1 - p) * dist}px)`;
	if (kind === 'pop') transform = `scale(${0.85 + 0.15 * p})`;
	if (kind === 'blur' || kind === 'rise') filter = p < 1 ? `blur(${(1 - p) * (kind === 'blur' ? 10 : 4)}px)` : '';
	return (
		<div style={{...style, opacity: o * ((style?.opacity as number) ?? 1), transform: `${style?.transform ?? ''} ${transform}`, filter}}>
			{children}
		</div>
	);
};

/** Riff's selection flash: a blue box with handles + layer tag that blinks on when an element lands. */
export const Sel: React.FC<{at?: number; label?: string; inset?: number; hold?: number; radius?: number; scale?: number}> = ({
	at,
	label,
	inset = -6,
	hold = 0.75,
	radius = 4,
	scale = 1,
}) => {
	const t = useT();
	if (at === undefined || t < at || t > at + hold + 0.3) return null;
	const o = Math.min(clamp01((t - at) / 0.08), 1 - clamp01((t - at - hold) / 0.3));
	const c = '#3D7BFF';
	const hs = 9 * scale;
	const handle = (x: string, y: string) => (
		<div
			style={{
				position: 'absolute',
				[x]: -hs / 2,
				[y]: -hs / 2,
				width: hs,
				height: hs,
				background: '#fff',
				border: `${1.5 * scale}px solid ${c}`,
				borderRadius: 2 * scale,
			}}
		/>
	);
	return (
		<div style={{position: 'absolute', inset, border: `${1.5 * scale}px solid ${c}`, borderRadius: radius, opacity: o, pointerEvents: 'none', zIndex: 50}}>
			{handle('left', 'top')}
			{handle('right', 'top')}
			{handle('left', 'bottom')}
			{handle('right', 'bottom')}
			{label ? (
				<div
					style={{
						position: 'absolute',
						left: -1.5 * scale,
						top: -26 * scale,
						background: c,
						color: '#fff',
						fontFamily: SANS,
						fontWeight: 600,
						fontSize: 12 * scale,
						padding: `${3 * scale}px ${8 * scale}px`,
						borderRadius: 5 * scale,
						whiteSpace: 'nowrap',
						letterSpacing: '0.01em',
					}}
				>
					{label}
				</div>
			) : null}
		</div>
	);
};

export const HalfMark: React.FC<{size: number; color: string; stroke?: number}> = ({size, color, stroke = 2}) => (
	<svg width={size} height={size} viewBox="0 0 32 32" style={{display: 'block', flexShrink: 0}}>
		<circle cx={16} cy={16} r={14} fill="none" stroke={color} strokeWidth={stroke} />
		<path d="M16 2 A14 14 0 0 1 16 30 Z" fill={color} />
	</svg>
);

/** Image that "develops": mask wipe up + slow scale settle. */
export const DevImg: React.FC<{src: string; at?: number; style?: React.CSSProperties; pos?: string; dur?: number; zoom?: number; children?: React.ReactNode}> = ({
	src,
	at,
	style,
	pos = 'center',
	dur = 1.0,
	zoom = 1,
	children,
}) => {
	const t = useT();
	const p = at === undefined ? 1 : step(t, at, dur);
	const s = at === undefined ? 1 : 1.12 - 0.12 * step(t, at, dur * 2.2);
	return (
		<div style={{position: 'relative', overflow: 'hidden', ...style, clipPath: `inset(${(1 - p) * 100}% 0 0 0 round ${style?.borderRadius ?? 0}px)`}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `url(${src})`,
					backgroundSize: 'cover',
					backgroundPosition: pos,
					transform: `scale(${s * zoom})`,
				}}
			/>
			{children}
		</div>
	);
};
