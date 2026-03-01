"""
vehicleSimulator.py — FleetFlow IoT Vehicle Telemetry Simulator
════════════════════════════════════════════════════════════════
Simulates a fleet of vehicles producing live sensor data every few seconds.

What it simulates:
  • Speed (km/h)                  • Fuel level (L)
  • Engine temperature (°C)       • Tire pressure (PSI)
  • Battery status (%)            • Vibration levels
  • Oil quality (0-100)           • Brake events
  • GPS coordinates (India routes)• CO2 per km
  • Harsh braking / acceleration  • Idle time

Modes:
  1. Console mode   → prints live JSON to terminal
  2. API Push mode  → POSTs telemetry to AI Service + Backend
  3. CSV Export     → saves a session log to simulator/logs/

Usage:
    py vehicleSimulator.py                       # 3 vehicles, console mode
    py vehicleSimulator.py --vehicles 5          # 5 vehicles
    py vehicleSimulator.py --push-api            # push to AI service
    py vehicleSimulator.py --export-csv          # save CSV log
    py vehicleSimulator.py --vehicles 5 --push-api --export-csv
"""

import argparse
import csv
import json
import math
import os
import random
import time
import datetime
import http.client
import threading
from dataclasses import dataclass, field, asdict
from typing import Optional

# ─── Config ───────────────────────────────────────────────────────────────────
AI_HOST       = "localhost"
AI_PORT       = 8001
BACKEND_HOST  = "localhost"
BACKEND_PORT  = 3000

TICK_INTERVAL = 3.0          # seconds between updates
LOG_DIR       = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# ─── Indian city coordinates (lat, lon) ───────────────────────────────────────
CITY_NODES = {
    "Mumbai":    (19.0760, 72.8777),
    "Delhi":     (28.6139, 77.2090),
    "Bangalore": (12.9716, 77.5946),
    "Hyderabad": (17.3850, 78.4867),
    "Chennai":   (13.0827, 80.2707),
    "Kolkata":   (22.5726, 88.3639),
    "Pune":      (18.5204, 73.8567),
    "Ahmedabad": (23.0225, 72.5714),
    "Surat":     (21.1702, 72.8311),
    "Jaipur":    (26.9124, 75.7873),
    "Lucknow":   (26.8467, 80.9462),
    "Nagpur":    (21.1458, 79.0882),
}

CITY_NAMES = list(CITY_NODES.keys())

# ─── Vehicle profiles ─────────────────────────────────────────────────────────
VEHICLE_PROFILES = [
    {"type": "Truck",   "max_speed": 90,  "fuel_tank": 300, "base_consumption": 14.0, "make": "Tata Signa"},
    {"type": "Van",     "max_speed": 110, "fuel_tank": 80,  "base_consumption": 10.5, "make": "Force Traveller"},
    {"type": "Pickup",  "max_speed": 120, "fuel_tank": 60,  "base_consumption": 9.0,  "make": "Mahindra Bolero"},
    {"type": "Mini",    "max_speed": 100, "fuel_tank": 45,  "base_consumption": 7.5,  "make": "Maruti Eeco"},
    {"type": "Tanker",  "max_speed": 80,  "fuel_tank": 400, "base_consumption": 18.0, "make": "Ashok Leyland"},
]

WEATHER_OPTIONS  = ["Clear", "Rain", "Fog", "Cloudy"]
ROAD_OPTIONS     = ["Highway", "Urban", "Rural"]
FUEL_TYPES       = ["diesel"] * 8 + ["petrol"] * 2   # 80% diesel fleet


# ─── Dataclass for one telemetry tick ────────────────────────────────────────
@dataclass
class VehicleTelemetry:
    timestamp:          str
    vehicle_id:         str
    make:               str
    vehicle_type:       str
    driver_id:          str

    # Location
    lat:                float
    lon:                float
    origin_city:        str
    destination_city:   str
    distance_remaining_km: float

    # Engine & Fuel
    speed_kmh:          float
    engine_temp_c:      float
    fuel_level_l:       float
    fuel_consumption_l100km: float
    fuel_type:          str
    battery_pct:        float

    # Tyres & Mechanics
    tire_pressure_psi:  float
    vibration:          float
    oil_quality:        float
    brake_condition:    str

    # Driver events
    is_speeding:        bool
    harsh_brake:        bool
    harsh_accel:        bool
    idle_since_min:     float

    # Conditions
    weather:            str
    road_type:          str

    # Computed
    co2_per_km:         float
    engine_status:      str    # OK / WARNING / CRITICAL
    anomaly_flag:       bool


