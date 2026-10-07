import React from 'react';
import {SYS} from '../lib/tokens';
import {G, Traffic} from '../mac/mac';

// ================================================================== Safari
export const SAFARI_BAR = 52;
export const SafariChrome: React.FC<{w: number; url: string; title?: string; front?: boolean}> = ({w, url, front = true}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			width: w,
			height: SAFARI_BAR,
			display: 'flex',
			alignItems: 'center',
			padding: '0 14px',
			boxSizing: 'border-box',
			background: front ? 'linear-gradient(180deg, #F7F6F8, #EFEEF1)' : '#F4F4F6',
			borderBottom: '0.5px solid rgba(0,0,0,0.12)',
			fontFamily: SYS,
			zIndex: 10,
		}}
	>
		<Traffic dim={!front} />
		<div style={{marginLeft: 16, display: 'flex', alignItems: 'center', gap: 14}}>
			{G.sidebar()}
			{G.back()}
			{G.fwd()}
		</div>
		<div
			style={{
				flex: 1,
				margin: '0 18px',
				height: 30,
				borderRadius: 9,
				background: 'rgba(0,0,0,0.055)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 7,
				fontSize: 13,
				color: '#1D1D1F',
				position: 'relative',
			}}
		>
			{G.lock()}
			<span style={{letterSpacing: '-0.005em'}}>{url}</span>
			<div style={{position: 'absolute', right: 10, top: 9}}>{G.reload()}</div>
		</div>
		<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
			{G.share()}
			{G.plus()}
			{G.tabs()}
		</div>
	</div>
);

// ================================================================== a social feed post (generic, not any real network)
const Heart = () => (
	<svg width={24} height={22} viewBox="0 0 24 22">
		<path d="M12 20.5s-8.5-5.2-8.5-11.2A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.5 2.9c0 6-8.5 11.2-8.5 11.2z" fill="none" stroke="#111" strokeWidth={1.9} strokeLinejoin="round" />
	</svg>
);
const Bubble = () => (
	<svg width={23} height={23} viewBox="0 0 23 23">
		<path d="M20.5 11.2a9 9 0 0 1-13.4 7.9L2.5 20.5l1.4-4.4A9 9 0 1 1 20.5 11.2z" fill="none" stroke="#111" strokeWidth={1.9} strokeLinejoin="round" />
	</svg>
);
const Send = () => (
	<svg width={23} height={22} viewBox="0 0 23 22">
		<path d="M21 2 2.5 9.2l7.2 3.1L21 2zm0 0L14 20l-4.3-7.7" fill="none" stroke="#111" strokeWidth={1.9} strokeLinejoin="round" />
	</svg>
);
const Save = () => (
	<svg width={19} height={23} viewBox="0 0 19 23">
		<path d="M2 2.5h15v18l-7.5-5.6L2 20.5z" fill="none" stroke="#111" strokeWidth={1.9} strokeLinejoin="round" />
	</svg>
);

