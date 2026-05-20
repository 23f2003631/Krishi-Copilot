"""
==========================================================================
PHASE 6: Model Explainability (SHAP Reason Codes)
==========================================================================
PURPOSE:
  Generate human-readable "reason codes" explaining WHY the model gave
  each grower a high or low receptivity score. These reason codes appear
  on recommendation cards in the Streamlit UI.

WHY SHAP:
  SHAP (SHapley Additive exPlanations) assigns each feature a score
  for each individual prediction:
  - Positive SHAP → this feature INCREASED the open probability
  - Negative SHAP → this feature DECREASED the open probability

  Example output: "High score because:
    1. Crop is near flowering stage (+0.08)
    2. High past message open rate (+0.05)
    3. Product well-stocked locally (+0.03)"

INPUTS:
  - models/model_open.pkl
  - models/feature_cols.pkl
  - features/leakage_safe_features.csv

OUTPUTS:
  - features/predictions_with_reasons.csv
  - models/shap_values.pkl
==========================================================================
"""

import pandas as pd
import numpy as np
import shap
import pickle
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.config import (
    MODEL_OPEN, FEATURE_COLS_PKL, LEAKAGE_SAFE_FEATURES,
    PREDICTIONS_W_REASONS, SHAP_VALUES_PKL, ensure_dirs
)


