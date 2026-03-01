"""
train_delay.py
──────────────
Trains a vehicle eco-score / fuel economy ranking model using the vehicle
database.csv dataset (US EPA data with City/Hwy MPG, GHG Score, CO2).

Also trains a simple delivery delay estimator using logistics features from
logistics_dataset_with_maintenance_required.csv (Downtime_Maintenance,
Load, Route, Weather → Delivery_Times).

Models saved:
  - delay_model.pkl      → Delivery time regressor (RandomForest)
  - eco_score_model.pkl  → Vehicle eco scoring (GradientBoosting regressor)
  - delay_encoders.pkl
  - eco_encoders.pkl

Run:
    python -m training.train_delay
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder, StandardScaler

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.preprocessing import preprocess_eco, ECO_TARGET

LOGISTICS_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "datasets",
    "logistics_dataset_with_maintenance_required.csv",
)
DATABASE_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "datasets",
    "database.csv",
)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

DELAY_MODEL_PATH = os.path.join(MODELS_DIR, "delay_model.pkl")
ECO_MODEL_PATH = os.path.join(MODELS_DIR, "eco_score_model.pkl")
DELAY_ENC_PATH = os.path.join(MODELS_DIR, "delay_encoders.pkl")
ECO_ENC_PATH = os.path.join(MODELS_DIR, "eco_encoders.pkl")


# ── Delivery Delay Model ──────────────────────────────────────────────────────
DELAY_NUMERIC = [
    "Usage_Hours", "Actual_Load", "Load_Capacity",
    "Downtime_Maintenance", "Impact_on_Efficiency",
    "Fuel_Consumption", "Vibration_Levels",
]
DELAY_CAT = ["Route_Info", "Weather_Conditions", "Road_Conditions"]
DELAY_TARGET = "Delivery_Times"


def train_delay_model():
    print("📂 Loading logistics dataset for delay prediction …")
    df = pd.read_csv(LOGISTICS_PATH)
    df = df.dropna(subset=[DELAY_TARGET])
    print(f"   Rows: {len(df):,}\n")

    df = df.copy()
    encoders = {}

    for col in DELAY_CAT:
        if col not in df.columns:
            df[col] = "Unknown"
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    for col in DELAY_NUMERIC:
        if col not in df.columns:
            df[col] = 0

    all_feats = DELAY_NUMERIC + DELAY_CAT
    X = df[all_feats].fillna(0).astype(float)
    y = df[DELAY_TARGET].astype(float)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    encoders["__scaler__"] = scaler

    X_tr, X_te, y_tr, y_te = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    print("🚚 Training RandomForestRegressor for delivery delay …")
    model = RandomForestRegressor(
        n_estimators=200, max_depth=12, n_jobs=-1, random_state=42
    )
    model.fit(X_tr, y_tr)
    y_pred = model.predict(X_te)
    print(f"✅ Delay — MAE: {mean_absolute_error(y_te, y_pred):.2f} hrs  |  R²: {r2_score(y_te, y_pred):.4f}")

    joblib.dump(model, DELAY_MODEL_PATH)
    joblib.dump(encoders, DELAY_ENC_PATH)
    print(f"💾 Delay model → {DELAY_MODEL_PATH}")
    print(f"💾 Delay encoders → {DELAY_ENC_PATH}")


# ── Eco Score Model ───────────────────────────────────────────────────────────
def train_eco_model():
    print("\n📂 Loading vehicle database for eco-score model …")
    df = pd.read_csv(DATABASE_PATH, low_memory=False)
    df = df.dropna(subset=[ECO_TARGET])
    df = df[df[ECO_TARGET] > 0]
    print(f"   Rows: {len(df):,}\n")

    X, y, encoders = preprocess_eco(df, fit=True)

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

    print("🌿 Training GradientBoostingRegressor for eco score …")
    model = GradientBoostingRegressor(
        n_estimators=300, learning_rate=0.05, max_depth=5, random_state=42
    )
    model.fit(X_tr, y_tr)
    y_pred = model.predict(X_te)
    print(f"✅ Eco Score — MAE: {mean_absolute_error(y_te, y_pred):.2f}  |  R²: {r2_score(y_te, y_pred):.4f}")

    joblib.dump(model, ECO_MODEL_PATH)
    joblib.dump(encoders, ECO_ENC_PATH)
    print(f"💾 Eco model → {ECO_MODEL_PATH}")
    print(f"💾 Eco encoders → {ECO_ENC_PATH}")


if __name__ == "__main__":
    train_delay_model()
    train_eco_model()
