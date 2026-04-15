# DonorSpark Product Demo — Design Spec

## Overview

A 12-second animated product demo showing the DonorSpark flow: paste a nonprofit URL → website gets scanned → impact deck appears. Purely visual, no text overlay or branding. Three overlapping beats on a warm branded background with energetic spring choreography.

## Output

- **Dimensions:** 1920x1080 (landscape)
- **Duration:** 12 seconds (360 frames at 30fps)
- **Format:** MP4 via Remotion render
- **Composition ID:** `DonorSparkProductDemo`

## Background

Warm cream (#F2EFE8) with a subtle dot grid pattern:
- Dots: terra cotta (#C4794A) at ~8% opacity
- Spacing: 40px grid
- Implemented as a CSS `radial-gradient` repeating pattern on an `AbsoluteFill`

## Layout

Three elements occupy distinct regions of the 1920x1080 canvas:

| Element | Region | Approximate Bounds |
|---------|--------|-------------------|
| URL Prompt Box | Upper-left quadrant | x: 80, y: 80, w: 700, h: 140 |
| Website Wireframe | Bottom-left quadrant | x: 80, y: 280, w: 700, h: 560 |
| Deck Carousel | Right half | x: 1050, y: 80, w: 540 (9:16 ratio → h: 960), centered vertically |

All elements use absolute positioning within the composition.

## Beat 1: URL Input (Frames 0–90, 0s–3s)

### Prompt Box

A rounded rectangle container springs in:
- White fill (#FFFFFF), 12px border-radius, subtle box-shadow
- Spring entrance: scale 0.8 → 1.0, opacity 0 → 1 over frames 0–12
- Config: `{ damping: 12, stiffness: 180 }` (same as logo sting)

### Typewriter Text

Inside the prompt box, monospace text types out `www.mynonprofit.org`:
- Font: system monospace, ~24px, color ink (#1A1A18)
- One character appears every 3 frames (starting frame 15)
- `www.mynonprofit.org` = 20 characters → typing spans frames 15–75 (2 seconds)
- A blinking cursor (thin terra cotta bar) follows the text, blinks at 500ms intervals after typing completes
- Implementation: `useCurrentFrame()` to calculate `text.substring(0, charCount)` where `charCount = Math.floor((frame - 15) / 3)`

### Persistence

The prompt box stays visible for the entire video after appearing. After typing completes, it has a gentle float (±2px translateY oscillation, ~2 second period using `Math.sin()`).

## Beat 2: Website Scan (Frames 60–210, 2s–7s)

### Browser Wireframe

A simplified browser chrome pops in at frame 60:
- Light gray border (#E0E0E0), 8px border-radius
- Thin top bar (30px) with three small dots (red/yellow/green circles) representing browser controls
- Spring entrance: scale 0.85 → 1.0, opacity 0 → 1
- Config: `{ damping: 12, stiffness: 180 }`

### Wireframe Content

Inside the browser frame, abstract website elements:
- **Nav bar:** A thin horizontal rectangle at the top (10px tall, 90% width, #D0D0D0)
- **Hero block:** A larger rectangle below nav (120px tall, 95% width, #E8E8E8)
- **Text lines:** 6 lines of varying widths (60-90% of container width, 8px tall, #D8D8D8), spaced 16px apart vertically below the hero
- All content elements fade in with the browser frame

### Scanning Effect

Starting at frame 90 (1 second after browser appears):
- A terra cotta highlight bar (#C4794A at 30% opacity, full width of text area, 12px tall) sweeps down from the first text line to the last
- Each line gets highlighted for ~10 frames before the highlight moves to the next line
- As the highlight passes each line, that line briefly changes color to terra cotta (#C4794A at 60% opacity) then fades back to gray over 8 frames
- The scan covers 6 lines over ~60 frames (frames 90–150)
- After scanning completes, the hero block also briefly pulses terra cotta (frames 155–170)

### Persistence

The browser wireframe stays visible after appearing. After scanning completes, gentle float (±2px, offset phase from the prompt box so they don't bob in unison).

## Beat 3: Deck Carousel (Frames 150–360, 5s–12s)

### Phone Frame

A 9:16 aspect ratio frame springs in from the right side at frame 150:
- Rounded rectangle, 12px border-radius, subtle shadow
- White fill with a thin gray border (#E0E0E0)
- Dimensions: ~480px wide × 854px tall (9:16)
- Spring entrance: slides in from x: 1920+100 to final position, with spring config `{ damping: 14, stiffness: 160 }`
- Simultaneous scale 0.9 → 1.0

### Abstract Slides

Each slide inside the frame contains:
- **Header bar:** Terra cotta (#C4794A) rectangle at the top (60px tall, full width)
- **Headline block:** A wider, bolder rectangle below the header (14px tall, 70% width, #555)
- **Body text lines:** 4-5 thin gray lines (8px tall, 50-80% width, #D0D0D0)
- **Image placeholder:** A rounded rectangle (~180px tall, 85% width, #E8E8E8) positioned mid-slide
- Each slide varies slightly in layout: different line widths, image position (top vs. middle vs. bottom), number of text lines. This prevents them from looking identical.

### Slide Swipe Animation

- 4 slides total, swiping left (current slide exits left, next enters from right)
- First slide visible from frame 170 (after entrance settles) to frame 220
- Swipe transition: 15 frames each, using `Easing.inOut(Easing.quad)`
- Swipe 1: frames 220–235
- Swipe 2: frames 255–270
- Swipe 3: frames 290–305
- Final slide holds from frame 305 to frame 360

### Persistence

The carousel stays visible after appearing. Between swipes, the frame has a gentle float like the other elements.

## Component Structure

```
src/
  ProductDemo.tsx              — Main composition component
  components/
    DotGridBackground.tsx      — Cream background with dot grid pattern
    PromptBox.tsx              — URL input with typewriter animation
    BrowserWireframe.tsx       — Browser chrome + abstract website content + scanner
    DeckCarousel.tsx           — Phone frame + abstract slides + swipe animation
    AbstractSlide.tsx          — Single abstract slide layout (parameterized)
```

## Animation Principles

- All entrances use `spring()` from Remotion — no CSS transitions
- All elements use the same spring config family (damping 12-14, stiffness 160-180) for visual consistency
- Floating/idle animation uses `Math.sin(frame / fps * Math.PI)` for smooth oscillation
- Elements overlap entrance timing by 1-2 seconds to create a flowing cascade, not a sequence of isolated events
- No exit animations — all elements persist after appearing

## Composition Registration

Add to `Root.tsx`:

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

## Rendering

```bash
npx remotion render DonorSparkProductDemo out/donorspark-product-demo.mp4
```
