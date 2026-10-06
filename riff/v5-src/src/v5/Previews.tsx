import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Website} from './designs/Website';

export const SiteTest: React.FC = () => (
	<AbsoluteFill style={{background: '#ddd'}}>
		<Website tl={{nav: 0.5, image: 0.7, eyebrow: 0.9, head: 1.0, body: 1.35, ctas: 1.5, card: 1.65, pill: 1.8, warm: 2.5, big: 3.2, menu: 4.2}} />
	</AbsoluteFill>
);

import {MenuBar, RiffWindow, Wallpaper, WallpaperSVG, CANVAS_CENTER} from './mac/Mac';

export const WallpaperStill: React.FC = () => (
	<AbsoluteFill style={{transform: 'scale(1.5)', transformOrigin: '0 0'}}>
		<WallpaperSVG />
	</AbsoluteFill>
);
import {IGlobe, IPhone, IPoster, IStory} from './mac/icons';
import {SANS} from './tokens';

export const Artboard: React.FC<{x: number; y: number; w: number; h: number; label: string; children: React.ReactNode; radius?: number}> = ({x, y, w, h, label, children, radius = 0}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
		<div style={{position: 'absolute', left: 0, top: -34, fontFamily: SANS, fontSize: 19, fontWeight: 500, color: '#8E8E93', whiteSpace: 'nowrap'}}>{label}</div>
		<div style={{position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.06), 0 24px 60px rgba(0,0,0,0.12)'}}>{children}</div>
	</div>
);

export const DeskTest: React.FC = () => {
	const cam = {x: 720, y: 450, z: 0.64};
	return (
		<AbsoluteFill>
			<Wallpaper />
			<MenuBar />
			<RiffWindow
				items={[
					{label: 'Website', icon: IGlobe},
					{label: 'iOS app', icon: IPhone},
					{label: 'Grand opening poster', icon: IPoster},
					{label: 'Instagram story', icon: IStory},
				]}
				active={0}
				zoom={cam.z}
				user={0.5}
				riff={0}
			>
				<div style={{position: 'absolute', left: CANVAS_CENTER.x, top: CANVAS_CENTER.y, transform: `scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`, transformOrigin: '0 0'}}>
					<Artboard x={0} y={0} w={1440} h={900} label="Website — Desktop">
						<Website tl={{}} />
					</Artboard>
				</div>
			</RiffWindow>
		</AbsoluteFill>
	);
};

import {HomeScreen, MenuScreen, OrderScreen} from './designs/AppScreens';
export const AppTest: React.FC = () => (
	<AbsoluteFill style={{background: '#E9E6E1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 60}}>
		{[0, 1, 2].map((i) => (
			<div key={i} style={{borderRadius: 52, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.18)'}}>
				{i === 0 ? <HomeScreen tl={{screen: 0.1, head: 0.2, popular: 0.4, rewards: 0.6, tab: 0.5, usual: 1.5}} /> : null}
				{i === 1 ? <MenuScreen tl={{screen: 0.1, head: 0.2, chips: 0.35, rows: 0.5, cart: 0.9}} /> : null}
				{i === 2 ? <OrderScreen tl={{screen: 0.1, head: 0.2, ring: 0.4, steps: 0.7, map: 0.9}} /> : null}
			</div>
		))}
	</AbsoluteFill>
);

import {Poster, Story, MenuBoard, BizCards, BeanBag, Sticker} from './designs/Print';
export const PrintTest: React.FC = () => (
	<AbsoluteFill style={{background: '#E9E6E1'}}>
		<div style={{position: 'absolute', left: 40, top: 40}}><Poster tl={{bg: 0.1, top: 0.3, moon: 0.4, type: 0.6, info: 0.8, cup: 1.2}} /></div>
		<div style={{position: 'absolute', left: 680, top: 40}}><Story at={0.2} /></div>
		<div style={{position: 'absolute', left: 1080, top: 40}}><MenuBoard at={0.2} /></div>
		<div style={{position: 'absolute', left: 1540, top: 40}}><Sticker at={0.3} /></div>
		<div style={{position: 'absolute', left: 680, top: 720}}><BizCards at={0.3} /></div>
		<div style={{position: 'absolute', left: 1540, top: 320}}><BeanBag at={0.3} /></div>
	</AbsoluteFill>
);
