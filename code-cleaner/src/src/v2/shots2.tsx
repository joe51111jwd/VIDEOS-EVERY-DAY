import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {L, LF} from '../lib/theme';
import {HARNESS} from '../ui/App';
import {CODE, Line} from '../ui/Code';
import {Logo3D, usePose} from './Logo3D';
import {CodeSheet, Dust, Pill, pop} from './parts';
import {BigNum, local} from './shots1';
import {Flash, Obj, Space, Title, ce, easeIn, easeInOut, easeOut, fmt, kf} from './kit';

const rand = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const inkFill = 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 45%, #B9BAC1 100%)';
const mintFill = 'linear-gradient(180deg, #CFFFEA 0%, #5CF7BE 45%, #19C98B 100%)';
const money = (s: string) => (s.startsWith('$') ? '$' + Number(s.slice(1)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : s);
const glass = 'linear-gradient(180deg, rgba(34,37,43,0.94), rgba(16,17,21,0.96))';
const rim = (a = 0.1) => `0 0 0 1px rgba(255,255,255,${a}), inset 0 1px 0 rgba(255,255,255,0.08), 0 40px 110px rgba(0,0,0,0.7)`;

/** static syntax-coloured lines from data/code.json */
const Lines: React.FC<{lines: Line[]; size?: number; lh?: number; from?: number}> = ({lines, size = 21, lh = 33, from = 1}) => (
	<div style={{fontFamily: LF.mono, fontSize: size, lineHeight: `${lh}px`, whiteSpace: 'pre'}}>
		{lines.map((ln, i) => (
			<div key={i} style={{height: lh, overflow: 'hidden'}}>
				<span style={{color: '#3A3E46', display: 'inline-block', width: size * 2.6}}>{from + i}</span>
				{ln.map(([t, c], k) => (
					<span key={k} style={{color: c}}>
						{t}
					</span>
				))}
			</div>
		))}
	</div>
);

/* ================================================================== F  the proof: old vs new on the same inputs (beats 16-22.5) */
const PROOF = [
	{row: HARNESS.rows[0], k: 16},
	{row: HARNESS.rows[1], k: 17},
	{row: HARNESS.rows[2], k: 17.5},
	{row: HARNESS.rows[3], k: 18},
	{row: HARNESS.rows[4], k: 19}, // the rewrite is off by 2 cents here
];
const CARD_W = 560;
const CARD_H = 430;
const slotX = (i: number) => (i - 2) * (CARD_W + 60);
const CARD_Z = -1400;

const ProofCard: React.FC<{i: number; land: number}> = ({i, land}) => {
	const f = useCurrentFrame();
	const {row} = PROOF[i];
	const bad = i === 4;
	const newVal = bad ? row.bad : row.new;
	const nv = interpolate(f - land, [2, 6], [0, 1], ce);
	const badge = pop(f, land + 5, 8);
	const red = bad ? interpolate(f - land, [5, 9], [0, 1], ce) : 0;
	const val = (v: string, color: string, hot?: boolean) => {
		const m = money(v);
		if (!hot) return <span style={{color}}>{m}</span>;
		return (
			<span style={{color}}>
				{m.slice(0, -1)}
				<span style={{color: '#FF5B4F', textShadow: `0 0 ${18 * red}px rgba(255,69,58,0.9)`, borderBottom: `3px solid rgba(255,91,79,${red})`}}>{m.slice(-1)}</span>
			</span>
		);
	};
	return (
		<div
			style={{
				width: CARD_W,
				height: CARD_H,
				borderRadius: 24,
				background: glass,
				boxShadow: `${rim(0.1 + 0.25 * red)}${bad ? `, 0 0 ${110 * red}px rgba(255,69,58,${0.35 * red})` : `, 0 0 ${60 * badge}px rgba(61,245,176,${0.12 * badge})`}`,
				padding: '30px 36px',
				fontFamily: LF.sans,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div style={{display: 'flex', alignItems: 'baseline', gap: 12, fontFamily: LF.mono}}>
				<span style={{fontSize: 26, color: L.sub}}>#{row.i}</span>
				<span style={{fontSize: 30, color: '#C7C7CC'}}>{row.in}</span>
			</div>
			<div style={{height: 1, background: 'rgba(255,255,255,0.08)', margin: '22px 0 16px'}} />
			{[
				['Original', val(row.old, '#E5E5EA')],
				['Rewrite', <span key="n" style={{opacity: nv}}>{val(newVal, bad ? interpolateColors(red, [0, 1], [L.mint, '#FF8A80']) : L.mint, bad)}</span>],
			].map(([k, v], j) => (
				<div key={j} style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', height: 74}}>
					<span style={{fontSize: 29, color: L.sub, fontWeight: 500}}>{k}</span>
					<span style={{fontFamily: LF.mono, fontSize: 50, letterSpacing: '-0.03em'}}>{v}</span>
				</div>
			))}
			<div style={{flex: 1}} />
			<div style={{opacity: badge, transform: `scale(${0.85 + 0.15 * badge})`, transformOrigin: 'left center'}}>
				{bad ? (
					<Pill color="#FF6B60" size={31} glow={red} bg="linear-gradient(180deg, rgba(70,20,18,0.95), rgba(40,10,9,0.95))">
						≠ off by 2¢
					</Pill>
				) : (
					<Pill color={L.mint} size={31} glow={0.5}>
						= identical
					</Pill>
				)}
			</div>
		</div>
	);
};

export const ShotProof: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(16);
	const fail = l(19);
	const cut = l(20);
	if (f >= cut) return <Rejected t={f - cut} />;
	// the camera rides along the row, then pushes into the wrong cent
	const push = interpolate(f, [fail + 3, fail + 13], [0, 1], {...ce, easing: easeInOut});
	const track = kf(
		f,
		[
			[0, slotX(0)],
			[l(17), slotX(1) - 310],
			[l(17.5), slotX(2) - 620],
			[l(18), slotX(3) - 620],
			[l(19), slotX(4) - 620],
		],
		easeInOut,
	);
	const macro = {x: slotX(4) + 98, y: 30 + 56, z: CARD_Z + 490};
	const cam = {
		x: track * (1 - push) + macro.x * push,
		y: 0 * (1 - push) + macro.y * push,
		z: kf(f, [[0, 60], [fail, -40]], easeOut) * (1 - push) + macro.z * push + kf(f, [[fail + 13, 0], [cut, -30]], (t) => t),
		ry: kf(f, [[0, -4], [fail, 3]], easeOut) * (1 - push),
	};
	const whip = Math.sin(Math.PI * interpolate(f, [fail + 3, fail + 13], [0, 1], ce));
	const capOut = interpolate(f, [fail + 2, fail + 8], [1, 0], ce);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 55%, #0c1311 0%, #000 72%)'}}>
			<AbsoluteFill style={{filter: whip > 0.05 ? `blur(${whip * 7}px)` : undefined}}>
				<Space cam={cam} focus={1440 - 950 * push} aperture={4 + 5 * push}>
					<Dust n={28} zNear={-800} zFar={-4000} size={8} color="rgba(61,245,176,0.3)" />
					{PROOF.map((p, i) => {
						const land = l(p.k);
						const t = interpolate(f, [land - 9, land], [0, 1], {...ce, easing: easeOut});
						if (t <= 0) return null;
						const dim = i < 4 ? 1 - 0.55 * push : 1;
						return (
							<Obj key={i} x={slotX(i) + 900 * (1 - t)} y={30} z={CARD_Z - 1500 * (1 - t)} ry={-30 * (1 - t)} opacity={Math.min(1, t * 1.6) * dim}>
								<ProofCard i={i} land={land} />
							</Obj>
						);
					})}
				</Space>
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 96, opacity: capOut}}>
				<Title parts={[{t: 'Old vs new.'}, {t: 'Same 1,000 inputs.', c: 'mint'}]} at={-2} size={96} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** hard cut on the beat: the verdict, with the broken rewrite falling apart behind it */
const Rejected: React.FC<{t: number}> = ({t}) => {
	const shards = Array.from({length: 46}, (_, i) => i);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 55% at 50% 50%, #1a0706 0%, #000 70%)'}}>
			<Space cam={{z: -t * 3, rz: interpolate(t, [0, 50], [0.6, -0.6])}} focus={1200} aperture={7}>
				{shards.map((i) => {
					const a = rand(i) * Math.PI * 2;
					const sp = 6 + rand(i + 4) * 16;
					const z = -1300 - rand(i + 8) * 2400;
					return (
						<Obj key={i} x={Math.cos(a) * (260 + sp * t)} y={Math.sin(a) * (170 + sp * 0.6 * t)} z={z} rz={rand(i + 2) * 360 + t * (rand(i + 6) - 0.5) * 8} opacity={interpolate(t, [0, 3, 40], [0, 0.9, 0.45], ce)}>
							<div style={{width: 30 + rand(i + 1) * 120, height: 6 + rand(i + 3) * 8, borderRadius: 3, background: '#FF5B4F', boxShadow: '0 0 20px rgba(255,69,58,0.8)'}} />
						</Obj>
					);
				})}
				<Obj x={0} y={-80} z={-1200}>
					<div style={{width: 1700}}>
						<Title parts={[{t: 'Off by 2¢.'}]} at={0} size={150} />
					</div>
				</Obj>
				<Obj x={0} y={95} z={-1200}>
					<div style={{width: 1700}}>
						<Title parts={[{t: 'Rewrite rejected.', c: 'red'}]} at={8} size={150} stagger={3} />
					</div>
				</Obj>
			</Space>
			<Flash at={0} dur={6} peak={0.25} color="#ff4d40" />
		</AbsoluteFill>
	);
};

