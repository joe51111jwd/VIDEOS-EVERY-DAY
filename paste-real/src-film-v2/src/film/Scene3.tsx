import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grab} from '../brand/brand';
import {at, BEAT} from '../lib/beat';
import {clamp01, Rect, step} from '../lib/tokens';
import {Cursor, DESK, MenuBar, Wallpaper, Win} from '../mac/mac';
import {SAFARI_BAR, SafariChrome} from './apps';
import {CODE_AFTER, CODE_BEFORE, Hero, SAFARI_TABS, SafariTabs, SitePage, StarGlyph, VS, VSCode} from './apps3';
import {Captions, Cam, CK, DeskView, Ghost, KeyPill, makeCam, makeCursor, makePress, pillGeom, PillText, PillTimes, toScreen} from './kit';
import {E} from './T';
import {S3} from './timing';
export {S3};

// Scene 3 (bars 6-7): a landing page's hero is copied in Safari, pasted into VS Code as a React + Tailwind
// component, and runs on localhost: the same hero, now real code.


// ------------------------------------------------------------------ layout (desktop points)
const SAF: Rect = {x: 12, y: 32, w: 696, h: 560};
const CHROME = SAFARI_BAR + SAFARI_TABS;
const HERO_TOP = SAF.y + CHROME + 44; // under the site's nav
/** the hero, in Safari */
const SRC: Rect = {x: SAF.x + 40, y: HERO_TOP + 12, w: SAF.w - 80, h: 420};
const VSW: Rect = {x: 12, y: 602, w: 696, h: 666};
const CODE_X = VSW.x + VS.act + VS.side + VS.gutter + 6;
const CODE_Y = VSW.y + VS.title + VS.tabs + VS.crumbs + 4;
const DST: Rect = {x: CODE_X, y: CODE_Y + 2 * VS.line, w: 440, h: 22 * VS.line};
const SEAM = (SAF.y + SAF.h + VSW.y) / 2;
const TAB2 = {x: SAF.x + (SAF.w * 3) / 4, y: SAF.y + SAFARI_BAR + SAFARI_TABS / 2};
const BTN = {x: 300, y: HERO_TOP + 220};

// ------------------------------------------------------------------ camera
const CAM_SITE0: Cam = {cx: DESK.w / 2, cy: 330, s: 1.62};
const CAM_SITE1: Cam = {cx: DESK.w / 2, cy: 360, s: 1.9};
const CAM_ALL: Cam = {cx: DESK.w / 2, cy: DESK.h / 2, s: 1.5};
const CAM_CODE: Cam = {cx: VSW.x + VS.act + VS.side + 264, cy: 830, s: 2.05};
const CAM_LIVE: Cam = {cx: DESK.w / 2, cy: 400, s: 1.75};
export const cam3 = makeCam([
	[S3.start, CAM_SITE0],
	[S3.hover + 0.1, CAM_SITE0],
	[S3.lift, CAM_SITE1],
	[S3.lift + 0.56, CAM_ALL],
	[S3.land + 0.08, CAM_ALL],
	[S3.land + 0.5, CAM_CODE],
	[S3.compiled + 0.16, CAM_CODE],
	[S3.tab + 0.08, CAM_LIVE],
	[S3.end + 1, {...CAM_LIVE, s: 1.82}],
]);

// ------------------------------------------------------------------ cursor
const CURSOR: CK[] = [
	[S3.start, 610, 520],
	[S3.hover + 0.05, 420, HERO_TOP + 120],
	[S3.lift, 424, HERO_TOP + 124],
	[S3.focus - 0.03, 560, VSW.y + 15],
	[S3.compiled + 0.1, 566, VSW.y + 18],
	[S3.tab - 0.03, TAB2.x - 30, TAB2.y + 2],
	[S3.tab + 0.25, TAB2.x - 28, TAB2.y + 4],
	[S3.hover2 - 0.04, BTN.x, BTN.y, 'hand'],
	[S3.end + 2, BTN.x + 2, BTN.y + 1, 'hand'],
];
const cursorAt = makeCursor(CURSOR);
const pressAt = makePress([
	[S3.focus, S3.focus + 0.08],
	[S3.tab, S3.tab + 0.08],
]);

const PT: PillTimes = {copy: S3.copy, lift: S3.lift, paste: S3.paste, land: S3.land, out: S3.compiled + 0.05, in: S3.hover - 0.06};
const PL_TXT: PillText = {copy: 'Copy the website', copied: 'Copied as a design', copiedDetail: '23 layers', paste: 'Paste in VS Code', pasted: 'Pasted as React code'};

