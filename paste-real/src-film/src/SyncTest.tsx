import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {CUES, inStop, pulse} from './lib/beat';
import {FPS, SANS, useFontsReady} from './lib/tokens';

export const SyncTest: React.FC = () => {
	useFontsReady();
	const f = useCurrentFrame();
	const t = f / FPS;
	const k = pulse(t, 'kick', 0.1, 0.5);
	const s = pulse(t, 'snare', 0.12);
	const h = pulse(t, 'hat', 0.06);
	const cur = [...CUES.beats].reverse().find((b) => b.t <= t);
	const st = inStop(t);
	return (
		<AbsoluteFill style={{background: st >= 0 ? '#300' : '#000', fontFamily: SANS, color: '#fff', alignItems: 'center', justifyContent: 'center'}}>
			<Audio src={staticFile('music/bed.wav')} />
			<div style={{position: 'absolute', top: 200, fontSize: 90, fontWeight: 800}}>{cur ? `${cur.bar}.${cur.beat}` : 'intro'}</div>
			<div style={{width: 300, height: 300, borderRadius: 150, background: `rgba(255,80,60,${k})`, position: 'absolute', top: 500}} />
			<div style={{width: 600, height: 120, background: `rgba(255,255,255,${s})`, position: 'absolute', top: 900}} />
			<div style={{width: 120, height: 120, background: `rgba(80,160,255,${h})`, position: 'absolute', top: 1100}} />
			<div style={{position: 'absolute', bottom: 200, fontSize: 40}}>{t.toFixed(2)}s</div>
		</AbsoluteFill>
	);
};