export const FEED_POST = {w: 470, head: 54, foot: 112};
/** the post card; `media` is the 4:5 creative, laid out at FEED_POST.w wide */
export const FeedPost: React.FC<{media: React.ReactNode; mediaRef?: React.Ref<HTMLDivElement>}> = ({media}) => (
	<div style={{width: FEED_POST.w, background: '#fff', fontFamily: SYS, color: '#111'}}>
		<div style={{height: FEED_POST.head, display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px'}}>
			<div style={{width: 34, height: 34, borderRadius: 17, padding: 2, background: 'linear-gradient(135deg,#2340FF,#8FA0FF)'}}>
				<div style={{width: 30, height: 30, borderRadius: 15, border: '2px solid #fff', background: '#ECE6DA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Archivo', fontWeight: 900, fontStretch: '70%', fontSize: 10.5, color: '#2340FF'}}>
					LULL
				</div>
			</div>
			<div style={{lineHeight: 1.2}}>
				<div style={{fontSize: 13.5, fontWeight: 650}}>lull.water</div>
				<div style={{fontSize: 12, color: '#737373'}}>Sponsored</div>
			</div>
			<div style={{marginLeft: 'auto', fontSize: 20, letterSpacing: 1, color: '#111', marginRight: 6}}>···</div>
		</div>
		<div style={{width: FEED_POST.w, height: FEED_POST.w * 1.25, overflow: 'hidden', borderRadius: 4, background: '#eee'}}>{media}</div>
		<div style={{height: FEED_POST.foot, padding: '10px 4px 0', boxSizing: 'border-box'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
				<Heart />
				<Bubble />
				<Send />
				<div style={{marginLeft: 'auto'}}>
					<Save />
				</div>
			</div>
			<div style={{fontSize: 13.5, fontWeight: 650, marginTop: 9}}>4,812 likes</div>
			<div style={{fontSize: 13.5, marginTop: 4, lineHeight: 1.35}}>
				<b style={{fontWeight: 650}}>lull.water</b> New: N°3, yuzu &amp; salt. Canned cold, best sipped slow.
			</div>
		</div>
	</div>
);

/** line icons for the feed's left rail */
const RailIcon: React.FC<{i: number}> = ({i}) => {
	const st = {fill: 'none', stroke: '#111', strokeWidth: 1.9, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
	return (
		<svg width={22} height={22} viewBox="0 0 24 24">
			{i === 0 ? <path d="M3.5 10.5 12 3.5l8.5 7V20a.5.5 0 0 1-.5.5h-5v-6h-6v6H4a.5.5 0 0 1-.5-.5z" {...st} fill="#111" /> : null}
			{i === 1 ? (
				<>
					<circle cx={10.5} cy={10.5} r={6.5} {...st} />
					<path d="M15.5 15.5 20.5 20.5" {...st} />
				</>
			) : null}
			{i === 2 ? (
				<>
					<circle cx={12} cy={12} r={9} {...st} />
					<path d="m15.5 8.5-2 5-5 2 2-5z" {...st} />
				</>
			) : null}
			{i === 3 ? (
				<>
					<rect x={3} y={3} width={18} height={18} rx={5} {...st} />
					<path d="M3.5 8.5h17M8 3.5l3 5M13.5 3.5l3 5M10.5 12v5l4.3-2.5z" {...st} />
				</>
			) : null}
			{i === 4 ? <path d="M21 3 3 10.2l7.4 3L21 3zm0 0-7.6 18-3-7.8" {...st} /> : null}
			{i === 5 ? <path d="M12 20s-8-4.9-8-10.6A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8 2.8C20 15.1 12 20 12 20z" {...st} /> : null}
			{i === 6 ? (
				<>
					<rect x={3} y={3} width={18} height={18} rx={5} {...st} />
					<path d="M12 8v8M8 12h8" {...st} />
				</>
			) : null}
		</svg>
	);
};

const SUGGEST: [string, string, string][] = [
	['studio.kin', 'Followed by mara.v', '#E8B4A0'],
	['hause.co', 'New to the feed', '#9A5E99'],
	['frame.supply', 'Followed by olio', '#4E428A'],
	['olio.journal', 'Suggested for you', '#D8A657'],
];

/** the feed page around the post: left rail, the post, a suggestions column */
export const FeedPage: React.FC<{w: number; h: number; children: React.ReactNode; postX: number; postY: number}> = ({w, h, children, postX, postY}) => (
	<div style={{position: 'absolute', left: 0, top: SAFARI_BAR, width: w, height: h - SAFARI_BAR, background: '#fff', overflow: 'hidden', fontFamily: SYS}}>
		<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 64, borderRight: '1px solid #EFEFEF', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, gap: 23}}>
			<div style={{width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg,#FF8A4C,#E8336F 55%,#8C3BD9)', marginBottom: 6}} />
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<RailIcon key={i} i={i} />
			))}
			<div style={{width: 22, height: 22, borderRadius: 11, background: 'linear-gradient(135deg,#FF8A4C,#E8336F)', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>JC</div>
		</div>
		<div style={{position: 'absolute', left: postX, top: postY}}>{children}</div>
		<div style={{position: 'absolute', left: w - 122, top: 22, width: 110, fontSize: 9.5, color: '#111'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 7}}>
				<div style={{width: 26, height: 26, borderRadius: 13, background: 'linear-gradient(135deg,#FF8A4C,#E8336F)'}} />
				<div style={{lineHeight: 1.25}}>
					<div style={{fontWeight: 650}}>jamesc</div>
					<div style={{color: '#737373'}}>James C.</div>
				</div>
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', margin: '16px 0 10px', color: '#737373', fontWeight: 600}}>
				<span>Suggested for you</span>
				<span style={{color: '#111'}}>See all</span>
			</div>
			{SUGGEST.map(([n, sub, c]) => (
				<div key={n} style={{display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10}}>
					<div style={{width: 22, height: 22, borderRadius: 11, background: c}} />
					<div style={{lineHeight: 1.25, flex: 1, overflow: 'hidden'}}>
						<div style={{fontWeight: 650}}>{n}</div>
						<div style={{color: '#737373', fontSize: 8.5, whiteSpace: 'nowrap'}}>{sub}</div>
					</div>
					<div style={{color: '#0095F6', fontWeight: 650, fontSize: 9}}>Follow</div>
				</div>
			))}
		</div>
	</div>
);

// ================================================================== Figma (UI3, light), drawn from scratch
export const FIG = {tabs: 38, left: 168, right: 182, tool: 48};
const FigTabIcon: React.FC = () => (
	<svg width={12} height={18} viewBox="0 0 38 57">
		<path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
		<path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
		<path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
		<path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
		<path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
	</svg>
);

export const FigmaTabs: React.FC<{w: number; file: string; front?: boolean}> = ({w, file, front = true}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: w, height: FIG.tabs, background: '#2C2C2C', display: 'flex', alignItems: 'center', padding: '0 12px', boxSizing: 'border-box', fontFamily: SYS, zIndex: 10}}>
		<Traffic dim={!front} />
		<div style={{marginLeft: 18, width: 30, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<svg width={14} height={14} viewBox="0 0 14 14">
				<path d="M2 6.5 7 2l5 4.5V12H8.5V8.8h-3V12H2z" fill="none" stroke="#B3B3B3" strokeWidth={1.3} strokeLinejoin="round" />
			</svg>
		</div>
		<div style={{marginLeft: 6, height: 28, padding: '0 12px', borderRadius: 7, background: '#3D3D3D', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#fff', fontWeight: 500}}>
			<FigTabIcon />
			{file}
			<span style={{color: '#9A9A9A', marginLeft: 6, fontSize: 13}}>×</span>
		</div>
		<div style={{marginLeft: 10, color: '#9A9A9A', fontSize: 16}}>+</div>
	</div>
);

const LayerIcon: React.FC<{kind: string; on?: boolean}> = ({kind, on}) => {
	const c = on ? '#0D99FF' : '#8C8C8C';
	if (kind === 'frame')
		return (
			<svg width={12} height={12} viewBox="0 0 12 12">
				<path d="M3.5 1v10M8.5 1v10M1 3.5h10M1 8.5h10" stroke={c} strokeWidth={1.1} />
			</svg>
		);
	if (kind === 'text')
		return (
			<svg width={12} height={12} viewBox="0 0 12 12">
				<path d="M2 2.5h8M6 2.5v8" stroke={c} strokeWidth={1.3} strokeLinecap="round" />
			</svg>
		);
	if (kind === 'image')
		return (
			<svg width={12} height={12} viewBox="0 0 12 12">
				<rect x={1} y={1.5} width={10} height={9} rx={1.5} stroke={c} strokeWidth={1.1} fill="none" />
				<path d="M1.5 9 4.5 6l2.2 2.2L8.3 6.6 10.6 9" stroke={c} strokeWidth={1.1} fill="none" strokeLinejoin="round" />
			</svg>
		);
	if (kind === 'group')
		return (
			<svg width={12} height={12} viewBox="0 0 12 12">
				<rect x={1.2} y={1.2} width={9.6} height={9.6} rx={1} stroke={c} strokeWidth={1.1} fill="none" strokeDasharray="2 1.6" />
			</svg>
		);
	return (
		<svg width={12} height={12} viewBox="0 0 12 12">
			<rect x={1.5} y={1.5} width={9} height={9} rx={1.2} stroke={c} strokeWidth={1.1} fill="none" />
		</svg>
	);
};

export type FigLayer = {name: string; kind: 'frame' | 'text' | 'image' | 'rect' | 'group'; depth: number; show: number};

export const FigmaLeft: React.FC<{h: number; file: string; layers: FigLayer[]; selected?: number; hover?: number}> = ({h, file, layers, selected = -1}) => (
	<div style={{position: 'absolute', left: 0, top: FIG.tabs, width: FIG.left, height: h - FIG.tabs, background: '#fff', borderRight: '1px solid #E6E6E6', fontFamily: SYS, fontSize: 11.5, color: '#1E1E1E', zIndex: 5}}>
		<div style={{height: 48, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, borderBottom: '1px solid #EFEFEF'}}>
			<div style={{width: 22, height: 22, borderRadius: 6, background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<FigTabIcon />
			</div>
			<div style={{lineHeight: 1.25}}>
				<div style={{fontWeight: 600, fontSize: 12}}>{file}</div>
				<div style={{color: '#8C8C8C', fontSize: 11}}>Drafts</div>
			</div>
		</div>
		<div style={{display: 'flex', gap: 14, padding: '10px 12px 8px', fontWeight: 600}}>
			<span>File</span>
			<span style={{color: '#8C8C8C'}}>Assets</span>
		</div>
		<div style={{padding: '4px 12px 6px', color: '#8C8C8C', fontWeight: 600, fontSize: 11}}>Pages</div>
		<div style={{margin: '0 6px', height: 26, borderRadius: 5, background: '#F5F5F5', display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 500}}>Q4 social</div>
		<div style={{padding: '14px 12px 6px', color: '#8C8C8C', fontWeight: 600, fontSize: 11, borderTop: '1px solid #EFEFEF', marginTop: 10}}>Layers</div>
		<div>
			{layers.map((l, i) =>
				l.show <= 0 ? null : (
					<div
						key={i}
						style={{
							height: 28 * Math.min(1, l.show * 1.4),
							overflow: 'hidden',
							margin: '0 6px',
							borderRadius: 5,
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							paddingLeft: 8 + l.depth * 16,
							background: i === selected ? '#E5F4FF' : 'transparent',
							color: i === selected ? '#0A6FC2' : '#1E1E1E',
							fontWeight: l.kind === 'frame' ? 600 : 450,
							opacity: Math.min(1, l.show * 1.2),
							transform: `translateX(${(1 - Math.min(1, l.show)) * -8}px)`,
							whiteSpace: 'nowrap',
						}}
					>
						{l.depth === 0 ? <span style={{color: '#8C8C8C', fontSize: 9, width: 6}}>▾</span> : null}
						<LayerIcon kind={l.kind} on={i === selected} />
						{l.name}
					</div>
				),
			)}
		</div>
	</div>
);

export type FigPanel =
	| {kind: 'frame'; w: number; h: number; fill: string}
	| {kind: 'text'; font: string; style: string; size: number; fill: string}
	| {kind: 'image'; w: number; h: number; rot?: number}
	| {kind: 'none'};

const Row: React.FC<{children: React.ReactNode; title?: string}> = ({children, title}) => (
	<div style={{borderBottom: '1px solid #EFEFEF', padding: '10px 12px 12px'}}>
		{title ? <div style={{fontWeight: 600, fontSize: 11.5, marginBottom: 9}}>{title}</div> : null}
		{children}
	</div>
);
const Field: React.FC<{label?: string; value: React.ReactNode; w?: number | string; hi?: number}> = ({label, value, w = '100%', hi = 0}) => (
	<div style={{width: w, height: 26, borderRadius: 5, background: hi > 0 ? `rgba(13,153,255,${0.12 * hi})` : '#F5F5F5', boxShadow: hi > 0 ? `inset 0 0 0 1px rgba(13,153,255,${hi})` : 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', boxSizing: 'border-box', fontSize: 11.5}}>
		{label ? <span style={{color: '#8C8C8C'}}>{label}</span> : null}
		<span style={{color: '#1E1E1E', whiteSpace: 'nowrap', overflow: 'hidden', flex: 1, display: 'flex', alignItems: 'center'}}>{value}</span>
	</div>
);

const FillValue: React.FC<{fill: string; text?: string; sel?: number; caret?: boolean}> = ({fill, text, sel = 0, caret}) => (
	<span style={{display: 'flex', alignItems: 'center', gap: 8, width: '100%'}}>
		<span style={{width: 14, height: 14, borderRadius: 3, background: fill, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)', flexShrink: 0}} />
		<span style={{position: 'relative'}}>
			{sel > 0 ? <span style={{position: 'absolute', inset: '-2px -2px', background: `rgba(13,153,255,${0.28 * sel})`, borderRadius: 2}} /> : null}
			<span style={{position: 'relative'}}>{text ?? fill.replace('#', '').toUpperCase()}</span>
			{caret ? <span style={{position: 'absolute', right: -3, top: 0, width: 1.2, height: 14, background: '#1E1E1E'}} /> : null}
		</span>
		<span style={{marginLeft: 'auto', color: '#8C8C8C'}}>100%</span>
	</span>
);

export const FigmaRight: React.FC<{x: number; h: number; panel: FigPanel; zoom: number; hiFill?: number; hiFont?: number; hiSize?: number; fillText?: string; fillSel?: number; fillCaret?: boolean}> = ({
	x,
	h,
	panel,
	zoom,
	hiFill = 0,
	hiFont = 0,
	fillText,
	fillSel = 0,
	fillCaret,
}) => (
	<div style={{position: 'absolute', left: x, top: FIG.tabs, width: FIG.right, height: h - FIG.tabs, background: '#fff', borderLeft: '1px solid #E6E6E6', fontFamily: SYS, fontSize: 11.5, color: '#1E1E1E', zIndex: 5}}>
		<div style={{height: 48, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8, borderBottom: '1px solid #EFEFEF'}}>
			<div style={{width: 26, height: 26, borderRadius: 13, background: 'linear-gradient(135deg,#FF8A4C,#E8336F)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>JC</div>
			<div style={{marginLeft: 'auto', height: 28, padding: '0 12px', borderRadius: 6, background: '#0D99FF', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center'}}>Share</div>
		</div>
		<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderBottom: '1px solid #EFEFEF', fontWeight: 600}}>
			<span>Design</span>
			<span style={{color: '#8C8C8C'}}>Prototype</span>
			<span style={{marginLeft: 'auto', color: '#8C8C8C', fontWeight: 500}}>{Math.round(zoom * 100)}%</span>
		</div>
		{panel.kind === 'none' ? (
			<Row title="Page">
				<Field label="" value={<span style={{display: 'flex', alignItems: 'center', gap: 8}}><span style={{width: 14, height: 14, borderRadius: 3, background: '#F5F5F5', boxShadow: 'inset 0 0 0 1px #DDD'}} />F5F5F5</span>} />
			</Row>
		) : panel.kind === 'text' ? (
			<>
				<Row title="Typography">
					<Field value={panel.font} hi={hiFont} />
					<div style={{display: 'flex', gap: 8, marginTop: 8}}>
						<Field value={panel.style} w="60%" />
						<Field value={panel.size} w="40%" />
					</div>
					<div style={{display: 'flex', gap: 8, marginTop: 8}}>
						<Field label="A" value="84%" w="50%" />
						<Field label="|A|" value="-1.5%" w="50%" />
					</div>
				</Row>
				<Row title="Fill">
					<Field value={<span style={{display: 'flex', alignItems: 'center', gap: 8}}><span style={{width: 14, height: 14, borderRadius: 3, background: panel.fill}} />{panel.fill.replace('#', '').toUpperCase()}<span style={{marginLeft: 'auto', color: '#8C8C8C'}}>100%</span></span>} hi={hiFill} />
				</Row>
			</>
		) : panel.kind === 'frame' ? (
			<>
				<Row title="Frame">
					<div style={{display: 'flex', gap: 8}}>
						<Field label="W" value={panel.w} w="50%" />
						<Field label="H" value={panel.h} w="50%" />
					</div>
				</Row>
				<Row title="Auto layout">
					<div style={{display: 'flex', gap: 8}}>
						<Field label="↕" value="Hug" w="50%" />
						<Field label="⇥" value="64" w="50%" />
					</div>
				</Row>
				<Row title="Fill">
					<Field value={<FillValue fill={panel.fill} text={fillText} sel={fillSel} caret={fillCaret} />} hi={hiFill} />
				</Row>
			</>
		) : (
			<>
				<Row title="Layer">
					<div style={{display: 'flex', gap: 8}}>
						<Field label="W" value={panel.w} w="50%" />
						<Field label="H" value={panel.h} w="50%" />
					</div>
					<div style={{display: 'flex', gap: 8, marginTop: 8}}>
						<Field label="⟳" value={`${Math.round(panel.rot ?? 0)}°`} w="50%" hi={panel.rot ? Math.min(1, Math.abs(panel.rot) / 4) : 0} />
						<Field label="◜" value="0" w="50%" />
					</div>
				</Row>
				<Row title="Fill">
					<Field value={<span style={{display: 'flex', alignItems: 'center', gap: 8}}><span style={{width: 14, height: 14, borderRadius: 3, background: 'linear-gradient(135deg,#2340FF,#9AA8FF)'}} />Image<span style={{marginLeft: 'auto', color: '#8C8C8C'}}>100%</span></span>} />
				</Row>
			</>
		)}
		<Row title="Export">
			<div style={{color: '#8C8C8C'}}>PNG · SVG · PDF</div>
		</Row>
	</div>
);

export const FigmaToolbar: React.FC<{cx: number; bottom: number; tool?: number}> = ({cx, bottom, tool = 0}) => (
	<div
		style={{
			position: 'absolute',
			left: cx - 118,
			bottom,
			width: 236,
			height: 40,
			borderRadius: 12,
			background: '#fff',
			boxShadow: '0 2px 10px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.12)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-around',
			padding: '0 6px',
			zIndex: 6,
		}}
	>
		{[0, 1, 2, 3, 4, 5].map((i) => (
			<div key={i} style={{width: 30, height: 30, borderRadius: 7, background: i === tool ? '#0D99FF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<svg width={16} height={16} viewBox="0 0 16 16">
					{i === 0 ? <path d="M4 2.5v10.8l3-2.9 2 4.3 2-0.9-2-4.2h4.2z" fill={i === tool ? '#fff' : '#1E1E1E'} /> : null}
					{i === 1 ? <path d="M5 1.5v13M11 1.5v13M1.5 5h13M1.5 11h13" stroke="#1E1E1E" strokeWidth={1.3} /> : null}
					{i === 2 ? <rect x={2.5} y={2.5} width={11} height={11} rx={1.5} stroke="#1E1E1E" strokeWidth={1.3} fill="none" /> : null}
					{i === 3 ? <path d="M3 13 8 2.5 13 13M5.2 9h5.6" stroke="#1E1E1E" strokeWidth={1.3} fill="none" strokeLinejoin="round" /> : null}
					{i === 4 ? <path d="M3 3h10M8 3v10.5" stroke="#1E1E1E" strokeWidth={1.4} strokeLinecap="round" /> : null}
					{i === 5 ? <path d="M13.5 7.5a5.5 5.5 0 0 1-8.2 4.8L2.5 13.5l1-2.7A5.5 5.5 0 1 1 13.5 7.5z" stroke="#1E1E1E" strokeWidth={1.3} fill="none" strokeLinejoin="round" /> : null}
				</svg>
			</div>
		))}
	</div>
);

/** Figma's selection: 1 px blue outline, white handles, the size tag under it; `rot` rotates it about its centre */
export const FigSelect: React.FC<{x: number; y: number; w: number; h: number; tag?: string; show?: number; handles?: boolean; hover?: boolean; rot?: number}> = ({x, y, w, h, tag, show = 1, handles = true, hover, rot = 0}) => {
	if (show <= 0) return null;
	return (
		<>
			<div style={{position: 'absolute', left: x, top: y, width: w, height: h, boxShadow: `0 0 0 ${hover ? 1.5 : 1}px #0D99FF`, opacity: show, pointerEvents: 'none', zIndex: 20, transform: rot ? `rotate(${rot}deg)` : undefined}}>
				{handles
					? [
							[0, 0],
							[1, 0],
							[0, 1],
							[1, 1],
						].map(([u, v], i) => <div key={i} style={{position: 'absolute', left: u * w - 3.5, top: v * h - 3.5, width: 7, height: 7, background: '#fff', boxShadow: '0 0 0 1px #0D99FF'}} />)
					: null}
			</div>
			{tag ? (
				<div style={{position: 'absolute', left: x + w / 2, top: y + h / 2 + (rot ? Math.abs(Math.sin((rot * Math.PI) / 180)) * w * 0.5 + Math.cos((rot * Math.PI) / 180) * h * 0.5 : h / 2) + 8, transform: 'translateX(-50%)', height: 18, padding: '0 6px', borderRadius: 4, background: '#0D99FF', color: '#fff', fontFamily: SYS, fontSize: 10.5, fontWeight: 500, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', opacity: show, zIndex: 21}}>{tag}</div>
			) : null}
		</>
	);
};
