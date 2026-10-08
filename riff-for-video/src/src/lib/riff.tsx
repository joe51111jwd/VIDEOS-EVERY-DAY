import React from 'react';
import {useCurrentFrame} from 'remotion';

// The Riff mark, same as the Riff v5 film: a glass squircle with five voice bars.
const squircle = (s: number, n = 5) => {
	const pts: string[] = [];
	for (let i = 0; i <= 96; i++) {
		const a = (i / 96) * Math.PI * 2;
		const c = Math.cos(a);
		const si = Math.sin(a);
		const x = Math.sign(c) * Math.abs(c) ** (2 / n);
		const y = Math.sign(si) * Math.abs(si) ** (2 / n);
		pts.push(`${(s / 2 + (x * s) / 2).toFixed(2)},${(s / 2 + (y * s) / 2).toFixed(2)}`);
	}
	return `M${pts.join('L')}Z`;
};

export const RiffGlyph: React.FC<{size: number; level?: number; color?: string; n?: number}> = ({size, level = 0.4, color = '#fff', n = 5}) => {
	const frame = useCurrentFrame();
	const shape = [0.42, 0.78, 1, 0.66, 0.38];
	const w = size * 0.085;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: w * 0.75, height: size * 0.5}}>
			{shape.slice(0, n).map((sh, i) => {
				const wob = 0.62 + 0.38 * Math.sin(frame * 0.42 + i * 1.7);
				const v = Math.max(0.32, Math.min(1, (0.3 + level * 0.9) * sh * (level > 0.05 ? wob : 1)));
				return <div key={i} style={{width: w, height: Math.max(w, v * size * 0.5), borderRadius: w, background: color}} />;
			})}
		</div>
	);
};

export const RiffIcon: React.FC<{size: number; level?: number; glow?: number}> = ({size, level = 0.35, glow = 0}) => {
	const d = squircle(size);
	return (
		<div style={{width: size, height: size, position: 'relative', flexShrink: 0}}>
			{glow > 0 ? (
				<div
					style={{
						position: 'absolute',
						inset: -size * 0.35,
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(255,170,120,0.55) 0%, rgba(255,120,150,0.25) 40%, transparent 70%)',
						opacity: glow,
						filter: `blur(${size * 0.12}px)`,
					}}
				/>
			) : null}
			<svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<defs>
					<linearGradient id={`rg${size}`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#45454A" />
						<stop offset="0.55" stopColor="#1C1C1F" />
						<stop offset="1" stopColor="#0B0B0C" />
					</linearGradient>
					<radialGradient id={`rh${size}`} cx="0.5" cy="0" r="0.75">
						<stop offset="0" stopColor="rgba(255,255,255,0.32)" />
						<stop offset="1" stopColor="rgba(255,255,255,0)" />
					</radialGradient>
				</defs>
				<path d={d} fill={`url(#rg${size})`} style={{filter: `drop-shadow(0 ${size * 0.06}px ${size * 0.12}px rgba(0,0,0,0.35))`}} />
				<path d={d} fill={`url(#rh${size})`} />
				<path d={d} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={Math.max(0.8, size * 0.012)} />
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<RiffGlyph size={size} level={level} />
			</div>
		</div>
	);
};
