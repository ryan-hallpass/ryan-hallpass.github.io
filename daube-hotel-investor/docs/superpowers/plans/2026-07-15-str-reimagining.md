# STR Reimagining — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reimagine the Daube investor deck from a boutique hotel to a boutique short-term-stay (STR) property — 29 suites, added event/conference revenue, parking folded in — and re-underwrite the full financial model.

**Architecture:** Single self-contained `index.html` (27 slides → 26 after Test Fit removal). Edits are copy/number replacements grouped by slide-cluster, one deterministic Python edit for the Test Fit removal + renumber, then a Puppeteer PDF rebuild. All financial figures come from the spec's model and are labeled illustrative.

**Tech Stack:** Static HTML/CSS/JS, Python 3 (slide removal/renumber), Node + Puppeteer (`build-pdf.mjs`).

## Global Constraints

- Edit ONLY the repo copy: `~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor/index.html`.
- **Name:** "Downtown Ardmore Boutique Short-Stay Suites" (deck title + cover + thesis + deal snapshot).
- **Positioning:** STR + boutique quality — swap hotel→short-stay, keys→suites, ADR→nightly rate; keep premium/first-mover framing.
- **Unit program:** 29 suites = **10 efficiency ($145) + 11 one-bed ($190) + 8 two-bed ($300)**, occupancy **60%**, blended ADR ~$205.
- **Headline financials (illustrative):** total revenue ~$2.45M · **stabilized NOI $825,000** · **working ARV $7,750,000** · **total capital $6,300,000** · **HTC $1,850,000**.
- Every financial figure is illustrative/ownership-modeled — do not present as guaranteed.
- Em dashes are U+2014 (`—`). `git add` specific paths only. Do NOT push (user pushes as `ryan-hallpass`).
- After content edits, verify NO slide overflow in **screen mode** across desktop widths (per prior lesson), not just print.

---

### Task 1: Identity & top-of-funnel (title, cover, Thesis, Deal Snapshot, Property)

**Files:** Modify `daube-hotel-investor/index.html`

**Interfaces:**
- Produces: the new deck name and headline numbers used by all later tasks ($6.30M capital, $7.75M ARV, 29 suites).

- [ ] **Step 1: Update the deck `<title>` and any cover/OG name**

Change the `<title>` element and cover headline text from "Downtown Ardmore Boutique Hotel" to **"Downtown Ardmore Boutique Short-Stay Suites"**. Run to find all occurrences of the old name first:
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
grep -n "Boutique Hotel" index.html
```
Replace every "Downtown Ardmore Boutique Hotel" → "Downtown Ardmore Boutique Short-Stay Suites" (title, cover, thesis, deal snapshot eyebrow).

- [ ] **Step 2: Thesis slide** (`data-title="Thesis"`)

| Current | New |
|---|---|
| `A 25-key boutique hotel · $5.46M total project · Four capital structure options` | `29 boutique short-stay suites · $6.3M total project · Four capital structure options` |

- [ ] **Step 3: Deal Snapshot slide** (`data-title="Deal Snapshot"`)

| Current | New |
|---|---|
| Total project capital `$5.46` | `$6.30` |
| `Keys` / `25` / `Boutique room count · plus restaurant + speakeasy` | `Suites` / `29` / `10 efficiency · 11 one-bed · 8 two-bed · plus restaurant, bar & event space` |
| Working ARV → Optimistic `$6.5` / `Conservative working number for lender scrutiny` | label `Working ARV` / `$7.75` / (keep note) |
Keep Acquisition `$525` and Target investor IRR `15–25`.

- [ ] **Step 4: Property slide** (`data-title="Property"`)

| Current | New |
|---|---|
| Program `25 boutique rooms` / `Restaurant · alley-entry speakeasy` | `29 short-stay suites` / `10 efficiency · 11 one-bed · 8 two-bed` |
| Position `Only boutique in downtown` | `Only boutique short-stay in downtown` |
| Position sub `Triple-access: I-35, Amtrak, pedestrian core` | keep |
| `Modeled ADR` / `$149 – $285` / `vs market chain ADR $100 – $155` | `Modeled nightly rate` / `$145 – $300` / `blended ~$205 · 60% occupancy` |
Add to the Program value a line: `Restaurant, bar & event space · conference room`. Keep Land `1.19 acres` and Building `18,904 SF · historic`.

- [ ] **Step 5: Verify & commit**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
grep -c "Boutique Hotel" index.html          # expect 0
grep -c "Boutique Short-Stay Suites" index.html  # expect >=3
grep -c "29 short-stay suites\|29 boutique short-stay" index.html  # expect >=2
```
Expected: 0 old-name hits; new name present; 29-suite copy present.
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io
git add daube-hotel-investor/index.html
git commit -m "feat(daube): retitle to Boutique Short-Stay Suites; 29-suite identity

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Remove the Test Fit slide + renumber downstream

