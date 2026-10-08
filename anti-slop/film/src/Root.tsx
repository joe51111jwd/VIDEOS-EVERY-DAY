import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {perihelion} from './ep/perihelion';

export const Root: React.FC = () => (
  <>
    <Composition
      id="EP01"
      component={Film}
      width={1080}
      height={1920}
      fps={60}
      durationInFrames={Math.round(perihelion.durationSec * 60)}
      defaultProps={{ep: perihelion}}
    />
  </>
);
