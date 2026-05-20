from __future__ import annotations

import csv
import json
import math
import os
import pickle
import uuid
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any

import pandas as pd

from app.models.contracts import CampaignContextRequest, ContentApprovalRequest, ContentGenerationRequest

os.environ.setdefault("LOKY_MAX_CPU_COUNT", "4")

ROOT_DIR = Path(__file__).resolve().parents[3]
PROCESSED_DIR = ROOT_DIR / "pipeline" / "processed"
FEATURE_DIR = ROOT_DIR / "pipeline" / "features"
MODEL_DIR = ROOT_DIR / "pipeline" / "models"
EXPORT_DIR = ROOT_DIR / "backend" / "exports"

CROP_PRODUCT_MAP = {
    "wheat": "Tilt 250 EC",
    "mustard": "Score 250 EC",
    "chickpea": "Actara 25 WG",
    "potato": "Kavach 75 WP",
    "barley": "Tilt 250 EC",
    "lentil": "Tilt 250 EC",
    "safflower": "Score 250 EC",
    "cumin": "Amistar 250 SC",
    "maize": "Actara 25 WG",
    "unknown": "Tilt 250 EC",
}

SUPPORTED_CROPS = {"wheat", "mustard", "chickpea", "potato"}
RISK_ORDER = {"low": 0, "medium": 1, "high": 2}

_CONTEXT_STORE: dict[str, dict[str, Any]] = {}
_PLAN_STORE: dict[str, dict[str, Any]] = {}
_CONTENT_STORE: dict[str, dict[str, Any]] = {}
_LAST_PLAN_ID: str | None = None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _request_id() -> str:
    return f"req_{uuid.uuid4().hex[:8]}"


def _read_csv(path: Path, parse_dates: list[str] | None = None) -> pd.DataFrame:
    if not path.exists():
        return pd.DataFrame()
    return pd.read_csv(path, parse_dates=parse_dates or [])


@lru_cache(maxsize=1)
def _segmented() -> pd.DataFrame:
    df = _read_csv(FEATURE_DIR / "segmented_growers.csv")
    if df.empty:
        return df
    for col in ["crop", "state", "district", "tehsil", "language", "device_type", "segment_label", "current_crop_stage"]:
        if col in df.columns:
            df[col] = df[col].fillna("unknown").astype(str)
    if "relevant_product" in df.columns:
        df["relevant_product"] = df["relevant_product"].fillna("Tilt 250 EC").astype(str)
    return df


@lru_cache(maxsize=1)
def _leakage_features() -> pd.DataFrame:
    df = _read_csv(FEATURE_DIR / "leakage_safe_features.csv", parse_dates=["send_date"])
    if df.empty:
        return df
    return df


@lru_cache(maxsize=1)
def _funnel() -> pd.DataFrame:
    return _read_csv(PROCESSED_DIR / "funnel_clean.csv", parse_dates=["week_start_date"])


@lru_cache(maxsize=1)
def _retailers() -> pd.DataFrame:
    return _read_csv(PROCESSED_DIR / "retailers_clean.csv")


@lru_cache(maxsize=1)
def _inventory() -> pd.DataFrame:
    return _read_csv(PROCESSED_DIR / "inventory_clean.csv", parse_dates=["week_end_date"])


@lru_cache(maxsize=1)
def _pos() -> pd.DataFrame:
    return _read_csv(PROCESSED_DIR / "pos_clean.csv", parse_dates=["transaction_date"])


@lru_cache(maxsize=1)
def _visits() -> pd.DataFrame:
    return _read_csv(PROCESSED_DIR / "visits_clean.csv", parse_dates=["visit_date"])


@lru_cache(maxsize=1)
def _reps() -> pd.DataFrame:
    return _read_csv(PROCESSED_DIR / "reps_clean.csv")


@lru_cache(maxsize=1)
def _model_bundle() -> dict[str, Any]:
    bundle: dict[str, Any] = {"open": None, "click": None, "feature_cols": [], "metadata": {}}
    try:
        with (MODEL_DIR / "model_open.pkl").open("rb") as fh:
            bundle["open"] = pickle.load(fh)
        with (MODEL_DIR / "model_click.pkl").open("rb") as fh:
            bundle["click"] = pickle.load(fh)
        with (MODEL_DIR / "feature_cols.pkl").open("rb") as fh:
            bundle["feature_cols"] = pickle.load(fh)
    except Exception:
        bundle["open"] = None
        bundle["click"] = None
        bundle["feature_cols"] = []

    metadata_path = MODEL_DIR / "model_metadata.json"
    if metadata_path.exists():
        try:
            bundle["metadata"] = json.loads(metadata_path.read_text(encoding="utf-8"))
        except Exception:
            bundle["metadata"] = {}
    return bundle


@lru_cache(maxsize=1)
def _shap_reasons() -> dict[str, list[str]]:
    path = FEATURE_DIR / "segment_shap_reasons.json"
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        if pd.isna(value):
            return default
        return int(round(float(value)))
    except Exception:
        return default


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if pd.isna(value):
            return default
        return float(value)
    except Exception:
        return default


def _mode(values: pd.Series, default: str = "unknown") -> str:
    cleaned = [str(v) for v in values.dropna().tolist() if str(v).strip() and str(v) != "nan"]
    if not cleaned:
        return default
    return Counter(cleaned).most_common(1)[0][0]


