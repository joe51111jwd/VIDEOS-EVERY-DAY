import React from 'react';
import {Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/** Animated film grain (8 pre-baked tiles, a new one every 2 frames). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const i = Math.floor(f / 2) % 8;
  const ox = ((f * 37) % 7) * 3, oy = ((f * 53) % 5) * 3;
  return (
    <Img
      src={staticFile(`grain/g${i}.png`)}
      style={{position: 'absolute', left: -ox, top: -oy, width: W + 24, height: H + 24, opacity, mixBlendMode: 'overlay', pointerEvents: 'none', imageRendering: 'auto'}}
    />
  );
};
