import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';
import {TypeBlock} from '../type/Typer';
import {BlenderUI} from '../apps/Blender';
import {SheetApp} from '../apps/Sheet';
import {Panel, TutorialPlayer} from '../ap/Panel';
import {Lockup} from '../ap/Brand';

const STEPS = ['Delete the default cube', 'Add a torus', 'Shade smooth', 'Add a Subdivision modifier', 'Duplicate the top for icing', 'Solidify the icing', 'Give the icing a pink material', 'Scatter the sprinkles', 'Render it'].map((text) => ({text}));

export const Lab: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	if (f < 100) {
		return (
			<AbsoluteFill style={{background: C.paper}}>
				<TypeBlock t={t} x={96} y={250} size={200} lines={[
					{t0: 0, segs: ['STOP ', {b: 'pause'}]},
					{t0: 0.3, segs: ['PAUSING']},
					{t0: 0.6, segs: ['TUTORIALS.']},
				]} />
				<Lockup h={46} style={{position: 'absolute', left: 96, top: 70}} />
			</AbsoluteFill>
		);
	}
	if (f < 200) {
		const lt = t - 100 / 30;
		return (
			<AbsoluteFill>
				<BlenderUI s={{stage: 'smooth', frame: 40, shading: 'solid', active: 'Donut', objects: ['Donut'], modifiers: [{name: 'Subdivision', icon: 'sub', levels: 2}]}} />
				<Panel t={lt} x={1920 - 470 - 40} y={90} title="Blender for Beginners: Make a Donut (Part 1)" channel="Low Poly Club · 2.1M views" total={41} cur={3.4} steps={STEPS}
					player={<TutorialPlayer w={442} pos={1312} dur={7391}><BlenderUI s={{stage: 'cube', frame: 90, shading: 'solid', active: 'Icing', objects: ['Donut', 'Icing'], modifiers: [{name: 'Subdivision', icon: 'sub'}, {name: 'Solidify', icon: 'solid'}]}} /></TutorialPlayer>} />
			</AbsoluteFill>
		);
	}
	const lt = t - 200 / 30;
	return <SheetApp t={lt} k={{select: 0, menu: 0.4, create: 1.0, rows: 1.5, values: 1.8, cols: 2.1, format: 2.5}} />;
};
