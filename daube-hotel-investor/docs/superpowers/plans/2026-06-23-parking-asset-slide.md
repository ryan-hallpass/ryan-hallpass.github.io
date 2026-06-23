# Parking Asset Slide — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one new slide ("The Parking Asset") to the Daube Hotel investor deck, immediately after the Property slide, presenting the north parking lot as a standalone upside asset.

**Architecture:** Single self-contained HTML file (`index.html`) edited in place. The new slide reuses the existing `.property` two-column grid + `.fact-row` components, plus one small new CSS block (`.parking-gallery`) for the three-photo gallery. Slide navigation is JS-dynamic (`querySelectorAll('.slide')`), so only the display-only running numbers (`data-slide` attrs + `frame__corner--tl` labels) need renumbering downstream. PDF regenerated via the existing Puppeteer `build-pdf.mjs`.

**Tech Stack:** Static HTML/CSS/JS, Python 3 (for the deterministic renumber+insert edit), Node + Puppeteer (PDF build).

## Global Constraints

- Edit ONLY the repo copy: `~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor/index.html`. Leave `~/daube-hotel-investor` (stray copy) untouched.
- **No dollar figures** anywhere on the slide. Monetization framed qualitatively (supports ADR / enables valet).
- Capacity language is **directional** ("roughly doubles") — no surveyed SF, no exact stall counts.
- Design comp stays **generic** — describe split-level principle, do NOT name a comp building.
- No section diagram.
- Headline verbatim: **The north lot — an asset hiding in the deal.**
- Em dashes in corner labels are U+2014 (`—`), matching existing labels.
- `git add` specific paths only — never `git add -A` / `git add .`.
- Do NOT push (user pushes manually as `ryan-hallpass`).

---

### Task 1: Add the "Parking Asset" slide (CSS + markup + downstream renumber)

**Files:**
- Modify: `daube-hotel-investor/index.html` (insert CSS block ~line 576; renumber downstream slides; insert new `<section>` before the Renderings slide)
- Assets already present: `img/parking-existing-1.jpg`, `-2.jpg`, `-3.jpg`

**Interfaces:**
- Consumes: existing CSS vars `--rule`, `--mono`, `--ink-soft`, `--oxblood`, `--brass`; existing classes `.frame`, `.frame__inner`, `.frame__corner--tl/--br`, `.eyebrow`, `.h2`, `.property`, `.property__facts`, `.fact-row`, `.fact-row__label`, `.fact-row__value`, `[data-reveal]`, `data-delay`.
- Produces: a 25th slide; deck `data-slide` attrs run `01`–`25`; `frame__corner--tl` running labels run `01`–`24`.

- [ ] **Step 1: Add the `.parking-gallery` CSS block**

Edit `index.html`. Find this existing line (the CSS comment that opens the headline-numbers section, ~line 577):

```css
  /* ============ SLIDE 05: HEADLINE NUMBERS ============ */
```

Insert the following block IMMEDIATELY BEFORE that comment:

```css
  /* ============ PARKING ASSET GALLERY ============ */
  .parking-gallery {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1.5fr 1fr;
    gap: 8px;
    position: relative;
    min-height: 0;
  }
  .parking-gallery img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border: 1px solid var(--rule);
  }
  .parking-gallery img:first-child {
    grid-column: 1 / -1;
  }
  .parking-gallery__tag {
    position: absolute;
    bottom: clamp(10px, 1.4cqi, 16px);
    left: clamp(10px, 1.4cqi, 16px);
    z-index: 2;
    color: rgba(245, 241, 232, 0.85);
    background: rgba(14, 12, 10, 0.55);
    padding: 4px 8px;
    font-family: var(--mono);
    font-size: clamp(8px, 0.85cqi, 11px);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

```

- [ ] **Step 2: Renumber downstream slides and insert the new slide (one deterministic Python script)**

Order matters: shift the old slides DOWN first (descending, to avoid number collisions), THEN insert the new slide as `05` so it isn't itself shifted. Run from the deck directory:

