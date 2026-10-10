import React from 'react';
import {Img, staticFile} from 'remotion';
import {F} from '../lib/theme';

/**
 * Blender 5 (default dark theme) rebuilt at 1920x1080, UI scale ~1.2.
 * The 3D viewport is a real render: Workbench solid shading from bpy (tools/blender/donut.py),
 * with the grid and the orange selection outline drawn from the same camera.
 */
export const BL = {
	top: '#232323',
	header: '#303030',
	region: '#303030',
	panel: '#3D3D3D',
	panelHead: '#3D3D3D',
	field: '#545454',
	fieldDark: '#1D1D1D',
	gap: '#161616',
	text: '#E5E5E5',
	dim: '#A6A6A6',
	blue: '#4772B3',
	selRow: '#334D80',
	outBg: '#282828',
	tl: '#2B2B2B',
	orange: '#FFA028',
};
export const VP = {x: 0, y: 64, w: 1460, h: 840};

export type BStage = 'cube' | 'torus' | 'smooth' | 'icing' | 'color' | 'sprinkles' | 'final';
export type BState = {
	stage: BStage;
	frame: number; // orbit index 0..119
	shading: 'solid' | 'material' | 'rendered';
	active: string; // outliner active object
	objects: string[];
	modifiers: {name: string; icon: 'sub' | 'solid'; levels?: number}[];
	material?: {name: string; color: string} | null;
	tab?: 'mod' | 'mat';
};

