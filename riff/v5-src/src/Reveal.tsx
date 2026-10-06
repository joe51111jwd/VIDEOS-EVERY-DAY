import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, envAt, f, inter, prog} from './theme';
import {Orb, Wordmark} from './components';

export const Reveal: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - f(12.0), fps, config: {damping: 13, mass: 0.8}});
	const w = spring({frame: frame - f(12.35), fps, config: {damping: 16}});
	const sub = prog(frame, 12.8, 0.5);
	const out = prog(frame, 13.75, 0.4);
	const flash = Math.max(0, 1 - (frame - f(12.0)) / 8);
	const lvl = envAt('n', frame);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<AbsoluteFill style={{background: 'white', opacity: flash * 0.5}} />
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 56 * w,
					opacity: 1 - out,
					transform: `scale(${1 + out * 0.15})`,
					filter: `blur(${out * 10}px)`,
				}}
			>
				<div style={{transform: `scale(${s})`}}>
					<Orb size={230} level={lvl} />
				</div>
				<div
					style={{
						overflow: 'hidden',
						width: 470 * w,
						opacity: w,
					}}
				>
					<Wordmark size={250} style={{transform: `translateX(${(1 - w) * -120}px)`}} />
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					top: 720,
					fontFamily: inter,
					fontWeight: 500,
					fontSize: 38,
					letterSpacing: '0.02em',
					color: C.dim,
					opacity: sub * (1 - out),
					transform: `translateY(${(1 - sub) * 16}px)`,
				}}
			>
				Voice-first design, live as you speak.
			</div>
		</AbsoluteFill>
	);
};
