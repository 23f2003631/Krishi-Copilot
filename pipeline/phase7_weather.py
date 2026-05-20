"""
==========================================================================
PHASE 7: Weather Risk Signals
==========================================================================
PURPOSE:
  Add weather-driven disease risk signals to the feature table. In
  production, this would pull from IMD (India Meteorological Department)
  or a weather API. For this hackathon prototype, we use a curated mock
  weather risk table keyed by (state, month).

WHY IT MATTERS:
  Fungicide campaigns are weather-dependent. A "high humidity + rainfall"
  forecast in Uttar Pradesh during February means wheat rust risk is
  elevated, and Tilt 250 EC messages become urgent. Dry conditions in
  Rajasthan mean lower disease pressure — campaigns can wait.

WEATHER RISK TABLE:
  - Curated by crop protection agronomists (simulated)
  - Keyed by (state, month) pairs covering Rabi 2025-26 season
  - Risk levels: high (1.0), medium (0.5), low (0.0)
  - Includes human-readable advisory text for each condition

INPUTS:
  - features/feature_table.csv (from Phase 3)

OUTPUTS:
  - features/feature_table_with_weather.csv

EXPORTS:
  - get_weather_risk(state, month) — reusable lookup function
==========================================================================
"""

import pandas as pd
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.config import FEATURE_TABLE, FEATURE_TABLE_WEATHER, ensure_dirs


# ==============================================================
# MOCK WEATHER RISK TABLE
# ==============================================================
# In production, this would be replaced by an API call to IMD or
# a weather service. For the hackathon, we manually curate risk
# levels based on typical Rabi season weather patterns in India.
#
# Key: (state, month) → (risk_level, advisory_text)
# Month is integer: 1=Jan, 2=Feb, ..., 12=Dec
# ==============================================================

WEATHER_RISK_TABLE = {
    # Uttar Pradesh — major wheat belt, humid Indo-Gangetic plains
    ('Uttar Pradesh', 2):  ('high',   'High humidity and light rainfall expected'),
    ('Uttar Pradesh', 3):  ('medium', 'Moderate moisture, watch for fungal risk'),

    # Rajasthan — arid climate, low disease pressure
    ('Rajasthan', 2):      ('low',    'Dry conditions, low disease pressure'),
    ('Rajasthan', 3):      ('low',    'Dry conditions continue'),

    # Punjab — irrigated wheat belt, rainfall near flowering
    ('Punjab', 2):         ('high',   'Rainfall risk elevated near flowering'),
    ('Punjab', 3):         ('medium', 'Post-rain moisture risk'),

    # Haryana — transitional zone, moderate humidity
    ('Haryana', 2):        ('medium', 'Moderate humidity in wheat belt'),
    ('Haryana', 3):        ('medium', 'Moderate conditions'),

    # Maharashtra — post-kharif humidity persists
    ('Maharashtra', 11):   ('medium', 'Post-kharif humidity residual'),
    ('Maharashtra', 12):   ('medium', 'Cool humid conditions'),

    # West Bengal — cool humid, ideal for late blight in potato
    ('West Bengal', 12):   ('high',   'Cool humid conditions favour late blight'),
    ('West Bengal', 1):    ('high',   'Persistent fog and moisture'),

    # Bihar — Gangetic plains, fog and moisture
    ('Bihar', 2):          ('medium', 'Fog and moisture risk in Gangetic plains'),
    ('Bihar', 1):          ('medium', 'Dense fog conditions'),

    # Madhya Pradesh — moderate humidity
    ('Madhya Pradesh', 2): ('medium', 'Moderate humidity'),

    # Gujarat — generally dry
    ('Gujarat', 2):        ('low',    'Generally dry conditions'),
}

# Numeric encoding: risk level → float score
RISK_SCORE_MAP = {
    'high':   1.0,
    'medium': 0.5,
    'low':    0.0,
}

# Default fallback for (state, month) pairs not in the table
DEFAULT_RISK = ('low', 'No specific weather advisory available')


def get_weather_risk(state: str, month: int) -> dict:
    """
    Look up weather risk for a given state and month.

    Parameters
    ----------
    state : str
        Indian state name (e.g., 'Uttar Pradesh', 'Rajasthan')
    month : int
        Calendar month (1-12)

    Returns
    -------
    dict with keys:
        - weather_risk_level : str ('high', 'medium', 'low')
        - weather_risk_score : float (1.0, 0.5, 0.0)
        - weather_advisory  : str (human-readable explanation)

    Example
    -------
    >>> get_weather_risk('Uttar Pradesh', 2)
    {'weather_risk_level': 'high', 'weather_risk_score': 1.0,
     'weather_advisory': 'High humidity and light rainfall expected'}
    """
    risk_level, advisory = WEATHER_RISK_TABLE.get(
        (state, month), DEFAULT_RISK
    )
    return {
        'weather_risk_level': risk_level,
        'weather_risk_score': RISK_SCORE_MAP[risk_level],
        'weather_advisory':  advisory,
    }


