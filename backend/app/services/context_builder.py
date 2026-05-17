"""Campaign context builder — enriches planner input with crop stage, weather, stock, engagement signals."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

# Crop stage lookup (mock-first, replace with DuckDB on Day 3)
CROP_STAGE_MAP: dict[str, dict] = {
    "wheat": {"stage": "flowering", "days_to_stage": 3, "confidence": 0.82},
    "mustard": {"stage": "pod_formation", "days_to_stage": 2, "confidence": 0.78},
    "potato": {"stage": "tuber_bulking", "days_to_stage": 5, "confidence": 0.75},
    "chickpea": {"stage": "pod_formation", "days_to_stage": 4, "confidence": 0.80},
    "cotton": {"stage": "boll_opening", "days_to_stage": 7, "confidence": 0.72},
    "rice": {"stage": "grain_filling", "days_to_stage": 6, "confidence": 0.74},
}

# Weather risk lookup by district (mock-first)
WEATHER_RISK_MAP: dict[str, list[dict]] = {
    "Kanpur Nagar": [{"risk_type": "humidity_rainfall", "risk_level": "high", "summary": "Humidity and light rainfall raise crop-stage disease advisory priority.", "confidence": 0.76}],
    "Sikar": [{"risk_type": "pest_disease_window", "risk_level": "medium", "summary": "Mustard advisory window is active, but grower outreach should wait for stock recovery.", "confidence": 0.72}],
    "Hooghly": [{"risk_type": "cool_humid", "risk_level": "medium", "summary": "Cool humid conditions favour late blight in potato. Preventive spray window is open.", "confidence": 0.70}],
    "Ratlam": [{"risk_type": "dry_spell", "risk_level": "low", "summary": "Dry conditions stable. Pod formation on track.", "confidence": 0.68}],
    "Yavatmal": [{"risk_type": "pest_outbreak", "risk_level": "high", "summary": "Bollworm pressure reported in adjacent districts. Early alert advisory recommended.", "confidence": 0.74}],
}

# Product-inventory lookup (mock-first, replace with Supabase reads on Day 2)
INVENTORY_MAP: dict[str, list[dict]] = {
    "Tilt 250 EC": [{"product": "Tilt 250 EC", "stock_status": "healthy", "stock_cover_days": 18, "affected_retailers": 6}],
    "Score 250 EC": [{"product": "Score 250 EC", "stock_status": "low", "stock_cover_days": 4, "affected_retailers": 5}],
    "Kavach 75 WP": [{"product": "Kavach 75 WP", "stock_status": "watch", "stock_cover_days": 11, "affected_retailers": 4}],
    "Actara 25 WG": [{"product": "Actara 25 WG", "stock_status": "healthy", "stock_cover_days": 21, "affected_retailers": 3}],
    "Alika": [{"product": "Alika", "stock_status": "watch", "stock_cover_days": 10, "affected_retailers": 3}],
}

# Grower summary by territory (mock-first)
GROWER_SUMMARY_MAP: dict[str, dict] = {
    "TER_001": {"estimated_growers": 1180, "smartphone_share": 0.74, "keypad_share": 0.18, "primary_language": "Hindi"},
    "TER_021": {"estimated_growers": 980, "smartphone_share": 0.69, "keypad_share": 0.22, "primary_language": "Hindi"},
    "TER_031": {"estimated_growers": 850, "smartphone_share": 0.65, "keypad_share": 0.25, "primary_language": "Bengali"},
    "TER_041": {"estimated_growers": 720, "smartphone_share": 0.71, "keypad_share": 0.20, "primary_language": "Hindi"},
    "TER_051": {"estimated_growers": 1050, "smartphone_share": 0.68, "keypad_share": 0.23, "primary_language": "Marathi"},
}


def build_context_from_request(request_dict: dict) -> dict:
    """Enrich a campaign context request with crop stage, weather, stock, and grower signals."""
    crop = request_dict.get("crop", "wheat")
    product = request_dict.get("product")
    district = request_dict.get("geography", {}).get("district", "Kanpur Nagar") if isinstance(request_dict.get("geography"), dict) else request_dict.get("district", "Kanpur Nagar")
    territory_id = request_dict.get("geography", {}).get("territory_id", "TER_001") if isinstance(request_dict.get("geography"), dict) else request_dict.get("territory_id", "TER_001")

    crop_stage = CROP_STAGE_MAP.get(crop, CROP_STAGE_MAP["wheat"])
    weather = WEATHER_RISK_MAP.get(district, [{"risk_type": "general", "risk_level": "low", "summary": "No significant weather risk detected.", "confidence": 0.60}])

    inventory = INVENTORY_MAP.get(product, [{"product": product or "Unknown", "stock_status": "healthy", "stock_cover_days": 15, "affected_retailers": 3}]) if product else [{"product": "General", "stock_status": "healthy", "stock_cover_days": 15, "affected_retailers": 3}]

    grower_summary = GROWER_SUMMARY_MAP.get(territory_id, {"estimated_growers": 500, "smartphone_share": 0.70, "keypad_share": 0.20, "primary_language": "Hindi"})

    context_id = f"CTX_{uuid.uuid4().hex[:6].upper()}"

    return {
        "schema_version": "syngenta-copilot.v1",
        "request_id": f"req_{uuid.uuid4().hex[:8]}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_mode": "rules",
        "warnings": [],
        "context_id": context_id,
        "crop_stage": crop_stage,
        "grower_summary": grower_summary,
        "weather_insights": weather,
        "inventory_alerts": inventory,
    }
