import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, FPS, SANS, step} from '../tokens';
import {IBattery, IChevron, IControl, IPlay, ISearch, IShare, ISidebar, IWifi} from './icons';

// ------------------------------------------------------------------ Riff app icon (glass squircle)
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

// ------------------------------------------------------------------ desktop
export const Wallpaper: React.FC = () => (
	<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
		<defs>
			<linearGradient id="sky" x1="0" y1="0" x2="0.15" y2="1">
				<stop offset="0" stopColor="#F6CFB0" />
				<stop offset="0.38" stopColor="#EDA996" />
				<stop offset="0.7" stopColor="#B98AB2" />
				<stop offset="1" stopColor="#5E5296" />
			</linearGradient>
			{[
				['w1', '#F0A286', '#D9717A'],
				['w2', '#D46F78', '#9E4D86'],
				['w3', '#8E4E92', '#5B3F8A'],
				['w4', '#493A80', '#2B2B66'],
				['w5', '#22245A', '#13163A'],
			].map(([id, a, b]) => (
				<linearGradient key={id} id={id} x1="0" y1="0" x2="0.3" y2="1">
					<stop offset="0" stopColor={a} />
					<stop offset="1" stopColor={b} />
				</linearGradient>
			))}
			<radialGradient id="sun" cx="0.74" cy="0.2" r="0.45">
				<stop offset="0" stopColor="rgba(255,236,214,0.85)" />
				<stop offset="1" stopColor="rgba(255,236,214,0)" />
			</radialGradient>
			<filter id="soft">
				<feGaussianBlur stdDeviation="14" />
			</filter>
			<filter id="grainW">
				<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
				<feColorMatrix type="saturate" values="0" />
			</filter>
		</defs>
		<rect width={1920} height={1080} fill="url(#sky)" />
		<rect width={1920} height={1080} fill="url(#sun)" />
		{[
			['w1', 'M0 470 C 320 380 620 520 980 450 C 1340 380 1600 300 1920 360 L1920 1080 L0 1080 Z'],
			['w2', 'M0 600 C 380 520 700 660 1060 600 C 1420 540 1660 470 1920 520 L1920 1080 L0 1080 Z'],
			['w3', 'M0 735 C 300 660 760 800 1120 730 C 1440 668 1700 640 1920 680 L1920 1080 L0 1080 Z'],
			['w4', 'M0 860 C 420 790 780 900 1180 850 C 1520 808 1760 790 1920 820 L1920 1080 L0 1080 Z'],
			['w5', 'M0 975 C 360 920 820 1010 1240 965 C 1560 932 1780 930 1920 950 L1920 1080 L0 1080 Z'],
		].map(([id, d]) => (
			<g key={id}>
				<path d={d} fill={`url(#${id})`} />
				<path d={d.split(' L1920 1080')[0]} fill="none" stroke="rgba(255,240,230,0.35)" strokeWidth={10} filter="url(#soft)" />
			</g>
		))}
		<rect width={1920} height={1080} filter="url(#grainW)" opacity={0.06} />
	</svg>
);

export const MenuBar: React.FC<{dark?: boolean}> = () => {
	const ts = {textShadow: '0 1px 3px rgba(60,20,30,0.35)'};
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: 1920,
				height: 34,
				display: 'flex',
				alignItems: 'center',
				padding: '0 22px',
				boxSizing: 'border-box',
				fontFamily: SANS,
				fontSize: 14.5,
				color: '#fff',
				...ts,
			}}
		>
			<div style={{fontWeight: 700, marginRight: 26, letterSpacing: '-0.01em'}}>Riff</div>
			{['File', 'Edit', 'View', 'Canvas', 'Window', 'Help'].map((x) => (
				<div key={x} style={{fontWeight: 500, marginRight: 24, opacity: 0.95}}>
					{x}
				</div>
			))}
			<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20, fontWeight: 500}}>
				<IBattery size={27} />
				<IWifi size={17} />
				<ISearch size={16} />
				<IControl size={17} />
				<div style={{letterSpacing: '0.01em'}}>Mon Oct 6&nbsp;&nbsp;9:41 AM</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ Riff window
export const WIN = {x: 130, y: 66, w: 1660, h: 968};
export const SIDEBAR = {x: 10, y: 10, w: 252};
export const TOOLBAR_H = 60;
export const CANVAS_CENTER = {x: (SIDEBAR.x * 2 + SIDEBAR.w + WIN.w) / 2, y: (TOOLBAR_H + WIN.h) / 2 + 8};

export type SideItem = {label: string; icon: React.FC<{size?: number; color?: string}>; at?: number};

