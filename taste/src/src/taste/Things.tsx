import React from 'react';
import {Img, staticFile} from 'remotion';
import {DISPLAY, SANS, SERIF, T, TIGHT, clamp01, easeOut} from '../lib/tokens';
import {HOTFILL} from '../lib/Type';
import {Gene, SH, SW, Site} from './Site';
import {Icon} from './Brand';

const photo = (k: string) => staticFile(`img/${k}.jpg`);
const grade = 'sepia(0.22) saturate(0.88) contrast(1.06)';
const Grain: React.FC<{o?: number}> = ({o = 0.3}) => <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('img/grain.png')})`, backgroundSize: '320px 320px', opacity: o, mixBlendMode: 'overlay'}} />;

/** a design at width w */
export const Shot: React.FC<{g: Gene; w: number; r?: number}> = ({g, w, r = 0}) => (
	<div style={{position: 'relative', width: w, height: (w * SH) / SW, overflow: 'hidden', borderRadius: r}}>
		<div style={{transform: `scale(${w / SW})`, transformOrigin: '0 0'}}>
			<Site g={g} />
		</div>
	</div>
);

/** gig poster, 18×24 */
export const Poster: React.FC<{w: number}> = ({w}) => {
	const h = w * 1.333;
	const k = w / 600;
	return (
		<div style={{position: 'relative', width: w, height: h, background: T.paper, overflow: 'hidden', boxShadow: '0 50px 110px rgba(0,0,0,0.55)'}}>
			<div style={{position: 'absolute', left: 30 * k, right: 30 * k, top: 26 * k, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 11 * k, letterSpacing: '0.16em', color: T.ink2, textTransform: 'uppercase'}}>
				<span>No. 12</span>
				<span>Fri · Oct 17 · 8 PM</span>
			</div>
			<div style={{position: 'absolute', left: 26 * k, right: 26 * k, top: 52 * k, fontFamily: DISPLAY, fontWeight: 850, fontStretch: '62%', fontSize: 168 * k, lineHeight: 0.8, color: T.ink, letterSpacing: '-0.01em'}}>ROOFTOP</div>
			<div style={{position: 'absolute', left: 30 * k, top: 186 * k, fontFamily: SERIF, fontStyle: 'italic', fontSize: 64 * k, color: T.terra, lineHeight: 1}}>sessions</div>
			<div style={{position: 'absolute', left: 30 * k, right: 30 * k, top: 270 * k, bottom: 92 * k, overflow: 'hidden'}}>
				<Img src={photo('stripes')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', filter: grade}} />
			</div>
			<div style={{position: 'absolute', left: 30 * k, right: 30 * k, bottom: 30 * k, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: SANS, fontSize: 12 * k, color: T.ink, letterSpacing: '0.04em'}}>
				<div style={{lineHeight: 1.5}}>
					Live sets until late
					<br />
					The Roof at North House
				</div>
				<div style={{fontFamily: SERIF, fontSize: 30 * k, letterSpacing: '-0.02em'}}>Free</div>
			</div>
			<Grain o={0.35} />
		</div>
	);
};

/** a coffee bag with the label */
export const Bag: React.FC<{w: number}> = ({w}) => {
	const h = w * 1.45;
	const k = w / 500;
	return (
		<div style={{position: 'relative', width: w, height: h}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: `${14 * k}px ${14 * k}px ${26 * k}px ${26 * k}px`, background: 'linear-gradient(90deg, #8E6A45 0%, #B18A5F 18%, #C29B6E 50%, #A97F55 82%, #7C5A39 100%)', boxShadow: '0 50px 110px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70 * k, background: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0))'}} />
				{[0, 1, 2, 3, 4, 5].map((i) => (
					<div key={i} style={{position: 'absolute', left: 0, right: 0, top: (18 + i * 7) * k, height: 1.5 * k, background: 'rgba(60,40,20,0.35)'}} />
				))}
				<Grain o={0.5} />
			</div>
			<div style={{position: 'absolute', left: 52 * k, right: 52 * k, top: 170 * k, bottom: 90 * k, background: T.paper, boxShadow: '0 2px 6px rgba(0,0,0,0.2)'}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 34 * k, textAlign: 'center', fontFamily: SERIF, fontSize: 54 * k, color: T.ink, letterSpacing: '-0.02em'}}>Ember &amp; Oak</div>
				<div style={{position: 'absolute', left: 30 * k, right: 30 * k, top: 108 * k, borderTop: `1px solid ${T.ink}`, borderBottom: `1px solid ${T.ink}`, padding: `${10 * k}px 0`, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, fontStretch: '62%', fontSize: 74 * k, color: T.terra, lineHeight: 0.9}}>MORNING</div>
				<div style={{position: 'absolute', left: 30 * k, right: 30 * k, top: 220 * k, fontFamily: SERIF, fontStyle: 'italic', fontSize: 30 * k, color: T.ink, textAlign: 'center', lineHeight: 1.15}}>
					Honey, cocoa
					<br />& stone fruit
				</div>
				<div style={{position: 'absolute', left: 30 * k, right: 30 * k, bottom: 26 * k, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 12 * k, letterSpacing: '0.14em', color: T.ink2}}>
					<span>WHOLE BEAN</span>
					<span>340 G</span>
				</div>
			</div>
		</div>
	);
};

/** a phone running a booking app in the taste */
export const Phone: React.FC<{w: number}> = ({w}) => {
	const h = w * 2.06;
	const k = w / 400;
	return (
		<div style={{position: 'relative', width: w, height: h, borderRadius: 64 * k, background: '#1A1A1C', padding: 14 * k, boxShadow: '0 50px 110px rgba(0,0,0,0.6), inset 0 0 0 2px #3A3A3E'}}>
			<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 52 * k, overflow: 'hidden', background: T.paper}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h * 0.5, overflow: 'hidden'}}>
					<Img src={photo('bedroom')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: grade}} />
					<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0) 30%)'}} />
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 18 * k, display: 'flex', justifyContent: 'space-between', padding: `0 ${34 * k}px`, fontFamily: SANS, fontWeight: 600, fontSize: 15 * k, color: '#fff'}}>
					<span>9:41</span>
					<span style={{width: 110 * k, height: 32 * k, borderRadius: 20 * k, background: '#000', marginTop: -6 * k}} />
					<span>●●●</span>
				</div>
				<div style={{position: 'absolute', left: 28 * k, top: 70 * k, fontFamily: SERIF, fontSize: 26 * k, color: '#fff'}}>North House</div>
				<div style={{position: 'absolute', left: 28 * k, right: 28 * k, top: h * 0.5 + 26 * k}}>
					<div style={{fontFamily: SANS, fontSize: 11 * k, letterSpacing: '0.16em', color: T.terra, textTransform: 'uppercase'}}>Room 04 · Sea view</div>
					<div style={{fontFamily: SERIF, fontSize: 46 * k, lineHeight: 0.95, color: T.ink, marginTop: 10 * k, letterSpacing: '-0.02em'}}>
						A quiet room <i style={{color: T.terra}}>by the sea</i>
					</div>
					<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 22 * k, borderTop: `1px solid rgba(22,18,14,0.2)`, paddingTop: 16 * k, fontFamily: SANS, fontSize: 14 * k, color: T.ink2}}>
						<span>Oct 17 – 19 · 2 guests</span>
						<span style={{color: T.ink}}>€240</span>
					</div>
					<div style={{marginTop: 22 * k, height: 56 * k, borderRadius: 28 * k, background: T.ink, color: T.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 15 * k, letterSpacing: '0.1em', textTransform: 'uppercase'}}>Book the room</div>
				</div>
				<Grain o={0.25} />
			</div>
		</div>
	);
};

/** your taste, as a card you share */
export const TasteCard: React.FC<{w: number; t: number; t0: number; thumbs: Gene[]}> = ({w, t, t0, thumbs}) => {
	const k = w / 860;
	const h = 540 * k;
	const a = (d: number) => easeOut(clamp01((t - t0 - d) / 0.4));
	const sw = [T.paper, T.ink, T.terra, T.sand, T.olive];
	return (
		<div style={{position: 'relative', width: w, height: h, borderRadius: 40 * k, overflow: 'hidden', background: 'linear-gradient(150deg, #1E1B19 0%, #0D0C0B 60%, #151110 100%)', boxShadow: `0 ${60 * k}px ${140 * k}px rgba(0,0,0,0.7), inset 0 0 0 ${1.5 * k}px rgba(255,255,255,0.12)`}}>
			<div style={{position: 'absolute', right: -160 * k, top: -200 * k, width: 620 * k, height: 620 * k, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,110,60,0.55), rgba(255,45,120,0.18) 60%, rgba(0,0,0,0))', filter: `blur(${20 * k}px)`}} />
			<div style={{position: 'absolute', left: 48 * k, top: 44 * k, fontFamily: SANS, fontWeight: 600, fontSize: 15 * k, letterSpacing: '0.22em', color: '#B9B2AA'}}>YOUR TASTE</div>
			<div style={{position: 'absolute', right: 44 * k, top: 36 * k}}>
				<Icon s={54 * k} />
			</div>
			<div style={{position: 'absolute', left: 44 * k, top: 92 * k, fontFamily: SERIF, fontSize: 118 * k, lineHeight: 0.9, letterSpacing: '-0.025em', color: '#F4EEE6', opacity: a(0)}}>
				Warm <i style={{backgroundImage: HOTFILL, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingRight: 8 * k}}>Editorial</i>
			</div>
			<div style={{position: 'absolute', left: 48 * k, top: 232 * k, display: 'flex', gap: 14 * k}}>
				{sw.map((c, i) => (
					<div key={i} style={{width: 46 * k, height: 46 * k, borderRadius: '50%', background: c, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)', transform: `scale(${a(0.08 + i * 0.05)})`}} />
				))}
				<div style={{marginLeft: 22 * k, display: 'flex', alignItems: 'baseline', gap: 18 * k, opacity: a(0.3), color: '#EDE6DC'}}>
					<span style={{fontFamily: SERIF, fontSize: 44 * k}}>Aa</span>
					<span style={{fontFamily: DISPLAY, fontWeight: 800, fontStretch: '62%', fontSize: 44 * k}}>AA</span>
					<span style={{fontFamily: SANS, fontSize: 14 * k, color: '#9E978F', letterSpacing: '0.02em'}}>Serif italics, tall condensed caps</span>
				</div>
			</div>
			<div style={{position: 'absolute', left: 48 * k, right: 48 * k, top: 318 * k, display: 'flex', gap: 14 * k}}>
				{thumbs.slice(0, 4).map((g, i) => (
					<div key={i} style={{opacity: a(0.35 + i * 0.06), transform: `translateY(${(1 - a(0.35 + i * 0.06)) * 20 * k}px)`}}>
						<Shot g={g} w={180 * k} r={10 * k} />
					</div>
				))}
			</div>
			<div style={{position: 'absolute', left: 48 * k, right: 44 * k, bottom: 40 * k, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: SANS, fontSize: 16 * k, color: '#A69E95', opacity: a(0.55)}}>
				<span>
					Learned from <b style={{color: '#F4EEE6', fontWeight: 600}}>214 likes</b> · Top 3% editorial
				</span>
				<span style={{padding: `${10 * k}px ${22 * k}px`, borderRadius: 999, background: '#F4EEE6', color: '#141210', fontWeight: 600, fontFamily: TIGHT}}>Share</span>
			</div>
		</div>
	);
};

/** a generic AI app window with whatever it made */
export const AIWin: React.FC<{w: number; name: string; prompt: string; g: Gene; flip: number; on?: number}> = ({w, name, prompt, g, flip, on = 0}) => {
	const k = w / 620;
	const back = flip > 0.5;
	const r = 180 * flip;
	return (
		<div style={{position: 'relative', width: w, height: 470 * k, borderRadius: 18 * k, background: '#1C1C1E', boxShadow: `0 ${30 * k}px ${80 * k}px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.1)`, overflow: 'hidden', fontFamily: SANS}}>
			<div style={{height: 40 * k, display: 'flex', alignItems: 'center', gap: 8 * k, padding: `0 ${16 * k}px`, borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
					<div key={c} style={{width: 11 * k, height: 11 * k, borderRadius: '50%', background: c}} />
				))}
				<div style={{marginLeft: 12 * k, fontSize: 13 * k, fontWeight: 600, color: '#D8D8DC'}}>{name}</div>
				<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 * k, fontSize: 12 * k, fontWeight: 600, color: on > 0.5 ? '#fff' : '#8E8E94'}}>
					<Icon s={16 * k} />
					Taste
					<div style={{position: 'relative', width: 30 * k, height: 18 * k, borderRadius: 9 * k, background: on > 0.01 ? HOTFILL : '#3A3A3F', opacity: 0.35 + 0.65 * Math.max(on, 0.0)}}>
						<div style={{position: 'absolute', top: 2 * k, left: (2 + 12 * on) * k, width: 14 * k, height: 14 * k, borderRadius: '50%', background: '#fff'}} />
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', right: 20 * k, top: 58 * k, maxWidth: 420 * k, padding: `${10 * k}px ${16 * k}px`, borderRadius: 16 * k, background: '#2E2E33', color: '#ECECEF', fontSize: 14 * k}}>{prompt}</div>
			<div style={{position: 'absolute', left: 20 * k, top: 116 * k, perspective: 1600 * k}}>
				<div style={{transform: `rotateY(${back ? r - 180 : r}deg)`, borderRadius: 12 * k, overflow: 'hidden', boxShadow: back ? `0 0 0 ${3 * k}px rgba(255,120,70,${Math.min(1, (flip - 0.5) * 3)})` : 'none'}}>
					<Shot g={g} w={560 * k} r={12 * k} />
				</div>
			</div>
		</div>
	);
};
