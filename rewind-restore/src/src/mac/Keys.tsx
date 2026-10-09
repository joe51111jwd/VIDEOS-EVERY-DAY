import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SANS} from '../lib/tokens';
import {GCmd, GCtrl, GOpt} from './icons';

type K = {id: string; x: number; y: number; w: number; top?: React.ReactNode; bot?: string; big?: string; topLeft?: boolean};

const U = 210;
const KEYS: K[] = [
	// row: shift / z / x / c / v
	{id: 'shift', x: -0.2, y: 0, w: 2.45, bot: 'shift'},
	{id: 'z', x: 2.3, y: 0, w: 1, big: 'Z'},
	{id: 'x', x: 3.35, y: 0, w: 1, big: 'X'},
	{id: 'c', x: 4.4, y: 0, w: 1, big: 'C'},
	{id: 'v', x: 5.45, y: 0, w: 1, big: 'V'},
	// row: fn / control / option / command / space
	{id: 'fn', x: -0.2, y: 1.05, w: 1, bot: 'fn'},
	{id: 'ctrl', x: 0.85, y: 1.05, w: 1, top: <GCtrl s={34} c="#E9E9EC" w={1.7} />, bot: 'control'},
	{id: 'opt', x: 1.9, y: 1.05, w: 1, top: <GOpt s={34} c="#E9E9EC" w={1.6} />, bot: 'option'},
	{id: 'cmd', x: 2.95, y: 1.05, w: 1.3, top: <GCmd s={34} c="#E9E9EC" w={1.5} />, bot: 'command'},
	{id: 'space', x: 4.3, y: 1.05, w: 5, bot: ''},
	// row above: a / s / d
	{id: 'caps', x: -0.2, y: -1.05, w: 1.8, bot: 'caps lock'},
	{id: 'a', x: 1.65, y: -1.05, w: 1, big: 'A'},
	{id: 's', x: 2.7, y: -1.05, w: 1, big: 'S'},
	{id: 'd', x: 3.75, y: -1.05, w: 1, big: 'D'},
	{id: 'f', x: 4.8, y: -1.05, w: 1, big: 'F'},
];

/** full-frame macro of a MacBook keyboard; press[id] = 0..1 */
export const Keys: React.FC<{press: Record<string, number>; push?: number; light?: number}> = ({press, push = 0, light = 0}) => (
	<AbsoluteFill style={{background: 'radial-gradient(120% 90% at 40% 30%, #2A2A2E 0%, #141416 55%, #070708 100%)', overflow: 'hidden'}}>
		<div style={{position: 'absolute', inset: 0, perspective: 1500, perspectiveOrigin: '45% 45%'}}>
			<div
				style={{
					position: 'absolute',
					left: 430,
					top: 400,
					transformStyle: 'preserve-3d',
					transform: `translateZ(${push * 220}px) rotateX(30deg) rotateZ(-6deg) translateX(-60px)`,
				}}
			>
				{KEYS.map((k) => {
					const p = press[k.id] ?? 0;
					const hot = k.id === 'ctrl' || k.id === 'cmd' || k.id === 'z';
					const blur = hot ? 0 : Math.min(5, Math.abs(k.x + k.w / 2 - 2.6) * 0.9 + Math.abs(k.y) * 1.4);
					return (
						<div
							key={k.id}
							style={{
								position: 'absolute',
								left: k.x * U,
								top: k.y * U,
								width: k.w * U - 14,
								height: U - 14,
								borderRadius: 22,
								background: `linear-gradient(180deg, ${p > 0.5 ? '#111113' : '#1B1B1E'} 0%, #0D0D0F 100%)`,
								boxShadow: `0 ${10 - 8 * p}px ${18 - 10 * p}px rgba(0,0,0,0.75), inset 0 1.5px 0 rgba(255,255,255,${0.1 - 0.05 * p}), 0 0 0 2px rgba(0,0,0,0.65)${hot && light ? `, 0 0 ${40 * light}px rgba(255,190,110,${0.18 * light})` : ''}`,
								transform: `translateY(${p * 6}px) scale(${1 - 0.025 * p})`,
								filter: blur ? `blur(${blur}px)` : undefined,
								fontFamily: SANS,
								color: hot ? `rgb(${200 + 55 * p},${200 + 50 * p},${204 + 30 * p})` : '#B9B9BE',
								textShadow: hot && p > 0 ? `0 0 ${14 * p}px rgba(255,236,200,${0.9 * p}), 0 0 ${36 * p}px rgba(255,190,110,${0.6 * p})` : 'none',
							}}
						>
							{k.big ? <div style={{position: 'absolute', left: 26, top: 18, fontSize: 64, fontWeight: 400}}>{k.big}</div> : null}
							{k.top ? <div style={{position: 'absolute', right: 24, top: 24, filter: hot && p > 0 ? `drop-shadow(0 0 ${10 * p}px rgba(255,226,180,${p}))` : undefined}}>{k.top}</div> : null}
							{k.bot ? <div style={{position: 'absolute', right: 24, bottom: 20, fontSize: 30, fontWeight: 400, letterSpacing: '0.01em'}}>{k.bot}</div> : null}
							{hot && p > 0 ? <div style={{position: 'absolute', inset: 0, borderRadius: 22, background: `radial-gradient(80% 80% at 50% 45%, rgba(255,205,140,${0.16 * p}), rgba(0,0,0,0))`, boxShadow: `inset 0 0 0 1.5px rgba(255,200,130,${0.35 * p}), 0 0 ${50 * p}px rgba(255,170,80,${0.25 * p})`}} /> : null}
						</div>
					);
				})}
			</div>
		</div>
		{/* soft top light falloff */}
		<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'}} />
	</AbsoluteFill>
);
