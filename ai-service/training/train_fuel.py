"""
train_fuel.py
─────────────
Trains a GradientBoosting regressor to predict CO2 emissions (g/km) and
an IsolationForest anomaly detector to flag abnormal fuel consumption patterns.

Dataset: CO2 Emissions_Canada.csv
Targets:
  - CO2 Emissions(g/km)   → regression (GradientBoostingRegressor)
  - Anomaly detection      → IsolationForest (unsupervised)

Run:
    python -m training.train_fuel
"""

import os
import sys
import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.preprocessing import preprocess_fuel, FUEL_TARGET

DATASET_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "datasets",
    "CO2 Emissions_Canada.csv",
)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CO2_MODEL_PATH = os.path.join(MODELS_DIR, "fuel_co2.pkl")
ANOMALY_MODEL_PATH = os.path.join(MODELS_DIR, "fuel_anomaly.pkl")
ENCODER_PATH = os.path.join(MODELS_DIR, "fuel_encoders.pkl")


def train():
    print("📂 Loading CO2 Emissions dataset …")
    df = pd.read_csv(DATASET_PATH)
    df = df.dropna(subset=[FUEL_TARGET])
    print(f"   Rows: {len(df):,}\n")

    X, y, encoders = preprocess_fuel(df, fit=True)

    # ── 1. CO2 Regression ──────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("📈 Training GradientBoostingRegressor for CO2 prediction …")
    co2_model = GradientBoostingRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=5,
        random_state=42,
    )
    co2_model.fit(X_train, y_train)

    y_pred = co2_model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"\n✅ CO2 Regression — MAE: {mae:.2f} g/km  |  R²: {r2:.4f}")

    # ── 2. Anomaly Detection (Isolation Forest) ────────
    print("\n🚨 Training IsolationForest for fuel anomaly detection …")
    anomaly_model = IsolationForest(
        n_estimators=200,
        contamination=0.05,   # assume ~5% anomalous readings
        random_state=42,
    )
    anomaly_model.fit(X)   # unsupervised on full data
    print("   IsolationForest trained on full dataset (contamination=5%)")

    # Save
    joblib.dump(co2_model, CO2_MODEL_PATH)
    joblib.dump(anomaly_model, ANOMALY_MODEL_PATH)
    joblib.dump(encoders, ENCODER_PATH)
    print(f"\n💾 CO2 model  → {CO2_MODEL_PATH}")
    print(f"💾 Anomaly model → {ANOMALY_MODEL_PATH}")
    print(f"💾 Encoders → {ENCODER_PATH}")


if __name__ == "__main__":
    train()
