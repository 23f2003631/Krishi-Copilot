# Tunable threshold configurations for the recommendation engine

# Receptivity / Engagement Confidence Thresholds
HIGH_CONFIDENCE = 0.40      # Open rate probability threshold for high confidence
MEDIUM_CONFIDENCE = 0.25    # Open rate probability threshold for medium confidence

# Data Quality Thresholds
MIN_SEGMENT_SIZE = 30                 # Minimum grower count per segment to avoid sparse warnings
MIN_HISTORICAL_ENGAGEMENT = 0.05      # Minimum click rate threshold to warn on low engagement
MIN_RETAILER_COVERAGE = 0.50          # Minimum rep/retailer coverage ratio
