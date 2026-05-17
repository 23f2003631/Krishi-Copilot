# Syngenta Hackathon — Strategic Implementation Blueprint
### Krishi Campaign Copilot: Stock-Aware, Crop-Stage-Aware, Multilingual Campaign Orchestration & Field-Assist System

---

## 1. Company and Hackathon Context

### 1.1 Company Background

**Syngenta** is one of the world's leading agricultural technology companies:

- Operates in **100+ countries** with approximately **60,000 employees**
- Develops and markets **crop protection products** (herbicides, fungicides, insecticides) and **seeds**
- In India and across **AMEA (Asia, Middle East, Africa)**, works with **millions of smallholder farmers**, many cultivating fewer than 5 acres
- Deploys **thousands of sales representatives and agronomists** as the primary bridge between Syngenta's science and farmers in the field
- Operates a large digital and physical distribution system including retailers, field reps, and WhatsApp/IVR/SMS channels

**Key Customer Reality:**
- Farmers are spread across diverse geographies, speaking dozens of languages
- Crops, seasons, and pest pressures are hyper-local and time-sensitive
- Most farmers operate with limited access to timely agronomic advice
- A missed intervention can mean a failed harvest, lost income, and family financial distress

---

### 1.2 Hackathon Purpose

Syngenta is running this hackathon to find **practical, pilotable AI/ML solutions** — not academic exercises. The goal is:

> "The right message, product, and action — for the right farmer, at the right moment, through the right channel — before the crop window closes."

The hackathon spans **Track 1: AI-Powered Agricultural Marketing at Scale**, which requires teams to design an AI system that can intelligently target, time, personalize, and generate campaign content across millions of farming households.

---

### 1.3 Problem Area and Challenge Statement

**Root Cause:** Campaign teams, field reps, retailer signals, grower engagement data, stock levels, weather, and crop stage information are **not combined into a single decision system.**

**Failure Modes of Traditional Marketing:**
- Mass campaigns ignore crop-stage and geography-specific pest/disease context
- A fungicide message sent after disease pressure peaks wastes spend and erodes trust
- Content that is not in the farmer's language, dialect, or literacy level is ignored
- Campaigns sent where retailers are out of stock create demand with no fulfilment
- No human team, however large, can manually scale this decision-making

**What is needed:**
- Stop sending broad, generic campaigns
- Start sending **timely, local, useful recommendations** that help growers act and help field teams prioritize
- Combine all signals — crop stage, weather, stock, engagement, language, device — into one intelligent orchestration system

---

### 1.4 Expected Business and Product Outcome

| Outcome | Description |
|---|---|
| Higher engagement | More growers open, click, attend, scan, and inquire |
| Better product inquiry | Campaign-to-action conversion improves |
| Better rep productivity | Field reps receive prioritized, explainable action lists |
| Better retailer sell-through | Stock-aware demand generation avoids wasted campaigns |
| Fewer irrelevant messages | No campaign where context does not justify it |
| Scalable personalization | Move from 5–10 variants to thousands of micro-targeted versions |

---

## 2. Core Objective

### 2.1 Main Goal of the Solution

Build **Syngenta Krishi Campaign Copilot** — a hybrid campaign orchestration engine and field-assist copilot that:

- **Predicts receptivity** of farmer segments to specific messages across channels
- **Recommends channel, timing, and segment** based on crop stage, weather, stock, and engagement signals
- **Generates reviewed, multilingual content** in Hindi, Punjabi, Marathi, Gujarati, Kannada, Bengali, and English
- **Produces rep and retailer action plans** that can be piloted without forcing farmers into a new app

### 2.2 What Success Looks Like

1. Demo shows a **complete 5-minute end-to-end flow** from planner input to field action export
2. System demonstrates **better targeting than generic campaigns** (explainable reason codes)
3. Content generation is **safe, human-reviewed, and brand-compliant** (no dosage, no yield guarantee)
4. Stock guardrails work: **campaign is blocked or held** when retailer inventory is insufficient
5. Field reps receive **actionable, territory-specific output** they can use immediately
6. System feels like an **enterprise internal platform**, not a prototype or experiment

### 2.3 Strategic Value to Syngenta

- Connects all real operating levers: **grower relevance + retailer availability + rep trust + digital engagement + seasonal timing**
- Does not require farmers to adopt a new app — works through existing trust channels (WhatsApp, SMS, IVR, rep visits)
- Scales the judgment of a seasoned agronomist across thousands of micro-geographies simultaneously
- Demonstrates a **pilotable system** that Syngenta can take seriously beyond the hackathon

---

## 3. Key Ideas and Requirements

### 3.1 Functional Requirements

**Campaign Planning:**
- Select crop, geography (state/district/tehsil), objective, channel constraints, audience language, and device type
- System surfaces crop stage, weather risk, stock status, and historical engagement as insight cards
- Generate AI-ranked campaign recommendations with priority scores and reason codes

**AI Recommendations:**
- Rank segments by receptivity (WhatsApp open/click likelihood, offline event attendance, scan likelihood)
- Recommend channel mix: WhatsApp for smartphone users; SMS/IVR/retailer/rep for keypad or low-literacy users
- Include timing windows (e.g., 07:00–10:00 send window) and urgency level
- Apply stock guardrails: block or hold campaigns where inventory cover is below threshold

