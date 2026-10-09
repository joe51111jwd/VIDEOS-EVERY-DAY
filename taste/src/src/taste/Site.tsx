import React from 'react';
import {Img, staticFile} from 'remotion';
import {DISPLAY, SANS, SERIF, T} from '../lib/tokens';
import {fitSize} from '../lib/Type';

/** a landing-page hero, rendered at 1440×900 */
export const SW = 1440;
export const SH = 900;

export type Slop = {
	kind: 'slop';
	brand: string;
	head: string;
	sub: string;
	dark?: boolean;
	blob: [string, string]; // gradient blob colors
	layout: 'center' | 'left';
};
export type Pal = 'paper' | 'night' | 'terra' | 'sand' | 'cold' | 'olive';
export type Taste = {
	kind: 'taste';
	brand: string;
	head: string; // \n splits lines; *word* = italic serif
	kicker: string;
	photo: string;
	body?: string;
	layout: 'bleed' | 'split' | 'masthead' | 'frame';
	pal: Pal;
	font: 'serif' | 'cond' | 'sans'; // display face
	q: number; // 0..1 how refined (grain, rules, details)
};
export type Gene = Slop | Taste;
/** a design: one of ours, or a real Awwwards winner by screenshot name (public/aw/<name>.jpg, 1440×900 @1.5x) */
export type Card = Gene | string;

const PAL: Record<Pal, {bg: string; ink: string; sub: string; acc: string}> = {
	paper: {bg: T.paper, ink: T.ink, sub: T.ink2, acc: T.terra},
	night: {bg: T.night, ink: T.paper, sub: '#A69C8E', acc: '#E0763F'},
	terra: {bg: '#B9472A', ink: '#F6EBDD', sub: '#F0CDB5', acc: '#16120E'},
	sand: {bg: T.sand, ink: T.ink, sub: '#5E5242', acc: '#7B2E1A'},
	cold: {bg: '#E9EDF2', ink: '#101828', sub: '#55607A', acc: '#2F6BFF'},
	olive: {bg: '#3B3A22', ink: '#EFE7D6', sub: '#BDB49B', acc: '#E3B15C'},
};

const Photo: React.FC<{src: string; style?: React.CSSProperties; q: number; pos?: string}> = ({src, style, q, pos = '50% 50%'}) => (
	<div style={{position: 'absolute', overflow: 'hidden', ...style}}>
		<Img src={staticFile(`img/${src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: `sepia(${0.22 * q}) saturate(${1 - 0.12 * q}) contrast(${1 + 0.06 * q})`}} />
		{q > 0.3 ? <div style={{position: 'absolute', inset: 0, background: 'rgba(255,196,140,0.10)', mixBlendMode: 'multiply'}} /> : null}
	</div>
);

/** headline: "*word*" segments set in italic serif when the display face is condensed/sans */
const Head: React.FC<{text: string; font: Taste['font']; size: number; color: string; acc: string; align?: 'left' | 'center'; lh?: number}> = ({text, font, size, color, acc, align = 'left', lh}) => {
	const lines = text.split('\n');
	const base: React.CSSProperties =
		font === 'serif'
			? {fontFamily: SERIF, fontWeight: 400, letterSpacing: '-0.025em', lineHeight: lh ?? 0.92}
			: font === 'cond'
				? {fontFamily: DISPLAY, fontWeight: 800, fontStretch: '62%', letterSpacing: '-0.01em', textTransform: 'uppercase', lineHeight: lh ?? 0.86}
				: {fontFamily: SANS, fontWeight: 650, letterSpacing: '-0.045em', lineHeight: lh ?? 1.0};
	return (
		<div style={{...base, fontSize: size, color, textAlign: align}}>
			{lines.map((l, i) => (
				<div key={i}>
					{l.split(/(\*[^*]+\*)/).map((seg, j) =>
						seg.startsWith('*') ? (
							<span key={j} style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, textTransform: 'none', fontStretch: '100%', letterSpacing: '-0.02em', color: acc}}>
								{seg.slice(1, -1)}
							</span>
						) : (
							<span key={j}>{seg}</span>
						),
					)}
				</div>
			))}
		</div>
	);
};

const Nav: React.FC<{brand: string; color: string; sub: string; items?: string[]; font: Taste['font']}> = ({brand, color, sub, items = ['Shop', 'Journal', 'Visit', 'About'], font}) => (
	<div style={{position: 'absolute', left: 64, right: 64, top: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: SANS}}>
		<div style={{fontFamily: font === 'cond' ? DISPLAY : SERIF, fontWeight: font === 'cond' ? 800 : 400, fontStretch: font === 'cond' ? '75%' : '100%', fontSize: font === 'cond' ? 30 : 34, letterSpacing: font === 'cond' ? '0.02em' : '-0.01em', textTransform: font === 'cond' ? 'uppercase' : 'none', color}}>{brand}</div>
		<div style={{display: 'flex', gap: 36, fontSize: 14, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: sub}}>
			{items.map((s) => (
				<span key={s}>{s}</span>
			))}
		</div>
	</div>
);

const Grain: React.FC<{q: number}> = ({q}) => (q > 0.4 ? <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('img/grain.png')})`, backgroundSize: '320px 320px', opacity: 0.35 * q, mixBlendMode: 'overlay', pointerEvents: 'none'}} /> : null);

