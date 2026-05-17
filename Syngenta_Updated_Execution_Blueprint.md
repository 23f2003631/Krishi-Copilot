# Syngenta AI Operations Control Room
## Updated 4-Day Hackathon Execution Blueprint
### Version 2.0 — Evolved Architecture Edition

---

> **"Contract-first. Mock-first. Persistence-first. Demo-safe."**
> This is not a generic roadmap. It is a production-style execution plan for a 5-person team building an enterprise AI operations platform under extreme time pressure.

---

## 1. Updated System Philosophy

### 1.1 Core Execution Principles

The fundamental shift from Blueprint v1.0 is architectural maturity. The system is no longer a stateless frontend-to-API demo. It is a **layered, persistence-backed, role-aware AI operations platform** that happens to be built in 4 days.

This means:

**Build for operational believability, not feature completeness.**
Judges don't count features. They feel whether the system behaves like something a real enterprise team would actually use. Every design decision must serve that feeling.

**Four inviolable rules:**
1. The demo path must work perfectly, every time, regardless of what else breaks
2. Every layer has one owner and one job — no layer does another layer's work
3. Mock data is not a shortcut; it is a first-class engineering artifact that gets replaced progressively
4. Complexity that does not appear on screen during the 5-minute demo does not get built

### 1.2 What Has Fundamentally Changed

| Dimension | v1.0 (Old) | v2.0 (New) |
|---|---|---|
| Database | Local DuckDB only | Supabase PostgreSQL (operational) + DuckDB (analytics) |
| State | Stateless / mock JSON | Persistent campaign lifecycle state |
| Auth | None | Supabase Auth OR role simulation |
| Storage | None | Supabase Storage (content assets, exports) |
| Realtime | None | Supabase Realtime (optional, selected workflows) |
| Frontend | Screens with fake data | Connected operational dashboard with live reads |
| Analytics | Hardcoded charts | DuckDB-computed aggregations from real CSV |
| Workflows | Button → output | Approval state machine with persistence |
| Demo mode | JSON fallback | Supabase seed data + cached API responses |

### 1.3 The Non-Negotiable Demo Path

Every engineering decision must protect this exact sequence:

```
Planner Input → Context Engine → AI Recommendations →
Content Studio → Human Approval → Field Actions → Analytics Export
```

Anything that does not appear in this path is a Day 3/4 concern or is cut entirely.

---

## 2. Updated Architecture Strategy

### 2.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│              Next.js App Router Dashboard                        │
│   Campaign Planner │ Recommendations │ Content Studio │ Field   │
│   AI Feed │ KPI Strip │ Weather Intel │ Segment Cards │ Timeline│
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────────────────┐
│                   INTELLIGENCE LAYER                            │
│                    FastAPI Service                               │
│   Recommendation Engine │ Rule Engine │ LLM Orchestration       │
│   Agronomic Validation │ Content Generation │ Safety Checks     │
└────────┬──────────────────────────────────────┬─────────────────┘
         │ read/write                            │ analytics queries
┌────────▼──────────────┐          ┌────────────▼────────────────┐
│  OPERATIONAL LAYER    │          │     ANALYTICS LAYER         │
│  Supabase PostgreSQL  │          │     DuckDB Engine           │
│  + Auth + Storage     │          │     CSV ingestion           │
│  + Realtime           │          │     Feature engineering     │
│                       │          │     KPI aggregation         │
│  Campaigns │ Recs     │          │     Funnel computation      │
│  Content │ Approvals  │          │     Receptivity scoring     │
│  Growers │ Retailers  │          │     Channel effectiveness   │
│  Field Actions        │          │                             │
│  Inventory │ Exports  │          │                             │
└───────────────────────┘          └─────────────────────────────┘
```

### 2.2 Layer Ownership — Hard Boundaries

**⚠ Critical: Each layer does exactly one job. No exceptions.**

#### Layer A — Operational Persistence (Supabase)
Owns: campaign state, approval workflow state, content records, field action records, user roles, inventory snapshots, export records, file storage
Does NOT own: recommendation logic, LLM calls, analytics computation, feature engineering

#### Layer B — Intelligence Orchestration (FastAPI)
Owns: recommendation scoring, rule engine, agronomic validation, LLM prompt construction, structured output parsing, safety validation, content generation
Does NOT own: database queries beyond reading context, UI rendering, analytics aggregation

#### Layer C — Analytics Computation (DuckDB)
Owns: CSV ingestion, feature engineering, KPI generation, funnel computation, channel effectiveness, receptivity scoring from historical data, aggregation pipelines
Does NOT own: operational state, UI, LLM calls

#### Layer D — Presentation (Next.js)
Owns: all UI rendering, role-based view logic, real-time UI updates, user interactions, demo-mode fallback, chart rendering
Does NOT own: business logic, database writes (except via API), analytics computation

---

## 3. Updated Data Flow Architecture

### 3.1 Primary Request Flow (Happy Path)

```
1. User fills Campaign Planner (Next.js)
   └─→ POST /api/v1/campaign-context (FastAPI)
       ├─→ READ growers, inventory, retailers from Supabase
       ├─→ QUERY DuckDB for engagement stats, crop stage features
       ├─→ FETCH weather mock by district
       ├─→ WRITE campaign_context record to Supabase
       └─→ RETURN context_id + enriched signals

2. User clicks "Generate Recommendations" (Next.js)
   └─→ POST /api/v1/recommendations (FastAPI)
       ├─→ READ context from Supabase by context_id
       ├─→ RUN rule engine + receptivity scorer (DuckDB features)
       ├─→ APPLY stock guardrails (Supabase inventory table)
       ├─→ WRITE recommendation records to Supabase
       └─→ RETURN ranked recommendations with reason codes

3. User selects recommendation → "Generate Content" (Next.js)
   └─→ POST /api/v1/content/generate (FastAPI)
       ├─→ READ recommendation from Supabase
       ├─→ ENRICH with crop stage, weather, allowed claims
       ├─→ CALL LLM with structured prompt
       ├─→ VALIDATE output (Pydantic + safety pipeline)
       ├─→ WRITE content variants to Supabase (approval_state: pending_review)
       ├─→ UPLOAD visual concept to Supabase Storage
       └─→ RETURN content_batch with variants

4. User approves content (Next.js)
   └─→ POST /api/v1/content/approve (FastAPI)
       ├─→ UPDATE content record in Supabase (approval_state: approved)
       ├─→ TRIGGER field action generation
       └─→ RETURN updated content + plan_id

5. System generates field actions (FastAPI)
   └─→ WRITE rep_actions records to Supabase
       ├─→ ASSIGN by territory_id
       ├─→ SET due_date, priority, recommended_script_id
       └─→ RETURN action list

6. Analytics Panel (Next.js)
   └─→ GET /api/v1/analytics-summary (FastAPI)
       ├─→ QUERY DuckDB for historical KPIs and funnel data
       ├─→ READ predicted metrics from recommendation Supabase record
       └─→ RETURN merged analytics payload
```

### 3.2 Fallback Flow (Demo Safety)

```
Any API call fails
  └─→ Frontend checks NEXT_PUBLIC_DEMO_MODE=true
      └─→ Loads /public/demo-cache/{endpoint}.json
          └─→ Renders normally — user sees no difference
              └─→ "Demo Mode" badge shown in header (optional)
```

---

## 4. Updated Database Strategy

### 4.1 Supabase Schema — Table Priority

#### TIER 1 — Required by Day 1 Morning (Demo Path Core)

```sql
-- Campaign contexts (planner output)
CREATE TABLE campaign_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id TEXT UNIQUE NOT NULL,
  scenario_id TEXT,
  crop TEXT NOT NULL,
  product TEXT,
  objective TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  tehsil TEXT,
  territory_id TEXT,
  languages TEXT[] NOT NULL,
  device_types TEXT[] NOT NULL,
  max_target_count INT,
  channel_preferences TEXT[] NOT NULL,
  low_bandwidth BOOLEAN DEFAULT true,
  human_review_required BOOLEAN DEFAULT true,
  min_stock_cover_days INT DEFAULT 10,
  crop_stage JSONB,
  grower_summary JSONB,
  weather_insights JSONB,
  inventory_alerts JSONB,
  source_mode TEXT DEFAULT 'mock',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL,
  context_id TEXT REFERENCES campaign_contexts(context_id),
  priority_score INT CHECK (priority_score BETWEEN 0 AND 100),
  segment_label TEXT NOT NULL,
  target_count INT NOT NULL,
  crop TEXT NOT NULL,
  product TEXT NOT NULL,
  channel_strategy JSONB NOT NULL,
  timing JSONB NOT NULL,
  receptivity JSONB NOT NULL,
  expected_impact JSONB NOT NULL,
  reason_codes TEXT[] NOT NULL,
  human_review_flags TEXT[],
  blocked BOOLEAN DEFAULT false,
  source_mode TEXT DEFAULT 'rules',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content variants
