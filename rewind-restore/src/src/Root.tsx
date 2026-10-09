import React from 'react';
import {Composition} from 'remotion';
import {Film, DURATION} from './film/Film';
import {Thumb} from './film/Thumb';
import {FPS, H, W} from './lib/tokens';

export const Root: React.FC = () => (
	<>
		<Composition id="RR" component={Film} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={W} height={H} />
		<Composition id="THUMB" component={Thumb} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{min: 642}} />
	</>
);