# ─── Vehicle state (between ticks) ────────────────────────────────────────────
class VehicleState:
    def __init__(self, vid: int):
        profile = random.choice(VEHICLE_PROFILES)
        origin  = random.choice(CITY_NAMES)
        dest    = random.choice([c for c in CITY_NAMES if c != origin])

        self.vehicle_id  = f"V-{1000 + vid}"
        self.driver_id   = f"D-{200 + vid}"
        self.make        = profile["make"]
        self.vtype       = profile["type"]
        self.max_speed   = profile["max_speed"]
        self.fuel_tank   = profile["fuel_tank"]
        self.base_cons   = profile["base_consumption"]   # L/100km
        self.fuel_type   = random.choice(FUEL_TYPES)

        self.origin      = origin
        self.destination = dest

        olat, olon = CITY_NODES[origin]
        dlat, dlon = CITY_NODES[dest]
        self.total_dist  = self._haversine(olat, olon, dlat, dlon)
        self.progress    = random.uniform(0.0, 0.8)   # start mid-journey

        self.fuel_level  = random.uniform(0.4, 1.0) * self.fuel_tank
        self.engine_temp = random.uniform(75.0, 90.0)
        self.tire_psi    = random.uniform(30.0, 36.0)
        self.battery_pct = random.uniform(70.0, 100.0)
        self.oil_quality = random.uniform(50.0, 95.0)
        self.vibration   = random.uniform(0.5, 2.0)
        self.brake_cond  = random.choice(["Good", "Good", "Fair", "Poor"])

        self.idle_min    = 0.0
        self.is_idle     = False
        self.failure_history = random.randint(0, 3)
        self.weather     = random.choice(WEATHER_OPTIONS)
        self.road_type   = random.choice(ROAD_OPTIONS)

        # Harsh event counters (for driver scoring via API)
        self.overspeed_events  = 0
        self.harsh_brake_count = 0
        self.harsh_accel_count = 0
        self.late_deliveries   = random.randint(0, 2)
        self.on_time_deliveries= random.randint(5, 20)

        self.tick_count  = 0

    @staticmethod
    def _haversine(lat1, lon1, lat2, lon2) -> float:
        """Distance in km between two GPS coords."""
        R = 6371.0
        φ1, φ2 = math.radians(lat1), math.radians(lat2)
        dφ = math.radians(lat2 - lat1)
        dλ = math.radians(lon2 - lon1)
        a = math.sin(dφ/2)**2 + math.cos(φ1)*math.cos(φ2)*math.sin(dλ/2)**2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    def _current_coords(self):
        """Interpolate current GPS between origin and destination."""
        olat, olon = CITY_NODES[self.origin]
        dlat, dlon = CITY_NODES[self.destination]
        t = self.progress
        return (
            round(olat + (dlat - olat) * t + random.uniform(-0.005, 0.005), 6),
            round(olon + (dlon - olon) * t + random.uniform(-0.005, 0.005), 6),
        )

    def tick(self) -> VehicleTelemetry:
        self.tick_count += 1
        dt_hours = TICK_INTERVAL / 3600.0

        # ── Random events ────────────────────────────────────────────────────
        # Occasionally change weather / road
        if random.random() < 0.03:
            self.weather   = random.choice(WEATHER_OPTIONS)
        if random.random() < 0.02:
            self.road_type = random.choice(ROAD_OPTIONS)

        # Speed (respects road type)
        road_speed_cap = {"Highway": 1.0, "Urban": 0.4, "Rural": 0.7}
        cap = road_speed_cap.get(self.road_type, 0.7)

        if random.random() < 0.08:   # 8% chance idle
            speed = 0.0
            self.is_idle = True
            self.idle_min += TICK_INTERVAL / 60.0
        else:
            self.is_idle = False
            self.idle_min = 0.0
            base = self.max_speed * cap * random.uniform(0.6, 1.0)
            speed = round(min(base, self.max_speed), 1)

        # Speeding (5% over limit by >10 km/h)
        speed_limit = self.max_speed * cap
        is_speeding = speed > speed_limit * 1.05
        if is_speeding:
            self.overspeed_events += 1

        # Harsh events (low probability)
        harsh_brake = random.random() < 0.04
        harsh_accel = random.random() < 0.05
        if harsh_brake: self.harsh_brake_count += 1
        if harsh_accel: self.harsh_accel_count += 1

        # Engine temperature drift
        if speed > 0:
            self.engine_temp += random.uniform(-1.0, 2.5)
        else:
            self.engine_temp -= random.uniform(0.5, 1.5)
        self.engine_temp = round(max(60.0, min(130.0, self.engine_temp)), 1)

        # Fuel consumption
        load_factor = random.uniform(0.7, 1.3)
        weather_pen = 1.1 if self.weather in ("Rain", "Fog") else 1.0
        l100 = round(self.base_cons * load_factor * weather_pen, 2)
        dist_this_tick = speed * dt_hours   # km
        fuel_used = (l100 / 100.0) * dist_this_tick
        self.fuel_level = round(max(0.0, self.fuel_level - fuel_used), 2)

        # Tyre pressure slow drift
        self.tire_psi += random.uniform(-0.05, 0.02)
        self.tire_psi = round(max(20.0, min(40.0, self.tire_psi)), 1)

        # Battery: slow drain when running, slow charge at idle (alt)
        self.battery_pct += random.uniform(-0.3, 0.1)
        self.battery_pct = round(max(20.0, min(100.0, self.battery_pct)), 1)

        # Oil quality degrades slowly
        self.oil_quality -= random.uniform(0.0, 0.05)
        self.oil_quality = round(max(0.0, self.oil_quality), 1)

        # Vibration
        if harsh_brake or harsh_accel:
            self.vibration += random.uniform(0.5, 1.5)
        else:
            self.vibration -= random.uniform(0.0, 0.1)
        self.vibration = round(max(0.0, min(10.0, self.vibration)), 2)

        # Progress along route
        if speed > 0 and self.total_dist > 0:
            self.progress += dist_this_tick / self.total_dist
        if self.progress >= 1.0:
            # Complete trip → pick new destination
            self.origin      = self.destination
            self.destination = random.choice([c for c in CITY_NAMES if c != self.origin])
            olat, olon = CITY_NODES[self.origin]
            dlat, dlon = CITY_NODES[self.destination]
            self.total_dist  = self._haversine(olat, olon, dlat, dlon)
            self.progress    = 0.0
            self.on_time_deliveries += (1 if random.random() > 0.2 else 0)
            self.late_deliveries    += (1 if random.random() < 0.1 else 0)

        lat, lon = self._current_coords()
        dist_remaining = round(self.total_dist * (1.0 - self.progress), 1)

        # CO2 per km (diesel 2.68, petrol 2.31)
        ef = 2.68 if self.fuel_type == "diesel" else 2.31
        co2_per_km = round((l100 / 100.0) * ef, 4) if speed > 0 else 0.0

        # Engine status
        if self.engine_temp >= 120 or self.tire_psi < 25 or self.oil_quality < 20:
            eng_status = "CRITICAL"
        elif self.engine_temp >= 105 or self.tire_psi < 28 or self.battery_pct < 30:
            eng_status = "WARNING"
        else:
            eng_status = "OK"

        # Anomaly flag: fuel too low, temp too high, or vibration spike
        anomaly = (
            self.fuel_level < 0.1 * self.fuel_tank
            or self.engine_temp >= 115
            or self.vibration >= 7.0
        )

        return VehicleTelemetry(
            timestamp=datetime.datetime.now().isoformat(),
            vehicle_id=self.vehicle_id,
            make=self.make,
            vehicle_type=self.vtype,
            driver_id=self.driver_id,
            lat=lat,
            lon=lon,
            origin_city=self.origin,
            destination_city=self.destination,
            distance_remaining_km=dist_remaining,
            speed_kmh=speed,
            engine_temp_c=self.engine_temp,
            fuel_level_l=self.fuel_level,
            fuel_consumption_l100km=l100,
            fuel_type=self.fuel_type,
            battery_pct=self.battery_pct,
            tire_pressure_psi=self.tire_psi,
            vibration=self.vibration,
            oil_quality=self.oil_quality,
            brake_condition=self.brake_cond,
            is_speeding=is_speeding,
            harsh_brake=harsh_brake,
            harsh_accel=harsh_accel,
            idle_since_min=round(self.idle_min, 1),
            weather=self.weather,
            road_type=self.road_type,
            co2_per_km=co2_per_km,
            engine_status=eng_status,
            anomaly_flag=anomaly,
        )


