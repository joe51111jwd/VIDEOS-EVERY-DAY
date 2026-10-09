import React from 'react';
import {DISPLAY, MONO, SERIF, TIGHT, clamp01, easeInOut, easeOut, lerp, spr} from '../lib/tokens';
import {HOTFILL} from '../lib/Type';

/** what one liked design teaches it */
export type Learn = {at: number; sw: string[]; chip?: string; type?: 'serif' | 'cond' | 'mono' | 'grotesk'; pct: number};

const SPEC: Record<NonNullable<Learn['type']>, {label: string; style: React.CSSProperties; text: string}> = {
	serif: {label: 'Serif italic', text: 'Aa', style: {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400}},
	cond: {label: 'Tall condensed', text: 'AA', style: {fontFamily: DISPLAY, fontStretch: '62%', fontWeight: 850}},
	mono: {label: 'Mono details', text: 'Aa', style: {fontFamily: MONO, fontWeight: 500}},
	grotesk: {label: 'Tight grotesk', text: 'Aa', style: {fontFamily: TIGHT, fontWeight: 650, letterSpacing: '-0.04em'}},
};
const Label: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{fontFamily: TIGHT, fontWeight: 600, fontSize: 15, letterSpacing: '0.2em', color: '#8C8C94', marginBottom: 16}}>{children}</div>;

/** the taste profile filling in as you like things; swatches fly in from `from` (panel coords) */
export const Profile: React.FC<{t: number; learns: Learn[]; w: number; from: {x: number; y: number}; name: [string, string]; nameAt: number}> = ({t, learns, w, from, name, nameAt}) => {
	const got = learns.filter((l) => t >= l.at);
	const last = got[got.length - 1];
	const prev = got[got.length - 2];
	const pct = last ? lerp(prev?.pct ?? 0, last.pct, easeOut(clamp01((t - last.at) / 0.45))) : 0;
	const bump = last ? Math.max(0, 1 - (t - last.at) / 0.35) : 0;
	const pad = 40;
	const sws = learns.flatMap((l) => l.sw.map((c) => ({c, at: l.at})));
	const SWS = 50;
	const gap = 14;
	const types = learns.filter((l) => l.type);
	const chips = learns.filter((l) => l.chip);
	const nm = spr(t, nameAt, 12, 0.7);
	return (
		<div style={{position: 'relative', width: w, padding: pad, borderRadius: 30, background: 'linear-gradient(165deg, #1A1A1D 0%, #0E0E10 100%)', boxShadow: '0 50px 120px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.1)', boxSizing: 'border-box'}}>
			<div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
				<div style={{fontFamily: TIGHT, fontWeight: 650, fontSize: 18, letterSpacing: '0.22em', color: '#D6D6DC'}}>YOUR TASTE</div>
				<div style={{fontFamily: TIGHT, fontWeight: 650, fontSize: 58, letterSpacing: '-0.03em', color: '#fff', fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.06 * bump})`, transformOrigin: '100% 70%'}}>
					{Math.round(pct)}
					<span style={{fontSize: 30, color: '#8C8C94'}}>%</span>
				</div>
			</div>
			<div style={{height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', marginTop: 10, marginBottom: 34, overflow: 'hidden'}}>
				<div style={{width: `${pct}%`, height: '100%', background: HOTFILL, borderRadius: 4, boxShadow: `0 0 ${10 + 24 * bump}px rgba(255,90,60,0.8)`}} />
			</div>
			<Label>PALETTE</Label>
			<div style={{position: 'relative', height: SWS, marginBottom: 34}}>
				{sws.map((s, i) => {
					const k = clamp01((t - s.at - i * 0.0) / 0.32);
					if (t < s.at) return null;
					const e = easeInOut(k);
					const x = (i % 9) * (SWS + gap);
					// fly from the liked card into its slot
					const fx = lerp(from.x - pad, x, e);
					const fy = lerp(from.y - (pad + 140), 0, e) - Math.sin(Math.PI * e) * 60;
					return <div key={i} style={{position: 'absolute', left: fx, top: fy, width: SWS, height: SWS, borderRadius: '50%', background: s.c, boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,0.2), 0 6px 18px rgba(0,0,0,0.5)`, transform: `scale(${lerp(1.6, 1, e)})`, opacity: clamp01(k * 4)}} />;
				})}
			</div>
			<Label>TYPE</Label>
			<div style={{display: 'flex', gap: 14, height: 120, marginBottom: 34}}>
				{types.map((l, i) => {
					const a = spr(t, l.at + 0.1, 16, 0.6);
					if (t < l.at + 0.1) return null;
					const sp = SPEC[l.type!];
					return (
						<div key={i} style={{width: (w - 2 * pad - 2 * 14) / 3, height: 120, borderRadius: 18, background: 'rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px 16px', boxSizing: 'border-box', transform: `scale(${0.8 + 0.2 * a})`, opacity: clamp01(a * 2)}}>
							<div style={{...sp.style, fontSize: 56, lineHeight: 1, color: '#F2F2F4'}}>{sp.text}</div>
							<div style={{fontFamily: TIGHT, fontSize: 14, color: '#8C8C94'}}>{sp.label}</div>
						</div>
					);
				})}
			</div>
			<Label>LOOKS</Label>
			<div style={{display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 104, alignItems: 'flex-start', alignContent: 'flex-start'}}>
				{chips.map((l, i) => {
					const a = spr(t, l.at + 0.18, 18, 0.6);
					if (t < l.at + 0.18) return null;
					return (
						<div key={i} style={{fontFamily: TIGHT, fontWeight: 550, fontSize: 21, color: '#EDEDF0', padding: '10px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16)', transform: `scale(${0.7 + 0.3 * a})`, opacity: clamp01(a * 2)}}>
							{l.chip}
						</div>
					);
				})}
			</div>
			{t >= nameAt ? (
				<div style={{position: 'absolute', inset: 0, borderRadius: 30, background: `rgba(10,10,12,${0.88 * clamp01(nm * 1.4)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
					<div style={{fontFamily: TIGHT, fontWeight: 650, fontSize: 18, letterSpacing: '0.22em', color: '#D6D6DC', opacity: clamp01(nm * 2)}}>YOUR TASTE</div>
					<div style={{fontFamily: SERIF, fontSize: 104, lineHeight: 0.95, letterSpacing: '-0.025em', color: '#F4EEE6', textAlign: 'center', transform: `scale(${0.85 + 0.15 * nm})`, opacity: clamp01(nm * 2)}}>
						{name[0]}
						<br />
						<i style={{backgroundImage: HOTFILL, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingRight: 10}}>{name[1]}</i>
					</div>
				</div>
			) : null}
		</div>
	);
};
