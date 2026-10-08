import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {DURATION} from './edit/timing';
import {FPS, H, W} from './lib/tokens';

export const Root: React.FC = () => <Composition id="RFV" component={Film} durationInFrames={Math.round(DURATION * FPS)} fps={FPS} width={W} height={H} />;
