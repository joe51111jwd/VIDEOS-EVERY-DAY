import React from 'react';
import {Img} from 'remotion';
import {frameAt, ShotId} from './shots';

/** one frame of a shot, filling its box; in slow motion the two nearest frames are blended */
export const Pic: React.FC<{id: ShotId; s: number; look?: string; blend?: boolean; style?: React.CSSProperties}> = ({id, s, look = 'neon', blend = false, style}) => {
	const f = frameAt(id, s, look, blend);
	const img: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'};
	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>
			<Img src={f.a} style={img} />
			{blend && f.f > 0.02 ? <Img src={f.b} style={{...img, opacity: f.f}} /> : null}
		</div>
	);
};
