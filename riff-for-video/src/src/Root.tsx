import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {DURATION} from './edit/timing';
import {Talk} from './talk/Talk';
import {DURATION as TALK_DURATION} from './talk/beat';
import {FPS, H, W} from './lib/tokens';

export const Root: React.FC = () => (
	<>
		<Composition id="RFV" component={Film} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={W} height={H} />
		<Composition id="TALK" component={Talk} durationInFrames={Math.round(TALK_DURATION * FPS)} fps={FPS} width={W} height={H} />
	</>
);
