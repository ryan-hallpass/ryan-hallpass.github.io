# DonorSpark Logo Sting — Design Spec

## Overview

A 2.5-second animated logo sting for DonorSpark. A cursor clicks the sparkle into existence — reinforcing the brand's "friendly, accessible, easy" identity. Standalone composition in the existing Remotion project.

## Output

- **Dimensions:** 1920x1080 (landscape)
- **Duration:** 2.5 seconds (75 frames at 30fps)
- **Format:** MP4 via Remotion render
- **Composition ID:** `DonorSparkLogoSting`

## Background

Warm cream with a subtle radial gradient matching the DonorSpark.app homepage:
- Center/upper-left: soft peach-blush (`#F5E6DC`)
- Edges: cool cream (`#F2EFE8`)
- Implemented as a CSS `radial-gradient` on an `AbsoluteFill`

## Assets

Two images from `public/`, used as separate animated layers:

| Asset | Source | Role |
|-------|--------|------|
| Logo text | `donorsparklogo.png` | The "DonorSpark" wordmark (terra cotta text, no sparkle — crop or mask the sparkle area if present) |
| Sparkle | Extracted or drawn as SVG | 4-pointed star in terra cotta (`#C4794A`), animated independently |
| Cursor | Inline SVG | Simple white pointer with subtle drop shadow |

**Logo text approach:** The main `donorsparklogo.png` includes a black sparkle. Rather than cropping, we'll render the full logo image and overlay the animated terra cotta sparkle on top of the black one, covering it. The sparkle starts at scale 0 (invisible), so the black sparkle is visible briefly during the text entrance — but since the cursor click happens quickly, this is negligible. If the black sparkle is distracting, we can crop it in a later pass.

**Sparkle SVG:** A 4-pointed star drawn inline as an SVG `<path>`. Terra cotta fill (`#C4794A`). Sized to match the proportional size of the sparkle in the original logo relative to the text.

**Cursor SVG:** Standard macOS-style pointer arrow. White fill with a thin dark stroke and a subtle `drop-shadow` filter. Sized at roughly 32x32px at the composition's scale.

## Animation Choreography

All animations driven by `useCurrentFrame()` + `spring()` / `interpolate()`. No CSS transitions or Tailwind animations.

### Beat 1: Logo Text Entrance (frames 0–15, 0.0s–0.5s)

- Logo image fades in: opacity `0 → 1` over frames 0–10, clamped
- Logo image scales in: `spring()` from 0.8 → 1.0
  - Config: `{ damping: 12, stiffness: 180 }` — snappy with minimal overshoot
- Logo is centered horizontally and vertically in the composition

### Beat 2: Cursor Enters (frames 12–30, 0.4s–1.0s)

- Cursor starts off-screen at bottom-right (e.g., `x: 1200, y: 800` relative to center)
- Moves to the sparkle's target position using `interpolate()` with `Easing.inOut(Easing.quad)`
- Path has a slight arc — interpolate x and y with slightly different easing to create a natural curve (x uses `Easing.out(Easing.quad)`, y uses `Easing.inOut(Easing.quad)`)
- Cursor opacity fades in over the first 3-4 frames of its entrance

### Beat 3: Click + Sparkle Pop (frames 30–36, 1.0s–1.2s)

- **Cursor click:** Scale dips to 0.85 over 2 frames, then back to 1.0 over 2 frames (interpolate, clamped)
- **Sparkle entrance:** Triggered at the click frame (frame 31)
  - Scale: `spring()` from 0 → 1, config `{ damping: 8 }` — bouncy pop
  - Rotation: `spring()` mapped via `interpolate()` to `0° → 20° → 0°` (the spring overshoot handles the return naturally)
  - The sparkle appears at the exact position where the sparkle sits in the original logo layout

### Beat 4: Twinkle + Cursor Exit (frames 36–54, 1.2s–1.8s)

- **Sparkle twinkle:** A single pulse — scale `1.0 → 1.15 → 1.0` using `interpolate()` with `Easing.inOut(Easing.sin)` over ~10 frames
- **Glow:** A radial gradient circle behind the sparkle, same terra cotta at ~15% opacity, scales from 0 → 1.5 → 0 over ~15 frames. Creates a soft bloom effect.
- **Cursor exit:** Slides off-screen to the right using `interpolate()` with `Easing.in(Easing.quad)`. Opacity fades to 0 over the last 4 frames.

### Beat 5: Hold (frames 54–75, 1.8s–2.5s)

- Everything holds static. Full logo with terra cotta sparkle sits clean on the cream gradient.
- No motion — gives the logo a beat to breathe before the sting ends.

## Component Structure

```
src/
  LogoSting.tsx          — Main composition component
  components/
    CursorPointer.tsx    — Cursor SVG + click animation logic
    SparkleIcon.tsx      — 4-pointed star SVG + pop/twinkle animation
    LogoText.tsx         — Logo image + entrance animation
    GlowEffect.tsx      — Radial glow behind sparkle
```

## Composition Registration

Add to `Root.tsx`:

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

## Rendering

```bash
npx remotion render DonorSparkLogoSting out/donorspark-logo-sting.mp4
```

## Design Principles

- **Friendly, not silly:** Springs have enough damping to feel snappy and confident, not cartoonish
- **The cursor tells a story:** "Just click and it sparks to life" — mirrors the product experience
- **Brand-cohesive:** Terra cotta sparkle, cream gradient background, all from the existing DonorSpark palette
- **Simple and fast:** 2.5 seconds, no complex particle systems or 3D, just well-timed springs
