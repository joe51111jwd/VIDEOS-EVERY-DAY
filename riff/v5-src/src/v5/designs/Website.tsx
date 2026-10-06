import React from 'react';
import {Appear, DevImg, HalfMark, Sel, useT} from './kit';
import {clamp01, easeInOut, img, lerp, palAt, SANS, SERIF, step} from '../tokens';

export const SITE_W = 1440;
export const SITE_H = 900;

export type SiteTL = {
	nav?: number;
	eyebrow?: number;
	head?: number;
	body?: number;
	ctas?: number;
	image?: number;
	card?: number;
	pill?: number;
	warm?: number;
	big?: number;
	menu?: number;
	sel?: boolean; // show Riff selection flashes
};

const MENU = [
	{name: 'Flat white', desc: 'Double ristretto, silky milk', price: '4.75', src: 'top_flatwhite.png'},
	{name: 'Cappuccino', desc: 'Equal parts, a little cocoa', price: '4.50', src: 'top_cappuccino.png'},
	{name: 'Cortado', desc: 'Short, strong, just enough milk', price: '4.25', src: 'top_cortado.png'},
	{name: 'Espresso', desc: 'Guji single origin, 18g in', price: '3.50', src: 'top_espresso.png'},
];

export const Website: React.FC<{tl: SiteTL; scale?: number}> = ({tl}) => {
	const t = useT();
	const w = tl.warm === undefined ? 1 : step(t, tl.warm, 0.7, easeInOut);
	const P = palAt(w);
	const big = tl.big === undefined ? 0 : step(t, tl.big, 0.6, easeInOut);
	const headSize = lerp(84, 118, big);
	const scroll = tl.menu === undefined ? 0 : 760 * step(t, tl.menu, 1.0, easeInOut);
	const sel = tl.sel !== false;
	const S = (at: number | undefined) => (sel ? at : undefined);

	return (
		<div style={{width: SITE_W, height: SITE_H, position: 'relative', overflow: 'hidden', background: P.bg, fontFamily: SANS, color: P.ink}}>
			{/* page */}
			<div style={{position: 'absolute', left: 0, top: -scroll, width: SITE_W}}>
				{/* hero */}
				<div style={{position: 'relative', height: SITE_H}}>
					<div style={{position: 'absolute', left: 80, top: 176 - big * 16, width: 640}}>
						<Appear at={tl.eyebrow} kind="fade" style={{position: 'relative', display: 'inline-block'}}>
							<div style={{fontSize: 12.5, fontWeight: 600, letterSpacing: '0.18em', color: P.accent, textTransform: 'uppercase'}}>
								Small-batch roastery · 4th Street
							</div>
						</Appear>
						<div style={{position: 'relative', marginTop: 26}}>
							{['Coffee for', 'slow', 'mornings.'].map((line, i) => (
								<div key={i} style={{overflow: 'hidden', paddingBottom: 2, marginBottom: -headSize * 0.06}}>
									<Appear at={tl.head === undefined ? undefined : tl.head + i * 0.09} dur={0.7} kind="rise" dist={headSize * 0.7}>
										<div
											style={{
												fontFamily: SERIF,
												fontSize: headSize,
												lineHeight: 0.98,
												letterSpacing: '-0.035em',
												fontWeight: 360,
												fontVariationSettings: `'opsz' 144, 'SOFT' 60, 'WONK' 0`,
												fontStyle: i === 1 ? 'italic' : 'normal',
												color: i === 1 ? P.accent : P.ink,
												whiteSpace: 'nowrap',
											}}
										>
											{line}
										</div>
									</Appear>
								</div>
							))}
							<Sel at={S(tl.head)} label="Headline" />
							<Sel at={S(tl.big)} label="Headline · 118 pt" />
						</div>
						<Appear at={tl.body} style={{position: 'relative', marginTop: 30, width: 450}}>
							<div style={{fontSize: 18.5, lineHeight: 1.6, color: P.sub}}>
								Single-origin roasts, warm pastries and a quiet corner on 4th Street. Open every day from 7.
							</div>
						</Appear>
						<Appear at={tl.ctas} style={{position: 'relative', display: 'flex', gap: 14, marginTop: 38}}>
							<div
								style={{
									height: 58,
									padding: '0 30px',
									borderRadius: 29,
									background: P.accent,
									color: P.onAccent,
									display: 'flex',
									alignItems: 'center',
									fontSize: 16,
									fontWeight: 600,
									letterSpacing: '-0.005em',
								}}
							>
								Order ahead
							</div>
							<div
								style={{
									height: 58,
									padding: '0 28px',
									borderRadius: 29,
									border: `1.5px solid ${P.line}`,
									display: 'flex',
									alignItems: 'center',
									gap: 10,
									fontSize: 16,
									fontWeight: 600,
								}}
							>
								View the menu
								<svg width={16} height={16} viewBox="0 0 16 16">
									<path d="M3 8h9M8.5 4l4 4-4 4" stroke={P.ink} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
							<Sel at={S(tl.ctas)} label="Buttons" />
						</Appear>
					</div>
					{/* hero image */}
					<div style={{position: 'absolute', left: 772, top: 118, width: 590, height: 730}}>
						<DevImg at={tl.image} src={img('hero_cool.png')} pos="50% 55%" style={{position: 'absolute', inset: 0, borderRadius: 30}} />
						<div style={{position: 'absolute', inset: 0, opacity: w, borderRadius: 30, overflow: 'hidden'}}>
							<DevImg at={tl.image} src={img('hero_warm.png')} pos="50% 55%" style={{position: 'absolute', inset: 0, borderRadius: 30}} />
						</div>
						<Sel at={S(tl.image)} label="Image" radius={34} />
						{/* open pill */}
						<Appear at={tl.pill} kind="pop" style={{position: 'absolute', right: 22, top: 22}}>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 9,
									padding: '10px 16px',
									borderRadius: 22,
									background: 'rgba(255,255,255,0.72)',
									backdropFilter: 'blur(14px)',
									fontSize: 13.5,
									fontWeight: 600,
									color: '#2A1A10',
									boxShadow: '0 6px 20px rgba(40,20,5,0.12)',
								}}
							>
								<div style={{width: 8, height: 8, borderRadius: 4, background: '#3DAA6A', boxShadow: '0 0 0 3px rgba(61,170,106,0.2)'}} />
								Open now · until 3 pm
							</div>
						</Appear>
						{/* roast card */}
						<Appear at={tl.card} kind="rise" style={{position: 'absolute', left: -58, bottom: 46}}>
							<div
								style={{
									width: 318,
									padding: '18px 20px',
									borderRadius: 24,
									background: 'rgba(255,252,247,0.82)',
									backdropFilter: 'blur(18px)',
									boxShadow: '0 18px 50px rgba(40,20,5,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)',
									display: 'flex',
									gap: 16,
									alignItems: 'center',
									color: '#2A1A10',
								}}
							>
								<div style={{width: 58, height: 58, borderRadius: 16, background: `linear-gradient(160deg, #C9875F, #9A5233)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<HalfMark size={26} color="#FBF3E8" />
								</div>
								<div>
									<div style={{fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: '#8A6E5A', textTransform: 'uppercase'}}>Today’s roast</div>
									<div style={{fontFamily: SERIF, fontSize: 23, fontWeight: 450, letterSpacing: '-0.015em', marginTop: 3, fontVariationSettings: `'opsz' 48, 'SOFT' 50`}}>
										Ethiopia Guji
									</div>
									<div style={{fontSize: 13.5, color: '#7A6352', marginTop: 2}}>Peach · jasmine · honey</div>
								</div>
							</div>
						</Appear>
					</div>
				</div>
				{/* menu section */}
				<div style={{position: 'relative', padding: '80px 80px 0'}}>
					<Appear at={tl.menu === undefined ? undefined : tl.menu + 0.25} style={{position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
						<div>
							<div style={{fontFamily: SERIF, fontSize: 64, fontWeight: 360, letterSpacing: '-0.03em', fontVariationSettings: `'opsz' 144, 'SOFT' 60`, lineHeight: 1}}>
								The menu
							</div>
							<div style={{fontSize: 18, color: P.sub, marginTop: 12}}>Roasted on Tuesdays. Pulled to order.</div>
						</div>
						<div style={{fontSize: 16, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 8}}>
							Full menu
							<svg width={16} height={16} viewBox="0 0 16 16">
								<path d="M3 8h9M8.5 4l4 4-4 4" stroke={P.ink} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
					</Appear>
					<div style={{display: 'flex', gap: 24, marginTop: 38}}>
						{MENU.map((m, i) => {
							const at = tl.menu === undefined ? undefined : tl.menu + 0.45 + i * 0.1;
							return (
								<Appear key={m.name} at={at} kind="rise" dist={40} style={{position: 'relative', width: 302}}>
									<DevImg at={at} src={img(m.src)} style={{width: 302, height: 302, borderRadius: 24}} />
									<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18}}>
										<div style={{fontFamily: SERIF, fontSize: 25, fontWeight: 430, letterSpacing: '-0.015em', fontVariationSettings: `'opsz' 48, 'SOFT' 50`}}>
											{m.name}
										</div>
										<div style={{fontSize: 16, fontWeight: 600}}>${m.price}</div>
									</div>
									<div style={{fontSize: 14.5, color: P.sub, marginTop: 6}}>{m.desc}</div>
									{i === 0 ? <Sel at={S(at)} label="Menu card" /> : null}
								</Appear>
							);
						})}
					</div>
				</div>
			</div>
			{/* sticky nav */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: SITE_W,
					height: 92,
					display: 'flex',
					alignItems: 'center',
					padding: '0 80px',
					boxSizing: 'border-box',
					background: scroll > 4 ? `${P.bg}E6` : 'transparent',
					backdropFilter: scroll > 4 ? 'blur(16px)' : undefined,
					borderBottom: scroll > 4 ? `1px solid ${P.line}` : '1px solid transparent',
				}}
			>
				<Appear at={tl.nav} kind="fade" style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 12}}>
					<HalfMark size={30} color={P.ink} />
					<div style={{fontFamily: SERIF, fontSize: 27, fontWeight: 560, letterSpacing: '-0.02em', fontVariationSettings: `'opsz' 72, 'SOFT' 100`}}>Halfmoon</div>
					<Sel at={S(tl.nav)} label="Logo" />
				</Appear>
				<Appear at={tl.nav === undefined ? undefined : tl.nav + 0.12} kind="fade" style={{display: 'flex', gap: 40, marginLeft: 'auto', marginRight: 'auto', fontSize: 15.5, fontWeight: 500, color: P.sub}}>
					{['Menu', 'Visit', 'Shop beans', 'Journal'].map((x) => (
						<div key={x}>{x}</div>
					))}
				</Appear>
				<Appear at={tl.nav === undefined ? undefined : tl.nav + 0.22} kind="fade" style={{display: 'flex', gap: 12, alignItems: 'center'}}>
					<div style={{width: 46, height: 46, borderRadius: 23, border: `1.5px solid ${P.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<svg width={18} height={18} viewBox="0 0 18 18">
							<path d="M3.5 6.5h11l-1 9h-9z" stroke={P.ink} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
							<path d="M6.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" stroke={P.ink} strokeWidth={1.5} fill="none" />
						</svg>
					</div>
					<div style={{height: 46, padding: '0 22px', borderRadius: 23, background: P.ink, color: P.bg, display: 'flex', alignItems: 'center', fontSize: 15, fontWeight: 600}}>
						Order ahead
					</div>
				</Appear>
			</div>
		</div>
	);
};
