import React from 'react';
import {INVOICES} from './data';
import {InvoicePage, PAGE_H, PAGE_W, valueOf} from './Invoice';
import {glass, Icon, Traffic, windowShadow} from './Mac';
import {CHECK_LAG, colX, FILL_T, FL, isFlag, FLAGGED, Layout, pastedAt, PV, Rect, rowY, SH, T, thumbRect} from './timeline';
import {AMBER, BLUE, clamp01, easeInOut, easeOut, GREEN, lerp, SANS, step} from './tokens';

// ------------------------------------------------------------------ Files (file browser) window
const SideRow: React.FC<{icon: React.ReactNode; label: string; on?: boolean}> = ({icon, label, on}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 10, height: 30, padding: '0 10px', borderRadius: 8, background: on ? 'rgba(0,0,0,0.08)' : 'transparent', fontSize: 13.5, fontWeight: on ? 600 : 500, color: '#1D1D1F'}}>
		{icon}
		{label}
	</div>
);

const Badge: React.FC<{p: number; flag?: boolean; size?: number}> = ({p, flag, size = 22}) =>
	p <= 0 ? null : (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				background: flag ? AMBER : GREEN,
				boxShadow: '0 0 0 2px #fff, 0 2px 6px rgba(0,0,0,0.25)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				transform: `scale(${0.4 + 0.6 * p})`,
				opacity: clamp01(p * 2),
			}}
		>
			{flag ? (
				<div style={{fontFamily: SANS, fontWeight: 800, fontSize: size * 0.62, color: '#fff', lineHeight: 1, marginTop: -1}}>!</div>
			) : (
				<svg width={size * 0.6} height={size * 0.6} viewBox="0 0 12 12">
					<path d="M2.6 6.3 5 8.6l4.5-5" stroke="#fff" strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			)}
		</div>
	);