const glass = (alpha = 0.66): React.CSSProperties => ({
	background: `rgba(252,252,253,${alpha})`,
	backdropFilter: 'blur(28px) saturate(170%)',
	boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 0 0 1px rgba(0,0,0,0.07), 0 6px 18px rgba(0,0,0,0.08)',
});

export const Traffic: React.FC = () => (
	<div style={{display: 'flex', gap: 9}}>
		{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
			<div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c, boxShadow: 'inset 0 0 0 0.6px rgba(0,0,0,0.18)'}} />
		))}
	</div>
);

export const Sidebar: React.FC<{items: SideItem[]; active: number}> = ({items, active}) => {
	const t = useCurrentFrame() / FPS;
	return (
		<div
			style={{
				position: 'absolute',
				left: SIDEBAR.x,
				top: SIDEBAR.y,
				width: SIDEBAR.w,
				bottom: SIDEBAR.y,
				borderRadius: 20,
				...glass(0.74),
				fontFamily: SANS,
				padding: '20px 12px',
				boxSizing: 'border-box',
				zIndex: 20,
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', padding: '0 8px'}}>
				<Traffic />
				<div style={{marginLeft: 'auto'}}>
					<ISidebar size={19} />
				</div>
			</div>
			<div style={{marginTop: 30, padding: '0 10px', fontSize: 11.5, fontWeight: 600, color: '#8E8E93', letterSpacing: '0.04em'}}>HALFMOON</div>
			<div style={{marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2}}>
				{items.map((it, i) => {
					const p = it.at === undefined ? 1 : step(t, it.at, 0.45);
					if (p <= 0) return null;
					const on = i === active;
					const Icon = it.icon;
					return (
						<div
							key={it.label}
							style={{
								height: 34 * Math.min(1, p * 1.6),
								overflow: 'hidden',
								display: 'flex',
								alignItems: 'center',
								gap: 11,
								padding: '0 10px',
								borderRadius: 9,
								background: on ? 'rgba(0,0,0,0.075)' : 'transparent',
								fontSize: 14,
								fontWeight: on ? 600 : 500,
								color: '#1D1D1F',
								opacity: p,
								transform: `translateX(${(1 - p) * -10}px)`,
							}}
						>
							<Icon size={18} color={on ? '#1D1D1F' : '#5E5E63'} />
							{it.label}
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 22, right: 22, bottom: 20, display: 'flex', alignItems: 'center', gap: 11}}>
				<div
					style={{
						width: 32,
						height: 32,
						borderRadius: 16,
						background: 'linear-gradient(140deg, #E7A47E, #B4532A)',
						color: '#fff',
						fontSize: 13,
						fontWeight: 700,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					MC
				</div>
				<div>
					<div style={{fontSize: 13.5, fontWeight: 600, color: '#1D1D1F'}}>Maya Chen</div>
					<div style={{fontSize: 12, color: '#8E8E93'}}>Halfmoon Coffee</div>
				</div>
			</div>
		</div>
	);
};

/** Small live-voice pill in the toolbar: shows the app is listening (blue) or Riff is talking (dark). */
const ListenPill: React.FC<{user: number; riff: number}> = ({user, riff}) => {
	const frame = useCurrentFrame();
	const talking = riff > user && riff > 0.04;
	const lv = Math.max(user, riff);
	const col = talking ? '#1D1D1F' : '#3D7BFF';
	return (
		<div style={{height: 38, padding: '0 14px 0 12px', borderRadius: 19, ...glass(0.7), display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, fontWeight: 600, color: '#3A3A3C'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 2.5, height: 18}}>
				{[0.5, 0.85, 1, 0.7, 0.45].map((sh, i) => {
					const wob = 0.55 + 0.45 * Math.abs(Math.sin(frame * 0.5 + i * 1.3));
					const v = Math.max(0.22, Math.min(1, lv * 2.2 * sh * wob));
					return <div key={i} style={{width: 3, height: Math.max(3, v * 18), borderRadius: 2, background: col, opacity: 0.45 + 0.55 * Math.min(1, lv * 5)}} />;
				})}
			</div>
			{talking ? 'Riff' : 'Listening'}
		</div>
	);
};

export const Toolbar: React.FC<{zoom: number; user?: number; riff?: number}> = ({zoom, user = 0, riff = 0}) => (
	<div
		style={{
			position: 'absolute',
			left: SIDEBAR.x + SIDEBAR.w + 18,
			right: 16,
			top: 12,
			height: 38,
			display: 'flex',
			alignItems: 'center',
			fontFamily: SANS,
			zIndex: 20,
		}}
	>
		<div style={{display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 19, ...glass(0.7)}}>
			<div style={{fontSize: 14.5, fontWeight: 650, color: '#1D1D1F'}}>Halfmoon</div>
			<div style={{fontSize: 14, color: '#8E8E93'}}>— Brand</div>
			<IChevron size={16} />
		</div>
		<div style={{marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center'}}>
			<ListenPill user={user} riff={riff} />
			<div style={{height: 38, padding: '0 14px', borderRadius: 19, ...glass(0.7), display: 'flex', alignItems: 'center', fontSize: 13.5, fontWeight: 600, color: '#3A3A3C'}}>
				{Math.round(zoom * 100)}%
			</div>
			<div style={{width: 38, height: 38, borderRadius: 19, ...glass(0.7), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<IPlay size={17} />
			</div>
			<div
				style={{
					height: 38,
					padding: '0 16px',
					borderRadius: 19,
					background: '#1D1D1F',
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					fontSize: 13.5,
					fontWeight: 600,
					boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
				}}
			>
				<IShare size={16} color="#fff" />
				Share
			</div>
		</div>
	</div>
);

export const VoiceBar: React.FC<{user: number; riff: number; label?: string}> = ({user, riff, label}) => {
	const frame = useCurrentFrame();
	const speaking = riff > user && riff > 0.04;
	const lvl = Math.max(user, riff);
	const bars = 26;
	return (
		<div
			style={{
				position: 'absolute',
				left: CANVAS_CENTER.x - 250,
				bottom: 22,
				width: 500,
				height: 60,
				borderRadius: 30,
				...glass(0.78),
				display: 'flex',
				alignItems: 'center',
				padding: '0 10px',
				boxSizing: 'border-box',
				gap: 14,
				fontFamily: SANS,
				zIndex: 20,
			}}
		>
			<RiffIcon size={42} level={speaking ? riff : 0.15} glow={speaking ? clamp01(riff * 2) : 0} />
			<div style={{width: 92}}>
				<div style={{fontSize: 14, fontWeight: 650, color: '#1D1D1F'}}>{label ?? (speaking ? 'Riff' : 'Listening')}</div>
				<div style={{fontSize: 12, color: '#8E8E93', marginTop: 1}}>{speaking ? 'Speaking' : user > 0.04 ? 'You' : 'Ready'}</div>
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 4, height: 30, flex: 1}}>
				{new Array(bars).fill(0).map((_, i) => {
					const wob = 0.5 + 0.5 * Math.sin(frame * 0.55 + i * 0.9) * Math.sin(frame * 0.21 + i * 0.37);
					const env = Math.sin((i / (bars - 1)) * Math.PI);
					const v = Math.max(0.1, Math.min(1, lvl * 1.5 * (0.35 + 0.65 * Math.abs(wob)) * (0.4 + 0.6 * env)));
					return <div key={i} style={{width: 3.5, height: Math.max(3.5, v * 30), borderRadius: 2, background: speaking ? '#1D1D1F' : '#3D7BFF', opacity: 0.35 + 0.65 * Math.min(1, lvl * 4)}} />;
				})}
			</div>
			<div style={{width: 40, height: 40, borderRadius: 20, background: user > 0.04 ? '#3D7BFF' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<svg width={18} height={18} viewBox="0 0 20 20">
					<rect x={7} y={2.5} width={6} height={10} rx={3} fill={user > 0.04 ? '#fff' : '#3A3A3C'} />
					<path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" stroke={user > 0.04 ? '#fff' : '#3A3A3C'} strokeWidth={1.6} fill="none" strokeLinecap="round" />
				</svg>
			</div>
		</div>
	);
};

/** The Riff window frame. `children` is the infinite canvas content (already camera-transformed). */
export const RiffWindow: React.FC<{children: React.ReactNode; items: SideItem[]; active: number; zoom: number; user: number; riff: number}> = ({
	children,
	items,
	active,
	zoom,
	user,
	riff,
}) => (
	<div
		style={{
			position: 'absolute',
			left: WIN.x,
			top: WIN.y,
			width: WIN.w,
			height: WIN.h,
			borderRadius: 26,
			overflow: 'hidden',
			background: '#ECEBE8',
			boxShadow: '0 40px 100px rgba(30,10,30,0.45), 0 12px 30px rgba(30,10,30,0.25), 0 0 0 1px rgba(0,0,0,0.2)',
		}}
	>
		{/* dot grid */}
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundImage: 'radial-gradient(rgba(0,0,0,0.11) 1.1px, transparent 1.3px)',
				backgroundSize: `${22 * zoom}px ${22 * zoom}px`,
			}}
		/>
		<div style={{position: 'absolute', inset: 0}}>{children}</div>
		<Toolbar zoom={zoom} user={user} riff={riff} />
		<Sidebar items={items} active={active} />
		<div style={{position: 'absolute', inset: 0, borderRadius: 26, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)', pointerEvents: 'none', zIndex: 30}} />
	</div>
);