CREATE TABLE content_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT UNIQUE NOT NULL,
  content_batch_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  recommendation_id TEXT REFERENCES recommendations(recommendation_id),
  format TEXT NOT NULL, -- whatsapp | sms | ivr | rep_script | visual_concept
  language TEXT NOT NULL,
  content_text TEXT NOT NULL,
  cta TEXT,
  estimated_read_time_sec INT,
  approval_state TEXT DEFAULT 'pending_review', -- pending_review | approved | rejected
  safety_flags TEXT[],
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  storage_path TEXT, -- Supabase Storage reference
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Field actions
CREATE TABLE field_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL,
  rep_id TEXT NOT NULL,
  territory_id TEXT NOT NULL,
  priority TEXT NOT NULL, -- high | medium | low
  due_date DATE NOT NULL,
  action_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  retailer_ids TEXT[],
  recommended_script_id TEXT,
  success_metric TEXT,
  status TEXT DEFAULT 'pending', -- pending | in_progress | completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### TIER 2 — Required by Day 2 (Operational Realism)

```sql
-- Growers (seeded from dataset)
CREATE TABLE growers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grower_id TEXT UNIQUE NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  tehsil TEXT,
  territory_id TEXT,
  language TEXT NOT NULL,
  device_type TEXT NOT NULL, -- smartphone | keypad | unknown
  crop TEXT,
  farm_size_acres FLOAT,
  whatsapp_opt_in BOOLEAN DEFAULT true,
  last_engagement_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retailers
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id TEXT UNIQUE NOT NULL,
  territory_id TEXT NOT NULL,
  district TEXT NOT NULL,
  tehsil TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory snapshots
CREATE TABLE inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id TEXT REFERENCES retailers(retailer_id),
  product TEXT NOT NULL,
  sku TEXT,
  stock_status TEXT NOT NULL, -- healthy | watch | low | out_of_stock
  stock_cover_days INT,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export records
CREATE TABLE export_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL,
  export_type TEXT NOT NULL, -- csv | whatsapp_pack | rep_brief
  storage_path TEXT,
  exported_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### TIER 3 — Day 3/4 if time permits (Nice to Have)

```sql
-- User roles (for role simulation)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, -- campaign_manager | territory_manager | field_rep | retailer_support
  territory_id TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  performed_by TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Which Tables Are Required When

| Table | Required By | Priority |
|---|---|---|
| `campaign_contexts` | Day 1 | CRITICAL |
| `recommendations` | Day 1 | CRITICAL |
| `content_variants` | Day 1 | CRITICAL |
| `field_actions` | Day 1 | CRITICAL |
| `growers` | Day 2 | HIGH |
| `retailers` | Day 2 | HIGH |
| `inventory_snapshots` | Day 2 | HIGH |
| `export_records` | Day 3 | MEDIUM |
| `user_roles` | Day 3 | MEDIUM |
| `audit_log` | Day 4 (if time) | LOW |

### 4.3 Seed Data Strategy

**Day 1 seed data (minimum viable):**
- 5 campaign scenarios (one per hero scenario)
- 10 recommendation records (2 per scenario)
- 20 content variants (4 per recommendation)
- 10 field action records

**Day 2 seed data (operational realism):**
- 100 growers across 5 states (sampled from real dataset)
- 20 retailers across 5 territories
- 30 inventory snapshot records (including at least 5 low/out-of-stock)

**Seed data rules:**
- Use actual crop names from dataset: wheat, mustard, chickpea, potato
- Use actual-style geographies: UP/Hindi, Rajasthan/Hindi, Punjab/Punjabi, Maharashtra/Marathi, WB/Bengali
- Include at least one "blocked" scenario due to low stock in seed data
- All IDs must be deterministic (not random UUIDs) so demo paths are predictable

---

## 5. Updated DuckDB Analytics Strategy

### 5.1 DuckDB Responsibilities

DuckDB is the **analytics computation layer only**. It does not serve as the operational database. It reads from:
- Raw CSV files from the Syngenta dataset
- Derived feature tables written by the feature engineering pipeline

DuckDB is called by FastAPI services. The frontend never calls DuckDB directly.

### 5.2 Analytics Pipeline — Build Order

#### Phase 1 (Day 1) — Fake analytics, real structure
All analytics endpoints return hardcoded values matching the hero demo scenarios. Charts render with deterministic data. DuckDB is not yet connected.

#### Phase 2 (Day 2) — Feature engineering
```python
# DuckDB feature queries (examples)

# Crop stage distance
"""
SELECT grower_id, crop,
  DATEDIFF('day', CURRENT_DATE, flowering_date) AS days_to_flowering,
  DATEDIFF('day', CURRENT_DATE, harvest_date) AS days_to_harvest
FROM crop_calendar
WHERE territory_id = ?
"""

# Engagement features
"""
SELECT grower_id,
  AVG(opened) AS open_rate,
  AVG(clicked) AS click_rate,
  SUM(attended_offline) AS offline_events,
  SUM(product_scanned) AS scan_count,
  MAX(message_date) AS last_engagement_date
FROM whatsapp_messages
WHERE message_date <= ? -- as-of-date to prevent leakage
GROUP BY grower_id
"""

# Retailer demand velocity
"""
SELECT retailer_id, product, territory_id,
  SUM(quantity_sold) AS weekly_units,
  AVG(quantity_sold) AS avg_weekly_units
FROM pos_transactions
WHERE week_start >= DATEADD('week', -4, ?)
GROUP BY retailer_id, product, territory_id
"""

# Stock risk score
"""
SELECT retailer_id, product,
  stock_cover_days,
  CASE
    WHEN stock_cover_days IS NULL THEN 'out_of_stock'
    WHEN stock_cover_days < 7 THEN 'low'
    WHEN stock_cover_days < 14 THEN 'watch'
    ELSE 'healthy'
  END AS stock_status
FROM inventory
WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM inventory)
"""
```

#### Phase 3 (Day 3) — Real KPI computation
```python
# Analytics summary (replaces hardcoded values)
"""
SELECT
  COUNT(DISTINCT grower_id) AS target_growers,
  AVG(open_rate) AS predicted_open_rate,
  AVG(click_rate) AS predicted_click_rate,
  AVG(open_rate) * COUNT(DISTINCT grower_id) * AVG(click_rate) AS expected_leads
FROM grower_features
WHERE territory_id = ? AND crop = ? AND device_type = 'smartphone'
"""

# Channel mix (from historical data)
"""
SELECT channel,
  COUNT(*) AS messages_sent,
  AVG(opened) AS open_rate,
  ROUND(COUNT(*) * 1.0 / SUM(COUNT(*)) OVER(), 2) AS share
FROM campaign_messages
WHERE campaign_date >= ? AND crop = ?
GROUP BY channel
"""

# Weekly funnel
"""
SELECT week_start,
  AVG(baseline_click_rate) AS baseline,
  AVG(model_click_rate) AS recommended
FROM weekly_funnel_data
WHERE territory_id = ?
ORDER BY week_start
"""
```

### 5.3 Mock vs Real Analytics Schedule

| Metric | Day 1 | Day 2 | Day 3 | Day 4 |
|---|---|---|---|---|
| Open rate prediction | Hardcoded | Hardcoded | DuckDB-computed | Frozen |
| Click rate prediction | Hardcoded | Feature-engineered | DuckDB-computed | Frozen |
| Channel mix chart | Hardcoded | Hardcoded | DuckDB-computed | Frozen |
| Weekly funnel chart | Hardcoded | Hardcoded | DuckDB-computed | Frozen |
| Grower count | Hardcoded | Supabase-read | Supabase-read | Frozen |
| Stock status | Hardcoded | Supabase-read | Supabase-read | Frozen |
| Segment receptivity | Hardcoded | Rules-based | ML-scored | Frozen |

