import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile} from 'remotion';

export const LogoText: React.FC<{
  width: number;
}> = ({width}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Fade in: opacity 0 → 1 over frames 0–10
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scale in: spring from 0.8 → 1.0, snappy with minimal overshoot
  const scaleSpring = spring({
    frame,
    fps,
    config: {damping: 12, stiffness: 180},
  });
  const scale = interpolate(scaleSpring, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <Img
        src={staticFile('donorsparklogo.png')}
        style={{width, height: 'auto'}}
      />
    </div>
  );
};
