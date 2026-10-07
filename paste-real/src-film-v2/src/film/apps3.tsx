import React from 'react';
import {BRAND_MONO, SYS} from '../lib/tokens';
import {Traffic} from '../mac/mac';

// Scene 3 apps: a SaaS landing page (Northstar) in Safari, the developer's own site on localhost, and VS Code.

const TIGHT = 'Inter Tight';

// ================================================================== Safari's tab bar (separate-tab layout)
export const SAFARI_TABS = 28;
export const SafariTabs: React.FC<{w: number; tabs: [string, React.ReactNode][]; active: number; top: number; front?: boolean}> = ({w, tabs, active, top, front = true}) => (
	<div style={{position: 'absolute', left: 0, top, width: w, height: SAFARI_TABS, background: front ? '#E3E2E6' : '#ECEBEE', borderBottom: '0.5px solid rgba(0,0,0,0.12)', display: 'flex', fontFamily: SYS, zIndex: 10}}>
		{tabs.map(([title, icon], i) => (
			<div
				key={i}
				style={{
					flex: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 7,
					fontSize: 11,
					color: i === active ? '#1D1D1F' : '#6E6E73',
					background: i === active ? (front ? '#F4F3F6' : '#F6F6F8') : 'transparent',
					borderRight: i < tabs.length - 1 ? '0.5px solid rgba(0,0,0,0.1)' : undefined,
					fontWeight: i === active ? 500 : 400,
				}}
			>
				{icon}
				{title}
			</div>
		))}
	</div>
);

