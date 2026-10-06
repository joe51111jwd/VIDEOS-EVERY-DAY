import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {f, inter, prog, serif} from '../theme';
import {JazzPoster, PosterTimeline} from '../Poster';
import envJson from './env.json';

export const V4_DURATION = 34.5;

const INK = '#F5F5F7';
const GREY = '#86868B';
const env = envJson as {u: number[]; r: number[]};
const lv = (k: 'u' | 'r', fr: number) => {
	const a = env[k];
	const i = Math.max(1, Math.min(a.length - 2, fr));
	return (a[i - 1] + 2 * a[i] + a[i + 1]) / 4;
};
const smooth = Easing.bezier(0.65, 0, 0.35, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);

// ---------------------------------------------------------------- brand
const Bars: React.FC<{level: number; n?: number; h: number; w: number; color?: string; idle?: number}> = ({
	level,
	n = 4,
	h,
	w,
	color = '#fff',
	idle = 0.18,
}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: w * 0.7, height: h}}>
			{new Array(n).fill(0).map((_, i) => {
				const wob = 0.55 + 0.45 * Math.sin(frame * 0.5 + i * 1.9);
				const shape = [0.55, 1, 0.8, 0.45, 0.7, 0.9][i % 6];
				const v = Math.max(idle, Math.min(1, level * 1.2) * shape * wob);
				return <div key={i} style={{width: w, height: Math.max(w, v * h), borderRadius: w, background: color}} />;
			})}
		</div>
	);
};

export const RiffIcon: React.FC<{size: number; level?: number}> = ({size, level = 0}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: size * 0.235,
			background: 'linear-gradient(180deg, #2C2C2E 0%, #0A0A0B 100%)',
			boxShadow: `inset 0 0 0 ${Math.max(1, size * 0.012)}px rgba(255,255,255,0.14), 0 ${size * 0.08}px ${size * 0.25}px rgba(0,0,0,0.35)`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}
	>
		<Bars level={level} h={size * 0.42} w={size * 0.075} idle={0.3} />
	</div>
);

