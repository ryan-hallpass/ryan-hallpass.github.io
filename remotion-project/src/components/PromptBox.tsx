import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';

const URL_TEXT = 'www.mynonprofit.org';
const TYPING_START = 15;
const FRAMES_PER_CHAR = 3;

export const PromptBox: React.FC<{
  enterFrame: number;
}> = ({enterFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  // Box entrance: scale 0.8 → 1.0 with spring
  const entranceSpring = spring({
    frame: localFrame,
    fps,
    config: {damping: 12, stiffness: 180},
  });
  const scale = interpolate(entranceSpring, [0, 1], [0.8, 1]);
  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Typewriter: one char every 3 frames, starting at frame 15
  const typingFrame = localFrame - TYPING_START;
  const charCount = typingFrame >= 0
    ? Math.min(Math.floor(typingFrame / FRAMES_PER_CHAR) + 1, URL_TEXT.length)
    : 0;
  const displayText = URL_TEXT.substring(0, charCount);
  const typingComplete = charCount >= URL_TEXT.length;

  // Blinking cursor: visible 500ms on, 500ms off after typing completes
  const cursorVisible = typingComplete
    ? Math.floor((localFrame / fps) * 2) % 2 === 0
    : typingFrame >= 0; // solid while typing

  // Gentle float after typing completes
  const typingEndFrame = TYPING_START + URL_TEXT.length * FRAMES_PER_CHAR;
  const floatOffset = typingComplete
    ? Math.sin(((localFrame - typingEndFrame) / fps) * Math.PI) * 2
    : 0;

  return (
    <div
      style={{
        transform: `scale(${scale}) translateY(${floatOffset}px)`,
        opacity,
        transformOrigin: 'top left',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '16px 24px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 24,
          color: '#1A1A18',
          letterSpacing: 0.5,
        }}
      >
        {displayText}
      </span>
      {cursorVisible && (
        <div
          style={{
            width: 2,
            height: 28,
            backgroundColor: '#C4794A',
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
};
