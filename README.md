# FleetFlow 🚚 — Intelligent AI-Powered Fleet Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://postgresql.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

FleetFlow is a **full-stack enterprise fleet management + AI system** built with React + Node.js + PostgreSQL + Python FastAPI. It covers real-time vehicle tracking, trip dispatch, maintenance scheduling, fuel analysis, financial analytics (in ₹), and a complete AI layer with trained ML models for predictive maintenance, fuel anomaly detection, delivery delay prediction, driver scoring, carbon tracking, route optimization, and a live IoT vehicle simulator.

---

## 🌟 Features

### Core Platform
| Module | Highlights |
|--------|-----------|
| 🚗 **Fleet Management** | Vehicle lifecycle, multi-type (Truck/Van/Bike), odometer & capacity |
| 👨‍✈️ **Driver Management** | License expiry, safety score (0–5), status tracking |
| 🗺️ **Trip Dispatch** | DRAFT → DISPATCHED → COMPLETED flow, cargo weight validation, revenue in ₹ |
| 🔧 **Maintenance** | Service scheduling, cost tracking, auto vehicle status update |
| ⛽ **Fuel Management** | Cost per litre, trip-linked logs, efficiency metrics — all in ₹ |
| 📊 **Analytics** | Dashboard KPIs, vehicle ROI, monthly financials, PDF/CSV export — ₹ |
| 🔐 **Auth & RBAC** | JWT, bcrypt, 4 roles (Fleet Manager / Dispatcher / Safety Officer / Financial Analyst) |
| 👤 **User Profile** | Photo upload via Cloudinary, edit name/phone, change password |
| 📧 **Email Notifications** | Welcome and OTP flow via EmailJS |
| ⚡ **Real-time** | Socket.io for live fleet-wide status updates |
| 🌙 **Dark Theme** | Full dark-mode with light-mode toggle across all pages |

### 🧠 AI Services (Python FastAPI — port 8001)
| Service | Type | Dataset Used |
|---------|------|-------------|
| 🔧 **Predictive Maintenance** | RandomForest Classifier | logistics_dataset (92k rows) |
| ⛽ **Fuel CO2 Prediction** | GradientBoosting Regressor | CO2 Emissions Canada |
| 🚨 **Fuel Anomaly Detection** | IsolationForest | CO2 Emissions Canada |
| ⏱️ **Delivery Delay Prediction** | RandomForest Regressor | logistics_dataset |
| 🌿 **Vehicle Eco Score** | GradientBoosting Regressor | EPA Vehicle Database |
| 👨‍✈️ **Driver Behaviour Score** | Rule-based (formula) | Live telemetry events |
| 💨 **Carbon Emission Tracking** | Formula-based | Diesel/Petrol emission factors |
| 🛣️ **Route Time Estimation** | Physics-based model | Traffic + weather + load |

---

## 🏗️ Project Structure

