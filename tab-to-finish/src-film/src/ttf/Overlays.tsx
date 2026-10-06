import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TabGlyph} from './Mac';
import {clamp01, easeInOut, easeOut, FPS, GREEN, lerp, SANS, spr, step} from './tokens';

const darkGlass: React.CSSProperties = {
	background: 'linear-gradient(180deg, rgba(48,48,54,0.9) 0%, rgba(22,22,26,0.93) 100%)',
	boxShadow: '0 18px 44px rgba(10,15,40,0.32), 0 4px 12px rgba(10,15,40,0.2), inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.16)',
	backdropFilter: undefined,
};

/** a small keycap glyph used inside pills */
export const MiniKey: React.FC<{h: number; press?: number; children?: React.ReactNode}> = ({h, press = 0, children}) => (
	<div
		style={{
			height: h,
			minWidth: h * 1.25,
			padding: `0 ${h * 0.18}px`,
			boxSizing: 'border-box',
			borderRadius: h * 0.24,
			background: `linear-gradient(180deg, rgba(255,255,255,${0.2 + 0.1 * press}) 0%, rgba(255,255,255,0.1) 100%)`,
			boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.22), 0 ${2 - 1.6 * press}px 0 rgba(0,0,0,0.45)`,
			transform: `translateY(${press * 1.6}px)`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}
	>
		{children ?? <TabGlyph size={h * 0.68} color="#fff" weight={2.4} />}
	</div>
);

/** "⇥ Tab to do the other 198": appears by the cursor */
export const TabPill: React.FC<{x: number; y: number; p: number; press: number; go: number}> = ({x, y, p, press, go}) => {
	if (p <= 0) return null;
	const H = 46;
	const glow = clamp01(press) * (1 - go);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				height: H,
				borderRadius: H / 2,
				...darkGlass,
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				padding: '0 20px 0 9px',
				fontFamily: SANS,
				opacity: clamp01(p) * (1 - go),
				transform: `translateY(${(1 - p) * 6}px) scale(${(0.96 + 0.04 * p) * (1 + 0.04 * glow) * (1 - 0.06 * go)})`,
				transformOrigin: '0 50%',
				whiteSpace: 'nowrap',
				zIndex: 150,
			}}
		>
			<MiniKey h={30} press={press} />
			<div style={{fontSize: 18.5, fontWeight: 560, letterSpacing: '-0.012em', color: '#F5F5F7'}}>
				Tab to do the other <span style={{fontWeight: 700}}>198</span>
			</div>
			{glow > 0 ? <div style={{position: 'absolute', inset: -2, borderRadius: H, boxShadow: `0 0 0 ${3 * glow}px rgba(120,160,255,${0.5 * glow}), 0 0 30px rgba(110,150,255,${0.5 * glow})`}} /> : null}
		</div>
	);
};

const Spinner: React.FC<{size: number; done: number}> = ({size, done}) => {
	const f = useCurrentFrame();
	const a = (f / FPS) * 360 * 1.4;
	return (
		<div style={{width: size, height: size, position: 'relative'}}>
			<svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', inset: 0, opacity: 1 - done, transform: `rotate(${a}deg)`}}>
				<circle cx={12} cy={12} r={9} stroke="rgba(255,255,255,0.18)" strokeWidth={2.6} fill="none" />
				<path d="M12 3a9 9 0 0 1 9 9" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" />
			</svg>
			<div style={{position: 'absolute', inset: 0, borderRadius: size / 2, background: GREEN, transform: `scale(${done})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<svg width={size * 0.62} height={size * 0.62} viewBox="0 0 12 12">
					<path d="M2.6 6.3 5 8.6l4.5-5" stroke="#fff" strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={12} strokeDashoffset={12 * (1 - clamp01(done * 1.4 - 0.4))} />
				</svg>
			</div>
		</div>
	);
};

