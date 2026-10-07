// 3. EVEN FROM A VIDEO. -> INTO KEYNOTE.
// A conference talk playing in a video player; grab the chart slide off the stage screen on the snare; ⌘V rebuilds
// it as a real slide with a real chart; click a bar on bar 6, type 41, and it grows on the snare.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeInOut, easeOut, lerp, MONO, range, SANS, spr, step} from '../lib/tokens';
import {Traffic, Wall, Win} from './Apps';
import {barRect, BARS, EDIT, PlayerControls, screenIn, Slide, SLIDE_H, SLIDE_W, Stage} from './Talk';
import {clickAt, Crosshair, Flash, Keys, lerpRect, Marquee, path, Pointer, Rect, RebuildPill, Scan, SEL, Toast, lightPanel} from './ui';
import {T} from './T';

const PW = {x: 24, y: 520, w: 1032};
const VID_H = (1520 * PW.w) / 2688;
const PH = 52 + VID_H + 128;
const sc = screenIn(PW.w);
const SRC: Rect = {x: PW.x + sc.x, y: PW.y + 52 + sc.y, w: sc.w, h: sc.h};
const KW = {x: 24, y: 410, w: 1032, h: 1190};
const KS = 0.6;
const DST: Rect = {x: 60, y: 512, w: SLIDE_W * KS, h: SLIDE_H * KS};
const PANEL = {x: 60, y: 1088, w: 960};
const ROW = 58;

const KeyBtn: React.FC<{label: string; d: React.ReactNode}> = ({label, d}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 64}}>
		<svg width={24} height={24} viewBox="0 0 24 24" style={{color: '#3A3A3C'}}>
			{d}
		</svg>
		<span style={{fontFamily: SANS, fontSize: 12.5, fontWeight: 500, color: '#3A3A3C'}}>{label}</span>
	</div>
);