/* ================================================================== G  attempt 2: a thousand inputs (beats 22.5-28) */
const STREAM = 96;
export const ShotAgain: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(22.5);
	const s0 = l(23);
	const s1 = l(27.5);
	const p = interpolate(f, [s0, s1], [0, 1], {...ce, easing: Easing.bezier(0.42, 0, 0.7, 1)});
	const n = Math.round(1000 * p);
	const done = f >= s1;
	const numIn = pop(f, s0 - 6, 10);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 65% at 50% 52%, #07130f 0%, #000 72%)'}}>
			<Space cam={{rz: kf(f, [[0, -2], [s1 + 10, 2]]), z: kf(f, [[0, 0], [s1 + 10, -120]])}} focus={1300} aperture={6}>
				{Array.from({length: STREAM}, (_, k) => {
					const born = s0 + (s1 - s0) * Math.sqrt(k / STREAM) - 4;
					const life = 30;
					const t = (f - born) / life;
					if (t <= 0 || t >= 1) return null;
					const a = rand(k + 11) * Math.PI * 2;
					const r = 520 + rand(k + 17) * 520;
					const row = HARNESS.rows[Math.min(999, Math.floor((k / STREAM) * 1000))];
					return (
						<Obj key={k} x={Math.cos(a) * r * 1.5} y={Math.sin(a) * r * 0.72} z={-4300 + 4400 * Math.pow(t, 1.5)} opacity={interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0])}>
							<div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px', borderRadius: 20, background: glass, boxShadow: `${rim(0.16)}, 0 0 40px rgba(61,245,176,0.10)`, fontFamily: LF.mono, fontSize: 30, whiteSpace: 'nowrap'}}>
								<span style={{color: L.sub}}>#{row.i}</span>
								<span style={{color: '#E5E5EA'}}>{row.in}</span>
								<span style={{color: L.mint, textShadow: '0 0 14px rgba(61,245,176,0.7)'}}>= ✓</span>
							</div>
						</Obj>
					);
				})}
			</Space>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 34% 30% at 50% 52%, rgba(0,0,0,0.85), rgba(0,0,0,0) 100%)'}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<Title parts={[{t: 'It rewrites again.'}]} at={0} size={84} weight={500} />
				<div style={{opacity: numIn, transform: `scale(${(0.9 + 0.1 * numIn) * (done ? interpolate(f - s1, [0, 3, 10], [1, 1.06, 1], ce) : 1)})`, marginTop: 4}}>
					<BigNum text={fmt(n)} size={300} fill={done ? mintFill : inkFill} glow={done ? 'rgba(61,245,176,0.55)' : 'rgba(255,255,255,0.16)'} />
				</div>
				<div style={{opacity: numIn, fontFamily: LF.sans, fontWeight: 500, fontSize: 54, letterSpacing: '-0.02em', color: '#A1A1A6', marginTop: -10}}>of 1,000 inputs identical</div>
			</AbsoluteFill>
			<Flash at={s1} dur={8} peak={0.18} color="#bfffe6" />
		</AbsoluteFill>
	);
};

