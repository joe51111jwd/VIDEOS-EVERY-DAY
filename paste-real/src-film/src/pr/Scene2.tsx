// 2. GRAB ANY WEBSITE. -> PASTE IT INTO FIGMA.
// A landing page in the browser; grab the hero on the snare; ⌘V lands it in the design tool as named, auto-layout
// layers; dragging the frame's edge reflows it to mobile on bar 4 and back on beat 3.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeInOut, easeOut, lerp, range, SANS, spr, step} from '../lib/tokens';
import {BrowserBar, DesignBar, TreeRow, Wall, Win} from './Apps';
import {Hero} from './Hero';
import {clickAt, Crosshair, Flash, Keys, lerpRect, Marquee, path, Pointer, Rect, RebuildPill, Scan, SEL, Toast} from './ui';
import {T} from './T';

const HERO_H = 511;
const BW = {x: 24, y: 566, w: 1032, h: 98 + Math.round(HERO_H * 1.032) + 96};
const HERO_SRC: Rect = {x: 24, y: 566 + 98, w: 1032, h: HERO_H * 1.032};
const DW = {x: 24, y: 330, w: 1032, h: 1250};
const KF = 0.72;
const F = {x: 300, y: 474};
const WIDE = 1000;
const NARROW = 390;
// measured with src/dev/Measure.tsx (the frame hugs its content)
const hOf = (w: number) => (w < 425 ? 904 : w < 715 ? 857 : w < 720 ? 810 : w < 870 ? 859 : w < 880 ? 804 : w < 970 ? 545 : 511);

const strip = ['Lumen', 'Arcwell', 'Quarry', 'Fernhill', 'Ostra'];

