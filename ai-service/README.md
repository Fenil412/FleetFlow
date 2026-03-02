# FleetFlow — AI Microservice

**Python FastAPI** microservice providing 8 ML and rule-based inference endpoints. Integrated into the FleetFlow frontend via the **AI Intelligence Hub** and consumed by the Node.js backend proxy.

---

## 🧠 Available Models

| Endpoint | Algorithm | Dataset |
|----------|-----------|---------|
| `POST /predict/maintenance` | RandomForest Classifier | logistics_dataset (92k rows) |
| `POST /predict/fuel` | GradientBoosting Regressor | CO2 Emissions Canada |
| `POST /predict/fuel-anomaly` | IsolationForest | CO2 Emissions Canada |
| `POST /predict/delay` | RandomForest Regressor | logistics_dataset |
| `POST /predict/eco-score` | GradientBoosting Regressor | EPA Vehicle Database |
| `POST /predict/driver-score` | Rule-based Logic Engine | Live telemetry events |
| `POST /predict/carbon` | Deterministic formula | Diesel/Petrol emission factors |
| `POST /predict/route` | Physics-based model | Traffic + weather + load |

---

## 📁 Directory Structure

```text
ai-service/
├── main.py                # FastAPI app + all 8 route handlers
├── schemas.py             # Pydantic v2 request/response models
├── train_all.py           # One-shot trainer → outputs .pkl to /models
├── utils/
│   └── preprocessing.py   # Feature engineering & scaling pipelines
├── datasets/              # Source CSVs for training
│   ├── logistics_dataset_with_maintenance_required.csv
│   ├── CO2 Emissions_Canada.csv
│   └── database.csv
├── models/                # Auto-generated .pkl files (git-ignored)
│   ├── maintenance.pkl
│   ├── fuel_co2.pkl
│   ├── fuel_anomaly.pkl
│   ├── delay_model.pkl
│   └── eco_score_model.pkl
├── .env
├── .env.sample
└── requirements.txt
```

---

## 🚀 Setup & Launch

1. **Install dependencies:**
   ```bash
   py -m pip install -r requirements.txt
   ```

2. **Configure `.env`:**
   ```bash
   cp .env.sample .env
   # Set PORT=8001, any API keys if needed
   ```

3. **Train all models (one-time, ~2–5 min):**
   ```bash
   py train_all.py
   ```

4. **Start the server:**
   ```bash
   py -m uvicorn main:app --reload --port 8001
   ```
   API available at **`http://localhost:8001`**

---

## 📚 API Documentation

FastAPI auto-generates interactive Swagger docs:

👉 **[http://localhost:8001/docs](http://localhost:8001/docs)**

---

## 🔗 Integration

- The **Node.js backend** proxies all `/api/ai/*` requests to this service — frontend never calls this directly in production.
- The **IoT Vehicle Simulator** (`simulator/vehicleSimulator.py`) can push live telemetry to `/predict/maintenance` and `/predict/driver-score` every 3 seconds.
