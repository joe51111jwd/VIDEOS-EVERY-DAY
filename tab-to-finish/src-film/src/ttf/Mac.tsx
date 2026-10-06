import React from 'react';
import {Img, staticFile} from 'remotion';
import {SANS} from './tokens';

// ------------------------------------------------------------------ wallpaper (baked to public/wall.jpg by the WallStill composition)
export const WallpaperSVG: React.FC = () => (
	<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
		<defs>
			<linearGradient id="sky" x1="0" y1="0" x2="0.2" y2="1">
				<stop offset="0" stopColor="#DCE9F5" />
				<stop offset="0.35" stopColor="#A9C6EA" />
				<stop offset="0.7" stopColor="#6C8FD6" />
				<stop offset="1" stopColor="#3A4FA8" />
			</linearGradient>
			{[
				['w1', '#BFD6F2', '#8FB0E6'],
				['w2', '#8FAAE6', '#6A7FD8'],
				['w3', '#6C78D2', '#4B4FB4'],
				['w4', '#4A4AA8', '#2E2F80'],
				['w5', '#2C2C72', '#16174A'],
			].map(([id, a, b]) => (
				<linearGradient key={id} id={id} x1="0" y1="0" x2="0.3" y2="1">
					<stop offset="0" stopColor={a} />
					<stop offset="1" stopColor={b} />
				</linearGradient>
			))}
			<radialGradient id="sun" cx="0.22" cy="0.16" r="0.5">
				<stop offset="0" stopColor="rgba(255,244,232,0.9)" />
				<stop offset="1" stopColor="rgba(255,244,232,0)" />
			</radialGradient>
			<radialGradient id="glow" cx="0.85" cy="0.75" r="0.5">
				<stop offset="0" stopColor="rgba(150,120,255,0.35)" />
				<stop offset="1" stopColor="rgba(150,120,255,0)" />
			</radialGradient>
			<filter id="soft">
				<feGaussianBlur stdDeviation="16" />
			</filter>
			<filter id="grainW">
				<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
				<feColorMatrix type="saturate" values="0" />
			</filter>
		</defs>
		<rect width={1920} height={1080} fill="url(#sky)" />
		<rect width={1920} height={1080} fill="url(#sun)" />
		{[
			['w1', 'M0 420 C 360 340 700 470 1040 400 C 1380 330 1640 280 1920 330 L1920 1080 L0 1080 Z'],
			['w2', 'M0 560 C 340 490 720 620 1100 560 C 1440 505 1680 440 1920 480 L1920 1080 L0 1080 Z'],
			['w3', 'M0 700 C 320 630 780 760 1140 700 C 1460 645 1720 610 1920 650 L1920 1080 L0 1080 Z'],
			['w4', 'M0 840 C 440 770 800 880 1200 830 C 1540 790 1770 770 1920 800 L1920 1080 L0 1080 Z'],
			['w5', 'M0 965 C 380 910 840 1000 1260 955 C 1580 922 1790 920 1920 940 L1920 1080 L0 1080 Z'],
		].map(([id, d]) => (
			<g key={id}>
				<path d={d} fill={`url(#${id})`} />
				<path d={d.split(' L1920 1080')[0]} fill="none" stroke="rgba(235,245,255,0.4)" strokeWidth={10} filter="url(#soft)" />
			</g>
		))}
		<rect width={1920} height={1080} fill="url(#glow)" />
		<rect width={1920} height={1080} filter="url(#grainW)" opacity={0.05} />
	</svg>
);

export const Wallpaper: React.FC<{w?: number; h?: number}> = ({w = 1920, h = 1080}) => (
	<Img src={staticFile('wall.jpg')} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, objectFit: 'cover'}} />
);

