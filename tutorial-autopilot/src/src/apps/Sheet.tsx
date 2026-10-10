import React from 'react';
import {F, E, clamp, kf, prog, rand, spr} from '../lib/theme';

/** A Google-Sheets-style spreadsheet (light), with the pivot-table flow a beginner tutorial teaches. */
const G = {
	bg: '#FFFFFF',
	chrome: '#F9FBFD',
	head: '#F8F9FA',
	grid: '#E1E3E6',
	text: '#1F1F1F',
	dim: '#5F6368',
	blue: '#0B57D0',
	blueFill: 'rgba(11,87,208,0.09)',
	green: '#188038',
	chip: '#E8F0FE',
};

const REG = ['West', 'East', 'North', 'South', 'Central'];
const REP = ['A. Okafor', 'M. Lindqvist', 'J. Park', 'S. Reyes', 'T. Nguyen', 'L. Moreau', 'D. Haddad', 'K. Sato'];
const PROD = ['Trail 2', 'Pace Pro', 'Glide', 'Summit'];
export const ROWS = Array.from({length: 40}).map((_, i) => {
	const r = (k: number) => rand(i * 13 + k);
	const units = 4 + Math.floor(r(3) * 60);
	const price = [129, 189, 99, 249][Math.floor(r(4) * 4)];
	const d = 1 + Math.floor(i * 0.7);
	return [`2026-07-${String(Math.min(28, d)).padStart(2, '0')}`, REG[Math.floor(r(1) * 5)], REP[Math.floor(r(2) * 8)], PROD[Math.floor(r(4) * 4)], String(units), (units * price).toLocaleString('en-US')];
});
const HEAD = ['Date', 'Region', 'Rep', 'Product', 'Units', 'Revenue'];
const CW = [150, 120, 160, 130, 90, 130];

// pivot results (sum of revenue by region x product), computed from a larger fake table
export const PIVOT = REG.map((rg, ri) => PROD.map((_, pi) => Math.round(18000 + rand(ri * 7 + pi * 3 + 1) * 64000)));

export type SheetT = {
	select?: number; // range selection sweep
	menu?: number; // Insert menu opens
	create?: number; // pivot sheet + editor appear
	rows?: number; // Region dropped into Rows
	values?: number; // Revenue into Values
	cols?: number; // Product into Columns
	format?: number; // currency format
	drag?: {from: [number, number]; to: [number, number]; t0: number; t1: number}; // a chip drag (screen coords)
};

