import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {HookShot, KeysShot} from './Hook';
import {DetailShot, EndShot, MontageShot} from './Acts';
import {DETAIL, END, KEYS, MONT} from './plan';

export const DURATION = END.end;

export const Film: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	let shot: React.ReactNode;
	if (t >= KEYS.t0 && t < KEYS.t1) shot = <KeysShot t={t} />;
	else if (t < DETAIL.tabs) shot = <HookShot t={t} />;
	else if (t < MONT.open) shot = <DetailShot t={t} />;
	else if (t < END.w1) shot = <MontageShot t={t} />;
	else shot = <EndShot t={t} />;
	return <AbsoluteFill style={{background: '#000'}}>{shot}</AbsoluteFill>;
};
