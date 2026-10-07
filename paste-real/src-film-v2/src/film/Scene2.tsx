import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grab} from '../brand/brand';
import {at, BEAT} from '../lib/beat';
import {easeOut, lerp, Rect, spr, step} from '../lib/tokens';
import {Cursor, DESK, MenuBar, Wallpaper, Win} from '../mac/mac';
import {SafariChrome} from './apps';
import {BarChart, CHART, ChartDataWin, DATA_WIN, DECK_CHART, DeckSlide, KeynoteChrome, KeynoteInspector, KeynoteNav, KHandles, KN, KN_CHROME, playerRect, TALK_CHART, TalkSlide, VideoPage} from './apps2';
import {Captions, Cam, CK, DeskView, Ghost, KeyPill, makeCam, makeCursor, makePress, pillGeom, PillText, PillTimes, toScreen} from './kit';
import {E} from './T';
import {S2} from './timing';
export {S2};

// Scene 2 (bars 4-5): a chart inside a paused conference talk (a video) is copied, pasted into a Keynote deck as a
// native chart, and its data is edited: the bar grows.


// ------------------------------------------------------------------ layout (desktop points)
const SAF: Rect = {x: 12, y: 32, w: 696, h: 520};
const PL = playerRect(SAF.w);
const PLAYER: Rect = {x: SAF.x + PL.x, y: SAF.y + PL.y, w: PL.w, h: PL.h};
const KV = PL.w / 1920;
/** the chart, in the video */
const SRC: Rect = {x: PLAYER.x + TALK_CHART.x * KV, y: PLAYER.y + TALK_CHART.y * KV, w: CHART.w * KV, h: CHART.h * KV};
const KW: Rect = {x: 12, y: 562, w: 696, h: 706};
const CANVAS: Rect = {x: KW.x + KN.nav, y: KW.y + KN_CHROME, w: KW.w - KN.nav - KN.insp, h: KW.h - KN_CHROME};
const SLIDE_W = 388;
const KS = SLIDE_W / 1920;
const SLIDE: Rect = {x: CANVAS.x + (CANVAS.w - SLIDE_W) / 2, y: CANVAS.y + (CANVAS.h - 1080 * KS) / 2, w: SLIDE_W, h: 1080 * KS};
/** the chart, pasted into the deck */
const DST: Rect = {x: SLIDE.x + DECK_CHART.x * KS, y: SLIDE.y + DECK_CHART.y * KS, w: CHART.w * DECK_CHART.s * KS, h: CHART.h * DECK_CHART.s * KS};
const BTN = {cx: DST.x + DST.w / 2, y: SLIDE.y + SLIDE.h + 7, w: 86, h: 19};
const DW: Rect = {x: 190, y: 1066, w: DATA_WIN.w, h: DATA_WIN.h};
const CELL = {x: DW.x + DATA_WIN.c0 + DATA_WIN.c1 - 22, y: DW.y + DATA_WIN.title + DATA_WIN.tool + 6 * DATA_WIN.row + DATA_WIN.row / 2};
const SEAM = (SAF.y + SAF.h + KW.y) / 2;

// ------------------------------------------------------------------ camera
const CAM_VID0: Cam = {cx: 360, cy: 330, s: 1.62};
const CAM_VID1: Cam = {cx: SRC.x + SRC.w / 2 + 40, cy: SRC.y + SRC.h / 2, s: 2.45};
const CAM_ALL: Cam = {cx: DESK.w / 2, cy: DESK.h / 2, s: 1.5};
const CAM_KN: Cam = {cx: SLIDE.x + SLIDE.w / 2, cy: 940, s: 2.7};
export const cam2 = makeCam([
	[S2.start, CAM_VID0],
	[S2.hover + 0.1, CAM_VID0],
	[S2.lift, CAM_VID1],
	[S2.lift + 0.56, CAM_ALL],
	[S2.land + 0.12, CAM_ALL],
	[S2.land + 0.62, CAM_KN],
	[S2.end + 1, {...CAM_KN, s: 2.78}],
]);

