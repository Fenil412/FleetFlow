"""
main.py — FleetFlow AI Service (FastAPI)
─────────────────────────────────────────
ML Endpoints:
  POST /predict/maintenance   → Predictive Maintenance
  POST /predict/fuel          → Fuel CO2 Prediction + Anomaly Detection
  POST /predict/delay         → Delivery Delay Prediction
  POST /predict/eco-score     → Vehicle Eco / Fuel Economy Score

Rule-Based Endpoints:
  POST /predict/driver-score  → Driver Behaviour Scoring
  POST /predict/carbon        → Carbon Emission Tracking
  POST /predict/route         → Smart Route Time Estimation

System:
  GET  /health                → Health check
  GET  /models/status         → Shows which .pkl models are loaded

Run:
    py -m uvicorn main:app --reload --port 8001
"""

import os
import math
import logging
from contextlib import asynccontextmanager
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
from contextlib import asynccontextmanager
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    MaintenanceRequest, MaintenanceResponse,
    FuelRequest, FuelResponse,
    DelayRequest, DelayResponse,
    EcoScoreRequest, EcoScoreResponse,
    DriverScoreRequest, DriverScoreResponse,
    CarbonRequest, CarbonResponse,
    RouteRequest, RouteResponse,
)

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger("fleetflow-ai")

# ─── Model paths ──────────────────────────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

MODEL_FILES = {
    "maintenance":         os.path.join(MODELS_DIR, "maintenance.pkl"),
    "maintenance_enc":     os.path.join(MODELS_DIR, "maintenance_encoders.pkl"),
    "fuel_co2":            os.path.join(MODELS_DIR, "fuel_co2.pkl"),
    "fuel_anomaly":        os.path.join(MODELS_DIR, "fuel_anomaly.pkl"),
    "fuel_enc":            os.path.join(MODELS_DIR, "fuel_encoders.pkl"),
    "delay":               os.path.join(MODELS_DIR, "delay_model.pkl"),
    "delay_enc":           os.path.join(MODELS_DIR, "delay_encoders.pkl"),
    "eco_score":           os.path.join(MODELS_DIR, "eco_score_model.pkl"),
    "eco_enc":             os.path.join(MODELS_DIR, "eco_encoders.pkl"),
}

# Global model store
MODELS: dict = {}


def safe_load(key: str) -> Optional[object]:
    """Load a .pkl model if it exists, otherwise return None."""
    path = MODEL_FILES.get(key)
    if path and os.path.exists(path):
        try:
            obj = joblib.load(path)
            logger.info(f"✅ Loaded model: {key}")
            return obj
        except Exception as e:
            logger.warning(f"⚠️  Failed to load {key}: {e}")
    else:
        logger.warning(f"⚠️  Model not found: {key} → {path}  (run training first)")
    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load all available models on startup
    for key in MODEL_FILES:
        MODELS[key] = safe_load(key)
    logger.info("🚀 FleetFlow AI Service ready")
    yield
    MODELS.clear()


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FleetFlow AI Service",
    description="ML-powered predictions for maintenance, fuel efficiency, delivery delay, eco-scoring, driver behaviour, carbon emissions, and route optimization.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "service": "FleetFlow AI Service v1.0"}


@app.get("/models/status", tags=["System"])
def models_status():
    return {
        key: ("loaded" if obj is not None else "not loaded (run training)")
        for key, obj in MODELS.items()
    }


