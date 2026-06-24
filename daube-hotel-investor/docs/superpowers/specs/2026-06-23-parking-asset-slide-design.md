# Daube Hotel Investor Deck — "Parking Asset" Slide

**Date:** 2026-06-23
**File:** `daube-hotel-investor/index.html`
**Requested by:** Lance (via text) — "Need the parking lot layered into the deck and monetized accordingly."

## Goal

Add one new slide to the investor deck highlighting the **north parking lot** — a
parcel included in the purchase under contract — as a **standalone upside asset**.
Present it as a low-profile **double-decker (split-level)** structure that delivers
secure, covered, on-site guest & valet parking no other downtown Ardmore hotel can
offer. Keep it **separate from the core pro forma** so the existing NOI / ARV /
capital-stack / waterfall slides are untouched.

## Decisions (locked during brainstorm)

- **Angle:** standalone upside asset, kept out of the core underwriting.
- **Monetization lane:** guest / valet amenity — supports premium ADR & occupancy,
  enables valet, solves the downtown "where do my guests park" problem.
- **Numbers:** qualitative / directional only. **No dollar figures**, no surveyed SF,
  no exact stall counts. Capacity framed as "roughly doubles on-site stalls."
- **Design comp:** generic — describe the split-level principle (half-down / one-up,
  stays below the roofline, preserves sightlines to the historic facade). Do **not**
  name the comp building (no confirmed name).
- **Section diagram:** skipped (may add later if Lance asks).
- **Placement:** new slide immediately after Property, before Renderings.
- **Headline:** "The north lot — an asset hiding in the deal."

## Placement & Renumbering

Insert a new `<section class="slide" data-slide="05" data-title="Parking Asset">`
between the current Property slide (`data-slide="04"`, corner `03 — The Property`)
and the Renderings slide.

Renumbering is **display-only** — the JS (`querySelectorAll('.slide')`, side dots,
keyboard nav, active tracking) is fully dynamic and needs no changes. But the running
numbers shown to the reader must stay correct:

- **New slide:** `data-slide="05"`, corner label `04 — The Parking Asset`.
- **Every downstream slide shifts +1:**
  - `data-slide` attributes: old `05`→`06`, `06`→`07`, … `24`→`25`.
  - Corner `frame__corner--tl` labels: old `04 — Preliminary Renderings`→`05`,
    `05 — Market…`→`06`, … `23 — Disclosures & Contact`→`24`.

Deck length goes from 24 → 25 slides.

## Slide Content & Layout

Reuse the existing two-column `property` layout pattern so the slide is visually
native to the deck. Standard frame scaffolding:

- `frame__corner--tl`: `04 — The Parking Asset`
- `frame__corner--br`: `North parcel · included under contract`
- Eyebrow: `Included in the transaction`
- `h2`: **The north lot — an asset hiding in the deal.**

**Left column — "The lot today":** a small stacked gallery of the three existing
photos (`img/parking-existing-1.jpg`, `-2.jpg`, `-3.jpg`), captioned to show the
**existing split-level structure** on the north parcel — this proves the half-down /
one-up form already works on this site (feasibility, not speculation).

**Right column — fact / value rows** (reusing `.fact-row` markup):

| Label | Value |
|---|---|
| In the deal | North parcel — included in the purchase, under contract |
| The plan | Double-decker, split-level (half-down / one-up) — sized to the parcel, kept below the roofline so it never competes with the historic facade |
| Capacity | Roughly doubles on-site stalls *(directional)* |
| The amenity | Secure, covered, on-site guest & valet parking — unique among downtown Ardmore lodging |
| Monetization | Supports premium ADR & occupancy and enables valet — no dollar figure |

**Bottom callout strip:** the upside framing —
**"In the basis. Not in the pro forma. Pure upside."**

No dollar figures anywhere on the slide. "Roughly doubles" and any capacity language
is explicitly directional.

## Assets

- `img/parking-existing-1.jpg`, `-2.jpg`, `-3.jpg` — already saved (Lance's photos,
  resized to 1600px max). Currently untracked; commit with the implementation.

## Out of Scope

- Event / overflow parking, monthly-permit, and land-value revenue models (deselected).
- Folding parking revenue into NOI / ARV / capital stack / waterfall.
- Surveyed square footage, exact stall counts, the section diagram, naming the comp.

## Post-Build

- Regenerate `proposal.pdf` via `node build-pdf.mjs` (Puppeteer; verify 25 slides /
  pages and no clipped content on the new slide).
- Canonical edit target is the **repo copy**
  (`~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor/`). The
  `~/daube-hotel-investor` standalone is a stray copy — leave it untouched (or
  re-sync on request).
- Push only when the user asks (switch gh auth to `ryan-hallpass` first).

---

## Addendum — 2026-06-23 (quantitative economics)

Lance subsequently provided quantitative estimates and asked for parking revenue to
be shown in the deck. This **reverses the "no dollar figures / qualitative" decision**
for a new, second slide (the original Parking Asset slide stays qualitative).

**Inputs (ownership estimates, Lance):** ~150 spaces · 80% utilization · $5 / car / day
· ~$2.5M construction cost.

**Derived revenue:**
- 150 × 80% = **120 cars/day**; 120 × $5 = **$600/day**; × 365 = **$219,000/yr gross**.
- Less ~30% operating expenses → **est. NOI ~$153,000/yr**.
- Yield on $2.5M cost: **~6.1% NOI / ~8.8% gross**.

**Decisions:**
- Placement: a **new "Parking Economics" slide** inserted immediately after the
  Parking Asset slide (becomes `data-slide="06"`, tl label `05 — Parking Economics`);
  downstream slides renumber +1 again (now 26 slides total).
- Framing: **gross + NOI + yield**, all clearly labeled **illustrative / ownership
  estimates** and explicitly **outside the hotel pro forma**.
- Monetization shifts to **paid public & event parking** (the $5/car/day, 80%-daily
  model), broader than the prior guest/valet-only framing — noted on the slide.
- Layout reuses the deck's `.arv-footer` dark result band + a new `.parking-calc`
  formula row (150 × 80% × $5 × 365). PDF target becomes 26 pages.
