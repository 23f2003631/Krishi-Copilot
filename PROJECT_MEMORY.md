# Syngenta Krishi Campaign Copilot — Project Memory

## 1. Project Overview
Syngenta Krishi Campaign Copilot is an AI-powered agricultural campaign intelligence and field operations platform. It functions as an internal enterprise control room for prioritizing marketing campaigns, generating localized advisory content, and managing field execution, driven by crop-stage, weather, and inventory realities.

## 2. Product Vision
To provide a role-aware, operational workflow engine that aligns Campaign Managers, Territory Managers, Field Reps, and Retailer Support teams around a single source of truth, supercharged by verifiable and explainable AI generation.

## 3. Current Architecture
- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, shadcn/ui.
- **Backend**: FastAPI, Pydantic, Python 3.
- **Persistence**: Supabase (PostgreSQL), utilizing REST PostgREST.
- **Analytics**: DuckDB (for CSV ingestion and complex aggregations).
- **LLM Engine**: Gemini (via `google-generativeai`).

## 4. Frontend Stack
- Framework: Next.js (TypeScript)
- Styling: Tailwind CSS v4, Lucide Icons
- State: React state + simulated role state (localStorage)

## 5. Backend Stack
- Framework: FastAPI
- Contracts: Pydantic models with strict enum validation
- Orchestration: Layered architecture (Routers -> Services -> Repositories -> Providers)

## 6. Supabase Usage
- Acts as the operational database storing `content_variants` and `field_actions`.
- Connects via HTTP REST requests (`urllib`) bypassing complex ORM overhead for the hackathon.

## 7. DuckDB Usage
- Used for analytical heavy lifting. Ingests CSVs for historical campaign data and provides aggregated metrics to the frontend via the `analytics` router.

## 8. Gemini Provider Flow
- Content Generation Service invokes `llm_provider.py` which wraps `google-generativeai`.
- Prompts include crop stage, localized weather risks, and inventory alerts to ensure grounded advisory generation.

## 9. Dashboard Structure
- A central Sidebar navigation layout.
- Four main views: Planner (Campaigns), Recommendations, Content Studio, Field Actions.
- Analytics embedded contextually.

## 10. API Contracts
- Strongly typed Pydantic models (`contracts.py`) ensuring backend/frontend synchronization (e.g., `ContentVariant`, `Recommendation`).

## 11. Workflow Architecture
- **Step 1**: Campaign Planning -> Generates Context
- **Step 2**: Context -> Generates Recommendations (Scored & Ranked)
- **Step 3**: Recommendations -> Generates Content Variants (Gemini)
- **Step 4**: Content -> Approval -> Unlocks Field Actions

## 12. Persistence Strategy
- Hybrid mode: Prefers Supabase cache lookup. On cache miss, generates via LLM, validates, and explicitly UPSERTs into Supabase. Telemetry is saved in the `safety_flags` text array due to DB access limitations.

## 13. Fallback Strategy
- "Graceful Degradation": If Gemini times out, hits a quota, or returns empty, the system falls back to safe template generation.
- If Supabase fails (HTTP Error 409 etc), the backend logs it, appends a warning, and continues returning the content to the frontend without a 500 crash.

## 14. Validation Rules
- `validator.py` ensures the LLM output is not hallucinating prices or making unauthorized dosage claims. Failed validations replace the variant with a safe fallback and tag it with `validation_failure`.

## 15. Recommendation Engine Logic
- Rules-based scoring evaluating weather risk, inventory availability, and crop maturity to prioritize certain campaigns over others.

## 16. Content Generation Pipeline
- Cache Check -> LLM Invocation -> Content Validation -> Fingerprinting (Hash) -> DB Persistence -> Response.

## 17. Approval Workflow
- Approving a content variant explicitly changes its state to `approved` and unlocks the downstream Field Actions for the territory.

## 18. Analytics Structure
- Historical tracking of campaign lift, ROI, and field execution completion. 

## 19. Role-Based Dashboard Design
- Fully implemented as of Day-3.
- Lightweight role selector persisting to `localStorage` via `RoleContext`.
- Dashboard rendering adapts based on the selected role to show relevant KPIs, execution lists, alerts, and priorities.
- Supported roles: `Campaign Manager`, `Territory Manager`, `Field Representative`, `Retailer Support`.