def _risk_from_weather(rows: pd.DataFrame) -> dict[str, Any]:
    if rows.empty or "weather_risk_level" not in rows.columns:
        return {
            "risk_type": "local_agronomic_window",
            "risk_level": "low",
            "summary": "No district-level weather escalation is active for this campaign window.",
            "confidence": 0.62,
        }
    risk = _mode(rows["weather_risk_level"], "low").lower()
    if risk not in RISK_ORDER:
        risk = "low"
    advisory = _mode(rows.get("weather_advisory", pd.Series(dtype=str)), "")
    if not advisory or advisory == "unknown":
        advisory = f"{risk.title()} local crop-weather risk detected from processed district weather features."
    confidence = 0.62 + min(0.3, _safe_float(rows.get("weather_risk_score", pd.Series([0])).mean(), 0) * 0.2)
    return {
        "risk_type": "processed_weather_signal",
        "risk_level": risk,
        "summary": advisory,
        "confidence": round(min(confidence, 0.92), 2),
    }


def _stage_from_rows(rows: pd.DataFrame) -> dict[str, Any]:
    if rows.empty:
        return {"stage": "unknown", "days_to_stage": 14, "confidence": 0.5}
    stage = _mode(rows.get("current_crop_stage", pd.Series(dtype=str)), "unknown")
    if stage == "unknown":
        stage = "flowering_approaching"

    stage_days_col = "days_to_flowering"
    if "tillering" in stage:
        stage_days_col = "days_to_tillering"
    elif "harvest" in stage:
        stage_days_col = "days_to_harvest"

    days_series = pd.to_numeric(rows.get(stage_days_col, pd.Series(dtype=float)), errors="coerce").dropna().abs()
    days = _safe_int(days_series.median() if not days_series.empty else 7, 7)
    known_share = (rows.get("current_crop_stage", pd.Series(dtype=str)).astype(str) != "unknown").mean()
    return {"stage": stage, "days_to_stage": max(0, min(days, 45)), "confidence": round(max(0.55, min(0.92, known_share)), 2)}


def _filter_rows(crop: str, geography: dict[str, Any] | None = None, language: str | None = None, device: str | None = None) -> pd.DataFrame:
    df = _segmented()
    if df.empty:
        return df
    rows = df[df["crop"].str.lower() == crop.lower()]
    geography = geography or {}
    if geography.get("state"):
        by_state = rows[rows["state"].str.lower() == str(geography["state"]).lower()]
        if not by_state.empty:
            rows = by_state
    if geography.get("district"):
        by_district = rows[rows["district"].str.lower() == str(geography["district"]).lower()]
        if not by_district.empty:
            rows = by_district
    if geography.get("tehsil"):
        by_tehsil = rows[rows["tehsil"].str.lower() == str(geography["tehsil"]).lower()]
        if not by_tehsil.empty:
            rows = by_tehsil
    if language:
        by_lang = rows[rows["language"].str.lower() == language.lower()]
        if not by_lang.empty:
            rows = by_lang
    if device:
        by_device = rows[rows["device_type"].str.lower() == device.lower()]
        if not by_device.empty:
            rows = by_device
    if rows.empty:
        rows = df[df["crop"].str.lower() == crop.lower()]
    return rows


def _inventory_alert(product: str, geography: dict[str, Any] | None, rows: pd.DataFrame) -> dict[str, Any]:
    retailers = _retailers()
    inventory = _inventory()
    pos = _pos()
    geo = geography or {}

    scoped_retailers = retailers
    if not retailers.empty:
        if geo.get("state"):
            match = scoped_retailers[scoped_retailers["state"].astype(str).str.lower() == str(geo["state"]).lower()]
            if not match.empty:
                scoped_retailers = match
        if geo.get("district"):
            match = scoped_retailers[scoped_retailers["district"].astype(str).str.lower() == str(geo["district"]).lower()]
            if not match.empty:
                scoped_retailers = match
        if geo.get("tehsil"):
            match = scoped_retailers[scoped_retailers["tehsil"].astype(str).str.lower() == str(geo["tehsil"]).lower()]
            if not match.empty:
                scoped_retailers = match

    retailer_ids = set(scoped_retailers.get("retailer_id", pd.Series(dtype=str)).astype(str).tolist())
    total_retailers = len(retailer_ids) or _safe_int(rows.get("total_retailers", pd.Series([0])).max(), 0) or 1

    stock_cover_days = None
    active_retailers = None
    if not inventory.empty and product:
        inv = inventory[inventory["sku_name"].astype(str).str.lower() == product.lower()]
        if retailer_ids:
            inv = inv[inv["retailer_id"].astype(str).isin(retailer_ids)]
        if not inv.empty:
            latest_week = inv["week_end_date"].max()
            latest = inv[inv["week_end_date"] == latest_week]
            stock_qty = float(pd.to_numeric(latest["sku_qty"], errors="coerce").fillna(0).sum())
            active_retailers = int(latest[pd.to_numeric(latest["sku_qty"], errors="coerce").fillna(0) > 0]["retailer_id"].nunique())

            daily_sales = 0.0
            if not pos.empty:
                recent = pos[pos["sku_name"].astype(str).str.lower() == product.lower()]
                if retailer_ids:
                    recent = recent[recent["retailer_id"].astype(str).isin(retailer_ids)]
                if not recent.empty:
                    max_date = recent["transaction_date"].max()
                    recent = recent[recent["transaction_date"] >= max_date - timedelta(days=28)]
                    daily_sales = float(pd.to_numeric(recent["sku_qty"], errors="coerce").fillna(0).sum()) / 28.0

            if daily_sales > 0:
                stock_cover_days = int(max(0, min(45, round(stock_qty / daily_sales))))
            else:
                stock_cover_days = 30 if stock_qty > 0 else 0

    if stock_cover_days is None:
        pct_stocked = _safe_float(rows.get("pct_retailers_stocked", pd.Series([0.65])).mean(), 0.65)
        stock_cover_days = int(max(0, min(30, round(pct_stocked * 24))))
        active_retailers = int(round(total_retailers * pct_stocked))

    affected = max(0, total_retailers - (active_retailers or 0))
    pct_ready = (active_retailers or 0) / max(total_retailers, 1)

    if stock_cover_days == 0:
        status = "out_of_stock"
    elif stock_cover_days < 7:
        status = "low"
    elif stock_cover_days < 14 or pct_ready < 0.7:
        status = "watch"
    else:
        status = "healthy"

    return {
        "product": product,
        "stock_status": status,
        "stock_cover_days": stock_cover_days,
        "affected_retailers": affected,
        "total_retailers": total_retailers,
        "stock_ready_retailers": active_retailers or 0,
    }