// ---------------------------------------------------------------- captions
type Cap = {a: number; b: number; who: 'You' | 'Riff'; text: string};
const CAPS: Cap[] = [
	{a: 0.15, b: 0.95, who: 'You', text: 'Make it blue…'},
	{a: 0.95, b: 1.75, who: 'You', text: 'no, green!'},
	{a: 1.75, b: 2.55, who: 'You', text: 'Bigger title.'},
	{a: 2.55, b: 3.5, who: 'You', text: 'Add a saxophone…'},
	{a: 3.5, b: 4.4, who: 'You', text: 'on the left.'},
	{a: 8.4, b: 11.3, who: 'You', text: 'Make me a poster for a jazz night, Friday at nine.'},
	{a: 11.35, b: 14.15, who: 'Riff', text: 'Ooh, nice. Moody and dark… or bright and fun?'},
	{a: 14.2, b: 15.9, who: 'You', text: 'Moody. Deep blue background…'},
	{a: 15.95, b: 17.4, who: 'You', text: 'actually, make it green.'},
	{a: 17.45, b: 19.75, who: 'Riff', text: 'Green it is. Should I add a saxophone?'},
	{a: 19.8, b: 21.05, who: 'You', text: 'Yes! On the left.'},
	{a: 21.1, b: 23.5, who: 'Riff', text: 'Done. Want the venue at the bottom, too?'},
];
const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const c = CAPS.find((x) => t >= x.a && t < x.b + 0.1);
	if (!c) return null;
	const words = c.text.split(' ');
	const speak = (c.b - c.a) * 0.85;
	const p = prog(frame, c.a, 0.2);
	return (
		<div style={{position: 'absolute', bottom: 40, width: '100%', display: 'flex', justifyContent: 'center', opacity: p}}>
			<div
				style={{
					display: 'flex',
					alignItems: 'baseline',
					gap: 18,
					padding: '14px 26px',
					borderRadius: 18,
					background: 'rgba(0,0,0,0.72)',
					backdropFilter: 'blur(20px)',
					maxWidth: 1500,
				}}
			>
				<span style={{fontFamily: inter, fontWeight: 600, fontSize: 24, color: c.who === 'Riff' ? '#B5B5BB' : GREY, letterSpacing: '0.02em'}}>
					{c.who}
				</span>
				<span style={{fontFamily: inter, fontWeight: 500, fontSize: 44, letterSpacing: '-0.01em', color: INK}}>
					{words.map((w, i) => {
						const wt = c.a + (speak * i) / words.length;
						const o = interpolate(t, [wt - 0.02, wt + 0.12], [0.28, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
						return (
							<span key={i} style={{opacity: o}}>
								{w}{' '}
							</span>
						);
					})}
				</span>
			</div>
		</div>
	);
};

// ---------------------------------------------------------------- app window
type Toast = {t: number; label: string; value?: string; swatch?: string};
const COLD_TL: PosterTimeline = {blue: 0.55, green: 1.3, big: 1.95, sax: 3.0, left: 3.85};
const COLD_TOASTS: Toast[] = [
	{t: 0.55, label: 'Background', value: 'Deep blue', swatch: '#16245F'},
	{t: 1.3, label: 'Background', value: 'Green', swatch: '#0B4B35'},
	{t: 1.95, label: 'Title', value: 'Larger'},
	{t: 3.0, label: 'Saxophone', value: 'Added'},
	{t: 3.85, label: 'Saxophone', value: 'Left'},
];
const DEMO_TL: PosterTimeline = {appear: 8.9, title: 9.5, date: 10.3, moody: 14.55, blue: 15.2, green: 16.85, sax: 20.0, left: 20.55, suggest: 21.9};
const DEMO_TOASTS: Toast[] = [
	{t: 8.9, label: 'Poster', value: '4:5'},
	{t: 9.5, label: 'Title', value: 'Jazz Night'},
	{t: 10.3, label: 'Date', value: 'Fri · 9 PM'},
	{t: 14.55, label: 'Mood', value: 'Moody'},
	{t: 15.2, label: 'Background', value: 'Deep blue', swatch: '#16245F'},
	{t: 16.85, label: 'Background', value: 'Green', swatch: '#0B4B35'},
	{t: 20.0, label: 'Saxophone', value: 'Added'},
	{t: 20.55, label: 'Saxophone', value: 'Left'},
	{t: 21.9, label: 'Suggestion', value: 'Venue line'},
];

const ToastView: React.FC<{toasts: Toast[]}> = ({toasts}) => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const cur = [...toasts].reverse().find((x) => t >= x.t && t < x.t + 1.6);
	if (!cur) return null;
	const p = prog(frame, cur.t, 0.25);
	const o = 1 - prog(frame, cur.t + 1.3, 0.3);
	return (
		<div
			style={{
				position: 'absolute',
				top: 26,
				right: 26,
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				padding: '12px 18px',
				borderRadius: 14,
				background: 'rgba(255,255,255,0.86)',
				backdropFilter: 'blur(20px)',
				boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.12)',
				fontFamily: inter,
				fontSize: 22,
				opacity: p * o,
				transform: `translateY(${(1 - p) * -10}px) scale(${0.96 + 0.04 * p})`,
			}}
		>
			<span style={{color: '#6E6E73', fontWeight: 500}}>{cur.label}</span>
			{cur.swatch ? <div style={{width: 18, height: 18, borderRadius: 5, background: cur.swatch, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)'}} /> : null}
			<span style={{color: '#1D1D1F', fontWeight: 600}}>{cur.value}</span>
		</div>
	);
};

const Layers: React.FC<{tl: PosterTimeline}> = ({tl}) => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const rows: Array<{at?: number; name: string; ghost?: boolean}> = [
		{at: tl.suggest, name: 'Venue line', ghost: true},
		{at: tl.sax, name: 'Saxophone'},
		{at: tl.date ?? 0, name: 'Date & time'},
		{at: tl.title ?? 0, name: 'Title'},
		{at: tl.appear ?? 0, name: 'Background'},
	];
	return (
		<div style={{padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: 4}}>
			<div style={{fontFamily: inter, fontWeight: 600, fontSize: 15, color: '#86868B', padding: '0 10px 10px', letterSpacing: '0.02em'}}>Layers</div>
			{rows
				.filter((r) => r.at !== undefined && t >= r.at)
				.map((r) => {
					const p = prog(frame, r.at!, 0.3);
					const active = t - r.at! < 1.2;
					return (
						<div
							key={r.name}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 10,
								padding: '9px 10px',
								borderRadius: 8,
								background: active ? 'rgba(0,113,227,0.12)' : 'transparent',
								fontFamily: inter,
								fontSize: 17,
								fontWeight: 500,
								color: r.ghost ? '#8E7CF0' : '#1D1D1F',
								opacity: p,
								transform: `translateX(${(1 - p) * -8}px)`,
							}}
						>
							<div
								style={{
									width: 16,
									height: 16,
									borderRadius: 4,
									border: `1.5px ${r.ghost ? 'dashed' : 'solid'} ${r.ghost ? '#8E7CF0' : '#86868B'}`,
								}}
							/>
							{r.name}
						</div>
					);
				})}
		</div>
	);
};