---

## 6. Updated Supabase Integration Strategy

### 6.1 Supabase Services — Usage Map

| Supabase Service | Used For | Priority |
|---|---|---|
| **PostgreSQL** | All operational tables | Day 1 |
| **Storage** | Content asset files, export PDFs/CSVs | Day 3 |
| **Auth** | Role simulation OR lightweight JWT | Day 3 |
| **Realtime** | Field action status updates (optional) | Day 4 if time permits |

### 6.2 Storage Bucket Strategy

```
supabase-storage/
├── content-assets/
│   ├── visual-concepts/     # AI-generated visual concept descriptions as PNG mockups
│   └── whatsapp-packs/      # ZIP exports for WhatsApp campaign bundles
├── exports/
│   ├── csv/                 # Field action CSV exports
│   └── rep-briefs/          # PDF rep brief exports
└── demo-cache/              # Pre-generated demo files
```

**Storage implementation priority:**
- Day 1–2: Skip storage, return file content inline as base64 or text
- Day 3: Move export files to Supabase Storage, return signed URLs
- Day 4: Confirm download links work in deployed environment

### 6.3 Auth / Role Strategy

**Option A (Recommended for hackathon):** Role simulation without real auth
- Store `role` in `localStorage` or URL param
- Frontend reads role and renders appropriate dashboard view
- No Supabase Auth required
- Roles: `campaign_manager`, `territory_manager`, `field_rep`

**Option B:** Supabase Auth with magic link
- Implement only if a team member has done it before
- Use pre-seeded user accounts with assigned roles
- Do not waste Day 1 or Day 2 time on auth flows

**Role-based view differences (minimal, for demo impact):**
- `campaign_manager`: sees full planner + recommendations + content studio + analytics
- `territory_manager`: sees recommendations + field actions + rep table
- `field_rep`: sees field actions only + assigned task list

### 6.4 Realtime (Optional, Day 4 Only)

If bandwidth allows, implement Supabase Realtime on one workflow only:
- Subscribe to `content_variants` WHERE `approval_state` changes
- Show a live notification in the field actions panel when content is approved
- This creates a compelling "live system" impression for judges

---

## 7. Updated Frontend Strategy

### 7.1 Dashboard Architecture

**Application shell:**
```
app/
├── layout.tsx              # Root layout: sidebar + header + role context
├── page.tsx                # Redirect to /planner
├── planner/
│   └── page.tsx            # Campaign Planner + Context Builder
├── recommendations/
│   └── page.tsx            # AI Recommendation Feed + Priority Queue
├── content-studio/
│   └── page.tsx            # Multilingual Content Generator + Approval
├── field-actions/
│   └── page.tsx            # Field Execution Table + Retailer Cards + Analytics
└── api/                    # Optional Next.js API routes for demo-mode fallback
    └── demo/
        └── [endpoint]/
            └── route.ts    # Serves /public/demo-cache/*.json
```

### 7.2 Dashboard Section Build Order

**Priority 1 (Day 1) — Demo path sections:**
These sections must work perfectly before anything else is touched.

| Section | Component | Data Source Day 1 | Data Source Day 3 |
|---|---|---|---|
| Campaign Planner filters | Context Builder | Controlled state | Controlled state |
| Insight cards | CropStageCard, WeatherCard, StockCard | Mock JSON | Supabase read |
| Recommendation cards | RecommendationCard | Mock JSON | Supabase read |
| Content variant cards | ContentVariantCard | Mock JSON | Supabase write |
| Approve button | ApprovalButton | Mock state | Supabase update |
| Rep action table | RepActionTable | Mock JSON | Supabase read |
| KPI strip | MetricCard × 5 | Hardcoded | DuckDB + Supabase |

**Priority 2 (Day 2) — Operational realism sections:**

| Section | Component | Purpose |
|---|---|---|
| AI recommendation feed | RecommendationFeed | Live-scrolling recommendation list with priority badges |
| Campaign priority queue | PriorityQueue | Ranked list of pending campaigns |
| Retailer readiness cards | RetailerReadinessCard | Stock status per retailer per territory |
| Weather trigger intelligence | WeatherIntelPanel | District-level weather risk with signal icons |
| Segment opportunity cards | SegmentCard | Grower segments ranked by receptivity |

**Priority 3 (Day 3) — Analytics and timeline:**

| Section | Component | Purpose |
|---|---|---|
| Campaign funnel analytics | FunnelChart (Recharts) | Baseline vs. recommended lift |
| Channel effectiveness chart | ChannelMixChart | Share of voice by channel |
| Operational timeline | OperationalTimeline | Campaign → content → approval → field action flow |
| Grower segmentation panel | SegmentationPanel | Breakdown by language/device/crop |

**Priority 4 (Day 4) — Polish and demo hardening:**

| Section | Action |
|---|---|
| Loading skeletons | Add to all API-connected sections |
| Empty states | Add to recommendations, field actions, analytics |
| Error boundaries | Wrap every major section |
| Demo mode banner | Show "Demo Mode" badge in header |
| Role switcher | Add role toggle in header for judge demonstration |

### 7.3 Component Architecture

```
components/
├── ui/                          # shadcn/ui base (do not modify)
├── layout/
│   ├── AppSidebar.tsx           # Navigation sidebar with role-aware items
│   ├── AppHeader.tsx            # Header with role switcher + demo badge
│   └── PageShell.tsx            # Page wrapper with title + actions
├── domain/
│   ├── planner/
│   │   ├── ContextBuilder.tsx       # Full planner form
│   │   ├── CropStageCard.tsx        # Crop stage insight card
│   │   ├── WeatherRiskCard.tsx      # Weather intelligence card
│   │   ├── StockStatusCard.tsx      # Inventory status card
│   │   └── EngagementHistoryCard.tsx
│   ├── recommendations/
│   │   ├── RecommendationFeed.tsx   # Scrollable recommendation list
│   │   ├── RecommendationCard.tsx   # Individual rec with score + reasons
│   │   ├── RiskBadge.tsx            # low/medium/high color badge
│   │   ├── ChannelStrategyList.tsx  # Ranked channel display
│   │   ├── ReasonChip.tsx           # Compact reason code tag
│   │   └── BlockedCampaignCard.tsx  # Stock-blocked state display
│   ├── content-studio/
│   │   ├── ContentVariantCard.tsx   # Generated text + safety flags + CTA
│   │   ├── FormatTabs.tsx           # WhatsApp/SMS/IVR/Rep/Visual tabs
│   │   ├── LanguageSelector.tsx
│   │   ├── SafetyPanel.tsx          # Approval checklist display
│   │   └── ApprovalActions.tsx      # Approve/Reject/Regenerate buttons
│   ├── field-actions/
│   │   ├── RepActionTable.tsx       # Dense operational rep table
│   │   ├── RetailerReadinessCard.tsx
│   │   ├── OperationalTimeline.tsx
│   │   └── ExportActions.tsx        # CSV/WhatsApp Pack/Rep Brief buttons
│   └── analytics/
│       ├── KPIStrip.tsx             # 5 metric cards in horizontal row
│       ├── FunnelLiftChart.tsx      # Baseline vs recommended
│       ├── ChannelMixChart.tsx      # Channel distribution
│       └── SegmentReceptivityChart.tsx
├── shared/
│   ├── DemoModeBanner.tsx
│   ├── ErrorBoundary.tsx
│   └── SkeletonLoader.tsx
```

### 7.4 State Management Strategy

```typescript
// URL params: scenario context (shareable, bookmarkable)
// /planner?scenario=WHEAT_UP_FLOWERING
// /recommendations?context_id=CTX_001&plan_id=PLAN_001
// /content-studio?plan_id=PLAN_001&rec_id=REC_001
// /field-actions?plan_id=PLAN_001

// React state: local UI interactions only
// TanStack Query: all API calls with built-in retry + caching
// No Redux, no Zustand — overkill for this scope

// Demo mode detection
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
// If true, all API calls route to /api/demo/[endpoint] which serves cached JSON
```

