import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, envAt, f, inter, mono, prog, serif} from './theme';
import {GradText, Orb, VoiceBars} from './components';
import {JazzPoster} from './Poster';

type Word = {t: number; w: string};
const seg = (start: number, a: number, b: number, text: string): Word[] => {
	const words = text.split(' ');
	const total = words.reduce((s, w) => s + w.length + 1, 0);
	let acc = 0;
	return words.map((w) => {
		const t = start + a + ((b - a) * acc) / total;
		acc += w.length + 1;
		return {t, w};
	});
};

type Line = {kind: 'you' | 'riff'; words: Word[]};
const LINES: Line[] = [
	{kind: 'you', words: [...seg(14.4, 0, 1.6, 'Make me a poster for a jazz night,'), ...seg(14.4, 1.9, 2.8, 'Friday at nine.')]},
	{kind: 'riff', words: [...seg(17.35, 0, 0.65, 'Ooh, nice.'), ...seg(17.35, 0.83, 1.56, 'Moody and dark…'), ...seg(17.35, 1.82, 2.7, 'or bright and fun?')]},
	{kind: 'you', words: [...seg(20.2, 0, 0.46, 'Moody.'), ...seg(20.2, 0.58, 1.6, 'Deep blue background…')]},
	{kind: 'you', words: seg(21.95, 0, 1.26, 'actually, make it green.')},
	{kind: 'riff', words: [...seg(23.45, 0, 0.67, 'Green it is.'), ...seg(23.45, 0.98, 2.2, 'Should I add a saxophone?')]},
	{kind: 'you', words: seg(25.8, 0, 1.02, 'Yes! On the left.')},
	{kind: 'riff', words: [...seg(27.1, 0, 0.33, 'Done.'), ...seg(27.1, 0.62, 2.1, 'Want the venue at the bottom, too?')]},
];

const ACTIONS: Array<{t: number; label: string}> = [
	{t: 14.9, label: '+ Poster  1080×1350'},
	{t: 15.5, label: '+ Title “Jazz Night”'},
	{t: 16.3, label: '+ Date & time'},
	{t: 20.55, label: 'Mood → moody'},
	{t: 21.2, label: 'Background → blue'},
	{t: 22.85, label: '↺ Background → green'},
	{t: 26.0, label: '+ Saxophone'},
	{t: 26.55, label: 'Saxophone → left'},
	{t: 27.9, label: '? Suggest venue line'},
];

export const DEMO_TL = {appear: 14.9, title: 15.5, date: 16.3, moody: 20.55, blue: 21.2, green: 22.85, sax: 26.0, left: 26.55, suggest: 27.9};
export const DEMO_END = 29.8;

const Transcript: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const items = LINES.filter((l) => l.words[0].t <= t);
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'flex-end', height: '100%'}}>
			{items.map((l, i) => {
				const words = l.words
					.filter((w) => w.t <= t)
					.map((w, k) => {
						const fin = Math.min(1, Math.max(0, (t - w.t - 0.15) / 0.3));
						return (
							<span key={k} style={{opacity: 0.45 + 0.55 * fin}}>
								{w.w}{' '}
							</span>
						);
					});
				if (l.kind === 'riff') {
					const p = prog(frame, l.words[0].t, 0.3);
					return (
						<div
							key={i}
							style={{
								display: 'flex',
								gap: 12,
								alignItems: 'flex-start',
								opacity: p,
								transform: `translateY(${(1 - p) * 10}px)`,
							}}
						>
							<div style={{marginTop: 4}}>
								<Orb size={26} level={envAt('r', frame)} />
							</div>
							<div
								style={{
									padding: '10px 16px',
									borderRadius: 18,
									borderTopLeftRadius: 6,
									background: 'linear-gradient(135deg, rgba(124,92,255,0.14), rgba(255,46,136,0.10))',
									color: '#3A2A8C',
									fontFamily: inter,
									fontWeight: 600,
									fontSize: 23,
									lineHeight: 1.3,
								}}
							>
								{words}
							</div>
						</div>
					);
				}
				return (
					<div key={i} style={{fontFamily: inter, fontSize: 25, fontWeight: 500, lineHeight: 1.32, color: '#141416', paddingLeft: 4}}>
						{words}
					</div>
				);
			})}
		</div>
	);
};

const ActionLog: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const shown = ACTIONS.filter((a) => a.t <= t).slice(-3);
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
			{shown.map((a) => {
				const p = prog(frame, a.t, 0.3);
				return (
					<div
						key={a.label}
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							padding: '10px 14px',
							borderRadius: 12,
							background: 'white',
							boxShadow: '0 1px 0 rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.05)',
							opacity: p,
							transform: `translateY(${(1 - p) * 12}px)`,
						}}
					>
						<span style={{fontFamily: inter, fontWeight: 600, fontSize: 19, color: '#1d1d1f'}}>{a.label}</span>
						<span style={{fontFamily: mono, fontSize: 14, fontWeight: 700, color: a.label.startsWith('?') ? C.violet : C.coral}}>{a.label.startsWith('?') ? '● SUGGESTION' : '● WHILE TALKING'}</span>
					</div>
				);
			})}
		</div>
	);
};

