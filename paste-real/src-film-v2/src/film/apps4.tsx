import React from 'react';
import {SYS} from '../lib/tokens';

// Montage apps (each drawn as a 540 x 318 pt band): Google Slides, Canva, Google Sheets, and what lands in them.

const TIGHT = 'Inter Tight';
export const BAND = {w: 540, h: 318};

const Menus: React.FC<{items: string[]; color?: string}> = ({items, color = '#444746'}) => (
	<div style={{display: 'flex', gap: 9, fontSize: 8.5, color}}>
		{items.map((m) => (
			<span key={m}>{m}</span>
		))}
	</div>
);

const ToolIcons: React.FC<{n: number; color?: string}> = ({n, color = '#444746'}) => (
	<>
		{Array.from({length: n}).map((_, i) => (
			<div key={i} style={{width: 11, height: 11, borderRadius: i % 4 === 0 ? 6 : 2, border: `1.3px solid ${color}`, opacity: 0.75, boxSizing: 'border-box', flexShrink: 0}} />
		))}
	</>
);

// ================================================================== Google Slides
export const SLIDES = {chrome: 62, strip: 78};
export const SLIDE_RECT = {x: SLIDES.strip + 31, y: SLIDES.chrome + 14, w: 400, h: 225};

export const QuoteSlide: React.FC<{w?: number}> = ({w = 1600}) => {
	const k = w / 1600;
	return (
		<div style={{position: 'relative', width: 1600, height: 900, background: '#FBF7F0', overflow: 'hidden', fontFamily: TIGHT, transform: `scale(${k})`, transformOrigin: '0 0'}}>
			<div style={{position: 'absolute', left: 120, top: 120, width: 72, height: 72, borderRadius: 18, background: '#1F3D2B', color: '#FBF7F0', fontSize: 64, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1}}>“</div>
			<div style={{position: 'absolute', left: 120, top: 250, width: 1100, fontSize: 104, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.02, color: '#1F3D2B'}}>It paid for itself in the first week.</div>
			<div style={{position: 'absolute', left: 120, top: 640, display: 'flex', alignItems: 'center', gap: 28}}>
				<div style={{width: 96, height: 96, borderRadius: 48, background: 'linear-gradient(135deg,#E7B98F,#A8694A)'}} />
				<div>
					<div style={{fontSize: 40, fontWeight: 600, color: '#1F3D2B'}}>Maya Chen</div>
					<div style={{fontSize: 32, color: '#6D7A70', marginTop: 4}}>Head of Ops, Brightline</div>
				</div>
			</div>
			<div style={{position: 'absolute', right: 120, bottom: 110, width: 220, height: 220, borderRadius: 110, background: '#E9DFC9'}} />
			<div style={{position: 'absolute', right: 190, bottom: 180, width: 120, height: 120, borderRadius: 60, background: '#D9653B'}} />
		</div>
	);
};
/** the quote slide's elements (slide px), for the selection sweep */
export const QUOTE_PARTS = [
	{x: 112, y: 112, w: 88, h: 88},
	{x: 112, y: 244, w: 1110, h: 230},
	{x: 112, y: 630, w: 120, h: 116},
	{x: 236, y: 636, w: 420, h: 110},
	{x: 1250, y: 560, w: 236, h: 236},
];

