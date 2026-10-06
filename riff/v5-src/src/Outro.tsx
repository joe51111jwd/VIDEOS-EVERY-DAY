import React, {useContext} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EnvOffset, envAt, f, inter, mono, prog, serif} from './theme';
import {GradText, Orb, Saxophone, VoiceBars, Wordmark} from './components';

const Headline: React.FC<{t0: number; t1: number; children: React.ReactNode; size?: number; top?: number}> = ({
	t0,
	t1,
	children,
	size = 92,
	top = 150,
}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, t0, 0.4);
	const o = prog(frame, t1 - 0.25, 0.25);
	if (frame < f(t0) || frame > f(t1)) return null;
	return (
		<div
			style={{
				position: 'absolute',
				top,
				width: '100%',
				textAlign: 'center',
				fontFamily: inter,
				fontWeight: 800,
				fontSize: size,
				letterSpacing: '-0.04em',
				lineHeight: 1.05,
				color: C.white,
				opacity: p * (1 - o),
				transform: `translateY(${(1 - p) * 26 - o * 20}px)`,
				filter: `blur(${(1 - p) * 8}px)`,
			}}
		>
			{children}
		</div>
	);
};

const Pop: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, t, 0.35);
	return (
		<span
			style={{
				display: 'inline-block',
				opacity: p,
				transform: `translateY(${(1 - p) * 30}px)`,
				filter: `blur(${(1 - p) * 6}px)`,
			}}
		>
			{children}
		</span>
	);
};