**Content Generation:**
- Generate multilingual content variants: WhatsApp message, 160-char SMS, 30-second IVR script, rep talking points, visual concept description
- All content restricted to approved product/crop/stage/claim context
- Content must be short, low-literacy-friendly, and carry a single CTA
- All outputs set to `approval_state: pending_review` — no autonomous publishing

**Content Approval:**
- Human review required before content is activated
- Agronomist validates crop/product advice
- Brand/compliance validates claims
- Field rep can accept, edit, or reject local recommendations

**Field Actions:**
- Rep action table with: Rep ID, territory, priority growers/retailers, recommended action, due date, stock note
- Retailer alert cards: healthy stock, low stock, replenish-before-campaign warnings
- Export options: CSV, WhatsApp Pack, Rep Brief

**Analytics:**
- Predicted open rate, predicted click rate, product inquiry proxy, field acceptance target, cost per response estimate
- Channel mix chart and weekly funnel chart (baseline vs. recommended)

---

### 3.2 Non-Functional Requirements

- **Offline / Low-bandwidth support:** No autoplay video; use cached JSON; all demo screens usable without network if cached
- **Low-literacy friendly:** Short messages, visual CTAs, icon-driven UI
- **Multi-device support:** Feature phone users (SMS/IVR) and smartphone users (WhatsApp) handled separately
- **Human-in-the-loop:** No content may be sent without explicit human approval
- **Brand safety:** Banned phrases enforced at generation and validation layer
- **Explainability:** Every recommendation must include reason codes visible to the user
- **Demo stability:** System must work fully offline if backend fails, via cached demo JSON

---

### 3.3 Constraints

- **4-day hackathon timeline** — must prioritize MVP path over completeness
- **No real WhatsApp sending** — simulation and export only
- **No production authentication or RBAC**
- **No real-time satellite analysis** — use cached or mock weather data
- **No CRM integration** — standalone system
- **No farmer-facing mobile app** — internal tool for campaign managers and field reps
- **No video generation, payment systems, or inventory writeback**
- **No Kubernetes or MLOps pipeline**
- **LLM outputs must be cached for demo reliability**

---

### 3.4 Assumptions

- Dataset provided by Syngenta includes: 6,000 growers, 4,479 WhatsApp messages, 4,000 retailers, 235k POS rows, 310k inventory rows, 30k visit logs, and weekly funnel data
- Crop calendars are parseable from provided JSON
- District centroid fallback is available when lat/lon is missing for weather lookups
- WhatsApp engagement baseline: delivered ~98.37%, opened ~23.15%, clicked ~5.05%
- Device split: smartphone ~74.65%, keypad ~17.13%, unknown ~8.22%
- Offline campaign attendance: ~65.37%; product scan rate: ~19.28%
- Modest, realistic uplift targets: open rate +4 to +9 pp, click rate +1 to +4 pp above baseline

---

## 4. Solution Overview

### 4.1 High-Level Concept

**Krishi Campaign Copilot** is an internal SaaS-style decision-support platform that gives Syngenta's campaign managers and field teams a single control room to:

1. **Understand the situation** (crop stage + weather + stock + engagement)
2. **Decide who to target** (ranked segment recommendations with reason codes)
3. **Generate the right message** (multilingual, approved, format-specific content)
4. **Trigger field actions** (rep task list + retailer alerts + exports)

It is not a farmer-facing app. It is a **campaign orchestration and field-assist copilot** for internal Syngenta teams.

---

### 4.2 System Logic

```
[Campaign Manager Input]
       │
       ▼
[Campaign Planner] ── crop + geography + objective + channel + audience
       │
       ▼
[Context Engine] ── crop stage + weather risk + stock status + engagement history
       │
       ▼
[Recommendation Engine] ── segment scoring + channel ranking + stock guardrails
       │
       ▼
[Content Generator] ── LLM with structured prompt + safety validation
       │
       ▼
[Human Approval Layer] ── agronomist + brand review required
       │
       ▼
[Field Action Engine] ── rep task list + retailer alerts + export
       │
       ▼
[Analytics Panel] ── predicted KPIs + channel mix + funnel comparison
```

---

### 4.3 Main Modules

| Module | Purpose |
|---|---|
| **Campaign Planner** | Context input: crop, geography, objective, channel, audience |
| **Context Engine** | Surfaces crop stage, weather risk, stock status, engagement |
| **Recommendation Engine** | Scores segments, ranks channels, applies stock guardrails |
| **Content Generator** | LLM-powered multilingual content with safety enforcement |
| **Approval Workflow** | Human review gate before any content is activated |
| **Field Action Engine** | Rep action table, retailer alerts, export capabilities |
| **Analytics Dashboard** | Predicted KPIs, channel mix, funnel chart |
| **Demo Fallback Layer** | Cached JSON responses for offline/backend-failure scenarios |

---

### 4.4 Four Demo Screens