// ------------------------------------------------------------------ small icons
export const Icon = {
	chevL: (c = '#5E5E63') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<path d="M10 3 5 8l5 5" stroke={c} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	chevR: (c = '#C7C7CC') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<path d="M6 3l5 5-5 5" stroke={c} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	search: (c = '#5E5E63', s = 16) => (
		<svg width={s} height={s} viewBox="0 0 16 16">
			<circle cx={7} cy={7} r={4.6} stroke={c} strokeWidth={1.6} fill="none" />
			<path d="M10.4 10.4 14 14" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
		</svg>
	),
	grid: (c = '#3A3A3C') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			{[0, 1].map((r) => [0, 1].map((k) => <rect key={`${r}${k}`} x={2 + k * 6.5} y={2 + r * 6.5} width={5} height={5} rx={1.2} fill={c} />))}
		</svg>
	),
	list: (c = '#8E8E93') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			{[3, 8, 13].map((y) => (
				<rect key={y} x={2} y={y - 0.9} width={12} height={1.8} rx={0.9} fill={c} />
			))}
		</svg>
	),
	folder: (c = '#3D8BFD', s = 16) => (
		<svg width={s} height={s} viewBox="0 0 16 16">
			<path d="M1.8 4.2c0-.9.7-1.6 1.6-1.6h2.9l1.4 1.5h4.9c.9 0 1.6.7 1.6 1.6v6.1c0 .9-.7 1.6-1.6 1.6H3.4c-.9 0-1.6-.7-1.6-1.6z" fill="none" stroke={c} strokeWidth={1.4} />
		</svg>
	),
	clock: (c = '#3D8BFD') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<circle cx={8} cy={8} r={5.8} stroke={c} strokeWidth={1.4} fill="none" />
			<path d="M8 4.8V8l2.2 1.4" stroke={c} strokeWidth={1.4} fill="none" strokeLinecap="round" />
		</svg>
	),
	desktop: (c = '#3D8BFD') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<rect x={1.8} y={2.6} width={12.4} height={8.6} rx={1.4} stroke={c} strokeWidth={1.4} fill="none" />
			<path d="M5.5 13.6h5" stroke={c} strokeWidth={1.4} strokeLinecap="round" />
		</svg>
	),
	doc: (c = '#3D8BFD') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<path d="M4 1.9h5.2L12.4 5v8.1c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V2.9c0-.6.4-1 1-1z" stroke={c} strokeWidth={1.4} fill="none" />
		</svg>
	),
	down: (c = '#3D8BFD') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<circle cx={8} cy={8} r={5.8} stroke={c} strokeWidth={1.4} fill="none" />
			<path d="M8 4.8v6M5.6 8.6 8 11l2.4-2.4" stroke={c} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	cloud: (c = '#3D8BFD') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<path d="M4.6 12.4h7a2.8 2.8 0 0 0 .3-5.6 4 4 0 0 0-7.6-.9A3.3 3.3 0 0 0 4.6 12.4z" stroke={c} strokeWidth={1.4} fill="none" />
		</svg>
	),
	laptop: (c = '#3D8BFD') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<rect x={3} y={3.2} width={10} height={7} rx={1} stroke={c} strokeWidth={1.4} fill="none" />
			<path d="M1.5 12.6h13" stroke={c} strokeWidth={1.4} strokeLinecap="round" />
		</svg>
	),
	share: (c = '#3A3A3C') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<path d="M8 1.8v8.4M5.2 4.4 8 1.6l2.8 2.8M4.2 7H3.6v7h8.8V7h-.6" stroke={c} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	tag: (c = '#8E8E93') => (
		<svg width={16} height={16} viewBox="0 0 16 16">
			<circle cx={8} cy={8} r={4.2} fill={c} />
		</svg>
	),
};

