# DonorSpark Product Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 12-second animated product demo showing URL input → website scan → deck carousel, as a standalone Remotion composition.

**Architecture:** Five independent components (DotGridBackground, PromptBox, BrowserWireframe, AbstractSlide, DeckCarousel) orchestrated by a main ProductDemo composition. Each component owns its animation logic via `useCurrentFrame()`. The DeckCarousel renders 4 AbstractSlide instances with swipe transitions.

**Tech Stack:** Remotion 4.x, React 18, TypeScript, `spring()` / `interpolate()` / `Easing` for all animation.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/components/DotGridBackground.tsx` | Cream background with terra cotta dot grid pattern |
| `src/components/PromptBox.tsx` | URL input container with typewriter text animation and blinking cursor |
| `src/components/BrowserWireframe.tsx` | Browser chrome, abstract website content, and scanning highlight effect |
| `src/components/AbstractSlide.tsx` | Single parameterized abstract slide layout for the deck carousel |
| `src/components/DeckCarousel.tsx` | Phone frame with slide swipe animation, renders 4 AbstractSlide instances |
| `src/ProductDemo.tsx` | Main composition — layout, timing orchestration, floating idle animation |
| `src/Root.tsx` | Modified — add DonorSparkProductDemo composition registration |

---

### Task 1: DotGridBackground Component

**Files:**
- Create: `src/components/DotGridBackground.tsx`

- [ ] **Step 1: Create the DotGridBackground component**

Create `src/components/DotGridBackground.tsx`:

```tsx
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const DotGridBackground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F2EFE8',
        backgroundImage:
          'radial-gradient(circle, rgba(196, 121, 74, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
      }}
    />
  );
};
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/ryanmcneill/remotion-project && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/DotGridBackground.tsx
git commit -m "feat: add DotGridBackground component with cream and terra cotta dot grid"
```

---

### Task 2: PromptBox Component

**Files:**
- Create: `src/components/PromptBox.tsx`

- [ ] **Step 1: Create the PromptBox component**

Create `src/components/PromptBox.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/ryanmcneill/remotion-project && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PromptBox.tsx
git commit -m "feat: add PromptBox component with typewriter and blinking cursor"
```

---

### Task 3: BrowserWireframe Component

**Files:**
- Create: `src/components/BrowserWireframe.tsx`

- [ ] **Step 1: Create the BrowserWireframe component**

Create `src/components/BrowserWireframe.tsx`:

```tsx
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
  const scanComplete = activeLineIndex >= LINE_WIDTHS.length;

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
        const lineScanProgress = isBeingScanned
          ? (scanFrame - i * FRAMES_PER_LINE) / FRAMES_PER_LINE
          : 0;

        // Line color: gray by default, terra cotta when scanned, fades back
        let lineColor = '#D8D8D8';
        if (isBeingScanned) {
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
              transition: 'none',
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
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/ryanmcneill/remotion-project && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BrowserWireframe.tsx
git commit -m "feat: add BrowserWireframe component with scanning highlight effect"
```

---

### Task 4: AbstractSlide Component

**Files:**
- Create: `src/components/AbstractSlide.tsx`

- [ ] **Step 1: Create the AbstractSlide component**

Create `src/components/AbstractSlide.tsx`:

```tsx
import React from 'react';

export interface SlideConfig {
  headerHeight: number;
  headlineWidth: string;
  imageHeight: number;
  imagePosition: 'top' | 'middle' | 'bottom';
  textLines: string[]; // array of width percentages, e.g. ['70%', '55%', '80%', '60%']
}

export const SLIDE_CONFIGS: SlideConfig[] = [
  {
    headerHeight: 60,
    headlineWidth: '70%',
    imageHeight: 180,
    imagePosition: 'top',
    textLines: ['75%', '60%', '80%', '55%'],
  },
  {
    headerHeight: 60,
    headlineWidth: '60%',
    imageHeight: 160,
    imagePosition: 'middle',
    textLines: ['80%', '65%', '70%', '50%', '75%'],
  },
  {
    headerHeight: 60,
    headlineWidth: '75%',
    imageHeight: 200,
    imagePosition: 'bottom',
    textLines: ['65%', '80%', '55%', '70%'],
  },
  {
    headerHeight: 60,
    headlineWidth: '55%',
    imageHeight: 170,
    imagePosition: 'top',
    textLines: ['70%', '85%', '60%', '75%', '50%'],
  },
];

export const AbstractSlide: React.FC<{
  config: SlideConfig;
  width: number;
  height: number;
}> = ({config, width, height}) => {
  const padding = 16;
  const lineHeight = 8;
  const lineGap = 12;

  const renderTextLines = () =>
    config.textLines.map((w, i) => (
      <div
        key={i}
        style={{
          width: w,
          height: lineHeight,
          backgroundColor: '#D0D0D0',
          borderRadius: 2,
          marginBottom: lineGap,
        }}
      />
    ));

  const renderImage = () => (
    <div
      style={{
        width: '85%',
        height: config.imageHeight,
        backgroundColor: '#E8E8E8',
        borderRadius: 6,
        marginBottom: lineGap,
      }}
    />
  );

  const renderHeadline = () => (
    <div
      style={{
        width: config.headlineWidth,
        height: 14,
        backgroundColor: '#555',
        borderRadius: 2,
        marginBottom: lineGap + 4,
      }}
    />
  );

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          width: '100%',
          height: config.headerHeight,
          backgroundColor: '#C4794A',
        }}
      />

      {/* Content */}
      <div style={{padding}}>
        {config.imagePosition === 'top' && renderImage()}
        {renderHeadline()}
        {config.imagePosition === 'middle' && renderImage()}
        {renderTextLines()}
        {config.imagePosition === 'bottom' && renderImage()}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/ryanmcneill/remotion-project && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AbstractSlide.tsx
