import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, F, E, clamp, prog, spr} from '../lib/theme';
import {AppHeader} from './AppPrompt';
import {Tabs} from './Ads';
import {Pointer, pop} from './kit';

const CITIES = ['Austin, TX', 'Leeds, UK', 'Toronto, ON', 'Denver, CO', 'Lyon, FR', 'Brooklyn, NY', 'Melbourne, AU', 'Portland, OR', 'Berlin, DE', 'Chicago, IL', 'Seoul, KR', 'Dublin, IE'];
const TIMES = ['2:14 AM', '2:15 AM', '2:15 AM', '2:17 AM', '2:18 AM', '2:18 AM', '2:20 AM', '2:21 AM', '2:21 AM', '2:22 AM', '2:24 AM', '2:24 AM'];

/** S4: strangers hit Pay. tClick = the stranger's tap, rows = times new attempts land, count = counter value(t) */
export const Buyers: React.FC<{t: number; w: number; h: number; tClick: number; rows: number[]; count: (t: number) => number}> = ({t, w, h, tClick, rows, count}) => {
	const down = clamp(1 - Math.abs(t - tClick) / 0.09);
	const done = prog(t, tClick + 0.08, tClick + 0.45, E.out);
	const n = rows.filter((r) => t >= r).length;
	const listX = 840;
	return (
		<div style={{position: 'absolute', inset: 0, background: C.page, fontFamily: F.ui, color: C.text}}>
			<AppHeader w={w} crumb="Pairs" />
			<Tabs w={w} active="Buyers" t={t} />
			{/* the checkout a stranger sees */}
			<div style={{position: 'absolute', left: 40, top: 180, width: 740, height: h - 220, borderRadius: 20, background: '#F7F6F3', overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 30, top: 26, fontFamily: F.mono, fontSize: 15, letterSpacing: 1.5, color: C.sub}}>PAIRS.SHOP / CHECKOUT</div>
				<div style={{position: 'absolute', left: 30, top: 70, display: 'flex', gap: 20, alignItems: 'center'}}>
					<div style={{width: 120, height: 92, borderRadius: 12, overflow: 'hidden'}}>
						<Img src={staticFile('img/socks_a.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					</div>
					<div>
						<div style={{fontSize: 26, fontWeight: 650}}>Pairs, 6 pairs</div>
						<div style={{fontSize: 20, color: C.sub, marginTop: 4}}>Forest green · M</div>
					</div>
					<div style={{marginLeft: 'auto', fontSize: 26, fontWeight: 650, position: 'absolute', left: 560, top: 30}}>$24.00</div>
				</div>
				{['Card number', 'Expiry', 'Name on card'].map((s, i) => (
					<div key={s} style={{position: 'absolute', left: 30, top: 200 + i * 74, width: 680, height: 58, borderRadius: 12, background: '#fff', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', boxSizing: 'border-box', fontSize: 20, color: i === 0 ? C.text : C.sub, fontFamily: i === 0 ? F.mono : F.ui}}>
						{i === 0 ? '4242  ••••  ••••  1881' : s}
					</div>
				))}
				<div style={{position: 'absolute', left: 30, top: 440, width: 680, height: 76, borderRadius: 14, background: t >= tClick ? C.go : C.text, color: '#fff', fontSize: 28, fontWeight: 620, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - down * 0.04})`}}>
					{t >= tClick ? 'You’re first in line' : 'Pay $24.00'}
				</div>
				<div style={{position: 'absolute', left: 30, top: 530, width: 680, textAlign: 'center', fontSize: 19, color: C.sub, opacity: done}}>Pairs isn’t made yet. You haven’t been charged.</div>
				{t < tClick + 0.5 ? <Pointer x={420 + (1 - prog(t, tClick - 0.7, tClick - 0.05, E.inOut)) * 140} y={478 + (1 - prog(t, tClick - 0.7, tClick - 0.05, E.inOut)) * 120} down={down} /> : null}
			</div>
			{/* live list */}
			<div style={{position: 'absolute', left: listX, top: 176, fontSize: 20, color: C.sub}}>Tried to pay</div>
			<div style={{position: 'absolute', left: listX, top: 200, fontSize: 112, fontWeight: 700, letterSpacing: -4, fontVariantNumeric: 'tabular-nums', color: C.text}}>{Math.round(count(t))}</div>
			<div style={{position: 'absolute', left: listX, top: 350, width: w - listX - 40, height: h - 390, overflow: 'hidden'}}>
				{rows.map((r, i) => {
					if (t < r) return null;
					const slot = n - 1 - i; // newest on top
					const s = spr(t, r, 16, 0.75);
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: 0,
								top: slot * 74 - (1 - s) * 40,
								width: w - listX - 40,
								height: 62,
								borderRadius: 14,
								background: slot === 0 ? '#EFF8F2' : '#F7F6F3',
								opacity: clamp(s * 1.5),
								display: 'flex',
								alignItems: 'center',
								padding: '0 22px',
								boxSizing: 'border-box',
								gap: 16,
								fontSize: 21,
							}}
						>
							<div style={{width: 12, height: 12, borderRadius: 6, background: C.go}} />
							<div style={{fontWeight: 600}}>{CITIES[i % CITIES.length]}</div>
							<div style={{color: C.sub}}>{TIMES[i % TIMES.length]}</div>
							<div style={{marginLeft: 'auto', fontWeight: 650, fontVariantNumeric: 'tabular-nums'}}>$24</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
