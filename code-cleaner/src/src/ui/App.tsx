import React from 'react';
import {Easing, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import harness from '../data/harness.json';
import repo from '../data/repo.json';
import {C, F} from '../lib/theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export const REPO = repo as {files: {path: string; fns: number; heat: number}[]; fns: string[]};
export const HARNESS = harness as {
	rows: {i: number; in: string; old: string; new: string; same: boolean; bad: string; badSame: boolean}[];
	identical: number;
	firstBad: {i: number; in: string; old: string; bad: string; oldTax: number; badTax: number};
};

export const TOTAL_FNS = 1846;
export const SKIPPED = 7;
export const PROVEN = TOTAL_FNS - SKIPPED;

/** The brand mark: an equals sign made of one minus line and one plus line — old = new. */
export const Mark: React.FC<{size: number; t?: number}> = ({size, t = 1}) => {
	const bar = (color: string, y: number, k: number) => (
		<div
			style={{
				position: 'absolute',
				left: size * 0.2,
				top: size * y,
				width: size * 0.6 * k,
				height: size * 0.13,
				borderRadius: size * 0.065,
				background: color,
			}}
		/>
	);
	const a = interpolate(t, [0, 0.5], [0, 1], {...clamp, easing: ease});
	const b = interpolate(t, [0.35, 0.85], [0, 1], {...clamp, easing: ease});
	return (
		<div style={{position: 'relative', width: size, height: size, borderRadius: size * 0.24, background: '#14171C', boxShadow: `inset 0 0 0 ${Math.max(1, size * 0.012)}px #262B33`}}>
			{bar('#F0473B', 0.33, a)}
			{bar('#2FC15C', 0.54, b)}
		</div>
	);
};

const Lights: React.FC = () => (
	<div style={{display: 'flex', gap: 10}}>
		{['#3A3F47', '#3A3F47', '#3A3F47'].map((c, i) => (
			<div key={i} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
		))}
	</div>
);

export type Mode = 'Upkeep' | 'Speed' | 'Port';

export const Modes: React.FC<{active: Mode; size?: number; port?: string}> = ({active, size = 19, port = 'Port'}) => (
	<div style={{display: 'flex', background: '#0B0D10', border: `1px solid ${C.line}`, borderRadius: 10, padding: 4, gap: 4, fontFamily: F.mono, fontSize: size}}>
		{(['Upkeep', 'Speed', 'Port'] as Mode[]).map((m) => (
			<div
				key={m}
				style={{
					padding: `${size * 0.35}px ${size * 0.9}px`,
					borderRadius: 7,
					background: m === active ? '#1F242C' : 'transparent',
					color: m === active ? C.text : C.sub,
					boxShadow: m === active ? `inset 0 0 0 1px #2C333C` : undefined,
				}}
			>
				{m === 'Port' ? port : m}
			</div>
		))}
	</div>
);

/** App window chrome: title bar, toolbar (repo, mode, status), body. */
export const Win: React.FC<{w: number; h: number; mode?: Mode; port?: string; status?: React.ReactNode; children: React.ReactNode}> = ({
	w,
	h,
	mode = 'Upkeep',
	port,
	status,
	children,
}) => (
	<div
		style={{
			width: w,
			height: h,
			borderRadius: 16,
			background: C.win,
			boxShadow: '0 0 0 1px #20252C, 0 40px 120px rgba(0,0,0,0.6)',
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
			fontFamily: F.mono,
			color: C.text,
		}}
	>
		<div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 22, borderBottom: `1px solid ${C.line}`, background: C.panel, flexShrink: 0}}>
			<Lights />
			<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
				<Mark size={30} />
				<span style={{fontFamily: F.type, fontWeight: 700, fontSize: 21, color: C.text}}>Code Cleaner</span>
			</div>
			<div style={{fontSize: 18, color: C.sub, padding: '6px 14px', border: `1px solid ${C.line}`, borderRadius: 8}}>northstar-shop · main</div>
			<div style={{flex: 1}} />
			<Modes active={mode} port={port} />
			<div style={{flex: 1}} />
			<div style={{fontSize: 18, color: C.sub, minWidth: 330, textAlign: 'right'}}>{status}</div>
		</div>
		<div style={{flex: 1, display: 'flex', minHeight: 0}}>{children}</div>
	</div>
);

const heatColor = (h: number) => (h > 0.72 ? C.red : h > 0.48 ? '#E5763A' : C.amber);

