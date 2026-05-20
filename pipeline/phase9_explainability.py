"""
==========================================================================
PHASE 9: Model Explainability (SHAP Precomputation)
==========================================================================
PURPOSE:
  Precompute model explanation reason codes using SHAP (SHapley Additive
  exPlanations) offline. This satisfies the critical architectural correction:
  "SHAP MUST be precomputed offline (in Phase 9), NOT during requests."

WHY SHAP:
  SHAP values explain how much each feature contributed (positively or
  negatively) to the model's prediction for each grower.

PRECOMPUTATION LOGIC:
  1. Load the LightGBM models trained in Phase 5.
  2. Load all 6,000 growers from features/segmented_growers.csv.
  3. Map the grower features to the schema expected by the LightGBM models.
  4. Compute SHAP values for the "open" probability model using TreeExplainer.
  5. Aggregate SHAP values at the segment level (mean SHAP value per feature).
  6. Map the top positive SHAP features for each segment to human-readable
     business reason codes.
  7. Save the segment-to-reason-codes dictionary as a JSON file.

OUTPUTS:
  - features/segment_shap_reasons.json
  - exports/demo/reason_codes.json
==========================================================================
"""

import pandas as pd
import numpy as np
import shap
import pickle
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.config import (
    MODEL_OPEN, FEATURE_COLS_PKL, SEGMENTED_GROWERS,
    ensure_dirs
)

# Human-readable label mapping for features
FEATURE_LABELS = {
    'days_to_flowering':      'Crop near flowering stage',
    'in_critical_window':     'In critical crop stage window',
    'days_to_harvest':        'Sufficient time before harvest',
    'days_to_tillering':      'Crop approaching tillering stage',
    'prior_open_rate':        'High past message open rate',
    'prior_click_rate':       'High past message click rate',
    'prior_msg_count':        'Multiple prior messages sent',
    'scan_before_send':       'Grower previously scanned product',
    'attended_before_send':   'Attended offline campaign before',
    'device_score':           'Uses smartphone (digital-ready)',
    'grower_farm_size':       'Large farm size (high-value grower)',
    'grower_age':             'Age profile matches target segment',
    'stock_urgency_score':    'Product well-stocked locally',
    'rep_coverage_score':     'Territory has active rep coverage',
    'pct_retailers_stocked':  'High retailer stock availability',
    'rep_campaign_ratio':     'Active campaign execution in territory',
}


