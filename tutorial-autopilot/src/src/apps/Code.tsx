import React from 'react';
import {F, E, clamp, prog} from '../lib/theme';

/** A VS Code-style editor (Dark Modern) with a terminal: code types itself, then build + deploy. */
const K = {
	bg: '#1F1F1F',
	side: '#181818',
	bar: '#181818',
	tab: '#1F1F1F',
	line: '#2B2B2B',
	text: '#CCCCCC',
	dim: '#858585',
	kw: '#569CD6',
	fn: '#DCDCAA',
	str: '#CE9178',
	tag: '#4EC9B0',
	attr: '#9CDCFE',
	pun: '#808080',
	green: '#4EC07A',
	blue: '#0078D4',
};

type Tok = [string, string];
const L = (...t: Tok[]) => t;
const CODE: Tok[][] = [
	L(['import', K.kw], [' { ', K.text], ['Hero', K.tag], [' } ', K.text], ['from', K.kw], [" './hero'", K.str]),
	L(['import', K.kw], [' { ', K.text], ['Waitlist', K.tag], [' } ', K.text], ['from', K.kw], [" './waitlist'", K.str]),
	L(),
	L(['export default function', K.kw], [' Page', K.fn], ['() {', K.text]),
	L(['  return', K.kw], [' (', K.text]),
	L(['    <', K.pun], ['main', K.kw], [' className', K.attr], ['=', K.text], ['"min-h-screen bg-black"', K.str], ['>', K.pun]),
	L(['      <', K.pun], ['Hero', K.tag], [' title', K.attr], ['=', K.text], ['"Launch day"', K.str], [' />', K.pun]),
	L(['      <', K.pun], ['Waitlist', K.tag], [' list', K.attr], ['=', K.text], ['"launch"', K.str], [' />', K.pun]),
	L(['    </', K.pun], ['main', K.kw], ['>', K.pun]),
	L(['  )', K.text]),
	L(['}', K.text]),
];
const totalChars = CODE.reduce((a, l) => a + l.reduce((b, [s]) => b + s.length, 0) + 1, 0);

export type CodeT = {
	type?: number; // code types in
	typeDur?: number;
	build?: number; // terminal: npm run build
	deploy?: number; // terminal: deploy
	live?: number; // URL is live
};

