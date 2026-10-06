import React from 'react';
import {BILL_TO, fmt, Invoice} from './data';
import {COND, DISPLAY, MONO, SANS, SELECT, SERIF} from './tokens';

export const PAGE_W = 600;
export const PAGE_H = 776;

export type Field = 'vendor' | 'no' | 'date' | 'amount';
export const FIELDS: Field[] = ['vendor', 'no', 'date', 'amount'];
type R = {x: number; y: number; w: number; h: number};

const fam = (f: Invoice['v']['font']) => (f === 'serif' ? SERIF : f === 'display' ? DISPLAY : f === 'cond' ? COND : SANS);

/** where each copyable value sits on the page, per layout (page px). The text is drawn inside these boxes. */
export const fieldRect = (inv: Invoice, f: Field): R => {
	const L = inv.v.layout;
	const vw = Math.min(330, 14 + inv.v.name.length * (L === 2 ? 15.5 : L === 3 ? 13 : 12.4));
	if (L === 0) {
		return {vendor: {x: 98, y: 52, w: vw, h: 30}, no: {x: 438, y: 112, w: 110, h: 20}, date: {x: 438, y: 138, w: 110, h: 20}, amount: {x: 396, y: 628, w: 152, h: 36}}[f];
	}
	if (L === 1) {
		return {vendor: {x: 48, y: 46, w: vw + 10, h: 34}, no: {x: 48, y: 172, w: 130, h: 22}, date: {x: 230, y: 172, w: 130, h: 22}, amount: {x: 352, y: 618, w: 200, h: 44}}[f];
	}
	if (L === 2) {
		return {vendor: {x: 300 - vw / 2, y: 50, w: vw, h: 40}, no: {x: 118, y: 196, w: 130, h: 20}, date: {x: 118, y: 222, w: 130, h: 20}, amount: {x: 382, y: 640, w: 170, h: 34}}[f];
	}
	return {vendor: {x: 330, y: 52, w: Math.min(230, vw), h: 26}, no: {x: 64, y: 166, w: 140, h: 22}, date: {x: 236, y: 166, w: 140, h: 22}, amount: {x: 356, y: 624, w: 196, h: 46}}[f];
};

let mctx: CanvasRenderingContext2D | null = null;
export const measure = (text: string, font: string) => {
	try {
		if (!mctx) mctx = document.createElement('canvas').getContext('2d');
		if (mctx) {
			mctx.font = font;
			return mctx.measureText(text).width;
		}
	} catch {
		// ignore
	}
	return text.length * 8;
};
/** font + alignment each layout uses for the four copyable values (must match the JSX below) */
const spec = (inv: Invoice, f: Field): {font: string; align: 'l' | 'r' | 'c'; pad?: number} => {
	const L = inv.v.layout;
	const F = fam(inv.v.font);
	if (f === 'vendor') {
		if (L === 0) return {font: `650 22px ${F}`, align: 'l'};
		if (L === 1) return {font: `700 25px ${F}`, align: 'l'};
		if (L === 2) return {font: `400 30px ${F}`, align: 'c'};
		return {font: `700 19px ${F}`, align: 'r'};
	}
	if (f === 'no') {
		if (L === 0) return {font: `600 13.5px ${MONO}`, align: 'r'};
		if (L === 1) return {font: `600 15px ${SANS}`, align: 'l'};
		if (L === 2) return {font: `600 13.5px ${MONO}`, align: 'l'};
		return {font: `700 16px ${COND}`, align: 'l'};
	}
	if (f === 'date') {
		if (L === 0) return {font: `600 13.5px ${SANS}`, align: 'r'};
		if (L === 1) return {font: `600 15px ${SANS}`, align: 'l'};
		if (L === 2) return {font: `600 13.5px ${SANS}`, align: 'l'};
		return {font: `700 16px ${COND}`, align: 'l'};
	}
	if (L === 0) return {font: `700 24px ${SANS}`, align: 'r'};
	if (L === 1) return {font: `750 25px ${SANS}`, align: 'r', pad: 16};
	if (L === 2) return {font: `400 27px ${F}`, align: 'r'};
	return {font: `800 30px ${COND}`, align: 'r', pad: 16};
};
const docText = (inv: Invoice, f: Field) => (f === 'vendor' ? inv.v.name : f === 'no' ? inv.no : f === 'date' ? inv.date : inv.amountStr);
/** tight box around the drawn text of a field (page px): selection highlight + cursor target */
export const textBox = (inv: Invoice, f: Field): R => {
	const r = fieldRect(inv, f);
	const sp = spec(inv, f);
	const w = Math.min(r.w, measure(docText(inv, f), sp.font) * (inv.v.layout === 3 && f === 'vendor' ? 0.9 : 1));
	const pad = sp.pad ?? 0;
	const x = sp.align === 'l' ? r.x : sp.align === 'r' ? r.x + r.w - pad - w : r.x + (r.w - w) / 2;
	return {x, y: r.y, w, h: r.h};
};

