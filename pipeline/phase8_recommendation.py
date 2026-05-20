"""
==========================================================================
PHASE 8: Recommendation Engine
==========================================================================
PURPOSE:
  Build the core recommendation engine that combines ALL previous pipeline
  phases into actionable campaign recommendations. This is the final
  "brain" that a campaign manager queries:

    "Show me the best segments to target for Tilt 250 EC in
     Uttar Pradesh this week."

  It returns ranked recommendation cards with: priority score, segment
  details, channel strategy, timing, receptivity, expected impact,
  reason codes, and guardrail flags.

SCORING FORMULA (weighted, 0-100 scale, loaded dynamically):
  priority_score = (
      weather_risk_score     × weather_weight +
      critical_pct           × crop_stage_weight +
      engagement_score_mean  × engagement_weight +
      stock_urgency_mean     × stock_weight +
      rep_coverage_mean      × rep_coverage_weight
  ) * 100

HARD GUARDRAILS:
  - Stock guardrail: if stock_status == 'out_of_stock' → recommendation
    is BLOCKED entirely (not just scored lower). This prevents wasted
    campaigns where product is unavailable.

INPUTS:
  - features/segmented_growers.csv (from Phase 7)
  - models/model_open.pkl (from Phase 5)
  - models/model_click.pkl (from Phase 5)
  - models/feature_cols.pkl (from Phase 5)

OUTPUTS:
  - Recommendation cards (returned as list of dicts)
  - Exports to pipeline/exports/demo/recommendations.json (for demo mode cache)

EXPORTS:
  - generate_recommendations(crop, state, district, product, as_of_date)
==========================================================================
"""

import pandas as pd
import numpy as np
import pickle
import json
import uuid
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.config import (
    SEGMENTED_GROWERS, MODEL_OPEN, MODEL_CLICK,
    FEATURE_COLS_PKL, ensure_dirs
)
from configs.crop_product_map import CROP_PRODUCT_MAP
from configs.recommendation_weights import WEIGHTS as SCORE_WEIGHTS


def _load_models():
    """
    Load trained ML models and feature columns from Phase 5.
    """
    try:
        with open(MODEL_OPEN, 'rb') as f:
            model_open = pickle.load(f)
        with open(MODEL_CLICK, 'rb') as f:
            model_click = pickle.load(f)
        with open(FEATURE_COLS_PKL, 'rb') as f:
            feature_cols = pickle.load(f)
        return model_open, model_click, feature_cols
    except FileNotFoundError:
        print("  ⚠ Model files not found — using rule-based scoring only")
        return None, None, None


def _generate_reason_codes(seg_metrics: dict) -> list:
    """
    Generate human-readable business reason codes explaining WHY a segment
    was recommended. Based on actual segment metrics.
    """
    reasons = []

    # Translate technical explainability into business reasoning
    if seg_metrics.get('critical_pct', 0) > 0.3:
        reasons.append('Crop near critical intervention window')
    if seg_metrics.get('weather_risk', 0) > 0.5:
        reasons.append('Elevated weather disease risk')
    if seg_metrics.get('stock_urgency', 0) > 0.7:
        reasons.append('Product well-stocked in territory')
    if seg_metrics.get('engagement', 0) > 0.15:
        reasons.append('Historically engaged segment')
    if seg_metrics.get('rep_coverage', 0) > 0.5:
        reasons.append('Territory has active rep coverage')

    # Fallback
    if not reasons:
        reasons.append('Contextual signals support outreach')

    return reasons


