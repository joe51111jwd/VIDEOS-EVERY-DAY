import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, f, inter, mono, prog} from './theme';
import {GradText} from './components';

// ---------- Part A: the waiting chat ----------
const ChatWait: React.FC = () => {
	const frame = useCurrentFrame();
	const appear = prog(frame, 0.0, 0.7);
	const out = prog(frame, 3.55, 0.45);
	const bubble = prog(frame, 0.5, 0.5);
	const typing = prog(frame, 1.1, 0.4);
	const waited = Math.max(0, frame / 30 - 1.1);
	const dots = [0, 1, 2].map((i) => 0.3 + 0.7 * Math.max(0, Math.sin(frame / 5 - i * 0.9)));
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					width: 980,
					height: 560,
					marginTop: -60,
					borderRadius: 32,
					background: 'rgba(22,22,28,0.82)',
					border: '1px solid rgba(255,255,255,0.08)',
					boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
					opacity: appear * (1 - out),
					transform: `translateY(${(1 - appear) * 40}px) scale(${1 - out * 0.08})`,
					filter: `blur(${out * 12}px)`,
					display: 'flex',
					flexDirection: 'column',
					fontFamily: inter,
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						height: 70,
						display: 'flex',
						alignItems: 'center',
						padding: '0 30px',
						gap: 12,
						borderBottom: '1px solid rgba(255,255,255,0.07)',
						color: C.dim,
						fontSize: 22,
						fontWeight: 600,
					}}
				>
					<div style={{width: 12, height: 12, borderRadius: 6, background: '#4a4a55'}} />
					AI Chat
					<div style={{flex: 1}} />
					<div style={{fontFamily: mono, fontSize: 22, color: waited > 0 ? C.coral : C.dim}}>
						waiting {waited.toFixed(1)}s
					</div>
				</div>
				<div style={{flex: 1, padding: 40, display: 'flex', flexDirection: 'column', gap: 26}}>
					<div
						style={{
							alignSelf: 'flex-end',
							maxWidth: 560,
							padding: '20px 28px',
							borderRadius: 26,
							borderBottomRightRadius: 8,
							background: '#2B2B35',
							color: C.white,
							fontSize: 30,
							fontWeight: 500,
							opacity: bubble,
							transform: `translateY(${(1 - bubble) * 20}px) scale(${0.9 + bubble * 0.1})`,
						}}
					>
						make me a poster for my jazz night
					</div>
					<div
						style={{
							alignSelf: 'flex-start',
							padding: '24px 30px',
							borderRadius: 26,
							borderBottomLeftRadius: 8,
							background: '#1C1C24',
							display: 'flex',
							gap: 12,
							opacity: typing,
						}}
					>
						{dots.map((o, i) => (
							<div key={i} style={{width: 16, height: 16, borderRadius: 8, background: C.dim, opacity: o}} />
						))}
					</div>
				</div>
				<div style={{padding: 26, display: 'flex', gap: 14}}>
					<div
						style={{
							flex: 1,
							height: 64,
							borderRadius: 18,
							background: '#121218',
							border: '1px solid rgba(255,255,255,0.08)',
							color: '#55555f',
							fontSize: 24,
							display: 'flex',
							alignItems: 'center',
							padding: '0 22px',
						}}
					>
						Type a message…
					</div>
					<div
						style={{
							width: 64,
							height: 64,
							borderRadius: 18,
							background: '#2B2B35',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: C.dim,
							fontSize: 30,
						}}
					>
						↑
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------- Part B: kinetic turn-taking ----------
const WORDS: Array<{t: number; text: string; status: string; who: 'you' | 'ai'}> = [
	{t: 4.0, text: 'You talk.', status: '● you are speaking', who: 'you'},
	{t: 4.83, text: 'It waits.', status: '◌ waiting for you to stop', who: 'ai'},
	{t: 6.07, text: 'It thinks.', status: '◌ thinking…', who: 'ai'},
	{t: 7.15, text: 'It answers.', status: '● finally responding', who: 'ai'},
];
const Kinetic: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	let idx = -1;
	WORDS.forEach((w, i) => {
		if (t >= w.t) idx = i;
	});
	if (idx < 0) return null;
	const w = WORDS[idx];
	const p = prog(frame, w.t, 0.35);
	const out = prog(frame, 7.95, 0.3);
	const spin = (frame * 8) % 360;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - out}}>
			<div
				style={{
					fontFamily: inter,
					fontWeight: 800,
					fontSize: 170,
					letterSpacing: '-0.045em',
					color: C.white,
					transform: `scale(${1.25 - 0.25 * p})`,
					filter: `blur(${(1 - p) * 14}px)`,
					opacity: p,
					marginTop: -40,
				}}
			>
				{w.who === 'you' ? <GradText>{w.text}</GradText> : w.text}
			</div>
			<div
				style={{
					marginTop: 30,
					display: 'flex',
					alignItems: 'center',
					gap: 16,
					fontFamily: mono,
					fontSize: 30,
					color: w.who === 'you' ? C.coral : C.dim,
					opacity: p,
				}}
			>
				{w.status.startsWith('◌') ? (
					<div
						style={{
							width: 26,
							height: 26,
							borderRadius: 13,
							border: `4px solid ${C.dim}44`,
							borderTopColor: C.dim,
							transform: `rotate(${spin}deg)`,
						}}
					/>
				) : null}
				{w.status.replace('◌ ', '')}
			</div>
		</AbsoluteFill>
	);
};

