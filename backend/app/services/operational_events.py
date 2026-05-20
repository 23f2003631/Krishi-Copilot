"""Operational Event Engine - polling-based operational intelligence generation."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)


def generate_operational_events(
    role: str,
    context: dict | None = None,
    workflow_state: dict | None = None,
) -> list[dict]:
    """Generate role-aware operational intelligence from live workflow state."""
    now = datetime.now(timezone.utc)
    events: list[dict] = []
    state = workflow_state or {}
    ctx = context or {}
    role_key = role.lower().replace(" ", "_")

    weather = ctx.get("weather_insights", [])
    if weather and weather[0].get("risk_level") in ("high", "medium"):
        events.append(_evt(
            f"Weather alert: {weather[0].get('summary', 'Risk detected')}",
            now - timedelta(minutes=8),
            "warning",
            role,
        ))

    inventory = ctx.get("inventory_alerts", [])
    if inventory and inventory[0].get("stock_status") in ("low", "out_of_stock"):
        product = inventory[0].get("product", "Product")
        events.append(_evt(
            f"Stock guardrail active for {product}: {inventory[0].get('stock_cover_days', 0)} days cover remaining",
            now - timedelta(minutes=3),
            "warning",
            role,
        ))

    recs = state.get("recommendations", [])
    variants = state.get("content_variants", [])
    blocked = [r for r in recs if r.get("blocked")]
    approved = [v for v in variants if v.get("approval_state") == "approved"]
    pending = [v for v in variants if v.get("approval_state") == "pending_review"]

    if approved:
        events.append(_evt(
            f"{len(approved)} advisory variant(s) approved and ready for deployment",
            now - timedelta(minutes=5),
            "success",
            role,
        ))

    if pending:
        events.append(_evt(
            f"{len(pending)} content variant(s) awaiting agronomy review",
            now - timedelta(minutes=2),
            "info",
            role,
        ))

    if blocked:
        events.append(_evt(
            f"{len(blocked)} campaign segment(s) blocked by stock guardrail",
            now - timedelta(minutes=6),
            "warning",
            role,
        ))

    if recs:
        top = recs[0]
        if role_key in ("campaign_manager", "territory_manager"):
            events.append(_evt(
                f"Top segment {top.get('segment_label', 'current cohort')} scored {top.get('priority_score', 0)}/100 from processed features",
                now - timedelta(minutes=11),
                "info",
                role,
            ))
        elif role_key == "field_representative":
            events.append(_evt(
                f"{len(recs)} field action segment(s) ready after advisory approval",
                now - timedelta(minutes=12),
                "info",
                role,
            ))
        elif role_key == "retailer_support":
            events.append(_evt(
                f"Inventory gate checked for {top.get('product', 'active product')}",
                now - timedelta(minutes=12),
                "info",
                role,
            ))

    events.sort(key=lambda event: event["timestamp"], reverse=True)
    for event in events:
        event["time"] = _relative_time(now, event["timestamp"])
    return events[:8]


def generate_operational_alerts(
    role: str,
    context: dict | None = None,
    workflow_state: dict | None = None,
) -> list[dict]:
    """Generate primary alerts only when the workflow has a real alert condition."""
    now = datetime.now(timezone.utc)
    alerts: list[dict] = []
    ctx = context or {}
    state = workflow_state or {}
    role_key = role.lower().replace(" ", "_")
    recs = state.get("recommendations", [])
    blocked = [r for r in recs if r.get("blocked")]
    pending_count = sum(1 for v in state.get("content_variants", []) if v.get("approval_state") == "pending_review")

    if role_key == "campaign_manager" and pending_count:
        alerts.append(_evt(
            f"{pending_count} advisory variant(s) awaiting approval before field release.",
            now - timedelta(minutes=2),
            "info",
            role,
        ))

    elif role_key == "territory_manager":
        weather = ctx.get("weather_insights", [])
        if weather and weather[0].get("risk_level") == "high":
            alerts.append(_evt(
                f"High weather risk detected; {len(blocked)} segment(s) currently blocked.",
                now - timedelta(minutes=8),
                "warning",
                role,
            ))
        elif blocked:
            alerts.append(_evt(
                f"{len(blocked)} segment(s) blocked by current stock guardrail.",
                now - timedelta(minutes=8),
                "warning",
                role,
            ))

    elif role_key == "field_representative":
        high_priority = sum(1 for r in recs if r.get("timing", {}).get("urgency") == "high")
        if high_priority:
            alerts.append(_evt(
                f"{high_priority} high-priority grower segment(s) need field follow-up.",
                now - timedelta(minutes=5),
                "warning",
                role,
            ))

    elif role_key == "retailer_support":
        inventory = ctx.get("inventory_alerts", [])
        if inventory and inventory[0].get("stock_status") in ("low", "out_of_stock"):
            product = inventory[0].get("product", "Product")
            alerts.append(_evt(
                f"Stock guardrail active: {product} has {inventory[0].get('stock_cover_days', 0)} days cover.",
                now - timedelta(minutes=1),
                "warning",
                role,
            ))

    for alert in alerts:
        alert["time"] = _relative_time(now, alert["timestamp"])
    return alerts


def _relative_time(now: datetime, timestamp: str) -> str:
    ts = datetime.fromisoformat(timestamp)
    delta = now - ts
    minutes = int(delta.total_seconds() / 60)
    if minutes < 1:
        return "just now"
    if minutes < 60:
        return f"{minutes}m ago"
    return f"{minutes // 60}h ago"


def _evt(text: str, timestamp: datetime, event_type: str, role: str) -> dict:
    return {
        "event_id": f"oev_{uuid.uuid4().hex[:8]}",
        "text": text,
        "time": "",
        "timestamp": timestamp.isoformat(),
        "event_type": event_type,
        "role": role,
        "severity": "high" if event_type == "warning" else "low",
    }
