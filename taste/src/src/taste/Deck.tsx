import React from 'react';
import {clamp01, easeIn, easeOut, spr} from '../lib/tokens';
import {HOTFILL} from '../lib/Type';
import {Card, Gene, SH, SW, Site} from './Site';
import {Liked} from './Grid';

export type Swipe = {at: number; dir: 1 | -1};

const DW0 = 1060;

/** the swipe deck: the top card flies off on each swipe, the next one steps up */
export const Deck: React.FC<{t: number; cards: Card[]; swipes: Swipe[]; w?: number}> = ({t, cards, swipes, w = DW0}) => {
	const DW = w;
	const DH = (w * SH) / SW;
	const k = w / DW0;
	const gone = swipes.filter((s) => t >= s.at + 0.34).length;
	const live = swipes[gone] && t >= swipes[gone].at - 0.12 ? swipes[gone] : null;
	return (
		<div style={{position: 'relative', width: DW, height: DH}}>
			{cards
				.map((g, i) => ({g, i}))
				.slice(gone, gone + 4)
				.reverse()
				.map(({g, i}) => {
					const depth = i - gone; // 0 = top
					// step up as the card above leaves
					const leaving = live && depth === 1 ? clamp01((t - live.at) / 0.3) : 0;
					const d = depth - easeOut(leaving);
					let x = 0;
					let y = d * -34 * k;
					let rot = 0;
					let s = 1 - d * 0.06;
					let o = depth > 2 ? 0 : 1;
					let like = 0;
					let nope = 0;
					if (depth === 0 && live) {
						const k = t - live.at;
						const pre = clamp01((k + 0.12) / 0.12); // lean into it
						const fly = easeIn(clamp01(k / 0.32));
						x = live.dir * (70 * pre + 1700 * fly) * k;
						y = 40 * fly * k;
						rot = live.dir * (4 * pre + 18 * fly);
						if (live.dir > 0) like = clamp01(spr(t, live.at - 0.1, 26, 0.5));
						else nope = clamp01(k / 0.1);
					}
					if (depth === 0 && !live) o = 1;
					return (
						<div key={i} style={{position: 'absolute', left: 0, top: 0, width: DW, height: DH, transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`, transformOrigin: '50% 110%', opacity: o}}>
							<div style={{position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)', filter: nope ? `grayscale(${nope}) brightness(${1 - 0.3 * nope})` : undefined}}>
								<div style={{transform: `scale(${DW / SW})`, transformOrigin: '0 0'}}>
									<Site g={g} />
								</div>
								{d > 0.01 ? <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${Math.min(0.6, d * 0.3)})`}} /> : null}
							</div>
							<Liked p={like} w={DW} h={DH} r={22} />
							{nope > 0 ? (
								<div style={{position: 'absolute', left: 40, top: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(20,20,22,0.85)', border: '3px solid rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: nope, transform: `scale(${0.6 + 0.4 * nope})`}}>
									<svg width="54" height="54" viewBox="0 0 24 24">
										<path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
									</svg>
								</div>
							) : null}
						</div>
					);
				})}
		</div>
	);
};
export const DECK_W = DW0;
export const DECK_H = (DW0 * SH) / SW;

/** the two round buttons under the deck */
export const DeckButtons: React.FC<{t: number; swipes: Swipe[]}> = ({t, swipes}) => {
	const hit = (dir: number) => Math.max(0, ...swipes.filter((s) => s.dir === dir).map((s) => (t >= s.at - 0.1 ? Math.max(0, 1 - (t - s.at + 0.1) / 0.35) : 0)));
	const B: React.FC<{dir: number}> = ({dir}) => {
		const h = hit(dir);
		return (
			<div style={{width: 96, height: 96, borderRadius: '50%', background: dir > 0 && h > 0 ? HOTFILL : 'rgba(255,255,255,0.08)', boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,${0.16 + 0.3 * h})${dir > 0 ? `, 0 0 ${50 * h}px rgba(255,80,70,${0.6 * h})` : ''}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.12 * h})`}}>
				{dir > 0 ? (
					<svg width="44" height="44" viewBox="0 0 24 24">
						<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill={h > 0 ? '#fff' : 'none'} stroke="#fff" strokeWidth="1.8" />
					</svg>
				) : (
					<svg width="40" height="40" viewBox="0 0 24 24">
						<path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeOpacity={0.6 + 0.4 * h} strokeWidth="2.2" strokeLinecap="round" />
					</svg>
				)}
			</div>
		);
	};
	return (
		<div style={{display: 'flex', gap: 56}}>
			<B dir={-1} />
			<B dir={1} />
		</div>
	);
};