# ─── Service 1: Predictive Maintenance ────────────────────────────────────────
@app.post("/predict/maintenance", response_model=MaintenanceResponse, tags=["Predictive Maintenance"])
def predict_maintenance(req: MaintenanceRequest):
    model = MODELS.get("maintenance")
    encoders = MODELS.get("maintenance_enc")

    if model is None or encoders is None:
        raise HTTPException(
            status_code=503,
            detail="Maintenance model not loaded. Run: python -m training.train_maintenance",
        )

    from utils.preprocessing import preprocess_maintenance

    row = {
        "Usage_Hours": req.Usage_Hours,
        "Actual_Load": req.Actual_Load,
        "Engine_Temperature": req.Engine_Temperature,
        "Tire_Pressure": req.Tire_Pressure,
        "Fuel_Consumption": req.Fuel_Consumption,
        "Battery_Status": req.Battery_Status,
        "Vibration_Levels": req.Vibration_Levels,
        "Oil_Quality": req.Oil_Quality,
        "Failure_History": req.Failure_History,
        "Anomalies_Detected": req.Anomalies_Detected,
        "Predictive_Score": req.Predictive_Score,
        "Downtime_Maintenance": req.Downtime_Maintenance,
        "Impact_on_Efficiency": req.Impact_on_Efficiency,
        "Brake_Condition": req.Brake_Condition,
        "Weather_Conditions": req.Weather_Conditions,
        "Road_Conditions": req.Road_Conditions,
    }
    df = pd.DataFrame([row])
    X, _, _ = preprocess_maintenance(df, fit=False, encoders=encoders)

    pred = int(model.predict(X)[0])
    proba = model.predict_proba(X)[0]
    confidence = float(proba[pred])

    # Risk classification
    p_maintenance = float(proba[1])
    if p_maintenance >= 0.75:
        risk = "HIGH"
        rec = "🔴 Immediate maintenance required. Schedule service within 24 hours."
    elif p_maintenance >= 0.45:
        risk = "MEDIUM"
        rec = "🟡 Maintenance recommended within 3–5 days. Monitor vibration and oil quality."
    else:
        risk = "LOW"
        rec = "🟢 Vehicle in good condition. Next maintenance check in 30 days."

    return MaintenanceResponse(
        Vehicle_ID=req.Vehicle_ID,
        maintenance_required=bool(pred),
        confidence=round(confidence, 4),
        risk_level=risk,
        recommendation=rec,
    )


# ─── Service 2: Fuel CO2 Prediction + Anomaly ─────────────────────────────────
@app.post("/predict/fuel", response_model=FuelResponse, tags=["Fuel & CO2"])
def predict_fuel(req: FuelRequest):
    co2_model = MODELS.get("fuel_co2")
    anomaly_model = MODELS.get("fuel_anomaly")
    encoders = MODELS.get("fuel_enc")

    if co2_model is None or anomaly_model is None or encoders is None:
        raise HTTPException(
            status_code=503,
            detail="Fuel models not loaded. Run: python -m training.train_fuel",
        )

    from utils.preprocessing import preprocess_fuel

    row = {
        "Engine Size(L)": req.Engine_Size_L,
        "Cylinders": req.Cylinders,
        "Fuel Consumption City (L/100 km)": req.Fuel_Consumption_City,
        "Fuel Consumption Hwy (L/100 km)": req.Fuel_Consumption_Hwy,
        "Fuel Consumption Comb (mpg)": req.Fuel_Consumption_Comb_mpg,
        "Vehicle Class": req.Vehicle_Class,
        "Transmission": req.Transmission,
        "Fuel Type": req.Fuel_Type,
    }
    df = pd.DataFrame([row])
    X, _, _ = preprocess_fuel(df, fit=False, encoders=encoders)

    pred_co2 = float(co2_model.predict(X)[0])
    anomaly_raw = float(anomaly_model.score_samples(X)[0])   # negative; lower = more anomalous
    is_anomaly = anomaly_model.predict(X)[0] == -1

    # Efficiency rating based on combined L/100km
    comb = req.Fuel_Consumption_City * 0.55 + req.Fuel_Consumption_Hwy * 0.45
    if comb <= 6.0:
        rating = "EXCELLENT"
    elif comb <= 9.0:
        rating = "GOOD"
    elif comb <= 13.0:
        rating = "AVERAGE"
    else:
        rating = "POOR"

    if is_anomaly:
        rec = "🚨 Abnormal fuel consumption pattern detected. Inspect fuel system for leaks or inefficiency."
    elif rating == "EXCELLENT":
        rec = "🌿 Outstanding fuel efficiency. Vehicle operating optimally."
    elif rating == "GOOD":
        rec = "✅ Good fuel efficiency. Continue regular maintenance."
    elif rating == "AVERAGE":
        rec = "⚠️ Consider a fuel system check or tire pressure adjustment."
    else:
        rec = "🔴 Poor fuel efficiency. Recommend engine tune-up and load optimization."

    return FuelResponse(
        Vehicle_ID=req.Vehicle_ID,
        predicted_co2_g_per_km=round(pred_co2, 2),
        is_anomaly=bool(is_anomaly),
        anomaly_score=round(anomaly_raw, 4),
        fuel_efficiency_rating=rating,
        recommendation=rec,
    )


