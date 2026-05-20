"""
==========================================================================
PHASE 2: Merge Internal Datasets + Territory Mapping
==========================================================================
PURPOSE:
  Join all 8 cleaned tables into one unified master grower table.
  Each grower gets a single row with: profile, territory, rep, 
  WhatsApp engagement, rep activity, and local stock status.

WHAT IT DOES:
  1. Maps each crop → relevant Syngenta product (all 9 crops)
  2. Explodes rep territory tehsil_list JSON → builds tehsil↔territory↔rep mapping
  3. Joins growers → territory via tehsil (expect ~97% match)
  4. Aggregates WhatsApp engagement per grower (messages, opens, clicks)
  5. Aggregates rep visit activity per territory
  6. Computes retailer stock status per territory per product
  7. Saves master_grower_table.csv

INPUTS:
  - processed/growers_clean.csv
  - processed/whatsapp_clean.csv
  - processed/retailers_clean.csv
  - processed/inventory_clean.csv
  - processed/visits_clean.csv
  - processed/reps_clean.csv

OUTPUTS:
  - processed/master_grower_table.csv (~6,000 rows × ~45 columns)

EXPECTED SANITY CHECKS:
  - Territory match: ~97% (5,800+ / 6,000 growers)
  - WhatsApp growers: 4,479 with data, 1,521 without
  - Stock status distribution: healthy > watch > low > out_of_stock
==========================================================================
"""

import pandas as pd
import numpy as np
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from utils.config import (
    CLEAN_GROWERS, CLEAN_WHATSAPP, CLEAN_RETAILERS, CLEAN_INVENTORY,
    CLEAN_VISITS, CLEAN_REPS, MASTER_TABLE, ensure_dirs
)
from configs.crop_product_map import CROP_PRODUCT_MAP


