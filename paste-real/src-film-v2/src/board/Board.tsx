import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {AppIcon, C, CmdGlyph, Grab, Hud, Keycap, Mark, MenuGlyph, Wordmark} from '../brand/brand';
import {BRAND, BRAND_MONO, SYS} from '../lib/tokens';
import {LullAd} from '../film/LullAd';

// Brand board pages (1080 x 1920 stills): identity, icon / colour / type, product language.

const Label: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.graphite, style}) => (
	<div style={{fontFamily: BRAND_MONO, fontSize: 21, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color, ...style}}>{children}</div>
);

const Head: React.FC<{n: string; title: string; color?: string; sub?: string}> = ({n, title, color = C.ink, sub}) => (
	<div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
		<Label color={color === C.ink ? C.graphite : C.mist}>{`${n} — ${title}`}</Label>
		{sub ? <Label color={color === C.ink ? C.graphite : C.mist}>{sub}</Label> : null}
	</div>
);

// ------------------------------------------------------------------ 1. identity
export const Board1: React.FC = () => (
	<AbsoluteFill style={{background: C.paper, padding: 72, boxSizing: 'border-box', fontFamily: BRAND, color: C.ink}}>
		<Head n="01" title="Identity" sub="Paste Real · v1" />
		<div style={{position: 'absolute', left: 72, right: 72, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<Mark size={300} id="b1m" />
			<Wordmark size={150} style={{marginTop: 70}} />
			<div style={{marginTop: 46, fontSize: 50, fontWeight: 500, letterSpacing: '-0.03em', color: C.ink, textAlign: 'center', lineHeight: 1.18}}>
				Copy anything you can see.
				<br />
				<span style={{color: C.signal}}>Paste it real.</span>
			</div>
		</div>
		{/* the mark's idea: a selection becoming a real object */}
		<div style={{position: 'absolute', left: 72, right: 72, top: 1190}}>
			<Label>The mark</Label>
			<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 36}}>
				{[
					[0, 'Selection'],
					[0.45, 'Paste'],
					[1, 'Real'],
				].map(([f, name]) => (
					<div key={name as string} style={{width: 288, height: 330, borderRadius: 36, background: '#fff', boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 18px 40px rgba(20,16,10,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34}}>
						<Mark size={150} fill={f as number} id={`b1s${name}`} />
						<div style={{fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em'}}>{name}</div>
					</div>
				))}
			</div>
			<div style={{marginTop: 40, fontSize: 30, lineHeight: 1.4, color: C.graphite, letterSpacing: '-0.015em', maxWidth: 900}}>
				A dashed selection, the moment it becomes a real object. The last corner stays a selection: what you grabbed is still yours to change.
			</div>
		</div>
		<div style={{position: 'absolute', left: 72, right: 72, bottom: 64, display: 'flex', justifyContent: 'space-between'}}>
			<Label>Coming to Mac</Label>
			<Label>v1 · Oct 2026</Label>
		</div>
	</AbsoluteFill>
);

// ------------------------------------------------------------------ 2. icon, colour, type
const SWATCHES: [string, string, string, string][] = [
	['Signal', C.signal, '#fff', 'The paste. Used once per screen.'],
	['Ink', C.ink, '#fff', 'Type and UI'],
	['Paper', C.paper, C.ink, 'Backgrounds'],
	['Graphite', C.graphite, '#fff', 'Secondary text'],
	['Tint', C.tint, C.ink, 'Selection wash'],
	['Mist', C.mist, C.ink, 'Hairlines, meta'],
];

export const Board2: React.FC<{icon?: string}> = ({icon = 'img/icon_hero.png'}) => (
	<AbsoluteFill style={{background: C.paper, padding: 72, boxSizing: 'border-box', fontFamily: BRAND, color: C.ink}}>
		<Head n="02" title="Icon, colour, type" />
		{/* hero icon */}
		<div style={{position: 'absolute', left: 0, right: 0, top: 110, height: 640, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Img src={staticFile(icon)} style={{width: 640, height: 640, objectFit: 'contain'}} />
		</div>
		{/* sizes + menu bar */}
		<div style={{position: 'absolute', left: 72, right: 72, top: 760, display: 'flex', alignItems: 'flex-end', gap: 44}}>
			<AppIcon size={150} />
			<AppIcon size={96} />
			<AppIcon size={56} />
			<div style={{marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
				<div style={{height: 58, padding: '0 22px', borderRadius: 16, background: 'linear-gradient(90deg,#E7A88E,#9C7FB6)', display: 'flex', alignItems: 'center', gap: 24, color: '#fff', fontFamily: SYS, fontSize: 21, fontWeight: 500}}>
					<div style={{width: 46, height: 38, borderRadius: 9, background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<MenuGlyph size={28} />
					</div>
					<svg width={34} height={17} viewBox="0 0 26 13">
						<rect x={0.8} y={0.8} width={21.4} height={11.4} rx={3.4} stroke="#fff" strokeWidth={1.3} fill="none" opacity={0.6} />
						<rect x={2.6} y={2.6} width={15} height={7.8} rx={1.8} fill="#fff" />
					</svg>
					<span>Wed 9:41</span>
				</div>
				<Label>Menu bar</Label>
			</div>
		</div>
		{/* colour */}
		<div style={{position: 'absolute', left: 72, right: 72, top: 990}}>
			<Label>Colour</Label>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 28}}>
				{SWATCHES.map(([name, bg, fg, use], i) => (
					<div key={name} style={{height: 214, borderRadius: 28, background: bg, color: fg, padding: 26, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: bg === C.paper ? 'inset 0 0 0 2px rgba(12,12,14,0.08)' : undefined}}>
						<div style={{fontSize: 32, fontWeight: 600, letterSpacing: '-0.025em'}}>{name}</div>
						<div>
							<div style={{fontFamily: BRAND_MONO, fontSize: 20, opacity: 0.85}}>{bg.toUpperCase()}</div>
							<div style={{fontSize: 18, opacity: 0.75, marginTop: 6, lineHeight: 1.3}}>{use}</div>
						</div>
					</div>
				))}
			</div>
		</div>
		{/* type */}
		<div style={{position: 'absolute', left: 72, right: 72, top: 1560, display: 'flex', gap: 40}}>
			<div style={{flex: 1.25}}>
				<Label>Type · Geist</Label>
				<div style={{fontSize: 150, fontWeight: 600, letterSpacing: '-0.05em', lineHeight: 1, marginTop: 18}}>Aa</div>
				<div style={{fontSize: 28, color: C.graphite, marginTop: 14, letterSpacing: '-0.015em', lineHeight: 1.35}}>Headlines tight, sentences short.</div>
			</div>
			<div style={{flex: 1}}>
				<Label>Data · Geist Mono</Label>
				<div style={{fontFamily: BRAND_MONO, fontSize: 30, lineHeight: 1.6, marginTop: 26}}>
					⌘C · 8 layers
					<br />
					1080 × 1350
					<br />
					<span style={{color: C.signal}}>Pasted.</span>
				</div>
			</div>
		</div>
	</AbsoluteFill>
);

// ------------------------------------------------------------------ 3. product language
export const Board3: React.FC = () => (
	<AbsoluteFill style={{background: C.ink, padding: 72, boxSizing: 'border-box', fontFamily: BRAND, color: '#fff'}}>
		<Head n="03" title="In the product" color="#fff" />
		{/* the grab */}
		<div style={{position: 'absolute', left: 72, top: 150}}>
			<Label color={C.mist}>The grab</Label>
		</div>
		<div style={{position: 'absolute', left: 290, top: 236, width: 500, height: 625, borderRadius: 4, overflow: 'visible'}}>
			<div style={{width: 500, height: 625, overflow: 'hidden', borderRadius: 4}}>
				<div style={{transform: `scale(${500 / 1080})`, transformOrigin: '0 0'}}>
					<LullAd />
				</div>
			</div>
			<div style={{position: 'absolute', left: 0, top: 0}}>
				<Grab w={500} h={625} show={1} march={0} fill={0} flash={0} tag="Design · 8 layers" radius={4} scale={1.1} />
			</div>
		</div>
		{/* the keystroke pill */}
		<div style={{position: 'absolute', left: 72, top: 940}}>
			<Label color={C.mist}>The keystroke</Label>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
			<Hud s={{key: 'C', show: 1, down: 0, done: 1, label: '', doneLabel: 'Copied as a design', detail: '8 layers'}} />
			<Hud s={{key: 'V', show: 1, down: 0, done: 1, label: '', doneLabel: 'Pasted as Figma layers'}} />
		</div>
		{/* keys */}
		<div style={{position: 'absolute', left: 72, top: 1330}}>
			<Label color={C.mist}>One shortcut</Label>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 1400, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
			<Keycap size={150} label={<CmdGlyph size={66} />} />
			<div style={{fontSize: 60, color: C.mist, fontWeight: 300}}>+</div>
			<Keycap size={150} label={<span style={{fontFamily: SYS, fontWeight: 500, fontSize: 68}}>C</span>} />
			<div style={{width: 60}} />
			<Keycap size={150} label={<CmdGlyph size={66} />} />
			<div style={{fontSize: 60, color: C.mist, fontWeight: 300}}>+</div>
			<Keycap size={150} label={<span style={{fontFamily: SYS, fontWeight: 500, fontSize: 68}}>V</span>} />
		</div>
		{/* voice */}
		<div style={{position: 'absolute', left: 72, right: 72, bottom: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
			<div style={{fontSize: 44, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.15}}>
				Copy anything you can see.
				<br />
				<span style={{color: C.signal}}>Paste it real.</span>
			</div>
			<Label color={C.mist} style={{textAlign: 'right', lineHeight: 1.6}}>
				Show, don't tell
				<br />
				Every layer real
				<br />
				One shortcut
			</Label>
		</div>
	</AbsoluteFill>
);