# ─── Service 3: Delivery Delay Prediction ─────────────────────────────────────
@app.post("/predict/delay", response_model=DelayResponse, tags=["Delivery Delay"])
def predict_delay(req: DelayRequest):
    model = MODELS.get("delay")
    encoders = MODELS.get("delay_enc")

    if model is None or encoders is None:
        raise HTTPException(
            status_code=503,
            detail="Delay model not loaded. Run: python -m training.train_delay",
        )

    from sklearn.preprocessing import LabelEncoder

    DELAY_NUM   = ["Usage_Hours", "Actual_Load", "Load_Capacity",
                   "Downtime_Maintenance", "Impact_on_Efficiency",
                   "Fuel_Consumption", "Vibration_Levels"]
    DELAY_CAT   = ["Route_Info", "Weather_Conditions", "Road_Conditions"]

    row = {
        "Usage_Hours": req.Usage_Hours,
        "Actual_Load": req.Actual_Load,
        "Load_Capacity": req.Load_Capacity,
        "Downtime_Maintenance": req.Downtime_Maintenance,
        "Impact_on_Efficiency": req.Impact_on_Efficiency,
        "Fuel_Consumption": req.Fuel_Consumption,
        "Vibration_Levels": req.Vibration_Levels,
        "Route_Info": req.Route_Info,
        "Weather_Conditions": req.Weather_Conditions,
        "Road_Conditions": req.Road_Conditions,
    }
    df = pd.DataFrame([row])

    for col in DELAY_CAT:
        le: LabelEncoder = encoders.get(col)
        if le is not None:
            val = str(df[col].iloc[0])
            df[col] = le.transform([val])[0] if val in le.classes_ else -1

    X = df[DELAY_NUM + DELAY_CAT].fillna(0).astype(float).values
    X_scaled = encoders["__scaler__"].transform(X)

    pred_hours = float(model.predict(X_scaled)[0])

    # Delay risk: typical good delivery = 30 hrs
    if pred_hours <= 30.0:
        risk = "LOW"
        rec = "🟢 On-time delivery expected."
    elif pred_hours <= 45.0:
        risk = "MEDIUM"
        rec = "🟡 Minor delay likely. Notify customer and monitor route."
    else:
        risk = "HIGH"
        rec = "🔴 Significant delay predicted. Reroute or escalate to fleet manager."

    return DelayResponse(
        Trip_ID=req.Trip_ID,
        predicted_delivery_hours=round(pred_hours, 2),
        delay_risk=risk,
        recommendation=rec,
    )


# ─── Service 4: Vehicle Eco Score ─────────────────────────────────────────────
@app.post("/predict/eco-score", response_model=EcoScoreResponse, tags=["Eco Score"])
def predict_eco_score(req: EcoScoreRequest):
    model = MODELS.get("eco_score")
    encoders = MODELS.get("eco_enc")

    if model is None or encoders is None:
        raise HTTPException(
            status_code=503,
            detail="Eco score model not loaded. Run: python -m training.train_delay",
        )

    from utils.preprocessing import preprocess_eco

    row = {
        "Class": req.Class,
        "Drive": req.Drive,
        "Transmission": req.Transmission,
        "Fuel Type": req.Fuel_Type,
        "Engine Cylinders": req.Engine_Cylinders,
        "Engine Displacement": req.Engine_Displacement,
        "City MPG (FT1)": req.City_MPG,
        "Highway MPG (FT1)": req.Highway_MPG,
        "Combined MPG (FT1)": req.Combined_MPG,
        "Tailpipe CO2 (FT1)": req.Tailpipe_CO2,
        "Annual Fuel Cost (FT1)": req.Annual_Fuel_Cost,
    }
    df = pd.DataFrame([row])
    X, _, _ = preprocess_eco(df, fit=False, encoders=encoders)

    pred_score = float(model.predict(X)[0])
    pred_score = max(1.0, min(10.0, pred_score))   # clamp to 1–10

    # Letter grade
    if pred_score >= 8.5:
        grade = "A"
        ghg = "EXCELLENT"
    elif pred_score >= 7.0:
        grade = "B"
        ghg = "GOOD"
    elif pred_score >= 5.0:
        grade = "C"
        ghg = "AVERAGE"
    elif pred_score >= 3.0:
        grade = "D"
        ghg = "POOR"
    else:
        grade = "F"
        ghg = "POOR"

    # Annual CO2 in kg (15,000 km/year typical)
    annual_co2_kg = round(req.Tailpipe_CO2 * 15000 / 1000, 1)

    if grade in ("A", "B"):
        rec = "🌿 This vehicle meets green fleet standards. Consider prioritising it for city routes."
    elif grade == "C":
        rec = "✅ Average efficiency. Suitable for highway routes. Consider hybrid replacement next cycle."
    else:
        rec = "🔴 High emissions vehicle. Recommend retirement or replacement with EV/hybrid."

    return EcoScoreResponse(
        Vehicle_ID=req.Vehicle_ID,
        predicted_eco_score=round(pred_score, 2),
        eco_grade=grade,
        ghg_rating=ghg,
        annual_co2_kg=annual_co2_kg,
        recommendation=rec,
    )


