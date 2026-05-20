"""
==========================================================================
PHASE 8: Grower Segmentation
==========================================================================
PURPOSE:
  Divide growers into meaningful segments for targeted campaigns. Each
  segment combines four dimensions: Crop × Language × Device × CropStage.

  Example segment: "Hindi Smartphone wheat growers (pre_flowering)"

  This segmentation drives:
  1. Message content — language, complexity, product focus
  2. Channel strategy — WhatsApp for smartphones, IVR for keypad
  3. Timing priority — critical window segments get priority
  4. Rep assignment — which field reps to deploy where

WHY NOT CLUSTERING:
  K-means or DBSCAN would produce opaque segments like "Cluster 3".
  Rule-based segmentation produces interpretable labels that campaign
  managers can immediately act on. For a hackathon, clarity > complexity.

CHANNEL STRATEGY:
  Rule-based by device type (not ML — hard constraints):
  - Smartphone users → WhatsApp (primary), Field Rep, SMS
  - Keypad users     → IVR (primary), Field Rep, Retailer
  - Unknown device   → Field Rep (primary), Retailer

INPUTS:
  - features/feature_table_with_weather.csv (from Phase 7)

OUTPUTS:
  - features/segmented_growers.csv
==========================================================================
"""

import pandas as pd
import numpy as np
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.config import FEATURE_TABLE_WEATHER, SEGMENTED_GROWERS, ensure_dirs
from configs.crop_product_map import CROP_PRODUCT_MAP


def get_channel_strategy(device_type: str) -> str:
    """
    Generate a channel recommendation strategy based on device type.

    This is a rule-based system (not ML) because channel eligibility is
    a hard constraint — you CANNOT send WhatsApp to a keypad phone.

    Parameters
    ----------
    device_type : str
        One of 'smartphone', 'keypad', or 'unknown'

    Returns
    -------
    str
        JSON string containing a list of dicts, each with:
        - channel : str (e.g., 'whatsapp', 'ivr', 'field_rep')
        - rank    : int (1 = primary channel)
        - reason  : str (why this channel was chosen)

    Example
    -------
    >>> get_channel_strategy('smartphone')
    '[{"channel": "whatsapp", "rank": 1, "reason": "..."}, ...]'
    """
    if device_type == 'smartphone':
        strategy = [
            {
                'channel': 'whatsapp',
                'rank': 1,
                'reason': 'Primary digital channel — highest open rate for smartphone users'
            },
            {
                'channel': 'field_rep',
                'rank': 2,
                'reason': 'Follow-up reinforcement by territory rep'
            },
            {
                'channel': 'sms',
                'rank': 3,
                'reason': 'Fallback if WhatsApp undelivered'
            },
        ]
    elif device_type == 'keypad':
        strategy = [
            {
                'channel': 'ivr',
                'rank': 1,
                'reason': 'Voice-based outreach — keypad users cannot receive WhatsApp'
            },
            {
                'channel': 'field_rep',
                'rank': 2,
                'reason': 'In-person follow-up for non-digital growers'
            },
            {
                'channel': 'retailer',
                'rank': 3,
                'reason': 'Retailer point-of-sale recommendation'
            },
        ]
    else:
        # Unknown device type — safest channels only
        strategy = [
            {
                'channel': 'field_rep',
                'rank': 1,
                'reason': 'Device type unknown — default to in-person outreach'
            },
            {
                'channel': 'retailer',
                'rank': 2,
                'reason': 'Retailer as secondary touchpoint'
            },
        ]

    return json.dumps(strategy)