export const CodeApp: React.FC<{t: number; k: CodeT}> = ({t, k}) => {
	const p = k.type !== undefined ? clamp((t - k.type) / (k.typeDur ?? 1.2)) : 1;
	let budget = Math.floor(p * totalChars);
	const lines = CODE.map((l) => {
		const out: React.ReactNode[] = [];
		for (let i = 0; i < l.length; i++) {
			const [s, c] = l[i];
			if (budget <= 0) break;
			const take = Math.min(s.length, budget);
			out.push(
				<span key={i} style={{color: c}}>
					{s.slice(0, take)}
				</span>,
			);
			budget -= take;
		}
		budget -= 1;
		return out;
	});
	const caretLine = Math.max(0, lines.findIndex((_, i) => {
		let b = Math.floor(p * totalChars);
		for (let j = 0; j <= i; j++) b -= CODE[j].reduce((a, [s]) => a + s.length, 0) + 1;
		return b < 0;
	}));
	const term: {t?: number; text: string; c?: string}[] = [
		{t: k.build, text: '$ npm run build'},
		{t: k.build !== undefined ? k.build + 0.25 : undefined, text: '  ▲ Next.js 16.2', c: K.text},
		{t: k.build !== undefined ? k.build + 0.45 : undefined, text: '  ✓ Compiled successfully in 1.8s', c: K.green},
		{t: k.deploy, text: '$ npx vercel deploy --prod'},
		{t: k.live, text: '  ✓ Production: https://launch-day.vercel.app', c: K.green},
	];
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: K.bg, fontFamily: F.inter, color: K.text, overflow: 'hidden'}}>
			{/* title bar */}
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 38, background: K.bar, borderBottom: `1px solid ${K.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: K.dim}}>
				<div style={{position: 'absolute', left: 16, display: 'flex', gap: 9}}>
					{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
						<div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />
					))}
				</div>
				<div style={{width: 520, height: 26, borderRadius: 6, background: '#2A2A2A', border: `1px solid ${K.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>launch-day</div>
			</div>
			{/* activity bar */}
			<div style={{position: 'absolute', left: 0, top: 38, width: 54, bottom: 26, background: K.side, borderRight: `1px solid ${K.line}`}}>
				{[0, 1, 2, 3, 4].map((i) => (
					<div key={i} style={{width: 26, height: 26, margin: '16px 14px', borderRadius: 4, border: `2px solid ${i === 0 ? '#D7D7D7' : '#6E6E6E'}`}} />
				))}
			</div>
			{/* explorer */}
			<div style={{position: 'absolute', left: 54, top: 38, width: 300, bottom: 26, background: K.side, borderRight: `1px solid ${K.line}`, fontSize: 15}}>
				<div style={{padding: '12px 20px', fontSize: 12.5, color: K.dim, letterSpacing: '0.06em'}}>EXPLORER</div>
				{['▾ LAUNCH-DAY', '  ▾ app', '      hero.tsx', '      page.tsx', '      waitlist.tsx', '    layout.tsx', '  ▸ public', '    package.json', '    next.config.ts'].map((f, i) => (
					<div key={i} style={{padding: '4px 20px', whiteSpace: 'pre', background: i === 3 ? '#37373D' : 'transparent', color: i === 0 ? K.text : i === 3 ? '#fff' : K.text, fontWeight: i === 0 ? 700 : 400, fontSize: i === 0 ? 13 : 15}}>
						{f}
					</div>
				))}
			</div>
			{/* tabs */}
			<div style={{position: 'absolute', left: 354, top: 38, right: 0, height: 40, background: K.side, display: 'flex', borderBottom: `1px solid ${K.line}`}}>
				{['page.tsx', 'hero.tsx', 'waitlist.tsx'].map((n, i) => (
					<div key={n} style={{padding: '0 22px', display: 'flex', alignItems: 'center', fontSize: 15, background: i === 0 ? K.tab : 'transparent', color: i === 0 ? '#fff' : K.dim, borderTop: i === 0 ? `1px solid ${K.blue}` : 'none', borderRight: `1px solid ${K.line}`}}>
						<span style={{color: K.tag, marginRight: 8, fontSize: 13}}>TSX</span>
						{n}
					</div>
				))}
			</div>
			{/* code */}
			<div style={{position: 'absolute', left: 354, top: 90, right: 0, height: 560, fontFamily: F.mono, fontSize: 21, lineHeight: '36px'}}>
				{lines.map((l, i) => (
					<div key={i} style={{display: 'flex', whiteSpace: 'pre'}}>
						<div style={{width: 76, textAlign: 'right', paddingRight: 28, color: i === caretLine ? '#C6C6C6' : '#6E7681'}}>{i + 1}</div>
						<div>
							{l}
							{i === caretLine && p < 1 ? <span style={{display: 'inline-block', width: 2, height: 26, background: '#AEAFAD', verticalAlign: 'middle'}} /> : null}
						</div>
					</div>
				))}
			</div>
			{/* terminal */}
			<div style={{position: 'absolute', left: 354, right: 0, top: 690, bottom: 26, background: K.bg, borderTop: `1px solid ${K.line}`, fontFamily: F.mono, fontSize: 19}}>
				<div style={{display: 'flex', gap: 28, padding: '10px 22px', fontFamily: F.inter, fontSize: 13, color: K.dim, letterSpacing: '0.04em'}}>
					<span>PROBLEMS</span>
					<span>OUTPUT</span>
					<span style={{color: '#fff', borderBottom: `1px solid ${K.blue}`}}>TERMINAL</span>
				</div>
				<div style={{padding: '6px 22px', lineHeight: '34px'}}>
					{term
						.filter((x) => x.t !== undefined && t >= x.t)
						.map((x, i) => {
							const cmd = x.text.startsWith('$');
							const n = cmd ? Math.floor(clamp((t - x.t!) / 0.3) * x.text.length) : x.text.length;
							return (
								<div key={i} style={{color: x.c ?? '#E5E5E5', whiteSpace: 'pre', opacity: cmd ? 1 : prog(t, x.t!, x.t! + 0.1)}}>
									{x.text.slice(0, Math.max(2, n))}
								</div>
							);
						})}
				</div>
			</div>
			{/* status bar */}
			<div style={{position: 'absolute', left: 0, bottom: 0, width: 1920, height: 26, background: K.blue, display: 'flex', alignItems: 'center', gap: 20, paddingLeft: 14, fontSize: 13.5, color: '#fff'}}>
				<span>⎇ main</span>
				<span>0 ⚠ 0 ⓧ</span>
				<span style={{marginLeft: 'auto', paddingRight: 16}}>TypeScript JSX</span>
			</div>
			<div style={{opacity: E.out(0)}} />
		</div>
	);
};
