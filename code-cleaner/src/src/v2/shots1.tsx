import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
import {fb} from '../lib/beats';
import {L, LF} from '../lib/theme';
import {REPO} from '../ui/App';
import {Logo3D, usePose} from './Logo3D';
import {CodeSheet, Dust, Pill, RewriteWin, pop} from './parts';
import {Flash, Obj, Space, Title, ce, easeIn, easeInOut, easeOut, fmt, kf} from './kit';

export const local = (k0: number) => (k: number) => fb(k) - (k0 <= 0 ? 0 : fb(k0));
const rand = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const inkFill = 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 45%, #B9BAC1 100%)';
const mintFill = 'linear-gradient(180deg, #CFFFEA 0%, #5CF7BE 45%, #19C98B 100%)';
export const BigNum: React.FC<{text: string; size: number; fill?: string; glow?: string; weight?: number}> = ({text, size, fill = inkFill, glow = 'rgba(255,255,255,0.18)', weight = 650}) => (
	<div
		style={{
			fontFamily: LF.sans,
			fontWeight: weight,
			fontSize: size,
			lineHeight: 1,
			letterSpacing: '-0.05em',
			fontVariantNumeric: 'tabular-nums',
			background: fill,
			WebkitBackgroundClip: 'text',
			backgroundClip: 'text',
			color: 'transparent',
			filter: `drop-shadow(0 0 ${size * 0.15}px ${glow})`,
			paddingBottom: size * 0.08,
		}}
	>
		{text}
	</div>
);

/* ================================================================== A  hook: flying over 48,213 lines (beats 0-4) */
export const ShotHook: React.FC = () => {
	const f = useCurrentFrame();
	const dive = fb(3.15);
	const drop = fb(4);
	const z = f < dive ? interpolate(f, [0, dive], [0, -760]) : interpolate(f, [dive, drop], [-760, -2900], {...ce, easing: easeIn});
	const rx = f < dive ? interpolate(f, [0, dive], [13, 17]) : interpolate(f, [dive, drop], [17, 48], {...ce, easing: easeIn});
	const n = interpolate(f, [12, 46], [0, 48213], {...ce, easing: easeOut});
	const rush = interpolate(f, [dive, fb(3.75)], [0, 1], {...ce, easing: easeIn});
	const numIn = interpolate(f, [10, 18], [0, 1], {...ce, easing: easeOut});
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Space cam={{x: 0, y: -40, z, rx, ry: 0}}>
				<Obj x={-260} y={430} z={-2150} rx={82}>
					<CodeSheet cols={9} rows={96} />
				</Obj>
			</Space>
			{/* horizon fog and a dark well behind the words */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #000 0%, #000 18%, rgba(0,0,0,0.0) 58%, rgba(0,0,0,0.35) 100%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 48% 32% at 50% 46%, rgba(0,0,0,0.82), rgba(0,0,0,0) 100%)', opacity: 1 - rush}} />
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					transform: `translateY(-30px) scale(${1 + rush * 1.8})`,
					opacity: 1 - rush,
					filter: rush > 0 ? `blur(${rush * 18}px)` : undefined,
				}}
			>
				<Title parts={[{t: 'Your AI wrote', c: 'sub'}]} at={-14} size={76} weight={500} />
				<div style={{opacity: numIn, filter: `blur(${(1 - numIn) * 14}px)`, transform: `translateY(${(1 - numIn) * 40}px)`, marginTop: 6}}>
					<BigNum text={`${fmt(n)} lines.`} size={210} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ================================================================== B  the name, on the name (beats 3.4-6) */
export const ShotName: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(3.6);
	const lock = l(4);
	const pose = usePose(0, lock);
	const bg = interpolate(f, [lock - 1, lock], [0, 1], ce);
	const push = interpolate(f, [lock, l(6) + 6], [1, 1.05]);
	const word = 'Lossless';
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: bg}} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 34% 50%, rgba(61,245,176,0.16), rgba(0,0,0,0) 38%)', opacity: pose.glow}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', transform: `scale(${push})`}}>
				<div style={{transform: `scale(${interpolate(f, [0, lock], [0.25, 1], {...ce, easing: easeIn})})`, filter: f < lock ? `blur(${interpolate(f, [0, lock], [10, 0], ce)}px)` : undefined}}>
					<Logo3D size={560} pose={pose} />
				</div>
				<div style={{display: 'flex', fontFamily: LF.sans, fontWeight: 600, fontSize: 236, letterSpacing: '-0.055em', marginLeft: 10}}>
					{word.split('').map((ch, i) => {
						const t = f - lock - 1 - i * 1.3;
						const p = interpolate(t, [0, 10], [0, 1], {...ce, easing: easeOut});
						return (
							<span
								key={i}
								style={{
									display: 'inline-block',
									opacity: interpolate(t, [0, 5], [0, 1], ce),
									transform: `translateY(${(1 - p) * 60}px)`,
									filter: `blur(${(1 - p) * 16}px)`,
									background: inkFill,
									WebkitBackgroundClip: 'text',
									backgroundClip: 'text',
									color: 'transparent',
									paddingBottom: 20,
								}}
							>
								{ch}
							</span>
						);
					})}
				</div>
			</AbsoluteFill>
			<Flash at={lock} dur={6} peak={0.3} color="#dffff2" />
		</AbsoluteFill>
	);
};