```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
python3 - <<'PY'
p = "index.html"
s = open(p, encoding="utf-8").read()
EM = "—"  # — em dash

# --- sanity: anchors must exist exactly once ---
anchor = "<!-- ============ PRELIMINARY RENDERINGS ============ -->"
assert s.count(anchor) == 1, f"renderings anchor count = {s.count(anchor)}"
assert s.count('data-slide="05"') == 1, "expected exactly one existing data-slide=05"

# --- 1) shift data-slide attrs 05..24 -> 06..25 (descending) ---
for n in range(24, 4, -1):
    old, new = f'data-slide="{n:02d}"', f'data-slide="{n+1:02d}"'
    assert s.count(old) == 1, f"{old} count = {s.count(old)}"
    s = s.replace(old, new)

# --- 2) shift tl running labels 04..23 -> 05..24 (descending) ---
for n in range(23, 3, -1):
    old = f'frame__corner--tl">{n:02d} {EM} '
    assert s.count(old) == 1, f"corner {n:02d} count = {s.count(old)}"
    s = s.replace(old, f'frame__corner--tl">{n+1:02d} {EM} ')

# --- 3) insert the new slide before the Renderings section ---
new_slide = '''<!-- ============ PARKING ASSET ============ -->
<section class="slide" data-slide="05" data-title="Parking Asset">
  <div class="frame">
    <div class="frame__corner frame__corner--tl">04 — The Parking Asset</div>
    <div class="frame__corner frame__corner--br">North parcel · included under contract</div>
    <div class="frame__inner">
      <div data-reveal>
        <div class="eyebrow" style="margin-bottom: 12px;">Included in the transaction</div>
        <h2 class="h2">The north lot — an asset hiding in the deal.</h2>
      </div>
      <div class="property">
        <div class="parking-gallery" data-reveal data-delay="1">
          <img src="img/parking-existing-1.jpg" alt="The north lot today — existing split-level parking structure beside the Daube building" />
          <img src="img/parking-existing-2.jpg" alt="Ramp up to the existing upper parking deck on the north parcel" />
          <img src="img/parking-existing-3.jpg" alt="Existing upper deck of the north parking structure looking toward downtown Ardmore" />
          <div class="parking-gallery__tag">The lot today · existing split-level structure</div>
        </div>
        <div class="property__facts" data-reveal data-delay="2">
          <div class="fact-row">
            <div class="fact-row__label">In the deal</div>
            <div class="fact-row__value">North parcel — included in the purchase, <em>under contract</em></div>
          </div>
          <div class="fact-row">
            <div class="fact-row__label">The plan</div>
            <div class="fact-row__value">Double-decker, split-level<br/><span style="font-weight: 400; color: var(--ink-soft); font-size: 0.85em;">half-down / one-up, sized to the parcel and kept below the roofline so it never competes with the historic facade</span></div>
          </div>
          <div class="fact-row">
            <div class="fact-row__label">Capacity</div>
            <div class="fact-row__value">Roughly doubles on-site stalls<br/><span style="font-weight: 400; color: var(--ink-soft); font-size: 0.85em;">directional — sized to the lot</span></div>
          </div>
          <div class="fact-row">
            <div class="fact-row__label">The amenity</div>
            <div class="fact-row__value">Secure, covered, on-site guest &amp; valet parking<br/><span style="font-weight: 400; color: var(--ink-soft); font-size: 0.85em;">unique among downtown Ardmore lodging</span></div>
          </div>
          <div class="fact-row">
            <div class="fact-row__label">Monetization</div>
            <div class="fact-row__value">Supports premium ADR &amp; occupancy and enables valet</div>
          </div>
        </div>
      </div>
      <div data-reveal data-delay="3" style="margin-top: clamp(10px,1.4cqi,16px); display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; font-size: clamp(10px,1.1cqi,13px); color: var(--ink-soft); line-height: 1.4;">
        <span style="font-family: var(--mono); font-size: clamp(9px,0.95cqi,12px); letter-spacing: 0.14em; text-transform: uppercase; color: var(--brass);">Upside →</span>
        <span><strong style="color: var(--oxblood);">In the basis. Not in the pro forma.</strong> The structured-parking value sits entirely outside the underwriting on the slides that follow.</span>
      </div>
    </div>
  </div>
</section>

'''
s = s.replace(anchor, new_slide + anchor)

open(p, "w", encoding="utf-8").write(s)
print("done")
PY
```

