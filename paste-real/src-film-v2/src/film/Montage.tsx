import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CmdGlyph, Keycap, Mark} from '../brand/brand';
import {at, BEAT} from '../lib/beat';
import {BRAND, clamp01, easeOut, lerp, step, SYS, textW} from '../lib/tokens';
import {BAND, CanvaBand, POST_RECT, POSTER_PARTS, PosterDesign, QUOTE_PARTS, QuoteSlide, SheetsBand, SLIDE_RECT, SlidesBand} from './apps4';
import {E} from './T';
import {M} from './timing';
export {M};

// Bar 8: three more pastes, one per beat, stacked like a split screen: Google Slides, Canva, Sheets.

const LAND = BEAT / 4;
const S = 2; // band scale (pt -> px)
const GAP = 6;

type Part = {x: number; y: number; w: number; h: number};
const Sweep: React.FC<{t: number; t0: number; parts: Part[]; k: number; ox: number; oy: number; color: string}> = ({t, t0, parts, k, ox, oy, color}) => (
	<>
		{parts.map((p, i) => {
			const a = t0 + 0.04 + i * 0.05;
			const o = step(t, a, 0.05) * (1 - step(t, a + 0.26, 0.2));
			if (o <= 0) return null;
			return <div key={i} style={{position: 'absolute', left: ox + p.x * k, top: oy + p.y * k, width: p.w * k, height: p.h * k, boxShadow: `0 0 0 1.5px ${color}`, opacity: o, zIndex: 5}} />;
		})}
	</>
);

/** the pasted thing settling in: a slight drop with a shadow that fades */
const drop = (t: number, land: number) => {
	const u = easeOut(clamp01((t - land) / 0.2));
	return {opacity: clamp01((t - land) / 0.06), transform: `scale(${1.05 - 0.05 * u})`, boxShadow: `0 ${18 * (1 - u)}px ${36 * (1 - u)}px rgba(0,0,0,${0.3 * (1 - u)})`};
};

/** the keystroke pill, small: ⌘V + what happened (sized to its text) */
const MiniPill: React.FC<{show: number; down: number; done: number; label: string; doneLabel: string; id: string}> = ({show, down, done, label, doneLabel, id}) => {
	const fs = 36;
	const w1 = textW(label, fs, 600, BRAND, -0.03),
		w2 = 32 + 12 + textW(doneLabel, fs, 600, BRAND, -0.03);
	const tw = lerp(w1, w2, done);
	const k = 52;
	const W = 18 + k * 2 + 8 + 20 + tw + 30;
	return (
		<div style={{position: 'relative', width: W, height: 84, borderRadius: 42, background: 'rgba(20,20,24,0.9)', boxShadow: '0 18px 44px rgba(0,0,0,0.32), inset 0 0 0 1px rgba(255,255,255,0.08)', opacity: show, transform: `translateY(${(1 - show) * 14}px)`, fontFamily: BRAND, whiteSpace: 'nowrap'}}>
			<div style={{position: 'absolute', left: 18, top: (84 - k * 1.08) / 2, display: 'flex', gap: 8}}>
				<Keycap size={k} down={down} label={<CmdGlyph size={23} />} />
				<Keycap size={k} down={down} label={<span style={{fontFamily: SYS, fontWeight: 500, fontSize: 24}}>V</span>} />
			</div>
			<div style={{position: 'absolute', left: 18 + k * 2 + 8 + 20, top: 0, height: 84, display: 'flex', alignItems: 'center', fontSize: fs, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', opacity: 1 - done, transform: `translateY(${-12 * done}px)`}}>{label}</div>
			<div style={{position: 'absolute', left: 18 + k * 2 + 8 + 20, top: 0, height: 84, display: 'flex', alignItems: 'center', gap: 12, fontSize: fs, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', opacity: done, transform: `translateY(${12 * (1 - done)}px)`}}>
				<Mark size={32} ink="#fff" id={id} />
				{doneLabel}
			</div>
		</div>
	);
};

const Band: React.FC<{i: number; t: number; tp: number; label: string; pasted: string; children: React.ReactNode}> = ({i, t, tp, label, pasted, children}) => {
	const y = i * (BAND.h * S + GAP);
	const push = 1 + 0.035 * clamp01((t - M.start) / (M.end - M.start));
	const show = step(t, tp - 0.08, 0.1);
	return (
		<div style={{position: 'absolute', left: 0, top: y, width: 1080, height: BAND.h * S, overflow: 'hidden'}}>
			<div style={{position: 'relative', width: BAND.w, height: BAND.h, transform: `scale(${S * push})`, transformOrigin: '50% 45%', marginLeft: (1080 - BAND.w) / 2, marginTop: (BAND.h * S - BAND.h) / 2}}>{children}</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', zIndex: 20}}>
				<MiniPill show={show} down={t >= tp && t < tp + 0.14 ? 1 : 0} done={step(t, tp + LAND, 0.2)} label={label} doneLabel={pasted} id={`mp${i}`} />
			</div>
		</div>
	);
};

export const Montage: React.FC<{t: number}> = ({t}) => {
	const la = M.a + LAND,
		lb = M.b + LAND,
		lc = M.c + LAND;
	const ks = SLIDE_RECT.w / 1600;
	const kp = POST_RECT.w / 1080;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Band i={0} t={t} tp={M.a} label="Paste in Slides" pasted="Pasted in Google Slides">
				<SlidesBand>{t >= la ? <div style={{width: SLIDE_RECT.w, height: SLIDE_RECT.h, transformOrigin: '50% 50%', ...drop(t, la)}}><QuoteSlide w={SLIDE_RECT.w} /></div> : null}</SlidesBand>
				<div style={{position: 'absolute', left: 0, top: 0}}>
					<Sweep t={t} t0={la} parts={QUOTE_PARTS} k={ks} ox={SLIDE_RECT.x} oy={SLIDE_RECT.y} color="#1A73E8" />
				</div>
			</Band>
			<Band i={1} t={t} tp={M.b} label="Paste in Canva" pasted="Pasted in Canva">
				<CanvaBand>{t >= lb ? <div style={{width: POST_RECT.w, height: POST_RECT.h, transformOrigin: '50% 50%', ...drop(t, lb)}}><PosterDesign w={POST_RECT.w} /></div> : null}</CanvaBand>
				<div style={{position: 'absolute', left: 0, top: 0}}>
					<Sweep t={t} t0={lb} parts={POSTER_PARTS} k={kp} ox={POST_RECT.x} oy={POST_RECT.y} color="#8B3DFF" />
				</div>
			</Band>
			<Band i={2} t={t} tp={M.c} label="Paste in Sheets" pasted="Pasted as a spreadsheet">
				<SheetsBand fill={clamp01((t - lc) / 0.22)} sel={step(t, lc, 0.08)} />
			</Band>
		</AbsoluteFill>
	);
};