## 20. Current Implemented Features
- Next.js Dashboard Scaffold
- Gemini Orchestration Pipeline
- Supabase Persistence Integration
- Fallback & Validation safety nets
- Backend Architecture & API Contracts
- Role-Aware Dashboard (Day-3)
- Confidence Visualization (Bars, Meters, Urgency Glow)
- Live Intelligence Feed (per-role event stream)
- Demo Scenario Cards (guided walkthrough per role)
- Workflow Timeline + State Badges
- Operational Alert Banners (with timestamps, dismiss, pulse)
- Explainability Badges (role-aware rationale)

## 21. Current Known Issues
- `REC_002` causes a Foreign Key violation in Supabase if persisted because the mock recommendation does not exist in the hosted DB. System currently handles this via graceful fallback.
- Python `google.generativeai` package deprecation warnings logged on startup (acceptable for hackathon).
- Hindi text templates display with encoding artifacts when viewed in certain terminals (renders correctly in browser).

## 22. Resolved Issues (Day-3)
- ✅ Frontend was previously running in `DEMO_MODE=true`, bypassing all backend calls. Fixed to `false`.
- ✅ Backend `config.py` was not loading `.env` file, causing Gemini provider to appear inactive. Fixed with `dotenv.load_dotenv()`.
- ✅ `UsersRound` import was dangling at bottom of `planner-client.tsx`. Fixed.

## 23. Day-1 Summary
- Scaffolded Next.js frontend with enterprise aesthetics and UI components.
- Scaffolded FastAPI backend structure and API contracts.

## 24. Day-2 Summary
- Integrated live Gemini LLM generation.
- Implemented Supabase operational persistence and cache logic.
- Hardened fallback architecture, added telemetry (generation source, fallback reason), and hash fingerprinting.
- Fixed 500 error crashes on DB constraint violations.

## 25. Day-3 Summary
- Implemented full role-aware dashboard system (centralized config, context, header selector).
- Built enterprise workflow realism components (WorkflowTimeline, WorkflowStateBadge, OperationalAlertBanner).
- Created confidence visualization hierarchy (ConfidenceBar, DeploymentConfidenceMeter, urgency glow/pulse).
- Added LiveIntelligenceStrip for per-role operational event feeds.
- Added DemoScenarioCard for structured demo storytelling.
- Connected frontend to live backend (was previously stuck in demo mode).
- Verified end-to-end API flow: Frontend → FastAPI → Supabase → Response.
- Enhanced ExplainabilityBadge with role-aware rationale pivoting.
- Added urgency-aware card borders to recommendation cards (green glow for high confidence, red for blocked).

## 26. Day-3 Final Polish
- Reconnected frontend to live backend (critical fix: `NEXT_PUBLIC_DEMO_MODE=false`).
- Added `dotenv` loading to `config.py` for reliable environment variable resolution.
- Enhanced AIRecommendationCard with DeploymentConfidenceMeter.
- Added ConfidenceBar gradients to MiniMetric components.
- Created LiveIntelligenceStrip with rolling per-role event feeds.
- Created DemoScenarioCard with contextual scenario walkthrough.
- Enhanced OperationalAlertBanner with timestamps, pulse dots, and dismiss behavior.
- Added urgency-aware border styling to both recommendation card components.

## 27. Live Verification Results (Day-3)
### Backend Verification
- ✅ Backend starts with `DATA_MODE: hybrid`, `Provider selected: gemini (Model: gemini-1.5-flash)`.
- ✅ Frontend makes real HTTP requests to backend (verified via Uvicorn access logs).
- ✅ API endpoints return 200: `/scenarios`, `/recommendations`, `/campaign-context`, `/field-actions`, `/analytics-summary`, `/content/generate`.
- ✅ Content generation for `PLAN_001/REC_001` returns cached Supabase content (previously Gemini-generated, no `template_fallback` flag).
- ✅ Content generation for unknown IDs (e.g., `PLAN_TEST_002`) correctly falls back to safe templates with `fallback_reason: provider_exception` (due to FK constraint).
- ✅ Fallback safety: All error paths return valid JSON with appropriate warnings, never a 500 crash.

