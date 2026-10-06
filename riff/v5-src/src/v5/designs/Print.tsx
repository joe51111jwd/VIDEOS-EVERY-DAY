import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Appear, HalfMark, Sel, useT} from './kit';
import {clamp01, COND, CREAM, EDIT, ESPRESSO, FPS, img, SANS, SERIF, spr, step, TERRA} from '../tokens';

export const POSTER_W = 600;
export const POSTER_H = 850;
export const STORY_W = 360;
export const STORY_H = 640;

export type PosterTL = {bg?: number; top?: number; moon?: number; type?: number; info?: number; cup?: number};

const Moon: React.FC<{d: number; at?: number}> = ({d, at}) => {
	const frame = useCurrentFrame();
	const p = at === undefined ? 1 : Math.min(1.04, spr(frame, at, 13, 0.8));
	const rot = at === undefined ? 0 : (1 - clamp01(p)) * -50;
	return (
		<div style={{width: d, height: d, borderRadius: d / 2, overflow: 'hidden', position: 'relative', transform: `scale(${p}) rotate(${rot}deg)`, opacity: clamp01(p * 2)}}>
			<div style={{position: 'absolute', inset: 0, background: CREAM}} />
			<div style={{position: 'absolute', left: '50%', top: 0, right: 0, bottom: 0, background: ESPRESSO}} />
		</div>
	);
};

const Cup: React.FC<{at?: number; w: number}> = ({at, w}) => {
	const frame = useCurrentFrame();
	if (at === undefined || frame < at * FPS) return null;
	// set down onto the poster: settles from a little above and a little larger, with its own rendered shadow
	const p = Math.min(1.03, spr(frame, at, 15, 0.8, 130));
	const blur = p < 0.98 ? (1 - p) * 9 : 0;
	return (
		<div
			style={{
				position: 'relative',
				width: w,
				height: w * 1.25,
				transform: `translateY(${(1 - p) * -w * 0.12}px) scale(${1.16 - 0.16 * p})`,
				opacity: clamp01(p * 2.4),
				filter: blur ? `blur(${blur}px)` : undefined,
			}}
		>
			<img src={img('cutout.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		</div>
	);
};

const BigType: React.FC<{at?: number; size: number; lines: string[]; color: string; stretch?: number}> = ({at, size, lines, color, stretch = 66}) => {
	const t = useT();
	return (
		<div>
			{lines.map((l, i) => {
				const a = at === undefined ? undefined : at + i * 0.12;
				const p = a === undefined ? 1 : step(t, a, 0.45);
				return (
					<div
						key={l}
						style={{
							fontFamily: COND,
							fontWeight: 900,
							fontStretch: `${stretch}%`,
							fontSize: size,
							lineHeight: 0.84,
							letterSpacing: '-0.015em',
							color,
							textAlign: 'center',
							opacity: clamp01(p * 1.6),
							transform: `scale(${1.18 - 0.18 * p})`,
							filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
						}}
					>
						{l}
					</div>
				);
			})}
		</div>
	);
};

export const Poster: React.FC<{tl: PosterTL}> = ({tl}) => {
	const t = useT();
	const bg = tl.bg === undefined ? 1 : step(t, tl.bg, 0.6);
	return (
		<div style={{width: POSTER_W, height: POSTER_H, position: 'relative', overflow: 'hidden', background: '#EFE8DD'}}>
			<div style={{position: 'absolute', inset: 0, background: TERRA, clipPath: `circle(${bg * 110}% at 50% 40%)`}} />
			{/* paper grain */}
			<div style={{position: 'absolute', inset: 0, opacity: 0.18, mixBlendMode: 'multiply', backgroundImage: 'radial-gradient(rgba(0,0,0,0.25) 0.6px, transparent 0.8px)', backgroundSize: '3px 3px'}} />
			<Appear at={tl.top} kind="fade" style={{position: 'absolute', left: 32, right: 32, top: 28}}>
				<div style={{display: 'flex', alignItems: 'center', fontFamily: SANS, fontSize: 12.5, fontWeight: 700, letterSpacing: '0.2em', color: CREAM}}>
					<HalfMark size={18} color={CREAM} />
					<div style={{marginLeft: 10}}>HALFMOON COFFEE</div>
					<div style={{marginLeft: 'auto'}}>EST. 2026</div>
				</div>
				<div style={{height: 1.5, background: CREAM, opacity: 0.6, marginTop: 16}} />
			</Appear>
			<div style={{position: 'absolute', left: (POSTER_W - 400) / 2, top: 96}}>
				<Moon d={400} at={tl.moon} />
				<Sel at={tl.moon} label="Moon" radius={210} />
			</div>
			<div style={{position: 'absolute', left: (POSTER_W - 360) / 2, top: 58}}>
				<Cup at={tl.cup} w={360} />
				<Sel at={tl.cup} label="Photo · cup" inset={20} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 470}}>
				<BigType at={tl.type} size={152} lines={['GRAND', 'OPENING']} color={CREAM} />
				<Sel at={tl.type} label="Title" inset={-4} />
			</div>
			<Appear at={tl.info} kind="rise" style={{position: 'absolute', left: 32, right: 32, bottom: 30}}>
				<div style={{height: 1.5, background: CREAM, opacity: 0.6, marginBottom: 16}} />
				<div style={{display: 'flex', color: CREAM, fontFamily: SANS}}>
					{[
						['FRI', 'OCTOBER 17'],
						['7AM', 'TILL LATE'],
						['214', '4TH STREET'],
					].map(([a, b], i) => (
						<div key={a} style={{flex: 1, borderLeft: i ? `1.5px solid rgba(243,231,214,0.5)` : 'none', paddingLeft: i ? 16 : 0}}>
							<div style={{fontFamily: COND, fontWeight: 900, fontStretch: '75%', fontSize: 44, lineHeight: 0.9}}>{a}</div>
							<div style={{fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', marginTop: 6}}>{b}</div>
						</div>
					))}
					<div style={{flex: 1.25, borderLeft: `1.5px solid rgba(243,231,214,0.5)`, paddingLeft: 16, fontFamily: EDIT, fontStyle: 'italic', fontSize: 27, lineHeight: 1.05}}>
						First cup’s
						<br />
						on us.
					</div>
				</div>
			</Appear>
		</div>
	);
};

export const Story: React.FC<{at?: number}> = ({at}) => {
	const t = useT();
	const a = (d: number) => (at === undefined ? undefined : at + d);
	const bg = at === undefined ? 1 : step(t, at, 0.5);
	return (
		<div style={{width: STORY_W, height: STORY_H, position: 'relative', overflow: 'hidden', background: '#EFE8DD'}}>
			<div style={{position: 'absolute', inset: 0, background: TERRA, clipPath: `inset(${(1 - bg) * 100}% 0 0 0)`}} />
			<Appear at={a(0.15)} kind="fade" style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, color: CREAM, fontFamily: SERIF, fontSize: 21, fontWeight: 560, fontVariationSettings: `'opsz' 48, 'SOFT' 100`}}>
				<HalfMark size={20} color={CREAM} />
				Halfmoon
			</Appear>
			<div style={{position: 'absolute', left: (STORY_W - 250) / 2, top: 92}}>
				<Moon d={250} at={a(0.25)} />
			</div>
			<div style={{position: 'absolute', left: (STORY_W - 225) / 2, top: 68}}>
				<Cup at={a(0.5)} w={225} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 362}}>
				<BigType at={a(0.4)} size={90} lines={['GRAND', 'OPENING']} color={CREAM} />
			</div>
			<Appear at={a(0.65)} kind="rise" style={{position: 'absolute', left: 0, right: 0, top: 548, textAlign: 'center', color: CREAM, fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: '0.2em'}}>
				FRI 10.17 · 7AM · 214 4TH ST
			</Appear>
			<Appear at={a(0.8)} kind="pop" style={{position: 'absolute', left: (STORY_W - 180) / 2, top: 580}}>
				<div style={{width: 180, height: 40, borderRadius: 20, background: CREAM, color: TERRA, fontFamily: SANS, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
					Get directions
					<svg width={12} height={12} viewBox="0 0 12 12">
						<path d="M2 6h7M6 2.8L9.2 6 6 9.2" stroke={TERRA} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
			</Appear>
		</div>
	);
};

