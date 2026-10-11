import React from 'react';
import {Composition} from 'remotion';
import './lib/theme';
import {Film2} from './v2/Film2';
import {LogoTest} from './v2/LogoTest';
import {DURATION, FPS} from './lib/beats';
import {H, W} from './lib/theme';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="LL" component={Film2} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
		<Composition id="LogoTest" component={LogoTest} durationInFrames={90} fps={FPS} width={W} height={H} />
	</>
);