// ================================================================== Northstar: the landing page that gets copied
export const StarGlyph: React.FC<{size: number; color?: string}> = ({size, color = '#5B4BFF'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5-.6-5.6-4.9-9.9-10.5-10.5C7.1 11.4 11.4 7.1 12 1.5z" fill={color} />
	</svg>
);

const Nav: React.FC<{w: number; brand: 'northstar' | 'acme'}> = ({w, brand}) =>
	brand === 'northstar' ? (
		<div style={{height: 44, width: w, display: 'flex', alignItems: 'center', padding: '0 28px', boxSizing: 'border-box', fontFamily: SYS, fontSize: 11.5, color: '#55555F', borderBottom: '0.5px solid rgba(15,15,30,0.06)'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 7, fontFamily: TIGHT, fontWeight: 650, fontSize: 15, color: '#0B0B12', letterSpacing: '-0.02em'}}>
				<StarGlyph size={15} />
				Northstar
			</div>
			<div style={{display: 'flex', gap: 20, marginLeft: 40}}>
				<span>Product</span>
				<span>Customers</span>
				<span>Pricing</span>
				<span>Docs</span>
			</div>
			<span style={{marginLeft: 'auto', marginRight: 16}}>Sign in</span>
			<div style={{height: 26, padding: '0 13px', borderRadius: 13, background: '#0B0B12', color: '#fff', fontWeight: 550, fontSize: 11, display: 'flex', alignItems: 'center'}}>Start free</div>
		</div>
	) : (
		<div style={{height: 44, width: w, display: 'flex', alignItems: 'center', padding: '0 28px', boxSizing: 'border-box', fontFamily: SYS, fontSize: 11.5, color: '#55555F', borderBottom: '0.5px solid rgba(15,15,30,0.08)'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 7, fontFamily: BRAND_MONO, fontWeight: 600, fontSize: 13.5, color: '#0B0B12'}}>
				<div style={{width: 14, height: 14, borderRadius: 3, background: '#0B0B12', transform: 'rotate(45deg) scale(0.8)'}} />
				acme
			</div>
			<div style={{display: 'flex', gap: 20, marginLeft: 36}}>
				<span>Home</span>
				<span>Blog</span>
				<span>Changelog</span>
			</div>
			<span style={{marginLeft: 'auto'}}>GitHub</span>
		</div>
	);

/** the dashboard screenshot inside the hero */
const DashCard: React.FC<{w: number}> = ({w}) => {
	const pts = [38, 44, 41, 52, 49, 58, 63, 60, 71, 76, 74, 86];
	const cw = w - 150,
		ch = 120;
	const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * cw} ${ch - (v / 100) * ch}`).join(' ');
	return (
		<div style={{width: w, height: 260, borderRadius: 14, background: '#fff', boxShadow: '0 30px 60px rgba(40,30,120,0.16), 0 0 0 1px rgba(20,20,60,0.07)', overflow: 'hidden', display: 'flex', fontFamily: SYS}}>
			<div style={{width: 112, background: '#FAFAFC', borderRight: '1px solid #EFEFF4', padding: '14px 12px', boxSizing: 'border-box', fontSize: 9.5, color: '#6B6B78'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 5, fontWeight: 650, color: '#0B0B12', fontSize: 10.5, marginBottom: 14}}>
					<StarGlyph size={10} /> Acme Inc.
				</div>
				{['Overview', 'Revenue', 'Customers', 'Forecasts', 'Reports'].map((s, i) => (
					<div key={s} style={{height: 20, borderRadius: 5, padding: '0 7px', display: 'flex', alignItems: 'center', background: i === 0 ? '#F0EEFF' : 'transparent', color: i === 0 ? '#4A3AF0' : undefined, fontWeight: i === 0 ? 600 : 450, marginBottom: 3}}>
						{s}
					</div>
				))}
			</div>
			<div style={{flex: 1, padding: '14px 16px'}}>
				<div style={{fontSize: 12, fontWeight: 650, color: '#0B0B12'}}>Overview</div>
				<div style={{display: 'flex', gap: 8, marginTop: 10}}>
					{[
						['Revenue', '$4.2M', '+12%'],
						['Active users', '38.1K', '+8%'],
						['Churn', '1.9%', '−0.4'],
					].map(([k, v, d]) => (
						<div key={k} style={{flex: 1, borderRadius: 8, border: '1px solid #EFEFF4', padding: '8px 9px'}}>
							<div style={{fontSize: 8.5, color: '#8A8A96'}}>{k}</div>
							<div style={{display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 3}}>
								<span style={{fontSize: 15, fontWeight: 650, color: '#0B0B12', letterSpacing: '-0.02em'}}>{v}</span>
								<span style={{fontSize: 8.5, color: '#14A06B', fontWeight: 600}}>{d}</span>
							</div>
						</div>
					))}
				</div>
				<svg width={cw} height={ch + 4} style={{marginTop: 14, overflow: 'visible'}}>
					<defs>
						<linearGradient id="nsg" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="rgba(91,75,255,0.25)" />
							<stop offset="1" stopColor="rgba(91,75,255,0)" />
						</linearGradient>
					</defs>
					{[0.25, 0.5, 0.75].map((f) => (
						<line key={f} x1={0} x2={cw} y1={ch * f} y2={ch * f} stroke="#F0F0F5" />
					))}
					<path d={`${path} L ${cw} ${ch} L 0 ${ch} Z`} fill="url(#nsg)" />
					<path d={path} fill="none" stroke="#5B4BFF" strokeWidth={2} strokeLinejoin="round" />
				</svg>
			</div>
		</div>
	);
};

/** the hero section (the thing that gets copied), laid out at page width w */
export const HERO_H = 436;
export const Hero: React.FC<{w: number; hover?: number}> = ({w, hover = 0}) => (
	<div style={{position: 'relative', width: w, height: HERO_H, overflow: 'hidden', fontFamily: SYS, background: '#fff'}}>
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(60% 55% at 50% 0%, rgba(124,108,255,0.16), rgba(124,108,255,0) 70%)'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 26, display: 'flex', justifyContent: 'center'}}>
			<div style={{height: 21, padding: '0 10px', borderRadius: 11, background: '#F0EEFF', color: '#4A3AF0', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6}}>
				<StarGlyph size={9} color="#4A3AF0" /> New: Forecasts <span style={{fontWeight: 500}}>→</span>
			</div>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontFamily: TIGHT, fontSize: 37, fontWeight: 620, letterSpacing: '-0.04em', lineHeight: 1.04, color: '#0B0B12'}}>
			Know your numbers
			<br />
			before the meeting.
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 152, textAlign: 'center', fontSize: 12.5, lineHeight: 1.45, color: '#5B5B68'}}>
			Connect every source to one live dashboard,
			<br />
			so the answer is ready before anyone asks.
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 204, display: 'flex', justifyContent: 'center', gap: 10}}>
			<div style={{height: 32, padding: '0 17px', borderRadius: 16, background: hover > 0 ? `rgb(${91 - 22 * hover},${75 - 20 * hover},${255 - 30 * hover})` : '#5B4BFF', color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', boxShadow: '0 6px 16px rgba(91,75,255,0.3)'}}>Start free</div>
			<div style={{height: 32, padding: '0 17px', borderRadius: 16, background: '#fff', boxShadow: 'inset 0 0 0 1px #E2E2EA', color: '#0B0B12', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center'}}>Book a demo</div>
		</div>
		<div style={{position: 'absolute', left: (w - 560) / 2, top: 266}}>
			<DashCard w={560} />
		</div>
	</div>
);

export const SitePage: React.FC<{w: number; brand: 'northstar' | 'acme'; hero: number; hover?: number}> = ({w, brand, hero, hover}) => (
	<div style={{position: 'relative', width: w, background: '#fff'}}>
		<Nav w={w} brand={brand} />
		<div style={{opacity: hero, transform: `translateY(${(1 - hero) * 8}px)`}}>
			<Hero w={w} hover={hover} />
		</div>
	</div>
);

// ================================================================== VS Code (Dark Modern), drawn from scratch
export const VS = {title: 28, act: 36, side: 132, tabs: 28, crumbs: 18, panel: 104, status: 18, line: 15.5, font: 10.5, gutter: 34};

/** a tiny JSX/TS highlighter, enough for the hero component */
const KW = new Set(['export', 'function', 'return', 'const', 'import', 'from']);
export const tokenize = (line: string): [string, string][] => {
	const out: [string, string][] = [];
	const re = /(\/\/.*$)|("[^"]*")|(<\/?)([A-Za-z][\w.]*)|([A-Za-z_][\w-]*)(?==)|(\b[A-Za-z_]\w*\b)|(\/?>)|([{}()[\];=,.])|(\s+)|([^\sA-Za-z_"<>{}()[\];=,./]+)/g;
	let m: RegExpExecArray | null;
	let inTag = false;
	while ((m = re.exec(line))) {
		if (m[1]) out.push([m[1], '#6A9955']);
		else if (m[2]) out.push([m[2], '#CE9178']);
		else if (m[3]) {
			out.push([m[3], '#808080']);
			out.push([m[4], /^[A-Z]/.test(m[4]) ? '#4EC9B0' : '#569CD6']);
			inTag = true;
		} else if (m[5]) out.push([m[5], '#9CDCFE']);
		else if (m[6]) {
			const w = m[6];
			out.push([w, KW.has(w) ? (w === 'function' || w === 'const' ? '#569CD6' : '#C586C0') : w === 'Hero' ? '#DCDCAA' : w === 'null' ? '#569CD6' : inTag ? '#9CDCFE' : '#D4D4D4']);
		} else if (m[7]) {
			out.push([m[7], '#808080']);
			inTag = false;
		} else if (m[8]) out.push([m[8], m[8] === '{' || m[8] === '}' ? '#FFD700' : m[8] === '(' || m[8] === ')' ? '#DA70D6' : '#D4D4D4']);
		else out.push([m[0], '#D4D4D4']);
	}
	return out;
};

export const CODE_BEFORE = ['export function Hero() {', '  // TODO: hero section', '  return null;', '}'];
export const CODE_AFTER = [
	'export function Hero() {',
	'  return (',
	'    <section className="relative overflow-hidden bg-white">',
	'      <div className="mx-auto max-w-3xl px-6 pt-16 text-center">',
	'        <a className="rounded-full bg-violet-50 px-3 py-1',
	'          text-sm font-semibold text-violet-700">',
	'          New: Forecasts →',
	'        </a>',
	'        <h1 className="mt-6 text-6xl font-semibold tracking-tight">',
	'          Know your numbers before the meeting.',
	'        </h1>',
	'        <p className="mx-auto mt-5 max-w-md text-lg text-zinc-500">',
	'          Connect every source to one live dashboard,',
	'          so the answer is ready before anyone asks.',
	'        </p>',
	'        <div className="mt-8 flex justify-center gap-3">',
	'          <a className="rounded-full bg-violet-600 px-5 py-2.5',
	'            font-semibold text-white hover:bg-violet-700">',
	'            Start free',
	'          </a>',
	'          <a className="rounded-full border px-5 py-2.5">Book a demo</a>',
	'        </div>',
	'        <img src="/hero-dashboard.png" className="mt-14" />',
	'      </div>',
	'    </section>',
	'  );',
	'}',
];

const FileIcon: React.FC<{kind: 'tsx' | 'ts' | 'json' | 'folder' | 'md'}> = ({kind}) =>
	kind === 'folder' ? (
		<span style={{color: '#C5C5C5', fontSize: 8, width: 10, display: 'inline-block'}}>›</span>
	) : (
		<span style={{fontFamily: BRAND_MONO, fontSize: 7.5, fontWeight: 700, width: 14, display: 'inline-block', color: kind === 'tsx' ? '#4FC1FF' : kind === 'ts' ? '#3178C6' : kind === 'json' ? '#CBCB41' : '#519ABA'}}>{kind === 'tsx' ? '⚛' : kind === 'ts' ? 'TS' : kind === 'json' ? '{}' : 'M'}</span>
	);

export const VSCode: React.FC<{
	w: number;
	h: number;
	front?: boolean;
	lines: string[];
	/** how many lines are visible (for the paste reveal), fractional ok */
	reveal?: number;
	/** selected line range [from, to] (0-based, inclusive) */
	sel?: [number, number] | null;
	/** caret [line, col] */
	caret?: [number, number] | null;
	flash?: number;
	terminal: string[];
	flashFrom?: number;
}> = ({w, h, front = true, lines, reveal = 1e9, sel, caret, flash = 0, terminal, flashFrom = 2}) => {
	const editorX = VS.act + VS.side;
	const codeTop = VS.title + VS.tabs + VS.crumbs;
	const codeH = h - codeTop - VS.panel - VS.status;
	const cw = VS.font * 0.6;
	return (
		<div style={{position: 'absolute', inset: 0, background: '#1F1F1F', fontFamily: SYS, color: '#CCCCCC'}}>
			{/* title bar */}
			<div style={{position: 'absolute', left: 0, top: 0, width: w, height: VS.title, background: '#181818', borderBottom: '1px solid #2B2B2B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: front ? '#CCCCCC' : '#7F7F7F'}}>
				<div style={{position: 'absolute', left: 12, top: 8}}>
					<Traffic dim={!front} />
				</div>
				<div style={{height: 19, width: 260, borderRadius: 5, background: '#2A2A2A', border: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 10.5, color: '#A8A8A8'}}>
					<svg width={10} height={10} viewBox="0 0 12 12">
						<circle cx={5} cy={5} r={3.6} fill="none" stroke="#A8A8A8" strokeWidth={1.3} />
						<path d="M7.8 7.8 10.5 10.5" stroke="#A8A8A8" strokeWidth={1.3} strokeLinecap="round" />
					</svg>
					acme-web
				</div>
			</div>
			{/* activity bar */}
			<div style={{position: 'absolute', left: 0, top: VS.title, width: VS.act, bottom: VS.status, background: '#181818', borderRight: '1px solid #2B2B2B', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, gap: 18}}>
				{[0, 1, 2, 3, 4].map((i) => (
					<svg key={i} width={18} height={18} viewBox="0 0 24 24" style={{opacity: i === 0 ? 1 : 0.45}}>
						{i === 0 ? <path d="M14 3H7a2 2 0 0 0-2 2v12M9 7h8l3 3v10a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1z" fill="none" stroke="#D7D7D7" strokeWidth={1.6} strokeLinejoin="round" /> : null}
						{i === 1 ? <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5 21 21" fill="none" stroke="#D7D7D7" strokeWidth={1.6} strokeLinecap="round" /> : null}
						{i === 2 ? <path d="M6 4v10M6 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 10c0 4-6 4-12 6" fill="none" stroke="#D7D7D7" strokeWidth={1.6} strokeLinecap="round" /> : null}
						{i === 3 ? <path d="M7 4.5v15l12-7.5zM3 4v16" fill="none" stroke="#D7D7D7" strokeWidth={1.6} strokeLinejoin="round" /> : null}
						{i === 4 ? <path d="M4 4h7v7H4zM13 13h7v7h-7zM4 13h7v7H4zM15.5 3.5l5 5-5 5-5-5z" fill="none" stroke="#D7D7D7" strokeWidth={1.5} strokeLinejoin="round" /> : null}
					</svg>
				))}
				<div style={{position: 'absolute', left: 0, top: 8, width: 2, height: 22, background: '#0078D4'}} />
			</div>
			{/* explorer */}
			<div style={{position: 'absolute', left: VS.act, top: VS.title, width: VS.side, bottom: VS.status, background: '#181818', borderRight: '1px solid #2B2B2B', fontSize: 10.5, color: '#CCCCCC'}}>
				<div style={{height: 26, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 9, letterSpacing: '0.04em', color: '#BBBBBB'}}>EXPLORER</div>
				<div style={{height: 20, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.03em'}}>
					<span style={{fontSize: 8, marginRight: 4}}>⌄</span>ACME-WEB
				</div>
				{(
					[
						['app', 'folder', 1, false],
						['layout.tsx', 'tsx', 2, false],
						['page.tsx', 'tsx', 2, false],
						['components', 'folder', 1, false],
						['Hero.tsx', 'tsx', 2, true],
						['Nav.tsx', 'tsx', 2, false],
						['public', 'folder', 1, false],
						['package.json', 'json', 1, false],
						['README.md', 'md', 1, false],
						['tailwind.config.ts', 'ts', 1, false],
					] as [string, 'tsx' | 'ts' | 'json' | 'folder' | 'md', number, boolean][]
				).map(([name, kind, depth, on]) => (
					<div key={name} style={{height: 20, display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 4 + depth * 9, background: on ? '#37373D' : 'transparent', boxShadow: on ? 'inset 0 0 0 1px #0078D4' : 'none', color: on ? '#fff' : '#CCCCCC'}}>
						<FileIcon kind={kind} />
						{name}
					</div>
				))}
			</div>
			{/* tabs */}
			<div style={{position: 'absolute', left: editorX, top: VS.title, right: 0, height: VS.tabs, background: '#181818', borderBottom: '1px solid #2B2B2B', display: 'flex'}}>
				{[
					['Hero.tsx', true],
					['page.tsx', false],
				].map(([name, on]) => (
					<div key={name as string} style={{height: VS.tabs, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, background: on ? '#1F1F1F' : 'transparent', color: on ? '#fff' : '#9D9D9D', borderRight: '1px solid #2B2B2B', borderTop: on ? '1px solid #0078D4' : '1px solid transparent', boxSizing: 'border-box'}}>
						<FileIcon kind="tsx" />
						{name}
						<span style={{marginLeft: 6, color: '#8B8B8B', fontSize: 11}}>{on ? '×' : ''}</span>
					</div>
				))}
			</div>
			{/* breadcrumbs */}
			<div style={{position: 'absolute', left: editorX, top: VS.title + VS.tabs, right: 0, height: VS.crumbs, display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', fontSize: 9.5, color: '#A9A9A9'}}>
				components <span style={{fontSize: 8}}>›</span> <FileIcon kind="tsx" /> Hero.tsx <span style={{fontSize: 8}}>›</span> <span style={{color: '#B180D7'}}>⬡</span> Hero
			</div>
			{/* code */}
			<div style={{position: 'absolute', left: editorX, top: codeTop, right: 0, height: codeH, overflow: 'hidden', fontFamily: BRAND_MONO, fontSize: VS.font}}>
				{flash > 0 ? <div style={{position: 'absolute', left: VS.gutter, right: 0, top: flashFrom * VS.line + 4, height: (Math.min(lines.length, reveal) - flashFrom - 2) * VS.line, background: `rgba(38,79,120,${0.55 * flash})`}} /> : null}
				{sel ? <div style={{position: 'absolute', left: VS.gutter + 6, width: 300, top: sel[0] * VS.line + 4, height: (sel[1] - sel[0] + 1) * VS.line, background: '#264F78'}} /> : null}
				{lines.map((ln, i) => {
					const vis = Math.max(0, Math.min(1, reveal - i));
					if (vis <= 0) return null;
					return (
						<div key={i} style={{position: 'absolute', left: 0, top: i * VS.line + 4, height: VS.line, display: 'flex', alignItems: 'center', whiteSpace: 'pre', opacity: vis}}>
							<span style={{width: VS.gutter, textAlign: 'right', paddingRight: 14, color: caret && caret[0] === i ? '#CCCCCC' : '#6E7681', boxSizing: 'border-box', flexShrink: 0}}>{i + 1}</span>
							<span style={{paddingLeft: 6}}>
								{tokenize(ln).map(([s, c], k) => (
									<span key={k} style={{color: c}}>
										{s}
									</span>
								))}
							</span>
						</div>
					);
				})}
				{caret ? <div style={{position: 'absolute', left: VS.gutter + 6 + caret[1] * cw, top: caret[0] * VS.line + 5, width: 1.6, height: VS.line - 2, background: '#AEAFAD'}} /> : null}
				{/* indent guides */}
				{[1, 2, 3, 4].map((k) => (
					<div key={k} style={{position: 'absolute', left: VS.gutter + 6 + k * 2 * cw, top: 4 + VS.line * 1, height: Math.max(0, Math.min(lines.length, reveal) - 2) * VS.line, width: 1, background: 'rgba(255,255,255,0.05)'}} />
				))}
			</div>
			{/* panel: terminal */}
			<div style={{position: 'absolute', left: editorX, right: 0, bottom: VS.status, height: VS.panel, background: '#181818', borderTop: '1px solid #2B2B2B'}}>
				<div style={{display: 'flex', gap: 16, padding: '0 12px', height: 24, alignItems: 'center', fontSize: 9, letterSpacing: '0.03em', color: '#9D9D9D'}}>
					<span>PROBLEMS</span>
					<span>OUTPUT</span>
					<span style={{color: '#E7E7E7', borderBottom: '1px solid #0078D4', paddingBottom: 2}}>TERMINAL</span>
					<span>PORTS</span>
				</div>
				<div style={{padding: '4px 12px', fontFamily: BRAND_MONO, fontSize: 9.5, lineHeight: 1.55, color: '#CCCCCC', whiteSpace: 'pre'}}>
					{terminal.map((l, i) => (
						<div key={i} style={{color: l.startsWith(' ✓') ? '#CCCCCC' : undefined}}>
							{l.startsWith(' ✓') ? (
								<>
									<span style={{color: '#23D18B'}}> ✓</span>
									{l.slice(2)}
								</>
							) : l.startsWith('  ▲') ? (
								<span style={{fontWeight: 700}}>{l}</span>
							) : (
								l
							)}
						</div>
					))}
				</div>
			</div>
			{/* status bar */}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: VS.status, background: '#181818', borderTop: '1px solid #2B2B2B', display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px', fontSize: 9.5, color: '#9D9D9D'}}>
				<span style={{background: '#0078D4', color: '#fff', height: VS.status, padding: '0 8px', marginLeft: -10, display: 'flex', alignItems: 'center'}}>⟨⟩</span>
				<span>⎇ main</span>
				<span>⊗ 0 ⚠ 0</span>
				<span style={{marginLeft: 'auto'}}>{caret ? `Ln ${caret[0] + 1}, Col ${caret[1] + 1}` : 'Ln 1, Col 1'}</span>
				<span>Spaces: 2</span>
				<span>UTF-8</span>
				<span>TypeScript JSX</span>
			</div>
		</div>
	);
};