Expected output: `done` (no AssertionError).

- [ ] **Step 3: Verify structure**

```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
echo "slides: $(grep -c 'class="slide"' index.html)   # expect 25"
echo "data-slide seq:"; grep -oE 'data-slide="[0-9]+"' index.html | grep -oE '[0-9]+' | paste -sd, -
echo "tl labels:"; grep -oE 'frame__corner--tl">[0-9]+ \xe2\x80\x94 [^<]*' index.html
echo "gallery imgs: $(grep -c 'parking-existing-' index.html)   # expect 3"
```

Expected: `slides: 25`; `data-slide seq` = `01,02,03,04,05,06,...,25` (contiguous, no gaps/dupes); tl labels run `01`–`24` with `04 — The Parking Asset` present and unique; `gallery imgs: 3`.

- [ ] **Step 4: Eyeball the rendered slide**

```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
open -a "Google Chrome" index.html
```

Confirm visually: slide 5 shows the headline "The north lot — an asset hiding in the deal.", the 3 photos render (hero spanning top, two below) with the "The lot today" tag, the 5 fact rows read correctly, and the "Upside →" strip sits below. Check the slides AFTER it still number correctly (Renderings now reads `05 — Preliminary Renderings`, Disclosures reads `24 — Disclosures & Contact`). No clipped/overflowing content.

- [ ] **Step 5: Commit**

```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io
git add daube-hotel-investor/index.html \
        daube-hotel-investor/img/parking-existing-1.jpg \
        daube-hotel-investor/img/parking-existing-2.jpg \
        daube-hotel-investor/img/parking-existing-3.jpg \
        daube-hotel-investor/docs/superpowers/specs/2026-06-23-parking-asset-slide-design.md \
        daube-hotel-investor/docs/superpowers/plans/2026-06-23-parking-asset-slide.md
git commit -m "feat(daube): add Parking Asset slide (north lot upside)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Regenerate the shareable PDF

**Files:**
- Modify: `daube-hotel-investor/proposal.pdf` (regenerated)
- Uses: `daube-hotel-investor/build-pdf.mjs` (unchanged)

**Interfaces:**
- Consumes: the updated `index.html` from Task 1.
- Produces: `proposal.pdf` with 25 pages.

- [ ] **Step 1: Make Puppeteer resolvable in the repo copy**

The repo copy has no `node_modules`. Symlink the working install (gitignored, so it won't be committed):

```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
[ -e node_modules ] || ln -s ~/ardmore-chamber/deck/node_modules node_modules
node -e "import('puppeteer').then(()=>console.log('puppeteer OK')).catch(e=>{console.error('NO puppeteer');process.exit(1)})"
```

Expected: `puppeteer OK`. (If it fails, run the build from `~/daube-hotel-investor` instead — copy the updated `index.html` + the 3 new images there first, build, then copy `proposal.pdf` back into the repo copy.)

- [ ] **Step 2: Build the PDF**

```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
node build-pdf.mjs
```

Expected output: `Wrote .../proposal.pdf (unencrypted)`.

- [ ] **Step 3: Verify page count**

```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
mdls -name kMDItemNumberOfPages proposal.pdf   # expect kMDItemNumberOfPages = 25
open proposal.pdf
```

Expected: 25 pages. Visually confirm page 5 is the Parking Asset slide and renders correctly (photos present, no clipped content, no hard-edged gray shadow boxes per the deck's known PDF gotchas).

- [ ] **Step 4: Commit**

```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io
git add daube-hotel-investor/proposal.pdf
git commit -m "build(daube): regenerate proposal.pdf with Parking Asset slide (25 pages)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Notes / Out of Scope

- Old extra PDFs in the dir (`Ardmore Boutique Hotel.pdf`, `Downtown Ardmore Boutique Hotel*.pdf`) are pre-existing untracked clutter — not touched here.
- `og.html` / `og-image` unchanged (cover unchanged).
- Pushing to `main` is the user's manual step (gh auth switch to `ryan-hallpass`).
- The `~/daube-hotel-investor` stray copy is intentionally left out of parity; re-sync only on request.