/* ================================================================== H  1,000 of 1,000: kept (beats 28-32) */
const GC = 40;
const GR = 25;
export const ShotKept: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(28);
	const end = l(32);
	const cam = {y: kf(f, [[0, 60], [end, -150]], easeOut), z: kf(f, [[0, 0], [end, -260]], easeOut), rx: kf(f, [[0, 4], [end, 16]], easeOut)};
	const tiles: React.ReactNode[] = [];
	for (let r = 0; r < GR; r++) {
		for (let c = 0; c < GC; c++) {
			const d = Math.hypot(c - (GC - 1) / 2, (r - (GR - 1) / 2) * 1.3);
			const t = interpolate(f, [d * 0.55, d * 0.55 + 7], [0, 1], ce);
			const pulse = interpolate(f - d * 0.55, [0, 3, 12], [0, 1, 0], ce);
			tiles.push(
				<div
					key={r * GC + c}
					style={{
						width: 34,
						height: 34,
						borderRadius: 8,
						background: interpolateColors(t, [0, 1], ['#1A1D22', r % 3 === 0 && c % 4 === 1 ? '#2BE7A5' : '#20C88E']),
						boxShadow: pulse > 0.02 ? `0 0 ${26 * pulse}px rgba(61,245,176,${0.9 * pulse})` : undefined,
						transform: `scale(${1 + 0.25 * pulse})`,
					}}
				/>,
			);
		}
	}
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Space cam={cam} focus={1700} aperture={4}>
				<Obj x={0} y={520} z={-2000} rx={64}>
					<div style={{display: 'grid', gridTemplateColumns: `repeat(${GC}, 34px)`, gap: 12}}>{tiles}</div>
				</Obj>
			</Space>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0) 62%)'}} />
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 150}}>
				<Title parts={[{t: '1,000 of 1,000.'}]} at={0} size={150} stagger={2} />
				<div style={{height: 10}} />
				<Title parts={[{t: 'Rewrite kept.', c: 'mint'}]} at={6} size={150} stagger={3} />
			</AbsoluteFill>
			<Flash at={0} dur={8} peak={0.35} color="#c9ffe9" />
		</AbsoluteFill>
	);
};

