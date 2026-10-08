import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';

/** Animated film grain (8 pre-baked tiles, a new one every 2 frames). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const f = useCurrentFrame();
  const i = Math.floor(f / 2) % 8;
  const ox = ((f * 37) % 7) * 3, oy = ((f * 53) % 5) * 3;
  return (
    <Img
      src={staticFile(`grain/g${i}.png`)}
      style={{position: 'absolute', left: -ox, top: -oy, width: 1080 + 24, height: 1920 + 24, opacity, mixBlendMode: 'overlay', pointerEvents: 'none', imageRendering: 'auto'}}
    />
  );
};
