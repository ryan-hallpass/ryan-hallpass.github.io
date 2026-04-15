import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LogoText} from './components/LogoText';
import {SparkleIcon} from './components/SparkleIcon';
import {CursorPointer} from './components/CursorPointer';
// Frame constants
const CURSOR_ENTER = 12;
const CLICK_FRAME = 30;
const SPARKLE_POP = 31;
const CURSOR_EXIT = 36;

// Layout constants — sparkle position relative to logo container
// The sparkle in the original logo sits at the top-right of the "k"
// Logo image is ~700px wide at this scale, sparkle offset from logo center
const LOGO_WIDTH = 700;
const SPARKLE_OFFSET_X = 345; // right of logo center
const SPARKLE_OFFSET_Y = -95; // above logo center
const SPARKLE_SIZE = 48;

export const LogoSting: React.FC = () => {
  // Composition center
  const centerX = 1920 / 2;
  const centerY = 1080 / 2;

  // Sparkle absolute position on the composition
  const sparkleX = centerX + SPARKLE_OFFSET_X;
  const sparkleY = centerY + SPARKLE_OFFSET_Y;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 35% 30%, #F5E6DC 0%, #F2EFE8 70%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Logo text — centered */}
      <LogoText width={LOGO_WIDTH} />

      {/* Mask: hides the black sparkle in the logo PNG until the animated one appears.
          A small circle matching the background gradient, positioned over the sparkle.
          Sits above the logo but below the animated sparkle + glow layers. */}
      <div
        style={{
          position: 'absolute',
          left: sparkleX - 32,
          top: sparkleY - 32,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 35% 30%, #F5E6DC 0%, #F2EFE8 70%)',
          backgroundSize: '1920px 1080px',
          backgroundPosition: `${-(sparkleX - 32)}px ${-(sparkleY - 32)}px`,
        }}
      />

      {/* Black sparkle — fades in, zooms, and spins on cursor click */}
      <div
        style={{
          position: 'absolute',
          left: sparkleX - SPARKLE_SIZE / 2,
          top: sparkleY - SPARKLE_SIZE / 2,
        }}
      >
        <SparkleIcon startFrame={SPARKLE_POP} size={SPARKLE_SIZE} />
      </div>

      {/* Cursor */}
      <CursorPointer
        enterFrame={CURSOR_ENTER}
        clickFrame={CLICK_FRAME}
        exitFrame={CURSOR_EXIT}
        startX={centerX + 500}
        startY={centerY + 400}
        targetX={sparkleX - 4}
        targetY={sparkleY - 4}
        exitX={centerX + 600}
      />
    </AbsoluteFill>
  );
};