| Route | Screen | Purpose |
|---|---|---|
| `/planner` | Campaign Planner | Define context: crop, region, objective, audience, channels |
| `/recommendations` | AI Recommendations | View ranked campaign actions with scores and reason codes |
| `/content-studio` | Multilingual Content Studio | Generate, review, and approve campaign assets |
| `/field-actions` | Field Actions + Analytics | Rep task list, retailer alerts, KPI predictions, exports |

---

## 5. Strategic 4-Day Implementation Plan

### Day 1: Foundation and Data Layer

**Day Goal:** Lock all contracts, build mock data, stand up project skeleton, and complete Screens 1 and 2 with fake data flowing through.

**Tasks:**
- [ ] Finalize and commit TypeScript interfaces (`frontend/src/lib/types.ts`) and Python Pydantic models (`backend/app/models/contracts.py`)
- [ ] Parse and clean dataset: join growers, WhatsApp, retailers, POS, inventory, and visit logs
- [ ] Map crop calendars from JSON; compute crop stage distance features
- [ ] Create mock JSON files: `scenarios.json`, `campaign_contexts.json`, `recommendations.json`, `content_variants.json`, `field_actions.json`, `analytics_summary.json`, `inventory_alerts.json`, `weather_insights.json`
- [ ] Stand up Next.js App Router project with dark theme, sidebar, and 4 route stubs
- [ ] Stand up FastAPI backend with health check and mock endpoint responses
- [ ] Build Screen 1 (Campaign Planner): context filters, insight cards, Generate Recommendations button
- [ ] Build Screen 2 (Recommendations): recommendation cards with priority score, segment, channel mix, reason codes, timing
- [ ] Connect frontend to backend for Screens 1–2; verify data flows through

**Dependencies:**
- Dataset provided by Syngenta (by Day 1 morning)
- API contracts agreed by whole team before coding begins

**Deliverables:**
- Locked type contracts (frontend + backend)
- Mock data files for all 5 core endpoints
- Working Screens 1 and 2 with fake data
- EDA summary and demo story narrative documented

**Priority:** CRITICAL — everything downstream depends on contracts and mock data being stable

**Risks/Blockers:**
- Weak joins between grower, POS, and inventory tables → mitigate with explicit row-count checkpoint
- Crop calendar parsing failure → fallback to hardcoded stage-distance for demo crops
- Team misalignment on contract shapes → lock types before writing any UI code

**End-of-Day Output:** Screens 1 and 2 functional with mock data; backend serving JSON; shared demo narrative agreed

---

### Day 2: Core Intelligence and Content Studio

**Day Goal:** Implement the recommendation logic, build the content generation pipeline with cached LLM outputs, and complete Screen 3.

**Tasks:**
- [ ] Implement feature engineering: crop stage distance, region-language-device segment, prior engagement (scan/attendance/WhatsApp), retailer demand velocity, stock risk (out-of-stock rate + days), rep coverage, weather risk scores
- [ ] Build rules-based recommendation engine with stock guardrails (block if `stock_cover_days < min_stock_cover_days`)
- [ ] Integrate LightGBM/CatBoost open/click receptivity scorer trained on WhatsApp engagement data (time-based split: Oct–Jan train, Feb–Mar validate)
- [ ] Add SHAP-based reason code generation for explainability
- [ ] Build `ContentGenerationService`: structured LLM prompt → Pydantic validation → domain safety checks → retry once on failure → fallback to canned template
- [ ] Implement full validation pipeline: JSON schema → Pydantic → length check → enum check → banned phrase check → product/crop pairing check → required CTA check → language check → `approval_state = pending_review` enforcement
- [ ] Generate and cache LLM outputs for all 5 hero demo scenarios
- [ ] Build Screen 3 (Content Studio): content format tabs (WhatsApp/SMS/IVR/rep script/visual concept), language selector, safety panel, approve/regenerate/edit buttons
- [ ] Wire content approval state changes through the backend

**Banned Phrases to Enforce:**
- "guaranteed yield"
- "100% control"
- "use X ml"
- "spray immediately without advice"

**LLM Guardrails:**
- Only approved crop, product, stage, weather_risk, language, and allowed_claims
- Never provide dosage
- Never guarantee yield or disease cure
- Always recommend contacting local Syngenta rep/retailer
- Always set `approval_state = pending_review`
- Keep messages short and low-literacy friendly
- Use one CTA only

**Dependencies:**
- Stable mock data from Day 1
- LLM API key configured on backend
- Banned phrase list and approved claim bank finalized

**Deliverables:**
- Working recommendation engine (rules + ML hybrid) with stock guardrails
- Content generation endpoint with cached outputs
- Screen 3 fully functional with approve/reject workflow
- Blocked stock scenario (Scenario 2: Mustard/Sikar) working correctly

**Priority:** HIGH — content generation is the core AI showcase

**Risks/Blockers:**
- 5% click imbalance → use class weights, top-k ranking, calibrated probabilities
- LLM hallucinated claims → enforce template-first, LLM second; fallback to canned safe template
- Missing crop calendars → use crop stage distance from synthetic approximation

**End-of-Day Output:** Screens 1–3 fully functional; content generation cached; at least 2 hero scenarios working end-to-end