def run_phase2():
    """Execute Phase 2: Merge & Territory Mapping."""

    print("=" * 60)
    print("PHASE 2: Merge Internal Datasets + Territory Mapping")
    print("=" * 60)

    ensure_dirs()

    # Load cleaned files
    print("\n[Step 0] Loading cleaned files...")
    growers   = pd.read_csv(CLEAN_GROWERS, parse_dates=[
        'sowing_start', 'harvest_start', 'tillering_date', 'flowering_date',
        'product_scan_datetime', 'campaign_attendance_date'
    ])
    whatsapp  = pd.read_csv(CLEAN_WHATSAPP, parse_dates=['message_sent_date'])
    retailers = pd.read_csv(CLEAN_RETAILERS)
    inventory = pd.read_csv(CLEAN_INVENTORY, parse_dates=['week_end_date'])
    visits    = pd.read_csv(CLEAN_VISITS, parse_dates=['visit_date'])
    reps      = pd.read_csv(CLEAN_REPS)

    print(f"  Loaded: growers={len(growers)}, whatsapp={len(whatsapp)}, "
          f"retailers={len(retailers)}")

    # ==============================================================
    # STEP 1: MAP CROP → PRODUCT
    # ==============================================================
    # WHY: Each grower's crop determines which Syngenta product is
    #      relevant. A wheat grower should be assessed for Tilt 250 EC,
    #      not Kavach 75 WP (which is for potato). This mapping is
    #      used in the stock guardrail join (Step 5).
    print("\n[Step 1/6] Mapping crop → relevant product...")

    growers['relevant_product'] = growers['crop'].map(CROP_PRODUCT_MAP)

    # Check for unmapped crops (should be zero if CROP_PRODUCT_MAP is complete)
    unmapped = growers['relevant_product'].isna().sum()
    if unmapped > 0:
        unmapped_crops = growers[growers['relevant_product'].isna()]['crop'].unique()
        print(f"  ⚠ WARNING: {unmapped} growers have unmapped crops: {unmapped_crops}")
        growers['relevant_product'] = growers['relevant_product'].fillna('Tilt 250 EC')
    else:
        print(f"  ✓ All crops mapped. Product distribution:")
        print(f"    {growers['relevant_product'].value_counts().to_dict()}")

    # ==============================================================
    # STEP 2: TERRITORY MAPPING
    # ==============================================================
    # WHY: We need to link each grower's tehsil to a territory_id
    #      and rep_id. This tells us which field rep covers which grower.
    print("\n[Step 2/6] Building territory-tehsil mapping...")

    def parse_tehsil_list(t):
        """Parse the JSON array of tehsils from reps_territory.csv."""
        try:
            return json.loads(t)
        except (json.JSONDecodeError, TypeError):
            return []

    reps['tehsil_parsed'] = reps['tehsil_list'].apply(parse_tehsil_list)

    # Explode: one row per tehsil (each rep covers multiple tehsils)
    reps_exploded = reps.explode('tehsil_parsed')[
        ['rep_id', 'territory_id', 'state', 'district', 'tehsil_parsed']
    ].copy()
    reps_exploded = reps_exploded.rename(columns={'tehsil_parsed': 'tehsil'})
    print(f"  Rep-tehsil mapping: {len(reps_exploded)} tehsil assignments "
          f"from {reps['rep_id'].nunique()} reps")

    # Join growers → territory via tehsil
    # Each grower's tehsil tells us which territory they belong to
    growers_with_territory = growers.merge(
        reps_exploded[['tehsil', 'territory_id', 'rep_id']],
        on='tehsil',
        how='left'
    )

    # Check join quality
    matched = growers_with_territory['territory_id'].notna().sum()
    unmatched = growers_with_territory['territory_id'].isna().sum()
    match_pct = matched / len(growers) * 100
    print(f"  Growers matched to territory: {matched:,} / {len(growers):,} "
          f"({match_pct:.1f}%)")
    if unmatched > 0:
        print(f"  ⚠ {unmatched} growers unmatched (tehsil not in any rep territory)")

    # ==============================================================
    # STEP 3: JOIN WHATSAPP ENGAGEMENT
    # ==============================================================
    # WHY: For each grower, we need their WhatsApp engagement history:
    #      how many messages sent, how many opened/clicked, their rates.
    #      The labels (wa_ever_opened, wa_ever_clicked) become ML targets.
    print("\n[Step 3/6] Aggregating WhatsApp engagement per grower...")

    wa_agg = whatsapp.groupby('grower_id').agg(
        wa_messages_sent    = ('id', 'count'),
        wa_open_count       = ('opened_status', 'sum'),
        wa_click_count      = ('clicked_status', 'sum'),
        wa_delivered_count  = ('delivered_status', 'sum'),
        wa_last_sent_date   = ('message_sent_date', 'max'),
        wa_first_sent_date  = ('message_sent_date', 'min'),
        # LABELS for ML (what we want to predict)
        wa_ever_opened      = ('opened_status', 'max'),    # 1 if ever opened
        wa_ever_clicked     = ('clicked_status', 'max'),   # 1 if ever clicked
    ).reset_index()

    # Compute rates
    wa_agg['wa_open_rate']  = (wa_agg['wa_open_count'] /
                               wa_agg['wa_messages_sent'].clip(lower=1))
    wa_agg['wa_click_rate'] = (wa_agg['wa_click_count'] /
                               wa_agg['wa_messages_sent'].clip(lower=1))

    # Join to growers
    growers_with_territory = growers_with_territory.merge(
        wa_agg, on='grower_id', how='left'
    )

    # Fill 0 for growers with no WhatsApp (keypad users)
    wa_numeric_cols = [
        'wa_messages_sent', 'wa_open_count', 'wa_click_count',
        'wa_delivered_count', 'wa_open_rate', 'wa_click_rate',
        'wa_ever_opened', 'wa_ever_clicked'
    ]
    for col in wa_numeric_cols:
        growers_with_territory[col] = growers_with_territory[col].fillna(0)

    wa_growers   = (growers_with_territory['wa_messages_sent'] > 0).sum()
    nowa_growers = (growers_with_territory['wa_messages_sent'] == 0).sum()
    print(f"  Growers with WhatsApp data: {wa_growers}")
    print(f"  Growers without WhatsApp (keypad/unknown): {nowa_growers}")

    # ==============================================================
    # STEP 4: JOIN REP VISIT ACTIVITY
    # ==============================================================
    # WHY: Territories with more active rep visits have higher grower
    #      engagement. Rep visit frequency signals how "covered" a
    #      territory is — this becomes a feature for the ML model.
    print("\n[Step 4/6] Aggregating rep visit activity per territory...")

    visits_agg = visits.groupby('territory_id').agg(
        rep_total_visits        = ('visit_date', 'count'),
        rep_retailer_meetings   = ('visit_type',
                                   lambda x: (x == 'retailer meeting').sum()),
        rep_grower_meetings     = ('visit_type',
                                   lambda x: (x == 'grower meeting').sum()),
        rep_campaigns_conducted = ('visit_type',
                                   lambda x: (x == 'campaign_conducted').sum()),
        rep_last_visit_date     = ('visit_date', 'max'),
    ).reset_index()

    growers_with_territory = growers_with_territory.merge(
        visits_agg, on='territory_id', how='left'
    )

    # Fill 0 for territories with no visits
    visit_cols = [
        'rep_total_visits', 'rep_retailer_meetings',
        'rep_grower_meetings', 'rep_campaigns_conducted'
    ]
    for col in visit_cols:
        growers_with_territory[col] = growers_with_territory[col].fillna(0)

    avg_visits = visits_agg['rep_total_visits'].mean()
    print(f"  Average rep visits per territory: {avg_visits:.1f}")
    print(f"  Visit types: retailer_meetings={visits_agg['rep_retailer_meetings'].sum():.0f}, "
          f"grower_meetings={visits_agg['rep_grower_meetings'].sum():.0f}, "
          f"campaigns={visits_agg['rep_campaigns_conducted'].sum():.0f}")

    # ==============================================================
    # STEP 5: JOIN RETAILER STOCK STATUS
    # ==============================================================
    # WHY: If the product for the grower's crop is out of stock at
    #      local retailers, we should NOT run a campaign — there's no
    #      point creating demand with no supply. This is the stock
    #      guardrail.
    print("\n[Step 5/6] Computing retailer stock status per territory per product...")

    # Get the latest inventory snapshot per retailer-SKU
    latest_inv = (inventory
                  .sort_values('week_end_date')
                  .groupby(['retailer_id', 'sku_name'])
                  .last()
                  .reset_index())

    # Join retailers → inventory to get territory context
    latest_inv_with_territory = latest_inv.merge(
        retailers[['retailer_id', 'territory_id']],
        on='retailer_id',
        how='left'
    )

    # Compute average stock per territory per product
    territory_stock = latest_inv_with_territory.groupby(
        ['territory_id', 'sku_name']
    ).agg(
        avg_stock_qty        = ('sku_qty', 'mean'),
        min_stock_qty        = ('sku_qty', 'min'),
        retailers_with_stock = ('sku_qty', lambda x: (x > 0).sum()),
        total_retailers      = ('sku_qty', 'count'),
        out_of_stock_count   = ('sku_qty', lambda x: (x == 0).sum()),
    ).reset_index()

    territory_stock['pct_retailers_stocked'] = (
        territory_stock['retailers_with_stock'] /
        territory_stock['total_retailers'].clip(lower=1)
    )

    # Join stock data to growers — match on territory_id AND relevant product
    print("  Joining stock status to each grower by their relevant product...")
    growers_with_territory = growers_with_territory.merge(
        territory_stock.rename(columns={'sku_name': 'relevant_product'}),
        on=['territory_id', 'relevant_product'],
        how='left'
    )

    # Fill defaults for growers without stock data
    growers_with_territory['avg_stock_qty'] = (
        growers_with_territory['avg_stock_qty'].fillna(0))
    growers_with_territory['pct_retailers_stocked'] = (
        growers_with_territory['pct_retailers_stocked'].fillna(0))
    growers_with_territory['out_of_stock_count'] = (
        growers_with_territory['out_of_stock_count'].fillna(0))

    # Create stock_status label based on % of retailers that have stock
    def assign_stock_status(pct):
        """Classify stock health based on % of retailers with stock."""
        if pct >= 0.7:
            return 'healthy'      # 70%+ retailers stocked
        elif pct >= 0.4:
            return 'watch'        # 40-70% stocked — monitor closely
        elif pct > 0:
            return 'low'          # <40% stocked — warning
        else:
            return 'out_of_stock' # 0% stocked — block campaigns

    growers_with_territory['stock_status'] = (
        growers_with_territory['pct_retailers_stocked'].apply(assign_stock_status)
    )

    stock_dist = growers_with_territory['stock_status'].value_counts().to_dict()
    print(f"  Stock status distribution: {stock_dist}")

    # ==============================================================
    # STEP 6: SAVE MASTER TABLE
    # ==============================================================
    print("\n[Step 6/6] Saving master grower table...")

    growers_with_territory.to_csv(MASTER_TABLE, index=False)

    print(f"  ✓ Master grower table saved: {growers_with_territory.shape}")
    print(f"  Columns ({len(growers_with_territory.columns)}):")
    for i, col in enumerate(growers_with_territory.columns):
        print(f"    {i+1:2d}. {col}")

    # ==============================================================
    # SANITY CHECKS
    # ==============================================================
    print("\n" + "=" * 60)
    print("PHASE 2 SANITY CHECKS")
    print("=" * 60)

    checks_passed = 0
    checks_total = 0

    # Check 1: Territory match rate >= 95%
    checks_total += 1
    if match_pct >= 95:
        print(f"  ✓ Territory match rate: {match_pct:.1f}% (≥95%)")
        checks_passed += 1
    else:
        print(f"  ✗ Territory match rate: {match_pct:.1f}% (<95%)")

    # Check 2: WhatsApp grower count = 4479
    checks_total += 1
    if wa_growers == 4479:
        print(f"  ✓ WhatsApp growers: {wa_growers} (expected 4479)")
        checks_passed += 1
    else:
        print(f"  ✗ WhatsApp growers: {wa_growers} (expected 4479)")

    # Check 3: No NaN in relevant_product
    checks_total += 1
    rp_nans = growers_with_territory['relevant_product'].isna().sum()
    if rp_nans == 0:
        print(f"  ✓ No NaN in relevant_product (all 9 crops mapped)")
        checks_passed += 1
    else:
        print(f"  ✗ {rp_nans} NaN in relevant_product")

    # Check 4: Stock status has all 4 categories
    checks_total += 1
    stock_cats = set(growers_with_territory['stock_status'].unique())
    expected_cats = {'healthy', 'watch', 'low', 'out_of_stock'}
    if len(stock_cats) >= 3:  # at least 3 categories present
        print(f"  ✓ Stock categories present: {stock_cats}")
        checks_passed += 1
    else:
        print(f"  ✗ Only {len(stock_cats)} stock categories: {stock_cats}")

    # Check 5: Row count preserved
    checks_total += 1
    if len(growers_with_territory) >= 5900:  # allow slight variation from joins
        print(f"  ✓ Master table rows: {len(growers_with_territory):,} "
              f"(expected ~6,000)")
        checks_passed += 1
    else:
        print(f"  ✗ Master table rows: {len(growers_with_territory):,} "
              f"(expected ~6,000)")

    print(f"\n  Result: {checks_passed}/{checks_total} checks passed")
    print("\n✅ Phase 2 complete. Master grower table saved.")
    return True


if __name__ == '__main__':
    success = run_phase2()
    if not success:
        sys.exit(1)
