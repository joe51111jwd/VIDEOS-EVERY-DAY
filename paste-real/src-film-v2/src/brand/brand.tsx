import React from 'react';
import {BRAND, BRAND_MONO, clamp01, easeInOut, easeOut, lerp, SYS, textW} from '../lib/tokens';

// ------------------------------------------------------------------ colour
export const C = {
	signal: '#FF5A1F', // Paste Real orange
	signalDeep: '#E2400C',
	ink: '#0C0C0E',
	paper: '#F4F2ED',
	graphite: '#5C5B61',
	tint: '#FFE6DA',
	mist: '#A9A8AD',
};

// ------------------------------------------------------------------ the mark
// A solid rounded tile whose top-left corner is still a dashed selection: the moment a flat
// selection becomes a real object. viewBox 0 0 120 120 (same numbers as brand/mark.js and the Blender icon).
const K = 0.5, R = 24, SW = 6, INSET = 12, NDASH = 5, GAPR = 0.9;
const A = INSET, B = 120 - INSET, S = B - A;
const CX = A + S * K, CY = A + S * K;
const H = SW / 2;
const TRIM = SW * 0.9;
const Y0 = CY - TRIM, X1 = CX - TRIM, RR = R - H;
export const MARK = (() => {
	const solid = `M ${CX} ${A} L ${B - R} ${A} A ${R} ${R} 0 0 1 ${B} ${A + R} L ${B} ${B - R} A ${R} ${R} 0 0 1 ${B - R} ${B} L ${A + R} ${B} A ${R} ${R} 0 0 1 ${A} ${B - R} L ${A} ${CY} Z`;
	const corner = `M ${A + H} ${Y0} L ${A + H} ${A + R} A ${RR} ${RR} 0 0 1 ${A + R} ${A + H} L ${X1} ${A + H}`;
	const Lc = Y0 - (A + R) + (Math.PI / 2) * RR + (X1 - (A + R));
	const d = Lc / (NDASH + GAPR * (NDASH - 1));
	const g = GAPR * d;
	// the whole outline as a selection, starting where the corner dashes start, so the dash phase matches
	const full = `M ${A + H} ${Y0} L ${A + H} ${A + R} A ${RR} ${RR} 0 0 1 ${A + R} ${A + H} L ${B - R} ${A + H} A ${RR} ${RR} 0 0 1 ${B - H} ${A + R} L ${B - H} ${B - R} A ${RR} ${RR} 0 0 1 ${B - R} ${B - H} L ${A + R} ${B - H} A ${RR} ${RR} 0 0 1 ${A + H} ${B - R} Z`;
	return {solid, corner, full, array: `${Math.max(0.01, d - SW)} ${g + SW}`, period: d + g, offset: -SW / 2, sw: SW};
})();

/**
 * The mark. `fill` animates it from a pure dashed selection (0) to the mark (1); `real` closes the last
 * corner (the fully solid tile). `march` shifts the dashes (marching ants) in dash periods.
 */