const WIN_W = 1480;
const WIN_H = 880;
const SIDEBAR = 230;
// poster centre relative to window centre
export const POSTER_OFF = {x: SIDEBAR / 2, y: 26 - 10};

const AppWindow: React.FC<{tl: PosterTimeline; toasts: Toast[]; id: string}> = ({tl, toasts, id}) => {
	const frame = useCurrentFrame();
	const u = lv('u', frame);
	const r = lv('r', frame);
	const speaking = r > 0.12;
	return (
		<div
			style={{
				width: WIN_W,
				height: WIN_H,
				borderRadius: 22,
				overflow: 'hidden',
				background: '#FBFBFD',
				boxShadow: '0 0 0 0.5px rgba(255,255,255,0.25), 0 50px 140px rgba(0,0,0,0.65)',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					height: 52,
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					padding: '0 20px',
					gap: 9,
					background: '#F3F3F5',
					borderBottom: '1px solid rgba(0,0,0,0.08)',
				}}
			>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
					<div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
				))}
				<div style={{flex: 1, textAlign: 'center', fontFamily: inter, fontWeight: 600, fontSize: 17, color: '#3A3A3C'}}>Jazz Night</div>
				<div style={{width: 60}} />
			</div>
			<div style={{flex: 1, minHeight: 0, display: 'flex'}}>
				<div style={{width: SIDEBAR, flexShrink: 0, background: '#F5F5F7', borderRight: '1px solid rgba(0,0,0,0.07)'}}>
					<Layers tl={tl} />
				</div>
				<div
					style={{
						flex: 1,
						position: 'relative',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: '#ECECEE',
					}}
				>
					<div style={{transform: 'scale(1.12)', marginTop: -20}}>
						<JazzPoster tl={tl} id={id} />
					</div>
					<ToastView toasts={toasts} />
					{/* Riff voice HUD */}
					<div
						style={{
							position: 'absolute',
							bottom: 22,
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							padding: '9px 20px 9px 9px',
							borderRadius: 30,
							background: 'rgba(28,28,30,0.88)',
							backdropFilter: 'blur(24px)',
							boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
						}}
					>
						<RiffIcon size={42} level={r} />
						<div style={{fontFamily: inter, fontWeight: 500, fontSize: 18, color: '#E5E5EA', width: 100}}>
							{speaking ? 'Speaking' : 'Listening'}
						</div>
						<Bars level={Math.max(u, r)} n={14} h={26} w={4} color={speaking ? '#C7C7CC' : '#FFFFFF'} idle={0.12} />
					</div>
				</div>
			</div>
		</div>
	);
};

// camera: keyframes of scale + offset (screen px) + tilt
type Cam = {t: number; s: number; x: number; y: number; rx?: number; ry?: number};
const camAt = (keys: Cam[], t: number) => {
	const get = (k: keyof Cam) =>
		interpolate(
			t,
			keys.map((c) => c.t),
			keys.map((c) => (c[k] as number) ?? 0),
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: smooth},
		);
	return {s: get('s'), x: get('x'), y: get('y'), rx: get('rx'), ry: get('ry')};
};
const focus = (s: number) => ({x: -POSTER_OFF.x * s, y: -POSTER_OFF.y * s - 30});