export const FilesWindow: React.FC<{Lo: Layout; t: number; scroll: number; selected: number; front: boolean}> = ({Lo, t, scroll, selected, front}) => {
	const W = Lo.files;
	const gridTop = W.y + FL.top;
	const gridBottom = W.y + W.h - 34;
	const cascading = t >= T.cascade;
	const thumbs: React.ReactNode[] = [];
	for (let i = 0; i < 200; i++) {
		const r = thumbRect(Lo, i, scroll);
		if (r.y + r.h + 40 < gridTop || r.y > gridBottom) continue;
		const inv = INVOICES[i];
		const done = cascading && i >= 2 ? step(t, FILL_T[i] + CHECK_LAG, 0.3) : 0;
		const working = cascading && i >= 2 ? clamp01(1 - Math.abs(t - FILL_T[i]) / 0.18) : 0;
		const sel = i === selected;
		const k = FL.thumbW / PAGE_W;
		thumbs.push(
			<div key={i} style={{position: 'absolute', left: r.x - W.x, top: r.y - W.y, width: r.w, height: r.h}}>
				{sel ? <div style={{position: 'absolute', left: -12, top: -10, right: -12, bottom: -10, borderRadius: 9, background: 'rgba(0,0,0,0.09)'}} /> : null}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'hidden',
						borderRadius: 2,
						boxShadow: `0 0 0 1px rgba(0,0,0,0.12), 0 2px 5px rgba(0,0,0,0.12)${working > 0 ? `, 0 0 0 ${4 * working}px rgba(47,107,255,${0.55 * working})` : ''}`,
						background: '#fff',
					}}
				>
					<div style={{transform: `scale(${k})`, transformOrigin: '0 0', width: PAGE_W, height: PAGE_H}}>
						<InvoicePage inv={inv} />
					</div>
				</div>
				<div style={{position: 'absolute', right: -9, bottom: -8}}>
					<Badge p={done} flag={isFlag(i)} />
				</div>
				<div style={{position: 'absolute', left: (r.w - (r.cw - 10)) / 2, width: r.cw - 10, top: r.h + 10, display: 'flex', justifyContent: 'center'}}>
					<div
						style={{
							maxWidth: r.cw - 10,
							padding: '1px 6px',
							borderRadius: 5,
							background: sel ? BLUE : 'transparent',
							color: sel ? '#fff' : '#1D1D1F',
							fontFamily: SANS,
							fontSize: 11.5,
							fontWeight: 500,
							lineHeight: '15px',
							textAlign: 'center',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							wordBreak: 'break-word',
						}}
					>
						{inv.file}
					</div>
				</div>
			</div>,
		);
	}
	return (
		<div style={{position: 'absolute', left: W.x, top: W.y, width: W.w, height: W.h, borderRadius: 24, overflow: 'hidden', background: '#FFFFFF', boxShadow: windowShadow(front), fontFamily: SANS}}>
			<div style={{position: 'absolute', left: 0, top: FL.top - 6, right: 0, bottom: 34, overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 0, top: -(FL.top - 6), width: W.w, height: W.h}}>{thumbs}</div>
			</div>
			{/* sidebar */}
			<div style={{position: 'absolute', left: 10, top: 10, bottom: 10, width: FL.side - 26, borderRadius: 16, ...glass(0.9), padding: '18px 10px', boxSizing: 'border-box'}}>
				<div style={{padding: '0 8px'}}>
					<Traffic dim={!front} />
				</div>
				<div style={{marginTop: 26, padding: '0 10px', fontSize: 11.5, fontWeight: 600, color: '#8E8E93'}}>Favorites</div>
				<div style={{marginTop: 6, display: 'flex', flexDirection: 'column', gap: 1}}>
					<SideRow icon={Icon.clock()} label="Recents" />
					<SideRow icon={Icon.desktop()} label="Desktop" />
					<SideRow icon={Icon.doc()} label="Documents" />
					<SideRow icon={Icon.down()} label="Downloads" />
					<SideRow icon={Icon.folder()} label="Invoices" on />
				</div>
				<div style={{marginTop: 22, padding: '0 10px', fontSize: 11.5, fontWeight: 600, color: '#8E8E93'}}>Locations</div>
				<div style={{marginTop: 6, display: 'flex', flexDirection: 'column', gap: 1}}>
					<SideRow icon={Icon.cloud()} label="iCloud Drive" />
					<SideRow icon={Icon.laptop()} label="MacBook Pro" />
				</div>
				<div style={{marginTop: 22, padding: '0 10px', fontSize: 11.5, fontWeight: 600, color: '#8E8E93'}}>Tags</div>
				<div style={{marginTop: 6, display: 'flex', flexDirection: 'column', gap: 1}}>
					<SideRow icon={Icon.tag('#FF9F0A')} label="To pay" />
					<SideRow icon={Icon.tag('#30D158')} label="Paid" />
				</div>
			</div>
			{/* toolbar */}
			<div style={{position: 'absolute', left: FL.side, right: 0, top: 0, height: FL.top - 6, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', background: 'rgba(255,255,255,0.92)', borderBottom: '1px solid rgba(0,0,0,0.06)'}}>
				<div style={{display: 'flex', gap: 6}}>
					{Icon.chevL()}
					{Icon.chevR()}
				</div>
				<div style={{fontSize: 15, fontWeight: 650, color: '#1D1D1F'}}>Invoices — October</div>
				<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 10px', borderRadius: 15, ...glass(0.9)}}>
					{Icon.grid()}
					<div style={{width: 1, height: 14, background: 'rgba(0,0,0,0.12)', margin: '0 4px'}} />
					{Icon.list()}
				</div>
				<div style={{width: 30, height: 30, borderRadius: 15, ...glass(0.9), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{Icon.search()}</div>
			</div>
			{/* status bar */}
			<div style={{position: 'absolute', left: FL.side, right: 0, bottom: 0, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#8E8E93', background: 'rgba(250,250,251,0.96)', borderTop: '1px solid rgba(0,0,0,0.06)'}}>
				200 items, 1.21 TB available
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ Sheet (spreadsheet) window
const HEAD = ['Vendor', 'Invoice #', 'Date', 'Amount'];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export type SheetState = {
	t: number;
	scroll: number;
	active?: {r: number; c: number};
	ghost: number; // 0..1 ghost preview of row 4
	front: boolean;
};

const CellText: React.FC<{c: number; text: string; style?: React.CSSProperties}> = ({c, text, style}) => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: c === 3 ? 'flex-end' : 'flex-start',
			padding: '0 12px',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			fontVariantNumeric: 'tabular-nums',
			...style,
		}}
	>
		{text}
	</div>
);

export const SheetWindow: React.FC<{Lo: Layout; s: SheetState}> = ({Lo, s}) => {
	const W = Lo.sheet;
	const {t, scroll} = s;
	const cols = Lo.sheetCols;
	const x0 = (c: number) => colX(Lo, c) - W.x; // window-relative left of column c (0 = A, -1 = row header)
	const gridTop = SH.top;
	const gridH = W.h - SH.top - SH.bottom;
	const first = Math.max(1, Math.floor(scroll / SH.row) + 1);
	const last = Math.min(201 + 30, first + Math.ceil(gridH / SH.row) + 1);
	const rows: React.ReactNode[] = [];
	const cascading = t >= T.cascade;
	for (let r = first; r <= last; r++) {
		const y = rowY(Lo, r, scroll) - W.y;
		const i = r - 2;
		const cells: React.ReactNode[] = [];
		let rowBg = 'transparent';
		let band = 0;
		let checkP = 0;
		let flag = false;
		if (r === 1) {
			HEAD.forEach((h, c) =>
				cells.push(
					<div key={c} style={{position: 'absolute', left: x0(c), top: 0, width: cols[c + 1], height: SH.row}}>
						<CellText c={c} text={h} style={{fontWeight: 650, color: '#1D1D1F'}} />
					</div>,
				),
			);
			rowBg = '#F6F7F9';
		} else if (i >= 0 && i < 200) {
			const inv = INVOICES[i];
			if (i < 2) {
				for (let c = 0; c < 4; c++) {
					const p = pastedAt(Lo, r, c, t);
					if (!p) continue;
					const flash = 1 - clamp01((t - p.t) / 0.45);
					cells.push(
						<div key={c} style={{position: 'absolute', left: x0(c), top: 0, width: cols[c + 1], height: SH.row, background: `rgba(47,107,255,${0.16 * flash})`}}>
							<CellText c={c} text={valueOf(inv, p.f)} style={{color: '#1D1D1F', opacity: step(t, p.t, 0.08)}} />
						</div>,
					);
				}
			} else if (cascading && t >= FILL_T[i]) {
				const a = step(t, FILL_T[i], 0.14);
				band = clamp01(1 - (t - FILL_T[i]) / 0.35);
				checkP = step(t, FILL_T[i] + CHECK_LAG, 0.3);
				flag = isFlag(i) && checkP > 0;
				const vals = [inv.v.name, inv.no, inv.cell, inv.amountStr];
				vals.forEach((v, c) =>
					cells.push(
						<div key={c} style={{position: 'absolute', left: x0(c), top: 0, width: cols[c + 1], height: SH.row}}>
							<CellText c={c} text={v} style={{color: '#1D1D1F', opacity: a, transform: `translateY(${(1 - a) * 4}px)`}} />
						</div>,
					),
				);
			} else if (r === 4 && s.ghost > 0) {
				const vals = [inv.v.name, inv.no, inv.cell, inv.amountStr];
				vals.forEach((v, c) =>
					cells.push(
						<div key={c} style={{position: 'absolute', left: x0(c), top: 0, width: cols[c + 1], height: SH.row}}>
							<CellText c={c} text={v} style={{color: '#3B5BDB', opacity: 0.42 * s.ghost, filter: `blur(${(1 - s.ghost) * 2}px)`}} />
						</div>,
					),
				);
			}
		}
		const fl = flag ? clamp01((t - (FILL_T[i] + CHECK_LAG)) / 0.25) : 0;
		const why = flag ? FLAGGED.find((f) => f.i === i)!.why : '';
		rows.push(
			<div key={r} style={{position: 'absolute', left: 0, right: 0, top: y, height: SH.row}}>
				<div style={{position: 'absolute', left: x0(0), right: 0, top: 0, bottom: 0, background: rowBg}} />
				{band > 0 ? <div style={{position: 'absolute', left: x0(0), width: x0(4) - x0(0), top: 0, bottom: 0, background: `rgba(47,107,255,${0.13 * band})`}} /> : null}
				{fl > 0 ? <div style={{position: 'absolute', left: x0(0), width: x0(4) - x0(0), top: 0, bottom: 0, background: `rgba(242,163,58,${0.2 * fl})`, boxShadow: `inset 0 0 0 ${1.5 * fl}px rgba(230,140,30,0.75)`}} /> : null}
				{cells}
				{/* row number */}
				<div style={{position: 'absolute', left: 0, top: 0, width: cols[0], height: SH.row, background: '#F6F7F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#8E8E93', borderRight: '1px solid rgba(0,0,0,0.08)'}}>{r}</div>
				{/* the product's check mark, drawn beside the row (not in the sheet) */}
				{checkP > 0 ? (
					<div style={{position: 'absolute', left: x0(4) + 12, top: 0, height: SH.row, display: 'flex', alignItems: 'center', gap: 8}}>
						<Badge p={checkP} flag={flag} size={20} />
						{flag && Lo.chipStack ? (
							<div
								style={{
									padding: '5px 11px 6px',
									borderRadius: 11,
									background: '#1F1F23',
									whiteSpace: 'nowrap',
									opacity: fl,
									transform: `translateX(${(1 - fl) * -8}px)`,
									boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
									position: 'relative',
									zIndex: 2,
								}}
							>
								<div style={{fontSize: 10.5, fontWeight: 650, color: '#FFB547', lineHeight: '13px', letterSpacing: '0.01em'}}>Needs a look</div>
								<div style={{fontSize: 12.5, fontWeight: 600, color: '#FFE2B8', lineHeight: '16px'}}>{why}</div>
							</div>
						) : flag ? (
							<div
								style={{
									height: 24,
									padding: '0 10px',
									borderRadius: 12,
									background: '#1F1F23',
									color: '#FFD8A0',
									fontSize: 12.5,
									fontWeight: 600,
									display: 'flex',
									alignItems: 'center',
									whiteSpace: 'nowrap',
									opacity: fl,
									transform: `translateX(${(1 - fl) * -8}px)`,
									boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
								}}
							>
								Needs a look · {why}
							</div>
						) : null}
					</div>
				) : null}
			</div>,
		);
	}
	// grid lines (vertical)
	const vlines = [1, 2, 3, 4, 5, 6].map((c) => <div key={c} style={{position: 'absolute', left: x0(c) - 0.5, top: gridTop - 30, height: gridH + 30, width: 1, background: 'rgba(0,0,0,0.07)'}} />);
	const hlines: React.ReactNode[] = [];
	for (let r = first; r <= last + 1; r++) {
		const y = rowY(Lo, r, scroll) - W.y - SH.top;
		hlines.push(<div key={r} style={{position: 'absolute', left: 0, right: 0, top: y - 0.5, height: 1, background: r === 2 ? 'rgba(0,0,0,0.16)' : 'rgba(0,0,0,0.065)'}} />);
	}
	const act = s.active;
	let actBox: React.ReactNode = null;
	if (act) {
		const ax = x0(act.c);
		const ay = rowY(Lo, act.r, scroll) - W.y;
		actBox = (
			<div style={{position: 'absolute', left: ax - 1, top: ay - 1, width: cols[act.c + 1] + 1, height: SH.row + 1, boxShadow: `inset 0 0 0 2px ${BLUE}`, borderRadius: 2}}>
				<div style={{position: 'absolute', right: -4, bottom: -4, width: 7, height: 7, borderRadius: 1.5, background: BLUE, boxShadow: '0 0 0 1.5px #fff'}} />
			</div>
		);
	}
	const ref = act ? `${LETTERS[act.c]}${act.r}` : 'A1';
	let fval = '';
	if (act && act.r >= 2 && act.r <= 3) {
		const p = pastedAt(Lo, act.r, act.c, t);
		if (p) fval = valueOf(INVOICES[act.r - 2], p.f);
	}
	return (
		<div style={{position: 'absolute', left: W.x, top: W.y, width: W.w, height: W.h, borderRadius: 24, overflow: 'hidden', background: '#FFFFFF', boxShadow: windowShadow(s.front), fontFamily: SANS}}>
			{/* title + toolbar */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 56, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 16, background: '#FBFBFC', borderBottom: '1px solid rgba(0,0,0,0.07)'}}>
				<Traffic dim={!s.front} />
				<div style={{display: 'flex', alignItems: 'center', gap: 10, marginLeft: 6}}>
					<div style={{width: 22, height: 26, borderRadius: 5, background: 'linear-gradient(160deg, #3DC77A, #1E9E57)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)', position: 'relative'}}>
						{[0, 1, 2].map((k) => (
							<div key={k} style={{position: 'absolute', left: 5, right: 5, top: 7 + k * 5, height: 1.6, background: 'rgba(255,255,255,0.85)'}} />
						))}
					</div>
					<div>
						<div style={{fontSize: 14.5, fontWeight: 650, color: '#1D1D1F', lineHeight: '17px'}}>October Invoices</div>
						<div style={{fontSize: 11.5, color: '#8E8E93', lineHeight: '14px'}}>Accounts payable · Edited</div>
					</div>
				</div>
				<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, height: 32, padding: '0 6px', borderRadius: 16, ...glass(0.9)}}>
					{['B', 'I', 'U'].map((x) => (
						<div key={x} style={{width: 26, textAlign: 'center', fontSize: 14, fontWeight: x === 'B' ? 800 : 500, fontStyle: x === 'I' ? 'italic' : 'normal', textDecoration: x === 'U' ? 'underline' : 'none', color: '#3A3A3C'}}>
							{x}
						</div>
					))}
					<div style={{width: 1, height: 16, background: 'rgba(0,0,0,0.12)', margin: '0 4px'}} />
					<div style={{width: 26, textAlign: 'center', fontSize: 15, color: '#3A3A3C'}}>Σ</div>
					<div style={{width: 26, textAlign: 'center', fontSize: 13, color: '#3A3A3C', fontWeight: 600}}>$</div>
					<div style={{width: 26, textAlign: 'center', fontSize: 13, color: '#3A3A3C', fontWeight: 600}}>%</div>
				</div>
				<div style={{height: 32, padding: '0 14px', borderRadius: 16, background: '#1D1D1F', color: '#fff', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600}}>
					{Icon.share('#fff')}
					Share
				</div>
			</div>
			{/* formula bar */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 56, height: 38, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#fff'}}>
				<div style={{width: 54, height: 26, borderRadius: 6, background: '#F2F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 600, color: '#3A3A3C'}}>{ref}</div>
				<div style={{fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 18, color: '#8E8E93'}}>fx</div>
				<div style={{fontSize: 13.5, color: '#1D1D1F'}}>{fval}</div>
			</div>
			{/* column header */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 94, height: 30, background: '#F6F7F9', borderBottom: '1px solid rgba(0,0,0,0.09)'}}>
				{LETTERS.map((l, c) => (
					<div key={l} style={{position: 'absolute', left: x0(c), width: cols[c + 1], top: 0, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: act && act.c === c ? BLUE : '#8E8E93'}}>
						{l}
					</div>
				))}
			</div>
			{/* grid */}
			<div style={{position: 'absolute', left: 0, right: 0, top: gridTop, height: gridH, overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: -gridTop, height: W.h}}>
					{rows}
					{actBox}
				</div>
				{hlines}
				{vlines}
			</div>
			{/* footer: sheet tabs */}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: SH.bottom, display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', background: '#FBFBFC', borderTop: '1px solid rgba(0,0,0,0.07)', fontSize: 12.5}}>
				<div style={{fontSize: 18, color: '#8E8E93', width: 22, textAlign: 'center'}}>+</div>
				<div style={{height: 24, padding: '0 12px', borderRadius: 6, background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', fontWeight: 600, color: '#1D1D1F'}}>October</div>
				<div style={{height: 24, padding: '0 12px', display: 'flex', alignItems: 'center', color: '#8E8E93'}}>September</div>
				<div style={{height: 24, padding: '0 12px', display: 'flex', alignItems: 'center', color: '#8E8E93'}}>Vendors</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ Preview (Quick Look style) window
export const PreviewWindow: React.FC<{Lo: Layout; t: number; open: number; from: Rect; page: number; sel: Record<number, Partial<Record<'vendor' | 'no' | 'date' | 'amount', number>>>; flip: number}> = ({
	Lo,
	t,
	open,
	from,
	page,
	sel,
	flip,
}) => {
	if (open <= 0.001) return null;
	const P = Lo.prev;
	const x = lerp(from.x, P.x, open);
	const y = lerp(from.y, P.y, open);
	const w = lerp(from.w, P.w, open);
	const h = lerp(from.h, P.h, open);
	const k = w / P.w;
	const ky = h / P.h;
	const inv0 = INVOICES[page];
	const prevInv = page > 0 ? INVOICES[page - 1] : undefined;
	void t;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: P.w, height: P.h, transform: `scale(${k}, ${ky})`, transformOrigin: '0 0', opacity: clamp01(open * 3)}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', background: '#EDEDF0', boxShadow: windowShadow(true), fontFamily: SANS}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: PV.bar, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, background: 'rgba(250,250,251,0.96)', borderBottom: '1px solid rgba(0,0,0,0.07)', opacity: clamp01((open - 0.5) * 2)}}>
					<Traffic />
					<div style={{flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1D1D1F', whiteSpace: 'nowrap', overflow: 'hidden'}}>{inv0.file}</div>
					{Icon.share()}
					<div style={{height: 28, padding: '0 12px', borderRadius: 14, background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', fontSize: 12.5, fontWeight: 600, color: '#3A3A3C'}}>Open</div>
				</div>
				<div style={{position: 'absolute', left: PV.pad, top: PV.bar, width: PAGE_W, height: PAGE_H, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.12)'}}>
					{flip < 1 && prevInv ? (
						<div style={{position: 'absolute', inset: 0, transform: `translateX(${-easeInOut(flip) * 40}px)`, opacity: 1 - easeOut(flip)}}>
							<InvoicePage inv={prevInv} sel={sel[page - 1]} />
						</div>
					) : null}
					<div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - easeOut(flip)) * 40}px)`, opacity: prevInv ? easeOut(flip) : 1}}>
						<InvoicePage inv={inv0} sel={sel[page]} />
					</div>
				</div>
			</div>
		</div>
	);
};