// ---------- Part C: walkie-talkie timeline ----------
const BLOCKS: Array<{row: 0 | 1; a: number; b: number}> = [
	{row: 0, a: 0.0, b: 0.2},
	{row: 1, a: 0.3, b: 0.44},
	{row: 0, a: 0.52, b: 0.66},
	{row: 1, a: 0.76, b: 0.92},
];
const Walkie: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const appear = prog(frame, 8.05, 0.4);
	const head = interpolate(t, [8.3, 11.0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const h1out = prog(frame, 9.7, 0.25);
	const h2 = prog(frame, 9.98, 0.35);
	const zoomOut = prog(frame, 11.2, 0.8);
	const W = 1400;
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				opacity: appear * (1 - zoomOut),
				transform: `scale(${1 + zoomOut * 0.5})`,
				filter: `blur(${zoomOut * 10}px)`,
			}}
		>
			<div style={{position: 'relative', height: 150, width: 1600, marginBottom: 70}}>
				<div
					style={{
						position: 'absolute',
						width: '100%',
						textAlign: 'center',
						fontFamily: inter,
						fontWeight: 800,
						fontSize: 104,
						letterSpacing: '-0.04em',
						color: C.white,
						opacity: 1 - h1out,
						transform: `translateY(${-h1out * 30}px)`,
					}}
				>
					That’s not a conversation.
				</div>
				<div
					style={{
						position: 'absolute',
						width: '100%',
						textAlign: 'center',
						fontFamily: inter,
						fontWeight: 800,
						fontSize: 104,
						letterSpacing: '-0.04em',
						color: C.white,
						opacity: h2,
						transform: `translateY(${(1 - h2) * 30}px)`,
					}}
				>
					That’s a <GradText>walkie-talkie.</GradText>
				</div>
			</div>
			<div style={{position: 'relative', width: W + 140, height: 220}}>
				{['YOU', 'AI'].map((label, row) => (
					<div
						key={label}
						style={{
							position: 'absolute',
							top: row * 110,
							left: 0,
							width: W + 140,
							height: 90,
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<div style={{width: 140, fontFamily: mono, fontSize: 28, fontWeight: 700, color: C.dim}}>{label}</div>
						<div
							style={{
								position: 'relative',
								width: W,
								height: 90,
								borderRadius: 18,
								background: 'rgba(255,255,255,0.04)',
								border: '1px solid rgba(255,255,255,0.06)',
								overflow: 'hidden',
							}}
						>
							{BLOCKS.filter((b) => b.row === row).map((b, i) => {
								const vis = Math.max(0, Math.min(head, b.b) - b.a) / (b.b - b.a);
								if (vis <= 0) return null;
								return (
									<div
										key={i}
										style={{
											position: 'absolute',
											left: b.a * W,
											top: 10,
											height: 70,
											width: (b.b - b.a) * W * vis,
											borderRadius: 12,
											background: row === 0 ? `linear-gradient(90deg, ${C.coral}, ${C.pink})` : '#3a3a46',
											display: 'flex',
											alignItems: 'center',
											gap: 4,
											padding: '0 12px',
											overflow: 'hidden',
										}}
									>
										{new Array(28).fill(0).map((_, k) => (
											<div
												key={k}
												style={{
													width: 5,
													flexShrink: 0,
													borderRadius: 3,
													background: 'rgba(255,255,255,0.75)',
													height: 10 + 40 * Math.abs(Math.sin(k * 1.3 + i * 2 + row)),
												}}
											/>
										))}
									</div>
								);
							})}
						</div>
					</div>
				))}
				{/* gap labels */}
				{[
					[0.2, 0.3],
					[0.44, 0.52],
					[0.66, 0.76],
				].map(([a, b], i) => {
					const vis = head > b ? 1 : 0;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: 140 + a * W,
								width: (b - a) * W,
								top: 196,
								textAlign: 'center',
								fontFamily: mono,
								fontSize: 20,
								color: C.coral,
								opacity: vis * 0.9,
							}}
						>
							waiting…
						</div>
					);
				})}
				<div
					style={{
						position: 'absolute',
						left: 140 + head * W,
						top: -14,
						width: 3,
						height: 214,
						background: C.white,
						boxShadow: `0 0 16px ${C.white}`,
						opacity: head < 1 ? 1 : 0,
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

export const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	return (
		<AbsoluteFill>
			{t < 4.1 && <ChatWait />}
			{t >= 3.95 && t < 8.3 && <Kinetic />}
			{t >= 8.0 && <Walkie />}
		</AbsoluteFill>
	);
};

export const HOOK_END = f(12.0);
