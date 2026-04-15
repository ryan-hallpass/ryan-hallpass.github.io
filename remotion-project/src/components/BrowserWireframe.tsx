import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';

const LINE_WIDTHS = [90, 75, 85, 60, 80, 70]; // percentage widths for 6 text lines
const SCAN_START_OFFSET = 30; // frames after entrance before scan begins
const FRAMES_PER_LINE = 10;

export const BrowserWireframe: React.FC<{
  enterFrame: number;
  width: number;
  height: number;
}> = ({enterFrame, width, height}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - enterFrame;
  if (localFrame < 0) return null;

  // Entrance spring
  const entranceSpring = spring({
    frame: localFrame,
    fps,
    config: {damping: 12, stiffness: 180},
  });
  const scale = interpolate(entranceSpring, [0, 1], [0.85, 1]);
  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scanning state
  const scanFrame = localFrame - SCAN_START_OFFSET;
  const activeLineIndex = scanFrame >= 0 ? Math.floor(scanFrame / FRAMES_PER_LINE) : -1;

  // Hero pulse after scan completes
  const heroScanStart = SCAN_START_OFFSET + LINE_WIDTHS.length * FRAMES_PER_LINE + 5;
  const heroPulseProgress = interpolate(
    localFrame,
    [heroScanStart, heroScanStart + 15],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const heroPulseOpacity = heroPulseProgress < 0.5
    ? heroPulseProgress * 2 * 0.3
    : (1 - heroPulseProgress) * 2 * 0.3;

  // Float after scan completes
  const allDoneFrame = heroScanStart + 20;
  const floatOffset = localFrame > allDoneFrame
    ? Math.sin(((localFrame - allDoneFrame) / fps) * Math.PI + 1) * 2
    : 0;

  const contentPadding = 12;
  const topBarHeight = 30;
  const navHeight = 10;
  const heroHeight = 120;
  const lineHeight = 8;
  const lineGap = 16;
  const contentTop = topBarHeight + contentPadding;

  return (
    <div
      style={{
        width,
        height,
        transform: `scale(${scale}) translateY(${floatOffset}px)`,
        opacity,
        transformOrigin: 'top left',
        border: '2px solid #E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Browser top bar */}
      <div
        style={{
          height: topBarHeight,
          backgroundColor: '#F5F5F5',
          borderBottom: '1px solid #E0E0E0',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 10,
          gap: 6,
        }}
      >
        <div style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F57'}} />
        <div style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E'}} />
        <div style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28C840'}} />
      </div>

      {/* Nav bar */}
      <div
        style={{
          position: 'absolute',
          top: contentTop,
          left: contentPadding,
          width: '90%',
          height: navHeight,
          backgroundColor: '#D0D0D0',
          borderRadius: 2,
        }}
      />

      {/* Hero block */}
      <div
        style={{
          position: 'absolute',
          top: contentTop + navHeight + 10,
          left: contentPadding,
          width: '95%',
          height: heroHeight,
          backgroundColor: '#E8E8E8',
          borderRadius: 4,
          boxShadow: heroPulseOpacity > 0
            ? `inset 0 0 0 2px rgba(196, 121, 74, ${heroPulseOpacity})`
            : 'none',
        }}
      />

      {/* Text lines */}
      {LINE_WIDTHS.map((widthPct, i) => {
        const lineTop = contentTop + navHeight + 10 + heroHeight + 16 + i * (lineHeight + lineGap);

        // Determine line highlight state
        const isBeingScanned = activeLineIndex === i;
        const wasScanned = activeLineIndex > i;

        // Line color: gray by default, terra cotta when scanned, fades back
        let lineColor = '#D8D8D8';
        if (isBeingScanned) {
          const lineScanProgress = (scanFrame - i * FRAMES_PER_LINE) / FRAMES_PER_LINE;
          lineColor = `rgba(196, 121, 74, ${0.3 + lineScanProgress * 0.3})`;
        } else if (wasScanned) {
          const framesSinceScanned = scanFrame - (i + 1) * FRAMES_PER_LINE;
          const fadeBack = Math.min(framesSinceScanned / 8, 1);
          const r = Math.round(196 + (216 - 196) * fadeBack);
          const g = Math.round(121 + (216 - 121) * fadeBack);
          const b = Math.round(74 + (216 - 74) * fadeBack);
          lineColor = `rgb(${r}, ${g}, ${b})`;
        }

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: lineTop,
              left: contentPadding,
              width: `${widthPct}%`,
              height: lineHeight,
              backgroundColor: lineColor,
              borderRadius: 2,
            }}
          />
        );
      })}

      {/* Scanning highlight bar */}
      {activeLineIndex >= 0 && activeLineIndex < LINE_WIDTHS.length && (
        <div
          style={{
            position: 'absolute',
            top:
              contentTop +
              navHeight +
              10 +
              heroHeight +
              16 +
              activeLineIndex * (lineHeight + lineGap) -
              2,
            left: contentPadding,
            width: '95%',
            height: lineHeight + 4,
            backgroundColor: 'rgba(196, 121, 74, 0.15)',
            borderRadius: 2,
          }}
        />
      )}
    </div>
  );
};
