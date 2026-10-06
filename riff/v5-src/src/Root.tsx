import React from 'react';
import {Composition} from 'remotion';
import {RiffVideo, TOTAL} from './Video';
import {RiffFilm, V4_DURATION} from './v4/Film';
import {FPS} from './theme';
import {CrispTest} from './v5/CrispTest';
import {RiffFilm5, V5_DURATION} from './v5/Film5';
import {SiteTest, DeskTest, AppTest, PrintTest, WallpaperStill} from './v5/Previews';
export const Root: React.FC = () => (
	<>
		<Composition id="Riff" component={RiffVideo} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1920} height={1080} />
		<Composition id="RiffV4" component={RiffFilm} durationInFrames={V4_DURATION * FPS} fps={FPS} width={1920} height={1080} />
		<Composition id="CrispTest" component={CrispTest} durationInFrames={30} fps={FPS} width={1920} height={1080} />
		<Composition id="SiteTest" component={SiteTest} durationInFrames={200} fps={FPS} width={1440} height={900} />
		<Composition id="DeskTest" component={DeskTest} durationInFrames={30} fps={FPS} width={1920} height={1080} />
		<Composition id="AppTest" component={AppTest} durationInFrames={120} fps={FPS} width={1440} height={1000} />
		<Composition id="PrintTest" component={PrintTest} durationInFrames={120} fps={FPS} width={1920} height={1080} />
		<Composition id="WallpaperStill" component={WallpaperStill} durationInFrames={1} fps={FPS} width={2880} height={1620} />
		<Composition id="RiffV5" component={RiffFilm5} durationInFrames={Math.round(V5_DURATION * FPS)} fps={FPS} width={1920} height={1080} />
	</>
);
