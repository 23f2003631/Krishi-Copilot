"""Recommendation engine — ML and rules-based scoring with stock guardrails."""

from __future__ import annotations

import json
import os
import logging
import uuid
import time
from datetime import datetime, timezone

from app.config import settings
from app.models.contracts import CampaignContextRequest
from app.repositories import get_repository
from app.services.context_builder import (
    CROP_STAGE_MAP,
    GROWER_SUMMARY_MAP,
    INVENTORY_MAP,
    WEATHER_RISK_MAP,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Load Threshold Configs & Actionability Rules
# Try to load confidence thresholds and actionability rules from config files
try:
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
    from pipeline.configs import confidence_thresholds
    from pipeline.configs import actionability_rules
except Exception as e:
    logger.warning(f"Could not import config files. Using inline threshold/actionability fallbacks. Error: {e}")
    class confidence_thresholds:
        HIGH_CONFIDENCE = 0.40
        MEDIUM_CONFIDENCE = 0.25
        MIN_SEGMENT_SIZE = 30
        MIN_HISTORICAL_ENGAGEMENT = 0.05
        MIN_RETAILER_COVERAGE = 0.50
    class actionability_rules:
        @staticmethod
        def determine_actionability(blocked: bool, has_review_flags: bool, data_quality_warnings: list) -> str:
            if blocked:
                return "Blocked"
            if has_review_flags or len(data_quality_warnings) > 0:
                return "Needs Human Review"
            return "Ready to Execute"


def load_model_metadata() -> dict:
    """Load model metadata JSON from pipeline outputs with null-safe fallbacks."""
    paths_to_try = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../pipeline/models/model_metadata.json"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../pipeline/models/model_metadata.json"),
        "pipeline/models/model_metadata.json",
        "../pipeline/models/model_metadata.json"
    ]
    for path in paths_to_try:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to parse metadata file at {path}: {e}")
    
    logger.warning("model_metadata.json could not be loaded. Returning null-safe fallback metadata.")
    return {
        "model_version": "v1.0.0",
        "feature_version": "v3",
        "trained_on": "2025-10 to 2026-01",
        "data_last_updated": "2026-02-18T00:00:00Z",
        "inventory_snapshot": "2026-02-18T06:00:00Z",
        "model_last_trained": "2026-02-17T22:00:00Z"
    }


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


# Global registry to track which crop was requested for each context
_context_crop_map: dict[str, str] = {
    "CTX_001": "wheat",
    "CTX_002": "mustard",
    "CTX_SAMPLE": "wheat",
}

_engine = RecommendationEngine()


def build_campaign_context(request: CampaignContextRequest) -> dict:
    """Create campaign context — delegates to repository (demo or supabase)."""
    context = get_repository().create_campaign_context(request)
    context_id = context.get("context_id")
    if context_id:
        _context_crop_map[context_id] = request.crop
    return context