// ---------- At the same time ----------
const CHIPS = [
	{x: 0.06, text: '+ poster'},
	{x: 0.19, text: '+ title'},
	{x: 0.32, text: 'mood: moody'},
	{x: 0.45, text: 'bg → blue'},
	{x: 0.58, text: '↺ green'},
	{x: 0.71, text: '+ sax'},
	{x: 0.84, text: '← left'},
];
export const Simul: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const appear = prog(frame, 24.95, 0.5);
	const out = prog(frame, 32.75, 0.35);
	const head = interpolate(t, [25.3, 32.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const W = 1480;
	return (
		<AbsoluteFill style={{opacity: appear * (1 - out)}}>
			<Headline t0={25.2} t1={27.65}>
				Riff designs while you’re
				<br />
				<GradText>still talking.</GradText>
			</Headline>
			<Headline t0={27.65} t1={31.45}>
				It <Pop t={27.7}>listens.</Pop> <Pop t={28.44}>Builds.</Pop>
				<br />
				<Pop t={29.13}>
					<GradText>Changes its mind mid-sentence.</GradText>
				</Pop>
			</Headline>
			<Headline t0={31.45} t1={33.2} size={120} top={190}>
				Just like <GradText>you</GradText> do.
			</Headline>
			<div style={{position: 'absolute', left: (1920 - W - 150) / 2, top: 520, width: W + 150}}>
				<div style={{fontFamily: mono, fontSize: 20, fontWeight: 700, letterSpacing: '0.14em', color: C.dim, marginLeft: 150, marginBottom: 18}}>
					BOTH STREAMS · AT THE SAME TIME
				</div>
				{['YOU', 'RIFF'].map((label, row) => (
					<div key={label} style={{display: 'flex', alignItems: 'center', height: 110, marginBottom: 16}}>
						<div style={{width: 150, fontFamily: mono, fontSize: 28, fontWeight: 700, color: row ? C.violet : C.coral}}>{label}</div>
						<div
							style={{
								position: 'relative',
								width: W,
								height: 100,
								borderRadius: 20,
								background: 'rgba(255,255,255,0.04)',
								border: '1px solid rgba(255,255,255,0.07)',
								overflow: 'hidden',
							}}
						>
							{row === 0 ? (
								<div
									style={{
										position: 'absolute',
										left: 0,
										top: 0,
										height: 100,
										width: head * W,
										display: 'flex',
										alignItems: 'center',
										gap: 5,
										padding: '0 10px',
										overflow: 'hidden',
									}}
								>
									{new Array(150).fill(0).map((_, k) => (
										<div
											key={k}
											style={{
												width: 5,
												flexShrink: 0,
												borderRadius: 3,
												background: `linear-gradient(180deg, ${C.coral}, ${C.pink})`,
												height: 12 + 62 * Math.abs(Math.sin(k * 0.73) * Math.cos(k * 0.29 + 1)),
											}}
										/>
									))}
								</div>
							) : (
								CHIPS.map((c) => {
									const vis = prog(frame, 25.3 + c.x * 7.3, 0.3);
									return (
										<div
											key={c.text}
											style={{
												position: 'absolute',
												left: c.x * W,
												top: 22,
												padding: '12px 18px',
												borderRadius: 14,
												background: 'rgba(124,92,255,0.18)',
												border: `1px solid ${C.violet}88`,
												color: '#E6E0FF',
												fontFamily: mono,
												fontWeight: 700,
												fontSize: 22,
												whiteSpace: 'nowrap',
												opacity: vis,
												transform: `scale(${0.7 + 0.3 * vis})`,
											}}
										>
											{c.text}
										</div>
									);
								})
							)}
						</div>
					</div>
				))}
				<div
					style={{
						position: 'absolute',
						left: 150 + head * W,
						top: 44,
						width: 3,
						height: 236,
						background: C.white,
						boxShadow: `0 0 16px ${C.white}`,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

// ---------- Stats / claims ----------
const Struck: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => {
	const frame = useCurrentFrame();
	const s = prog(frame, t + 0.35, 0.35);
	return (
		<div style={{position: 'relative', display: 'inline-block'}}>
			<div style={{opacity: 1 - s * 0.6, filter: `grayscale(${s})`}}>{children}</div>
			<div
				style={{
					position: 'absolute',
					left: -20,
					top: '50%',
					height: 8,
					width: `calc((100% + 40px) * ${s})`,
					background: C.coral,
					borderRadius: 4,
					transform: 'rotate(-8deg)',
					boxShadow: `0 0 20px ${C.coral}`,
				}}
			/>
		</div>
	);
};

export const Stats: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / 30;
	const num = interpolate(t, [33.15, 34.3], [0, 2.0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const layers = spring({frame: frame - f(35.2), fps, config: {damping: 16}});
	const p1 = prog(frame, 33.05, 0.4);
	return (
		<AbsoluteFill>
			{/* 2.0s */}
			{t < 35.15 && (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: p1 * (1 - prog(frame, 34.9, 0.25))}}>
					<div style={{fontFamily: inter, fontWeight: 800, fontSize: 330, letterSpacing: '-0.06em', lineHeight: 1}}>
						<GradText>{num.toFixed(1)}s</GradText>
					</div>
					<div style={{fontFamily: inter, fontWeight: 600, fontSize: 52, color: C.white, marginTop: 10}}>to first pixels on screen</div>
				</AbsoluteFill>
			)}
			{/* layers */}
			{t >= 35.05 && t < 37.15 && (
				<AbsoluteFill style={{alignItems: 'center', opacity: prog(frame, 35.05, 0.3) * (1 - prog(frame, 36.9, 0.25))}}>
					<div style={{position: 'absolute', top: 760, fontFamily: inter, fontWeight: 800, fontSize: 92, letterSpacing: '-0.04em', color: C.white}}>
						Real, <GradText>editable</GradText> designs.
					</div>
					<div style={{position: 'absolute', top: 120, width: 1000, height: 600, perspective: 1800}}>
						{[
							{label: 'Background', z: 0},
							{label: 'Saxophone', z: 1},
							{label: 'Title', z: 2},
						].map((l, i) => (
							<div
								key={l.label}
								style={{
									position: 'absolute',
									left: 330,
									top: 70,
									width: 340,
									height: 425,
									borderRadius: 12,
									transformStyle: 'preserve-3d',
									transform: `rotateX(58deg) rotateZ(-38deg) translateZ(${layers * (l.z * 120 - 120)}px)`,
									background: i === 0 ? '#0B4B35' : 'rgba(255,255,255,0.04)',
									border: i === 0 ? 'none' : '2px dashed rgba(255,255,255,0.35)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: i === 0 ? '0 30px 60px rgba(0,0,0,0.5)' : 'none',
								}}
							>
								{i === 1 && (
									<div style={{position: 'absolute', left: 20, top: 170}}>
										<Saxophone size={220} />
									</div>
								)}
								{i === 2 && (
									<div style={{position: 'absolute', top: 24, width: '100%', textAlign: 'center', fontFamily: serif, fontSize: 86, lineHeight: 0.92, color: '#F6EBD6'}}>
										Jazz
										<br />
										<i>Night</i>
									</div>
								)}
							</div>
						))}
						{['Title', 'Saxophone', 'Background'].map((lab, i) => (
							<div
								key={lab}
								style={{
									position: 'absolute',
									left: 760,
									top: 140 + i * 130,
									fontFamily: mono,
									fontWeight: 700,
									fontSize: 26,
									color: C.dim,
									opacity: prog(frame, 35.5 + i * 0.15, 0.3),
								}}
							>
								◧ {lab}
							</div>
						))}
					</div>
				</AbsoluteFill>
			)}
			{/* no text box / no send button */}
			{t >= 37.05 && t < 39.6 && (
				<AbsoluteFill style={{alignItems: 'center', opacity: prog(frame, 37.05, 0.3) * (1 - prog(frame, 39.35, 0.25))}}>
					<div style={{position: 'absolute', top: 330, display: 'flex', gap: 30, alignItems: 'center'}}>
						<Struck t={37.12}>
							<div
								style={{
									width: 820,
									height: 120,
									borderRadius: 28,
									background: 'rgba(255,255,255,0.06)',
									border: '2px solid rgba(255,255,255,0.15)',
									display: 'flex',
									alignItems: 'center',
									padding: '0 40px',
									fontFamily: inter,
									fontSize: 44,
									color: '#6a6a75',
								}}
							>
								Type a message…
								<span style={{opacity: Math.floor(frame / 15) % 2 ? 1 : 0, color: C.white, marginLeft: 4}}>|</span>
							</div>
						</Struck>
						<div style={{opacity: prog(frame, 38.5, 0.25)}}>
							<Struck t={38.54}>
								<div
									style={{
										width: 120,
										height: 120,
										borderRadius: 60,
										background: '#2f2f3a',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 64,
										color: C.white,
										fontFamily: inter,
										fontWeight: 700,
									}}
								>
									↑
								</div>
							</Struck>
						</div>
					</div>
					<div style={{position: 'absolute', top: 620, fontFamily: inter, fontWeight: 800, fontSize: 92, letterSpacing: '-0.04em', color: C.white}}>
						<Pop t={37.12}>No text box.</Pop> <Pop t={38.54}>No send button.</Pop>
					</div>
				</AbsoluteFill>
			)}
			{/* just talk */}
			{t >= 39.5 && t < 40.9 && (
				<AbsoluteFill
					style={{
						alignItems: 'center',
						justifyContent: 'center',
						opacity: prog(frame, 39.55, 0.2) * (1 - prog(frame, 40.6, 0.3)),
					}}
				>
					<div
						style={{
							fontFamily: inter,
							fontWeight: 800,
							fontSize: 220,
							letterSpacing: '-0.05em',
							transform: `scale(${1.15 - 0.15 * prog(frame, 39.55, 0.4)})`,
						}}
					>
						<GradText>Just talk.</GradText>
					</div>
					<div style={{marginTop: 30}}>
						<VoiceBars n={40} width={700} height={90} gap={6} color={C.white} src={['n']} />
					</div>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};

// ---------- End card ----------
export const EndCard: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - f(40.85), fps, config: {damping: 13}});
	const w = spring({frame: frame - f(41.05), fps, config: {damping: 16}});
	const tag = prog(frame, 41.5, 0.5);
	const foot = prog(frame, 42.6, 0.6);
	const fadeOut = prog(frame, 45.3, 0.7);
	const off = useContext(EnvOffset);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - fadeOut}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 50 * w, marginTop: -80}}>
				<div style={{transform: `scale(${s})`}}>
					<Orb size={200} level={envAt('n', frame + off)} />
				</div>
				<div style={{overflow: 'hidden', width: 440 * w, opacity: w}}>
					<Wordmark size={230} />
				</div>
			</div>
			<div
				style={{
					marginTop: 60,
					fontFamily: inter,
					fontWeight: 600,
					fontSize: 58,
					letterSpacing: '-0.02em',
					color: C.white,
					opacity: tag,
					transform: `translateY(${(1 - tag) * 20}px)`,
				}}
			>
				Design at the speed of <GradText>your voice.</GradText>
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 80,
					fontFamily: mono,
					fontWeight: 500,
					fontSize: 24,
					letterSpacing: '0.18em',
					color: C.dim,
					opacity: foot,
				}}
			>
				RIFF 2.0 · FOR MAC
			</div>
		</AbsoluteFill>
	);
};
