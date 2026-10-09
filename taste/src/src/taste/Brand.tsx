import React from 'react';
import {SANS, SERIF, TIGHT} from '../lib/tokens';
import {HOTFILL} from '../lib/Type';

const HEART = 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z';

/** app icon: a fanned deck of cards, the top one liked */
export const Icon: React.FC<{s: number}> = ({s}) => (
	<div style={{position: 'relative', width: s, height: s, borderRadius: s * 0.225, background: 'linear-gradient(160deg, #262629 0%, #0B0B0C 100%)', boxShadow: `inset 0 0 0 ${s * 0.008}px rgba(255,255,255,0.14), 0 ${s * 0.06}px ${s * 0.2}px rgba(0,0,0,0.5)`, overflow: 'hidden'}}>
		{[-14, -4].map((r, i) => (
			<div key={i} style={{position: 'absolute', left: s * 0.27, top: s * 0.2, width: s * 0.46, height: s * 0.6, borderRadius: s * 0.07, background: i === 0 ? '#3A3A3E' : '#6A6A70', transform: `rotate(${r}deg)`, transformOrigin: '50% 100%'}} />
		))}
		<div style={{position: 'absolute', left: s * 0.27, top: s * 0.2, width: s * 0.46, height: s * 0.6, borderRadius: s * 0.07, background: HOTFILL, transform: 'rotate(9deg)', transformOrigin: '50% 100%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${s * 0.02}px ${s * 0.06}px rgba(0,0,0,0.4)`}}>
			<svg width={s * 0.26} height={s * 0.26} viewBox="0 0 24 24">
				<path d={HEART} fill="#fff" />
			</svg>
		</div>
	</div>
);

/** "Taste" wordmark */
export const Wordmark: React.FC<{size: number; color?: string}> = ({size, color = '#fff'}) => (
	<div style={{fontFamily: SERIF, fontSize: size, lineHeight: 1, letterSpacing: '-0.02em', color, whiteSpace: 'nowrap'}}>
		Taste
		<span style={{display: 'inline-block', width: size * 0.16, height: size * 0.16, borderRadius: '50%', background: HOTFILL, marginLeft: size * 0.04}} />
	</div>
);

export const Lockup: React.FC<{s: number; p?: number}> = ({s, p = 1}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: s * 0.32, opacity: p}}>
		<Icon s={s} />
		<Wordmark size={s * 1.05} />
	</div>
);

export const Tagline: React.FC<{size: number}> = ({size}) => (
	<div style={{fontFamily: TIGHT, fontWeight: 560, fontSize: size, letterSpacing: '-0.02em', color: '#F2F2F4', textAlign: 'center', lineHeight: 1.2}}>
		AI has no taste. <span style={{backgroundImage: HOTFILL, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>Now it has yours.</span>
	</div>
);

export const _u = [SANS];