def run_phase7():
    """Execute Phase 7: Weather Risk Signals."""

    print("=" * 60)
    print("PHASE 7: Weather Risk Signals")
    print("=" * 60)

    ensure_dirs()

    # ==============================================================
    # STEP 1: LOAD FEATURE TABLE
    # ==============================================================
    print("\n[Step 1/4] Loading feature table...")
    df = pd.read_csv(FEATURE_TABLE, parse_dates=['reference_date'])
    print(f"  Loaded: {df.shape[0]:,} rows × {df.shape[1]} cols")

    # ==============================================================
    # STEP 2: EXTRACT MONTH FROM REFERENCE DATE
    # ==============================================================
    # WHY: Weather risk varies by month. The reference_date tells us
    #      when the message was (or would be) sent, so we use that
    #      month for the weather lookup.
    print("\n[Step 2/4] Extracting month from reference_date...")

    df['reference_month'] = df['reference_date'].dt.month

    month_dist = df['reference_month'].value_counts().sort_index().to_dict()
    print(f"  Month distribution: {month_dist}")

    # ==============================================================
    # STEP 3: APPLY WEATHER RISK LOOKUP
    # ==============================================================
    # WHY: Each grower gets a weather risk score based on their state
    #      and the month of the campaign. This is a vectorized lookup
    #      using apply() over the (state, month) tuple.
    print("\n[Step 3/4] Applying weather risk lookup...")

    # Vectorized lookup — apply get_weather_risk to each row
    weather_data = df.apply(
        lambda row: get_weather_risk(row['state'], row['reference_month']),
        axis=1,
        result_type='expand'
    )

    # Attach weather columns to the dataframe
    df['weather_risk_level'] = weather_data['weather_risk_level']
    df['weather_risk_score'] = weather_data['weather_risk_score']
    df['weather_advisory']   = weather_data['weather_advisory']

    # Print weather risk distribution
    risk_dist = df['weather_risk_level'].value_counts().to_dict()
    score_mean = df['weather_risk_score'].mean()
    print(f"  Weather risk distribution: {risk_dist}")
    print(f"  Mean weather_risk_score: {score_mean:.4f}")

    # ==============================================================
    # STEP 4: SAVE ENRICHED FEATURE TABLE
    # ==============================================================
    print("\n[Step 4/4] Saving feature table with weather signals...")
    df.to_csv(FEATURE_TABLE_WEATHER, index=False)
    print(f"  ✓ Saved to features/feature_table_with_weather.csv")
    print(f"  Shape: {df.shape[0]:,} rows × {df.shape[1]} cols")

    # ==============================================================
    # SANITY CHECKS
    # ==============================================================
    print("\n" + "=" * 60)
    print("PHASE 7 SANITY CHECKS")
    print("=" * 60)

    checks_passed = 0
    checks_total = 0

    # Check 1: All growers have weather data (no NaN in weather columns)
    checks_total += 1
    nan_weather = df['weather_risk_score'].isna().sum()
    if nan_weather == 0:
        print(f"  ✓ All {len(df):,} growers have weather_risk_score (no NaN)")
        checks_passed += 1
    else:
        print(f"  ✗ {nan_weather} growers missing weather_risk_score")

    # Check 2: weather_risk_score values are valid (0.0, 0.5, or 1.0)
    checks_total += 1
    valid_scores = {0.0, 0.5, 1.0}
    actual_scores = set(df['weather_risk_score'].unique())
    if actual_scores.issubset(valid_scores):
        print(f"  ✓ All weather scores valid: {sorted(actual_scores)}")
        checks_passed += 1
    else:
        print(f"  ✗ Invalid weather scores found: {actual_scores - valid_scores}")

    # Check 3: Row count unchanged (weather enrichment should not add/remove rows)
    checks_total += 1
    original_count = pd.read_csv(FEATURE_TABLE).shape[0]
    if len(df) == original_count:
        print(f"  ✓ Row count preserved: {len(df):,} (matches feature_table.csv)")
        checks_passed += 1
    else:
        print(f"  ✗ Row count changed: {len(df):,} vs {original_count:,}")

    # Check 4: Weather distribution makes sense — at least 2 risk levels present
    checks_total += 1
    n_levels = df['weather_risk_level'].nunique()
    if n_levels >= 2:
        print(f"  ✓ {n_levels} weather risk levels present")
        checks_passed += 1
    else:
        print(f"  ✗ Only {n_levels} risk level(s) — suspiciously uniform")

    # Check 5: Output file exists
    checks_total += 1
    if os.path.exists(FEATURE_TABLE_WEATHER):
        print(f"  ✓ Output file saved successfully")
        checks_passed += 1
    else:
        print(f"  ✗ Output file missing")

    # Print per-state weather summary for verification
    print(f"\n  === WEATHER RISK BY STATE ===")
    state_weather = df.groupby('state').agg(
        grower_count=('grower_id', 'count'),
        mean_risk=('weather_risk_score', 'mean'),
        high_pct=('weather_risk_level', lambda x: (x == 'high').mean() * 100),
    ).sort_values('mean_risk', ascending=False)
    for state, row in state_weather.iterrows():
        print(f"  {state:20s} | n={row['grower_count']:>5,.0f} | "
              f"mean_risk={row['mean_risk']:.2f} | "
              f"high={row['high_pct']:.0f}%")

    print(f"\n  Result: {checks_passed}/{checks_total} checks passed")
    print(f"\n✅ Phase 7 complete. Weather-enriched feature table saved.")
    return True


if __name__ == '__main__':
    success = run_phase7()
    if not success:
        sys.exit(1)