/** progress pill while it works; morphs into the done pill */
export const StatusPill: React.FC<{cx: number; y: number; p: number; n: number; done: number; flagged: number; elapsed: number; out?: number}> = ({cx, y, p, n, done, flagged, elapsed, out = 0}) => {
	if (p <= 0) return null;
	const H = 54;
	const w1 = 372;
	const w2 = 452;
	const w = lerp(w1, w2, easeInOut(done));
	const prog = clamp01((n - 2) / 198);
	const a = clamp01(1 - done * 2.2);
	const b = clamp01(done * 2 - 0.6);
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - w / 2,
				top: y,
				width: w,
				height: H,
				borderRadius: H / 2,
				...darkGlass,
				fontFamily: SANS,
				color: '#F5F5F7',
				opacity: clamp01(p) * (1 - out),
				transform: `translateY(${(1 - p) * -12}px) scale(${0.94 + 0.06 * p})`,
				overflow: 'hidden',
				zIndex: 150,
			}}
		>
			<div style={{position: 'absolute', left: 14, top: (H - 26) / 2}}>
				<Spinner size={26} done={easeOut(clamp01(done * 1.6))} />
			</div>
			<div style={{position: 'absolute', left: 54, right: 16, top: 0, height: H, display: 'flex', alignItems: 'center', opacity: a, whiteSpace: 'nowrap', fontSize: 17.5, fontWeight: 560, letterSpacing: '-0.01em'}}>
				Finishing
				<span style={{marginLeft: 8, color: 'rgba(245,245,247,0.6)', fontVariantNumeric: 'tabular-nums'}}>
					{Math.floor(n)} of 200
				</span>
				<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(245,245,247,0.55)'}}>
					<MiniKey h={22}>
						<span style={{fontSize: 11, fontWeight: 600, color: '#fff'}}>esc</span>
					</MiniKey>
					to stop
				</div>
			</div>
			<div style={{position: 'absolute', left: 54, right: 16, top: 0, height: H, display: 'flex', alignItems: 'center', gap: 10, opacity: b, whiteSpace: 'nowrap', fontSize: 17.5, fontWeight: 560, letterSpacing: '-0.01em', transform: `translateY(${(1 - b) * 8}px)`}}>
				<span>198 done</span>
				<span style={{color: 'rgba(245,245,247,0.35)'}}>·</span>
				<span style={{display: 'flex', alignItems: 'center', gap: 7, color: '#FFD08A'}}>
					<span style={{width: 8, height: 8, borderRadius: 4, background: '#F2A33A', display: 'inline-block'}} />
					{flagged} flagged
				</span>
				<span style={{color: 'rgba(245,245,247,0.35)'}}>·</span>
				<span style={{color: 'rgba(245,245,247,0.7)', fontVariantNumeric: 'tabular-nums'}}>{elapsed}s</span>
			</div>
			<div style={{position: 'absolute', left: 0, bottom: 0, height: 3, width: `${prog * 100}%`, background: 'linear-gradient(90deg, #6E9BFF, #9DBBFF)', opacity: 1 - done}} />
		</div>
	);
};

/** big physical tab key, bottom centre, for the press moment (screen space) */
export const Keycap: React.FC<{t: number; a: number; press: number; scale?: number; bottom?: number}> = ({t, a, press, scale = 1, bottom = 70}) => {
	const inP = spr(t, a, 5, 0.7);
	const outP = step(t, press + 0.38, 0.32, easeInOut);
	if (t < a || outP >= 1) return null;
	const down = clamp01(1 - Math.abs(t - press - 0.05) / 0.11) ** 0.7 * (t > press - 0.06 ? 1 : 0);
	const W = 230 * scale;
	const H = 150 * scale;
	return (
		<>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 420 * scale, zIndex: 159, background: 'linear-gradient(180deg, rgba(8,10,24,0) 0%, rgba(8,10,24,0.42) 100%)', opacity: clamp01(inP * 1.5) * (1 - outP)}} />
		<div style={{position: 'absolute', left: '50%', bottom, width: 0, height: 0, zIndex: 160}}>
			<div
				style={{
					position: 'absolute',
					left: -W / 2,
					top: -H,
					width: W,
					height: H,
					opacity: clamp01(inP * 1.5) * (1 - outP),
					transform: `translateY(${(1 - inP) * 60 * scale + down * 9 * scale}px) scale(${(0.9 + 0.1 * inP) * (1 - 0.1 * outP)})`,
				}}
			>
				{/* key well shadow */}
				<div style={{position: 'absolute', left: 6 * scale, right: 6 * scale, top: 14 * scale, bottom: -10 * scale, borderRadius: 28 * scale, background: 'rgba(0,0,0,0.5)', filter: `blur(${(22 - 12 * down) * scale}px)`}} />
				{/* key side */}
				<div style={{position: 'absolute', inset: 0, top: (10 + 7 * down) * scale, borderRadius: 26 * scale, background: 'linear-gradient(180deg, #CFCFD4, #A9A9B0)'}} />
				{/* key top */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: down * 7 * scale,
						height: H - 10 * scale,
						borderRadius: 26 * scale,
						background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F1F4 60%, #E6E6EA 100%)',
						boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -2px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.08)',
					}}
				>
					<div style={{position: 'absolute', left: 24 * scale, top: 18 * scale}}>
						<TabGlyph size={46 * scale} color="#2A2A2E" weight={1.9} />
					</div>
					<div style={{position: 'absolute', left: 26 * scale, bottom: 18 * scale, fontFamily: SANS, fontSize: 30 * scale, fontWeight: 500, color: '#2A2A2E', letterSpacing: '-0.01em'}}>tab</div>
				</div>
			</div>
		</div>
		</>
	);
};