**Files:** Modify `daube-hotel-investor/index.html`

**Interfaces:**
- Consumes: nothing. Produces: deck at 26 slides, `data-slide` 01–26 contiguous, `frame__corner--tl` labels 01–25 contiguous.

- [ ] **Step 1: Remove the Test Fit section and shift downstream numbers (deterministic Python)**

The Test Fit slide is `data-slide="07"` / tl label `06 — Architectural Test Fit`, wrapped by `<!-- ============ TEST FIT ============ -->` … `</section>`. Remove it, then shift `data-slide` 08..27 → 07..26 (ascending) and tl labels 07..25 → 06..24 (ascending). Run from the deck dir:
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
python3 - <<'PY'
import re
p="index.html"; s=open(p,encoding="utf-8").read(); EM="—"
# 1) excise the Test Fit section (comment + section)
start=s.index("<!-- ============ TEST FIT ============ -->")
end=s.index("</section>", start)+len("</section>")
# also consume the trailing blank line(s) up to the next comment
tail=s[end:]
seg=s[start:end]
assert 'data-title="Test Fit"' in seg, "Test Fit section not matched"
s=s[:start]+tail.lstrip("\n")
# 2) shift data-slide 08..27 -> 07..26 (ascending, no collision since 07 now free)
for n in range(8,28):
    o,nw=f'data-slide="{n:02d}"',f'data-slide="{n-1:02d}"'
    assert s.count(o)==1, f"{o}={s.count(o)}"; s=s.replace(o,nw)
# 3) shift tl labels 07..25 -> 06..24 (ascending)
for n in range(7,26):
    o=f'frame__corner--tl">{n:02d} {EM} '
    assert s.count(o)==1, f"tl {n}={s.count(o)}"; s=s.replace(o,f'frame__corner--tl">{n-1:02d} {EM} ')
open(p,"w",encoding="utf-8").write(s)
print("done")
PY
```
Expected: `done`, no AssertionError. If any assertion fails, STOP (do not hand-edit).

- [ ] **Step 2: Verify structure**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
echo "slides: $(grep -c 'class=\"slide\"' index.html)"   # expect 26
grep -oE 'data-slide="[0-9]+"' index.html | grep -oE '[0-9]+' | paste -sd, -   # 01..26 contiguous
grep -c "Architectural Test Fit" index.html   # expect 0
python3 -c "import re;s=open('index.html',encoding='utf-8').read();L=re.findall(r'frame__corner--tl\"[^>]*>([^<]*)',s);print('tl contiguous:',[x.split(' ')[0] for x in L]==[f'{i:02d}' for i in range(1,len(L)+1)])"
```
Expected: 26 slides; data-slide 01–26 contiguous; 0 Test Fit; tl contiguous True.