const Cell: React.FC<{w: number; h: number; children?: React.ReactNode; align?: 'left' | 'right' | 'center'; bold?: boolean; bg?: string; color?: string}> = ({w, h, children, align = 'left', bold, bg, color = G.text}) => (
	<div style={{width: w, height: h, boxSizing: 'border-box', borderRight: `1px solid ${G.grid}`, borderBottom: `1px solid ${G.grid}`, padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start', fontSize: 15, fontWeight: bold ? 700 : 400, background: bg, color, whiteSpace: 'nowrap', overflow: 'hidden', fontVariantNumeric: 'tabular-nums'}}>
		{children}
	</div>
);

export const SheetApp: React.FC<{t: number; k: SheetT; file?: string}> = ({t, k, file = 'Q3 orders'}) => {
	const after = (x?: number) => x !== undefined && t >= x;
	const onPivot = after(k.create);
	const rowH = 30;
	const top = 196;
	const colL = 52;
	const sel = k.select !== undefined ? prog(t, k.select, k.select + 0.3, E.out) : 0;
	const menu = k.menu !== undefined && t >= k.menu && !(k.create !== undefined && t >= k.create);
	const fmt = after(k.format);
	const money = (n: number) => (fmt ? '$' + n.toLocaleString('en-US') : n.toLocaleString('en-US'));
	const pRows = k.rows !== undefined ? prog(t, k.rows, k.rows + 0.35) : 0;
	const pVals = k.values !== undefined ? prog(t, k.values, k.values + 0.35) : 0;
	const pCols = k.cols !== undefined ? prog(t, k.cols, k.cols + 0.35) : 0;
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: G.bg, fontFamily: F.inter, color: G.text, overflow: 'hidden'}}>
			{/* title + menus */}
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 108, background: G.chrome}}>
				<div style={{position: 'absolute', left: 20, top: 16, width: 34, height: 46, borderRadius: 4, background: G.green}}>
					<div style={{position: 'absolute', left: 7, top: 14, width: 20, height: 20, border: '2.5px solid #fff', borderRadius: 2}} />
				</div>
				<div style={{position: 'absolute', left: 70, top: 12, fontSize: 21, color: G.text}}>{file}</div>
				<div style={{position: 'absolute', left: 70, top: 44, display: 'flex', gap: 20, fontSize: 15.5, color: G.text}}>
					{['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Tools', 'Extensions', 'Help'].map((m) => (
						<div key={m} style={{padding: '2px 6px', borderRadius: 4, background: m === 'Insert' && menu ? '#E3E8EF' : 'transparent'}}>
							{m}
						</div>
					))}
				</div>
				<div style={{position: 'absolute', right: 24, top: 18, width: 118, height: 40, borderRadius: 20, background: '#C2E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15.5, fontWeight: 600}}>Share</div>
				<div style={{position: 'absolute', left: 14, top: 76, right: 14, height: 40, borderRadius: 22, background: '#EDF2FA', display: 'flex', alignItems: 'center', gap: 22, paddingLeft: 20, fontSize: 15, color: G.dim}}>
					{['↶', '↷', '⎙', '100%', '$', '%', '.0', '.00', '123', 'Default', '10', 'B', 'I', 'S', 'A'].map((x, i) => (
						<span key={i} style={{fontWeight: x === 'B' ? 700 : 400, fontStyle: x === 'I' ? 'italic' : 'normal', color: x === '$' && fmt && t - (k.format ?? 0) < 0.5 ? G.blue : G.dim}}>
							{x}
						</span>
					))}
				</div>
			</div>
			{/* formula bar */}
			<div style={{position: 'absolute', left: 0, top: 124, width: 1920, height: 36, borderTop: `1px solid ${G.grid}`, borderBottom: `1px solid ${G.grid}`, display: 'flex', alignItems: 'center', fontSize: 15}}>
				<div style={{width: 90, paddingLeft: 14, color: G.dim}}>{onPivot ? 'A1' : 'A1:F501'}</div>
				<div style={{color: G.dim, padding: '0 12px', borderLeft: `1px solid ${G.grid}`}}>fx</div>
				<div>{onPivot ? (pRows ? 'Region' : '') : 'Date'}</div>
			</div>
			{/* column headers */}
			<div style={{position: 'absolute', left: 0, top: 162, height: 30, display: 'flex', background: G.head, fontSize: 13.5, color: G.dim}}>
				<div style={{width: colL, borderRight: `1px solid ${G.grid}`, borderBottom: `1px solid ${G.grid}`}} />
				{'ABCDEFGHIJ'.split('').map((c, i) => (
					<div key={c} style={{width: onPivot ? [170, 140, 140, 140, 140, 150, 120, 120, 120, 120][i] : [...CW, 120, 120, 120, 120][i], borderRight: `1px solid ${G.grid}`, borderBottom: `1px solid ${G.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: !onPivot && sel > 0 && i < 6 ? '#D3E3FD' : G.head}}>
						{c}
					</div>
				))}
			</div>
			{/* grid */}
			<div style={{position: 'absolute', left: 0, top: 192}}>
				{Array.from({length: 26}).map((_, r) => (
					<div key={r} style={{display: 'flex'}}>
						<div style={{width: colL, height: rowH, boxSizing: 'border-box', background: !onPivot && sel > 0 ? '#D3E3FD' : G.head, borderRight: `1px solid ${G.grid}`, borderBottom: `1px solid ${G.grid}`, fontSize: 13, color: G.dim, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{r + 1}</div>
						{!onPivot
							? CW.map((w, c) => {
									const v = r === 0 ? HEAD[c] : ROWS[r - 1][c];
									const inSel = sel > 0 && (r * 6 + c) / 156 <= sel * 1.05;
									return (
										<Cell key={c} w={w} h={rowH} align={c >= 4 && r > 0 ? 'right' : 'left'} bold={r === 0} bg={inSel ? G.blueFill : r === 0 ? '#F1F3F4' : undefined}>
											{v}
										</Cell>
									);
								})
							: [170, 140, 140, 140, 140, 150].map((w, c) => {
									// pivot table: header row 0, regions rows 1..5, total row 6
									let v: React.ReactNode = '';
									let bold = false;
									let bg: string | undefined;
									const colsOn = pCols > 0.5;
									if (r === 0) {
										bold = true;
										bg = pRows > 0 ? '#E8EAED' : undefined;
										if (c === 0 && pRows > 0) v = pVals > 0.5 ? 'Region' : 'Region';
										if (c >= 1 && pVals > 0.5) v = colsOn ? (c <= 4 ? PROD[c - 1] : 'Grand Total') : c === 1 ? 'SUM of Revenue' : '';
									} else if (r >= 1 && r <= 5 && pRows > 0) {
										if (c === 0) v = REG[r - 1];
										if (pVals > 0.5) {
											const row = PIVOT[r - 1];
											if (colsOn) v = c >= 1 && c <= 4 ? money(row[c - 1]) : c === 5 ? money(row.reduce((a, b) => a + b, 0)) : v;
											else if (c === 1) v = money(row.reduce((a, b) => a + b, 0));
										}
										const appear = prog(t, (k.rows ?? 0) + r * 0.03, (k.rows ?? 0) + r * 0.03 + 0.2);
										if (appear < 1 && c === 0) bg = `rgba(11,87,208,${0.12 * (1 - appear)})`;
									} else if (r === 6 && pRows > 0) {
										bold = true;
										bg = '#E8EAED';
										if (c === 0) v = 'Grand Total';
										if (pVals > 0.5) {
											const tot = (j: number) => PIVOT.reduce((a, row) => a + row[j], 0);
											if (colsOn) v = c >= 1 && c <= 4 ? money(tot(c - 1)) : c === 5 ? money(PIVOT.flat().reduce((a, b) => a + b, 0)) : v;
											else if (c === 1) v = money(PIVOT.flat().reduce((a, b) => a + b, 0));
										}
									}
									return (
										<Cell key={c} w={w} h={rowH} align={c >= 1 ? 'right' : 'left'} bold={bold} bg={bg}>
											{v}
										</Cell>
									);
								})}
					</div>
				))}
			</div>
			{/* sheet tabs */}
			<div style={{position: 'absolute', left: 0, bottom: 0, width: 1920, height: 44, background: G.chrome, borderTop: `1px solid ${G.grid}`, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 80, fontSize: 15}}>
				{['Orders', ...(onPivot ? ['Pivot Table 1'] : [])].map((s) => {
					const on = (s === 'Orders') !== onPivot;
					return (
						<div key={s} style={{padding: '8px 18px', borderRadius: 6, background: on ? '#E1E9F7' : 'transparent', color: on ? G.blue : G.dim, fontWeight: on ? 600 : 400}}>
							{s}
						</div>
					);
				})}
			</div>
			{/* Insert menu */}
			{menu ? (
				<div style={{position: 'absolute', left: 296, top: 72, width: 290, borderRadius: 8, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)', padding: '8px 0', fontSize: 15.5, transform: `scaleY(${spr(t, k.menu!, 30, 0.8)})`, transformOrigin: '0 0'}}>
					{['Cells', 'Rows', 'Columns', 'Sheet', '—', 'Table', 'Chart', 'Pivot table', 'Image', 'Drawing', '—', 'Function', 'Link', 'Checkbox'].map((m, i) =>
						m === '—' ? (
							<div key={i} style={{height: 1, background: G.grid, margin: '6px 0'}} />
						) : (
							<div key={i} style={{padding: '7px 22px', background: m === 'Pivot table' && t - k.menu! > 0.22 ? '#E8EAED' : 'transparent'}}>
								{m}
							</div>
						),
					)}
				</div>
			) : null}
			{/* pivot editor */}
			{onPivot ? (
				<div style={{position: 'absolute', right: 0, top: 162, width: 420, bottom: 44, background: '#fff', borderLeft: `1px solid ${G.grid}`, boxShadow: '-2px 0 8px rgba(0,0,0,0.04)', transform: `translateX(${(1 - prog(t, k.create!, k.create! + 0.35)) * 420}px)`, fontSize: 15.5}}>
					<div style={{padding: '18px 22px', fontSize: 18, fontWeight: 500, borderBottom: `1px solid ${G.grid}`}}>Pivot table editor</div>
					<div style={{padding: '14px 22px', color: G.dim, fontSize: 14}}>Range</div>
					<div style={{margin: '0 22px', padding: '8px 12px', border: `1px solid ${G.grid}`, borderRadius: 4, fontSize: 14.5}}>Orders!A1:F501</div>
					{[
						{h: 'Rows', p: pRows, chip: 'Region'},
						{h: 'Columns', p: pCols, chip: 'Product'},
						{h: 'Values', p: pVals, chip: 'SUM of Revenue'},
						{h: 'Filters', p: 0, chip: ''},
					].map((s) => (
						<div key={s.h} style={{padding: '16px 22px 4px'}}>
							<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
								<div style={{fontWeight: 600}}>{s.h}</div>
								<div style={{padding: '5px 14px', borderRadius: 4, border: `1px solid ${G.grid}`, color: G.blue, fontSize: 14}}>Add</div>
							</div>
							{s.p > 0 ? (
								<div style={{marginTop: 10, padding: '10px 14px', borderRadius: 6, background: '#F1F3F4', fontSize: 15, opacity: s.p, transform: `translateY(${(1 - s.p) * -8}px)`}}>
									{s.chip}
									<div style={{fontSize: 13, color: G.dim, marginTop: 4}}>{s.h === 'Values' ? 'Summarize by SUM' : 'Order Ascending · Sort by ' + s.chip}</div>
								</div>
							) : null}
						</div>
					))}
				</div>
			) : null}
			{/* dragged chip */}
			{k.drag && t >= k.drag.t0 && t < k.drag.t1 + 0.05 ? (
				(() => {
					const p = kf(t, [k.drag.t0, k.drag.t1], [0, 1], E.inOut);
					const x = k.drag.from[0] + (k.drag.to[0] - k.drag.from[0]) * p;
					const y = k.drag.from[1] + (k.drag.to[1] - k.drag.from[1]) * p;
					return <div style={{position: 'absolute', left: x - 60, top: y - 18, padding: '8px 16px', borderRadius: 6, background: G.chip, color: G.blue, fontSize: 15, fontWeight: 600, boxShadow: '0 6px 16px rgba(0,0,0,0.18)', transform: `rotate(${-2 * Math.sin(p * Math.PI)}deg)`}}>Region</div>;
				})()
			) : null}
			<div style={{position: 'absolute', left: colL + 0, top: top, width: 0, height: 0, opacity: clamp(0)}} />
		</div>
	);
};