---

## 8. Updated FastAPI Intelligence Layer Strategy

### 8.1 Service Architecture

```
backend/
├── app/
│   ├── main.py                    # FastAPI app + CORS + startup
│   ├── models/
│   │   └── contracts.py           # All Pydantic models (single source of truth)
│   ├── routers/
│   │   ├── context.py             # POST /api/v1/campaign-context
│   │   ├── recommendations.py     # POST /api/v1/recommendations
│   │   ├── content.py             # POST /api/v1/content/generate + /approve
│   │   ├── field_actions.py       # GET /api/v1/field-actions
│   │   ├── analytics.py           # GET /api/v1/analytics-summary
│   │   ├── scenarios.py           # GET /api/v1/scenarios (seed scenario list)
│   │   └── export.py              # POST /api/v1/export
│   ├── services/
│   │   ├── context_builder.py     # Enriches planner input with signals
│   │   ├── recommender.py         # Recommendation scoring + stock guardrails
│   │   ├── content_generator.py   # LLM orchestration + validation pipeline
│   │   ├── validator.py           # Safety checks, banned phrase, pairing
│   │   ├── duckdb_service.py      # DuckDB query interface
│   │   ├── supabase_service.py    # Supabase read/write interface
│   │   ├── weather_service.py     # District weather mock/API
│   │   └── demo_cache.py          # Cached response loader
│   └── data/
│       ├── mock/                  # JSON mock files
│       ├── csv/                   # Raw dataset CSVs
│       └── processed/             # DuckDB-processed feature tables
├── requirements.txt
└── .env
```

### 8.2 API Implementation Priority

**Day 1 — Mock responses, correct structure:**
All endpoints return mock data. Contracts are identical to final. Frontend connects without modification when real data is added.

**Day 2 — Rules + Supabase reads:**
Recommendation engine uses rules + Supabase reads for inventory/grower data. Content generator uses cached LLM outputs.

**Day 3 — DuckDB + live LLM:**
Analytics endpoints pull from DuckDB. Content generator makes live LLM calls (with cached fallback).

**Day 4 — Frozen + cached:**
All LLM outputs cached. DuckDB queries pre-computed. System operates fully from cache.

### 8.3 Recommendation Engine Logic

```python
# Recommendation scoring pipeline
class RecommendationEngine:

    def score_segment(self, context: CampaignContext, grower_features: dict) -> int:
        score = 0

        # Crop stage urgency (0-30 points)
        days_to_stage = grower_features.get('days_to_flowering', 99)
        if days_to_stage <= 3:   score += 30
        elif days_to_stage <= 7: score += 20
        elif days_to_stage <= 14: score += 10

        # Weather risk (0-25 points)
        weather_risk = context.weather_insights[0].risk_level
        if weather_risk == 'high':   score += 25
        elif weather_risk == 'medium': score += 15
        elif weather_risk == 'low':  score += 5

        # Historical engagement (0-20 points)
        open_rate = grower_features.get('open_rate', 0.23)
        if open_rate > 0.30: score += 20
        elif open_rate > 0.23: score += 12
        else: score += 5

        # Stock availability (0-15 points — binary guardrail)
        stock_days = context.inventory_alerts[0].stock_cover_days
        if stock_days >= 14: score += 15
        elif stock_days >= 7: score += 8
        else: score += 0  # Do not push if stock is low

        # Language + device match (0-10 points)
        if context.audience.languages[0] == grower_features.get('primary_language'):
            score += 5
        if 'smartphone' in context.audience.device_types:
            score += 5

        return min(score, 100)

    def apply_stock_guardrail(self, recommendation: Recommendation,
                               inventory: InventorySnapshot) -> Recommendation:
        if inventory.stock_cover_days < self.min_stock_days:
            recommendation.blocked = True
            recommendation.reason_codes.append("Campaign blocked: retailer stock below threshold")
            recommendation.channel_strategy = [
                ChannelStrategy(channel="field_rep", rank=1,
                    reason="Retailer replenishment required before grower campaign")
            ]
        return recommendation
```

### 8.4 Content Generation Pipeline

```python
class ContentGenerationService:

    SYSTEM_PROMPT = """
    You are Syngenta Krishi Campaign Copilot, an internal agricultural marketing assistant.
    Generate concise, low-literacy-friendly campaign content for field teams.
    Use ONLY the provided context and approved claims.
    NEVER invent dosage, yield guarantees, disease cure promises, or regulatory claims.
    All content requires human review before use.
    Return ONLY valid JSON matching the provided schema.
    """

    BANNED_PHRASES = [
        "guaranteed yield", "100% control", "spray immediately",
        "use X ml", "definite cure", "will prevent all"
    ]

    async def generate(self, request: ContentGenerationRequest) -> ContentBatch:
        # 1. Check cache first
        if cached := self.demo_cache.get(request.recommendation_id):
            return cached

        # 2. Build structured prompt
        prompt = self._build_prompt(request)

        # 3. Call LLM
        try:
            raw = await self._call_llm(prompt)
            variants = self._parse_structured_output(raw)
        except Exception:
            # 4. Fallback to template
            variants = self._generate_from_template(request)

        # 5. Validate all variants
        validated = []
        for variant in variants:
            result = self._validate_variant(variant)
            if result.passed:
                validated.append(variant)
            else:
                # Replace with safe canned version
                validated.append(self._get_safe_fallback(variant.format, variant.language))

        # 6. Persist to Supabase
        batch = ContentBatch(variants=validated, approval_state='pending_review')
        await self.supabase.insert('content_variants', batch)

        return batch

    def _validate_variant(self, variant: ContentVariant) -> ValidationResult:
        errors = []

        # Length checks
        if variant.format == 'sms' and len(variant.text) > 160:
            errors.append("SMS exceeds 160 characters")
        if variant.format == 'whatsapp' and len(variant.text) > 480:
            errors.append("WhatsApp exceeds 480 characters")

        # Banned phrase check
        for phrase in self.BANNED_PHRASES:
            if phrase.lower() in variant.text.lower():
                errors.append(f"Banned phrase detected: {phrase}")

        # Required CTA check
        if not variant.cta:
            errors.append("Missing CTA")

        # Approval state must be pending_review
        if variant.approval_state != 'pending_review':
            errors.append("approval_state must be pending_review")

        return ValidationResult(passed=len(errors) == 0, errors=errors)
```

---

## 9. Updated AI Integration Strategy

### 9.1 LLM Integration Architecture

```
ContentGenerationRequest
    │
    ▼
Cache check (demo_cache.py)
    │ miss
    ▼
Prompt builder (enriched context)
    │
    ▼
LLM call (gpt-4.1-mini, structured output)
    │ failure
    ├─────────────────► Template generator (SafeContentTemplates)
    │                                    │
    │ success                            ▼
    ▼                          Pydantic validation
Structured JSON parse                   │
    │                                   ▼
    ▼                          Safety check pipeline
Pydantic validation                     │
    │                                   ▼
    ▼                          Supabase write (pending_review)
Safety check pipeline                   │
    │                                   ▼
    ▼                          Return to frontend
Supabase write (pending_review)
    │
    ▼
Return to frontend
```

### 9.2 Prompt Template (Full)

```python
USER_PROMPT_TEMPLATE = """
Campaign Context:
- Crop: {crop}
- Product: {product}
- Region: {state}, {district}, {tehsil}
- Crop Stage: {stage} ({days_to_stage} days away)
- Weather Risk: {weather_summary} (risk level: {risk_level})
- Stock Status: {stock_status}, cover: {stock_cover_days} days
- Primary Language: {language}
- Audience Device Mix: {smartphone_pct}% smartphone, {keypad_pct}% keypad
- Channel Formats Required: {formats}

Approved Claims Only:
{allowed_claims}

Generate content variants for each requested format.
Constraints:
- SMS: max 160 characters
- WhatsApp: max 480 characters
- IVR: max 90 words
- Rep script: max 120 words
- Tone: trusted_advisory (like a senior agronomist speaking to a farmer)
- Literacy level: low (simple words, short sentences)
- CTA: exactly one, direct action for farmer to contact local rep or retailer
- Never mention dosage
- Never guarantee outcomes
- All variants must be independent (no cross-reference)

Return ONLY this JSON, no other text:
{{
  "variants": [
    {{
      "format": "whatsapp",
      "language": "{language}",
      "text": "...",
      "cta": "...",
      "estimated_read_time_sec": 18,
      "approval_state": "pending_review",
      "safety_flags": []
    }}
  ]
}}
"""
```

