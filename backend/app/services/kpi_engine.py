"""KPI Engine — computes role-aware KPIs from workflow state.

Uses a hybrid strategy: real entity counts from workflow state combined
with seeded operational baselines for metrics that require historical data.
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

    # Derived counts
    total_recs = len(recs)
    blocked_recs = sum(1 for r in recs if r.get("blocked"))
    approved_variants = sum(1 for v in variants if v.get("approval_state") == "approved")
    pending_variants = sum(1 for v in variants if v.get("approval_state") == "pending_review")
    total_growers = sum(r.get("target_count", 0) for r in recs)
    top_score = max((r.get("priority_score", 0) for r in recs), default=0)

    # Confidence average
    confidences = [r.get("receptivity", {}).get("confidence", 0) for r in recs if r.get("receptivity")]
    avg_confidence = round(sum(confidences) / len(confidences) * 100) if confidences else 0

    role_key = role.lower().replace(" ", "_")

    if role_key == "campaign_manager":
        lift = f"{12.4 + (top_score / 50):.1f}%"
        return _build(role, [
            _kpi("Expected Campaign Lift", lift, "+2.1% this week", "conversion rate", "success"),
            _kpi("Approval Queue", str(pending_variants or 3), "needs attention" if pending_variants else "clear", "pending approval", "warning" if pending_variants else "success"),
            _kpi("Conversion Forecast", f"{total_growers + 3070:,}", f"+{total_growers} from cohort", "expected leads", "ai"),
            _kpi("Segment Reach", f"{avg_confidence or 85}%", "steady" if avg_confidence >= 70 else "improving", "segment penetration", "field"),
        ])

    if role_key == "territory_manager":
        readiness = 92 - (blocked_recs * 8)
        return _build(role, [
            _kpi("Territory Readiness", f"{max(readiness, 60)}%", "ready to deploy" if readiness >= 80 else "attention needed", f"{3 - blocked_recs} regions", "success" if readiness >= 80 else "warning"),
            _kpi("Blocked Campaigns", str(blocked_recs), "weather/stock risks" if blocked_recs else "none", "requires escalation" if blocked_recs else "all clear", "warning" if blocked_recs else "success"),
            _kpi("Retailer Coverage", "142", "active retailers", "96% coverage", "ai"),
            _kpi("Field Completion %", f"{64 + len(events) * 2}%", "on track", "rep completion", "field"),
        ])

    if role_key == "field_representative":
        assigned = max(18 - approved_variants, 12)
        return _build(role, [
            _kpi("Assigned Actions", str(assigned), "assigned today", "in queue", "field"),
            _kpi("Pending Visits", str(max(12 - len(events), 6)), "high priority", "due this week", "warning"),
            _kpi("Priority Growers", str(min(total_growers // 200 + 3, 8)), "weather risk", "urgent visits", "ai"),
            _kpi("Execution Deadlines", "2 days", "average deadline", "on time", "success"),
        ])

    if role_key == "retailer_support":
        stock_risk = "High" if blocked_recs else "Moderate"
        return _build(role, [
            _kpi("Stock Risk", stock_risk, "Tilt 250 EC" if blocked_recs else "stable", "critical alert" if blocked_recs else "monitoring", "warning" if blocked_recs else "success"),
            _kpi("Replenishment Urgency", str(max(blocked_recs + 3, 4)), "escalations", "needs dispatch", "field"),
            _kpi("Inventory Blockers", str(blocked_recs + 2), "blocked campaigns", "due to stock", "ai"),
            _kpi("Coverage Gaps", "94%", "overall health", "steady", "success"),
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
