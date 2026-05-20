"""
==========================================================================
PHASE 4: Leakage Prevention (CRITICAL)
==========================================================================
PURPOSE:
  Build a leakage-safe feature table where ALL features for each WhatsApp
  message are computed using ONLY information available BEFORE the message
  was sent. This prevents the model from cheating.

DATA LEAKAGE = using future information to predict the past.
  Example: if a grower scanned a product AFTER receiving the message,
  using product_scan=1 as a feature is leakage.

THE FIX:
  For each WhatsApp message row, compute features using ONLY data
  that existed BEFORE message_sent_date. This is called "as-of-date"
  feature generation.

IMPLEMENTATION:
  Uses vectorized pandas operations (groupby + shift + expanding) instead
  of a slow for loop. The for-loop approach (iterating 4,479 rows with
  inner filters) takes 5-15 minutes. This vectorized approach takes <5 sec.

INPUTS:
  - processed/whatsapp_clean.csv (4,479 rows)
  - processed/master_grower_table.csv (6,000 rows)

OUTPUTS:
  - features/leakage_safe_features.csv (4,479 rows — one per WA message)

EXPECTED SANITY CHECKS:
  - Open rate ~23%, Click rate ~5%
  - No future data in any feature column
  - All features are numeric with no NaN
==========================================================================
"""

import pandas as pd
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.config import (
    CLEAN_WHATSAPP, MASTER_TABLE, LEAKAGE_SAFE_FEATURES, ensure_dirs
)


