# Agent prompts — Pencil (pen.dev) & Figma

Copy-paste prompts for continuing the Pharos work in either tool. Companion to
`docs/pharos-logistics-dashboard-plan.md` (rationale) and `~/.pencil/documents/pharos-01/pharos.pen` (the work itself).

---

## How to use this file

**In Pencil (pen.dev)** — Pencil is an *agent canvas*: it already knows the document. So the prompts below are split by scope:

1. Run **Prompt 0 — Context** once. It teaches the agent your system and then waits.
2. Then run **one prompt per screen**. Never ask for two screens in one message — the agent will start "tidying" and drift off-system.
3. After each screen, run the **review prompt** (findings only), then apply fixes one at a time.

**In Figma** — Figma's AI has *no knowledge of your document*, so its prompt has to describe the visual system from scratch. See §5. More importantly, Figma's real advantage is that **Variable Modes model the three service lines natively** — §6 shows the structure that makes the mode switcher a data change rather than three sets of screens.

---

## 0. Canonical screen index

⚠️ **The `[0X]` tags inline in plan §5.1–5.3 drifted** from the tiered inventory in §6. This table is authoritative — use these numbers in the flow board, the prompts below, and anything you publish.

| # | Screen | Mode | Tier | Status |
|---|---|---|---|---|
| 01 | Landing & Login | all | — | **built** |
| 02 | Shipper Dashboard (Command Center) | Road | — | **built** |
| 03 | Load Discovery | Road | — | **built** |
| 04 | Bid & Negotiation | Road | — | **built** |
| 05 | Shipment Tracking | Road | — | **built** |
| **06** | **Create Load** | Road | P0 | to build |
| **07** | **Load Detail** | Road | P0 | to build |
| **08** | **Quote Builder** | Forwarding | P0 | to build |
| **09** | **Document Desk** | Forwarding | P0 | to build |
| 10 | Leg Rail & Multi-leg Tracking | International | P0 | **built** |
| 11 | Shipment Desk (ledger-primary home) | Forwarding | P1 | to build |
| 12 | Customs & Compliance | International | P1 | to build |
| 13 | Landed Cost | International | P1 | to build |
| 14 | Settlement | all | P1 | to build |
| 15 | States (component sheet) | all | P2 | to build |
| 16 | Analytics (3 mode variants) | all | P2 | to build |
| 17 | Mode & Role Switcher (component sheet) | all | P2 | to build |

**Flow → screen mapping** (37 steps across three lanes; see the flow board in `pharos.pen`):

| Lane | Steps | Screens it touches |
|---|---|---|
| **A · Road Freight Transport** | 13 | 01 · 02 · **06** · 03 · 04 · **07** · 05 · **15** · **14** · **16** |
| **B · Freight Forwarding** | 13 | **11** · **08** · **09** · **12** · **10** · **14** · **16** |
| **C · International Logistics** | 11 | **11** · **10** · **13** · **12** · **16** |

## 1. Pencil — Prompt 0, Context (run once)

