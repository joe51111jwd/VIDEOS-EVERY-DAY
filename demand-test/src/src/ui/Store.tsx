import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, F, E, clamp, prog} from '../lib/theme';
import {Mark, Typed, pop} from './kit';

/** S2: the store Demand Test builds for the idea. ts = [nav, photo, headline, price, button, toast] */
export const Store: React.FC<{t: number; w: number; h: number; ts: number[]}> = ({t, w, h, ts}) => {
	const [tNav, tPhoto, tHead, tPrice, tBtn, tToast] = ts;
	const photo = prog(t, tPhoto, tPhoto + 0.55, E.out);
	const imgW = 780;
	const imgH = 600;
	const rx = 70 + imgW + 80;
	return (
		<div style={{position: 'absolute', inset: 0, background: '#FBFAF7', fontFamily: F.ui, color: C.text}}>
			<div style={{...pop(t, tNav, 0.3, 10), position: 'absolute', left: 0, top: 0, width: w, height: 86, display: 'flex', alignItems: 'center', padding: '0 70px', gap: 40, borderBottom: '1px solid rgba(0,0,0,0.07)'}}>
				<div style={{fontSize: 30, fontWeight: 800, letterSpacing: 6}}>PAIRS</div>
				<div style={{flex: 1}} />
				{['Shop', 'How it works', 'FAQ'].map((s) => (
					<div key={s} style={{fontSize: 20, color: 'rgba(0,0,0,0.6)'}}>
						{s}
					</div>
				))}
				<svg width="26" height="28" viewBox="0 0 26 28">
					<path d="M4 9h18l-1.5 16h-15z" fill="none" stroke="#111" strokeWidth="2" />
					<path d="M9 9V7a4 4 0 0 1 8 0v2" fill="none" stroke="#111" strokeWidth="2" />
				</svg>
			</div>
			<div style={{position: 'absolute', left: 70, top: 130, width: imgW, height: imgH, borderRadius: 16, overflow: 'hidden', background: '#E7DCCB', clipPath: `inset(${(1 - photo) * 100}% 0 0 0 round 16px)`}}>
				<Img src={staticFile('img/socks_a.jpg')} style={{width: imgW, height: imgH, objectFit: 'cover', transform: `scale(${1.12 - 0.12 * photo})`}} />
			</div>
			<div style={{...pop(t, tHead - 0.1, 0.3, 10), position: 'absolute', left: rx, top: 150, fontFamily: F.mono, fontSize: 18, letterSpacing: 2, color: C.go, fontWeight: 600}}>NEW · SHIPS IN SPRING</div>
			<div style={{position: 'absolute', left: rx, top: 196, width: w - rx - 80, fontSize: 70, lineHeight: 1.0, fontWeight: 680, letterSpacing: -2.6}}>
				<Typed text="Socks that never lose their pair." t={t} t0={tHead} cps={60} caret={false} />
			</div>
			<div style={{...pop(t, tHead + 0.35, 0.35, 12), position: 'absolute', left: rx, top: 380, width: w - rx - 100, fontSize: 25, lineHeight: 1.4, color: 'rgba(0,0,0,0.62)'}}>
				A hidden magnet in every cuff. Wash, dry, fold. They come out together.
			</div>
			<div style={{...pop(t, tPrice, 0.35, 14), position: 'absolute', left: rx, top: 490, display: 'flex', alignItems: 'baseline', gap: 14}}>
				<div style={{fontSize: 54, fontWeight: 700, letterSpacing: -1.5}}>$24</div>
				<div style={{fontSize: 23, color: 'rgba(0,0,0,0.55)'}}>for 6 pairs</div>
			</div>
			<div style={{...pop(t, tBtn, 0.35, 14), position: 'absolute', left: rx, top: 584, width: w - rx - 100, height: 80, borderRadius: 14, background: C.text, color: '#fff', fontSize: 28, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				Pre-order
			</div>
			<div style={{...pop(t, tBtn + 0.12, 0.35, 10), position: 'absolute', left: rx, top: 682, fontSize: 19, color: 'rgba(0,0,0,0.5)'}}>No charge until it ships.</div>
			{/* the "built by" toast */}
			<div
				style={{
					position: 'absolute',
					right: 40,
					bottom: 34,
					height: 64,
					borderRadius: 32,
					background: '#111',
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					padding: '0 26px 0 12px',
					fontSize: 21,
					fontWeight: 550,
					opacity: clamp((t - tToast) / 0.15),
					transform: `translateY(${(1 - prog(t, tToast, tToast + 0.4)) * 30}px)`,
					boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
				}}
			>
				<Mark size={40} />
				Store built in 41 seconds
			</div>
		</div>
	);
};
