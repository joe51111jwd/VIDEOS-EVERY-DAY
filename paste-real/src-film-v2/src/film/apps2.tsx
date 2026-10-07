import React from 'react';
import {clamp01, SYS} from '../lib/tokens';
import {Traffic} from '../mac/mac';
import {SAFARI_BAR} from './apps';

// Scene 2 apps: a conference site playing a recorded talk (the chart is in the video), and Keynote.

const TIGHT = 'Inter Tight';

// ================================================================== the chart (the same object in the video and in Keynote)
export const CHART = {
	w: 1000,
	h: 640,
	years: ['2021', '2022', '2023', '2024', '2025', '2026'],
	values: [18, 24, 31, 38, 47, 52],
	max: 80,
	barW: 112,
	gap: 64,
	base: 560, // baseline y inside the box
	top: 80, // value 80 reaches this y
};
/** bar i's rect inside the chart box (chart px) */
export const barRect = (i: number, v: number) => {
	const hpx = ((CHART.base - CHART.top) * v) / CHART.max;
	const x = (CHART.w - (6 * CHART.barW + 5 * CHART.gap)) / 2 + i * (CHART.barW + CHART.gap);
	return {x, y: CHART.base - hpx, w: CHART.barW, h: hpx};
};

/** the bar chart, drawn in a CHART.w x CHART.h box; `values` can animate */
export const BarChart: React.FC<{values?: number[]; labels?: string[]; hi?: number; font?: string; dim?: number}> = ({values = CHART.values, labels, hi = 5, font = TIGHT, dim = 0}) => (
	<div style={{position: 'relative', width: CHART.w, height: CHART.h, fontFamily: font}}>
		{/* gridlines */}
		{[0, 20, 40, 60, 80].map((v) => {
			const y = CHART.base - ((CHART.base - CHART.top) * v) / CHART.max;
			return <div key={v} style={{position: 'absolute', left: 0, right: 0, top: y, height: v === 0 ? 3 : 1.5, background: v === 0 ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.09)'}} />;
		})}
		{values.map((v, i) => {
			const r = barRect(i, v);
			const isHi = i === hi;
			return (
				<React.Fragment key={i}>
					<div
						style={{
							position: 'absolute',
							left: r.x,
							top: r.y,
							width: r.w,
							height: r.h,
							borderRadius: '10px 10px 0 0',
							background: isHi ? 'linear-gradient(180deg, #A9BEFF 0%, #7B98FF 100%)' : 'linear-gradient(180deg, #4F6DFF 0%, #3248D6 100%)',
							boxShadow: isHi ? '0 0 60px rgba(123,152,255,0.35)' : undefined,
							opacity: 1 - dim * (isHi ? 0 : 0.5),
						}}
					/>
					<div style={{position: 'absolute', left: r.x - 30, width: r.w + 60, top: r.y - 58, textAlign: 'center', fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', color: isHi ? '#C9D5FF' : '#fff', fontVariantNumeric: 'tabular-nums'}}>
						{labels ? labels[i] : `${Math.round(v)}%`}
					</div>
					<div style={{position: 'absolute', left: r.x - 20, width: r.w + 40, top: CHART.base + 22, textAlign: 'center', fontSize: 30, fontWeight: 500, color: '#8A90A6'}}>{CHART.years[i]}</div>
				</React.Fragment>
			);
		})}
	</div>
);

/** where the chart sits on the talk slide (1920 x 1080) */
export const TALK_CHART = {x: 96, y: 300};

/** the talk's slide, as recorded (1920 x 1080) */
export const TalkSlide: React.FC = () => (
	<div style={{position: 'relative', width: 1920, height: 1080, background: 'radial-gradient(120% 90% at 20% 0%, #161B33 0%, #0B0E1A 60%)', overflow: 'hidden', fontFamily: TIGHT, color: '#fff'}}>
		<div style={{position: 'absolute', left: 96, top: 72, fontSize: 24, fontWeight: 600, letterSpacing: '0.18em', color: '#7F87A3'}}>SIGNAL SUMMIT 2026</div>
		<div style={{position: 'absolute', left: 96, top: 136, fontSize: 70, fontWeight: 600, letterSpacing: '-0.03em'}}>Design teams that ship every week</div>
		<div style={{position: 'absolute', left: 98, top: 232, fontSize: 30, fontWeight: 450, color: '#9AA3BA'}}>Share of teams surveyed, 2021–2026</div>
		<div style={{position: 'absolute', left: TALK_CHART.x, top: TALK_CHART.y}}>
			<BarChart />
		</div>
		{/* the callout */}
		<div style={{position: 'absolute', left: 1240, top: 380, width: 560}}>
			<div style={{fontSize: 230, fontWeight: 600, letterSpacing: '-0.05em', lineHeight: 0.9, background: 'linear-gradient(180deg,#C9D5FF,#7B98FF)', WebkitBackgroundClip: 'text', color: 'transparent'}}>52%</div>
			<div style={{fontSize: 40, fontWeight: 500, marginTop: 28, letterSpacing: '-0.015em', lineHeight: 1.25}}>
				of design teams now
				<br />
				ship every week
			</div>
			<div style={{fontSize: 28, color: '#8A90A6', marginTop: 26}}>Up from 18% in 2021</div>
		</div>
		<div style={{position: 'absolute', right: 96, bottom: 64, fontSize: 24, color: '#5F6680'}}>14 / 31</div>
	</div>
);

// ================================================================== the conference site (dark), playing the recorded talk
export const VP = {head: 36, padX: 16};
export const playerRect = (w: number) => ({x: VP.padX, y: SAFARI_BAR + VP.head, w: w - VP.padX * 2, h: ((w - VP.padX * 2) * 9) / 16});

const Ico: React.FC<{d: string; w?: number; fill?: boolean}> = ({d, w = 13, fill}) => (
	<svg width={w} height={w} viewBox="0 0 24 24">
		<path d={d} fill={fill ? '#fff' : 'none'} stroke={fill ? 'none' : '#fff'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

/** paused player controls over the video */
const PlayerControls: React.FC<{w: number; h: number; progress: number; show: number}> = ({w, h, progress, show}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, opacity: show, pointerEvents: 'none'}}>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.62))'}} />
		{/* scrubber */}
		<div style={{position: 'absolute', left: 12, right: 12, bottom: 34, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.25)'}}>
			<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress * 100 + 12}%`, background: 'rgba(255,255,255,0.35)', borderRadius: 2}} />
			<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, background: '#5B78FF', borderRadius: 2}} />
			<div style={{position: 'absolute', left: `${progress * 100}%`, top: -4, width: 11, height: 11, marginLeft: -5.5, borderRadius: 6, background: '#5B78FF', boxShadow: '0 0 0 2px rgba(255,255,255,0.0)'}} />
		</div>
		<div style={{position: 'absolute', left: 14, right: 14, bottom: 8, height: 20, display: 'flex', alignItems: 'center', gap: 14, fontFamily: SYS, fontSize: 10.5, color: '#fff', fontWeight: 500}}>
			<Ico d="M7 4.5v15l12.5-7.5z" fill />
			<Ico d="M5 5v14l10-7zM18 5v14" />
			<Ico d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
			<span style={{fontVariantNumeric: 'tabular-nums', letterSpacing: '0.01em'}}>14:08 / 38:21</span>
			<span style={{marginLeft: 'auto', border: '1.4px solid #fff', borderRadius: 3, fontSize: 8, fontWeight: 700, padding: '0 3px', lineHeight: '11px'}}>CC</span>
			<Ico d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM19.4 13.5l1.6 1.2-1.8 3.1-1.9-.6a7.6 7.6 0 0 1-2 1.2l-.4 2h-3.6l-.4-2a7.6 7.6 0 0 1-2-1.2l-1.9.6L5.2 14.7l1.6-1.2a7.4 7.4 0 0 1 0-2.4L5.2 9.9 7 6.8l1.9.6a7.6 7.6 0 0 1 2-1.2l.4-2h3.6l.4 2a7.6 7.6 0 0 1 2 1.2l1.9-.6 1.8 3.1-1.6 1.2a7.4 7.4 0 0 1 0 2.4z" />
			<Ico d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
		</div>
	</div>
);

export const VideoPage: React.FC<{w: number; h: number; frame: React.ReactNode; progress?: number; controls?: number}> = ({w, h, frame, progress = 0.37, controls = 1}) => {
	const p = playerRect(w);
	return (
		<div style={{position: 'absolute', left: 0, top: SAFARI_BAR, width: w, height: h - SAFARI_BAR, background: '#0C0C0F', overflow: 'hidden', fontFamily: SYS, color: '#fff'}}>
			{/* site header */}
			<div style={{height: VP.head, display: 'flex', alignItems: 'center', padding: `0 ${VP.padX + 2}px`, gap: 18, fontSize: 11.5}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 7, fontFamily: TIGHT, fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em'}}>
					<svg width={15} height={15} viewBox="0 0 20 20">
						<circle cx={10} cy={10} r={8.5} fill="none" stroke="#5B78FF" strokeWidth={2.4} />
						<circle cx={10} cy={10} r={3.2} fill="#5B78FF" />
					</svg>
					Signal Summit
				</div>
				<span style={{color: '#fff', fontWeight: 500}}>Talks</span>
				<span style={{color: '#8E8E96'}}>Speakers</span>
				<span style={{color: '#8E8E96'}}>Workshops</span>
				<div style={{marginLeft: 'auto', height: 22, padding: '0 11px', borderRadius: 11, background: '#fff', color: '#0C0C0F', fontWeight: 600, fontSize: 10.5, display: 'flex', alignItems: 'center'}}>2027 tickets</div>
			</div>
			{/* player */}
			<div style={{position: 'absolute', left: p.x, top: VP.head, width: p.w, height: p.h, borderRadius: 10, overflow: 'hidden', background: '#000'}}>
				<div style={{position: 'absolute', inset: 0, filter: 'blur(0.35px) saturate(0.94) contrast(0.97)'}}>{frame}</div>
				<PlayerControls w={p.w} h={p.h} progress={progress} show={controls} />
			</div>
			{/* title */}
			<div style={{position: 'absolute', left: p.x + 2, top: VP.head + p.h + 12, right: VP.padX}}>
				<div style={{fontSize: 15, fontWeight: 650, letterSpacing: '-0.01em'}}>The state of design teams</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 7, fontSize: 11, color: '#9A9AA2'}}>
					<div style={{width: 18, height: 18, borderRadius: 9, background: 'linear-gradient(135deg,#C9A27E,#7D5A50)'}} />
					<span style={{color: '#E6E6EA', fontWeight: 550}}>Ana Ruiz</span>
					<span>Head of Design, Northwind · Keynote · 212K views</span>
				</div>
			</div>
		</div>
	);
};

// ================================================================== Keynote (light), drawn from scratch
export const KN = {title: 24, bar: 50, nav: 84, insp: 196};
export const KN_CHROME = KN.title + KN.bar;

const KIco: React.FC<{i: string}> = ({i}) => {
	const st = {fill: 'none', stroke: '#5E5E63', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	return (
		<svg width={18} height={16} viewBox="0 0 24 20">
			{i === 'view' ? (
				<>
					<rect x={2} y={2} width={20} height={16} rx={3} {...st} />
					<path d="M8 2.5v15" {...st} />
				</>
			) : null}
			{i === 'add' ? (
				<>
					<rect x={3} y={3} width={18} height={14} rx={2.5} {...st} />
					<path d="M12 6.5v7M8.5 10h7" {...st} />
				</>
			) : null}
			{i === 'play' ? <path d="M8 3.5v13l11-6.5z" fill="#5E5E63" /> : null}
			{i === 'table' ? (
				<>
					<rect x={2.5} y={2.5} width={19} height={15} rx={2} {...st} />
					<path d="M2.5 7.5h19M2.5 12.5h19M9 2.5v15M15 2.5v15" {...st} />
				</>
			) : null}
			{i === 'chart' ? <path d="M4 17V10M10 17V5M16 17v-9M21 17H2.5" {...st} strokeWidth={2.2} /> : null}
			{i === 'text' ? (
				<>
					<rect x={3} y={3} width={18} height={14} rx={2} {...st} />
					<path d="M8 7h8M12 7v7" {...st} />
				</>
			) : null}
			{i === 'shape' ? (
				<>
					<rect x={3} y={8} width={10} height={10} rx={1.5} {...st} />
					<circle cx={15.5} cy={7} r={5} {...st} />
				</>
			) : null}
			{i === 'media' ? (
				<>
					<rect x={2.5} y={3} width={19} height={14} rx={2} {...st} />
					<path d="M3 15l5.5-5 4 3.5 3-2.5L21 15" {...st} />
				</>
			) : null}
			{i === 'format' ? <path d="M5 15l9.5-9.5 3 3L8 18H5zM12.5 7.5l3 3" {...st} /> : null}
			{i === 'animate' ? (
				<>
					<path d="M3 10h4M5 6h6M5 14h6" {...st} />
					<path d="M13 4l7 6-7 6z" {...st} />
				</>
			) : null}
			{i === 'doc' ? (
				<>
					<path d="M6 2.5h8l4.5 4.5V17.5H6z" {...st} />
					<path d="M13.5 2.5V7.5h5" {...st} />
				</>
			) : null}
		</svg>
	);
};

export const KeynoteChrome: React.FC<{w: number; title: string; front?: boolean; sel?: 'format' | 'none'}> = ({w, title, front = true}) => {
	const items: [string, string][] = [
		['view', 'View'],
		['zoom', 'Zoom'],
		['add', 'Add Slide'],
		['play', 'Play'],
		['table', 'Table'],
		['chart', 'Chart'],
		['text', 'Text'],
		['shape', 'Shape'],
		['media', 'Media'],
		['format', 'Format'],
		['animate', 'Animate'],
		['doc', 'Document'],
	];
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: w, height: KN_CHROME, background: front ? 'linear-gradient(180deg,#EDECEF,#E4E3E7)' : '#EFEFF1', borderBottom: '0.5px solid rgba(0,0,0,0.16)', fontFamily: SYS, zIndex: 10}}>
			<div style={{position: 'absolute', left: 12, top: 7}}>
				<Traffic dim={!front} />
			</div>
			<div style={{height: KN.title, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 600, color: front ? '#2B2B2E' : '#9A9AA0'}}>
				{title}
				<span style={{fontWeight: 400, color: '#8E8E93', marginLeft: 4}}>— Edited</span>
			</div>
			<div style={{height: KN.bar, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 0}}>
				{items.map(([i, label], k) => (
					<div key={i} style={{width: i === 'zoom' ? 50 : 51, marginLeft: k === 3 || k === 4 || k === 9 ? 10 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: front ? 1 : 0.55}}>
						{i === 'zoom' ? (
							<div style={{height: 18, padding: '0 6px', borderRadius: 4, background: '#fff', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.18), 0 0.5px 1px rgba(0,0,0,0.1)', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3, color: '#2B2B2E'}}>
								Fit<span style={{fontSize: 7, color: '#8E8E93'}}>▼</span>
							</div>
						) : (
							<div style={{height: 18, width: 30, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 'format' ? 'rgba(0,0,0,0.09)' : 'transparent'}}>
								<KIco i={i} />
							</div>
						)}
						<div style={{fontSize: 9, color: '#56565B', whiteSpace: 'nowrap'}}>{label}</div>
					</div>
				))}
			</div>
		</div>
	);
};

/** the slide navigator; `thumbs` are rendered at 1920 x 1080 and scaled down */
export const KeynoteNav: React.FC<{h: number; thumbs: React.ReactNode[]; current: number}> = ({h, thumbs, current}) => {
	const tw = 64,
		th = 36;
	return (
		<div style={{position: 'absolute', left: 0, top: KN_CHROME, width: KN.nav, height: h - KN_CHROME, background: '#F3F3F5', borderRight: '0.5px solid rgba(0,0,0,0.12)', fontFamily: SYS, zIndex: 5}}>
			{thumbs.map((node, i) => (
				<div key={i} style={{position: 'absolute', left: 0, top: 12 + i * 50, width: KN.nav, height: 44, display: 'flex', alignItems: 'center'}}>
					<div style={{width: 14, textAlign: 'right', fontSize: 9, color: '#77777C', marginRight: 4}}>{i + 1}</div>
					<div style={{position: 'relative', width: tw, height: th, borderRadius: 2, boxShadow: i === current ? '0 0 0 2.5px #F6C443' : '0 0 0 0.5px rgba(0,0,0,0.2)', overflow: 'hidden', background: '#111'}}>
						<div style={{transform: `scale(${tw / 1920})`, transformOrigin: '0 0'}}>{node}</div>
					</div>
				</div>
			))}
		</div>
	);
};

const Sec: React.FC<{title?: string; children: React.ReactNode}> = ({title, children}) => (
	<div style={{padding: '9px 12px 11px', borderBottom: '0.5px solid rgba(0,0,0,0.1)'}}>
		{title ? <div style={{fontSize: 10.5, fontWeight: 650, color: '#2B2B2E', marginBottom: 7}}>{title}</div> : null}
		{children}
	</div>
);
const Pop: React.FC<{v: string; w?: string | number}> = ({v, w = '100%'}) => (
	<div style={{width: w, height: 19, borderRadius: 4, background: '#fff', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.16), 0 0.5px 1px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', padding: '0 7px', boxSizing: 'border-box', fontSize: 10, color: '#2B2B2E', justifyContent: 'space-between'}}>
		<span>{v}</span>
		<span style={{fontSize: 7, color: '#8E8E93'}}>▼</span>
	</div>
);
const Check: React.FC<{on?: boolean; label: string}> = ({on, label}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#2B2B2E', height: 18}}>
		<div style={{width: 11, height: 11, borderRadius: 3, background: on ? '#0A84FF' : '#fff', boxShadow: on ? 'none' : '0 0 0 0.5px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			{on ? (
				<svg width={8} height={8} viewBox="0 0 10 10">
					<path d="M2 5.2 4.2 7.4 8.2 2.8" stroke="#fff" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			) : null}
		</div>
		{label}
	</div>
);

export const KeynoteInspector: React.FC<{x: number; h: number; mode: 'slide' | 'chart'; hiStyle?: number}> = ({x, h, mode}) => (
	<div style={{position: 'absolute', left: x, top: KN_CHROME, width: KN.insp, height: h - KN_CHROME, background: '#F6F6F8', borderLeft: '0.5px solid rgba(0,0,0,0.12)', fontFamily: SYS, zIndex: 5}}>
		<div style={{display: 'flex', margin: '9px 10px 4px', height: 21, borderRadius: 6, background: 'rgba(0,0,0,0.06)', padding: 2, boxSizing: 'border-box'}}>
			{(mode === 'chart' ? ['Chart', 'Axis', 'Series', 'Arrange'] : ['Slide Layout']).map((tab, i) => (
				<div key={tab} style={{flex: 1, borderRadius: 4.5, background: i === 0 ? '#fff' : 'transparent', boxShadow: i === 0 ? '0 0.5px 1.5px rgba(0,0,0,0.18)' : 'none', fontSize: 10, fontWeight: i === 0 ? 600 : 450, color: '#2B2B2E', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					{tab}
				</div>
			))}
		</div>
		{mode === 'chart' ? (
			<>
				<Sec title="Chart Styles">
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6}}>
						{[
							['#3248D6', '#7B98FF'],
							['#1F1F23', '#8A8A90'],
							['#D9472B', '#F5A15C'],
							['#138A5A', '#6ED3A0'],
							['#6B3FD6', '#B79BFF'],
							['#2A7FD4', '#9CCBF7'],
						].map(([a, b], i) => (
							<div key={i} style={{height: 34, borderRadius: 4, background: '#fff', boxShadow: i === 0 ? '0 0 0 2px #0A84FF' : '0 0 0 0.5px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, paddingBottom: 6, boxSizing: 'border-box'}}>
								{[10, 16, 22].map((hh, k) => (
									<div key={k} style={{width: 6, height: hh, borderRadius: 1, background: k === 2 ? b : a}} />
								))}
							</div>
						))}
					</div>
				</Sec>
				<Sec title="Chart Options">
					<Check label="Title" />
					<Check label="Legend" />
					<Check on label="Value Labels" />
					<Check label="Border" />
				</Sec>
				<Sec title="Chart Font">
					<Pop v="Inter Tight" />
					<div style={{display: 'flex', gap: 6, marginTop: 6}}>
						<Pop v="Semibold" w="62%" />
						<Pop v="100%" w="38%" />
					</div>
				</Sec>
				<Sec title="Chart Type">
					<Pop v="2D Column" />
				</Sec>
			</>
		) : (
			<>
				<Sec title="Slide Layout">
					<Pop v="Title & Bullets" />
				</Sec>
				<Sec title="Appearance">
					<Check on label="Title" />
					<Check on label="Body" />
					<Check label="Slide Number" />
				</Sec>
				<Sec title="Background">
					<Pop v="Gradient Fill" />
				</Sec>
			</>
		)}
	</div>
);

/** Keynote's selection handles (8 small squares) */
export const KHandles: React.FC<{x: number; y: number; w: number; h: number; show?: number}> = ({x, y, w, h, show = 1}) =>
	show <= 0 ? null : (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: show, pointerEvents: 'none', zIndex: 20}}>
			<div style={{position: 'absolute', inset: 0, boxShadow: '0 0 0 0.6px rgba(120,120,128,0.9)'}} />
			{[
				[0, 0],
				[0.5, 0],
				[1, 0],
				[0, 0.5],
				[1, 0.5],
				[0, 1],
				[0.5, 1],
				[1, 1],
			].map(([u, v], i) => (
				<div key={i} style={{position: 'absolute', left: u * w - 3, top: v * h - 3, width: 6, height: 6, background: '#fff', boxShadow: '0 0 0 0.75px #6E6E73, 0 1px 1.5px rgba(0,0,0,0.2)'}} />
			))}
		</div>
	);

/** the user's own deck slide that the chart is pasted into (1920 x 1080) */
export const DECK_CHART = {x: 96, y: 290, s: 1.18};
export const DeckSlide: React.FC<{children?: React.ReactNode; title?: string; bullets?: boolean}> = ({children, title = "Why we're growing the design team", bullets = true}) => (
	<div style={{position: 'relative', width: 1920, height: 1080, background: 'linear-gradient(160deg, #15161B 0%, #0D0E12 100%)', overflow: 'hidden', fontFamily: TIGHT, color: '#fff'}}>
		<div style={{position: 'absolute', left: 96, top: 92, fontSize: 76, fontWeight: 600, letterSpacing: '-0.035em'}}>{title}</div>
		<div style={{position: 'absolute', left: 98, top: 196, fontSize: 30, color: '#8D8F99'}}>Northwind · Q4 board update</div>
		{bullets ? (
			<div style={{position: 'absolute', left: 1400, top: 360, width: 440, fontSize: 38, lineHeight: 1.35, color: '#D5D7DE', letterSpacing: '-0.01em'}}>
				{['Weekly shipping is now the norm', 'We still ship monthly', 'Ask: four more designers'].map((s, i) => (
					<div key={i} style={{display: 'flex', gap: 22, marginBottom: 34}}>
						<div style={{width: 12, height: 12, borderRadius: 6, background: i === 2 ? '#F6C443' : '#5B5E6B', marginTop: 20, flexShrink: 0}} />
						<div style={{fontWeight: i === 2 ? 600 : 450, color: i === 2 ? '#fff' : undefined}}>{s}</div>
					</div>
				))}
			</div>
		) : null}
		{children}
		<div style={{position: 'absolute', right: 96, bottom: 56, fontSize: 24, color: '#5A5C66'}}>7</div>
	</div>
);

/** Keynote's chart data editor (a small floating window) */
export const DATA_WIN = {w: 262, h: 198, title: 22, tool: 24, row: 19, c0: 58, c1: 140};
export const ChartDataWin: React.FC<{values: number[]; edit?: {row: number; text: string; sel: number; caret: boolean} | null; selRow?: number; front?: boolean}> = ({values, edit, selRow = -1, front = true}) => (
	<div style={{position: 'relative', width: DATA_WIN.w, height: DATA_WIN.h, borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 18px 44px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.16), 0 0 0 0.5px rgba(0,0,0,0.25)', fontFamily: SYS}}>
		<div style={{height: DATA_WIN.title, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#F1F0F3', fontSize: 11, fontWeight: 600, color: '#2B2B2E'}}>
			<div style={{position: 'absolute', left: 9, top: 6}}>
				<Traffic size={10} dim={!front} />
			</div>
			Chart Data
		</div>
		<div style={{height: DATA_WIN.tool, display: 'flex', alignItems: 'center', gap: 8, padding: '0 9px', background: '#F1F0F3', borderBottom: '0.5px solid rgba(0,0,0,0.14)', fontSize: 9.5, color: '#56565B'}}>
			<div style={{height: 17, padding: '0 7px', borderRadius: 4, background: '#fff', boxShadow: '0 0 0 0.5px rgba(0,0,0,0.16)', display: 'flex', alignItems: 'center'}}>Plot Rows as Series</div>
			<div style={{height: 17, padding: '0 7px', borderRadius: 4, display: 'flex', alignItems: 'center'}}>Columns</div>
		</div>
		{/* grid */}
		<div style={{position: 'relative'}}>
			{['', ...CHART.years].map((yr, r) => (
				<div key={r} style={{display: 'flex', height: DATA_WIN.row, borderBottom: '0.5px solid #E3E3E6', fontSize: 10.5}}>
					<div style={{width: DATA_WIN.c0, background: r === 0 ? '#EDEDF0' : '#F6F6F8', borderRight: '0.5px solid #E0E0E4', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, color: '#56565B', fontWeight: r === selRow + 1 ? 650 : 450, boxSizing: 'border-box'}}>{yr}</div>
					<div style={{width: DATA_WIN.c1, background: r === 0 ? '#EDEDF0' : '#fff', borderRight: '0.5px solid #E0E0E4', display: 'flex', alignItems: 'center', justifyContent: r === 0 ? 'center' : 'flex-end', padding: '0 8px', boxSizing: 'border-box', color: '#1D1D1F', fontWeight: r === 0 ? 600 : 400, fontVariantNumeric: 'tabular-nums', position: 'relative'}}>
						{r === 0 ? 'Ship weekly (%)' : edit && edit.row === r - 1 ? null : values[r - 1]}
					</div>
					<div style={{flex: 1, background: r === 0 ? '#EDEDF0' : '#fff'}} />
				</div>
			))}
			{edit ? (
				<div
					style={{
						position: 'absolute',
						left: DATA_WIN.c0 - 1,
						top: (edit.row + 1) * DATA_WIN.row - 1,
						width: DATA_WIN.c1 + 2,
						height: DATA_WIN.row + 1.5,
						boxShadow: 'inset 0 0 0 2px #0A84FF',
						background: '#fff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-end',
						padding: '0 8px',
						boxSizing: 'border-box',
						fontSize: 10.5,
						color: '#1D1D1F',
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					<span style={{position: 'relative'}}>
						{edit.sel > 0 ? <span style={{position: 'absolute', inset: '-1px -2px', background: `rgba(10,132,255,${0.28 * clamp01(edit.sel)})`, borderRadius: 2}} /> : null}
						<span style={{position: 'relative'}}>{edit.text}</span>
					</span>
					{edit.caret ? <span style={{width: 1.1, height: 12, background: '#1D1D1F', marginLeft: 1}} /> : null}
				</div>
			) : null}
		</div>
	</div>
);
