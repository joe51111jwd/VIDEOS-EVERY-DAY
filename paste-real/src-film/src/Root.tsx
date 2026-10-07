import React from 'react';
import {Composition} from 'remotion';
import {SyncTest} from './SyncTest';
import {CUES} from './lib/beat';
import {Film, FRAMES} from './pr/Film';
import {Measure} from './dev/Measure';
export const Root: React.FC = () => (
	<>
		<Composition id="Film" component={Film} durationInFrames={FRAMES} fps={60} width={1080} height={1920} />
		<Composition id="Measure" component={Measure} durationInFrames={1} fps={60} width={1080} height={1920} />
		<Composition id="SyncTest" component={SyncTest} durationInFrames={Math.round(CUES.duration * 60)} fps={60} width={540} height={960} />
	</>
);
