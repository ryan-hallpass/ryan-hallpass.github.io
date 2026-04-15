import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';

// Keywords that get highlighted during scanning
const SCAN_ITEMS = [
  {text: 'Helping Children Thrive', startFrame: 30, type: 'headline' as const},
  {text: 'Over 600 youth served', startFrame: 50, type: 'stat' as const},
  {text: 'mentoring & education', startFrame: 68, type: 'keyword' as const},
  {text: 'Since 2018', startFrame: 82, type: 'keyword' as const},
  {text: 'Transform lives', startFrame: 95, type: 'keyword' as const},
];

const SCAN_HIGHLIGHT_DURATION = 14;

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

  // Float after scanning completes
  const allDoneFrame = 110;
  const floatOffset = localFrame > allDoneFrame
    ? Math.sin(((localFrame - allDoneFrame) / fps) * Math.PI + 1) * 2
    : 0;

  const topBarHeight = 30;
  const addressBarHeight = 28;
  const contentPadding = 14;

  // Scanner line position (sweeps down the content area)
  const scanStartFrame = 25;
  const scanEndFrame = 105;
  const contentAreaTop = topBarHeight + addressBarHeight + 8;
  const contentAreaHeight = height - contentAreaTop - 10;
  const scanProgress = interpolate(
    localFrame,
    [scanStartFrame, scanEndFrame],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const scanLineY = contentAreaTop + scanProgress * contentAreaHeight;
  const showScanLine = localFrame >= scanStartFrame && localFrame <= scanEndFrame;

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
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Browser top bar with traffic lights */}
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

      {/* Address bar */}
      <div
        style={{
          height: addressBarHeight,
          backgroundColor: '#FAFAFA',
          borderBottom: '1px solid #ECECEC',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
        }}
      >
        <div
          style={{
            backgroundColor: '#F0F0F0',
            borderRadius: 4,
            padding: '3px 10px',
            fontSize: 11,
            color: '#666',
            fontFamily: 'monospace',
          }}
        >
          www.mynonprofit.org
        </div>
      </div>

      {/* Hero image area — simple abstract drawing of people/community */}
      <div
        style={{
          margin: `${contentPadding}px ${contentPadding}px 0`,
          height: 140,
          backgroundColor: '#EDE8E0',
          borderRadius: 6,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {/* Simple silhouette shapes suggesting people */}
        <div style={{display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-end'}}>
          {[36, 44, 40, 48, 34, 42].map((h, i) => (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: i % 2 === 0 ? '#C4A882' : '#B8967A',
              }} />
              <div style={{
                width: 16,
                height: h,
                backgroundColor: i % 2 === 0 ? '#C4A882' : '#B8967A',
                borderRadius: '4px 4px 0 0',
                marginTop: 2,
              }} />
            </div>
          ))}
        </div>
        {/* Gradient overlay at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 30,
          background: 'linear-gradient(transparent, rgba(237,232,224,0.8))',
        }} />
      </div>

      {/* Main headline */}
      <div style={{padding: `12px ${contentPadding}px 0`}}>
        <ScanHighlight
          text="Helping Children Thrive"
          localFrame={localFrame}
          scanItem={SCAN_ITEMS[0]}
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#333',
            marginBottom: 8,
          }}
        />
      </div>

      {/* Subtext lines (gray abstract text) */}
      <div style={{padding: `6px ${contentPadding}px`}}>
        <div style={{width: '92%', height: 6, backgroundColor: '#DCDCDC', borderRadius: 2, marginBottom: 8}} />
        <div style={{width: '78%', height: 6, backgroundColor: '#DCDCDC', borderRadius: 2, marginBottom: 8}} />
        <div style={{width: '85%', height: 6, backgroundColor: '#DCDCDC', borderRadius: 2, marginBottom: 12}} />
      </div>

      {/* Stat callout */}
      <div style={{padding: `0 ${contentPadding}px`}}>
        <ScanHighlight
          text="Over 600 youth served"
          localFrame={localFrame}
          scanItem={SCAN_ITEMS[1]}
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#555',
            marginBottom: 6,
          }}
        />
      </div>

      {/* More gray text */}
      <div style={{padding: `6px ${contentPadding}px`}}>
        <div style={{width: '80%', height: 6, backgroundColor: '#DCDCDC', borderRadius: 2, marginBottom: 8}} />
        <ScanHighlight
          text="mentoring & education"
          localFrame={localFrame}
          scanItem={SCAN_ITEMS[2]}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#666',
            marginBottom: 6,
          }}
        />
        <div style={{width: '70%', height: 6, backgroundColor: '#DCDCDC', borderRadius: 2, marginBottom: 8}} />
      </div>

      {/* Bottom area with more keywords */}
      <div style={{padding: `4px ${contentPadding}px`}}>
        <div style={{display: 'flex', gap: 16, alignItems: 'center', marginBottom: 6}}>
          <ScanHighlight
            text="Since 2018"
            localFrame={localFrame}
            scanItem={SCAN_ITEMS[3]}
            style={{fontSize: 12, fontWeight: 600, color: '#777'}}
          />
          <div style={{width: 60, height: 6, backgroundColor: '#DCDCDC', borderRadius: 2}} />
        </div>
        <div style={{width: '65%', height: 6, backgroundColor: '#DCDCDC', borderRadius: 2, marginBottom: 8}} />
        <ScanHighlight
          text="Transform lives"
          localFrame={localFrame}
          scanItem={SCAN_ITEMS[4]}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#666',
            marginBottom: 6,
          }}
        />
      </div>

      {/* Scanning line */}
      {showScanLine && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: scanLineY,
            width: '100%',
            height: 2,
            backgroundColor: 'rgba(196, 121, 74, 0.5)',
            boxShadow: '0 0 8px rgba(196, 121, 74, 0.3)',
          }}
        />
      )}
    </div>
  );
};

// Helper component for keyword highlighting
const ScanHighlight: React.FC<{
  text: string;
  localFrame: number;
  scanItem: (typeof SCAN_ITEMS)[0];
  style: React.CSSProperties;
}> = ({text, localFrame, scanItem, style}) => {
  const highlightProgress = interpolate(
    localFrame,
    [scanItem.startFrame, scanItem.startFrame + 6],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const isHighlighted = highlightProgress > 0;

  // Highlight fades to a subtle background after full highlight
  const fadeProgress = interpolate(
    localFrame,
    [scanItem.startFrame + SCAN_HIGHLIGHT_DURATION, scanItem.startFrame + SCAN_HIGHLIGHT_DURATION + 8],
    [1, 0.3],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const bgOpacity = isHighlighted ? highlightProgress * fadeProgress * 0.35 : 0;

  return (
    <div
      style={{
        ...style,
        display: 'inline-block',
        backgroundColor: isHighlighted ? `rgba(196, 121, 74, ${bgOpacity})` : 'transparent',
        padding: isHighlighted ? '1px 4px' : '1px 4px',
        borderRadius: 3,
        color: isHighlighted && highlightProgress > 0.5 ? '#C4794A' : style.color,
      }}
    >
      {text}
    </div>
  );
};