def _predict_probabilities(group_rows: pd.DataFrame) -> tuple[float, float, str]:
    leakage = _leakage_features()
    bundle = _model_bundle()
    grower_ids = set(group_rows.get("grower_id", pd.Series(dtype=str)).astype(str).tolist())
    scored = leakage[leakage["grower_id"].astype(str).isin(grower_ids)] if not leakage.empty and grower_ids else pd.DataFrame()

    if not scored.empty and bundle["open"] is not None and bundle["click"] is not None and bundle["feature_cols"]:
        try:
            X = scored[bundle["feature_cols"]].apply(pd.to_numeric, errors="coerce").fillna(0)
            open_prob = float(bundle["open"].predict_proba(X)[:, 1].mean())
            click_prob = float(bundle["click"].predict_proba(X)[:, 1].mean())
            return round(max(0.01, min(open_prob, 0.85)), 3), round(max(0.005, min(click_prob, 0.5)), 3), "model"
        except Exception:
            pass

    smartphone_share = (group_rows.get("device_type", pd.Series(dtype=str)).astype(str).str.lower() == "smartphone").mean()
    open_rate = _safe_float(pd.to_numeric(group_rows.get("wa_open_rate", pd.Series([0.17])), errors="coerce").fillna(0).mean(), 0.17)
    click_rate = _safe_float(pd.to_numeric(group_rows.get("wa_click_rate", pd.Series([0.04])), errors="coerce").fillna(0).mean(), 0.04)
    engagement = _safe_float(pd.to_numeric(group_rows.get("engagement_score", pd.Series([0.1])), errors="coerce").fillna(0).mean(), 0.1)
    critical = _safe_float(pd.to_numeric(group_rows.get("in_critical_window", pd.Series([0])), errors="coerce").fillna(0).mean(), 0)
    open_prob = max(open_rate, 0.14 + smartphone_share * 0.08 + engagement * 0.08 + critical * 0.04)
    click_prob = max(click_rate, 0.025 + smartphone_share * 0.018 + engagement * 0.035 + critical * 0.015)
    return round(min(open_prob, 0.55), 3), round(min(click_prob, 0.22), 3), "rules"


def _channel_strategy(group_rows: pd.DataFrame, blocked: bool) -> list[dict[str, Any]]:
    smartphone_share = (group_rows.get("device_type", pd.Series(dtype=str)).astype(str).str.lower() == "smartphone").mean()
    keypad_share = (group_rows.get("device_type", pd.Series(dtype=str)).astype(str).str.lower() == "keypad").mean()
    if blocked:
        return [
            {"channel": "field_rep", "rank": 1, "reason": "Stock or retailer readiness must be cleared before grower push"},
            {"channel": "retailer", "rank": 2, "reason": "Retailer availability is the demand gate"},
        ]
    if smartphone_share >= 0.6:
        return [
            {"channel": "whatsapp", "rank": 1, "reason": f"{round(smartphone_share * 100)}% of this cohort is smartphone reachable"},
            {"channel": "sms", "rank": 2, "reason": "Low-bandwidth backup for intermittent connectivity"},
            {"channel": "field_rep", "rank": 3, "reason": "Rep trust reinforces agronomic advice"},
        ]
    if keypad_share >= 0.35:
        return [
            {"channel": "ivr", "rank": 1, "reason": f"{round(keypad_share * 100)}% keypad share favors voice-first delivery"},
            {"channel": "sms", "rank": 2, "reason": "Short text can reach basic devices"},
            {"channel": "field_rep", "rank": 3, "reason": "Rep follow-up closes literacy and trust gaps"},
        ]
    return [
        {"channel": "sms", "rank": 1, "reason": "Mixed device profile needs low-bandwidth reach"},
        {"channel": "field_rep", "rank": 2, "reason": "Representative follow-up is needed for conversion"},
        {"channel": "retailer", "rank": 3, "reason": "Retailer network can reinforce product availability"},
    ]