/* ================================================================== I  won't guess (beats 32-36) */
const FN_ROW = [
	{name: 'calculateCheckoutTotal()', ok: true},
	{name: 'resolveCoupon()', ok: true},
	{name: 'flashSaleEndsIn()', ok: false},
	{name: 'getTaxRate()', ok: true},
	{name: 'computeReceipt()', ok: true},
];
export const ShotSkip: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(32);
	const end = l(36);
	const lift = interpolate(f, [4, 22], [0, 1], {...ce, easing: easeInOut});
	const clock = 1760211437512 + f * 33 + Math.floor(rand(f) * 9);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 70% at 64% 50%, #14110a 0%, #000 72%)'}}>
			<Space cam={{x: kf(f, [[0, 40], [end, -30]]), z: kf(f, [[0, 0], [end, -90]])}} focus={1300} aperture={4}>
				{FN_ROW.map((fn, i) => {
					const sx = -300 + i * 560;
					const isSkip = !fn.ok;
					const x = isSkip ? interpolate(lift, [0, 1], [sx, 520]) : sx;
					const z = isSkip ? interpolate(lift, [0, 1], [-2600, -1400]) : -2600;
					const y = isSkip ? interpolate(lift, [0, 1], [260, 30]) : 260;
					return (
						<Obj key={i} x={x} y={y} z={z} ry={isSkip ? -10 * lift : -8} opacity={isSkip ? 1 : 1 - 0.3 * lift}>
							{isSkip ? (
								<SkipCard lift={lift} clock={clock} />
							) : (
								<div style={{width: 480, padding: '24px 28px', borderRadius: 20, background: glass, boxShadow: rim(0.1), fontFamily: LF.mono, fontSize: 25, display: 'flex', justifyContent: 'space-between', color: '#C7C7CC'}}>
									<span>{fn.name}</span>
									<span style={{color: L.mint}}>✓</span>
								</div>
							)}
						</Obj>
					);
				})}
				<Obj x={-430} y={-10} z={-1450} ry={4}>
					<div style={{width: 900}}>
						<Title parts={[{t: "Can't prove it?"}]} at={0} size={112} align="left" />
						<div style={{height: 24}} />
						<Title parts={[{t: "Won't touch it.", c: 'amber'}]} at={l(33.5)} size={112} align="left" />
					</div>
				</Obj>
			</Space>
		</AbsoluteFill>
	);
};
const SkipCard: React.FC<{lift: number; clock: number}> = ({lift, clock}) => {
	const f = useCurrentFrame();
	const tag = pop(f, 20, 10);
	return (
		<div style={{width: 860, borderRadius: 24, background: glass, boxShadow: `${rim(0.12 + 0.2 * lift)}, 0 0 ${120 * lift}px rgba(255,214,10,${0.16 * lift})`, fontFamily: LF.mono, overflow: 'hidden'}}>
			<div style={{display: 'flex', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 21, color: L.sub}}>
				<span style={{flex: 1}}>lib/flash-sale.ts</span>
				<span style={{color: L.amber}}>● can't prove</span>
			</div>
			<div style={{padding: '26px 30px 10px', fontSize: 30, lineHeight: '50px', whiteSpace: 'pre', color: '#E6EDF3'}}>
				<div>
					<span style={{color: '#FF7B72'}}>export function </span>
					<span style={{color: '#D2A8FF'}}>flashSaleEndsIn</span>(sale) {'{'}
				</div>
				<div>
					{'  '}
					<span style={{color: '#FF7B72'}}>return</span> sale.endsAt -{' '}
					<span style={{color: '#FFE48A', background: `rgba(255,214,10,${0.18 * lift})`, borderBottom: `3px solid rgba(255,214,10,${lift})`, textShadow: `0 0 ${16 * lift}px rgba(255,214,10,0.6)`}}>Date.now()</span>;
				</div>
				<div>{'}'}</div>
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 18, margin: '8px 30px 26px', padding: '16px 20px', borderRadius: 14, background: 'rgba(255,214,10,0.06)', boxShadow: '0 0 0 1px rgba(255,214,10,0.18)', fontSize: 23}}>
				<span style={{color: L.sub}}>Date.now()</span>
				<span style={{color: '#FFE48A', fontVariantNumeric: 'tabular-nums'}}>{clock}</span>
				<span style={{color: L.sub}}>a new answer every run</span>
			</div>
			<div style={{margin: '0 30px 28px', opacity: tag, transform: `translateY(${(1 - tag) * 14}px)`}}>
				<Pill color={L.amber} size={24} glow={0.6}>
					Skipped · left exactly as it is
				</Pill>
			</div>
		</div>
	);
};

