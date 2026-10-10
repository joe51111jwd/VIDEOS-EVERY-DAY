import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, F, E, clamp, kf, prog} from '../lib/theme';
import {AppHeader} from './AppPrompt';
import {pop} from './kit';

export const Tabs: React.FC<{w: number; active: string; t: number}> = ({w, active}) => (
	<div style={{position: 'absolute', left: 40, top: 104, display: 'flex', gap: 8, fontFamily: F.ui}}>
		{['Store', 'Ads', 'Buyers', 'Verdict'].map((s) => (
			<div key={s} style={{height: 46, padding: '0 22px', borderRadius: 23, display: 'flex', alignItems: 'center', fontSize: 20, fontWeight: 560, background: s === active ? C.text : 'transparent', color: s === active ? '#fff' : C.sub}}>
				{s}
			</div>
		))}
	</div>
);

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const Avatar: React.FC<{s: number}> = ({s}) => (
	<div style={{width: s, height: s, borderRadius: s / 2, background: '#111', color: '#fff', fontSize: s * 0.3, fontWeight: 800, letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.ui}}>PRS</div>
);

/** S3: the ads it runs, with spend and reach ticking. ts = [xPost, story, short, meterStart, meterEnd] */
export const Ads: React.FC<{t: number; w: number; h: number; ts: number[]}> = ({t, w, h, ts}) => {
	const [t1, t2, t3, m0, m1] = ts;
	const k = prog(t, m0, m1, E.inOut);
	const spent = 50 * k;
	const seen = 18204 * k;
	const clicks = 2391 * kf(t, [m0, m1], [0, 1], (x) => x * x);
	const cardTop = 270;
	const cardH = h - cardTop - 40;
	return (
		<div style={{position: 'absolute', inset: 0, background: C.page, fontFamily: F.ui, color: C.text}}>
			<AppHeader w={w} crumb="Pairs" />
			<Tabs w={w} active="Ads" t={t} />
			{/* meters */}
			<div style={{position: 'absolute', right: 40, top: 100, display: 'flex', gap: 46, alignItems: 'flex-end'}}>
				{[
					['Spent', `$${spent.toFixed(2)}`, ' of $50'],
					['Seen by', fmt(seen), ''],
					['Clicked', fmt(clicks), ''],
				].map(([k1, v, s]) => (
					<div key={k1}>
						<div style={{fontSize: 17, color: C.sub}}>{k1}</div>
						<div style={{fontSize: 40, fontWeight: 650, letterSpacing: -1, fontVariantNumeric: 'tabular-nums'}}>
							{v}
							<span style={{fontSize: 20, color: C.sub, fontWeight: 500}}>{s}</span>
						</div>
					</div>
				))}
			</div>
			<div style={{position: 'absolute', left: 40, top: 196, width: w - 80, height: 8, borderRadius: 4, background: '#EEEEEB'}}>
				<div style={{width: `${k * 100}%`, height: 8, borderRadius: 4, background: C.go}} />
			</div>
			{/* X post */}
			<div style={{...pop(t, t1, 0.4, 40), position: 'absolute', left: 40, top: cardTop, width: 640, height: cardH, borderRadius: 18, border: `1px solid ${C.line}`, background: '#fff', overflow: 'hidden'}}>
				<div style={{display: 'flex', gap: 14, padding: '22px 24px 0'}}>
					<Avatar s={52} />
					<div>
						<div style={{fontSize: 21, fontWeight: 700}}>
							Pairs <span style={{color: C.sub, fontWeight: 400}}>@pairs</span>
						</div>
						<div style={{fontSize: 22, marginTop: 6, lineHeight: 1.3}}>Never lose a sock again. A hidden magnet keeps every pair together.</div>
					</div>
				</div>
				<div style={{margin: '18px 24px 0 90px', height: cardH - 210, borderRadius: 16, overflow: 'hidden'}}>
					<Img src={staticFile('img/socks_b.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				</div>
				<div style={{position: 'absolute', left: 90, bottom: 22, fontSize: 17, color: C.sub}}>Ad</div>
			</div>
			{/* story */}
			<div style={{...pop(t, t2, 0.4, 40), position: 'absolute', left: 710, top: cardTop, width: cardH * 0.5625, height: cardH, borderRadius: 18, overflow: 'hidden', background: '#ddd'}}>
				<Img src={staticFile('img/socks_a.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 50%'}} />
				<div style={{position: 'absolute', left: 14, top: 12, right: 14, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.45)'}}>
					<div style={{width: `${clamp((t - t2) / 2.5) * 100}%`, height: 4, borderRadius: 2, background: '#fff'}} />
				</div>
				<div style={{position: 'absolute', left: 16, top: 30, display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontSize: 18, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.4)'}}>
					<Avatar s={36} /> pairs <span style={{fontWeight: 400, opacity: 0.85}}>Sponsored</span>
				</div>
				<div style={{position: 'absolute', left: 30, right: 30, bottom: 34, height: 58, borderRadius: 29, background: '#fff', color: '#111', fontSize: 21, fontWeight: 650, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Shop now</div>
			</div>
			{/* short video */}
			<div style={{...pop(t, t3, 0.4, 40), position: 'absolute', left: 710 + cardH * 0.5625 + 30, top: cardTop, width: cardH * 0.5625, height: cardH, borderRadius: 18, overflow: 'hidden', background: '#000'}}>
				<Img src={staticFile('img/socks_b.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 50%', transform: `scale(${1.05 + 0.08 * clamp((t - t3) / 3)})`}} />
				<div style={{position: 'absolute', left: 22, right: 22, top: '38%', textAlign: 'center', color: '#fff', fontSize: 30, fontWeight: 800, lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>my socks finally stay together</div>
				<div style={{position: 'absolute', left: 20, bottom: 26, color: '#fff', fontSize: 19, fontWeight: 600}}>
					@pairs · <span style={{fontWeight: 400}}>Sponsored</span>
				</div>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{position: 'absolute', right: 16, bottom: 120 + i * 78, width: 46, height: 46, borderRadius: 23, background: 'rgba(255,255,255,0.9)'}} />
				))}
			</div>
		</div>
	);
};
