import React from 'react';
import {staticFile} from 'remotion';
import {C, MONO, SANS, clamp01, easeInOut, easeOut, pulse} from '../lib/tokens';
import {CLIPS, LSeg, layoutAt, lookAt, playheadAt} from './model';
import {ACT, BEAT, BEAT0} from './timing';
import {HEAD_W, LANE, PHX, PPS, TL, WIN} from './layout';
import {IEye, ILock, IMagnet, IScissors, ISpeaker, noise} from './ui';
import musicEnv from './musicEnv.json';

const ENV = musicEnv as number[];
const THUMB_W = 214;
const nThumbs = (clip: string) => Math.ceil(CLIPS[clip].frames / 7.5);

const Filmstrip: React.FC<{g: LSeg; w: number; look: number; teal: number}> = ({g, w, look, teal}) => {
	const c = CLIPS[g.clip];
	const tw = (LANE.v1.h * 16) / 9;
	const n = Math.ceil(w / tw) + 1;
	const tiles: React.ReactNode[] = [];
	for (let k = 0; k < n; k++) {
		const src = g.s + ((k * tw + tw * 0.5) / PPS) * (g.speed ?? 1);
		const i = Math.max(0, Math.min(nThumbs(g.clip) - 1, Math.round((src - c.a) / 0.25)));
		const pos = `${-i * tw}px 0`;
		const size = `${nThumbs(g.clip) * tw}px ${LANE.v1.h}px`;
		const base: React.CSSProperties = {position: 'absolute', left: k * tw, top: 0, width: tw, height: LANE.v1.h, backgroundSize: size, backgroundPosition: pos};
		tiles.push(
			<div key={k} style={{...base, backgroundImage: `url(${staticFile(`s/${g.clip}_${look > 0.5 ? 'moody' : 'flat'}.jpg`)})`}}>
				{teal > 0.01 ? <div style={{...base, left: 0, opacity: teal, backgroundImage: `url(${staticFile(`s/${g.clip}_teal.jpg`)})`}} /> : null}
			</div>,
		);
	}
	return <>{tiles}</>;
};

const Wave: React.FC<{w: number; h: number; amp: (x: number) => number; color: string; step?: number}> = ({w, h, amp, color, step = 4}) => {
	let d = '';
	for (let x = 1; x < w - 1; x += step) {
		const a = Math.max(0.05, Math.min(1, amp(x))) * (h * 0.42);
		d += `M${x.toFixed(1)} ${(h / 2 - a).toFixed(1)}V${(h / 2 + a).toFixed(1)}`;
	}
	return (
		<svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
			<path d={d} stroke={color} strokeWidth={step * 0.55} strokeLinecap="round" />
		</svg>
	);
};