/* ================================================================== J  port it (beats 36-40) */
const TS = CODE.clean.slice(10, 24);
const RS = CODE.rust.slice(15, 29);
export const ShotPort: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(36);
	const end = l(40);
	const flip = interpolate(f, [6, 22], [0, 180], {...ce, easing: easeInOut});
	const sweep = interpolate(f, [8, 26], [-0.4, 1.4], ce);
	const bars = interpolate(f, [l(37), l(37) + 14], [0, 1], {...ce, easing: easeOut});
	const face = (title: string, lang: string, lines: Line[], back: boolean, accent: string) => (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				borderRadius: 26,
				background: glass,
				boxShadow: `${rim(0.12)}, 0 0 90px ${accent}22`,
				backfaceVisibility: 'hidden',
				WebkitBackfaceVisibility: 'hidden',
				transform: back ? 'rotateY(180deg)' : undefined,
				overflow: 'hidden',
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontFamily: LF.mono, fontSize: 22}}>
				<span style={{color: '#E5E5EA'}}>{title}</span>
				<div style={{flex: 1}} />
				<span style={{color: accent, padding: '4px 12px', borderRadius: 8, boxShadow: `0 0 0 1px ${accent}55`}}>{lang}</span>
			</div>
			<div style={{padding: '18px 22px'}}>
				<Lines lines={lines} size={19} lh={31} from={back ? 16 : 11} />
			</div>
			<div style={{position: 'absolute', inset: 0, background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 100 - 18}%, rgba(255,255,255,0.13) ${sweep * 100}%, rgba(255,255,255,0) ${sweep * 100 + 18}%)`, mixBlendMode: 'screen'}} />
		</div>
	);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 70% at 35% 50%, #0e1110 0%, #000 72%)'}}>
			<Space cam={{x: kf(f, [[0, 40], [end, -20]]), z: kf(f, [[0, 0], [end, -110]]), ry: kf(f, [[0, 1.5], [end, -1.5]])}} focus={1400} aperture={5}>
				<Dust n={22} zNear={-900} zFar={-3800} size={8} color="rgba(255,255,255,0.22)" />
				<Obj x={-400} y={20} z={-1450} ry={12} flat={false}>
					<div style={{width: 880, height: 590, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${flip}deg)`}}>
						{face('lib/checkout.ts', 'TypeScript', TS, false, '#79C0FF')}
						{face('lib/checkout.rs', 'Rust', RS, true, '#FFA657')}
					</div>
				</Obj>
				<Obj x={530} y={-20} z={-1200}>
					<div style={{width: 720}}>
						<Title parts={[{t: 'Port it to Rust.'}]} at={0} size={104} align="left" />
						<div style={{height: 46}} />
						<div style={{fontFamily: LF.mono, fontSize: 24, opacity: bars}}>
							{[
								['TypeScript', 368, '#8E8E93'],
								['Rust', 99, L.mint],
							].map(([k, ns, col]) => (
								<div key={k as string} style={{marginBottom: 20}}>
									<div style={{display: 'flex', justifyContent: 'space-between', width: 640, color: L.sub, marginBottom: 8}}>
										<span>{k}</span>
										<span style={{color: col as string}}>{Math.round((ns as number) * bars)} ns</span>
									</div>
									<div style={{height: 16, borderRadius: 8, width: (640 * (ns as number) * bars) / 368, background: col as string, boxShadow: k === 'Rust' ? '0 0 24px rgba(61,245,176,0.6)' : undefined}} />
								</div>
							))}
						</div>
						<div style={{height: 26}} />
						<Title parts={[{t: '3.7× faster.', c: 'mint'}, {t: '\nStill identical.'}]} at={l(37.5)} size={84} align="left" />
					</div>
				</Obj>
			</Space>
		</AbsoluteFill>
	);
};