### 9.3 Fallback Content Templates

```python
SAFE_CONTENT_TEMPLATES = {
    ("whatsapp", "Hindi"): ContentVariant(
        format="whatsapp",
        language="Hindi",
        text="आपकी फसल के इस महत्वपूर्ण समय में Syngenta आपके साथ है। "
             "अपने नजदीकी Syngenta प्रतिनिधि या रिटेलर से सही सलाह लें।",
        cta="प्रतिनिधि से संपर्क करें",
        estimated_read_time_sec=12,
        approval_state="pending_review",
        safety_flags=["template_fallback"]
    ),
    ("sms", "Hindi"): ContentVariant(
        format="sms",
        language="Hindi",
        text="Syngenta: अपनी फसल की सुरक्षा के लिए आज ही "
             "स्थानीय प्रतिनिधि से संपर्क करें।",
        cta="संपर्क करें",
        estimated_read_time_sec=8,
        approval_state="pending_review",
        safety_flags=["template_fallback"]
    ),
    # ... additional language/format combinations
}
```

---

## 10. Updated Demo and Fallback Strategy

### 10.1 Demo-Safe Architecture Layers

```
Layer 1: Live system (primary)
  Vercel frontend → Render FastAPI → Supabase + DuckDB
  ↓ fails
Layer 2: Cached API responses (secondary)
  Vercel frontend → /api/demo/[endpoint] → /public/demo-cache/*.json
  ↓ fails
Layer 3: Hardcoded component data (tertiary)
  Frontend renders with DEMO_MODE=true → all components use inline mock objects
  ↓ fails
Layer 4: Screenshot deck + screen recording (final backup)
  Pre-prepared Figma export or browser screenshots of all 4 screens
```

### 10.2 Demo Cache File Structure

```
public/demo-cache/
├── scenarios.json                    # 5 hero scenarios
├── campaign-context-CTX_001.json     # Wheat/UP context response
├── campaign-context-CTX_002.json     # Mustard/Rajasthan blocked context
├── recommendations-PLAN_001.json     # Wheat recommendation (unblocked)
├── recommendations-PLAN_002.json     # Mustard recommendation (blocked)
├── content-CNT_001.json              # Hindi WhatsApp/SMS/IVR/Rep content
├── content-CNT_002.json              # Bengali IVR content (Scenario 3)
├── field-actions-PLAN_001.json       # Wheat field action table
├── analytics-PLAN_001.json           # Wheat analytics KPIs + charts
└── export-sample.csv                 # Pre-generated CSV for demo download
```

### 10.3 Demo Mode Implementation

```typescript
// lib/api.ts — unified API client with demo fallback
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (demoMode) {
    // Load from demo cache
    const cacheKey = endpointToCacheKey(endpoint);
    const res = await fetch(`/demo-cache/${cacheKey}.json`);
    return res.json();
  }

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch (err) {
    // Automatic fallback to demo cache on any failure
    console.warn(`API call failed for ${endpoint}, falling back to demo cache`);
    const cacheKey = endpointToCacheKey(endpoint);
    const res = await fetch(`/demo-cache/${cacheKey}.json`);
    return res.json();
  }
}
```

### 10.4 Demo Stability Checklist

**48 hours before judging:**
- [ ] All LLM outputs cached to `/public/demo-cache/`
- [ ] Demo mode tested end-to-end (disconnect internet, full flow still works)
- [ ] All 5 hero scenarios have cached responses
- [ ] Export CSV download tested in demo mode

**Day of judging — 2 hours before:**
- [ ] Local backend runs and health check responds
- [ ] Local frontend runs, all 4 routes load
- [ ] Deployed Vercel frontend opens
- [ ] Deployed Render backend responds to health check
- [ ] Supabase dashboard shows seeded data
- [ ] Scenario 1 (Wheat/UP) completes in under 4 minutes
- [ ] Scenario 2 (Mustard/blocked) shows blocked state correctly
- [ ] All charts render with data (no empty charts)
- [ ] All buttons respond (loading state → success state)
- [ ] Export button downloads a real file
- [ ] Role switcher works (show campaign_manager → territory_manager view)
- [ ] Browser tabs pre-opened on each screen
- [ ] Mobile phone ready with backup screenshots

**Backup artifacts:**
- [ ] Screenshot of all 4 screens for Scenario 1 (exported as PNG)
- [ ] Screenshot of blocked campaign state for Scenario 2
- [ ] 90-second screen recording of full demo flow
- [ ] Slide deck with architecture diagram (3 slides maximum)

---

## 11. Updated Deployment Strategy

### 11.1 Deployment Topology

```
┌──────────────────────────────────────────────────────┐
│  Vercel (Frontend)                                    │
│  syngenta-copilot.vercel.app                         │
│  Next.js App Router + Static demo cache              │
│  Auto-deploy from main branch                        │
└─────────────────────┬────────────────────────────────┘
                      │ HTTPS REST
┌─────────────────────▼────────────────────────────────┐
│  Render / Railway (Backend)                          │
│  syngenta-copilot-api.onrender.com                   │
│  FastAPI + uvicorn + DuckDB in-process               │
│  Environment vars: OPENAI_API_KEY, SUPABASE_URL,    │
│  SUPABASE_SERVICE_KEY, DEMO_CACHE_ENABLED=true       │
└─────────────────────┬────────────────────────────────┘
                      │ Supabase JS SDK / REST API
┌─────────────────────▼────────────────────────────────┐
│  Supabase (Managed)                                  │
│  PostgreSQL + Storage + Auth + Realtime              │
│  Project URL from supabase.com                       │
└──────────────────────────────────────────────────────┘
```

### 11.2 Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_BASE_URL=https://syngenta-copilot-api.onrender.com
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Backend (.env):**
```
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4.1-mini
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
DATA_MODE=hybrid
DEMO_CACHE_ENABLED=true
CORS_ORIGINS=https://syngenta-copilot.vercel.app,http://localhost:3000
DUCKDB_DATA_PATH=/app/data/csv
```

### 11.3 Deployment Timeline

| Task | When | Owner |
|---|---|---|
| Supabase project created + schema applied | Day 1 morning | Backend |
| Next.js project on Vercel (auto-deploy) | Day 1 afternoon | Frontend |
| FastAPI on Render (manual deploy) | Day 1 afternoon | Backend |
| Supabase seed data loaded | Day 1 evening | Backend |
| DuckDB CSV files uploaded to backend | Day 2 | Data |
| Supabase Storage buckets created | Day 3 | Backend |
| Full end-to-end deployed test | Day 3 evening | All |
| Render warm-up scheduled | Day 4 morning | Backend |
| Final freeze and backup | Day 4 afternoon | All |

---

## 12. Updated 4-Day Execution Roadmap

---

### DAY 1: Contracts, Schema, Shell, and Mock Pipeline

**Objective:** Every team member has something to build. The demo path exists (with fake data). Supabase is live. Frontend shell is deployed.

**Architecture Goal:** Lock every contract before writing any implementation logic.

---

#### 12.1.1 Morning Block (Hours 0–4)

**All hands — Contract Locking Session**

This is non-negotiable. No one writes UI or backend logic until contracts are agreed.

- Lock TypeScript interfaces in `frontend/src/lib/types.ts`
- Lock Pydantic models in `backend/app/models/contracts.py`
- Lock all API endpoint shapes (request + response for all 6 endpoints)
- Lock Supabase schema DDL (Tier 1 tables only)
- Lock mock JSON file format for all 5 demo scenarios
- Lock enum values (Crop, Channel, Language, Objective, RiskLevel, StockStatus)
- Lock color palette and design tokens

**Deliverable:** Shared contracts document committed to Git. No divergence allowed after this point.

---

#### 12.1.2 Day 1 Backend Tasks

**Owner: Backend/AI Engineer**