def build_recommendations(context_id: str) -> dict:
    """Build recommendations — scores segments dynamically, applies business logic and versions."""
    repo = get_repository()

    # Get the base recommendations from repository (demo cache or Supabase)
    response = repo.create_recommendations(context_id)

    # 1. LOG CACHE FALLBACK ACTIVATION (Change 14)
    raw_source = response.get("source_mode")
    if raw_source == "ml":
        logger.info("ML pipeline active: serving live model-based recommendations.")
        response["source_mode"] = "live_ml"
    else:
        reason = "Supabase database integration is disabled in configuration." if not settings.supabase_enabled else "Requested recommendations not found in database, falling back to cache."
        logger.warning(
            f"Cache Fallback Activated: serving cached recommendations. Reason: {reason}. Cache Source: recommendations.json"
        )
        response["source_mode"] = "cached_demo"

    # Ensure required envelope fields exist to pass Pydantic validation
    response.setdefault("request_id", f"req_{uuid.uuid4().hex[:8]}")
    response.setdefault("generated_at", datetime.now(timezone.utc).isoformat())

    # 2. INJECT MODEL METADATA DYNAMICALLY (Change 1 & 6)
    metadata = load_model_metadata()
    response["model_version"] = metadata.get("model_version", "unknown")
    response["trained_on"] = metadata.get("trained_on", "unknown")
    response["feature_version"] = metadata.get("feature_version", "unknown")
    response["data_last_updated"] = metadata.get("data_last_updated", "unknown")
    response["inventory_snapshot"] = metadata.get("inventory_snapshot", "unknown")
    response["model_last_trained"] = metadata.get("model_last_trained", "unknown")

    # Resolve the crop associated with this context
    context_crop = response.get("context", {}).get("crop")
    crop = _context_crop_map.get(context_id, context_crop or "wheat")
    context_data = response.get("context", {})
    geography_district = context_data.get("geography", {}).get("district", "Kanpur Nagar")

    # Filter recommendations for the active crop
    if "recommendations" in response:
        response["recommendations"] = [
            rec for rec in response["recommendations"]
            if rec.get("crop", "").lower() == crop.lower()
        ]

    # Ensure plan_id consistency
    plan_id = response.get("plan_id", f"PLAN_{uuid.uuid4().hex[:6].upper()}")
    response["plan_id"] = plan_id

    # 3. ENRICH RECOMMENDATIONS WITH OPERATIONAL LOGIC
    recs = response.get("recommendations", [])
    
    # Pre-score and build basic logic if source mode is rules
    if raw_source != "ml":
        for rec in recs:
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
                    "expected_click_rate": 0.0,
                    "expected_leads": 0,
                }
                rec["timing"]["send_window"] = "Hold"
                rec["human_review_flags"] = ["stock_replenishment_required"]

    # Compute additional operational fields for ALL recommendations (ML and rules)
    for rec in recs:
        rec["plan_id"] = plan_id
        blocked = rec.get("blocked", False)
        
        # Load associated context items to evaluate inventory status
        mini_context = _build_context_from_recommendation(rec, response)
        inventory = mini_context.get("inventory_alerts", [])
        stock_days = 99
        stock_status = "healthy"
        affected_retailers = 3
        if inventory:
            stock_days = inventory[0].get("stock_cover_days", 99)
            stock_status = inventory[0].get("stock_status", "healthy")
            affected_retailers = inventory[0].get("affected_retailers", 3)

        min_stock_days = response.get("context", {}).get("constraints", {}).get("min_stock_cover_days", 10)

        # 4. ACCUMULATE MULTIPLE BLOCK REASONS (Change 3)
        blocked_reasons = []
        if blocked or stock_status == "out_of_stock" or stock_days == 0:
            blocked_reasons.append("inventory unavailable")
        
        if 0 < stock_days < min_stock_days:
            blocked_reasons.append("stock below threshold")

        if affected_retailers == 0 and (stock_status in ("low", "out_of_stock") or stock_days < 7):
            blocked_reasons.append("no nearby active retailer inventory")

        # Define rep coverage ratio
        rep_coverage = rec.get("rep_coverage_score", 1.0)
        # Check if representation is low
        if rep_coverage < 0.3:
            blocked_reasons.append("insufficient operational readiness")

        if blocked and not blocked_reasons:
            blocked_reasons.append("inventory unavailable")

        rec["blocked_reasons"] = blocked_reasons

        # 5. DATA QUALITY WARNINGS WITH SEVERITY LEVELS (Change 8 & 9)
        dq_warnings = []
        target_count = rec.get("target_count", 0)
        if target_count < confidence_thresholds.MIN_SEGMENT_SIZE:
            dq_warnings.append({
                "message": "Sparse segment cohort size with low statistical support.",
                "severity": "medium"
            })

        receptivity = rec.setdefault("receptivity", {})
        open_prob = receptivity.get("open_probability", 0.35)
        click_prob = receptivity.get("click_probability", 0.05)

        if click_prob is not None and click_prob < confidence_thresholds.MIN_HISTORICAL_ENGAGEMENT:
            dq_warnings.append({
                "message": "Limited historical engagement history in this segment.",
                "severity": "high"
            })

        if rep_coverage < confidence_thresholds.MIN_RETAILER_COVERAGE:
            dq_warnings.append({
                "message": "Weak retailer and field representative coverage in target district.",
                "severity": "medium"
            })

        rec["data_quality_warnings"] = dq_warnings

        # 6. ACTIONABILITY STATUS (Change 4 & 6)
        has_review = len(rec.get("human_review_flags", [])) > 0
        rec["actionability_status"] = actionability_rules.determine_actionability(
            blocked=blocked,
            has_review_flags=has_review,
            data_quality_warnings=dq_warnings
        )

        # 7. CONFIDENCE LABELS NEED NUMERIC THRESHOLD CONFIGS (Change 2)
        if blocked or open_prob is None:
            confidence_label = "Low Confidence"
        else:
            if open_prob >= confidence_thresholds.HIGH_CONFIDENCE:
                confidence_label = "High Confidence"
            elif open_prob >= confidence_thresholds.MEDIUM_CONFIDENCE:
                confidence_label = "Medium Confidence"
            else:
                confidence_label = "Low Confidence"

            # Downgrade label if segment is tiny
            if target_count < confidence_thresholds.MIN_SEGMENT_SIZE:
                confidence_label = "Low Confidence"

        receptivity["confidence_label"] = confidence_label

        # 8. OPERATIONAL READINESS SCORE (Change 7)
        readiness = 1.0
        if blocked or stock_status == "out_of_stock" or stock_days == 0:
            readiness -= 0.70
        elif stock_status == "low" or stock_days < min_stock_days:
            readiness -= 0.40
        elif stock_status == "watch":
            readiness -= 0.15

        readiness -= (1.0 - rep_coverage) * 0.20

        if confidence_label == "Low Confidence":
            readiness -= 0.15
        elif confidence_label == "Medium Confidence":
            readiness -= 0.05

        readiness = max(0.0, min(1.0, readiness))
        rec["operational_readiness_score"] = round(readiness, 2)

    # 9. PRIORITY SORTING AND RANK (Change 5)
    # Sort recommendations by priority score, then by operational readiness
    recs = sorted(
        recs,
        key=lambda r: (r.get("priority_score", 0), r.get("operational_readiness_score", 0.0)),
        reverse=True
    )
    for idx, r in enumerate(recs):
        r["recommendation_priority_rank"] = idx + 1
    response["recommendations"] = recs

    # 10. SERVER-SIDE DETERMINISTIC EXECUTIVE SUMMARY (Change 3 & 7)
    total_target = sum(r.get("target_count", 0) for r in recs)
    avg_open = sum(r.get("receptivity", {}).get("open_probability", 0.0) or 0.0 for r in recs) / len(recs) if recs else 0.0
    avg_click = sum(r.get("receptivity", {}).get("click_probability", 0.0) or 0.0 for r in recs) / len(recs) if recs else 0.0
    total_leads = sum(r.get("expected_impact", {}).get("expected_leads", 0) for r in recs)
    
    # Calculate stock ready retailers count based on affected retailers in inventory alerts
    inventory_alerts = response.get("context", {}).get("inventory_alerts", [])
    affected = inventory_alerts[0].get("affected_retailers", 0) if inventory_alerts else 0
    stock_ready_retailers = max(0, 12 - affected)

    # Template-driven summary text based on status
    has_blocked = any(r.get("blocked", False) for r in recs)
    has_review = any(r.get("actionability_status") == "Needs Human Review" for r in recs)

    if not recs:
        summary_text = "No campaign opportunities available for current filters."
    elif has_blocked:
        summary_text = f"Needs Review: Some campaign segments for {crop.title()} are currently blocked due to low stock cover or limited retailer readiness in target territory. Top recommendations are pending stock replenishment."
    elif has_review:
        summary_text = f"Needs Review: Recommended targeting opportunity identified for {crop.title()} growers in {geography_district} with watch-status stock cover. Human review is recommended prior to launch."
    else:
        summary_text = f"Ready to Execute: Optimized campaign opportunity identified for {crop.title()} growers in {geography_district} with healthy inventory cover and high engagement likelihood."

    response["executive_summary"] = {
        "total_target_growers": total_target,
        "predicted_open_rate": round(avg_open, 3),
        "predicted_click_rate": round(avg_click, 3),
        "expected_leads": total_leads,
        "stock_ready_retailers": stock_ready_retailers,
        "summary_text": summary_text
    }

    return response


def _build_context_from_recommendation(rec: dict, response: dict) -> dict:
    """Construct a context dict from recommendation data for scoring."""
    crop = rec.get("crop", "wheat")
    product = rec.get("product", "")
    response_context = response.get("context", {}) or {}
    inventory_alerts = response_context.get("inventory_alerts")

    return {
        "crop_stage": response_context.get("crop_stage") or CROP_STAGE_MAP.get(crop, {"stage": "unknown", "days_to_stage": 99, "confidence": 0.5}),
        "weather_insights": _get_weather_for_context(response.get("context_id", "")),
        "grower_summary": _get_grower_summary_for_context(response.get("context_id", "")),
        "inventory_alerts": inventory_alerts or INVENTORY_MAP.get(product, [{"product": product, "stock_status": "healthy", "stock_cover_days": 15, "affected_retailers": 3}]),
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