def run_phase6():
    """Execute Phase 6: Model Explainability."""

    print("=" * 60)
    print("PHASE 6: Model Explainability (SHAP Reason Codes)")
    print("=" * 60)

    ensure_dirs()

    # Load model and data
    print("\n[Step 0] Loading model and data...")
    with open(MODEL_OPEN, 'rb') as f:
        model = pickle.load(f)
    with open(FEATURE_COLS_PKL, 'rb') as f:
        FEATURE_COLS = pickle.load(f)

    df = pd.read_csv(LEAKAGE_SAFE_FEATURES, parse_dates=['send_date'])
    X = df[FEATURE_COLS].fillna(0).astype(float)

    print(f"  Model loaded: LGBMClassifier")
    print(f"  Data: {X.shape[0]:,} rows × {X.shape[1]} features")

    # ==============================================================
    # STEP 1: COMPUTE SHAP VALUES
    # ==============================================================
    # WHY: SHAP gives per-feature, per-prediction explanations.
    #      TreeExplainer works natively with LightGBM (fast).
    print("\n[Step 1/3] Computing SHAP values (may take 30-60 seconds)...")

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    # For binary classification, shap_values may be a list [neg_class, pos_class]
    # We want the positive class (class 1 = opened)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]  # Positive class SHAP values

    print(f"  SHAP values shape: {shap_values.shape}")
    print(f"  Expected: ({len(df)}, {len(FEATURE_COLS)})")

    # Save SHAP values for later visualization
    with open(SHAP_VALUES_PKL, 'wb') as f:
        pickle.dump({
            'shap_values': shap_values,
            'feature_names': FEATURE_COLS,
            'expected_value': explainer.expected_value
        }, f)

    # ==============================================================
    # STEP 2: GENERATE HUMAN-READABLE REASON CODES
    # ==============================================================
    # WHY: Raw SHAP values like "days_to_flowering: +0.083" are not
    #      useful to a campaign manager. We translate them to business
    #      language: "Crop near flowering stage"
    print("\n[Step 2/3] Generating human-readable reason codes...")

    # Feature → human-readable label mapping
    FEATURE_LABELS = {
        'days_to_flowering':      'Crop near flowering stage',
        'in_critical_window':     'In critical fungicide application window',
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

    def get_reason_codes(shap_row, feature_names, n_reasons=3):
        """
        Given SHAP values for one prediction, return top N positive
        reasons (why the score is high) in human-readable text.
        
        Only includes features with meaningful positive contribution
        (SHAP > 0.01 to filter noise).
        """
        shap_dict = dict(zip(feature_names, shap_row))

        # Sort by SHAP value — most positive first
        sorted_features = sorted(
            shap_dict.items(),
            key=lambda x: x[1],
            reverse=True
        )

        positive_reasons = []
        for feat, val in sorted_features:
            if val > 0.01 and feat in FEATURE_LABELS:
                positive_reasons.append(FEATURE_LABELS[feat])
            if len(positive_reasons) >= n_reasons:
                break

        return positive_reasons if positive_reasons else ['Contextual signals available']

    # Apply to all rows
    reason_codes_list = [
        get_reason_codes(shap_values[i], FEATURE_COLS)
        for i in range(len(df))
    ]

    # ==============================================================
    # STEP 3: ATTACH PREDICTIONS + REASON CODES
    # ==============================================================
    print("\n[Step 3/3] Building predictions with reasons...")

    # Get model predictions (probabilities)
    open_probs = model.predict_proba(X)[:, 1]

    df['open_probability'] = open_probs
    df['priority_score']   = (open_probs * 100).round(0).astype(int)
    df['reason_codes']     = reason_codes_list

    # Save output
    output_cols = [
        'message_id', 'grower_id', 'send_date', 'crop', 'state',
        'territory_id', 'open_probability', 'priority_score',
        'reason_codes', 'label_opened', 'label_clicked'
    ]
    output_cols = [c for c in output_cols if c in df.columns]
    output = df[output_cols].copy()

    # Convert reason_codes list to string for CSV storage
    output['reason_codes'] = output['reason_codes'].apply(str)

    output.to_csv(PREDICTIONS_W_REASONS, index=False)

    # Print sample predictions
    print(f"\n  === SAMPLE PREDICTIONS (top 10 by priority) ===")
    top10 = output.sort_values('priority_score', ascending=False).head(10)
    for _, row in top10.iterrows():
        print(f"  {row['grower_id']} | Score: {row['priority_score']} | "
              f"Open prob: {row['open_probability']:.3f} | "
              f"Reasons: {row['reason_codes'][:80]}")

    # Print distribution of priority scores
    print(f"\n  Priority score distribution:")
    print(f"    Mean:   {output['priority_score'].mean():.1f}")
    print(f"    Median: {output['priority_score'].median():.1f}")
    print(f"    Min:    {output['priority_score'].min()}")
    print(f"    Max:    {output['priority_score'].max()}")
    print(f"    Std:    {output['priority_score'].std():.1f}")

    # ==============================================================
    # SANITY CHECKS
    # ==============================================================
    print("\n" + "=" * 60)
    print("PHASE 6 SANITY CHECKS")
    print("=" * 60)

    checks_passed = 0
    checks_total = 0

    # Check 1: SHAP values shape matches data
    checks_total += 1
    if shap_values.shape == X.shape:
        print(f"  ✓ SHAP shape matches: {shap_values.shape}")
        checks_passed += 1
    else:
        print(f"  ✗ SHAP shape mismatch: {shap_values.shape} vs {X.shape}")

    # Check 2: All predictions have reason codes
    checks_total += 1
    no_reasons = sum(1 for r in reason_codes_list if not r)
    if no_reasons == 0:
        print(f"  ✓ All {len(reason_codes_list)} predictions have reason codes")
        checks_passed += 1
    else:
        print(f"  ✗ {no_reasons} predictions missing reason codes")

    # Check 3: Priority scores are in valid range (0-100)
    checks_total += 1
    min_score = output['priority_score'].min()
    max_score = output['priority_score'].max()
    if 0 <= min_score and max_score <= 100:
        print(f"  ✓ Priority scores in valid range: {min_score} – {max_score}")
        checks_passed += 1
    else:
        print(f"  ✗ Priority scores out of range: {min_score} – {max_score}")

    # Check 4: Output file saved
    checks_total += 1
    if os.path.exists(PREDICTIONS_W_REASONS):
        print(f"  ✓ Predictions file saved")
        checks_passed += 1
    else:
        print(f"  ✗ Predictions file missing")

    print(f"\n  Result: {checks_passed}/{checks_total} checks passed")
    print(f"\n✅ Phase 6 complete. Predictions with SHAP reason codes saved.")
    return True


if __name__ == '__main__':
    success = run_phase6()
    if not success:
        sys.exit(1)
