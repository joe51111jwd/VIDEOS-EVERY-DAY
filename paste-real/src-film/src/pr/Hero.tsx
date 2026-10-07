// Northstar Analytics (fictional) landing hero. One component, laid out by width the way auto layout would:
// the two columns sit side by side and wrap into a stack when the frame gets narrow.
import React from 'react';
import {SANS} from '../lib/tokens';

const NAVY = '#0A0F1F';

export const Star: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d="M12 1.5c.5 5.6 4.9 10 10.5 10.5-5.6.5-10 4.9-10.5 10.5C11.5 16.9 7.1 12.5 1.5 12 7.1 11.5 11.5 7.1 12 1.5Z" fill={color} />
	</svg>
);

export const Chart: React.FC<{w: number; h: number; grow?: number}> = ({w, h, grow = 1}) => {
	const pts = [0.62, 0.58, 0.66, 0.55, 0.6, 0.48, 0.52, 0.4, 0.44, 0.33, 0.36, 0.24, 0.2];
	const xy = pts.map((v, i) => [(i / (pts.length - 1)) * w, h * (1 - (1 - v) * grow)]);
	const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display: 'block', overflow: 'visible'}}>
			<defs>
				<linearGradient id="nsfill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="rgba(100,140,255,0.45)" />
					<stop offset="1" stopColor="rgba(100,140,255,0)" />
				</linearGradient>
			</defs>
			{[0.25, 0.5, 0.75].map((g) => (
				<line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
			))}
			<path d={`${d} L${w} ${h} L0 ${h} Z`} fill="url(#nsfill)" />
			<path d={d} fill="none" stroke="#7FA2FF" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
			<circle cx={xy[xy.length - 1][0]} cy={xy[xy.length - 1][1]} r={5.5} fill="#fff" stroke="#7FA2FF" strokeWidth={3} />
		</svg>
	);
};

/** the hero at frame width w (design px). mobile < 720 */
export const Hero: React.FC<{w: number; outline?: boolean}> = ({w, outline}) => {
	const narrow = w < 720;
	const stacked = w < 880;
	const pad = narrow ? 28 : 48;
	const inner = w - pad * 2;
	const card = stacked ? inner : Math.min(430, inner * 0.46);
	const ol: React.CSSProperties = outline ? {outline: '1.5px dashed rgba(127,162,255,0.55)', outlineOffset: 4} : {};
	return (
		<div
			style={{
				width: w,
				background: `radial-gradient(70% 60% at 85% 20%, rgba(76,110,255,0.35), rgba(76,110,255,0) 70%), radial-gradient(60% 70% at 10% 100%, rgba(150,90,255,0.22), rgba(150,90,255,0) 70%), ${NAVY}`,
				color: '#fff',
				fontFamily: SANS,
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			{/* nav */}
			<div style={{height: 76, display: 'flex', alignItems: 'center', padding: `0 ${pad}px`, gap: 34, ...ol}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em'}}>
					<Star size={24} color="#9DB7FF" />
					Northstar
				</div>
				{!narrow ? (
					<div style={{display: 'flex', gap: 28, fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.72)'}}>
						<span>Product</span>
						<span>Pricing</span>
						<span>Customers</span>
						<span>Docs</span>
					</div>
				) : null}
				<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18}}>
					{!narrow ? <span style={{fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.72)'}}>Sign in</span> : null}
					{narrow ? (
						<svg width={28} height={28} viewBox="0 0 24 24">
							<path d="M4 7h16M4 12h16M4 17h16" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
						</svg>
					) : (
						<div style={{height: 42, padding: '0 18px', borderRadius: 21, background: '#fff', color: NAVY, fontSize: 15.5, fontWeight: 650, display: 'flex', alignItems: 'center'}}>Get started</div>
					)}
				</div>
			</div>
			{/* content: auto layout, wraps */}
			<div style={{display: 'flex', flexDirection: stacked ? 'column' : 'row', gap: stacked ? 34 : 40, padding: `${narrow ? 26 : 44}px ${pad}px ${narrow ? 36 : 56}px`, alignItems: stacked ? 'stretch' : 'center'}}>
				<div style={{flex: stacked ? '0 0 auto' : '1 1 380px', minWidth: 0, ...ol}}>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 14px', borderRadius: 17, background: 'rgba(127,162,255,0.16)', boxShadow: 'inset 0 0 0 1px rgba(127,162,255,0.35)', fontSize: 14.5, fontWeight: 600, color: '#C9D7FF'}}>
						<span style={{width: 7, height: 7, borderRadius: 4, background: '#7FA2FF'}} />
						New · AI insights
					</div>
					<div style={{fontSize: narrow ? 46 : 54, fontWeight: 720, letterSpacing: '-0.04em', lineHeight: 1.02, marginTop: 20}}>Know what moved your numbers.</div>
					<div style={{fontSize: 18, lineHeight: 1.45, color: 'rgba(214,224,255,0.72)', marginTop: 18, maxWidth: 420}}>Northstar finds the why behind every metric, in plain English.</div>
					<div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28}}>
						<div style={{height: 52, padding: '0 24px', borderRadius: 14, background: '#4C7DFF', fontSize: 17, fontWeight: 650, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(76,125,255,0.45)', flex: narrow ? '1 1 100%' : undefined}}>Start free</div>
						<div style={{height: 52, padding: '0 22px', borderRadius: 14, boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.28)', fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: narrow ? '1 1 100%' : undefined}}>Book a demo</div>
					</div>
				</div>
				<div style={{...(stacked ? {width: '100%'} : {flex: `0 0 ${card}px`, width: card}), ...ol}}>
					<div style={{borderRadius: 20, padding: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14), 0 30px 60px rgba(0,0,0,0.35)'}}>
						<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
							<div style={{fontSize: 14, fontWeight: 600, color: 'rgba(214,224,255,0.7)'}}>Revenue · 30 days</div>
							<div style={{fontSize: 13, fontWeight: 650, color: '#5BE39A', background: 'rgba(91,227,154,0.12)', padding: '4px 9px', borderRadius: 8}}>+18.4%</div>
						</div>
						<div style={{fontSize: 34, fontWeight: 720, letterSpacing: '-0.03em', marginTop: 6}}>$482,190</div>
						<div style={{marginTop: 14}}>
							<Chart w={card - 44} h={narrow ? 120 : 132} />
						</div>
						<div style={{display: 'flex', gap: 10, marginTop: 16}}>
							{[
								['Signups', '12.4k'],
								['Churn', '1.9%'],
								['ARPU', '$61'],
							].map(([k, v]) => (
								<div key={k} style={{flex: 1, borderRadius: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.06)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)'}}>
									<div style={{fontSize: 12, color: 'rgba(214,224,255,0.6)', fontWeight: 600}}>{k}</div>
									<div style={{fontSize: 18, fontWeight: 700, marginTop: 2}}>{v}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