```
FleetFlow/
│
├── frontend/                        # React 18 + Vite
│   └── src/
│       ├── pages/                   # Dashboard, Vehicles, Drivers, Trips, Fuel, Maintenance...
│       ├── components/              # Reusable UI components (animated with Framer Motion)
│       └── ...
│
├── backend/                         # Node.js + Express (port 3000)
│   └── src/
│       ├── app.js                   # Express app + /api/ai proxy routes
│       ├── routes/
│       │   ├── ai.routes.js         # → Proxies all /api/ai/* to AI service
│       │   ├── auth.routes.js
│       │   ├── vehicle.routes.js
│       │   ├── driver.routes.js
│       │   ├── trip.routes.js
│       │   ├── maintenance.routes.js
│       │   ├── fuel.routes.js
│       │   └── analytics.routes.js
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       └── sockets/                 # Socket.io real-time
│
├── ai-service/                      # Python FastAPI (port 8001)
│   ├── main.py                      # All 7 AI endpoints
│   ├── schemas.py                   # Pydantic request/response models
│   ├── requirements.txt
│   ├── train_all.py                 # One-shot model trainer
│   │
│   ├── datasets/                    # Your 4 CSV datasets
│   │   ├── logistics_dataset_with_maintenance_required.csv
│   │   ├── CO2 Emissions_Canada.csv
│   │   ├── database.csv
│   │   └── Data Description.csv
│   │
│   ├── models/                      # Trained .pkl files (auto-generated)
│   │   ├── maintenance.pkl
│   │   ├── fuel_co2.pkl
│   │   ├── fuel_anomaly.pkl
│   │   ├── delay_model.pkl
│   │   └── eco_score_model.pkl
│   │
│   ├── training/
│   │   ├── train_maintenance.py
│   │   ├── train_fuel.py
│   │   └── train_delay.py
│   │
│   └── utils/
│       └── preprocessing.py         # Feature engineering pipelines
│
├── simulator/                       # IoT Vehicle Telemetry Simulator
│   ├── vehicleSimulator.py          # Multi-threaded simulator (12 Indian city routes)
│   └── logs/                        # CSV session logs (auto-created)
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **PostgreSQL** 14+ (or [Neon](https://neon.tech) cloud)
- **Python** 3.10+ with `py` launcher
- An **EmailJS** account — [emailjs.com](https://emailjs.com)

---

### 1. Clone
```bash
git clone https://github.com/Fenil412/FleetFlow.git
cd FleetFlow
```

---

### 2. Database Setup (Neon PostgreSQL)
1. Create a [Neon](https://neon.tech) project and copy your `DATABASE_URL`
2. Initialize the schema:
```bash
cd backend
npm run db:init
```

---

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.sample .env
# Edit .env with DATABASE_URL, JWT_SECRET, Cloudinary keys, EmailJS keys
npm run dev
```
**Backend:** `http://localhost:3000`

---

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
**Frontend:** `http://localhost:5173`

---

### 5. AI Service Setup
```bash
cd ai-service

# Install Python dependencies
py -m pip install -r requirements.txt

# Train all ML models (takes 2–5 min, one-time only)
py train_all.py

# Start AI server
py -m uvicorn main:app --reload --port 8001
```
**AI Service:** `http://localhost:8001`  
**Swagger UI:** `http://localhost:8001/docs`

---

### 6. Vehicle Simulator (Optional)
```bash
cd simulator

# Console mode — 3 vehicles
py vehicleSimulator.py

# 5 vehicles + push telemetry to AI APIs
py vehicleSimulator.py --vehicles 5 --push-api

# Export session to CSV log
py vehicleSimulator.py --vehicles 3 --export-csv

# Full demo mode
py vehicleSimulator.py --vehicles 5 --push-api --export-csv
```

---

## 📡 API Reference

### 🔐 Authentication
```
POST /api/auth/register               # Register new user
POST /api/auth/login                  # Login → returns JWT
POST /api/auth/forgot-password        # Send OTP to email
POST /api/auth/verify-otp             # Verify OTP
POST /api/auth/reset-password         # Set new password
GET  /api/auth/profile                # Get own profile       [protected]
PATCH /api/auth/profile               # Update name/phone     [protected]
POST /api/auth/profile/avatar         # Upload photo (Cloudinary) [protected]
PATCH /api/auth/profile/password      # Change password       [protected]
```

### 🚗 Vehicles / Drivers / Trips / Maintenance / Fuel
```
GET|POST|PATCH|DELETE  /api/vehicles
GET|POST|PATCH|DELETE  /api/drivers
GET|POST|PATCH|DELETE  /api/trips
GET|POST|PATCH|DELETE  /api/maintenance
GET|POST|PATCH|DELETE  /api/fuel
GET  /api/analytics/dashboard         # KPIs
GET  /api/analytics/vehicle-roi       # Per-vehicle ROI (₹)
GET  /api/analytics/monthly-financials
GET  /api/analytics/driver-performance
```

### 🧠 AI Endpoints (via Node backend proxy `/api/ai/*`)
```
POST /api/ai/maintenance     # Predictive maintenance risk
POST /api/ai/fuel            # CO2 prediction + anomaly detection
POST /api/ai/delay           # Delivery delay estimation
POST /api/ai/eco-score       # Vehicle fuel economy grade (A–F)
POST /api/ai/driver-score    # Driver behaviour score (0–100)
POST /api/ai/carbon          # Carbon emission in kg + trees to offset
POST /api/ai/route           # Route ETA with traffic/weather/load
GET  /api/ai/health          # AI service health check
GET  /api/ai/models          # Loaded model status
```
> Or call the AI service directly at `http://localhost:8001`

