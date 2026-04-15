# DonorSpark Logo Sting — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 2.5-second animated logo sting where a cursor clicks the DonorSpark sparkle into existence, as a standalone Remotion composition.

**Architecture:** Four independent components (LogoText, SparkleIcon, CursorPointer, GlowEffect) orchestrated by a main LogoSting composition. Each component owns its own animation logic using `useCurrentFrame()` and receives its start frame as a prop. Registered as a new composition in Root.tsx alongside the existing DonorSparkPromo.

**Tech Stack:** Remotion 4.x, React 18, TypeScript, `spring()` / `interpolate()` for all animation.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/LogoSting.tsx` | Main composition — background gradient, layout, orchestrates child components via absolute positioning |
| `src/components/LogoText.tsx` | Renders `donorsparklogo.png` with fade+scale entrance animation |
| `src/components/SparkleIcon.tsx` | 4-pointed star SVG with pop, rotation, and twinkle animations |
| `src/components/CursorPointer.tsx` | Pointer SVG with arc movement, click scale, and exit animations |
| `src/components/GlowEffect.tsx` | Radial gradient circle that blooms and fades behind the sparkle |
| `src/Root.tsx` | Modified — add DonorSparkLogoSting composition registration |

---

### Task 1: SparkleIcon Component

**Files:**
- Create: `src/components/SparkleIcon.tsx`

The sparkle is the most self-contained piece — a pure SVG with animation props. Build it first so it can be previewed in isolation.

- [ ] **Step 1: Create the SparkleIcon component**

Create `src/components/SparkleIcon.tsx`:

```tsx
import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate, Easing} from 'remotion';

