import React from 'react';
import {interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {f, inter, prog, serif} from './theme';

// When each change lands, in seconds on the parent timeline. Omit to skip a step.
export type PosterTimeline = {
	appear?: number; // poster pops in (else visible from the start)
	title?: number; // title types in (else visible from the start)
	date?: number;
	moody?: number;
	blue?: number;
	green?: number;
	big?: number;
	sax?: number;
	left?: number;
	suggest?: number;
};

const W = 512;
const H = 640;

const Sax: React.FC<{size: number; id: string}> = ({size, id}) => (
	<svg width={size * 0.6} height={size} viewBox="0 0 120 200" style={{overflow: 'visible'}}>
		<defs>
			<linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor="#FFE7A8" />
				<stop offset="0.45" stopColor="#E7B24E" />
				<stop offset="1" stopColor="#A86E1C" />
			</linearGradient>
		</defs>
		<path d="M30 8 L44 6 L52 22" stroke="#111" strokeWidth={7} strokeLinecap="round" fill="none" />
		<path d="M50 20 Q62 30 60 48" stroke={`url(#${id}-g)`} strokeWidth={11} strokeLinecap="round" fill="none" />
		<path
			d="M60 46 L58 140 Q57 182 82 180 Q100 178 100 150 L102 120"
			stroke={`url(#${id}-g)`}
			strokeWidth={20}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		/>
		<path d="M90 122 Q96 98 120 92 L122 104 Q110 110 112 124 Z" fill={`url(#${id}-g)`} />
		<ellipse cx={116} cy={98} rx={9} ry={7} fill="#7A4E12" />
		{[62, 80, 98, 116, 134].map((y, i) => (
			<circle key={i} cx={54} cy={y} r={4.5} fill="#FFF6DD" stroke="#8C5D17" strokeWidth={1.5} />
		))}
		<path d="M64 60 L63 140" stroke="#FFF6DD" strokeWidth={2.5} opacity={0.55} strokeLinecap="round" />
	</svg>
);

export const JazzPoster: React.FC<{tl: PosterTimeline; id: string}> = ({tl, id}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / 30;
	const sp = (at: number | undefined, damping = 13) =>
		at === undefined ? 0 : spring({frame: frame - f(at), fps, config: {damping}});
	const step = (at: number | undefined, d = 0.35) => (at === undefined ? 0 : prog(frame, at, d));

	const appear = tl.appear === undefined ? 1 : sp(tl.appear, 14);
	// background + ink
	const stops: number[] = [];
	const cols: string[] = [];
	const push = (at: number | undefined, col: string) => {
		if (at === undefined) return;
		stops.push(f(at), f(at) + 8);
		cols.push(cols.length ? cols[cols.length - 1] : '#F3EEE4', col);
	};
	push(tl.moody, '#1A1622');
	push(tl.blue, '#16245F');
	push(tl.green, '#0B4B35');
	const bg = stops.length ? interpolateColors(frame, stops, cols) : '#F3EEE4';
	const firstDark = [tl.moody, tl.blue].filter((x) => x !== undefined)[0];
	const dark = step(firstDark, 0.3);
	const ink = interpolateColors(dark, [0, 1], ['#17140F', '#F4E8D2']);
	const gold = interpolateColors(dark, [0, 1], ['#9A6A1E', '#E6B65E']);
	const glow = dark;

	const titleP = tl.title === undefined ? 1 : Math.max(0, Math.min(1, (t - tl.title) / 0.4));
	const date = tl.date === undefined ? 1 : step(tl.date, 0.4);
	const big = sp(tl.big, 12);
	const sax = sp(tl.sax, 11);
	const left = sp(tl.left, 14);
	const suggest = step(tl.suggest, 0.4);
	const saxX = interpolate(left, [0, 1], [W / 2 - 84, 30]);
	const flash = (at: number | undefined, col: string) =>
		at === undefined ? null : (
			<div style={{position: 'absolute', inset: 0, background: col, opacity: Math.max(0, 1 - Math.abs(frame - f(at) - 3) / 5) * 0.3}} />
		);
	const titleSize = 150 + big * 26;

	return (
		<div
			style={{
				width: W,
				height: H,
				borderRadius: 10,
				background: bg,
				position: 'relative',
				overflow: 'hidden',
				transform: `scale(${0.6 + appear * 0.4})`,
				opacity: Math.min(1, appear * 1.5),
				boxShadow: '0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)',
			}}
		>
			{/* spotlight */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(70% 55% at 50% 18%, rgba(255,214,140,0.28) 0%, transparent 70%)',
					opacity: glow,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(90% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.45) 100%)',
					opacity: glow,
				}}
			/>
			{/* sax halo */}
			<div
				style={{
					position: 'absolute',
					width: 300,
					height: 300,
					borderRadius: 150,
					left: saxX - 54,
					top: 262,
					background: 'radial-gradient(circle, rgba(230,182,94,0.35) 0%, rgba(230,182,94,0.08) 55%, transparent 70%)',
					border: `1.5px solid ${gold}`,
					opacity: sax * 0.85,
					transform: `scale(${sax})`,
				}}
			/>
			{/* inset frame */}
			<div style={{position: 'absolute', inset: 16, border: `1px solid ${gold}`, opacity: 0.55 * appear, borderRadius: 4}} />
			{/* kicker */}
			<div
				style={{
					position: 'absolute',
					top: 38,
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 12,
					fontFamily: inter,
					fontWeight: 600,
					fontSize: 11,
					letterSpacing: '0.38em',
					color: gold,
					opacity: titleP,
				}}
			>
				<div style={{width: 34, height: 1, background: gold}} />
				THE BLUE ROOM PRESENTS
				<div style={{width: 34, height: 1, background: gold}} />
			</div>
			{/* sax */}
			<div
				style={{
					position: 'absolute',
					left: saxX,
					top: 280 + big * 22,
					transform: `scale(${sax * (1 - big * 0.1)}) rotate(${(1 - sax) * -20 + left * -8}deg)`,
					transformOrigin: 'center bottom',
					filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.4))',
				}}
			>
				<Sax size={290} id={id} />
			</div>
			{/* title */}
			<div
				style={{
					position: 'absolute',
					top: 58 - big * 6,
					width: '100%',
					textAlign: 'center',
					fontFamily: serif,
					fontSize: titleSize,
					lineHeight: 0.8,
					letterSpacing: '-0.02em',
					color: ink,
					opacity: titleP,
					transform: `translateY(${(1 - titleP) * 20}px)`,
					textShadow: glow > 0.5 ? '0 6px 30px rgba(0,0,0,0.35)' : 'none',
				}}
			>
				Jazz
				<div style={{fontStyle: 'italic', marginTop: -6, color: interpolateColors(dark, [0, 1], ['#17140F', '#F1C877'])}}>Night</div>
			</div>
			{/* bottom info */}
			<div
				style={{
					position: 'absolute',
					left: 40,
					right: 40,
					bottom: 40,
					opacity: date,
					transform: `translateY(${(1 - date) * 14}px)`,
				}}
			>
				<div style={{height: 1, background: gold, opacity: 0.7, marginBottom: 14}} />
				<div
					style={{
						display: 'flex',
						justifyContent: left > 0.5 ? 'flex-end' : 'space-between',
						gap: 34,
						fontFamily: inter,
						color: ink,
					}}
				>
					<div style={{textAlign: left > 0.5 ? 'right' : 'left'}}>
						<div style={{fontWeight: 800, fontSize: 26, letterSpacing: '0.12em'}}>FRIDAY</div>
						<div style={{fontWeight: 500, fontSize: 12, letterSpacing: '0.3em', opacity: 0.75, marginTop: 4}}>OCTOBER 10</div>
					</div>
					<div style={{textAlign: 'right'}}>
						<div style={{fontWeight: 800, fontSize: 26, letterSpacing: '0.12em', color: gold}}>9 PM</div>
						<div style={{fontWeight: 500, fontSize: 12, letterSpacing: '0.3em', opacity: 0.75, marginTop: 4}}>DOORS 8:30</div>
					</div>
				</div>
				{/* Riff's suggestion, previewed as a ghost */}
				<div
					style={{
						marginTop: 12 * suggest,
						height: 30 * suggest,
						overflow: 'hidden',
						border: `1.5px dashed ${'#B9A4FF'}`,
						borderRadius: 6,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: inter,
						fontWeight: 600,
						fontSize: 11,
						letterSpacing: '0.3em',
						color: '#CFC2FF',
						opacity: suggest * (0.7 + 0.3 * Math.sin(frame / 5)),
					}}
				>
					LIVE AT THE BLUE ROOM · 41 LENOX AVE
				</div>
			</div>
			{flash(tl.moody, '#9B7BFF')}
			{flash(tl.blue, '#4A6BFF')}
			{flash(tl.green, '#3BE38F')}
			{/* film grain */}
			<svg style={{position: 'absolute', inset: 0, opacity: 0.16, mixBlendMode: 'overlay'}} width={W} height={H}>
				<filter id={`${id}-grain`}>
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 6} />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width={W} height={H} filter={`url(#${id}-grain)`} />
			</svg>
		</div>
	);
};