const abs = (r: R, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', ...extra});

/** selection highlight that sweeps left to right over a field (p 0..1), like a text drag-select */
const Sel: React.FC<{r: R; p: number; color?: string}> = ({r, p, color = SELECT}) =>
	p <= 0 ? null : <div style={{position: 'absolute', left: r.x - 3, top: r.y + r.h * 0.5 - Math.min(r.h, 34) * 0.5 - 1, width: (r.w + 6) * Math.min(1, p), height: Math.min(r.h, 34) + 2, background: color, borderRadius: 3}} />;

const Monogram: React.FC<{inv: Invoice; size: number; round?: boolean}> = ({inv, size, round}) => {
	const words = inv.v.short.replace('&', '').split(/\s+/).filter(Boolean);
	const mono = (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase();
	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: round ? size / 2 : size * 0.22,
				background: inv.v.accent,
				color: '#fff',
				fontFamily: fam(inv.v.font),
				fontWeight: 700,
				fontSize: size * 0.42,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				letterSpacing: '-0.02em',
			}}
		>
			{mono}
		</div>
	);
};

const Items: React.FC<{inv: Invoice; x: number; y: number; w: number; head: string; rule: string; font?: string}> = ({inv, x, y, w, head, rule, font = SANS}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: font}}>
		<div style={{display: 'flex', fontSize: 10.5, fontWeight: 600, color: head, letterSpacing: '0.06em', paddingBottom: 8, borderBottom: `1px solid ${rule}`}}>
			<div style={{flex: 1}}>DESCRIPTION</div>
			<div style={{width: 50, textAlign: 'right'}}>QTY</div>
			<div style={{width: 110, textAlign: 'right'}}>AMOUNT</div>
		</div>
		{inv.items.map((it, k) => (
			<div key={k} style={{display: 'flex', fontSize: 13, color: '#2B2B2E', padding: '11px 0', borderBottom: `1px solid ${rule}`}}>
				<div style={{flex: 1}}>{it.d}</div>
				<div style={{width: 50, textAlign: 'right', color: '#6B6B70'}}>{it.q}</div>
				<div style={{width: 110, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{fmt(it.amt)}</div>
			</div>
		))}
		<div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 14, fontSize: 12.5, color: '#55555A', gap: 20}}>
			<div>Subtotal</div>
			<div style={{width: 110, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{fmt(inv.sub)}</div>
		</div>
		<div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 6, fontSize: 12.5, color: '#55555A', gap: 20}}>
			<div>Tax 7.25%</div>
			<div style={{width: 110, textAlign: 'right', fontVariantNumeric: 'tabular-nums'}}>{fmt(inv.tax)}</div>
		</div>
	</div>
);

const Foot: React.FC<{inv: Invoice; color?: string}> = ({inv, color = '#8A8A8F'}) => (
	<div style={{position: 'absolute', left: 48, right: 48, bottom: 34, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 10.5, color}}>
		<div>Payment due {inv.due} · ACH or check</div>
		<div>Thank you for your business</div>
	</div>
);

const Label: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = '#8A8A8F'}) => (
	<div style={{fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color, marginBottom: 5}}>{children}</div>
);

const BillTo: React.FC<{x: number; y: number; color?: string}> = ({x, y, color}) => (
	<div style={{position: 'absolute', left: x, top: y, fontFamily: SANS}}>
		<Label color={color}>BILL TO</Label>
		{BILL_TO.map((l, k) => (
			<div key={k} style={{fontSize: 12.5, lineHeight: '18px', color: k === 0 ? '#1D1D1F' : '#55555A', fontWeight: k === 0 ? 600 : 400}}>
				{l}
			</div>
		))}
	</div>
);