def generate_recommendations(
    crop: str,
    state: str,
    district: str = None,
    product: str = None,
    as_of_date: str = '2026-02-18',
    max_recommendations: int = 5,
    demo_mode: bool = False,
) -> list:
    """
    Generate ranked campaign recommendations for a given crop, state,
    and (optionally) district and product.
    """
    ensure_dirs()

    # ----------------------------------------------------------
    # DEMO MODE CACHE LOOKUP
    # ----------------------------------------------------------
    # If demo mode is enabled, load cached recommendations if available
    # to avoid recomputation and ensure instant stable loading.
    if demo_mode:
        cache_path = os.path.join(os.path.dirname(SEGMENTED_GROWERS), '..', 'exports', 'demo', 'recommendations.json')
        if os.path.exists(cache_path):
            try:
                print("  [Demo Mode] Loading cached recommendations from exports/demo/recommendations.json...")
                with open(cache_path, 'r', encoding='utf-8') as f:
                    cached_data = json.load(f)
                    # Filter recommendations matching the requested parameters
                    recs = []
                    for r in cached_data.get("recommendations", []):
                        match_crop = r.get("crop", "").lower() == crop.lower()
                        match_state = r.get("state", "").lower() == state.lower() if "state" in r else True
                        if match_crop and match_state:
                            recs.append(r)
                    if recs:
                        return recs[:max_recommendations]
            except Exception as e:
                print(f"  [Demo Mode] Failed to load cache: {e}. Falling back to computation.")

    # ----------------------------------------------------------
    # STEP 0: RESOLVE PRODUCT AND LOAD DATA
    # ----------------------------------------------------------
    if product is None:
        product = CROP_PRODUCT_MAP.get(crop, 'Tilt 250 EC')

    as_of = pd.Timestamp(as_of_date)
    plan_id = f"PLAN_{crop.upper()}_{state.upper()[:3]}_{as_of.strftime('%Y%m%d')}"

    # Load segmented growers
    df = pd.read_csv(SEGMENTED_GROWERS, parse_dates=['reference_date'])

    # Load precomputed SHAP reasons if available
    shap_reasons = {}
    shap_reasons_path = os.path.join(os.path.dirname(SEGMENTED_GROWERS), 'segment_shap_reasons.json')
    if os.path.exists(shap_reasons_path):
        try:
            with open(shap_reasons_path, 'r', encoding='utf-8') as f:
                shap_reasons = json.load(f)
        except Exception as e:
            print(f"  ⚠ Failed to load precomputed SHAP reasons: {e}")

    # ----------------------------------------------------------
    # STEP 1: FILTER BY CROP AND GEOGRAPHY
    # ----------------------------------------------------------
    mask = (df['crop'].str.lower() == crop.lower()) & (df['state'].str.lower() == state.lower())
    if district:
        mask = mask & (df['district'].str.lower() == district.lower())
    filtered = df[mask].copy()

    if filtered.empty:
        print(f"  ⚠ No growers found for crop={crop}, state={state}, district={district}")
        return []

    # ----------------------------------------------------------
    # STEP 2: HARD BLOCK — STOCK GUARDRAIL
    # ----------------------------------------------------------
    out_of_stock_mask = filtered['stock_status'] == 'out_of_stock'
    blocked_growers = filtered[out_of_stock_mask]
    available_growers = filtered[~out_of_stock_mask]

    # ----------------------------------------------------------
    # STEP 3: LOAD ML MODELS FOR RECEPTIVITY
    # ----------------------------------------------------------
    model_open, model_click, feature_cols = _load_models()

    # ----------------------------------------------------------
    # STEP 4: SCORE EACH SEGMENT
    # ----------------------------------------------------------
    recommendations = []

    if not available_growers.empty:
        segments = available_growers.groupby('segment_label')

        for seg_label, seg_df in segments:
            critical_pct = seg_df['in_critical_window'].mean()
            weather_risk = seg_df['weather_risk_score'].mean()
            engagement   = seg_df['engagement_score'].mean()
            stock_urg    = seg_df['stock_urgency_score'].mean()
            rep_cov      = seg_df['rep_coverage_score'].mean()
            target_count = len(seg_df)

            # Weighted priority score using dynamic weights config (0-100 scale)
            priority_score = (
                weather_risk  * SCORE_WEIGHTS.get('weather', 0.25)  +
                critical_pct  * SCORE_WEIGHTS.get('crop_stage', 0.30) +
                engagement    * SCORE_WEIGHTS.get('engagement', 0.20) +
                stock_urg     * SCORE_WEIGHTS.get('stock', 0.15)    +
                rep_cov       * SCORE_WEIGHTS.get('rep_coverage', 0.10)
            ) * 100

            # ---- ML receptivity ----
            open_prob = 0.23   # Baseline fallback
            click_prob = 0.05  # Baseline fallback
            confidence = 0.70

            if model_open is not None and feature_cols is not None:
                # Build feature matrix for this segment, mapping from Phase 3/7 columns to ML feature names
                X_seg = pd.DataFrame(index=seg_df.index)
                X_seg['prior_open_rate'] = seg_df['wa_open_rate']
                X_seg['prior_click_rate'] = seg_df['wa_click_rate']
                X_seg['prior_msg_count'] = seg_df['wa_messages_sent']
                X_seg['scan_before_send'] = seg_df['product_scan_flag']
                X_seg['attended_before_send'] = seg_df['offline_attended_flag']
                X_seg['days_to_flowering'] = seg_df['days_to_flowering']
                X_seg['days_to_harvest'] = seg_df['days_to_harvest']
                X_seg['days_to_tillering'] = seg_df['days_to_tillering']
                X_seg['in_critical_window'] = seg_df['in_critical_window']
                X_seg['device_score'] = seg_df['device_score']
                X_seg['grower_farm_size'] = seg_df['grower_farm_size']
                X_seg['grower_age'] = seg_df['grower_age']
                X_seg['stock_urgency_score'] = seg_df['stock_urgency_score']
                X_seg['rep_coverage_score'] = seg_df['rep_coverage_score']
                X_seg['pct_retailers_stocked'] = seg_df['pct_retailers_stocked']
                X_seg['rep_campaign_ratio'] = seg_df['rep_campaign_ratio']

                # Fill in any missing language dummy columns if required by the model features
                for col in feature_cols:
                    if col not in X_seg.columns:
                        if col in seg_df.columns:
                            X_seg[col] = seg_df[col]
                        else:
                            X_seg[col] = 0.0

                X_seg = X_seg[feature_cols].fillna(0).astype(float)
                open_prob = float(model_open.predict_proba(X_seg)[:, 1].mean())
                click_prob = float(model_click.predict_proba(X_seg)[:, 1].mean())
                confidence = 0.85 if len(seg_df) >= 30 else 0.70

            # ---- Timing ----
            recommended_send = as_of + timedelta(days=1)
            urgency = 'high' if critical_pct > 0.3 or weather_risk > 0.7 else \
                      'medium' if critical_pct > 0.1 or weather_risk > 0.4 else 'low'

            # ---- Expected impact ----
            baseline_click = 0.05
            expected_click = max(click_prob, baseline_click)
            expected_leads = int(target_count * expected_click)

            # ---- Reason codes ----
            reason_codes = shap_reasons.get(seg_label)
            if not reason_codes:
                seg_metrics = {
                    'critical_pct': critical_pct,
                    'weather_risk': weather_risk,
                    'stock_urgency': stock_urg,
                    'engagement': engagement,
                    'rep_coverage': rep_cov,
                }
                reason_codes = _generate_reason_codes(seg_metrics)

            # ---- Human review flags ----
            review_flags = []
            if target_count < 15:
                review_flags.append('Small segment — verify targeting')
            if stock_urg < 0.3:
                review_flags.append('Low stock — confirm availability')
            if engagement < 0.05:
                review_flags.append('Low engagement history — consider alternative channels')

            # ---- Channel strategy (parsed from first grower in segment) ----
            channel_strat = json.loads(seg_df['channel_strategy'].iloc[0])

            # ---- Build recommendation card ----
            rec = {
                'recommendation_id': str(uuid.uuid4())[:12],
                'plan_id': plan_id,
                'priority_score': int(round(priority_score)),
                'segment_label': seg_label,
                'target_count': target_count,
                'crop': crop,
                'product': product,
                'channel_strategy': channel_strat,
                'timing': {
                    'recommended_send_date': recommended_send.strftime('%Y-%m-%d'),
                    'send_window': '07:00-10:00',
                    'urgency': urgency,
                },
                'receptivity': {
                    'open_probability': round(open_prob, 4),
                    'click_probability': round(click_prob, 4),
                    'confidence': round(confidence, 2),
                },
                'expected_impact': {
                    'baseline_click_rate': baseline_click,
                    'expected_click_rate': round(expected_click, 4),
                    'expected_leads': expected_leads,
                },
                'reason_codes': reason_codes,
                'human_review_flags': review_flags,
                'blocked': False,
                'source_mode': 'ml',
            }
            recommendations.append(rec)

    # ----------------------------------------------------------
    # STEP 5: ADD BLOCKED RECOMMENDATIONS
    # ----------------------------------------------------------
    if not blocked_growers.empty:
        blocked_segments = blocked_growers.groupby('segment_label')

        for seg_label, seg_df in blocked_segments:
            channel_strat = json.loads(seg_df['channel_strategy'].iloc[0])

            rec = {
                'recommendation_id': str(uuid.uuid4())[:12],
                'plan_id': plan_id,
                'priority_score': 0,
                'segment_label': seg_label,
                'target_count': len(seg_df),
                'crop': crop,
                'product': product,
                'channel_strategy': channel_strat,
                'timing': {
                    'recommended_send_date': (as_of + timedelta(days=1)).strftime('%Y-%m-%d'),
                    'send_window': 'Hold',
                    'urgency': 'low',
                },
                'receptivity': {
                    'open_probability': 0.0,
                    'click_probability': 0.0,
                    'confidence': 0.0,
                },
                'expected_impact': {
                    'baseline_click_rate': 0.05,
                    'expected_click_rate': 0.0,
                    'expected_leads': 0,
                },
                'reason_codes': ['BLOCKED: Product out of stock in territory'],
                'human_review_flags': [
                    'Stock guardrail triggered — campaign blocked until restocked'
                ],
                'blocked': True,
                'source_mode': 'ml',
            }
            recommendations.append(rec)

    # ----------------------------------------------------------
    # STEP 6: SORT AND LIMIT
    # ----------------------------------------------------------
    recommendations.sort(
        key=lambda r: (not r['blocked'], r['priority_score']),
        reverse=True
    )

    return recommendations[:max_recommendations]


