import React from 'react';
import {Img, staticFile} from 'remotion';
import {MenuGlyph} from '../brand/brand';
import {SYS} from '../lib/tokens';

// The desktop is a 4K portrait display at "looks like 720 x 1280" (points). The film renders it at 1.5 px/pt
// (1080 x 1920) and the camera pushes in from there.
export const DESK = {w: 720, h: 1280};
export const MENU_H = 24;

// ------------------------------------------------------------------ wallpaper (baked to public/img/wall.jpg)
export const WallpaperSVG: React.FC<{w?: number; h?: number}> = ({w = DESK.w, h = DESK.h}) => (
	<svg width={w} height={h} viewBox="0 0 720 1280" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
		<defs>
			<linearGradient id="sky" x1="0.2" y1="0" x2="0.6" y2="1">
				<stop offset="0" stopColor="#F3D9C6" />
				<stop offset="0.28" stopColor="#E7A88E" />
				<stop offset="0.55" stopColor="#9C7FB6" />
				<stop offset="0.8" stopColor="#4C4A93" />
				<stop offset="1" stopColor="#1E2152" />
			</linearGradient>
			{[
				['w1', '#F2B49A', '#E08A7E'],
				['w2', '#D9837E', '#A65C8E'],
				['w3', '#9A5E99', '#62488F'],
				['w4', '#4E428A', '#2C2C6A'],
				['w5', '#232659', '#11143A'],
			].map(([id, a, b]) => (
				<linearGradient key={id} id={id} x1="0" y1="0" x2="0.25" y2="1">
					<stop offset="0" stopColor={a} />
					<stop offset="1" stopColor={b} />
				</linearGradient>
			))}
			<radialGradient id="sun" cx="0.72" cy="0.16" r="0.42">
				<stop offset="0" stopColor="rgba(255,238,220,0.9)" />
				<stop offset="1" stopColor="rgba(255,238,220,0)" />
			</radialGradient>
			<filter id="soft">
				<feGaussianBlur stdDeviation="10" />
			</filter>
			<filter id="grainW">
				<feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="11" />
				<feColorMatrix type="saturate" values="0" />
			</filter>
		</defs>
		<rect width={720} height={1280} fill="url(#sky)" />
		<rect width={720} height={1280} fill="url(#sun)" />
		{[
			['w1', 'M0 520 C 150 450 300 560 460 500 C 590 452 660 420 720 440 L720 1280 L0 1280 Z'],
			['w2', 'M0 690 C 170 620 330 730 500 670 C 610 632 680 600 720 612 L720 1280 L0 1280 Z'],
			['w3', 'M0 860 C 150 800 360 900 520 846 C 620 812 690 792 720 800 L720 1280 L0 1280 Z'],
			['w4', 'M0 1020 C 190 960 380 1050 540 1006 C 640 980 700 968 720 972 L720 1280 L0 1280 Z'],
			['w5', 'M0 1160 C 180 1112 400 1190 560 1150 C 650 1128 700 1122 720 1126 L720 1280 L0 1280 Z'],
		].map(([id, d]) => (
			<g key={id}>
				<path d={d} fill={`url(#${id})`} />
				<path d={d.split(' L720 1280')[0]} fill="none" stroke="rgba(255,240,230,0.35)" strokeWidth={6} filter="url(#soft)" />
			</g>
		))}
		<rect width={720} height={1280} filter="url(#grainW)" opacity={0.05} />
	</svg>
);

export const Wallpaper: React.FC = () => <Img src={staticFile('img/wall.jpg')} style={{position: 'absolute', left: 0, top: 0, width: DESK.w, height: DESK.h}} />;

// ------------------------------------------------------------------ menu bar
const AppleGlyph: React.FC<{size: number}> = ({size}) => (
	<svg width={size * 0.84} height={size} viewBox="0 0 17 20" style={{display: 'block'}}>
		<path
			d="M14.1 10.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8C5.2 5.6 3.8 6.5 3 7.9c-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 1.9-1.1 2.7-2.2.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.5-.9-2.5-3.8zM11.9 4.1c.6-.7 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.6-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3z"
			fill="#fff"
		/>
	</svg>
);

