# FleetFlow — AI Service

This microservice provides 7 machine-learning and rule-based endpoints built with Python and FastAPI. It processes real-time telemetry pushed from the FleetFlow backend and the vehicle simulator.

## 🧠 Available AI Models

| Endpoint | Type | Description |
|---|---|---|
| `POST /predict/maintenance` | RandomForest | Predicts vehicle breakdown risk based on engine temp, vibration, and usage hours. |
| `POST /predict/fuel` | GBM + IsolationForest | Predicts expected CO2 emissions and flags fuel consumption anomalies (theft/leaks). |
| `POST /predict/delay` | RandomForest Regressor | Estimates exact delivery delay hours based on live weather and route traffic. |
| `POST /predict/eco-score` | GradientBoosting | Grades a vehicle (A-F) against EPA standards for overall fuel economy. |
| `POST /predict/driver-score` | Deep Logic Engine | Analyzes speeding, braking, and idling events to score driver safety. |
| `POST /predict/carbon` | Deterministic | Calculates scope 1 carbon emissions from fuel volume and type. |
| `POST /predict/route` | Deterministic | Physics-based travel time estimation based on distance, load, and road type. |

## 📁 Directory Structure

```text
ai-service/
├── main.py                # FastAPI ASGI application & route handlers
├── schemas.py             # Pydantic input validation models
├── train_all.py           # Auto-train script to build .pkl files
├── utils/
│   └── preprocessing.py   # Feature engineering & scaling pipelines
├── datasets/              # Original CSV data for training
├── models/                # Auto-generated scikit-learn .pkl models
├── .env                   # Environment variables (Port, API Keys)
└── requirements.txt       # Python dependencies
```

## 🚀 Setup & Launch

1. **Install dependencies:**
    ```bash
    py -m pip install -r requirements.txt
    ```

2. **Train the models (One-time setup):**
    *This script reads the CSVs in `/datasets` and outputs optimized models to `/models`.*
    ```bash
    py train_all.py
    ```

3. **Start the FastAPI Server:**
    ```bash
    py -m uvicorn main:app --reload --port 8001
    ```
    *The API will be available at `http://localhost:8001`*

## 📚 API Documentation

FastAPI automatically generates an interactive Swagger UI. Once the server is running, visit:
👉 **[http://localhost:8001/docs](http://localhost:8001/docs)**
