import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate, Easing} from 'remotion';

const URL_TEXT = 'www.mynonprofit.org';
const CURSOR_ENTER = 8; // cursor appears
const CURSOR_CLICK = 20; // cursor clicks into field
const TYPING_START = 28; // typing begins after click
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

  // Mouse cursor: enters from bottom-right, clicks into the field
  const cursorLocalFrame = localFrame - CURSOR_ENTER;
  const showMouseCursor = cursorLocalFrame >= 0 && localFrame < TYPING_START + 5;

  const cursorMoveProgress = interpolate(
    localFrame,
    [CURSOR_ENTER, CURSOR_CLICK],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const cursorEased = Easing.out(Easing.quad)(cursorMoveProgress);
  const cursorX = interpolate(cursorEased, [0, 1], [350, 40]);
  const cursorY = interpolate(cursorEased, [0, 1], [80, 24]);

  // Click scale dip
  const clickScale = interpolate(
    localFrame,
    [CURSOR_CLICK, CURSOR_CLICK + 2, CURSOR_CLICK + 4],
    [1, 0.85, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Cursor fades out after click
  const cursorOpacity = interpolate(
    localFrame,
    [TYPING_START, TYPING_START + 5],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Field focus state: border highlights after click
  const isFocused = localFrame >= CURSOR_CLICK;
  const focusBorderOpacity = interpolate(
    localFrame,
    [CURSOR_CLICK, CURSOR_CLICK + 6],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Typewriter text
  const typingFrame = localFrame - TYPING_START;
  const charCount = typingFrame >= 0
    ? Math.min(Math.floor(typingFrame / FRAMES_PER_CHAR) + 1, URL_TEXT.length)
    : 0;
  const displayText = URL_TEXT.substring(0, charCount);
  const typingComplete = charCount >= URL_TEXT.length;

  // Text cursor blink
  const showTextCursor = localFrame >= CURSOR_CLICK;
  const textCursorVisible = typingComplete
    ? Math.floor((localFrame / fps) * 2) % 2 === 0
    : showTextCursor;

  // Gentle float after typing completes
  const typingEndFrame = TYPING_START + URL_TEXT.length * FRAMES_PER_CHAR;
  const floatOffset = typingComplete
    ? Math.sin(((localFrame - typingEndFrame) / fps) * Math.PI) * 2
    : 0;

  // Placeholder text before typing
  const showPlaceholder = charCount === 0 && localFrame < TYPING_START;

  return (
    <div
      style={{
        transform: `scale(${scale}) translateY(${floatOffset}px)`,
        opacity,
        transformOrigin: 'top left',
        position: 'relative',
      }}
    >
      {/* Input field */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          border: isFocused
            ? `2px solid rgba(196, 121, 74, ${focusBorderOpacity * 0.6})`
            : '2px solid #E0E0E0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 380,
        }}
      >
        {showPlaceholder && (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 22,
              color: '#B0B0B0',
              letterSpacing: 0.5,
            }}
          >
            Enter nonprofit URL...
          </span>
        )}
        {!showPlaceholder && (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 22,
              color: '#1A1A18',
              letterSpacing: 0.5,
            }}
          >
            {displayText}
          </span>
        )}
        {textCursorVisible && !showPlaceholder && (
          <div
            style={{
              width: 2,
              height: 26,
              backgroundColor: '#C4794A',
              borderRadius: 1,
            }}
          />
        )}
      </div>

      {/* Mouse cursor */}
      {showMouseCursor && (
        <div
          style={{
            position: 'absolute',
            left: cursorX,
            top: cursorY,
            opacity: cursorOpacity,
            transform: `scale(${clickScale})`,
            transformOrigin: 'top left',
            filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.2))',
            pointerEvents: 'none',
          }}
        >
          <svg width={28} height={34} viewBox="0 0 24 30" fill="none">
            <path
              d="M2 2L2 22L7.5 16.5L12.5 26L16 24.5L11 14.5L18 14.5L2 2Z"
              fill="white"
              stroke="#333"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
