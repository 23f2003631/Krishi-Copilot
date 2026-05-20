"""KPI Engine — computes role-aware KPIs from workflow state.

Uses only the current workflow state and processed data-derived fields.
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def compute_kpis(role: str, workflow_state: dict | None = None) -> dict:
    """Compute role-aware KPIs from workflow state.

    Returns a KpiData-compatible dict with role and kpis list.
    """
    state = workflow_state or {}
    recs = state.get("recommendations", [])
    variants = state.get("content_variants", [])
    events = state.get("events", [])
    context = state.get("context") or {}

    # Derived counts
    total_recs = len(recs)
    blocked_recs = sum(1 for r in recs if r.get("blocked"))
    approved_variants = sum(1 for v in variants if v.get("approval_state") == "approved")
    pending_variants = sum(1 for v in variants if v.get("approval_state") == "pending_review")
    total_growers = sum(r.get("target_count", 0) for r in recs)
    top_score = max((r.get("priority_score", 0) for r in recs), default=0)
    expected_leads = sum(r.get("expected_impact", {}).get("expected_leads", 0) for r in recs)
    avg_readiness = round(sum(r.get("operational_readiness_score", 0.7) for r in recs) / len(recs) * 100) if recs else 0
    high_priority = sum(1 for r in recs if r.get("timing", {}).get("urgency") == "high")
    inventory = (context.get("inventory_alerts") or [{}])[0]
    stock_days = inventory.get("stock_cover_days", 0)
    stock_status = inventory.get("stock_status", "unknown")

    # Confidence average
    confidences = [r.get("receptivity", {}).get("confidence", 0) for r in recs if r.get("receptivity")]
    avg_confidence = round(sum(confidences) / len(confidences) * 100) if confidences else 0

    role_key = role.lower().replace(" ", "_")

    if role_key == "campaign_manager":
        baseline_leads = sum(r.get("target_count", 0) * r.get("expected_impact", {}).get("baseline_click_rate", 0) for r in recs)
        lift = 0 if not baseline_leads else ((expected_leads - baseline_leads) / baseline_leads) * 100
        return _build(role, [
            _kpi("Expected Campaign Lift", f"{lift:.1f}%", "vs broad baseline", "conversion rate", "success" if lift >= 0 else "warning"),
            _kpi("Approval Queue", str(pending_variants), "needs attention" if pending_variants else "clear", "pending approval", "warning" if pending_variants else "success"),
            _kpi("Conversion Forecast", f"{expected_leads:,}", f"{total_growers:,} target growers", "expected inquiries", "ai"),
            _kpi("Segment Reach", f"{avg_confidence}%", "model confidence", "segment support", "field"),
        ])

    if role_key == "territory_manager":
        return _build(role, [
            _kpi("Territory Readiness", f"{avg_readiness}%", "ready to deploy" if avg_readiness >= 80 else "attention needed", f"{len(recs) - blocked_recs} executable segments", "success" if avg_readiness >= 80 else "warning"),
            _kpi("Blocked Campaigns", str(blocked_recs), stock_status.replace("_", " "), "requires escalation" if blocked_recs else "all clear", "warning" if blocked_recs else "success"),
            _kpi("Retailer Coverage", f"{stock_days}d", "stock cover", inventory.get("product", "product"), "ai"),
            _kpi("Field Completion %", f"{min(100, max(0, len(events) * 12))}%", "workflow events complete", "rep completion proxy", "field"),
        ])

    if role_key == "field_representative":
        assigned = len(recs)
        return _build(role, [
            _kpi("Assigned Actions", str(assigned), "from current plan", "in queue", "field"),
            _kpi("Pending Visits", str(max(assigned - approved_variants, 0)), "requires approved script", "due this week", "warning" if pending_variants else "success"),
            _kpi("Priority Growers", f"{total_growers:,}", f"{high_priority} high risk segment(s)", "urgent visits", "ai"),
            _kpi("Execution Deadlines", "1 day" if high_priority else "2 days", "from send window", "on time", "success"),
        ])

    if role_key == "retailer_support":
        stock_risk = "High" if blocked_recs else "Moderate"
        return _build(role, [
            _kpi("Stock Risk", stock_risk, inventory.get("product", "product"), stock_status.replace("_", " "), "warning" if blocked_recs else "success"),
            _kpi("Replenishment Urgency", str(blocked_recs), "blocked segments", "needs dispatch" if blocked_recs else "no dispatch needed", "field"),
            _kpi("Inventory Blockers", str(blocked_recs), "blocked campaigns", "due to stock", "ai"),
            _kpi("Coverage Gaps", f"{inventory.get('affected_retailers', 0)}", "affected retailers", "from inventory snapshot", "warning" if inventory.get("affected_retailers", 0) else "success"),
        ])

    # Fallback
    return _build(role, [
        _kpi("Active Workflows", str(total_recs), "total", "recommendations", "ai"),
        _kpi("Content Generated", str(len(variants)), "variants", "ready", "field"),
    ])


def _kpi(label: str, value: str, trend: str, metadata: str, tone: str) -> dict:
    return {"label": label, "value": value, "trend": trend, "metadata": metadata, "tone": tone, "source": "computed"}


def _build(role: str, kpis: list[dict]) -> dict:
    return {"role": role, "kpis": kpis}
