"""
train_maintenance.py
────────────────────
Trains a RandomForest classifier to predict whether a vehicle needs maintenance.
Dataset: logistics_dataset_with_maintenance_required.csv
Target:  Maintenance_Required  (0 = No, 1 = Yes)

Run:
    python -m training.train_maintenance
"""

import os
import sys
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# allow imports from ai-service root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.preprocessing import (
    preprocess_maintenance,
    MAINTENANCE_TARGET,
)

DATASET_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "datasets",
    "logistics_dataset_with_maintenance_required.csv",
)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODELS_DIR, "maintenance.pkl")
ENCODER_PATH = os.path.join(MODELS_DIR, "maintenance_encoders.pkl")


def train():
    print("📂 Loading dataset …")
    df = pd.read_csv(DATASET_PATH)
    print(f"   Rows: {len(df):,}  |  Target distribution:\n{df[MAINTENANCE_TARGET].value_counts()}\n")

    X, y, encoders = preprocess_maintenance(df, fit=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("🌲 Training RandomForestClassifier …")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=5,
        n_jobs=-1,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred, target_names=["No Maintenance", "Maintenance Required"]))

    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODER_PATH)
    print(f"\n💾 Model saved  → {MODEL_PATH}")
    print(f"💾 Encoders saved → {ENCODER_PATH}")


if __name__ == "__main__":
    train()