# ─── Service 5: Driver Behaviour Scoring ──────────────────────────────────────
@app.post("/predict/driver-score", response_model=DriverScoreResponse, tags=["Driver Scoring"])
def predict_driver_score(req: DriverScoreRequest):
    """
    Rule-based driver behaviour scoring.
    Score = 100 - penalties for speeding, harsh braking, acceleration, idle time.
    Optionally enriched with trip count and fuel efficiency.
    """
    base_score = 100.0

    # Penalties
    overspeed_penalty   = req.overspeed_events    * 2.0
    harsh_brake_penalty = req.harsh_brake_events  * 3.0
    harsh_accel_penalty = req.harsh_accel_events  * 2.5
    idle_penalty        = req.idle_minutes        * 0.3
    late_delivery_pen   = req.late_deliveries     * 5.0

    # Bonuses
    on_time_bonus = req.on_time_deliveries * 1.0

    raw_score = base_score - overspeed_penalty - harsh_brake_penalty \
                - harsh_accel_penalty - idle_penalty - late_delivery_pen \
                + on_time_bonus

    score = round(max(0.0, min(100.0, raw_score)), 1)

    # Grade
    if score >= 90:
        grade = "A"
        risk  = "LOW"
        badge = "⭐ Excellent Driver"
        rec   = "🏆 Outstanding performance. Eligible for driver incentive bonus."
    elif score >= 75:
        grade = "B"
        risk  = "LOW"
        badge = "✅ Good Driver"
        rec   = "👍 Good driving habits. Watch idle time and minor speeding events."
    elif score >= 60:
        grade = "C"
        risk  = "MEDIUM"
        badge = "⚠️ Average Driver"
        rec   = "⚠️ Needs improvement. Schedule driver training for braking and speed control."
    elif score >= 40:
        grade = "D"
        risk  = "HIGH"
        badge = "🚨 At-Risk Driver"
        rec   = "🚨 High-risk behaviour detected. Mandatory safety training required."
    else:
        grade = "F"
        risk  = "CRITICAL"
        badge = "🔴 Unsafe Driver"
        rec   = "🔴 CRITICAL: Immediately suspend pending full safety review."

    return DriverScoreResponse(
        Driver_ID=req.Driver_ID,
        score=score,
        grade=grade,
        risk_level=risk,
        badge=badge,
        penalties={
            "overspeed":    round(overspeed_penalty, 1),
            "harsh_brake":  round(harsh_brake_penalty, 1),
            "harsh_accel":  round(harsh_accel_penalty, 1),
            "idle":         round(idle_penalty, 1),
            "late_delivery":round(late_delivery_pen, 1),
            "on_time_bonus": round(on_time_bonus, 1),
        },
        recommendation=rec,
    )


