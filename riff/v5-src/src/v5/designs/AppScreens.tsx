import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Appear, DevImg, HalfMark, Sel, useT} from './kit';
import {clamp01, easeInOut, FPS, img, SANS, SERIF, spr, step, WARM} from '../tokens';

export const PHONE_W = 393;
export const PHONE_H = 852;
const P = WARM;
const TAB = ['Home', 'Menu', 'Rewards', 'You'];

export type HomeTL = {screen?: number; head?: number; usual?: number; popular?: number; rewards?: number; tab?: number};
export type MenuTL = {screen?: number; head?: number; chips?: number; rows?: number; cart?: number};
export type OrderTL = {screen?: number; head?: number; ring?: number; steps?: number; map?: number};

const StatusBar: React.FC<{dark?: boolean}> = ({dark = true}) => {
	const c = dark ? '#111' : '#fff';
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: PHONE_W, height: 54, fontFamily: SANS, zIndex: 10}}>
			<div style={{position: 'absolute', left: 50, top: 17, fontSize: 17, fontWeight: 600, color: c, letterSpacing: '-0.01em'}}>9:41</div>
			<div style={{position: 'absolute', left: (PHONE_W - 124) / 2, top: 11, width: 124, height: 36, borderRadius: 18, background: '#000'}} />
			<div style={{position: 'absolute', right: 32, top: 20, display: 'flex', gap: 6, alignItems: 'center'}}>
				<svg width={18} height={12} viewBox="0 0 18 12">
					{[0, 1, 2, 3].map((i) => (
						<rect key={i} x={i * 4.6} y={9 - i * 2.6} width={3.2} height={3 + i * 2.6} rx={0.9} fill={c} />
					))}
				</svg>
				<svg width={16} height={12} viewBox="0 0 16 12">
					<path d="M1.2 4.2a9.6 9.6 0 0 1 13.6 0M3.6 6.8a6.2 6.2 0 0 1 8.8 0M6 9.3a2.8 2.8 0 0 1 4 0" stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" />
				</svg>
				<svg width={27} height={13} viewBox="0 0 27 13">
					<rect x={0.6} y={0.6} width={22.6} height={11.8} rx={3.6} fill="none" stroke={c} strokeOpacity={0.4} strokeWidth={1.1} />
					<rect x={2.4} y={2.4} width={18.4} height={8.2} rx={2.2} fill={c} />
					<path d="M24.6 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1s-.6-1.8-1.4-2.1z" fill={c} fillOpacity={0.45} />
				</svg>
			</div>
		</div>
	);
};

const HomeIndicator: React.FC<{dark?: boolean}> = ({dark = true}) => (
	<div style={{position: 'absolute', left: (PHONE_W - 136) / 2, bottom: 9, width: 136, height: 5, borderRadius: 3, background: dark ? '#111' : '#fff', zIndex: 10}} />
);