---

### Day 3: Field Actions, Analytics, Integration, and Data Realism

**Day Goal:** Complete Screen 4, integrate real CSV summaries, add stock-aware blocked scenario, and polish the full demo path.

**Tasks:**
- [ ] Build Screen 4 (Field Actions + Analytics):
  - Rep action table: Rep ID, territory, priority growers/retailers, recommended action, due date, stock note
  - Retailer alert cards: healthy / low stock / replenish-before-campaign
  - Analytics panel: predicted open rate, click rate, product inquiry proxy, field acceptance target, cost per response estimate
  - Export buttons: Export CSV, Export WhatsApp Pack, Export Rep Brief
- [ ] Add DuckDB ingestion of sanitized CSV summaries (growers, POS, inventory) for realistic derived stats
- [ ] Wire `GET /api/v1/field-actions` and `GET /api/v1/analytics-summary` endpoints
- [ ] Add channel effectiveness chart (Recharts/shadcn chart) and segment receptivity chart
- [ ] Add weekly funnel chart comparing baseline vs. recommended leads
- [ ] Implement the full "blocked" scenario for Scenario 2 (Mustard/Sikar/low stock):
  - Recommendation card shows blocked state
  - Retailer replenishment action triggered instead of grower blast
- [ ] Add weather mock lookup by district centroid with fallback logic
- [ ] Add loading skeletons for all API calls
- [ ] Add toast notifications on content generation and approval
- [ ] Add empty state messages: "No recommendation because retailer stock is below campaign threshold" / "No field actions until a recommendation is approved"
- [ ] Add "Using cached demo output" banner for backend failure fallback
- [ ] Polish dark theme, spacing, and transitions across all 4 screens

**Dependencies:**
- Screens 1–3 stable from Day 2
- DuckDB ingestion compatible with provided CSV schemas

**Deliverables:**
- All 4 screens fully functional end-to-end
- At least 3 of 5 hero scenarios working (Scenario 1 Wheat/UP, Scenario 2 Mustard/Rajasthan blocked, Scenario 3 Potato/WB)
- Export CSV working for field actions
- All charts rendering with fallback data

**Priority:** HIGH — Screen 4 closes the demo loop; without it the system feels incomplete

**Risks/Blockers:**
- Too many screens in scope → stick to the single agreed demo path; cut anything that is not in the 5-minute flow
- DuckDB CSV join failures → fallback to hardcoded derived stats in mock JSON
- Chart rendering issues with Recharts → use shadcn chart wrappers which already integrate Recharts

**End-of-Day Output:** Complete end-to-end demo flow working locally; all 4 screens polished; at least one blocked scenario demonstrating stock guardrail logic

---

### Day 4: Deployment, Fallbacks, Rehearsal, and Freeze

**Day Goal:** Deploy to Vercel + Render, implement all fallback layers, rehearse the 5-minute demo, freeze the codebase, and prepare backup artifacts.

**Tasks:**
- [ ] Deploy frontend to Vercel; confirm all 4 routes load correctly
- [ ] Deploy FastAPI backend to Render with `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Set all required environment variables:
  - `NEXT_PUBLIC_API_BASE_URL=https://syngenta-copilot-api.onrender.com`
  - `NEXT_PUBLIC_DEMO_MODE=true`
  - `OPENAI_API_KEY=...`
  - `LLM_MODEL=gpt-4.1-mini`
  - `DATA_MODE=mock`
  - `CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000`
  - `DEMO_CACHE_ENABLED=true`
- [ ] Implement frontend demo-cache fallback: load `/public/demo-cache/*.json` if backend fails
- [ ] Implement backend LLM fallback: return cached content if LLM call fails
- [ ] Implement local full-offline fallback: pre-generated data runs without internet
- [ ] Run full Demo Stability Checklist (see Section 6.9)
- [ ] Rehearse the 5-minute judge flow at least 3 times
- [ ] Confirm exact click path; prepare presenter narrative
- [ ] Take backup screenshots of all 4 screens for each hero scenario
- [ ] Record 90-second backup screen recording
- [ ] Pre-open all browser tabs
- [ ] Freeze codebase — no new features after rehearsal pass

**Dependencies:**
- All 4 screens stable from Day 3
- Vercel and Render accounts configured
- LLM outputs fully cached

**Deliverables:**
- Live deployed frontend URL (Vercel)
- Live deployed backend URL (Render)
- Fallback demo mode working without backend
- Backup screenshots ready
- Backup screen recording ready
- Team aligned on presenter narrative and exact click path

**Priority:** CRITICAL — demo stability is non-negotiable; a broken live demo loses the hackathon

**Risks/Blockers:**
- Render cold start delay on first API call → warm up backend before judging begins
- Vercel build failures → test build locally with `next build` before pushing
- LLM API rate limit during demo → all LLM outputs must be cached before Day 4

**End-of-Day Output:** Fully deployed, rehearsed, and frozen demo ready for judges

---

## 6. Technical and Operational Breakdown

### 6.1 Architecture Overview

**Pattern:** Monorepo with separate frontend and backend; single backend service; no microservices