export const Demo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const inS = spring({frame: frame - f(13.9), fps, config: {damping: 18}});
	const out = prog(frame, DEMO_END, 0.45);
	const head = prog(frame, 14.4, 0.5);
	const userLvl = envAt('u', frame);
	const riffLvl = envAt('r', frame);
	// gentle push-in on the canvas during the demo
	const push = interpolate(frame, [f(14), f(DEMO_END)], [1, 1.02]);
	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					top: 48,
					width: '100%',
					textAlign: 'center',
					fontFamily: inter,
					fontWeight: 800,
					fontSize: 60,
					letterSpacing: '-0.035em',
					color: C.white,
					opacity: head * (1 - out),
					transform: `translateY(${(1 - head) * 20}px)`,
				}}
			>
				No waiting. <GradText>It builds as you speak.</GradText>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 200,
					top: 160,
					width: 1520,
					height: 860,
					borderRadius: 28,
					overflow: 'hidden',
					background: 'rgba(246,246,249,0.97)',
					boxShadow: '0 60px 160px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.12)',
					transform: `translateY(${(1 - inS) * 120}px) scale(${(0.92 + inS * 0.08) * push * (1 - out * 0.06)})`,
					opacity: Math.min(1, inS * 1.4) * (1 - out),
					filter: `blur(${out * 10}px)`,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{/* title bar */}
				<div
					style={{
						height: 60,
						display: 'flex',
						alignItems: 'center',
						padding: '0 22px',
						gap: 10,
						borderBottom: '1px solid rgba(0,0,0,0.07)',
						background: 'rgba(255,255,255,0.7)',
					}}
				>
					{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
						<div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
					))}
					<div style={{flex: 1, textAlign: 'center', fontFamily: inter, fontWeight: 600, fontSize: 19, color: '#4a4a52'}}>
						Jazz Night — Riff
					</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 10,
							padding: '6px 14px 6px 8px',
							borderRadius: 20,
							background: 'rgba(0,0,0,0.05)',
							fontFamily: inter,
							fontWeight: 600,
							fontSize: 17,
							color: '#1d1d1f',
						}}
					>
						<Orb size={20} level={riffLvl} />
						Listening
						<VoiceBars n={6} width={44} height={18} gap={3} color="#1d1d1f" src={['u']} min={0.15} />
					</div>
				</div>
				<div style={{flex: 1, minHeight: 0, display: 'flex'}}>
					{/* canvas */}
					<div
						style={{
							flex: 1,
							position: 'relative',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#EDEDF1',
							backgroundImage: 'radial-gradient(rgba(0,0,0,0.13) 1.2px, transparent 1.2px)',
							backgroundSize: '22px 22px',
						}}
					>
						<div style={{marginTop: -50}}>
							<JazzPoster tl={DEMO_TL} id="demo" />
						</div>
						{/* dictation HUD */}
						<div
							style={{
								position: 'absolute',
								bottom: 26,
								display: 'flex',
								alignItems: 'center',
								gap: 16,
								padding: '12px 24px 12px 14px',
								borderRadius: 40,
								background: 'rgba(20,20,24,0.92)',
								boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
							}}
						>
							<Orb size={36} level={Math.max(userLvl, riffLvl)} />
							<VoiceBars n={26} width={300} height={36} gap={4} color="#FFFFFF" src={['u', 'r']} />
						</div>
					</div>
					{/* side panel */}
					<div
						style={{
							width: 500,
							minHeight: 0,
							overflow: 'hidden',
							borderLeft: '1px solid rgba(0,0,0,0.07)',
							background: 'rgba(255,255,255,0.75)',
							padding: '26px 28px',
							display: 'flex',
							flexDirection: 'column',
							gap: 18,
						}}
					>
						<div style={{fontFamily: mono, fontWeight: 700, fontSize: 15, letterSpacing: '0.12em', color: '#8a8a94'}}>
							LIVE TRANSCRIPT
						</div>
						<div style={{flex: 1, minHeight: 0, overflow: 'hidden'}}>
							<Transcript />
						</div>
						<div style={{fontFamily: mono, fontWeight: 700, fontSize: 15, letterSpacing: '0.12em', color: '#8a8a94'}}>
							ACTIONS
						</div>
						<div style={{height: 262, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
							<ActionLog />
						</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
