# Feature Registry for Syngenta ML Pipeline

FEATURE_COLUMNS = [
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
]

CATEGORICAL_COLUMNS = []  # Features are pre-mapped to numeric for LGBM

NUMERIC_COLUMNS = [
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
]

TARGET_COLUMNS = [
    'label_opened',
    'label_clicked',
]