// ------------------------------------------------------------------ extras made in the last beat
export const MenuBoard: React.FC<{at?: number}> = ({at}) => {
	const sec = [
		['Coffee', [['Espresso', '3.50'], ['Cortado', '4.25'], ['Flat white', '4.75'], ['Cappuccino', '4.50'], ['Honey oat latte', '5.25']]],
		['Tea', [['Sencha', '4.00'], ['Masala chai', '4.75']]],
		['Bakery', [['Butter croissant', '4.00'], ['Cardamom bun', '4.50'], ['Banana bread', '3.75']]],
	] as const;
	return (
		<Appear at={at} kind="rise" style={{width: 420, height: 594, background: '#F6EFE4', padding: '36px 38px', boxSizing: 'border-box', color: ESPRESSO, fontFamily: SANS}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
				<HalfMark size={24} color={ESPRESSO} />
				<div style={{fontFamily: SERIF, fontSize: 25, fontWeight: 560, fontVariationSettings: `'opsz' 48, 'SOFT' 100`}}>Halfmoon</div>
				<div style={{marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.22em', color: '#8A6E5A'}}>MENU</div>
			</div>
			<div style={{height: 1.5, background: ESPRESSO, opacity: 0.85, margin: '18px 0 6px'}} />
			{sec.map(([title, items]) => (
				<div key={title} style={{marginTop: 16}}>
					<div style={{fontFamily: EDIT, fontStyle: 'italic', fontSize: 26, color: TERRA, marginBottom: 4}}>{title}</div>
					{items.map(([n, p]) => (
						<div key={n} style={{display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 14.5, height: 25}}>
							<div style={{fontWeight: 500}}>{n}</div>
							<div style={{flex: 1, borderBottom: '1.5px dotted rgba(35,21,13,0.35)', transform: 'translateY(-4px)'}} />
							<div style={{fontWeight: 600}}>{p}</div>
						</div>
					))}
				</div>
			))}
			<div style={{marginTop: 22, fontSize: 12.5, color: '#8A6E5A'}}>Oat and almond milk, always free.</div>
		</Appear>
	);
};

export const BizCards: React.FC<{at?: number}> = ({at}) => (
	<div style={{position: 'relative', width: 420, height: 340}}>
		<Appear at={at} kind="rise" style={{position: 'absolute', left: 0, top: 0, width: 350, height: 200, borderRadius: 12, background: TERRA, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, boxShadow: '0 14px 30px rgba(60,20,0,0.25)'}}>
			<HalfMark size={46} color={CREAM} stroke={2.2} />
			<div style={{fontFamily: SERIF, fontSize: 40, fontWeight: 520, color: CREAM, letterSpacing: '-0.02em', fontVariationSettings: `'opsz' 72, 'SOFT' 100`}}>Halfmoon</div>
		</Appear>
		<Appear at={at === undefined ? undefined : at + 0.15} kind="rise" style={{position: 'absolute', left: 70, top: 140, width: 350, height: 200, borderRadius: 12, background: '#F6EFE4', padding: '26px 28px', boxSizing: 'border-box', boxShadow: '0 18px 36px rgba(60,20,0,0.22)', fontFamily: SANS, color: ESPRESSO}}>
			<div style={{fontFamily: SERIF, fontSize: 24, fontWeight: 480, letterSpacing: '-0.015em', fontVariationSettings: `'opsz' 48, 'SOFT' 50`}}>Maya Chen</div>
			<div style={{fontSize: 12.5, color: '#8A6E5A', marginTop: 4}}>Owner &amp; head roaster</div>
			<div style={{position: 'absolute', left: 28, bottom: 24, fontSize: 12.5, lineHeight: 1.6}}>
				maya@halfmoon.coffee
				<br />
				214 4th Street
			</div>
			<div style={{position: 'absolute', right: 26, bottom: 26}}>
				<HalfMark size={28} color={TERRA} />
			</div>
		</Appear>
	</div>
);

export const BeanBag: React.FC<{at?: number}> = ({at}) => (
	<Appear at={at} kind="rise" style={{position: 'relative', width: 300, height: 420}}>
		<div
			style={{
				position: 'absolute',
				inset: 0,
				borderRadius: '14px 14px 22px 22px',
				background: 'linear-gradient(100deg, #B58D60 0%, #CBA676 35%, #C29C6C 65%, #A98157 100%)',
				boxShadow: '0 20px 40px rgba(60,30,0,0.28), inset 0 2px 0 rgba(255,255,255,0.25)',
			}}
		/>
		<div style={{position: 'absolute', left: 0, right: 0, top: 18, height: 14, background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.14) 0 3px, transparent 3px 7px)'}} />
		<div style={{position: 'absolute', left: 34, right: 34, top: 92, bottom: 56, borderRadius: 10, background: '#F6EFE4', padding: '22px 20px', boxSizing: 'border-box', color: ESPRESSO, fontFamily: SANS, textAlign: 'center'}}>
			<HalfMark size={30} color={ESPRESSO} />
			<div style={{fontSize: 10.5, fontWeight: 700, letterSpacing: '0.24em', marginTop: 12, color: '#8A6E5A'}}>HALFMOON ROASTERS</div>
			<div style={{fontFamily: SERIF, fontSize: 31, fontWeight: 420, letterSpacing: '-0.02em', marginTop: 14, lineHeight: 1, fontVariationSettings: `'opsz' 72, 'SOFT' 60`}}>
				Ethiopia
				<br />
				<span style={{fontStyle: 'italic', color: TERRA}}>Guji</span>
			</div>
			<div style={{height: 1, background: 'rgba(35,21,13,0.2)', margin: '16px 10px'}} />
			<div style={{fontSize: 12, lineHeight: 1.7}}>Washed · Light roast<br />Peach, jasmine, honey</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 16, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em'}}>250 G</div>
		</div>
	</Appear>
);

export const Sticker: React.FC<{at?: number}> = ({at}) => (
	<Appear at={at} kind="pop" style={{width: 230, height: 230}}>
		<svg width={230} height={230} viewBox="0 0 230 230" style={{filter: 'drop-shadow(0 12px 18px rgba(40,15,0,0.3))'}}>
			<defs>
				<path id="ring" d="M115 115 m-78 0 a78 78 0 1 1 156 0 a78 78 0 1 1 -156 0" />
			</defs>
			<circle cx={115} cy={115} r={110} fill="#FBF6EE" />
			<circle cx={115} cy={115} r={102} fill={ESPRESSO} />
			<text fontFamily="Inter" fontWeight={700} fontSize={15.5} letterSpacing={5.2} fill={CREAM}>
				<textPath href="#ring">HALFMOON COFFEE · 4TH STREET · EST 2026 ·</textPath>
			</text>
			<circle cx={115} cy={115} r={40} fill="none" stroke={CREAM} strokeWidth={3.5} />
			<path d="M115 75 A40 40 0 0 1 115 155 Z" fill={TERRA} />
		</svg>
	</Appear>
);
