import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, E, clamp, lerp, prog, pulse, spr} from '../lib/theme';
import {at} from './beats';
import {Page} from '../type/Page';
import {Typed} from '../type/Typed';
import {PasteBar} from '../ap/Paste';
import {AP, TutorialPlayer} from '../ap/Panel';
import {BlenderUI} from '../apps/Blender';
import {DONUT, STEP_LIST} from './data';

const thumb = <BlenderUI s={{stage: 'sprinkles', frame: 96, shading: 'material', active: 'Sprinkles', objects: ['Donut', 'Icing', 'Sprinkles'], modifiers: [], tab: 'mat', material: {name: 'Icing', color: '#F39AB8'}}} />;

/** the steps it wrote: rows type in one group per beat, the count gets its check on verb 22 */
const StepsCard: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => {
	const t0 = at(20);
	const show = clamp(spr(t, t0 - 0.05, 24, 0.8));
	const rowH = 54;
	const groups = [at(20), at(21), at(22)];
	// rows 0..5 on load, 6..11 on check, then it races to 41 on verb 23
	const rowBirth = (i: number) => (i < 6 ? groups[0] + i * 0.05 : i < 12 ? groups[1] + (i - 6) * 0.05 : groups[2] + (i - 12) * 0.012);
	const n = STEP_LIST.length;
	const total = 41;
	const scroll = Math.max(0, lerp(0, n - 9, prog(t, at(22), at(22) + 0.35, E.inOut)));
	const found = Math.min(total, Math.floor(t < at(22) ? STEP_LIST.filter((_, i) => t >= rowBirth(i)).length : lerp(12, total, prog(t, at(22), at(22) + 0.35))));
	const press = pulse(t, at(23), 0.05, 0.25);
	const pos = lerp(0, DONUT.dur, prog(t, at(20), at(22) + 0.4, (p) => p));
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 860, borderRadius: 26, background: AP.bg, color: AP.text, fontFamily: F.ui, boxShadow: '0 40px 100px rgba(18,16,16,0.35), 0 10px 30px rgba(18,16,16,0.25)', overflow: 'hidden', transform: `translateY(${(1 - show) * 40}px)`, opacity: show}}>
			<div style={{display: 'flex', gap: 24, padding: '24px 26px', alignItems: 'center', borderBottom: `1px solid ${AP.line}`}}>
				<TutorialPlayer w={270} pos={pos} dur={DONUT.dur} radius={10}>
					{thumb}
				</TutorialPlayer>
				<div style={{flex: 1, minWidth: 0}}>
					<div style={{fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15}}>{DONUT.title}</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, fontFamily: F.mono, fontSize: 22, color: t >= at(21) ? C.orange : AP.dim}}>
						<span>{String(found).padStart(2, '0')} STEPS</span>
						{t >= at(21) ? (
							<svg width={30} height={30} viewBox="0 0 14 14" style={{transform: `scale(${0.5 + 0.5 * spr(t, at(21), 26, 0.55)})`}}>
								<circle cx="7" cy="7" r="7" fill={C.orange} />
								<path d="M3.6 7.2 L6 9.6 L10.6 4.6" fill="none" stroke={AP.bg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						) : null}
					</div>
				</div>
			</div>
			<div style={{height: rowH * 8, overflow: 'hidden', position: 'relative'}}>
				<div style={{transform: `translateY(${-scroll * rowH}px)`}}>
					{STEP_LIST.map((s, i) => {
						const b = rowBirth(i);
						if (t < b) return <div key={i} style={{height: rowH}} />;
						const chars = Math.floor((t - b) * 140);
						const fresh = t - b < 0.12;
						return (
							<div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', fontFamily: F.mono, fontSize: 25, letterSpacing: '-0.02em', borderBottom: `1px solid ${AP.line}`}}>
								<span style={{color: fresh ? C.orange : AP.faint, width: 34}}>{String(i + 1).padStart(2, '0')}</span>
								<span style={{color: fresh ? C.orange : AP.text}}>{s.slice(0, chars)}</span>
							</div>
						);
					})}
				</div>
			</div>
			<div style={{display: 'flex', gap: 14, padding: '18px 26px 22px', borderTop: `1px solid ${AP.line}`}}>
				<div style={{flex: 1, padding: '15px 0', textAlign: 'center', borderRadius: 14, background: C.orange, color: '#160C06', fontSize: 24, fontWeight: 650, transform: `scale(${1 - 0.06 * press})`, boxShadow: press > 0 ? `0 0 0 ${10 * press}px rgba(255,91,26,0.25)` : 'none'}}>Do it for me</div>
				<div style={{flex: 1, padding: '15px 0', textAlign: 'center', borderRadius: 14, background: '#2A2522', fontSize: 24, fontWeight: 600}}>Teach me</div>
			</div>
		</div>
	);
};

/** "PASTE ANY TUTORIAL." (cut on verb 18, the link lands on verb 19, resolves on verb 20),
 *  then "IT WRITES THE STEPS." on verb 21; "Do it for me" goes down on verb 24 */
export const SPaste: React.FC<{t: number}> = ({t}) => {
	const t0 = at(17);
	const stepsOn = t >= at(20) - 0.05;
	const barOut = prog(t, at(20) - 0.12, at(20) + 0.1, E.in);
	return (
		<Page t={t - t0 + 1} index="03" label="HOW IT WORKS">
			<Typed
				t={t}
				x={96}
				y={190}
				size={120}
				keys={[
					{t: t0, text: 'PASTE ANY\nTUTORIAL.', cps: 44},
					{t: at(20), text: 'PASTE ANY\nTUTORIAL.\n\n~IT WRITES~\n~THE STEPS.~', cps: 44},
				]}
			/>
			{barOut < 1 ? (
				<AbsoluteFill style={{opacity: 1 - barOut}}>
					<div style={{position: 'absolute', left: 584, top: 500}}>
						<PasteBar t={t} paste={at(18)} resolve={at(19)} thumb={thumb} />
					</div>
				</AbsoluteFill>
			) : null}
			{stepsOn ? <StepsCard t={t} x={964} y={160} /> : null}
		</Page>
	);
};
