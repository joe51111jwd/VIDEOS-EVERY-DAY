import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, MONO, SANS, easeInOut, tc} from '../lib/tokens';
import {CLIPS, lookAt, pad4, playheadAt, viewFrame} from './model';
import {ACT} from './timing';
import {VIEW, WIN} from './layout';
import {Toast} from './ui';

export const frameSrc = (clip: string, look: 'flat' | 'moody' | 'teal', idx: number) => staticFile(`f/${clip}/${look}/${pad4(idx)}.jpg`);

/** the graded frame stack for one source frame: base look, teal on top, moody wiping in over flat */
export const Graded: React.FC<{clip: string; idx: number; t: number; w: number; h: number}> = ({clip, idx, t, w, h}) => {
	const L = lookAt(t);
	const imgS: React.CSSProperties = {position: 'absolute', inset: 0, width: w, height: h, objectFit: 'cover'};
	const wipeX = easeInOut(L.wipe);
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
			{L.wipe < 1 ? <Img src={frameSrc(clip, 'flat', idx)} style={imgS} /> : null}
			{L.wipe > 0 ? (
				<Img src={frameSrc(clip, 'moody', idx)} style={{...imgS, clipPath: L.wipe < 1 ? `inset(0 ${(1 - wipeX) * 100}% 0 0)` : undefined}} />
			) : null}
			{L.teal > 0.001 ? <Img src={frameSrc(clip, 'teal', idx)} style={{...imgS, opacity: L.teal}} /> : null}
			{L.wipe > 0 && L.wipe < 1 ? (
				<div
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: wipeX * w - 60,
						width: 120,
						background: 'linear-gradient(90deg, transparent, rgba(255,190,140,0.0) 30%, rgba(255,214,180,0.55) 50%, rgba(255,190,140,0.0) 70%, transparent)',
						mixBlendMode: 'screen',
					}}
				/>
			) : null}
		</div>
	);
};

const chip: React.CSSProperties = {
	position: 'absolute',
	height: 28,
	padding: '0 10px',
	borderRadius: 8,
	background: 'rgba(10,10,12,0.55)',
	color: '#E8E8EC',
	fontFamily: MONO,
	fontSize: 15,
	fontWeight: 500,
	display: 'flex',
	alignItems: 'center',
	letterSpacing: '0.01em',
};

export const Viewer: React.FC<{t: number}> = ({t}) => {
	const T = playheadAt(t);
	const f = viewFrame(t);
	const L = lookAt(t);
	const look = L.teal > 0.01 ? `Deep Teal ${L.intensity}%` : L.wipe > 0.5 ? 'Moody' : 'Log';
	// a tiny flash on the frame when an edit lands
	const hits = [ACT.cut, ACT.ripple + 0.3, ACT.restore + 0.3, ACT.trim + 0.3, ACT.slow + 0.35, ACT.insert + 0.25];
	let flash = 0;
	for (const h of hits) if (t >= h && t < h + 0.25) flash = Math.max(flash, 1 - (t - h) / 0.25);
	return (
		<div style={{position: 'absolute', left: 0, top: VIEW.y, width: WIN.w, height: VIEW.h, background: '#000', overflow: 'hidden'}}>
			<Graded clip={f.clip} idx={f.idx} t={t} w={WIN.w} h={VIEW.h} />
			{flash > 0 ? <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 ${3 * flash}px rgba(255,154,85,${0.9 * flash})`}} /> : null}
			<div style={{...chip, left: 16, top: 14}}>{tc(T)}</div>
			<div style={{...chip, right: 16, top: 14, fontFamily: SANS, fontWeight: 600, fontSize: 14}}>
				<span style={{color: '#9A9AA3', marginRight: 7}}>LOOK</span>
				{look}
			</div>
			<div style={{...chip, left: 16, bottom: 14, fontFamily: SANS, fontWeight: 600, fontSize: 14}}>
				{CLIPS[f.clip].name}.mov
				<span style={{color: '#8E8E96', marginLeft: 8, fontWeight: 500}}>4K · 24p</span>
				{f.seg?.speed && f.seg.speed < 1 ? <span style={{color: C.ember, marginLeft: 8}}>50%</span> : null}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center'}}>
				<Toast t={t} at={ACT.grade + 0.15} hold={1.1} text="Look · Moody" />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center'}}>
				<Toast t={t} at={ACT.teal + 0.1} hold={1.2} text="Look · Deep Teal" />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center'}}>
				<Toast t={t} at={ACT.less + 0.1} hold={1.0} text={`Intensity ${L.intensity}%`} />
			</div>
		</div>
	);
};
