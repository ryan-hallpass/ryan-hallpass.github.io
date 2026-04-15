---
name: social-media-proposal
description: Generate a single-page HTML proposal website for Anecdotal's social media consulting packages. Uses the Salvo SC design system.
---

# Social Media Consulting Proposal Generator

Generate a professional, single-page HTML proposal website for social media consulting engagements by Anecdotal (anecdotal.media).

## When to Use

When creating a new social media consulting proposal for a client organization. Invoke the frontend-design skill to generate the actual HTML, providing it with the design system and section structure below as constraints.

## Required Inputs

Gather these from the user before generating:

1. **Organization name** — the client
2. **Pain points** — 2-3 social media challenges specific to this client
3. **What's working** — current bright spots to acknowledge
4. **Opportunity framing** — the transformation statement (e.g., "From Quiet Impact to Visible Mission")

## Inputs with Defaults

These have sensible defaults but can be overridden:

| Input | Default |
|-------|---------|
| Accent color | `#CC5033` |
| Package 1 name | Story Foundation |
| Package 1 price | $5,500 one-time |
| Package 1 deliverables | Discovery & stakeholder interviews ($1,500 value), Social media & communications audit ($2,000 value), Storytelling playbook ($2,500 value), Staff story training — 1hr live ($2,000 value), Organizational impact story deck ($3,000 value). Total value: $11,000+ |
| Package 2 name | Story Activation |
| Package 2 price | $3,500 initiation + $500/mo ($9,500 Year 1) |
| Package 2 deliverables | Everything in Package 1, PLUS: 1-year content calendar ($3,000 value), Social media templates ($1,500 value), Social media best practices guide ($1,000 value), 1 campaign video per year ($5,000 value), Monthly coaching — 1hr ($included). Total value: $28,800+ |
| Case studies | Sea Cadets (13M+ views, $800K grant, more social engagement than Boy Scouts), Texas Hearing Institute (+45% donations, $1M gala), BGC Permian Basin (current client, same engagement type) |
| Timeline | 6-week: Discover (weeks 1-2), Build (weeks 3-5), Launch (week 6) |
| Prepared by | Ryan McNeill / Anecdotal |
| Contact email | ryan@anecdotal.media |

## Output

A single self-contained `index.html` file written to a user-specified path. The file should be ready for GitHub Pages deployment.

## Design System — Salvo Base

### Fonts (Google Fonts)

```
Funnel Display:wght@300;400;500;600;700;800
Libre Caslon Text:ital,wght@0,400;0,700;1,400
DM Sans:opsz,wght@9..40,300;9..40,400;9..40,500
```

### CSS Custom Properties

```css
:root {
  --accent: #CC5033;          /* swappable per client */
  --accent-light: rgba(204,80,51,0.07);
  --accent-mid: rgba(204,80,51,0.15);
  --black: #0F0F0F;
  --ink: #1A1A1A;
  --ink2: #3D3D3D;
  --ink3: #6B6B6B;
  --ink4: #9A9A9A;
  --rule: #E5E3DF;
  --bg: #FAF9F7;
  --bg2: #F3F1EE;
  --white: #FFFFFF;
}
```

When the accent color is overridden, also update `--accent-light` and `--accent-mid` to use the new color's RGB values at 0.07 and 0.15 opacity.

### Typography Rules

| Role | Font | Weight | Size | Other |
|------|------|--------|------|-------|
| Kicker | DM Sans | 500 | 11px | uppercase, letter-spacing: 0.18em, color: --accent, preceded by 20px horizontal line |
| h1 (hero) | Funnel Display | 700 | clamp(44px, 5.5vw, 80px) | line-height: 1.0, color: --black |
| h1 em | Libre Caslon Text | 400 italic | inherit | color: --accent |
| h2 (sections) | Funnel Display | 700 | clamp(32px, 4vw, 52px) | line-height: 1.08, max-width: 760px |
| h2 em | Libre Caslon Text | 400 italic | inherit | color: --accent |
| Body | DM Sans | 300 | 17px (hero), 16px (sections) | line-height: 1.75-1.8, color: --ink2 |
| Pull quotes | Libre Caslon Text | 400 italic | clamp(18px, 2vw, 26px) | color: white on accent backgrounds |
| Stats number | Funnel Display | 700-800 | 34-38px | color: --black or --accent |
| Stats label | DM Sans | 300 | 12px | color: --ink3 |

