import React from 'react';
import {Composition} from 'remotion';
import {InvoiceTest} from './ttf/Tests';
import {DURATION, Film16, Film45, Film916} from './ttf/Film';
import {WallpaperSVG} from './ttf/Mac';
import {Dump, dumpTimeline} from './ttf/Dump';
const WallStill: React.FC = () => (
	<div style={{transform: 'scale(1.5)', transformOrigin: '0 0', width: 1920, height: 1080, position: 'relative'}}>
		<WallpaperSVG />
	</div>
);
export const Root: React.FC = () => (
	<>
		<Composition id="TabToFinish" component={Film16} durationInFrames={DURATION} fps={60} width={1920} height={1080} />
		<Composition id="TabToFinish45" component={Film45} durationInFrames={DURATION} fps={60} width={1080} height={1350} />
		<Composition id="TabToFinish916" component={Film916} durationInFrames={DURATION} fps={60} width={1080} height={1920} />
		<Composition id="InvoiceTest" component={InvoiceTest} durationInFrames={1} fps={60} width={1920} height={640} />
		<Composition id="WallStill" component={WallStill} durationInFrames={1} fps={60} width={2880} height={1620} />
		<Composition id="Dump" component={Dump} durationInFrames={1} fps={60} width={100} height={100} calculateMetadata={async () => ({props: {data: dumpTimeline()}})} />
	</>
);
