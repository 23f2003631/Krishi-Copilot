"""
==========================================================================
PHASE 1: Dataset Cleaning
==========================================================================
PURPOSE:
  Load all 8 raw CSV datasets, fix data quality issues, and save cleaned
  versions to processed/ directory.

WHAT IT DOES:
  1. Loads all CSVs from Input Dataset/
  2. Converts date strings → datetime objects
  3. Converts boolean text ('true'/'false') → integers (0/1)
  4. Fills missing values (farm size with median, 745 NaN values expected)
  5. Standardizes text (title case, lowercase, strip whitespace)
  6. Parses crop calendar JSON → extracts crop, sowing, harvest, 
     tillering, flowering dates
  7. Saves 8 cleaned files to processed/

INPUTS:
  - Input Dataset/growers.csv (6,000 rows)
  - Input Dataset/whatsapp_campaign.csv (4,479 rows)
  - Input Dataset/retailers.csv (4,000 rows)
  - Input Dataset/retailer_inventory_weekly.csv (310,544 rows)
  - Input Dataset/retailer_pos.csv (235,042 rows)
  - Input Dataset/retailer_visit_log.csv (30,000 rows)
  - Input Dataset/reps_territory.csv (500 rows)
  - Input Dataset/digital_funnel_weekly.csv (104 rows)

OUTPUTS:
  - processed/growers_clean.csv
  - processed/whatsapp_clean.csv
  - processed/retailers_clean.csv
  - processed/inventory_clean.csv
  - processed/pos_clean.csv
  - processed/visits_clean.csv
  - processed/reps_clean.csv
  - processed/funnel_clean.csv

EXPECTED SANITY CHECKS:
  - Growers: 6,000 rows, crop distribution: wheat ~2754, chickpea ~882
  - WhatsApp: 4,479 rows, open rate ~23%, click rate ~5%
  - Calendars parsed: ~5,550 / 6,000 (450 missing)
  - Farm size NaN filled: 745 values
==========================================================================
"""

import pandas as pd
import numpy as np
import json
import sys
import os

# Add pipeline root to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.config import (
    RAW_GROWERS, RAW_WHATSAPP, RAW_RETAILERS, RAW_INVENTORY,
    RAW_POS, RAW_VISITS, RAW_REPS, RAW_FUNNEL,
    CLEAN_GROWERS, CLEAN_WHATSAPP, CLEAN_RETAILERS, CLEAN_INVENTORY,
    CLEAN_POS, CLEAN_VISITS, CLEAN_REPS, CLEAN_FUNNEL,
    ensure_dirs
)


