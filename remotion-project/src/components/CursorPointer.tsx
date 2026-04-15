import React from 'react';
import {useCurrentFrame, interpolate, Easing} from 'remotion';

export const CursorPointer: React.FC<{
  enterFrame: number;
  clickFrame: number;
  exitFrame: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  exitX: number;
}> = ({enterFrame, clickFrame, exitFrame, startX, startY, targetX, targetY, exitX}) => {
  const frame = useCurrentFrame();

  // Phase 1: Enter — arc from start to target
  const enterProgress = interpolate(frame, [enterFrame, clickFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slight arc: x uses Easing.out, y uses Easing.inOut for a natural curve
  const xEased = Easing.out(Easing.quad)(enterProgress);
  const yEased = Easing.inOut(Easing.quad)(enterProgress);

  const moveX = interpolate(xEased, [0, 1], [startX, targetX]);
  const moveY = interpolate(yEased, [0, 1], [startY, targetY]);

  // Phase 2: Exit — slide right off screen
  const exitDuration = 12;
  const exitProgress = interpolate(frame, [exitFrame, exitFrame + exitDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitEased = Easing.in(Easing.quad)(exitProgress);
  const exitOffsetX = interpolate(exitEased, [0, 1], [0, exitX - targetX]);

  // Combined position
  const x = frame < exitFrame ? moveX : targetX + exitOffsetX;
  const y = frame < exitFrame ? moveY : targetY;

  // Click scale: dip to 0.85 then back to 1.0
  const clickScale = interpolate(
    frame,
    [clickFrame, clickFrame + 2, clickFrame + 4],
    [1, 0.85, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Fade in over first 4 frames of entrance
  const fadeIn = interpolate(frame, [enterFrame, enterFrame + 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out over last 4 frames of exit
  const fadeOut = interpolate(
    frame,
    [exitFrame + exitDuration - 4, exitFrame + exitDuration],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Don't render before entrance or after exit completes
  if (frame < enterFrame || frame > exitFrame + exitDuration) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: `scale(${clickScale})`,
        transformOrigin: 'top left',
        filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.2))',
        pointerEvents: 'none',
      }}
    >
      <svg width={32} height={40} viewBox="0 0 24 30" fill="none">
        <path
          d="M2 2L2 22L7.5 16.5L12.5 26L16 24.5L11 14.5L18 14.5L2 2Z"
          fill="white"
          stroke="#333"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
