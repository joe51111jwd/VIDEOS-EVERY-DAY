// The Halden Run ad (fictional brand), 1080 x 1350, built as real layers so the film can take it apart.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {COND, SANS, clamp01, lerp} from '../lib/tokens';

export const AD_W = 1080;
export const AD_H = 1350;
export const INK = '#1E1A16';
export const CORAL = '#EE5A2E';
export const ABLUE = '#3B74FF';

export const HEAD = {x: 72, y: 150, w: 936};
export const HEAD_SIZE = 108;
export const SHOE = {x: 70, y: 392, w: 940, h: Math.round((940 * 1135) / 1600)};
export const LOGO = {x: 72, y: 64, w: 250, h: 44};
export const NEW = {x: 900, y: 66, w: 108, h: 40};
export const DETAILS = {x: 72, y: 1188, w: 420, h: 96};
export const PRICE = {x: 590, y: 1204, w: 140, h: 64};
export const CTA = {x: 752, y: 1196, w: 256, h: 80};

export type AdState = {
	headline: string;
	caps?: number; // 0..1: mixed case -> ALL CAPS (rolls over)
	caret?: number; // 0..1 caret opacity
	hl?: number; // 0..1 selection highlight behind the text
	shoeDx?: number;
	shoeDy?: number;
	shoeLift?: number; // 0..1 picked up (scale + deeper shadow)
	fill?: number; // 0..1 shimmer where the shoe used to be (background filled in)
	color?: number; // 0..1 orange -> electric blue
	explode?: number; // 0..1 layers apart in z
	gap?: number; // z distance per layer at explode = 1
	hideHeadline?: boolean;
};