export const Mark: React.FC<{size: number; color?: string; ink?: string; fill?: number; real?: number; march?: number; id?: string; style?: React.CSSProperties}> = ({
	size,
	color = C.signal,
	ink = C.ink,
	fill = 1,
	real = 0,
	march = 0,
	id = 'm',
	style,
}) => {
	// the fill is a half-plane x + y >= c sweeping from the bottom-right corner (c = 240) to the cut (c = CX + A)
	const cEnd = CX + A - real * (CX + A - 2 * A + 4);
	const c = lerp(240, cEnd, fill);
	const clip = `M ${c} -10 L 300 -10 L 300 300 L -10 300 L -10 ${c} Z`;
	const settled = fill >= 0.999 && real <= 0.001 && Math.abs(march) < 1e-4;
	const fullSolid = `M ${A + R} ${A} L ${B - R} ${A} A ${R} ${R} 0 0 1 ${B} ${A + R} L ${B} ${B - R} A ${R} ${R} 0 0 1 ${B - R} ${B} L ${A + R} ${B} A ${R} ${R} 0 0 1 ${A} ${B - R} L ${A} ${A + R} A ${R} ${R} 0 0 1 ${A + R} ${A} Z`;
	return (
		<svg width={size} height={size} viewBox="0 0 120 120" style={{display: 'block', overflow: 'visible', ...style}}>
			<defs>
				<clipPath id={`${id}-fill`}>
					<path d={clip} />
				</clipPath>
				<mask id={`${id}-unfilled`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={160} height={160}>
					<rect x={-20} y={-20} width={160} height={160} fill="#fff" />
					<path d={clip} fill="#000" transform="translate(-4 -4)" />
				</mask>
			</defs>
			{settled ? (
				<>
					<path d={MARK.solid} fill={color} />
					<path d={MARK.corner} fill="none" stroke={ink} strokeWidth={MARK.sw} strokeLinecap="round" strokeDasharray={MARK.array} strokeDashoffset={MARK.offset} />
				</>
			) : (
				<>
					<path d={fullSolid} fill={color} clipPath={`url(#${id}-fill)`} />
					<g mask={`url(#${id}-unfilled)`}>
						<path d={MARK.full} fill="none" stroke={ink} strokeWidth={MARK.sw} strokeLinecap="round" strokeDasharray={MARK.array} strokeDashoffset={MARK.offset - march * MARK.period} />
					</g>
				</>
			)}
		</svg>
	);
};

export const Wordmark: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.ink, style}) => (
	<div style={{fontFamily: BRAND, fontWeight: 600, fontSize: size, letterSpacing: '-0.045em', lineHeight: 1, color, whiteSpace: 'nowrap', ...style}}>Paste Real</div>
);

export const Lockup: React.FC<{size: number; color?: string; ink?: string; markColor?: string; gap?: number}> = ({size, color = C.ink, ink, markColor = C.signal, gap = 0.28}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * gap}}>
		<Mark size={size * 1.02} color={markColor} ink={ink ?? color} id={`lk${size}`} />
		<Wordmark size={size} color={color} />
	</div>
);

const squirclePath = (s: number, n = 5) => {
	const pts: string[] = [];
	for (let i = 0; i <= 120; i++) {
		const a = (i / 120) * Math.PI * 2;
		const c = Math.cos(a), si = Math.sin(a);
		const x = Math.sign(c) * Math.abs(c) ** (2 / n), y = Math.sign(si) * Math.abs(si) ** (2 / n);
		pts.push(`${(s / 2 + (x * s) / 2).toFixed(2)},${(s / 2 + (y * s) / 2).toFixed(2)}`);
	}
	return `M${pts.join('L')}Z`;
};

/** flat app icon: ink glass squircle with the mark */
export const AppIcon: React.FC<{size: number; shadow?: boolean}> = ({size, shadow = true}) => (
	<div style={{width: size, height: size, position: 'relative', flexShrink: 0}}>
		<svg width={size} height={size} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
			<defs>
				<linearGradient id={`ai${size}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#2A2A2F" />
					<stop offset="0.5" stopColor="#141417" />
					<stop offset="1" stopColor="#0A0A0B" />
				</linearGradient>
				<radialGradient id={`aih${size}`} cx="0.5" cy="0" r="0.8">
					<stop offset="0" stopColor="rgba(255,255,255,0.22)" />
					<stop offset="1" stopColor="rgba(255,255,255,0)" />
				</radialGradient>
			</defs>
			<path d={squirclePath(size)} fill={`url(#ai${size})`} style={shadow ? {filter: `drop-shadow(0 ${size * 0.05}px ${size * 0.1}px rgba(0,0,0,0.35))`} : undefined} />
			<path d={squirclePath(size)} fill={`url(#aih${size})`} />
			<path d={squirclePath(size)} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={Math.max(0.8, size * 0.008)} />
		</svg>
		<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Mark size={size * 0.62} ink={C.paper} id={`aim${size}`} />
		</div>
	</div>
);

/** monochrome menu-bar glyph (template image) */
export const MenuGlyph: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 120 120" style={{display: 'block'}}>
		<path d={MARK.solid} fill={color} />
		<path d={MARK.corner} fill="none" stroke={color} strokeWidth={MARK.sw * 1.35} strokeLinecap="round" strokeDasharray={MARK.array} strokeDashoffset={MARK.offset} />
	</svg>
);

// ------------------------------------------------------------------ keys and the keystroke HUD
/** an Apple-style keycap; `down` 0..1 presses it */
export const Keycap: React.FC<{label: React.ReactNode; size: number; down?: number; w?: number; dark?: boolean}> = ({label, size, down = 0, w = 1, dark = true}) => {
	const travel = size * 0.06 * down;
	const face = dark ? `linear-gradient(180deg, #3A3A40 0%, #2A2A2F 100%)` : `linear-gradient(180deg, #FFFFFF 0%, #EDEDF0 100%)`;
	const side = dark ? '#121214' : '#B9B9BF';
	const text = dark ? '#F4F4F6' : '#1D1D1F';
	return (
		<div style={{position: 'relative', width: size * w, height: size * 1.08}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: size * 0.08, height: size, borderRadius: size * 0.2, background: side, boxShadow: `0 ${size * (0.12 - 0.08 * down)}px ${size * (0.26 - 0.14 * down)}px rgba(0,0,0,${0.45 - 0.15 * down})`}} />
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: travel,
					height: size,
					borderRadius: size * 0.2,
					background: face,
					boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.4)' : 'inset 0 1px 0 #fff, inset 0 -1px 0 rgba(0,0,0,0.08)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: SYS,
					fontWeight: 500,
					fontSize: size * 0.46,
					color: text,
					filter: down > 0 ? `brightness(${1 - 0.12 * down})` : undefined,
				}}
			>
				{label}
			</div>
		</div>
	);
};

