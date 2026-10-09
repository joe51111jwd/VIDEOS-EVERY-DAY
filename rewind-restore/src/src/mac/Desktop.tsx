import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {H, SANS, W} from '../lib/tokens';
import {AppleLogo} from './icons';
import {RewindGlyph} from '../rr/Brand';

/** the wallpaper, with an optional layer that sits BEHIND the mountains (depth effect) */
export const Wallpaper: React.FC<{behind?: React.ReactNode; dim?: number}> = ({behind, dim = 0}) => (
	<AbsoluteFill>
		<Img src={staticFile('img/wall.jpg')} style={{position: 'absolute', left: 0, top: 0, width: W, height: H}} />
		{behind ? (
			<>
				{behind}
				<Img src={staticFile('img/wall-fg.png')} style={{position: 'absolute', left: 0, top: 0, width: W, height: H}} />
			</>
		) : null}
		{dim ? <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} /> : null}
	</AbsoluteFill>
);

const Battery: React.FC = () => (
	<svg width="27" height="13" viewBox="0 0 27 13" style={{display: 'block'}}>
		<rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="rgba(255,255,255,0.55)" />
		<rect x="2.5" y="2.5" width="15" height="8" rx="1.8" fill="#fff" />
		<path d="M25 4.5v4c.9-.3 1.5-1.1 1.5-2s-.6-1.7-1.5-2z" fill="rgba(255,255,255,0.55)" />
	</svg>
);
const Wifi: React.FC = () => (
	<svg width="18" height="14" viewBox="0 0 18 14" style={{display: 'block'}}>
		<path d="M9 13.2l2.3-2.6a3.4 3.4 0 00-4.6 0z" fill="#fff" />
		<path d="M3.9 7.6a7.3 7.3 0 0110.2 0l-1.5 1.7a5 5 0 00-7.2 0z" fill="#fff" />
		<path d="M1 4.4a11.5 11.5 0 0116 0l-1.5 1.7a9.2 9.2 0 00-13 0z" fill="#fff" />
	</svg>
);
const CC: React.FC = () => (
	<svg width="16" height="14" viewBox="0 0 16 14" style={{display: 'block'}}>
		<rect x="0.75" y="0.75" width="14.5" height="5" rx="2.5" fill="none" stroke="#fff" strokeWidth="1.4" />
		<circle cx="11.7" cy="3.25" r="1.6" fill="#fff" />
		<rect x="0.75" y="8.25" width="14.5" height="5" rx="2.5" fill="none" stroke="#fff" strokeWidth="1.4" />
		<circle cx="4.3" cy="10.75" r="1.6" fill="#fff" />
	</svg>
);

export const MENU_H = 34;

/** the menu bar (Tahoe: no background, text straight on the wallpaper) */
export const MenuBar: React.FC<{app: string; menus?: string[]; clock: string; rewindOn?: number}> = ({app, menus = ['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window', 'Help'], clock, rewindOn = 0}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: W, height: MENU_H, display: 'flex', alignItems: 'center', fontFamily: SANS, fontSize: 15, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.25)', background: 'linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0))'}}>
		<div style={{marginLeft: 22, marginRight: 22}}>
			<AppleLogo s={17} />
		</div>
		<div style={{fontWeight: 700, marginRight: 22}}>{app}</div>
		{menus.map((m) => (
			<div key={m} style={{fontWeight: 500, marginRight: 21, opacity: 0.96}}>
				{m}
			</div>
		))}
		<div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20, marginRight: 22}}>
			<div style={{position: 'relative'}}>
				<RewindGlyph s={18} c="#fff" />
				{rewindOn > 0 ? <div style={{position: 'absolute', inset: -5, borderRadius: 6, background: `rgba(255,255,255,${0.22 * rewindOn})`}} /> : null}
			</div>
			<Battery />
			<Wifi />
			<CC />
			<div style={{fontWeight: 500, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.005em'}}>{clock}</div>
		</div>
	</div>
);