- [ ] **Step 3: Commit**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io
git add daube-hotel-investor/index.html
git commit -m "feat(daube): remove Test Fit slide (predates 29-suite program); renumber

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```
Note: `img/testfit-*.jpg` left on disk (unused, harmless).

---

### Task 3: Program & experience (Experience slides + Boutique Premium)

**Files:** Modify `daube-hotel-investor/index.html`

- [ ] **Step 1: Add event space + conference room to the Experience story**

On the restaurant/experience slide (`data-title="The Restaurant &amp; Speakeasy"`), add a callout conveying the ground floor doubles as **event space** and there's a **conference room**. Read the slide, then add near the body a line/callout with this copy verbatim:
> **The ground floor flexes.** Restaurant and bar by day and evening — and a rentable **event space** for weddings and corporate functions. A **~30-person conference room** sits beneath the mezzanine for meetings and smaller gatherings.

- [ ] **Step 2: Reframe the Boutique Premium slide** (`data-title="Boutique Premium"`)

| Current | New |
|---|---|
| `The math behind a 25-room hotel that prices like a 100-room chain.` | `The math behind 29 short-stay suites — nightly rate, plus F&B, events, and parking.` |
| Downtown col `$149 – $285` / `AVG DAILY RATE · +20–35% NATIONAL BOUTIQUE PREMIUM` | `$145 – $300` / `NIGHTLY RATE · blended ~$205` |
| `Restaurant + speakeasy — F&B captures 25–35% of revenue` | keep, append: `— plus event space, conference room & parking` |
| `First-mover advantage — no other boutique within 90 miles` | `First-mover advantage — no other boutique short-stay within 90 miles` |
| `Stabilized occupancy modeled 65–78% · market baseline 70–80%` | `Stabilized occupancy modeled 60% · nightly-rate driven` |
Keep the left "Chain — I-35 cluster / $100 – $155 AVG DAILY RATE" comparison column.

- [ ] **Step 3: Verify & commit**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
grep -c "ground floor flexes\|conference room" index.html   # expect >=1
grep -c "29 short-stay suites — nightly rate" index.html      # expect 1
grep -c "25-room hotel that prices" index.html                # expect 0
```
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io
git add daube-hotel-investor/index.html
git commit -m "feat(daube): add event space + conference room; reframe premium slide for STR

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Core financials (ARV, Capital Stack, Historic Tax Credits)

**Files:** Modify `daube-hotel-investor/index.html`

- [ ] **Step 1: ARV slide** (`data-title="ARV — Three Methods"`) — replace all figures:

| Element | Current | New |
|---|---|---|
| Income · Conservative 9.5% cap | `$6,842,105` | `$8,684,211` |
| Income · Base 8.5% cap | `$8,751,012` | `$9,705,882` |
| Income · Optimistic 7.5% cap | `$11,333,333` | `$11,000,000` |
| Income note | `Year 3 stabilized NOI of $743,836 divided by…` | `Year 3 stabilized NOI of $825,000 divided by secondary-market boutique cap.` |
| Cost · Land+Build+FF&E | `$5,839,000` | `$6,500,000` |
| Cost · Less 10% historic dep | `$5,256,000` | `$5,850,000` |
| Cost · Range | `$5.18M – $5.33M` | `$5.8M – $6.0M` |
| Cost note | `Replacement cost at $250/SF · 18,904 SF · land 1.19 ac · FF&E $400K.` | `Replacement cost at $260/SF · 18,904 SF · land 1.19 ac · FF&E $550K.` |
| Price-per-key label | `Price per Key · 15% weight` | `Price per Suite · 15% weight` |
| Per-key · Conservative | `$3,125,000` (`$125K/key`) | `$4,350,000` (`$150K/suite`) |
| Per-key · Base | `$4,375,000` (`$175K/key`) | `$5,800,000` (`$200K/suite`) |
| Per-key · Optimistic | `$5,625,000` (`$225K/key`) | `$7,250,000` (`$250K/suite`) |
| Per-key note | `Boutique secondary market range: $125K–$250K/key.` | `Boutique short-stay range: $150K–$250K/suite.` |
| Working Number | `$6,500,000` | `$7,750,000` |
| Weighted · conservative | `$5.9M` | `$7.3M` |
| Weighted · base | `$7.6M` | `$8.2M` |
| Weighted · optimistic | `$9.8M` | `$9.2M` |

- [ ] **Step 2: Capital Stack slide** (`data-title="Capital Stack"`):

| Element | Current | New |
|---|---|---|
| corner br | `Use of funds — $5.46M total` | `Use of funds — $6.30M total` |
| headline | `$5,464,200 — where every dollar goes.` | `$6,300,000 — where every dollar goes.` |
| stack-bar `grid-template-columns` | `525fr 4276fr 400fr 263fr` | `525fr 4900fr 550fr 325fr` |
| seg pct acq / reno / ffe / soft | `9.6%` / `78.3%` / `7.3%` / `4.8%` | `8.3%` / `77.8%` / `8.7%` / `5.2%` |
| Renovation value / note | `$4.28M` / `…approx $226/SF all-in` | `$4.9M` / `18,904 SF gut + restore · approx $259/SF all-in` |
| FF&E value / note | `$400K` / `25 rooms · lobby · restaurant · speakeasy` | `$550K` / `29 suites · lobby · restaurant · bar · event space` |
| Soft costs value | `$263K` | `$325K` |
| Total | `$5,464,200` | `$6,300,000` |
| offset note | `~$1.76M in historic tax credits (40% of ~$4.41M qualifying rehabilitation)` | `~$1.85M in historic tax credits (40% of ~$4.62M qualifying rehabilitation)` |
Keep Acquisition `$525K`.

