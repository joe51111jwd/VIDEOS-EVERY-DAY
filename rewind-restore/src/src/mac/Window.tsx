import React from 'react';
import {C, SANS} from '../lib/tokens';

export const Traffic: React.FC<{active?: boolean; size?: number}> = ({active = true, size = 13}) => {
	const cols = active ? ['#FF5F57', '#FEBC2E', '#28C840'] : ['#48484C', '#48484C', '#48484C'];
	return (
		<div style={{display: 'flex', gap: size * 0.62}}>
			{cols.map((c, i) => (
				<div key={i} style={{width: size, height: size, borderRadius: size, background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.35)'}} />
			))}
		</div>
	);
};

export type WinBox = {x: number; y: number; w: number; h: number};

/** a macOS (Tahoe, dark) window shell; apps draw their own toolbar inside */
export const Shell: React.FC<{
	box: WinBox;
	radius?: number;
	bg?: string;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}> = ({box, radius = 16, bg = C.win, children, style}) => (
	<div
		style={{
			position: 'absolute',
			left: box.x,
			top: box.y,
			width: box.w,
			height: box.h,
			borderRadius: radius,
			background: bg,
			overflow: 'hidden',
			boxShadow: '0 0 0 0.5px rgba(0,0,0,0.85), 0 28px 80px rgba(0,0,0,0.5), 0 8px 22px rgba(0,0,0,0.32)',
			fontFamily: SANS,
			color: C.text,
			...style,
		}}
	>
		{children}
		{/* the 1px light inner rim every Tahoe window has */}
		<div style={{position: 'absolute', inset: 0, borderRadius: radius, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)', pointerEvents: 'none'}} />
	</div>
);

/** a plain unified title bar: traffic lights + centered title */
export const TitleBar: React.FC<{title: string; sub?: string; active?: boolean; h?: number; bg?: string; children?: React.ReactNode}> = ({title, sub, active, h = 52, bg = C.bar, children}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, background: bg, borderBottom: `1px solid ${C.line}`}}>
		<div style={{position: 'absolute', left: 18, top: (h - 13) / 2}}>
			<Traffic active={active} />
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.15}}>
			<div style={{fontSize: 14, fontWeight: 650, color: active ? '#EDEDF0' : '#8E8E94', letterSpacing: '-0.01em'}}>{title}</div>
			{sub ? <div style={{fontSize: 11.5, fontWeight: 500, color: '#7C7C84'}}>{sub}</div> : null}
		</div>
		{children}
	</div>
);
