import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';

export const SparkleIcon: React.FC<{
  startFrame: number;
  size: number;
}> = ({startFrame, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - startFrame;

  // Fade in: opacity 0 → 1 over 6 frames
  const opacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Zoom in: scale 0 → 1 with a snappy spring
  const zoomScale = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: {damping: 12, stiffness: 180},
  });

  // 360° spin: quick full rotation over ~12 frames
  const spinDuration = 12;
  const spinProgress = interpolate(localFrame, [0, spinDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Ease out so it decelerates naturally
  const spinEased = 1 - Math.pow(1 - spinProgress, 2);
  const rotation = spinEased * 360;

  // Twinkle pulse after spin settles: scale 1.0 → 1.15 → 1.0
  const twinkleStart = 14;
  const twinkleDuration = 10;
  const twinkleProgress = interpolate(
    localFrame,
    [twinkleStart, twinkleStart + twinkleDuration / 2, twinkleStart + twinkleDuration],
    [0, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const twinkleScale = 1 + twinkleProgress * 0.15;

  const combinedScale = zoomScale * twinkleScale;

  // Don't render before start frame
  if (localFrame < 0) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        opacity,
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