# ─── API helpers ──────────────────────────────────────────────────────────────
def _http_post(host: str, port: int, path: str, body: dict):
    """Simple synchronous HTTP POST — no external deps, uses stdlib only."""
    try:
        payload = json.dumps(body).encode()
        conn = http.client.HTTPConnection(host, port, timeout=3)
        conn.request("POST", path, body=payload,
                     headers={"Content-Type": "application/json"})
        resp = conn.getresponse()
        data = resp.read().decode()
        conn.close()
        return resp.status, json.loads(data) if data else {}
    except Exception as e:
        return None, {"error": str(e)}


def push_to_ai_service(tel: VehicleTelemetry, state: VehicleState):
    """Send relevant telemetry to applicable AI endpoints."""
    # 1. Maintenance prediction
    maint_body = {
        "Vehicle_ID": tel.vehicle_id,
        "Usage_Hours": state.tick_count * TICK_INTERVAL / 3600,
        "Actual_Load": random.uniform(3.0, 8.0),
        "Engine_Temperature": tel.engine_temp_c,
        "Tire_Pressure": tel.tire_pressure_psi,
        "Fuel_Consumption": tel.fuel_consumption_l100km,
        "Battery_Status": tel.battery_pct,
        "Vibration_Levels": tel.vibration,
        "Oil_Quality": tel.oil_quality,
        "Failure_History": state.failure_history,
        "Anomalies_Detected": 1 if tel.anomaly_flag else 0,
        "Predictive_Score": min(1.0, tel.vibration / 10.0 + (tel.engine_temp_c - 80) / 100),
        "Downtime_Maintenance": 0.0,
        "Impact_on_Efficiency": 0.1,
        "Brake_Condition": tel.brake_condition,
        "Weather_Conditions": tel.weather,
        "Road_Conditions": tel.road_type,
    }
    status, result = _http_post(AI_HOST, AI_PORT, "/predict/maintenance", maint_body)
    if status == 200 and result.get("risk_level") in ("MEDIUM", "HIGH"):
        print(f"  ⚠️  [{tel.vehicle_id}] Maintenance Risk: {result['risk_level']} — {result['recommendation']}")

    # 2. Carbon tracking
    carbon_body = {
        "Vehicle_ID": tel.vehicle_id,
        "fuel_type": tel.fuel_type,
        "fuel_litres": round(tel.fuel_consumption_l100km / 100 * 10, 3),  # per 10 km
        "distance_km": 10.0,
    }
    _http_post(AI_HOST, AI_PORT, "/predict/carbon", carbon_body)

    # 3. Driver score push every 20 ticks
    if state.tick_count % 20 == 0:
        driver_body = {
            "Driver_ID": tel.driver_id,
            "overspeed_events": state.overspeed_events,
            "harsh_brake_events": state.harsh_brake_count,
            "harsh_accel_events": state.harsh_accel_count,
            "idle_minutes": tel.idle_since_min,
            "late_deliveries": state.late_deliveries,
            "on_time_deliveries": state.on_time_deliveries,
        }
        status, result = _http_post(AI_HOST, AI_PORT, "/predict/driver-score", driver_body)
        if status == 200:
            print(f"  🚗 [{tel.driver_id}] Driver Score: {result.get('score')}/100 "
                  f"| Grade: {result.get('grade')} | {result.get('badge')}")


