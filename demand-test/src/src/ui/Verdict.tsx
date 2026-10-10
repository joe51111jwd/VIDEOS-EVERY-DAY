import React, {useMemo} from 'react';
import {C, F} from '../lib/theme';
import {AppHeader} from './AppPrompt';
import {Tabs} from './Ads';
import {pop} from './kit';
import {Board, geom, schedule} from '../flap/Flap';

/** S5: the verdict page. tBoard = verdict flaps land, tStats = first stat lands (one per step) */
export const Verdict: React.FC<{t: number; w: number; h: number; tBoard: number; tStats: number; step?: number}> = ({t, w, h, tBoard, tStats, step = 0.16}) => {
	const g = geom(10, 1, 900, 0.7, 0.08);
	const evs = useMemo(() => schedule([{t: tBoard, lines: ['g BUILD IT'], flips: [5, 9], spread: 0.18}], 10, 1, 41), [tBoard]);
	const stats: [string, string][] = [
		['312', 'people tried to pay'],
		['2.9%', 'of visitors'],
		['$0.16', 'per buyer'],
		['$24', 'price that won'],
		['“Never lose a sock again.”', 'ad that won'],
		['1,204', 'emails, yours to keep'],
	];
	return (
		<div style={{position: 'absolute', inset: 0, background: C.page, fontFamily: F.ui, color: C.text}}>
			<AppHeader w={w} crumb="Pairs" />
			<Tabs w={w} active="Verdict" t={t} />
			<div style={{position: 'absolute', right: 40, top: 112, fontSize: 20, color: C.sub}}>Tested overnight · $50 spent</div>
			<div style={{position: 'absolute', left: 40, top: 190, width: w - 80, height: 200, borderRadius: 22, background: '#0A0A0A'}}>
				<div style={{position: 'absolute', left: 40, top: 100 - g.ch / 2}}>
					<Board t={t} evs={evs} g={g} />
				</div>
				<div style={{...pop(t, tBoard + 0.1, 0.4, 10), position: 'absolute', right: 46, top: 52, width: w - 80 - 1040, color: '#F3F0E8', fontSize: 26, lineHeight: 1.35}}>
					People paid for it before it exists. Make it.
				</div>
			</div>
			<div style={{position: 'absolute', left: 40, top: 420, width: w - 80, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18}}>
				{stats.map(([v, k], i) => (
					<div key={k} style={{...pop(t, tStats + i * step, 0.35, 18), height: (h - 420 - 40 - 18) / 2, borderRadius: 18, background: '#F6F6F3', padding: '26px 30px', boxSizing: 'border-box', position: 'relative'}}>
						<div style={{fontSize: v.length > 8 ? 34 : 72, fontWeight: 680, letterSpacing: v.length > 8 ? -0.8 : -3, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums'}}>{v}</div>
						<div style={{position: 'absolute', left: 30, bottom: 24, fontSize: 21, color: C.sub}}>{k}</div>
					</div>
				))}
			</div>
		</div>
	);
};