/* ================================================================== K  the whole codebase turns over (beats 40-44) */
export const ShotWhole: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(40);
	const end = l(44);
	const R = interpolate(f, [2, end - 8], [0, 7600], {...ce, easing: Easing.bezier(0.3, 0, 0.6, 1)});
	const wave = (c: number, r: number) => {
		const d = Math.hypot((c - 4) * 1000, (r - 62) * 40);
		return Math.max(0, Math.min(1, (R - d) / 500));
	};
	const cam = {x: kf(f, [[0, -60], [end, 80]]), y: -40, z: kf(f, [[0, -200], [end, -1250]], (t) => t), rx: kf(f, [[0, 30], [end, 38]]), rz: kf(f, [[0, 1.5], [end, -1.5]])};
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Space cam={cam}>
				<Obj x={-260} y={430} z={-2150} rx={82}>
					<CodeSheet cols={9} rows={96} wave={wave} />
				</Obj>
			</Space>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #000 0%, #000 14%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.3) 100%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 52% 30% at 50% 44%, rgba(0,0,0,0.85), rgba(0,0,0,0) 100%)'}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: 'translateY(-50px)'}}>
				<Title parts={[{t: 'Your whole codebase.'}]} at={0} size={124} />
				<div style={{height: 6}} />
				<Title parts={[{t: 'Zero behavior changed.', c: 'mint'}]} at={l(41.5)} size={124} stagger={3} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ================================================================== L  the line (beats 44-48) */
