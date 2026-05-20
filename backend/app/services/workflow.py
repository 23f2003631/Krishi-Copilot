"""Workflow Orchestrator — bootstraps the complete entity chain with runtime UUIDs.

This is the single most critical service in the runtime transformation.
It replaces all hardcoded PLAN_001/REC_001/CTX_001 dependencies with
genuine runtime entity creation.

Flow:
  1. Create campaign_context → real context_id
  2. Generate recommendations → real plan_id + recommendation_ids
  3. Generate content for top recommendation → real content_ids
  4. Build workflow events from the created entities
  5. Compute dynamic KPIs from workflow state
  6. Generate operational alerts
  7. Determine next-best-action
  8. Return complete WorkflowState
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from app.config import settings
from app.models.contracts import (
    CampaignContextRequest,
    ContentGenerationRequest,
    WorkflowStartRequest,
)
from app.repositories import get_repository
from app.services.content_generator import generate_content
from app.services.events import build_workflow_events
from app.services.kpi_engine import compute_kpis
from app.services.next_action import compute_next_action
from app.services.operational_events import generate_operational_alerts, generate_operational_events
from app.services.recommender import build_recommendations

logger = logging.getLogger(__name__)

# In-memory workflow store (best-effort — not a production event store)
_active_workflows: dict[str, dict] = {}


class WorkflowOrchestrator:
    """Bootstraps and manages complete workflow entity chains."""

    def start(self, request: WorkflowStartRequest) -> dict:
        """Bootstrap a full workflow chain with runtime-generated entities."""
        workflow_id = f"wf_{uuid.uuid4().hex[:12]}"
        logger.info("Starting workflow %s for role=%s, crop=%s", workflow_id, request.role, request.crop)

        warnings: list[str] = []

        # Step 1: Create campaign context
        context_request = CampaignContextRequest(
            scenario_id=request.scenario_id,
            crop=request.crop,
            product=request.product,
            objective=request.objective,
            week_start_date=request.week_start_date,
            geography=request.geography,
            audience=request.audience,
            channel_preferences=request.channel_preferences,
            constraints=request.constraints,
        )
        context = get_repository().create_campaign_context(context_request)
        context_id = context.get("context_id", f"CTX_{uuid.uuid4().hex[:6].upper()}")
        logger.info("Workflow %s: campaign_context created → %s", workflow_id, context_id)

        # Step 2: Generate recommendations linked to this context
        recommendations = build_recommendations(context_id)
        plan_id = recommendations.get("plan_id", f"PLAN_{uuid.uuid4().hex[:6].upper()}")
        rec_list = recommendations.get("recommendations", [])
        logger.info("Workflow %s: %d recommendations generated → plan_id=%s", workflow_id, len(rec_list), plan_id)

        # Step 3: Generate content for the top recommendation
        content = None
        content_variants = []
        if rec_list:
            top_rec = rec_list[0]
            try:
                content_request = ContentGenerationRequest(
                    plan_id=plan_id,
                    recommendation_id=top_rec["recommendation_id"],
                    languages=list(request.audience.languages) if request.audience.languages else ["Hindi"],
                    formats=["whatsapp", "sms", "rep_script"],
                )
                content = generate_content(content_request)
                content_variants = content.get("variants", [])
                logger.info("Workflow %s: %d content variants generated", workflow_id, len(content_variants))
            except Exception as exc:
                logger.warning("Workflow %s: content generation failed: %s", workflow_id, exc)
                warnings.append(f"Content generation failed: {exc}")

        # Step 4: Build workflow events
        events = build_workflow_events(workflow_id, context, recommendations, content, request.role)
        logger.info("Workflow %s: %d workflow events generated", workflow_id, len(events))

        # Step 5: Compute KPIs
        intermediate_state = {
            "recommendations": rec_list,
            "content_variants": content_variants,
            "events": events,
        }
        kpis = compute_kpis(request.role, intermediate_state)

        # Step 6: Generate alerts
        alerts = generate_operational_alerts(request.role, context, intermediate_state)

        # Step 7: Next-best-action
        next_action = compute_next_action(request.role, intermediate_state)

        # Step 8: System health
        system_health = self._build_system_health(content)

        # Assemble complete workflow state
        workflow_state = {
            "schema_version": "syngenta-copilot.v1",
            "request_id": f"req_{uuid.uuid4().hex[:8]}",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source_mode": recommendations.get("source_mode", "cached_demo"),
            "warnings": [*context.get("warnings", []), *warnings],
            "model_version": recommendations.get("model_version"),
            "trained_on": recommendations.get("trained_on"),
            "feature_version": recommendations.get("feature_version"),
            "data_last_updated": recommendations.get("data_last_updated"),
            "inventory_snapshot": recommendations.get("inventory_snapshot"),
            "model_last_trained": recommendations.get("model_last_trained"),
            "workflow_id": workflow_id,
            "plan_id": plan_id,
            "context_id": context_id,
            "status": "active",
            "context": context,
            "recommendations": rec_list,
            "content_variants": content_variants,
            "events": events,
            "kpis": kpis,
            "alerts": alerts,
            "next_action": next_action,
            "system_health": system_health,
            "executive_summary": recommendations.get("executive_summary"),
        }

        # Store in-memory for retrieval
        _active_workflows[workflow_id] = workflow_state
        # Also index by plan_id for backward compatibility
        _active_workflows[plan_id] = workflow_state
        logger.info("Workflow %s: complete. plan_id=%s, context_id=%s", workflow_id, plan_id, context_id)

        return workflow_state

    def get_state(self, workflow_id: str) -> dict | None:
        """Retrieve a workflow state by workflow_id or plan_id."""
        return _active_workflows.get(workflow_id)

    def get_events(self, workflow_id: str) -> list[dict]:
        """Get workflow events for a given workflow."""
        state = _active_workflows.get(workflow_id)
        if state:
            return state.get("events", [])
        return []

    def get_kpis(self, workflow_id: str, role: str) -> dict:
        """Get dynamic KPIs for a workflow + role."""
        state = _active_workflows.get(workflow_id)
        return compute_kpis(role, {
            "recommendations": state.get("recommendations", []) if state else [],
            "content_variants": state.get("content_variants", []) if state else [],
            "events": state.get("events", []) if state else [],
        })

    def get_operational_events(self, role: str, workflow_id: str | None = None) -> list[dict]:
        """Get operational events for a role, optionally scoped to a workflow."""
        state = _active_workflows.get(workflow_id) if workflow_id else None
        context = state.get("context") if state else None
        return generate_operational_events(role, context, state)

    def _build_system_health(self, content: dict | None = None) -> dict:
        """Build system health snapshot."""
        gemini_status = "active" if settings.llm_enabled else "disabled"
        supabase_status = "connected" if settings.supabase_enabled else "unavailable"
        last_source = "unknown"
        if content and content.get("variants"):
            last_source = content["variants"][0].get("generation_source", "unknown")

        return {
            "gemini": gemini_status,
            "supabase": supabase_status,
            "cache": "disabled" if not settings.demo_cache_enabled else "enabled",
            "data_mode": settings.data_mode,
            "active_workflows": len(set(v.get("workflow_id") for v in _active_workflows.values())),
            "last_generation_source": last_source,
        }


# Module-level singleton
_orchestrator = WorkflowOrchestrator()


def start_workflow(request: WorkflowStartRequest) -> dict:
    return _orchestrator.start(request)


def get_workflow_state(workflow_id: str) -> dict | None:
    return _orchestrator.get_state(workflow_id)


def get_workflow_events(workflow_id: str) -> list[dict]:
    return _orchestrator.get_events(workflow_id)


def get_workflow_kpis(workflow_id: str, role: str) -> dict:
    return _orchestrator.get_kpis(workflow_id, role)


def get_operational_events(role: str, workflow_id: str | None = None) -> list[dict]:
    return _orchestrator.get_operational_events(role, workflow_id)


def get_system_health() -> dict:
    return _orchestrator._build_system_health()
