import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, useFontsReady} from '../lib/tokens';
import {Caption} from './ui';
import {Scene1} from './Scene1';
import {Scene2} from './Scene2';
import {Scene3} from './Scene3';
import {MontageKeys, Scene4, APPS} from './Montage';
import {End} from './End';
import {DUR, T} from './T';

export const FRAMES = Math.round(DUR * FPS);

export const Film: React.FC = () => {
	useFontsReady();
	const frame = useCurrentFrame();
	const t = frame / FPS;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{t < T.s2 ? <Scene1 t={t} /> : null}
			{t >= T.s2 && t < T.s3 ? <Scene2 t={t} /> : null}
			{t >= T.s3 && t < T.s4 ? <Scene3 t={t} /> : null}
			{t >= T.s4 && t < T.stop ? <Scene4 t={t} /> : null}
			{t >= T.s4 && t < T.stop ? <MontageKeys t={t} /> : null}
			{t >= T.stop ? <End t={t} /> : null}
			<Caption t={t} a={0} b={T.land} text="THIS IS A SCREENSHOT." instant />
			<Caption t={t} a={T.land} b={T.s2} text="NOW IT'S EDITABLE." hold />
			<Caption t={t} a={T.s2} b={T.paste2} text="GRAB ANY WEBSITE." hold />
			<Caption t={t} a={T.paste2} b={T.s3} text="PASTE IT INTO FIGMA." hold />
			<Caption t={t} a={T.s3} b={T.paste3} text="EVEN FROM A VIDEO." hold />
			<Caption t={t} a={T.paste3} b={T.s4} text="INTO KEYNOTE." hold />
			{APPS.map((a, i) => (
				<Caption key={i} t={t} a={T.cuts[i]} b={T.cuts[i + 1]} text={a.cap} hold />
			))}
			<Caption t={t} a={T.cuts[6]} b={T.stop} text="ANY APP." hold />
		</AbsoluteFill>
	);
};