```
syngenta-copilot/
├── frontend/           # Next.js App Router + TypeScript + TailwindCSS v4 + shadcn/ui
├── backend/            # FastAPI + Python + Pydantic + DuckDB
├── demo/               # script.md, screenshots/, backup-recording.mp4
└── public/demo-cache/  # Fallback JSON for offline demo mode
```

**Why this stack:**
- Next.js gives polished SaaS feel, clean routing, Vercel deployment, and optional API fallback routes
- shadcn/ui provides high-quality dashboard primitives immediately (cards, tables, charts, dialogs, skeletons)
- Recharts is the underlying library for shadcn chart components — no extra dependency
- FastAPI + Pydantic natively validates request/response bodies and generates docs
- DuckDB reads CSV quickly in Python — ideal for local hackathon analytics without a full database

---

### 6.2 Frontend Architecture

**Stack:** Next.js App Router + TypeScript + TailwindCSS v4 + shadcn/ui + Recharts v3 + Lucide icons

**Routing:**

| Route | Page |
|---|---|
| `/planner` | Campaign Planner |
| `/recommendations` | AI Recommendations |
| `/content-studio` | Multilingual Content Studio |
| `/field-actions` | Field Actions + Analytics |

**State Management:**
- URL search params for scenario/context IDs
- React state for local UI interactions
- TanStack Query (optional) or plain fetch for API calls

**Forms:** Controlled React state; React Hook Form only if team is already comfortable with it

**Component Architecture:**

```
components/
├── ui/                      # shadcn base components
├── layout/                  # sidebar, header, page wrappers
└── domain/
    ├── recommendation-card.tsx   # score, segment, reasons, CTA
    ├── risk-badge.tsx            # low/medium/high color badges
    ├── channel-mix.tsx           # channel strategy display
    ├── content-variant-card.tsx  # generated text, safety flags, approve button
    ├── rep-action-table.tsx      # dense operational table
    └── metric-card.tsx           # label, value, trend, icon
```

---

### 6.3 Design System

**Visual Identity:** Dark enterprise dashboard with agricultural signal colors

**Color Palette:**
```css
--background: #09110f;
--surface:     #0f1a17;
--surface-2:   #15231e;
--border:      #26362f;
--text:        #f4f7f2;
--muted:       #9fb0a6;
--green:       #38b000;
--lime:        #a3e635;
--amber:       #f59e0b;
--cyan:        #22d3ee;
--red:         #ef4444;
```

**Typography:** Inter, Geist, or system sans — page title 24–28px, section heading 16–18px, metric number 24–32px, body 13–14px

**Layout:** Desktop sidebar 240px, header height 64px, card radius 8px, spacing base 4px (use 8/12/16/24/32)

**Responsiveness:** Desktop-first for judges; tablet collapses sidebar; mobile uses one-column cards + horizontal tabs + bottom action bar

**Low-bandwidth UI rules:** No autoplay video; no heavy maps; use cached JSON; icons and charts over large images; all demo screens usable offline if cached

**Loading states:** Skeleton cards for API calls; toast after content generation; "Using cached demo output" banner if API fails

**Empty states:** "No recommendation because retailer stock is below campaign threshold" / "No field actions until a recommendation is approved"

---

### 6.4 Backend Architecture

**Stack:** FastAPI + Pydantic + Python + DuckDB (local) + sanitized `demo_cache.json` (deployed)

**Router Structure:**
```
routers/
├── context.py          # POST /api/v1/campaign-context
├── recommendations.py  # POST /api/v1/recommendations
├── content.py          # POST /api/v1/content/generate, POST /api/v1/content/approve
├── field_actions.py    # GET /api/v1/field-actions
├── analytics.py        # GET /api/v1/analytics-summary
└── export.py           # POST /api/v1/export
```

**Services:**
```
services/
├── data_loader.py        # CSV/DuckDB ingestion
├── recommender.py        # Rules + ML scoring + stock guardrails
├── content_generator.py  # LLM prompt → Pydantic validation → safety checks
├── validator.py          # Banned phrase check, length, enum, pairing validation
└── demo_cache.py         # Cached response loader for demo stability
```

---

### 6.5 API Contracts

**Base path:** `/api/v1` | Naming: `snake_case` | Version field: `schema_version: "syngenta-copilot.v1"`

Every response includes: `request_id`, `generated_at`, `source_mode`, `warnings`

**Core Enums:**
```typescript
type Crop = "wheat" | "mustard" | "chickpea" | "potato" | "cotton" | "rice";
type Channel = "whatsapp" | "sms" | "ivr" | "field_rep" | "retailer";
type Objective = "awareness" | "lead_generation" | "retailer_sellthrough" | "field_visit";
type Language = "Hindi" | "Punjabi" | "Marathi" | "Gujarati" | "Kannada" | "Bengali" | "English";
type RiskLevel = "low" | "medium" | "high";
type StockStatus = "healthy" | "watch" | "low" | "out_of_stock";
type SourceMode = "mock" | "rules" | "ml" | "hybrid";
```

