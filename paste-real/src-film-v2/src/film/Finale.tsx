import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, Grab, Mark, Wordmark} from '../brand/brand';
import {at} from '../lib/beat';
import {BRAND, BRAND_MONO, clamp01, easeInOut, easeOut, lerp, step, textW} from '../lib/tokens';
import {BarChart, DECK_CHART, DeckSlide} from './apps2';
import {CODE_AFTER, tokenize} from './apps3';
import {PosterDesign, QuoteSlide, TABLE} from './apps4';
import {AD, LullAd} from './LullAd';
import {E, T} from './T';
import {F} from './timing';
export {F};

// The stop and the slam (bars 9-10): silence, "Copy anything you can see." gets selected; the beat slams back on
// orange with "Paste it real.", one real paste per beat, then the name.


const NAMES = ['Figma', 'Keynote', 'VS Code', 'Google Slides', 'Canva', 'Sheets'];

/** a destination proof card's content, fitted into a box */
export const Proof: React.FC<{i: number; w: number; h: number}> = ({i, w, h}) => {
	if (i === 0) {
		// the LULL ad, as edited in the hook
		const s = h / 1350;
		return (
			<div style={{width: w, height: h, background: '#E7E5E0', display: 'flex', justifyContent: 'center'}}>
				<div style={{width: AD.w * s, height: h, overflow: 'hidden'}}>
					<div style={{transform: `scale(${s})`, transformOrigin: '0 0'}}>
						<LullAd headline="Sip slower." bg="#D8F24A" canRot={-11} />
					</div>
				</div>
			</div>
		);
	}
	if (i === 1) {
		const s = w / 1920;
		return (
			<div style={{width: w, height: h, background: '#0D0E12', display: 'flex', alignItems: 'center'}}>
				<div style={{width: w, height: 1080 * s, overflow: 'hidden'}}>
					<div style={{transform: `scale(${s})`, transformOrigin: '0 0'}}>
						<DeckSlide>
							<div style={{position: 'absolute', left: DECK_CHART.x, top: DECK_CHART.y, transform: `scale(${DECK_CHART.s})`, transformOrigin: '0 0'}}>
								<BarChart values={[18, 24, 31, 38, 47, 68]} />
							</div>
						</DeckSlide>
					</div>
				</div>
			</div>
		);
	}
	if (i === 2) {
		return (
			<div style={{width: w, height: h, background: '#1F1F1F', padding: `${h * 0.08}px ${w * 0.06}px`, boxSizing: 'border-box', fontFamily: BRAND_MONO, fontSize: w * 0.031, lineHeight: 1.62, overflow: 'hidden'}}>
				{CODE_AFTER.slice(0, 16).map((ln, k) => (
					<div key={k} style={{whiteSpace: 'pre', display: 'flex'}}>
						<span style={{width: w * 0.06, color: '#6E7681', textAlign: 'right', marginRight: w * 0.03, flexShrink: 0}}>{k + 1}</span>
						{tokenize(ln).map(([s, c], j) => (
							<span key={j} style={{color: c}}>
								{s}
							</span>
						))}
					</div>
				))}
			</div>
		);
	}
	if (i === 3) {
		const s = w / 1600;
		return (
			<div style={{width: w, height: h, background: '#F1F3F4', display: 'flex', alignItems: 'center'}}>
				<div style={{width: w, height: 900 * s, overflow: 'hidden'}}>
					<QuoteSlide w={w} />
				</div>
			</div>
		);
	}
	if (i === 4) {
		const s = Math.min(w, h);
		return (
			<div style={{width: w, height: h, background: '#EBECF0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: s, height: s, overflow: 'hidden'}}>
					<PosterDesign w={s} />
				</div>
			</div>
		);
	}
	// the sheet
	const fs = w * 0.034;
	return (
		<div style={{width: w, height: h, background: '#fff', fontFamily: 'Inter', fontSize: fs, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{width: w * 0.88, borderTop: '1px solid #E1E3E1', borderLeft: '1px solid #E1E3E1'}}>
				{TABLE.map((row, r) => (
					<div key={r} style={{display: 'flex', background: r === 0 ? '#F1F3F4' : undefined}}>
						{row.map((v, c) => (
							<div key={c} style={{flex: c === 0 ? 1.7 : 1, height: fs * 2.3, borderRight: '1px solid #E1E3E1', borderBottom: '1px solid #E1E3E1', display: 'flex', alignItems: 'center', justifyContent: c === 0 ? 'flex-start' : 'flex-end', padding: `0 ${fs * 0.6}px`, fontWeight: r === 0 || r === TABLE.length - 1 ? 700 : 400, color: c === 4 && r > 0 ? '#137333' : '#1F1F1F', whiteSpace: 'nowrap'}}>
								{v}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

const CARD = {w: 860, h: 640};

export const Finale: React.FC<{t: number}> = ({t}) => {
	// ------------------------------------------------ the stop (silence, black)
	if (t < F.slam) {
		const a = step(t, F.stop + 0.02, 0.18);
		const g = step(t, F.grab, 0.12);
		const fill = step(t, F.fillAt, 0.16, easeInOut);
		return (
			<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{position: 'relative', opacity: a, transform: `translateY(${(1 - a) * 10}px)`}}>
					<div style={{fontFamily: BRAND, fontWeight: 600, fontSize: 118, letterSpacing: '-0.045em', lineHeight: 1.02, color: '#fff', textAlign: 'center', padding: '20px 34px'}}>
						Copy anything
						<br />
						you can see.
					</div>
					<div style={{position: 'absolute', left: 0, top: 0}}>
						<Grab w={Math.max(textW('Copy anything', 118, 600, BRAND, -0.045), textW('you can see.', 118, 600, BRAND, -0.045)) + 68} h={118 * 1.02 * 2 + 40} show={g} march={t * 1.6} fill={fill} flash={0} tag="Text · 1 layer" tagIn={false} radius={10} scale={1.25} />
					</div>
				</div>
			</AbsoluteFill>
		);
	}

	// ------------------------------------------------ the slam: orange
	const punch = 1 + 0.12 * (1 - easeOut(clamp01((t - F.slam) / 0.22)));
	const markFill = easeOut(clamp01((t - F.slam) / 0.32));
	const toTop = easeInOut(clamp01((t - F.cards[0] + 0.12) / 0.3));
	const lock = step(t, F.lockup, 0.24, easeOut);
	const silent = t >= F.silence;

	// which card is up
	let ci = -1;
	for (let k = 0; k < F.cards.length; k++) if (t >= F.cards[k]) ci = k;
	const gridP = step(t, F.grid, 0.34, easeInOut);
	const out = step(t, F.lockup - 0.1, 0.18, easeInOut);

	return (
		<AbsoluteFill style={{background: C.signal, overflow: 'hidden'}}>
			{/* headline */}
			<div style={{position: 'absolute', left: 0, right: 0, top: lerp(800, 250, toTop), display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - out, transform: `scale(${punch * lerp(1, 0.78, toTop)})`}}>
				<div style={{transform: `scale(${1 - toTop})`, height: lerp(150, 0, toTop), marginBottom: lerp(36, 0, toTop), opacity: 1 - toTop}}>
					<Mark size={150} color={C.ink} ink={C.ink} fill={markFill} id="slam" />
				</div>
				<div style={{fontFamily: BRAND, fontWeight: 600, fontSize: 150, letterSpacing: '-0.05em', lineHeight: 1, color: C.ink, whiteSpace: 'nowrap'}}>Paste it real.</div>
			</div>

			{/* one real paste per beat */}
			{ci >= 0 && gridP < 1
				? F.cards.map((c0, k) => {
						if (k > ci || k < ci - 1) return null;
						const inP = easeOut(clamp01((t - c0) / 0.16));
						const leaving = k < ci ? easeOut(clamp01((t - F.cards[ci]) / 0.16)) : 0;
						const y = 520 + (1 - inP) * 140 - leaving * 90;
						const o = (k === ci ? inP : 1 - leaving) * (1 - gridP);
						return (
							<div key={k} style={{position: 'absolute', left: (1080 - CARD.w) / 2, top: y, width: CARD.w, height: CARD.h, borderRadius: 28, overflow: 'hidden', background: '#fff', boxShadow: '0 40px 90px rgba(80,20,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)', opacity: o, transform: `scale(${0.96 + 0.04 * inP - 0.04 * leaving})`, zIndex: k}}>
								<Proof i={k} w={CARD.w} h={CARD.h} />
							</div>
						);
					})
				: null}
			{/* the app's name */}
			{ci >= 0 && gridP < 1 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 1236, display: 'flex', justifyContent: 'center', opacity: 1 - gridP}}>
					<div key={ci} style={{display: 'flex', alignItems: 'center', gap: 22, fontFamily: BRAND, fontWeight: 600, fontSize: 86, letterSpacing: '-0.045em', color: C.ink, opacity: easeOut(clamp01((t - F.cards[ci]) / 0.12)), transform: `translateY(${(1 - easeOut(clamp01((t - F.cards[ci]) / 0.16))) * 30}px)`}}>
						<span style={{fontWeight: 500, color: 'rgba(12,12,14,0.55)'}}>in</span> {NAMES[ci]}
					</div>
				</div>
			) : null}

			{/* everywhere: all six at once */}
			{gridP > 0 && out < 1
				? NAMES.map((name, k) => {
						const col = k % 2,
							row = Math.floor(k / 2);
						const w = 430,
							h = 320;
						const x = 540 + (col === 0 ? -w - 14 : 14);
						const y = 560 + row * (h + 28);
						const p = easeOut(clamp01((t - F.grid - k * 0.03) / 0.3));
						return (
							<div key={name} style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 20, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 60px rgba(80,20,0,0.3)', opacity: p * (1 - out), transform: `scale(${0.85 + 0.15 * p - 0.1 * out}) translateY(${(1 - p) * 40}px)`}}>
								<Proof i={k} w={w} h={h} />
								<div style={{position: 'absolute', left: 14, bottom: 12, height: 34, padding: '0 14px', borderRadius: 17, background: 'rgba(12,12,14,0.86)', color: '#fff', fontFamily: BRAND, fontWeight: 600, fontSize: 21, display: 'flex', alignItems: 'center'}}>{name}</div>
							</div>
						);
					})
				: null}
			{gridP > 0 && out < 1 ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 1610, textAlign: 'center', fontFamily: BRAND, fontWeight: 600, fontSize: 70, letterSpacing: '-0.045em', color: C.ink, opacity: gridP * (1 - out)}}>Wherever you work.</div>
			) : null}

			{/* the name */}
			{lock > 0 ? (
				<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, transform: `scale(${(0.9 + 0.1 * lock) * (1 + 0.04 * (1 - easeOut(clamp01((t - F.punch) / 0.25))) * (t >= F.punch ? 1 : 0))})`, opacity: lock}}>
					<Mark size={260} color={C.ink} ink={C.ink} fill={1} march={silent ? (t - F.silence) * 1.2 : 0} id="lock" />
					<Wordmark size={150} color={C.ink} />
				</div>
			) : null}
		</AbsoluteFill>
	);
};