export const SparkleIcon: React.FC<{
  startFrame: number;
  size: number;
}> = ({startFrame, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const localFrame = frame - startFrame;

  // Pop entrance: scale 0 → 1 with bouncy spring
  const popScale = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: {damping: 8},
  });

  // Rotation during pop: spring overshoot creates natural 0° → ~20° → 0°
  const rotationSpring = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: {damping: 8},
  });
  const rotation = interpolate(rotationSpring, [0, 1], [0, 20]);

  // Twinkle pulse: starts 5 frames after pop, scale 1.0 → 1.15 → 1.0
  const twinkleStart = 5;
  const twinkleDuration = 10;
  const twinkleProgress = interpolate(
    localFrame,
    [twinkleStart, twinkleStart + twinkleDuration / 2, twinkleStart + twinkleDuration],
    [0, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const twinkleScale = 1 + twinkleProgress * 0.15;

  // Combined scale: pop * twinkle (twinkle only matters once pop settles near 1)
  const combinedScale = popScale * twinkleScale;

  // Don't render before start frame
  if (localFrame < 0) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ryanmcneill/remotion-project
git add src/components/SparkleIcon.tsx
git commit -m "feat: add SparkleIcon component with pop and twinkle animations"
```

---

### Task 2: CursorPointer Component

**Files:**
- Create: `src/components/CursorPointer.tsx`

The cursor has the most complex animation path — arc movement, click press, and exit.

- [ ] **Step 1: Create the CursorPointer component**

Create `src/components/CursorPointer.tsx`:

```tsx
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
  const enterDuration = clickFrame - enterFrame;
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ryanmcneill/remotion-project
git add src/components/CursorPointer.tsx
git commit -m "feat: add CursorPointer component with arc movement and click animation"
```

---

### Task 3: LogoText Component

**Files:**
- Create: `src/components/LogoText.tsx`

Renders the logo PNG with a spring scale + fade entrance.

- [ ] **Step 1: Create the LogoText component**

Create `src/components/LogoText.tsx`:

```tsx
import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile} from 'remotion';

export const LogoText: React.FC<{
  width: number;
}> = ({width}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Fade in: opacity 0 → 1 over frames 0–10
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scale in: spring from 0.8 → 1.0, snappy with minimal overshoot
  const scaleSpring = spring({
    frame,
    fps,
    config: {damping: 12, stiffness: 180},
  });
  const scale = interpolate(scaleSpring, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <Img
        src={staticFile('donorsparklogo.png')}
        style={{width, height: 'auto'}}
      />
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ryanmcneill/remotion-project
git add src/components/LogoText.tsx
git commit -m "feat: add LogoText component with spring scale entrance"
```

---

### Task 4: GlowEffect Component

**Files:**
- Create: `src/components/GlowEffect.tsx`

A radial glow that blooms behind the sparkle after the click.

- [ ] **Step 1: Create the GlowEffect component**

Create `src/components/GlowEffect.tsx`:

```tsx
import React from 'react';
import {useCurrentFrame, interpolate, Easing} from 'remotion';

export const GlowEffect: React.FC<{
  startFrame: number;
  size: number;
}> = ({startFrame, size}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  // Bloom: scale 0 → 1.5 → 0 over 15 frames
  const bloomDuration = 15;
  const bloomProgress = interpolate(
    localFrame,
    [0, bloomDuration * 0.4, bloomDuration],
    [0, 1.5, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Opacity: fades in then out
  const opacity = interpolate(
    localFrame,
    [0, bloomDuration * 0.3, bloomDuration],
    [0, 0.15, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  if (localFrame < 0 || localFrame > bloomDuration) return null;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #C4794A 0%, transparent 70%)',
        transform: `scale(${bloomProgress})`,
        opacity,
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -size / 2,
        marginLeft: -size / 2,
        pointerEvents: 'none',
      }}
    />
  );
};
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ryanmcneill/remotion-project
git add src/components/GlowEffect.tsx
git commit -m "feat: add GlowEffect component with radial bloom animation"
```

---

### Task 5: LogoSting Main Composition

**Files:**
- Create: `src/LogoSting.tsx`

The main composition that sets up the background, positions all elements, and passes timing props.

- [ ] **Step 1: Create the LogoSting composition**

Create `src/LogoSting.tsx`:

```tsx
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LogoText} from './components/LogoText';
import {SparkleIcon} from './components/SparkleIcon';
import {CursorPointer} from './components/CursorPointer';
import {GlowEffect} from './components/GlowEffect';

// Frame constants
const CURSOR_ENTER = 12;
const CLICK_FRAME = 30;
const SPARKLE_POP = 31;
const GLOW_START = 31;
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

      {/* Glow — positioned behind sparkle */}
      <div
        style={{
          position: 'absolute',
          left: sparkleX,
          top: sparkleY,
        }}
      >
        <GlowEffect startFrame={GLOW_START} size={120} />
      </div>

      {/* Sparkle — positioned over the black sparkle in the logo */}
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/ryanmcneill/remotion-project
git add src/LogoSting.tsx
git commit -m "feat: add LogoSting main composition with layout and timing orchestration"
```

---

### Task 6: Register Composition and Preview

**Files:**
- Modify: `src/Root.tsx`

- [ ] **Step 1: Add the composition to Root.tsx**

Add the import and composition registration. The existing `DonorSparkPromo` stays untouched.

Add this import at the top of `src/Root.tsx`:

```tsx
import {LogoSting} from './LogoSting';
```

Add this `<Composition>` inside the fragment, after the existing one:

```tsx
<Composition
  id="DonorSparkLogoSting"
  component={LogoSting}
  durationInFrames={75}
  fps={30}
  width={1920}
  height={1080}
/>
```

- [ ] **Step 2: Start Remotion Studio and preview**

```bash
cd /Users/ryanmcneill/remotion-project
npm start
```

Open the Remotion Studio in the browser. Select `DonorSparkLogoSting` from the composition dropdown. Scrub through the timeline and verify:

1. Logo fades and scales in from 80% during frames 0–15
2. Cursor enters from bottom-right starting at frame 12
3. Cursor arrives at sparkle position and clicks at frame 30
4. Sparkle pops in with bounce at frame 31, terra cotta colored
5. Sparkle twinkles (scale pulse) a few frames after pop
6. Glow blooms behind sparkle and fades
7. Cursor exits to the right by frame 48
8. Logo holds clean on cream gradient from frame 54–75
9. The terra cotta sparkle covers the black sparkle from the logo PNG

**Tuning:** The sparkle position constants (`SPARKLE_OFFSET_X`, `SPARKLE_OFFSET_Y`, `SPARKLE_SIZE`) will likely need adjustment to align precisely with the black sparkle in the PNG. Use the Remotion Studio frame-by-frame scrubber to fine-tune these values. Similarly, cursor start position and arc path may need tweaking for the most natural feel.

- [ ] **Step 3: Commit**

```bash
cd /Users/ryanmcneill/remotion-project
git add src/Root.tsx
git commit -m "feat: register DonorSparkLogoSting composition in Root"
```

---

### Task 7: Render Final Video

- [ ] **Step 1: Render the MP4**

After previewing and tuning in Studio:

```bash
cd /Users/ryanmcneill/remotion-project
npx remotion render DonorSparkLogoSting out/donorspark-logo-sting.mp4
```

Expected: Creates `out/donorspark-logo-sting.mp4`, 1920x1080, 2.5 seconds, 30fps.

- [ ] **Step 2: Play the rendered video to verify**

```bash
open /Users/ryanmcneill/remotion-project/out/donorspark-logo-sting.mp4
```

Verify the animation plays smoothly at full speed and the timing feels right — friendly and snappy, not too fast, not too slow.