```
You are working in the Pencil document pharos.pen. Do not create any frame yet.
Read the document, confirm what you found, then wait for my next message.

WHAT EXISTS — protect all of it
8 reusable components:
  bPri  Button / Primary      mint gradient pill, arrow-right icon, ink label
  bGho  Button / Ghost        transparent, border-strong hairline
  sPil  Status Pill           dot + label, green tint
  nItm  Nav Item              icon + label + spacer, width 200
  mCrd  Metric Card           label + icon, big value, delta + comparison, width 300
  lCrd  Load Card             lane, price + $/mi, origin->dest rail, chips, "Place bid", width 400
  appSide     App Sidebar     Road-Freight vocabulary
  appSideInt  App Sidebar / International   Orders, Declarations, Classification, Screening
6 screens (do not restyle, rename, move or reorder any of them):
  01 scrLand   Landing & Login               x=0     y=0     layout:"none"
  02 scrDash   Shipper Dashboard             x=1500  y=0     flex
  03 scrLoads  Load Discovery                x=3000  y=0     flex
  04 scrBid    Bid & Negotiation             x=0     y=1100  layout:"none"  (scrim + side panel)
  05 scrTrack  Shipment Tracking             x=1500  y=1100  flex
  10 scrLeg    Leg Rail & Multi-leg Tracking x=0     y=3300  flex
And one flow board:
  flowAll  Flow — all three modes  x=0  y=5600  layout:"none"  (a FigJam-style page)

31 variables in the document variable table. Use ONLY those tokens. The ones you
will need most: $bg-app $bg-panel $bg-card $bg-card-2 $bg-input $border-subtle
$border-strong $text-primary $text-secondary $text-tertiary $accent $accent-ink
$status-green $status-amber $status-red $status-blue $status-legal-hold
$status-hold-bg $leg-active $leg-pending $leg-node-bg $font-ui $font-mono
plus the density scale row-compact 32 / row-default 44 / row-comfortable 52.

THE DESIGN THESIS — every screen must obey it
One shell, two axes.
  Axis 1 ROLE (Shipper / Carrier / Forwarder / Broker) changes what you can DO.
  Axis 2 MODE (Road Freight / Freight Forwarding / International) changes what you
  are LOOKING AT. It changes the vocabulary, the unit of work, the headline metric
  and — critically — the PRIMARY SURFACE:
    Road          -> map-primary      (geography IS the status)
    Forwarding    -> ledger-primary   (rows + expand-in-place; no map)
    International -> ledger + leg rail (no map; the leg rail is the hero)
  Three accent colours would be decoration. Changing what owns the viewport is the design.

TYPE RULES (non-negotiable)
  Inter for names and prose. JetBrains Mono for every numeral, id, label, unit and
  metric. Every value carries its unit and the UNIT is in $text-tertiary
  ("$3,450" primary + "/ mi" tertiary). All numerals tabular.
  Identifiers mono: LD-4821, ORD-8842, BK-114-882, HS 8479.89, MRN.

CANVAS LAYOUT for new frames
  every screen is 1440 x 1024 and sits on this grid:
  y=1100 : x=0 (04)   x=1500 (05)   x=3000 (06)
  y=2200 : x=0 (07)   x=1500 (08)   x=3000 (09)
  y=3300 : x=0 (10)   x=1500 (11)   x=3000 (12)
  y=4400 : x=0 (13)   x=1500 (14)   x=3000 (15)
  y=5500 : x=0 (16)   x=1500 (17)
  reusable components live at y=-320 and y=-200 (appSideInt at y=-1400)

STANDING RULES
  · Reuse the 8 components by reference ({"type":"ref"}) wherever they fit, with
    descendants overrides for labels/icons.
  · Do not invent variables. If you need a colour that is not in the table, say so
    and wait — do not add a literal hex.
  · Do not "tidy", restyle, realign or re-sort anything that already exists.
  · Never encode a state by colour alone. Every status pill needs its label; every
    mode needs its text; every leg node needs its shape (filled / ringed / outline).
  · Row height for ledgers comes from row-default; 32 for the Document Desk.

Confirm the 8 components, the 6 screens, the flow board, the token count and the
canvas grid. Then wait.
```

## 2. Pencil — P0 screens (the ones that matter most)

### Prompt 06 — Create Load → `x=3000, y=1100`