const Shot: React.FC<{keys: Cam[]; children: React.ReactNode; opacity?: number}> = ({keys, children, opacity = 1}) => {
	const frame = useCurrentFrame();
	const c = camAt(keys, frame / 30);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 2400, opacity}}>
			<div
				style={{
					transform: `translate(${c.x}px, ${c.y}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.s / 2})`,
				}}
			>
				{/* laid out at 2x and scaled down, so close-ups stay sharp */}
				<div style={{zoom: 2}}>{children}</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- scenes
const Title: React.FC<{t0: number; t1: number; children: React.ReactNode; size?: number; color?: string; y?: number}> = ({
	t0,
	t1,
	children,
	size = 92,
	color = INK,
	y = 0,
}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, t0, 0.7, out);
	const o = 1 - prog(frame, t1 - 0.35, 0.35);
	return (
		<div
			style={{
				fontFamily: inter,
				fontWeight: 600,
				fontSize: size,
				letterSpacing: '-0.035em',
				lineHeight: 1.08,
				color,
				textAlign: 'center',
				opacity: p * o,
				transform: `translateY(${y + (1 - p) * 18}px)`,
				filter: `blur(${(1 - p) * 6}px)`,
			}}
		>
			{children}
		</div>
	);
};

const ColdOpen: React.FC = () => {
	const frame = useCurrentFrame();
	const s0 = 1.62;
	const keys: Cam[] = [
		{t: 0, s: s0, ...focus(s0), rx: 6, ry: -9},
		{t: 4.35, s: 1.5, ...focus(1.5), rx: 3, ry: -4},
		{t: 5.5, s: 0.8, x: 0, y: -10, rx: 0, ry: 0},
		{t: 6.2, s: 0.78, x: 0, y: -10, rx: 0, ry: 0},
	];
	const fade = 1 - prog(frame, 5.55, 0.45);
	return (
		<Shot keys={keys} opacity={fade}>
			<AppWindow tl={COLD_TL} toasts={COLD_TOASTS} id="v4cold" />
		</Shot>
	);
};

const Reveal: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const icon = spring({frame: frame - f(6.1), fps, config: {damping: 16, mass: 0.9}});
	const word = prog(frame, 6.4, 0.8, out);
	const o = 1 - prog(frame, 7.7, 0.4);
	const shine = interpolate(frame, [f(6.45), f(7.6)], [-30, 130], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 40}}>
				<div style={{transform: `scale(${icon})`}}>
					<RiffIcon size={170} level={0.5} />
				</div>
				<div
					style={{
						fontFamily: inter,
						fontWeight: 600,
						fontSize: 190,
						letterSpacing: '-0.05em',
						lineHeight: 1,
						opacity: word,
						transform: `translateX(${(1 - word) * -30}px)`,
						background: `linear-gradient(100deg, ${INK} ${shine - 20}%, #FFFFFF ${shine}%, ${INK} ${shine + 20}%)`,
						WebkitBackgroundClip: 'text',
						color: 'transparent',
					}}
				>
					Riff
				</div>
			</div>

		</AbsoluteFill>
	);
};

const DemoShot: React.FC = () => {
	const frame = useCurrentFrame();
	const z = 1.28;
	const wide = 0.84;
	const keys: Cam[] = [
		{t: 7.8, s: 0.78, x: 0, y: 60},
		{t: 8.6, s: wide, x: 0, y: -40},
		{t: 14.3, s: wide, x: 0, y: -40},
		{t: 14.9, s: z, ...focus(z)},
		{t: 17.3, s: z + 0.04, ...focus(z + 0.04)},
		{t: 17.9, s: wide, x: 0, y: -40},
		{t: 19.6, s: wide, x: 0, y: -40},
		{t: 20.1, s: z, ...focus(z)},
		{t: 21.1, s: z + 0.03, ...focus(z + 0.03)},
		{t: 21.7, s: wide + 0.02, x: 0, y: -40},
		{t: 24.0, s: wide + 0.05, x: 0, y: -40},
	];
	const o = prog(frame, 7.85, 0.5) * (1 - prog(frame, 23.6, 0.4));
	return (
		<Shot keys={keys} opacity={o}>
			<AppWindow tl={DEMO_TL} toasts={DEMO_TOASTS} id="v4demo" />
		</Shot>
	);
};