// ------------------------------------------------------------------ cursor
const CURSOR: CK[] = [
	[S2.start, PLAYER.x + PLAYER.w * 0.8, PLAYER.y + PLAYER.h * 0.84],
	[S2.hover + 0.05, SRC.x + SRC.w * 0.62, SRC.y + SRC.h * 0.5],
	[S2.lift, SRC.x + SRC.w * 0.64, SRC.y + SRC.h * 0.52],
	[S2.focus - 0.03, CANVAS.x + CANVAS.w * 0.82, CANVAS.y + 60],
	[S2.land + 0.08, CANVAS.x + CANVAS.w * 0.82, CANVAS.y + 60],
	[S2.editBtn - 0.03, BTN.cx + 8, BTN.y + 10],
	[S2.win + 0.12, BTN.cx + 8, BTN.y + 10],
	[S2.dbl1 - 0.04, CELL.x, CELL.y, 'arrow'],
	[S2.dbl2 + 0.1, CELL.x, CELL.y, 'arrow'],
	[S2.ret + 0.1, CELL.x + 2, CELL.y + 1, 'arrow'],
	[S2.ret + 0.55, CELL.x + 70, CELL.y + 30, 'arrow'],
	[S2.end + 2, CELL.x + 74, CELL.y + 32, 'arrow'],
];
const cursorAt = makeCursor(CURSOR);
const pressAt = makePress([
	[S2.focus, S2.focus + 0.08],
	[S2.editBtn, S2.editBtn + 0.08],
	[S2.dbl1, S2.dbl1 + 0.06],
	[S2.dbl2, S2.dbl2 + 0.06],
]);

const PT: PillTimes = {copy: S2.copy, lift: S2.lift, paste: S2.paste, land: S2.land, out: S2.editBtn + 0.12, in: S2.hover - 0.06};
const PL_TXT: PillText = {copy: 'Copy the chart', copied: 'Copied as a chart', copiedDetail: '6 bars', paste: 'Paste in Keynote', pasted: 'Pasted as a Keynote chart'};
const OLD = CHART.values[5];
const NEW = 68;

