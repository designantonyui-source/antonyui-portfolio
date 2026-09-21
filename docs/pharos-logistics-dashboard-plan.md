# Pharos — Road Freight, Freight Forwarding & International Logistics

**A plan for the logistics case study on antonyui.com: the research, the design thesis, the logical flows, the screens to build in Pencil, and how it lands on the site.**

Prepared 2026-09-21 · Covers `~/.pencil/documents/pharos-01/pharos.pen` and the `antonyui-portfolio` repository.

---

## 0. TL;DR — the plan in ten lines

1. **You already have the hard part.** `pharos.pen` contains a working 5-screen freight exchange: landing/login, shipper command center, load discovery, bid negotiation, shipment tracking — with 7 reusable components and a 22-token navy/mint system. It is good work, and it is *national FTL trucking*.
2. **What it does not yet cover** is exactly what the brief asks for: LTL, freight forwarding (the forwarder's commercial and document workflow), and international logistics (multi-leg, Incoterms, customs, landed cost).
3. **Market context:** digital freight *forwarding* is growing at **18.09% CAGR** ($42.46B 2025 → $118.12B 2031), while European road freight — the actual haulage market the current design depicts — grows at **3.07%**. Value has moved from moving goods to orchestrating information. The case study must show the orchestration layer.
4. **Design thesis: two axes, one shell.** *Role* (Shipper · Carrier · Forwarder · Broker) × *Mode* (Road Freight Transport · Freight Forwarding · International Logistics). The shell, tokens and components stay constant; the vocabulary, the unit of work, the primary surface and the columns change per mode. That is the single idea the whole case study is built to demonstrate.
5. **Mode changes behaviour, not just colour.** Road is map-primary (geography *is* the work). Forwarding and International are ledger-primary with the map revealed on row-select, because there the work is documents and status, not geography. Three accent colours would be decoration; this is substance.
6. **Rebalance the flow.** The current spine jumps from dashboard straight to a load board. A real flow needs **Create load → Publish → Match → Negotiate → Book → Dispatch → Transit → Proof → Settle**. The missing Create-load step is the biggest gap.
7. **Add three things the current design has no vocabulary for:** the *document set* (forwarding), the *leg rail* (international), and the *landed-cost waterfall* (international). Each gets one screen.
8. **One new hue only.** A violet `status-legal-hold`, reserved exclusively for states outside the user's control (customs hold, sanctions review, broker pending). Everything else stays in the existing palette.
9. **Ship it in three passes.** P0 = 5 screens that complete the spine and prove the thesis. P1 = 4 screens that make forwarding real. P2 = 3 screens that make international real. P0 alone is already a credible case study.
10. **Fix the dangling promise.** `work/priwatt.html` currently advertises "Pharos — Freight Exchange Platform · Coming soon" at 40% opacity. Either ship the case study or remove the stub.

---

## 1. Audit — what already exists

### 1.1 File

`~/.pencil/documents/pharos-01/pharos.pen` — 99,877 bytes, Pencil document format `v2.18`, three top-level keys: `version`, `children`, `variables`.

### 1.2 Reusable components (7)

| Name | ID | What it carries |
|---|---|---|
| Button / Primary | `bPri` | Mint gradient pill (`#3BF0D0` → `#0FAD92`, 200° rotation), label + arrow icon, ink text `$accent-ink` |
| Button / Ghost | `bGho` | Transparent, `$border-strong` hairline, secondary text |
| Status Pill | `sPil` | Dot + label, green tint `#33D69F1F` |
| Nav Item | `nItm` | Icon + label + spacer — the sidebar row |
| Metric Card | `mCrd` | Label + icon, big value (`1,284`), delta (`+12.4%`) and comparison (`vs last week`) |
| Load Card | `lCrd` | Lane string, `820 mi · Dry Van · 42,000 lbs`, price `$3,450` + `$4.20 / mi`, origin → track → truck → dest rail, chips, shipper avatar, **Place bid** |
| App Sidebar | `appSide` | 248px shell — Brand/Wordmark, OPERATIONS, WORKSPACE, user block |

### 1.3 Screens (5)

| # | Frame | Size | What is actually in it |
|---|---|---|---|
| 01 | Landing & Login | 1440×900 | Split layout. Left: photo + scrim, pitch *"Every load matched, bid and tracked in one place."*, four stats (1.2M loads/yr · 18% cost saved · 96% on-time · 4.8 min match). Right: login card with a **Shipper/Carrier role toggle**, SSO/SAML + Google, trust row (SOC 2 Type II · GDPR ready · 256-bit encryption) |
| 02 | Shipper Dashboard | 1440×1024 | "Command Center". Four metric cards; **Live map** (14 shipments across 9 lanes, legend in transit/delayed/delivered); **Recent shipments** table (LOAD ID · LANE · CARRIER · STATUS · ETA); **Pending bids** (three carriers with price, $/mi, rating `4.9 · 214 loads`, Accept/Counter); **Capacity forecast** (9-day available trucks, `+18%`) |
| 03 | Load Discovery | 1440×1024 | "1,284 loads match your lanes · updated 2 min ago". Filter chip row, quick-filter panel (equipment, toggles: available now / preferred lanes only / my fleet fits), results list of Load Cards, sort "Best match" |
| 04 | Bid & Negotiation | 1440×1024 | Shipper-side panel over a dimmed board. "Awaiting your response · Expires in 4h 12m"; route card; **ask vs offer comparison** (`$3,180` `$3.88 / mi` ↔ `$3,320` `+4.4% above ask`); lane intelligence hint; negotiation-history timeline (posted → bid → counter → revised); counter input; footer *"Accepting locks the lane at this rate and dispatches the carrier."* |
| 05 | Shipment Tracking | 1440×1024 | `LD-4821 · In transit · Chicago, IL → Dallas, TX · Lone Star Freight · 820 mi`. Progress timeline (picked up → in transit 62% → customs → delivered); **Documents** (BOL uploaded, POD "Awaiting · auto-request sent"); live position map (`62 mph · I-35 S`); **driver chat** with the seal-number exchange |

### 1.4 Design tokens (22 variables)

```
Surfaces   bg-app #080E1C · bg-panel #0C1424 · bg-card #111C31 · bg-card-2 #16233B · bg-input #0A1120
Borders    border-subtle #1C2A44 · border-strong #2B3D5E
Text       text-primary #EEF3FB · text-secondary #93A4C0 · text-tertiary #63738F
Accent     accent #2EE6C5 · accent-deep #0FA98E · accent-ink #05231D
Support    orange #FF7A45
Status     green #33D69F · amber #FFB020 · red #FF5C6C · blue #4C9AFF
Overlay    glass #FFFFFF0F · glass-border #FFFFFF1F
Type       font-ui Inter · font-mono JetBrains Mono
```

### 1.5 What is strong — keep all of this

- **A real operating model, not a mockup.** The lane-intelligence hint ("Lane average $3,210 · 6 carriers bidding · your budget $3,400") is the kind of detail only someone who understands the domain writes. Same with `$4.20 / mi`, `+4.4% above ask`, `seal #44921`, and *"Accepting locks the lane at this rate and dispatches the carrier."*
- **The negotiation-history timeline is the best artefact in the file.** Mutual counter-offers with timestamps *is* the actual mechanic of spot freight, and it is rarely designed this well.
- **The BOL/POD pair in tracking is a genuine insight.** Freight ops is document-driven, and the `Awaiting · auto-request sent` state shows the system doing work rather than merely reporting.
- **A disciplined token set.** 22 variables, one accent, four status colours, no rogue hex, and a consistent 1440×1024 screen convention.

### 1.6 The five gaps that matter

| # | Gap | Why it matters for the case study |
|---|---|---|
| **G1** | **Role duality is half-built.** Login has a Shipper/Carrier toggle; the Load Card carries a carrier action (**Place bid**); every workspace screen is shipper-side. | A two-sided marketplace is the whole premise. A reviewer notices the first time they pick "Carrier" and nothing changes. Either commit to two role shells or remove the toggle. |
| **G2** | **No create-load step.** The flow runs dashboard → load board. Nothing in the design lets a shipper *author* a load. | Authoring is where pricing, equipment, accessorials and compliance get decided — the highest-judgement part of the product, and therefore the most interesting part to show. |
| **G3** | **Single-leg only.** One origin, one destination, one truck, one leg. | Forwarding and International are *multi-leg by definition*. Without a leg model there is no way to design them at all. |
| **G4** | **No document or compliance layer.** "Documents" appears once, inside tracking. No declaration, no HS code, no Incoterms, no broker, no EORI. | This is precisely where the market is growing (§2) and where the differentiated UX lives. It is also what separates a trucking app from a logistics platform. |
| **G5** | **Money stops at the rate.** No settlement, no surcharges, no duty/VAT, no credit terms, no invoice. | Freight is a cash-flow business. A logistics case study that never shows money closing looks unfinished. |

### 1.7 One consequential consistency bug

`02 Shipper Dashboard` says "**Pending bids**" with **Accept / Counter** and "Review all" — shipper-side. `03 Load Discovery` places the **Load Card** with "**Place bid**" and a shipper label ("Meridian Foods") — carrier-side. The two screens are currently speaking from opposite sides of the trade. The Role axis in §3 is the fix.

---

## 2. Market analysis

### 2.1 The numbers

| Market | Size | Growth | Source |
|---|---|---|---|
| **Digital freight forwarding** (software + digital brokerage) | **$42.46B (2025)** → **$51.43B (2026)** → **$118.12B (2031)** | **18.09% CAGR** 2026–31 | Mordor Intelligence, digital freight forwarding report, page updated 11 Sep 2026 |
| **European road freight transport** (the actual haulage market) | **$528.02B (2025)** → **$544.23B (2026)** → **$633.73B (2031)** | **3.07% CAGR** 2026–31 | Mordor Intelligence, Europe road freight transport report |

**Read the two lines together — that pairing is the argument for this case study.**

Road freight is a half-trillion-dollar market growing at roughly the rate of inflation: low margin, brutally fragmented ("market concentration: low"), competed on capacity and price. Digital freight forwarding is a one-hundred-billion-dollar market growing six times faster, and the same report says the differentiation has shifted away from mode-switching toward **"platforms that solve visibility, documentation, and compliance gaps"**, with value concentrating in **"value-added layers such as customs, sustainability reporting, and trade finance"**.

So: the current `pharos.pen` designs the 3%-growth market beautifully, and does not touch the 18%-growth one. Extending it to Freight Forwarding and International Logistics is not scope creep — it is moving the case study to where the industry's product investment actually is.

Two supporting observations from the same report, both directly relevant to the design:

- **SMEs are adopting faster than enterprises**, because "subscription pricing, pooled capacity, and pre-built integrations" remove the scale disadvantage. → The product's primary user is an ops generalist at a 5–50 person shipper or forwarder, not a specialist at a Fortune 500. That justifies one shell with mode-aware vocabulary over three separate specialist tools.
- **Functional differentiation is in the value-added layers.** → Customs, documents and landed cost are not edge features to sketch later. They are the product's differentiator, and they deserve first-class screens.

### 2.2 What a 2026-grade logistics platform actually ships

Benchmarked against the two ends of the category — a **visibility/TMS layer** (project44) and a **forwarder-as-platform** (Flexport) — plus a **European digital road freight carrier** (sennder):

**project44** (visibility & decision layer) organises its platform as: Visibility (ocean · over-the-road · air · rail · ports & terminals · emissions · theft prevention · tariff analytics), Transportation Management (rating & booking · documents · port intel · sailing schedules · freight procurement analytics), Yard Management (appointments · yard · automation), eCommerce Logistics (last-mile resolution · insights · consumer visibility · predictive delivery dates), and AI Orchestration (agents · no-code agentic workflow manager · "Mo", an AI analyst). Its stated foundation is data readiness, accuracy and actionability.

**Flexport** (forwarder-as-platform) organises as: Freight Forwarding (Control Tower · ocean · air · trucking covering drayage, cartage, FTL & LTL · order management · booking management · buyer's consolidation · carbon control), a Customs Suite (brokerage · trade advisory · tariff simulator · tariff refunds · duty drawback · compliance audit · HS classification), Fulfillment, and Financial Services (trade finance · cargo insurance). Its pitch is visibility with **SKU-level track-and-trace milestones synced to purchase orders**.

**sennder** (European digital road freight) publishes: 150,000+ loads per month, 40,000+ vetted carriers, 250,000+ available vehicles, aggregation of **20+ load boards**, FTL with full visibility, a language-matched named contact, CO₂e reduction reporting, and a lifecycle platform (sennOS) with an agentic control layer.

**The convergent checklist** — every serious platform ships all seven:

1. A **unified tracking surface** with predicted ETA and a documented exception state (not just "in transit").
2. A **document layer** with named artefact types, per-document status, and an owner.
3. **Customs / classification** as a workflow, not a form: HS codes, tariff and duty, broker handoff.
4. **Cost intelligence**: rate benchmarks, lane history, and the gap between estimate and actual.
5. **Multi-modal legs** in one object (ocean / air / road / rail under one shipment).
6. **Emissions** per shipment or per lane.
7. **Settlement and financial services**: invoice, credit terms, trade finance, cargo insurance.

Against that checklist, the current `pharos.pen` has (1) partially — in transit and delayed, but no predicted ETA or exception resolution — and nothing of (2)–(7). That is the scope of the extension, and it is also the case study's narrative shape: *"here is what I had, here is the gap analysis against the category, here is how I closed it without forking the product."*

### 2.3 Domain constraints the UI has to respect

These are not optional flavour. Each one generates a screen element.

**Incoterms® 2020 — 11 rules, two families.** The ICC defines them as "a set of eleven three-letter trade terms, reflecting business-to-business practice in contracts for the sale and purchase of goods."

- **Any mode of transport (7):** `EXW` · `FCA` · `CPT` · `CIP` · `DAP` · `DPU` · `DDP`
- **Sea and inland waterway only (4):** `FAS` · `FOB` · `CFR` · `CIF`

Each rule fixes three things at a named point on the route: **where risk passes**, **who pays what**, and **who arranges insurance**. *Design consequence:* the Incoterm is not a dropdown in a settings page — it is a **route overlay** that must render on the leg rail, showing the cost-and-risk handover point between seller and buyer. Users who cannot see where the term flips will misread their own liability. This is the single most under-designed object in commercial logistics software, and it is a legitimate differentiator for the case study.

**The document set is the product.** Read the category benchmarks again — Flexport's Customs Suite, project44's documents module, sennder's POD workflow. A cross-border movement carries, at minimum: commercial invoice, packing list, bill of lading or air waybill, certificate of origin, cargo insurance certificate, customs declaration (export and import), and a proof of delivery. *Design consequence:* documents need **status, owner, and deadline**, not just a file list. "Awaiting · auto-request sent" (which tracking already does well) is the correct pattern, applied consistently.

**Chargeable weight is the pricing primitive of forwarding.** Air and LCL cargo bill on chargeable weight — the greater of actual weight and volumetric weight (volume ÷ a carrier factor). *Design consequence:* the quote builder needs a live weight/volume calculator where the user can see which of the two is winning, because that is the number that decides their margin.

**eFTI — the EU electronic freight transport regulation, Regulation (EU) 2020/1056.** This standardises digital exchange of regulatory freight information so authorities accept electronic rather than paper documents. ⚠️ **Verify the compliance dates and the covered information categories against the official EUR-Lex text before publishing any claim about them in the case study** — secondary sources disagreed and the EU pages were unavailable at the time of writing. If verified, eFTI is a strong "why now" argument for the compliance layer.

**Emissions are now a procurement criterion**, not a nice-to-have (sennder markets CO₂e reduction; project44 and Flexport both ship emissions products). One line item per leg is enough for the case study.

### 2.4 The three service lines, defined

The brief names three lines. They are not three difficulty levels of the same thing — they are **three different businesses with different units of work**, and the whole design problem is that they share a customer and a shell.

| | **Road Freight Transport** | **Freight Forwarding** | **International Logistics** |
|---|---|---|---|
| **What it is** | Moving goods by truck. Domestic or intra-region. | A forwarder contracts capacity and handles the commercial + documentary work on the shipper's behalf. | A cross-border movement, multi-leg, through customs at both ends. |
| **Unit of work** | **Load** | **Shipment / booking** | **Order** (a set of legs) |
| **Primary identity** | `LD-4821` | Booking ref · HAWB / HBL | Order no. + PO + HS code |
| **Quantity** | Pallets · lbs · linear feet | Chargeable weight (kg) · CBM | Chargeable weight × legs |
| **Price basis** | **$ / mile** + fuel surcharge | **$ / kg**, **$ / CBM**, origin + destination charges | Freight per leg + **duty + VAT** + brokerage fees |
| **Route shape** | 1 leg, door to door | 1 booked leg, door to door, forwarder-owned | **N legs**, door → terminal → main leg → terminal → door |
| **Parties** | Shipper · carrier · driver | + forwarder · co-loader · customs broker | + consignee · overseas agent · terminal · customs authority |
| **Documents** | BOL · POD | HAWB/HBL · invoice · packing list · export entry | + certificate of origin · insurance · import entry · eFTI |
| **Risk axis** | On-time · hours of service · damage | Cut-off missed · demurrage & detention | Incoterms · duty exposure · customs hold |
| **Compliance** | ADR (dangerous goods) · axle weight · HOS | Export declaration · HS classification · EORI | + sanctions screening · duty preference / FTA · dual-use |
| **The metric that proves it works** | On-time % · cost per mile | Quote→booking time · document completeness | **Landed cost vs estimate** · customs dwell time |

**The insight this table produces:** the three lines are three *different economic engines*. Road makes money on utilisation and fuel. Forwarding makes money on the spread between bought and sold capacity, plus service fees. International makes money on the total landed cost and the financing of duty. A single shell works only if the **primary surface** and the **headline metric** change with the mode — which is exactly what §3 and §5 specify.

---

## 3. Design thesis

### 3.1 The idea, in one sentence

> **One shell, two axes.** Who you are (Role) changes what you can do; what you are moving (Mode) changes what you are looking at — and the vocabulary, the primary surface and the headline metric all follow the mode without the product forking.

Everything else in this plan is an argument for that sentence.

### 3.2 Axis 1 — Role (who am I)

Four roles, two shells. This resolves finding **G1**.

| Role | Shell | Home surface | The action they are here to take |
|---|---|---|---|
| **Shipper** | Request side | Command Center | Get my freight moved on time, for less |
| **Carrier** | Supply side | Load Discovery | Fill my trucks; don't deadhead |
| **Forwarder** | Service side | Shipment Desk | Win the quote, keep the documents clean |
| **Broker / Agent** | Service side | Customs Desk | Clear it; don't let it sit |

Shipper and Carrier are the two sides of the marketplace the current design half-built. Forwarder and Broker are the professional roles that Freight Forwarding and International Logistics require. **The role picker already exists on screen 01 — make it consequential, or delete it.** Recommendation: keep it, and change the sidebar's first section, the home surface and the default mode per role.

### 3.3 Axis 2 — Mode (what am I moving)

The load-bearing decision. Three modes, and one behavioural difference between them:

| Mode | Primary surface | Why | Map role |
|---|---|---|---|
| **Road Freight Transport** | **Map-primary** | A truck moves continuously through geography; the map *is* the status. Capacity is spatial — which trucks are near which lane. | Always visible, ~40% of viewport |
| **Freight Forwarding** | **Ledger-primary** | The work is documents, cut-offs and charge lines. Geography is a single origin–destination pair that does not change. | Revealed on row-select |
| **International Logistics** | **Ledger + leg rail** | The work is per-leg ownership, customs state and landed cost. Geography matters at the level of "which terminal", not "which mile". | Revealed on row-select, replaced by the leg rail |

This is the difference between a design and a decoration budget. Painting the forwarding screens mint and calling it a mode would be the templated move; **changing what owns the largest pixels is the actual design decision**, and it is defensible in a portfolio write-up in one paragraph.

**Which mode does the shell default to?** Not the last-used one. Default to the mode the user's role implies, and make the switcher one click, always labelled, never colour-only. A forwarder opening Pharos should never land on a truck map.

### 3.4 Colour — keep the palette, add exactly one hue

The existing 22 tokens stay. Two additions, both justified by information rather than taste:

```
NEW  status-legal-hold   #A78BFA
NEW  status-hold-bg      #A78BFA1F
```

Rationale: the palette's four status colours (`#33D69F` green, `#FFB020` amber, `#FF5C6C` red, `#4C9AFF` blue) already encode **service health** — moving fine, at risk, failed, informational. Customs holds, sanctions reviews and broker-pending states are a *different kind of fact*: nothing is wrong with the shipment, and nobody on this team can fix it by working harder. Violet — the one hue in the set that reads as neither good nor bad — gives that a home. Users learn it once and it pays for itself on every cross-border screen.

Explicitly rejected: three accent colours for the three modes. Mode is a scope, not a health state; the sidebar section header, the page-title vocabulary and the unit-of-work label already carry it. Adding hue would mean the accent stops meaning anything.

### 3.5 Type — unchanged, with three rules for freight data

`Inter` + `JetBrains Mono` is the right pair for this domain and it is already wired. Freight is a **scanning** domain — an ops lead reads 40 rows, not 40 sentences — so:

1. **All numerals are tabular.** `font-variant-numeric: tabular-nums` on every value, price, distance, weight, percentage and count. JetBrains Mono gives this for free; the rule is that no number is ever set in proportional Inter.
2. **Every value carries its unit, and the unit is tertiary.** `$3,450` in `text-primary`, `/ mi` in `text-tertiary`. This is why `$4.20 / mi` already reads so cleanly in the current design — make it a rule, and it will hold for `$ / kg`, `$ / CBM`, `kg`, `m³`, `mi`, `%`.
3. **Identifiers are mono; names are Inter.** `LD-4821`, `HAWB 020-44118`, `MRN 26DE…`, `HS 8471.30` in mono; `Lone Star Freight` and `Chicago, IL → Dallas, TX` in Inter with the arrow as its own span.

### 3.6 Layout — two concepts, and the recommendation

**Concept A — "Control tower"** (what exists today: map owns the viewport):

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │  Command Center              Tue Apr 12 · 14 lanes  │
│  SIDEBAR ├──────────────────────────────────────────────────────┤
│  248px   │  ┌Active──┐┌Bids────┐┌On-time─┐┌Cost────┐            │
│          │  └────────┘└────────┘└────────┘└────────┘            │
│          │  ┌──────────────────────────┐┌────────────────────┐  │
│          │  │  LIVE MAP                ││  PENDING BIDS      │  │
│          │  │  (the argument)          ││  3 carriers        │  │
│          │  │                          │├────────────────────┤  │
│          │  └──────────────────────────┘│  CAPACITY FORECAST │  │
│          │  ┌──────────────────────────┐│  9-day sparkline   │  │
│          │  │  RECENT SHIPMENTS table  ││                    │  │
│          │  └──────────────────────────┘└────────────────────┘  │
└──────────┴──────────────────────────────────────────────────────┘
```

**Concept B — "Desk"** (recommended for Forwarding and International: the ledger owns the viewport, the map is a reward for selecting a row):

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │  Shipments        [ Road ▾ ]    12 open · 3 to action│
│  SIDEBAR ├──────────────────────────────────────────────────────┤
│  248px   │  ┌ filters: status · leg · customs · owner ─────────┐│
│          │  └──────────────────────────────────────────────────┘│
│          │  ID      ROUTE               LEGS  DOCS   CUSTOMS  ETA│
│          │  ────────────────────────────────────────────────────│
│          │  8842  CN → PL  Ningbo→Gdańsk  3   7/9 ▓▓▓  Cleared ↓│
│          │  8841  DE → US  Hamburg→NYC    2   9/9 ▓▓▓  Hold  ▲  │
│          │  ────────────────────────────────────────────────────│
│          │  ┌ SELECTED ROW expands in place ──────────────────┐│
│          │  │ ◀ leg rail:  EXW ──●── FCA ──○── DAP ──○── DDP ▶ ││
│          │  │   documents · charge lines · exceptions · map    ││
│          │  └──────────────────────────────────────────────────┘│
└──────────┴──────────────────────────────────────────────────────┘
```

**Alignment: left-aligned throughout, including numerals in tables.** Right-aligning currency is the spreadsheet reflex, but in a freight row the price sits beside two-character statuses and ETA strings; one clean left edge down the whole row beat digit-stacking here, and tabular mono already supplies the digit alignment that right-alignment was invented for. The one exception: **currency and quantity columns in the quote builder and landed-cost waterfall are right-aligned**, because there they are being *summed* and the eye needs the decimal to line up.

**Recommendation: A for Road, B for Forwarding and International.** Ship both in the case study — the pair *is* the argument, and the contrast is legible in two images side by side.

### 3.7 Self-critique before building

Run these three checks against the plan; they are the failure modes this brief invites.

1. **"Is this a big number + stat row + gradient accent hero?"** No — the hero of each screen is the object of work itself: a negotiation timeline, a document set, a leg rail. Screen 01's stat row is the one place the convention survives, and it is justified there because a marketplace landing page has to establish liquidity.
2. **"Is the mode switcher just a themed reskin?"** Only if §3.3's behavioural rule is dropped. The rule is load-bearing: **the primary surface must change with the mode.** If the forwarding screens come out looking like the road screens with different columns, the thesis failed and the case study should say so honestly.
3. **"Does the flow rail decorate or inform?"** The leg rail encodes real sequence — leg order, handover points, Incoterm transfers, per-leg ownership. Numbered markers are appropriate here *because the content genuinely is a sequence*. This is the exception the frontend-design guidance carves out, not a violation of it.

---

## 4. Information architecture

### 4.1 The shell

```
PHAROS
├── MODE SWITCHER (topbar, always visible, labelled)
│   Road Freight · Freight Forwarding · International
│
├── OPERATIONS                        ← every mode
│   ├── Command Center     (role home; contents change per mode)
│   ├── Loads / Shipments  (the ledger — the object list)
│   ├── Bids & Quotes      (inbound offers; shipper, or outbound quotes; forwarder)
│   └── Tracking           (in-transit board, exception-first)
│
├── FORWARDING                        ← visible in Forwarding + International
│   ├── Quote Builder
│   ├── Bookings
│   ├── Document Desk      (every doc, one queue, status + owner + deadline)
│   └── Rate Cards
│
├── CUSTOMS & COMPLIANCE               ← visible in International
│   ├── Declarations
│   ├── Classification     (HS codes, saved rulings)
│   └── Screening          (sanctions, dual-use, denied parties)
│
├── MONEY                             ← every mode
│   ├── Charge Lines       (accruals: bought vs sold, per leg)
│   ├── Invoices
│   └── Landed Cost        (International only)
│
└── WORKSPACE
    ├── Analytics
    └── Settings / Team
```

### 4.2 What changes per mode — the adaptation table

This table is the specification for the mode switcher. It is the most useful single artefact in the plan, because it is directly transcribable into screen states.

| Shell element | Road Freight Transport | Freight Forwarding | International Logistics |
|---|---|---|---|
| Sidebar first section | `OPERATIONS` | `FORWARDING` | `CUSTOMS & COMPLIANCE` |
| Second nav item | **Loads** | **Shipments** | **Orders** |
| Object ID format | `LD-4821` | `BK-114-882` | `ORD-8842` |
| Money module | Rate · Fuel surcharge · Invoice | Charge lines (bought/sold) · Invoice | + Duty · VAT · Landed cost |
| Analytics headline | On-time %, cost/mile, empty miles | Quote win rate, quote→booking time, doc completeness | Landed cost variance, customs dwell, duty spend |
| Primary surface | Map + table | Table + expanding row | Table + leg rail |
| Default map state | Visible | Collapsed | Hidden |

### 4.3 Navigation rules

1. **The mode switcher never hides a section you are standing in.** If a shipment in International mode has a road leg, the Road section is still reachable — the mode sets the default lens, it does not wall off capability.
2. **One object, one canonical URL.** `ORD-8842` is the same object whether you view it in Forwarding or International; the mode changes the tab set on the detail page, not the identity.
3. **The badge is the exception count, never the item count.** `Tracking ● 3` means three shipments need a human, not three shipments exist. This is the single most common failure in ops dashboards and the current design already errs this way on `Pending bids 6`.

---

## 5. The logical flows

Each flow below is written as: **ASCII spine → step table → the screens it touches → the states that must exist.** The step tables are the build spec.

Notation: `[screen]` = a screen from the inventory in §6 · `◇` = a decision the system must make visible · `⚠` = a state the current design has no vocabulary for.

### 5.1 Flow A — Road Freight Transport

**Job to be done:** *"I have 42,000 lbs of frozen goods in Chicago that must be in Dallas by Thursday. Get it there without me making nine phone calls."*

The existing design covers steps 5–9 well and steps 1–4 and 10–12 barely or not at all. **The added value of this flow is the front and the back.**

```
  ①  SIGN IN (role = Shipper)                                   [01 Landing & Login]
        │  role toggle is consequential → shipping-side shell
        ▼
  ②  COMMAND CENTER — "what needs me today?"                    [02 Dashboard]
        │  ◇ exception-first: 3 lanes need attention
        ▼
  ③  CREATE LOAD  ── the missing step ────────────────────────── [06 Create Load]
        │  step 1  lane + pickup/delivery windows
        │  step 2  equipment + weight + commodity + temp
        │  step 3  accessorials + target rate, benchmarked
        │          "Lane average $3,210 · your target $3,400 · 92% fill likelihood"
        │  ◇ ADR / weight / HOS feasibility checked BEFORE publish
        ▼
  ④  PUBLISH  → load enters the market                             [03 Load Discovery]
        │  visibility: private (preferred carriers) | network
        │  ⚠ current design has no publish control
        ▼
  ⑤  MATCH — carriers bid or the engine matches                   [03 Discovery / 04 Bid]
        │  ◇ ranked on rate, rating, lane history, deadhead-in
        ▼
  ⑥  NEGOTIATE  ── ask ⇄ offer ⇄ counter ⇄ revise ──────────────── [04 Bid & Negotiation]
        │  ✅ this screen already works — extend, don't rebuild
        │  ⚠ add: "expires in" → "expired" state + what happens next
        ▼
  ⑦  BOOK / AWARD                                                [04 Bid & Negotiation]
        │  "Accepting locks the lane at this rate and dispatches the carrier."
        │  ◇ confirmation: rate locked, carrier committed, cut-off set
        ▼
  ⑧  DISPATCH PACK  ── new; the compliance gate ───────────────── [07 Load Detail]
        │  carrier authority + insurance valid + driver + plate + trailer
        │  ⚠ no place in the current design to verify a carrier
        ▼
  ⑨  IN TRANSIT                                                  [05 Tracking]
        │  ✅ strongest existing screen: milestones, docs, chat, position
        │  ⚠ add: predicted ETA vs committed ETA, and the exception state
        ▼
  ⑩  EXCEPTION  ◇ delay > 60 min → who is told, what changes       [15 States sheet]
        │  the system must propose: re-route · re-schedule · notify consignee
        ▼
  ⑪  PROOF  — POD upload, seal match, damage claim                 [05 Tracking]
        ▼
  ⑫  SETTLE  ── the missing close ──────────────────────────────── [13 Settlement]
        │  line haul + fuel surcharge + accessorials + detention
        │  ◇ invoice vs bought rate → margin per load
        ▼
  ⑬  ANALYTICS — on-time %, cost/mile, empty miles                 [14 Analytics]
```

| Step | Actor | Screen | Must show | Must decide |
|---|---|---|---|---|
| ① Sign in | Shipper | 01 | Role toggle with consequence | Which shell to open |
| ② Orient | Shipper | 02 | Exceptions first, then volume | What to touch today |
| ③ Create | Shipper | **06 (new)** | Live rate benchmark vs target | Feasibility (ADR, weight, HOS) |
| ④ Publish | Shipper | 03 | Visibility scope, expiry | Private vs network |
| ⑤ Match | System | 03 / 04 | Ranked carriers + reason | Best fit |
| ⑥ Negotiate | Both | 04 | Ask vs offer, history, lane avg | Accept / counter / walk |
| ⑦ Book | Shipper | 04 | Locked rate, commitment | Final award |
| ⑧ Dispatch | Shipper + Carrier | **07 (new)** | Authority, insurance, driver, plate | Release to move |
| ⑨ Transit | Both | 05 | Milestones, docs, position, chat | — |
| ⑩ Exception | System | **15 (new)** | Cause, impact on ETA, options | Re-route / notify |
| ⑪ Proof | Carrier | 05 | POD, seal, damage | Accept / dispute |
| ⑫ Settle | Ops + Finance | **13 (new)** | Charges, margin | Approve invoice |
| ⑬ Analyse | Ops lead | **14 (new)** | On-time, cost/mile, empty miles | Change lanes / carriers |

**What this flow proves in the case study:** the existing design had the engine (match → negotiate → track) and was missing the *handles* — authoring, compliance, exception handling and money. Those four are where ops actually spends its day.

### 5.2 Flow B — Freight Forwarding

**Job to be done:** *"A customer wants 14 pallets of machine parts moved Hamburg → New York, door to door, on our terms. Quote it, book it, and don't let a single document be late."*

This is a **commercial** flow, not a haulage flow. The forwarder buys capacity and sells a service; their entire margin lives in the gap between the two, and their entire risk lives in the document set. The unit of work is a **shipment with a rate and a file**, not a load with a truck.

```
  ①  RFQ IN — request arrives (portal / email-parsed / API)        [09 Shipment Desk]
        │  customer · commodity · weight · volume · ready date · Incoterm
        │  ◇ is this a repeat lane? pull the saved rate card first
        ▼
  ②  RATE LOOKUP ◇ three sources, ranked                            [08 Quote Builder]
        │  contracted rate card  →  spot market  →  manual override
        ▼
  ③  QUOTE BUILDER ── the margin screen ─────────────────────────── [08 Quote Builder]
        │  ⚖ CHARGEABLE WEIGHT  max(actual kg, volume m³ ÷ factor)
        │     ← this single calculation decides the margin
        │  charge lines:  freight · origin (pickup, export customs, THC)
        │                 · destination (THC, import customs, delivery)
        │                 · surcharges (BAF, CAF, security, DG, peak)
        │  ◇ buy-rate vs sell-rate shown side by side → margin %
        │  validity window  ·  Incoterm  ·  transit time promise
        ▼
  ④  QUOTE SENT → awaiting decision                                 [08 Quote Builder]
        │  ⚠ follow-up state: "sent 3 days ago · no reply"
        ▼
  ⑤  BOOKED ◇ convert quote → booking, freeze the rate              [09 Shipment Desk]
        │  booking ref issued · cut-off and ETD set
        ▼
  ⑥  DOCUMENT SET ASSEMBLED ── the file ──────────────────────────── [09 Shipment Desk]
        │  commercial invoice ✓ · packing list ✓ · HAWB/HBL ✗
        │  certificate of origin ✗ · insurance ✗ · export entry ✗
        │  ◇ each doc: status · owner · deadline, not just a filename
        │  progress: "7 of 9 complete · 2 blocking cut-off in 18h"
        ▼
  ⑦  EXPORT CUSTOMS ◇ declaration lodged, MRN returned              [12 Customs]
        │  broker handoff · HS classification confirmed · EORI check
        ▼
  ⑧  CONSOLIDATION ◇ your 14 pallets join a container              [09 Shipment Desk]
        │  co-loader · container / ULD id · VGM · stuffing date
        ▼
  ⑨  DEPARTURE  → milestone tracking (port, sailing, arrival)       [10 Tracking]
        │  leg rail with per-leg owner
        ▼
  ⑩  ARRIVAL & RELEASE ◇ destination charges, demurrage clock       [12 Customs]
        │  ⚠ demurrage / detention is free time counting down — must be visible
        ▼
  ⑪  DELIVERY → POD                                                 [10 Tracking]
        ▼
  ⑫  INVOICE & SETTLE ◇ charges reconciled vs accrual               [13 Settlement]
        │  advance charges re-billed · credit terms (30/60/90)
        ▼
  ⑬  ANALYTICS — quote win rate · quote→booking time · doc completeness [14 Analytics]
```

| Step | Screen | The design decision that matters |
|---|---|---|
| ① RFQ in | **09 (new)** | One inbox for portal + email + API. Parsing a pasted email into structured fields is the single highest-value automation in the category. |
| ② Rate lookup | **08 (new)** | Always show **which source won** and what the alternatives were. A forwarder who cannot see the fallback price cannot defend their sell price. |
| ③ Quote builder | **08 (new)** | Chargeable weight is displayed live, with **which of actual vs volumetric is winning**, highlighted. Charge lines group origin / freight / destination — the industry's own grouping. |
| ④ Quote sent | 08 | Chase state. Silence is the forwarder's biggest commercial risk. |
| ⑤ Booked | 09 | One click, rate frozen. No re-keying. |
| ⑥ Document set | **09 (new)** | **The centrepiece of the whole case study.** A checklist with owner, deadline and blocking flag. `7 of 9 complete · 2 blocking cut-off in 18h`. |
| ⑦ Export customs | **12 (new)** | Declaration with MRN, broker, HS codes. Violet holds. |
| ⑧ Consolidation | 09 | LCL: your cargo is part of a bigger unit — show both your share and the container. |
| ⑨–⑪ Departure → delivery | **10 (new)** | The **leg rail**, not a map. Per-leg owner and carrier. |
| ⑫ Invoice | **13 (new)** | Advance charges re-billed, demurrage passed through, credit terms. |
| ⑬ Analytics | **14 (new)** | Quote win rate and doc completeness — the two numbers that define forwarder performance. |

**Why this is the best story in the case study:** the category benchmark (Flexport) puts a **Customs Suite** and a **document management module** at the centre of a forwarding platform, and project44 ships "Documents" as a named TMS module. The current design has one documents block inside a tracking screen. **Flow B is where you demonstrate that you understood what the product actually is.**

### 5.3 Flow C — International Logistics

**Job to be done:** *"We're importing 900 units from Ningbo to our Gdańsk warehouse. Land them in six weeks, for the number we quoted finance, and clear customs without a hold."*

The unit of work is an **order with N legs**, and the governing number is **landed cost** — goods + freight + insurance + duty + VAT + brokerage. This flow only exists once the leg model exists, which is why it is last.

```
  ①  ORDER INTAKE ── the commercial promise is made here            [11 Order Itinerary]
        │  supplier · PO · 900 units · HS code · Incoterm · consignee
        │  ⚠ Incoterm drives EVERYTHING downstream: who pays duty, who clears
        ▼
  ②  PLAN ITINERARY ◇ build the legs, assign an owner to each       [11 Order Itinerary]
        │
        │   seller ──[leg 1: road]──▶ Ningbo terminal
        │   ──[leg 2: OCEAN]──▶  Rotterdam ──[leg 3: rail/road]──▶ Gdańsk
        │   ──[leg 4: road]──▶ consignee warehouse
        │
        │  per leg: mode · carrier · transit days · cost · CO₂e · owner
        │  ◇ INCOTERM OVERLAY: where risk and cost transfer  EXW●──FCA○──DAP○──DDP○
        ▼
  ③  LANDED COST ESTIMATE ── the number finance was promised         [11 Landed Cost]
        │  goods value
        │  + freight (all legs)          + insurance        + origin charges
        │  + duty  ◇ from HS code × origin × FTA preference
        │  + VAT   ◇ recoverable or not — say which
        │  + brokerage / THC / delivery
        │  ══════════════════════════════  LANDED COST PER UNIT
        │  ⚠ current design has no concept of duty or VAT
        ▼
  ④  COMPLIANCE GATE ── the branch that decides the whole flow      [12 Customs]
        │  ◇ HS classification (with saved rulings)
        │  ◇ origin + FTA / duty-preference eligibility
        │  ◇ dual-use / sanctions / denied-party screening
        │  ├─ clear  → proceed
        │  └─ HOLD   → violet state, owner assigned, nothing proceeds
        ▼
  ⑤  EXPORT CLEARANCE ◇ declaration lodged, MRN issued             [12 Customs]
        ▼
  ⑥  MULTI-LEG TRANSIT ◇ per-leg milestones, per-leg owner          [10 Tracking]
        │  ✅ the leg rail is the shared component with Flow B
        │  ◇ handover points: terminal in/out, vessel, rail
        ▼
  ⑦  IMPORT CLEARANCE ◇ duty + VAT payable, inspection risk         [12 Customs]
        │  ⚠ the demurrage/detention clock starts at arrival
        ▼
  ⑧  BONDED / DUTY-DEFERRED TRANSFER ◇ pay now or defer             [12 Customs]
        ▼
  ⑨  FINAL DELIVERY → POD                                           [10 Tracking]
        ▼
  ⑩  LANDED COST RECONCILIATION ── estimate vs actual               [11 Landed Cost]
        │  ◇ the variance per line is the forwarder's credibility
        │  "estimated $412,600 · actual $418,240 · +1.4% · driver: detention 2 days"
        ▼
  ⑪  ANALYTICS — duty spend · broker performance · customs dwell    [14 Analytics]
```

| Step | Screen | The design decision that matters |
|---|---|---|
| ① Order intake | **11 (new)** | Incoterm is chosen here and it silently determines who pays duty. It must be visible at intake, not buried in a contract field. |
| ② Plan itinerary | **11 (new)** | The **leg rail** — the case study's signature component. N legs, each with mode, carrier, transit, cost, CO₂e, owner. |
| ③ Landed cost | **11 (new)** | A **waterfall from goods value to landed cost per unit.** Duty and VAT get their own lines, and the tooltip explains the basis (HS × origin × preference). |
| ④ Compliance gate | **12 (new)** | The one true branch. A hold is not an error — it is a state owned by someone else, hence violet. |
| ⑤/⑦ Clearance | **12 (new)** | Declarations with MRN, duty base, inspection status, broker. |
| ⑥ Multi-leg transit | **10 (new)** | Reuses the leg rail from Flow B. **This is the payoff of the shared-component strategy**: one component serves both forwarding and international. |
| ⑧ Bonded transfer | 12 | Pay-now vs defer is a cash-flow decision, so it belongs next to the money. |
| ⑩ Reconciliation | **11 (new)** | Estimate vs actual variance. This is the metric the brief's own "$ / kg" world runs on. |
| ⑪ Analytics | 14 | Duty spend and customs dwell — nobody else designs these. |

### 5.4 The cross-mode spine — what is genuinely shared

Do not build three products. These seven things serve all three flows:

| Shared thing | Serves | Note |
|---|---|---|
| **The shell** (sidebar + topbar + mode switcher) | A, B, C | Already exists (`appSide`) |
| **The object header** (ID · status pill · route · key parties) | A, B, C | Generalise from `05 Tracking` |
| **The ledger row + expand-in-place** | A, B, C | New pattern for B and C |
| **The leg rail** | B, C | The signature component; builds on `lCrd`'s origin→dest track |
| **The document row** (name · meta · status · owner · deadline) | A, B, C | Generalise from `05 Tracking`'s Documents block |
| **The charge line** (label · basis · amount · bought/sold) | A, B, C | New |
| **The exception card** (cause · impact · owner · next action) | A, B, C | New; replaces "red status" everywhere |

**The strategic claim for the case study, in one line:** *seven shared components, three vocabularies, one product — and the proof is that the leg rail designed for a forwarded ocean shipment also renders a domestic trucking move without modification.*

---

## 6. Screen inventory — what to add

Same convention as the existing file: **1440 × 1024 frames**, laid out in the Pencil canvas on the existing grid (screens are currently at x = 0 / 1500 / 3000, y = 0 / 1100).

### Tier P0 — completes the spine, proves the thesis (build these first)

| # | Frame name | Mode | Contains | Why it is P0 |
|---|---|---|---|---|
| **06** | `06 Create Load` | Road | 3-step stepper: lane + windows → equipment + weight + commodity + temperature → **accessorials + target rate with live lane benchmark** (`Lane average $3,210 · your target $3,400 · 92% fill likelihood`). Feasibility strip: ADR class, axle weight, HOS. Right rail: a live preview of the resulting `lCrd` | Closes **G2** — the flow currently has no authoring step at all |
| **07** | `07 Load Detail` | Road | The single-load record: object header, dispatch pack (carrier authority · insurance validity · driver · plate · trailer), rate breakdown, document row, milestone rail, activity | Generalises the object header for all three modes and adds the **compliance gate** |
| **08** | `08 Quote Builder` | Forwarding | RFQ summary, **chargeable-weight calculator showing actual vs volumetric**, rate-source attribution (rate card / spot / manual), charge lines grouped origin · freight · destination · surcharges, buy vs sell, margin %, validity, Incoterm | Proves the forwarder's commercial model — the whole economic engine of Flow B |
| **09** | `09 Document Desk` | Forwarding | Every document in one queue. Columns: document · shipment · **status** · **owner** · **deadline** · blocking flag. Header KPI: `7 of 9 complete · 2 blocking cut-off in 18h` | The category's most important surface (Flexport Customs Suite, project44 Documents) and the centrepiece of **G4** |
| **10** | `10 Leg Rail & Multi-leg Tracking` | International | The signature component: N legs as a horizontal rail with mode icons, carrier, transit, cost, CO₂e and owner per leg; **Incoterm overlay showing risk/cost transfer**; handover points as nodes; expandable per-leg detail | Unlocks **G3** and is the single most differentiated artefact in the set |

### Tier P1 — makes Forwarding real

| # | Frame | Mode | Contains |
|---|---|---|---|
| **11** | `11 Shipment Desk` (ledger-primary home) | Forwarding | Concept B in full: filters, ledger rows with LEGS / DOCS / CUSTOMS / ETA columns, expand-in-place. This is also the **mode-switcher proof** — put it beside `02 Command Center` in the case study and the thesis reads instantly |
| **12** | `12 Customs & Compliance` | International | Declaration detail with MRN, HS classification with saved rulings, origin/FTA preference, sanctions screening result, broker handoff, **violet hold state** |
| **13** | `13 Landed Cost` | International | Waterfall: goods → freight → insurance → origin → duty → VAT → brokerage → **landed cost per unit**, with estimate-vs-actual variance and the driver of the delta |
| **14** | `14 Settlement` | All | Charge lines with bought/sold, accessorials, fuel surcharge, detention, invoice, credit terms, margin per shipment |

### Tier P2 — polish and completeness

| # | Frame | Contains |
|---|---|---|
| **15** | `15 States` — a component sheet, not a screen | Every non-happy path: no loads match, quote expired, cut-off missed, customs hold, carrier insurance lapsed, POD disputed, empty ledger, offline |
| **16** | `16 Analytics` | Three mode variants in one frame: On-time / cost-per-mile / empty miles (Road) · quote win rate / quote→booking / doc completeness (Forwarding) · duty spend / customs dwell / landed-cost variance (International) |
| **17** | `17 Mode Switcher & Role Switcher` — component sheet | The two axes as components: all three modes × both shells, with the adaptation table from §4.2 as the annotation |

### Realistic effort

| Tier | Screens | Effort if you drive Pencil frame by frame |
|---|---|---|
| P0 | 5 | 6–9 focused hours |
| P1 | 4 | 5–7 hours |
| P2 | 3 (1 is a component sheet) | 3–4 hours |

**P0 alone is a shippable case study.** Do not start P1 until P0 is exported and the page is live — otherwise this becomes a design file nobody ever sees, which is the standard failure mode for portfolio side projects.

---

## 7. Design system additions

### 7.1 Variables to add to `pharos.pen`

Append to the existing `variables` object (§1.4). Nothing is renamed and nothing is removed — the 22 existing tokens are correct.

```jsonc
// Compliance — the one new hue. Legal/customs states the team cannot fix by working harder.
"status-legal-hold": { "type": "color", "value": "#A78BFA" },
"status-hold-bg":    { "type": "color", "value": "#A78BFA1F" },

// Multi-leg geometry
"leg-active":   { "type": "color", "value": "#2EE6C5" },   // = $accent, named for the leg rail
"leg-pending":  { "type": "color", "value": "#2B3D5E" },   // = $border-strong
"leg-node-bg":  { "type": "color", "value": "#0C1424" },   // = $bg-panel

// Density — freight is scanned, so rows must be settable
"row-compact":     { "type": "number", "value": 32 },
"row-default":     { "type": "number", "value": 44 },
"row-comfortable": { "type": "number", "value": 52 },

// Type roles
"num-font": { "type": "string", "value": "JetBrains Mono" }  // every numeral; tabular by default
```

### 7.2 Components to add (as `reusable: true` frames, alongside the existing 7)

| Component | Built from | Anatomy |
|---|---|---|
| **Ledger Row** | new | ID (mono) · route (Inter) · 2–4 metric cells · status pill · expand chevron. Height from `row-*`. Expanded state hosts any detail panel |
| **Leg Rail** | `lCrd`'s origin→track→dest rail, extended | N legs on one axis · mode icon per leg · node per handover point · **Incoterm transfer marker** · per-leg owner avatar · per-leg cost and CO₂e |
| **Document Row** | `05 Tracking`'s Document block, generalised | Name · meta (size / uploaded / due) · **owner** · status pill · blocking flag |
| **Charge Line** | new | Label · basis (`$ / kg`) · **bought** · **sold** · margin. Optionally a group header (Origin / Freight / Destination / Surcharges) |
| **Chargeable Weight Calculator** | new | Actual kg · volume m³ · factor · **winning basis highlighted** · chargeable kg |
| **Exception Card** | new | Cause · impact on ETA · owner · proposed next action · accept/ignore |
| **Mode Switcher** | new | Three labelled segments; current mode marked with the accent hairline, **never colour alone** |
| **KPI Strip** | `mCrd`, extended | Mode-aware: the four metric cards change label and unit per mode |

### 7.3 Density rule

Freight users are on 24-inch monitors reading 40 rows. Default `row-default` (44px) for ledgers, `row-compact` (32px) for the document desk and the charge-lines table, `row-comfortable` (52px) only for the Load Card in discovery, where each row is a sales object rather than a data object. **Offer the density toggle in Settings, and make `row-compact` the default for Document Desk** — that screen is the one people live in for hours.

### 7.4 Accessibility floor

- Violet `#A78BFA` on `bg-card #111C31` is ≈ 7.1:1 — passes AA for text and AAA for large text. Verify against the actual rendered pair before shipping.
- **Never encode mode, role, or leg status by colour alone.** Each needs a label or an icon: mode gets a label in the switcher, role gets a label in the sidebar, leg status gets a node shape (filled = done, outline = pending, ring = current).
- Keyboard: the ledger must be arrow-navigable, and `Enter` expands a row. A 40-row table that requires mouse travel is unusable for a power user.

---

## 8. Build sequence in Pencil

Pencil is an agent canvas: you describe the frame, it composes it. The trick is to **never ask for a whole screen in one prompt** — ask for the frame's skeleton, then its sections, then polish. Pencil has review skills installed at `~/.pencil/skills/` (`better-layout`, `better-typography`, `better-colors`, `better-accessibility`, `better-ui`, `interface-review`, `transitions-polish`) — use them as review passes, not as authors.

### 8.1 Prep (run this once, before any new frame)

Paste this into Pencil first. It establishes shared context so every later prompt can be short.

```
In this document, pharos.pen, keep the existing design system exactly as it is.
Do not change any variable value and do not restyle the 5 existing screens
(01 Landing & Login, 02 Shipper Dashboard, 03 Load Discovery, 04 Bid & Negotiation,
05 Shipment Tracking). Keep their x/y positions.

Add these variables to the document's variable table:
  status-legal-hold  #A78BFA
  status-hold-bg     #A78BFA1F
  leg-active         #2EE6C5
  leg-pending        #2B3D5E
  leg-node-bg        #0C1424
  row-compact        32
  row-default        44
  row-comfortable    52
  num-font           JetBrains Mono

Reuse the existing components by reference wherever they fit:
  App Sidebar (appSide) · Nav Item (nItm) · Metric Card (mCrd)
  Status Pill (sPil) · Button/Primary (bPri) · Button/Ghost (bGho) · Load Card (lCrd)

New frames must be 1440 x 1024 and placed in this canvas layout:
  row y = 0     : x = 0 (01) · 1500 (02) · 3000 (03)
  row y = 1100  : x = 0 (04) · 1500 (05) · 3000 (06)
  row y = 2200  : x = 0 (07) · 1500 (08) · 3000 (09)
  row y = 3300  : x = 0 (10) · 1500 (11) · 3000 (12)
  row y = 4400  : x = 0 (13) · 1500 (14) · 3000 (15)
  components sit at y = -320 and y = -200

Confirm the variable table and the new canvas positions, then wait.
```

### 8.2 The five P0 prompts (run in order)

**06 — Create Load** → `x = 3000, y = 1100`

```
Create a 1440x1024 frame named "06 Create Load" at x=3000, y=1100.

Reference the App Sidebar (appSide) on the left. Main area:
- Topbar: title "Post a load", subtitle "Step 3 of 3 · rate and accessorials",
  a 3-segment stepper where steps 1 and 2 are complete and step 3 is current,
  and the mode switcher showing "Road Freight" as current.
- Body, two columns (62 / 38).

LEFT — a rate panel. Label "Your target rate", a currency input showing "$3,400"
with the note "$4.15 / mi · 820 mi" underneath, the unit in text-tertiary.
Beneath it a benchmark block: "Lane average $3,210" · "6 carriers on this lane" ·
"92% fill likelihood", plus a small horizontal bar showing where $3,400 sits
inside the lane range, with the lane average marked on it.
Then a section "Accessorials" with toggle rows: Detention ($65/hr after 2h),
Liftgate, Inside delivery, Appointment required.
Then a "Feasibility" strip with three items, each using Status Pill (sPil):
ADR class — none; Axle weight — 42,000 lbs, within limit; Driver hours —
2 drivers, 11h each, feasible.

RIGHT — a sticky preview card: a live instance of the Load Card (lCrd) showing
how the load will appear in Load Discovery, with the caption "How carriers will see it".

Footer bar: Button/Ghost "Save as draft" left, Button/Primary "Publish to network"
right, and helper text "Publishing makes this load visible to 40,218 vetted
carriers. You can pause it at any time."

Typography: headings and prose in Inter, every number/label/id in JetBrains Mono.
Every value carries its unit, and the unit is in text-tertiary. Tabular figures
for all numerals. No new colors.
```

**07 — Load Detail** → `x = 0, y = 2200`

```
Create a 1440x1024 frame named "07 Load Detail" at x=0, y=2200.

Reference the App Sidebar (appSide). Main area:
- Object header, reusing the pattern from screen 05: "LD-4821" in mono,
  Status Pill "In transit", subtitle "Chicago, IL → Dallas, TX · 820 mi ·
  Dry Van · 42,000 lbs", plus a right-side action row: Button/Ghost
  "Message driver", Button/Primary "View documents".
- A four-item KPI strip using Metric Card (mCrd): Agreed rate $3,180 ($3.88 / mi) ·
  Committed ETA Apr 14 16:40 · Margin +$140 · On-time risk Low.
- Body, two columns (58 / 42).

LEFT — section "Dispatch pack", five rows each with label, value and a green
Status Pill: Carrier authority — Lone Star Freight — Valid to Mar 2027;
Cargo insurance — $100,000 — Valid; Driver — Miguel R. · CDL IL — Verified;
Tractor — IL 8842-KT — Plated; Trailer — IL 5510-TR · 53ft reefer — Seal #44921.
Then section "Remittance" with a charge table: Line haul $3,180 ·
Fuel surcharge included · Detention — · Total $3,180.
Then an activity feed with four entries, the latest tinted with the accent:
"Carrier assigned · Apr 12 07:58", "Dispatched · Apr 12 08:04",
"Picked up · Apr 12 08:20", "Status updated: in transit · Apr 12 10:48".

RIGHT — section "Milestones": a vertical rail with four nodes, the current one
ringed in accent: Picked up (done), In transit (current, 62%),
Delivery window (pending), POD (pending). Each node has a title and a mono meta line.
Beneath it section "Documents" with three Document rows:
"Bill of Lading.pdf · 240 KB · Apr 12" (green, uploaded),
"Proof of Delivery · requested · due Apr 14 18:00" (amber, awaiting),
"Weight ticket · missing · blocking invoice" (red).
- Footer: a two-line legal note in the tertiary text style.

Typography: Inter for names, JetBrains Mono for every id, value, unit and label.
Tabular numerals. No colors beyond the tokens already in the document.
```

**10 — Leg Rail & Multi-leg Tracking** → `x = 0, y = 3300` *(the signature screen — build this one with care)*

```
Create a 1440x1024 frame named "10 Leg Rail & Multi-leg Tracking" at x=0, y=3300.
This is a ledger-primary layout: NO live map. The leg rail is the hero.

Reference the App Sidebar (appSide). Main area:
- Topbar: title "ORD-8842" in mono, Status Pill "In transit", subtitle
  "Ningbo, CN → Gdańsk, PL · 900 units · machine parts · HS 8479.89",
  mode switcher showing "International" as current.
- Directly beneath the topbar, the LEG RAIL spanning the full width.
  This is the most important element on the screen.
    A horizontal rail with 4 legs. Each leg is a segment carrying:
      · a mode icon (truck, ship, rail, truck)
      · a leg label: "Ningbo → port", "Ningbo → Rotterdam",
        "Rotterdam → Gdańsk", "Gdańsk → warehouse"
      · a mono meta line: transit days · carrier · cost · CO2e in kg
      · an owner chip (small avatar + name)
    Completed legs use $leg-active with filled nodes.
    The current leg uses a ringed node in $accent.
    Pending legs use $leg-pending with outline nodes.
    Handover points sit on the rail as labelled nodes:
    "Terminal in", "Loaded", "Discharged", "Released".
- INCOTERM OVERLAY: beneath the rail, a secondary hairline with four markers
  EXW — FCA — DAP — DDP. A filled dot on FCA, with the caption "Risk and cost
  transfer: FCA Ningbo. Above this point the seller carries risk and pays."
  This must read as an overlay on the route, not as a separate widget.
- Body, two columns (58 / 42).

LEFT — section "Exceptions" with one Exception Card:
  cause "Rotterdam feeder delayed 14h — weather";
  impact "ETA slips 14h to Apr 29 06:00";
  owner "Sanjay P. · overseas agent";
  proposed action "Re-book rail to Gdańsk for Apr 27 — protects the delivery window";
  buttons Button/Ghost "Ignore" and Button/Primary "Accept change".
  Then section "Documents" with four Document rows, each showing status, owner
  and deadline: Commercial invoice (green, uploaded) · Packing list (green,
  uploaded) · Bill of lading (amber, pending, owner Sanjay P.) · Import
  declaration (VIOLET, not started, owner Customs desk, due Apr 28).

RIGHT — section "Landed cost so far" using grouped Charge Lines:
 Good goods $372,400 · Freight $28,900 · Insurance $1,240 · Origin charges $3,180 ·
 Duty (est.) $12,860 · VAT (est.) $0 recoverable · Brokerage $640; then the total
 line "Landed cost $419,220 · $465.80 / unit".
 Beneath it a small "Estimate vs actual" block: budget $412,600 · forecast
 $419,220 · variance +1.6%, with the note "driver: 14h feeder delay".

Use ONLY the document's tokens. The violet status-legal-hold is reserved for the
import declaration row and nothing else on this screen.
Tabular numerals throughout. Every value carries its unit in text-tertiary.
```

Use the same prompt shape for **08 Quote Builder** (`x = 1500, y = 2200`) and **09 Document Desk** (`x = 3000, y = 2200`) — both anatomies are specified in §6.

### 8.3 Review passes (after each frame — findings only, then fix one thing at a time)

```
Review the frame "10 Leg Rail & Multi-leg Tracking" using the better-layout skill.
Check: is the leg rail the visual hero; does anything compete with it; is the
spacing rhythm consistent with the existing 5 screens; does any element look like
a generic dashboard component rather than something specific to freight?
Report findings only — do not change the frame yet.
```

```
Using the better-accessibility skill, audit "09 Document Desk".
Confirm every status is legible without colour, that the violet hold state has an
icon or label as well as a hue, and that row hit areas are at least 32px.
List every violation.
```

Then apply fixes explicitly, one prompt per fix. **Do not let the agent "tidy while it fixes"** — it will restyle the frame and you will lose the system.

---

## 9. Website integration — landing it on antonyui.com

### 9.1 What exists in the repo today

| File | Relevant state |
|---|---|
| `work/index.html` | Work index. Case-study grid contains **two cards**: priWatt (featured, links to `priwatt.html`) and PGWay (NDA, no link). JSON-LD `ItemList` lists **only priWatt**. "Other engagements" timeline includes *Natanek Iberia S.L · Logistics / CMS — "Full design of a data-heavy dashboard — analytics overviews, reporting charts and user management flows."* |
| `work/priwatt.html` | The reference case-study template — 1,057 lines. Sections: hero → meta strip → challenge → deliverables → real images → credits strip → **Next Case**. Has its own `<style>` block with `.token-flow`, `.token-table`, `.swatch-*`, `.tok-tab` and a tab-switching `<script>`. |
| `work/priwatt.html` line 1033–1040 | The stub: `<div class="next-case" style="... opacity:0.4; cursor:default; pointer-events:none;">` → `B2B SaaS · Case Study` / `Pharos — Freight Exchange Platform` / `Coming soon` |
| `index.html` | Hero says "Fintech (PGWay, payments) · energy (priWatt) · SaaS · **logistics**". Expertise 04 mentions "fintech, energy, SaaS, and logistics". No Pharos card. |
| `sitemap.xml` | 8 URLs, no `/work/pharos`. |
| `_redirects` | Three 301s from the removed Nexus CRM case study → `/work/`. |
| `assets/css/styles.css` | 886 lines. Case-study classes available for reuse: `.case-hero`, `.page-hero`, `.meta-strip` (+ `--credits`), `.outcomes`, `.challenge-grid`, `.deliverable`, `.img-row` (`.cols-2`), `.case-img`, `.case-img-wrap`, `.next-case`, `.nc-*`, `.back-link`, `.prose`, `.token-table`, `.lightbox`, `.timeline`, `.pills`, `.kv` |
| `assets/images/` | Convention: `priwatt-<screen>-<formfactor>.webp` / `.png` / `.jpg`, plus `og-priwatt.jpg` (1200×630). **`og-nexus.jpg` is now an orphan** — the Nexus case study was removed, so that image is unused. |
| Git | Branch `main`, working tree has uncommitted modifications to `index.html`, `work/index.html`, `work/priwatt.html`, `about/index.html`, `cv.html`, `assets/css/styles.css`, `assets/js/app.js` and the three blog posts. **Commit or stash before starting** so the Pharos work is an isolated diff. |

### 9.2 Export the screens from Pencil

1. Export each new frame at **2×** → 2880×2048 PNG.
2. Convert to `.webp` to match the existing asset convention (priWatt ships `.webp` for screenshots, `.jpg` only for OG images).
3. Name them by the site's own pattern, **number-last so the order is stable in a directory listing**:

```
assets/images/
  pharos-01-login.webp
  pharos-02-command-center.webp
  pharos-03-load-discovery.webp
  pharos-04-negotiation.webp
  pharos-05-tracking.webp
  pharos-06-create-load.webp          ← P0
  pharos-07-load-detail.webp          ← P0
  pharos-08-quote-builder.webp        ← P0
  pharos-09-document-desk.webp        ← P0
  pharos-10-leg-rail.webp             ← P0
  og-pharos.jpg                       1200x630, OG card
```

4. Also export a **mode-comparison pair** for the thesis section: `pharos-02-command-center.webp` beside `pharos-11-shipment-desk.webp`. Two images, side by side, is the fastest possible way to communicate §3.3.

### 9.3 Create `work/pharos.html`

Model it directly on `work/priwatt.html` — same head structure, same `?v=4.0` / `?v=3.9` asset versioning, same class vocabulary. Section order:

| # | Section | Content | Reuses |
|---|---|---|---|
| 1 | `<main class="case-hero">` | `Pharos — one shell for road, forwarding and international` + subhead | `.case-hero`, `.dot-bg`, `.hero-glow` |
| 2 | Meta strip | Role: Product design · Scope: UX, UI, design system · Platform: Web app (1440) · Timeline: 2026 · Context: self-initiated concept | `.meta-strip` |
| 3 | The problem | Three service lines, three different units of work, one customer. The gap: most logistics software designs one of them | `.prose`, `.challenge-grid` |
| 4 | Research | The market table from §2.1 and the seven-point category checklist from §2.2 | `.token-table` |
| 5 | The thesis | *One shell, two axes* + the Role/Mode adaptation table from §4.2 | `.token-table` |
| 6 | Proof — the comparison | `pharos-02-command-center.webp` beside `pharos-11-shipment-desk.webp`, captioned with the map-primary vs ledger-primary rationale | `.img-row.cols-2`, `.case-img` |
| 7 | Flow A — Road | The ASCII spine from §5.1 as a styled rail, + `06`, `07` images | new `.flow-rail` |
| 8 | Flow B — Forwarding | Spine from §5.2 + `08`, `09` images. **Lead with the Document Desk screenshot** — it is the strongest single artefact | `.img-row` |
| 9 | Flow C — International | Spine from §5.3 + `10` image. Explain the Incoterm overlay explicitly — few reviewers will have seen it done | new `.leg-rail-figure` |
| 10 | Design system | The 22 tokens + 2 additions, the 7 shared components, the tabular-numerals rule | `.token-table`, `.swatch-row` |
| 11 | Outcomes | See §11 on honesty before writing anything here | `.outcomes` |
| 12 | Credits / context | Solo project, self-initiated concept; flows, system and screens by Anton Bozhatarnyk | `.meta-strip.meta-strip--credits` |
| 13 | Next case | Real link → `priwatt.html`, or back to `index.html` | `.next-case` |

**Two new CSS classes**, scoped in the page's own `<style>` block exactly as priwatt.html does, so nothing global changes:

```css
/* the flow spine — a monospace vertical rail with numbered steps */
.flow-rail { border-left: 1px solid var(--border2); padding-left: 20px; margin-top: 28px; }
.flow-step { position: relative; padding: 10px 0; }
.flow-step::before { content: attr(data-n); position: absolute; left: -31px; top: 12px;
  font-family: var(--mono); font-size: 10px; color: var(--orange); background: var(--bg); }
.flow-step-title { font-family: var(--mono); font-size: 12px; letter-spacing: .04em; color: var(--text); }
.flow-step-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-top: 3px; }

/* the leg rail figure — N legs, handover nodes, one Incoterm transfer */
.leg-rail-figure { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
  gap: 1px; background: var(--border); border: 1px solid var(--border2); margin-top: 28px; }
.leg { background: var(--bg); padding: 16px 14px; }
.leg-mode { font-family: var(--mono); font-size: 10px; color: var(--faint); text-transform: uppercase; }
.leg-name { font-size: 13px; color: var(--text); margin-top: 6px; }
.leg-meta { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-top: 4px; }
.leg.is-done { border-top: 2px solid var(--orange); }
.leg.is-hold { border-top: 2px solid #7c3aed; }   /* violet — see the light-mode note below */
@media (max-width: 700px) { .leg-rail-figure { grid-auto-flow: row; } }
```

> Specificity note (the trap the frontend-design guidance warns about): `.leg-rail-figure` and `.leg` are sibling class selectors, so they cannot cancel each other. Do **not** write a bare `.leg div { … }` rule. priwatt.html's `<style>` block already uses class-only selectors — keep it that way.

### 9.4 Edit the existing files

**`work/priwatt.html`** — remove the stub and replace it with a real Next Case link:

```html
<!-- NEXT CASE -->
<div class="section" style="padding-bottom:64px; border-bottom:none;">
  <div class="site">
    <h2 class="section-label">Next Case</h2>
    <a href="pharos.html" class="next-case">
      <span class="nc-b"></span>
      <div>
        <div class="nc-label">Logistics · Case Study</div>
        <div class="nc-title">Pharos — Road Freight, Freight Forwarding &amp; International Logistics</div>
      </div>
      <div class="nc-arrow">↗</div>
    </a>
  </div>
</div>
```

Delete the inline `opacity:0.4; cursor:default; pointer-events:none;`, drop the `Coming soon` label, and change `<div class="next-case">` to `<a class="next-case">` so it is a real destination.

**`work/index.html`** — three edits:

1. Add a third card to `.work-grid` alongside priWatt and PGWay, following the existing `.work-card` / `.wc-b` / `.work-tag` / `.work-title` / `.work-desc` / `.work-meta` + `.work-pill` pattern. Use the leg-rail screen as the preview — it is the most distinctive image in the set.
2. Add Pharos to the JSON-LD `ItemList`:
   ```json
   { "@type": "ListItem", "position": 2, "name": "Pharos — Road Freight, Freight Forwarding & International Logistics", "url": "https://antonyui.com/work/pharos" }
   ```
   (renumber any entry that follows it)
3. Update `<title>` and the meta description so the page targets the new domain — currently *"Work — Design Systems & Fintech · Anton Bozhatarnyk"*; make it *"Work — Design Systems, Fintech & Logistics · Anton Bozhatarnyk"*, and mirror the change in `og:title` / `twitter:title`.

**`index.html`** — turn the two existing "logistics" mentions into real destinations:

- Line 146: `<div class="metric-note">Fintech (PGWay, payments) · energy (priWatt) · SaaS · logistics</div>` → make `logistics` a link to `work/pharos.html`.
- Line 228 (Expertise 04): "…across fintech, energy, SaaS, and logistics." → add a `View the Pharos case study →` link beneath it.
- Optional but recommended: add Pharos as a second "Selected Work" card, so the portfolio's visible spread matches the hero's own claim of fintech + energy + SaaS + logistics.

**`sitemap.xml`** — add before `</urlset>`, matching the existing format exactly:

```xml
  <url>
    <loc>https://antonyui.com/work/pharos</loc>
    <lastmod>2026-09-21</lastmod>
  </url>
```

**`_redirects`** — no change needed; `/work/pharos` is a brand-new URL. Do **not** reuse the old `/work/crm-dashboard` path.

**`assets/images/og-nexus.jpg`** — now orphaned by the removed Nexus CRM case study. Delete it or leave it; one unused file is harmless, but the repo is otherwise tidy.

### 9.5 Pre-publish checklist

- [ ] Working tree committed or stashed **before** branching, so the Pharos work is an isolated diff
- [ ] `work/pharos.html` head: `<title>`, `<meta description>`, `canonical` = `https://antonyui.com/work/pharos`, OG + Twitter tags, `og-pharos.jpg` pinned at 1200×630 with `og:image:width` / `height`
- [ ] JSON-LD `Article` with `headline`, `description`, `author`, `datePublished`, `dateModified`, `url` — copy the priwatt block verbatim and change the values
- [ ] Every image gets explicit `width` / `height` and a real `alt` describing the screen — match the priwatt convention, whose alts describe the UI (*"priWatt PV Configurator on iPad — guided solar system builder"*)
- [ ] `loading="eager" fetchpriority="high"` on the hero image only; `loading="lazy"` everywhere else
- [ ] **Both themes checked.** `[data-theme="light"]` maps `--orange` to `#d1410a` for contrast; the new violet needs the same treatment. Use `#7c3aed` in light mode (≈5.9:1 on `#fafafa`) and `#A78BFA` in dark — define it once as `--hold` in each theme block, never hard-code the hex in the figure rule
- [ ] `sitemap.xml`, `work/index.html` (card + ItemList), `index.html` (links) and the `priwatt.html` Next Case all updated in the same commit
- [ ] Mobile: `.img-row.cols-2` collapses correctly and `.leg-rail-figure` flips to rows below 700px
- [ ] Lightbox still works on the new `.case-img` elements (the wiring is global in `app.js`)
- [ ] Cloudflare Pages preview deploy is green before merging to `main`

---

## 10. Copy deck

The interface's words do the signposting. These are the strings to use — consistent, plain, and named from the user's side of the trade, not the system's.

### 10.1 Mode labels and what each one calls things

| Concept | Road | Forwarding | International |
|---|---|---|---|
| The object, in nav | **Loads** | **Shipments** | **Orders** |
| Create action | `Post a load` | `Build a quote` | `Plan an order` |
| The list header | `Active loads` | `Open shipments` | `Orders in transit` |
| The confirm action | `Publish to network` | `Send quote` | `Confirm itinerary` |
| The money view | `Rate` | `Charge lines` | `Landed cost` |
| The risk view | `On-time` | `Cut-off` | `Customs` |

### 10.2 Status vocabulary — one set, everywhere

| State | Colour | Reads as |
|---|---|---|
| `On time` | green | Moving as promised |
| `At risk` | amber | Still moving, promise in doubt |
| `Delayed` | red | Promise broken |
| `Hold` | **violet** | Waiting on a party outside this team |
| `Cleared` | green | Customs released |
| `Awaiting` | amber | Requested, not yet received |
| `Not started` | violet | Ours to do, not yet begun |
| `Blocking` | red, prefixed | This one stops the next step |

Say **`Hold`**, not "Customs exception". Say **`Blocking cut-off in 18h`**, not "Document overdue". Every status pill should be readable with the colour removed — the label alone must carry the meaning.

### 10.3 Action labels — verb first, same verb through the flow

| Do | Don't |
|---|---|
| `Post a load` → toast `Posted` | `Submit` |
| `Send quote` → `Quote sent` | `Proceed` |
| `Accept change` → `Itinerary updated` | `OK` |
| `Request POD` → `POD requested · auto-chase on` | `Send request` |
| `Publish to network` → `Published · 40,218 carriers notified` | `Publish` |
| `Counter $3,240` | `Negotiate` |

The button that says `Publish to network` produces a toast that says `Published`. The vocabulary of the interface is how someone learns their way around.

### 10.4 Empty and error states — direction, not mood

| Situation | Copy |
|---|---|
| No loads match the filters | `No loads on these lanes right now.` + `Widen the radius to 150 mi, or post your own load.` + `Post a load` |
| Quote expired | `This quote expired Apr 18.` + `Rebuild it from the current rate card — the lane moved +2.1% since.` + `Rebuild quote` |
| Cut-off missed | `Cut-off was 14:00. This shipment will roll to the next sailing.` + `Next departure Apr 21 · 3 days later` + two real options |
| Customs hold | `Held for document review at Rotterdam.` + `Owner: Customs desk · opened Apr 29 09:12` + `Add the missing certificate of origin` |
| Carrier insurance lapsed | `Lone Star Freight's insurance expired Apr 10.` + `This load cannot dispatch until it is renewed.` + `Request renewal` · `Assign another carrier` |
| No documents yet | `No documents on this shipment.` + `Add the commercial invoice and packing list to start the file.` |
| Nothing in the ledger | `No shipments yet.` + `Your first booking will appear here.` + `Build a quote` |

Errors never apologise and are never vague. An empty screen is an invitation to act.

### 10.5 The case study's own copy

**H1:** `Pharos — one shell for road, freight forwarding and international`

**Standfirst:** `Three service lines, three different units of work, one customer. Pharos is a freight exchange designed so the product does not fork when the mode changes.`

**The thesis, in one line:** `One shell, two axes — role decides what you can do, mode decides what you are looking at.`

**The system claim:** `Seven shared components, three vocabularies, one product. The test: the leg rail built for a forwarded ocean shipment renders a domestic trucking move without modification.`

**The most quotable paragraph** (put it in the thesis section): `Road freight makes money on utilisation and fuel. Forwarding makes money on the spread between bought and sold capacity. International makes money on landed cost and the financing of duty. A single shell only works if the primary surface and the headline metric change with the mode.` — see §2.4 for why this is defensible.

**Market line, with attribution:** `Digital freight forwarding grows at 18.09% CAGR to $118.12B by 2031, while European road freight — the haulage market most logistics dashboards depict — grows at 3.07% (Mordor Intelligence, 2026). The value moved from moving goods to orchestrating information.`

---

## 11. Outcomes and credibility — read this before writing the numbers section

The rest of antonyui.com is built on a specific promise. The hero says *"a handoff contract that ships"*, the metric cards say *"Measured on design→dev handoffs before vs. after the token system went live"*, and the priWatt case study claims **"75% faster design-to-dev delivery"** with the measurement basis stated. **The site's authority comes from the caveat, not the number.**

If the Pharos page then claims something like *"reduced detention costs by 32%"*, it breaks that contract — because Pharos is a self-initiated concept with no client and no live data, and a logistics hiring manager will recognise the number as invented immediately.

### 11.1 Use one of these three framings (pick one and be explicit)

| Framing | How it reads on the page | Verdict |
|---|---|---|
| **A. Concept, honestly labelled** | `Self-initiated concept. No client, no live data — the outcomes here are design targets derived from the research, not measured results.` | **Recommended.** It is unfalsifiable, it matches the "no guesswork" voice, and it lets the design work stand on its own. |
| **B. Design-level claims only** | `Category analysis surfaced 7 table-stakes capabilities; Pharos now covers 6 of them across 3 modes.` — a coverage claim, not an outcome claim | Good, and it is genuinely checkable against §2.2. Pairs well with A. |
| **C. Method claims with a stated basis** | `Timed myself on 3 evaluator walkthroughs: the document-completion state took 4 steps instead of 11 in the original flow.` — a self-test, labelled as one | Strong if you actually run the walkthroughs. Do not claim this otherwise. |

### 11.2 Outcome-style statements you can make without inventing client data

These are all true by construction of the plan, and each maps to a section a reviewer will read:

- **`3 service lines, 1 shell, 7 shared components.`** Countable from §5.4.
- **`Covered 6 of 7 table-stakes capabilities the category ships`** — documents, customs/classification, cost intelligence, multi-modal legs, emissions, settlement. The seventh (real-time visibility) the original design already had. This is a *coverage* claim and it is honest.
- **`The gap analysis that produced the scope`** — the §1.6 table is itself a portfolio artefact. Showing that you audited your own work and found five holes is more persuasive than any percentage.
- **`Designed for the 18% CAGR market, not the 3% one`** — a strategy claim with a cited source.
- **`One new colour token, introduced because the palette had no vocabulary for "not ours to fix"`** — a specific, opinionated system decision with a stated reason. This is the kind of detail that signals seniority.

### 11.3 What to write in the outcomes section, concretely

```
## What changed

Before: five screens covering national truckload — the engine, without the handles.
After: a two-axis system covering three service lines, with the compliance and
money layers the category ships and the original design had none of.

· 3 service lines, 1 shell, 7 shared components
· 6 of 7 table-stakes capabilities covered (visibility · documents · customs ·
  cost intelligence · multi-modal legs · emissions · settlement)
· 5 new screens at P0, 9 in total, all built on the existing 22-token system
· 1 new colour token — violet for "legal hold", because the palette could
  express service health but not "waiting on someone else"

Self-initiated concept, 2026. No client and no live data — the outcome framing
above is capability coverage and design rationale, not measured performance.
```

That last sentence is the one that makes the rest believable. **Keep it.**

### 11.4 Do not do this

- Do not put a percentage on a screen you did not measure.
- Do not claim a client. If a logistics company did not pay for it, say so.
- Do not use the priWatt metric-card treatment (`75% faster…` with a measurement note) for Pharos. That visual pattern means *"measured, with a stated basis"* on this site; borrowing it for an unmeasured claim cheapens it.

---

## 12. Risks and open questions

### 12.1 Decisions only you can make

| # | Question | Options | Recommendation |
|---|---|---|---|
| **Q1** | **Is Pharos a real engagement or a self-initiated concept?** This changes the framing, the metrics section and the honesty disclaimer | (a) real client work not yet written up · (b) self-initiated concept · (c) speculative extension of real work | Decide this **before** writing any page copy. §11 assumes (b). If it is (a), you can use real metrics — but only ones you can defend with a stated basis, in the site's existing style |
| **Q2** | **Commit to the Carrier role, or cut the toggle?** The login screen currently promises a role it does not deliver | (a) build the carrier shell · (b) remove the toggle and stay shipper-side | (a) if you are positioning for marketplace or fintech-adjacent roles — two-sided design is a strong signal. (b) if you want the smallest credible scope |
| **Q3** | **All three service lines, or two deep plus International sketched?** | (a) all three at P0/P1 · (b) Road + Forwarding deep, International as one strong artefact | (b) if time is short. Two lines done well beats three done thinly, and the leg-rail screen can carry International on its own |
| **Q4** | **Does the case study replace the Natanek Iberia timeline entry, or sit alongside it?** Natanek is currently the only logistics mention on the site | replace · alongside | **alongside.** Natanek is *real* experience; Pharos is *demonstrated* capability. Together they are a far stronger logistics story than either alone |

### 12.2 Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| **Scope creep into a 17-screen redesign** | High | Ship P0 + `work/pharos.html` first; start P1 only once the page is live. The live page is the asset — the `.pen` file is not |
| **The market numbers go stale** | Medium | Every figure in §2 is dated and attributed. Put `as of September 2026` on the market line in the page, and re-check before any republish |
| **eFTI claims are wrong** | Medium | Marked ⚠ in §2.3. Verify against EUR-Lex before publishing, or drop the claim — the case study does not need it |
| **Pencil restyles the existing 5 screens** | Medium | The §8.1 prep prompt explicitly protects them. Copy `pharos.pen` before you start; it is only 100 KB |
| **The mode switcher reads as decoration** | Medium | The P1 Shipment Desk screen is the proof. If it does not visibly differ in *layout* from Command Center, fix the layout — do not paper over it in the copy |
| **Light-mode violet fails contrast** | High if overlooked | §9.5 covers it. Define `--hold` per theme; never hard-code the hex in a component |
| **A logistics practitioner finds a domain error** | Medium | Everything in §2.3 and §2.4 is checkable. Have someone in the industry read the flow section before publishing — Incoterms and chargeable weight are the two places an expert looks first |
| **Uncommitted work in the repo collides** | Medium | The working tree already has 11 modified files. Commit or stash before starting |

### 12.3 The first three things to do tomorrow

1. **Decide Q1** (real engagement vs concept) and **Q4** (alongside Natanek). Ten minutes, and it determines every word of the page.
2. **Run the §8.1 prep prompt in Pencil, then build `10 Leg Rail & Multi-leg Tracking`.** It is the most differentiated artefact in the set, and building it first tells you immediately whether the thesis holds.
3. **Commit the current working tree.** Eleven modified files and no `docs/` directory yet — the Pharos work should land as an isolated diff.

---

## 13. Sources

Fetched 2026-09-21. Every number used in this plan is traceable to one of these.

| Source | What it provided |
|---|---|
| [Mordor Intelligence — Digital Freight Forwarding Market](https://www.mordorintelligence.com/industry-reports/digital-freight-forwarding-market) *(page updated 11 Sep 2026)* | $42.46B (2025) → $51.43B (2026) → $118.12B (2031), 18.09% CAGR; low market concentration; APAC largest and fastest-growing; differentiation moving to visibility, documentation and compliance; value concentrating in customs, sustainability reporting and trade finance; SME adoption advantage from subscription pricing and pooled capacity |
| [Mordor Intelligence — Europe Road Freight Transport Market](https://www.mordorintelligence.com/industry-reports/europe-road-freight-transport-market) | $528.02B (2025) → $544.23B (2026) → $633.73B (2031), 3.07% CAGR; segmentation by FTL/LTL, long/short haul, temperature-controlled, domestic/international, containerisation |
| [project44 — Platform](https://www.project44.com/platform/) | The visibility/TMS capability checklist: visibility across ocean, over-the-road, air, rail, ports and terminals · TMS rating & booking, documents, port intel, sailing schedules, procurement analytics · yard management · eCommerce logistics · emissions · theft prevention · tariff analytics · AI agents |
| [Flexport](https://www.flexport.com/) | The forwarder-as-platform model: Control Tower, order & booking management, buyer's consolidation, carbon control, trucking (drayage · cartage · FTL · LTL), **Customs Suite** (brokerage · trade advisory · tariff simulator & refunds · duty drawback · compliance audit · HS classification), trade finance, cargo insurance |
| [sennder](https://www.sennder.com/) | European digital road freight benchmark: 150,000+ loads/month, 40,000+ vetted carriers, 250,000+ vehicles, **20+ aggregated load boards**, FTL with full visibility, CO₂e reporting, the sennOS lifecycle platform, multilingual named contact |
| [ICC — Incoterms® rules](https://www.iccwbo.org/business-solutions/incoterms-rules/) | The 11 rules and their two families; the definition of Incoterms as three-letter trade terms governing B2B sale-of-goods contracts; official checklists and flowcharts for choosing a rule |
| `~/.pencil/documents/pharos-01/pharos.pen` | The full audit in §1 — 7 components, 5 screens, 22 variables, and every piece of UI copy quoted verbatim |
| `antonyui-portfolio` @ `a93fccc` on `main` | Site structure, CSS class inventory, SEO/JSON-LD conventions, asset naming, the Pharos stub in `work/priwatt.html`, `_redirects`, `sitemap.xml` |

### Unverified — do not publish without checking

- **eFTI, Regulation (EU) 2020/1056** — the compliance dates and the covered information categories. The EUR-Lex and European Commission pages returned HTTP 404 during research, and secondary sources disagreed with each other. Verify against [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32020R1056) before putting any date in the case study.
- **A second, independent market-size figure** — Precedence Research returned page content without the market numbers, and Fortune Business Insights returned HTTP 403. If you want a second figure for the page, source it independently.

---

---

## 14. Build log

### 2026-09-21 — P0 screen 10 shipped into `pharos.pen`

**Built:** `10 Leg Rail & Multi-leg Tracking` (1440×1024, x=0, y=3300) — the signature screen from §6, P0, and the one artefact that proves the §3.3 thesis (mode changes the *primary surface*, not just the colour: no live map, the leg rail owns the viewport).

**Also added:**

| Thing | Detail |
|---|---|
| **9 variables** | `status-legal-hold` `#A78BFA` · `status-hold-bg` `#A78BFA1F` · `leg-active` `#2EE6C5` · `leg-pending` `#2B3D5E` · `leg-node-bg` `#0C1424` · `row-compact` 32 · `row-default` 44 · `row-comfortable` 52 · `num-font` `JetBrains Mono`. Token count 22 → 31 |
| **1 reusable component** | `App Sidebar / International` (`appSideInt`, x=0, y=-1400) — the mode-aware shell variant. Same structure and tokens as `appSide`, with International vocabulary: `OPERATIONS` → Command center · **Orders** (active) · Declarations · Classification · Screening, and user `M. Almeida · Ops lead · Forwarder`. It exists because Pencil's `descendants` overrides target direct children only, so `appSide`'s nav labels cannot be re-pointed from a screen ref |
| **289 new node ids** | No duplicates, no clashes with existing ids, no dangling component refs, no unknown tokens |

**What screen 10 contains:** object header (`ORD-8842`, in-transit pill, `Ningbo, CN → Gdańsk, PL · 900 units · machine parts · HS 8479.89`) with the three-mode switcher showing International active; the **leg rail** — 4 legs (road · ocean · rail · road) with mode icon, transit, cost, per-leg owner, and three labelled handover nodes (Loaded · Discharged · Released); the **Incoterm overlay** — EXW → FCA → DAP → DDP on a hairline beneath the route with FCA marked active and a one-line explanation of where risk and cost transfer; then **Exceptions** (amber card: cause, impact, owner, a proposed action with Ignore / Accept change) and **Documents** (4 rows with status · owner · deadline, including the violet `Blocking` state), and on the right **Landed cost** (7 charge lines → `$419,220 · $465.80 / unit`) and **Estimate vs actual** (budget / forecast / +1.6% variance with the driver named).

**Verified before writing:**
- All 12 pre-existing nodes (7 components + 5 screens) hash **byte-identically** against the pre-build file — nothing was restyled, renamed, moved or reordered.
- `version` still `2.18`; no variables removed or changed; no top-level nodes deleted.
- The pre-existing duplicate-id groups (`tr1`, `tr2`, `tr3` — children inside components instanced more than once, which is how `descendants` targeting works) are unchanged in count. The build script treats those as legitimate and only fails on duplicates introduced by new work.

**Backups:** `pharos.pen.bak-2026-09-21` (pre-plan) and `pharos.pen.bak-build10` (pre-build). The file grew from 99,877 B to ~426 KB because the build script writes `indent=2`; semantics are unchanged.

### Tooling added to the folder

`~/.pencil/documents/pharos-01/render.html` — a standalone `.pen` renderer used to verify frames before they land in the document. It resolves `$variables`, component `ref`s with `descendants` overrides, and the flex model (`layout`, `gap`, `padding` 2- and 4-value, `justifyContent`, `alignItems`, `width`/`height` as px or `fill_container`, where `fill_container` resolves per the *parent's* flex direction). Lucide icons load from CDN. Open it as `render.html?frame=<idOrName>&scale=<n>`.

Serve the folder over HTTP first — `fetch()` is blocked on `file://`:

```
cd ~/.pencil/documents/pharos-01 && python3 -m http.server 8901
```

It is a verification aid, not a build step: Pencil remains the source of truth. Keep it in the folder or delete it — nothing depends on it.

### 2026-09-21 — flow board added (`flowAll`)

**Built:** `Flow — all three modes` (3760×1100, x=0, y=5600, `layout:"none"`) — a FigJam-style page inside the design file, rendered as `pharos-preview/20-flow-board.png`. Three swimlanes (Road 13 steps · Forwarding 13 · International 11), each step a card tagged with the screen that owns it, connected by arrows. Above the lanes, the shared spine (7 components). Below, six tinted design notes and a build counter. 365 new nodes.

**It doubles as the build checklist:** outlined mint cards are not built yet, so the board is a live map of remaining work.

### ⚠️ Corrected: the flow step → screen mapping

The `[0X]` tags written inline in **§5.1–§5.3 drifted** from the tiered inventory in **§6**. §6 is correct. The authoritative mapping now lives in `docs/pharos-agent-prompts.md` §0, and the flow board uses it. References in §5 should be re-read as:

| In §5 it said | Correct screen |
|---|---|
| `[09 Shipment Desk]` (Flow B steps ① and ⑤) | **11 Shipment Desk** |
| `[09 Shipment Desk]` (Flow B step ⑥ Document set) | **09 Document Desk** — the one place §5 was right |
| `[11 Order Itinerary]` and `[11 Landed Cost]` (Flow C) | **10 Leg Rail** for the itinerary, **13 Landed Cost** |

Nothing else in §5 changes; only the numbers.

### What is still unbuilt

P0 is 1 of 5. Remaining P0: `06 Create Load`, `07 Load Detail`, `08 Quote Builder`, `09 Document Desk`. Then P1 — `11 Shipment Desk` is the one that proves the mode-switching thesis side by side with `02 Command Center` — then the website work in §9.

Both remaining toolchains now have paste-ready prompts: **`docs/pharos-agent-prompts.md`** holds Prompt 0 (system context), full prompts for 06–09, condensed specs for 11–17, the review and guardrail prompts, and a Figma equivalent that maps the thesis onto Figma Variable Modes.

**One design decision still open:** §11's Q1 — whether Pharos is presented as client work or a self-initiated concept. It changes the case-study copy, not the design.

---

*Build log ends. Screen 10, the International sidebar variant and the flow board are in `~/.pencil/documents/pharos-01/pharos.pen`. Backups: `.bak-2026-09-21` (original), `.bak-build10`, `.bak-flow`.*