// ---------------------------------------------------------------- montage: four designs, built by voice, hard cuts
const useEl = (t0: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (at: number, damping = 15) => spring({frame: frame - f(t0 + at), fps, config: {damping, mass: 0.7}});
};
const rise = (p: number, d = 24): React.CSSProperties => ({opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * d}px)`});

const LaunchSlide: React.FC<{t0: number}> = ({t0}) => {
	const el = useEl(t0);
	const frame = useCurrentFrame();
	const bg = el(0.0, 20);
	const orb = el(0.25, 12);
	const h = el(0.5);
	const sub = el(0.85);
	return (
		<div
			style={{
				width: 1120,
				height: 630,
				borderRadius: 18,
				overflow: 'hidden',
				position: 'relative',
				background: '#08080C',
				boxShadow: '0 50px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
				opacity: bg,
			}}
		>
			<div
				style={{
					position: 'absolute',
					width: 760,
					height: 760,
					left: 180,
					top: 170,
					borderRadius: 380,
					background: 'radial-gradient(circle at 50% 40%, #FF9A62 0%, #E2477A 35%, #5B2AD9 62%, transparent 72%)',
					filter: 'blur(30px)',
					opacity: orb * 0.9,
					transform: `scale(${0.6 + orb * 0.4}) rotate(${frame * 0.4}deg)`,
				}}
			/>
			<div style={{position: 'absolute', top: 190, width: '100%', textAlign: 'center', ...rise(h, 30)}}>
				<div style={{fontFamily: inter, fontWeight: 700, fontSize: 132, letterSpacing: '-0.055em', color: '#fff'}}>Launch Day.</div>
			</div>
			<div
				style={{
					position: 'absolute',
					top: 372,
					width: '100%',
					textAlign: 'center',
					fontFamily: inter,
					fontWeight: 500,
					fontSize: 30,
					letterSpacing: '-0.01em',
					color: 'rgba(255,255,255,0.75)',
					...rise(sub, 16),
				}}
			>
				October 14 · 10 AM
			</div>
		</div>
	);
};

const CoffeePost: React.FC<{t0: number}> = ({t0}) => {
	const el = useEl(t0);
	const bg = el(0.0, 20);
	const cup = el(0.25, 11);
	const h = el(0.6);
	const tag = el(0.95);
	return (
		<div
			style={{
				width: 640,
				height: 640,
				borderRadius: 14,
				overflow: 'hidden',
				position: 'relative',
				background: '#EFE6D8',
				boxShadow: '0 50px 120px rgba(0,0,0,0.7)',
				opacity: bg,
			}}
		>
			<div style={{position: 'absolute', left: 170, top: 70, transform: `scale(${cup}) rotate(${(1 - cup) * -40}deg)`}}>
				<div
					style={{
						width: 300,
						height: 300,
						borderRadius: 150,
						background: '#FBF8F2',
						boxShadow: '0 30px 50px rgba(80,50,20,0.25)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div style={{width: 220, height: 220, borderRadius: 110, background: 'radial-gradient(circle, #C79A6B 0%, #8A5A32 60%, #5E3A1E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<svg width={110} height={100} viewBox="0 0 110 100">
							<path d="M55 92 C10 60 0 30 22 14 C38 3 52 14 55 26 C58 14 72 3 88 14 C110 30 100 60 55 92 Z" fill="#F6E9D6" opacity={0.92} />
						</svg>
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontFamily: serif, fontSize: 84, color: '#3B2414', letterSpacing: '-0.01em', ...rise(h)}}>
				Slow <span style={{fontStyle: 'italic'}}>mornings.</span>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 530,
					textAlign: 'center',
					fontFamily: inter,
					fontWeight: 600,
					fontSize: 15,
					letterSpacing: '0.34em',
					color: '#8A5A32',
					...rise(tag, 12),
				}}
			>
				OAT &amp; ASH · OPEN 7–2
			</div>
		</div>
	);
};

const RunPoster: React.FC<{t0: number}> = ({t0}) => {
	const el = useEl(t0);
	const bg = el(0.0, 20);
	const stripes = el(0.2, 18);
	const a = el(0.4, 12);
	const b = el(0.55, 12);
	const date = el(0.9);
	return (
		<div style={{width: 512, height: 680, borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#FF5A1F', boxShadow: '0 50px 120px rgba(0,0,0,0.7)', opacity: bg}}>
			{[0, 1, 2, 3, 4].map((i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: -200,
						top: 430 + i * 46,
						width: 1000 * stripes,
						height: 22,
						background: i % 2 ? '#111' : '#FFD9C7',
						transform: 'rotate(-14deg)',
						transformOrigin: 'left center',
					}}
				/>
			))}
			<div style={{position: 'absolute', left: 36, top: 40, fontFamily: inter, fontWeight: 900, fontSize: 150, lineHeight: 0.84, letterSpacing: '-0.06em', color: '#111'}}>
				<div style={{transform: `translateX(${(1 - a) * -300}px)`, opacity: Math.min(1, a * 2)}}>RUN</div>
				<div style={{transform: `translateX(${(1 - b) * -300}px)`, opacity: Math.min(1, b * 2)}}>CLUB</div>
			</div>
			<div style={{position: 'absolute', left: 40, top: 320, fontFamily: inter, fontWeight: 800, fontSize: 30, letterSpacing: '0.08em', color: '#111', ...rise(date, 14)}}>
				SUNDAYS · 7 AM
				<div style={{fontWeight: 600, fontSize: 15, letterSpacing: '0.3em', marginTop: 8}}>PIER 4 · ALL PACES</div>
			</div>
		</div>
	);
};

const PhoneApp: React.FC<{t0: number}> = ({t0}) => {
	const el = useEl(t0);
	const frame = useCurrentFrame();
	const phone = el(0.0, 18);
	const hi = el(0.25);
	const ring = el(0.45, 20);
	const c1 = el(0.7);
	const c2 = el(0.85);
	const rp = Math.min(1, Math.max(0, (frame / 30 - t0 - 0.45) / 0.9));
	const arc = 2 * Math.PI * 70;
	return (
		<div
			style={{
				width: 340,
				height: 700,
				borderRadius: 56,
				padding: 12,
				background: '#1C1C1E',
				boxShadow: '0 50px 120px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(255,255,255,0.12)',
				opacity: phone,
				transform: `translateY(${(1 - phone) * 40}px)`,
			}}
		>
			<div style={{width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', background: 'linear-gradient(180deg, #F7F4FF 0%, #FFFFFF 60%)', position: 'relative'}}>
				<div style={{position: 'absolute', top: 12, left: 113, width: 90, height: 26, borderRadius: 13, background: '#000'}} />
				<div style={{position: 'absolute', top: 72, left: 26, ...rise(hi, 14)}}>
					<div style={{fontFamily: inter, fontWeight: 500, fontSize: 15, color: '#8E8E93'}}>Monday</div>
					<div style={{fontFamily: inter, fontWeight: 700, fontSize: 30, letterSpacing: '-0.03em', color: '#111'}}>Morning, Maya.</div>
				</div>
				<div style={{position: 'absolute', top: 160, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: ring}}>
					<svg width={180} height={180} viewBox="0 0 180 180">
						<circle cx={90} cy={90} r={70} stroke="#ECE8F7" strokeWidth={16} fill="none" />
						<circle
							cx={90}
							cy={90}
							r={70}
							stroke="#6E4BFF"
							strokeWidth={16}
							fill="none"
							strokeLinecap="round"
							strokeDasharray={arc}
							strokeDashoffset={arc * (1 - 0.72 * smooth(rp))}
							transform="rotate(-90 90 90)"
						/>
						<text x={90} y={98} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={30} fill="#111">
							{Math.round(72 * smooth(rp))}%
						</text>
					</svg>
				</div>
				{[
					{p: c1, top: 370, title: 'Focus', sub: '2h 10m', col: '#6E4BFF'},
					{p: c2, top: 466, title: 'Move', sub: '6,240 steps', col: '#FF7A45'},
				].map((c) => (
					<div
						key={c.title}
						style={{
							position: 'absolute',
							left: 20,
							right: 20,
							top: c.top,
							height: 80,
							borderRadius: 22,
							background: '#fff',
							boxShadow: '0 8px 24px rgba(40,20,120,0.08)',
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							padding: '0 18px',
							...rise(c.p, 18),
						}}
					>
						<div style={{width: 40, height: 40, borderRadius: 12, background: c.col}} />
						<div>
							<div style={{fontFamily: inter, fontWeight: 600, fontSize: 18, color: '#111'}}>{c.title}</div>
							<div style={{fontFamily: inter, fontWeight: 500, fontSize: 14, color: '#8E8E93'}}>{c.sub}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const MONTAGE = [24.0, 25.5, 27.0, 28.5];
const Montage: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const i = Math.max(0, MONTAGE.filter((x) => t >= x).length - 1);
	const t0 = MONTAGE[i];
	const local = t - t0;
	// slow push on every cut, a touch faster each time
	const s = [1, 1, 1, 1.25][i] * (0.94 + local * (0.03 + i * 0.012));
	const fadeIn = prog(frame, 23.95, 0.2);
	const fadeOut = 1 - prog(frame, 29.85, 0.3);
	const designs = [LaunchSlide, CoffeePost, RunPoster, PhoneApp];
	const D = designs[i];
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: fadeIn * fadeOut}}>
			<div style={{transform: `scale(${s}) translateY(-30px)`}}>
				<D t0={t0} />
			</div>
			<div style={{position: 'absolute', bottom: 70, display: 'flex', alignItems: 'center', gap: 18, opacity: 0.9}}>
				<RiffIcon size={44} level={0.5} />
				<Bars level={0.6} n={14} h={24} w={4} idle={0.15} />
			</div>
		</AbsoluteFill>
	);
};

const End: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const icon = spring({frame: frame - f(30.2), fps, config: {damping: 16}});
	const word = prog(frame, 30.45, 0.8, out);
	const line = prog(frame, 31.2, 0.8, out);
	const o = 1 - prog(frame, 33.6, 0.8);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 34}}>
				<div style={{transform: `scale(${icon})`}}>
					<RiffIcon size={140} level={0.35} />
				</div>
				<div style={{fontFamily: inter, fontWeight: 600, fontSize: 160, letterSpacing: '-0.05em', color: INK, opacity: word}}>Riff</div>
			</div>
			<div
				style={{
					marginTop: 40,
					fontFamily: inter,
					fontWeight: 600,
					fontSize: 64,
					letterSpacing: '-0.03em',
					color: INK,
					opacity: line,
					transform: `translateY(${(1 - line) * 14}px)`,
				}}
			>
				Just talk.
			</div>
		</AbsoluteFill>
	);
};

const TICKS = [...COLD_TOASTS, ...DEMO_TOASTS].map((x) => x.t);

export const RiffFilm: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* faint stage light */}
			<AbsoluteFill style={{background: 'radial-gradient(60% 50% at 50% 45%, rgba(255,255,255,0.06) 0%, transparent 70%)'}} />
			{t < 6.2 && <ColdOpen />}
			{t >= 6.0 && t < 8.2 && <Reveal />}
			{t >= 7.7 && t < 24.1 && <DemoShot />}
			{t >= 23.9 && t < 30.3 && <Montage />}
			{t >= 30.0 && <End />}
			<Captions />
			<Audio src={staticFile('vo_v4.wav')} />
			<Audio
				src={staticFile('music_v4.wav')}
				volume={(fr) => {
					const v = Math.min(1, lv('u', fr) + lv('r', fr));
					return 0.5 * (1 - 0.4 * v);
				}}
			/>
			{TICKS.map((tk, i) => (
				<Sequence key={i} from={f(tk)} durationInFrames={10}>
					<Audio src={staticFile('tick.wav')} volume={0.35} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
