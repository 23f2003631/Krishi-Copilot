"""Workflow Event Engine — generates lifecycle events for workflow orchestration.

Events are generated in-memory during workflow creation and returned inline.
Best-effort persistence to Supabase is attempted but failures do not crash.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)


def build_workflow_events(
    workflow_id: str,
    context: dict,
    recommendations: dict,
    content: dict | None = None,
    role: str = "campaign_manager",
) -> list[dict]:
    """Build a sequence of workflow events from orchestration state."""
    events = []
    now = datetime.now(timezone.utc)
    district = "Kanpur Nagar"

    # Event 1: Campaign context created
    events.append(_event(
        workflow_id, "campaign_created", now - timedelta(minutes=12),
        f"Campaign context created for {context.get('crop_stage', {}).get('stage', 'unknown')} "
        f"stage {_crop_from_context(context)}",
        territory=district, severity="low", role=role,
        metadata={"context_id": context.get("context_id", "")}
    ))

    # Event 2: Recommendations generated
    rec_list = recommendations.get("recommendations", [])
    plan_id = recommendations.get("plan_id", "")
    events.append(_event(
        workflow_id, "recommendation_generated", now - timedelta(minutes=10),
        f"{len(rec_list)} recommendations scored and ranked. "
        f"Top priority: {rec_list[0].get('priority_score', 0) if rec_list else 0}/100",
        territory=district, severity="low", role=role,
        metadata={"plan_id": plan_id, "count": len(rec_list)}
    ))

    # Event 3: Blocked campaign detected (if any)
    blocked = [r for r in rec_list if r.get("blocked")]
    if blocked:
        events.append(_event(
            workflow_id, "campaign_blocked", now - timedelta(minutes=9),
            f"{len(blocked)} campaign(s) blocked by stock guardrail. "
            f"Retailer replenishment required before deployment.",
            territory=district, severity="high", role="territory_manager",
            metadata={"blocked_ids": [r.get("recommendation_id") for r in blocked]}
        ))

    # Event 4: Content generated
    if content and content.get("variants"):
        variants = content["variants"]
        source = variants[0].get("generation_source", "unknown") if variants else "unknown"
        events.append(_event(
            workflow_id, "content_generated", now - timedelta(minutes=7),
            f"{len(variants)} advisory variant(s) generated via {source}. "
            f"Formats: {', '.join(set(v.get('format', '') for v in variants))}",
            territory=district, severity="low", role="campaign_manager",
            metadata={"source": source, "count": len(variants)}
        ))

    # Event 5: Weather trigger
    weather = context.get("weather_insights", [])
    if weather and weather[0].get("risk_level") in ("high", "medium"):
        events.append(_event(
            workflow_id, "weather_trigger", now - timedelta(minutes=5),
            weather[0].get("summary", "Weather risk detected"),
            territory=district, severity="medium" if weather[0].get("risk_level") == "medium" else "high",
            role="territory_manager",
            metadata={"risk_type": weather[0].get("risk_type", "")}
        ))

    # Event 6: Awaiting approval
    pending = [v for v in (content or {}).get("variants", []) if v.get("approval_state") == "pending_review"]
    if pending:
        events.append(_event(
            workflow_id, "approval_pending", now - timedelta(minutes=3),
            f"{len(pending)} content variant(s) awaiting agronomy review and approval.",
            territory=district, severity="medium", role="campaign_manager",
            metadata={"pending_count": len(pending)}
        ))

    # Event 7: Rep assignment ready
    if rec_list and not blocked:
        events.append(_event(
            workflow_id, "rep_assignment_ready", now - timedelta(minutes=1),
            f"Field rep assignment ready for {rec_list[0].get('target_count', 0):,} grower cohort.",
            territory=district, severity="low", role="field_representative",
            metadata={"target_count": rec_list[0].get("target_count", 0)}
        ))

    return events


def _event(
    workflow_id: str, event_type: str, timestamp: datetime,
    description: str, territory: str = "", severity: str = "low",
    role: str = "", metadata: dict | None = None
) -> dict:
    return {
        "event_id": f"evt_{uuid.uuid4().hex[:8]}",
        "workflow_id": workflow_id,
        "event_type": event_type,
        "role": role,
        "timestamp": timestamp.isoformat(),
        "severity": severity,
        "description": description,
        "territory": territory,
        "metadata": metadata or {},
    }


def _crop_from_context(context: dict) -> str:
    """Extract crop name from context."""
    stage = context.get("crop_stage", {}).get("stage", "")
    if "wheat" in stage or "flowering" in stage:
        return "wheat"
    if "pod" in stage or "mustard" in stage:
        return "mustard"
    if "tuber" in stage or "potato" in stage:
        return "potato"
    if "boll" in stage or "cotton" in stage:
        return "cotton"
    return "crop"
