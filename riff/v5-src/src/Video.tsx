import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, EnvOffset, envAt, f, inter, prog} from './theme';
import {DEMO_END} from './Demo';
import {Background} from './components';
import {Hook} from './Hook';
import {Reveal} from './Reveal';
import {Demo} from './Demo';
import {EndCard, Simul, Stats} from './Outro';
import {COLD, ColdOpen} from './ColdOpen';

const CAPTIONS: Array<{a: number; b: number; text: React.ReactNode}> = [
	{a: 0.4, b: 2.4, text: 'Every AI you’ve ever talked to…'},
	{a: 2.4, b: 3.9, text: <>…makes you <span style={{color: C.coral}}>wait.</span></>},
];

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const c = CAPTIONS.find((x) => t >= x.a && t < x.b);
	if (!c) return null;
	const p = prog(frame, c.a, 0.25);
	return (
		<div
			style={{
				position: 'absolute',
				bottom: 70,
				width: '100%',
				textAlign: 'center',
				fontFamily: inter,
				fontWeight: 700,
				fontSize: 64,
				letterSpacing: '-0.025em',
				color: C.white,
				opacity: p,
				transform: `translateY(${(1 - p) * 14}px)`,
				textShadow: '0 4px 30px rgba(0,0,0,0.8)',
			}}
		>
			{c.text}
		</div>
	);
};

const SFX: Array<{t: number; s: string; v: number}> = [
	{t: 0.5, s: 'pop', v: 0.5},
	{t: 3.6, s: 'whoosh', v: 0.5},
	{t: 4.0, s: 'pop', v: 0.35},
	{t: 4.83, s: 'pop', v: 0.3},
	{t: 6.07, s: 'pop', v: 0.3},
	{t: 7.15, s: 'pop', v: 0.3},
	{t: 7.9, s: 'whoosh', v: 0.4},
	{t: 13.7, s: 'whoosh', v: 0.5},
	{t: 14.9, s: 'pop', v: 0.45},
	{t: 15.5, s: 'pop', v: 0.3},
	{t: 16.3, s: 'pop', v: 0.3},
	{t: 18.1, s: 'pop', v: 0.35},
	{t: 19.3, s: 'chime', v: 0.35},
	{t: 21.25, s: 'chime', v: 0.4},
	{t: 22.6, s: 'pop', v: 0.4},
	{t: 23.4, s: 'whoosh', v: 0.3},
	{t: 24.7, s: 'whoosh', v: 0.5},
	{t: 32.8, s: 'whoosh', v: 0.45},
	{t: 34.3, s: 'chime', v: 0.35},
	{t: 35.2, s: 'whoosh', v: 0.35},
	{t: 37.45, s: 'pop', v: 0.35},
	{t: 38.9, s: 'pop', v: 0.35},
	{t: 39.55, s: 'whoosh', v: 0.35},
];

const D = 5.0; // extra seconds the longer demo adds

const DEMO_SFX: Array<{t: number; s: string; v: number}> = [
	{t: 14.9, s: 'pop', v: 0.45},
	{t: 15.5, s: 'pop', v: 0.3},
	{t: 16.3, s: 'pop', v: 0.3},
	{t: 20.55, s: 'pop', v: 0.35},
	{t: 21.2, s: 'chime', v: 0.35},
	{t: 22.85, s: 'chime', v: 0.4},
	{t: 26.0, s: 'pop', v: 0.4},
	{t: 26.55, s: 'whoosh', v: 0.3},
	{t: 27.9, s: 'pop', v: 0.3},
	{t: 29.7, s: 'whoosh', v: 0.5},
];

const Main: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const bgIntensity = interpolate(t, [0, 11.5, 12.0, 60], [0.35, 0.45, 1, 1]);
	const early = SFX.filter((s) => s.t < 13.8);
	const late = SFX.filter((s) => s.t > 30);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<Background intensity={bgIntensity} />
			{t < 12.1 && <Hook />}
			{t >= 11.9 && t < 14.3 && <Reveal />}
			{t >= 13.8 && t < DEMO_END + 0.6 && <Demo />}
			<Sequence from={f(D)}>
				<EnvOffset.Provider value={f(D)}>
					<Late />
				</EnvOffset.Provider>
			</Sequence>
			<Captions />
			<Audio src={staticFile('vo_mix2.wav')} volume={1} />
			<Audio
				src={staticFile('music2.wav')}
				volume={(fr) => {
					const v = Math.min(1, envAt('n', fr) + envAt('u', fr) + envAt('r', fr));
					const base = fr < f(12) ? 0.55 : 0.42;
					return base * (1 - 0.45 * v);
				}}
			/>
			{[...early, ...DEMO_SFX, ...late.map((s) => ({...s, t: s.t + D}))].map((s, i) => (
				<Sequence key={i} from={f(s.t)} durationInFrames={f(1)}>
					<Audio src={staticFile(`${s.s}.wav`)} volume={s.v} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};

// Scenes after the demo, on their original timeline
const Late: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	return (
		<AbsoluteFill>
			{t >= 24.9 && t < 33.3 && <Simul />}
			{t >= 32.9 && t < 41.0 && <Stats />}
			{t >= 40.7 && <EndCard />}
		</AbsoluteFill>
	);
};

export const TOTAL = COLD + 46 + 5.0;

export const RiffVideo: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{frame < f(COLD) + 2 && (
				<AbsoluteFill>
					<Background intensity={0.9} />
					<ColdOpen />
				</AbsoluteFill>
			)}
			<Audio src={staticFile('vo_cold.wav')} />
			<Audio src={staticFile('music_cold.wav')} volume={0.5} />
			<Sequence from={f(COLD)}>
				<Main />
			</Sequence>
		</AbsoluteFill>
	);
};
