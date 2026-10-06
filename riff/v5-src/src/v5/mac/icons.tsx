import React from 'react';

type P = {size?: number; color?: string; sw?: number};
const S: React.FC<P & {children: React.ReactNode; vb?: number}> = ({size = 16, children, vb = 20}) => (
	<svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} style={{display: 'block', flexShrink: 0}}>
		{children}
	</svg>
);
const st = (color: string, sw: number) => ({stroke: color, strokeWidth: sw, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const});

export const IGlobe: React.FC<P> = ({size, color = '#3C3C43', sw = 1.4}) => (
	<S size={size}>
		<circle cx={10} cy={10} r={7.2} {...st(color, sw)} />
		<ellipse cx={10} cy={10} rx={3.2} ry={7.2} {...st(color, sw)} />
		<path d="M3 10h14M4.2 6.3h11.6M4.2 13.7h11.6" {...st(color, sw * 0.85)} />
	</S>
);
export const IPhone: React.FC<P> = ({size, color = '#3C3C43', sw = 1.4}) => (
	<S size={size}>
		<rect x={5.5} y={2.6} width={9} height={14.8} rx={2.4} {...st(color, sw)} />
		<path d="M8.6 4.6h2.8" {...st(color, sw)} />
	</S>
);
export const IPoster: React.FC<P> = ({size, color = '#3C3C43', sw = 1.4}) => (
	<S size={size}>
		<rect x={4.2} y={2.8} width={11.6} height={14.4} rx={1.6} {...st(color, sw)} />
		<circle cx={10} cy={8.4} r={2.6} {...st(color, sw)} />
		<path d="M6.8 13.6h6.4" {...st(color, sw)} />
	</S>
);
export const IStory: React.FC<P> = ({size, color = '#3C3C43', sw = 1.4}) => (
	<S size={size}>
		<rect x={5.6} y={2.4} width={8.8} height={15.2} rx={2} {...st(color, sw)} />
		<path d="M7.6 4.8h4.8" {...st(color, sw)} />
		<circle cx={10} cy={11} r={1.9} {...st(color, sw)} />
	</S>
);
export const IList: React.FC<P> = ({size, color = '#3C3C43', sw = 1.4}) => (
	<S size={size}>
		<rect x={4} y={2.8} width={12} height={14.4} rx={1.8} {...st(color, sw)} />
		<path d="M7 7h6M7 10h6M7 13h4" {...st(color, sw)} />
	</S>
);
export const ICard: React.FC<P> = ({size, color = '#3C3C43', sw = 1.4}) => (
	<S size={size}>
		<rect x={2.6} y={5} width={14.8} height={10} rx={1.8} {...st(color, sw)} />
		<path d="M5.4 12h4" {...st(color, sw)} />
	</S>
);
export const ISticker: React.FC<P> = ({size, color = '#3C3C43', sw = 1.4}) => (
	<S size={size}>
		<path d="M17 10a7 7 0 1 1-7-7h3.4L17 6.6z" {...st(color, sw)} />
		<path d="M13.4 3v3.6H17" {...st(color, sw)} />
	</S>
);
export const ITag: React.FC<P> = ({size, color = '#3C3C43', sw = 1.4}) => (
	<S size={size}>
		<path d="M3.2 10.6V4.2a1 1 0 0 1 1-1h6.4l6.2 6.2a1.2 1.2 0 0 1 0 1.7l-5.1 5.1a1.2 1.2 0 0 1-1.7 0z" {...st(color, sw)} />
		<circle cx={7} cy={7} r={1.2} fill={color} />
	</S>
);
export const IPlay: React.FC<P> = ({size, color = '#1C1C1E'}) => (
	<S size={size}>
		<path d="M6.5 4.4v11.2c0 .6.7 1 1.2.7l8.8-5.6c.5-.3.5-1.1 0-1.4L7.7 3.7c-.5-.3-1.2.1-1.2.7z" fill={color} />
	</S>
);
export const IShare: React.FC<P> = ({size, color = '#1C1C1E', sw = 1.5}) => (
	<S size={size}>
		<path d="M10 2.8v9.6M6.6 6l3.4-3.4L13.4 6" {...st(color, sw)} />
		<path d="M6.8 8.6H5.4a1 1 0 0 0-1 1v6.6a1 1 0 0 0 1 1h9.2a1 1 0 0 0 1-1V9.6a1 1 0 0 0-1-1h-1.4" {...st(color, sw)} />
	</S>
);
export const ISidebar: React.FC<P> = ({size, color = '#6E6E73', sw = 1.4}) => (
	<S size={size}>
		<rect x={2.6} y={4} width={14.8} height={12} rx={2.2} {...st(color, sw)} />
		<path d="M7.6 4v12" {...st(color, sw)} />
	</S>
);
export const IChevron: React.FC<P> = ({size, color = '#8E8E93', sw = 1.6}) => (
	<S size={size}>
		<path d="M7 8l3 3 3-3" {...st(color, sw)} />
	</S>
);
export const IPlus: React.FC<P> = ({size, color = '#6E6E73', sw = 1.6}) => (
	<S size={size}>
		<path d="M10 4.5v11M4.5 10h11" {...st(color, sw)} />
	</S>
);
export const ISearch: React.FC<P> = ({size, color = '#fff', sw = 1.6}) => (
	<S size={size}>
		<circle cx={8.6} cy={8.6} r={5} {...st(color, sw)} />
		<path d="M12.4 12.4l4 4" {...st(color, sw)} />
	</S>
);
export const IWifi: React.FC<P> = ({size, color = '#fff'}) => (
	<S size={size}>
		<path d="M2.6 7.6a10.6 10.6 0 0 1 14.8 0" {...st(color, 1.7)} />
		<path d="M5.2 10.4a6.9 6.9 0 0 1 9.6 0" {...st(color, 1.7)} />
		<path d="M7.8 13.1a3.1 3.1 0 0 1 4.4 0" {...st(color, 1.7)} />
		<circle cx={10} cy={15.6} r={1.2} fill={color} />
	</S>
);
export const IBattery: React.FC<P> = ({size = 26, color = '#fff'}) => (
	<svg width={size} height={size * 0.5} viewBox="0 0 28 14" style={{display: 'block'}}>
		<rect x={1} y={1.5} width={22.5} height={11} rx={3.4} fill="none" stroke={color} strokeWidth={1.1} opacity={0.55} />
		<rect x={2.8} y={3.3} width={16.5} height={7.4} rx={1.8} fill={color} />
		<path d="M25.3 5.2v3.6c.8-.3 1.3-1 1.3-1.8s-.5-1.5-1.3-1.8z" fill={color} opacity={0.55} />
	</svg>
);
export const IControl: React.FC<P> = ({size, color = '#fff'}) => (
	<S size={size}>
		<rect x={2.6} y={4} width={14.8} height={5} rx={2.5} {...st(color, 1.4)} />
		<circle cx={14.9} cy={6.5} r={1.6} fill={color} />
		<rect x={2.6} y={11} width={14.8} height={5} rx={2.5} {...st(color, 1.4)} />
		<circle cx={5.1} cy={13.5} r={1.6} fill={color} />
	</S>
);