**Validation Rules:**
- All dates: ISO `YYYY-MM-DD`
- Scores and probabilities: 0 to 1
- `priority_score`: 0 to 100
- `blocked = true` if `stock_status` is `low` or `out_of_stock` AND objective is `retailer_sellthrough`
- SMS: max 160 characters
- WhatsApp: max 480 characters
- IVR: max 90 words
- Rep script: max 120 words
- No output may contain dosage, guaranteed yield, unsafe chemical handling, or unapproved crop-product pairing

---

### 6.6 Data Strategy

**Available Dataset:**
- 6,000 growers
- 4,479 WhatsApp engagement records
- 4,000 retailers
- 235,000 POS rows
- 310,000 inventory rows
- 30,000 field visit logs
- Weekly funnel data

**Baseline Metrics (from dataset):**
- WhatsApp delivered: ~98.37%
- WhatsApp opened: ~23.15%
- WhatsApp clicked: ~5.05%
- Offline campaign attended: ~65.37%
- Product scanned: ~19.28%
- Smartphone users: ~74.65%
- Keypad users: ~17.13%

**Feature Engineering:**
- Crop stage distance (days before/after tillering, flowering, pod formation)
- Region-language-device segment label
- Prior engagement (scan, attendance, WhatsApp open/click)
- Retailer demand velocity (SKU sales by tehsil/district/week)
- Stock risk score (out-of-stock rate + days since available inventory)
- Rep coverage (visits by territory/product/week)
- Weather risk (rainfall, humidity, temperature, VPD, ET0, heat/rain alerts)

**Target Variables:**
- Primary: `opened_status`, `clicked_status`
- Secondary proxies: `product_scan` within 30 days, offline attendance within 30 days, POS uplift by territory/SKU/week

**⚠ Leakage Warning:** Do NOT use future campaign attendance, future scan, future POS, or clicked/opened fields as features for pre-send prediction.

**Validation Strategy:**
- Time-based split: train Oct–Jan, validate Feb–Mar
- Add district/territory holdout to test generalization
- Metrics: PR-AUC, recall@top-k, calibration, uplift vs. baseline rules
- Handle 5% click imbalance with class weights, top-k ranking, and calibrated probabilities

---

### 6.7 AI/LLM Integration

**Service:** Single `ContentGenerationService` — no agent maze, no microservices

**LLM Call Flow:**
1. Frontend sends `ContentGenerationRequest`
2. Backend enriches with recommendation, weather, stock, crop stage, and approved claims
3. Backend calls LLM with structured output (OpenAI Structured Outputs enforcing JSON schema)
4. Backend validates: JSON schema → Pydantic → length → enum → banned phrase → pairing → CTA → language → approval state
5. If validation fails → retry once
6. If retry fails → return canned safe template

**System Prompt:**
> You are Syngenta Krishi Campaign Copilot, an internal agricultural marketing assistant. Generate concise, low-literacy-friendly campaign content for field teams. Use only the provided context and approved claims. Do not invent agronomic facts, dosage, safety instructions, yield guarantees, disease cure promises, or regulatory claims. All generated content must be human-reviewed before use. Return only valid JSON matching the schema.

**Fallback Hierarchy:**
1. Cached content for scenario
2. Template-based generation
3. English-only safe advisory
4. Disable approve button + show "human review needed"

**LLM Model:** `gpt-4.1-mini` (configured via `LLM_MODEL` environment variable)

---

### 6.8 Deployment Architecture

| Layer | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Fastest for Next.js; automatic CI/CD |
| Backend | Render | Simple FastAPI deployment with uvicorn |
| Database | DuckDB (local) / `demo_cache.json` (deployed) | No managed DB needed for hackathon |
| AI | Backend-only API key | Never expose key to frontend |
| Demo primary | Local machine | Full control, no latency |
| Demo backup | Deployed Vercel + cached mode | Internet-accessible fallback |

**Environment Variables:**
```
NEXT_PUBLIC_API_BASE_URL=https://syngenta-copilot-api.onrender.com
NEXT_PUBLIC_DEMO_MODE=true
OPENAI_API_KEY=...
LLM_MODEL=gpt-4.1-mini
DATA_MODE=mock
CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
DEMO_CACHE_ENABLED=true
```

**Failure Strategy:**
- Backend fails → frontend loads `/public/demo-cache/*.json`
- LLM fails → backend returns cached content
- Internet fails → local frontend/backend with pre-generated data
- Everything fails → 90-second screen recording as final backup

---

### 6.9 Demo Stability Checklist

Before judging, confirm all of the following:

- [ ] Local backend runs and responds to health check
- [ ] Local frontend runs and all 4 routes load
- [ ] Deployed frontend opens in browser
- [ ] Deployed backend health check responds
- [ ] Demo mode works without backend (cached JSON loads correctly)
- [ ] LLM outputs are cached and not making live calls
- [ ] Main scenario (Scenario 1: Wheat/UP) completes in under 5 minutes
- [ ] All charts render with fallback data
- [ ] All buttons show loading/success/error feedback
- [ ] Blocked stock scenario (Scenario 2: Mustard/Sikar) works and shows correct blocked state
- [ ] No confidential raw data is deployed
- [ ] Browser tabs are pre-opened to correct pages
- [ ] Backup screenshots are ready for all 4 screens
- [ ] Backup screen recording is ready (90 seconds)
- [ ] Presenter knows exact click path and narrative

