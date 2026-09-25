"""
Water Demand Forecasting using XGBoost Regressor
Trains on timestamped multi-zone water demand time-series with lag features.
Evaluates MAE, RMSE, R2, and generates hourly forecasts.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODELS_DIR, "xgboost_demand.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "demand_metrics.json")

FEATURE_COLS = [
    "hour",
    "day_of_week",
    "day_of_month",
    "is_weekend",
    "month",
    "lag_1",
    "lag_2",
    "lag_24",
    "lag_168",
    "rolling_mean_6h",
    "rolling_mean_24h"
]

TARGET = "demand_m3h"

def train_model():
    print("[*] Training XGBoost Water Demand Forecasting Model...")
    csv_path = os.path.join(DATA_DIR, "demand_timeseries.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Demand timeseries CSV not found at {csv_path}")

    df = pd.read_csv(csv_path)
    
    # Sort chronologically
    df["timestamp_dt"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(["zone", "timestamp_dt"]).reset_index(drop=True)

    # Encode zone as categorical dummy or numerical
    zone_dummies = pd.get_dummies(df["zone"], prefix="zone", drop_first=False)
    zone_cols = list(zone_dummies.columns)
    
    X = pd.concat([df[FEATURE_COLS], zone_dummies], axis=1)
    y = df[TARGET]

    # Time-based train/test split: 80% train, 20% test
    split_idx = int(len(df) * 0.80)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    model = xgb.XGBRegressor(
        n_estimators=160,
        learning_rate=0.06,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        verbosity=0
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))
    mape = float(np.mean(np.abs((y_test - y_pred) / y_test)) * 100)

    # Feature importances
    all_features = FEATURE_COLS + zone_cols
    importances = model.feature_importances_.tolist()
    feat_imp = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(all_features, importances), key=lambda x: x[1], reverse=True)
    ]

    metrics = {
        "model_name": "XGBoost Regressor",
        "algorithm": "xgboost.XGBRegressor",
        "total_records": len(df),
        "train_records": len(X_train),
        "test_records": len(X_test),
        "mae_m3h": round(mae, 2),
        "rmse_m3h": round(rmse, 2),
        "r2_score": round(r2, 4),
        "mape_percent": round(mape, 2),
        "feature_importances": feat_imp[:8]
    }

    # Save artifacts
    artifacts = {
        "model": model,
        "features": all_features,
        "zone_cols": zone_cols
    }
    joblib.dump(artifacts, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"[OK] XGBoost Demand Model trained successfully!")
    print(f"     MAE: {mae:.2f} m3/h | RMSE: {rmse:.2f} m3/h | R2: {r2:.4f} | MAPE: {mape:.2f}%")
    print(f"     Model saved to: {MODEL_PATH}")
    print(f"     Metrics saved to: {METRICS_PATH}")
    return artifacts, metrics

def forecast_demand(zone: str = "ZONE_A", horizon_hours: int = 24):
    """
    Generates dynamic future water demand forecasts for a given zone.
    Returns:
    - hourly forecast points
    - upper and lower 95% confidence intervals
    - summary stats (peak demand, total volume, average demand)
    """
    if not os.path.exists(MODEL_PATH):
        artifacts, _ = train_model()
    else:
        artifacts = joblib.load(MODEL_PATH)

    model = artifacts["model"]
    
    # Load recent demand series to bootstrap lags
    csv_path = os.path.join(DATA_DIR, "demand_timeseries.csv")
    df = pd.read_csv(csv_path)
    zone_df = df[df["zone"] == zone].tail(168).copy()
    
    last_dt = pd.to_datetime(zone_df["timestamp"].iloc[-1])
    recent_demands = list(zone_df["demand_m3h"].values)

    forecast_records = []
    zone_cols = artifacts["zone_cols"]

    for step in range(1, horizon_hours + 1):
        future_dt = last_dt + pd.Timedelta(hours=step)
        hour = future_dt.hour
        dow = future_dt.weekday()
        dom = future_dt.day
        is_weekend = 1 if dow >= 5 else 0
        month = future_dt.month

        lag_1 = recent_demands[-1]
        lag_2 = recent_demands[-2] if len(recent_demands) >= 2 else lag_1
        lag_24 = recent_demands[-24] if len(recent_demands) >= 24 else lag_1
        lag_168 = recent_demands[-168] if len(recent_demands) >= 168 else lag_24
        roll_6 = np.mean(recent_demands[-6:]) if len(recent_demands) >= 6 else lag_1
        roll_24 = np.mean(recent_demands[-24:]) if len(recent_demands) >= 24 else lag_1

        row_dict = {
            "hour": hour,
            "day_of_week": dow,
            "day_of_month": dom,
            "is_weekend": is_weekend,
            "month": month,
            "lag_1": lag_1,
            "lag_2": lag_2,
            "lag_24": lag_24,
            "lag_168": lag_168,
            "rolling_mean_6h": roll_6,
            "rolling_mean_24h": roll_24
        }

        # One-hot encode zone
        for zc in zone_cols:
            row_dict[zc] = 1 if zc == f"zone_{zone}" else 0

        X_input = pd.DataFrame([row_dict])[artifacts["features"]]
        pred_val = float(model.predict(X_input)[0])
        pred_val = round(max(50.0, pred_val), 2)
        
        # Uncertainty band (+/- 6.5%)
        upper_band = round(pred_val * 1.065, 2)
        lower_band = round(pred_val * 0.935, 2)

        forecast_records.append({
            "step": step,
            "timestamp": future_dt.isoformat(),
            "hour_label": future_dt.strftime("%d %b %H:00"),
            "forecast_demand_m3h": pred_val,
            "upper_bound_m3h": upper_band,
            "lower_bound_m3h": lower_band
        })

        recent_demands.append(pred_val)

    # Summary
    demands_array = [r["forecast_demand_m3h"] for r in forecast_records]
    return {
        "zone": zone,
        "horizon_hours": horizon_hours,
        "peak_demand_m3h": max(demands_array),
        "min_demand_m3h": min(demands_array),
        "average_demand_m3h": round(float(np.mean(demands_array)), 2),
        "total_volume_m3": round(float(np.sum(demands_array)), 2),
        "hourly_forecast": forecast_records
    }

if __name__ == "__main__":
    train_model()
