"""Next-Best-Action Engine — determines recommended next action from workflow state."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def compute_next_action(role: str, workflow_state: dict | None = None) -> dict:
    """Determine the next recommended action based on workflow state and role."""
    state = workflow_state or {}
    recs = state.get("recommendations", [])
    variants = state.get("content_variants", [])
    blocked = [r for r in recs if r.get("blocked")]
    pending = [v for v in variants if v.get("approval_state") == "pending_review"]
    approved = [v for v in variants if v.get("approval_state") == "approved"]
    role_key = role.lower().replace(" ", "_")

    # Priority logic: blocked > pending approval > approved (ready to deploy) > generate
    if role_key == "campaign_manager":
        if pending:
            return _action(
                "Approve advisory content for deployment",
                f"{len(pending)} variant(s) awaiting agronomy review",
                "Campaign Manager", "high",
                pending[0].get("content_id")
            )
        if not variants and recs:
            return _action(
                "Generate advisory content",
                f"Top recommendation scored {recs[0].get('priority_score', 0)}/100",
                "Campaign Manager", "high",
                recs[0].get("recommendation_id")
            )
        if approved:
            return _action(
                "Deploy approved campaign to territory",
                f"{len(approved)} approved variant(s) ready for field deployment",
                "Campaign Manager", "medium"
            )
        return _action(
            "Review campaign recommendations",
            "New crop-stage activation window detected",
            "Campaign Manager", "medium"
        )

    if role_key == "territory_manager":
        if blocked:
            return _action(
                "Resolve blocked campaigns",
                f"{len(blocked)} campaign(s) blocked by stock guardrail",
                "Territory Manager", "high",
                blocked[0].get("recommendation_id")
            )
        return _action(
            "Assign field team to territory cluster",
            "Territory readiness check required",
            "Territory Manager", "medium"
        )

    if role_key == "field_representative":
        return _action(
            "Execute priority grower visits",
            "High-risk pest cluster requires immediate outreach",
            "Field Representative", "high"
        )

    if role_key == "retailer_support":
        if blocked:
            return _action(
                "Request replenishment dispatch",
                f"Stock shortfall blocking {len(blocked)} campaign(s)",
                "Retailer Support", "high"
            )
        return _action(
            "Monitor retailer inventory levels",
            "Routine coverage check recommended",
            "Retailer Support", "low"
        )

    return _action("Review dashboard", "Check operational status", role, "low")


def _action(action: str, reason: str, assigned_role: str, priority: str, target_id: str | None = None) -> dict:
    return {
        "action": action,
        "reason": reason,
        "assigned_role": assigned_role,
        "priority": priority,
        "target_entity_id": target_id,
    }
