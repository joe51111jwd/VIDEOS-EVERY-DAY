import React from 'react';
import {C, F, E, clamp, prog, spr} from '../lib/theme';
import {at} from './beats';
import {Page, Plate} from '../type/Page';
import {Typed} from '../type/Typed';
import {Mark, Wordmark} from '../ap/Brand';
import {BlenderUI} from '../apps/Blender';
import {SheetApp} from '../apps/Sheet';
import {EditorApp} from '../apps/Editor';
import {CodeApp} from '../apps/Code';
import {donutFrame} from './SApps';

/** "PASTE IT." on "touch it", "WATCH IT GET DONE." on "bring it" */
export const SClose: React.FC<{t: number}> = ({t}) => (
	<Page t={t - at(56) + 1} index="07" label="TUTORIAL AUTOPILOT">
		<Typed
			t={t}
			x={96}
			y={300}
			size={150}
			cps={44}
			keys={[
				{t: at(56), text: 'PASTE IT.'},
				{t: at(57), text: 'PASTE IT.\nWATCH IT ~GET DONE~.'},
			]}
		/>
	</Page>
);

const MX = 96;
const MY = 236;
const MS = 176;
const WX = MX + MS + 44;

/** construction-view logo on "leave it" (the wordmark types right behind it), the line on "start", everything locks in on "format it" */
export const LOGO_IN = () => at(61);
export const SLogo: React.FC<{t: number}> = ({t}) => {
	const IN = LOGO_IN();
	const lock = at(63);
	const guides = 1 - prog(t, lock - 0.02, lock + 0.08);
	const draw = (d: number) => prog(t, IN + d, IN + d + 0.35, E.out);
	const flash = clamp(1 - (t - lock) / 0.18) * (t >= lock ? 1 : 0);
	const hl = (y: number, d: number) => <div style={{position: 'absolute', left: 0, top: y, width: 1920 * draw(d), borderTop: `1.5px dashed ${C.guide}`}} />;
	const vl = (x: number, d: number) => <div style={{position: 'absolute', left: x, top: 0, height: 1080 * draw(d), borderLeft: `1.5px dashed ${C.guide}`}} />;
	const anchor = (x: number, y: number, d: number) => <div style={{position: 'absolute', left: x - 6, top: y - 6, width: 12, height: 12, border: `2px solid ${C.orange}`, background: C.paper, transform: `scale(${spr(t, IN + d, 30, 0.6)})`}} />;
	const lbl = (x: number, y: number, s: string, d: number) => <div style={{position: 'absolute', left: x, top: y, fontFamily: F.mono, fontSize: 18, color: C.orange, opacity: prog(t, IN + d, IN + d + 0.1)}}>{s}</div>;
	const plates = [
		<BlenderUI key="b" s={{stage: 'final', frame: 112, shading: 'rendered', active: 'Sprinkles', objects: ['Donut', 'Icing', 'Sprinkles', 'Plate'], modifiers: [], tab: 'mat', material: {name: 'Icing', color: '#F39AB8'}}} />,
		<SheetApp key="s" t={99} k={{create: 0, rows: 0, values: 0, cols: 0, format: 0}} />,
		<EditorApp key="e" t={99} k={{cut: 0, lift: 0, zoom: 0, frameSrc: donutFrame}} />,
		<CodeApp key="c" t={99} k={{type: 0, typeDur: 0.1, build: 0, deploy: 0, live: 0}} />,
	];
	const PW = 414;
	const PH = (PW * 9) / 16;
	return (
		<Page t={t - IN + 1} index="08" label="TUTORIAL AUTOPILOT" lockup={false}>
			{guides > 0 ? (
				<div style={{position: 'absolute', inset: 0, opacity: guides}}>
					{hl(MY, 0)}
					{hl(MY + MS, 0.05)}
					{hl(MY + MS * 0.76, 0.1)}
					{vl(MX, 0)}
					{vl(MX + MS, 0.06)}
					{vl(WX, 0.12)}
					{anchor(MX, MY, 0.1)}
					{anchor(MX + MS, MY, 0.14)}
					{anchor(MX, MY + MS, 0.18)}
					{anchor(MX + MS, MY + MS, 0.22)}
					{anchor(WX, MY + MS * 0.76, 0.26)}
					{lbl(MX + 12, MY - 34, `x ${MX}  y ${MY}`, 0.2)}
					{lbl(WX + 12, MY + MS * 0.76 + 12, 'baseline', 0.3)}
					{lbl(MX + MS + 12, MY + MS + 12, `${MS} × ${MS}`, 0.34)}
				</div>
			) : null}
			<div style={{position: 'absolute', left: MX, top: MY}}>
				<Mark size={MS} t={t} t0={IN} build />
			</div>
			<div style={{position: 'absolute', left: WX, top: MY + MS * 0.72 - 132 * 0.8}}>
				<div style={{visibility: 'hidden'}}>
					<Wordmark size={132} />
				</div>
				<Typed t={t} x={0} y={0} size={132} font={F.head} weight={600} lineHeight={1} cps={40} keys={[{t: IN + 0.2, text: 'Tutorial Autopilot'}]} />
			</div>
			<Typed t={t} x={MX} y={MY + MS + 54} size={58} cps={56} keys={[{t: at(62), text: 'STOP PAUSING ~TUTORIALS~.'}]} />
			{t >= lock ? (
				<div style={{position: 'absolute', left: MX, top: 700, display: 'flex', gap: 24}}>
					{plates.map((p, i) => {
						const s = spr(t, lock + i * 0.03, 26, 0.68);
						return (
							<div key={i} style={{position: 'relative', width: PW, height: PH, transform: `translateY(${(1 - s) * 60}px) scale(${0.9 + 0.1 * s})`, opacity: clamp(s * 2)}}>
								<Plate box={{x: 0, y: 0, w: PW, h: PH}} radius={10}>
									{p}
								</Plate>
								<div style={{position: 'absolute', right: -12, top: -12, width: 40, height: 40, borderRadius: 20, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<svg width="22" height="22" viewBox="0 0 14 14">
										<path d="M3 7.2 L6 10 L11 4" fill="none" stroke="#160C06" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</div>
							</div>
						);
					})}
				</div>
			) : null}
			{flash > 0 ? <div style={{position: 'absolute', inset: 0, background: C.orange, opacity: 0.18 * flash, mixBlendMode: 'multiply'}} /> : null}
		</Page>
	);
};
