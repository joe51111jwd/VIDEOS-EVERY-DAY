// Mac window chrome for the apps in the film (our own designs, no third-party logos).
import React from 'react';
import {Img, staticFile} from 'remotion';
import {MONO, SANS} from '../lib/tokens';
import {SEL} from './ui';

export const Traffic: React.FC<{size?: number}> = ({size = 14}) => (
	<div style={{display: 'flex', gap: size * 0.6}}>
		{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
			<div key={c} style={{width: size, height: size, borderRadius: size / 2, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)'}} />
		))}
	</div>
);

export const Wall: React.FC<{dim?: number}> = ({dim = 0}) => (
	<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
		<Img src={staticFile('wall.jpg')} style={{position: 'absolute', left: -1166, top: 0, width: 3413, height: 1920, objectFit: 'cover', filter: `brightness(${0.92 - dim})`}} />
	</div>
);

export const Win: React.FC<{x: number; y: number; w: number; h: number; dark?: boolean; children: React.ReactNode; o?: number; style?: React.CSSProperties}> = ({x, y, w, h, dark, children, o = 1, style}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			width: w,
			height: h,
			borderRadius: 20,
			overflow: 'hidden',
			background: dark ? '#1C1C1F' : '#FFFFFF',
			boxShadow: '0 40px 90px rgba(10,20,60,0.42), 0 10px 26px rgba(10,20,60,0.22), 0 0 0 1px rgba(0,0,0,0.14)',
			opacity: o,
			...style,
		}}
	>
		{children}
	</div>
);