/** The repo with a complexity heat dot per file; dots flip green as each file gets proven. */
export const Tree: React.FC<{w: number; greenAt?: number; greenDur?: number; rowH?: number; size?: number; skipAt?: number; firstAt?: number}> = ({
	w,
	greenAt = 1e9,
	greenDur = 30,
	rowH = 31,
	size = 18,
	skipAt,
	firstAt,
}) => {
	const f = useCurrentFrame();
	const files = [...REPO.files].sort((a, b) => Number(!a.path.startsWith('lib/')) - Number(!b.path.startsWith('lib/')));
	let lastDir = '';
	const rows: React.ReactNode[] = [];
	files.forEach((file, i) => {
		const dir = file.path.slice(0, file.path.lastIndexOf('/'));
		const name = file.path.slice(file.path.lastIndexOf('/') + 1);
		if (dir !== lastDir) {
			rows.push(
				<div key={'d' + i} style={{height: rowH, display: 'flex', alignItems: 'center', color: C.sub, fontSize: size, paddingLeft: 18}}>
					<span style={{color: '#4A515B', marginRight: 10}}>▾</span>
					{dir}/
				</div>,
			);
			lastDir = dir;
		}
		const cascade = interpolate(f, [greenAt + (i / files.length) * greenDur, greenAt + (i / files.length) * greenDur + 4], [0, 1], clamp);
		const first = firstAt !== undefined && file.path === 'lib/checkout.ts' ? interpolate(f, [firstAt, firstAt + 4], [0, 1], clamp) : 0;
		const g = Math.max(cascade, first);
		const isSkip = skipAt !== undefined && name === 'flash-sale.ts';
		const dot = isSkip && f >= skipAt! ? C.amber : interpolateColors(g, [0, 1], [heatColor(file.heat), C.green]);
		rows.push(
			<div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', fontSize: size, paddingLeft: 44, paddingRight: 18, color: name === 'checkout.ts' ? C.text : '#AEB6C0'}}>
				<div style={{width: 10, height: 10, borderRadius: 5, background: dot, marginRight: 14, boxShadow: `0 0 10px ${dot}55`}} />
				<span style={{flex: 1}}>{name}</span>
				<span style={{color: '#4A515B', fontSize: size * 0.85}}>{file.fns}</span>
			</div>,
		);
	});
	return (
		<div style={{width: w, flexShrink: 0, borderRight: `1px solid ${C.line}`, background: '#0D0F13', paddingTop: 12, overflow: 'hidden'}}>
			{rows}
		</div>
	);
};

/** Live feed of functions being proven: name, inputs, verdict. `p` = how many done. */
export const Feed: React.FC<{p: number; rows?: number; rowH?: number; size?: number; skipName?: string; skipAt?: number}> = ({p, rows = 9, rowH = 46, size = 21}) => {
	const n = Math.floor(p);
	const items: React.ReactNode[] = [];
	for (let k = Math.max(0, n - rows); k < n; k++) {
		const name = REPO.fns[k % REPO.fns.length];
		const skip = k > 0 && k % 263 === 131;
		items.push(
			<div key={k} style={{height: rowH, display: 'flex', alignItems: 'center', gap: 18, fontSize: size, borderBottom: `1px solid #171B21`}}>
				<span style={{width: 70, color: '#4A515B', textAlign: 'right'}}>{fmt(k + 1)}</span>
				<span style={{flex: 1, color: C.text}}>{name}()</span>
				<span style={{color: C.sub}}>{skip ? 'reads the clock' : '1,000 inputs'}</span>
				<span style={{width: 200, color: skip ? C.amber : C.green, textAlign: 'right', whiteSpace: 'nowrap'}}>{skip ? '— skipped' : '✓ identical'}</span>
			</div>,
		);
	}
	return <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: rows * rowH, overflow: 'hidden'}}>{items}</div>;
};

/** Harness table: real rows from the rig — same input, original vs rewrite. */
export const Harness: React.FC<{p: number; bad?: boolean; rows?: number; rowH?: number; size?: number; stopAt?: number}> = ({p, bad = false, rows = 7, rowH = 50, size = 22, stopAt}) => {
	const n = Math.min(Math.floor(p), stopAt ?? 1e9);
	const items: React.ReactNode[] = [];
	for (let k = Math.max(0, n - rows); k < n; k++) {
		const r = HARNESS.rows[k];
		const same = bad ? r.badSame : r.same;
		const nv = bad ? r.bad : r.new;
		items.push(
			<div
				key={k}
				style={{
					height: rowH,
					display: 'flex',
					alignItems: 'center',
					fontSize: size,
					gap: 20,
					background: same ? undefined : 'rgba(248,81,73,0.16)',
					borderBottom: `1px solid #171B21`,
					padding: '0 18px',
				}}
			>
				<span style={{width: 80, color: '#4A515B'}}>#{String(r.i).padStart(4, '0')}</span>
				<span style={{flex: 1, color: '#AEB6C0'}}>{r.in}</span>
				<span style={{width: 170, textAlign: 'right', color: C.text}}>{r.old}</span>
				<span style={{width: 40, textAlign: 'center', color: same ? C.green : C.red, fontWeight: 700}}>{same ? '=' : '≠'}</span>
				<span style={{width: 170, textAlign: 'right', color: same ? C.text : C.red}}>{nv}</span>
				<span style={{width: 50, textAlign: 'right', color: same ? C.green : C.red}}>{same ? '✓' : '✗'}</span>
			</div>,
		);
	}
	return (
		<div style={{display: 'flex', flexDirection: 'column'}}>
			<div style={{height: 44, display: 'flex', alignItems: 'center', gap: 20, fontSize: size * 0.8, color: '#5B626C', padding: '0 18px', borderBottom: `1px solid ${C.line}`}}>
				<span style={{width: 80}}>input</span>
				<span style={{flex: 1}}>cart</span>
				<span style={{width: 170, textAlign: 'right'}}>original</span>
				<span style={{width: 40}} />
				<span style={{width: 170, textAlign: 'right'}}>rewrite</span>
				<span style={{width: 50}} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: rows * rowH, overflow: 'hidden'}}>{items}</div>
		</div>
	);
};

export const Stat: React.FC<{k: string; v: string; color?: string; size?: number; t?: number}> = ({k, v, color = C.text, size = 92, t = 1}) => (
	<div style={{display: 'flex', flexDirection: 'column', gap: 10, opacity: t, transform: `translateY(${(1 - t) * 24}px)`}}>
		<div style={{fontFamily: F.type, fontWeight: 800, fontStretch: '80%', fontSize: size, lineHeight: 1, color, letterSpacing: '-0.01em'}}>{v}</div>
		<div style={{fontFamily: F.mono, fontSize: 22, color: C.sub}}>{k}</div>
	</div>
);
