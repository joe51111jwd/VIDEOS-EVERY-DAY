import React from 'react';
import {C, F, clamp, spr} from '../lib/theme';
import {Mark} from './kit';

export type Notif = {t: number; body: string; go?: boolean};

const PW = 440;
const PH = 940;

/** iPhone lock screen at 7:02 with Demand Test notifications dropping in (newest on top) */
export const Phone: React.FC<{t: number; notifs: Notif[]; scale?: number}> = ({t, notifs, scale = 1}) => {
	const shown = notifs.filter((n) => t >= n.t);
	const k = shown.length;
	return (
		<div style={{position: 'relative', width: PW * scale, height: PH * scale}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
				<div style={{position: 'absolute', inset: 0, borderRadius: 74, background: '#0b0b0b', boxShadow: '0 50px 120px rgba(0,0,0,0.6), inset 0 0 0 2px #2c2c2c'}} />
				<div
					style={{
						position: 'absolute',
						left: 14,
						top: 14,
						width: PW - 28,
						height: PH - 28,
						borderRadius: 62,
						overflow: 'hidden',
						background:
							'radial-gradient(120% 70% at 20% 10%, #3b2a5e 0%, rgba(59,42,94,0) 60%), radial-gradient(120% 80% at 90% 90%, #0f4a3b 0%, rgba(15,74,59,0) 60%), linear-gradient(180deg, #14121c, #0b1512)',
					}}
				>
					{/* status bar + island */}
					<div style={{position: 'absolute', left: PW / 2 - 14 - 62, top: 14, width: 124, height: 36, borderRadius: 18, background: '#000'}} />
					<div style={{position: 'absolute', left: 34, top: 20, fontFamily: F.ui, fontSize: 18, fontWeight: 600, color: '#fff'}}>7:02</div>
					<div style={{position: 'absolute', right: 30, top: 22, display: 'flex', gap: 6, alignItems: 'center'}}>
						{[6, 9, 12, 15].map((hh, i) => (
							<div key={i} style={{width: 4, height: hh, borderRadius: 1, background: '#fff', alignSelf: 'flex-end'}} />
						))}
						<div style={{width: 28, height: 14, borderRadius: 4, border: '1.5px solid rgba(255,255,255,0.8)', marginLeft: 6, padding: 1.5, boxSizing: 'border-box'}}>
							<div style={{width: '80%', height: '100%', borderRadius: 2, background: '#fff'}} />
						</div>
					</div>
					<div style={{position: 'absolute', left: 0, top: 86, width: PW - 28, textAlign: 'center', fontFamily: F.ui, fontSize: 22, fontWeight: 560, color: 'rgba(255,255,255,0.85)'}}>Saturday, October 11</div>
					<div style={{position: 'absolute', left: 0, top: 104, width: PW - 28, textAlign: 'center', fontFamily: F.inter, fontSize: 118, fontWeight: 640, letterSpacing: -3, color: 'rgba(255,255,255,0.92)'}}>7:02</div>
					{/* notifications */}
					{shown.map((n, i) => {
						const slot = k - 1 - i; // 0 = newest
						const s = spr(t, n.t, 15, 0.72);
						const visible = slot < 4;
						if (!visible) return null;
						const y = 300 + slot * 104 - (1 - s) * 70;
						const sc = slot >= 3 ? 0.94 : 1;
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: 14 + (1 - sc) * 200,
									top: y,
									width: (PW - 28 - 28) * sc,
									height: 94,
									borderRadius: 26,
									background: n.go ? 'rgba(232,250,238,0.94)' : 'rgba(242,242,244,0.86)',
									opacity: clamp(s * 1.4) * (slot === 3 ? 0.6 : 1),
									boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
									display: 'flex',
									gap: 12,
									padding: '14px 16px',
									boxSizing: 'border-box',
									fontFamily: F.ui,
									transform: `scale(${0.9 + 0.1 * s})`,
								}}
							>
								<Mark size={40} />
								<div style={{flex: 1, minWidth: 0}}>
									<div style={{display: 'flex', fontSize: 15, fontWeight: 650, color: '#111'}}>
										<span>Demand Test</span>
										<span style={{marginLeft: 'auto', fontWeight: 400, color: 'rgba(0,0,0,0.45)'}}>{n.go ? 'now' : '2:1' + (i % 9) + ' AM'}</span>
									</div>
									<div style={{fontSize: 15.5, lineHeight: 1.25, color: '#111', marginTop: 3, fontWeight: n.go ? 600 : 400}}>{n.body}</div>
								</div>
							</div>
						);
					})}
					{k > 4 ? (
						<div style={{position: 'absolute', left: 0, top: 300 + 4 * 104 - 6, width: PW - 28, textAlign: 'center', fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.7)'}}>
							{k - 4 + 300} more from Demand Test
						</div>
					) : null}
					{/* flashlight / camera */}
					{[46, PW - 28 - 46 - 50].map((x, i) => (
						<div key={i} style={{position: 'absolute', left: x, bottom: 40, width: 50, height: 50, borderRadius: 25, background: 'rgba(255,255,255,0.14)'}} />
					))}
					<div style={{position: 'absolute', left: (PW - 28) / 2 - 70, bottom: 10, width: 140, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.85)'}} />
				</div>
			</div>
		</div>
	);
};
export const PHONE = {w: PW, h: PH};
