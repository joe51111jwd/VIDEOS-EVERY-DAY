// 4. ANY APP: one paste per beat. Six destination apps (our own stand-in designs), then all six at once.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp01, COND, easeInOut, easeOut, lerp, MONO, SANS, SERIF, spr, step} from '../lib/tokens';
import {Traffic, Wall} from './Apps';
import {Ad} from './Ad';
import {Keys, SEL} from './ui';
import {T} from './T';

export const MW = 1032;
export const MH = 880;

const Bar: React.FC<{dark?: boolean; title: string; right?: React.ReactNode; h?: number; bg?: string}> = ({dark, title, right, h = 56, bg}) => (
	<div style={{height: h, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, background: bg ?? (dark ? '#2A2A2D' : '#F2F2F4'), borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, position: 'relative', fontFamily: SANS}}>
		<Traffic size={13} />
		<div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 600, fontSize: 17, color: dark ? 'rgba(255,255,255,0.85)' : '#3A3A3C', pointerEvents: 'none'}}>{title}</div>
		<div style={{marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center'}}>{right}</div>
	</div>
);
const Btn: React.FC<{c: string; children: React.ReactNode; fg?: string}> = ({c, children, fg = '#fff'}) => (
	<div style={{height: 34, padding: '0 14px', borderRadius: 9, background: c, color: fg, fontFamily: SANS, fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center'}}>{children}</div>
);

/** pasted content pops in: p = 0..1 (spring) */
const Pop: React.FC<{p: number; children: React.ReactNode; sel?: boolean; style?: React.CSSProperties; origin?: string}> = ({p, children, sel = true, style, origin = '50% 50%'}) => (
	<div style={{position: 'absolute', ...style, opacity: clamp01(p * 2.5), transform: `scale(${0.9 + 0.1 * p})`, transformOrigin: origin}}>
		{children}
		{sel ? <div style={{position: 'absolute', inset: -6, border: `2.5px solid ${SEL}`, borderRadius: 4, opacity: clamp01((p - 0.6) * 4)}} /> : null}
	</div>
);

// ---------------------------------------------------------------- 1. slides
export const AppSlides: React.FC<{p: number}> = ({p}) => (
	<div style={{width: MW, height: MH, background: '#E8E8EB', position: 'relative', overflow: 'hidden'}}>
		<Bar title="Café deck" right={<Btn c="#1C1C1E">Slideshow</Btn>} />
		<div style={{position: 'absolute', left: 0, top: 56, bottom: 0, width: 168, background: '#F7F7F9', borderRight: '1px solid rgba(0,0,0,0.08)', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 16}}>
			{[0, 1, 2, 3].map((i) => (
				<div key={i} style={{height: 76, borderRadius: 6, background: '#fff', boxShadow: i === 2 ? `0 0 0 3px ${SEL}` : '0 0 0 1px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative'}}>
					{i === 2 && p > 0.5 ? (
						<>
							<Img src={staticFile('img/coffee.jpg')} style={{position: 'absolute', left: 0, top: 0, width: '45%', height: '100%', objectFit: 'cover'}} />
							<div style={{position: 'absolute', left: '52%', top: 22, width: '38%', height: 6, background: '#3B2A20', borderRadius: 3}} />
						</>
					) : (
						<div style={{position: 'absolute', left: 12, top: 14, width: '60%', height: 6, background: '#D5D5DA', borderRadius: 3}} />
					)}
				</div>
			))}
		</div>
		<div style={{position: 'absolute', left: 168 + 32, top: 56 + 150, width: 800, height: 450, background: '#fff', boxShadow: '0 4px 18px rgba(0,0,0,0.14)'}}>
			<Pop p={p} style={{inset: 0}} sel={false}>
				<div style={{position: 'absolute', inset: 0, background: '#F4EDE4'}} />
				<Img src={staticFile('img/coffee.jpg')} style={{position: 'absolute', left: 0, top: 0, width: 360, height: 450, objectFit: 'cover'}} />
				<div style={{position: 'absolute', left: 400, top: 88, width: 360}}>
					<div style={{fontFamily: SANS, fontWeight: 650, fontSize: 15, letterSpacing: '0.2em', color: '#9A6B4B'}}>NEW ON THE MENU</div>
					<div style={{fontFamily: SERIF, fontWeight: 560, fontSize: 58, lineHeight: 1.0, letterSpacing: '-0.02em', color: '#2A1C14', marginTop: 14}}>Cold brew season.</div>
					<div style={{fontFamily: SANS, fontSize: 19, lineHeight: 1.45, color: '#6B5546', marginTop: 16}}>Oat milk, slow-steeped for 18 hours.</div>
					<div style={{display: 'inline-flex', marginTop: 26, height: 48, padding: '0 22px', borderRadius: 24, background: '#2A1C14', color: '#F4EDE4', fontFamily: SANS, fontWeight: 600, fontSize: 17, alignItems: 'center'}}>Order ahead →</div>
				</div>
				<div style={{position: 'absolute', left: 392, top: 80, width: 376, height: 204, border: `2.5px solid ${SEL}`, opacity: clamp01((p - 0.6) * 4)}}>
					{[0, 1].map((u) => [0, 1].map((v) => <div key={`${u}${v}`} style={{position: 'absolute', left: u * 376 - 7, top: v * 204 - 7, width: 12, height: 12, background: '#fff', border: `2px solid ${SEL}`}} />))}
				</div>
			</Pop>
		</div>
	</div>
);

// ---------------------------------------------------------------- 2. canva-like poster tool
export const AppCanva: React.FC<{p: number}> = ({p}) => (
	<div style={{width: MW, height: MH, background: '#EEF0F3', position: 'relative', overflow: 'hidden'}}>
		<Bar title="Dune Nights · Poster" right={<Btn c="#7B4DFF">Share</Btn>} bg="#FFFFFF" />
		<div style={{position: 'absolute', left: 0, top: 56, bottom: 0, width: 92, background: '#fff', borderRight: '1px solid rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, paddingTop: 22}}>
			{['Design', 'Elements', 'Text', 'Uploads', 'Draw'].map((k, i) => (
				<div key={k} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
					<div style={{width: 40, height: 40, borderRadius: 12, background: i === 2 ? '#EDE7FF' : '#F2F2F5'}} />
					<div style={{fontFamily: SANS, fontSize: 12.5, fontWeight: 560, color: i === 2 ? '#7B4DFF' : '#555'}}>{k}</div>
				</div>
			))}
		</div>
		<div style={{position: 'absolute', left: 92 + (MW - 92 - 540) / 2, top: 56 + 30, width: 540, height: 720, boxShadow: '0 8px 30px rgba(0,0,0,0.18)'}}>
			<Pop p={p} style={{inset: 0}} sel={false}>
				<Img src={staticFile('img/desert.jpg')} style={{position: 'absolute', inset: 0, width: 540, height: 720, objectFit: 'cover'}} />
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,14,40,0.15), rgba(10,14,40,0) 40%, rgba(10,14,40,0.35))'}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: SANS, fontSize: 17, fontWeight: 650, letterSpacing: '0.42em', color: 'rgba(255,255,255,0.85)'}}>LIVE IN THE MOJAVE</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 104, textAlign: 'center', fontFamily: COND, fontStretch: '122%', fontWeight: 800, fontSize: 84, letterSpacing: '0.02em', color: '#fff', lineHeight: 0.95}}>DUNE<br />NIGHTS</div>
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 62, textAlign: 'center', fontFamily: SANS, fontSize: 22, fontWeight: 650, letterSpacing: '0.24em', color: '#fff'}}>OCT 24 · 2026</div>
				{/* text boxes, editable */}
				{[
					{l: 96, t: 100, w: 348, h: 176},
					{l: 120, t: 62, w: 300, h: 34},
					{l: 150, t: 640, w: 240, h: 36},
				].map((b, i) => (
					<div key={i} style={{position: 'absolute', left: b.l, top: b.t, width: b.w, height: b.h, border: i === 0 ? `2.5px solid #A27BFF` : '1.5px dashed rgba(255,255,255,0.6)', borderRadius: 3, opacity: clamp01((p - 0.55) * 4)}}>
						{i === 0
							? [0, 1].map((u) => [0, 1].map((v) => <div key={`${u}${v}`} style={{position: 'absolute', left: u * b.w - 7, top: v * b.h - 7, width: 12, height: 12, borderRadius: 6, background: '#fff', boxShadow: '0 0 0 2px #A27BFF'}} />))
							: null}
					</div>
				))}
			</Pop>
		</div>
	</div>
);

// ---------------------------------------------------------------- 3. code editor + preview
const CODE: [string, string][][] = [
	[['#C586C0', 'export function '], ['#DCDCAA', 'Pricing'], ['#D4D4D4', '() {']],
	[['#C586C0', '  return '], ['#D4D4D4', '(']],
	[['#808080', '    <'], ['#4EC9B0', 'div '], ['#9CDCFE', 'className'], ['#D4D4D4', '='], ['#CE9178', '"rounded-3xl bg-white p-8 shadow-xl"'], ['#808080', '>']],
	[['#808080', '      <'], ['#4EC9B0', 'p '], ['#9CDCFE', 'className'], ['#D4D4D4', '='], ['#CE9178', '"text-blue-600 font-semibold"'], ['#808080', '>'], ['#D4D4D4', 'Pro'], ['#808080', '</p>']],
	[['#808080', '      <'], ['#4EC9B0', 'h3 '], ['#9CDCFE', 'className'], ['#D4D4D4', '='], ['#CE9178', '"text-5xl font-bold"'], ['#808080', '>'], ['#D4D4D4', '$20'], ['#808080', '</h3>']],
	[['#808080', '      <'], ['#4EC9B0', 'ul '], ['#9CDCFE', 'className'], ['#D4D4D4', '='], ['#CE9178', '"mt-6 space-y-3"'], ['#808080', '>']],
	[['#808080', '        <'], ['#4EC9B0', 'Check'], ['#808080', '>'], ['#D4D4D4', 'Unlimited pastes'], ['#808080', '</Check>']],
	[['#808080', '        <'], ['#4EC9B0', 'Check'], ['#808080', '>'], ['#D4D4D4', 'Every app'], ['#808080', '</Check>']],
	[['#808080', '      </'], ['#4EC9B0', 'ul'], ['#808080', '>']],
	[['#808080', '      <'], ['#4EC9B0', 'Button'], ['#808080', '>'], ['#D4D4D4', 'Start free trial'], ['#808080', '</Button>']],
	[['#808080', '    </'], ['#4EC9B0', 'div'], ['#808080', '>']],
	[['#D4D4D4', '  );']],
	[['#D4D4D4', '}']],
];
export const AppCode: React.FC<{p: number}> = ({p}) => (
	<div style={{width: MW, height: MH, background: '#1E1E1E', position: 'relative', overflow: 'hidden'}}>
		<Bar dark title="pricing.tsx" />
		<div style={{height: 44, display: 'flex', background: '#252526', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
			<div style={{padding: '0 20px', display: 'flex', alignItems: 'center', background: '#1E1E1E', fontFamily: SANS, fontSize: 15, color: '#fff', borderTop: '2px solid #3B82F6'}}>Pricing.tsx</div>
			<div style={{padding: '0 20px', display: 'flex', alignItems: 'center', fontFamily: SANS, fontSize: 15, color: 'rgba(255,255,255,0.5)'}}>page.tsx</div>
		</div>
		<div style={{position: 'absolute', left: 0, top: 100, right: 0, height: 440, padding: '16px 0', fontFamily: MONO, fontSize: 18.5, lineHeight: '31px'}}>
			{CODE.map((line, i) => {
				const q = clamp01((p - i * 0.035) * 4);
				return (
					<div key={i} style={{display: 'flex', whiteSpace: 'pre', opacity: q, background: q < 1 && q > 0 ? 'rgba(59,130,246,0.25)' : undefined}}>
						<span style={{width: 56, textAlign: 'right', paddingRight: 20, color: '#5A5A5A'}}>{i + 1}</span>
						{line.map(([c, s], j) => (
							<span key={j} style={{color: c}}>{s}</span>
						))}
					</div>
				);
			})}
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 330, background: '#F4F5F8', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
			<div style={{position: 'absolute', left: 18, top: 12, fontFamily: SANS, fontSize: 13, fontWeight: 650, letterSpacing: '0.1em', color: '#8E8E93'}}>PREVIEW</div>
			<Pop p={p} style={{left: (MW - 360) / 2, top: 40, width: 360}} sel={false}>
				<div style={{borderRadius: 22, background: '#fff', padding: '22px 26px', boxShadow: '0 16px 40px rgba(20,30,60,0.14)', fontFamily: SANS}}>
					<div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
						<div style={{fontWeight: 650, fontSize: 17, color: '#2563EB'}}>Pro</div>
						<div style={{fontWeight: 760, fontSize: 40, letterSpacing: '-0.03em', color: '#111'}}>
							$20<span style={{fontSize: 17, color: '#888', fontWeight: 500}}>/mo</span>
						</div>
					</div>
					{['Unlimited pastes', 'Every app'].map((f) => (
						<div key={f} style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 17, color: '#444'}}>
							<div style={{width: 20, height: 20, borderRadius: 10, background: '#DBEAFE', color: '#2563EB', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800}}>✓</div>
							{f}
						</div>
					))}
					<div style={{marginTop: 18, height: 46, borderRadius: 12, background: '#2563EB', color: '#fff', fontWeight: 650, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Start free trial</div>
				</div>
			</Pop>
		</div>
	</div>
);

// ---------------------------------------------------------------- 4. spreadsheet
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const USERS = [12.1, 14.8, 16.2, 19.9, 23.4, 28.7];
export const AppSheets: React.FC<{p: number}> = ({p}) => {
	const cols = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
	const cw = [52, 140, 160, 120, 120, 120, 120, 120];
	const rh = 44;
	return (
		<div style={{width: MW, height: MH, background: '#fff', position: 'relative', overflow: 'hidden', fontFamily: SANS}}>
			<Bar title="Growth metrics" right={<Btn c="#1E8E5A">Share</Btn>} />
			<div style={{height: 46, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderBottom: '1px solid rgba(0,0,0,0.08)', fontSize: 16, color: '#555'}}>
				<span style={{fontFamily: MONO, fontSize: 15, color: '#888'}}>fx</span>
				<span>Active users (k)</span>
			</div>
			<div style={{position: 'absolute', left: 0, top: 102}}>
				{Array.from({length: 17}).map((_, r) => (
					<div key={r} style={{display: 'flex', height: rh}}>
						{cols.map((c, ci) => {
							const head = r === 0 || ci === 0;
							let txt: React.ReactNode = r === 0 ? c : ci === 0 ? r : '';
							const inT = r >= 2 && r <= 8 && (ci === 1 || ci === 2);
							if (inT && p > 0.3) {
								const i = r - 3;
								txt = r === 2 ? (ci === 1 ? 'Month' : 'Active users (k)') : ci === 1 ? MONTHS[i] : USERS[i]?.toFixed(1);
							}
							return (
								<div
									key={ci}
									style={{
										width: cw[ci],
										borderRight: '1px solid #E3E3E6',
										borderBottom: '1px solid #E3E3E6',
										background: head ? '#F5F5F7' : inT && p > 0.3 ? `rgba(47,107,255,${0.07 * clamp01((p - 0.3) * 3)})` : '#fff',
										display: 'flex',
										alignItems: 'center',
										justifyContent: ci === 2 && r > 2 ? 'flex-end' : head ? 'center' : 'flex-start',
										padding: '0 10px',
										fontSize: head ? 14 : 16,
										fontWeight: r === 2 && inT ? 700 : head ? 600 : 450,
										color: head ? '#777' : '#1C1C1E',
										fontVariantNumeric: 'tabular-nums',
										boxSizing: 'border-box',
										opacity: inT && !head ? clamp01((p - 0.3 - (r - 2) * 0.04) * 5) : 1,
									}}
								>
									{txt}
								</div>
							);
						})}
					</div>
				))}
			</div>
			{/* selection around the pasted range */}
			<div style={{position: 'absolute', left: 52, top: 102 + rh * 2, width: 300, height: rh * 7, border: `2.5px solid ${SEL}`, opacity: clamp01((p - 0.5) * 4)}} />
			{/* the chart, rebuilt from the data */}
			<Pop p={clamp01(p * 1.1 - 0.1)} style={{left: 400, top: 102 + rh * 2, width: 560, height: 330}}>
				<div style={{width: 560, height: 330, background: '#fff', borderRadius: 10, boxShadow: '0 6px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)', padding: '20px 24px', boxSizing: 'border-box'}}>
					<div style={{fontWeight: 680, fontSize: 19, color: '#1C1C1E'}}>Active users</div>
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 26, height: 220, marginTop: 20, paddingLeft: 10, borderBottom: '2px solid #DDD'}}>
						{USERS.map((u, i) => (
							<div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
								<div style={{width: 52, height: (u / 30) * 210 * clamp01((p - 0.35 - i * 0.05) * 3), borderRadius: '6px 6px 0 0', background: i === 5 ? '#2F6BFF' : '#9DB7FF'}} />
							</div>
						))}
					</div>
					<div style={{display: 'flex', gap: 26, paddingLeft: 10, marginTop: 6}}>
						{MONTHS.map((m) => (
							<div key={m} style={{width: 52, textAlign: 'center', fontSize: 13, color: '#777'}}>{m}</div>
						))}
					</div>
				</div>
			</Pop>
		</div>
	);
};

// ---------------------------------------------------------------- 5. notes / docs page
export const AppNotion: React.FC<{p: number}> = ({p}) => (
	<div style={{width: MW, height: MH, background: '#fff', position: 'relative', overflow: 'hidden', fontFamily: SANS}}>
		<Bar title="Product pages" />
		<div style={{position: 'absolute', left: 0, top: 56, bottom: 0, width: 220, background: '#F7F7F5', borderRight: '1px solid rgba(0,0,0,0.06)', padding: '18px 14px', fontSize: 16, color: '#5F5E5B'}}>
			{['Launch plan', 'Product pages', 'Glow Serum', 'Press kit', 'Retail'].map((k, i) => (
				<div key={k} style={{height: 36, display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', borderRadius: 7, background: i === 2 ? 'rgba(0,0,0,0.06)' : undefined, fontWeight: i === 2 ? 600 : 450, color: i === 2 ? '#1C1C1E' : undefined}}>
					<span style={{width: 18, height: 18, borderRadius: 4, background: i === 2 ? '#E9C9A8' : '#E2E2DF'}} />
					{k}
				</div>
			))}
		</div>
		<div style={{position: 'absolute', left: 220, right: 0, top: 56, height: 220, overflow: 'hidden'}}>
			<Img src={staticFile('img/serum.jpg')} style={{position: 'absolute', left: 0, top: -260, width: MW - 220, height: (MW - 220) * 1.25, objectFit: 'cover'}} />
		</div>
		<Pop p={p} style={{left: 290, top: 310, width: 640}} origin="0% 0%">
			<div style={{fontSize: 46, fontWeight: 720, letterSpacing: '-0.03em', color: '#1C1C1E'}}>Daily Glow Serum</div>
			<div style={{display: 'flex', gap: 34, marginTop: 18, fontSize: 17}}>
				{[
					['Price', '$48'],
					['Size', '30 ml'],
					['Status', 'Launching'],
				].map(([k, v]) => (
					<div key={k}>
						<div style={{color: '#9B9A97', fontWeight: 500}}>{k}</div>
						<div style={{color: '#1C1C1E', fontWeight: 600, marginTop: 4}}>{v}</div>
					</div>
				))}
			</div>
			<div style={{height: 1, background: 'rgba(0,0,0,0.08)', margin: '24px 0 18px'}} />
			{['15% vitamin C for visible glow', 'Niacinamide 5% to even tone', 'Fragrance-free, vegan, refillable'].map((b) => (
				<div key={b} style={{display: 'flex', gap: 14, alignItems: 'center', fontSize: 21, color: '#37352F', marginTop: 12}}>
					<span style={{width: 7, height: 7, borderRadius: 4, background: '#37352F'}} />
					{b}
				</div>
			))}
		</Pop>
	</div>
);

// ---------------------------------------------------------------- 6. photo editor with layers
export const AppPhoto: React.FC<{p: number}> = ({p}) => {
	const k = 0.5;
	return (
		<div style={{width: MW, height: MH, background: '#1F1F21', position: 'relative', overflow: 'hidden', fontFamily: SANS}}>
			<Bar dark title="halden-drift3.psd" />
			<div style={{position: 'absolute', left: 0, top: 56, bottom: 0, width: 60, background: '#2A2A2D', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 16}}>
				{Array.from({length: 9}).map((_, i) => (
					<div key={i} style={{width: 30, height: 30, borderRadius: 7, background: i === 0 ? '#3A3A3E' : 'rgba(255,255,255,0.08)'}} />
				))}
			</div>
			<div style={{position: 'absolute', left: 60, top: 56, width: 690, bottom: 0, background: '#262628'}}>
				<Pop p={p} style={{left: (690 - 1080 * k) / 2, top: 50, width: 1080 * k, height: 1350 * k}} sel={false}>
					<div style={{width: 1080, height: 1350, transform: `scale(${k})`, transformOrigin: '0 0', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>
						<Ad s={{headline: 'Built for the long way home.', caps: 1, color: 1, shoeDx: -34, shoeDy: 92}} />
					</div>
				</Pop>
			</div>
			<div style={{position: 'absolute', right: 0, top: 56, bottom: 0, width: 282, background: '#2A2A2D', borderLeft: '1px solid rgba(255,255,255,0.06)'}}>
				<div style={{padding: '16px 18px', fontWeight: 650, fontSize: 16, color: '#fff'}}>Layers</div>
				{['Shop now', '$160', 'Drift 3', 'Headline', 'Shoe', 'Shadow', 'Background'].map((l, i) => (
					<div key={l} style={{height: 52, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', background: i === 4 ? 'rgba(47,107,255,0.35)' : undefined, borderTop: '1px solid rgba(255,255,255,0.05)', opacity: clamp01((p - 0.2 - i * 0.05) * 5), color: '#E5E5EA', fontSize: 16}}>
						<div style={{width: 40, height: 34, borderRadius: 4, background: i === 6 ? '#C9A57E' : i === 4 ? '#437DFF' : '#3A3A3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#ddd'}}>{i <= 3 && i !== 0 ? 'T' : ''}</div>
						{l}
					</div>
				))}
			</div>
		</div>
	);
};

export const APPS = [
	{C: AppSlides, cap: 'GOOGLE SLIDES.'},
	{C: AppCanva, cap: 'CANVA.'},
	{C: AppCode, cap: 'YOUR CODE.'},
	{C: AppSheets, cap: 'SHEETS.'},
	{C: AppNotion, cap: 'NOTION.'},
	{C: AppPhoto, cap: 'PHOTOSHOP.'},
];

const WY = 420;

/** the montage at film time t */
export const Scene4: React.FC<{t: number}> = ({t}) => {
	const cuts = T.cuts;
	let i = 0;
	for (let k = 0; k < cuts.length; k++) if (t >= cuts[k]) i = k;
	const grid = i >= 6;
	const local = t - cuts[i];
	const p = spr(local, 0.03, 9, 0.6);
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Wall dim={0.05} />
			{!grid ? (
				(() => {
					const {C} = APPS[i];
					const push = 1 + 0.025 * clamp01(local / 0.68);
					return (
						<div style={{position: 'absolute', left: (1080 - MW) / 2, top: WY, width: MW, height: MH, borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 90px rgba(10,20,60,0.42), 0 10px 26px rgba(10,20,60,0.22), 0 0 0 1px rgba(0,0,0,0.14)', transform: `scale(${push})`}}>
							<C p={p} />
						</div>
					);
				})()
			) : (
				// all six at once
				APPS.map(({C}, k) => {
					const col = k % 2;
					const row = Math.floor(k / 2);
					const s = 0.47;
					const gx = 34 + col * (MW * s + 18);
					const gy = 380 + row * (MH * s + 20);
					const u = easeOut(clamp01((local - k * 0.03) / 0.3));
					const fromS = 0.9;
					return (
						<div key={k} style={{position: 'absolute', left: gx, top: gy, width: MW, height: MH, transform: `scale(${s * lerp(fromS, 1, u)})`, transformOrigin: '0 0', opacity: u, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(10,20,60,0.4), 0 0 0 2px rgba(0,0,0,0.12)'}}>
							<C p={1} />
						</div>
					);
				})
			)}
		</AbsoluteFill>
	);
};

/** ⌘V held at the bottom, pressed on every beat of the montage */
export const MontageKeys: React.FC<{t: number}> = ({t}) => {
	let last = T.cuts[0];
	for (const c of T.cuts) if (t >= c - 0.06) last = c;
	return <Keys t={t} a={T.s4 - 0.25} press={last} keys={['⌘', 'V']} y={1336} scale={0.9} holdUntil={T.cuts[6] - 0.04} />;
};
