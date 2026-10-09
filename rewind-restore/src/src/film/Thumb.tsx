import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Wallpaper, MenuBar} from '../mac/Desktop';
import {Placed, dayState, momentPlaced} from '../world/Day';
import {MOMENTS} from '../world/moments';
import {worldForClock, fmtClock} from './plan';

/** a whole desktop for the Rewind strip: either the hook day at a clock minute, or a montage moment */
export const Thumb: React.FC<{min?: number; moment?: string}> = ({min = 642, moment}) => {
	const mo = moment ? MOMENTS.find((m) => m.id === moment) : null;
	const placed = mo ? momentPlaced(mo.wins, mo.focus) : dayState(worldForClock(min)).placed;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Wallpaper />
			{placed.map((p) => (
				<Placed key={p.spec.id} p={p} />
			))}
			<MenuBar app="Safari" clock={fmtClock(min)} />
		</AbsoluteFill>
	);
};