/** ⌘ drawn as a path so it's identical everywhere */
export const CmdGlyph: React.FC<{size: number; color?: string}> = ({size, color = '#F4F4F6'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
		<path
			d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9Zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15Zm0 0v6m0 0h2.5A2.5 2.5 0 1 1 15 17.5V15Zm0 0H9m0 0v2.5A2.5 2.5 0 1 1 6.5 15H9Z"
			fill="none"
			stroke={color}
			strokeWidth={1.7}
			strokeLinejoin="round"
		/>
	</svg>
);

export type HudState = {
	/** which shortcut: 'C' (copy) or 'V' (paste) */
	key: 'C' | 'V';
	/** 0..1 appearance */
	show: number;
	/** 0..1 key press (both keys) */
	down: number;
	/** 0..1 how far the "done" message has replaced the action label */
	done: number;
	label: string;
	doneLabel: string;
	detail?: string;
};

/** dark glass keystroke pill: keys + what they do, then what happened. Doubles as the captions. */
export const Hud: React.FC<{s: HudState; scale?: number}> = ({s, scale = 1}) => {
	const k = 64 * scale;
	const pop = easeOut(clamp01(s.show));
	// the text box fits whichever line is showing (the action, or the mark + result + detail)
	const fs = 44 * scale;
	const wLabel = textW(s.label, fs, 600, BRAND, -0.03);
	const wDone = 40 * scale + 14 * scale + textW(s.doneLabel, fs, 600, BRAND, -0.03) + (s.detail ? 14 * scale + 4 * scale + textW(s.detail, 26 * scale, 500, BRAND_MONO) : 0);
	const boxW = lerp(wLabel, wDone, clamp01(s.done));
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 22 * scale,
				height: 104 * scale,
				padding: `0 ${34 * scale}px 0 ${22 * scale}px`,
				borderRadius: 52 * scale,
				background: 'rgba(22,22,26,0.86)',
				boxShadow: `0 ${20 * scale}px ${50 * scale}px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset`,
				backdropFilter: undefined,
				opacity: pop,
				transform: `translateY(${(1 - pop) * 18 * scale}px) scale(${0.94 + 0.06 * pop})`,
				fontFamily: BRAND,
				whiteSpace: 'nowrap',
			}}
		>
			<div style={{display: 'flex', gap: 10 * scale}}>
				<Keycap size={k} down={s.down} label={<CmdGlyph size={k * 0.44} />} />
				<Keycap size={k} down={s.down} label={<span style={{fontFamily: SYS, fontWeight: 500, fontSize: k * 0.46}}>{s.key}</span>} />
			</div>
			<div style={{position: 'relative', height: 60 * scale, width: boxW}}>
				<div style={{position: 'absolute', left: 0, top: 0, height: 60 * scale, display: 'flex', alignItems: 'center', fontSize: 44 * scale, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', opacity: 1 - s.done, transform: `translateY(${-14 * scale * s.done}px)`}}>
					{s.label}
				</div>
				<div style={{position: 'absolute', left: 0, top: 0, height: 60 * scale, display: 'flex', alignItems: 'center', gap: 14 * scale, opacity: s.done, transform: `translateY(${14 * scale * (1 - s.done)}px)`}}>
					<Mark size={40 * scale} ink="#fff" id={`hud${s.key}`} />
					<div style={{fontSize: 44 * scale, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff'}}>{s.doneLabel}</div>
					{s.detail ? <div style={{fontFamily: BRAND_MONO, fontSize: 26 * scale, fontWeight: 500, color: C.mist, marginLeft: 4 * scale}}>{s.detail}</div> : null}
				</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ the grab, on screen
/**
 * Paste Real's selection around something on screen: orange marching-ants outline with handles and a
 * size tag; `fill` sweeps the orange wash across it (bottom-right to top-left, like the mark), `flash` whitens it.
 */
export const Grab: React.FC<{w: number; h: number; show: number; march: number; fill: number; flash: number; tag?: string; tagIn?: boolean; radius?: number; scale?: number}> = ({
	w,
	h,
	show,
	march,
	fill,
	flash,
	tag,
	tagIn = false,
	radius = 10,
	scale = 1,
}) => {
	if (show <= 0) return null;
	const sw = 2.5 * scale;
	const dash = 9 * scale, gap = 7 * scale;
	const pad = 6 * scale;
	const W = w + pad * 2, H2 = h + pad * 2;
	const c = lerp(W + H2, 0, easeInOut(clamp01(fill)));
	return (
		<div style={{position: 'absolute', left: -pad, top: -pad, width: W, height: H2, opacity: show, pointerEvents: 'none'}}>
			<svg width={W} height={H2} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<defs>
					<clipPath id={`gc${Math.round(w)}`}>
						<path d={`M ${c} 0 L ${W + H2} 0 L ${W + H2} ${W + H2} L 0 ${W + H2} L 0 ${c} Z`} />
					</clipPath>
				</defs>
				<rect x={0} y={0} width={W} height={H2} rx={radius + pad} fill={`rgba(255,90,31,${0.22})`} clipPath={`url(#gc${Math.round(w)})`} />
				<rect x={0} y={0} width={W} height={H2} rx={radius + pad} fill={`rgba(255,255,255,${0.75 * flash})`} />
				<rect x={0} y={0} width={W} height={H2} rx={radius + pad} fill="none" stroke="#fff" strokeWidth={sw + 2.5 * scale} opacity={0.9} />
				<rect x={0} y={0} width={W} height={H2} rx={radius + pad} fill="none" stroke={C.signal} strokeWidth={sw} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-march * (dash + gap)} />
				{[
					[0, 0],
					[W, 0],
					[0, H2],
					[W, H2],
				].map(([x, y], i) => (
					<rect key={i} x={x - 5 * scale} y={y - 5 * scale} width={10 * scale} height={10 * scale} rx={2.5 * scale} fill="#fff" stroke={C.signal} strokeWidth={2 * scale} />
				))}
			</svg>
			{tag ? (
				<div
					style={{
						position: 'absolute',
						left: tagIn ? pad + 5 * scale : 0,
						top: tagIn ? pad + 3 * scale : -38 * scale,
						height: 28 * scale,
						boxShadow: tagIn ? `0 ${3 * scale}px ${10 * scale}px rgba(0,0,0,0.18)` : undefined,
						padding: `0 ${10 * scale}px`,
						borderRadius: 8 * scale,
						background: C.signal,
						color: '#fff',
						display: 'flex',
						alignItems: 'center',
						gap: 7 * scale,
						fontFamily: BRAND,
						fontWeight: 600,
						fontSize: 15 * scale,
						letterSpacing: '-0.01em',
						whiteSpace: 'nowrap',
					}}
				>
					<MenuGlyph size={15 * scale} color="#fff" />
					{tag}
				</div>
			) : null}
		</div>
	);
};