def _recommendation_reason_codes(segment_label: str, group_rows: pd.DataFrame, weather: dict[str, Any], stock: dict[str, Any]) -> list[str]:
    reasons = list(_shap_reasons().get(segment_label, []))[:3]
    if weather["risk_level"] in ("medium", "high"):
        reasons.append(weather["summary"][:90])
    if stock["stock_status"] in ("healthy", "watch"):
        reasons.append(f"{stock['stock_cover_days']} days local stock cover available")
    else:
        reasons.append(f"{stock['product']} stock guardrail is {stock['stock_status'].replace('_', ' ')}")
    if not reasons:
        reasons = ["Segment ranked from processed grower, engagement, stock, and field coverage features"]
    return list(dict.fromkeys(reasons))[:5]


def _envelope(source_mode: str = "hybrid") -> dict[str, Any]:
    return {
        "schema_version": "syngenta-copilot.v1",
        "request_id": _request_id(),
        "generated_at": _now_iso(),
        "source_mode": source_mode,
        "warnings": [],
    }


class LocalCsvRepository:
    """Repository backed by cleaned pipeline outputs and trained model artifacts."""

    def get_scenarios(self) -> dict:
        df = _segmented()
        scenarios: list[dict[str, Any]] = []
        preferred_ids = {
            "wheat": "WHEAT_UP_FLOWERING_RISK",
            "mustard": "MUSTARD_RJ_LOW_STOCK",
            "chickpea": "CHICKPEA_MP_POD_BORER",
            "potato": "POTATO_WB_LATE_BLIGHT",
        }
        for crop in ["wheat", "mustard", "chickpea", "potato"]:
            crop_rows = df[df["crop"].str.lower() == crop] if not df.empty else pd.DataFrame()
            if crop_rows.empty:
                continue

            if crop == "mustard":
                target = crop_rows[crop_rows["district"].str.lower() == "sikar"]
                crop_rows = target if not target.empty else crop_rows
            elif crop == "wheat":
                target = crop_rows[crop_rows["district"].str.lower() == "kanpur nagar"]
                crop_rows = target if not target.empty else crop_rows

            top_geo = crop_rows.groupby(["state", "district"]).size().sort_values(ascending=False).index[0]
            geo_rows = crop_rows[(crop_rows["state"] == top_geo[0]) & (crop_rows["district"] == top_geo[1])]
            stage = _stage_from_rows(geo_rows)["stage"].replace("_", " ")
            stock = _inventory_alert(CROP_PRODUCT_MAP.get(crop, "Tilt 250 EC"), {"state": top_geo[0], "district": top_geo[1]}, geo_rows)
            weather = _risk_from_weather(geo_rows)
            stock_status = stock["stock_status"]
            risk_level = "high" if stock_status in ("low", "out_of_stock") else weather["risk_level"]
            scenarios.append({
                "scenario_id": preferred_ids[crop],
                "name": f"{crop.title()} {top_geo[1]} {stage} window",
                "crop": crop,
                "geography": {"state": top_geo[0], "district": top_geo[1]},
                "description": f"{len(geo_rows):,} growers from cleaned features; {weather['summary']}",
                "risk_level": risk_level,
                "stock_status": stock_status,
            })

        return {**_envelope("hybrid"), "scenarios": scenarios}

    def create_campaign_context(self, request: CampaignContextRequest) -> dict:
        geography = request.geography.model_dump()
        language = request.audience.languages[0] if request.audience.languages else None
        device = request.audience.device_types[0] if request.audience.device_types else None
        crop = str(request.crop)
        product = request.product or CROP_PRODUCT_MAP.get(crop, "Tilt 250 EC")
        rows = _filter_rows(crop, geography, language, device)
        if rows.empty:
            rows = _filter_rows(crop, geography)

        smartphone_share = float((rows.get("device_type", pd.Series(dtype=str)).astype(str).str.lower() == "smartphone").mean()) if not rows.empty else 0
        keypad_share = float((rows.get("device_type", pd.Series(dtype=str)).astype(str).str.lower() == "keypad").mean()) if not rows.empty else 0
        primary_language = _mode(rows.get("language", pd.Series(dtype=str)), language or "Hindi")
        stage = _stage_from_rows(rows)
        weather = _risk_from_weather(rows)
        stock = _inventory_alert(product, geography, rows)

        context_id = f"CTX_{uuid.uuid4().hex[:8].upper()}"
        response = {
            **_envelope("hybrid"),
            "context_id": context_id,
            "crop_stage": stage,
            "grower_summary": {
                "estimated_growers": int(len(rows)),
                "smartphone_share": round(smartphone_share, 3),
                "keypad_share": round(keypad_share, 3),
                "primary_language": primary_language,
            },
            "weather_insights": [weather],
            "inventory_alerts": [{k: stock[k] for k in ["product", "stock_status", "stock_cover_days", "affected_retailers"]}],
            "crop": crop,
            "product": product,
            "geography": geography,
            "constraints": request.constraints.model_dump(),
            "audience": request.audience.model_dump(),
            "rows_scope": int(len(rows)),
            "stock_details": stock,
        }
        _CONTEXT_STORE[context_id] = response
        return response

    def create_recommendations(self, context_id: str) -> dict:
        context = _CONTEXT_STORE.get(context_id)
        if context is None:
            default_request = CampaignContextRequest(
                crop="wheat",
                product="Tilt 250 EC",
                objective="lead_generation",
                week_start_date="2026-02-16",
                geography={"state": "Uttar Pradesh", "district": "Kanpur Nagar"},
                audience={"languages": ["Hindi"], "device_types": ["smartphone"]},
                channel_preferences=["whatsapp", "sms", "field_rep"],
                constraints={"low_bandwidth": True, "human_review_required": True, "min_stock_cover_days": 10},
            )
            context = self.create_campaign_context(default_request)
            context_id = context["context_id"]

        crop = context.get("crop", "wheat")
        product = context.get("product") or CROP_PRODUCT_MAP.get(crop, "Tilt 250 EC")
        geography = context.get("geography", {})
        rows = _filter_rows(crop, geography)
        if rows.empty:
            rows = _segmented()[_segmented()["crop"].str.lower() == crop.lower()]

        weather = (context.get("weather_insights") or [_risk_from_weather(rows)])[0]
        stock = context.get("stock_details") or _inventory_alert(product, geography, rows)
        min_stock_days = int(context.get("constraints", {}).get("min_stock_cover_days", 10))
        blocked_by_stock = stock["stock_status"] in ("low", "out_of_stock") or stock["stock_cover_days"] < min_stock_days

        metadata = _model_bundle()["metadata"]
        grouped_rows: list[tuple[str, pd.DataFrame]] = []
        if "segment_label" in rows.columns and not rows.empty:
            for label, group in rows.groupby("segment_label"):
                grouped_rows.append((str(label), group))
        else:
            for key, group in rows.groupby(["language", "device_type", "current_crop_stage"]):
                grouped_rows.append((f"{key[0]} {key[1]} {crop} growers ({key[2]})", group))

        recommendations: list[dict[str, Any]] = []
        baseline_click = float(_leakage_features()["label_clicked"].mean()) if not _leakage_features().empty else 0.05
        for idx, (segment_label, group) in enumerate(grouped_rows):
            target_count = len(group)
            if target_count < 8:
                continue
            open_prob, click_prob, probability_source = _predict_probabilities(group)
            critical_share = _safe_float(pd.to_numeric(group.get("in_critical_window", pd.Series([0])), errors="coerce").fillna(0).mean(), 0)
            rep_coverage = _safe_float(pd.to_numeric(group.get("rep_coverage_score", pd.Series([0.6])), errors="coerce").fillna(0).mean(), 0.6)
            stock_ready = 1 if stock["stock_status"] in ("healthy", "watch") else 0
            risk_score = RISK_ORDER.get(weather["risk_level"], 0) / 2
            priority = int(round(
                open_prob * 35 +
                click_prob * 120 +
                critical_share * 15 +
                rep_coverage * 12 +
                stock_ready * 18 +
                risk_score * 12
            ))
            priority = max(1, min(100, priority))
            blocked = bool(blocked_by_stock)
            expected_leads = 0 if blocked else int(round(target_count * click_prob))
            send_date = (datetime.now(timezone.utc).date() + timedelta(days=1)).isoformat()

            recommendations.append({
                "recommendation_id": f"REC_{uuid.uuid4().hex[:8].upper()}",
                "priority_score": priority,
                "segment_label": segment_label,
                "target_count": int(target_count),
                "crop": crop,
                "product": product,
                "channel_strategy": _channel_strategy(group, blocked),
                "timing": {
                    "recommended_send_date": send_date,
                    "send_window": "Hold until stock recovers" if blocked else "06:30-09:00 local",
                    "urgency": "high" if weather["risk_level"] == "high" and not blocked else "medium",
                },
                "receptivity": {
                    "open_probability": open_prob if probability_source == "model" or group["device_type"].astype(str).str.lower().eq("smartphone").any() else None,
                    "click_probability": click_prob if probability_source == "model" or group["device_type"].astype(str).str.lower().eq("smartphone").any() else None,
                    "confidence": round(min(0.95, max(0.35, math.log10(target_count + 1) / 3)), 3),
                    "confidence_label": "High Confidence" if probability_source == "model" and target_count >= 30 else "Medium Confidence",
                },
                "expected_impact": {
                    "baseline_click_rate": round(baseline_click, 3),
                    "expected_click_rate": 0.0 if blocked else click_prob,
                    "expected_leads": expected_leads,
                },
                "reason_codes": _recommendation_reason_codes(segment_label, group, weather, stock),
                "human_review_flags": ["agronomy_review_required"] if context.get("constraints", {}).get("human_review_required", True) else [],
                "blocked": blocked,
                "blocked_reasons": ["stock below threshold"] if blocked else [],
                "rep_coverage_score": round(rep_coverage, 3),
                "probability_source": probability_source,
            })

        recommendations.sort(key=lambda item: (item["blocked"], -item["priority_score"], -item["target_count"]))
        recommendations = recommendations[:8]
        for rank, recommendation in enumerate(recommendations, start=1):
            recommendation["recommendation_priority_rank"] = rank

        plan_id = f"PLAN_{uuid.uuid4().hex[:8].upper()}"
        response = {
            **_envelope("ml"),
            "plan_id": plan_id,
            "context_id": context_id,
            "context": {
                "crop": crop,
                "product": product,
                "geography": geography,
                "inventory_alerts": context.get("inventory_alerts", []),
                "constraints": context.get("constraints", {}),
            },
            "recommendations": recommendations,
            "model_version": metadata.get("model_version", "local-v1"),
            "trained_on": metadata.get("trained_on", metadata.get("train_period", "2025-10 to 2026-01")),
            "feature_version": metadata.get("feature_version", "v3"),
            "data_last_updated": metadata.get("data_last_updated", "2026-02-18T00:00:00Z"),
            "inventory_snapshot": metadata.get("inventory_snapshot", "2026-02-18T06:00:00Z"),
            "model_last_trained": metadata.get("model_last_trained", metadata.get("training_timestamp")),
            "warnings": [] if any(r.get("probability_source") == "model" for r in recommendations) else ["No WhatsApp model rows matched this cohort; receptivity uses leakage-safe rule fallback."],
        }
        _PLAN_STORE[plan_id] = response
        global _LAST_PLAN_ID
        _LAST_PLAN_ID = plan_id
        return response

    def generate_content(self, request: ContentGenerationRequest) -> dict:
        plan = _PLAN_STORE.get(request.plan_id) or (_PLAN_STORE.get(_LAST_PLAN_ID) if _LAST_PLAN_ID else None)
        rec = None
        if plan:
            rec = next((item for item in plan.get("recommendations", []) if item.get("recommendation_id") == request.recommendation_id), None)
            if rec is None and plan.get("recommendations"):
                rec = plan["recommendations"][0]
        rec = rec or {
            "crop": "wheat",
            "product": "Tilt 250 EC",
            "segment_label": "Hindi Smartphone wheat growers",
            "timing": {"send_window": "06:30-09:00 local"},
        }
        variants = []
        for fmt in request.formats:
            for language in request.languages:
                text, cta = self._content_text(fmt, language, rec)
                variants.append({
                    "content_id": f"CNT_{uuid.uuid4().hex[:8].upper()}",
                    "format": fmt,
                    "language": language,
                    "text": text,
                    "cta": cta,
                    "estimated_read_time_sec": max(5, min(45, round(len(text.split()) / 2.5))),
                    "approval_state": "pending_review",
                    "safety_flags": [],
                    "generation_source": "rules_template",
                })
        response = {
            **_envelope("hybrid"),
            "content_batch_id": f"CNTB_{uuid.uuid4().hex[:8].upper()}",
            "plan_id": request.plan_id,
            "recommendation_id": request.recommendation_id,
            "variants": variants,
        }
        _CONTENT_STORE[response["content_batch_id"]] = response
        for variant in variants:
            _CONTENT_STORE[variant["content_id"]] = {**response, "variant": variant}
        return response

    def save_content(self, response: dict) -> dict:
        _CONTENT_STORE[response.get("content_batch_id", f"CNTB_{uuid.uuid4().hex[:8]}")] = response
        for variant in response.get("variants", []):
            _CONTENT_STORE[variant["content_id"]] = {**response, "variant": variant}
        return response

    def approve_content(self, request: ContentApprovalRequest) -> dict:
        stored = _CONTENT_STORE.get(request.content_id, {})
        variant = stored.get("variant", {})
        variant["approval_state"] = request.approval_state
        approved_at = _now_iso() if request.approval_state == "approved" else None
        variant["approved_at"] = approved_at
        return {
            **_envelope("hybrid"),
            "content_id": request.content_id,
            "content_batch_id": stored.get("content_batch_id", "CNTB_RUNTIME"),
            "plan_id": stored.get("plan_id", _LAST_PLAN_ID or "PLAN_RUNTIME"),
            "recommendation_id": stored.get("recommendation_id", "REC_RUNTIME"),
            "approval_state": request.approval_state,
            "reviewer": request.reviewer,
            "approved_at": approved_at,
            "field_actions_unlocked": request.approval_state == "approved",
        }

    def get_field_actions(self, plan_id: str) -> dict:
        plan = _PLAN_STORE.get(plan_id) or (_PLAN_STORE.get(_LAST_PLAN_ID) if _LAST_PLAN_ID else None)
        if plan is None:
            plan = self.create_recommendations(self.create_campaign_context(CampaignContextRequest(
                crop="wheat",
                product="Tilt 250 EC",
                objective="lead_generation",
                week_start_date="2026-02-16",
                geography={"state": "Uttar Pradesh", "district": "Kanpur Nagar"},
                audience={"languages": ["Hindi"], "device_types": ["smartphone"]},
                channel_preferences=["whatsapp", "sms", "field_rep"],
                constraints={"low_bandwidth": True, "human_review_required": True, "min_stock_cover_days": 10},
            ))["context_id"])
            plan_id = plan["plan_id"]

        recs = plan.get("recommendations", [])
        top_rec = recs[0] if recs else {}
        context = plan.get("context", {})
        geography = context.get("geography", {})
        product = context.get("product") or top_rec.get("product", "Tilt 250 EC")
        reps = _reps()
        visits = _visits()
        retailers = _retailers()

        scoped_reps = reps
        if not reps.empty:
            if geography.get("state"):
                match = scoped_reps[scoped_reps["state"].astype(str).str.lower() == str(geography["state"]).lower()]
                if not match.empty:
                    scoped_reps = match
            if geography.get("district"):
                match = scoped_reps[scoped_reps["district"].astype(str).str.lower() == str(geography["district"]).lower()]
                if not match.empty:
                    scoped_reps = match

        actions = []
        for _, rep in scoped_reps.head(10).iterrows():
            territory_id = str(rep.get("territory_id", "TER_RUNTIME"))
            territory_retailers = retailers[retailers["territory_id"].astype(str) == territory_id] if not retailers.empty else pd.DataFrame()
            retailer_ids = territory_retailers["retailer_id"].astype(str).head(4).tolist()
            rep_visits = visits[visits["rep_id"].astype(str) == str(rep.get("rep_id"))] if not visits.empty else pd.DataFrame()
            visit_mix = _mode(rep_visits.get("visit_type", pd.Series(dtype=str)), "grower meeting").replace("_", " ")
            blocked = bool(top_rec.get("blocked"))
            action_type = "retailer_replenishment_check" if blocked else "grower_advisory_follow_up"
            summary = (
                f"Confirm {product} availability with {len(retailer_ids)} retailers before campaign release."
                if blocked
                else f"Use approved advisory for {top_rec.get('segment_label', 'priority growers')} and log inquiries after {visit_mix}."
            )
            actions.append({
                "action_id": f"ACT_{uuid.uuid4().hex[:8].upper()}",
                "rep_id": str(rep.get("rep_id", "REP_RUNTIME")),
                "territory_id": territory_id,
                "priority": "high" if blocked or top_rec.get("timing", {}).get("urgency") == "high" else "medium",
                "due_date": top_rec.get("timing", {}).get("recommended_send_date") or (datetime.now(timezone.utc).date() + timedelta(days=2)).isoformat(),
                "action_type": action_type,
                "summary": summary,
                "retailer_ids": retailer_ids,
                "recommended_script_id": f"SCRIPT_{top_rec.get('recommendation_id', 'RUNTIME')}",
                "success_metric": "retailer stock confirmed" if blocked else "grower inquiry or visit outcome logged",
            })

        return {**_envelope("hybrid"), "plan_id": plan_id, "actions": actions}

    def get_analytics_summary(self, plan_id: str) -> dict:
        plan = _PLAN_STORE.get(plan_id) or (_PLAN_STORE.get(_LAST_PLAN_ID) if _LAST_PLAN_ID else None)
        if plan is None:
            plan = self.create_recommendations(self.create_campaign_context(CampaignContextRequest(
                crop="wheat",
                product="Tilt 250 EC",
                objective="lead_generation",
                week_start_date="2026-02-16",
                geography={"state": "Uttar Pradesh", "district": "Kanpur Nagar"},
                audience={"languages": ["Hindi"], "device_types": ["smartphone"]},
                channel_preferences=["whatsapp", "sms", "field_rep"],
                constraints={"low_bandwidth": True, "human_review_required": True, "min_stock_cover_days": 10},
            ))["context_id"])
            plan_id = plan["plan_id"]

        recs = plan.get("recommendations", [])
        context = plan.get("context", {})
        crop = context.get("crop") or (recs[0].get("crop") if recs else "wheat")
        total_target = sum(int(r.get("target_count", 0)) for r in recs)
        expected_leads = sum(int(r.get("expected_impact", {}).get("expected_leads", 0)) for r in recs)
        avg_open = sum(float(r.get("receptivity", {}).get("open_probability") or 0) for r in recs) / len(recs) if recs else 0
        avg_click = sum(float(r.get("receptivity", {}).get("click_probability") or 0) for r in recs) / len(recs) if recs else 0
        stock_details = (context.get("inventory_alerts") or [{}])[0]
        stock_ready = max(0, int((context.get("stock_details") or {}).get("stock_ready_retailers", 0) or 0))

        channel_weights: dict[str, float] = defaultdict(float)
        for rec in recs:
            for channel in rec.get("channel_strategy", []):
                channel_weights[channel["channel"]] += rec.get("target_count", 0) / max(channel.get("rank", 1), 1)
        total_weight = sum(channel_weights.values()) or 1
        channel_mix = [
            {"channel": channel, "share": round(weight / total_weight, 3)}
            for channel, weight in sorted(channel_weights.items(), key=lambda item: item[1], reverse=True)
        ]

        funnel = _funnel()
        weekly_funnel = []
        if not funnel.empty:
            crop_funnel = funnel[funnel["campaign_crop"].astype(str).str.lower() == str(crop).lower()].sort_values("week_start_date").tail(6)
            for _, row in crop_funnel.iterrows():
                baseline = _safe_int(row.get("lead_form_submission"), 0)
                recommended = int(round(baseline + max(1, expected_leads / max(len(crop_funnel), 1))))
                weekly_funnel.append({
                    "week": row["week_start_date"].strftime("%d %b") if hasattr(row["week_start_date"], "strftime") else str(row["week_start_date"]),
                    "baseline": baseline,
                    "recommended": recommended,
                })

        leakage = _leakage_features()
        crop_messages = leakage[leakage["crop"].astype(str).str.lower() == str(crop).lower()] if not leakage.empty else pd.DataFrame()
        delivered = len(crop_messages)
        opened = int(pd.to_numeric(crop_messages.get("label_opened", pd.Series(dtype=float)), errors="coerce").fillna(0).sum()) if not crop_messages.empty else 0
        clicked = int(pd.to_numeric(crop_messages.get("label_clicked", pd.Series(dtype=float)), errors="coerce").fillna(0).sum()) if not crop_messages.empty else 0
        engagement_funnel = [
            {"label": "Delivered", "baseline": delivered, "recommended": delivered},
            {"label": "Opened", "baseline": opened, "recommended": int(round(total_target * avg_open)) if total_target else opened},
            {"label": "Clicked", "baseline": clicked, "recommended": int(round(total_target * avg_click)) if total_target else clicked},
            {"label": "Leads", "baseline": max(0, int(round(clicked * 0.55))), "recommended": expected_leads},
        ]

        actions = self.get_field_actions(plan_id).get("actions", [])
        return {
            **_envelope("hybrid"),
            "plan_id": plan_id,
            "kpis": {
                "target_growers": total_target,
                "predicted_open_rate": round(avg_open, 3),
                "predicted_click_rate": round(avg_click, 3),
                "expected_leads": expected_leads,
                "stock_ready_retailers": stock_ready,
                "field_actions": len(actions),
                "stock_cover_days": int(stock_details.get("stock_cover_days", 0)),
            },
            "charts": {
                "channel_mix": channel_mix,
                "weekly_funnel": weekly_funnel,
                "engagement_funnel": engagement_funnel,
            },
        }

    def create_export(self, plan_id: str, export_type: str) -> dict:
        EXPORT_DIR.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        export_id = f"EXP_{uuid.uuid4().hex[:8].upper()}"
        if export_type == "csv":
            filename = f"{export_id}_campaign_plan.csv"
            path = EXPORT_DIR / filename
            plan = _PLAN_STORE.get(plan_id) or (_PLAN_STORE.get(_LAST_PLAN_ID) if _LAST_PLAN_ID else {"recommendations": []})
            with path.open("w", newline="", encoding="utf-8") as fh:
                writer = csv.writer(fh)
                writer.writerow(["recommendation_id", "segment", "crop", "product", "target_count", "priority", "expected_leads", "blocked"])
                for rec in plan.get("recommendations", []):
                    writer.writerow([
                        rec.get("recommendation_id"),
                        rec.get("segment_label"),
                        rec.get("crop"),
                        rec.get("product"),
                        rec.get("target_count"),
                        rec.get("priority_score"),
                        rec.get("expected_impact", {}).get("expected_leads"),
                        rec.get("blocked"),
                    ])
            formats = ["csv"]
        else:
            filename = f"{export_id}_{export_type}_{timestamp}.txt"
            path = EXPORT_DIR / filename
            actions = self.get_field_actions(plan_id).get("actions", [])
            with path.open("w", encoding="utf-8") as fh:
                fh.write(f"Syngenta Krishi Campaign Copilot - {export_type.replace('_', ' ').title()}\n")
                fh.write(f"Plan: {plan_id}\nGenerated: {_now_iso()}\n\n")
                for action in actions:
                    fh.write(f"{action['action_id']} | {action['rep_id']} | {action['territory_id']} | {action['priority']}\n")
                    fh.write(f"{action['summary']}\nSuccess metric: {action['success_metric']}\n\n")
            formats = ["txt"]

        return {
            **_envelope("hybrid"),
            "export_id": export_id,
            "plan_id": plan_id,
            "export_type": export_type,
            "formats": formats,
            "download_url": f"/exports/{filename}",
        }

    @staticmethod
    def _content_text(fmt: str, language: str, rec: dict[str, Any]) -> tuple[str, str]:
        crop = rec.get("crop", "crop")
        product = rec.get("product", "Syngenta product")
        segment = rec.get("segment_label", "priority growers")
        window = rec.get("timing", {}).get("send_window", "the next field window")
        if fmt == "sms":
            return (
                f"Syngenta advisory: {crop} growers in this cohort should contact the local rep for {product} guidance. Window: {window}.",
                "Contact local rep",
            )
        if fmt == "ivr":
            return (
                f"Namaste. This is a Syngenta crop advisory for {crop}. Your local field team has identified an important crop stage window. Please speak with the Syngenta representative or authorised retailer before taking action.",
                "Speak with representative",
            )
        if fmt == "rep_script":
            return (
                f"Open by confirming the grower's {crop} stage. Explain that {product} is recommended only after local field assessment. Ask about recent weather, pest symptoms, and retailer access. Log inquiry outcome for {segment}.",
                "Log visit outcome",
            )
        if fmt == "visual_concept":
            return (
                f"Simple low-literacy visual: local {crop} field, trusted rep, authorised retailer icon, and one CTA to ask about {product}. Avoid dosage, cure, or yield guarantee claims.",
                "Use approved CTA",
            )
        greeting = "Namaste" if language in {"Hindi", "Marathi", "Gujarati", "Kannada", "Punjabi", "Bengali"} else "Hello"
        return (
            f"{greeting}. Your {crop} crop is in an important advisory window. Syngenta recommends speaking with your local representative or authorised retailer about {product} availability and fit for your field.",
            "Contact your local representative",
        )