const TERM0 = ['  ▲ Next.js 15.2.1', '  - Local:   http://localhost:3000', '', ' ✓ Ready in 1182ms'];

export const Scene3: React.FC<{t: number}> = ({t}) => {
	const cam = cam3(t);
	const cur = cursorAt(t);
	const focusCode = t >= S3.focus && t < S3.tab;

	const grabShow = step(t, S3.hover, 0.16) * (1 - step(t, S3.lift + 0.08, 0.25));
	const fill = step(t, S3.copy, 0.26);
	const flash = step(t, S3.copy + 0.2, 0.05) * (1 - step(t, S3.copy + 0.27, 0.3));

	const pasted = t >= S3.land;
	const reveal = pasted ? 2 + clamp01((t - S3.land) / 0.24) * (CODE_AFTER.length - 2) : 1e9;
	const live = t >= S3.tab;
	const hero = live ? step(t, S3.hmr, 0.2) : 1;
	const hover = step(t, S3.hover2, 0.12);
	const terminal = t >= S3.compiled ? [...TERM0, ' ✓ Compiled / in 214ms'] : TERM0;

	const seamY = 960 + (SEAM - cam.cy) * cam.s;
	const pillY = Math.max(130, Math.min(1500, seamY + 8));
	const g = pillGeom(t, PT, PL_TXT, pillY);
	const srcS = toScreen(cam, SRC);
	const dstS = toScreen(cam, DST);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<DeskView cam={cam}>
				<Wallpaper />
				<MenuBar app={focusCode ? 'Code' : 'Safari'} menus={focusCode ? ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal'] : ['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window']} pr={t >= S3.hover && t < S3.lift + 0.1 ? 1 : 0} />
				<Win x={SAF.x} y={SAF.y} w={SAF.w} h={SAF.h} front={!focusCode} z={focusCode ? 1 : 2}>
					<SafariChrome w={SAF.w} url={live ? 'localhost:3000' : 'northstar.app'} front={!focusCode} />
					<SafariTabs
						w={SAF.w}
						top={SAFARI_BAR}
						front={!focusCode}
						active={live ? 1 : 0}
						tabs={[
							['Northstar — Know your numbers', <StarGlyph key="a" size={10} />],
							['localhost:3000', <div key="b" style={{width: 10, height: 10, borderRadius: 2, background: '#0B0B12', transform: 'rotate(45deg) scale(0.75)'}} />],
						]}
					/>
					<div style={{position: 'absolute', left: 0, top: CHROME, width: SAF.w, height: SAF.h - CHROME, overflow: 'hidden', background: '#fff'}}>
						<SitePage w={SAF.w} brand={live ? 'acme' : 'northstar'} hero={hero} hover={hover} />
					</div>
					<div style={{position: 'absolute', left: SRC.x - SAF.x, top: SRC.y - SAF.y, zIndex: 30}}>
						<Grab w={SRC.w} h={SRC.h} show={grabShow} march={t * 1.6} fill={fill} flash={flash} tag="Section · 23 layers" tagIn radius={4} scale={0.55} />
					</div>
				</Win>
				<Win x={VSW.x} y={VSW.y} w={VSW.w} h={VSW.h} front={focusCode} z={focusCode ? 2 : 1} bg="#1F1F1F">
					<VSCode
						w={VSW.w}
						h={VSW.h}
						front={focusCode}
						lines={pasted ? CODE_AFTER : CODE_BEFORE}
						reveal={reveal}
						sel={pasted ? null : [1, 2]}
						caret={pasted ? [CODE_AFTER.length - 1, 1] : null}
						flash={pasted ? 1 - step(t, S3.land + 0.2, 0.5) : 0}
						terminal={terminal}
					/>
				</Win>
				<Cursor x={cur.x} y={cur.y} kind={cur.kind} press={pressAt(t)} size={1} />
			</DeskView>

			<KeyPill t={t} T={PT} L={PL_TXT} y={pillY} id="p3" />
			<Ghost
				t={t}
				T={PT}
				src={srcS}
				dst={dstS}
				slot={g.slot}
				radius={4}
				render={(w, h) => (
					<div style={{width: w, height: h, overflow: 'hidden', background: '#fff'}}>
						<div style={{transform: `scale(${w / SRC.w})`, transformOrigin: '0 0'}}>
							<div style={{marginLeft: -(SRC.x - SAF.x), marginTop: -(SRC.y - HERO_TOP)}}>
								<Hero w={SAF.w} />
							</div>
						</div>
					</div>
				)}
			/>
			<Captions t={t} caps={[[S3.hmr + 0.02, 99, 'Real code.']]} top={Math.max(130, Math.min(1560, seamY - 50))} />
		</AbsoluteFill>
	);
};