export const BrowserBar: React.FC<{url: string; tab: string}> = ({url, tab}) => (
	<div style={{background: '#EDEDF0', borderBottom: '1px solid rgba(0,0,0,0.08)'}}>
		<div style={{height: 48, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 22}}>
			<Traffic />
			<div style={{height: 34, marginTop: 12, padding: '0 16px', borderRadius: '10px 10px 0 0', background: '#fff', display: 'flex', alignItems: 'center', gap: 9, fontFamily: SANS, fontWeight: 560, fontSize: 16, color: '#2C2C2E', minWidth: 300}}>
				<div style={{width: 18, height: 18, borderRadius: 5, background: '#0A0F1F', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg width={12} height={12} viewBox="0 0 24 24">
						<path d="M12 1.5c.5 5.6 4.9 10 10.5 10.5-5.6.5-10 4.9-10.5 10.5C11.5 16.9 7.1 12.5 1.5 12 7.1 11.5 11.5 7.1 12 1.5Z" fill="#9DB7FF" />
					</svg>
				</div>
				{tab}
			</div>
		</div>
		<div style={{height: 50, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14}}>
			<svg width={22} height={22} viewBox="0 0 22 22">
				<path d="M13.5 5 7.5 11l6 6" stroke="#8E8E93" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
			<svg width={22} height={22} viewBox="0 0 22 22">
				<path d="M8.5 5l6 6-6 6" stroke="#C7C7CC" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
			<div style={{flex: 1, height: 36, borderRadius: 10, background: '#F1F1F4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: SANS, fontWeight: 500, fontSize: 16.5, color: '#3A3A3C'}}>
				<svg width={13} height={15} viewBox="0 0 13 15">
					<rect x={1} y={6.5} width={11} height={7.5} rx={2} fill="#8E8E93" />
					<path d="M3.5 6.5V4.5a3 3 0 0 1 6 0v2" stroke="#8E8E93" strokeWidth={1.7} fill="none" />
				</svg>
				{url}
			</div>
		</div>
	</div>
);

const Tool: React.FC<{d: React.ReactNode; on?: boolean}> = ({d, on}) => (
	<div style={{width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? SEL : undefined}}>
		<svg width={22} height={22} viewBox="0 0 22 22" style={{color: on ? '#fff' : '#3A3A3C'}}>
			{d}
		</svg>
	</div>
);

/** design tool toolbar (the film's stand-in for Figma) */
export const DesignBar: React.FC<{file: string}> = ({file}) => (
	<div style={{height: 62, background: '#2C2C2E', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 6, color: '#fff', position: 'relative'}}>
		<Traffic />
		<div style={{width: 18}} />
		<div style={{display: 'flex', gap: 4, filter: 'invert(1)'}}>
			<Tool d={<path d="M5 3.5 5 17l3.6-3.4 2.6 5.6 2.4-1.1-2.6-5.5 5-.3Z" fill="currentColor" />} />
			<Tool d={<path d="M7 3v16M15 3v16M3 7h16M3 15h16" stroke="currentColor" strokeWidth={1.8} />} />
			<Tool d={<rect x={4} y={4} width={14} height={14} rx={1.5} fill="none" stroke="currentColor" strokeWidth={1.8} />} />
			<Tool d={<path d="M4 18 14 4l4 4L8 18H4Z" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />} />
			<Tool d={<path d="M5 5h12M11 5v13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />} />
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 18, color: 'rgba(255,255,255,0.92)', pointerEvents: 'none'}}>
			{file}
		</div>
		<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
			<div style={{width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg, #FFB86B, #F2542D)', boxShadow: '0 0 0 2px #2C2C2E, 0 0 0 3.5px rgba(255,255,255,0.5)'}} />
			<div style={{height: 36, padding: '0 16px', borderRadius: 9, background: SEL, fontFamily: SANS, fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center'}}>Share</div>
		</div>
	</div>
);

export const TreeRow: React.FC<{depth: number; icon: 'frame' | 'auto' | 'text' | 'group' | 'rect'; name: string; sel?: number; o?: number; caret?: 'open' | 'closed'}> = ({depth, icon, name, sel = 0, o = 1, caret}) => (
	<div
		style={{
			height: 42,
			display: 'flex',
			alignItems: 'center',
			gap: 9,
			paddingLeft: 12 + depth * 20,
			background: sel > 0 ? `rgba(47,107,255,${0.16 * sel})` : undefined,
			fontFamily: SANS,
			fontWeight: sel > 0.5 ? 620 : 500,
			fontSize: 17.5,
			color: sel > 0.5 ? SEL : '#1C1C1E',
			opacity: o,
			transform: `translateX(${(1 - o) * -12}px)`,
			whiteSpace: 'nowrap',
		}}
	>
		<div style={{width: 12, color: '#8E8E93', fontSize: 11}}>{caret === 'open' ? '▾' : caret === 'closed' ? '▸' : ''}</div>
		<svg width={18} height={18} viewBox="0 0 18 18" style={{color: sel > 0.5 ? SEL : '#6E6E73', flexShrink: 0}}>
			{icon === 'frame' ? <path d="M6 2v14M12 2v14M2 6h14M2 12h14" stroke="currentColor" strokeWidth={1.6} /> : null}
			{icon === 'auto' ? (
				<g fill="none" stroke="currentColor" strokeWidth={1.6}>
					<rect x={2} y={2} width={14} height={14} rx={2} />
					<path d="M5.5 6.5h7M5.5 9h7M5.5 11.5h7" />
				</g>
			) : null}
			{icon === 'text' ? <path d="M4 4h10M9 4v11" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" /> : null}
			{icon === 'group' ? <rect x={2.5} y={2.5} width={13} height={13} rx={2} fill="none" stroke="currentColor" strokeWidth={1.6} strokeDasharray="2.5 2" /> : null}
			{icon === 'rect' ? <rect x={2.5} y={4} width={13} height={10} rx={2} fill="none" stroke="currentColor" strokeWidth={1.6} /> : null}
		</svg>
		{name}
	</div>
);

export const Mono: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 16, color = '#3A3A3C'}) => <span style={{fontFamily: MONO, fontSize: size, color}}>{children}</span>;