export const Scene3: React.FC<{t: number}> = ({t}) => {
	const pasted = t >= T.paste3;
	const grabOn = step(t, T.grab3On, 0.12) * (1 - step(t, T.grab3, 0.1));
	const du = range(t, [T.drag4A, T.drag4B], [0, 1], easeInOut);
	const cross = t < T.drag4A ? path(t, [[T.grab3On, SRC.x + 70, SRC.y + 60], [T.drag4A, SRC.x, SRC.y]]) : {x: lerp(SRC.x, SRC.x + SRC.w, du), y: lerp(SRC.y, SRC.y + SRC.h, du)};
	const mq: Rect = {x: SRC.x, y: SRC.y, w: cross.x - SRC.x, h: cross.y - SRC.y};
	const dragging = t >= T.drag4A && t < T.grab3 + 0.02;
	const held = t >= T.grab3 && t < T.paste3;
	const fly = step(t, T.paste3, 0.42, easeOut);
	// video time ticks while it plays
	const secs = 18 * 60 + 42 + Math.floor(Math.max(0, t - T.s3));
	const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} / 41:07`;
	// edit the bar
	const selBar = t >= T.barClick ? 1 : 0;
	const panelP = step(t, T.barClick + 0.02, 0.32);
	const cellSel = t >= T.retypeA ? 1 : 0;
	const typed = t < T.retypeA + 0.16 ? '17' : t < T.retypeA + 0.32 ? '4' : '41';
	const grown = 17 + (41 - 17) * spr(t, T.grow, 6.5, 0.5);
	const v = t < T.grow ? 17 : grown;
	const hot = step(t, T.grow, 0.2);
	const br = barRect(EDIT, 17);
	const barPt = {x: DST.x + (br.x + br.w / 2) * KS, y: DST.y + (br.y + br.h * 0.45) * KS};
	const cell = {x: PANEL.x + 770, y: PANEL.y + 70 + ROW * EDIT + ROW / 2 + 4};
	const ptr = path(t, [
		[T.paste3 + 0.5, 760, 1380],
		[T.barClick - 0.04, barPt.x, barPt.y],
		[T.barClick + 0.06, barPt.x, barPt.y],
		[T.retypeA - 0.03, cell.x, cell.y],
	]);
	const press = clickAt(t, [T.barClick, T.retypeA - 0.01]);
	// player: a push toward the talk's screen while the slide gets grabbed (zoom about the screen's center)
	const pz = 1 + 0.1 * step(t, T.s3, T.grab3 - T.s3, easeInOut);
	const PC = {x: SRC.x + SRC.w / 2, y: SRC.y + SRC.h / 2};
	const SRCz: Rect = {x: PC.x + (SRC.x - PC.x) * pz, y: PC.y + (SRC.y - PC.y) * pz, w: SRC.w * pz, h: SRC.h * pz};
	// camera: a slow drift after the paste, then a push onto the chart as the bar gets clicked, a punch on the snare
	const push = step(t, T.barClick - 0.3, 0.6, easeInOut);
	const camS = 1 + 0.03 * range(t, [T.paste3 + 0.3, T.s4], [0, 1], (x) => x) + 0.1 * push + 0.03 * Math.exp(-Math.max(0, t - T.grow) / 0.1) * (t >= T.grow ? 1 : 0); // <= 1.13: the panel's value column stays in frame
	const focus = {x: lerp(540, barPt.x, push), y: lerp(860, DST.y + DST.h * 0.62, push)};
	const anchorY = lerp(900, 840, push);
	// Play on beat 4: the slide leaves the editor and fills the screen, presenter-style
	const playP = step(t, T.play, 0.32, easeInOut);
	const camTx = 540 - focus.x * camS;
	const camTy = anchorY - focus.y * camS;
	const onScreen: Rect = {x: camTx + camS * DST.x, y: camTy + camS * DST.y, w: camS * DST.w, h: camS * DST.h};
	const breathe = 1 + 0.03 * range(t, [T.play + 0.32, T.s4], [0, 1], (x) => x);
	const FULL: Rect = {x: 540 - 540 * breathe, y: 960 - ((1080 * SLIDE_H) / SLIDE_W / 2) * breathe, w: 1080 * breathe, h: ((1080 * SLIDE_H) / SLIDE_W) * breathe};
	const playR = lerpRect(onScreen, FULL, playP);
	// the grabbed slide flies from the (zoomed) player screen into the slide well, in the editor's camera space
	const toCam = (r: Rect): Rect => ({x: (r.x - camTx) / camS, y: (r.y - camTy) / camS, w: r.w / camS, h: r.h / camS});
	const flyR = lerpRect(toCam(SRCz), DST, fly);
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Wall dim={0.06} />
			{!pasted ? (
				<AbsoluteFill style={{transform: `translate(${PC.x - PC.x * pz}px, ${PC.y - PC.y * pz}px) scale(${pz})`, transformOrigin: '0 0'}}>
					<Win x={PW.x} y={PW.y} w={PW.w} h={PH} dark>
						<div style={{height: 52, display: 'flex', alignItems: 'center', padding: '0 18px', position: 'relative', background: '#232326'}}>
							<Traffic />
							<div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 18, color: 'rgba(255,255,255,0.85)'}}>Growth Summit 2026 · Talks</div>
						</div>
						<div style={{position: 'relative', width: PW.w, height: VID_H, background: '#000'}}>
							<Stage w={PW.w} zoom={1} />
							<PlayerControls w={PW.w} time={time} prog={0.455 + 0.0004 * Math.max(0, t - T.s3)} />
						</div>
						<div style={{padding: '18px 24px', fontFamily: SANS}}>
							<div style={{fontSize: 24, fontWeight: 650, color: '#F5F5F7', letterSpacing: '-0.015em'}}>The new funnel: where growth really comes from</div>
							<div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 12}}>
								<div style={{width: 34, height: 34, borderRadius: 17, background: 'linear-gradient(135deg, #7FA2FF, #3F3BEA)'}} />
								<div style={{fontSize: 17, fontWeight: 600, color: 'rgba(245,245,247,0.85)'}}>Growth Summit</div>
								<div style={{fontSize: 16, color: 'rgba(245,245,247,0.5)'}}>48K views · 2 days ago</div>
							</div>
						</div>
					</Win>
					<Flash r={SRC} t={t} a={T.grab3} />
					<Scan r={SRC} p={range(t, [T.grab3, T.paste3 - 0.1], [0, 1], (x) => x)} strength={0.85} />
					{/* above the player: the ⌘V keys sit below it */}
					<RebuildPill cx={540} y={PW.y - 70} t={t} a={T.grab3 + 0.02} b={T.paste3 - 0.06} />
					{grabOn > 0 || held ? (
						<>
							{dragging || held ? (
								<Marquee r={held ? SRC : mq} dim={grabOn} frame={held ? 1 - step(t, T.paste3 - 0.12, 0.1) : 1} label={dragging ? `${Math.round(1600 * du)} × ${Math.round(900 * du)}` : undefined} labelO={grabOn} />
							) : (
								<div style={{position: 'absolute', inset: 0, background: `rgba(8,10,20,${0.42 * grabOn})`, zIndex: 250}} />
							)}
							{t < T.grab3 + 0.02 ? <Crosshair x={cross.x} y={cross.y} o={grabOn} /> : null}
						</>
					) : null}
				</AbsoluteFill>
			) : (
				<>
				<AbsoluteFill style={{transform: `translate(${camTx}px, ${camTy}px) scale(${camS})`, transformOrigin: '0 0'}}>
					<Win x={KW.x} y={KW.y} w={KW.w} h={KW.h} o={step(t, T.paste3 - 0.02, 0.1)}>
						<div style={{height: 64, background: '#ECECEE', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 8, position: 'relative'}}>
							<Traffic />
							<div style={{width: 20}} />
							<KeyBtn label="Play" d={<path d="M8 5v14l11-7Z" fill="currentColor" />} />
							<div style={{marginLeft: 'auto', display: 'flex', gap: 2}}>
								<KeyBtn label="Table" d={<g fill="none" stroke="currentColor" strokeWidth={1.7}><rect x={3} y={4} width={18} height={16} rx={2} /><path d="M3 10h18M3 15h18M9 4v16" /></g>} />
								<KeyBtn label="Chart" d={<g fill="currentColor"><rect x={4} y={12} width={4} height={8} rx={1} /><rect x={10} y={6} width={4} height={14} rx={1} /><rect x={16} y={9} width={4} height={11} rx={1} /></g>} />
								<KeyBtn label="Text" d={<path d="M5 6h14M12 6v13" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />} />
								<KeyBtn label="Shape" d={<g fill="none" stroke="currentColor" strokeWidth={1.7}><rect x={3} y={9} width={11} height={11} rx={2} /><circle cx={16} cy={8} r={5} /></g>} />
								<KeyBtn label="Media" d={<g fill="none" stroke="currentColor" strokeWidth={1.7}><rect x={3} y={5} width={18} height={14} rx={2} /><path d="M3 16l5-5 4 4 3-3 6 6" /></g>} />
							</div>
							<div style={{marginLeft: 'auto', display: 'flex', gap: 2}}>
								<KeyBtn label="Format" d={<path d="M5 19 14 6l3 2-9 13H5Z" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />} />
								<KeyBtn label="Animate" d={<g fill="none" stroke="currentColor" strokeWidth={1.7}><circle cx={9} cy={12} r={5} /><path d="M15 7a6 6 0 0 1 0 10" /></g>} />
							</div>
						</div>
						<div style={{position: 'absolute', left: 0, right: 0, top: 64, bottom: 0, background: '#CFD0D4'}} />
						<div style={{position: 'absolute', left: DST.x - KW.x, top: DST.y - KW.y, width: DST.w, height: DST.h, background: '#fff', boxShadow: '0 4px 18px rgba(0,0,0,0.18)'}} />
					</Win>
					{/* the rebuilt slide */}
					<div style={{position: 'absolute', left: flyR.x, top: flyR.y, width: SLIDE_W, height: SLIDE_H, transform: `scale(${flyR.w / SLIDE_W})`, transformOrigin: '0 0', boxShadow: fly < 1 ? `0 ${40 * (1 - fly)}px ${80 * (1 - fly)}px rgba(10,20,60,${0.45 * (1 - fly)})` : undefined, zIndex: 40, opacity: playP > 0 ? 0 : 1}}>
						<Slide v={v} sel={selBar} hot={hot} />
					</div>
					{/* chart data */}
					{panelP > 0 ? (
						<div style={{position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, borderRadius: 18, ...lightPanel, opacity: clamp01(panelP * 1.4), transform: `translateY(${(1 - panelP) * 30}px)`, zIndex: 60, overflow: 'hidden', fontFamily: SANS}}>
							<div style={{height: 62, display: 'flex', alignItems: 'center', padding: '0 24px', fontSize: 21, fontWeight: 680, color: '#1C1C1E', borderBottom: '1px solid rgba(0,0,0,0.08)'}}>
								Chart Data
								<span style={{marginLeft: 'auto', fontSize: 16, fontWeight: 500, color: '#8E8E93'}}>Revenue by channel</span>
							</div>
							{BARS.map((b, i) => {
								const isE = i === EDIT;
								return (
									<div key={b.k} style={{height: ROW, display: 'flex', alignItems: 'center', borderBottom: i < BARS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : undefined, background: isE ? 'rgba(47,107,255,0.06)' : undefined}}>
										<div style={{width: 600, padding: '0 24px', fontSize: 20, fontWeight: 520, color: '#1C1C1E'}}>{b.k}</div>
										<div style={{flex: 1, height: ROW - 14, margin: '0 16px 0 0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 16px', fontFamily: MONO, fontSize: 21, color: '#1C1C1E', boxShadow: isE && cellSel ? `0 0 0 3px ${SEL}` : 'inset 0 0 0 1px rgba(0,0,0,0.08)', background: '#fff'}}>
											{isE && cellSel ? (
												<>
													<span style={{background: typed === '17' ? 'rgba(47,107,255,0.25)' : undefined}}>{t >= T.grow ? '41' : typed}</span>
													{t < T.grow && typed !== '17' ? <span style={{display: 'inline-block', width: 2.5, height: 24, background: SEL, marginLeft: 2}} /> : null}
												</>
											) : (
												b.v
											)}
										</div>
									</div>
								);
							})}
						</div>
					) : null}
					{t > T.paste3 + 0.5 ? <Pointer x={ptr.x - 4} y={ptr.y - 4} press={press} o={step(t, T.paste3 + 0.5, 0.2) * (1 - playP)} /> : null}
				</AbsoluteFill>
				{playP > 0 ? (
					<>
						<AbsoluteFill style={{background: '#000', opacity: playP, zIndex: 70}} />
						<div style={{position: 'absolute', left: playR.x, top: playR.y, width: SLIDE_W, height: SLIDE_H, transform: `scale(${playR.w / SLIDE_W})`, transformOrigin: '0 0', zIndex: 71, boxShadow: `0 30px 90px rgba(0,0,0,${0.5 * (1 - playP)})`}}>
							<Slide v={41} hot={1} />
						</div>
					</>
				) : null}
				</>
			)}
			<Keys t={t} a={T.keys3} press={T.paste3} keys={['⌘', 'V']} y={1336} scale={0.9} />
			<Toast t={t} a={T.paste3 + 0.12} b={T.barClick + 0.3} text="Pasted as a Keynote slide" y={1626} />
		</AbsoluteFill>
	);
};