export const MenuBar: React.FC<{app: string; menus: string[]; pr?: number; prOpen?: number}> = ({app, menus, pr = 0}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			width: DESK.w,
			height: MENU_H,
			display: 'flex',
			alignItems: 'center',
			padding: '0 12px',
			boxSizing: 'border-box',
			fontFamily: SYS,
			fontSize: 12.5,
			color: '#fff',
			textShadow: '0 1px 2px rgba(60,20,40,0.35)',
			zIndex: 50,
		}}
	>
		<div style={{marginRight: 15, marginTop: -1}}>
			<AppleGlyph size={14} />
		</div>
		<div style={{fontWeight: 700, marginRight: 15, letterSpacing: '-0.01em'}}>{app}</div>
		{menus.map((x) => (
			<div key={x} style={{fontWeight: 500, marginRight: 14, opacity: 0.96}}>
				{x}
			</div>
		))}
		<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 13, fontWeight: 500}}>
			{/* Paste Real lives in the menu bar */}
			<div style={{position: 'relative', width: 20, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{position: 'absolute', inset: -2, borderRadius: 5, background: `rgba(255,255,255,${0.28 * pr})`}} />
				<MenuGlyph size={15} />
			</div>
			<svg width={22} height={11} viewBox="0 0 26 13">
				<rect x={0.8} y={0.8} width={21.4} height={11.4} rx={3.4} stroke="#fff" strokeWidth={1.3} fill="none" opacity={0.6} />
				<rect x={2.6} y={2.6} width={15} height={7.8} rx={1.8} fill="#fff" />
				<rect x={23.4} y={4.3} width={1.6} height={4.4} rx={0.8} fill="#fff" opacity={0.6} />
			</svg>
			<svg width={15} height={12} viewBox="0 0 18 14">
				<path d="M9 12.6 6.6 10a3.4 3.4 0 0 1 4.8 0z" fill="#fff" />
				<path d="M3.9 7.4a7.3 7.3 0 0 1 10.2 0M1.2 4.6a11.2 11.2 0 0 1 15.6 0" stroke="#fff" strokeWidth={1.7} fill="none" strokeLinecap="round" />
			</svg>
			<svg width={14} height={13} viewBox="0 0 16 15">
				<rect x={1} y={2} width={6} height={4} rx={2} stroke="#fff" strokeWidth={1.4} fill="none" />
				<rect x={9} y={2} width={6} height={4} rx={2} fill="#fff" />
				<rect x={1} y={9} width={6} height={4} rx={2} fill="#fff" />
				<rect x={9} y={9} width={6} height={4} rx={2} stroke="#fff" strokeWidth={1.4} fill="none" />
			</svg>
			<div style={{letterSpacing: '0.01em'}}>Wed Oct 7&nbsp;&nbsp;9:41 AM</div>
		</div>
	</div>
);

// ------------------------------------------------------------------ window chrome
export const Traffic: React.FC<{dim?: boolean; size?: number}> = ({dim, size = 12}) => (
	<div style={{display: 'flex', gap: size * 0.66}}>
		{(dim ? ['#D0D0D4', '#D0D0D4', '#D0D0D4'] : ['#FF5F57', '#FEBC2E', '#28C840']).map((c, i) => (
			<div key={i} style={{width: size, height: size, borderRadius: size / 2, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.16)'}} />
		))}
	</div>
);

export const winShadow = (front: boolean) =>
	front
		? '0 26px 60px rgba(20,10,40,0.42), 0 8px 20px rgba(20,10,40,0.22), 0 0 0 0.5px rgba(0,0,0,0.25)'
		: '0 16px 40px rgba(20,10,40,0.28), 0 4px 12px rgba(20,10,40,0.16), 0 0 0 0.5px rgba(0,0,0,0.2)';

export const Win: React.FC<{x: number; y: number; w: number; h: number; front?: boolean; radius?: number; bg?: string; children: React.ReactNode; z?: number}> = ({
	x,
	y,
	w,
	h,
	front = true,
	radius = 16,
	bg = '#fff',
	children,
	z = 1,
}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius, overflow: 'hidden', background: bg, boxShadow: winShadow(front), zIndex: z}}>
		{children}
		<div style={{position: 'absolute', inset: 0, borderRadius: radius, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.45)', pointerEvents: 'none'}} />
	</div>
);