/** Tab to Finish glyph: the ⇥ arrow, drawn so it's crisp at any size */
export const TabGlyph: React.FC<{size: number; color?: string; weight?: number}> = ({size, color = '#fff', weight = 2}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
		<path d="M3.5 12h14M12.5 6.8 17.7 12l-5.2 5.2M20.5 5.5v13" stroke={color} strokeWidth={weight} fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

// ------------------------------------------------------------------ menu bar
export const MenuBar: React.FC<{app: string; menus: string[]; w?: number; working?: number}> = ({app, menus, w = 1920, working = 0}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			width: w,
			height: 34,
			display: 'flex',
			alignItems: 'center',
			padding: '0 22px',
			boxSizing: 'border-box',
			fontFamily: SANS,
			fontSize: 14.5,
			color: '#fff',
			textShadow: '0 1px 3px rgba(20,30,70,0.35)',
			background: 'rgba(30,50,110,0.06)',
			zIndex: 5,
		}}
	>
		<svg width={15} height={17} viewBox="0 0 15 17" style={{marginRight: 22}}>
			<circle cx={7.5} cy={8.5} r={6.6} fill="none" stroke="#fff" strokeWidth={1.6} />
			<circle cx={7.5} cy={8.5} r={2.2} fill="#fff" />
		</svg>
		<div style={{fontWeight: 700, marginRight: 24, letterSpacing: '-0.01em'}}>{app}</div>
		{menus.map((x) => (
			<div key={x} style={{fontWeight: 500, marginRight: 22, opacity: 0.95}}>
				{x}
			</div>
		))}
		<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20, fontWeight: 500}}>
			{/* the product's own menu bar item */}
			<div style={{position: 'relative', width: 24, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{position: 'absolute', inset: -3, borderRadius: 6, background: `rgba(255,255,255,${0.22 * working})`}} />
				<TabGlyph size={19} color="#fff" weight={2.2} />
			</div>
			<svg width={26} height={13} viewBox="0 0 26 13">
				<rect x={0.8} y={0.8} width={21.4} height={11.4} rx={3.4} stroke="#fff" strokeWidth={1.2} fill="none" opacity={0.6} />
				<rect x={2.6} y={2.6} width={15} height={7.8} rx={1.8} fill="#fff" />
				<rect x={23.4} y={4.3} width={1.6} height={4.4} rx={0.8} fill="#fff" opacity={0.6} />
			</svg>
			<svg width={18} height={14} viewBox="0 0 18 14">
				<path d="M9 12.6 6.6 10a3.4 3.4 0 0 1 4.8 0z" fill="#fff" />
				<path d="M3.9 7.4a7.3 7.3 0 0 1 10.2 0M1.2 4.6a11.2 11.2 0 0 1 15.6 0" stroke="#fff" strokeWidth={1.6} fill="none" strokeLinecap="round" />
			</svg>
			{Icon.search('#fff', 15)}
			<div style={{letterSpacing: '0.01em'}}>Mon Oct 6&nbsp;&nbsp;9:41 AM</div>
		</div>
	</div>
);

// ------------------------------------------------------------------ window chrome
export const Traffic: React.FC<{dim?: boolean}> = ({dim}) => (
	<div style={{display: 'flex', gap: 9}}>
		{(dim ? ['#D4D4D8', '#D4D4D8', '#D4D4D8'] : ['#FF5F57', '#FEBC2E', '#28C840']).map((c, i) => (
			<div key={i} style={{width: 13, height: 13, borderRadius: 7, background: c, boxShadow: 'inset 0 0 0 0.6px rgba(0,0,0,0.16)'}} />
		))}
	</div>
);

export const glass = (a = 0.82): React.CSSProperties => ({
	background: `rgba(248,248,250,${a})`,
	boxShadow: '0 1px 0 rgba(255,255,255,0.85) inset, 0 0 0 1px rgba(0,0,0,0.07), 0 6px 18px rgba(0,0,0,0.07)',
});

export const windowShadow = (front: boolean) =>
	front
		? '0 40px 90px rgba(10,20,60,0.42), 0 12px 30px rgba(10,20,60,0.22), 0 0 0 1px rgba(0,0,0,0.18)'
		: '0 24px 60px rgba(10,20,60,0.28), 0 6px 18px rgba(10,20,60,0.16), 0 0 0 1px rgba(0,0,0,0.14)';

// ------------------------------------------------------------------ cursor (macOS-style arrow, drawn from scratch)
export const Cursor: React.FC<{x: number; y: number; press?: number; scale?: number}> = ({x, y, press = 0, scale = 1}) => (
	<div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, zIndex: 200, pointerEvents: 'none'}}>
		<svg
			width={30 * scale}
			height={30 * scale}
			viewBox="0 0 30 30"
			style={{position: 'absolute', left: -6 * scale, top: -3 * scale, transform: `scale(${1 - 0.1 * press})`, transformOrigin: '6px 3px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))', overflow: 'visible'}}
		>
			<path d="M6 3 L6 24.5 L11 19.8 L14.3 27.2 L18 25.6 L14.8 18.4 L21.6 18.4 Z" fill="#000" stroke="#fff" strokeWidth={1.7} strokeLinejoin="round" />
		</svg>
	</div>
);
