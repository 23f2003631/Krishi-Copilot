"""
Centralized path configuration for the Syngenta Krishi Campaign Copilot pipeline.
All scripts import paths from here — change once, applies everywhere.
"""

import os

# ============================================================
# BASE DIRECTORIES
# ============================================================
# Pipeline root is the directory containing this file's parent
PIPELINE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(PIPELINE_DIR)

# ============================================================
# INPUT DATA (raw CSVs from Syngenta)
# ============================================================
RAW_DATA_DIR = os.path.join(PROJECT_ROOT, "Input Dataset")

# Raw CSV file paths
RAW_GROWERS       = os.path.join(RAW_DATA_DIR, "growers.csv")
RAW_WHATSAPP      = os.path.join(RAW_DATA_DIR, "whatsapp_campaign.csv")
RAW_RETAILERS     = os.path.join(RAW_DATA_DIR, "retailers.csv")
RAW_INVENTORY     = os.path.join(RAW_DATA_DIR, "retailer_inventory_weekly.csv")
RAW_POS           = os.path.join(RAW_DATA_DIR, "retailer_pos.csv")
RAW_VISITS        = os.path.join(RAW_DATA_DIR, "retailer_visit_log.csv")
RAW_REPS          = os.path.join(RAW_DATA_DIR, "reps_territory.csv")
RAW_FUNNEL        = os.path.join(RAW_DATA_DIR, "digital_funnel_weekly.csv")

# ============================================================
# OUTPUT DIRECTORIES
# ============================================================
PROCESSED_DIR = os.path.join(PIPELINE_DIR, "processed")
FEATURES_DIR  = os.path.join(PIPELINE_DIR, "features")
MODELS_DIR    = os.path.join(PIPELINE_DIR, "models")
EXPORTS_DIR   = os.path.join(PIPELINE_DIR, "exports")
CONFIGS_DIR   = os.path.join(PIPELINE_DIR, "configs")
PROMPTS_DIR   = os.path.join(PIPELINE_DIR, "prompts")

# ============================================================
# PROCESSED FILE PATHS (Phase 1 outputs)
# ============================================================
CLEAN_GROWERS     = os.path.join(PROCESSED_DIR, "growers_clean.csv")
CLEAN_WHATSAPP    = os.path.join(PROCESSED_DIR, "whatsapp_clean.csv")
CLEAN_RETAILERS   = os.path.join(PROCESSED_DIR, "retailers_clean.csv")
CLEAN_INVENTORY   = os.path.join(PROCESSED_DIR, "inventory_clean.csv")
CLEAN_POS         = os.path.join(PROCESSED_DIR, "pos_clean.csv")
CLEAN_VISITS      = os.path.join(PROCESSED_DIR, "visits_clean.csv")
CLEAN_REPS        = os.path.join(PROCESSED_DIR, "reps_clean.csv")
CLEAN_FUNNEL      = os.path.join(PROCESSED_DIR, "funnel_clean.csv")

# ============================================================
# FEATURE FILE PATHS (Phase 2-8 outputs)
# ============================================================
MASTER_TABLE           = os.path.join(PROCESSED_DIR, "master_grower_table.csv")
FEATURE_TABLE          = os.path.join(FEATURES_DIR, "feature_table.csv")
LEAKAGE_SAFE_FEATURES  = os.path.join(FEATURES_DIR, "leakage_safe_features.csv")
PREDICTIONS_W_REASONS  = os.path.join(FEATURES_DIR, "predictions_with_reasons.csv")
FEATURE_TABLE_WEATHER  = os.path.join(FEATURES_DIR, "feature_table_with_weather.csv")
SEGMENTED_GROWERS      = os.path.join(FEATURES_DIR, "segmented_growers.csv")
TERRITORY_STOCK        = os.path.join(FEATURES_DIR, "territory_stock_status.csv")
SALES_VELOCITY         = os.path.join(FEATURES_DIR, "sales_velocity.csv")
REP_ACTIVITY           = os.path.join(FEATURES_DIR, "rep_activity_summary.csv")

# ============================================================
# MODEL FILE PATHS (Phase 5-6 outputs)
# ============================================================
MODEL_OPEN       = os.path.join(MODELS_DIR, "model_open.pkl")
MODEL_CLICK      = os.path.join(MODELS_DIR, "model_click.pkl")
FEATURE_COLS_PKL = os.path.join(MODELS_DIR, "feature_cols.pkl")
SHAP_VALUES_PKL  = os.path.join(MODELS_DIR, "shap_values.pkl")


def ensure_dirs():
    """Create all output directories if they don't exist."""
    for d in [PROCESSED_DIR, FEATURES_DIR, MODELS_DIR, EXPORTS_DIR, CONFIGS_DIR, PROMPTS_DIR]:
        os.makedirs(d, exist_ok=True)


def should_run(output_path: str, force: bool = False) -> bool:
    """
    Checkpoint system for run_pipeline.py.
    Returns True if the phase should run (output doesn't exist or force=True).
    Returns False if the output already exists (skip to save time).
    """
    if force:
        return True
    if os.path.exists(output_path):
        print(f"  ✓ Skipping — {output_path} already exists")
        return False
    return True
