---
name: proposal-website
description: Generate a single-page HTML proposal website for Anecdotal client pitches. Uses the Salvo SC design system (full-viewport slides, Georgia serif, data-reveal animations, dot-pattern backgrounds). Works for any type of consulting engagement.
---

# Proposal Website Generator

Generate a professional, single-page HTML proposal website for Anecdotal (anecdotal.media) client engagements. Produces a self-contained `index.html` ready for GitHub Pages deployment.

## When to Use

When creating a proposal website for any client engagement — social media consulting, AI coaching, marketing partnerships, or any other service Anecdotal offers.

## Required Inputs

Gather these from the user before generating:

1. **Engagement type** — what kind of proposal (e.g., social media consulting, AI coaching, full marketing partnership)
2. **Organization name** — the client
3. **Key context** — what you know about the org, their pain points, what's working
4. **What you're proposing** — services, packages, pricing, timeline
5. **Hero headline** — the main headline for the cover slide
6. **Cover image** — a hero photo (local file path or Unsplash URL)

## Inputs with Defaults

| Input | Default |
|-------|---------|
| Accent color | `#CC5033` (Salvo orange / --sage) |
| Case studies | Sea Cadets (13M+ views, $800K grant), Texas Hearing Institute (+45% donations), BGC Permian Basin (current client) |
| Prepared by | Ryan McNeill / Anecdotal |
| Contact email | ryan@anecdotal.media |
| Client logos | bgc-logo.png, sea-cadets-logo.png, noble-logo.png, thi-logo.png (white on transparent, copy from existing proposal repo) |

## Output

A single self-contained `index.html` file with inline CSS and inline JS. No external dependencies except images in the same directory. Deployed to a new repo under the `anecdotal-media` GitHub account with GitHub Pages enabled.

**Repo naming convention:** `anecdotal-media/[client-slug]-[engagement-type]` (e.g., `newview-proposal`, `newview-ai-coaching`)

## Design System — Salvo (Live Version)

**IMPORTANT:** The design system is based on the LIVE Salvo proposal at `anecdotal-media.github.io/salvo-proposal/`. If available, read `/tmp/salvo-check/index.html` or clone `anecdotal-media/salvo-proposal` as the CSS/JS reference. Copy the CSS and JS from that file, then modify content only.

### Core Aesthetic

- Full-viewport slides (each section is `min-height: 100vh`)
- Georgia serif + system sans-serif (NO Google Fonts)
- Warm, minimal, premium — rounded bento-box cards inspired by Perplexity
- Dot-pattern backgrounds on slides via `::before` pseudo-element
- Slide numbers in top-right corner
- Slide footers at bottom
- No fixed header, no nav dots
- Cover hero slides use background photos with dark gradient overlays

### CSS Custom Properties

```css
:root {
  --cream:      #FFFCE8;
  --ink:        #000000;
  --ink-soft:   #333333;
  --sage:       #CC5033;
  --sage-light: #E8A090;
  --sage-wash:  #F9EDE9;
  --warm-white: #FFFFFF;
  --rule:       rgba(0,0,0,0.12);
  --serif:      Georgia, 'Times New Roman', serif;
  --sans:       -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
}
```

### Typography

| Role | Font | Size | Notes |
|------|------|------|-------|
| Display (large headlines) | `var(--serif)` | `clamp(38px, 5.5vw, 64px)` | weight 400, line-height 1.08, letter-spacing -0.02em |
| Display-sm (section headlines) | `var(--serif)` | `clamp(26px, 3.5vw, 40px)` | same styling as display |
| `em` in headlines | `var(--serif)` | inherit | italic, color: var(--sage). On dark slides: var(--sage-light) |
| Eyebrow | `var(--sans)` | 10px | weight 500, letter-spacing 0.18em, uppercase, opacity 0.5 |
| Body | `var(--sans)` | 15px | weight 300, line-height 1.7, max-width 560px, opacity 0.75 |
| Card title | `var(--serif)` | 18px | weight 400, line-height 1.2 |
| Card body | `var(--sans)` | 13px | weight 300, line-height 1.65, opacity 0.7 |
| Metric value | `var(--serif)` | 40px | line-height 1, color: var(--sage-light) on dark |
| Metric label | `var(--sans)` | 11px | opacity 0.55, weight 300 |

### Slide Types

**Regular slide (`.slide`):** White background, dot-pattern overlay, full-viewport
**Dark slide (`.slide.slide--dark`):** Black background, light dot-pattern, cream/white text
**Sage slide (`.slide.slide--sage`):** `var(--sage-wash)` background, cards use white bg
**Cover hero (`.cover-hero`):** Background image with dark gradient overlay, used for first and last slides

### Layout Components (with Rounded Corners)

**Card grid (`.card-grid`):** 3-column grid, **16px gap**, cards have **16px border-radius**, `border: 1px solid rgba(0,0,0,0.06)`, padding 36px 32px. Use `.card--accent-top` for a 3px sage top accent.

**Metric strip (`.metric-strip`):** 4-column grid, **12px gap**, **14px border-radius** on each metric, `border: 1px solid rgba(255,255,255,0.06)` on dark slides.

**Price grid (`.price-grid`):** 2-column grid, **16px gap**, **16px border-radius**, `border: 1px solid rgba(0,0,0,0.06)`. `.price-card--featured` for dark highlighted card with `border: 1px solid rgba(255,255,255,0.08)`.

