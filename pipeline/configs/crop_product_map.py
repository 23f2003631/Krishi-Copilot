"""
Crop-to-Product mapping for Syngenta Rabi 2025-26 season.

This maps each crop in the dataset to its primary Syngenta product.
Used in Phase 2 (merge) for stock guardrail joins and in the
recommendation engine for product-level targeting.

CRITICAL: All 9 crops in the dataset must be mapped here.
Missing mappings will produce NaN in relevant_product, which
silently breaks the stock guardrail join in Phase 9.
"""

# Primary crop → Syngenta product mapping
# Source: Syngenta product catalog for Rabi 2025-26
CROP_PRODUCT_MAP = {
    'wheat':     'Tilt 250 EC',      # Fungicide — propiconazole, protects against rusts and powdery mildew
    'mustard':   'Score 250 EC',     # Fungicide — difenoconazole, for Alternaria and white rust
    'chickpea':  'Actara 25 WG',     # Insecticide — thiamethoxam, for pod borer complex
    'potato':    'Kavach 75 WP',     # Fungicide — chlorothalonil, for late blight protection
    'barley':    'Tilt 250 EC',      # Same fungicide family as wheat (both cereals)
    'lentil':    'Tilt 250 EC',      # Fungicide for rust and wilt protection
    'safflower': 'Score 250 EC',     # Fungicide for Alternaria leaf spot
    'cumin':     'Amistar 250 SC',   # Fungicide — azoxystrobin, for powdery mildew in cumin
    'maize':     'Actara 25 WG',     # Insecticide for stem borer and aphids
    'unknown':   'Tilt 250 EC',      # Safe default — most common crop is wheat
}

# Reverse mapping: product → list of crops it applies to
PRODUCT_CROP_MAP = {}
for crop, product in CROP_PRODUCT_MAP.items():
    if product not in PRODUCT_CROP_MAP:
        PRODUCT_CROP_MAP[product] = []
    PRODUCT_CROP_MAP[product].append(crop)

# All unique products in our catalog
ALL_PRODUCTS = list(set(CROP_PRODUCT_MAP.values()))

# Campaign mapping reference (from digital_funnel_weekly.csv)
CAMPAIGN_MAP = {
    'CMP_RABI25_001': {'crop': 'wheat',    'product': 'Topik 15 WP'},
    'CMP_RABI25_002': {'crop': 'mustard',  'product': 'Score 250 EC'},
    'CMP_RABI25_003': {'crop': 'chickpea', 'product': 'Actara 25 WG'},
    'CMP_RABI25_004': {'crop': 'potato',   'product': 'Kavach 75 WP'},
}
