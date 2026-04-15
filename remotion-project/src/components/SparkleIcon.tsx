import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate, Easing} from 'remotion';

export const SparkleIcon: React.FC<{
  startFrame: number;
  size: number;
}> = ({startFrame, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - startFrame;

  // Pop entrance: scale 0 → 1 with bouncy spring
  const popScale = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: {damping: 8},
  });

  // Rotation during pop: spring overshoot creates natural 0° → ~20° → 0°
  const rotationSpring = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: {damping: 8},
  });
  const rotation = interpolate(rotationSpring, [0, 1], [0, 20]);

  // Twinkle pulse: starts 5 frames after pop, scale 1.0 → 1.15 → 1.0
  const twinkleStart = 5;
  const twinkleDuration = 10;
  const twinkleProgress = interpolate(
    localFrame,
    [twinkleStart, twinkleStart + twinkleDuration / 2, twinkleStart + twinkleDuration],
    [0, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const twinkleScale = 1 + twinkleProgress * 0.15;

  // Combined scale: pop * twinkle (twinkle only matters once pop settles near 1)
  const combinedScale = popScale * twinkleScale;

  // Don't render before start frame
  if (localFrame < 0) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `scale(${combinedScale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <path
        d="M50 0 C52 38, 62 48, 100 50 C62 52, 52 62, 50 100 C48 62, 38 52, 0 50 C38 48, 48 38, 50 0Z"
        fill="#C4794A"
      />
    </svg>
  );
};