export const Scene2: React.FC<{t: number}> = ({t}) => {
	const pasted = t >= T.paste2;
	// grab
	const grabOn = step(t, T.grab2On, 0.12) * (1 - step(t, T.grab2, 0.1));
	const du = range(t, [T.drag3A, T.drag3B], [0, 1], easeInOut);
	const c0 = {x: HERO_SRC.x, y: HERO_SRC.y};
	const cross = t < T.drag3A ? path(t, [[T.grab2On, c0.x + 80, c0.y + 70], [T.drag3A, c0.x, c0.y]]) : {x: lerp(c0.x, HERO_SRC.x + HERO_SRC.w, du), y: lerp(c0.y, HERO_SRC.y + HERO_SRC.h, du)};
	const mq: Rect = {x: c0.x, y: c0.y, w: cross.x - c0.x, h: cross.y - c0.y};
	const dragging = t >= T.drag3A && t < T.grab2 + 0.02;
	const held = t >= T.grab2 && t < T.paste2;
	// paste: the hero flies from the page into the canvas
	const fly = step(t, T.paste2, 0.42, easeOut);
	const wNow =
		t < T.resizeA
			? WIDE
			: t < T.resize2A
				? lerp(WIDE, NARROW, range(t, [T.resizeA, T.resizeB], [0, 1], easeInOut))
				: lerp(NARROW, WIDE, range(t, [T.resize2A, T.resize2B], [0, 1], easeInOut));
	const fw = Math.round(wNow);
	const frameR: Rect = {x: F.x, y: F.y, w: fw * KF, h: hOf(fw) * KF};
	const dst: Rect = {x: F.x, y: F.y, w: WIDE * KF, h: HERO_H * KF};
	const flyR = lerpRect(HERO_SRC, dst, fly);
	const selO = step(t, T.paste2 + 0.3, 0.2);
	// pointer on the frame's right edge
	const edgeY = F.y + (HERO_H * KF) / 2;
	const ptr = path(t, [
		[T.paste2 + 0.45, F.x + WIDE * KF - 160, edgeY + 260],
		[T.resizeA - 0.06, F.x + WIDE * KF, edgeY],
		[T.resizeA, F.x + WIDE * KF, edgeY],
		[T.resizeB, F.x + NARROW * KF, edgeY],
		[T.resize2A, F.x + NARROW * KF, edgeY],
		[T.resize2B, F.x + WIDE * KF, edgeY],
	]);
	const pressing = (t >= T.resizeA - 0.02 && t <= T.resizeB + 0.04) || (t >= T.resize2A - 0.02 && t <= T.resize2B + 0.04) ? 1 : 0;
	// camera: push in on the narrow frame
	const narrowU = t < T.resize2A ? range(t, [T.resizeA + 0.1, T.resizeB + 0.15], [0, 1], easeInOut) : 1 - range(t, [T.resize2A, T.resize2B + 0.1], [0, 1], easeInOut);
	const push = range(t, [T.paste2 + 0.2, T.resizeA], [0, 1], easeInOut) * (1 - narrowU);
	const camS = lerp(1, 1.24, narrowU) * (1 + 0.07 * push) * (1 + 0.02 * range(t, [T.paste2, T.s3], [0, 1], (x) => x));
	const fc = {x: lerp(lerp(540, 600, push), F.x + (NARROW * KF) / 2 + 40, narrowU), y: lerp(lerp(905, 860, push), F.y + (904 * KF) / 2 + 30, narrowU)};
	const tree: {d: number; icon: 'frame' | 'auto' | 'text' | 'group' | 'rect'; name: string; caret?: 'open' | 'closed'}[] = [
		{d: 0, icon: 'auto', name: 'Hero', caret: 'open'},
		{d: 1, icon: 'auto', name: 'Nav', caret: 'closed'},
		{d: 1, icon: 'auto', name: 'Content', caret: 'open'},
		{d: 2, icon: 'auto', name: 'Text', caret: 'open'},
		{d: 3, icon: 'text', name: 'Eyebrow'},
		{d: 3, icon: 'text', name: 'Title'},
		{d: 3, icon: 'text', name: 'Subtitle'},
		{d: 3, icon: 'auto', name: 'Buttons', caret: 'closed'},
		{d: 2, icon: 'auto', name: 'Dashboard card', caret: 'open'},
		{d: 3, icon: 'group', name: 'Chart'},
		{d: 3, icon: 'auto', name: 'Stats', caret: 'closed'},
	];
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Wall dim={pasted ? 0.04 : 0} />
			{!pasted ? (
				<>
					<Win x={BW.x} y={BW.y} w={BW.w} h={BW.h}>
						<BrowserBar url="northstar.io" tab="Northstar · Analytics" />
						<div style={{position: 'absolute', left: 0, top: 98, width: WIDE, height: HERO_H, transform: `scale(${1.032})`, transformOrigin: '0 0'}}>
							<div style={{height: HERO_H, overflow: 'hidden'}}>
								<Hero w={WIDE} />
							</div>
						</div>
						<div style={{position: 'absolute', left: 0, right: 0, top: 98 + HERO_H * 1.032, height: 96, background: '#0A0F1F', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 40px', fontFamily: SANS, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.32)', letterSpacing: '-0.02em', borderTop: '1px solid rgba(255,255,255,0.06)'}}>
							{strip.map((s) => (
								<span key={s}>{s}</span>
							))}
						</div>
					</Win>
					<Flash r={HERO_SRC} t={t} a={T.grab2} />
					<Scan r={HERO_SRC} p={range(t, [T.grab2, T.paste2 - 0.1], [0, 1], (x) => x)} strength={0.8} />
					<RebuildPill cx={540} y={BW.y + BW.h + 26} t={t} a={T.grab2 + 0.02} b={T.paste2 - 0.06} />
					{grabOn > 0 || held ? (
						<>
							{dragging || held ? (
								<Marquee r={held ? HERO_SRC : mq} dim={grabOn} frame={held ? 1 - step(t, T.paste2 - 0.12, 0.1) : 1} label={dragging ? `${Math.round(1440 * du)} × ${Math.round(736 * du)}` : undefined} labelO={grabOn} />
							) : (
								<div style={{position: 'absolute', inset: 0, background: `rgba(8,10,20,${0.42 * grabOn})`, zIndex: 250}} />
							)}
							{t < T.grab2 + 0.02 ? <Crosshair x={cross.x} y={cross.y} o={grabOn} /> : null}
						</>
					) : null}
				</>
			) : (
				<AbsoluteFill style={{transform: `translate(${540 - fc.x * camS}px, ${960 - fc.y * camS}px) scale(${camS})`, transformOrigin: '0 0'}}>
					<Win x={DW.x} y={DW.y} w={DW.w} h={DW.h} o={step(t, T.paste2 - 0.02, 0.1)}>
						<DesignBar file="Northstar · Landing" />
						{/* layers */}
						<div style={{position: 'absolute', left: 0, top: 62, width: 252, bottom: 0, background: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.08)'}}>
							<div style={{display: 'flex', gap: 18, padding: '16px 16px 10px', fontFamily: SANS, fontSize: 17, fontWeight: 650, color: '#1C1C1E'}}>
								<span>Layers</span>
								<span style={{color: '#8E8E93', fontWeight: 500}}>Assets</span>
							</div>
							<div style={{height: 1, background: 'rgba(0,0,0,0.07)', margin: '0 0 6px'}} />
							{tree.map((r, i) => (
								<TreeRow key={i} depth={r.d} icon={r.icon} name={r.name} caret={r.caret} sel={i === 0 ? selO : 0} o={step(t, T.paste2 + 0.12 + i * 0.05, 0.25)} />
							))}
						</div>
						{/* canvas */}
						<div style={{position: 'absolute', left: 252, top: 62, right: 0, bottom: 0, background: '#E9E9EC'}} />
					</Win>
					{/* the pasted frame */}
					{fly < 1 ? (
						<div style={{position: 'absolute', left: flyR.x, top: flyR.y, width: WIDE, height: HERO_H, transform: `scale(${flyR.w / WIDE})`, transformOrigin: '0 0', boxShadow: `0 ${40 * (1 - fly)}px ${80 * (1 - fly)}px rgba(10,20,60,${0.4 * (1 - fly)})`, zIndex: 50}}>
							<div style={{height: HERO_H, overflow: 'hidden'}}>
								<Hero w={WIDE} />
							</div>
						</div>
					) : (
						<>
							<div style={{position: 'absolute', left: F.x, top: F.y - 30, fontFamily: SANS, fontWeight: 600, fontSize: 17, color: SEL, display: 'flex', alignItems: 'center', gap: 6}}>
								<svg width={15} height={15} viewBox="0 0 18 18">
									<g fill="none" stroke={SEL} strokeWidth={1.8}>
										<rect x={2} y={2} width={14} height={14} rx={2} />
										<path d="M5.5 6.5h7M5.5 9h7M5.5 11.5h7" />
									</g>
								</svg>
								Hero
							</div>
							<div style={{position: 'absolute', left: F.x, top: F.y, width: fw, transform: `scale(${KF})`, transformOrigin: '0 0', zIndex: 50}}>
								<div style={{height: hOf(fw), overflow: 'hidden'}}>
									<Hero w={fw} outline={narrowU > 0.02 && narrowU < 0.98} />
								</div>
							</div>
							{/* selection */}
							<div style={{position: 'absolute', left: frameR.x, top: frameR.y, width: frameR.w, height: frameR.h, outline: `2px solid ${SEL}`, opacity: selO, zIndex: 60}}>
								{[
									[0, 0],
									[1, 0],
									[0, 1],
									[1, 1],
									[1, 0.5],
								].map(([u, v], i) => (
									<div key={i} style={{position: 'absolute', left: u * frameR.w - 7, top: (i === 4 ? (HERO_H * KF) / 2 : v * frameR.h) - 7, width: 14, height: 14, background: '#fff', border: `2px solid ${SEL}`, boxSizing: 'border-box', borderRadius: 2}} />
								))}
								<div style={{position: 'absolute', left: 0, right: 0, top: frameR.h + 12, display: 'flex', justifyContent: 'center'}}>
									<div style={{height: 30, padding: '0 10px', borderRadius: 7, background: SEL, color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 17, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
										{fw} × {hOf(fw)}
									</div>
								</div>
							</div>
						</>
					)}
					{t > T.paste2 + 0.45 ? <Pointer x={ptr.x - 4} y={ptr.y - 4} press={pressing} o={step(t, T.paste2 + 0.45, 0.2)} /> : null}
				</AbsoluteFill>
			)}
			<Keys t={t} a={T.keys2} press={T.paste2} keys={['⌘', 'V']} y={1336} scale={0.9} />
			<Toast t={t} a={T.paste2 + 0.12} b={T.resizeA + 0.4} text="Pasted as Figma layers" y={1612} />
		</AbsoluteFill>
	);
};
