import React from 'react';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {L, LF} from '../lib/theme';
import {SEAM} from './Logo3D';

export const ce = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

/** piecewise keyframes: kf(f, [[frame, value], ...]) with one easing per segment */
export const kf = (f: number, keys: [number, number][], easing = easeInOut) =>
	keys.length === 1
		? keys[0][1]
		: interpolate(
				f,
				keys.map((k) => k[0]),
				keys.map((k) => k[1]),
				{...ce, easing},
			);

/* ------------------------------------------------------------------ 3D space (CSS) */
export type Cam = {x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number};
const P = 1200; // viewer distance: an object at z = -1200 with the camera at 0 shows at native size
const CamCtx = React.createContext<{cam: Required<Cam>; focus: number; aperture: number}>({
	cam: {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0},
	focus: P,
	aperture: 0,
});

/**
 * A 3D stage. The camera sits at (x, y, z) looking down -z; rx/ry/rz in degrees.
 * focus = distance from the camera that is sharp; aperture = blur px per 1000 px off focus.
 */
export const Space: React.FC<{cam: Cam; focus?: number; aperture?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
	cam,
	focus = P,
	aperture = 0,
	children,
	style,
}) => {
	const c = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, ...cam};
	return (
		<CamCtx.Provider value={{cam: c, focus, aperture}}>
			<AbsoluteFill style={{perspective: P, perspectiveOrigin: '50% 50%', overflow: 'hidden', ...style}}>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						transformStyle: 'preserve-3d',
						transform: `translateZ(${P}px) rotateZ(${-c.rz}deg) rotateX(${-c.rx}deg) rotateY(${-c.ry}deg) translate3d(${-c.x}px, ${-c.y}px, ${-c.z}px)`,
					}}
				>
					{children}
				</div>
			</AbsoluteFill>
		</CamCtx.Provider>
	);
};