export const Timeline: React.FC<{t: number}> = ({t}) => {
	const segs = layoutAt(t);
	const T = playheadAt(t);
	const L = lookAt(t);
	const toX = (s: number) => PHX + (s - T) * PPS;
	const visible = (x0: number, x1: number) => x1 > HEAD_W - 40 && x0 < WIN.w + 40;

	// ---------- V1 clips + their attached audio
	const v1: React.ReactNode[] = [];
	const a1: React.ReactNode[] = [];
	for (const g of segs) {
		const x0 = toX(g.x) + 1;
		const w = g.dur * PPS - 2;
		if (!visible(x0, x0 + w) || w < 2) continue;
		// the footage regrades in a wave from left to right after the viewer wipe
		const regrade = clamp01((t - (ACT.grade + 0.12 + (x0 / WIN.w) * 0.4)) / 0.12);
		const sel = g.id === 'C1' && t >= ACT.loseSel && t < ACT.lift + 0.3;
		const ins = g.id === 'M' ? pulse(t, ACT.insert + 0.2, 0.08, 0.9) : 0;
		const slow = g.id === 'Cs' && t >= ACT.slow;
		const ring = sel ? 1 : ins;
		v1.push(
			<div
				key={g.id}
				style={{
					position: 'absolute',
					left: x0,
					top: LANE.v1.y + g.y,
					width: w,
					height: LANE.v1.h,
					borderRadius: 8,
					overflow: 'hidden',
					opacity: g.o,
					background: '#222',
					boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.16)${ring > 0 ? `, 0 0 0 ${3 * ring}px ${C.ember}, 0 0 ${24 * ring}px rgba(255,140,80,${0.5 * ring})` : ''}`,
				}}
			>
				<Filmstrip g={g} w={w} look={regrade} teal={L.teal} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 30, background: 'linear-gradient(180deg, rgba(20,24,44,0.78), rgba(20,24,44,0))'}} />
				<div style={{position: 'absolute', left: 9, top: 6, fontFamily: SANS, fontSize: 13.5, fontWeight: 650, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
					{CLIPS[g.clip].name}
				</div>
				{slow ? (
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 0,
							height: 24,
							background: 'linear-gradient(180deg, rgba(255,154,85,0.75), rgba(255,106,77,0.85))',
							color: C.emberInk,
							fontFamily: SANS,
							fontSize: 13.5,
							fontWeight: 750,
							display: 'flex',
							alignItems: 'center',
							paddingLeft: 9,
							opacity: easeOut(clamp01((t - ACT.slow - 0.2) / 0.25)),
						}}
					>
						Slow-mo 50%
					</div>
				) : null}
				{sel ? <div style={{position: 'absolute', inset: 0, background: 'rgba(255,154,85,0.18)'}} /> : null}
			</div>,
		);
		a1.push(
			<div
				key={g.id}
				style={{
					position: 'absolute',
					left: x0,
					top: LANE.a1.y + g.y * 0.6,
					width: w,
					height: LANE.a1.h,
					borderRadius: 7,
					overflow: 'hidden',
					opacity: g.o,
					background: C.audio,
					boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
				}}
			>
				<Wave
					w={w}
					h={LANE.a1.h}
					color={C.audioWave}
					amp={(x) => {
						const src = g.s + (x / PPS) * (g.speed ?? 1);
						return 0.25 + 0.75 * noise(src * 3.1, g.clip.charCodeAt(2) + g.clip.charCodeAt(4)) ** 1.6;
					}}
				/>
			</div>,
		);
	}

	// ---------- edit marks
	const marks: React.ReactNode[] = [];
	// the blade
	if (t >= ACT.cut && t < ACT.cut + 0.5) {
		const p = (t - ACT.cut) / 0.5;
		const x = toX(7.5);
		marks.push(
			<div key="blade" style={{position: 'absolute', left: x - 2, top: LANE.v1.y - 6, width: 4, height: LANE.a1.y + LANE.a1.h - LANE.v1.y + 12, borderRadius: 2, background: '#FFE3CC', boxShadow: `0 0 18px 4px rgba(255,140,80,${0.9 * (1 - p)})`, opacity: 1 - easeInOut(p)}} />,
		);
	}
	// the healed seam
	if (t >= ACT.heal - 0.05 && t < ACT.heal + 0.45) {
		const p = clamp01((t - ACT.heal) / 0.45);
		const x = toX(7.5);
		marks.push(
			<div key="heal" style={{position: 'absolute', left: x - 3, top: LANE.v1.y, width: 6, height: LANE.v1.h, borderRadius: 3, background: `rgba(255,214,180,${1 - p})`, boxShadow: `0 0 22px 6px rgba(255,150,90,${0.8 * (1 - p)})`, transform: `scaleY(${1 - 0.6 * easeInOut(p)})`}} />,
		);
	}
	// trim handle on the carve's out point
	if (t >= ACT.trim - 0.12 && t < ACT.trim + 0.75) {
		const c = segs.find((g) => g.id === 'C');
		if (c) {
			const x = toX(c.x + c.dur);
			const o = clamp01((t - ACT.trim + 0.12) / 0.1) * (1 - clamp01((t - ACT.trim - 0.5) / 0.25));
			marks.push(
				<div key="trim" style={{position: 'absolute', left: x - 9, top: LANE.v1.y - 2, width: 9, height: LANE.v1.h + 4, borderRadius: '2px 7px 7px 2px', border: `3px solid ${C.ember}`, borderLeft: 'none', boxShadow: '0 0 16px rgba(255,140,80,0.7)', opacity: o}} />,
			);
		}
	}
	// in / out range for the slow-mo
	if (t >= ACT.markIn && t < ACT.slow + 0.45) {
		const xIn = toX(8.0);
		const out = t >= ACT.markOut ? 9.0 : Math.max(8.0, T);
		const xOut = toX(out);
		const o = 1 - clamp01((t - ACT.slow - 0.2) / 0.25);
		marks.push(
			<div key="range" style={{position: 'absolute', left: xIn, top: LANE.ruler.y, width: Math.max(2, xOut - xIn), height: LANE.v1.y + LANE.v1.h, opacity: o}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 4, height: LANE.ruler.h - 8, background: 'rgba(255,154,85,0.35)', borderRadius: 4}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: LANE.v1.y, height: LANE.v1.h, background: 'rgba(255,154,85,0.22)', boxShadow: `inset 0 0 0 2px ${C.ember}`, borderRadius: 8}} />
				<div style={{position: 'absolute', left: -1, top: 0, width: 3, height: '100%', background: C.ember}} />
				{t >= ACT.markOut ? <div style={{position: 'absolute', right: -1, top: 0, width: 3, height: '100%', background: C.ember}} /> : null}
			</div>,
		);
	}
	// beat snap flashes on every cut
	if (t >= ACT.beat + 0.4 && t < ACT.beat + 1.1) {
		const p = (t - ACT.beat - 0.4) / 0.7;
		segs.forEach((g, k) => {
			const x = toX(g.x);
			if (!visible(x, x)) return;
			const d = clamp01(p * 1.4 - k * 0.04);
			marks.push(<div key={`bs${k}`} style={{position: 'absolute', left: x - 2, top: LANE.v1.y - 4, width: 4, height: LANE.a2.y + LANE.a2.h - LANE.v1.y + 8, background: '#FFD9BD', opacity: (1 - d) * (d > 0 ? 1 : 0), boxShadow: '0 0 14px rgba(255,140,80,0.9)', borderRadius: 2}} />);
		});
	}

	// ---------- ruler
	const ruler: React.ReactNode[] = [];
	const t0 = Math.floor(T - 6);
	for (let s = t0; s < T + 6; s += 0.25) {
		const x = toX(s);
		if (x < HEAD_W - 2 || x > WIN.w) continue;
		const whole = Math.abs(s - Math.round(s)) < 1e-6;
		ruler.push(<div key={s} style={{position: 'absolute', left: x, top: whole ? 18 : 25, width: 1, height: whole ? 16 : 9, background: whole ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.16)'}} />);
		if (whole && s >= 0)
			ruler.push(
				<div key={`l${s}`} style={{position: 'absolute', left: x + 5, top: 6, fontFamily: MONO, fontSize: 12.5, color: '#74747C'}}>
					{`00:${String(s).padStart(2, '0')}`}
				</div>,
			);
	}

	// ---------- music (A2) with beat markers
	const glow = t >= ACT.beat - 0.1 ? pulse(t, ACT.beat, 0.1, 1.0) : 0;
	const beats: React.ReactNode[] = [];
	for (let k = Math.floor((T - 6 - BEAT0) / BEAT); k < (T + 6 - BEAT0) / BEAT; k++) {
		const s = BEAT0 + k * BEAT;
		const x = toX(s);
		if (x < HEAD_W || x > WIN.w || s < 0) continue;
		const down = k % 4 === 0;
		const wave = glow * clamp01(1 - Math.abs((x - PHX) / 520 - (t - ACT.beat) * 1.2) * 1.5);
		beats.push(
			<div
				key={k}
				style={{
					position: 'absolute',
					left: x - (down ? 4 : 3),
					top: 4,
					width: down ? 8 : 6,
					height: down ? 8 : 6,
					transform: 'rotate(45deg)',
					background: wave > 0.05 ? `rgba(255,${Math.round(214 - 60 * wave)},${Math.round(180 - 90 * wave)},1)` : down ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.38)',
					boxShadow: wave > 0.05 ? `0 0 ${10 * wave}px rgba(255,140,80,0.9)` : undefined,
				}}
			/>,
		);
	}
	const mX0 = Math.max(HEAD_W, toX(0));
	const musicW = WIN.w - mX0;

	// ---------- look adjustment clip (V2)
	const lookName = L.teal > 0.01 ? `Look · Deep Teal ${L.intensity}%` : 'Look · Moody';
	const lookP = easeOut(clamp01((t - ACT.grade) / 0.5));

	const lane = (y: number, h: number) => <div style={{position: 'absolute', left: HEAD_W, right: 0, top: y, height: h, background: C.lane}} />;
	const head = (y: number, h: number, tag: string, name: string, icon: React.ReactNode) => (
		<div style={{position: 'absolute', left: 0, top: y, width: HEAD_W, height: h, display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 12, boxSizing: 'border-box'}}>
			<div style={{fontFamily: SANS, fontSize: 12, fontWeight: 700, color: '#C9C9CF', width: 22}}>{tag}</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
				<div style={{fontFamily: SANS, fontSize: 11.5, fontWeight: 500, color: '#7A7A82'}}>{name}</div>
				{h > 50 ? <div style={{display: 'flex', gap: 6}}>{icon}<ILock /></div> : null}
			</div>
		</div>
	);

	return (
		<div style={{position: 'absolute', left: 0, top: TL.y, width: WIN.w, height: TL.h, background: C.win, overflow: 'hidden'}}>
			{/* lanes */}
			<div style={{position: 'absolute', left: HEAD_W, right: 0, top: 0, height: LANE.ruler.h, background: '#121215', borderBottom: `1px solid ${C.line}`}} />
			{lane(LANE.v3.y, LANE.v3.h)}
			{lane(LANE.v2.y, LANE.v2.h)}
			{lane(LANE.v1.y, LANE.v1.h)}
			{lane(LANE.a1.y, LANE.a1.h)}
			{lane(LANE.a2.y, LANE.a2.h)}
			{ruler}
			{/* V3 titles */}
			{(() => {
				const x0 = toX(0.2);
				const x1 = toX(2.8);
				return visible(x0, x1) ? (
					<div style={{position: 'absolute', left: Math.max(x0, HEAD_W - 20), top: LANE.v3.y, width: x1 - Math.max(x0, HEAD_W - 20), height: LANE.v3.h, borderRadius: 7, background: '#4E3A8F', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)', fontFamily: SANS, fontSize: 13, fontWeight: 650, color: '#E8E0FF', display: 'flex', alignItems: 'center', paddingLeft: 10, boxSizing: 'border-box'}}>
						Title · SALT
					</div>
				) : null;
			})()}
			{/* V2 look */}
			{lookP > 0 ? (
				<div
					style={{
						position: 'absolute',
						left: Math.max(HEAD_W + 2, toX(0)),
						top: LANE.v2.y,
						width: (WIN.w - Math.max(HEAD_W + 2, toX(0))) * lookP,
						height: LANE.v2.h,
						borderRadius: 7,
						background: L.teal > 0.01 ? 'linear-gradient(90deg, #13545A, #1C6B6E)' : 'linear-gradient(90deg, #6E4316, #8A5520)',
						boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.2)`,
						fontFamily: SANS,
						fontSize: 13,
						fontWeight: 650,
						color: '#FFF1E2',
						display: 'flex',
						alignItems: 'center',
						paddingLeft: Math.max(10, PHX - Math.max(HEAD_W + 2, toX(0)) - 220),
						boxSizing: 'border-box',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
					}}
				>
					{lookName}
				</div>
			) : null}
			{a1}
			{v1}
			{/* A2 music */}
			<div style={{position: 'absolute', left: mX0, top: LANE.a2.y, width: musicW, height: LANE.a2.h, borderRadius: 8, background: C.music, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)'}}>
				<Wave
					w={musicW}
					h={LANE.a2.h}
					step={3}
					color={C.musicWave}
					amp={(x) => {
						const s = T + (mX0 + x - PHX) / PPS;
						return 0.12 + 0.95 * (ENV[Math.max(0, Math.round(s * 30))] ?? 0);
					}}
				/>
				<div style={{position: 'absolute', left: Math.max(10, PHX - mX0 - 440), bottom: 6, fontFamily: SANS, fontSize: 12.5, fontWeight: 650, color: '#E4DBFF', whiteSpace: 'nowrap'}}>♪ Temp track</div>
			</div>
			<div style={{position: 'absolute', left: 0, top: LANE.a2.y, width: WIN.w, height: 16}}>{beats}</div>
			{marks}
			{/* header column */}
			<div style={{position: 'absolute', left: 0, top: 0, width: HEAD_W, height: TL.h, background: '#0F0F12', borderRight: `1px solid ${C.line}`}}>
				<div style={{position: 'absolute', left: 12, top: 9, display: 'flex', gap: 8, alignItems: 'center'}}>
					<IMagnet size={15} color={t >= ACT.beat ? C.ember : '#8E8E96'} />
				</div>
				{head(LANE.v3.y, LANE.v3.h, 'V3', 'Titles', <IEye />)}
				{head(LANE.v2.y, LANE.v2.h, 'V2', 'Look', <IEye />)}
				{head(LANE.v1.y, LANE.v1.h, 'V1', 'Video', <IEye />)}
				{head(LANE.a1.y, LANE.a1.h, 'A1', 'Audio', <ISpeaker />)}
				{head(LANE.a2.y, LANE.a2.h, 'A2', 'Music', <ISpeaker />)}
			</div>
			{/* footer: overview + zoom */}
			<Footer t={t} T={T} segs={segs} />
			{/* playhead */}
			<div style={{position: 'absolute', left: PHX - 1, top: 0, width: 2, height: LANE.a2.y + LANE.a2.h + 4, background: C.ember, boxShadow: '0 0 8px rgba(255,140,80,0.55)'}} />
			<div style={{position: 'absolute', left: PHX - 8, top: 0, width: 16, height: 22, borderRadius: '5px 5px 8px 8px', background: C.ember, boxShadow: '0 2px 8px rgba(0,0,0,0.5)'}} />
			{t >= ACT.cut && t < ACT.cut + 0.6 ? (
				<div style={{position: 'absolute', left: PHX - 9, top: LANE.v1.y - 26, opacity: 1 - clamp01((t - ACT.cut - 0.3) / 0.3)}}>
					<IScissors size={18} color="#FFE3CC" />
				</div>
			) : null}
		</div>
	);
};

