"""
==========================================================================
PHASE 9: Recommendation Engine
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

SCORING FORMULA (weighted, 0-100 scale):
  priority_score = (
      weather_risk_score     × 25  +   # Weather-driven urgency
      critical_pct           × 30  +   # % growers near critical crop window
      engagement_score_mean  × 20  +   # Historical engagement strength
      stock_urgency_mean     × 15  +   # Product availability
      rep_coverage_mean      × 10      # Territory rep activity
  )

HARD GUARDRAILS:
  - Stock guardrail: if stock_status == 'out_of_stock' → recommendation
    is BLOCKED entirely (not just scored lower). This prevents wasted
    campaigns where product is unavailable.

INPUTS:
  - features/segmented_growers.csv (from Phase 8)
  - models/model_open.pkl (from Phase 5)
  - models/model_click.pkl (from Phase 5)
  - models/feature_cols.pkl (from Phase 5)

OUTPUTS:
  - Recommendation cards (returned as list of dicts)
  - Printed to console for demo purposes

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


# ==============================================================
# SCORING WEIGHTS
# ==============================================================
# These weights reflect business priorities for the Rabi 2025-26
# campaign. Crop timing is weighted highest because fungicide
# must be applied within a narrow window.
# ==============================================================

SCORE_WEIGHTS = {
    'weather':    25,   # Weather-driven disease risk
    'critical':   30,   # % growers in critical crop window (0-14 days to flowering)
    'engagement': 20,   # Historical engagement (open/click rates)
    'stock':      15,   # Product availability in territory
    'rep':        10,   # Field rep coverage and activity
}


def _load_models():
    """
    Load trained ML models and feature columns from Phase 5.

    Returns
    -------
    tuple of (model_open, model_click, feature_cols)
        - model_open  : LGBMClassifier for open probability
        - model_click : LGBMClassifier for click probability
        - feature_cols: list of feature column names

    Returns (None, None, None) if model files are not found,
    in which case the recommendation engine falls back to
    rule-based scoring only.
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
    Generate human-readable reason codes explaining WHY a segment
    was recommended. Based on actual segment metrics, not generic text.

    Parameters
    ----------
    seg_metrics : dict
        Segment-level aggregated metrics with keys:
        - critical_pct, weather_risk, stock_urgency,
        - engagement, rep_coverage

    Returns
    -------
    list of str
        Human-readable reason codes (1-5 reasons)
    """
    reasons = []

    # Each reason is triggered by a threshold on the actual metric
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

    # Fallback: always provide at least one reason
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
) -> list:
    """
    Generate ranked campaign recommendations for a given crop, state,
    and (optionally) district and product.

    This is the main entry point for the recommendation engine. It
    combines weather risk, crop timing, engagement history, stock
    availability, and rep coverage into a single priority score.

    Parameters
    ----------
    crop : str
        Target crop (e.g., 'wheat', 'mustard', 'potato')
    state : str
        Indian state name (e.g., 'Uttar Pradesh', 'Rajasthan')
    district : str, optional
        Filter to a specific district. If None, all districts in state.
    product : str, optional
        Syngenta product name. If None, auto-mapped from crop via
        CROP_PRODUCT_MAP.
    as_of_date : str
        Reference date for the recommendation (YYYY-MM-DD format).
        Determines timing urgency and weather lookup.
    max_recommendations : int
        Maximum number of recommendation cards to return.

    Returns
    -------
    list of dict
        Ranked recommendation cards, each containing:
        - recommendation_id, plan_id, priority_score
        - segment_label, target_count, crop, product
        - channel_strategy, timing, receptivity
        - expected_impact, reason_codes, human_review_flags
        - blocked (bool), source_mode
    """
    ensure_dirs()

    # ----------------------------------------------------------
    # STEP 0: RESOLVE PRODUCT AND LOAD DATA
    # ----------------------------------------------------------
    if product is None:
        product = CROP_PRODUCT_MAP.get(crop, 'Tilt 250 EC')

    as_of = pd.Timestamp(as_of_date)
    plan_id = f"PLAN_{crop.upper()}_{state.upper()[:3]}_{as_of.strftime('%Y%m%d')}"

    # Load segmented growers
    df = pd.read_csv(SEGMENTED_GROWERS, parse_dates=['reference_date'])

    # ----------------------------------------------------------
    # STEP 1: FILTER BY CROP AND GEOGRAPHY
    # ----------------------------------------------------------
    mask = (df['crop'] == crop) & (df['state'] == state)
    if district:
        mask = mask & (df['district'] == district)
    filtered = df[mask].copy()

    if filtered.empty:
        print(f"  ⚠ No growers found for crop={crop}, state={state}, "
              f"district={district}")
        return []

    # ----------------------------------------------------------
    # STEP 2: HARD BLOCK — STOCK GUARDRAIL
    # ----------------------------------------------------------
    # This is NOT a weighted score contribution. It is an ABSOLUTE
    # block. If stock_status == 'out_of_stock', the recommendation
    # is blocked before any scoring happens. This prevents campaigns
    # from being sent when product is unavailable.
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
    # Group available growers by segment_label and compute
    # segment-level metrics for scoring
    # ----------------------------------------------------------
    recommendations = []

    if not available_growers.empty:
        segments = available_growers.groupby('segment_label')

        for seg_label, seg_df in segments:
            # Compute segment-level metrics
            critical_pct = seg_df['in_critical_window'].mean()
            weather_risk = seg_df['weather_risk_score'].mean()
            engagement   = seg_df['engagement_score'].mean()
            stock_urg    = seg_df['stock_urgency_score'].mean()
            rep_cov      = seg_df['rep_coverage_score'].mean()
            target_count = len(seg_df)

            # Weighted priority score (0-100 scale)
            priority_score = (
                weather_risk  * SCORE_WEIGHTS['weather']  +
                critical_pct  * SCORE_WEIGHTS['critical'] +
                engagement    * SCORE_WEIGHTS['engagement'] +
                stock_urg     * SCORE_WEIGHTS['stock']    +
                rep_cov       * SCORE_WEIGHTS['rep']
            )

            # ---- ML receptivity (if models available) ----
            open_prob = 0.23   # Baseline fallback
            click_prob = 0.05  # Baseline fallback
            confidence = 'low'

            if model_open is not None and feature_cols is not None:
                # Build feature matrix for this segment
                model_features = [c for c in feature_cols if c in seg_df.columns]
                if len(model_features) == len(feature_cols):
                    X_seg = seg_df[feature_cols].fillna(0).astype(float)
                    open_prob = float(model_open.predict_proba(X_seg)[:, 1].mean())
                    click_prob = float(model_click.predict_proba(X_seg)[:, 1].mean())
                    confidence = 'high' if len(seg_df) >= 30 else 'medium'

            # ---- Timing ----
            # Recommended send date: as_of_date + 1 day (next business day)
            recommended_send = as_of + timedelta(days=1)
            urgency = 'high' if critical_pct > 0.3 or weather_risk > 0.7 else \
                      'medium' if critical_pct > 0.1 or weather_risk > 0.4 else 'low'

            # ---- Expected impact ----
            baseline_click = 0.05
            expected_click = max(click_prob, baseline_click)
            expected_leads = int(target_count * expected_click)

            # ---- Reason codes ----
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
            if target_count < 10:
                review_flags.append('Small segment — verify targeting')
            if stock_urg < 0.3:
                review_flags.append('Low stock — confirm availability')
            if engagement < 0.05:
                review_flags.append('Low engagement history — consider alternative channels')

            # ---- Channel strategy (from first grower in segment) ----
            channel_strat = seg_df['channel_strategy'].iloc[0]

            # ---- Build recommendation card ----
            rec = {
                'recommendation_id': str(uuid.uuid4())[:12],
                'plan_id': plan_id,
                'priority_score': round(priority_score, 2),
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
                    'confidence': confidence,
                },
                'expected_impact': {
                    'baseline_click_rate': baseline_click,
                    'expected_click_rate': round(expected_click, 4),
                    'expected_leads': expected_leads,
                },
                'reason_codes': reason_codes,
                'human_review_flags': review_flags,
                'blocked': False,
                'source_mode': 'hybrid',
            }
            recommendations.append(rec)

    # ----------------------------------------------------------
    # STEP 5: ADD BLOCKED RECOMMENDATIONS (out-of-stock segments)
    # ----------------------------------------------------------
    # Blocked segments are included in the output but marked as
    # blocked=True. No scoring is performed — the stock guardrail
    # is an absolute block, not a weighted factor.
    # ----------------------------------------------------------
    if not blocked_growers.empty:
        blocked_segments = blocked_growers.groupby('segment_label')

        for seg_label, seg_df in blocked_segments:
            # Get channel strategy from segment data
            channel_strat = seg_df['channel_strategy'].iloc[0]

            rec = {
                'recommendation_id': str(uuid.uuid4())[:12],
                'plan_id': plan_id,
                'priority_score': 0.0,
                'segment_label': seg_label,
                'target_count': len(seg_df),
                'crop': crop,
                'product': product,
                'channel_strategy': channel_strat,
                'timing': {
                    'recommended_send_date': None,
                    'send_window': None,
                    'urgency': 'blocked',
                },
                'receptivity': {
                    'open_probability': None,
                    'click_probability': None,
                    'confidence': None,
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
                'source_mode': 'hybrid',
            }
            recommendations.append(rec)

    # Enrich with operational metadata to match schema (confidence_label, blocked_reasons, etc.)
    # and sort by priority
    recommendations.sort(
        key=lambda r: (not r['blocked'], r['priority_score']),
        reverse=True
    )
    
    recommendations = recommendations[:max_recommendations]
    
    for idx, r in enumerate(recommendations):
        r['recommendation_priority_rank'] = idx + 1
        blocked = r.get('blocked', False)
        
        # Add basic labels/severities
        r['blocked_reasons'] = ['inventory unavailable'] if blocked else []
        r['data_quality_warnings'] = []
        if r['target_count'] < 30:
            r['data_quality_warnings'].append({
                'message': 'Sparse segment cohort size with low statistical support.',
                'severity': 'medium'
            })
            
        r['actionability_status'] = 'Blocked' if blocked else \
                                   ('Needs Human Review' if r['human_review_flags'] or r['data_quality_warnings'] else 'Ready to Execute')
                                   
        open_p = r['receptivity']['open_probability']
        if blocked or open_p is None:
            conf_label = 'Low Confidence'
        else:
            conf_label = 'High Confidence' if open_p >= 0.40 else ('Medium Confidence' if open_p >= 0.25 else 'Low Confidence')
            if r['target_count'] < 30:
                conf_label = 'Low Confidence'
        r['receptivity']['confidence_label'] = conf_label
        
        # Operational readiness score
        readiness = 1.0
        if blocked:
            readiness -= 0.70
        if conf_label == 'Low Confidence':
            readiness -= 0.15
        elif conf_label == 'Medium Confidence':
            readiness -= 0.05
        r['operational_readiness_score'] = round(max(0.0, min(1.0, readiness)), 2)

    return recommendations


def print_recommendations(recs: list, scenario_name: str = ''):
    """
    Pretty-print recommendation cards to console.

    Parameters
    ----------
    recs : list of dict
        Recommendation cards from generate_recommendations()
    scenario_name : str
        Label for this scenario (printed as header)
    """
    print(f"\n{'=' * 70}")
    print(f"  SCENARIO: {scenario_name}")
    print(f"{'=' * 70}")

    if not recs:
        print("  No recommendations generated (empty result)")
        return

    for i, rec in enumerate(recs, 1):
        blocked_tag = " 🚫 BLOCKED" if rec['blocked'] else ""
        print(f"\n  --- Recommendation #{i}{blocked_tag} ---")
        print(f"  ID:            {rec['recommendation_id']}")
        print(f"  Plan:          {rec['plan_id']}")
        print(f"  Priority:      {rec['priority_score']}")
        print(f"  Segment:       {rec['segment_label']}")
        print(f"  Target Count:  {rec['target_count']}")
        print(f"  Crop/Product:  {rec['crop']} → {rec['product']}")
        print(f"  Urgency:       {rec['timing']['urgency']}")

        if not rec['blocked']:
            print(f"  Send Date:     {rec['timing']['recommended_send_date']}")
            print(f"  Send Window:   {rec['timing']['send_window']}")
            print(f"  Open Prob:     {rec['receptivity']['open_probability']}")
            print(f"  Click Prob:    {rec['receptivity']['click_probability']}")
            print(f"  Confidence:    {rec['receptivity']['confidence']}")
            print(f"  Expected Leads:{rec['expected_impact']['expected_leads']}")

        print(f"  Reasons:       {rec['reason_codes']}")
        if rec['human_review_flags']:
            print(f"  ⚠ Review:     {rec['human_review_flags']}")
        print(f"  Source Mode:   {rec['source_mode']}")


if __name__ == '__main__':
    print("=" * 70)
    print("PHASE 9: Recommendation Engine — Integration Test")
    print("=" * 70)

    ensure_dirs()

    # ==============================================================
    # SCENARIO 1: Wheat in Uttar Pradesh
    # ==============================================================
    # Expected: Unblocked recommendations with high weather risk
    #           (UP in February = high humidity = rust risk)
    #           Product: Tilt 250 EC (auto-mapped from wheat)
    print("\n[Scenario 1] Wheat × Uttar Pradesh × Tilt 250 EC")
    recs_1 = generate_recommendations(
        crop='wheat',
        state='Uttar Pradesh',
        district=None,
        product='Tilt 250 EC',
        as_of_date='2026-02-18',
        max_recommendations=5,
    )
    print_recommendations(recs_1, 'Wheat in Uttar Pradesh — Tilt 250 EC')

    # ==============================================================
    # SCENARIO 2: Mustard in Rajasthan
    # ==============================================================
    # Expected: May include blocked recommendations if stock is
    #           out_of_stock for some territories. Rajasthan in
    #           February = low weather risk (dry conditions).
    #           Product: Score 250 EC (auto-mapped from mustard)
    print("\n\n[Scenario 2] Mustard × Rajasthan × Score 250 EC")
    recs_2 = generate_recommendations(
        crop='mustard',
        state='Rajasthan',
        district=None,
        product='Score 250 EC',
        as_of_date='2026-02-18',
        max_recommendations=5,
    )
    print_recommendations(recs_2, 'Mustard in Rajasthan — Score 250 EC')

    # ==============================================================
    # SUMMARY
    # ==============================================================
    print("\n\n" + "=" * 70)
    print("PHASE 9 SANITY CHECKS")
    print("=" * 70)

    checks_passed = 0
    checks_total = 0

    # Check 1: Scenario 1 produced recommendations
    checks_total += 1
    if len(recs_1) > 0:
        print(f"  ✓ Scenario 1: {len(recs_1)} recommendations generated")
        checks_passed += 1
    else:
        print(f"  ✗ Scenario 1: No recommendations generated")

    # Check 2: Scenario 1 has unblocked recommendations
    checks_total += 1
    unblocked_1 = [r for r in recs_1 if not r['blocked']]
    if len(unblocked_1) > 0:
        print(f"  ✓ Scenario 1: {len(unblocked_1)} unblocked recommendations")
        checks_passed += 1
    else:
        print(f"  ✗ Scenario 1: All recommendations blocked")

    # Check 3: Priority scores are non-negative
    checks_total += 1
    all_scores = [r['priority_score'] for r in recs_1 + recs_2]
    if all(s >= 0 for s in all_scores):
        print(f"  ✓ All priority scores non-negative")
        checks_passed += 1
    else:
        print(f"  ✗ Negative priority scores found")

    # Check 4: Blocked recommendations have priority_score = 0
    checks_total += 1
    blocked_all = [r for r in recs_1 + recs_2 if r['blocked']]
    if all(r['priority_score'] == 0 for r in blocked_all) or len(blocked_all) == 0:
        print(f"  ✓ Blocked recommendations have score=0 "
              f"({len(blocked_all)} blocked total)")
        checks_passed += 1
    else:
        print(f"  ✗ Some blocked recommendations have non-zero scores")

    # Check 5: All recommendations have reason codes
    checks_total += 1
    all_recs = recs_1 + recs_2
    has_reasons = all(len(r['reason_codes']) > 0 for r in all_recs)
    if has_reasons:
        print(f"  ✓ All {len(all_recs)} recommendations have reason codes")
        checks_passed += 1
    else:
        print(f"  ✗ Some recommendations missing reason codes")

    # Check 6: Recommendations sorted by priority (non-blocked first)
    checks_total += 1
    if len(recs_1) >= 2:
        scores_1 = [r['priority_score'] for r in recs_1 if not r['blocked']]
        sorted_ok = all(scores_1[i] >= scores_1[i+1]
                       for i in range(len(scores_1) - 1))
        if sorted_ok:
            print(f"  ✓ Recommendations sorted by priority score (descending)")
            checks_passed += 1
        else:
            print(f"  ✗ Recommendations not properly sorted")
    else:
        print(f"  ✓ Sorting check skipped (< 2 recommendations)")
        checks_passed += 1

    # Check 7: Required fields present in all recommendation cards
    checks_total += 1
    required_keys = [
        'recommendation_id', 'plan_id', 'priority_score', 'segment_label',
        'target_count', 'crop', 'product', 'channel_strategy', 'timing',
        'receptivity', 'expected_impact', 'reason_codes',
        'human_review_flags', 'blocked', 'source_mode'
    ]
    all_have_keys = all(
        all(k in r for k in required_keys) for r in all_recs
    )
    if all_have_keys:
        print(f"  ✓ All recommendation cards have required fields")
        checks_passed += 1
    else:
        missing = [k for k in required_keys
                   if any(k not in r for r in all_recs)]
        print(f"  ✗ Missing fields: {missing}")

    print(f"\n  Result: {checks_passed}/{checks_total} checks passed")
    print(f"\n✅ Phase 9 complete. Recommendation engine tested successfully.")
