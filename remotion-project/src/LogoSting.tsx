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

// Layout: logo is 1510x400px original, rendered at 700px wide
// Scale factor: 700 / 1510 = 0.4636
// Rendered height: 400 * 0.4636 ≈ 185px
// Sparkle center in original: ~x:1400, y:55
// Sparkle center rendered: x: 1400 * 0.4636 = 649, y: 55 * 0.4636 = 25
// Logo is flex-centered, so its top-left is at:
//   left: (1920 - 700) / 2 = 610
//   top: (1080 - 185) / 2 = 447.5
const LOGO_WIDTH = 700;
const LOGO_RENDERED_HEIGHT = 185;

// Sparkle absolute position on the 1920x1080 composition
const SPARKLE_X = (1920 - LOGO_WIDTH) / 2 + 649; // ≈ 1259
const SPARKLE_Y = (1080 - LOGO_RENDERED_HEIGHT) / 2 + 25; // ≈ 472
const SPARKLE_SIZE = 37;

export const LogoSting: React.FC = () => {
  const centerX = 1920 / 2;
  const centerY = 1080 / 2;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 35% 30%, #F5E6DC 0%, #F2EFE8 70%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Logo text — centered, sparkle clipped out via clip-path */}
      <LogoText width={LOGO_WIDTH} />

      {/* Black sparkle — fades in, zooms, and spins on cursor click */}
      <div
        style={{
          position: 'absolute',
          left: SPARKLE_X - SPARKLE_SIZE / 2,
          top: SPARKLE_Y - SPARKLE_SIZE / 2,
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
        targetX={SPARKLE_X - 4}
        targetY={SPARKLE_Y - 4}
        exitX={centerX + 600}
      />
    </AbsoluteFill>
  );
};