---

### 6.10 Hero Demo Scenarios

**Scenario 1 (PRIMARY — must work perfectly):**
- Crop: Wheat | Geography: Kanpur Nagar, Uttar Pradesh | Language: Hindi
- Risk: Flowering stage + humidity/rainfall | Inventory: Tilt 250 EC healthy, 18 days cover
- Action: WhatsApp first, field rep follow-up
- Expected uplift: click rate 5% → 8%, expected leads: 69

**Scenario 2 (SECONDARY — blocked campaign showcase):**
- Crop: Mustard | Geography: Sikar, Rajasthan | Language: Hindi
- Risk: Pest/disease advisory window | Inventory: Score 250 EC low, 4 days cover
- Action: Hold grower blast; send retailer/rep replenishment action
- Value: Demonstrates stock guardrail — avoids wasted demand

**Scenario 3:**
- Crop: Potato | Geography: West Bengal district | Language: Bengali
- Risk: Cool humid weather | Inventory: Kavach 75 WP watch status
- Action: Retailer check + Bengali IVR script (low-literacy, voice-first)

**Scenario 4:**
- Crop: Chickpea | Geography: Ratlam, Madhya Pradesh | Language: Hindi
- Risk: Pod formation stage | Inventory: Actara 25 WG healthy
- Action: SMS + field meeting invite; rep talking points

**Scenario 5 (use only if judges ask about scalability):**
- Crop: Cotton | Geography: Yavatmal, Maharashtra | Language: Marathi
- Risk: Pest outbreak | Inventory: Mixed
- Action: Field-rep-first alert; Marathi rep script and WhatsApp concept

---

### 6.11 5-Minute Judge Flow

1. Open `/planner` (Campaign Planner)
2. Select: Wheat → Kanpur Nagar, Uttar Pradesh → Lead generation → WhatsApp + SMS + Field rep → Hindi → Smartphone
3. Review insight cards: crop stage (flowering), weather risk (high), stock (healthy, 18 days), engagement history
4. Click "Generate Recommendations"
5. Navigate to `/recommendations` — view ranked recommendation cards, priority score 91, reason codes, channel strategy
6. Click "Generate Content" on top recommendation
7. Navigate to `/content-studio` — view Hindi WhatsApp message, SMS, IVR script, rep talking points
8. Review safety panel (approved crop, approved product, no dosage claim, human review required)
9. Click "Approve" → content moves to approved state
10. Navigate to `/field-actions` — view rep action table, retailer alerts, analytics panel
11. Show export buttons (CSV, WhatsApp Pack, Rep Brief)
12. Show analytics: predicted open rate 31%, click rate 8%, expected leads 69, baseline comparison

**Presenter Narrative:**
- *"Instead of blasting the same message to everyone, Syngenta first understands crop stage, region, language, device, stock, weather, and past engagement."*
- *"The system recommends who to target, when, and through which channel."*
- *"AI content is generated only inside approved agronomic guardrails."*
- *"The final output is not just a message. It becomes a field action plan for reps and retailers."*

---

## 7. Risks, Gaps, and Dependencies

### 7.1 Data Risks

| Risk | Severity | Mitigation |
|---|---|---|
| No direct grower purchase linkage | High | Use scan, attendance, click, and territory POS uplift as proxies |
| Future events accidentally enter features (leakage) | High | Strict as-of-date feature generation; validate with time-based split |
| WhatsApp data excludes keypad users | Medium | Separate channel model for SMS/IVR/rep/retailer |
| Missing crop calendars / farm size | Medium | Fallback to crop stage approximation from synthetic data |
| Weak joins between tables | Medium | Row-count checkpoint on Day 1 before proceeding |

### 7.2 Technical Risks

| Risk | Severity | Mitigation |
|---|---|---|
| LLM hallucinated agronomic claims | High | Template-first, LLM second; banned phrase validation; fallback to canned template |
| LLM API failure during demo | High | Cache all LLM outputs before Day 4; disable live calls during judging |
| Backend cold start on Render | Medium | Warm up backend before judges arrive |
| Render or Vercel deployment failure | Medium | Local machine is primary demo; deployed is backup |
| Recharts rendering issues | Low | Use shadcn chart wrappers which integrate Recharts cleanly |

### 7.3 Time Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Scope creep into optional features | High | Strictly follow "What NOT to Build" list; one amazing path beats many half-working ones |
| Day 1 contracts not locked early enough | High | Lock types before any UI or backend code is written |
| CSV/DuckDB ingestion blocking Day 3 | Medium | Mock data path must be fully working before touching real CSV |
| Too many screens in scope | Medium | Always prioritize the single 5-minute demo flow |

### 7.4 Execution Bottlenecks

- LLM content caching must be done before deployment (Day 3 evening at the latest)
- Presenter must rehearse at least 3 times before judging
- Frontend and backend must be tested together — not just in isolation
- `blocked` stock scenario must be tested explicitly (easy to break without noticing)

