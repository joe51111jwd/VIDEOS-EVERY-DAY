import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS} from '../lib/tokens';
import {Hook} from './Hook';
import {Scene2, S2} from './Scene2';
import {Scene3, S3} from './Scene3';
import {M, Montage} from './Montage';
import {F, Finale} from './Finale';
import {O, Outro} from './Outro';
import {T} from './T';

// The whole film, scene by scene, on one clock (film seconds).
export const FILM_DUR = T.DUR;

export const Film: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	return <AbsoluteFill style={{background: '#000'}}>{t < S2.start ? <Hook /> : t < S3.start ? <Scene2 t={t} /> : t < M.start ? <Scene3 t={t} /> : t < F.stop ? <Montage t={t} /> : t < O.in ? <Finale t={t} /> : <Outro t={t} />}</AbsoluteFill>;
};
