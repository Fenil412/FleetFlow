"""
preprocessing.py — Common feature engineering utilities shared across all AI services.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


# ─────────────────────────────────────────────
# Maintenance Feature Engineering
# ─────────────────────────────────────────────

MAINTENANCE_FEATURES = [
    "Usage_Hours",
    "Actual_Load",
    "Engine_Temperature",
    "Tire_Pressure",
    "Fuel_Consumption",
    "Battery_Status",
    "Vibration_Levels",
    "Oil_Quality",
    "Failure_History",
    "Anomalies_Detected",
    "Predictive_Score",
    "Downtime_Maintenance",
    "Impact_on_Efficiency",
]

MAINTENANCE_CAT_FEATURES = ["Brake_Condition", "Weather_Conditions", "Road_Conditions"]
MAINTENANCE_TARGET = "Maintenance_Required"


def preprocess_maintenance(df: pd.DataFrame, fit: bool = True, encoders: dict = None):
    """
    Encode categoricals and scale numerics for maintenance model.
    If fit=True, creates new encoders/scalers (training).
    If fit=False, uses provided encoders (inference).
    Returns (X, y_or_None, encoders_dict)
    """
    df = df.copy()

    if encoders is None:
        encoders = {}

    # Label encode categorical columns
    for col in MAINTENANCE_CAT_FEATURES:
        if col not in df.columns:
            df[col] = "Unknown"
        le = encoders.get(col, LabelEncoder())
        if fit:
            df[col] = le.fit_transform(df[col].astype(str))
        else:
            df[col] = df[col].astype(str).map(
                lambda x, le=le: le.transform([x])[0]
                if x in le.classes_
                else -1
            )
        encoders[col] = le

    all_features = MAINTENANCE_FEATURES + MAINTENANCE_CAT_FEATURES

    for col in all_features:
        if col not in df.columns:
            df[col] = 0

    X = df[all_features].fillna(0).astype(float)

    scaler = encoders.get("__scaler__", StandardScaler())
    if fit:
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)
    encoders["__scaler__"] = scaler

    y = None
    if MAINTENANCE_TARGET in df.columns:
        y = df[MAINTENANCE_TARGET].astype(int)

    return X_scaled, y, encoders


# ─────────────────────────────────────────────
# Fuel / CO2 Feature Engineering (CO2 Emissions Canada)
# ─────────────────────────────────────────────

FUEL_FEATURES = [
    "Engine Size(L)",
    "Cylinders",
    "Fuel Consumption City (L/100 km)",
    "Fuel Consumption Hwy (L/100 km)",
    "Fuel Consumption Comb (mpg)",
]
FUEL_CAT_FEATURES = ["Vehicle Class", "Transmission", "Fuel Type"]
FUEL_TARGET = "CO2 Emissions(g/km)"


def preprocess_fuel(df: pd.DataFrame, fit: bool = True, encoders: dict = None):
    """
    Preprocess CO2 emissions dataset for fuel anomaly / CO2 prediction model.
    """
    df = df.copy()

    if encoders is None:
        encoders = {}

    for col in FUEL_CAT_FEATURES:
        if col not in df.columns:
            df[col] = "Unknown"
        le = encoders.get(col, LabelEncoder())
        if fit:
            df[col] = le.fit_transform(df[col].astype(str))
        else:
            df[col] = df[col].astype(str).map(
                lambda x, le=le: le.transform([x])[0]
                if x in le.classes_
                else -1
            )
        encoders[col] = le

    all_features = FUEL_FEATURES + FUEL_CAT_FEATURES

    for col in all_features:
        if col not in df.columns:
            df[col] = 0

    X = df[all_features].fillna(0).astype(float)

    scaler = encoders.get("__scaler__", StandardScaler())
    if fit:
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)
    encoders["__scaler__"] = scaler

    y = None
    if FUEL_TARGET in df.columns:
        y = df[FUEL_TARGET].astype(float)

    return X_scaled, y, encoders


# ─────────────────────────────────────────────
# Vehicle Eco Score Feature Engineering (database.csv)
# ─────────────────────────────────────────────

ECO_FEATURES = [
    "Engine Cylinders",
    "Engine Displacement",
    "City MPG (FT1)",
    "Highway MPG (FT1)",
    "Combined MPG (FT1)",
    "Tailpipe CO2 (FT1)",
    "Annual Fuel Cost (FT1)",
]
ECO_CAT_FEATURES = ["Class", "Drive", "Transmission", "Fuel Type"]
ECO_TARGET = "Fuel Economy Score"


def preprocess_eco(df: pd.DataFrame, fit: bool = True, encoders: dict = None):
    """
    Preprocess vehicle database for eco/fuel-economy scoring model.
    """
    df = df.copy()

    if encoders is None:
        encoders = {}

    # Rename columns with spaces carefully
    df.columns = [c.strip() for c in df.columns]

    for col in ECO_CAT_FEATURES:
        if col not in df.columns:
            df[col] = "Unknown"
        le = encoders.get(col, LabelEncoder())
        if fit:
            df[col] = le.fit_transform(df[col].astype(str))
        else:
            df[col] = df[col].astype(str).map(
                lambda x, le=le: le.transform([x])[0]
                if x in le.classes_
                else -1
            )
        encoders[col] = le

    all_features = ECO_FEATURES + ECO_CAT_FEATURES

    for col in all_features:
        if col not in df.columns:
            df[col] = 0

    X = df[all_features].replace(-1, np.nan).fillna(0).astype(float)

    scaler = encoders.get("__scaler__", StandardScaler())
    if fit:
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)
    encoders["__scaler__"] = scaler

    y = None
    if ECO_TARGET in df.columns:
        y = df[ECO_TARGET].replace(-1, np.nan).fillna(0).astype(float)

    return X_scaled, y, encoders