# ─── Service 6: Carbon Emission Tracking ──────────────────────────────────────
@app.post("/predict/carbon", response_model=CarbonResponse, tags=["Carbon Tracking"])
def predict_carbon(req: CarbonRequest):
    """
    Formula-based carbon emission tracking.
    CO2 = fuel_litres × emission_factor (kg CO2 per litre)
    Diesel: 2.68 kg/L  |  Petrol: 2.31 kg/L  |  CNG: 1.97 kg/L
    """
    EMISSION_FACTORS = {
        "diesel":  2.68,
        "petrol":  2.31,
        "gasoline": 2.31,
        "cng":     1.97,
        "lpg":     1.63,
        "electric": 0.0,
    }
    factor = EMISSION_FACTORS.get(req.fuel_type.lower(), 2.68)
    co2_kg = round(req.fuel_litres * factor, 3)

    # CO2 per km
    co2_per_km = round(co2_kg / req.distance_km, 4) if req.distance_km > 0 else 0.0
    # Equivalent trees to offset (1 tree absorbs ~21 kg CO2/year)
    trees_needed = round(co2_kg / 21.0, 2)

    # Benchmark: 0.2 kg/km is industry average for fleet trucks
    BENCHMARK = 0.2
    if co2_per_km <= BENCHMARK * 0.75:
        rating = "EXCELLENT"
        rec = "🌿 Well below industry CO2 benchmark. Great eco performance!"
    elif co2_per_km <= BENCHMARK:
        rating = "GOOD"
        rec = "✅ Within emission targets. Maintain current fuel efficiency."
    elif co2_per_km <= BENCHMARK * 1.3:
        rating = "AVERAGE"
        rec = "⚠️ Slightly above benchmark. Check tyre pressure, reduce idle time."
    else:
        rating = "POOR"
        rec = "🔴 High CO2 emissions. Consider load optimisation or vehicle replacement."

    return CarbonResponse(
        Vehicle_ID=req.Vehicle_ID,
        Trip_ID=req.Trip_ID,
        fuel_type=req.fuel_type,
        fuel_litres=req.fuel_litres,
        distance_km=req.distance_km,
        co2_kg=co2_kg,
        co2_per_km=co2_per_km,
        trees_to_offset=trees_needed,
        emission_rating=rating,
        recommendation=rec,
    )


# ─── Service 7: Smart Route Time Estimation ────────────────────────────────────
@app.post("/predict/route", response_model=RouteResponse, tags=["Route Optimization"])
def predict_route(req: RouteRequest):
    """
    Estimates estimated travel time and adjusts for traffic, weather, and load.
    Uses physics-based formula — no external API required.
    Phase 2: integrate OpenRouteService or Google Directions API.
    """
    # Base speed by road type (km/h)
    BASE_SPEED = {
        "highway": 90.0,
        "urban":   35.0,
        "rural":   60.0,
        "mixed":   55.0,
    }
    speed = BASE_SPEED.get(req.road_type.lower(), 55.0)

    # Traffic multiplier (slows down speed)
    TRAFFIC_MULT = {"low": 1.0, "medium": 0.80, "high": 0.60, "jam": 0.35}
    t_mult = TRAFFIC_MULT.get(req.traffic_level.lower(), 0.80)

    # Weather multiplier
    WEATHER_MULT = {"clear": 1.0, "rain": 0.85, "fog": 0.70, "snow": 0.55, "storm": 0.40}
    w_mult = WEATHER_MULT.get(req.weather.lower(), 0.90)

    # Load multiplier (heavy load = slower)
    load_ratio = req.current_load_kg / req.max_load_kg if req.max_load_kg > 0 else 0.5
    load_mult = 1.0 - (load_ratio * 0.15)   # max 15% penalty at full load

    effective_speed = speed * t_mult * w_mult * load_mult
    base_hours = req.distance_km / max(effective_speed, 1.0)

    # Add buffer for stops/breaks (15 min per 4 hours driving)
    stop_minutes = (base_hours // 4) * 15
    total_hours = base_hours + (stop_minutes / 60)

    # Fuel estimate: base consumption adjusted for load and speed
    fuel_est = round(req.base_fuel_consumption_l100km * req.distance_km / 100
 * (1 + load_ratio * 0.2), 2)

    # Risk
    if req.traffic_level.lower() == "jam" or req.weather.lower() in ("storm", "snow"):
        risk = "HIGH"
        rec = f"🔴 Severe conditions. Delay departure or choose alternate route. ETA: {round(total_hours, 2)}h"
    elif t_mult < 0.80 or w_mult < 0.85:
        risk = "MEDIUM"
        rec = f"🟡 Moderate delay expected. Inform customer. ETA: {round(total_hours, 2)}h"
    else:
        risk = "LOW"
        rec = f"🟢 Route clear. On-schedule delivery expected. ETA: {round(total_hours, 2)}h"

    return RouteResponse(
        Trip_ID=req.Trip_ID,
        distance_km=req.distance_km,
        effective_speed_kmh=round(effective_speed, 1),
        estimated_hours=round(total_hours, 2),
        estimated_fuel_litres=fuel_est,
        delay_risk=risk,
        recommendation=rec,
    )