```
Create a 1440x1024 frame named "06 Create Load" at x=3000, y=1100.

Ref the App Sidebar (appSide) on the left. Main area, vertical, gap 16, padding 24.

TOPBAR (space_between, centre-aligned)
  Left: a 38x38 back-arrow circle button (bg-card, border-subtle, arrow-left) +
        a Title column: "Post a load" (Inter 20/600) over "Step 3 of 3 · rate and
        accessorials" (12.5 secondary).
  Right: a 3-segment stepper — "Lane & dates" and "Equipment" completed (mono 11,
         $text-tertiary, each with a check icon in $accent), "Rate" current
         (mono 11/600, $text-primary) — plus the mode switcher with "Road freight" active.

BODY — two columns, 62 / 38, gap 16.

LEFT PANEL (bg-card, radius 16, border-subtle, padding 18, vertical, gap 14)
  Section "Your target rate"
    A currency input (height 52, bg-input, radius 10, border-subtle) showing "$3,400"
    in JetBrains Mono 20/600 with a "$" prefix in $text-tertiary; to its right the
    note "$4.15 / mi · 820 mi" with the unit in $text-tertiary.
    Under it a benchmark block (bg-panel, radius 10, padding 12, vertical, gap 8):
      three facts in mono 11 — "Lane average $3,210" ($text-secondary),
      "6 carriers on this lane", "92% fill likelihood" ($text-tertiary);
      then a lane-range bar: a 6px track in $bg-input, radius 999, full width, with a
      10px marker in $accent sitting about 62% along it.
  Section "Accessorials" — four toggle rows. Each row: label (Inter 12.5), the rate in
    mono 11 $text-tertiary beneath it, and a 34x20 pill toggle on the right (on =
    $accent with a light knob, off = $bg-input with a $border-strong knob):
      Detention — $65 / hr after 2h — ON
      Liftgate — $85 — OFF
      Inside delivery — $120 — OFF
      Appointment required — included — ON
  A "Feasibility" strip (bg-panel, radius 10, padding 12, horizontal, gap 20) — three
  items, each an icon + two lines, verdict in a Status Pill (sPil):
      ADR class · "None declared" · green "Clear"
      Axle weight · "42,000 lbs · limit 44,000" · green "Within limit"
      Driver hours · "2 drivers · 11h each" · green "Feasible"

RIGHT COLUMN (width 420, vertical, gap 16)
  Panel "How carriers will see it" (bg-card, radius 16, border-subtle, padding 18)
    Subtitle "Live preview in Load Discovery."
    Then a live Load Card (lCrd) ref, descendants overridden: lane
    "Chicago, IL → Dallas, TX", "820 mi · Dry Van · 42,000 lbs", price "$3,400",
    "$4.15 / mi", chips "Pickup Apr 12" / "Dry Van" / "42,000 lbs", shipper
    "Meridian Foods", button "Place bid".
  Panel "What happens next" (bg-card, padding 18, vertical, gap 10)
    Four rows: a mono 10 number in $accent, then Inter 12.5 text —
      1 Published to your preferred carriers
      2 Bids arrive in the Command Center
      3 You negotiate or accept
      4 Accepting dispatches the carrier

FOOTER BAR (width fill, space_between, centre-aligned)
  Button/Ghost (bGho) "Save as draft" · mono 11 $text-tertiary "Publishing makes this
  load visible to 40,218 vetted carriers. You can pause it at any time." ·
  Button/Primary (bPri) "Publish to network" with arrow-right.

Use only the document's tokens. Every value carries its unit, and the unit is
$text-tertiary. Tabular numerals. Do not restyle any existing frame.
```

### Prompt 07 — Load Detail → `x=0, y=2200`

```
Create a 1440x1024 frame named "07 Load Detail" at x=0, y=2200.

Ref the App Sidebar (appSide). Main area, vertical, gap 16, padding 24.

OBJECT HEADER — reuse the exact pattern from screen 05:
  a 38px circle back button; "LD-4821" in JetBrains Mono 20/600; a Status Pill reading
  "In transit" ($accent on #2EE6C51F); a subtitle in 12.5 secondary:
  "Chicago, IL → Dallas, TX · 820 mi · Dry Van · 42,000 lbs · Lone Star Freight".
  Right: Button/Ghost "Message driver" and Button/Primary "View documents".

KPI STRIP — four Metric Card (mCrd) refs in a row, each width fill_container:
  "Agreed rate" $3,180 ($3.88 / mi) · "Committed ETA" Apr 14 16:40 ·
  "Margin" +$140 · "On-time risk" Low (value tinted $status-green).

BODY — two columns 58 / 42, gap 16.

LEFT column, vertical, gap 16
  Panel "Dispatch pack" (bg-card, radius 16, padding 18) — five rows, each
  [label Inter 12 secondary][value Inter 12.5 primary][Status Pill]:
    Carrier authority · Lone Star Freight · green "Valid to Mar 2027"
    Cargo insurance   · $100,000            · green "Valid"
    Driver            · Miguel R. · CDL IL  · green "Verified"
    Tractor           · IL 8842-KT          · green "Plated"
    Trailer           · IL 5510-TR · 53ft reefer · green "Seal #44921"
  Panel "Remittance" (bg-card, padding 18) — charge table, mono values right of Inter
  labels, hairline between rows:
    Line haul $3,180 · Fuel surcharge included · Detention — · Total $3,180 (600 weight)
  Panel "Activity" (bg-card, padding 18) — four entries, the latest tinted $accent:
    "Carrier assigned · Apr 12 07:58" · "Dispatched · Apr 12 08:04" ·
    "Picked up · Apr 12 08:20" · "Status updated: in transit · Apr 12 10:48"

RIGHT column (width 420), vertical, gap 16
  Panel "Milestones" (bg-card, padding 18) — a vertical rail with four nodes, the NODE
  SHAPE carrying the state (filled = done, ringed in $accent = current, outline =
  pending), each with an Inter title and a mono 10.5 meta line:
    Picked up · Apr 12 08:20        (done)
    In transit · Now · 62% complete (current)
    Delivery window · Apr 14 12:00–18:00  (pending)
    POD · auto-request after delivery     (pending)
  Panel "Documents" (bg-card, padding 18) — three rows, each a name + mono meta, an
  owner chip, and a Status Pill; hairline between:
    "Bill of Lading.pdf · 240 KB · Apr 12"                     green  "Uploaded"
    "Proof of Delivery · requested Apr 12 · due Apr 14 18:00"  amber  "Awaiting"
    "Weight ticket · missing · blocking invoice"               red    "Blocking"

FOOTER: two lines in mono 10.5 $text-tertiary — the carrier obligation and the
detention policy.
```