def run_phase8():
    """Execute Phase 8: Recommendation Engine & Cache Generation."""
    print("=" * 60)
    print("PHASE 8: Recommendation Engine")
    print("=" * 60)

    ensure_dirs()

    # Generate a set of sample scenarios for pre-caching
    test_scenarios = [
        ('wheat', 'Uttar Pradesh', 'Tilt 250 EC'),
        ('mustard', 'Rajasthan', 'Score 250 EC'),
        ('chickpea', 'Madhya Pradesh', 'Score 250 EC'),
    ]

    all_recommendations = []

    for crop, state, product in test_scenarios:
        print(f"\nGenerating recommendations for {crop} in {state} using {product}...")
        recs = generate_recommendations(
            crop=crop,
            state=state,
            product=product,
            as_of_date='2026-02-18',
            max_recommendations=5
        )
        all_recommendations.extend(recs)

        # Print top recommendation details
        if recs:
            top = recs[0]
            blocked_tag = " [BLOCKED]" if top['blocked'] else ""
            print(f"  Top Segment: {top['segment_label']}{blocked_tag}")
            print(f"  Score:       {top['priority_score']}/100")
            print(f"  Reasons:     {top['reason_codes']}")

    # Save to demo cache location
    demo_cache_dir = os.path.join(os.path.dirname(SEGMENTED_GROWERS), '..', 'exports', 'demo')
    os.makedirs(demo_cache_dir, exist_ok=True)
    demo_cache_path = os.path.join(demo_cache_dir, 'recommendations.json')

    cache_payload = {
        "schema_version": "syngenta-copilot.v1",
        "plan_id": "PLAN_SAMPLE_20260218",
        "context_id": "CTX_SAMPLE",
        "generated_at": datetime.now().isoformat(),
        "source_mode": "ml",
        "recommendations": all_recommendations
    }
    with open(demo_cache_path, 'w', encoding='utf-8') as f:
        json.dump(cache_payload, f, indent=2)
    print(f"\n✓ Saved demo cache recommendations to {demo_cache_path}")

    # Synchronize with frontend/public/demo-cache/recommendations.json
    pipeline_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(pipeline_dir)
    frontend_cache_dir = os.path.join(project_root, 'frontend', 'public', 'demo-cache')
    if os.path.exists(frontend_cache_dir):
        frontend_path = os.path.join(frontend_cache_dir, 'recommendations.json')
        with open(frontend_path, 'w', encoding='utf-8') as f:
            json.dump(cache_payload, f, indent=2)
        print(f"✓ Synchronized recommendations to {frontend_path}")
    else:
        print("  ⚠ Frontend cache directory not found, skipped synchronization.")

    return True


def run_phase():
    """Expose run capability."""
    return run_phase8()


def validate_phase():
    """Validate Phase 8 output."""
    demo_cache_path = os.path.join(os.path.dirname(SEGMENTED_GROWERS), '..', 'exports', 'demo', 'recommendations.json')
    return os.path.exists(demo_cache_path)


def save_outputs():
    """Explicitly save results."""
    pass


if __name__ == '__main__':
    success = run_phase()
    if not success:
        sys.exit(1)
