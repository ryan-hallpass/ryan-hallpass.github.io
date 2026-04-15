import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

export const GlowEffect: React.FC<{
  startFrame: number;
  size: number;
}> = ({startFrame, size}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  // Bloom: scale 0 → 1.5 → 0 over 15 frames
  const bloomDuration = 15;
  const bloomProgress = interpolate(
    localFrame,
    [0, bloomDuration * 0.4, bloomDuration],
    [0, 1.5, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Opacity: fades in then out
  const opacity = interpolate(
    localFrame,
    [0, bloomDuration * 0.3, bloomDuration],
    [0, 0.15, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  if (localFrame < 0 || localFrame > bloomDuration) return null;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #C4794A 0%, transparent 70%)',
        transform: `scale(${bloomProgress})`,
        opacity,
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -size / 2,
        marginLeft: -size / 2,
        pointerEvents: 'none',
      }}
    />
  );
};