/* ================================================================== C  the rewrite, in the app (beats 6-10) */
export const ShotRewrite: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(6);
	const end = l(10);
	const MORPH_AT = 3;
	const MORPH = 15;
	const cam = {
		x: kf(f, [[0, 70], [end, -50]], easeOut),
		y: kf(f, [[0, -30], [end, 10]], easeOut),
		z: kf(f, [[0, 60], [end, -110]], easeOut),
		ry: kf(f, [[0, 5], [end, -2]], easeOut),
	};
	const chip = pop(f, MORPH_AT + MORPH + 3, 12);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 62% 45%, #0c1512 0%, #000 70%)'}}>
			<Space cam={cam} focus={1300} aperture={5}>
				<Dust n={26} zNear={-700} zFar={-3600} size={8} color="rgba(61,245,176,0.35)" />
				<Obj x={400} y={30} z={-1420} ry={-15}>
					<RewriteWin at={MORPH_AT} dur={MORPH} w={1250} h={780} />
				</Obj>
				{/* lines torn out of the old function fly at the camera */}
				{Array.from({length: 30}, (_, i) => {
					const t0 = MORPH_AT + (i / 30) * MORPH;
					const t = interpolate(f, [t0, t0 + 22], [0, 1], ce);
					if (t <= 0 || t >= 1) return null;
					const sx = 260 + rand(i) * 760;
					const sy = -220 + rand(i + 5) * 560;
					return (
						<Obj key={i} x={sx + (rand(i + 9) - 0.5) * 700 * t} y={sy + (rand(i + 3) - 0.6) * 300 * t} z={-1370 + 1150 * easeIn(t)} rz={(rand(i + 1) - 0.5) * 80 * t} opacity={1 - t}>
							<div style={{width: 70 + rand(i + 2) * 160, height: 7, borderRadius: 4, background: '#FF5B4F', boxShadow: '0 0 18px rgba(255,69,58,0.8)'}} />
						</Obj>
					);
				})}
				<Obj x={430} y={-420} z={-1420 + 260 * chip} scale={0.7 + 0.3 * chip} opacity={chip}>
					<Pill color={L.mint} size={34} glow={1}>
						✓ Identical on 1,000 inputs
					</Pill>
				</Obj>
				<Obj x={-470} y={-10} z={-1250} ry={8}>
					<div style={{width: 640}}>
						<Title parts={[{t: 'Rewrites every\nfunction.'}]} at={6} size={90} align="left" />
						<div style={{height: 34}} />
						<Title parts={[{t: 'Proves nothing\nbroke.', c: 'mint'}]} at={l(8)} size={90} align="left" />
					</div>
				</Obj>
			</Space>
		</AbsoluteFill>
	);
};

