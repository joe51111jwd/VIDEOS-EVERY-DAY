import React from 'react';
import {Composition} from 'remotion';
import './lib/theme';
import {Film} from './film/Film';
import {DURATION} from './film/beats';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="Film" component={Film} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
	</>
);
