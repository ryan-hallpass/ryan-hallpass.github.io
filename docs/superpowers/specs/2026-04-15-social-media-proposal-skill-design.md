# Social Media Proposal Skill — Design Spec

**Date:** 2026-04-15
**Author:** Ryan McNeill / Claude
**Status:** Draft

---

## Overview

A Claude Code skill that generates single-page HTML proposal websites for Anecdotal's social media consulting packages. The skill produces a self-contained `index.html` designed for GitHub Pages deployment, following the proven Salvo SC proposal design system.

The first proposal generated with this skill is for **NewView Oklahoma**.

## Skill Location

`~/.claude/skills/social-media-proposal/social-media-proposal.md`

## What the Skill Produces

A single self-contained `index.html` file with:
- Inline CSS and inline JS
- Google Fonts link (Funnel Display, Libre Caslon Text, DM Sans)
- Mobile-responsive layout
- Scroll-reveal animations via IntersectionObserver
- ~10 scroll sections following a hybrid narrative structure

Output is written to a user-specified path (typically a subfolder in a GitHub Pages repo, e.g., `anecdotal-media.github.io/newview-proposal/`).

## Skill Invocation

The skill is invoked conversationally. The user provides client-specific details and the skill instructs Claude to use the frontend-design skill for code generation, constrained to the Salvo design system and section structure defined below.

### Required Inputs

| Input | Description |
|-------|-------------|
| Organization name | Client name for the proposal |
| Pain points | 2-3 client-specific social media challenges |
| What's working | Current bright spots to acknowledge |
| Opportunity framing | The transformation statement |

### Inputs with Defaults

| Input | Default |
|-------|---------|
| Accent color | `#CC5033` (Salvo orange) |
| Package 1 | Story Foundation — $5,500 one-time |
| Package 2 | Story Activation — $3,500 initiation + $500/mo |
| Case studies | Sea Cadets, Texas Hearing Institute, BGC Permian Basin |
| Timeline | 6-week Discover/Build/Launch |
| Prepared by | Ryan McNeill / Anecdotal |

All defaults can be overridden per-proposal.

---

## Design System (Salvo Base)

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Kicker | DM Sans | 500 | 11px, uppercase, 0.18em tracking |
| Headlines | Funnel Display | 700 | clamp(44px, 5.5vw, 80px) for hero; smaller for sections |
| Headline emphasis | Libre Caslon Text | 400 italic | Same as headline |
| Pull quotes | Libre Caslon Text | 400 italic | clamp(18px, 2vw, 26px) |
| Body | DM Sans | 300 | 17px, line-height 1.75 |
| Stats | Funnel Display | 700 | 34px |

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#CC5033` | Primary accent (swappable per client) |
| `--accent-light` | `rgba(accent, 0.07)` | Accent backgrounds |
| `--accent-mid` | `rgba(accent, 0.15)` | Accent borders/hovers |
| `--black` | `#0F0F0F` | Headlines |
| `--ink` | `#1A1A1A` | Primary text |
| `--ink2` | `#3D3D3D` | Secondary text |
| `--ink3` | `#6B6B6B` | Tertiary text |
| `--ink4` | `#9A9A9A` | Muted text |
| `--rule` | `#E5E3DF` | Borders, dividers |
| `--bg` | `#FAF9F7` | Page background |
| `--bg2` | `#F3F1EE` | Alternate section background |
| `--white` | `#FFFFFF` | Card backgrounds |

### Layout Patterns

- **Fixed header:** Logo + client name left, CTA button right. `backdrop-filter: blur(12px)`, semi-transparent background.
- **Split-grid hero:** Two equal columns. Left: kicker + headline + body + CTA + stats. Right: accent-colored panel with quote/mission.
- **Numbered sections:** Each section has a kicker (e.g., "02 — THE OPPORTUNITY"), headline, and body content.
- **Stat blocks:** Bold number + label, displayed in a horizontal flex row.
- **Package cards:** White background, border, hover lift. Deliverables as bulleted list with value stacking.
- **Comparison table:** Side-by-side grid for investment summary.
- **Timeline:** Horizontal 3-step with connecting line (Discover → Build → Launch).

### Interactive Elements

- **Scroll animations:** Fade-up reveals on section entry via IntersectionObserver (not GSAP — lighter weight)
- **Header:** Fixed with backdrop blur, CTA button always visible
- **Package cards:** Hover lift/shadow effect
- **Mobile:** Fully responsive — hero stacks vertically, stats wrap, packages stack, timeline goes vertical

---

## Section Structure (10 Sections)

### 01 — Hero

Split-grid layout.

**Left panel:**
- Kicker: "A SOCIAL MEDIA PARTNERSHIP"
- Headline: "Anecdotal x [Org Name]" with italic emphasis on a key word
- Body: 2-3 sentences positioning the proposal
- CTA button: "Let's Talk" (links to section 10)
- Hero stats: 3 proof points (e.g., "13M+ video views for clients", "+45% donations increase", "3 active nonprofit clients")

**Right panel:**
- Accent color background with diagonal line pattern overlay
- Quote or mission statement from the org
- Attribution line

### 02 — Context ("We See You")

Demonstrates understanding of the organization. 3-4 sentences covering:
- What the org does (mission, structure)
- Their current situation
- Why this moment matters

Tone: Respectful, observant. Not diagnostic yet — just showing you listened.

### 03 — The Opportunity

2-3 pain points reframed as opportunities. Each with:
- Bold observation
- Supporting detail
- Implied potential

Ends with transformation statement (e.g., "From Quiet Impact to Visible Mission").

### 04 — Our Approach