const TasteSite: React.FC<{g: Taste}> = ({g}) => {
	const p = PAL[g.pal];
	const k = g.kicker;
	if (g.layout === 'bleed') {
		return (
			<div style={{position: 'absolute', inset: 0, background: '#000'}}>
				<Photo src={g.photo} q={g.q} style={{inset: 0}} />
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />
				<Nav brand={g.brand} color="#F6EFE4" sub="rgba(246,239,228,0.8)" font={g.font} />
				<div style={{position: 'absolute', left: 64, bottom: 70, maxWidth: 1000}}>
					<div style={{fontFamily: SANS, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(246,239,228,0.85)', marginBottom: 22}}>{k}</div>
					<Head text={g.head} font={g.font} size={g.font === 'cond' ? 190 : 150} color="#F6EFE4" acc={g.font === 'serif' ? '#F6EFE4' : '#F3C9A6'} />
				</div>
				<div style={{position: 'absolute', right: 64, bottom: 78, fontFamily: SANS, fontSize: 15, color: '#F6EFE4', display: 'flex', alignItems: 'center', gap: 14, letterSpacing: '0.04em'}}>
					<span style={{borderBottom: '1px solid rgba(246,239,228,0.7)', paddingBottom: 4}}>Explore the collection</span>
				</div>
				<Grain q={g.q} />
			</div>
		);
	}
	if (g.layout === 'split') {
		return (
			<div style={{position: 'absolute', inset: 0, background: p.bg}}>
				<Nav brand={g.brand} color={p.ink} sub={p.sub} font={g.font} />
				<Photo src={g.photo} q={g.q} style={{right: 0, top: 0, bottom: 0, width: 660}} />
				<div style={{position: 'absolute', left: 64, top: 230, width: 640}}>
					<div style={{fontFamily: SANS, fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', color: p.acc, marginBottom: 30}}>{k}</div>
					<Head text={g.head} font={g.font} size={g.font === 'cond' ? 150 : 124} color={p.ink} acc={p.acc} />
					<div style={{fontFamily: SANS, fontSize: 19, lineHeight: 1.5, color: p.sub, marginTop: 34, maxWidth: 470}}>{g.body ?? 'Small batches, roasted on Thursdays, delivered before the weekend.'}</div>
					<div style={{display: 'flex', gap: 28, marginTop: 40, alignItems: 'center', fontFamily: SANS, fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase'}}>
						<div style={{padding: '18px 30px', background: p.ink, color: p.bg}}>Order now</div>
						<div style={{color: p.ink, borderBottom: `1px solid ${p.ink}`, paddingBottom: 4}}>Our story</div>
					</div>
				</div>
				{g.q > 0.5 ? <div style={{position: 'absolute', left: 64, bottom: 44, right: 724, borderTop: `1px solid ${p.sub}`, paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 13, letterSpacing: '0.12em', color: p.sub, textTransform: 'uppercase'}}><span>No. 04</span><span>Autumn edition</span></div> : null}
				<Grain q={g.q} />
			</div>
		);
	}
	if (g.layout === 'masthead') {
		return (
			<div style={{position: 'absolute', inset: 0, background: p.bg}}>
				<div style={{position: 'absolute', left: 56, right: 56, top: 34, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: p.sub}}>
					<span>{k}</span>
					<span>Shop · Journal · Visit</span>
				</div>
				<div style={{position: 'absolute', left: 48, right: 48, top: 64, fontFamily: DISPLAY, fontWeight: 850, fontStretch: '62%', fontSize: Math.min(330, fitSize(g.brand.toUpperCase(), 1300, 850, 'condensed', -0.02)), lineHeight: 0.8, letterSpacing: '-0.02em', color: p.ink, textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: 'center'}}>{g.brand}</div>
				<Photo src={g.photo} q={g.q} style={{left: 56, right: 56, top: 360, bottom: 120}} />
				<div style={{position: 'absolute', left: 56, right: 56, bottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
					<Head text={g.head.replace('\n', ' ')} font="serif" size={54} color={p.ink} acc={p.acc} />
					<div style={{fontFamily: SANS, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.ink, borderBottom: `1px solid ${p.ink}`, paddingBottom: 4}}>Explore</div>
				</div>
				<Grain q={g.q} />
			</div>
		);
	}
	// frame
	return (
		<div style={{position: 'absolute', inset: 0, background: p.bg}}>
			<Nav brand={g.brand} color={p.ink} sub={p.sub} font={g.font} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center'}}>
				<Head text={g.head.replace('\n', ' ')} font={g.font} size={g.font === 'cond' ? 120 : 104} color={p.ink} acc={p.acc} align="center" />
			</div>
			<Photo src={g.photo} q={g.q} style={{left: 300, right: 300, top: 300, bottom: 70}} />
			<div style={{position: 'absolute', left: 64, bottom: 70, width: 200, fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: p.sub}}>{k}</div>
			<div style={{position: 'absolute', right: 64, bottom: 70, fontFamily: SANS, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.ink}}>Book a table →</div>
			<Grain q={g.q} />
		</div>
	);
};

const SlopSite: React.FC<{g: Slop}> = ({g}) => {
	const bg = g.dark ? '#0B0B14' : '#FFFFFF';
	const ink = g.dark ? '#FFFFFF' : '#0F172A';
	const sub = g.dark ? '#9AA3B8' : '#64748B';
	const center = g.layout === 'center';
	return (
		<div style={{position: 'absolute', inset: 0, background: bg, fontFamily: SANS}}>
			<div style={{position: 'absolute', left: center ? 420 : 760, top: center ? 360 : 180, width: 700, height: 520, borderRadius: '50%', background: `radial-gradient(closest-side, ${g.blob[0]}, ${g.blob[1]} 55%, rgba(0,0,0,0))`, filter: 'blur(40px)', opacity: 0.75}} />
			<div style={{position: 'absolute', left: 56, right: 56, top: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 700, color: ink}}>
					<div style={{width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${g.blob[0]}, ${g.blob[1]})`}} />
					{g.brand}
				</div>
				<div style={{display: 'flex', gap: 34, fontSize: 16, color: sub}}>
					<span>Features</span>
					<span>Pricing</span>
					<span>Resources</span>
					<span>Blog</span>
				</div>
				<div style={{padding: '12px 22px', borderRadius: 999, background: `linear-gradient(90deg, ${g.blob[0]}, ${g.blob[1]})`, color: '#fff', fontSize: 16, fontWeight: 600}}>Get Started</div>
			</div>
			<div style={{position: 'absolute', left: center ? 170 : 90, right: center ? 170 : 700, top: center ? 200 : 260, textAlign: center ? 'center' : 'left'}}>
				<div style={{display: 'inline-block', padding: '8px 16px', borderRadius: 999, border: `1px solid ${g.dark ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}`, color: sub, fontSize: 15, marginBottom: 26}}>✨ Now powered by AI</div>
				<div style={{fontSize: center ? 76 : 70, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, color: ink}}>{g.head}</div>
				<div style={{fontSize: 22, lineHeight: 1.5, color: sub, marginTop: 24, maxWidth: 760, marginLeft: center ? 'auto' : 0, marginRight: center ? 'auto' : 0}}>{g.sub}</div>
				<div style={{display: 'flex', gap: 16, marginTop: 38, justifyContent: center ? 'center' : 'flex-start'}}>
					<div style={{padding: '18px 30px', borderRadius: 14, background: `linear-gradient(90deg, ${g.blob[0]}, ${g.blob[1]})`, color: '#fff', fontSize: 18, fontWeight: 600}}>Start for free →</div>
					<div style={{padding: '18px 30px', borderRadius: 14, border: `1px solid ${g.dark ? 'rgba(255,255,255,0.25)' : '#CBD5E1'}`, color: ink, fontSize: 18, fontWeight: 600}}>Watch demo</div>
				</div>
			</div>
			{center ? null : (
				<div style={{position: 'absolute', right: 80, top: 220, width: 520, height: 420, borderRadius: 24, background: g.dark ? 'rgba(255,255,255,0.06)' : '#F8FAFC', border: `1px solid ${g.dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`, boxShadow: '0 30px 80px rgba(15,23,42,0.18)', padding: 28}}>
					{[0.8, 0.55, 0.7, 0.4].map((w, i) => (
						<div key={i} style={{height: 18, width: `${w * 100}%`, borderRadius: 9, background: g.dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0', marginBottom: 22}} />
					))}
					<div style={{display: 'flex', gap: 16, marginTop: 30}}>
						{[0, 1, 2].map((i) => (
							<div key={i} style={{flex: 1, height: 120, borderRadius: 16, background: `linear-gradient(135deg, ${g.blob[0]}33, ${g.blob[1]}22)`}} />
						))}
					</div>
				</div>
			)}
		</div>
	);
};

/** a design at native 1440×900 */
export const Site: React.FC<{g: Card; small?: boolean}> = ({g, small}) => (
	<div style={{position: 'relative', width: SW, height: SH, overflow: 'hidden'}}>
		{typeof g === 'string' ? <Img src={staticFile(small ? `aw/s/${g}.jpg` : `aw/${g}.jpg`)} style={{width: SW, height: SH, objectFit: 'cover', display: 'block'}} /> : g.kind === 'slop' ? <SlopSite g={g} /> : <TasteSite g={g} />}
	</div>
);

/** a design scaled into a w-wide box */
export const SiteAt: React.FC<{g: Card; w: number; style?: React.CSSProperties; radius?: number}> = ({g, w, style, radius = 10}) => {
	const s = w / SW;
	return (
		<div style={{position: 'relative', width: w, height: SH * s, overflow: 'hidden', borderRadius: radius, ...style}}>
			<div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${s})`, transformOrigin: '0 0'}}>
				<Site g={g} small={w <= 640} />
			</div>
		</div>
	);
};