# ─── CSV logger ───────────────────────────────────────────────────────────────
class CsvLogger:
    def __init__(self, session_ts: str):
        fname = os.path.join(LOG_DIR, f"session_{session_ts}.csv")
        self._file = open(fname, "w", newline="", encoding="utf-8")
        self._writer = None
        self._path = fname
        print(f"📁 CSV log: {fname}")

    def write(self, tel: VehicleTelemetry):
        row = asdict(tel)
        if self._writer is None:
            self._writer = csv.DictWriter(self._file, fieldnames=list(row.keys()))
            self._writer.writeheader()
        self._writer.writerow(row)
        self._file.flush()

    def close(self):
        self._file.close()
        print(f"\n✅ CSV log saved: {self._path}")


# ─── Single vehicle loop ──────────────────────────────────────────────────────
def simulate_vehicle(
    vid: int,
    push_api: bool,
    csv_logger: Optional[CsvLogger],
    stop_event: threading.Event,
):
    state = VehicleState(vid)
    print(f"🚛 [{state.vehicle_id}] Started — {state.origin} → {state.destination} "
          f"({state.total_dist:.0f} km) | {state.make} | {state.vtype}")

    while not stop_event.is_set():
        tel = state.tick()
        _print_tick(tel)

        if push_api:
            push_to_ai_service(tel, state)

        if csv_logger:
            csv_logger.write(tel)

        time.sleep(TICK_INTERVAL)