def run_phase9():
    """Execute Phase 9: Precompute SHAP values and save reason codes."""
    print("=" * 60)
    print("PHASE 9: Model Explainability (SHAP Precomputation)")
    print("=" * 60)

    ensure_dirs()

    # Load model, feature columns list, and segmented growers
    print("\n[Step 1/5] Loading model and grower data...")
    try:
        with open(MODEL_OPEN, 'rb') as f:
            model = pickle.load(f)
        with open(FEATURE_COLS_PKL, 'rb') as f:
            feature_cols = pickle.load(f)
    except FileNotFoundError as e:
        print(f"  ✗ Error loading model or features metadata: {e}")
        print("  Ensure Phase 5 model training has been executed successfully first.")
        return False

    if not os.path.exists(SEGMENTED_GROWERS):
        print(f"  ✗ Segmented growers file missing: {SEGMENTED_GROWERS}")
        print("  Ensure Phase 7 segmentation has been executed successfully first.")
        return False

    df = pd.read_csv(SEGMENTED_GROWERS)
    print(f"  Growers: {df.shape[0]:,} rows × {df.shape[1]} columns")

    # Map the segmented growers data to the ML feature names
    print("\n[Step 2/5] Mapping columns to ML model feature schema...")
    X_all = pd.DataFrame(index=df.index)
    X_all['prior_open_rate'] = df['wa_open_rate']
    X_all['prior_click_rate'] = df['wa_click_rate']
    X_all['prior_msg_count'] = df['wa_messages_sent']
    X_all['scan_before_send'] = df['product_scan_flag']
    X_all['attended_before_send'] = df['offline_attended_flag']
    X_all['days_to_flowering'] = df['days_to_flowering']
    X_all['days_to_harvest'] = df['days_to_harvest']
    X_all['days_to_tillering'] = df['days_to_tillering']
    X_all['in_critical_window'] = df['in_critical_window']
    X_all['device_score'] = df['device_score']
    X_all['grower_farm_size'] = df['grower_farm_size']
    X_all['grower_age'] = df['grower_age']
    X_all['stock_urgency_score'] = df['stock_urgency_score']
    X_all['rep_coverage_score'] = df['rep_coverage_score']
    X_all['pct_retailers_stocked'] = df['pct_retailers_stocked']
    X_all['rep_campaign_ratio'] = df['rep_campaign_ratio']

    # Handle language dummy columns if any are in feature_cols
    for col in feature_cols:
        if col not in X_all.columns:
            if col in df.columns:
                X_all[col] = df[col]
            else:
                X_all[col] = 0.0

    X_all = X_all[feature_cols].fillna(0).astype(float)

    # Compute SHAP values
    print("\n[Step 3/5] Computing SHAP values using TreeExplainer (approx 10-20 sec)...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_all)

    # For binary classification, handle list output
    if isinstance(shap_values, list):
        shap_values = shap_values[1]

    print(f"  SHAP values computed. Shape: {shap_values.shape}")

    # Build a DataFrame of SHAP values
    shap_df = pd.DataFrame(shap_values, columns=feature_cols)
    shap_df['segment_label'] = df['segment_label']

    # Aggregate SHAP values at the segment level (mean)
    print("\n[Step 4/5] Aggregating SHAP values by segment...")
    segment_shap = shap_df.groupby('segment_label').mean()

    # Generate top 3 reason codes per segment
    segment_reasons = {}
    for seg_label, row in segment_shap.iterrows():
        # Sort features by SHAP value descending
        sorted_feats = row.sort_values(ascending=False)
        
        reasons = []
        for feat, val in sorted_feats.items():
            if val > 0.005 and feat in FEATURE_LABELS:
                reasons.append(FEATURE_LABELS[feat])
            if len(reasons) >= 3:
                break
                
        if not reasons:
            reasons = ["Contextual signals support outreach"]
            
        segment_reasons[seg_label] = reasons

    # Print a few samples
    print("\n  Sample Segment Explainability Reason Codes:")
    sample_labels = list(segment_reasons.keys())[:5]
    for lbl in sample_labels:
        print(f"    - Segment: {lbl}")
        print(f"      Reasons: {segment_reasons[lbl]}")

    # Save to features output directory
    features_dir = os.path.dirname(SEGMENTED_GROWERS)
    reasons_features_path = os.path.join(features_dir, 'segment_shap_reasons.json')
    with open(reasons_features_path, 'w', encoding='utf-8') as f:
        json.dump(segment_reasons, f, indent=2)
    print(f"\n✓ Saved feature reasons to {reasons_features_path}")

    # Save to demo cache directory for frontend/backend loading
    demo_dir = os.path.join(features_dir, '..', 'exports', 'demo')
    os.makedirs(demo_dir, exist_ok=True)
    reasons_demo_path = os.path.join(demo_dir, 'reason_codes.json')
    with open(reasons_demo_path, 'w', encoding='utf-8') as f:
        json.dump(segment_reasons, f, indent=2)
    print(f"✓ Saved demo reasons to {reasons_demo_path}")

    return True


def run_phase():
    """Expose run capability."""
    return run_phase9()


def validate_phase():
    """Validate Phase 9 output."""
    features_dir = os.path.dirname(SEGMENTED_GROWERS)
    reasons_features_path = os.path.join(features_dir, 'segment_shap_reasons.json')
    reasons_demo_path = os.path.join(features_dir, '..', 'exports', 'demo', 'reason_codes.json')
    return os.path.exists(reasons_features_path) and os.path.exists(reasons_demo_path)


if __name__ == '__main__':
    success = run_phase()
    if not success:
        sys.exit(1)
