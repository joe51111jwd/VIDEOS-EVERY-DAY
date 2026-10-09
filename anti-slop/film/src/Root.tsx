import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {perihelion} from './ep/perihelion';
import {opener} from './ep/opener';
import {opener16} from './ep/opener16';
import {openerMove} from './ep/openerMove';

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
    <Composition
      id="OP"
      component={Film}
      width={1080}
      height={1920}
      fps={60}
      durationInFrames={Math.round(opener.durationSec * 60)}
      defaultProps={{ep: opener}}
    />
    <Composition
      id="OP16"
      component={Film}
      width={1920}
      height={1080}
      fps={60}
      durationInFrames={Math.round(opener16.durationSec * 60)}
      defaultProps={{ep: opener16}}
    />
    <Composition
      id="OPMOVE"
      component={Film}
      width={1920}
      height={1080}
      fps={60}
      durationInFrames={Math.round(openerMove.durationSec * 60)}
      defaultProps={{ep: openerMove}}
    />
  </>
);