/** An object in the space, centred on (x, y, z). Depth of field blurs it by its distance from focus. */
export const Obj: React.FC<{
	x?: number;
	y?: number;
	z?: number;
	rx?: number;
	ry?: number;
	rz?: number;
	scale?: number;
	opacity?: number;
	dof?: boolean;
	flat?: boolean;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, scale = 1, opacity = 1, dof = true, flat = true, children, style}) => {
	const {cam, focus, aperture} = React.useContext(CamCtx);
	const dist = cam.z - z;
	const blur = dof && aperture > 0 ? Math.min(28, (Math.abs(dist - focus) / 1000) * aperture) : 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				transformStyle: flat ? undefined : 'preserve-3d',
				transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale}) translate(-50%, -50%)`,
				opacity,
				filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};

/* ------------------------------------------------------------------ finishing */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
	const f = useCurrentFrame();
	const ox = (f * 137) % 512;
	const oy = (f * 251) % 512;
	return (
		<AbsoluteFill
			style={{
				backgroundImage: `url(${staticFile('grain.png')})`,
				backgroundPosition: `${ox}px ${oy}px`,
				opacity,
				mixBlendMode: 'overlay',
				pointerEvents: 'none',
			}}
		/>
	);
};
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: 'none'}} />
);
export const Flash: React.FC<{at: number; dur?: number; peak?: number; color?: string}> = ({at, dur = 8, peak = 0.7, color = '#fff'}) => {
	const f = useCurrentFrame();
	const o = interpolate(f - at, [0, 1, dur], [0, peak, 0], ce);
	return o > 0 ? <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none', mixBlendMode: 'screen'}} /> : null;
};

/* ------------------------------------------------------------------ type */
type Part = {t: string; c?: 'ink' | 'mint' | 'sub' | 'red' | 'amber'};
const fill = {
	ink: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 45%, #B9BAC1 100%)',
	mint: 'linear-gradient(180deg, #CFFFEA 0%, #5CF7BE 45%, #19C98B 100%)',
	sub: 'linear-gradient(180deg, #A1A1A6 0%, #6E6E73 100%)',
	red: 'linear-gradient(180deg, #FFB4AE 0%, #FF5B4F 50%, #E0352A 100%)',
	amber: 'linear-gradient(180deg, #FFF1B0 0%, #FFD60A 55%, #E5A900 100%)',
};
const glow = {
	ink: 'rgba(255,255,255,0.18)',
	mint: 'rgba(61,245,176,0.55)',
	sub: 'rgba(0,0,0,0)',
	red: 'rgba(255,69,58,0.55)',
	amber: 'rgba(255,214,10,0.5)',
};

/**
 * A headline that arrives word by word: each word rises out of a blur. `at` is the local frame
 * the first word lands; words follow `stagger` frames apart.
 */
export const Title: React.FC<{
	parts: Part[];
	at: number;
	size: number;
	weight?: number;
	stagger?: number;
	align?: 'left' | 'center' | 'right';
	out?: number;
	width?: number;
	lh?: number;
	tracking?: number;
}> = ({parts, at, size, weight = 600, stagger = 2, align = 'center', out, width, lh = 1.04, tracking = -0.045}) => {
	const f = useCurrentFrame();
	const words: {w: string; c: Part['c']; br: boolean}[] = [];
	parts.forEach((p) => {
		const lines = p.t.split('\n');
		lines.forEach((ln, li) => {
			ln.split(' ')
				.filter(Boolean)
				.forEach((w) => words.push({w, c: p.c ?? 'ink', br: false}));
			if (li < lines.length - 1) words.push({w: '', c: 'ink', br: true});
		});
	});
	const gone = out === undefined ? 0 : interpolate(f - out, [0, 8], [0, 1], {...ce, easing: easeIn});
	let i = 0;
	return (
		<div
			style={{
				width,
				fontFamily: LF.sans,
				fontWeight: weight,
				fontSize: size,
				lineHeight: lh,
				letterSpacing: `${tracking}em`,
				textAlign: align,
				opacity: 1 - gone,
				filter: gone > 0 ? `blur(${gone * 16}px)` : undefined,
				transform: gone > 0 ? `translateY(${-gone * size * 0.3}px)` : undefined,
			}}
		>
			{words.map((wd, k) => {
				if (wd.br) return <br key={k} />;
				const t = f - (at + i++ * stagger);
				const p = interpolate(t, [0, 12], [0, 1], {...ce, easing: easeOut});
				const c = wd.c ?? 'ink';
				return (
					<span
						key={k}
						style={{
							display: 'inline-block',
							marginRight: '0.24em',
							opacity: interpolate(t, [0, 6], [0, 1], ce),
							transform: `translateY(${(1 - p) * 0.35}em)`,
							filter: `blur(${(1 - p) * 14}px) drop-shadow(0 0 ${size * 0.18}px ${glow[c]})`,
							background: fill[c],
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
							paddingBottom: '0.08em',
						}}
					>
						{wd.w}
					</span>
				);
			})}
		</div>
	);
};

/** a small caption line (mono, tracked caps) for eyebrows */
export const Eyebrow: React.FC<{text: string; at: number; color?: string; size?: number}> = ({text, at, color = L.sub, size = 26}) => {
	const f = useCurrentFrame();
	const o = interpolate(f - at, [0, 8], [0, 1], ce);
	return <div style={{fontFamily: LF.mono, fontSize: size, letterSpacing: '0.16em', textTransform: 'uppercase', color, opacity: o}}>{text}</div>;
};

/* ------------------------------------------------------------------ flat mark (UI icon) */
export const MarkFlat: React.FC<{size: number; glow?: number}> = ({size, glow = 1}) => {
	const pts = SEAM.map(([x, y]) => `${(x + 1) * 50},${(1 - y) * 50}`).join(' ');
	return (
		<svg width={size} height={size} viewBox="-6 -6 112 112">
			<defs>
				<linearGradient id="mk" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#3A3E46" />
					<stop offset="1" stopColor="#15171B" />
				</linearGradient>
			</defs>
			<rect x="0" y="0" width="100" height="100" rx="25" fill="url(#mk)" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" />
			<polyline points={pts} fill="none" stroke="#3DF5B0" strokeWidth="5" strokeLinejoin="miter" opacity={glow} style={{filter: 'drop-shadow(0 0 3px rgba(61,245,176,0.8))'}} />
		</svg>
	);
};

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
