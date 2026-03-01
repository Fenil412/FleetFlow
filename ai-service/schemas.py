"""
schemas.py — Pydantic request/response models for all FleetFlow AI endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal


# ─────────────────────────────────────────────
# Service 1 — Predictive Maintenance
# ─────────────────────────────────────────────

class MaintenanceRequest(BaseModel):
    Vehicle_ID: Optional[str] = Field(None, example="V-1042")
    Usage_Hours: float = Field(..., example=5300.0, description="Total usage hours of the vehicle")
    Actual_Load: float = Field(..., example=7.5, description="Current actual load in tonnes")
    Engine_Temperature: float = Field(..., example=95.0, description="Engine temperature in °C")
    Tire_Pressure: float = Field(..., example=32.0, description="Average tire pressure in PSI")
    Fuel_Consumption: float = Field(..., example=12.5, description="Fuel consumption in L/100km")
    Battery_Status: float = Field(..., example=75.0, description="Battery charge level (%)")
    Vibration_Levels: float = Field(..., example=1.8, description="Vibration sensor reading")
    Oil_Quality: float = Field(..., example=65.0, description="Oil quality score (0–100)")
    Failure_History: int = Field(..., example=2, description="Number of past failures")
    Anomalies_Detected: int = Field(..., example=0, description="Number of anomalies detected recently")
    Predictive_Score: float = Field(..., example=0.42, description="Raw predictive sensor score (0–1)")
    Downtime_Maintenance: float = Field(..., example=1.5, description="Downtime hours due to maintenance")
    Impact_on_Efficiency: float = Field(..., example=0.15, description="Efficiency impact fraction (0–1)")
    Brake_Condition: str = Field(..., example="Good", description="Brake condition: Good / Fair / Poor")
    Weather_Conditions: str = Field(..., example="Clear", description="Weather: Clear / Rain / Fog / Snow")
    Road_Conditions: str = Field(..., example="Highway", description="Road type: Highway / Rural / Urban")

    class Config:
        json_schema_extra = {
            "example": {
                "Vehicle_ID": "V-1042",
                "Usage_Hours": 5300.0,
                "Actual_Load": 7.5,
                "Engine_Temperature": 95.0,
                "Tire_Pressure": 32.0,
                "Fuel_Consumption": 12.5,
                "Battery_Status": 75.0,
                "Vibration_Levels": 1.8,
                "Oil_Quality": 65.0,
                "Failure_History": 2,
                "Anomalies_Detected": 0,
                "Predictive_Score": 0.42,
                "Downtime_Maintenance": 1.5,
                "Impact_on_Efficiency": 0.15,
                "Brake_Condition": "Good",
                "Weather_Conditions": "Clear",
                "Road_Conditions": "Highway",
            }
        }


class MaintenanceResponse(BaseModel):
    Vehicle_ID: Optional[str]
    maintenance_required: bool
    confidence: float = Field(..., description="Model confidence (0–1)")
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    recommendation: str


# ─────────────────────────────────────────────
# Service 2 — Fuel CO2 Prediction & Anomaly
# ─────────────────────────────────────────────

class FuelRequest(BaseModel):
    Vehicle_ID: Optional[str] = Field(None, example="V-1042")
    Make: Optional[str] = Field(None, example="FORD")
    Model: Optional[str] = Field(None, example="F-150")
    Vehicle_Class: str = Field(..., example="SUV - SMALL")
    Engine_Size_L: float = Field(..., alias="Engine Size(L)", example=3.5)
    Cylinders: int = Field(..., example=6)
    Transmission: str = Field(..., example="AS6")
    Fuel_Type: str = Field(..., alias="Fuel Type", example="X")
    Fuel_Consumption_City: float = Field(..., alias="Fuel Consumption City (L/100 km)", example=13.2)
    Fuel_Consumption_Hwy: float = Field(..., alias="Fuel Consumption Hwy (L/100 km)", example=9.4)
    Fuel_Consumption_Comb_mpg: float = Field(..., alias="Fuel Consumption Comb (mpg)", example=26.0)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "Vehicle_ID": "V-1042",
                "Make": "FORD",
                "Model": "F-150",
                "Vehicle Class": "SUV - SMALL",
                "Engine Size(L)": 3.5,
                "Cylinders": 6,
                "Transmission": "AS6",
                "Fuel Type": "X",
                "Fuel Consumption City (L/100 km)": 13.2,
                "Fuel Consumption Hwy (L/100 km)": 9.4,
                "Fuel Consumption Comb (mpg)": 26.0,
            }
        }


class FuelResponse(BaseModel):
    Vehicle_ID: Optional[str]
    predicted_co2_g_per_km: float
    is_anomaly: bool
    anomaly_score: float = Field(..., description="IsolationForest score; lower = more anomalous")
    fuel_efficiency_rating: Literal["EXCELLENT", "GOOD", "AVERAGE", "POOR"]
    recommendation: str


# ─────────────────────────────────────────────
# Service 3 — Delivery Delay Prediction
# ─────────────────────────────────────────────

class DelayRequest(BaseModel):
    Trip_ID: Optional[str] = Field(None, example="T-5021")
    Usage_Hours: float = Field(..., example=4500.0)
    Actual_Load: float = Field(..., example=6.8)
    Load_Capacity: float = Field(..., example=8.0)
    Downtime_Maintenance: float = Field(..., example=2.0)
    Impact_on_Efficiency: float = Field(..., example=0.20)
    Fuel_Consumption: float = Field(..., example=11.5)
    Vibration_Levels: float = Field(..., example=2.1)
    Route_Info: str = Field(..., example="Rural")
    Weather_Conditions: str = Field(..., example="Rain")
    Road_Conditions: str = Field(..., example="Rural")

    class Config:
        json_schema_extra = {
            "example": {
                "Trip_ID": "T-5021",
                "Usage_Hours": 4500.0,
                "Actual_Load": 6.8,
                "Load_Capacity": 8.0,
                "Downtime_Maintenance": 2.0,
                "Impact_on_Efficiency": 0.20,
                "Fuel_Consumption": 11.5,
                "Vibration_Levels": 2.1,
                "Route_Info": "Rural",
                "Weather_Conditions": "Rain",
                "Road_Conditions": "Rural",
            }
        }


class DelayResponse(BaseModel):
    Trip_ID: Optional[str]
    predicted_delivery_hours: float
    delay_risk: Literal["LOW", "MEDIUM", "HIGH"]
    recommendation: str


# ─────────────────────────────────────────────
# Service 4 — Vehicle Eco Score
# ─────────────────────────────────────────────

class EcoScoreRequest(BaseModel):
    Vehicle_ID: Optional[str] = Field(None, example="EPA-26587")
    Year: Optional[int] = Field(None, example=2022)
    Make: Optional[str] = Field(None, example="FORD")
    Model: Optional[str] = Field(None, example="F-150 FFV")
    Class: str = Field(..., example="Standard Pickup Trucks")
    Drive: str = Field(..., example="4WD")
    Transmission: str = Field(..., example="Automatic 6-Speed")
    Fuel_Type: str = Field(..., alias="Fuel Type", example="Regular")
    Engine_Cylinders: int = Field(..., example=8)
    Engine_Displacement: float = Field(..., example=5.0)
    City_MPG: float = Field(..., alias="City MPG (FT1)", example=14.0)
    Highway_MPG: float = Field(..., alias="Highway MPG (FT1)", example=18.0)
    Combined_MPG: float = Field(..., alias="Combined MPG (FT1)", example=15.0)
    Tailpipe_CO2: float = Field(..., alias="Tailpipe CO2 (FT1)", example=593.0)
    Annual_Fuel_Cost: float = Field(..., alias="Annual Fuel Cost (FT1)", example=3300.0)

    class Config:
        populate_by_name = True


class EcoScoreResponse(BaseModel):
    Vehicle_ID: Optional[str]
    predicted_eco_score: float = Field(..., description="Predicted fuel economy score (1–10)")
    eco_grade: Literal["A", "B", "C", "D", "F"]
    ghg_rating: Literal["EXCELLENT", "GOOD", "AVERAGE", "POOR"]
    annual_co2_kg: float
    recommendation: str


# ─────────────────────────────────────────────
# Service 5 — Driver Behaviour Scoring
# ─────────────────────────────────────────────

class DriverScoreRequest(BaseModel):
    Driver_ID: Optional[str] = Field(None, example="D-201")
    overspeed_events: int = Field(..., example=3, description="Times driver exceeded speed limit")
    harsh_brake_events: int = Field(..., example=5, description="Harsh braking events")
    harsh_accel_events: int = Field(..., example=2, description="Harsh acceleration events")
    idle_minutes: float = Field(..., example=45.0, description="Total idle time in minutes")
    late_deliveries: int = Field(..., example=1, description="Number of late deliveries")
    on_time_deliveries: int = Field(..., example=12, description="On-time deliveries (bonus)")

    class Config:
        json_schema_extra = {
            "example": {
                "Driver_ID": "D-201",
                "overspeed_events": 3,
                "harsh_brake_events": 5,
                "harsh_accel_events": 2,
                "idle_minutes": 45.0,
                "late_deliveries": 1,
                "on_time_deliveries": 12,
            }
        }


class DriverScoreResponse(BaseModel):
    Driver_ID: Optional[str]
    score: float = Field(..., description="Behaviour score 0–100")
    grade: Literal["A", "B", "C", "D", "F"]
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    badge: str
    penalties: dict
    recommendation: str


# ─────────────────────────────────────────────
# Service 6 — Carbon Emission Tracking
# ─────────────────────────────────────────────

class CarbonRequest(BaseModel):
    Vehicle_ID: Optional[str] = Field(None, example="V-1042")
    Trip_ID: Optional[str] = Field(None, example="T-5021")
    fuel_type: str = Field(..., example="diesel", description="diesel / petrol / gasoline / cng / lpg / electric")
    fuel_litres: float = Field(..., example=48.5, description="Fuel consumed in litres")
    distance_km: float = Field(..., example=320.0, description="Distance covered in km")

    class Config:
        json_schema_extra = {
            "example": {
                "Vehicle_ID": "V-1042",
                "Trip_ID": "T-5021",
                "fuel_type": "diesel",
                "fuel_litres": 48.5,
                "distance_km": 320.0,
            }
        }


class CarbonResponse(BaseModel):
    Vehicle_ID: Optional[str]
    Trip_ID: Optional[str]
    fuel_type: str
    fuel_litres: float
    distance_km: float
    co2_kg: float = Field(..., description="Total CO2 emitted in kg")
    co2_per_km: float = Field(..., description="CO2 kg per km")
    trees_to_offset: float = Field(..., description="Trees needed to offset this CO2 (~21 kg/tree/year)")
    emission_rating: Literal["EXCELLENT", "GOOD", "AVERAGE", "POOR"]
    recommendation: str


# ─────────────────────────────────────────────
# Service 7 — Smart Route Optimization
# ─────────────────────────────────────────────

class RouteRequest(BaseModel):
    Trip_ID: Optional[str] = Field(None, example="T-5021")
    distance_km: float = Field(..., example=280.0, description="Route distance in km")
    road_type: str = Field(..., example="highway", description="highway / urban / rural / mixed")
    traffic_level: str = Field(..., example="medium", description="low / medium / high / jam")
    weather: str = Field(..., example="clear", description="clear / rain / fog / snow / storm")
    current_load_kg: float = Field(..., example=4500.0, description="Current cargo load in kg")
    max_load_kg: float = Field(..., example=8000.0, description="Vehicle max load capacity in kg")
    base_fuel_consumption_l100km: float = Field(..., example=12.0, description="Base fuel consumption (L/100km)")

    class Config:
        json_schema_extra = {
            "example": {
                "Trip_ID": "T-5021",
                "distance_km": 280.0,
                "road_type": "highway",
                "traffic_level": "medium",
                "weather": "clear",
                "current_load_kg": 4500.0,
                "max_load_kg": 8000.0,
                "base_fuel_consumption_l100km": 12.0,
            }
        }


class RouteResponse(BaseModel):
    Trip_ID: Optional[str]
    distance_km: float
    effective_speed_kmh: float
    estimated_hours: float
    estimated_fuel_litres: float
    delay_risk: Literal["LOW", "MEDIUM", "HIGH"]
    recommendation: str