export const Scene2: React.FC<{t: number}> = ({t}) => {
	const cam = cam2(t);
	const cur = cursorAt(t);
	const focusKn = t >= S2.focus;

	// grab on the video
	const grabShow = step(t, S2.hover, 0.16) * (1 - step(t, S2.lift + 0.08, 0.25));
	const fill = step(t, S2.copy, 0.26);
	const flash = step(t, S2.copy + 0.2, 0.05) * (1 - step(t, S2.copy + 0.27, 0.3));

	// the pasted chart and its data
	const landed = t >= S2.land;
	const editing = t >= S2.dbl2 && t < S2.ret;
	const typedTxt = t < S2.type ? null : '68'.slice(0, Math.min(2, Math.floor((t - S2.type) / 0.1) + 1));
	const v5 = t < S2.ret ? OLD : lerp(OLD, NEW, spr(t, S2.ret, 7, 0.55));
	const values = [...CHART.values.slice(0, 5), v5];
	const labels = values.map((v, i) => (i === 5 && t >= S2.ret ? `${NEW}%` : `${Math.round(v)}%`));
	const winP = step(t, S2.win, 0.22, easeOut);
	const sel = landed;

	const seamY = 960 + (SEAM - cam.cy) * cam.s;
	const pillY = Math.max(130, Math.min(1500, seamY + 8));

	const srcS = toScreen(cam, SRC);
	const dstS = toScreen(cam, DST);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<DeskView cam={cam}>
				<Wallpaper />
				<MenuBar app={focusKn ? 'Keynote' : 'Safari'} menus={focusKn ? ['File', 'Edit', 'Insert', 'Slide', 'Format', 'Arrange', 'View'] : ['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window']} pr={t >= S2.hover && t < S2.lift + 0.1 ? 1 : 0} />
				<Win x={SAF.x} y={SAF.y} w={SAF.w} h={SAF.h} front={!focusKn} z={focusKn ? 1 : 2} bg="#0C0C0F">
					<SafariChrome w={SAF.w} url="signalsummit.com/talks/state-of-design" front={!focusKn} />
					<VideoPage w={SAF.w} h={SAF.h} frame={<div style={{transform: `scale(${KV})`, transformOrigin: '0 0'}}><TalkSlide /></div>} controls={1} />
					<div style={{position: 'absolute', left: SRC.x - SAF.x, top: SRC.y - SAF.y, zIndex: 30}}>
						<Grab w={SRC.w} h={SRC.h} show={grabShow} march={t * 1.6} fill={fill} flash={flash} tag="Chart · 6 bars" tagIn radius={2} scale={0.5} />
					</div>
				</Win>
				<Win x={KW.x} y={KW.y} w={KW.w} h={KW.h} front={focusKn} z={focusKn ? 2 : 1} bg="#E6E6E9">
					<KeynoteChrome w={KW.w} title="Q4 Board Update" front={focusKn} />
					<KeynoteNav
						h={KW.h}
						current={6}
						thumbs={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) =>
							i === 6 ? (
								<DeckSlide key={i}>
									{landed ? (
										<div style={{position: 'absolute', left: DECK_CHART.x, top: DECK_CHART.y, transform: `scale(${DECK_CHART.s})`, transformOrigin: '0 0'}}>
											<BarChart values={values} labels={labels} />
										</div>
									) : null}
								</DeckSlide>
							) : (
								<DeckSlide key={i} title={['Q4 board update', 'Where we are', 'Revenue', 'Pipeline', 'Customers', 'Product', '', 'Hiring plan', 'Budget', 'Risks', 'Asks', 'Thank you'][i]} bullets={i % 3 === 1} />
							),
						)}
					/>
					<KeynoteInspector x={KW.w - KN.insp} h={KW.h} mode={landed ? 'chart' : 'slide'} />
					{/* the slide */}
					<div style={{position: 'absolute', left: SLIDE.x - KW.x, top: SLIDE.y - KW.y, width: SLIDE.w, height: SLIDE.h, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.18)'}}>
						<div style={{transform: `scale(${KS})`, transformOrigin: '0 0'}}>
							<DeckSlide>
								{landed ? (
									<div style={{position: 'absolute', left: DECK_CHART.x, top: DECK_CHART.y, transform: `scale(${DECK_CHART.s})`, transformOrigin: '0 0'}}>
										<BarChart values={values} labels={labels} />
									</div>
								) : null}
							</DeckSlide>
						</div>
					</div>
					{sel ? <KHandles x={DST.x - KW.x} y={DST.y - KW.y} w={DST.w} h={DST.h} show={step(t, S2.land, 0.08)} /> : null}
					{/* Keynote's on-canvas "Edit Chart Data" button */}
					{sel ? (
						<div
							style={{
								position: 'absolute',
								left: BTN.cx - BTN.w / 2 - KW.x,
								top: BTN.y - KW.y,
								width: BTN.w,
								height: BTN.h,
								borderRadius: 5,
								background: t >= S2.editBtn && t < S2.editBtn + 0.1 ? '#E2E2E6' : '#fff',
								boxShadow: '0 0 0 0.5px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.12)',
								fontFamily: 'Inter',
								fontSize: 9.5,
								fontWeight: 500,
								color: '#2B2B2E',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								opacity: step(t, S2.land + 0.05, 0.15),
								zIndex: 22,
							}}
						>
							Edit Chart Data
						</div>
					) : null}
				</Win>
				{/* the chart data window */}
				{winP > 0 ? (
					<div style={{position: 'absolute', left: DW.x, top: DW.y, zIndex: 5, opacity: winP, transform: `scale(${0.94 + 0.06 * winP})`, transformOrigin: '30% 0%'}}>
						<ChartDataWin values={[...CHART.values.slice(0, 5), t < S2.ret ? OLD : NEW]} edit={editing ? {row: 5, text: typedTxt ?? String(OLD), sel: typedTxt === null ? 1 : 0, caret: typedTxt !== null || Math.floor((t - S2.dbl2) / 0.5) % 2 === 0} : null} selRow={t >= S2.dbl1 ? 5 : -1} />
					</div>
				) : null}
				<Cursor x={cur.x} y={cur.y} kind={cur.kind} press={pressAt(t)} size={1} />
			</DeskView>

			<KeyPill t={t} T={PT} L={PL_TXT} y={pillY} id="p2" />
			<GhostSlot t={t} pillY={pillY} srcS={srcS} dstS={dstS} />
			<Captions t={t} caps={[[S2.ret + 0.03, 99, 'Real data.']]} />
		</AbsoluteFill>
	);
};

// the copy in flight needs the pill's slot, which depends on the pill's width at this moment
const GhostSlot: React.FC<{t: number; pillY: number; srcS: Rect; dstS: Rect}> = ({t, pillY, srcS, dstS}) => {
	const g = pillGeom(t, PT, PL_TXT, pillY);
	return (
		<Ghost
			t={t}
			T={PT}
			src={srcS}
			dst={dstS}
			slot={g.slot}
			render={(w) => (
				<div style={{width: w, height: (w * CHART.h) / CHART.w, background: '#0F1325', overflow: 'hidden'}}>
					<div style={{transform: `scale(${w / CHART.w})`, transformOrigin: '0 0'}}>
						<BarChart />
					</div>
				</div>
			)}
		/>
	);
};
