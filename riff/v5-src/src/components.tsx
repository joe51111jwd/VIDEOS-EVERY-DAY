import React, {useContext} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, EnvOffset, envAt, GRAD, inter} from './theme';

export const Background: React.FC<{intensity?: number}> = ({intensity = 1}) => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const b1x = 30 + Math.sin(t * 0.35) * 12;
	const b1y = 30 + Math.cos(t * 0.27) * 10;
	const b2x = 70 + Math.cos(t * 0.3) * 12;
	const b2y = 70 + Math.sin(t * 0.22) * 10;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill
				style={{
					opacity: 0.55 * intensity,
					background: `radial-gradient(40% 50% at ${b1x}% ${b1y}%, ${C.coral}55 0%, transparent 70%),
					radial-gradient(45% 55% at ${b2x}% ${b2y}%, ${C.violet}66 0%, transparent 70%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					background: 'radial-gradient(80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.75) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};

// The Riff orb: a rotating gradient sphere with voice-reactive rings
export const Orb: React.FC<{size: number; level?: number}> = ({size, level = 0}) => {
	const frame = useCurrentFrame();
	const rot = frame * 2.2;
	const pulse = 1 + level * 0.12 + Math.sin(frame / 9) * 0.015;
	return (
		<div style={{position: 'relative', width: size, height: size}}>
			{[0, 1, 2].map((i) => {
				const ph = ((frame / 30 + i * 0.6) % 1.8) / 1.8;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							inset: 0,
							borderRadius: '50%',
							border: `2px solid ${i % 2 ? C.violet : C.pink}`,
							transform: `scale(${1 + ph * (0.6 + level * 0.8)})`,
							opacity: (1 - ph) * (0.25 + level * 0.6),
						}}
					/>
				);
			})}
			<div
				style={{
					position: 'absolute',
					inset: -size * 0.35,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${C.pink}66 0%, ${C.violet}22 40%, transparent 70%)`,
					filter: 'blur(20px)',
					opacity: 0.7 + level * 0.3,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: '50%',
					transform: `scale(${pulse}) rotate(${rot}deg)`,
					background: `conic-gradient(from 0deg, ${C.coral}, ${C.pink}, ${C.violet}, #3EC8FF, ${C.coral})`,
					boxShadow: `inset 0 0 ${size * 0.25}px rgba(255,255,255,0.45)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: size * 0.06,
					borderRadius: '50%',
					transform: `scale(${pulse})`,
					background:
						'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.15) 30%, transparent 60%)',
					mixBlendMode: 'screen',
				}}
			/>
		</div>
	);
};

export const Wordmark: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
	<div
		style={{
			fontFamily: inter,
			fontWeight: 800,
			fontSize: size,
			letterSpacing: '-0.055em',
			lineHeight: 1,
			color: C.white,
			...style,
		}}
	>
		Riff
	</div>
);

export const GradText: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<span
		style={{
			background: GRAD,
			WebkitBackgroundClip: 'text',
			backgroundClip: 'text',
			color: 'transparent',
			...style,
		}}
	>
		{children}
	</span>
);

// Bars that react to a voice envelope
export const VoiceBars: React.FC<{
	n: number;
	width: number;
	height: number;
	color: string;
	src: Array<'n' | 'u' | 'r'>;
	gap?: number;
	min?: number;
}> = ({n, width, height, color, src, gap = 4, min = 0.08}) => {
	const frame = useCurrentFrame();
	const off = useContext(EnvOffset);
	const lvl = Math.min(1, src.reduce((a, k) => a + envAt(k, frame + off), 0));
	const bw = (width - gap * (n - 1)) / n;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap, width, height}}>
			{new Array(n).fill(0).map((_, i) => {
				const w = Math.sin(i * 1.7 + frame * 0.45) * 0.5 + 0.5;
				const w2 = Math.sin(i * 0.9 - frame * 0.31) * 0.5 + 0.5;
				const center = 1 - Math.abs(i - (n - 1) / 2) / (n / 2);
				const h = Math.max(min, lvl * (0.35 + 0.65 * w * w2) * (0.4 + 0.6 * center));
				return <div key={i} style={{width: bw, height: h * height, borderRadius: bw, background: color}} />;
			})}
		</div>
	);
};

export const Saxophone: React.FC<{size: number; color?: string}> = ({size, color = '#E9B44C'}) => (
	<svg width={size * 0.6} height={size} viewBox="0 0 120 200" style={{overflow: 'visible'}}>
		{/* mouthpiece + neck */}
		<path d="M30 8 L44 6 L52 22" stroke="#1d1d1f" strokeWidth={7} strokeLinecap="round" fill="none" />
		<path d="M50 20 Q62 30 60 48" stroke={color} strokeWidth={11} strokeLinecap="round" fill="none" />
		{/* body */}
		<path
			d="M60 46 L58 140 Q57 182 82 180 Q100 178 100 150 L102 120"
			stroke={color}
			strokeWidth={20}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		/>
		{/* bell */}
		<path d="M90 122 Q96 98 120 92 L122 104 Q110 110 112 124 Z" fill={color} />
		<ellipse cx={116} cy={98} rx={9} ry={7} fill="#B07D22" />
		{/* keys */}
		{[62, 80, 98, 116, 134].map((y, i) => (
			<circle key={i} cx={54} cy={y} r={4.5} fill="#FFF3D6" stroke="#B07D22" strokeWidth={1.5} />
		))}
		<path d="M62 150 Q64 168 78 170" stroke="#FFF3D6" strokeWidth={2.5} fill="none" opacity={0.7} />
	</svg>
);
