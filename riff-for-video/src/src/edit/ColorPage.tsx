import React from 'react';
import {Img} from 'remotion';
import {C, MONO, SANS, clamp01, easeInOut, easeMac, lerp} from '../lib/tokens';
import {frameAt, layoutAt, lookAt, playheadAt} from './model';
import {ACT} from './timing';
import {TL, WIN} from './layout';
import {frameSrc} from './Viewer';

const Wheel: React.FC<{d: number; label: string; px: number; py: number; value: string}> = ({d, label, px, py, value}) => (
	<div style={{width: d, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
		<div style={{position: 'relative', width: d, height: d}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 90deg, #ff4d4d, #ffcc33, #66dd55, #33ddee, #4466ff, #cc44ee, #ff4d4d)', opacity: 0.85}} />
			<div style={{position: 'absolute', inset: 6, borderRadius: '50%', background: 'radial-gradient(circle, #2A2A2F 0%, #1B1B1F 60%, rgba(27,27,31,0.6) 100%)'}} />
			<div style={{position: 'absolute', left: d / 2 - 0.5, top: 12, width: 1, height: d - 24, background: 'rgba(255,255,255,0.08)'}} />
			<div style={{position: 'absolute', top: d / 2 - 0.5, left: 12, height: 1, width: d - 24, background: 'rgba(255,255,255,0.08)'}} />
			<div style={{position: 'absolute', left: d / 2 + px - 11, top: d / 2 + py - 11, width: 22, height: 22, borderRadius: 11, background: '#F4F4F6', boxShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 0 3px rgba(255,255,255,0.18)'}} />
		</div>
		<div style={{fontFamily: SANS, fontSize: 13.5, fontWeight: 650, color: '#C9C9CF'}}>{label}</div>
		<div style={{fontFamily: MONO, fontSize: 12, color: '#7A7A82', marginTop: -6}}>{value}</div>
	</div>
);

// deterministic scatter for the vectorscope trace
const PTS = new Array(260).fill(0).map((_, i) => {
	const a = Math.sin(i * 12.9898) * 43758.5453;
	const b = Math.sin(i * 78.233) * 12543.123;
	const u = a - Math.floor(a);
	const v = b - Math.floor(b);
	const r = Math.sqrt(-2 * Math.log(Math.max(1e-4, u)));
	return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)];
});

const Scope: React.FC<{d: number; ang: number; spread: number}> = ({d, ang, spread}) => {
	const c = d / 2;
	const ca = Math.cos(ang);
	const sa = Math.sin(ang);
	const targets = [['R', 103], ['Mg', 61], ['B', 347], ['Cy', 283], ['G', 241], ['Yl', 167]] as const;
	return (
		<div style={{width: d, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
			<svg width={d} height={d}>
				<circle cx={c} cy={c} r={c - 2} fill="#0B0B0D" stroke="rgba(255,255,255,0.16)" />
				<circle cx={c} cy={c} r={(c - 2) * 0.5} fill="none" stroke="rgba(255,255,255,0.07)" />
				<line x1={c} y1={6} x2={c} y2={d - 6} stroke="rgba(255,255,255,0.07)" />
				<line x1={6} y1={c} x2={d - 6} y2={c} stroke="rgba(255,255,255,0.07)" />
				<line x1={c} y1={c} x2={c - (c - 8) * Math.cos(2.15)} y2={c - (c - 8) * Math.sin(2.15)} stroke="rgba(255,190,140,0.25)" strokeDasharray="3 3" />
				{targets.map(([n, a]) => {
					const r = (c - 2) * 0.78;
					const x = c + r * Math.cos((a * Math.PI) / 180);
					const y = c - r * Math.sin((a * Math.PI) / 180);
					return <rect key={n} x={x - 4} y={y - 4} width={8} height={8} fill="none" stroke="rgba(255,255,255,0.22)" />;
				})}
				{PTS.map(([px, py], i) => {
					const x0 = px * spread * 0.9;
					const y0 = py * spread * 0.32;
					const off = spread * 1.1;
					const x = c + (x0 + off) * ca - y0 * sa;
					const y = c - ((x0 + off) * sa + y0 * ca);
					return <circle key={i} cx={x} cy={y} r={1.3} fill="rgba(160,255,200,0.55)" />;
				})}
			</svg>
			<div style={{fontFamily: SANS, fontSize: 13.5, fontWeight: 650, color: '#C9C9CF'}}>Vectorscope</div>
			<div style={{fontFamily: MONO, fontSize: 12, color: '#7A7A82', marginTop: -6}}>Rec. 709</div>
		</div>
	);
};

export const ColorPage: React.FC<{t: number}> = ({t}) => {
	const open = easeMac(clamp01((t - ACT.colorOpen) / 0.4)) * (1 - easeInOut(clamp01((t - ACT.colorClose) / 0.38)));
	if (open <= 0.001) return null;
	const L = lookAt(t);
	const segs = layoutAt(t);
	const f = frameAt(segs, playheadAt(t));
	const k = L.teal; // 0..1 (0.6 after "little less")
	const looks: {n: string; look: 'flat' | 'moody' | 'teal'; filter?: string}[] = [
		{n: 'Natural', look: 'flat'},
		{n: 'Moody', look: 'moody'},
		{n: 'Deep Teal', look: 'teal'},
		{n: 'Film', look: 'moody', filter: 'sepia(0.45) contrast(1.05)'},
		{n: 'Mono', look: 'moody', filter: 'grayscale(1) contrast(1.15)'},
	];
	const sel = t >= ACT.teal ? 2 : 1;
	const selP = t >= ACT.teal ? clamp01((t - ACT.teal) / 0.2) : 1;
	const R = 40; // wheel puck travel
	const tealDir = (196 * Math.PI) / 180;
	const shadows = {x: Math.cos(tealDir) * R * lerp(0.35, 1.0, k), y: -Math.sin(tealDir) * R * lerp(0.35, 1.0, k)};
	const mids = {x: Math.cos(tealDir) * R * lerp(0.12, 0.62, k), y: -Math.sin(tealDir) * R * lerp(0.12, 0.62, k)};
	const highs = {x: Math.cos(0.6) * R * lerp(0.3, 0.22, k), y: -Math.sin(0.6) * R * lerp(0.3, 0.22, k)};
	const H = WIN.h - TL.y;
	return (
		<div style={{position: 'absolute', left: 0, top: TL.y + (1 - open) * H, width: WIN.w, height: H, background: '#111114', borderTop: `1px solid ${C.line2}`, boxShadow: '0 -20px 50px rgba(0,0,0,0.5)', zIndex: 20}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 48, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 18, borderBottom: `1px solid ${C.line}`}}>
				<div style={{fontFamily: SANS, fontSize: 17, fontWeight: 700, color: '#F2F2F5'}}>Color</div>
				<div style={{display: 'flex', background: '#1C1C20', borderRadius: 9, padding: 3, gap: 2}}>
					{['Wheels', 'Curves', 'Looks', 'HSL'].map((n, i) => (
						<div key={n} style={{padding: '5px 13px', borderRadius: 7, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: i === 0 ? '#111' : '#9A9AA3', background: i === 0 ? '#E6E6EA' : 'transparent'}}>
							{n}
						</div>
					))}
				</div>
				<div style={{marginLeft: 'auto', fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: '#9A9AA3'}}>
					Applies to <span style={{color: '#E6E6EA'}}>all 9 clips</span>
				</div>
			</div>
			{/* looks */}
			<div style={{position: 'absolute', left: 20, right: 20, top: 62, display: 'flex', gap: 12}}>
				{looks.map((l, i) => {
					const on = i === sel ? selP : i === 1 && sel === 2 ? 1 - selP : 0;
					return (
						<div key={l.n} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 7}}>
							<div style={{position: 'relative', height: 104, borderRadius: 9, overflow: 'hidden', boxShadow: `0 0 0 ${on > 0.01 ? 3 * on : 1}px ${on > 0.01 ? C.ember : 'rgba(255,255,255,0.12)'}`}}>
								<Img src={frameSrc(f.clip, l.look, f.idx)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: l.filter}} />
							</div>
							<div style={{fontFamily: SANS, fontSize: 13, fontWeight: 600, color: on > 0.5 ? '#FFD9BD' : '#A9A9B0', textAlign: 'center'}}>{l.n}</div>
						</div>
					);
				})}
			</div>
			{/* wheels + scope */}
			<div style={{position: 'absolute', left: 26, right: 26, top: 214, display: 'flex', justifyContent: 'space-between'}}>
				<Wheel d={150} label="Shadows" px={shadows.x} py={shadows.y} value={`${(-0.06 - 0.14 * k).toFixed(2)}  ${(0.08 + 0.09 * k).toFixed(2)}`} />
				<Wheel d={150} label="Midtones" px={mids.x} py={mids.y} value={`${(-0.03 - 0.12 * k).toFixed(2)}  ${(0.02 + 0.08 * k).toFixed(2)}`} />
				<Wheel d={150} label="Highlights" px={highs.x} py={highs.y} value={`${(0.05 - 0.02 * k).toFixed(2)}  ${(-0.05 + 0.02 * k).toFixed(2)}`} />
				<Scope d={150} ang={lerp(2.2, 3.5, k)} spread={lerp(16, 19, k)} />
			</div>
			{/* intensity */}
			<div style={{position: 'absolute', left: 26, right: 26, top: 446, height: 30, display: 'flex', alignItems: 'center', gap: 16}}>
				<div style={{fontFamily: SANS, fontSize: 14, fontWeight: 650, color: '#C9C9CF', width: 78}}>Intensity</div>
				<div style={{position: 'relative', flex: 1, height: 6, borderRadius: 3, background: '#2A2A30'}}>
					<div style={{position: 'absolute', left: 0, top: 0, height: 6, borderRadius: 3, width: `${L.intensity}%`, background: `linear-gradient(90deg, ${C.ember2}, ${C.ember})`}} />
					<div style={{position: 'absolute', left: `calc(${L.intensity}% - 12px)`, top: -9, width: 24, height: 24, borderRadius: 12, background: '#F4F4F6', boxShadow: '0 2px 8px rgba(0,0,0,0.6)'}} />
				</div>
				<div style={{fontFamily: MONO, fontSize: 15, color: '#F2F2F5', width: 54, textAlign: 'right'}}>{L.intensity}%</div>
			</div>
		</div>
	);
};
