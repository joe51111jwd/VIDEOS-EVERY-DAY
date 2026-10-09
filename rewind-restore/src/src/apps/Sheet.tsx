import React from 'react';
import {C, SANS} from '../lib/tokens';
import {Shell, Traffic, WinBox} from '../mac/Window';
import {IChart, IComment, IMedia, IShape, IShare, IText, ITable} from '../mac/icons';

export type SheetDoc = {
	file: string;
	tabs: string[];
	title: string;
	cols: {h: string; w: number; align?: 'left' | 'right'}[];
	rows: string[][];
	total?: string[];
	sel?: [number, number]; // row, col of the selected cell
	bars?: number[]; // optional little chart under the table (0..1)
};

/** Numbers (dark) */
export const Sheet: React.FC<{box: WinBox; doc: SheetDoc; focused?: boolean}> = ({box, doc, focused}) => {
	const rowH = 30;
	const x0 = 44;
	return (
		<Shell box={box} bg="#1C1C1E">
			{/* toolbar */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: '#2A2A2C', borderBottom: '1px solid rgba(0,0,0,0.6)', fontFamily: SANS}}>
				<div style={{position: 'absolute', left: 18, top: 14}}>
					<Traffic active={focused} />
				</div>
				<div style={{position: 'absolute', left: 92, top: 9, fontSize: 13.5, fontWeight: 650, color: focused ? '#EDEDF0' : '#8E8E94'}}>{doc.file}</div>
				<div style={{position: 'absolute', left: 92, top: 27, fontSize: 11.5, color: '#7C7C84'}}>Edited</div>
				<div style={{position: 'absolute', right: 18, top: 12, display: 'flex', gap: 18, color: '#A1A1A8'}}>
					{[ITable, IChart, IText, IShape, IMedia, IComment, IShare].map((I, i) => (
						<div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3}}>
							<I s={19} />
						</div>
					))}
				</div>
			</div>
			{/* sheet tabs */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 64, height: 32, background: '#232325', borderBottom: '1px solid rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', paddingLeft: 40, gap: 4, fontFamily: SANS}}>
				{doc.tabs.map((s, i) => (
					<div key={i} style={{padding: '6px 16px', fontSize: 12.5, fontWeight: i === 0 ? 650 : 500, color: i === 0 ? '#F0F0F2' : '#8E8E94', background: i === 0 ? '#1C1C1E' : 'transparent', borderRadius: '7px 7px 0 0'}}>
						{s}
					</div>
				))}
			</div>
			{/* table */}
			<div style={{position: 'absolute', left: x0, top: 118, fontFamily: SANS}}>
				<div style={{fontSize: 19, fontWeight: 700, color: '#F2F2F4', marginBottom: 10, letterSpacing: '-0.01em'}}>{doc.title}</div>
				<div style={{position: 'relative', border: '1px solid #3A3A3D'}}>
					{[doc.cols.map((c) => c.h), ...doc.rows, ...(doc.total ? [doc.total] : [])].map((r, ri) => {
						const head = ri === 0;
						const tot = doc.total && ri === doc.rows.length + 1;
						return (
							<div key={ri} style={{display: 'flex', height: rowH, background: head ? '#2C2C2F' : tot ? '#27272A' : ri % 2 ? '#1C1C1E' : '#212123', borderTop: ri ? '1px solid #2F2F32' : 'none'}}>
								{r.map((v, ci) => {
									const sel = doc.sel && doc.sel[0] === ri && doc.sel[1] === ci;
									return (
										<div
											key={ci}
											style={{
												width: doc.cols[ci].w,
												boxSizing: 'border-box',
												padding: '0 10px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: doc.cols[ci].align === 'right' && !head ? 'flex-end' : 'flex-start',
												fontSize: 13.5,
												fontWeight: head || tot ? 650 : 450,
												color: head ? '#CFCFD4' : '#E8E8EB',
												borderLeft: ci ? '1px solid #2F2F32' : 'none',
												fontVariantNumeric: 'tabular-nums',
												position: 'relative',
												whiteSpace: 'nowrap',
											}}
										>
											{v}
											{sel ? <div style={{position: 'absolute', inset: -1, border: `2.5px solid ${C.blue}`, borderRadius: 2}} /> : null}
										</div>
									);
								})}
							</div>
						);
					})}
				</div>
				{doc.bars ? (
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 100, marginTop: 18, paddingLeft: 6}}>
						{doc.bars.map((b, i) => (
							<div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
								<div style={{width: 46, height: 84 * b, borderRadius: '5px 5px 0 0', background: i === doc.bars!.length - 1 ? 'linear-gradient(180deg,#5AC8FA,#0A84FF)' : '#3A6EA8'}} />
								<div style={{fontSize: 11, color: '#8E8E94'}}>{['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</div>
							</div>
						))}
					</div>
				) : null}
			</div>
		</Shell>
	);
};
