import React from 'react';
import {Composition} from 'remotion';
import './lib/theme';
import {Film} from './film/Film';
import {DURATION, FPS} from './lib/beats';
import {H, W} from './lib/theme';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="CC" component={Film} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
	</>
);