git commit -m "feat: add AbstractSlide component with parameterized wireframe layouts"
```

---

### Task 5: DeckCarousel Component

**Files:**
- Create: `src/components/DeckCarousel.tsx`

- [ ] **Step 1: Create the DeckCarousel component**

Create `src/components/DeckCarousel.tsx`:

```tsx
import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate, Easing} from 'remotion';
import {AbstractSlide, SLIDE_CONFIGS} from './AbstractSlide';

// Swipe timing (in local frames relative to enterFrame)
const SETTLE_DURATION = 20; // frames after entrance before first slide is "ready"
const SWIPE_FRAMES = 15;
const HOLD_FRAMES = 20; // frames between swipes
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
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/ryanmcneill/remotion-project && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DeckCarousel.tsx
git commit -m "feat: add DeckCarousel component with slide swipe animation"
```

---

### Task 6: ProductDemo Main Composition

**Files:**
- Create: `src/ProductDemo.tsx`

- [ ] **Step 1: Create the ProductDemo composition**

Create `src/ProductDemo.tsx`:

```tsx
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DotGridBackground} from './components/DotGridBackground';
import {PromptBox} from './components/PromptBox';
import {BrowserWireframe} from './components/BrowserWireframe';
import {DeckCarousel} from './components/DeckCarousel';

// Beat timing (absolute frames)
const PROMPT_ENTER = 0;
const BROWSER_ENTER = 60;
const CAROUSEL_ENTER = 150;

// Layout
const LEFT_MARGIN = 80;
const PROMPT_Y = 80;
const BROWSER_Y = 280;
const BROWSER_WIDTH = 700;
const BROWSER_HEIGHT = 560;
const CAROUSEL_X = 1050;
const CAROUSEL_WIDTH = 480;
const CAROUSEL_HEIGHT = 854;

export const ProductDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <DotGridBackground />

      {/* Beat 1: URL Prompt Box — upper left */}
      <div style={{position: 'absolute', left: LEFT_MARGIN, top: PROMPT_Y}}>
        <PromptBox enterFrame={PROMPT_ENTER} />
      </div>

      {/* Beat 2: Website Wireframe — bottom left */}
      <div style={{position: 'absolute', left: LEFT_MARGIN, top: BROWSER_Y}}>
        <BrowserWireframe
          enterFrame={BROWSER_ENTER}
          width={BROWSER_WIDTH}
          height={BROWSER_HEIGHT}
        />
      </div>

      {/* Beat 3: Deck Carousel — right half, vertically centered */}
      <div
        style={{
          position: 'absolute',
          left: CAROUSEL_X,
          top: (1080 - CAROUSEL_HEIGHT) / 2,
        }}
      >
        <DeckCarousel
          enterFrame={CAROUSEL_ENTER}
          frameWidth={CAROUSEL_WIDTH}
          frameHeight={CAROUSEL_HEIGHT}
        />
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/ryanmcneill/remotion-project && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/ProductDemo.tsx
git commit -m "feat: add ProductDemo main composition with layout and timing"
```

---

### Task 7: Register Composition and Preview

**Files:**
- Modify: `src/Root.tsx`

- [ ] **Step 1: Add the composition to Root.tsx**

Add this import at the top of `src/Root.tsx`:

```tsx
import {ProductDemo} from './ProductDemo';
```

Add this `<Composition>` inside the fragment, after the existing compositions:

```tsx
<Composition
  id="DonorSparkProductDemo"
  component={ProductDemo}
  durationInFrames={360}
  fps={30}
  width={1920}
  height={1080}
/>
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/ryanmcneill/remotion-project && npx tsc --noEmit
```

- [ ] **Step 3: Start Remotion Studio and preview**

```bash
cd /Users/ryanmcneill/remotion-project && npm start
```

Open the Remotion Studio in the browser. Select `DonorSparkProductDemo` from the composition dropdown. Scrub through the timeline and verify:

1. Cream background with subtle dot grid is visible
2. Prompt box springs in at frame 0, typewriter starts at frame 15, completes around frame 75
3. Blinking cursor appears after typing finishes
4. Browser wireframe pops in at frame 60, scanning starts at frame 90
5. Scanner highlight sweeps down 6 text lines, each line turns terra cotta briefly
6. Hero block pulses after scan completes
7. Deck carousel slides in from the right at frame 150
8. 3 slide swipes occur with smooth eased transitions
9. Final slide holds until frame 360
10. All elements float gently when idle

**Tuning:** Layout positions, swipe timing, and float amplitudes may need fine-tuning in the Remotion Studio preview.

- [ ] **Step 4: Commit**

```bash
git add src/Root.tsx
git commit -m "feat: register DonorSparkProductDemo composition in Root"
```

---

### Task 8: Render Final Video

- [ ] **Step 1: Render the MP4**

```bash
cd /Users/ryanmcneill/remotion-project
npx remotion render DonorSparkProductDemo out/donorspark-product-demo.mp4
```

Expected: Creates `out/donorspark-product-demo.mp4`, 1920x1080, 12 seconds, 30fps.

- [ ] **Step 2: Play the rendered video to verify**

```bash
open /Users/ryanmcneill/remotion-project/out/donorspark-product-demo.mp4
```

Verify the animation plays smoothly — beats cascade naturally, no jarring cuts, all elements visible.