const TabIcon: React.FC<{i: number; color: string}> = ({i, color}) => {
	const s = {stroke: color, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	return (
		<svg width={24} height={24} viewBox="0 0 24 24">
			{i === 0 ? <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" {...s} /> : null}
			{i === 1 ? (
				<>
					<path d="M5 8h12v5a6 6 0 0 1-12 0z" {...s} />
					<path d="M17 9.5h1.5a2.5 2.5 0 0 1 0 5H17M8 3.5v2M11 3v2.5M14 3.5v2" {...s} />
				</>
			) : null}
			{i === 2 ? <path d="M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z" {...s} /> : null}
			{i === 3 ? (
				<>
					<circle cx={12} cy={8.5} r={3.8} {...s} />
					<path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" {...s} />
				</>
			) : null}
		</svg>
	);
};

const TabBar: React.FC<{active: number; at?: number}> = ({active, at}) => (
	<Appear at={at} kind="rise" dist={30} style={{position: 'absolute', left: 18, right: 18, bottom: 26, zIndex: 9}}>
		<div
			style={{
				height: 66,
				borderRadius: 33,
				background: 'rgba(255,252,248,0.72)',
				backdropFilter: 'blur(22px) saturate(180%)',
				boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(255,255,255,0.55), 0 10px 30px rgba(60,30,10,0.16), 0 0 0 0.5px rgba(60,30,10,0.12)',
				display: 'flex',
				alignItems: 'center',
				padding: '0 6px',
			}}
		>
			{TAB.map((x, i) => (
				<div
					key={x}
					style={{
						flex: 1,
						height: 54,
						borderRadius: 27,
						background: i === active ? 'rgba(180,83,42,0.12)' : 'transparent',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 2,
						fontFamily: SANS,
						fontSize: 10.5,
						fontWeight: 600,
						color: i === active ? P.accent : '#5A4A3D',
					}}
				>
					<TabIcon i={i} color={i === active ? P.accent : '#5A4A3D'} />
					{x}
				</div>
			))}
		</div>
	</Appear>
);

const Screen: React.FC<{at?: number; children: React.ReactNode; bg?: string}> = ({at, children, bg = P.bg}) => {
	const t = useT();
	const p = at === undefined ? 1 : step(t, at, 0.5);
	return (
		<div style={{width: PHONE_W, height: PHONE_H, position: 'relative', overflow: 'hidden', background: bg, fontFamily: SANS, color: P.ink, opacity: clamp01(p * 1.5)}}>
			{children}
		</div>
	);
};

const Plus: React.FC<{size?: number; filled?: boolean}> = ({size = 30, filled}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: size / 2,
			background: filled ? P.accent : 'transparent',
			border: filled ? 'none' : `1.5px solid ${P.accent}`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			boxShadow: filled ? '0 4px 10px rgba(180,83,42,0.35)' : 'none',
		}}
	>
		<svg width={size * 0.46} height={size * 0.46} viewBox="0 0 12 12">
			<path d="M6 1.5v9M1.5 6h9" stroke={filled ? '#fff' : P.accent} strokeWidth={1.8} strokeLinecap="round" />
		</svg>
	</div>
);

