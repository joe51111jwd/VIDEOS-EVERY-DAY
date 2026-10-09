import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {FPS, H, W} from './lib/tokens';
import {ROUNDS, WINNER, WINNER2} from './taste/genes';
import {SiteAt} from './taste/Site';
import {Film} from './film/Film';
import {DURATION} from './film/beats';

const Sheet: React.FC<{r: number}> = ({r}) => {
	const list = r < 0 ? [WINNER, WINNER2] : ROUNDS[r];
	const cols = r < 0 ? 1 : 5;
	const w = r < 0 ? 900 : 360;
	return (
		<AbsoluteFill style={{background: '#000', display: 'flex', flexWrap: 'wrap', gap: 12, padding: 12, alignContent: 'flex-start'}}>
			{list.map((g, i) => (
				<SiteAt key={i} g={g} w={w} />
			))}
		</AbsoluteFill>
	);
};

export const Root: React.FC = () => (
	<>
		<Composition id="TASTE" component={Film} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={W} height={H} />
		<Composition id="SHEET" component={Sheet} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{r: 0}} />
	</>
);
