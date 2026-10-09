import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, SANS} from '../lib/tokens';
import {Shell, Traffic, WinBox} from '../mac/Window';
import {IChevL, IChevR, ILock, IPlus, IReload, IShare, ISidebar, ITabs} from '../mac/icons';

export type Tab = {fav: string; title: string};
export type Page = {src: string; scroll?: number; pageW?: number; pageH?: number; dark?: boolean};

export const Fav: React.FC<{fav: string; s?: number}> = ({fav, s = 15}) => (
	<Img src={staticFile('fav/' + fav + (fav === 'hn' ? '.svg' : '.png'))} style={{width: s, height: s, borderRadius: 3, flexShrink: 0, objectFit: 'contain'}} />
);

export const TOOL_H = 52;
export const TABS_H = 38;

/** Safari (Tahoe, dark, separate tab bar) */
export const Browser: React.FC<{
	box: WinBox;
	tabs: Tab[];
	active?: number;
	url: string;
	page: Page;
	focused?: boolean;
	shown?: number; // how many tabs are visible (restore animates this up)
	tabPop?: (i: number) => number; // 0..1 entrance per tab
}> = ({box, tabs, active = 0, url, page, focused = true, shown, tabPop}) => {
	const n = shown ?? tabs.length;
	const pageW = page.pageW ?? 1280;
	const k = box.w / pageW;
	const contentH = box.h - TOOL_H - TABS_H;
	const scroll = page.scroll ?? 0;
	const tabW = (box.w - 24 - 34) / Math.max(1, tabs.length);
	return (
		<Shell box={box} bg={page.dark ? '#0B0B0D' : '#FFFFFF'}>
			{/* page */}
			<div style={{position: 'absolute', left: 0, top: TOOL_H + TABS_H, width: box.w, height: contentH, overflow: 'hidden', background: page.dark ? '#0B0B0D' : '#fff'}}>
				<Img src={staticFile('web/' + page.src + '.jpg')} style={{position: 'absolute', left: 0, top: -scroll * k, width: box.w, height: 'auto'}} />
			</div>
			{/* toolbar */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: TOOL_H, background: '#2B2B2E', display: 'flex', alignItems: 'center', fontFamily: SANS}}>
				<div style={{marginLeft: 18}}>
					<Traffic active={focused} />
				</div>
				<div style={{marginLeft: 20, color: '#9C9CA3', display: 'flex', gap: 14, alignItems: 'center'}}>
					<ISidebar s={18} />
					<IChevL s={18} />
					<IChevR s={18} c="#5C5C62" />
				</div>
				<div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
					<div style={{width: Math.min(560, box.w * 0.46), height: 32, borderRadius: 10, background: '#3A3A3E', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: '#E6E6EA', fontSize: 13.5, fontWeight: 500, position: 'relative'}}>
						<ILock s={12} c="#A6A6AD" w={2} />
						<span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%'}}>{url}</span>
						<div style={{position: 'absolute', right: 10, top: 9, color: '#9C9CA3'}}>
							<IReload s={14} />
						</div>
					</div>
				</div>
				<div style={{marginRight: 18, color: '#9C9CA3', display: 'flex', gap: 16, alignItems: 'center'}}>
					<IShare s={18} />
					<IPlus s={18} />
					<ITabs s={17} />
				</div>
			</div>
			{/* tab bar */}
			<div style={{position: 'absolute', left: 0, right: 0, top: TOOL_H, height: TABS_H, background: '#202023', borderBottom: '1px solid rgba(0,0,0,0.6)', fontFamily: SANS}}>
				{tabs.slice(0, n).map((tb, i) => {
					const p = tabPop ? tabPop(i) : 1;
					const isA = i === active;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: 12 + i * tabW,
								top: 4,
								width: tabW - 4,
								height: TABS_H - 8,
								borderRadius: 8,
								background: isA ? '#3B3B3F' : 'transparent',
								display: 'flex',
								alignItems: 'center',
								justifyContent: tabW > 64 ? 'flex-start' : 'center',
								gap: 7,
								padding: tabW > 64 ? '0 9px' : 0,
								boxSizing: 'border-box',
								opacity: p,
								transform: `translateY(${(1 - p) * 10}px) scale(${0.85 + 0.15 * p})`,
							}}
						>
							<Fav fav={tb.fav} s={14} />
							{tabW > 64 ? (
								<span style={{fontSize: 12.5, fontWeight: isA ? 600 : 500, color: isA ? '#F0F0F3' : '#A9A9AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{tb.title}</span>
							) : null}
							{!isA && i < n - 1 && i + 1 !== active ? <div style={{position: 'absolute', right: -3, top: 8, bottom: 8, width: 1, background: 'rgba(255,255,255,0.1)'}} /> : null}
						</div>
					);
				})}
				<div style={{position: 'absolute', right: 14, top: 10, color: '#8E8E94'}}>
					<IPlus s={16} />
				</div>
			</div>
		</Shell>
	);
};
