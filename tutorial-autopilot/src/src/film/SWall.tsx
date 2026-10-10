import React from 'react';
import {C, F, prog, spr} from '../lib/theme';
import {at} from './beats';
import {Page} from '../type/Page';
import {Typed} from '../type/Typed';
import {WALL} from './data';

/** "EVERY TUTORIAL ON THE INTERNET." — the list types two rows a beat; "NOW DOES ITSELF." — each row gets stamped done */
export const SWall: React.FC<{t: number}> = ({t}) => {
	const t0 = at(48);
	const rowH = 66;
	return (
		<Page t={t - t0 + 1} index="06" label="EVERY TUTORIAL">
			<Typed
				t={t}
				x={96}
				y={160}
				size={104}
				cps={46}
				keys={[
					{t: at(48), text: 'EVERY TUTORIAL\nON THE INTERNET.'},
					{t: at(52), text: 'EVERY TUTORIAL\nNOW DOES ~ITSELF~.'},
				]}
			/>
			<div style={{position: 'absolute', left: 96, right: 96, top: 440, borderTop: `1px solid ${C.hair}`}}>
				{WALL.map(([app, title, dur], i) => {
					const born = at(48 + Math.floor(i / 2)) + (i % 2) * 0.1;
					if (t < born) return <div key={i} style={{height: rowH}} />;
					const n = Math.floor((t - born) * 110);
					const fresh = (s: number) => t - born - s / 110 < 0.09;
					const stamp = at(52 + Math.floor(i / 2)) + (i % 2) * 0.1;
					const st = t >= stamp ? spr(t, stamp, 28, 0.6) : 0;
					const typed = (s: string, off: number) =>
						Array.from(s.slice(0, Math.max(0, n - off))).map((ch, j) => (
							<span key={j} style={{color: fresh(off + j) ? C.orange : undefined}}>
								{ch}
							</span>
						));
					return (
						<div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.hair}`, fontFamily: F.mono, letterSpacing: '-0.03em', whiteSpace: 'pre'}}>
							<div style={{width: 250, fontSize: 30, color: C.mute}}>{typed(app, 0)}</div>
							<div style={{flex: 1, fontSize: 40, fontWeight: 560, color: C.ink}}>{typed(title, 6)}</div>
							<div style={{width: 200, textAlign: 'right', fontSize: 34, color: st > 0 ? C.mute : C.ink, textDecoration: st > 0 ? 'line-through' : 'none', textDecorationColor: C.orange, textDecorationThickness: 4}}>{typed(dur, 20)}</div>
							<div style={{width: 230, display: 'flex', justifyContent: 'flex-end'}}>
								{st > 0 ? (
									<div style={{padding: '8px 16px 9px', borderRadius: 8, background: C.orange, color: '#160C06', fontSize: 28, fontWeight: 600, transform: `scale(${0.5 + 0.5 * st})`, opacity: prog(t, stamp, stamp + 0.06)}}>✓ DONE</div>
								) : null}
							</div>
						</div>
					);
				})}
			</div>
		</Page>
	);
};