### Layout Components

**Fixed header:**
- `position: fixed`, full width, z-index 200
- `background: rgba(250,249,247,0.93)`, `backdrop-filter: blur(12px)`
- `border-bottom: 1px solid var(--rule)`
- Left: Anecdotal SVG logo + `×` separator + client name (Funnel Display 500, 14px)
- Right: CTA button (`.btn-primary` — accent background, white text, 13px DM Sans 500, 11px 24px padding, 3px border-radius)
- Mobile: 16px 24px padding

**Split-grid hero:**
- `min-height: 100vh`, `grid-template-columns: 1fr 1fr`, `padding-top: 80px`
- Left: kicker + h1 + body (17px, max-width 480px) + CTA buttons + stat row (border-top separated)
- Right: accent-colored panel with diagonal stripe pattern (`repeating-linear-gradient(45deg, rgba(255,255,255,0.04)...)`), quote, attribution, optional stats
- Mobile: stacks to single column

**Section pattern:**
- Padding: 96px 56px (mobile: 64px 24px)
- `.s-alt` for alternate background (--bg2)
- `.s-dark` for dark sections (--black bg, white text)
- `.s-header`: 2-column grid (kicker+headline left, body text right)

**Package cards (`.phase`):**
- White background, 1px --rule border, 4px border-radius
- Hover: accent-tinted border, subtle box-shadow
- `.phase-head`: 3-column grid (large faded number | title+badge+subtitle | price)
- `.phase-body`: --bg background, 2-column deliverables grid
- Each deliverable: accent dot + bold title + description text

**Value stacking in deliverables:**
- Show retail value next to each deliverable
- Total stated value vs. investment at bottom

**Timeline (`.rmap`):**
- Vertical line on left (2px --rule)
- Each step: accent dot on line + label + title + body
- 3 steps: Discover (weeks 1-2), Build (weeks 3-5), Launch (week 6)

**Investment summary:**
- Side-by-side comparison table or grid
- Checkmarks for included items, dashes for not included
- Bold pricing at bottom
- ROI framing line below

**CTA section:**
- Full-width accent background with diagonal stripe pattern
- 2-column: headline+body left, buttons+contact right
- White button (primary) + ghost white button (secondary)
- Footer note with confidential marking

**Nav dots:**
- Fixed right side, vertical column of small circles
- Active dot: accent color, 1.5x scale
- Hidden on mobile

### Animations

```javascript
// Fade-up on scroll — add class "fu" to any element
const fus = document.querySelectorAll('.fu');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('v'); io.unobserve(e.target); }
  });
}, { threshold: 0.06 });
fus.forEach(el => io.observe(el));
```

```css
.fu { opacity:0; transform:translateY(20px); transition:opacity 0.5s ease, transform 0.5s ease; }
.fu.v { opacity:1; transform:translateY(0); }
```

Nav dots use a second IntersectionObserver to track which section is visible.

### Anecdotal Logo SVG

Use this inline SVG for the header and footer logo:

```html
<svg height="21" viewBox="0 0 142 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#lc)">
    <path fill="#000" d="m28.834 19.95-7.146 7.117v-13.5l7.146-6.15V19.95ZM15.797 6.901v12.983h5.107V13.21l7.33-6.308H15.797Zm-8.972 6.665v13.5l7.146-7.116V7.416l-7.146 6.15ZM.935 6.901v12.983H6.04V13.21l7.33-6.308H.934Zm32.955 6.506c0-4.002 2.983-6.753 6.51-6.753 1.454 0 2.884.492 3.772 1.425l.024-1.179h3.452v13.014h-3.452l-.024-1.179c-.888.933-2.318 1.424-3.773 1.424-3.526 0-6.509-2.75-6.509-6.752Zm7.027 3.216c1.775 0 3.082-1.252 3.082-3.216 0-1.964-1.307-3.217-3.082-3.217-1.8 0-3.131 1.252-3.131 3.217 0 1.964 1.331 3.216 3.131 3.216ZM54.946 6.58c3.55 0 5.72 2.162 5.72 5.648v7.686H56.77v-7.538c0-1.4-.666-2.186-1.824-2.186-1.16 0-1.825.786-1.825 2.186v7.538h-3.896v-7.686c0-3.486 2.17-5.647 5.72-5.647Zm6.73 6.876c0-4.1 2.959-6.875 6.756-6.875 3.575 0 6.854 2.43 6.312 7.882H65.35c.37 1.547 1.627 2.48 3.353 2.48 1.38 0 2.564-.59 3.526-1.793l2.515 2.087c-1.455 1.916-3.526 2.996-6.115 2.996-4.167 0-6.953-2.8-6.953-6.777Zm9.468-1.67c-.296-1.326-1.282-2.062-2.737-2.062-1.479 0-2.589.81-3.008 2.062h5.745Zm4.339 1.645c0-4.002 2.885-6.703 6.928-6.703.592 0 1.282.05 2.047.147v3.512a13.837 13.837 0 0 0-1.603-.123c-2.268 0-3.476 1.326-3.476 3.168 0 1.841 1.208 3.142 3.476 3.142.444 0 1.011-.049 1.603-.122v3.535c-.765.098-1.455.148-2.047.148-4.043 0-6.928-2.701-6.928-6.704ZM85 13.407c0-4.002 2.983-6.753 6.509-6.753 1.282 0 2.515.369 3.427 1.105a63.42 63.42 0 0 1-.074-3.118V.933h3.896v18.98h-3.452l-.025-1.178c-.887.933-2.317 1.424-3.772 1.424-3.526 0-6.51-2.75-6.51-6.752Zm7.027 3.216c1.775 0 3.082-1.252 3.082-3.216 0-1.964-1.307-3.217-3.082-3.217-1.8 0-3.132 1.252-3.132 3.217 0 1.964 1.332 3.216 3.132 3.216Zm7.889-3.192c0-4.002 3.107-6.85 6.978-6.85 3.871 0 6.977 2.848 6.977 6.85 0 4.003-3.106 6.851-6.977 6.851-3.871 0-6.978-2.848-6.978-6.85Zm6.978 3.242c1.75 0 3.082-1.302 3.082-3.241 0-1.94-1.332-3.242-3.082-3.242-1.751 0-3.082 1.302-3.082 3.242s1.331 3.24 3.082 3.24Zm8.925-6.286h-1.554V6.9h1.554V3.56l3.895-1.252V6.9h1.578v3.487h-1.578l-.024 9.527h-3.896l.025-9.527Zm5.868 3.02c0-4.002 2.983-6.753 6.509-6.753 1.455 0 2.885.492 3.772 1.425l.025-1.179h3.452v13.014h-3.452l-.025-1.179c-.887.933-2.317 1.424-3.772 1.424-3.526 0-6.509-2.75-6.509-6.752Zm7.027 3.216c1.775 0 3.082-1.252 3.082-3.216 0-1.964-1.307-3.217-3.082-3.217-1.8 0-3.132 1.252-3.132 3.217 0 1.964 1.332 3.216 3.132 3.216ZM137.17.933h3.896v18.98h-3.896V.934Z"/>
    <path fill="var(--accent, #CC5033)" d="m28.834 19.95-7.146 7.117v-13.5l7.146-6.15V19.95ZM15.797 6.901v12.983h5.107V13.21l7.33-6.308H15.797Zm-8.972 6.665v13.5l7.146-7.116V7.416l-7.146 6.15ZM.935 6.901v12.983H6.04V13.21l7.33-6.308H.934Z"/>
  </g>
  <defs><clipPath id="lc"><path fill="#fff" d="M0 0h142v28H0z"/></clipPath></defs>
</svg>
```