def run_phase1():
    """Execute Phase 1: Dataset Cleaning."""

    print("=" * 60)
    print("PHASE 1: Dataset Cleaning")
    print("=" * 60)

    # Create output directories
    ensure_dirs()

    # ==============================================================
    # STEP 1: LOAD ALL FILES
    # ==============================================================
    print("\n[Step 1/7] Loading all datasets...")

    growers   = pd.read_csv(RAW_GROWERS)
    whatsapp  = pd.read_csv(RAW_WHATSAPP)
    retailers = pd.read_csv(RAW_RETAILERS)
    inventory = pd.read_csv(RAW_INVENTORY)
    pos       = pd.read_csv(RAW_POS)
    visits    = pd.read_csv(RAW_VISITS)
    reps      = pd.read_csv(RAW_REPS)
    funnel    = pd.read_csv(RAW_FUNNEL)

    print(f"  Growers:   {growers.shape[0]:,} rows × {growers.shape[1]} cols")
    print(f"  WhatsApp:  {whatsapp.shape[0]:,} rows × {whatsapp.shape[1]} cols")
    print(f"  Retailers: {retailers.shape[0]:,} rows × {retailers.shape[1]} cols")
    print(f"  Inventory: {inventory.shape[0]:,} rows × {inventory.shape[1]} cols")
    print(f"  POS:       {pos.shape[0]:,} rows × {pos.shape[1]} cols")
    print(f"  Visits:    {visits.shape[0]:,} rows × {visits.shape[1]} cols")
    print(f"  Reps:      {reps.shape[0]:,} rows × {reps.shape[1]} cols")
    print(f"  Funnel:    {funnel.shape[0]:,} rows × {funnel.shape[1]} cols")

    # ==============================================================
    # STEP 2: FIX DATE COLUMNS
    # ==============================================================
    # WHY: Pandas reads dates as text by default. We need actual
    #      datetime objects for date math (days between events).
    print("\n[Step 2/7] Converting date columns...")

    growers['product_scan_datetime']    = pd.to_datetime(growers['product_scan_datetime'], errors='coerce')
    growers['campaign_attendance_date'] = pd.to_datetime(growers['campaign_attendance_date'], errors='coerce')
    whatsapp['message_sent_date']       = pd.to_datetime(whatsapp['message_sent_date'], errors='coerce')
    inventory['week_end_date']          = pd.to_datetime(inventory['week_end_date'], errors='coerce')
    pos['transaction_date']             = pd.to_datetime(pos['transaction_date'], errors='coerce')
    visits['visit_date']                = pd.to_datetime(visits['visit_date'], errors='coerce')
    funnel['week_start_date']           = pd.to_datetime(funnel['week_start_date'], errors='coerce')

    # Sanity: check for parsing failures
    wa_date_nulls = whatsapp['message_sent_date'].isna().sum()
    print(f"  WhatsApp date parse failures: {wa_date_nulls}")
    print(f"  WhatsApp date range: {whatsapp['message_sent_date'].min()} to {whatsapp['message_sent_date'].max()}")

    # ==============================================================
    # STEP 3: FIX BOOLEAN COLUMNS
    # ==============================================================
    # WHY: 'true'/'false' text strings can't be used in math or ML.
    #      Convert to integers: 1 = yes, 0 = no.
    print("\n[Step 3/7] Converting boolean columns...")

    bool_cols_growers  = ['product_scan', 'offline_campaign_attended']
    bool_cols_whatsapp = ['delivered_status', 'opened_status', 'clicked_status']

    for col in bool_cols_growers:
        before_na = growers[col].isna().sum()
        growers[col] = growers[col].map(
            {'true': 1, 'false': 0, True: 1, False: 0}
        ).fillna(0).astype(int)
        print(f"  growers['{col}']: {before_na} NaN -> filled with 0, "
              f"sum={growers[col].sum()}")

    for col in bool_cols_whatsapp:
        whatsapp[col] = whatsapp[col].map(
            {'true': 1, 'false': 0, True: 1, False: 0}
        ).fillna(0).astype(int)

    # Compute and print WhatsApp engagement rates
    wa_total     = len(whatsapp)
    wa_delivered = whatsapp['delivered_status'].sum()
    wa_opened    = whatsapp['opened_status'].sum()
    wa_clicked   = whatsapp['clicked_status'].sum()
    print(f"  WhatsApp delivered: {wa_delivered}/{wa_total} "
          f"({wa_delivered/wa_total*100:.2f}%)")
    print(f"  WhatsApp opened:   {wa_opened}/{wa_total} "
          f"({wa_opened/wa_total*100:.2f}%)")
    print(f"  WhatsApp clicked:  {wa_clicked}/{wa_total} "
          f"({wa_clicked/wa_total*100:.2f}%)")

    # ==============================================================
    # STEP 4: FIX MISSING VALUES
    # ==============================================================
    # WHY: ML models can't handle NaN. We fill with sensible defaults.
    print("\n[Step 4/7] Fixing missing values...")

    # Farm size: fill missing with median (745 NaN values expected)
    farm_nan_count = growers['grower_farm_size'].isna().sum()
    median_farm_size = growers['grower_farm_size'].median()
    growers['grower_farm_size'] = growers['grower_farm_size'].fillna(median_farm_size)
    print(f"  Farm size: filled {farm_nan_count} NaN with "
          f"median={median_farm_size:.2f} acres")

    # Age: check for missing
    age_nan = growers['grower_age'].isna().sum()
    if age_nan > 0:
        median_age = growers['grower_age'].median()
        growers['grower_age'] = growers['grower_age'].fillna(median_age)
        print(f"  Age: filled {age_nan} NaN with median={median_age:.0f}")
    else:
        print(f"  Age: no missing values ✓")

    # Product name and scan datetime: missing = no scan (correct behavior,
    # we already have the boolean flag product_scan=0 for these)

    # ==============================================================
    # STEP 5: STANDARDIZE TEXT
    # ==============================================================
    # WHY: 'Hindi' and 'hindi' would be treated as different values.
    #      Standardize to avoid duplicate categories.
    print("\n[Step 5/7] Standardizing text columns...")

    growers['language']    = growers['language'].str.strip().str.title()
    growers['device_type'] = growers['device_type'].str.strip().str.lower()
    growers['state']       = growers['state'].str.strip().str.title()
    growers['district']    = growers['district'].str.strip().str.title()
    growers['tehsil']      = growers['tehsil'].str.strip()
    growers['gender']      = growers['gender'].str.strip().str.lower()

    # Print distributions for verification
    print(f"  Languages:    {growers['language'].value_counts().to_dict()}")
    print(f"  Device types: {growers['device_type'].value_counts().to_dict()}")
    print(f"  Genders:      {growers['gender'].value_counts().to_dict()}")

    # Standardize retailer/rep text columns too
    retailers['state']    = retailers['state'].str.strip().str.title()
    retailers['district'] = retailers['district'].str.strip().str.title()
    retailers['tehsil']   = retailers['tehsil'].str.strip()
    visits['visit_type']  = visits['visit_type'].str.strip().str.lower()

    # ==============================================================
    # STEP 6: PARSE CROP CALENDAR JSON
    # ==============================================================
    # WHY: The grower_crop_calendar column contains a JSON string.
    #      We need to extract: crop name, sowing date, harvest date,
    #      tillering date, and flowering date for crop stage features.
    print("\n[Step 6/7] Parsing crop calendars...")

    def parse_crop_calendar(json_str):
        """
        Parse the JSON crop calendar string from growers.csv.
        
        Expected JSON structure:
        {
            "season": "Rabi_2025-26",
            "crop": "wheat",
            "sowing": {"start": "2025-11-01", "end": "2025-11-25"},
            "harvest": {"start": "2026-03-20", "end": "2026-04-15"},
            "stages": [
                {"stage": "tillering", "approx": "2026-01-15"},
                {"stage": "flowering", "approx": "2026-02-20"}
            ]
        }
        
        Returns dict with extracted fields, or defaults if parsing fails.
        """
        try:
            if pd.isna(json_str):
                return {
                    'crop': 'unknown', 'sowing_start': None,
                    'harvest_start': None, 'tillering_date': None,
                    'flowering_date': None
                }

            cal = json.loads(json_str)
            crop = cal.get('crop', 'unknown')
            sowing_start = cal.get('sowing', {}).get('start', None)
            harvest_start = cal.get('harvest', {}).get('start', None)

            # Extract stage dates from the stages array
            stages = cal.get('stages', [])
            tillering_date = None
            flowering_date = None
            for stage in stages:
                stage_name = stage.get('stage', '')
                if stage_name == 'tillering':
                    tillering_date = stage.get('approx', None)
                elif stage_name == 'flowering':
                    flowering_date = stage.get('approx', None)

            return {
                'crop': crop,
                'sowing_start': sowing_start,
                'harvest_start': harvest_start,
                'tillering_date': tillering_date,
                'flowering_date': flowering_date
            }
        except (json.JSONDecodeError, TypeError, AttributeError):
            return {
                'crop': 'unknown', 'sowing_start': None,
                'harvest_start': None, 'tillering_date': None,
                'flowering_date': None
            }

    # Apply parser to every row
    calendar_parsed = growers['grower_crop_calendar'].apply(parse_crop_calendar)
    calendar_df = pd.DataFrame(calendar_parsed.tolist())

    # Add parsed columns to growers dataframe
    growers['crop']           = calendar_df['crop']
    growers['sowing_start']   = pd.to_datetime(calendar_df['sowing_start'], errors='coerce')
    growers['harvest_start']  = pd.to_datetime(calendar_df['harvest_start'], errors='coerce')
    growers['tillering_date'] = pd.to_datetime(calendar_df['tillering_date'], errors='coerce')
    growers['flowering_date'] = pd.to_datetime(calendar_df['flowering_date'], errors='coerce')

    # Print crop distribution
    crop_dist = growers['crop'].value_counts().to_dict()
    calendars_parsed = (growers['crop'] != 'unknown').sum()
    calendars_missing = (growers['crop'] == 'unknown').sum()
    print(f"  Crop distribution: {crop_dist}")
    print(f"  Calendars parsed:  {calendars_parsed} / {len(growers)} "
          f"({calendars_parsed/len(growers)*100:.1f}%)")
    print(f"  Calendars missing: {calendars_missing}")

    # ==============================================================
    # STEP 7: SAVE CLEANED FILES
    # ==============================================================
    print("\n[Step 7/7] Saving cleaned files to processed/...")

    growers.to_csv(CLEAN_GROWERS, index=False)
    whatsapp.to_csv(CLEAN_WHATSAPP, index=False)
    retailers.to_csv(CLEAN_RETAILERS, index=False)
    inventory.to_csv(CLEAN_INVENTORY, index=False)
    pos.to_csv(CLEAN_POS, index=False)
    visits.to_csv(CLEAN_VISITS, index=False)
    reps.to_csv(CLEAN_REPS, index=False)
    funnel.to_csv(CLEAN_FUNNEL, index=False)

    print(f"  ✓ growers_clean.csv   ({growers.shape[0]:,} rows)")
    print(f"  ✓ whatsapp_clean.csv  ({whatsapp.shape[0]:,} rows)")
    print(f"  ✓ retailers_clean.csv ({retailers.shape[0]:,} rows)")
    print(f"  ✓ inventory_clean.csv ({inventory.shape[0]:,} rows)")
    print(f"  ✓ pos_clean.csv       ({pos.shape[0]:,} rows)")
    print(f"  ✓ visits_clean.csv    ({visits.shape[0]:,} rows)")
    print(f"  ✓ reps_clean.csv      ({reps.shape[0]:,} rows)")
    print(f"  ✓ funnel_clean.csv    ({funnel.shape[0]:,} rows)")

    # ==============================================================
    # SANITY CHECKS
    # ==============================================================
    print("\n" + "=" * 60)
    print("PHASE 1 SANITY CHECKS")
    print("=" * 60)

    checks_passed = 0
    checks_total = 0

    # Check 1: Row counts
    checks_total += 1
    if growers.shape[0] == 6000:
        print(f"  ✓ Growers row count: {growers.shape[0]} (expected 6000)")
        checks_passed += 1
    else:
        print(f"  ✗ Growers row count: {growers.shape[0]} (expected 6000)")

    checks_total += 1
    if whatsapp.shape[0] == 4479:
        print(f"  ✓ WhatsApp row count: {whatsapp.shape[0]} (expected 4479)")
        checks_passed += 1
    else:
        print(f"  ✗ WhatsApp row count: {whatsapp.shape[0]} (expected 4479)")

    # Check 2: Open rate close to 23%
    checks_total += 1
    open_rate = whatsapp['opened_status'].mean() * 100
    if 20 < open_rate < 27:
        print(f"  ✓ WhatsApp open rate: {open_rate:.2f}% (expected ~23%)")
        checks_passed += 1
    else:
        print(f"  ✗ WhatsApp open rate: {open_rate:.2f}% (expected ~23%)")

    # Check 3: Click rate close to 5%
    checks_total += 1
    click_rate = whatsapp['clicked_status'].mean() * 100
    if 3 < click_rate < 8:
        print(f"  ✓ WhatsApp click rate: {click_rate:.2f}% (expected ~5%)")
        checks_passed += 1
    else:
        print(f"  ✗ WhatsApp click rate: {click_rate:.2f}% (expected ~5%)")

    # Check 4: No NaN in critical columns
    checks_total += 1
    critical_nans = growers[['grower_id', 'state', 'language', 'device_type',
                              'grower_farm_size', 'grower_age']].isna().sum().sum()
    if critical_nans == 0:
        print(f"  ✓ No NaN in critical grower columns")
        checks_passed += 1
    else:
        print(f"  ✗ Found {critical_nans} NaN in critical grower columns")

    # Check 5: Wheat is the dominant crop
    checks_total += 1
    if growers['crop'].value_counts().index[0] == 'wheat':
        wheat_count = growers['crop'].value_counts()['wheat']
        print(f"  ✓ Wheat is dominant crop: {wheat_count} growers")
        checks_passed += 1
    else:
        print(f"  ✗ Wheat is NOT dominant crop")

    # Check 6: Device types are valid
    checks_total += 1
    valid_devices = {'smartphone', 'keypad', 'unknown'}
    actual_devices = set(growers['device_type'].unique())
    if actual_devices.issubset(valid_devices):
        print(f"  ✓ Device types valid: {actual_devices}")
        checks_passed += 1
    else:
        print(f"  ✗ Unexpected device types: {actual_devices - valid_devices}")

    print(f"\n  Result: {checks_passed}/{checks_total} checks passed")
    print("\n✅ Phase 1 complete. Cleaned files saved to processed/")
    return True


if __name__ == '__main__':
    success = run_phase1()
    if not success:
        sys.exit(1)