### 7.5 Known Gaps and Limitations

- No true randomized experiment in the dataset — uplift estimates are model-based, not causal
- No creative variant labels in WhatsApp data — cannot A/B test creative approaches directly
- No direct grower purchase linkage — conversion must be inferred from proxies
- WhatsApp data excludes keypad users (~17% of audience) — keypad channel modeling is weaker
- No lat/lon for precise satellite NDVI — fallback to district centroid for weather
- Pest surveillance reports are public domain but quality varies by region

---

## 8. Strategic Recommendations

### 8.1 Improve Demo Impact

- **Lead with the blocked scenario second** (not first) — show the system working brilliantly in Scenario 1, then show it intelligently blocking Scenario 2; this demonstrates business judgment, not just AI output
- **Show reason codes prominently** — judges will trust a system that explains itself more than one that just outputs a score
- **Make the stock guardrail visually obvious** — use a red badge, a "Campaign Blocked" state, and a clear explanation; this is your strongest business-realism differentiator
- **Export CSV during the demo** — the physical act of clicking export and seeing a file appear makes the system feel real and production-ready

### 8.2 Reduce Complexity

- **One content generation endpoint, not multiple** — avoid building separate endpoints for each language or format
- **Deterministic scenario IDs** — use fixed `context_id` values so the demo path is predictable and rehearsable
- **Mock-first, always** — never wait for real data or live LLM to work before building the UI
- **One amazing demo path over many half-working paths** — this is the most important engineering principle for hackathons

### 8.3 Improve Feasibility

- **Do not add DuckDB ingestion until the full demo path works** — real CSV is a nice-to-have, not MVP
- **Do not add live LLM until cached outputs are working** — live LLM is a nice-to-have for Day 2; cached is the requirement
- **Do not attempt Scenarios 3–5 until Scenario 1 is perfect** — demo the best path, not all paths
- **Skip React Hook Form** — controlled state is sufficient for the planner filters; RHF adds complexity without benefit here

### 8.4 Strengthen the Pitch Narrative

- Frame the solution as **"a campaign control room for Syngenta's internal teams"** — not a farmer app, not an AI chatbot
- Emphasize **three clear differentiators:** (1) stock-aware guardrails that prevent wasted campaigns, (2) explainable reason codes that reps can trust, (3) multilingual content that respects low-literacy and low-bandwidth realities
- Acknowledge **dataset limitations honestly** — judges respect teams that are clear about assumptions
- Show **the pilot path:** how this system could be rolled out in 3–6 months across one state with existing field teams

---

## 9. Final Structured Summary

### What We Are Building

**Syngenta Krishi Campaign Copilot** — an internal enterprise dashboard that gives Syngenta's campaign managers and field teams a single intelligent control room to plan, generate, approve, and execute hyper-local agricultural marketing campaigns across millions of smallholder farmers in India.

### Why It Matters

India has approximately 150 million farming households. Traditional mass campaigns fail because agriculture is hyper-local: crop, stage, language, pest risk, farmer literacy, device type, retailer stock, and field-rep trust all change by geography and week. No human team can process this complexity at scale. This system makes that intelligence accessible, actionable, and safe.

### How It Works

1. **Planner** captures campaign context (crop, region, objective, audience, channels)
2. **Context Engine** surfaces crop stage, weather risk, stock status, and engagement signals
3. **Recommendation Engine** scores and ranks farmer segments with stock guardrails and reason codes
4. **Content Generator** produces multilingual, brand-safe content variants with human review gate
5. **Field Action Engine** delivers rep task lists, retailer alerts, and exportable campaign plans
6. **Analytics Panel** shows predicted KPIs and channel mix for stakeholder reporting

### What Makes It Different

| Differentiator | Why It Matters |
|---|---|
| Stock guardrails | Prevents campaigns where fulfilment is impossible — business realism judges will recognise |
| Explainable reason codes | Reps trust recommendations they can understand and override |
| Multilingual, low-literacy-first content | Respects the reality of rural India — not a generic AI output |
| Human approval gate | Brand-safe, agronomically sound — no autonomous publishing |
| Internal tool design | Works through existing farmer trust channels (WhatsApp, SMS, IVR, rep) without forcing app adoption |

### What We Are NOT Building

Real WhatsApp sending, production authentication, RBAC, Kubernetes, MLOps pipelines, real-time satellite analysis, complex maps, farmer mobile app, video generation, payment systems, inventory writeback, or CRM integration.

### The 4-Day Promise

| Day | Milestone |
|---|---|
| Day 1 | Contracts locked, mock data built, Screens 1–2 working |
| Day 2 | Recommendation engine, content generation, Screen 3 with approval flow |
| Day 3 | Screen 4 with field actions + analytics, full demo path polished |
| Day 4 | Deployed, rehearsed, frozen, and ready for judges |

### Final Words

The final product must feel like a **Syngenta internal campaign control room**: practical, explainable, multilingual, stock-aware, and field-team-ready. That is the version judges will believe — and the version Syngenta can actually pilot.

---

*Document Version: 1.0 | Prepared for Syngenta Hackathon | Krishi Campaign Copilot Team*