**Feature block (`.feature-block`):** Dark card with **16px border-radius**, decorative circle, used for pricing callouts inside package slides.

**Phase list (`.phase-list`):** Vertical list with **12px gap**, each `.phase-item` has **14px border-radius**, padding 28px 32px, `background: var(--warm-white)`, `border: 1px solid rgba(0,0,0,0.06)`.

**Two-col (`.two-col`):** 2-column grid, 56px gap, for side-by-side content.

**Deliverable list (`.deliverable-list`):** Stacked items with sage-colored dash prefix (14px × 2px), title + body.

**Quote block (`.quote-block`):** Left border accent (3px sage-light), **border-radius 0 14px 14px 0**, `background: rgba(255,255,255,0.04)`, padding 28px.

**Price badge (`.price-badge`):** **border-radius: 6px**.

**Cover hero bottom:** "Prepared for" / org name / date format.

### Dark Slide Cards

When placing cards on dark slides, use this styling instead of the default:
```css
background: rgba(255,255,255,0.04);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 16px;
```
With light text colors (cream, sage-light).

### Animations

```javascript
(function(){
  try {
    document.documentElement.classList.add('js-loaded');
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    var coverEls = document.querySelectorAll('.cover-hero [data-reveal]');
    setTimeout(function(){ coverEls.forEach(function(el){ el.classList.add('is-visible'); }); }, 100);
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    },{ threshold:0.15 });
    els.forEach(function(el){ if(!el.closest('.cover-hero')) io.observe(el); });
  } catch(e){}
})();
```

Use `data-reveal` attribute on elements. Use `data-delay="1"` through `data-delay="7"` for staggered reveals. Cover hero elements reveal immediately on page load.

### Anecdotal Logo SVG

Use the inline SVG from the Salvo reference file (the one with the geometric "A" mark + "anecdotal" wordmark). Cream-colored fill on dark backgrounds, black fill on light backgrounds. Use different clip-path IDs for header vs footer instances.

### Mobile Breakpoint

```css
@media (max-width:700px) {
  .slide { padding:52px 28px; min-height:auto; }
  .cover-hero { min-height:100vh; }
  .card-grid, .price-grid, .metric-strip, .two-col { grid-template-columns:1fr; }
  .phase-item { grid-template-columns:1fr; gap:8px; }
  .display { font-size:34px; }
  .display-sm { font-size:26px; }
}
```

## Typical Section Flow

Adapt based on engagement type. Not all sections are required.

1. **Cover hero** — background photo, headline, sub copy, "Prepared for" footer
2. **Context** ("What We Heard" / "Who You Are") — show you understand the org
3. **Problem/Opportunity** — pain points reframed as opportunities, metric strip
4. **Value proposition** — your approach, what they'll get/learn, card grid
5. **How It Works** — process, timeline, or engagement structure, phase list
6. **Detailed offering** — packages, deliverables, example projects (1-2 slides)
7. **Investment** — pricing, price grid or feature block
8. **Social proof** — case study metrics, testimonial quote, client logos
9. **CTA** — cover hero with different photo, "next step" headline, mailto button

## Social Proof Defaults

### Metric Strip

| Value | Label |
|-------|-------|
| 13M+ | Social media views for U.S. Naval Sea Cadets |
| 45% | Donation increase at Texas Hearing Institute from storytelling |
| 10× | More social engagement than the Boy Scouts |

### Testimonial

> "In our first year working with this team, they brought us out of obscurity and interest in Sea Cadets has never been higher. Marketing is no longer a stressor for me, but a great opportunity for growth and success."
> — Andy Lennon, Executive Director, U.S. Naval Sea Cadet Corps

### Client Logo Strip

On dark slides, below testimonial, with eyebrow "Organizations We've Worked With" (opacity 0.6):
- `bgc-logo.png` (height: 44px, opacity: 0.5)
- `sea-cadets-logo.png` (height: 36px, opacity: 0.5)
- `noble-logo.png` (height: 28px, opacity: 0.5)
- `thi-logo.png` (height: 40px, opacity: 0.5)

Copy these from an existing proposal repo into the new one.

## Process

1. Gather required inputs from the user
2. Determine which sections are needed based on engagement type
3. Clone `anecdotal-media/salvo-proposal` (or read cached version) for CSS/JS reference
4. Generate the complete `index.html`
5. Write to user-specified path
6. Create GitHub repo under `anecdotal-media` (switch to anecdotal-media account first: `gh auth switch --user anecdotal-media`), enable Pages, push

## Reference Proposals

### Social Media Consulting
- Repo: `anecdotal-media/newview-proposal`
- Packages with deliverables and value stacking
- Tiered pricing (one-time foundation + ongoing activation)
- Timeline: 6-week Discover/Build/Launch

### AI & Automation Coaching
- Repo: `anecdotal-media/newview-ai-coaching`
- Per-session pricing ($250/90 min)
- "What You'll Learn" cards instead of deliverable lists
- "Example Projects" instead of packages
- Flexible duration (6-8 weeks estimated)

### Full Marketing Partnership
- Repo: `anecdotal-media/salvo-proposal`
- Monthly retainer with add-ons
- Phased rollout (foundation phase → full partnership)
- Detailed deliverable breakdowns per phase