### Prompt 08 — Quote Builder → `x=1500, y=2200`

```
Create a 1440x1024 frame named "08 Quote Builder" at x=1500, y=2200.

Ref the App Sidebar / International (appSideInt). Main area, vertical, gap 16, padding 24.

TOPBAR: "Quote builder" (Inter 20/600) over "Hamburg, DE → New York, US · 14 pallets ·
machine parts · FCA" (12.5 secondary). Right: the mode switcher with "Forwarding"
active, Button/Ghost "Save draft", Button/Primary "Send quote".

BODY — two columns, 44 / 56, gap 16.

LEFT column, vertical, gap 16
  Panel "Consignment" (bg-card, radius 16, padding 18) — read-only rows, mono values:
    Commodity           Machine parts (HS 8479.89)
    Packages            14 pallets
    Actual weight       3,850 kg
    Dimensions          1.2 × 0.8 × 1.1 m each
    Ready               Apr 22
    Incoterm            FCA Hamburg
  Panel "Chargeable weight" (bg-card, padding 18) — THE CENTREPIECE. A calculator:
    "Actual weight"      3,850 kg        (Inter label, mono value)
    "Volume"             14.78 m³
    "Volumetric factor"  ÷ 6,000        (factor in $text-tertiary)
    "Volumetric weight"  2,463 kg
    a hairline, then a highlighted row in a bg-card-2 block with a 2px $accent left edge:
      "Chargeable weight · 4,620 kg"  with the caption
      "Billed on the greater of actual and volumetric. Actual wins by 1,357 kg."
      Put the words "Actual wins" in $accent — that is which basis is winning.
    Below, mono 10.5 $text-tertiary: "Billing on volume alone would undercharge $2,458."

RIGHT column, vertical, gap 16
  Panel "Rate" (bg-card, padding 18) — three rate sources as rows, the winning one
  tinted bg-card-2 with a $accent check icon, amounts mono:
    "Contracted rate card · HAM–NYC · valid to Jun 30"   $2,140   (WINNER)
    "Spot market · 3 quotes today · range $2,290–$2,610" $2,410
    "Manual override"                                     —
    Caption mono 10.5 $text-tertiary: "All three shown so the sell price can be defended."
  Panel "Charge lines" (bg-card, padding 18) — grouped rows. Each group: a mono 9.5
  uppercase header in $text-tertiary, then rows of
  [label Inter 12 secondary][basis mono 10.5 tertiary][bought mono 12][sold mono 12]:
    ORIGIN       Pickup Hamburg      $/consignment  $180     $240
                 Export customs      $/declaration  $95      $140
                 Terminal handling   $/kg           $0.04    $0.06
    FREIGHT      Ocean freight       $/kg           $2,140   $2,860
    DESTINATION  Terminal handling   $/kg           $0.05    $0.07
                 Import customs      $/declaration  $110     $160
                 Delivery NYC        $/consignment  $320     $410
    SURCHARGES   BAF                 included       —        —
                 Security            $/consignment  $28      $38
  Panel "Margin" (bg-card-2, stroke $accent, padding 18, horizontal, space_between)
    Left: "Sell $3,919" over "Buy $2,873 · 4 charge groups" in mono 10.5 $text-tertiary.
    Right: "$1,046" in JetBrains Mono 26/600 $accent, with "26.7% margin" beneath.
  Rows: "Valid until May 6" and "Promised 11 days" in mono 11, then Button/Primary
  "Send quote". Keep exactly one primary action on this screen.

Every number in JetBrains Mono. Every value carries its unit, the unit in
$text-tertiary. Use only the document's tokens.
```