### Frontend Verification
- ✅ Role selector visible in header, defaults to Campaign Manager.
- ✅ Role switching instantly transforms KPIs, alerts, sidebar, and action panels.
- ✅ Role persists in `localStorage` and survives page refresh.
- ✅ Deployment Confidence Meter renders with gradient bars and urgency indicators.
- ✅ Operational Alert Banner shows with timestamps and dismiss button.

### Persistence Verification
- ✅ Content variants persist in Supabase (confirmed via `generation_source: cache` on subsequent requests).
- ✅ Campaign contexts persist in Supabase.
- ✅ Recommendations persist in Supabase.
- ✅ FK constraint errors are gracefully caught and logged without UI disruption.

## 28. Dynamic vs Mock Status

| System | Status | Source | Notes |
|--------|--------|--------|-------|
| Role Switching | **REAL** | Client-side `localStorage` | Fully dynamic, persists across refresh |
| Recommendations API | **REAL** | Backend → Supabase hybrid | Returns live data from Supabase or demo fallback |
| Content Generation | **HYBRID** | Supabase cache → Gemini → template fallback | Cached Gemini output for demo IDs, template fallback for unknown IDs |
| Campaign Context | **REAL** | Backend → Supabase | Live operational data |
| Field Actions | **REAL** | Backend → Supabase hybrid | Returns live or demo data |
| Analytics | **REAL** | Backend → DuckDB/demo hybrid | Aggregated metrics |
| KPI Card Values | **REAL** | Backend `kpi_engine` | Dynamically computed KPIs based on role and workflow state |
| Operational Alerts | **REAL** | Backend `workflow_orchestrator` | Driven by real backend workflow constraints and priorities |
| Live Intelligence Feed | **REAL** | Backend `operational_events` | Periodic frontend polling of backend-generated events |
| Workflow Timeline | **REAL** | Backend `events` engine | Driven by orchestrator state progression |
| Demo Scenario Cards | **STATIC** | Per-role configuration | Guides demo storytelling |
| Workflow Bootstrap | **REAL** | `POST /workflow/start` | Creates runtime UUIDs for context/plan/content entities |

## 29. Remaining Known Weaknesses
- **Gemini template fallback missing localized text**: Hindi text templates display with encoding artifacts when viewed in certain terminals (renders correctly in browser).
- **No real authentication** — role switching is simulated via localStorage.
- **Supabase Free Tier limits** - Too many continuous demo flows could trigger database rate limiting.

## 30. Day-4 Summary (Runtime Transformation)
- Deployed `WorkflowOrchestrator` to remove all frontend dependency on hardcoded `PLAN_001` / `CTX_001`.
- Added hybrid propagation architecture (URL `?workflow=...` + localStorage recovery).
- Transformed static KPIs, timelines, and alert banners into backend-driven intelligence systems (`kpi_engine.py`, `operational_events.py`, `events.py`).
- Integrated `SystemHealthStrip` to dynamically display component health (Supabase, Gemini, Generation Source).
- Hardened `supabase.py` with `_ensure_context_exists` and `_ensure_recommendation_exists` to gracefully handle UUID cascade issues.
- Migrated `planner-client.tsx` to handle both dynamic operational context and graceful static fallbacks.
- Executive demo finalization.
- Pitch deck alignment.
- Consider populating KPI cards from real analytics data.
- Potentially add WebSocket for real-time intelligence feed.

## 31. Important Environment Variables
- `DATA_MODE=hybrid`
- `DEMO_CACHE_ENABLED=false`
- `NEXT_PUBLIC_DEMO_MODE=false` (CRITICAL: must be false for live backend connection)
- `SUPABASE_URL` & `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`
- `LLM_PROVIDER=gemini`

## 32. Demo Workflow
- Start at Planner → Review Recommendations → Generate Content → Approve → View Field Actions.
- Use role selector to switch between personas during demo.
- Each role has a DemoScenarioCard with guided steps.

## 33. Final Demo Flow

### Campaign Manager Flow
1. Start at `/planner` — observe Crop-stage activation banner
2. Review KPIs: Expected Lift, Approval Queue, Conversion Forecast
3. Click "Approve Campaign" → navigate to `/recommendations`
4. Inspect DeploymentConfidenceMeter (71%, Urgent, green glow)
5. Click "Draft advisory" → navigate to `/content-studio`
6. Review Hindi + English advisory variants
7. Approve content → navigate to `/field-actions`
8. See deployment queue and territory board

