# FleetFlow 🚚 — Intelligent AI-Powered Fleet Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://postgresql.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

FleetFlow is a **full-stack enterprise fleet management platform** built with React 18 + Node.js + PostgreSQL + Python FastAPI. It covers real-time vehicle tracking, trip dispatch, maintenance scheduling, fuel analysis, rich financial analytics (in ₹), and a complete AI layer with trained ML models for predictive maintenance, fuel anomaly detection, delivery delay prediction, driver scoring, carbon tracking, and route optimization — all wrapped in a modern, mobile-first SaaS dashboard UI.

---

## 🌟 Features

### Core Platform
| Module | Highlights |
|--------|-----------|
| 🚗 **Fleet Management** | Vehicle lifecycle, multi-type (Truck/Van/Bike), odometer & capacity |
| 👨‍✈️ **Driver Management** | License expiry, safety score (0–5), status tracking |
| 🗺️ **Trip Dispatch** | DRAFT → DISPATCHED → COMPLETED flow, cargo validation, revenue in ₹ |
| 🔧 **Maintenance** | Service scheduling, cost tracking, auto vehicle status update |
| ⛽ **Fuel Management** | Cost per litre, trip-linked logs, efficiency metrics — all in ₹ |
| 📊 **Analytics** | 9 chart types + D3 India heatmap, PDF/CSV export — all in ₹ |
| 🔐 **Auth & RBAC** | JWT, bcrypt, 4 roles (Fleet Manager / Dispatcher / Safety Officer / Financial Analyst) |
| 👤 **User Profile** | Photo upload via Cloudinary, edit name/phone, change password |
| 📧 **Email** | Welcome + OTP flow via EmailJS |
| ⚡ **Real-time** | Socket.io for live fleet-wide status updates |
| 🌙 **Theming** | Full dark/light mode across all pages |
| 🖱️ **Custom Cursor** | Theme-aware 56px ring cursor (indigo glow dark / deep indigo light) |
| 🧠 **AI Intelligence Hub** | Master-Detail UI to run real-time inference against 8 AI models |

### 🧠 AI Services (Python FastAPI — port 8001)

| Service | Type | Dataset |
|---------|------|---------|
| 🔧 Predictive Maintenance | RandomForest Classifier | logistics_dataset (92k rows) |
| ⛽ Fuel CO2 Prediction | GradientBoosting Regressor | CO2 Emissions Canada |
| 🚨 Fuel Anomaly Detection | IsolationForest | CO2 Emissions Canada |
| ⏱️ Delivery Delay Prediction | RandomForest Regressor | logistics_dataset |
| 🌿 Vehicle Eco Score | GradientBoosting Regressor | EPA Vehicle Database |
| 👨‍✈️ Driver Behaviour Score | Deep Logic Engine | Live telemetry events |
| 💨 Carbon Emission Tracking | Deterministic formula | Diesel/Petrol factors |
| 🛣️ Route Time Estimation | Physics-based model | Traffic + weather + load |

---

## 🏗️ Project Structure

