"""Operational Event Engine — polling-based operational intelligence generation.

Generates role-aware operational events derived from workflow context
and environmental signals. Uses seeded + derived strategy for realism.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)


def generate_operational_events(
    role: str,
    context: dict | None = None,
    workflow_state: dict | None = None,
) -> list[dict]:
    """Generate role-aware operational intelligence events.

    Combines context-derived signals (weather, inventory) with
    workflow-state-derived signals (approval delays, blocked campaigns).
    Timestamps are relative to now for realism.
    """
    now = datetime.now(timezone.utc)
    events = []
    state = workflow_state or {}
    ctx = context or {}
    role_key = role.lower().replace(" ", "_")

    # --- Context-derived events ---
    weather = ctx.get("weather_insights", [])
    if weather and weather[0].get("risk_level") in ("high", "medium"):
        events.append(_evt(
            f"Weather alert: {weather[0].get('summary', 'Risk detected')}",
            now - timedelta(minutes=8), "warning", role
        ))

    inventory = ctx.get("inventory_alerts", [])
    if inventory and inventory[0].get("stock_status") in ("low", "out_of_stock"):
        product = inventory[0].get("product", "Product")
        events.append(_evt(
            f"Critical: {product} stock below threshold — {inventory[0].get('stock_cover_days', 0)} days cover remaining",
            now - timedelta(minutes=3), "warning", role
        ))

    # --- Workflow-state-derived events ---
    recs = state.get("recommendations", [])
    variants = state.get("content_variants", [])
    blocked = [r for r in recs if r.get("blocked")]
    approved = [v for v in variants if v.get("approval_state") == "approved"]
    pending = [v for v in variants if v.get("approval_state") == "pending_review"]

    if approved:
        events.append(_evt(
            f"{len(approved)} advisory variant(s) approved and ready for deployment",
            now - timedelta(minutes=5), "success", role
        ))

    if pending:
        events.append(_evt(
            f"{len(pending)} content variant(s) awaiting agronomy review",
            now - timedelta(minutes=2), "info", role
        ))

    if blocked:
        events.append(_evt(
            f"{len(blocked)} campaign(s) blocked by stock guardrail — escalation required",
            now - timedelta(minutes=6), "warning", role
        ))

    # --- Role-specific seeded intelligence ---
    if role_key == "campaign_manager":
        events.extend([
            _evt("Kanpur Nagar cohort receptivity score updated: 78% → 82%", now - timedelta(minutes=11), "info", role),
            _evt("Rep brief exported for T023 territory cluster", now - timedelta(minutes=18), "info", role),
        ])
    elif role_key == "territory_manager":
        events.extend([
            _evt("2 reps dispatched to Kanpur wheat cluster", now - timedelta(minutes=14), "info", role),
            _evt("Field completion rate updated: 58% → 64%", now - timedelta(minutes=22), "success", role),
        ])
    elif role_key == "field_representative":
        events.extend([
            _evt("Visit completed: G-0987 — lead confirmed", now - timedelta(minutes=15), "success", role),
            _evt("Talking points updated for fungicide advisory", now - timedelta(minutes=20), "info", role),
            _evt("Weather clear for tomorrow's route — no delays expected", now - timedelta(minutes=30), "success", role),
        ])
    elif role_key == "retailer_support":
        events.extend([
            _evt("Replenishment dispatched to Kanpur Nagar cluster", now - timedelta(minutes=10), "success", role),
            _evt("RTL_0091 inventory audit passed — stock sufficient", now - timedelta(minutes=25), "success", role),
        ])

    # Sort by timestamp descending (most recent first)
    events.sort(key=lambda e: e["timestamp"], reverse=True)

    # Compute relative time strings
    for event in events:
        ts = datetime.fromisoformat(event["timestamp"])
        delta = now - ts
        minutes = int(delta.total_seconds() / 60)
        if minutes < 1:
            event["time"] = "just now"
        elif minutes < 60:
            event["time"] = f"{minutes}m ago"
        else:
            event["time"] = f"{minutes // 60}h ago"

    return events[:8]  # Cap at 8 events


def generate_operational_alerts(
    role: str,
    context: dict | None = None,
    workflow_state: dict | None = None,
) -> list[dict]:
    """Generate the primary operational alert for a role.

    Returns a list of 1-2 high-priority alerts based on context + workflow state.
    """
    now = datetime.now(timezone.utc)
    alerts = []
    ctx = context or {}
    state = workflow_state or {}
    role_key = role.lower().replace(" ", "_")
    recs = state.get("recommendations", [])
    blocked = [r for r in recs if r.get("blocked")]
    pending_count = sum(1 for v in state.get("content_variants", []) if v.get("approval_state") == "pending_review")

    if role_key == "campaign_manager":
        if pending_count:
            alerts.append(_evt(
                f"{pending_count} campaign(s) awaiting your approval for deployment.",
                now - timedelta(minutes=2), "info", role
            ))
        else:
            alerts.append(_evt(
                "3 campaigns are awaiting your approval for deployment tomorrow.",
                now - timedelta(minutes=2), "info", role
            ))

    elif role_key == "territory_manager":
        weather = ctx.get("weather_insights", [])
        if weather and weather[0].get("risk_level") == "high":
            alerts.append(_evt(
                f"High pest risk detected. {len(blocked)} campaign(s) blocked.",
                now - timedelta(minutes=8), "warning", role
            ))
        else:
            alerts.append(_evt(
                f"High pest risk detected in Maharashtra. {max(len(blocked), 2)} campaigns blocked.",
                now - timedelta(minutes=8), "warning", role
            ))

    elif role_key == "field_representative":
        overdue = max(18 - len(state.get("events", [])), 5)
        alerts.append(_evt(
            f"You have {overdue} high-priority grower visits overdue.",
            now - timedelta(minutes=5), "warning", role
        ))

    elif role_key == "retailer_support":
        inventory = ctx.get("inventory_alerts", [])
        if inventory and inventory[0].get("stock_status") in ("low", "out_of_stock"):
            product = inventory[0].get("product", "Tilt 250 EC")
            alerts.append(_evt(
                f"Critical stockout: {product} in Kanpur Nagar. Escalation required.",
                now - timedelta(minutes=1), "warning", role
            ))
        else:
            alerts.append(_evt(
                "Critical stockout: Tilt 250 EC in Kanpur Nagar. Escalation required.",
                now - timedelta(minutes=1), "warning", role
            ))

    # Compute relative time
    for alert in alerts:
        ts = datetime.fromisoformat(alert["timestamp"])
        delta = now - ts
        minutes = int(delta.total_seconds() / 60)
        alert["time"] = f"{minutes}m ago" if minutes < 60 else f"{minutes // 60}h ago"

    return alerts


def _evt(text: str, timestamp: datetime, event_type: str, role: str) -> dict:
    return {
        "event_id": f"oev_{uuid.uuid4().hex[:8]}",
        "text": text,
        "time": "",  # Computed after generation
        "timestamp": timestamp.isoformat(),
        "event_type": event_type,
        "role": role,
        "severity": "high" if event_type == "warning" else "low",
    }