### Prompt 09 — Document Desk → `x=3000, y=2200`

```
Create a 1440x1024 frame named "09 Document Desk" at x=3000, y=2200.

This is the ledger-primary layout: NO map. It is a dense queue, so rows use
row-compact (32) and the panel fills the viewport.

Ref the App Sidebar / International (appSideInt). Main area, vertical, gap 16, padding 24.

TOPBAR: "Document desk" (Inter 20/600) over "Every document across 12 open shipments ·
updated 4 min ago" (12.5 secondary). Right: the mode switcher with "Forwarding" active,
a search field (bg-input, radius 999, search icon, placeholder "Search document or
shipment"), Button/Ghost "Export", Button/Primary "Add document".

KPI STRIP — four Metric Card (mCrd) refs, width fill_container:
  "Completeness" 91% (+4.2% this week) · "Blocking cut-offs" 2 (orange value
  $status-amber) · "Awaiting others" 5 · "Overdue" 1 ($status-red)

FILTER ROW (horizontal, gap 8) — chips with a chevron icon, mono 11, bg-card, radius 999,
border-subtle, padding [6,12]; the first is active (fill bg-card-2, $text-primary):
  "All · 12"  ·  "Needs me · 3"  ·  "Awaiting others · 5"  ·  "Overdue · 1"  ·  "Customs · 4"

THE QUEUE — one panel (bg-card, radius 16, border-subtle, padding 0), and INSIDE it a
sticky header row using the brand's grid-gap divider motif (bg-border showing through
1px gaps):
  HEADER (height 40, bg-card): columns, mono 9.5/600 letterspacing .8, $text-tertiary:
    DOCUMENT (fill) · SHIPMENT (120) · OWNER (150) · DUE (96) · STATUS (120)
  Then 9 rows, each height 32 (row-compact), separated by a 1px hairline in
  $border-subtle, columns exactly aligned with the header:
    Commercial invoice.pdf     · BK-114-882 · MW M. Weber     · Apr 12 · green  Uploaded
    Packing list.xlsx          · BK-114-882 · MW M. Weber     · Apr 12 · green  Uploaded
    Bill of lading (HBL)       · BK-114-882 · SP Sanjay P.    · Apr 26 · amber  Pending
    Import declaration (SAD)   · BK-114-882 · CD Customs desk · Apr 28 · VIOLET Blocking
    Certificate of origin      · BK-114-879 · GV G. Van Dijk  · Apr 25 · amber  Pending
    Cargo insurance cert.      · BK-114-879 · MW M. Weber     · Apr 20 · red    Overdue
    Commercial invoice.pdf     · BK-114-871 · MW M. Weber     · Apr 18 · green  Uploaded
    Delivery note              · BK-114-871 · YF Your fleet   · Apr 24 · violet Not started
    Export declaration (EX-A)  · BK-114-871 · CD Customs desk · Apr 21 · green  Cleared
  Rows alternate nothing — do NOT zebra-stripe. The hairline is the separator.
  The BLOCKING row gets a 2px $status-legal-hold left edge on the panel and its
  document name in $text-primary 600 weight; every other name is 500.
  Colour the status pill ONLY; everything else in the row stays neutral.

FOOTER ROW inside the panel (height 44, bg-panel, mono 10.5 $text-tertiary,
space_between): "9 of 12 shown" on the left, "1 blocking · cut-off in 18h" on the right
with "cut-off in 18h" in $status-amber.

CRITICAL: status must be readable with the colour removed. "Blocking" carries meaning
from the word, not the violet. Do not use $status-legal-hold anywhere on this screen
except the Blocking and Not started states.

Use only the document's tokens. Never add a literal hex. Tabular numerals throughout.
```

## 3. Pencil — P1 and P2 (condensed specs)

These follow patterns already established by 06–10, so the prompts can be shorter. Run Prompt 0 first, then one per screen.

