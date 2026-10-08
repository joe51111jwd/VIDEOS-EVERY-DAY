import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, clamp01, lerp, step} from '../lib/tokens';
import {at, PRE, T} from './beat';
import {CUT_A, CUT_B} from './plan';
import {Hook} from './Hook';
import {CutView} from './Cut';
import {camE, DIVE, Editor} from './Editor';
import {End} from './End';
import {Hud} from './Hud';
import {Intro} from './Intro';
import {Pill} from './Pill';

/** the picture at film t: the hook said into shape, the cut to the beat, the editor, the finished cut */
const Picture: React.FC<{t: number}> = ({t}) => {
	if (t < T.slam) return <Hook t={t} />;
	if (t < T.pull) return <CutView t={t} cuts={CUT_A} />;
	if (t < T.push) return <Editor t={t} />;
	return <CutView t={t} cuts={CUT_B} finished />;
};

/** film-style motion blur (180° shutter) on the fast moves: the reframe, the pull-back and the push-in */
const BLUR = 12;
const moving = (t: number) => (t > T.vertical && t < T.vertical + 0.45) || (t > T.pull && t < T.pull + 0.82) || (t > T.push - DIVE - 0.02 && t < T.push);

/** the pill: on the hook until the cut lands, hidden over the montage, back once the editor is in view */
const pillShow = (t: number) => {
	// it comes up listening on the opening's last beat, just after "Just speak."
	if (t < 0) return step(t, at(119), 0.25);
	if (t < T.slam + 0.3) return 1;
	if (t < T.pull) return 1 - clamp01((t - T.slam - 0.3) / 0.15);
	return step(t, T.pull + 0.55, 0.3) * (1 - clamp01((t - (T.push - DIVE)) / 0.25));
};
const pillY = (t: number) => (t < T.pull ? 1560 : lerp(1560, 1446, camE(t)));
/** the count stays up through the finished cut and gives way to the end card */
const hudShow = (t: number) => (t < 0 ? 0 : 1 - clamp01((t - T.stat) / 0.2));

/** Riff for Video, the talk cut: a New York edit built live by voice, cut to N.Y. State of Mind (music only,
 * mixed by tools/mix.py from talk/music.ts). It opens on "No keyboard. Just speak." for one bar before film 0. */
export const Talk: React.FC = () => {
	const t = useCurrentFrame() / FPS - PRE;
	let pic: React.ReactNode = null;
	if (t < 0) pic = <Intro t={t} />;
	else if (t < T.stat) {
		pic = moving(t) ? (
			// running average: layer k at opacity 1/(k+1) weighs every sub-frame equally
			<AbsoluteFill>
				{Array.from({length: BLUR}, (_, k) => (
					<AbsoluteFill key={k} style={{opacity: 1 / (k + 1)}}>
						<Picture t={t + ((k + 0.5) / BLUR - 0.5) * (0.5 / FPS)} />
					</AbsoluteFill>
				))}
			</AbsoluteFill>
		) : (
			<Picture t={t} />
		);
	}
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{pic}
			<End t={t} />
			<Hud t={t} y={200} show={hudShow(t)} />
			<Pill t={t} y={pillY(t)} show={pillShow(t)} />
		</AbsoluteFill>
	);
};