- [ ] Create Supabase project, apply Tier 1 schema, confirm all 4 tables exist
- [ ] Create Supabase Storage buckets (`content-assets`, `exports`)
- [ ] Set up FastAPI project with CORS, health check, and environment config
- [ ] Implement all 6 routers returning mock responses (correct schema, fake data)
- [ ] Write mock JSON files for all 5 hero scenarios
- [ ] Implement `demo_cache.py` — loads JSON files by scenario ID
- [ ] Seed Supabase with 5 campaign contexts, 10 recommendations, 20 content variants
- [ ] Verify: `GET /api/v1/scenarios` returns 5 scenarios
- [ ] Verify: `POST /api/v1/campaign-context` returns CTX_001 structure
- [ ] Verify: `POST /api/v1/recommendations` returns PLAN_001 structure
- [ ] Deploy FastAPI to Render; confirm health check at `/health`

---

#### 12.1.3 Day 1 Frontend Tasks

**Owner: Frontend Engineer(s)**

- [ ] Bootstrap Next.js App Router project with TypeScript + TailwindCSS + shadcn/ui
- [ ] Configure Supabase client (`@supabase/supabase-js`)
- [ ] Implement dark theme (apply CSS variables from design system)
- [ ] Build `AppSidebar` with 4 navigation items
- [ ] Build `AppHeader` with role indicator and demo mode badge
- [ ] Build `/planner` page: context filter form + insight cards (ContextBuilder)
- [ ] Build `/recommendations` page: recommendation card list (static, mock data inline)
- [ ] Connect frontend to backend: planner submit → API call → recommendations render
- [ ] Add TanStack Query for API calls with demo-mode fallback
- [ ] Deploy to Vercel; confirm all routes load

---

#### 12.1.4 Day 1 Data Tasks

**Owner: Analytics/Data Engineer**

- [ ] Inspect all provided CSV files; document schema, row counts, and join keys
- [ ] Identify all join issues (grower ↔ WhatsApp, POS ↔ inventory)
- [ ] Document missing values strategy (crop calendar gaps, missing lat/lon)
- [ ] Set up DuckDB Python environment; confirm CSV ingestion works
- [ ] Write initial feature engineering queries (crop stage distance, engagement rates)
- [ ] Generate derived stats for Scenario 1 (Wheat/UP): open rate, click rate, grower count
- [ ] Document as-of-date strategy for leakage prevention

---

#### 12.1.5 Day 1 UI/UX Tasks

**Owner: UI/UX + Demo Engineer**

- [ ] Build `RecommendationCard` component with all visual states (normal, high-priority, blocked)
- [ ] Build `RiskBadge` component (low/medium/high)
- [ ] Build `MetricCard` component (label, value, trend icon)
- [ ] Build `CropStageCard`, `WeatherRiskCard`, `StockStatusCard` insight cards
- [ ] Verify dark theme renders correctly on all built components
- [ ] Populate `/public/demo-cache/` with all mock JSON files
- [ ] Build demo mode fallback: all API calls served from demo cache

---

#### 12.1.6 Day 1 Expected Deliverables

| Deliverable | Status |
|---|---|
| Contracts locked (TS + Pydantic) | ✅ Required |
| Supabase schema live (Tier 1) | ✅ Required |
| Supabase seeded (5 scenarios) | ✅ Required |
| FastAPI deployed on Render | ✅ Required |
| Frontend deployed on Vercel | ✅ Required |
| Screen 1 (Planner) working with mock data | ✅ Required |
| Screen 2 (Recommendations) working with mock data | ✅ Required |
| Demo cache populated | ✅ Required |
| DuckDB ingestion confirmed | ✅ Required |

**End-of-Day 1 check:** Open the Vercel URL. Fill in the planner for Scenario 1 (Wheat/UP). Click "Generate Recommendations". See recommendation cards with correct data. If this works, Day 1 is successful.

---

### DAY 2: Intelligence Layer, Content Studio, and Operational Realism

**Objective:** The recommendation engine is real. Content generation is cached and working. The approval workflow persists to Supabase. Screen 3 is functional. Operational realism layers are seeded.

---

#### 12.2.1 Day 2 Backend Tasks

**Owner: Backend/AI Engineer**

- [ ] Implement `RecommendationEngine` in `recommender.py`:
  - Crop stage scoring (0–30 pts)
  - Weather risk scoring (0–25 pts)
  - Historical engagement scoring (0–20 pts)
  - Stock availability scoring (0–15 pts)
  - Language/device match scoring (0–10 pts)
  - `apply_stock_guardrail()` — blocks campaign if stock below threshold
- [ ] Wire recommendations to Supabase: read inventory from `inventory_snapshots`, write results to `recommendations`
- [ ] Implement `ContentGenerationService`:
  - Check demo cache first
  - Build structured prompt from context
  - Call LLM (gpt-4.1-mini)
  - Parse and validate structured output
  - Retry once on failure
  - Fallback to template on second failure
- [ ] Implement validation pipeline: length → enum → banned phrase → CTA → approval state
- [ ] Implement `POST /api/v1/content/approve`: update `content_variants` in Supabase
- [ ] Cache all LLM outputs for all 5 hero scenarios
- [ ] Implement `GET /api/v1/field-actions`: generates rep actions post-approval

---

#### 12.2.2 Day 2 Frontend Tasks

**Owner: Frontend Engineer(s)**

- [ ] Build `/content-studio` page:
  - Selected recommendation summary header
  - Format tabs (WhatsApp / SMS / IVR / Rep Script / Visual Concept)
  - Language selector (Hindi, Punjabi, Marathi, Gujarati, Bengali, English)
  - `ContentVariantCard` for each generated variant
  - `SafetyPanel` (approved crop, approved product, no dosage, human review required)
  - Approve / Reject / Regenerate / Edit buttons
  - Approval state machine: pending → approved / rejected
- [ ] Connect content studio to backend: recommendation selection → content generation API
- [ ] Persist approval action to Supabase (via FastAPI `approve` endpoint)
- [ ] Show "Approved" state visually after approval (green badge, timestamp)
- [ ] Navigate from approved content → field actions automatically

---

#### 12.2.3 Day 2 Data Tasks

**Owner: Analytics/Data Engineer**

- [ ] Complete feature engineering pipeline in DuckDB:
  - Crop stage distance features
  - Engagement rate features (open, click, scan, attendance)
  - Retailer demand velocity
  - Stock risk score
  - Rep coverage features
  - Weather risk features
- [ ] Load Tier 2 Supabase seed data:
  - 100 growers across 5 states
  - 20 retailers across 5 territories
  - 30 inventory snapshots (including 5 low/out-of-stock)
- [ ] Verify inventory guardrail: Scenario 2 (Mustard/Sikar, 4 days stock) triggers `blocked = true`
- [ ] Prepare analytics KPI baseline from DuckDB for Scenario 1

---

#### 12.2.4 Day 2 UI/UX Tasks

**Owner: UI/UX + Demo Engineer**

- [ ] Build `ContentVariantCard` (full implementation with safety flags display)
- [ ] Build `SafetyPanel` component
- [ ] Build `ApprovalActions` component (approve/reject/regenerate with loading states)
- [ ] Build `BlockedCampaignCard` — prominent blocked state for Scenario 2
- [ ] Build `RetailerReadinessCard` — stock status per retailer
- [ ] Build `WeatherIntelPanel` — weather triggers with signal icons
- [ ] Build `SegmentCard` — grower segment with receptivity score
- [ ] Add loading skeleton to all API-connected sections
- [ ] Add toast notification on content generation complete
- [ ] Add toast on approval action

---

#### 12.2.5 Day 2 Expected Deliverables

| Deliverable | Status |
|---|---|
| Recommendation engine (rules + stock guardrail) | ✅ Required |
| Content generation (cached LLM outputs) | ✅ Required |
| Screen 3 (Content Studio) fully functional | ✅ Required |
| Approval workflow persisted to Supabase | ✅ Required |
| Blocked scenario (Mustard/Sikar) works | ✅ Required |
| Grower + retailer + inventory seed data loaded | ✅ Required |
| Feature engineering pipeline complete | ✅ Required |

**End-of-Day 2 check:** Open the full flow: Planner → Recommendations → Content Studio → Approve. Confirm approval state saved in Supabase table. Confirm Scenario 2 shows blocked campaign card. If this works, Day 2 is successful.

