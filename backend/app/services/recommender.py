"""Recommendation engine — rules-based scoring with stock guardrails.

Day 2 implementation:
  - Segment scoring: crop stage + weather + engagement + stock + language/device
  - Stock guardrail: blocks campaigns when inventory < threshold
  - Channel strategy builder
  - Falls back to demo cache when Supabase is unavailable
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models.contracts import CampaignContextRequest
from app.repositories import get_repository
from app.services.context_builder import (
    CROP_STAGE_MAP,
    GROWER_SUMMARY_MAP,
    INVENTORY_MAP,
    WEATHER_RISK_MAP,
)


# ---------------------------------------------------------------------------
# Recommendation Scoring Engine
# ---------------------------------------------------------------------------

class RecommendationEngine:
    """Rules-based recommendation scorer with stock guardrails."""

    def __init__(self, min_stock_cover_days: int = 10):
        self.min_stock_days = min_stock_cover_days

    def score_segment(self, context: dict) -> int:
        """Score a grower segment 0–100 based on multi-signal rules."""
        score = 0

        # Crop stage urgency (0–30 pts)
        crop_stage = context.get("crop_stage", {})
        days = crop_stage.get("days_to_stage", 99)
        if days <= 3:
            score += 30
        elif days <= 7:
            score += 20
        elif days <= 14:
            score += 10

        # Weather risk (0–25 pts)
        weather = context.get("weather_insights", [{}])
        risk_level = weather[0].get("risk_level", "low") if weather else "low"
        if risk_level == "high":
            score += 25
        elif risk_level == "medium":
            score += 15
        else:
            score += 5

        # Historical engagement proxy (0–20 pts)
        grower = context.get("grower_summary", {})
        smartphone_share = grower.get("smartphone_share", 0.50)
        if smartphone_share > 0.70:
            score += 20
        elif smartphone_share > 0.50:
            score += 12
        else:
            score += 5

        # Stock availability (0–15 pts)
        inventory = context.get("inventory_alerts", [{}])
        stock_days = inventory[0].get("stock_cover_days", 0) if inventory else 0
        if stock_days >= 14:
            score += 15
        elif stock_days >= 7:
            score += 8
        # else: 0 — do not push if stock is low

        # Language/device match (0–10 pts)
        if grower.get("primary_language"):
            score += 5
        if smartphone_share > 0.60:
            score += 5

        return min(score, 100)

    def is_blocked(self, context: dict) -> bool:
        """Check if campaign should be blocked due to low stock."""
        inventory = context.get("inventory_alerts", [])
        if not inventory:
            return False
        stock_days = inventory[0].get("stock_cover_days", 99)
        stock_status = inventory[0].get("stock_status", "healthy")
        return stock_days < self.min_stock_days or stock_status in ("low", "out_of_stock")

    def build_channel_strategy(self, context: dict, blocked: bool) -> list[dict]:
        """Build ranked channel strategy based on context."""
        if blocked:
            return [
                {"channel": "field_rep", "rank": 1, "reason": "Retailer replenishment required before grower campaign"},
                {"channel": "retailer", "rank": 2, "reason": "Retailer stock is launch blocker"},
            ]

        grower = context.get("grower_summary", {})
        smartphone_share = grower.get("smartphone_share", 0.50)
        strategies = []

        if smartphone_share > 0.60:
            strategies.append({"channel": "whatsapp", "rank": 1, "reason": "High smartphone share"})
            strategies.append({"channel": "field_rep", "rank": 2, "reason": "Trust-sensitive disease advisory"})
            strategies.append({"channel": "sms", "rank": 3, "reason": "Backup for low bandwidth"})
        else:
            strategies.append({"channel": "sms", "rank": 1, "reason": "Low smartphone share — SMS primary"})
            strategies.append({"channel": "ivr", "rank": 2, "reason": "Voice reach for keypad users"})
            strategies.append({"channel": "field_rep", "rank": 3, "reason": "Direct advisory delivery"})

        return strategies

    def build_reason_codes(self, context: dict, blocked: bool) -> list[str]:
        """Generate explainable reason codes."""
        reasons = []
        crop_stage = context.get("crop_stage", {})
        stage_name = crop_stage.get("stage", "unknown")
        days = crop_stage.get("days_to_stage", 99)

        if days <= 7:
            reasons.append(f"{stage_name.replace('_', ' ').title()} window detected")

        weather = context.get("weather_insights", [{}])
        if weather and weather[0].get("risk_level") in ("high", "medium"):
            reasons.append(weather[0].get("summary", "Weather risk detected")[:60])

        inventory = context.get("inventory_alerts", [{}])
        stock_days = inventory[0].get("stock_cover_days", 0) if inventory else 0
        if blocked:
            reasons.append(f"Stock cover only {stock_days} days")
            reasons.append("Sell-through outreach blocked")
            reasons.append("Rep replenishment action needed first")
        elif stock_days >= 14:
            reasons.append("Stock sufficiency above threshold")

        grower = context.get("grower_summary", {})
        lang = grower.get("primary_language", "Hindi")
        reasons.append(f"{lang} is primary grower language")

        return reasons


# ---------------------------------------------------------------------------
# Public API functions (called by routers via recommender service)
# ---------------------------------------------------------------------------

_engine = RecommendationEngine()


def build_campaign_context(request: CampaignContextRequest) -> dict:
    """Create campaign context — delegates to repository (demo or supabase)."""
    return get_repository().create_campaign_context(request)


def build_recommendations(context_id: str) -> dict:
    """Build recommendations — uses engine scoring when possible, falls back to demo cache."""
    repo = get_repository()

    # Get the base response from repository (demo cache or Supabase)
    response = repo.create_recommendations(context_id)

    # Re-score recommendations using the engine if we have context signals
    for rec in response.get("recommendations", []):
        # Build a mini-context from the recommendation data
        mini_context = _build_context_from_recommendation(rec, response)
        priority = _engine.score_segment(mini_context)
        blocked = _engine.is_blocked(mini_context)

        rec["priority_score"] = priority
        rec["blocked"] = blocked
        rec["channel_strategy"] = _engine.build_channel_strategy(mini_context, blocked)
        rec["reason_codes"] = _engine.build_reason_codes(mini_context, blocked)

        if blocked:
            rec["expected_impact"] = {
                "baseline_click_rate": rec.get("expected_impact", {}).get("baseline_click_rate", 0.05),
                "expected_click_rate": 0,
                "expected_leads": 0,
            }
            rec["timing"]["send_window"] = "Hold"
            rec["human_review_flags"] = ["stock_replenishment_required"]

    # Re-sort by priority score descending
    response["recommendations"] = sorted(
        response.get("recommendations", []),
        key=lambda r: r.get("priority_score", 0),
        reverse=True,
    )
    response["source_mode"] = "rules"

    return response


def _build_context_from_recommendation(rec: dict, response: dict) -> dict:
    """Construct a context dict from recommendation data for scoring."""
    crop = rec.get("crop", "wheat")
    product = rec.get("product", "")

    return {
        "crop_stage": CROP_STAGE_MAP.get(crop, {"stage": "unknown", "days_to_stage": 99, "confidence": 0.5}),
        "weather_insights": _get_weather_for_context(response.get("context_id", "")),
        "grower_summary": _get_grower_summary_for_context(response.get("context_id", "")),
        "inventory_alerts": INVENTORY_MAP.get(product, [{"product": product, "stock_status": "healthy", "stock_cover_days": 15, "affected_retailers": 3}]),
    }


def _get_weather_for_context(context_id: str) -> list[dict]:
    """Get weather insights based on context ID."""
    if context_id == "CTX_002":
        return WEATHER_RISK_MAP.get("Sikar", [])
    return WEATHER_RISK_MAP.get("Kanpur Nagar", [])


def _get_grower_summary_for_context(context_id: str) -> dict:
    """Get grower summary based on context ID."""
    if context_id == "CTX_002":
        return GROWER_SUMMARY_MAP.get("TER_021", {})
    return GROWER_SUMMARY_MAP.get("TER_001", {})