- [ ] **Step 3: Historic Tax Credits slide** (`data-title="Historic Tax Credits"`):

| Element | Current | New |
|---|---|---|
| Federal HTC 20% | `$881K` | `$924K` |
| Oklahoma State HTC 20% | `$881K` | `$924K` |
| Combined credits 40% | `$1.76M` | `$1.85M` |
| Per-investor | `Per $500K investor` / `~$352K` | `Per Option 2 investor (~$668K)` / `~$370K` |
| QRE base | `$4.41M` | `$4.62M` |
| renovation ref | `~$4.28M renovation` | `~$4.9M renovation` |
| flows back | `~$1.76M flows back to equity` | `~$1.85M flows back to equity` |
| multiple lift | `Each $575K investor's ~$352K share lifts the Option 2 base case from ~3.6× to ~4.2×` | `Each ~$668K investor's ~$370K share lifts the Option 2 base case from ~3.6× to ~4.2×` |
| `after the hotel opens` | | `after the property opens` |

- [ ] **Step 4: Verify & commit**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
grep -c "6,300,000" index.html    # expect >=2 (stack headline + total)
grep -c "7,750,000" index.html    # expect >=1 (ARV working)
grep -c "825,000" index.html      # expect >=1 (ARV income note)
# ARV-unique old figures gone (other old figures like 5,464,200/$6.5M are owned by Task 5):
grep -c "743,836\|8,751,012\|6,842,105" index.html  # expect 0
```
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io
git add daube-hotel-investor/index.html
git commit -m "feat(daube): re-underwrite ARV/capital stack/HTC for 29-suite STR

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Capital options & waterfall

**Files:** Modify `daube-hotel-investor/index.html`

- [ ] **Step 1: Four Capital Structures summary** (`data-title="Three Options"`):

| Element | Current | New |
|---|---|---|
| subhead | `All solve the $5,464,200 — differently` | `All solve the $6,300,000 — differently` |
| Total equity (1/2/3/4) | `$1.78M` / `$2.88M` / `$5.46M` / `$5.46M` | `$1.88M` / `$3.34M` / `$6.30M` / `$6.30M` |
| Construction loan (1/2/3/4) | `$3.68M` / `$2.59M` / `None` / `None` | `$4.42M` / `$2.96M` / `None` / `None` |
| Investors row | (existing values) | `5` / `5` / `8–12` / `2` |
| Min. check row | (existing values) | `~$376K` / `~$668K` / `$630K–$788K` / `~$3.15M` |
Read the slide to place these into the correct comparison cells.

- [ ] **Step 2: Option 1** (`data-title="Option 1"`):

| Current | New |
|---|---|
| Equity raise `$1.78M` | `$1.88M` |
| Construction loan `$3.68M` | `$4.42M` |
| Base IRR `~17%` | `~18%` |
| Equity multiple `~4.3×` | `~4.4×` |
| `5 equal investors at $356,900 each` | `5 equal investors at $376,000 each` |
| `$3.68M construction loan from 1NB` | `$4.42M construction loan from 1NB` |
| `combined net worth ≥ 2× loan (~$7.4M+)` | `(~$8.8M+)` |
| `12-month interest reserve funded at closing (~$258K at 7.0%)` | `(~$309K at 7.0%)` |
| `our $6.5M ARV supports a $3.68M loan at ~57% of ARV` | `our $7.75M ARV supports a $4.42M loan at ~57% of ARV` |
| `~$300K annual debt service` | `~$360K annual debt service` |

- [ ] **Step 3: Option 2** (`data-title="Option 2 — Recommended"`):

| Current | New |
|---|---|
| Equity raise `$2.88M` | `$3.34M` |
| Construction loan `$2.59M` | `$2.96M` |
| Base IRR `~19%` | `~20%` |
| `5 equal investors at $575,000 each` | `5 equal investors at $668,000 each` |
| `Loan-to-ARV at $6.5M is 39.8%` | `Loan-to-ARV at $7.75M is ~38%` |
| `Combined investor net worth of ~$5.2M+` | `~$6.0M+` |
| `Interest reserve needed drops to ~$181K (vs. $258K in Option 1)` | `~$207K (vs. $309K in Option 1)` |
Keep `Loan-to-cost drops to 47%` and `~3.6×`.

- [ ] **Step 4: Option 3** (`data-title="Option 3"`):

| Current | New |
|---|---|
| Equity raise `$5.46M` | `$6.30M` |
| Base IRR `~22%` | `~23%` |
| `10 equal investors at $546,420 each (7.0% LP slot each), or 8 at $683K` | `10 equal investors at $630,000 each (7.0% LP slot each), or 8 at $788K` |
| `need $5.46M from private investors alone` | `need $6.30M from private investors alone` |
Keep `~2.9×`.

- [ ] **Step 5: Option 4** (`data-title="Option 4"`):

| Current | New |
|---|---|
| Equity raise `$5.46M` | `$6.30M` |
| Tax credit · per partner `~$880K` | `~$925K` |
| Base IRR `~22%` | `~23%` |
| `Two equal investors at ~$2,732,100 each (35% LP slot each)` | `~$3,150,000 each (35% LP slot each)` |
| `historic tax credit ≈ $880K — half of the $1.76M combined credits` | `≈ $925K — half of the $1.85M combined credits` |
| `~$2.73M each` | `~$3.15M each` |

- [ ] **Step 6: Investor Waterfall** (`data-title="Investor Waterfall"`):

| Current | New |
|---|---|
| `What $575,000 returns` | `What $668,000 returns` |
| Initial investment `$575,000` | `$668,000` |
| Return of capital at exit `$575,000` | `$668,000` |
| Cumulative 8% preferred (5 yrs) `$230,000` | `$267,000` |
| Operating cash distributions · Yrs 2–5 · 14% LP `$177,000` | `$196,000` |
| Sale proceeds · 14% of net · `~$7.86M exit` / `$1,100,750` | `~$9.3M exit` / `$1,302,000` |
| Share of historic tax credits `$352,000` | `$370,000` |
| Total Return · after tax credits `$2,434,750` | `$2,803,000` |
| Conservative: `$575K → ~$2,002,000 · ~3.5× · ~18% IRR · $7.5M exit · incl. ~$352K credits` | `$668K → ~$2,338,000 · ~3.5× · ~18% IRR · $8.9M exit · incl. ~$370K credits` |
Keep `~4.2×`, `~24%`, and the `~2.9× / ~13%` downside.

- [ ] **Step 7: Why Option 2** (`data-title="Why Option 2"`):

| Current | New |
|---|---|
| `five investors at $575,000 each` | `five investors at $668,000 each` |
| `Use the $2.875M equity` | `Use the $3.34M equity` |
| `pursue the $2.59M construction loan` | `pursue the $2.96M construction loan` |
| `at ~40% loan-to-ARV` | `at ~38% loan-to-ARV` |
| `39.8%` (Loan-to-ARV stat) / `at $6.5M working value` | `~38%` / `at $7.75M working value` |
| `~$181K` (Interest reserve stat) / `vs $258K in Option 1` | `~$207K` / `vs $309K in Option 1` |
Keep `47% Loan-to-cost` and `~3.6× Equity multiple`.

- [ ] **Step 8: Verify & commit**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
grep -c "575,000\|\$575K\|546,420\|2,732,100\|2.875M\|\$2.59M\|\$3.68M" index.html  # expect 0
grep -c "668,000\|3.34M\|2.96M\|4.42M\|3,150,000" index.html  # expect several
```
Expected: old option figures gone (0), new present.
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io
git add daube-hotel-investor/index.html
git commit -m "feat(daube): re-run 4 capital options + waterfall on \$6.3M / \$825K NOI / \$7.75M ARV

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Parking reframe + STR relabels