const Footer: React.FC<{t: number; T: number; segs: LSeg[]}> = ({T, segs}) => {
	const x0 = HEAD_W + 18;
	const x1 = WIN.w - 230;
	const total = 31;
	const sx = (s: number) => x0 + (s / total) * (x1 - x0);
	const vis0 = T - (WIN.w - HEAD_W) / 2 / PPS;
	const vis1 = T + (WIN.w - HEAD_W) / 2 / PPS;
	const end = segs.reduce((m, g) => Math.max(m, g.x + g.dur), 0);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: LANE.foot.y, height: LANE.foot.h, borderTop: `1px solid ${C.line}`, background: '#0F0F12'}}>
			<div style={{position: 'absolute', left: x0, top: 22, width: x1 - x0, height: 30, borderRadius: 7, background: '#17171B', overflow: 'hidden'}}>
				{segs.filter((g) => g.y === 0).map((g) => (
					<div key={g.id} style={{position: 'absolute', left: sx(g.x) - x0 + 0.5, top: 6, width: Math.max(1, sx(g.x + g.dur) - sx(g.x) - 1), height: 11, borderRadius: 2, background: g.speed && g.speed < 1 ? C.ember : C.videoTop, opacity: 0.85}} />
				))}
				<div style={{position: 'absolute', left: 0, top: 20, width: sx(30) - x0, height: 5, borderRadius: 2, background: C.musicWave, opacity: 0.5}} />
				<div style={{position: 'absolute', left: sx(Math.max(0, vis0)) - x0, top: 0, width: sx(vis1) - sx(Math.max(0, vis0)), height: 30, borderRadius: 7, boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.05)'}} />
			</div>
			<div style={{position: 'absolute', right: 22, top: 22, height: 30, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 13, color: '#8A8A92'}}>
				<span style={{color: '#C9C9CF'}}>{`00:${String(Math.floor(end)).padStart(2, '0')}:${String(Math.round((end % 1) * 24)).padStart(2, '0')}`}</span>
				<div style={{width: 96, height: 4, borderRadius: 2, background: '#2A2A30', position: 'relative'}}>
					<div style={{position: 'absolute', left: 52, top: -5, width: 14, height: 14, borderRadius: 7, background: '#D8D8DE'}} />
				</div>
			</div>
		</div>
	);
};