def _print_tick(tel: VehicleTelemetry):
    status_icon = {"OK": "🟢", "WARNING": "🟡", "CRITICAL": "🔴"}.get(tel.engine_status, "⚪")
    anomaly_str = " 🚨ANOMALY" if tel.anomaly_flag else ""
    speeding_str = " 💨SPEEDING" if tel.is_speeding else ""
    harsh_str = " 🛑HARSH_BRAKE" if tel.harsh_brake else ""
    print(
        f"{status_icon} [{tel.vehicle_id}] "
        f"{tel.origin_city}→{tel.destination_city} "
        f"| {tel.speed_kmh:.0f}km/h "
        f"| Fuel:{tel.fuel_level_l:.1f}L "
        f"| Eng:{tel.engine_temp_c}°C "
        f"| Vib:{tel.vibration} "
        f"| CO₂:{tel.co2_per_km:.3f}kg/km"
        f"{anomaly_str}{speeding_str}{harsh_str}"
    )


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="FleetFlow Vehicle IoT Simulator")
    parser.add_argument("--vehicles",   type=int, default=3, help="Number of vehicles to simulate (default: 3)")
    parser.add_argument("--push-api",   action="store_true",  help="Push telemetry to AI service API")
    parser.add_argument("--export-csv", action="store_true",  help="Export session to CSV in simulator/logs/")
    parser.add_argument("--ticks",      type=int, default=0,  help="Stop after N ticks (0 = run forever)")
    args = parser.parse_args()

    print("=" * 70)
    print("  🚚  FleetFlow Vehicle IoT Simulator")
    print(f"  Vehicles : {args.vehicles}")
    print(f"  API Push : {'✅ ON (port 8001)' if args.push_api else '❌ OFF'}")
    print(f"  CSV Log  : {'✅ ON' if args.export_csv else '❌ OFF'}")
    print(f"  Interval : {TICK_INTERVAL}s per tick")
    print("=" * 70)

    session_ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    logger = CsvLogger(session_ts) if args.export_csv else None

    stop_event = threading.Event()
    threads = []

    for i in range(args.vehicles):
        t = threading.Thread(
            target=simulate_vehicle,
            args=(i, args.push_api, logger, stop_event),
            daemon=True,
        )
        threads.append(t)
        t.start()
        time.sleep(0.5)   # stagger starts

    try:
        if args.ticks > 0:
            time.sleep(args.ticks * TICK_INTERVAL + 2)
            stop_event.set()
        else:
            print("\n⏹️  Press Ctrl+C to stop the simulator.\n")
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping simulator …")
        stop_event.set()

    for t in threads:
        t.join(timeout=5)

    if logger:
        logger.close()

    print("✅ Simulator stopped.")


if __name__ == "__main__":
    main()
