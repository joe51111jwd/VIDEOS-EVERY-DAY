import React from 'react';
import {C, SANS} from '../lib/tokens';
import {Shell, Traffic, WinBox} from '../mac/Window';
import {ICompose, IFormat, IList, ISearch, IShare, ISidebar, ITable, ITrash} from '../mac/icons';

export type NoteDoc = {
	title: string;
	stamp: string;
	list: {title: string; when: string; preview: string}[];
	blocks: ({k: 'p'; text: string; hl?: boolean} | {k: 'h'; text: string} | {k: 'todo'; text: string; done?: boolean})[];
};

const Check: React.FC<{done?: boolean}> = ({done}) => (
	<div style={{width: 18, height: 18, borderRadius: 18, flexShrink: 0, marginTop: 2, border: done ? 'none' : '1.5px solid #6B6B72', background: done ? '#E3A82B' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		{done ? (
			<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1C1300" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
				<path d="M5 12.5l4.5 4.5L19 7" />
			</svg>
		) : null}
	</div>
);

/** Apple Notes (dark): note list + editor */
export const Notes: React.FC<{box: WinBox; doc: NoteDoc; focused?: boolean; listW?: number; hl?: number}> = ({box, doc, focused, listW = 236, hl = 1}) => (
	<Shell box={box} bg="#1E1E1E">
		{/* list pane */}
		<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: listW, background: '#262628', borderRight: '1px solid rgba(0,0,0,0.5)', fontFamily: SANS}}>
			<div style={{position: 'absolute', left: 18, top: 20}}>
				<Traffic active={focused} />
			</div>
			<div style={{position: 'absolute', right: 14, top: 17, color: '#8E8E94'}}>
				<ISidebar s={18} />
			</div>
			<div style={{position: 'absolute', left: 16, top: 56, fontSize: 11.5, fontWeight: 650, color: '#8E8E94'}}>Today</div>
			{doc.list.map((n, i) => (
				<div key={i} style={{position: 'absolute', left: 8, right: 8, top: 74 + i * 64, height: 58, borderRadius: 8, background: i === 0 ? (focused ? '#B78316' : '#4A4A4E') : 'transparent', padding: '8px 10px', boxSizing: 'border-box'}}>
					<div style={{fontSize: 13.5, fontWeight: 650, color: '#F2F2F4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n.title}</div>
					<div style={{fontSize: 12, color: i === 0 ? 'rgba(255,255,255,0.78)' : '#8E8E94', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 3}}>
						<span style={{fontWeight: 600, color: i === 0 ? '#fff' : '#B9B9BE'}}>{n.when}</span>&nbsp;&nbsp;{n.preview}
					</div>
					{i > 0 ? <div style={{position: 'absolute', left: 10, right: 0, bottom: -3, height: 1, background: 'rgba(255,255,255,0.07)'}} /> : null}
				</div>
			))}
		</div>
		{/* editor toolbar */}
		<div style={{position: 'absolute', left: listW, right: 0, top: 0, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 20, paddingRight: 18, color: '#8E8E94'}}>
			<ICompose s={18} />
			<IFormat s={18} />
			<IList s={18} />
			<ITable s={18} />
			<IShare s={18} />
			<ISearch s={18} />
		</div>
		{/* note */}
		<div style={{position: 'absolute', left: listW + 34, right: 30, top: 58, fontFamily: SANS, color: '#EAEAEC'}}>
			<div style={{textAlign: 'center', fontSize: 11.5, color: '#7D7D84', fontWeight: 500, marginBottom: 14}}>{doc.stamp}</div>
			<div style={{fontSize: 25, fontWeight: 750, letterSpacing: '-0.02em', marginBottom: 12, color: '#F5F5F7'}}>{doc.title}</div>
			{doc.blocks.map((b, i) => {
				if (b.k === 'h') return <div key={i} style={{fontSize: 16.5, fontWeight: 700, margin: '14px 0 6px'}}>{b.text}</div>;
				if (b.k === 'todo')
					return (
						<div key={i} style={{display: 'flex', gap: 10, fontSize: 14.5, lineHeight: 1.45, margin: '5px 0', color: b.done ? '#8E8E94' : '#EAEAEC', textDecoration: b.done ? 'line-through' : 'none', textDecorationColor: '#6E6E74'}}>
							<Check done={b.done} />
							<span>{b.text}</span>
						</div>
					);
				return (
					<div key={i} style={{fontSize: 14.5, lineHeight: 1.55, margin: '7px 0'}}>
						<span style={b.hl ? {background: `rgba(227,168,43,${0.38 * hl})`, borderRadius: 3, boxShadow: `0 0 0 2px rgba(227,168,43,${0.38 * hl})`} : undefined}>{b.text}</span>
					</div>
				);
			})}
		</div>
		<div style={{position: 'absolute', left: listW + 12, bottom: 16, color: '#5E5E64'}}>
			<ITrash s={16} />
		</div>
	</Shell>
);