// ------------------------------------------------------------------ Home
export const HomeScreen: React.FC<{tl: HomeTL}> = ({tl}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	// content makes room first (fast, critically damped), then the card develops into the gap
	const u = tl.usual === undefined ? 0 : Math.min(1, spr(frame, tl.usual, 20, 0.6, 170));
	const uc = tl.usual === undefined ? 0 : Math.min(1, spr(frame, tl.usual + 0.16, 18, 0.8, 140));
	const cardAt = tl.usual === undefined ? undefined : tl.usual + 0.16;
	const shift = 252 * u;
	const items = [
		{n: 'Cappuccino', p: '4.50', src: 'top_cappuccino.png'},
		{n: 'Cortado', p: '4.25', src: 'top_cortado.png'},
		{n: 'Espresso', p: '3.50', src: 'top_espresso.png'},
	];
	return (
		<Screen at={tl.screen}>
			<StatusBar />
			<Appear at={tl.head} kind="fade" style={{position: 'absolute', left: 20, right: 20, top: 62, display: 'flex', alignItems: 'center'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px 0 10px', borderRadius: 18, background: 'rgba(118,96,79,0.09)'}}>
					<HalfMark size={18} color={P.ink} />
					<div style={{fontSize: 15, fontWeight: 600}}>4th Street</div>
					<svg width={12} height={12} viewBox="0 0 12 12">
						<path d="M3 4.5l3 3 3-3" stroke={P.sub} strokeWidth={1.6} fill="none" strokeLinecap="round" />
					</svg>
				</div>
				<div
					style={{
						marginLeft: 'auto',
						width: 38,
						height: 38,
						borderRadius: 19,
						background: 'linear-gradient(140deg, #E7A47E, #B4532A)',
						color: '#fff',
						fontSize: 13,
						fontWeight: 700,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					MC
				</div>
			</Appear>
			<Appear at={tl.head === undefined ? undefined : tl.head + 0.1} style={{position: 'absolute', left: 22, top: 118}}>
				<div style={{fontFamily: SERIF, fontSize: 37, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.05, fontVariationSettings: `'opsz' 72, 'SOFT' 60`}}>
					Morning, <span style={{fontStyle: 'italic', color: P.accent}}>Maya</span>
				</div>
				<div style={{fontSize: 15.5, color: P.sub, marginTop: 8}}>Your window seat is free today.</div>
			</Appear>
			{/* the usual: added later by voice */}
			{cardAt !== undefined && t >= cardAt ? (
				<div
					style={{
						position: 'absolute',
						left: 18,
						top: 206,
						width: 357,
						height: 234,
						opacity: clamp01(uc * 1.6),
						transform: `scale(${0.94 + 0.06 * uc})`,
						transformOrigin: '50% 0',
					}}
				>
					<DevImg at={cardAt} src={img('top_flatwhite.png')} pos="50% 50%" style={{position: 'absolute', inset: 0, borderRadius: 30}}>
						<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(25,12,4,0) 30%, rgba(25,12,4,0.62) 100%)'}} />
					</DevImg>
					<div style={{position: 'absolute', left: 16, top: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 14, background: 'rgba(255,250,244,0.85)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: P.accent}}>
						YOUR USUAL
					</div>
					<div style={{position: 'absolute', left: 20, bottom: 20, color: '#fff'}}>
						<div style={{fontFamily: SERIF, fontSize: 27, fontWeight: 450, letterSpacing: '-0.02em', fontVariationSettings: `'opsz' 48, 'SOFT' 50`}}>Oat flat white</div>
						<div style={{fontSize: 13.5, opacity: 0.85, marginTop: 3}}>12 oz · extra hot</div>
					</div>
					<div
						style={{
							position: 'absolute',
							right: 16,
							bottom: 18,
							height: 44,
							padding: '0 16px',
							borderRadius: 22,
							background: 'rgba(255,252,247,0.92)',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							fontSize: 14.5,
							fontWeight: 650,
							color: P.ink,
							boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
						}}
					>
						<svg width={14} height={14} viewBox="0 0 14 14">
							<path d="M8 1.5L3 8h4l-1 4.5L11 6H7z" fill={P.accent} />
						</svg>
						Reorder · $5.25
					</div>
					<Sel at={cardAt} label="Your usual" radius={34} />
				</div>
			) : null}
			{/* popular */}
			<Appear at={tl.popular} style={{position: 'absolute', left: 0, right: 0, top: 210 + shift}}>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 22px'}}>
					<div style={{fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em'}}>Popular right now</div>
					<div style={{fontSize: 14.5, fontWeight: 600, color: P.accent}}>See all</div>
				</div>
				<div style={{display: 'flex', gap: 14, padding: '14px 22px 0', width: 700}}>
					{items.map((m, i) => (
						<div key={m.n} style={{width: 162}}>
							<div style={{position: 'relative'}}>
								<DevImg at={tl.popular === undefined ? undefined : tl.popular + i * 0.08} src={img(m.src)} zoom={1.25} style={{width: 162, height: 150, borderRadius: 22}} />
								<div style={{position: 'absolute', right: 10, bottom: 10}}>
									<Plus filled size={32} />
								</div>
							</div>
							<div style={{fontSize: 16, fontWeight: 600, marginTop: 10}}>{m.n}</div>
							<div style={{fontSize: 14, color: P.sub, marginTop: 2}}>${m.p}</div>
						</div>
					))}
				</div>
			</Appear>
			{/* rewards */}
			<Appear at={tl.rewards} style={{position: 'absolute', left: 18, right: 18, top: 482 + shift, opacity: 1 - 0.75 * u}}>
				<div style={{borderRadius: 24, background: P.paper, padding: '18px 18px', boxShadow: '0 1px 0 rgba(60,30,10,0.05), 0 8px 24px rgba(60,30,10,0.06)'}}>
					<div style={{display: 'flex', justifyContent: 'space-between'}}>
						<div style={{fontSize: 15.5, fontWeight: 650}}>7 of 10 stamps</div>
						<div style={{fontSize: 13.5, color: P.sub}}>3 more for a free drink</div>
					</div>
					<div style={{display: 'flex', gap: 7, marginTop: 14}}>
						{new Array(10).fill(0).map((_, i) => (
							<div
								key={i}
								style={{
									flex: 1,
									height: 26,
									borderRadius: 13,
									background: i < 7 ? P.accent : 'rgba(118,96,79,0.12)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								{i < 7 ? <HalfMark size={13} color="#FBF3E8" stroke={2.6} /> : null}
							</div>
						))}
					</div>
				</div>
			</Appear>
			<TabBar active={0} at={tl.tab} />
			<HomeIndicator />
		</Screen>
	);
};

// ------------------------------------------------------------------ Menu
export const MenuScreen: React.FC<{tl: MenuTL}> = ({tl}) => {
	const rows = [
		{n: 'Flat white', d: 'Double ristretto, silky milk', p: '4.75', src: 'top_flatwhite.png'},
		{n: 'Cappuccino', d: 'Equal parts, a little cocoa', p: '4.50', src: 'top_cappuccino.png'},
		{n: 'Cortado', d: 'Short, strong, just enough milk', p: '4.25', src: 'top_cortado.png'},
		{n: 'Espresso', d: 'Guji single origin, 18g in', p: '3.50', src: 'top_espresso.png'},
		{n: 'Honey oat latte', d: 'Local honey, oat milk, cinnamon', p: '5.25', src: 'top_cappuccino.png'},
	];
	return (
		<Screen at={tl.screen}>
			<StatusBar />
			<Appear at={tl.head} style={{position: 'absolute', left: 22, right: 22, top: 96}}>
				<div style={{display: 'flex', alignItems: 'center'}}>
					<div style={{fontFamily: SERIF, fontSize: 42, fontWeight: 400, letterSpacing: '-0.03em', fontVariationSettings: `'opsz' 96, 'SOFT' 60`}}>Menu</div>
					<div style={{marginLeft: 'auto', position: 'relative', width: 42, height: 42, borderRadius: 21, background: 'rgba(118,96,79,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<svg width={20} height={20} viewBox="0 0 18 18">
							<path d="M3.5 6.5h11l-1 9h-9z" stroke={P.ink} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
							<path d="M6.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" stroke={P.ink} strokeWidth={1.5} fill="none" />
						</svg>
						<div style={{position: 'absolute', right: -2, top: -2, width: 18, height: 18, borderRadius: 9, background: P.accent, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>2</div>
					</div>
				</div>
				<div style={{marginTop: 16, height: 44, borderRadius: 22, background: 'rgba(118,96,79,0.09)', display: 'flex', alignItems: 'center', gap: 9, padding: '0 16px', fontSize: 15.5, color: P.sub}}>
					<svg width={16} height={16} viewBox="0 0 20 20">
						<circle cx={8.6} cy={8.6} r={5.6} stroke={P.sub} strokeWidth={1.8} fill="none" />
						<path d="M12.8 12.8l4 4" stroke={P.sub} strokeWidth={1.8} strokeLinecap="round" />
					</svg>
					Search coffee, tea, pastries
				</div>
			</Appear>
			<Appear at={tl.chips} kind="left" style={{position: 'absolute', left: 22, top: 222, display: 'flex', gap: 8, width: 600}}>
				{['Coffee', 'Tea', 'Bakery', 'Beans', 'Merch'].map((c, i) => (
					<div
						key={c}
						style={{
							height: 36,
							padding: '0 16px',
							borderRadius: 18,
							background: i === 0 ? P.ink : 'transparent',
							color: i === 0 ? P.bg : P.ink,
							border: i === 0 ? 'none' : `1.5px solid ${P.line}`,
							display: 'flex',
							alignItems: 'center',
							fontSize: 14.5,
							fontWeight: 600,
						}}
					>
						{c}
					</div>
				))}
			</Appear>
			<div style={{position: 'absolute', left: 22, right: 22, top: 284}}>
				{rows.map((r, i) => {
					const at = tl.rows === undefined ? undefined : tl.rows + i * 0.08;
					return (
						<Appear key={r.n} at={at} kind="rise" style={{display: 'flex', alignItems: 'center', gap: 14, height: 90, borderBottom: i < rows.length - 1 ? `1px solid ${P.line}` : 'none'}}>
							<DevImg at={at} src={img(r.src)} zoom={2.1} style={{width: 66, height: 66, borderRadius: 18, flexShrink: 0}} />
							<div style={{flex: 1, minWidth: 0}}>
								<div style={{fontSize: 16.5, fontWeight: 600, letterSpacing: '-0.01em'}}>{r.n}</div>
								<div style={{fontSize: 13.5, color: P.sub, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.d}</div>
							</div>
							<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6}}>
								<div style={{fontSize: 15, fontWeight: 600}}>${r.p}</div>
								<Plus size={28} />
							</div>
						</Appear>
					);
				})}
			</div>
			<Appear at={tl.cart} kind="rise" dist={30} style={{position: 'absolute', left: 18, right: 18, bottom: 104, zIndex: 8}}>
				<div
					style={{
						height: 58,
						borderRadius: 29,
						background: P.accent,
						color: P.onAccent,
						display: 'flex',
						alignItems: 'center',
						padding: '0 22px',
						fontSize: 16,
						fontWeight: 650,
						boxShadow: '0 12px 28px rgba(180,83,42,0.38)',
					}}
				>
					View order
					<div style={{marginLeft: 'auto', fontWeight: 500, opacity: 0.9}}>2 items · $9.50</div>
				</div>
			</Appear>
			<TabBar active={1} at={tl.head} />
			<HomeIndicator />
		</Screen>
	);
};

// ------------------------------------------------------------------ Order status
export const OrderScreen: React.FC<{tl: OrderTL}> = ({tl}) => {
	const t = useT();
	const ring = tl.ring === undefined ? 0 : 0.72 * step(t, tl.ring, 1.4, easeInOut);
	const R = 112;
	const C = 2 * Math.PI * R;
	const pulse = 0.5 + 0.5 * Math.sin(t * 5);
	const steps = [
		{l: 'Order received', s: '9:41 AM', state: 2},
		{l: 'Brewing your flat white', s: 'Now', state: 1},
		{l: 'Ready at the counter', s: '~3 min', state: 0},
	];
	return (
		<Screen at={tl.screen}>
			<StatusBar />
			<Appear at={tl.head} kind="fade" style={{position: 'absolute', left: 20, right: 20, top: 62, display: 'flex', alignItems: 'center'}}>
				<div style={{width: 38, height: 38, borderRadius: 19, background: 'rgba(118,96,79,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg width={14} height={14} viewBox="0 0 14 14">
						<path d="M3 3l8 8M11 3l-8 8" stroke={P.ink} strokeWidth={1.8} strokeLinecap="round" />
					</svg>
				</div>
				<div style={{marginLeft: 'auto', marginRight: 'auto', fontSize: 15.5, fontWeight: 650, transform: 'translateX(-19px)'}}>Order #24</div>
			</Appear>
			<Appear at={tl.head === undefined ? undefined : tl.head + 0.1} style={{position: 'absolute', left: 0, right: 0, top: 118, textAlign: 'center'}}>
				<div style={{fontFamily: SERIF, fontSize: 40, fontWeight: 400, letterSpacing: '-0.03em', fontVariationSettings: `'opsz' 96, 'SOFT' 60`}}>
					Almost <span style={{fontStyle: 'italic', color: P.accent}}>ready</span>
				</div>
				<div style={{fontSize: 15, color: P.sub, marginTop: 6}}>Oat flat white · pick up at the counter</div>
			</Appear>
			<Appear at={tl.ring} kind="pop" style={{position: 'absolute', left: PHONE_W / 2 - 132, top: 214, width: 264, height: 264}}>
				<svg width={264} height={264} viewBox="0 0 264 264" style={{position: 'absolute', inset: 0}}>
					<circle cx={132} cy={132} r={R} stroke="rgba(118,96,79,0.14)" strokeWidth={14} fill="none" />
					<circle
						cx={132}
						cy={132}
						r={R}
						stroke={P.accent}
						strokeWidth={14}
						fill="none"
						strokeLinecap="round"
						strokeDasharray={C}
						strokeDashoffset={C * (1 - ring)}
						transform="rotate(-90 132 132)"
					/>
				</svg>
				<div
					style={{
						position: 'absolute',
						left: 36,
						top: 36,
						width: 192,
						height: 192,
						borderRadius: 96,
						overflow: 'hidden',
						backgroundImage: `url(${img('top_flatwhite.png')})`,
						backgroundSize: '200%',
						backgroundPosition: '50% 50%',
						boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
					}}
				/>
			</Appear>
			<Appear at={tl.ring === undefined ? undefined : tl.ring + 0.3} style={{position: 'absolute', left: 0, right: 0, top: 492, textAlign: 'center'}}>
				<div style={{fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em'}}>3 min</div>
			</Appear>
			<Appear at={tl.steps} style={{position: 'absolute', left: 26, right: 26, top: 552}}>
				{steps.map((s, i) => (
					<div key={s.l} style={{display: 'flex', alignItems: 'center', gap: 14, height: 46, position: 'relative'}}>
						{i < 2 ? <div style={{position: 'absolute', left: 11, top: 34, width: 2, height: 24, background: i === 0 ? P.accent : 'rgba(118,96,79,0.2)'}} /> : null}
						<div
							style={{
								width: 24,
								height: 24,
								borderRadius: 12,
								background: s.state === 2 ? P.accent : s.state === 1 ? '#fff' : 'transparent',
								border: s.state === 1 ? `2px solid ${P.accent}` : s.state === 0 ? '2px solid rgba(118,96,79,0.3)' : 'none',
								boxSizing: 'border-box',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: s.state === 1 ? `0 0 0 ${4 + pulse * 4}px rgba(180,83,42,${0.18 - pulse * 0.1})` : 'none',
							}}
						>
							{s.state === 2 ? (
								<svg width={12} height={12} viewBox="0 0 12 12">
									<path d="M2.5 6.2l2.4 2.4 4.6-5" stroke="#fff" strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							) : s.state === 1 ? (
								<div style={{width: 8, height: 8, borderRadius: 4, background: P.accent}} />
							) : null}
						</div>
						<div style={{fontSize: 15.5, fontWeight: s.state === 1 ? 650 : 500, color: s.state === 0 ? P.sub : P.ink}}>{s.l}</div>
						<div style={{marginLeft: 'auto', fontSize: 13.5, color: P.sub}}>{s.s}</div>
					</div>
				))}
			</Appear>
			<Appear at={tl.map} kind="rise" style={{position: 'absolute', left: 18, right: 18, bottom: 34}}>
				<div style={{borderRadius: 24, background: P.paper, padding: 12, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 8px 24px rgba(60,30,10,0.08)'}}>
					<svg width={86} height={70} viewBox="0 0 86 70" style={{borderRadius: 14, flexShrink: 0}}>
						<rect width={86} height={70} rx={14} fill="#EADCC8" />
						<path d="M-5 24 L91 14 M-5 52 L91 46 M24 -5 L30 75 M60 -5 L56 75" stroke="#FBF6EE" strokeWidth={7} />
						<path d="M-5 38 L91 32" stroke="#FBF6EE" strokeWidth={3} />
						<circle cx={43} cy={33} r={9} fill={P.accent} />
						<circle cx={43} cy={33} r={3.4} fill="#fff" />
					</svg>
					<div>
						<div style={{fontSize: 15.5, fontWeight: 650}}>214 4th Street</div>
						<div style={{fontSize: 13.5, color: P.sub, marginTop: 3}}>3 min walk · open until 3 pm</div>
					</div>
				</div>
			</Appear>
			<HomeIndicator />
		</Screen>
	);
};