def run_phase8():
    """Execute Phase 8: Grower Segmentation."""

    print("=" * 60)
    print("PHASE 8: Grower Segmentation")
    print("=" * 60)

    ensure_dirs()

    # ==============================================================
    # STEP 1: LOAD WEATHER-ENRICHED FEATURE TABLE
    # ==============================================================
    print("\n[Step 1/5] Loading weather-enriched feature table...")
    df = pd.read_csv(FEATURE_TABLE_WEATHER, parse_dates=['reference_date'])
    print(f"  Loaded: {df.shape[0]:,} rows × {df.shape[1]} cols")

    # ==============================================================
    # STEP 2: CREATE SEGMENT LABELS
    # ==============================================================
    # WHY: Combine 4 dimensions into a human-readable segment label.
    #      This gives campaign managers an instant understanding of
    #      who is in each segment and how to reach them.
    #
    #      Format: "{language} {device_label} {crop} growers ({stage})"
    #      Example: "Hindi Smartphone wheat growers (pre_flowering)"
    print("\n[Step 2/5] Creating segment labels...")

    # Map device_type to a friendly label for the segment name
    device_label_map = {
        'smartphone': 'Smartphone',
        'keypad':     'Keypad/IVR',
        'unknown':    'Keypad/IVR',   # Conservative assumption
    }
    df['device_label'] = df['device_type'].map(device_label_map).fillna('Keypad/IVR')

    # Build the composite segment label
    df['segment_label'] = (
        df['language'].str.title() + ' ' +
        df['device_label'] + ' ' +
        df['crop'].str.lower() + ' growers' +
        ' (' + df['current_crop_stage'].fillna('unknown') + ')'
    )

    n_segments = df['segment_label'].nunique()
    print(f"  Created {n_segments} unique segments")

    # ==============================================================
    # STEP 3: ASSIGN CHANNEL STRATEGY
    # ==============================================================
    # WHY: Each grower gets a ranked list of recommended channels
    #      based on their device type. This is stored as JSON so the
    #      recommendation engine can parse it programmatically.
    print("\n[Step 3/5] Assigning channel strategy per grower...")

    df['channel_strategy'] = df['device_type'].apply(get_channel_strategy)

    # Print channel strategy distribution
    channel_counts = df['device_type'].value_counts().to_dict()
    print(f"  Channel strategy by device type:")
    for device, count in channel_counts.items():
        primary = json.loads(get_channel_strategy(device))[0]['channel']
        print(f"    {device}: {count:,} growers → primary channel: {primary}")

    # ==============================================================
    # STEP 4: COMPUTE SEGMENT SIZING SUMMARY
    # ==============================================================
    # WHY: Campaign managers need to know how many growers are in each
    #      segment, their average farm size (value indicator), and
    #      smartphone penetration (digital reachability).
    print("\n[Step 4/5] Computing segment sizing summary...")

    # Compute per-segment metrics
    segment_stats = df.groupby('segment_label').agg(
        grower_count=('grower_id', 'count'),
        avg_farm_size=('grower_farm_size', 'mean'),
        smartphone_pct=('device_type', lambda x: (x == 'smartphone').mean() * 100),
    ).reset_index()

    # Merge segment-level stats back to the grower table
    # (each grower gets their segment's summary metrics)
    df = df.merge(
        segment_stats,
        on='segment_label',
        how='left'
    )

    print(f"  Total segments: {len(segment_stats)}")
    print(f"  Mean segment size: {segment_stats['grower_count'].mean():.0f} growers")
    print(f"  Median segment size: {segment_stats['grower_count'].median():.0f} growers")

    # ==============================================================
    # STEP 5: SAVE SEGMENTED GROWERS
    # ==============================================================
    print("\n[Step 5/5] Saving segmented growers...")
    df.to_csv(SEGMENTED_GROWERS, index=False)
    print(f"  ✓ Saved to features/segmented_growers.csv")
    print(f"  Shape: {df.shape[0]:,} rows × {df.shape[1]} cols")

    # ==============================================================
    # TOP 15 SEGMENTS BY SIZE
    # ==============================================================
    print(f"\n  === TOP 15 SEGMENTS BY SIZE ===")
    top_segments = segment_stats.sort_values('grower_count', ascending=False).head(15)
    for i, (_, row) in enumerate(top_segments.iterrows(), 1):
        print(f"  {i:2d}. {row['segment_label'][:55]:55s} | "
              f"n={row['grower_count']:>5,} | "
              f"farm={row['avg_farm_size']:.1f}ac | "
              f"smart={row['smartphone_pct']:.0f}%")

    # ==============================================================
    # SANITY CHECKS
    # ==============================================================
    print("\n" + "=" * 60)
    print("PHASE 8 SANITY CHECKS")
    print("=" * 60)

    checks_passed = 0
    checks_total = 0

    # Check 1: All growers have a segment label
    checks_total += 1
    null_segments = df['segment_label'].isna().sum()
    if null_segments == 0:
        print(f"  ✓ All {len(df):,} growers assigned to a segment")
        checks_passed += 1
    else:
        print(f"  ✗ {null_segments} growers missing segment_label")

    # Check 2: All growers have a channel strategy
    checks_total += 1
    null_channels = df['channel_strategy'].isna().sum()
    if null_channels == 0:
        print(f"  ✓ All growers have channel_strategy")
        checks_passed += 1
    else:
        print(f"  ✗ {null_channels} growers missing channel_strategy")

    # Check 3: Channel strategy is valid JSON
    checks_total += 1
    try:
        sample_strategy = json.loads(df['channel_strategy'].iloc[0])
        has_keys = all(
            k in sample_strategy[0] for k in ['channel', 'rank', 'reason']
        )
        if has_keys:
            print(f"  ✓ Channel strategy is valid JSON with correct keys")
            checks_passed += 1
        else:
            print(f"  ✗ Channel strategy JSON missing expected keys")
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        print(f"  ✗ Channel strategy is not valid JSON: {e}")

    # Check 4: Row count preserved from input
    checks_total += 1
    original_count = pd.read_csv(FEATURE_TABLE_WEATHER).shape[0]
    if len(df) == original_count:
        print(f"  ✓ Row count preserved: {len(df):,}")
        checks_passed += 1
    else:
        print(f"  ✗ Row count changed: {len(df):,} vs {original_count:,}")

    # Check 5: Segment sizes sum to total grower count
    checks_total += 1
    sum_sizes = segment_stats['grower_count'].sum()
    if sum_sizes == len(df):
        print(f"  ✓ Segment sizes sum to total: {sum_sizes:,}")
        checks_passed += 1
    else:
        print(f"  ✗ Segment sizes sum mismatch: {sum_sizes:,} vs {len(df):,}")

    # Check 6: Output file exists
    checks_total += 1
    if os.path.exists(SEGMENTED_GROWERS):
        print(f"  ✓ Output file saved successfully")
        checks_passed += 1
    else:
        print(f"  ✗ Output file missing")

    print(f"\n  Result: {checks_passed}/{checks_total} checks passed")
    print(f"\n✅ Phase 8 complete. Segmented growers saved.")
    return True


if __name__ == '__main__':
    success = run_phase8()
    if not success:
        sys.exit(1)