```
FleetFlow/
├── frontend/                    # React 18 + Vite (port 5173)
│   └── src/
│       ├── components/
│       │   ├── layout/          # Sidebar, Topbar, DashboardLayout
│       │   └── ui/              # CustomCursor, StatCard, DataTable, Modal...
│       ├── context/             # ThemeContext, AuthContext
│       ├── pages/
│       │   ├── landing/         # Public landing page + auth-aware navbar
│       │   ├── Analytics.jsx    # 9 charts + D3 India heatmap
│       │   └── AIHub.jsx        # Interactive AI inference dashboard
│       └── index.css            # Design tokens + global styles
│
├── backend/                     # Node.js + Express 5 (port 3000)
│   └── src/
│       ├── routes/              # Auth, Vehicles, Drivers, Trips, Fuel, Analytics, AI proxy
│       ├── controllers/
│       ├── services/
│       ├── middleware/          # JWT auth, RBAC, error handler
│       └── sockets/            # Socket.io fleet events
│
├── ai-service/                  # Python FastAPI (port 8001)
│   ├── main.py                  # 8 AI endpoints
│   ├── schemas.py               # Pydantic models
│   ├── train_all.py             # One-shot model trainer
│   ├── datasets/                # Training CSVs
│   ├── models/                  # Auto-generated .pkl files
│   └── utils/                   # Feature engineering
│
├── simulator/                   # IoT Vehicle Telemetry Simulator
│   └── vehicleSimulator.py      # Multi-threaded, 12 Indian city routes
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **PostgreSQL** 14+ (or [Neon](https://neon.tech) cloud)
- **Python** 3.10+ with `py` launcher
- **EmailJS** account — [emailjs.com](https://emailjs.com)
- **Cloudinary** account for photo uploads

### 1. Clone
```bash
git clone https://github.com/Fenil412/FleetFlow.git
cd FleetFlow
```

### 2. Backend
```bash
cd backend
npm install
cp .env.sample .env
# Fill in DATABASE_URL, JWT_SECRET, CLOUDINARY_*, EMAILJS_*, FRONTEND_URL
npm run db:init   # one-time schema setup
npm run dev       # http://localhost:3000
```

### 3. Frontend
```bash
cd frontend
npm install
# .env: VITE_API_URL=http://localhost:3000/api  VITE_SOCKET_URL=http://localhost:3000
npm run dev       # http://localhost:5173
```

### 4. AI Service
```bash
cd ai-service
py -m pip install -r requirements.txt
cp .env.sample .env
py train_all.py                              # one-time training (~2–5 min)
py -m uvicorn main:app --reload --port 8001  # http://localhost:8001
```

### 5. Vehicle Simulator (optional)
```bash
cd simulator
py vehicleSimulator.py --vehicles 5 --push-api --export-csv
```

---

## ⚙️ Tech Stack

### Frontend
| Package | Purpose |
|---------|---------|
| React 18 + Vite | UI + build |
| Framer Motion | Animations, 3D effects |
| Tailwind CSS | Utility styling |
| Chart.js + react-chartjs-2 | 9 chart types (Line, Bar, Doughnut, Radar, PolarArea, Scatter, Stacked, Line-fill) |
| D3.js | India SVG heatmap |
| Socket.io Client | Real-time updates |
| jsPDF + autotable | PDF export |

### Backend (Node.js)
| Package | Purpose |
|---------|---------|
| Express 5 | Web framework |
| pg | PostgreSQL |
| jsonwebtoken + bcryptjs | Auth |
| Socket.io | WebSocket server |
| Multer + Cloudinary | File uploads |
| Helmet | Security headers |

### AI Service (Python)
| Package | Purpose |
|---------|---------|
| FastAPI + Uvicorn | API framework |
| scikit-learn | ML models |
| pandas + numpy | Data processing |
| joblib | Model serialization |
| Pydantic v2 | Validation |

### Database Schema
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

- JWT — 7-day stateless auth tokens
- bcrypt — 10 salt rounds
- RBAC middleware — route-level role enforcement
- Parameterized SQL — injection prevention
- Helmet — HTTP security headers
- OTP — 10-minute expiry window
- CORS — locked to `FRONTEND_URL` in production

---

## 🚀 Production Deployment

```bash
# Backend (Render)
NODE_ENV=production node src/server.js

# AI Service (Render)
gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001

# Frontend (Vercel)
npm run build   # serves dist/ via Vercel
```

---

## 🗺️ Roadmap

- [x] Predictive maintenance ML
- [x] Fuel anomaly detection
- [x] Driver behaviour scoring
- [x] Carbon emission tracking
- [x] IoT telematics simulation
- [x] Mobile-first SaaS dashboard redesign
- [x] Custom theme-aware cursor
- [x] 9 Analytics chart types + D3 India heatmap
- [ ] OpenRouteService / Google Maps live GPS
- [ ] AI Fleet Assistant (LangChain + LLM)
- [ ] PWA offline support
- [ ] Multi-tenant / multi-company support
- [ ] Automated scheduled reports

---

## 📝 License

ISC License — see [LICENSE](LICENSE)

---

*Built with ❤️ for efficient Indian fleet operations — all monetary values in ₹ (Indian Rupee)*