/* ================================================================== D  pull back: every file, every function (beats 10-12) */
const COLS = 7;
const ROWS = 5;
const CW = 440;
const CH = 280;
const GAP = 50;
const FILES = (() => {
	const files = [...REPO.files];
	const i = files.findIndex((x) => x.path === 'lib/checkout.ts');
	const [ck] = files.splice(i, 1);
	while (files.length < COLS * ROWS - 1) files.push(files[files.length % 30]);
	files.splice(17, 0, ck); // centre slot
	return files.slice(0, COLS * ROWS);
})();
export const ShotRepo: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(10);
	const end = l(12);
	const pull = interpolate(f, [0, 26], [0, 1], {...ce, easing: easeOut});
	const zPlane = -2600;
	const cam = {z: zPlane + 470 + 3200 * pull, rx: -6 * pull, y: 330 * pull};
	const n = interpolate(f, [4, 30], [0, 1839], {...ce, easing: easeOut});
	const txt = pop(f, 3, 10);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Space cam={cam}>
				{FILES.map((file, i) => {
					const c = i % COLS;
					const r = Math.floor(i / COLS);
					const x = (c - (COLS - 1) / 2) * (CW + GAP);
					const y = (r - (ROWS - 1) / 2) * (CH + GAP);
					const d = Math.hypot(c - 3, r - 2);
					const g = i === 17 ? 1 : interpolate(f, [5 + d * 5, 9 + d * 5], [0, 1], ce);
					const name = file.path.slice(file.path.lastIndexOf('/') + 1);
					return (
						<Obj key={i} x={x} y={y} z={zPlane} ry={g < 1 ? 0 : 0}>
							<div
								style={{
									width: CW,
									height: CH,
									borderRadius: 18,
									background: 'linear-gradient(180deg, rgba(28,30,35,0.95), rgba(14,15,18,0.97))',
									boxShadow: `0 0 0 1px rgba(255,255,255,${0.07 + 0.1 * g}), 0 0 ${70 * g}px rgba(61,245,176,${0.18 * g})`,
									padding: '18px 22px',
									fontFamily: LF.mono,
									overflow: 'hidden',
								}}
							>
								<div style={{display: 'flex', fontSize: 19, color: '#A1A1A6', marginBottom: 16}}>
									<span style={{flex: 1}}>{name}</span>
									<span style={{color: interpolateColors(g, [0, 1], ['#FF6B60', L.mint])}}>{g > 0.5 ? '✓' : '●'}</span>
								</div>
								{Array.from({length: 7}, (_, k) => (
									<div
										key={k}
										style={{
											height: 10,
											borderRadius: 5,
											marginBottom: 14,
											marginLeft: (k % 3) * 26,
											width: `${30 + rand(i * 7 + k) * 60}%`,
											background: interpolateColors(g, [0, 1], [k % 3 === 1 ? '#5A2522' : '#2A2D33', k % 2 ? '#1F8F67' : '#2BD596']),
											opacity: 0.9,
										}}
									/>
								))}
							</div>
						</Obj>
					);
				})}
			</Space>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.88) 82%)'}} />
			<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70, opacity: txt}}>
				<BigNum text={fmt(n)} size={190} fill={mintFill} glow="rgba(61,245,176,0.45)" />
				<div style={{fontFamily: LF.sans, fontWeight: 500, fontSize: 44, letterSpacing: '-0.02em', color: '#A1A1A6', marginTop: -6}}>functions rewritten. Every one proven.</div>
			</AbsoluteFill>
			{end > 0 ? null : null}
		</AbsoluteFill>
	);
};

/* ================================================================== E  the difference (beats 12-16) */
export const ShotVersus: React.FC = () => {
	const f = useCurrentFrame();
	const l = local(12);
	const slice = l(13.25);
	const second = l(13.5);
	const end = l(16);
	const beam = interpolate(f, [slice, slice + 5], [0, 1], {...ce, easing: easeInOut});
	const split = interpolate(f, [slice + 4, slice + 22], [0, 1], {...ce, easing: easeIn});
	const beamFade = interpolate(f, [slice + 5, slice + 16], [1, 0], ce);
	const line1 = (half: 'top' | 'bot') => (
		<div
			style={{
				clipPath: half === 'top' ? 'inset(0 0 50% 0)' : 'inset(50% 0 0 0)',
				transform: `translateY(${(half === 'top' ? -1 : 1) * split * 70}px) translateX(${(half === 'top' ? -1 : 1) * split * 40}px) rotate(${(half === 'top' ? -1 : 1) * split * 3}deg)`,
				opacity: 1 - split,
				filter: split > 0 ? `blur(${split * 10}px)` : undefined,
				position: half === 'top' ? 'relative' : 'absolute',
				inset: half === 'top' ? undefined : 0,
			}}
		>
			<Title parts={[{t: 'Other tools refactor and hope.', c: 'sub'}]} at={0} size={100} />
		</div>
	);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 55%, #0b0f0e 0%, #000 75%)'}}>
			<Space cam={{z: kf(f, [[0, 0], [end, -100]]), x: kf(f, [[0, -30], [end, 30]])}} focus={1200} aperture={7}>
				<Dust n={34} zNear={-600} zFar={-4000} size={9} color="rgba(61,245,176,0.4)" />
				<Obj x={0} y={-95} z={-1200}>
					<div style={{position: 'relative', width: 1700}}>
						{line1('top')}
						{line1('bot')}
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: '50%',
								height: 5,
								width: `${beam * 100}%`,
								background: '#FF5B4F',
								boxShadow: '0 0 24px 4px rgba(255,69,58,0.85)',
								borderRadius: 3,
								opacity: beamFade,
							}}
						/>
					</div>
				</Obj>
				<Obj x={0} y={95} z={-1200}>
					<div style={{width: 1800}}>
						<Title parts={[{t: 'Lossless'}, {t: 'rewrites and proves.', c: 'mint'}]} at={second} size={104} />
					</div>
				</Obj>
			</Space>
		</AbsoluteFill>
	);
};
