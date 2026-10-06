import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, f, inter, mono, prog, serif} from './theme';
import {GradText, Orb} from './components';
import {JazzPoster} from './Poster';
import envCold from './env_cold.json';

const lvl = (k: 'u' | 'n', fr: number) => {
	const a = (envCold as Record<string, number[]>)[k];
	return a[Math.max(0, Math.min(a.length - 1, fr))] ?? 0;
};

const LINES = [
	{t: 0.0, act: 0.55, text: 'Make it blue…'},
	{t: 0.95, act: 1.3, text: 'no, green!'},
	{t: 1.75, act: 1.95, text: 'Bigger title.'},
	{t: 2.55, act: 3.0, text: 'Add a saxophone…'},
	{t: 3.5, act: 3.85, text: 'on the left.'},
];

export const ColdOpen: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const settle = prog(frame, 4.25, 0.8);
	const out = prog(frame, 8.05, 0.45);
	const linesOut = prog(frame, 4.25, 0.35);
	const h1 = prog(frame, 4.5, 0.45);
	const h2 = prog(frame, 6.86, 0.45);
	const push = interpolate(frame, [0, f(8.5)], [1.0, 1.06]);
	const ripple = LINES.reduce((acc, l) => acc + Math.max(0, 1 - Math.abs(frame - f(l.act)) / 6), 0);
	return (
		<AbsoluteFill
			style={{
				opacity: 1 - out,
				filter: `blur(${out * 14}px)`,
				transform: `scale(${push + out * 0.1})`,
			}}
		>
			{/* poster */}
			<div
				style={{
					position: 'absolute',
					left: 560 - 256,
					top: 540 - 320,
					transform: `scale(${1.3 - settle * 0.12 + ripple * 0.015})`,
				}}
			>
				<JazzPoster tl={{blue: 0.55, green: 1.3, big: 1.95, sax: 3.0, left: 3.85}} id="cold" />
			</div>
			{/* live transcript on the right */}
			<div style={{position: 'absolute', left: 1040, top: 210, width: 820, opacity: 1 - linesOut, transform: `translateY(${-linesOut * 40}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 34}}>
					<Orb size={34} level={lvl('u', frame)} />
					<div style={{fontFamily: mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.16em', color: C.dim}}>LISTENING</div>
				</div>
				{LINES.map((l, i) => {
					if (t < l.t) return null;
					const p = i === 0 ? 1 : prog(frame, l.t, 0.25);
					const next = LINES[i + 1];
					const current = !next || t < next.t;
					const done = prog(frame, l.act, 0.2);
					return (
						<div
							key={i}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 22,
								fontFamily: inter,
								fontWeight: 800,
								fontSize: 76,
								letterSpacing: '-0.04em',
								lineHeight: 1.18,
								color: current ? C.white : '#4d4d58',
								opacity: p,
								transform: `translateY(${(1 - p) * 24}px)`,
							}}
						>
							{current ? <GradText>{l.text}</GradText> : l.text}
							<span
								style={{
									fontFamily: mono,
									fontSize: 24,
									fontWeight: 700,
									letterSpacing: 0,
									color: '#3BE38F',
									opacity: done,
									transform: `scale(${0.6 + done * 0.4})`,
								}}
							>
								✓ done
							</span>
						</div>
					);
				})}
			</div>
			{/* the payoff line */}
			<div style={{position: 'absolute', left: 1010, top: 360, width: 880}}>
				<div
					style={{
						fontFamily: inter,
						fontWeight: 800,
						fontSize: 84,
						letterSpacing: '-0.045em',
						lineHeight: 1.02,
						color: C.white,
						opacity: h1,
						transform: `translateY(${(1 - h1) * 30}px)`,
						filter: `blur(${(1 - h1) * 8}px)`,
					}}
				>
					That poster designed itself…
				</div>
				<div
					style={{
						marginTop: 26,
						fontFamily: inter,
						fontWeight: 800,
						fontSize: 84,
						letterSpacing: '-0.045em',
						lineHeight: 1.02,
						opacity: h2,
						transform: `translateY(${(1 - h2) * 30}px)`,
						filter: `blur(${(1 - h2) * 8}px)`,
					}}
				>
					<GradText>while she was still talking.</GradText>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const COLD = 8.5;
