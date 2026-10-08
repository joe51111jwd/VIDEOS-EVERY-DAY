import React from 'react';
import {C, SANS, clamp01, easeInOut, easeOut, spr} from '../lib/tokens';
import {RiffGlyph} from '../lib/riff';

type IP = {size?: number; color?: string; sw?: number};
export const IPlay: React.FC<IP> = ({size = 20, color = '#E6E6EA'}) => (
	<svg width={size} height={size} viewBox="0 0 20 20">
		<path d="M6 4.2v11.6c0 .6.66.97 1.17.65l9.1-5.8a.77.77 0 0 0 0-1.3L7.17 3.55A.77.77 0 0 0 6 4.2z" fill={color} />
	</svg>
);
export const IPause: React.FC<IP> = ({size = 20, color = '#E6E6EA'}) => (
	<svg width={size} height={size} viewBox="0 0 20 20">
		<rect x="5" y="4" width="3.4" height="12" rx="1" fill={color} />
		<rect x="11.6" y="4" width="3.4" height="12" rx="1" fill={color} />
	</svg>
);
export const ISkip: React.FC<IP & {back?: boolean}> = ({size = 20, color = '#A9A9B0', back}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" style={{transform: back ? 'scaleX(-1)' : undefined}}>
		<path d="M3.5 5v10l7-5zM10.5 5v10l7-5z" fill={color} />
	</svg>
);
export const IScissors: React.FC<IP> = ({size = 16, color = C.ember, sw = 1.6}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
		<circle cx="5.5" cy="5.5" r="2.6" />
		<circle cx="5.5" cy="14.5" r="2.6" />
		<path d="M7.6 7.1 17 15M7.6 12.9 17 5" />
	</svg>
);
export const ISidebar: React.FC<IP> = ({size = 18, color = '#8E8E96', sw = 1.4}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={sw}>
		<rect x="2.5" y="3.5" width="15" height="13" rx="3" />
		<path d="M7.5 3.5v13" />
	</svg>
);
export const IShare: React.FC<IP> = ({size = 18, color = '#D8D8DE', sw = 1.5}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
		<path d="M10 12.5V3M6.5 6.2 10 2.8l3.5 3.4M6 9H4.8A1.8 1.8 0 0 0 3 10.8v4.4A1.8 1.8 0 0 0 4.8 17h10.4a1.8 1.8 0 0 0 1.8-1.8v-4.4A1.8 1.8 0 0 0 15.2 9H14" />
	</svg>
);
export const IMagnet: React.FC<IP> = ({size = 16, color = '#8E8E96', sw = 1.5}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
		<path d="M4 3.5v6a6 6 0 0 0 12 0v-6M4 7h3.5M12.5 7H16M7.5 3.5v6a2.5 2.5 0 0 0 5 0v-6" />
	</svg>
);
export const ILock: React.FC<IP> = ({size = 13, color = '#6E6E76', sw = 1.4}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={sw}>
		<rect x="4" y="9" width="12" height="8.5" rx="2" />
		<path d="M6.8 9V6.5a3.2 3.2 0 0 1 6.4 0V9" />
	</svg>
);
export const IEye: React.FC<IP> = ({size = 14, color = '#6E6E76', sw = 1.4}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={sw}>
		<path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" />
		<circle cx="10" cy="10" r="2.4" />
	</svg>
);
export const ISpeaker: React.FC<IP> = ({size = 14, color = '#6E6E76', sw = 1.4}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round">
		<path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" />
		<path d="M13.5 7a4 4 0 0 1 0 6M15.8 5a7 7 0 0 1 0 10" strokeLinecap="round" />
	</svg>
);
export const ISearch: React.FC<IP> = ({size = 18, color = '#9A9AA3', sw = 1.7}) => (
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
		<circle cx="8.6" cy="8.6" r="5.4" />
		<path d="m12.8 12.8 4.2 4.2" />
	</svg>
);

export const Traffic: React.FC = () => (
	<div style={{display: 'flex', gap: 9}}>
		{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
			<div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c, boxShadow: 'inset 0 0 0 0.6px rgba(0,0,0,0.25)'}} />
		))}
	</div>
);

/** "what Riff just did" chip: pops in with a spring, holds, fades */
export const Toast: React.FC<{t: number; at: number; hold?: number; text: string; icon?: 'riff' | 'cut'}> = ({t, at, hold = 1.0, text, icon = 'riff'}) => {
	if (t < at - 0.01 || t > at + hold + 0.3) return null;
	const s = spr(t, at, 18, 0.6);
	const out = easeInOut(clamp01((t - at - hold) / 0.25));
	const o = clamp01((t - at) / 0.08) * (1 - out);
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				height: 34,
				padding: '0 13px 0 10px',
				borderRadius: 11,
				background: 'linear-gradient(180deg, rgba(58,34,20,0.94), rgba(38,22,13,0.94))',
				boxShadow: '0 8px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,154,85,0.55)',
				color: '#FFD9BD',
				fontFamily: SANS,
				fontWeight: 600,
				fontSize: 16.5,
				letterSpacing: '-0.01em',
				whiteSpace: 'nowrap',
				opacity: o,
				transform: `translateY(${(1 - s) * 10 - out * 6}px) scale(${0.86 + 0.14 * s})`,
				transformOrigin: '50% 100%',
			}}
		>
			{icon === 'cut' ? <IScissors size={16} /> : <RiffGlyph size={22} level={0.25} color={C.ember} />}
			{text}
		</div>
	);
};

/** deterministic smooth noise in 0..1 */
export const noise = (x: number, seed = 1) => {
	const v = Math.sin(x * 2.1 + seed * 1.3) * 0.5 + Math.sin(x * 5.3 + seed * 2.7) * 0.3 + Math.sin(x * 11.7 + seed * 0.9) * 0.2;
	return 0.5 + 0.5 * v;
};

export const eased = (t: number, a: number, d: number) => easeOut(clamp01((t - a) / d));