Brief philosophy section. Core message: storytelling > broadcasting. Human stories drive engagement. The org already has proof — their best-performing content is people-focused. The playbook formalizes and scales what already works.

### 05 — Social Proof (Case Studies)

Card-style layout with 2 primary case studies + 1 mention:

**Sea Cadets:**
- 13M+ video views across platforms
- More than any other youth organization in the country
- $800K grant attributed to visibility

**Texas Hearing Institute:**
- +45% increase in donations
- $1M raised at annual gala
- Emmy-quality production

**BGC Permian Basin:**
- Brief mention as current client in same engagement type (social media playbook)

### 06 — Package 1: Story Foundation ($5,500)

One-time engagement. Deliverables:

| Deliverable | Description | Value |
|-------------|-------------|-------|
| Discovery & Stakeholder Interviews | Deep-dive conversations with leadership, staff, key stakeholders | $1,500 |
| Social Media & Communications Audit | Comprehensive review of social media, website, donor materials, brand presence | $2,000 |
| Storytelling Playbook | Messaging framework, key messages, story templates, talking points | $2,500 |
| Staff Story Training | 1-hour live training on storytelling, story capture, social media sharing | $2,000 |
| Organizational Impact Story Deck | Mobile-first digital storytelling experience — swipeable, shareable | $3,000 |

**Stated value:** $11,000+
**Investment:** $5,500

**Positioning line:** "For organizations that need clarity before tactics. Start here."

### 07 — Package 2: Story Activation ($3,500 + $500/mo)

Everything in Package 1, plus ongoing support. Additional deliverables:

| Deliverable | Description | Value |
|-------------|-------------|-------|
| 1-Year Content Calendar | Pre-built planning system aligned with fundraising calendar | $3,000 |
| Social Media Templates | Ready-to-use templates for routine posts | $1,500 |
| Social Media Best Practices Guide | Platform-specific strategies, posting schedules, engagement tactics | $1,000 |
| 1 Campaign Video Per Year | Professional video produced from existing photos/footage | $5,000 |
| Monthly Coaching (1hr) | Strategic support, skill development, material feedback | Included |

**Stated value:** $28,800+
**Year 1 investment:** $9,500 ($3,500 initiation + $500/month)

**Positioning line:** "For organizations ready to professionalize. Your marketing coordinator gets superpowers."

### 08 — Timeline (6-Week Launch)

Three phases:

| Phase | Weeks | Activities |
|-------|-------|------------|
| Discover | 1-2 | Kickoff meeting, audits, stakeholder interviews, gap identification |
| Build | 3-5 | Playbook development, messaging framework, impact deck production |
| Launch | 6 | Team training, asset handoff, deployment |

Displayed as horizontal connected timeline with phase icons.

### 09 — Investment Summary

Side-by-side comparison table:

| | Story Foundation | Story Activation |
|---|---|---|
| Discovery & Interviews | Yes | Yes |
| Social Media Audit | Yes | Yes |
| Storytelling Playbook | Yes | Yes |
| Staff Training | Yes | Yes |
| Impact Story Deck | Yes | Yes |
| Content Calendar | — | Yes |
| Social Media Templates | — | Yes |
| Best Practices Guide | — | Yes |
| Campaign Video | — | Yes |
| Monthly Coaching | — | Yes |
| **Investment** | **$5,500** | **$9,500 Year 1** |

ROI framing below: "One funded grant pays for Package 1. One $10K gift justifies Package 2."

### 10 — CTA / Next Step

- Headline: "Let's Build Something That Lasts"
- Body: 1-2 sentences inviting the next conversation
- Contact info / scheduling link
- Footer: "Prepared by Ryan McNeill / Anecdotal · [Date] · Confidential"

---

## NewView Oklahoma — Client-Specific Content

### Required Inputs for NewView

- **Organization name:** NewView Oklahoma
- **Accent color:** `#CC5033` (default orange)
- **Logo:** TBD (need NewView logo URL or file)

### Pain Points (Section 03)

1. **Low engagement despite compelling stories:** ~2,000 followers, minimal interaction — but employee/patient spotlights consistently outperform everything else
2. **Platform imbalance:** Facebook and LinkedIn get some traction, Instagram is flat, TikTok blocked internally
3. **No content system:** No playbook, no calendar, no templates — ideas live in Kim's head and her new coordinator has no framework to follow

### What's Working (Section 02 context)

- Employee and patient testimonial posts get the strongest engagement
- Kim is resourceful and motivated — self-teaching AI tools, hired a coordinator
- Dual mission creates rich storytelling material (clinic rehab + enterprise employment for 90 blind/low-vision workers)

### Opportunity Framing

"From Quiet Impact to Visible Mission" — NewView's work changes lives, but almost nobody outside their immediate circle knows it. The stories are there. They just need a system to tell them.

### Hero Quote (Right Panel)

Pull from NewView's mission or use a line that captures the dual-mission impact. Placeholder: "We don't just help people see the world differently. We help the world see them."

### Context Section (02)

NewView Oklahoma serves blind and low-vision individuals through two sides: a rehabilitation clinic providing mobility and occupational therapy, and an enterprise division employing approximately 90 blind and low-vision workers manufacturing safety kits, hygiene kits, school supply kits, and fire hoses. With recent federal contract losses reducing revenue, NewView is diversifying — and their story has never been more important to tell.

---

## Out of Scope

- PR / media pitching (separate consulting proposal)
- AI automation consulting (separate proposal)
- Package 3 / amplification tier (not offered in this engagement)
- TikTok strategy (blocked by NewView IT)
- Logo design or brand refresh
- Ongoing social media management (this is consulting + coaching, not done-for-you management)