**Files:** Modify `daube-hotel-investor/index.html`

- [ ] **Step 1: Parking Asset hero** (`data-title="Parking Asset"`):

| Current | New |
|---|---|
| `In the basis, not in the pro forma — pure upside.` | `Now a core revenue line — ~$219K/yr in the pro forma.` |

- [ ] **Step 2: Parking Economics** (`data-title="Parking Economics"`):

| Current | New |
|---|---|
| `120 cars/day at $5 — incremental income, not included in the hotel pro forma.` | `120 cars/day at $5 — a core revenue line in the pro forma.` |
| `Figures are directional and sit outside the hotel underwriting on the prior slides.` | `Figures are directional and are included in the pro-forma revenue stack.` |

- [ ] **Step 3: Light STR relabels across remaining slides**

Sweep the remaining slides (Market, Location, Demand Drivers, Why Ardmore, Competitive Landscape, Renderings) for hotel→short-stay language referring to OUR project (leave competitor references like "Six chain hotels on I-35. Zero downtown." intact). Apply:
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
grep -n "boutique hotel\|boutique within 90 miles\|only boutique" index.html
```
Replace: `boutique hotel` → `boutique short-stay`; `no other boutique within 90 miles` → `no other boutique short-stay within 90 miles`; any "only boutique in downtown" → "only boutique short-stay in downtown". Do NOT alter competitor-chain-hotel phrasing.

- [ ] **Step 4: Verify & commit**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
grep -c "not in the pro forma\|not included in the hotel pro forma" index.html  # expect 0
grep -c "core revenue line" index.html   # expect >=2
grep -ci "boutique hotel" index.html     # expect 0
```
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io
git add daube-hotel-investor/index.html
git commit -m "feat(daube): fold parking into pro-forma framing; STR relabels

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Rebuild PDF + verify no overflow