// ------------------------------------------------------------------ cursors (drawn from scratch)
export type CursorKind = 'arrow' | 'ibeam' | 'hand' | 'cross' | 'ns' | 'rotate';
export const Cursor: React.FC<{x: number; y: number; kind?: CursorKind; press?: number; size?: number; angle?: number}> = ({x, y, kind = 'arrow', press = 0, size = 1, angle = 0}) => {
	const s = size;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, zIndex: 400, pointerEvents: 'none'}}>
			{kind === 'arrow' ? (
				<svg width={22 * s} height={22 * s} viewBox="0 0 30 30" style={{position: 'absolute', left: -4.4 * s, top: -2.2 * s, transform: `scale(${1 - 0.12 * press})`, transformOrigin: '20% 10%', filter: 'drop-shadow(0 1.5px 2px rgba(0,0,0,0.35))', overflow: 'visible'}}>
					<path d="M6 3 L6 24.5 L11 19.8 L14.3 27.2 L18 25.6 L14.8 18.4 L21.6 18.4 Z" fill="#000" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
				</svg>
			) : kind === 'ibeam' ? (
				<svg width={10 * s} height={20 * s} viewBox="0 0 10 20" style={{position: 'absolute', left: -5 * s, top: -10 * s, filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.9))'}}>
					<path d="M2 1.5h2.2c.5 0 .8.3.8.8v15.4c0 .5-.3.8-.8.8H2M8 1.5H5.8c-.5 0-.8.3-.8.8M8 18.5H5.8c-.5 0-.8-.3-.8-.8M3.5 10h3" stroke="#000" strokeWidth={1.3} fill="none" strokeLinecap="round" />
				</svg>
			) : kind === 'ns' ? (
				<svg width={14 * s} height={24 * s} viewBox="0 0 14 24" style={{position: 'absolute', left: -7 * s, top: -12 * s, filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.35))', overflow: 'visible'}}>
					<path d="M7 1 12.5 7.2H8.6v9.6h3.9L7 23 1.5 16.8h3.9V7.2H1.5Z" fill="#000" stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
				</svg>
			) : kind === 'rotate' ? (
				<svg width={22 * s} height={22 * s} viewBox="0 0 22 22" style={{position: 'absolute', left: -11 * s, top: -11 * s, transform: `rotate(${angle}deg)`, filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.35))', overflow: 'visible'}}>
					<path d="M4.5 15.5A9 9 0 0 1 15.5 4.5" fill="none" stroke="#fff" strokeWidth={4.2} strokeLinecap="round" />
					<path d="M4.5 15.5A9 9 0 0 1 15.5 4.5" fill="none" stroke="#000" strokeWidth={1.8} strokeLinecap="round" />
					<path d="M1.2 12.6 4.2 17.8 9.3 14.6Z" fill="#000" stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" />
					<path d="M12.6 1.2 17.8 4.2 14.6 9.3Z" fill="#000" stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" />
				</svg>
			) : kind === 'cross' ? (
				<svg width={24 * s} height={24 * s} viewBox="0 0 24 24" style={{position: 'absolute', left: -12 * s, top: -12 * s, filter: 'drop-shadow(0 0 1.2px rgba(255,255,255,0.95))'}}>
					<path d="M12 2v8M12 14v8M2 12h8M14 12h8" stroke="#000" strokeWidth={1.4} strokeLinecap="round" />
				</svg>
			) : (
				<svg width={22 * s} height={24 * s} viewBox="0 0 22 24" style={{position: 'absolute', left: -7 * s, top: -2 * s, filter: 'drop-shadow(0 1.5px 2px rgba(0,0,0,0.3))', transform: `scale(${1 - 0.1 * press})`}}>
					<path d="M7.5 11V3.6a1.6 1.6 0 0 1 3.2 0V10m0-1.4a1.6 1.6 0 0 1 3.2 0V10.4m0-.9a1.6 1.6 0 0 1 3.2 0v1.3m0-.3a1.5 1.5 0 0 1 3 0v4.6c0 4-2.6 6.9-6.4 6.9H11c-2.4 0-3.8-1-5-2.8L3 14.7c-.7-1 .1-2.4 1.3-2.4.6 0 1.1.3 1.5.8L7.5 15V11" fill="#fff" stroke="#000" strokeWidth={1.25} strokeLinejoin="round" />
				</svg>
			)}
		</div>
	);
};

// ------------------------------------------------------------------ small glyphs used in toolbars
export const G = {
	sidebar: (c = '#6E6E73') => (
		<svg width={17} height={14} viewBox="0 0 17 14">
			<rect x={0.8} y={0.8} width={15.4} height={12.4} rx={3} stroke={c} strokeWidth={1.3} fill="none" />
			<path d="M6 1v12" stroke={c} strokeWidth={1.3} />
		</svg>
	),
	back: (c = '#6E6E73') => (
		<svg width={9} height={14} viewBox="0 0 9 14">
			<path d="M7.5 1.5 2 7l5.5 5.5" stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	fwd: (c = '#C3C3C8') => (
		<svg width={9} height={14} viewBox="0 0 9 14">
			<path d="M1.5 1.5 7 7l-5.5 5.5" stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	lock: (c = '#8E8E93') => (
		<svg width={9} height={11} viewBox="0 0 9 11">
			<rect x={0.5} y={4.5} width={8} height={6} rx={1.4} fill={c} />
			<path d="M2.2 4.6V3.2a2.3 2.3 0 0 1 4.6 0v1.4" stroke={c} strokeWidth={1.2} fill="none" />
		</svg>
	),
	share: (c = '#6E6E73') => (
		<svg width={13} height={16} viewBox="0 0 13 16">
			<path d="M6.5 1.2v8.6M3.6 3.8 6.5 1l2.9 2.8M3.7 6.4H2.3c-.6 0-1 .4-1 1v6.4c0 .6.4 1 1 1h8.4c.6 0 1-.4 1-1V7.4c0-.6-.4-1-1-1H9.3" stroke={c} strokeWidth={1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	plus: (c = '#6E6E73') => (
		<svg width={13} height={13} viewBox="0 0 13 13">
			<path d="M6.5 1.5v10M1.5 6.5h10" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
		</svg>
	),
	tabs: (c = '#6E6E73') => (
		<svg width={16} height={14} viewBox="0 0 16 14">
			<rect x={3.5} y={0.8} width={11.7} height={9.4} rx={2.2} stroke={c} strokeWidth={1.3} fill="none" />
			<path d="M1 4v6.6c0 1.4 1 2.4 2.4 2.4H10" stroke={c} strokeWidth={1.3} fill="none" strokeLinecap="round" />
		</svg>
	),
	reload: (c = '#8E8E93') => (
		<svg width={11} height={11} viewBox="0 0 12 12">
			<path d="M10.2 6.2A4.2 4.2 0 1 1 8.7 2.9M8.6 0.9v2.4H11" stroke={c} strokeWidth={1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
};