### Territory Manager Flow
1. Start at `/planner` — observe pest risk alert (amber)
2. Review KPIs: Territory Readiness 92%, 2 Blocked Campaigns
3. Navigate to `/field-actions` — see retailer coverage alerts
4. Assign field team to resolve stock blockers
5. Monitor Live Intelligence Feed for territory updates

### Field Representative Flow
1. Start at `/planner` — observe overdue visits alert (orange)
2. Review KPIs: 18 Assigned Actions, 12 Pending Visits
3. Navigate to `/content-studio` for approved talking points
4. Navigate to `/field-actions` for priority work queue
5. Mark visits complete

### Retailer Support Flow
1. Start at `/planner` — observe stockout escalation (red pulse)
2. Review KPIs: Stock Risk High, 4 Replenishment Urgencies
3. Navigate to `/field-actions` for retailer coverage alerts
4. Request Replenishment for affected stores

## 34. Operational Scenarios
To maximize storytelling, the system supports these predefined role scenarios:
- **Campaign Manager**: "Approve wheat fungicide awareness campaign during humidity surge."
- **Territory Manager**: "Resolve blocked Maharashtra cotton deployment due to retailer shortages."
- **Field Rep**: "Execute grower outreach in high-risk pest cluster."
- **Retailer Support**: "Respond to inventory escalation before deployment window closes."

## 35. Folder Structure
- `/backend`: FastAPI, logic, persistence.
- `/frontend`: Next.js app router, React components.
- `/supabase`: DB migrations.

## 36. Important Engineering Decisions
- **Telemetry in safety_flags**: Bypassed hosted schema lock by encoding telemetry fields in the existing `safety_flags` text array, decoding them on read.
- **Graceful Persistence Failure**: The API prioritizes returning content over hard-crashing if a DB write fails, ensuring demo continuity.
- **Centralized Role Config**: All role definitions live in `src/lib/config/roles.ts` — never scattered conditionals.
- **Client-Server Pattern**: Server components fetch data, client components handle role-aware rendering.

## 37. Known Architectural Constraints
- Lightweight Auth: No real RBAC, relying on simulated localStorage state for the demo.
- Read-only Schema: Cannot apply SQL migrations to the hosted DB easily, requiring creative workarounds.

## 38. Deployment Strategy
- Localhost execution for hackathon presentation (`npm run dev` & `python -m uvicorn`).

## 39. Demo Safety Strategy
- Hybrid cache ensures if Gemini rate limits, the UI instantly receives safe, formatted template data without visible disruption, explicitly tagged as "fallback".

## 40. Logging and Telemetry Strategy
- Root logger in `main.py` explicitly broadcasts LLM routing, cache hits/misses, and generated payload hashes to the Uvicorn console.

## 41. Role-Based UI Behavior & Configurations
The system employs a simulated Context (`RoleContext`) to dynamically alter the dashboard based on four core enterprise roles.

### Role Definitions & Responsibilities
- **Campaign Manager**: Focuses on planning context, priority queues, expected campaign lift, conversion forecasts, and content approvals.
- **Territory Manager**: Focuses on regional execution visibility, territory readiness, blocked campaigns, and field completion percentages.
- **Field Representative**: Focuses on personal task lists, priority growers, execution deadlines, and recommended talking points.
- **Retailer Support**: Focuses on stock risks, replenishment urgency, inventory blockers, and coverage gaps.

### Operational Adjustments per Role
- **KPI Prioritization**: Top metrics morph completely based on role priorities (e.g., Lift vs. Stock Risk).
- **Empty States**: Role-specific realism (e.g., "All priority retailers currently stocked" vs "No campaigns awaiting approval").
- **Explainability**: Recommendation rationales pivot depending on role (e.g., Territory Manager sees "weather trigger", Retailer Support sees "replenishment priority").
- **Action Panels**: Primary dashboard actions reflect the user's explicit job (Approve Campaign vs Assign Field Team vs Mark Visit Complete).

## 42. Current Progress Status
- **Day-1**: Scaffolded Core Frontend & Backend.
- **Day-2**: Hardened Gemini Orchestration & Supabase Persistence.
- **Day-3**: Implemented full Role-Aware Operational Dashboard, Confidence Visualization, Live Intelligence, Demo Flows, and connected frontend to live backend.