export const SlidesBand: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<div style={{position: 'relative', width: BAND.w, height: BAND.h, background: '#F9FBFD', overflow: 'hidden', fontFamily: SYS, color: '#1F1F1F'}}>
		<div style={{position: 'absolute', left: 0, top: 0, width: BAND.w, height: 36, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', background: '#F9FBFD'}}>
			<div style={{width: 18, height: 24, borderRadius: 3, background: '#F4B400', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: 10, height: 7, borderRadius: 1, border: '1.4px solid #fff'}} />
			</div>
			<div>
				<div style={{fontSize: 11, fontWeight: 500}}>Q4 pitch</div>
				<Menus items={['File', 'Edit', 'View', 'Insert', 'Format', 'Slide', 'Arrange', 'Tools']} />
			</div>
			<div style={{marginLeft: 'auto', height: 22, padding: '0 10px', borderRadius: 11, border: '1px solid #747775', fontSize: 9.5, display: 'flex', alignItems: 'center', gap: 4}}>▶ Slideshow</div>
			<div style={{height: 22, padding: '0 12px', borderRadius: 11, background: '#C2E7FF', fontSize: 9.5, fontWeight: 600, display: 'flex', alignItems: 'center'}}>Share</div>
			<div style={{width: 20, height: 20, borderRadius: 10, background: 'linear-gradient(135deg,#FF8A4C,#E8336F)'}} />
		</div>
		<div style={{position: 'absolute', left: 10, right: 10, top: 38, height: 20, borderRadius: 10, background: '#EDF2FA', display: 'flex', alignItems: 'center', gap: 9, padding: '0 10px'}}>
			<ToolIcons n={18} />
		</div>
		{/* filmstrip */}
		<div style={{position: 'absolute', left: 0, top: SLIDES.chrome, width: SLIDES.strip, bottom: 0}}>
			{[0, 1, 2, 3].map((i) => (
				<div key={i} style={{position: 'absolute', left: 8, top: 10 + i * 46, display: 'flex', gap: 4, alignItems: 'flex-start'}}>
					<div style={{fontSize: 7.5, color: '#5F6368', width: 8, textAlign: 'right'}}>{i + 3}</div>
					<div style={{width: 58, height: 32.6, borderRadius: 3, background: i === 1 ? '#FBF7F0' : '#fff', boxShadow: i === 1 ? '0 0 0 2px #1A73E8' : '0 0 0 0.5px #C4C7C5', overflow: 'hidden'}}>
						{i === 0 ? <div style={{margin: '7px 6px', height: 4, width: 34, background: '#1F3D2B', opacity: 0.6}} /> : null}
						{i === 2 ? <div style={{margin: '7px 6px', height: 4, width: 26, background: '#5F6368', opacity: 0.5}} /> : null}
					</div>
				</div>
			))}
		</div>
		{/* the slide */}
		<div style={{position: 'absolute', left: SLIDE_RECT.x, top: SLIDE_RECT.y, width: SLIDE_RECT.w, height: SLIDE_RECT.h, background: '#fff', boxShadow: '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)', overflow: 'hidden'}}>{children}</div>
		<div style={{position: 'absolute', left: SLIDE_RECT.x, top: SLIDE_RECT.y + SLIDE_RECT.h + 12, width: SLIDE_RECT.w, height: 40, borderTop: '1px solid #DADCE0', fontSize: 8.5, color: '#80868B', paddingTop: 8}}>Click to add speaker notes</div>
	</div>
);

// ================================================================== Canva
export const CANVA = {top: 34, rail: 52};
export const POST_RECT = {x: CANVA.rail + 126, y: CANVA.top + 20, w: 236, h: 236};

export const PosterDesign: React.FC<{w?: number}> = ({w = 1080}) => (
	<div style={{position: 'relative', width: 1080, height: 1080, background: '#F2E8D5', overflow: 'hidden', transform: `scale(${w / 1080})`, transformOrigin: '0 0', fontFamily: TIGHT}}>
		<div style={{position: 'absolute', left: 520, top: -120, width: 760, height: 760, borderRadius: 380, background: '#E4462B'}} />
		<div style={{position: 'absolute', left: 80, top: 96, fontSize: 40, fontWeight: 700, letterSpacing: '0.2em', color: '#1B1B1B'}}>FRI · 7 PM</div>
		<div style={{position: 'absolute', left: 72, top: 420, fontFamily: 'Archivo', fontStretch: '70%', fontSize: 250, fontWeight: 900, lineHeight: 0.84, letterSpacing: '-0.01em', color: '#1B1B1B'}}>
			OPEN
			<br />
			STUDIO
		</div>
		<div style={{position: 'absolute', left: 80, bottom: 90, fontSize: 36, fontWeight: 600, color: '#1B1B1B'}}>Prints, music, free drinks</div>
		<div style={{position: 'absolute', right: 80, bottom: 84, height: 64, padding: '0 30px', borderRadius: 32, background: '#1B1B1B', color: '#F2E8D5', fontSize: 30, fontWeight: 600, display: 'flex', alignItems: 'center'}}>RSVP</div>
	</div>
);
export const POSTER_PARTS = [
	{x: 520, y: 0, w: 560, h: 640},
	{x: 72, y: 88, w: 330, h: 64},
	{x: 64, y: 410, w: 680, h: 430},
	{x: 72, y: 930, w: 520, h: 64},
	{x: 830, y: 920, w: 180, h: 80},
];

export const CanvaBand: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<div style={{position: 'relative', width: BAND.w, height: BAND.h, background: '#EBECF0', overflow: 'hidden', fontFamily: SYS}}>
		<div style={{position: 'absolute', left: 0, top: 0, width: BAND.w, height: CANVA.top, background: 'linear-gradient(90deg,#1FB5C4,#5A5CE6 60%,#7B3FE4)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px', color: '#fff', fontSize: 9.5, fontWeight: 500}}>
			<span style={{fontWeight: 700, fontSize: 11}}>Canva</span>
			<span>File</span>
			<span>Resize</span>
			<span>✎ Editing</span>
			<span style={{marginLeft: 'auto', opacity: 0.9}}>Open Studio poster</span>
			<div style={{height: 22, padding: '0 12px', borderRadius: 6, background: '#fff', color: '#0E1318', fontWeight: 600, display: 'flex', alignItems: 'center'}}>Share</div>
		</div>
		<div style={{position: 'absolute', left: 0, top: CANVA.top, width: CANVA.rail, bottom: 0, background: '#18191B', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, gap: 13}}>
			{['Design', 'Elements', 'Text', 'Brand', 'Uploads', 'Apps'].map((l, i) => (
				<div key={l} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 7, color: i === 1 ? '#fff' : '#B8BCC2'}}>
					<div style={{width: 14, height: 14, borderRadius: i === 2 ? 2 : 5, border: '1.4px solid currentColor', boxSizing: 'border-box'}} />
					{l}
				</div>
			))}
		</div>
		<div style={{position: 'absolute', left: POST_RECT.x, top: POST_RECT.y, width: POST_RECT.w, height: POST_RECT.h, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', overflow: 'hidden'}}>{children}</div>
		<div style={{position: 'absolute', left: POST_RECT.x, top: POST_RECT.y + POST_RECT.h + 8, fontSize: 8.5, color: '#6B6F76'}}>Page 1 · 1080 × 1080</div>
	</div>
);

// ================================================================== Google Sheets
export const SHEETS = {chrome: 62, fx: 20, head: 16, rowH: 17, rowW: 28, colW: 82};
export const TABLE: string[][] = [
	['Region', 'Q1', 'Q2', 'Q3', 'Growth'],
	['North America', '1.24M', '1.38M', '1.61M', '+16.7%'],
	['Europe', '0.92M', '1.01M', '1.12M', '+10.9%'],
	['Asia Pacific', '0.58M', '0.71M', '0.89M', '+25.4%'],
	['Latin America', '0.21M', '0.26M', '0.30M', '+15.4%'],
	['Total', '2.95M', '3.36M', '3.92M', '+16.7%'],
];

export const SheetsBand: React.FC<{fill: number; sel: number}> = ({fill, sel}) => {
	const gx = SHEETS.rowW,
		gy = SHEETS.chrome + SHEETS.fx + SHEETS.head;
	const cells = TABLE.length * TABLE[0].length;
	return (
		<div style={{position: 'relative', width: BAND.w, height: BAND.h, background: '#fff', overflow: 'hidden', fontFamily: SYS, color: '#1F1F1F'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: BAND.w, height: 36, display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', background: '#F9FBFD'}}>
				<div style={{width: 18, height: 24, borderRadius: 3, background: '#0F9D58', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{width: 10, height: 10, border: '1.4px solid #fff', boxSizing: 'border-box', background: 'linear-gradient(#fff,#fff) 50% 50%/1.4px 100% no-repeat, linear-gradient(#fff,#fff) 50% 50%/100% 1.4px no-repeat'}} />
				</div>
				<div>
					<div style={{fontSize: 11, fontWeight: 500}}>Q3 numbers</div>
					<Menus items={['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Tools', 'Extensions']} />
				</div>
				<div style={{marginLeft: 'auto', height: 22, padding: '0 12px', borderRadius: 11, background: '#C2E7FF', fontSize: 9.5, fontWeight: 600, display: 'flex', alignItems: 'center'}}>Share</div>
				<div style={{width: 20, height: 20, borderRadius: 10, background: 'linear-gradient(135deg,#FF8A4C,#E8336F)'}} />
			</div>
			<div style={{position: 'absolute', left: 10, right: 10, top: 38, height: 20, borderRadius: 10, background: '#EDF2FA', display: 'flex', alignItems: 'center', gap: 9, padding: '0 10px'}}>
				<ToolIcons n={20} />
			</div>
			{/* formula bar */}
			<div style={{position: 'absolute', left: 0, right: 0, top: SHEETS.chrome, height: SHEETS.fx, borderTop: '1px solid #E1E3E1', borderBottom: '1px solid #E1E3E1', display: 'flex', alignItems: 'center', fontSize: 9, color: '#444746'}}>
				<div style={{width: 46, textAlign: 'center', borderRight: '1px solid #E1E3E1'}}>B2</div>
				<div style={{width: 26, textAlign: 'center', color: '#80868B', fontStyle: 'italic', fontFamily: 'Instrument Serif', fontSize: 11}}>fx</div>
				<div>{fill > 0 ? 'North America' : ''}</div>
			</div>
			{/* headers */}
			<div style={{position: 'absolute', left: 0, top: SHEETS.chrome + SHEETS.fx, width: BAND.w, height: SHEETS.head, background: '#F8F9FA', borderBottom: '1px solid #C4C7C5', display: 'flex', fontSize: 8.5, color: '#444746'}}>
				<div style={{width: gx, borderRight: '1px solid #C4C7C5'}} />
				{['A', 'B', 'C', 'D', 'E', 'F'].map((c, i) => (
					<div key={c} style={{width: SHEETS.colW + (i === 0 ? 30 : 0), borderRight: '1px solid #E1E3E1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel > 0 && i < 5 ? '#D3E3FD' : undefined, fontWeight: sel > 0 && i < 5 ? 600 : 400}}>
						{c}
					</div>
				))}
			</div>
			{/* rows */}
			{Array.from({length: 12}).map((_, r) => (
				<div key={r} style={{position: 'absolute', left: 0, top: gy + r * SHEETS.rowH, width: BAND.w, height: SHEETS.rowH, borderBottom: '1px solid #E1E3E1', display: 'flex', fontSize: 9}}>
					<div style={{width: gx, background: sel > 0 && r < TABLE.length ? '#D3E3FD' : '#F8F9FA', borderRight: '1px solid #C4C7C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8.5, color: '#444746'}}>{r + 1}</div>
					{Array.from({length: 6}).map((__, c) => {
						const idx = r * 5 + c;
						const v = r < TABLE.length && c < 5 && fill * cells > idx ? TABLE[r][c] : '';
						const head = r === 0 || r === TABLE.length - 1;
						return (
							<div key={c} style={{width: SHEETS.colW + (c === 0 ? 30 : 0), borderRight: '1px solid #E1E3E1', display: 'flex', alignItems: 'center', justifyContent: c === 0 ? 'flex-start' : 'flex-end', padding: '0 5px', boxSizing: 'border-box', fontWeight: head ? 700 : 400, color: c === 4 && r > 0 && v ? '#137333' : '#1F1F1F', background: r === 0 && v ? '#F1F3F4' : undefined, whiteSpace: 'nowrap'}}>
								{v}
							</div>
						);
					})}
				</div>
			))}
			{/* the pasted range */}
			{sel > 0 ? (
				<div style={{position: 'absolute', left: gx, top: gy, width: SHEETS.colW * 5 + 30, height: SHEETS.rowH * TABLE.length, boxShadow: 'inset 0 0 0 2px #1A73E8', background: 'rgba(26,115,232,0.06)', opacity: sel}}>
					<div style={{position: 'absolute', right: -3, bottom: -3, width: 6, height: 6, background: '#1A73E8', border: '1px solid #fff'}} />
				</div>
			) : null}
		</div>
	);
};