---

### DAY 3: Field Actions, Analytics, Integration, and Polish

**Objective:** All 4 screens are complete. DuckDB drives real analytics. The full demo path runs end-to-end without interruption. Visual polish is production quality.

---

#### 12.3.1 Day 3 Backend Tasks

**Owner: Backend/AI Engineer**

- [ ] Implement `GET /api/v1/field-actions`: reads rep actions from Supabase, enriched with rep/territory data
- [ ] Implement `GET /api/v1/analytics-summary`: queries DuckDB for real computed KPIs
- [ ] Replace hardcoded analytics with DuckDB-computed aggregations:
  - Open/click rate prediction from historical engagement features
  - Channel mix from historical campaign data
  - Weekly funnel (baseline vs. recommended)
- [ ] Implement `POST /api/v1/export`:
  - Generate CSV export of field actions
  - Upload to Supabase Storage
  - Return signed URL for download
- [ ] Add `GET /api/v1/scenarios` endpoint returning pre-seeded scenario list
- [ ] Implement weather mock lookup by district centroid
- [ ] Add Supabase Realtime integration (optional): broadcast content approval events

---

#### 12.3.2 Day 3 Frontend Tasks

**Owner: Frontend Engineer(s)**

- [ ] Build `/field-actions` page (complete):
  - `RepActionTable`: Rep ID, territory, priority growers, recommended action, due date, stock note, status
  - `RetailerReadinessCard` × 3 (healthy / low / replenish)
  - `OperationalTimeline`: campaign → content → approval → field action steps
  - `KPIStrip`: 5 metric cards (target growers, open rate, click rate, expected leads, stock-ready retailers)
  - `FunnelLiftChart`: baseline vs. recommended bars
  - `ChannelMixChart`: donut or bar chart by channel share
  - Export buttons: CSV (working download), WhatsApp Pack, Rep Brief
- [ ] Connect analytics panel to backend (DuckDB-computed KPIs)
- [ ] Add `OperationalTimeline` visual showing campaign lifecycle stages
- [ ] Add Supabase Realtime listener (if implemented): live update when content approved
- [ ] Add role-based view differences: campaign_manager vs. territory_manager vs. field_rep
- [ ] Add role switcher in header for judge demonstration
- [ ] Add empty state for field actions: "No field actions until a recommendation is approved"
- [ ] Add campaign context breadcrumb across all 4 screens (crop/region/product strip)

---

#### 12.3.3 Day 3 Data Tasks

**Owner: Analytics/Data Engineer**

- [ ] Complete DuckDB analytics queries (channel mix, funnel, open/click rates)
- [ ] Wire DuckDB analytics to FastAPI `analytics` service
- [ ] Validate analytics numbers against Scenario 1 expected values (open 31%, click 8%, leads 69)
- [ ] Add district centroid lookup table for weather fallback
- [ ] Prepare DuckDB `.db` file bundled with backend for Render deployment
- [ ] Generate `export-sample.csv` for demo download

---

#### 12.3.4 Day 3 UI/UX Tasks

**Owner: UI/UX + Demo Engineer**

- [ ] Complete `RepActionTable` (dense operational table with priority coloring)
- [ ] Complete `FunnelLiftChart` and `ChannelMixChart`
- [ ] Complete `OperationalTimeline` component
- [ ] Complete `KPIStrip` (5 metric cards, animated on load)
- [ ] Add `SegmentReceptivityChart` (bar chart of segment scores)
- [ ] Polish all transitions and loading states
- [ ] Final visual audit: consistent spacing, color usage, typography across all 4 screens
- [ ] Prepare backup screenshot set for all 4 screens × 2 scenarios

---

#### 12.3.5 Day 3 Expected Deliverables

| Deliverable | Status |
|---|---|
| Screen 4 (Field Actions + Analytics) complete | ✅ Required |
| DuckDB-computed analytics live | ✅ Required |
| Export CSV working (signed URL from Supabase Storage) | ✅ Required |
| Role-based view differences visible | ✅ Required |
| Full 5-minute demo path runs without interruption | ✅ Required |
| All 4 screens visually polished | ✅ Required |
| Backup screenshots prepared | ✅ Required |

**End-of-Day 3 check:** Run the complete 5-minute demo path from scratch, 3 times. It must complete without errors every time. If there is any failure, fix it before Day 4.

---

### DAY 4: Freeze, Deploy, Rehearse, and Ship

**Objective:** Nothing new is built. Everything is hardened, cached, deployed, and rehearsed. The team is ready to present.

---

#### 12.4.1 Day 4 Backend Tasks

- [ ] Cache all remaining LLM outputs (confirm no live LLM calls in demo path)
- [ ] Pre-compute all DuckDB analytics; store in `demo_cache.json`
- [ ] Warm up Render backend; set health check interval
- [ ] Verify CORS settings work for deployed Vercel URL
- [ ] Confirm Supabase seed data is correct on production project
- [ ] Confirm Supabase Storage signed URLs work in production
- [ ] Test API failure: disconnect backend, confirm frontend falls back to demo cache

---

#### 12.4.2 Day 4 Frontend Tasks

- [ ] Confirm all 4 routes deploy correctly on Vercel
- [ ] Confirm demo mode fallback works (all screens render with cached data)
- [ ] Confirm export download works on Vercel domain
- [ ] Add "Demo Mode" banner visibility toggle
- [ ] Final accessibility pass: keyboard navigation works on main interactions
- [ ] Pre-open browser tabs: /planner → /recommendations → /content-studio → /field-actions
- [ ] Test on judge's laptop resolution (1920×1080 and 1440×900)

---

#### 12.4.3 Day 4 Demo Tasks

- [ ] Rehearse 5-minute judge flow 3+ times with full presenter narrative
- [ ] Designate one person to present (no switching mid-demo)
- [ ] Prepare architecture slide (1 slide showing 4-layer diagram)
- [ ] Prepare impact slide (1 slide showing problem → solution → outcome)
- [ ] Confirm backup recording is ready (90-second screen capture)
- [ ] Confirm backup screenshot deck is ready (8 screenshots minimum)
- [ ] Freeze codebase — no commits after final rehearsal passes

---

#### 12.4.4 Day 4 Expected Deliverables

| Deliverable | Status |
|---|---|
| Deployed and live (Vercel + Render + Supabase) | ✅ Required |
| Demo mode fallback confirmed working | ✅ Required |
| 90-second backup recording ready | ✅ Required |
| 8+ backup screenshots ready | ✅ Required |
| Full team rehearsed (3 passes minimum) | ✅ Required |
| Codebase frozen | ✅ Required |

---

## 13. What to Mock vs. What to Build

### 13.1 Build From Day 1 (Core Demo Path)

| What | Why |
|---|---|
| Supabase Tier 1 schema | State must persist across page refreshes |
| All 6 FastAPI endpoints (mock response) | Frontend needs stable contracts immediately |
| Demo cache fallback | Demo stability is non-negotiable |
| Recommendation card UI | The single most important visual to judges |
| Content variant display | Shows AI capability — must look real |

### 13.2 Mock Until Day 2, Then Build

| What | Mock Until | Then Build |
|---|---|---|
| Recommendation scoring | Day 1 (hardcoded scores) | Day 2 (rules engine) |
| Stock guardrail | Day 1 (hardcoded blocked = false) | Day 2 (Supabase inventory read) |
| Content generation | Day 1 (cached variants) | Day 2 (LLM + validation) |
| Approval workflow | Day 1 (local state) | Day 2 (Supabase write) |

### 13.3 Mock Until Day 3, Then Build

| What | Mock Until | Then Build |
|---|---|---|
| Analytics KPIs | Days 1–2 (hardcoded values) | Day 3 (DuckDB queries) |
| Channel mix chart | Days 1–2 (hardcoded data) | Day 3 (DuckDB aggregation) |
| Weekly funnel | Days 1–2 (hardcoded) | Day 3 (DuckDB) |
| Export file | Days 1–2 (button with no action) | Day 3 (Supabase Storage) |
| Grower segmentation panel | Days 1–2 (hardcoded counts) | Day 3 (Supabase + DuckDB) |

