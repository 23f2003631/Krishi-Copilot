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
- **(Pending Day-3 Implementation)** 
- Lightweight role selector simulating sessions for `Campaign Manager`, `Territory Manager`, `Field Representative`, and `Retailer Support`.
- Dashboard rendering will adapt based on the selected role to show relevant KPIs, execution lists, and priorities.

## 20. Current Implemented Features
- Next.js Dashboard Scaffold
- Gemini Orchestration Pipeline
- Supabase Persistence Integration
- Fallback & Validation safety nets
- Backend Architecture & API Contracts

## 21. Current Known Issues
- `REC_002` causes a Foreign Key violation in Supabase if persisted because the mock recommendation does not exist in the hosted DB. System currently handles this via graceful fallback.
- Python `google.generativeai` package deprecation warnings logged on startup (acceptable for hackathon).

## 22. Current TODOs
- Implement Role-Based Dashboard UI.
- Enhance AI Explainability visuals (Reason Chips, Confidence Badges).
- Surface workflow states distinctly.
- Tailor Analytics to operational realism.

## 23. Day-1 Summary
- Scaffolded Next.js frontend with enterprise aesthetics and UI components.
- Scaffolded FastAPI backend structure and API contracts.

## 24. Day-2 Summary
- Integrated live Gemini LLM generation.
- Implemented Supabase operational persistence and cache logic.
- Hardened fallback architecture, added telemetry (generation source, fallback reason), and hash fingerprinting.
- Fixed 500 error crashes on DB constraint violations.

## 25. Day-3 Goals
- Implement a role-aware dashboard (UI changes per role).
- Build strong AI explainability components (confidence scores, reasoning).
- Visualize operational workflow states (Draft -> Approved -> Blocked).
- Ensure analytics feel realistic and territory-aware.

## 26. Day-3 Progress Notes
- *To be populated during Day-3 implementation.*

## 27. Future Day-4 Goals
- Executive demo finalization.
- Pitch deck alignment.

## 28. Important Environment Variables
- `DATA_MODE=hybrid`
- `DEMO_CACHE_ENABLED=false`
- `SUPABASE_URL` & `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`
- `LLM_PROVIDER=gemini`

## 29. Demo Workflow
- Start at Planner -> Review Recommendations -> Generate Content -> Approve -> View Field Actions.

## 30. Operational Scenarios
- High pest risk triggering immediate localized SMS content.
- Low inventory blocking a campaign promotion automatically.

## 31. Folder Structure
- `/backend`: FastAPI, logic, persistence.
- `/frontend`: Next.js app router, React components.
- `/supabase`: DB migrations.

## 32. Important Engineering Decisions
- **Telemetry in safety_flags**: Bypassed hosted schema lock by encoding telemetry fields in the existing `safety_flags` text array, decoding them on read.
- **Graceful Persistence Failure**: The API prioritizes returning content over hard-crashing if a DB write fails, ensuring demo continuity.

## 33. Known Architectural Constraints
- Lightweight Auth: No real RBAC, relying on simulated localStorage state for the demo.
- Read-only Schema: Cannot apply SQL migrations to the hosted DB easily, requiring creative workarounds.

## 34. Deployment Strategy
- Localhost execution for hackathon presentation (`npm run dev` & `python -m uvicorn`).

## 35. Demo Safety Strategy
- Hybrid cache ensures if Gemini rate limits, the UI instantly receives safe, formatted template data without visible disruption, explicitly tagged as "fallback".

## 36. Logging and Telemetry Strategy
- Root logger in `main.py` explicitly broadcasts LLM routing, cache hits/misses, and generated payload hashes to the Uvicorn console.

## 37. Role-Based UI Behavior & Configurations
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

## 38. Demo Scenarios
To maximize storytelling, the system supports these predefined role scenarios:
- **Campaign Manager**: "Approve wheat fungicide awareness campaign."
- **Territory Manager**: "Resolve blocked Maharashtra cotton campaign."
- **Field Rep**: "Complete grower outreach queue."
- **Retailer Support**: "Respond to low-stock escalation."

## 39. Current Progress Status
- **Day-1**: Scaffolded Core Frontend & Backend.
- **Day-2**: Hardened Gemini Orchestration & Supabase Persistence.
- **Day-3**: Executing robust Role-Aware Operational Dashboard implementation (Timeline, Alerts, Centralized Config).