For the footer, use `fill="rgba(255,255,255,0.35)"` instead and change clip-path id to `lf`.

## Section Structure (10 Sections)

Generate all 10 sections in this exact order:

### 01 — Hero (`id="s0"`)
- Split grid. Left: kicker ("A SOCIAL MEDIA PARTNERSHIP · Prepared for [Org Name] · [Month Year]"), h1 with italic emphasis, body paragraph, two CTA buttons ("View the Offer" → #packages, secondary → #opportunity), hero stats row.
- Right: accent panel with org quote/mission, attribution, optional stats.

### 02 — Context (`id="context"`)
- Kicker: "WHO YOU ARE"
- Headline with italic emphasis showing understanding of the org
- Body text: 3-4 sentences covering mission, structure, current situation
- Use `.s-header` 2-column layout

### 03 — The Opportunity (`id="opportunity"`)
- Kicker: "THE OPPORTUNITY"
- Headline with transformation framing
- Grid of 2-3 opportunity cards (use `.heard-grid` pattern with `.hcard` cards)
- Each card: numbered, bold title, body text, optional pull quote

### 04 — Our Approach (`id="approach"`)
- Kicker: "OUR APPROACH"
- Headline about storytelling philosophy
- Body text explaining why human stories > broadcasting
- Use `.s-alt` background
- Brief — 1 headline + 1-2 paragraphs max

### 05 — Social Proof (`id="proof"`)
- Kicker: "WHY ANECDOTAL"
- Headline about track record
- Use `.s-dark` background
- Stat grid on left (Sea Cadets + THI metrics), testimonial card on right
- BGC Permian Basin callout below
- Use `.proof-cols` layout from Salvo

### 06 — Package 1 (`id="packages"`)
- Kicker: "THE PROPOSAL"
- Section headline introducing both packages
- `.phase` card with:
  - `.phase-head`: large "01" number, "STORY FOUNDATION" badge, title, subtitle, $5,500 price
  - `.phase-body`: 2-column deliverables with accent dots, value listed per item
  - Positioning line at bottom

### 07 — Package 2
- Second `.phase` card (no new section header — continues from 06):
  - `.phase-head`: large "02" number, "STORY ACTIVATION" badge, title, subtitle, $3,500 + $500/mo price
  - `.phase-body`: 2-column deliverables — "Everything in Package 1" note + additional items
  - Positioning line at bottom

### 08 — Timeline (`id="timeline"`)
- Kicker: "THE TIMELINE"
- Headline about 6-week launch
- `.rmap` vertical timeline with 3 steps: Discover, Build, Launch
- Use `.s-alt` background

### 09 — Investment Summary (`id="investment"`)
- Side-by-side comparison table of both packages
- Use `.price-table` pattern or a clean comparison grid
- ROI framing below the table

### 10 — CTA (`id="next-steps"`)
- `.cta-s` full-width accent section
- Headline: "Let's Build Something That Lasts"
- Body: 1-2 sentences
- White CTA button (email link) + ghost button (see our work)
- Contact info + confidential footer

### Footer
- Dark background, Anecdotal logo (white/faded), confidential note with date

### Nav Dots
- Fixed right side, one dot per section
- Active tracking via IntersectionObserver

## Mobile Responsive Breakpoints

- 768px: hero stacks, sections go single-column, nav dots hidden, CTA stacks
- 900px: `.s-header` goes single-column
- 800px: `.phase-head` stacks, `.phase-cols` stacks
- 600px: `.heard-grid` goes single-column

## Process

1. Ask the user for the required inputs (org name, pain points, what's working, opportunity framing)
2. Confirm any defaults they want to override
3. Invoke the `frontend-design` skill with the design system above as constraints
4. Generate the complete `index.html` as a single file
5. Write it to the user-specified output path
