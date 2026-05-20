import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.metrics import roc_auc_score

df = pd.read_csv('pipeline/features/leakage_safe_features.csv', parse_dates=['send_date'])

train_cutoff = pd.Timestamp('2026-02-01')
train_df = df[df['send_date'] < train_cutoff].copy()
valid_df = df[df['send_date'] >= train_cutoff].copy()

FEATURE_COLS = [
    'prior_open_rate', 'prior_click_rate', 'prior_msg_count',
    'scan_before_send', 'attended_before_send',
    'days_to_flowering', 'days_to_harvest', 'days_to_tillering',
    'in_critical_window', 'device_score', 'grower_farm_size',
    'grower_age', 'stock_urgency_score', 'rep_coverage_score',
    'pct_retailers_stocked', 'rep_campaign_ratio',
]

X_train = train_df[FEATURE_COLS].fillna(0).astype(float)
y_train_open = train_df['label_opened'].astype(int)
X_valid = valid_df[FEATURE_COLS].fillna(0).astype(float)
y_valid_open = valid_df['label_opened'].astype(int)

for lr in [0.01, 0.05, 0.1]:
    for depth in [2, 3]:
        for est in [20, 50, 100]:
            for reg in [0.0, 1.0, 5.0]:
                model = lgb.LGBMClassifier(
                    n_estimators=est,
                    max_depth=depth,
                    learning_rate=lr,
                    reg_alpha=reg,
                    reg_lambda=reg,
                    min_child_samples=50,
                    is_unbalance=True,
                    random_state=42,
                    verbose=-1
                )
                model.fit(X_train, y_train_open)
                y_pred_tr = model.predict_proba(X_train)[:, 1]
                y_pred_val = model.predict_proba(X_valid)[:, 1]
                train_auc = roc_auc_score(y_train_open, y_pred_tr)
                valid_auc = roc_auc_score(y_valid_open, y_pred_val)
                print(f"lr={lr}, depth={depth}, est={est}, reg={reg} | Train AUC: {train_auc:.4f}, Valid AUC: {valid_auc:.4f}")