**11 · Shipment Desk** → `x=1500, y=3300` — *the screen that proves the thesis; ship this before the rest of P1.*
Ledger-primary home for Forwarding, deliberately built to sit next to `02 Command Center` in the case study. Sidebar = `appSideInt`. Topbar: "Shipments" + "12 open · 3 need action" + a filter row + mode switcher (Forwarding active). Then a full-width ledger: columns `ID (mono) · ROUTE · LEGS · DOCS · CUSTOMS · ETA`, rows at `row-default`, with a progress meter in the DOCS column (`7/9`). One row is selected and **expands in place** to reveal a detail panel holding the leg rail, the document list and the charge lines. **No map anywhere.** If this frame ends up looking like `02` with different column names, the design has failed — go back and change what owns the viewport.

**12 · Customs & Compliance** → `x=3000, y=3300`
Declaration detail. Left: a declaration card (type, MRN `26DE…`, broker, lodgement date, status), then HS classification rows (`8479.89` with the description and a "ruling saved" tag), then origin + FTA preference (`EU–KR · preference claimed · duty 0% vs 2.7% MFN`), then a sanctions / dual-use screening result. Right: a hold card in violet with an owner and an `Add the missing certificate of origin` action, then a declaration timeline. Use `$status-legal-hold` for holds only.

**13 · Landed Cost** → `x=0, y=4400`
A waterfall from goods value to landed cost per unit, with a right-aligned currency column (the one place right-alignment is correct, because these numbers are summed). Lines: goods · freight per leg · insurance · origin charges · duty (with its basis in mono tertiary) · VAT (mark recoverable vs not) · brokerage → total. Then estimate-vs-actual: budget, forecast, variance, and the named driver. Footnote the FX rate and its date.

**14 · Settlement** → `x=1500, y=4400`
Charge lines with **bought / sold / margin** columns, then accessorials, fuel surcharge, detention, then the invoice with credit terms (30/60/90) and a state chip (`Draft · Sent · Paid`). One row must be in dispute, with the reason stated in words.

**15 · States** → `x=3000, y=4400` — *a component sheet, not a screen.*
Eight state blocks in a grid, each labelled: no loads match · quote expired · cut-off missed · customs hold · carrier insurance lapsed · POD disputed · empty ledger · offline. Each block: the message, the explanation, the actions. Copy the strings from plan §10.4 verbatim.

**16 · Analytics** → `x=0, y=5500`
One frame, three labelled mode variants side by side. Road: on-time %, cost per mile, empty miles. Forwarding: quote win rate, quote→booking time, document completeness. International: landed-cost variance, customs dwell, duty spend. The headline metric changes with the mode — that is the point of the frame.

**17 · Mode & Role Switcher** → `x=1500, y=5500` — *component sheet.*
The two axes as components. Row 1: the mode switcher in all three states, each annotated with what it changes (the adaptation table, plan §4.2). Row 2: the role switcher — Shipper · Carrier · Forwarder · Broker — with the home surface each one lands on. Everything reachable, nothing colour-only.

## 4. Pencil — review passes and guardrails

**After each screen, run this — findings only, no edits:**

```
Review the frame "<NAME>" using the better-layout skill.
Report only, and do not change anything yet:
  1. Is the intended primary surface actually dominant, or does something compete with it?
  2. Does the spacing rhythm match the existing screens — 16 between panels, 18 panel padding,
     14 between sections, 10 between rows?
  3. Does any element look like a generic dashboard component rather than something specific
     to freight?
  4. Is any numeral set in Inter instead of JetBrains Mono, or missing its unit?
List every finding with the layer name.
```

```
Using the better-accessibility skill, audit "<NAME>".
Confirm: every status is legible with the colour removed; every state has a label or icon and
not only a hue; row hit areas are at least 32px; violet appears only for states outside the
team's control. List violations.
```

**Then fix one thing per prompt.** Never say "fix all of the above" — the agent will restyle the frame and you will lose the system.

**Guardrail to repeat whenever output drifts:**

```
Stop. Revert that change. Re-read the existing screens 02, 05 and 10 and match their spacing,
panel radius (16), panel padding (18), gap rhythm (16) and text colours exactly. Do not
introduce any new colour. Do not restyle existing frames. Then make only the single change
I asked for.
```

---

## 5. Figma — the prompt, and why it needs a different shape

Figma's AI has **no knowledge of your document**, so its prompt has to carry the whole visual system. Keep it to one screen per run — asking Figma for "a flow" produces something generic.

