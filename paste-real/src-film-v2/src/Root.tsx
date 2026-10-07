import React from 'react';
import {Composition} from 'remotion';
import {Board1, Board2, Board3} from './board/Board';
import {Hook, HOOK_DUR} from './film/Hook';
import {Film, FILM_DUR} from './film/Film';
import {WallpaperSVG} from './mac/mac';
import './lib/tokens';

const WallStill: React.FC = () => <WallpaperSVG w={1440} h={2560} />;

export const Root: React.FC = () => (
	<>
		<Composition id="Hook" component={Hook} durationInFrames={Math.round((HOOK_DUR + 0.6) * 60)} fps={60} width={1080} height={1920} />
		<Composition id="Film" component={Film} durationInFrames={Math.round(FILM_DUR * 60)} fps={60} width={1080} height={1920} />
		<Composition id="Board1" component={Board1} durationInFrames={1} fps={60} width={1080} height={1920} />
		<Composition id="Board2" component={Board2} durationInFrames={1} fps={60} width={1080} height={1920} />
		<Composition id="Board3" component={Board3} durationInFrames={1} fps={60} width={1080} height={1920} />
		<Composition id="WallStill" component={WallStill} durationInFrames={1} fps={60} width={1440} height={2560} />
	</>
);
