import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, clamp01} from './lib/tokens';
import {ACT} from './edit/timing';
import {WindowChrome} from './edit/Window';
import {Viewer} from './edit/Viewer';
import {Timeline} from './edit/Timeline';
import {ColorPage} from './edit/ColorPage';
import {Browser} from './edit/Browser';
import {VoiceHUD} from './edit/HUD';
import {Trackpad} from './edit/Trackpad';
import {Finale, pushTransform} from './edit/Finale';

const Scene: React.FC<{t: number}> = ({t}) => {
	const hide = clamp01((t - ACT.expand + 0.1) / 0.25);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{t < ACT.full + 0.05 ? (
				<AbsoluteFill style={{transform: pushTransform(t), transformOrigin: '0 0'}}>
					<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 38%, #141418 0%, #050506 60%, #000 100%)'}} />
					<WindowChrome t={t}>
						<Viewer t={Math.min(t, ACT.expand)} />
						<Timeline t={t} />
						<ColorPage t={t} />
						<Browser t={t} />
					</WindowChrome>
					<AbsoluteFill style={{opacity: 1 - hide}}>
						<Trackpad t={t} />
					</AbsoluteFill>
				</AbsoluteFill>
			) : null}
			<VoiceHUD t={t} hide={hide} />
			<Finale t={t} />
		</AbsoluteFill>
	);
};

/** film-style motion blur (180° shutter) while the camera pulls out of or pushes into the vertical cut */
const BLUR = 12;
const moving = (t: number) => (t > ACT.pull0 && t < ACT.pull1 + 0.02) || (t > ACT.expand && t < ACT.full + 0.02);

/** Riff for Video — one take in the editor, every edit said (and shown, never heard), then the vertical cut.
 * The song is mixed by tools/mix.py. */
export const Film: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	if (!moving(t)) return <Scene t={t} />;
	// running average: layer k at opacity 1/(k+1) weighs every sub-frame equally
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{Array.from({length: BLUR}, (_, k) => (
				<AbsoluteFill key={k} style={{opacity: 1 / (k + 1)}}>
					<Scene t={t + ((k + 0.5) / BLUR - 0.5) * (0.5 / FPS)} />
				</AbsoluteFill>
			))}
		</AbsoluteFill>
	);
};