/** big caption pill (screen space), ≤ 6 words */
export const Caption: React.FC<{t: number; a: number; b: number; text: React.ReactNode; size?: number; bottom?: number}> = ({t, a, b, text, size = 44, bottom = 64}) => {
	const inP = step(t, a, 0.45);
	const outP = step(t, b - 0.28, 0.28, easeInOut);
	if (t < a || t > b) return null;
	const H = size * 1.95;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', zIndex: 170, pointerEvents: 'none'}}>
			<div
				style={{
					height: H,
					borderRadius: H / 2,
					padding: `0 ${size * 0.82}px`,
					...darkGlass,
					display: 'flex',
					alignItems: 'center',
					fontFamily: SANS,
					fontSize: size,
					fontWeight: 600,
					letterSpacing: '-0.022em',
					color: '#F5F5F7',
					whiteSpace: 'nowrap',
					opacity: inP * (1 - outP),
					transform: `translateY(${(1 - inP) * 16 - outP * 6}px) scale(${0.95 + 0.05 * inP})`,
					filter: inP < 1 ? `blur(${(1 - inP) * 6}px)` : undefined,
				}}
			>
				{text}
			</div>
		</div>
	);
};

/** the product's app icon: graphite squircle with the tab arrow */
export const AppIcon: React.FC<{size: number; glow?: number}> = ({size, glow = 0}) => (
	<div style={{width: size, height: size, position: 'relative', flexShrink: 0}}>
		{glow > 0 ? <div style={{position: 'absolute', inset: -size * 0.4, borderRadius: '50%', background: 'radial-gradient(circle, rgba(110,150,255,0.5) 0%, rgba(110,150,255,0) 68%)', opacity: glow, filter: `blur(${size * 0.1}px)`}} /> : null}
		<div
			style={{
				position: 'absolute',
				inset: 0,
				borderRadius: size * 0.235,
				background: 'linear-gradient(180deg, #4A4A52 0%, #1E1E22 58%, #0E0E10 100%)',
				boxShadow: `0 ${size * 0.06}px ${size * 0.14}px rgba(0,0,0,0.45), inset 0 0 0 ${Math.max(1, size * 0.01)}px rgba(255,255,255,0.2), inset 0 ${size * 0.012}px 0 rgba(255,255,255,0.28)`,
				overflow: 'hidden',
			}}
		>
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 50% 0%, rgba(255,255,255,0.22), rgba(255,255,255,0) 60%)'}} />
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{filter: `drop-shadow(0 0 ${size * 0.06}px rgba(140,175,255,0.65))`}}>
					<TabGlyph size={size * 0.58} color="#EAF0FF" weight={2.1} />
				</div>
			</div>
		</div>
	</div>
);

export const EndCard: React.FC<{t: number; a: number; scale?: number; stack?: boolean; footBottom?: number}> = ({t, a, scale = 1, stack, footBottom}) => {
	if (t < a) return null;
	const bg = step(t, a, 0.7, easeInOut);
	const icon = step(t, a + 0.45, 0.9);
	const word = step(t, a + 0.7, 0.9);
	const line = step(t, a + 1.35, 0.9);
	const foot = step(t, a + 2.0, 0.9);
	return (
		<AbsoluteFill style={{zIndex: 190}}>
			<AbsoluteFill style={{background: '#000', opacity: bg}} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{display: 'flex', flexDirection: stack ? 'column' : 'row', alignItems: 'center', gap: (stack ? 46 : 34) * scale, marginTop: (stack ? -150 : -40) * scale}}>
					<div style={{transform: `scale(${0.85 + 0.15 * icon})`, opacity: icon, filter: `blur(${(1 - icon) * 8}px)`}}>
						<AppIcon size={(stack ? 176 : 124) * scale} glow={0.35 * icon} />
					</div>
					<div style={{fontFamily: SANS, fontWeight: 620, fontSize: 124 * scale, letterSpacing: '-0.05em', color: '#F5F5F7', opacity: word, transform: stack ? `translateY(${(1 - word) * 14}px)` : `translateX(${(1 - word) * -20}px)`, filter: `blur(${(1 - word) * 6}px)`, whiteSpace: 'nowrap'}}>
						Tab to Finish
					</div>
				</div>
				<div style={{marginTop: 34 * scale, fontFamily: SANS, fontWeight: 560, fontSize: 56 * scale, letterSpacing: '-0.03em', color: '#F5F5F7', opacity: line, transform: `translateY(${(1 - line) * 14}px)`}}>
					Do it twice. <span style={{color: '#9DB4FF'}}>Tab to finish.</span>
				</div>
				<div style={{position: 'absolute', bottom: footBottom ?? 88 * scale, fontFamily: SANS, fontWeight: 500, fontSize: 27 * scale, color: '#8E8E93', opacity: foot, letterSpacing: '-0.005em'}}>Early access ↓</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
