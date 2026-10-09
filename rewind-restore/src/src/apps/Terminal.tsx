import React from 'react';
import {MONO, SANS} from '../lib/tokens';
import {Shell, Traffic, WinBox} from '../mac/Window';
import {IBranch} from '../mac/icons';

/** a line is plain text or colored spans: [text, color][] */
export type TLine = string | [string, string][];

export const Terminal: React.FC<{box: WinBox; title: string; lines: TLine[]; focused?: boolean; cursor?: boolean; size?: number; shown?: number}> = ({box, title, lines, focused, cursor = true, size = 13.5, shown}) => {
	const L = lines.slice(0, shown ?? lines.length);
	return (
		<Shell box={box} bg="rgba(22,22,24,0.97)">
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 34, background: '#2A2A2C', borderBottom: '1px solid rgba(0,0,0,0.6)'}}>
				<div style={{position: 'absolute', left: 14, top: 10.5}}>
					<Traffic active={focused} size={12} />
				</div>
				<div style={{textAlign: 'center', lineHeight: '34px', fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: focused ? '#D8D8DC' : '#86868C'}}>{title}</div>
			</div>
			<div style={{position: 'absolute', left: 14, right: 14, top: 44, fontFamily: MONO, fontSize: size, lineHeight: 1.5, color: '#D9D9DE', whiteSpace: 'pre'}}>
				{L.map((ln, i) => (
					<div key={i} style={{height: size * 1.5}}>
						{typeof ln === 'string' ? ln : ln.map(([t, c], j) => <span key={j} style={{color: c}}>{t}</span>)}
						{cursor && i === L.length - 1 ? <span style={{display: 'inline-block', width: size * 0.6, height: size * 1.2, background: '#D9D9DE', verticalAlign: 'middle', marginLeft: 2, opacity: 0.85}} /> : null}
					</div>
				))}
			</div>
		</Shell>
	);
};

/** VS Code-ish editor (dark+) */
export const Code: React.FC<{box: WinBox; file: string; files: string[]; lines: TLine[]; focused?: boolean; first?: number}> = ({box, file, files, lines, focused, first = 1}) => (
	<Shell box={box} bg="#1F1F1F" radius={12}>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 36, background: '#181818', borderBottom: '1px solid #2B2B2B', fontFamily: SANS}}>
			<div style={{position: 'absolute', left: 14, top: 11.5}}>
				<Traffic active={focused} size={12} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 7, margin: '0 auto', width: 360, height: 22, borderRadius: 6, background: '#2A2A2A', border: '1px solid #3A3A3A', color: '#9D9D9D', fontSize: 12, textAlign: 'center', lineHeight: '22px'}}>northstar</div>
		</div>
		{/* activity bar + explorer */}
		<div style={{position: 'absolute', left: 0, top: 36, bottom: 22, width: 46, background: '#181818', borderRight: '1px solid #2B2B2B'}} />
		<div style={{position: 'absolute', left: 46, top: 36, bottom: 22, width: 220, background: '#181818', borderRight: '1px solid #2B2B2B', fontFamily: SANS, fontSize: 12.5, color: '#CCCCCC'}}>
			<div style={{padding: '10px 14px', fontSize: 11, letterSpacing: '0.06em', color: '#9D9D9D'}}>EXPLORER</div>
			{files.map((f, i) => (
				<div key={i} style={{padding: '3px 14px 3px ' + (f.startsWith('  ') ? 34 : 18) + 'px', background: f.trim() === file ? '#37373D' : 'transparent', color: f.endsWith('/') ? '#CCCCCC' : f.trim() === file ? '#FFFFFF' : '#B5B5B5'}}>
					{f.trim()}
				</div>
			))}
		</div>
		{/* tabs */}
		<div style={{position: 'absolute', left: 266, right: 0, top: 36, height: 34, background: '#181818', borderBottom: '1px solid #2B2B2B', fontFamily: SANS, fontSize: 12.5}}>
			<div style={{position: 'absolute', left: 0, top: 0, height: 34, padding: '0 16px', background: '#1F1F1F', color: '#FFFFFF', lineHeight: '34px', borderTop: '1px solid #0078D4'}}>{file}</div>
		</div>
		<div style={{position: 'absolute', left: 266, right: 0, top: 78, fontFamily: MONO, fontSize: 13, lineHeight: '20px', whiteSpace: 'pre'}}>
			{lines.map((ln, i) => (
				<div key={i} style={{display: 'flex'}}>
					<div style={{width: 46, textAlign: 'right', paddingRight: 18, color: '#6E7681'}}>{first + i}</div>
					<div style={{color: '#CCCCCC'}}>{typeof ln === 'string' ? ln : ln.map(([t, c], j) => <span key={j} style={{color: c}}>{t}</span>)}</div>
				</div>
			))}
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 22, background: '#181818', borderTop: '1px solid #2B2B2B', fontFamily: SANS, fontSize: 11.5, color: '#9D9D9D', display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 12}}>
			<span style={{display: 'flex', alignItems: 'center', gap: 4}}><IBranch s={12} />main</span>
			<span>0 errors · 0 warnings</span>
			<span style={{marginLeft: 'auto', marginRight: 14}}>TypeScript React</span>
		</div>
	</Shell>
);
