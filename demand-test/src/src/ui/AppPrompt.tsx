import React from 'react';
import {C, F, E, clamp, kf, prog, spr} from '../lib/theme';
import {Mark, Pointer, Typed, pop} from './kit';

export const IDEA = 'Socks that never lose their pair.';

/** the app header row shared by the Demand Test screens */
export const AppHeader: React.FC<{w: number; crumb?: string}> = ({w, crumb}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: w, height: 84, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 14, fontFamily: F.ui}}>
		<Mark size={36} />
		<div style={{fontSize: 22, fontWeight: 650, letterSpacing: -0.4, color: C.text}}>Demand Test</div>
		{crumb ? <div style={{fontSize: 20, color: C.sub, marginLeft: 6}}>/ {crumb}</div> : null}
		<div style={{flex: 1}} />
		<div style={{fontSize: 18, color: C.sub, marginRight: 26}}>Tests</div>
		<div style={{fontSize: 18, color: C.sub, marginRight: 26}}>Results</div>
		<div style={{width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg,#d9cbb8,#9c8a74)'}} />
	</div>
);

/** S1: type the idea, set a budget, run it. tType = typing starts, tClick = button pressed */
export const AppPrompt: React.FC<{t: number; w: number; h: number; tType: number; tClick: number}> = ({t, w, h, tType, tClick}) => {
	const cx = w / 2;
	const typedEnd = tType + IDEA.length / 30;
	const down = clamp(1 - Math.abs(t - tClick) / 0.09);
	const pressed = t >= tClick;
	// pointer glides from the input to the button just before the click
	const px = kf(t, [typedEnd, tClick - 0.05], [cx + 420, cx + 330], E.inOut);
	const py = kf(t, [typedEnd, tClick - 0.05], [h * 0.45, h * 0.79], E.inOut);
	const opts: [string, string][] = [
		['Budget', '$50'],
		['Runs', 'Overnight'],
		['Price', 'Let it test'],
	];
	return (
		<div style={{position: 'absolute', inset: 0, background: C.page, fontFamily: F.ui}}>
			<AppHeader w={w} crumb="New test" />
			<div style={{position: 'absolute', left: 0, top: h * 0.17, width: w, textAlign: 'center', fontSize: 64, fontWeight: 640, letterSpacing: -2, color: C.text}}>What do you want to sell?</div>
			<div
				style={{
					position: 'absolute',
					left: cx - 560,
					top: h * 0.33,
					width: 1120,
					height: 150,
					borderRadius: 22,
					border: `2px solid ${C.text}`,
					boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
					padding: '34px 40px',
					boxSizing: 'border-box',
					fontSize: 52,
					fontWeight: 500,
					letterSpacing: -1.2,
					color: C.text,
				}}
			>
				<Typed text={IDEA} t={t} t0={tType} cps={30} />
			</div>
			<div style={{position: 'absolute', left: cx - 560, top: h * 0.33 + 186, width: 1120, display: 'flex', gap: 16}}>
				{opts.map(([k, v], i) => (
					<div key={k} style={{...pop(t, typedEnd + i * 0.08 - 0.25, 0.3, 14), flex: 1, height: 72, borderRadius: 16, background: C.ui, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, fontSize: 24}}>
						<span style={{color: C.sub}}>{k}</span>
						<span style={{fontWeight: 600, color: C.text}}>{v}</span>
					</div>
				))}
			</div>
			<div
				style={{
					position: 'absolute',
					left: cx - 230,
					top: h * 0.74,
					width: 460,
					height: 84,
					borderRadius: 42,
					background: pressed ? C.go : C.text,
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 14,
					fontSize: 30,
					fontWeight: 600,
					transform: `scale(${1 - down * 0.05 + (pressed ? 0.04 * Math.sin(clamp((t - tClick) / 0.3) * Math.PI) : 0)})`,
				}}
			>
				{pressed ? 'Testing overnight' : 'Run the test'}
				<span style={{fontSize: 30}}>{pressed ? '' : '→'}</span>
			</div>
			{t > typedEnd - 0.1 && t < tClick + 0.6 ? <Pointer x={px} y={py} down={down} /> : null}
			{pressed ? (
				<div style={{position: 'absolute', left: cx - 230, top: h * 0.74, width: 460, height: 84, borderRadius: 42, boxShadow: `0 0 0 ${spr(t, tClick, 10, 0.8) * 26}px rgba(20,164,77,${0.35 * (1 - prog(t, tClick, tClick + 0.6))})`}} />
			) : null}
		</div>
	);
};
