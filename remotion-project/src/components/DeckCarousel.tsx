import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate, Easing} from 'remotion';
import {AbstractSlide, SLIDE_CONFIGS} from './AbstractSlide';

// Swipe timing (in local frames relative to enterFrame)
const SETTLE_DURATION = 20;
const HOLD_FRAMES = 20;
const SWIPE_FRAMES = 15;
const SWIPE_STARTS = [
  SETTLE_DURATION + HOLD_FRAMES + 30, // swipe 1 at ~70 local frames
  SETTLE_DURATION + HOLD_FRAMES + 30 + SWIPE_FRAMES + HOLD_FRAMES, // swipe 2
  SETTLE_DURATION + HOLD_FRAMES + 30 + (SWIPE_FRAMES + HOLD_FRAMES) * 2, // swipe 3
];

export const DeckCarousel: React.FC<{
  enterFrame: number;
  frameWidth: number;
  frameHeight: number;
}> = ({enterFrame, frameWidth, frameHeight}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  // Entrance: slide in from right with spring
  const entranceSpring = spring({
    frame: localFrame,
    fps,
    config: {damping: 14, stiffness: 160},
  });
  const slideInX = interpolate(entranceSpring, [0, 1], [600, 0]);
  const scaleEntrance = interpolate(entranceSpring, [0, 1], [0.9, 1]);
  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Determine current slide index based on swipe progress
  let currentSlideOffset = 0;
  for (const swipeStart of SWIPE_STARTS) {
    if (localFrame >= swipeStart) {
      const swipeProgress = interpolate(
        localFrame,
        [swipeStart, swipeStart + SWIPE_FRAMES],
        [0, 1],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      );
      const eased = Easing.inOut(Easing.quad)(swipeProgress);
      currentSlideOffset += eased;
    }
  }

  // Gentle float when idle
  const isSettled = localFrame > SETTLE_DURATION;
  const floatOffset = isSettled
    ? Math.sin(((localFrame - SETTLE_DURATION) / fps) * Math.PI + 2) * 2
    : 0;

  const slideWidth = frameWidth - 4; // account for border
  const slideHeight = frameHeight - 4;

  return (
    <div
      style={{
        width: frameWidth,
        height: frameHeight,
        transform: `translateX(${slideInX}px) scale(${scaleEntrance}) translateY(${floatOffset}px)`,
        opacity,
        transformOrigin: 'center center',
        border: '2px solid #E0E0E0',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Slide track */}
      <div
        style={{
          display: 'flex',
          transform: `translateX(${-currentSlideOffset * slideWidth}px)`,
          width: slideWidth * SLIDE_CONFIGS.length,
          height: slideHeight,
        }}
      >
        {SLIDE_CONFIGS.map((config, i) => (
          <AbstractSlide
            key={i}
            config={config}
            width={slideWidth}
            height={slideHeight}
          />
        ))}
      </div>
    </div>
  );
};
