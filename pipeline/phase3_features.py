"""
==========================================================================
PHASE 3: Feature Engineering
==========================================================================
PURPOSE:
  Create ML-ready features from the master grower table. Raw data is not
  in the right shape for ML. A model can't learn from "flowering date =
  2026-02-20" but CAN learn from "days to flowering = 12" (urgent!).

WHAT IT DOES:
  1. Crop stage features — days to tillering/flowering/harvest, critical window
  2. Engagement history features — open/click rates, engagement score, recency
  3. Segment features — device score, language dummies, farm size buckets
  4. Stock availability features — stock flags, urgency scores
  5. Rep coverage features — normalized visit counts, campaign ratios
  6. Channel eligibility features — WhatsApp/SMS/IVR capability

INPUTS:
  - processed/master_grower_table.csv

OUTPUTS:
  - features/feature_table.csv (~6,000 rows × ~55 columns)
==========================================================================
"""

import pandas as pd
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.config import MASTER_TABLE, FEATURE_TABLE, ensure_dirs


def run_phase3():
    """Execute Phase 3: Feature Engineering."""

    print("=" * 60)
    print("PHASE 3: Feature Engineering")
    print("=" * 60)

    ensure_dirs()

    # Load master table
    print("\n[Step 0] Loading master grower table...")
    master = pd.read_csv(MASTER_TABLE, parse_dates=[
        'sowing_start', 'harvest_start', 'tillering_date', 'flowering_date',
        'product_scan_datetime', 'campaign_attendance_date',
        'wa_last_sent_date', 'wa_first_sent_date', 'rep_last_visit_date'
    ])
    print(f"  Loaded: {master.shape[0]:,} rows × {master.shape[1]} cols")

    # ==============================================================
    # FEATURE GROUP 1: CROP STAGE FEATURES
    # ==============================================================
    # WHY: Whether a grower is 3 days or 45 days from flowering
    #      completely changes whether a fungicide message is urgent.
    #      Fungicide must be applied 7-14 days BEFORE flowering.
    print("\n[Step 1/6] Computing crop stage features...")

    # Reference date: when the WhatsApp message was sent (or a default)
    # For growers without WhatsApp, use a mid-season reference date
    master['reference_date'] = master['wa_last_sent_date'].fillna(
        pd.Timestamp('2026-03-01')
    )

    # Days to each crop stage from reference date
    # Negative = already passed, Positive = upcoming
    master['days_to_tillering'] = (
        master['tillering_date'] - master['reference_date']
    ).dt.days
    master['days_to_flowering'] = (
        master['flowering_date'] - master['reference_date']
    ).dt.days
    master['days_to_harvest'] = (
        master['harvest_start'] - master['reference_date']
    ).dt.days
    master['days_since_sowing'] = (
        master['reference_date'] - master['sowing_start']
    ).dt.days

    # Current crop stage determination
    def determine_current_stage(row):
        """
        Determine the grower's current crop stage based on days to
        tillering and flowering. This becomes a segment dimension.
        """
        d_till = row['days_to_tillering']
        d_flow = row['days_to_flowering']
        d_harv = row['days_to_harvest']

        if pd.isna(d_till) or pd.isna(d_flow):
            return 'unknown'
        elif d_flow < 0 and d_harv > 0:
            return 'post_flowering'        # Between flowering and harvest
        elif d_till < 0 and d_flow >= 0:
            return 'flowering_approaching' # Past tillering, before flowering
        elif d_flow >= 0 and d_flow <= 14:
            return 'pre_flowering'         # Critical 2-week window
        elif d_till >= 0 and d_till <= 21:
            return 'tillering_soon'        # Within 3 weeks of tillering
        else:
            return 'early_vegetative'

    master['current_crop_stage'] = master.apply(determine_current_stage, axis=1)

    # CRITICAL WINDOW: 0-14 days before flowering = best fungicide timing
    master['in_critical_window'] = (
        (master['days_to_flowering'] >= 0) &
        (master['days_to_flowering'] <= 14)
    ).astype(int)

    stage_dist = master['current_crop_stage'].value_counts().to_dict()
    critical_count = master['in_critical_window'].sum()
    print(f"  Crop stages: {stage_dist}")
    print(f"  Growers in critical window (0-14 days to flowering): {critical_count}")

    # ==============================================================
    # FEATURE GROUP 2: ENGAGEMENT HISTORY FEATURES
    # ==============================================================
    # WHY: A grower who opened 3 previous messages is much more likely
    #      to open the next one than someone who never opened any.
    print("\n[Step 2/6] Computing engagement history features...")

    # Engagement score — weighted combination (click is a stronger signal)
    master['engagement_score'] = (
        master['wa_open_rate'] * 0.4 +     # 40% weight to open rate
        master['wa_click_rate'] * 0.6      # 60% weight to click rate
    )

    # Has ANY engagement ever (any channel)
    master['has_any_engagement'] = (
        (master['wa_ever_opened'] == 1) |
        (master['product_scan'] == 1) |
        (master['offline_campaign_attended'] == 1)
    ).astype(int)

    # Days since last WhatsApp message (recency signal)
    # 999 = never received a message
    master['days_since_last_message'] = (
        pd.Timestamp('2026-04-01') - master['wa_last_sent_date']
    ).dt.days.fillna(999)

    # Binary flags for strongest offline signals
    master['product_scan_flag'] = master['product_scan'].fillna(0).astype(int)
    master['offline_attended_flag'] = (
        master['offline_campaign_attended'].fillna(0).astype(int)
    )

    engaged_count = master['has_any_engagement'].sum()
    print(f"  Growers with any engagement: {engaged_count} "
          f"({engaged_count/len(master)*100:.1f}%)")
    print(f"  Mean engagement score: {master['engagement_score'].mean():.4f}")

    # ==============================================================
    # FEATURE GROUP 3: GROWER SEGMENT FEATURES
    # ==============================================================
    # WHY: Language, device type, and farm size determine channel
    #      choice and message format.
    print("\n[Step 3/6] Computing segment features...")

    # Device score: numeric encoding for ML
    device_map = {'smartphone': 2, 'keypad': 1, 'unknown': 0}
    master['device_score'] = master['device_type'].map(device_map).fillna(0)

    # Language one-hot encoding
    language_dummies = pd.get_dummies(master['language'], prefix='lang')
    master = pd.concat([master, language_dummies], axis=1)

    # Farm size buckets
    master['farm_size_bucket'] = pd.cut(
        master['grower_farm_size'],
        bins=[0, 2, 5, 10, 999],
        labels=['small', 'medium', 'large', 'very_large']
    )
    farm_dummies = pd.get_dummies(master['farm_size_bucket'], prefix='farm')
    master = pd.concat([master, farm_dummies], axis=1)

    # Age bucket
    master['age_bucket'] = pd.cut(
        master['grower_age'],
        bins=[0, 35, 50, 65, 100],
        labels=['young', 'mid', 'senior', 'elder']
    )

    print(f"  Device distribution: {master['device_score'].value_counts().to_dict()}")
    print(f"  Language dummies added: {[c for c in master.columns if c.startswith('lang_')]}")
    print(f"  Farm size buckets: {master['farm_size_bucket'].value_counts().to_dict()}")

    # ==============================================================
    # FEATURE GROUP 4: STOCK AVAILABILITY FEATURES
    # ==============================================================
    # WHY: If stock is unavailable, a campaign is wasteful. Stock
    #      availability is both a feature and a hard guardrail.
    print("\n[Step 4/6] Computing stock features...")

    # Binary: is stock sufficient for a campaign?
    master['stock_available'] = (
        master['stock_status'].isin(['healthy', 'watch'])
    ).astype(int)

    # Numeric urgency score
    stock_score_map = {
        'healthy': 1.0,
        'watch': 0.6,
        'low': 0.2,
        'out_of_stock': 0.0
    }
    master['stock_urgency_score'] = (
        master['stock_status'].map(stock_score_map).fillna(0)
    )

    stock_avail = master['stock_available'].mean()
    print(f"  Stock available for campaign: {stock_avail*100:.1f}% of growers")

    # ==============================================================
    # FEATURE GROUP 5: REP COVERAGE FEATURES
    # ==============================================================
    # WHY: Territories with more active reps see higher campaign
    #      conversion because reps do follow-up that reinforces messages.
    print("\n[Step 5/6] Computing rep coverage features...")

    # Normalize visit counts to 0-1 range
    max_visits = master['rep_total_visits'].max()
    master['rep_coverage_score'] = (
        master['rep_total_visits'] / max(max_visits, 1)
    )

    # Campaign activity ratio
    master['rep_campaign_ratio'] = (
        master['rep_campaigns_conducted'] /
        master['rep_total_visits'].clip(lower=1)
    )

    print(f"  Mean rep coverage score: {master['rep_coverage_score'].mean():.4f}")
    print(f"  Mean campaign ratio: {master['rep_campaign_ratio'].mean():.4f}")

    # ==============================================================
    # FEATURE GROUP 6: CHANNEL ELIGIBILITY FEATURES
    # ==============================================================
    # WHY: Hard constraints — can't send WhatsApp to keypad users.
    print("\n[Step 6/6] Computing channel eligibility features...")

    master['can_receive_whatsapp'] = (
        master['device_type'] == 'smartphone'
    ).astype(int)
    master['can_receive_sms'] = (
        master['device_type'].isin(['smartphone', 'keypad'])
    ).astype(int)
    master['needs_ivr_or_rep'] = (
        master['device_type'].isin(['keypad', 'unknown'])
    ).astype(int)

    wa_eligible = master['can_receive_whatsapp'].sum()
    sms_eligible = master['can_receive_sms'].sum()
    ivr_needed = master['needs_ivr_or_rep'].sum()
    print(f"  WhatsApp eligible: {wa_eligible}")
    print(f"  SMS eligible: {sms_eligible}")
    print(f"  Needs IVR/rep: {ivr_needed}")

    # ==============================================================
    # SELECT FINAL FEATURE COLUMNS
    # ==============================================================

    # Features that go into the ML model
    FEATURE_COLUMNS = [
        # Crop stage
        'days_to_tillering', 'days_to_flowering', 'days_to_harvest',
        'days_since_sowing', 'in_critical_window',
        # Engagement
        'wa_open_rate', 'wa_click_rate', 'wa_messages_sent',
        'engagement_score', 'has_any_engagement',
        'days_since_last_message', 'product_scan_flag', 'offline_attended_flag',
        # Segment
        'device_score', 'grower_farm_size', 'grower_age',
        'can_receive_whatsapp', 'can_receive_sms', 'needs_ivr_or_rep',
        # Stock
        'stock_urgency_score', 'stock_available', 'pct_retailers_stocked',
        # Rep coverage
        'rep_coverage_score', 'rep_campaign_ratio',
    ]
    # Add dynamic language and farm dummies
    FEATURE_COLUMNS += [c for c in master.columns if c.startswith('lang_')]
    FEATURE_COLUMNS += [c for c in master.columns if c.startswith('farm_')]

    # Target columns (what we want to predict)
    TARGET_COLUMNS = ['wa_ever_opened', 'wa_ever_clicked']

    # Meta columns (keep for reference, don't feed into model)
    META_COLUMNS = [
        'grower_id', 'state', 'district', 'tehsil', 'territory_id',
        'rep_id', 'crop', 'relevant_product', 'language', 'device_type',
        'current_crop_stage', 'stock_status', 'reference_date',
        'gender', 'age_bucket', 'farm_size_bucket'
    ]

    # Build final feature table
    all_cols = META_COLUMNS + FEATURE_COLUMNS + TARGET_COLUMNS
    # Only include columns that actually exist
    all_cols = [c for c in all_cols if c in master.columns]
    feature_df = master[all_cols].copy()

    # Fill remaining NaN in features with 0 (safe default for numeric)
    for col in FEATURE_COLUMNS:
        if col in feature_df.columns:
            feature_df[col] = feature_df[col].fillna(0)

    # Save
    feature_df.to_csv(FEATURE_TABLE, index=False)

    # ==============================================================
    # SANITY CHECKS
    # ==============================================================
    print("\n" + "=" * 60)
    print("PHASE 3 SANITY CHECKS")
    print("=" * 60)

    feature_cols_present = [c for c in FEATURE_COLUMNS if c in feature_df.columns]
    nan_count = feature_df[feature_cols_present].isna().sum().sum()

    print(f"  Feature table shape: {feature_df.shape}")
    print(f"  Total features: {len(feature_cols_present)}")
    print(f"  Target columns: {TARGET_COLUMNS}")
    print(f"  Meta columns: {len(META_COLUMNS)}")
    print(f"  NaN in features: {nan_count}")
    print(f"  Critical window growers: {feature_df['in_critical_window'].sum()}")
    print(f"  Engagement score range: "
          f"{feature_df['engagement_score'].min():.4f} – "
          f"{feature_df['engagement_score'].max():.4f}")

    if nan_count == 0:
        print(f"  ✓ No NaN in feature columns")
    else:
        print(f"  ✗ {nan_count} NaN in feature columns")

    print(f"\n✅ Phase 3 complete. Feature table saved to features/feature_table.csv")
    return True


if __name__ == '__main__':
    success = run_phase3()
    if not success:
        sys.exit(1)