const Txt: React.FC<{c?: string; s?: number; w?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({c = BL.text, s = 13.5, w = 450, children, style}) => (
	<span style={{color: c, fontSize: s, fontWeight: w, fontFamily: F.inter, whiteSpace: 'nowrap', ...style}}>{children}</span>
);

// ---------- tiny icon set (simplified Blender glyphs)
const I = {
	mesh: (c = '#F0A060') => (
		<svg width="15" height="15" viewBox="0 0 16 16">
			<path d="M8 1.5 L14 5 L14 11 L8 14.5 L2 11 L2 5 Z" fill="none" stroke={c} strokeWidth="1.4" />
			<path d="M2 5 L8 8.5 L14 5 M8 8.5 L8 14.5" fill="none" stroke={c} strokeWidth="1.2" />
		</svg>
	),
	cam: () => (
		<svg width="15" height="15" viewBox="0 0 16 16">
			<rect x="1.5" y="4" width="9" height="8" rx="1.5" fill="none" stroke="#C99A5A" strokeWidth="1.4" />
			<path d="M10.5 7 L14.5 4.5 L14.5 11.5 L10.5 9" fill="none" stroke="#C99A5A" strokeWidth="1.4" />
		</svg>
	),
	light: () => (
		<svg width="15" height="15" viewBox="0 0 16 16">
			<circle cx="8" cy="7" r="4" fill="none" stroke="#E8C66A" strokeWidth="1.4" />
			<path d="M6 13 L10 13" stroke="#E8C66A" strokeWidth="1.4" />
		</svg>
	),
	coll: () => (
		<svg width="15" height="15" viewBox="0 0 16 16">
			<rect x="2" y="3" width="12" height="10" rx="1.5" fill="none" stroke="#D8D8D8" strokeWidth="1.3" />
			<path d="M2 6 L14 6" stroke="#D8D8D8" strokeWidth="1.3" />
		</svg>
	),
	eye: () => (
		<svg width="16" height="16" viewBox="0 0 16 16">
			<path d="M1.5 8 C4 3.8 12 3.8 14.5 8 C12 12.2 4 12.2 1.5 8 Z" fill="none" stroke="#D0D0D0" strokeWidth="1.2" />
			<circle cx="8" cy="8" r="2" fill="#D0D0D0" />
		</svg>
	),
	cameraR: () => (
		<svg width="16" height="16" viewBox="0 0 16 16">
			<rect x="2" y="5" width="12" height="8" rx="1.5" fill="none" stroke="#D0D0D0" strokeWidth="1.2" />
			<circle cx="8" cy="9" r="2" fill="none" stroke="#D0D0D0" strokeWidth="1.2" />
		</svg>
	),
	wrench: (c = '#6FA3E8') => (
		<svg width="16" height="16" viewBox="0 0 16 16">
			<path d="M10.5 1.8 a3.5 3.5 0 0 0 -3 4.6 L2 12 L4 14 L9.6 8.5 a3.5 3.5 0 0 0 4.6 -3 L12 7.5 L9.5 6.5 L8.5 4 Z" fill={c} />
		</svg>
	),
	ball: (c = '#E35F6E') => (
		<svg width="16" height="16" viewBox="0 0 16 16">
			<circle cx="8" cy="8" r="6" fill={c} />
			<circle cx="6" cy="6" r="2" fill="rgba(255,255,255,0.45)" />
		</svg>
	),
	sq: (c: string) => (
		<svg width="16" height="16" viewBox="0 0 16 16">
			<rect x="3" y="3" width="10" height="10" rx="2" fill={c} />
		</svg>
	),
};

const ShadeBtns: React.FC<{mode: BState['shading']}> = ({mode}) => {
	const modes: BState['shading'][] = ['solid', 'material', 'rendered'];
	return (
		<div style={{display: 'flex', borderRadius: 5, overflow: 'hidden', border: `1px solid ${BL.gap}`}}>
			{['wire', ...modes].map((m) => {
				const on = m === mode;
				return (
					<div key={m} style={{width: 30, height: 24, background: on ? BL.blue : BL.field, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: m === 'wire' ? 'none' : `1px solid ${BL.gap}`}}>
						<svg width="15" height="15" viewBox="0 0 16 16">
							{m === 'wire' ? <circle cx="8" cy="8" r="5.5" fill="none" stroke="#DDD" strokeWidth="1.3" /> : null}
							{m === 'solid' ? <circle cx="8" cy="8" r="5.5" fill="#DDD" /> : null}
							{m === 'material' ? (
								<>
									<circle cx="8" cy="8" r="5.5" fill="#DDD" />
									<circle cx="6.2" cy="6.2" r="2" fill="#888" />
								</>
							) : null}
							{m === 'rendered' ? (
								<>
									<circle cx="8" cy="8" r="5.5" fill="none" stroke="#DDD" strokeWidth="1.3" />
									<path d="M8 2.5 A5.5 5.5 0 0 1 8 13.5 Z" fill="#DDD" />
								</>
							) : null}
						</svg>
					</div>
				);
			})}
		</div>
	);
};

const Gizmo: React.FC<{az: number}> = ({az}) => {
	// navigation gizmo, rotated with the orbit
	const a = (az * Math.PI) / 180;
	const el = (31 * Math.PI) / 180;
	const R = 40;
	const P = (x: number, y: number, z: number) => {
		const xr = x * Math.cos(a) + y * Math.sin(a);
		const yr = -x * Math.sin(a) + y * Math.cos(a);
		return {x: xr * R, y: -(z * Math.cos(el) + yr * Math.sin(el)) * R, d: yr * Math.cos(el) - z * Math.sin(el)};
	};
	const axes = [
		{p: P(1, 0, 0), c: '#FF3352', l: 'X'},
		{p: P(0, 1, 0), c: '#8BDC00', l: 'Y'},
		{p: P(0, 0, 1), c: '#2890FF', l: 'Z'},
		{p: P(-1, 0, 0), c: '#9B3646', l: ''},
		{p: P(0, -1, 0), c: '#5A7D24', l: ''},
		{p: P(0, 0, -1), c: '#2C5A8C', l: ''},
	].sort((u, v) => v.p.d - u.p.d);
	return (
		<svg width="120" height="120" viewBox="-60 -60 120 120">
			{axes.map((ax, i) =>
				ax.l ? (
					<g key={i}>
						<line x1="0" y1="0" x2={ax.p.x} y2={ax.p.y} stroke={ax.c} strokeWidth="3" />
						<circle cx={ax.p.x} cy={ax.p.y} r="11" fill={ax.c} />
						<text x={ax.p.x} y={ax.p.y + 4.5} fontSize="13" fontWeight="700" textAnchor="middle" fill="#111" fontFamily={F.inter}>
							{ax.l}
						</text>
					</g>
				) : (
					<circle key={i} cx={ax.p.x} cy={ax.p.y} r="9" fill={ax.c} opacity={0.85} />
				),
			)}
		</svg>
	);
};

const WS = ['Layout', 'Modeling', 'Sculpting', 'UV Editing', 'Texture Paint', 'Shading', 'Animation', 'Rendering', 'Compositing', 'Geometry Nodes', 'Scripting'];

const Field: React.FC<{label: string; value: string; w?: number}> = ({label, value, w = 250}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 10, height: 26}}>
		<div style={{width: 128, textAlign: 'right'}}>
			<Txt c={BL.dim}>{label}</Txt>
		</div>
		<div style={{width: w, height: 22, borderRadius: 4, background: BL.field, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Txt>{value}</Txt>
		</div>
	</div>
);

export const BlenderUI: React.FC<{s: BState; src?: string; scale?: number}> = ({s, src}) => {
	const az = -38 + (52 * s.frame) / 119;
	const imgDir = s.stage === 'final' ? 'cy_final' : `vp_${s.stage}`;
	let idx = Math.max(0, Math.min(119, Math.round(s.frame)));
	// heavy stages were rendered on even orbit steps only
	if (s.stage === 'icing' || s.stage === 'color' || s.stage === 'sprinkles' || s.stage === 'final') idx = Math.min(118, idx - (idx % 2));
	const file = src ?? staticFile(`bl/${imgDir}/${String(idx).padStart(3, '0')}.jpg`);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: BL.gap, fontFamily: F.inter, overflow: 'hidden'}}>
			{/* top bar */}
			<div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 32, background: BL.top, display: 'flex', alignItems: 'center', gap: 18, paddingLeft: 14}}>
				<svg width="20" height="20" viewBox="0 0 20 20">
					<circle cx="11" cy="11" r="6.5" fill="none" stroke="#E87D0D" strokeWidth="2.6" />
					<circle cx="11" cy="11" r="2.4" fill="#2A6FB6" />
					<path d="M2 7 L9 7" stroke="#E87D0D" strokeWidth="2.6" strokeLinecap="round" />
				</svg>
				{['File', 'Edit', 'Render', 'Window', 'Help'].map((m) => (
					<Txt key={m} s={13.5}>
						{m}
					</Txt>
				))}
				<div style={{display: 'flex', gap: 2, marginLeft: 12}}>
					{WS.map((w, i) => (
						<div key={w} style={{padding: '5px 11px', borderRadius: 5, background: i === 0 ? '#474747' : 'transparent'}}>
							<Txt s={13} c={i === 0 ? '#FFF' : '#BDBDBD'}>
								{w}
							</Txt>
						</div>
					))}
				</div>
				<div style={{marginLeft: 'auto', display: 'flex', gap: 8, paddingRight: 14}}>
					{['Scene', 'ViewLayer'].map((x) => (
						<div key={x} style={{width: 150, height: 22, borderRadius: 4, background: '#1D1D1D', display: 'flex', alignItems: 'center', paddingLeft: 10}}>
							<Txt s={12.5}>{x}</Txt>
						</div>
					))}
				</div>
			</div>
			{/* viewport */}
			<div style={{position: 'absolute', left: VP.x, top: 32, width: VP.w, height: VP.h + 32, background: '#3D3D3D', overflow: 'hidden'}}>
				<Img src={file} style={{position: 'absolute', left: 0, top: 32, width: VP.w, height: VP.h}} />
				{/* header (overlaps the viewport) */}
				<div style={{position: 'absolute', left: 0, top: 0, width: VP.w, height: 32, background: 'rgba(48,48,48,0.98)', display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 10}}>
					<div style={{width: 40, height: 22, borderRadius: 4, background: BL.field, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{I.mesh('#DDD')}</div>
					<div style={{height: 22, borderRadius: 4, background: BL.field, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8}}>
						<Txt s={13}>Object Mode</Txt>
						<Txt s={10} c={BL.dim}>
							▾
						</Txt>
					</div>
					{['View', 'Select', 'Add', 'Object'].map((m) => (
						<Txt key={m} s={13.5}>
							{m}
						</Txt>
					))}
					<div style={{marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', paddingRight: 12}}>
						<div style={{height: 22, borderRadius: 4, background: BL.field, display: 'flex', alignItems: 'center', padding: '0 10px'}}>
							<Txt s={12.5}>Global</Txt>
						</div>
						<ShadeBtns mode={s.shading} />
					</div>
				</div>
				{/* overlay text */}
				<div style={{position: 'absolute', left: 64, top: 44, lineHeight: 1.45, textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
					<div>
						<Txt s={13.5}>User Perspective</Txt>
					</div>
					<div>
						<Txt s={13.5}>(1) Collection | {s.active}</Txt>
					</div>
				</div>
				{/* toolbar */}
				<div style={{position: 'absolute', left: 8, top: 96, width: 42, borderRadius: 8, background: 'rgba(40,40,40,0.92)', padding: '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
					{Array.from({length: 9}).map((_, i) => (
						<div key={i} style={{width: 32, height: 32, borderRadius: 5, background: i === 0 ? BL.blue : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<svg width="18" height="18" viewBox="0 0 18 18">
								{i === 0 ? <path d="M4 3 L4 14 L7 11 L9 15.5 L11 14.6 L9 10.5 L13 10.5 Z" fill="#fff" /> : null}
								{i === 1 ? <circle cx="9" cy="9" r="5" fill="none" stroke="#CCC" strokeWidth="1.5" strokeDasharray="2 2" /> : null}
								{i === 2 ? <path d="M9 2 L9 16 M2 9 L16 9 M9 2 l-2 2 M9 2 l2 2 M16 9 l-2 -2 M16 9 l-2 2" stroke="#CCC" strokeWidth="1.5" fill="none" /> : null}
								{i === 3 ? <path d="M14 9 A5 5 0 1 1 9 4 M9 4 l-2 -2 M9 4 l-2 2" stroke="#CCC" strokeWidth="1.5" fill="none" /> : null}
								{i === 4 ? <rect x="4" y="4" width="10" height="10" fill="none" stroke="#CCC" strokeWidth="1.5" /> : null}
								{i === 5 ? <path d="M3 15 L15 3 M10 3 L15 3 L15 8" stroke="#CCC" strokeWidth="1.5" fill="none" /> : null}
								{i === 6 ? <path d="M3 14 C6 6 10 12 15 4" stroke="#CCC" strokeWidth="1.5" fill="none" /> : null}
								{i === 7 ? <path d="M3 14 L15 4 M3 14 l2 0 M15 4 l-2 0" stroke="#CCC" strokeWidth="1.5" fill="none" /> : null}
								{i === 8 ? <path d="M9 3 L15 6 L15 12 L9 15 L3 12 L3 6 Z" stroke="#CCC" strokeWidth="1.4" fill="none" /> : null}
							</svg>
						</div>
					))}
				</div>
				{/* gizmo */}
				<div style={{position: 'absolute', right: 34, top: 50}}>
					<Gizmo az={az} />
				</div>
				<div style={{position: 'absolute', right: 70, top: 178, display: 'flex', flexDirection: 'column', gap: 6}}>
					{[0, 1, 2, 3].map((i) => (
						<div key={i} style={{width: 32, height: 32, borderRadius: 16, background: 'rgba(30,30,30,0.55)'}} />
					))}
				</div>
			</div>
			{/* outliner */}
			<div style={{position: 'absolute', left: VP.w + 2, top: 32, width: 1920 - VP.w - 2, height: 300, background: BL.outBg}}>
				<div style={{height: 32, background: BL.header, display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px'}}>
					<div style={{flex: 1, height: 22, borderRadius: 11, background: '#1D1D1D'}} />
				</div>
				<div style={{padding: '6px 0'}}>
					<Row depth={0} icon={I.coll()} name="Scene Collection" />
					<Row depth={1} icon={I.coll()} name="Collection" vis />
					<Row depth={2} icon={I.cam()} name="Camera" vis />
					<Row depth={2} icon={I.light()} name="Light" vis />
					{s.objects.map((o) => (
						<Row key={o} depth={2} icon={I.mesh()} name={o} vis sel={o === s.active} mod={o !== 'Cube'} />
					))}
				</div>
			</div>
			{/* properties */}
			<div style={{position: 'absolute', left: VP.w + 2, top: 334, width: 1920 - VP.w - 2, height: 904 - 334 + 32, background: BL.region}}>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 38, background: '#232323', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 10}}>
					{[I.sq('#9D9D9D'), I.cameraR(), I.sq('#7C7C7C'), I.sq('#B0B0B0'), I.ball('#E35F6E'), I.sq('#F0A060'), I.wrench(), I.sq('#55B1C9'), I.ball(s.tab === 'mat' ? '#E35F6E' : '#C26476')].map((ic, i) => {
						const on = (s.tab ?? 'mod') === 'mod' ? i === 6 : i === 8;
						return (
							<div key={i} style={{width: 30, height: 30, borderRadius: 5, background: on ? '#4A4A4A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								{ic}
							</div>
						);
					})}
				</div>
				<div style={{position: 'absolute', left: 44, right: 8, top: 8}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 8, height: 28}}>
						{I.mesh()}
						<Txt s={13.5}>{s.active}</Txt>
						<Txt c={BL.dim}>›</Txt>
						{(s.tab ?? 'mod') === 'mod' ? I.wrench() : I.ball()}
						<Txt s={13.5}>{(s.tab ?? 'mod') === 'mod' ? 'Modifiers' : 'Material'}</Txt>
					</div>
					{(s.tab ?? 'mod') === 'mod' ? (
						<>
							<div style={{height: 26, borderRadius: 4, background: BL.field, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8}}>
								<Txt>Add Modifier ▾</Txt>
							</div>
							{s.modifiers.map((m) => (
								<div key={m.name} style={{marginTop: 10, borderRadius: 6, background: BL.panel, padding: '8px 10px 10px'}}>
									<div style={{display: 'flex', alignItems: 'center', gap: 8, height: 26}}>
										<Txt c={BL.dim}>⌄</Txt>
										{I.wrench()}
										<div style={{flex: 1, height: 22, borderRadius: 4, background: BL.field, display: 'flex', alignItems: 'center', paddingLeft: 8}}>
											<Txt>{m.name}</Txt>
										</div>
									</div>
									{m.icon === 'sub' ? (
										<>
											<div style={{display: 'flex', margin: '8px 0 4px 0', borderRadius: 4, overflow: 'hidden'}}>
												<div style={{flex: 1, height: 22, background: BL.blue, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
													<Txt>Catmull-Clark</Txt>
												</div>
												<div style={{flex: 1, height: 22, background: BL.field, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
													<Txt>Simple</Txt>
												</div>
											</div>
											<Field label="Levels Viewport" value={String(m.levels ?? 2)} w={240} />
											<Field label="Render" value={String(m.levels ?? 2)} w={240} />
										</>
									) : (
										<>
											<Field label="Thickness" value="0.06 m" w={240} />
											<Field label="Offset" value="1.0000" w={240} />
										</>
									)}
								</div>
							))}
						</>
					) : s.material ? (
						<div style={{marginTop: 10, borderRadius: 6, background: BL.panel, padding: 10}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
								{I.ball(s.material.color)}
								<Txt>{s.material.name}</Txt>
							</div>
							<div style={{marginTop: 10}}>
								<Field label="Surface" value="Principled BSDF" w={240} />
								<div style={{display: 'flex', alignItems: 'center', gap: 10, height: 26}}>
									<div style={{width: 128, textAlign: 'right'}}>
										<Txt c={BL.dim}>Base Color</Txt>
									</div>
									<div style={{width: 240, height: 22, borderRadius: 4, background: s.material.color}} />
								</div>
								<Field label="Roughness" value="0.180" w={240} />
								<Field label="Subsurface" value="0.150" w={240} />
							</div>
						</div>
					) : null}
				</div>
			</div>
			{/* timeline */}
			<div style={{position: 'absolute', left: 0, top: 906, width: 1920, height: 150, background: BL.tl}}>
				<div style={{height: 32, background: BL.header, display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 12}}>
					{['Playback', 'Keying', 'View', 'Marker'].map((m) => (
						<Txt key={m} s={13}>
							{m}
						</Txt>
					))}
					<div style={{marginLeft: 380, display: 'flex', gap: 10}}>
						{['⏮', '◀', '▶', '⏭'].map((m) => (
							<Txt key={m} s={12} c="#CCC">
								{m}
							</Txt>
						))}
					</div>
					<div style={{marginLeft: 'auto', display: 'flex', gap: 8, paddingRight: 12}}>
						{['1', 'Start 1', 'End 250'].map((x) => (
							<div key={x} style={{width: x === '1' ? 60 : 110, height: 22, borderRadius: 4, background: BL.field, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Txt s={12.5}>{x}</Txt>
							</div>
						))}
					</div>
				</div>
				<div style={{position: 'relative', height: 26, borderBottom: `1px solid ${BL.gap}`}}>
					{Array.from({length: 26}).map((_, i) => (
						<div key={i} style={{position: 'absolute', left: 30 + i * 72, top: 4}}>
							<Txt s={12} c={BL.dim}>
								{i * 10}
							</Txt>
						</div>
					))}
					<div style={{position: 'absolute', left: 30 + 7, top: 1, width: 30, height: 22, borderRadius: 4, background: BL.blue, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Txt s={12}>1</Txt>
					</div>
				</div>
				<div style={{position: 'absolute', left: 51, top: 58, width: 2, height: 92, background: BL.blue}} />
			</div>
			{/* status bar */}
			<div style={{position: 'absolute', left: 0, top: 1056, width: 1920, height: 24, background: BL.top, display: 'flex', alignItems: 'center', gap: 22, paddingLeft: 14}}>
				{['Select', 'Pan View', 'Context Menu'].map((x) => (
					<Txt key={x} s={12} c={BL.dim}>
						{x}
					</Txt>
				))}
				<div style={{marginLeft: 'auto', paddingRight: 14}}>
					<Txt s={12} c={BL.dim}>
						5.2.2
					</Txt>
				</div>
			</div>
		</div>
	);
};

const Row: React.FC<{depth: number; icon: React.ReactNode; name: string; vis?: boolean; sel?: boolean; mod?: boolean}> = ({depth, icon, name, vis, sel, mod}) => (
	<div style={{display: 'flex', alignItems: 'center', height: 26, paddingLeft: 10 + depth * 20, gap: 8, background: sel ? BL.selRow : 'transparent'}}>
		<Txt c={BL.dim} s={10}>
			{depth < 2 ? '⌄' : ' '}
		</Txt>
		{icon}
		<Txt s={13.5} c={sel ? '#FFF' : BL.text}>
			{name}
		</Txt>
		{mod ? <div style={{marginLeft: 4}}>{I.wrench()}</div> : null}
		{vis ? (
			<div style={{marginLeft: 'auto', display: 'flex', gap: 8, paddingRight: 10}}>
				{I.eye()}
				{I.cameraR()}
			</div>
		) : null}
	</div>
);