### Figma "First Draft" prompt — screen 09 Document Desk

```
A dense operations data table screen for a freight forwarding platform, 1440x1024, dark theme.

Style: near-black navy background #080E1C. Panels #0C1424 with #1C2A44 1px borders and 16px
corner radius. Elevated cards #111C31. Inputs #0A1120. Primary text #EEF3FB, secondary #93A4C0,
tertiary #63738F. One mint accent #2EE6C5, used only for the primary button and active states.
Status colours: green #33D69F, amber #FFB020, red #FF5C6C, violet #A78BFA. Type: Inter for all
names and labels, JetBrains Mono for every number, identifier and unit — value in primary,
unit in tertiary ("$3,450" + "/ mi"), tabular figures. Restrained and technical: high information
density, no gradients except one on the primary button, no drop shadows, no pill-shaped
everything.

Layout: a 248px left sidebar with a small logo mark, a 10px uppercase letterspaced mono section
label, and six nav items with one active (filled #16233B). A top bar with the title "Document
desk", a subtitle, a pill search field, a secondary "Export" button and a mint primary
"Add document" button. A row of four KPI cards (label, icon, large mono value, small delta with a
comparison caption). A row of five filter chips, the first active.

Then the main element: one large panel containing a table. Header row in 9.5px uppercase
letterspaced mono: DOCUMENT, SHIPMENT, OWNER, DUE, STATUS. Nine data rows at 32px height separated
by 1px hairlines, no zebra striping. The document column shows a filename at 500 weight with a
mono metadata line beneath. The owner column shows an 18px circular avatar chip with initials plus
a name. The status column shows a pill with a dot and a word: "Uploaded" green, "Pending" amber,
"Overdue" red, "Cleared" green, "Not started" violet, "Blocking" violet. The blocking row gets a
2px violet left border and its filename at 600 weight. A footer strip inside the panel:
"9 of 12 shown" and "1 blocking · cut-off in 18h".
```

### Getting Figma to do the whole flow

One Figma prompt will not produce 17 coherent screens. The reliable route is to make **Figma own the system, not the screens**:

1. **Variables with three Modes.** Collection `Pharos / Mode` with modes `Road`, `Forwarding`, `International`. Put every mode-dependent value in it: nav labels, the object noun (Load / Shipment / Order), the ID format, the primary-surface flag, the summary columns. Switching a frame's mode then re-labels it. **This is the direct Figma equivalent of the two-axis thesis — and the strongest reason to build this project in Figma at all.**
2. **Component variants** for the pieces the case study leans on: `Status Pill` (one variant per status), `Leg Node` (done / current / pending), `Ledger Row` (default / expanded / selected), `Document Row` (uploaded / pending / overdue / blocking).
3. **Auto layout everywhere**, with padding and gap bound to number variables (`row-compact 32`, `row-default 44`, `row-comfortable 52`) so the density toggle becomes a variable swap.
4. Use First Draft **only for the content of one frame at a time**, inside an already-correct shell.

### Paste this alongside any Figma prompt

```
Do not invent a new visual language. Every colour, radius, spacing value and font size must come
from the list above. Do not add gradients, glows, drop shadows, illustrations, icon sets beyond
simple 1.5px-stroke line icons, or placeholder photography. Do not use all-caps in Inter —
uppercase is reserved for 9–10px JetBrains Mono labels. Do not centre-align anything except
status pills and empty-state messages; everything else is left-aligned, including currency
columns in tables.
```

---

## 6. Which tool for which job

| Job | Use | Why |
|---|---|---|
| Remaining screens 06–17 | **Pencil** | It knows the document; components and tokens are already there |
| The flow board | **Pencil** — done, `flowAll` | Lives beside the screens and exports cleanly for the case study |
| Interactive click-through for a portfolio link | **Figma** | Prototyping is far ahead of a static board |
| The mode switcher as a live variant system | **Figma** | Variable Modes are the right primitive; Pencil has no equivalent |
| Case-study imagery | either | Export at 2×; `.webp` for the site, `.png` for review |
| Reviewer handoff | either | `.pen` is portable JSON; Figma is a link |

**The pragmatic answer:** finish the screens in Pencil — faster, and it is system-aware. Then, only if you want a clickable prototype on the site, rebuild the *shell* in Figma with Variable Modes and prototype the three flows there. Do not maintain both in parallel.