### 13.4 Keep Mocked Throughout (Do Not Build)

| What | Reason |
|---|---|
| WhatsApp sending | Production API — not needed for demo |
| Real-time satellite NDVI | No lat/lon coverage; too complex |
| Full ML model (LightGBM) | Rules engine is sufficient for demo; ML is overhead |
| PDF report generation | CSV export is sufficient |
| Role-based database rows | URL param / localStorage role simulation is enough |
| Supabase Realtime | Nice to have — add only if Day 3 is ahead of schedule |
| Pest surveillance API | Mock alert data is indistinguishable to judges |
| Full agronomist review flow | Approval button state change is sufficient |

---

## 14. Judge-Focused Priorities

### 14.1 What Judges Actually Evaluate

Based on Syngenta's stated evaluation criteria, judges are looking for:

1. **"Do they understand the farmer's world?"** — Show language diversity, low-literacy design, low-bandwidth awareness in the UI
2. **"Is this pilotable?"** — Show that the system produces outputs field teams can actually use tomorrow
3. **"Strong machine learning?"** — Show explainable reason codes, receptivity scores, and calibrated predictions
4. **"Business realism?"** — The stock guardrail blocking Scenario 2 is your strongest business realism signal

### 14.2 Visual Priorities for Judges

**Highest impact, most judge attention:**
1. `RecommendationCard` — priority score + reason codes + channel strategy (this must be perfect)
2. `ContentVariantCard` — generated multilingual content with safety panel visible
3. `BlockedCampaignCard` — stock guardrail in action (Scenario 2)
4. `KPIStrip` — 5 metric cards showing predicted uplift
5. `RepActionTable` — operational field execution (shows real-world utility)

**Moderate impact:**
6. `WeatherIntelPanel` — shows contextual intelligence, not just AI output
7. `FunnelLiftChart` — shows measurable uplift over baseline
8. `OperationalTimeline` — shows end-to-end workflow thinking

**Lower impact (implement but don't over-invest):**
9. `SegmentationPanel` — grower breakdown charts
10. `ChannelMixChart` — supplementary analytics

### 14.3 Narrative Moments to Prepare

**Moment 1: The Intelligence Gap**
> "Traditional campaigns send the same message to 150 million farmers. We start by understanding what's happening in this specific district this week — crop stage, weather risk, stock availability, and historical engagement."

**Moment 2: The Stock Guardrail**
> "This is where most AI systems fail — they generate recommendations without checking if the product is actually available. Our system checks retailer inventory first. [Switch to Scenario 2] You can see Mustard/Rajasthan is blocked — not because the recommendation is wrong, but because sending it now would create demand that can't be fulfilled."

**Moment 3: The Content Generation**
> "AI content is generated only within approved agronomic guardrails. No dosage claims. No yield guarantees. Every variant requires human approval before activation."

**Moment 4: The Field Action**
> "The output is not a message. It's a complete operational plan — the rep knows which retailers to visit, which growers to prioritize, and what to say."

---

## 15. Team Responsibility Map

### 15.1 Role Assignments

| Team Member | Primary Ownership | Secondary Support |
|---|---|---|
| **Frontend Engineer 1** | Screens 1–2, component library, API integration | Demo mode fallback |
| **Frontend Engineer 2** | Screens 3–4, charts, export UI, role switcher | UI polish |
| **Backend/AI Engineer** | FastAPI services, LLM orchestration, Supabase writes | DuckDB queries |
| **Analytics/Data Engineer** | DuckDB pipeline, feature engineering, seed data | Backend analytics queries |
| **UI/UX + Demo Engineer** | Visual design system, demo flow, backup artifacts | Integration testing |

### 15.2 Parallel Workstream Map

```
Day 1:
FE1: Planner + Recommendation screen shells
FE2: Component library (cards, badges, charts)
BE:  FastAPI skeleton + Supabase schema + seed data
DE:  CSV inspection + DuckDB setup + EDA
UX:  Demo cache population + design review

Day 2:
FE1: Content Studio + approval flow
FE2: Retailer cards + weather panel + segment cards
BE:  Recommendation engine + content generation + LLM caching
DE:  Feature engineering complete + Tier 2 seed data
UX:  Component polish + loading states + blocked scenario UI

Day 3:
FE1: Field Actions screen + analytics connections
FE2: Charts + KPI strip + role switcher + timeline
BE:  Analytics endpoints (DuckDB) + export endpoint + storage
DE:  Analytics queries + DuckDB bundling for Render
UX:  Visual audit + screenshot prep + demo path testing

Day 4:
All: Deployment verification + rehearsal + freeze + backup prep
```

---

## 16. Mock vs. Real Data — Consolidated Reference

| Data Type | Day 1 | Day 2 | Day 3 | Day 4 |
|---|---|---|---|---|
| Campaign contexts | Mock JSON | Supabase read/write | Supabase read/write | Frozen |
| Recommendations | Mock JSON | Rules engine + Supabase | Rules engine + Supabase | Frozen |
| Content variants | Cached LLM | Live LLM + Supabase | Live LLM + Supabase | Cached only |
| Field actions | Mock JSON | Generated + Supabase | Supabase read | Frozen |
| Grower data | Hardcoded counts | Supabase (seeded) | Supabase (seeded) | Frozen |
| Inventory data | Hardcoded | Supabase (seeded) | Supabase (seeded) | Frozen |
| Analytics KPIs | Hardcoded | Hardcoded | DuckDB-computed | DuckDB cached |
| Charts | Hardcoded | Hardcoded | DuckDB-computed | DuckDB cached |
| Weather data | Hardcoded mock | District centroid mock | District centroid mock | Cached |
| Export files | Button only | Button only | Supabase Storage | Frozen URL |

---

## 17. Final Implementation Summary

### What We Are Building

**Syngenta AI Operations Control Room** — a 4-layer enterprise AI platform that gives Syngenta's internal teams a single operational dashboard to orchestrate agricultural marketing campaigns from context intelligence to field execution.

### The Four Layers in One Sentence Each

- **Supabase** holds the state of every campaign, recommendation, content decision, and field action — so nothing is lost between sessions
- **FastAPI** is the brain — it scores segments, enforces stock guardrails, orchestrates LLM calls, and validates every output against agronomic safety rules
- **DuckDB** is the analyst — it processes raw CSV data into actionable features, KPIs, and channel effectiveness scores that make the recommendations credible
- **Next.js** is the control room — a premium dark enterprise dashboard where campaign managers, territory managers, and field reps each see exactly what they need to act

### The 4-Day Promise

| Day | What Gets Built | What It Proves |
|---|---|---|
| **Day 1** | Contracts + schema + shell + mock pipeline | Architectural discipline and speed |
| **Day 2** | Intelligence layer + content generation + approval workflow | AI capability and safety |
| **Day 3** | Analytics + field actions + full integration + polish | Operational realism and completeness |
| **Day 4** | Deployment + rehearsal + freeze | Execution discipline and demo readiness |

### The Three Things That Must Work Perfectly

1. **Scenario 1** (Wheat/UP): Complete demo path from planner to field action export — under 4 minutes
2. **Scenario 2** (Mustard/Rajasthan): Stock guardrail blocks campaign — visible, clear, correct
3. **Content approval**: Approve button → Supabase state update → field actions unlock

Everything else is enhancement. These three are the demo.

### What We Are Not Building (Final List)

Real WhatsApp API integration, production authentication, RBAC enforcement, Kubernetes, MLOps pipeline, real-time satellite NDVI, complex GIS maps, farmer-facing mobile app, video generation, payment systems, inventory writeback, CRM integration, full LightGBM ML pipeline, pest surveillance API integration, agronomist review portal, PDF generation, or multi-tenant architecture.

### Final Engineering Principle

> The system must feel like something Syngenta could pilot in three months. It must not feel like something that needs to be rebuilt from scratch. Every architectural decision — Supabase for persistence, DuckDB for analytics, FastAPI for intelligence, Next.js for the dashboard — must be explainable to a Syngenta CTO in 30 seconds. And the demo must run perfectly even if the internet goes down.

---

*Document Version: 2.0 | Updated Architecture Edition | Syngenta AI Operations Control Room*
*Prepared for 4-Day Hackathon Execution | Team of 5*