/** One invoice page. `sel` maps a field to its selection progress (0..1). */
export const InvoicePage: React.FC<{inv: Invoice; sel?: Partial<Record<Field, number>>}> = ({inv, sel = {}}) => {
	const L = inv.v.layout;
	const a = inv.v.accent;
	const F = fam(inv.v.font);
	const r = (f: Field) => fieldRect(inv, f);
	const sels = (
		<>
			{(['vendor', 'no', 'date', 'amount'] as Field[]).map((f) => (
				<Sel key={f} r={textBox(inv, f)} p={sel[f] ?? 0} />
			))}
		</>
	);
	const page: React.CSSProperties = {position: 'relative', width: PAGE_W, height: PAGE_H, background: '#FFFFFF', overflow: 'hidden', fontFamily: SANS, color: '#1D1D1F'};

	if (L === 0) {
		return (
			<div style={page}>
				{sels}
				<div style={{position: 'absolute', left: 48, top: 48}}>
					<Monogram inv={inv} size={38} />
				</div>
				<div style={abs(r('vendor'), {fontFamily: F, fontSize: 22, fontWeight: 650, letterSpacing: '-0.02em'})}>{inv.v.name}</div>
				<div style={{position: 'absolute', left: 98, top: 84, fontSize: 11.5, color: '#7A7A80'}}>{inv.v.city}</div>
				<div style={{position: 'absolute', right: 48, top: 46, fontSize: 30, fontWeight: 300, letterSpacing: '0.18em', color: a}}>INVOICE</div>
				<div style={{position: 'absolute', left: 340, top: 112, fontSize: 12, color: '#8A8A8F', lineHeight: '26px'}}>
					<div>Invoice no.</div>
					<div>Date</div>
				</div>
				<div style={abs(r('no'), {justifyContent: 'flex-end', fontSize: 13.5, fontWeight: 600, fontFamily: MONO})}>{inv.no}</div>
				<div style={abs(r('date'), {justifyContent: 'flex-end', fontSize: 13.5, fontWeight: 600})}>{inv.date}</div>
				<BillTo x={48} y={196} />
				<div style={{position: 'absolute', left: 48, right: 48, top: 296, height: 2, background: a, opacity: 0.85}} />
				<Items inv={inv} x={48} y={318} w={504} head="#8A8A8F" rule="rgba(0,0,0,0.08)" />
				<div style={{position: 'absolute', left: 300, top: 620, width: 252, height: 52, borderTop: '1px solid rgba(0,0,0,0.85)'}} />
				<div style={{position: 'absolute', left: 300, top: 638, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: '#55555A'}}>TOTAL DUE</div>
				<div style={abs(r('amount'), {justifyContent: 'flex-end', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'})}>{inv.amountStr}</div>
				<Foot inv={inv} />
			</div>
		);
	}
	if (L === 1) {
		return (
			<div style={page}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 128, background: a}} />
				{sels}
				<div style={abs(r('vendor'), {fontFamily: F, fontSize: 25, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em'})}>{inv.v.name}</div>
				<div style={{position: 'absolute', left: 48, top: 86, fontSize: 11.5, color: 'rgba(255,255,255,0.75)'}}>{inv.v.city} · billing@{inv.v.short.toLowerCase().replace(/[^a-z]/g, '')}.com</div>
				<div style={{position: 'absolute', right: 48, top: 52, fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.9)'}}>INVOICE</div>
				<div style={{position: 'absolute', left: 48, top: 152}}>
					<Label>INVOICE NO.</Label>
				</div>
				<div style={{position: 'absolute', left: 230, top: 152}}>
					<Label>ISSUED</Label>
				</div>
				<div style={{position: 'absolute', left: 412, top: 152}}>
					<Label>TERMS</Label>
				</div>
				<div style={abs(r('no'), {fontSize: 15, fontWeight: 600})}>{inv.no}</div>
				<div style={abs(r('date'), {fontSize: 15, fontWeight: 600})}>{inv.date}</div>
				<div style={{position: 'absolute', left: 412, top: 172, height: 22, display: 'flex', alignItems: 'center', fontSize: 15, fontWeight: 600}}>{inv.due}</div>
				<BillTo x={48} y={222} />
				<Items inv={inv} x={48} y={330} w={504} head="#8A8A8F" rule="rgba(0,0,0,0.08)" />
				<div style={{position: 'absolute', left: 300, top: 606, width: 252, height: 68, borderRadius: 12, background: '#F4F5F7'}} />
				<div style={{position: 'absolute', left: 318, top: 630, fontSize: 11.5, fontWeight: 600, color: '#6B6B70'}}>Amount due</div>
				<div style={abs(r('amount'), {justifyContent: 'flex-end', paddingRight: 16, boxSizing: 'border-box', fontSize: 25, fontWeight: 750, letterSpacing: '-0.02em', color: a, fontVariantNumeric: 'tabular-nums'})}>
					{inv.amountStr}
				</div>
				<Foot inv={inv} />
			</div>
		);
	}
	if (L === 2) {
		return (
			<div style={{...page, background: '#FFFDF9'}}>
				{sels}
				<div style={abs(r('vendor'), {justifyContent: 'center', fontFamily: F, fontSize: 30, color: '#1D1D1F', letterSpacing: '-0.01em'})}>{inv.v.name}</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', fontSize: 11, letterSpacing: '0.22em', color: '#8A8A8F'}}>{inv.v.city.toUpperCase()}</div>
				<div style={{position: 'absolute', left: 48, right: 48, top: 128, height: 1, background: a, opacity: 0.6}} />
				<div style={{position: 'absolute', left: 48, top: 148, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 34, color: a}}>Invoice</div>
				<div style={{position: 'absolute', left: 48, top: 196, fontSize: 11.5, color: '#8A8A8F', lineHeight: '26px'}}>
					<div>Number</div>
					<div>Issued</div>
				</div>
				<div style={abs(r('no'), {fontSize: 13.5, fontWeight: 600, fontFamily: MONO})}>{inv.no}</div>
				<div style={abs(r('date'), {fontSize: 13.5, fontWeight: 600})}>{inv.date}</div>
				<div style={{position: 'absolute', right: 48, top: 196, textAlign: 'right', fontSize: 12.5, lineHeight: '18px', color: '#55555A'}}>
					<Label>BILLED TO</Label>
					{BILL_TO.map((l, k) => (
						<div key={k} style={{color: k === 0 ? '#1D1D1F' : '#55555A', fontWeight: k === 0 ? 600 : 400}}>
							{l}
						</div>
					))}
				</div>
				<Items inv={inv} x={48} y={330} w={504} head="#9A8F84" rule="rgba(80,50,20,0.1)" />
				<div style={{position: 'absolute', left: 300, top: 628, width: 252, borderTop: `3px double ${a}`}} />
				<div style={{position: 'absolute', left: 300, top: 648, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 20, color: '#55555A'}}>Total</div>
				<div style={abs(r('amount'), {justifyContent: 'flex-end', fontFamily: F, fontSize: 27, color: '#1D1D1F', fontVariantNumeric: 'tabular-nums'})}>{inv.amountStr}</div>
				<Foot inv={inv} />
			</div>
		);
	}
	return (
		<div style={page}>
			<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: a}} />
			{sels}
			<div style={{position: 'absolute', left: 64, top: 40, fontFamily: COND, fontStretch: '75%', fontSize: 64, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1, color: '#16161A'}}>INVOICE</div>
			<div style={abs(r('vendor'), {justifyContent: 'flex-end', fontFamily: F, fontStretch: '88%', fontSize: 19, fontWeight: 700, color: a})}>{inv.v.name}</div>
			<div style={{position: 'absolute', right: 48, top: 82, textAlign: 'right', fontSize: 11.5, color: '#7A7A80', lineHeight: '16px'}}>
				<div>{inv.v.city}</div>
				<div>accounts@{inv.v.short.toLowerCase().replace(/[^a-z]/g, '')}.co</div>
			</div>
			<div style={{position: 'absolute', left: 64, top: 146}}>
				<Label>INVOICE #</Label>
			</div>
			<div style={{position: 'absolute', left: 236, top: 146}}>
				<Label>DATE</Label>
			</div>
			<div style={{position: 'absolute', left: 408, top: 146}}>
				<Label>DUE</Label>
			</div>
			<div style={abs(r('no'), {fontSize: 16, fontWeight: 700, fontFamily: COND})}>{inv.no}</div>
			<div style={abs(r('date'), {fontSize: 16, fontWeight: 700, fontFamily: COND})}>{inv.date}</div>
			<div style={{position: 'absolute', left: 408, top: 166, height: 22, display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 700, fontFamily: COND}}>{inv.due}</div>
			<BillTo x={64} y={214} />
			<Items inv={inv} x={64} y={330} w={488} head="#8A8A8F" rule="rgba(0,0,0,0.09)" />
			<div style={{position: 'absolute', left: 300, top: 614, width: 252, height: 66, background: a}} />
			<div style={{position: 'absolute', left: 316, top: 638, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)'}}>TOTAL</div>
			<div style={abs(r('amount'), {justifyContent: 'flex-end', paddingRight: 16, boxSizing: 'border-box', fontFamily: COND, fontSize: 30, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums'})}>{inv.amountStr}</div>
			<Foot inv={inv} />
		</div>
	);
};

/** the value that gets copied into the sheet for a field */
export const valueOf = (inv: Invoice, f: Field) => (f === 'vendor' ? inv.v.name : f === 'no' ? inv.no : f === 'date' ? inv.cell : inv.amountStr);
