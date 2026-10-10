import React from 'react';
import {E, kf} from '../lib/theme';
import {at} from './beats';
import {Page, Plate} from '../type/Page';
import {Typed} from '../type/Typed';
import {SheetApp} from '../apps/Sheet';
import {GhostRing, GhostPointer} from '../ap/Paste';
import {CK} from '../ap/Cursor';
import {AppShot} from './SApps';
import {PIVOT} from './data';

// targets in the spreadsheet (app coordinates)
const INSERT = {x: 258, y: 44, w: 58, h: 24};
const PIVOT_ITEM = {x: 300, y: 292, w: 282, h: 32};

/** Teach me: the tutorial pauses on "pause it", you click on "click it" and "crack it", it takes back over on "switch" and finishes on "update it" */
export const STeach: React.FC<{t: number}> = ({t}) => {
	const t0 = at(40);
	const k = {menu: at(43), create: at(45) + 0.1, rows: at(47), values: at(47) + 0.08, cols: at(47) + 0.16, format: at(47) + 0.26};
	const ptr: CK[] = [
		{t: at(40), x: 760, y: 470},
		{t: at(42), x: 640, y: 380},
		{t: at(43) - 0.06, x: INSERT.x + 30, y: INSERT.y + 14},
		{t: at(44) + 0.05, x: INSERT.x + 40, y: INSERT.y + 60},
		{t: at(45) - 0.06, x: PIVOT_ITEM.x + 70, y: PIVOT_ITEM.y + 16},
		{t: at(46), x: 760, y: 420},
		{t: at(48), x: 600, y: 330},
	];
	const clicks = [at(43) - 0.04, at(45) - 0.04];
	const yourTurn = t >= at(42) && t < at(45);
	const cur = t < at(45) ? 1 + Math.min(0.9, Math.max(0, (t - at(40)) / 2)) : t < at(47) ? 2 : 5.4;
	const push = kf(t, [at(41) - 0.12, at(41) + 0.22, at(46) - 0.1, at(46) + 0.22], [0, 1, 1, 0], E.inOut);
	const crop = {x: 0, y: 0, w: 1920 - 620 * push};
	const ghost = t >= at(41) && t < at(45);
	const gTarget = t < at(44) - 0.05 ? INSERT : PIVOT_ITEM;
	return (
		<Page t={t - t0 + 1} index="05" label="TEACH ME">
			<Typed
				t={t}
				x={96}
				y={160}
				size={96}
				cps={44}
				keys={[
					{t: at(40), text: 'OR IT ~TEACHES~ YOU.'},
					{t: at(44), text: 'CLICK BY ~CLICK~.'},
				]}
			/>
			<Plate box={{x: 96, y: 300, w: 1728, h: 820}} crop={crop} radius={16}>
				<AppShot
					t={t}
					app={<SheetApp t={t} k={k} />}
					tutor={<SheetApp t={t < at(42) ? t + 0.6 : at(42) + 0.6} k={{menu: at(41), create: at(42) + 0.2}} />}
					data={PIVOT}
					cur={cur}
					ptr={ptr}
					clicks={clicks}
					panel={{x: 820, y: 40, scale: 0.8}}
					mode="do"
					modeT={t < at(46) ? 9999 : at(46)}
					status={yourTurn ? 'YOUR TURN' : t < at(46) ? 'TEACHING' : 'DOING IT'}
					playing={!yourTurn}
					tag={t >= at(46)}
				>
					<GhostRing t={t} x={INSERT.x} y={INSERT.y} w={INSERT.w} h={INSERT.h} t0={at(41)} done={at(43)} />
					<GhostRing t={t} x={PIVOT_ITEM.x} y={PIVOT_ITEM.y} w={PIVOT_ITEM.w} h={PIVOT_ITEM.h} t0={at(44)} done={at(45)} />
					{ghost ? <GhostPointer x={gTarget.x + gTarget.w * 0.55 + 14 * Math.sin((t - at(41)) * 5)} y={gTarget.y + gTarget.h * 0.6 + 10} /> : null}
				</AppShot>
			</Plate>
		</Page>
	);
};