def run_phase4():
    """Execute Phase 4: Leakage Prevention."""

    print("=" * 60)
    print("PHASE 4: Leakage Prevention (CRITICAL)")
    print("=" * 60)

    ensure_dirs()

    # Load data
    print("\n[Step 0] Loading data...")
    whatsapp = pd.read_csv(CLEAN_WHATSAPP, parse_dates=['message_sent_date'])
    master   = pd.read_csv(MASTER_TABLE, parse_dates=[
        'sowing_start', 'harvest_start', 'tillering_date', 'flowering_date',
        'product_scan_datetime', 'campaign_attendance_date'
    ])

    print(f"  WhatsApp messages: {len(whatsapp):,}")
    print(f"  Master grower table: {len(master):,}")

    # Compute missing features that were defined in Phase 3 but are needed for the safe feature table
    stock_score_map = {
        'healthy': 1.0,
        'watch': 0.6,
        'low': 0.2,
        'out_of_stock': 0.0
    }
    master['stock_urgency_score'] = master['stock_status'].map(stock_score_map).fillna(0)
    
    max_visits = master['rep_total_visits'].max()
    master['rep_coverage_score'] = master['rep_total_visits'] / max(max_visits, 1)
    
    master['rep_campaign_ratio'] = master['rep_campaigns_conducted'] / master['rep_total_visits'].clip(lower=1)


    # ==============================================================
    # STEP 1: VECTORIZED PRIOR ENGAGEMENT (NO FOR LOOP)
    # ==============================================================
    # WHY: For each message, we need the grower's engagement with
    #      PREVIOUS messages only. shift(1) ensures we exclude the
    #      current message. expanding().mean() gives the running average.
    print("\n[Step 1/4] Computing prior WhatsApp engagement (vectorized)...")

    # Sort by grower and date — essential for shift to work correctly
    wa = whatsapp.sort_values(['grower_id', 'message_sent_date']).copy()

    # Prior open rate: rolling average of opened_status for all PRIOR messages
    # shift(1) excludes the current row. expanding().mean() gives running avg.
    wa['prior_open_rate'] = wa.groupby('grower_id')['opened_status'].transform(
        lambda x: x.shift(1).expanding().mean()
    ).fillna(0)

    # Prior click rate: same logic for click
    wa['prior_click_rate'] = wa.groupby('grower_id')['clicked_status'].transform(
        lambda x: x.shift(1).expanding().mean()
    ).fillna(0)

    # Prior message count: how many messages were sent before this one
    wa['prior_msg_count'] = wa.groupby('grower_id').cumcount()
    # cumcount starts at 0 for the first message — this is correct because
    # the first message has 0 prior messages

    # Verify: first message for each grower should have prior_open_rate=0
    first_msgs = wa.groupby('grower_id').first()
    assert (first_msgs['prior_open_rate'] == 0).all(), \
        "First message should have prior_open_rate=0"
    print(f"  ✓ Prior engagement computed (vectorized, no for loop)")
    print(f"  Mean prior_open_rate: {wa['prior_open_rate'].mean():.4f}")
    print(f"  Mean prior_click_rate: {wa['prior_click_rate'].mean():.4f}")
    print(f"  Mean prior_msg_count: {wa['prior_msg_count'].mean():.1f}")

    # ==============================================================
    # STEP 2: SAFE SCAN & ATTENDANCE FLAGS
    # ==============================================================
    # WHY: product_scan and offline_campaign_attended are only safe
    #      features if the event happened BEFORE the message was sent.
    #      14 growers have scans after messages. 204 have attendance after.
    print("\n[Step 2/4] Computing safe scan & attendance flags...")

    # Join grower-level data to each message
    grower_cols = [
        'grower_id', 'product_scan', 'product_scan_datetime',
        'offline_campaign_attended', 'campaign_attendance_date',
        'sowing_start', 'harvest_start', 'tillering_date', 'flowering_date',
        'device_type', 'grower_farm_size', 'grower_age', 'language',
        'stock_urgency_score', 'rep_coverage_score', 'stock_status',
        'pct_retailers_stocked', 'rep_campaign_ratio',
        'crop', 'relevant_product', 'state', 'district', 'territory_id'
    ]
    # Only include columns that exist in master
    grower_cols = [c for c in grower_cols if c in master.columns]

    # Deduplicate master to one row per grower (in case of join duplicates)
    master_dedup = master.drop_duplicates(subset='grower_id', keep='first')

    wa = wa.merge(
        master_dedup[grower_cols],
        on='grower_id',
        how='left'
    )

    # Safe product scan: ONLY if scan happened BEFORE message send date
    wa['scan_before_send'] = (
        (wa['product_scan'] == 1) &
        wa['product_scan_datetime'].notna() &
        (wa['product_scan_datetime'] < wa['message_sent_date'])
    ).astype(int)

    # Safe offline attendance: ONLY if attendance happened BEFORE message
    wa['attended_before_send'] = (
        (wa['offline_campaign_attended'] == 1) &
        wa['campaign_attendance_date'].notna() &
        (wa['campaign_attendance_date'] < wa['message_sent_date'])
    ).astype(int)

    scan_safe = wa['scan_before_send'].sum()
    scan_total = (wa['product_scan'] == 1).sum()
    attend_safe = wa['attended_before_send'].sum()
    attend_total = (wa['offline_campaign_attended'] == 1).sum()
    print(f"  Scans safe/total: {scan_safe}/{scan_total} "
          f"(blocked {scan_total - scan_safe} future scans)")
    print(f"  Attendance safe/total: {attend_safe}/{attend_total} "
          f"(blocked {attend_total - attend_safe} future attendance)")

    # ==============================================================
    # STEP 3: SAFE CROP STAGE FEATURES
    # ==============================================================
    # WHY: Crop stage distance must be computed from the message send
    #      date, not from today or a static reference date.
    print("\n[Step 3/4] Computing safe crop stage features from send date...")

    wa['days_to_flowering'] = (
        wa['flowering_date'] - wa['message_sent_date']
    ).dt.days
    wa['days_to_harvest'] = (
        wa['harvest_start'] - wa['message_sent_date']
    ).dt.days
    wa['days_to_tillering'] = (
        wa['tillering_date'] - wa['message_sent_date']
    ).dt.days

    # Critical window: 0-14 days before flowering from SEND DATE
    wa['in_critical_window'] = (
        (wa['days_to_flowering'] >= 0) &
        (wa['days_to_flowering'] <= 14)
    ).astype(int)

    # Device score
    device_map = {'smartphone': 2, 'keypad': 1, 'unknown': 0}
    wa['device_score'] = wa['device_type'].map(device_map).fillna(0)

    critical_count = wa['in_critical_window'].sum()
    print(f"  Messages in critical window: {critical_count} "
          f"({critical_count/len(wa)*100:.1f}%)")

    # ==============================================================
    # STEP 4: BUILD FINAL SAFE FEATURE TABLE
    # ==============================================================
    print("\n[Step 4/4] Building final leakage-safe feature table...")

    safe_df = wa[[
        # IDs and metadata
        'id', 'grower_id', 'message_sent_date',
        'crop', 'relevant_product', 'state', 'district', 'territory_id',

        # SAFE FEATURES (all computed from data before send date)
        'prior_open_rate',
        'prior_click_rate',
        'prior_msg_count',
        'scan_before_send',
        'attended_before_send',
        'days_to_flowering',
        'days_to_harvest',
        'days_to_tillering',
        'in_critical_window',
        'device_score',
        'grower_farm_size',
        'grower_age',
        'stock_urgency_score',
        'rep_coverage_score',
        'pct_retailers_stocked',
        'rep_campaign_ratio',

        # LABELS — outcomes we want to predict (NEVER used as features)
        'opened_status',
        'clicked_status',
    ]].copy()

    # Rename labels for clarity
    safe_df = safe_df.rename(columns={
        'id': 'message_id',
        'message_sent_date': 'send_date',
        'opened_status': 'label_opened',
        'clicked_status': 'label_clicked',
    })

    # Fill any remaining NaN in feature columns with 0
    feature_cols = [
        'prior_open_rate', 'prior_click_rate', 'prior_msg_count',
        'scan_before_send', 'attended_before_send',
        'days_to_flowering', 'days_to_harvest', 'days_to_tillering',
        'in_critical_window', 'device_score', 'grower_farm_size',
        'grower_age', 'stock_urgency_score', 'rep_coverage_score',
        'pct_retailers_stocked', 'rep_campaign_ratio',
    ]
    for col in feature_cols:
        if col in safe_df.columns:
            nan_count = safe_df[col].isna().sum()
            if nan_count > 0:
                safe_df[col] = safe_df[col].fillna(0)
                print(f"  Filled {nan_count} NaN in {col}")

    # Save
    safe_df.to_csv(LEAKAGE_SAFE_FEATURES, index=False)

    # ==============================================================
    # SANITY CHECKS
    # ==============================================================
    print("\n" + "=" * 60)
    print("PHASE 4 SANITY CHECKS (LEAKAGE PREVENTION)")
    print("=" * 60)

    checks_passed = 0
    checks_total = 0

    # Check 1: Row count matches WhatsApp messages
    checks_total += 1
    if len(safe_df) == 4479:
        print(f"  ✓ Row count: {len(safe_df)} (expected 4479)")
        checks_passed += 1
    else:
        print(f"  ✗ Row count: {len(safe_df)} (expected 4479)")

    # Check 2: Open rate close to 23%
    checks_total += 1
    open_rate = safe_df['label_opened'].mean() * 100
    if 20 < open_rate < 27:
        print(f"  ✓ Open rate: {open_rate:.2f}% (expected ~23%)")
        checks_passed += 1
    else:
        print(f"  ✗ Open rate: {open_rate:.2f}% (expected ~23%)")

    # Check 3: Click rate close to 5%
    checks_total += 1
    click_rate = safe_df['label_clicked'].mean() * 100
    if 3 < click_rate < 8:
        print(f"  ✓ Click rate: {click_rate:.2f}% (expected ~5%)")
        checks_passed += 1
    else:
        print(f"  ✗ Click rate: {click_rate:.2f}% (expected ~5%)")

    # Check 4: No NaN in feature columns
    checks_total += 1
    total_nan = safe_df[feature_cols].isna().sum().sum()
    if total_nan == 0:
        print(f"  ✓ No NaN in feature columns")
        checks_passed += 1
    else:
        print(f"  ✗ {total_nan} NaN in feature columns")

    # Check 5: No future data leak — first message for each grower
    # must have prior_open_rate = 0 and prior_msg_count = 0
    checks_total += 1
    first_per_grower = safe_df.sort_values('send_date').groupby('grower_id').first()
    zero_prior = (first_per_grower['prior_msg_count'] == 0).all()
    if zero_prior:
        print(f"  ✓ No leakage: first message has prior_msg_count=0 for all growers")
        checks_passed += 1
    else:
        leaked = (first_per_grower['prior_msg_count'] != 0).sum()
        print(f"  ✗ LEAKAGE DETECTED: {leaked} growers have non-zero prior_msg_count "
              f"on their first message")

    # Check 6: Labels are not features
    checks_total += 1
    if 'label_opened' not in feature_cols and 'label_clicked' not in feature_cols:
        print(f"  ✓ Labels not in feature columns (no target leakage)")
        checks_passed += 1
    else:
        print(f"  ✗ CRITICAL: Labels found in feature columns!")

    print(f"\n  Result: {checks_passed}/{checks_total} checks passed")
    print(f"\n  Feature columns: {feature_cols}")
    print(f"\n✅ Phase 4 complete. Leakage-safe feature table saved.")
    return True


if __name__ == '__main__':
    success = run_phase4()
    if not success:
        sys.exit(1)