const mix = (a: string, b: string, u: number) => {
	const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const [x, y] = [p(a), p(b)];
	return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], u))).join(',')})`;
};

const Logo: React.FC = () => (
	<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
		<svg width={40} height={40} viewBox="0 0 40 40">
			<circle cx={20} cy={20} r={17.5} fill="none" stroke={INK} strokeWidth={3.2} />
			<path d="M9 24.5a11 11 0 0 1 22 0Z" fill={INK} />
			<path d="M5 24.5h30" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
		</svg>
		<div style={{fontFamily: COND, fontStretch: '118%', fontWeight: 760, fontSize: 30, letterSpacing: '0.26em', color: INK}}>HALDEN</div>
	</div>
);

/** headline block; caps rolls the mixed-case text up and the ALL CAPS text in */
export const Headline: React.FC<{text: string; caps: number; caret: number; hl: number; size?: number}> = ({text, caps, caret, hl, size = HEAD_SIZE}) => {
	const style: React.CSSProperties = {
		position: 'absolute',
		left: 0,
		top: 0,
		width: HEAD.w,
		fontFamily: SANS,
		fontWeight: 720,
		fontSize: size,
		lineHeight: 0.98,
		letterSpacing: '-0.045em',
		color: INK,
	};
	const Caret =
		caret > 0 ? (
			<span style={{display: 'inline-block', width: 0, height: '0.98em', verticalAlign: 'top', position: 'relative'}}>
				<span style={{position: 'absolute', left: 4, top: '0.1em', width: 6, height: '0.8em', background: '#2F6BFF', opacity: caret, borderRadius: 2}} />
			</span>
		) : null;
	const body = (s: string) =>
		hl > 0 ? (
			<span style={{background: `rgba(47,107,255,${0.26 * hl})`, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{s}</span>
		) : (
			s
		);
	if (caps <= 0)
		return (
			<div style={style}>
				{body(text)}
				{Caret}
			</div>
		);
	const u = clamp01(caps);
	return (
		<>
			{u < 1 ? (
				<div style={{...style, opacity: 1 - u, transform: `translateY(${-u * 26}px)`, filter: `blur(${u * 6}px)`}}>{body(text)}</div>
			) : null}
			<div style={{...style, opacity: u, transform: `translateY(${(1 - u) * 30}px)`, filter: u < 1 ? `blur(${(1 - u) * 6}px)` : undefined}}>
				{body(text.toUpperCase())}
				{Caret}
			</div>
		</>
	);
};

/** a glass sheet that makes each layer read as a layer while the ad is apart */
const Sheet: React.FC<{ex: number; tag: string; radius: number}> = ({ex, tag, radius}) =>
	ex > 0 ? (
		<>
			<div style={{position: 'absolute', inset: 0, borderRadius: radius + 8, background: `rgba(255,255,255,${0.16 * ex})`, boxShadow: `inset 0 0 0 3px rgba(255,255,255,${0.75 * ex}), 0 0 0 1px rgba(47,107,255,${0.35 * ex})`}} />
			<div style={{position: 'absolute', left: 30, top: -82, height: 64, padding: '0 24px', borderRadius: 16, background: '#2F6BFF', color: '#fff', fontFamily: SANS, fontWeight: 650, fontSize: 38, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', opacity: clamp01(ex * 1.6 - 0.3)}}>{tag}</div>
		</>
	) : null;

export const Ad: React.FC<{s: AdState; radius?: number; clip?: boolean}> = ({s, radius = 0, clip}) => {
	const ex = s.explode ?? 0;
	const gap = s.gap ?? 170;
	const z = (k: number) => (ex > 0 ? `translateZ(${k * gap * ex}px)` : undefined);
	const col = clamp01(s.color ?? 0);
	const dx = s.shoeDx ?? 0;
	const dy = s.shoeDy ?? 0;
	const lift = s.shoeLift ?? 0;
	const fill = s.fill ?? 0;
	const pre3d: React.CSSProperties = ex > 0 ? {transformStyle: 'preserve-3d'} : {};
	const layer = (k: number): React.CSSProperties => ({position: 'absolute', inset: 0, transform: z(k), ...pre3d});
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: AD_W, height: AD_H, borderRadius: radius, overflow: clip && ex <= 0 ? 'hidden' : undefined, ...pre3d}}>
			{/* 0: background photo (with the shoe's floor shadow on it) */}
			<div style={{...layer(0), borderRadius: radius, overflow: ex > 0 ? undefined : 'hidden'}}>
				<Img src={staticFile('img/ad-bg.jpg')} style={{position: 'absolute', inset: 0, width: AD_W, height: AD_H, objectFit: 'cover', borderRadius: radius + (ex > 0 ? 8 : 0)}} />
				{ex > 0 ? <div style={{position: 'absolute', left: 30, top: -82, height: 64, padding: '0 24px', borderRadius: 16, background: '#2F6BFF', color: '#fff', fontFamily: SANS, fontWeight: 650, fontSize: 38, display: 'flex', alignItems: 'center', opacity: clamp01(ex * 1.6 - 0.3)}}>Background</div> : null}
				{/* filled-in background: a shimmer inside the shoe's old silhouette */}
				{fill > 0 && fill < 1 ? (
					<div
						style={{
							position: 'absolute',
							left: SHOE.x,
							top: SHOE.y,
							width: SHOE.w,
							height: SHOE.h,
							WebkitMaskImage: `url(${staticFile('img/shoe-orange.png')})`,
							WebkitMaskSize: '100% 100%',
							maskImage: `url(${staticFile('img/shoe-orange.png')})`,
							maskSize: '100% 100%',
							background: `linear-gradient(115deg, rgba(255,255,255,0) ${lerp(-30, 130, fill) - 25}%, rgba(255,250,240,0.95) ${lerp(-30, 130, fill)}%, rgba(255,255,255,0) ${lerp(-30, 130, fill) + 25}%)`,
							opacity: Math.sin(fill * Math.PI),
							mixBlendMode: 'soft-light',
						}}
					/>
				) : null}
				{/* floor shadow (moves with the shoe; softer while lifted) */}
				<div
					style={{
						position: 'absolute',
						left: SHOE.x + SHOE.w * 0.2 + dx * 0.9,
						top: SHOE.y + SHOE.h * 0.985 + 34 + dy * 0.6,
						width: SHOE.w * 0.66,
						height: 64,
						borderRadius: '50%',
						background: 'radial-gradient(closest-side, rgba(70,45,20,0.42), rgba(70,45,20,0))',
						filter: `blur(${10 + 10 * lift}px)`,
						opacity: (1 - 0.35 * lift) * (1 - 0.6 * ex),
						transform: `scale(${1 + 0.12 * lift})`,
					}}
				/>
			</div>
			{/* 1: shoe */}
			<div style={layer(1)}>
				<Sheet ex={ex} tag="Shoe" radius={radius} />
				<div
					style={{
						position: 'absolute',
						left: SHOE.x + dx,
						top: SHOE.y + dy,
						width: SHOE.w,
						height: SHOE.h,
						transform: `scale(${1 + 0.035 * lift}) rotate(${-2 * lift}deg)`,
						filter: lift > 0 ? `drop-shadow(0 ${24 * lift}px ${30 * lift}px rgba(60,40,20,${0.28 * lift}))` : undefined,
					}}
				>
					<Img src={staticFile('img/shoe-orange.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
					{col > 0 ? <Img src={staticFile('img/shoe-blue.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: col}} /> : null}
				</div>
			</div>
			{/* 2: headline */}
			{!s.hideHeadline ? (
				<div style={layer(2)}>
					<Sheet ex={ex} tag="Headline" radius={radius} />
					<div style={{position: 'absolute', left: HEAD.x, top: HEAD.y, width: HEAD.w, height: 240}}>
						<Headline text={s.headline} caps={s.caps ?? 0} caret={s.caret ?? 0} hl={s.hl ?? 0} />
					</div>
				</div>
			) : null}
			{/* 3: logo, tag, details, price, button */}
			<div style={{...layer(3), pointerEvents: 'none'}}>
				<Sheet ex={ex} tag="Logo · Text · Button" radius={radius} />
				<div style={{position: 'absolute', left: LOGO.x, top: LOGO.y}}>
					<Logo />
				</div>
				<div style={{position: 'absolute', left: NEW.x, top: NEW.y, width: NEW.w, height: NEW.h, borderRadius: 20, border: `2.5px solid ${INK}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: COND, fontStretch: '112%', fontWeight: 760, fontSize: 19, letterSpacing: '0.2em', color: INK, paddingLeft: 4}}>NEW</div>
				<div style={{position: 'absolute', left: DETAILS.x, top: DETAILS.y}}>
					<div style={{fontFamily: SANS, fontWeight: 680, fontSize: 44, letterSpacing: '-0.03em', color: INK}}>Drift 3</div>
					<div style={{fontFamily: SANS, fontWeight: 520, fontSize: 25, letterSpacing: '-0.005em', color: 'rgba(30,26,22,0.62)', marginTop: 4}}>212 g · 8 mm drop · carbon plate</div>
				</div>
				<div style={{position: 'absolute', left: PRICE.x, top: PRICE.y, width: PRICE.w, height: PRICE.h, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontFamily: SANS, fontWeight: 650, fontSize: 40, letterSpacing: '-0.03em', color: INK}}>$160</div>
				<div
					style={{
						position: 'absolute',
						left: CTA.x,
						top: CTA.y,
						width: CTA.w,
						height: CTA.h,
						borderRadius: CTA.h / 2,
						background: mix(CORAL, ABLUE, col),
						boxShadow: `0 10px 24px ${col > 0.5 ? 'rgba(40,90,255,0.32)' : 'rgba(220,80,40,0.32)'}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 12,
						fontFamily: SANS,
						fontWeight: 650,
						fontSize: 29,
						letterSpacing: '-0.01em',
						color: '#fff',
					}}
				>
					Shop now
					<svg width={24} height={24} viewBox="0 0 24 24">
						<path d="M5 12h13M13 6l6 6-6 6" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
			</div>
		</div>
	);
};