---

## ⚙️ Tech Stack

### Frontend
| Package | Purpose |
|---------|---------|
| React 18 + Vite | UI framework + build tool |
| Framer Motion | Page transitions, stagger, 3D animations |
| Tailwind CSS | Utility-first styling |
| React Router DOM 6 | Client-side routing |
| Recharts / Chart.js | Analytics charts |
| Lucide React | Icons |
| Socket.io Client | Real-time updates |
| jsPDF + autotable | PDF export |

### Backend (Node.js)
| Package | Purpose |
|---------|---------|
| Express 5 | Web framework |
| pg | PostgreSQL client |
| jsonwebtoken + bcryptjs | Auth |
| Socket.io | WebSocket server |
| Multer + Cloudinary | File uploads |
| Helmet + Morgan | Security + logging |

### AI Service (Python)
| Package | Purpose |
|---------|---------|
| FastAPI + Uvicorn | API framework |
| scikit-learn | ML models (RF, GBM, IsolationForest) |
| pandas + numpy | Data processing |
| joblib | Model serialization |
| Pydantic v2 | Request/response validation |

### Database
| Table | Description |
|-------|-------------|
| `roles` | RBAC roles |
| `users` | Users + avatar + OTP |
| `vehicles` | Fleet vehicles |
| `drivers` | Drivers + license |
| `trips` | Trip lifecycle |
| `maintenance_logs` | Service history (₹) |
| `fuel_logs` | Fuel fills (₹) |
| `driver_performance` | Per-trip ratings |
| `audit_logs` | Activity trail |

---

## 🔒 Security

- **JWT** — 7-day stateless auth tokens
- **bcrypt** — password hashing (10 salt rounds)
- **RBAC middleware** — route-level role enforcement
- **Parameterized queries** — SQL injection prevention
- **Helmet** — HTTP security headers
- **OTP expiry** — 10-minute window

---

## 🤖 AI Architecture

```
React Dashboard
      ↓
Node.js Backend (port 3000)  ← /api/ai/* proxy routes
      ↓  ↑ JSON
Python FastAPI (port 8001)
      ↓
9 Trained ML Models (.pkl)
      ↑
Vehicle Simulator → pushes live telemetry every 3s
```

### Simulator Data Flow
The `vehicleSimulator.py` generates realistic IoT telemetry for any number of vehicles travelling between **12 Indian cities** (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad…) and automatically:
- Detects anomalies (overheating, low fuel, vibration spikes)
- Pushes to `/predict/maintenance` and `/predict/driver-score`
- Exports session CSV with 26 sensor fields per tick

---

## 🗺️ Roadmap

- [x] ~~GPS live tracking integration~~ *(simulator with 12 India city routes)*
- [x] ~~Predictive maintenance ML~~ *(RandomForest — 92k rows, live)*
- [x] ~~Fuel anomaly detection~~ *(IsolationForest)*
- [x] ~~Driver behaviour scoring~~ *(formula engine)*
- [x] ~~Carbon emission tracking~~ *(real emission factors)*
- [x] ~~IoT telematics simulation~~ *(vehicleSimulator.py)*
- [ ] OpenRouteService / Google Maps integration
- [ ] AI Fleet Assistant (LangChain + LLM)
- [ ] Mobile-responsive PWA
- [ ] Multi-tenant / multi-company support
- [ ] Automated scheduled reports

---

## 🚀 Production Deployment

```bash
# Backend — PM2
npm install -g pm2
cd backend
NODE_ENV=production pm2 start src/server.js --name fleetflow-api

# AI Service — Gunicorn
cd ai-service
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001

# Frontend — Static build
cd frontend && npm run build
# Serve dist/ with nginx / Vercel / Netlify
```

---

## 📝 License

ISC License — see [LICENSE](LICENSE)

---

*Built with ❤️ for efficient Indian fleet operations — all monetary values in ₹ (Indian Rupee)*