**Files:** Modify `daube-hotel-investor/proposal.pdf`

- [ ] **Step 1: Ensure Puppeteer resolves, rebuild PDF**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
[ -e node_modules ] || ln -s ~/ardmore-chamber/deck/node_modules node_modules
node build-pdf.mjs
```
Expected: `Wrote …/proposal.pdf (unencrypted)`.

- [ ] **Step 2: Verify page count (26) and no screen-mode overflow**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
python3 - <<'PY'
import re,zlib
d=open("proposal.pdf","rb").read()
def c(b): return len(re.findall(rb'/Type\s*/Page(?![s])',b))
t=c(d)
for m in re.finditer(rb'stream\r?\n(.*?)\r?\nendstream',d,re.S):
    try:t+=c(zlib.decompress(m.group(1)))
    except:pass
print("pages:",t)
PY
```
Expected: `pages: 26`.

Then render-check every slide in **screen mode** at a short desktop viewport for content overflow (the edited financial slides are the risk — more/less text than before):
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io/daube-hotel-investor
cat > .ofcheck.mjs <<'JS'
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url'; import { dirname, resolve } from 'path';
const d=dirname(fileURLToPath(import.meta.url)); const ip=resolve(d,'index.html');
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
const p=await b.newPage(); await p.setViewport({width:1440,height:720,deviceScaleFactor:1});
await p.goto(`file://${ip}`,{waitUntil:'networkidle0'}); await p.evaluateHandle('document.fonts.ready'); await new Promise(r=>setTimeout(r,800));
const bad=await p.evaluate(()=>{const out=[];document.querySelectorAll('.slide').forEach((s,i)=>{const fr=s.querySelector('.frame');const inner=s.querySelector('.frame__inner');if(!fr||!inner)return;const frb=fr.getBoundingClientRect();let over=0;inner.querySelectorAll('*').forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom>frb.bottom+2||r.right>frb.right+2)over=Math.max(over,Math.round(Math.max(r.bottom-frb.bottom,r.right-frb.right)));});if(over>4)out.push(`slide ${i+1} (${s.dataset.title}): +${over}px`);});return out;});
console.log(bad.length?('OVERFLOW:\n'+bad.join('\n')):'no overflow');
await b.close();
JS
node .ofcheck.mjs; rm -f .ofcheck.mjs
```
Expected: `no overflow`. If any slide overflows, fix that slide's copy/spacing (tighten the way the parking slide was hardened — concise values, no giant blocks) and re-run before committing.

- [ ] **Step 3: Commit**
```bash
cd ~/hallpass-proposals/ryan-hallpass.github.io
git add daube-hotel-investor/proposal.pdf
git commit -m "build(daube): regenerate proposal.pdf for STR reimagining (26 pages)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Notes / Out of Scope
- No new renderings/drawings (Test Fit removed, parking rendering kept).
- Disclaimer slide unchanged.
- Spec: `docs/superpowers/specs/2026-07-15-str-reimagining-design.md` (commit with Task 1 or alongside).
- Push is the user's manual step (`ryan-hallpass`).