export const ShotLine: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(44);
	const end = l(48);
	const second = l(45.5);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 55%, #08110e 0%, #000 72%)'}}>
			<Space cam={{z: kf(f, [[0, 0], [end, -140]], (t) => t)}} focus={1200} aperture={8}>
				<Dust n={44} zNear={-500} zFar={-4200} size={11} color="rgba(61,245,176,0.42)" />
				<Obj x={0} y={-100} z={-1200}>
					<div style={{width: 1800}}>
						<Title parts={[{t: 'Rewrite everything.'}]} at={0} size={158} stagger={3} />
					</div>
				</Obj>
				<Obj x={0} y={105} z={-1200}>
					<div style={{width: 1800}}>
						<Title parts={[{t: 'Lose nothing.', c: 'mint'}]} at={second} size={158} stagger={3} />
					</div>
				</Obj>
			</Space>
		</AbsoluteFill>
	);
};

/* ================================================================== M  end card, the last hit (beats 48-52) */
export const ShotEnd: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(48);
	const lockAt = 9;
	const hit = l(51.5);
	const base = usePose(0, lockAt);
	const after = f >= hit - 1;
	const pose = after
		? {...base, glow: 1, sweep: interpolate(f, [hit - 1, hit + 12], [0, 1], ce), rotY: base.rotY + interpolate(f, [hit - 1, hit + 11], [0, 0.12], {...ce, easing: easeOut})}
		: base;
	const punch = interpolate(f - hit, [0, 2, 12], [1, 1.035, 1.02], ce);
	const word = 'Lossless';
	const sub = pop(f, l(49.5), 12);
	const cta = pop(f, l(50.5), 10);
	const floor = after ? interpolate(f, [hit - 1, hit + 3], [0.18, 1], ce) : 0.18;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{/* the codebase underneath, all of it rewritten; it lights up on the last hit */}
			<Space cam={{y: -40, z: kf(f, [[0, 0], [l(52), -260]], (t) => t), rx: 34}}>
				<Obj x={-260} y={560} z={-2350} rx={82} opacity={floor}>
					<CodeSheet cols={9} rows={96} wave={() => 1} />
				</Obj>
			</Space>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #000 0%, #000 40%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0.5) 100%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 30% 42%, rgba(61,245,176,0.2), rgba(0,0,0,0) 34%)', opacity: base.glow * (after ? 1.3 : 1)}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `translateY(-60px) scale(${punch})`}}>
				<div style={{display: 'flex', alignItems: 'center'}}>
					<Logo3D size={420} pose={pose} />
					<div style={{display: 'flex', fontFamily: LF.sans, fontWeight: 600, fontSize: 190, letterSpacing: '-0.055em', marginLeft: 6}}>
						{word.split('').map((ch, i) => {
							const t = f - lockAt - 1 - i * 1.3;
							const p = interpolate(t, [0, 10], [0, 1], {...ce, easing: easeOut});
							return (
								<span
									key={i}
									style={{
										display: 'inline-block',
										opacity: interpolate(t, [0, 5], [0, 1], ce),
										transform: `translateY(${(1 - p) * 50}px)`,
										filter: `blur(${(1 - p) * 14}px)`,
										background: inkFill,
										WebkitBackgroundClip: 'text',
										backgroundClip: 'text',
										color: 'transparent',
										paddingBottom: 16,
									}}
								>
									{ch}
								</span>
							);
						})}
					</div>
				</div>
				<div style={{opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`, filter: `blur(${(1 - sub) * 10}px)`, fontFamily: LF.sans, fontWeight: 500, fontSize: 50, letterSpacing: '-0.025em', color: '#A1A1A6', marginTop: -10}}>
					Rewrites your codebase. <span style={{color: '#E5E5EA'}}>Proves nothing broke.</span>
				</div>
				<div style={{marginTop: 44, opacity: cta, transform: `scale(${0.9 + 0.1 * cta})`}}>
					<Pill color={L.mint} size={30} glow={after ? 1.2 : 0.5}>
						Early access ↓
					</Pill>
				</div>
			</AbsoluteFill>
			<Flash at={lockAt} dur={6} peak={0.22} color="#dffff2" />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 55% at 50% 42%, rgba(210,255,238,0.85), rgba(61,245,176,0.28) 45%, rgba(0,0,0,0) 75%)', mixBlendMode: 'screen', opacity: interpolate(f - hit, [0, 1, 12], [0, 0.75, 0], ce), pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

