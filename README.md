# FleetFlow 🚚 — Intelligent Fleet & Logistics Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

FleetFlow is a **full-stack enterprise fleet management system** built with React + Node.js + PostgreSQL. It covers real-time vehicle tracking, trip dispatch, maintenance scheduling, fuel analysis, financial analytics (in ₹), and a complete user profile system with photo uploads and email notifications.

---

## 🌟 Features

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
| 🔑 **Forgot Password** | 3-step OTP flow via email (request → verify OTP → reset) |
| 📧 **Email Notifications** | Welcome, sign-in alert, OTP, password-reset-success (Nodemailer) |
| ⚡ **Real-time** | Socket.io for live fleet-wide status updates |
| 🌙 **Dark Theme** | Full dark-mode with light-mode toggle across all pages |

---

## 🏗️ Project Structure

```
FleetFlow/
├── backend/                      # Backend (Node.js + Express)
│   ├── src/
│   │   ├── app.js                # Express app setup
│   │   ├── server.js             # Server entry point
│   │   ├── config/
│   │   │   ├── db.js             # PostgreSQL pool
│   │   │   ├── cloudinary.js     # Cloudinary SDK + uploadBuffer helper
│   │   │   └── mailer.js         # Nodemailer SMTP transporter
│   │   ├── controllers/          # ... and other subdirectories
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── sockets/
│   ├── database/
│   │   ├── schema.sql            # Full DB schema (9 tables + views + triggers)
│   │   ├── migrations/
│   │   └── seed.sql              # Dummy data
│   ├── scripts/                  # Utility scripts
│   ├── .env                      # Your local secrets (never commit)
│   ├── .env.sample               # ← Server env template
│   └── package.json
│
├── frontend/                     # Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   ├── .env
│   ├── .env.sample
│   └── package.json
└── .gitignore (root)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** 9+
- A **Cloudinary** account (free tier is fine) — [cloudinary.com](https://cloudinary.com)
- A **Gmail** account with an App Password for SMTP — [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

### 1. Clone
```bash
git clone https://github.com/Fenil412/FleetFlow.git
cd FleetFlow
```

---

### 2. Database Setup
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE myappdb;"

# Run the schema
psql -U postgres -d myappdb -f backend/database/schema.sql

# Run profile migration
psql -U postgres -d myappdb -f backend/database/migrations/001_add_user_profile.sql

# Seed dummy data
psql -U postgres -d myappdb -f backend/database/seed.sql
```

---

### 3. Backend Setup
```bash
# Install dependencies
cd backend
npm install

# Copy env template and fill in your values
cp .env.sample .env
# → Edit .env with DB credentials, JWT secret, Cloudinary keys, SMTP config

# Start development server
npm run dev
```
**Backend runs on:** `http://localhost:5001`

---

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy env template (optional — defaults work for local dev)
cp .env.sample .env

# Start development server
npm run dev
```
**Frontend runs on:** `http://localhost:5173`

---

### 5. Demo Credentials (after running seed.sql)

| Email | Password | Role |
|-------|----------|------|
| `arjun.mehta@fleetflow.in` | `FleetFlow@123` | Fleet Manager |
| `priya.sharma@fleetflow.in` | `FleetFlow@123` | Dispatcher |
| `ravi.patel@fleetflow.in` | `FleetFlow@123` | Safety Officer |
| `sneha.nair@fleetflow.in` | `FleetFlow@123` | Financial Analyst |

---

## 📡 API Reference

### Authentication
```
POST /api/auth/register               # Register new user
POST /api/auth/login                  # Login → returns JWT
POST /api/auth/forgot-password        # Send OTP to email
POST /api/auth/verify-otp             # Verify OTP → returns resetToken
POST /api/auth/reset-password         # Set new password using resetToken
GET  /api/auth/profile                # Get own profile          [protected]
PATCH /api/auth/profile               # Update name / phone      [protected]
POST /api/auth/profile/avatar         # Upload photo → Cloudinary[protected]
PATCH /api/auth/profile/password      # Change password           [protected]
```

### Vehicles
```
GET    /api/vehicles                  # List all vehicles
POST   /api/vehicles                  # Create vehicle            [FM]
PATCH  /api/vehicles/:id              # Update vehicle            [FM]
DELETE /api/vehicles/:id              # Delete vehicle            [FM]
GET    /api/vehicles/:id/history      # Vehicle trip history
```

### Drivers
```
GET    /api/drivers                   # List all drivers
POST   /api/drivers                   # Add driver               [FM, D]
PATCH  /api/drivers/:id               # Update driver            [FM, D, SO]
DELETE /api/drivers/:id               # Delete driver            [FM]
GET    /api/drivers/:id/performance   # Driver performance log
```

### Trips
```
GET    /api/trips                     # List all trips
POST   /api/trips                     # Create trip              [FM, D]
PATCH  /api/trips/:id/status          # Update status            [FM, D]
DELETE /api/trips/:id                 # Delete trip              [FM]
```

### Maintenance
```
GET    /api/maintenance               # List maintenance logs
POST   /api/maintenance               # Log maintenance          [FM, SO]
PATCH  /api/maintenance/:id           # Update log               [FM, SO]
DELETE /api/maintenance/:id           # Delete log               [FM]
```

### Fuel
```
GET    /api/fuel                      # List fuel logs
POST   /api/fuel                      # Log fuel fill            [FM, FA]
PATCH  /api/fuel/:id                  # Update log               [FM, FA]
DELETE /api/fuel/:id                  # Delete log               [FM, FA]
```

### Analytics
```
GET  /api/analytics/dashboard         # KPIs: vehicles, drivers, trips, revenue
GET  /api/analytics/vehicle-roi       # Per-vehicle ROI (₹)
GET  /api/analytics/fuel-efficiency   # L/100km by vehicle/month
GET  /api/analytics/monthly-financials# Monthly revenue vs cost (₹)
GET  /api/analytics/driver-performance# Driver scores and incidents
```

*Role keys: FM = Fleet Manager · D = Dispatcher · SO = Safety Officer · FA = Financial Analyst*

---

## ⚙️ Tech Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18+ | UI framework |
| Vite | 5+ | Build tool |
| Tailwind CSS | 3 | Styling |
| React Router DOM | 6 | Routing |
| Axios | 1+ | HTTP client |
| Socket.io Client | 4 | Real-time |
| React Hot Toast | 2 | Notifications |
| Chart.js + react-chartjs-2 | — | Charts |
| Lucide React | — | Icons |
| jsPDF + jspdf-autotable | — | PDF export |
| @splinetool/react-spline | — | 3D login background |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Express | 5+ | Web framework |
| pg | — | PostgreSQL client |
| jsonwebtoken | — | JWT auth |
| bcryptjs | — | Password hashing |
| Socket.io | 4 | WebSocket server |
| Multer | — | File upload (memory) |
| Cloudinary SDK | — | Avatar storage |
| Nodemailer | — | Email (SMTP) |
| express-validator | — | Input validation |
| Helmet | — | HTTP security headers |
| Morgan | — | Request logging |
| dotenv | — | Env variables |
| Nodemon | — | Dev auto-reload |

### Database (PostgreSQL 14+)
| Table | Description |
|-------|-------------|
| `roles` | RBAC role definitions |
| `users` | Users + avatar_url + OTP + reset_token |
| `vehicles` | Fleet vehicles with status |
| `drivers` | Drivers with safety score & license |
| `trips` | Trip lifecycle (DRAFT→DISPATCHED→COMPLETED) |
| `maintenance_logs` | Service history with costs (₹) |
| `fuel_logs` | Fuel fills linked to vehicles/trips (₹) |
| `driver_performance` | Per-trip ratings and incidents |
| `audit_logs` | Full activity trail |
| `vehicle_operational_cost` | Analytics view: fuel + maintenance cost |

---

## 🔒 Security

- **JWT** — stateless auth tokens (7-day expiry)
- **bcrypt** — password hashing (10 salt rounds)
- **RBAC middleware** — route-level role enforcement
- **Parameterized queries** — SQL injection prevention
- **Helmet** — security headers
- **Multer validation** — image type + 5 MB limit
- **OTP expiry** — 10-minute window for password reset

---

## 📧 Email Notifications

| Trigger | Email sent |
|---------|-----------|
| User registers | Welcome email with role |
| User logs in | Sign-in alert with timestamp |
| Forgot password | 6-digit OTP (10-min expiry) |
| Password reset | Success confirmation |

Requires `SMTP_USER` + `SMTP_PASS` (Gmail App Password) in `.env`.

---

## 📤 Export

- **CSV** — All analytics tables downloadable as `.csv`
- **PDF** — Branded A4 landscape PDFs with autoTable (jsPDF v4 + jspdf-autotable v5)

---

## 🚀 Production Deployment

```bash
# Backend — PM2 recommended
npm install -g pm2
cd backend
NODE_ENV=production pm2 start src/server.js --name fleetflow-api

# Frontend — build static files
cd frontend && npm run build
# Serve dist/ with nginx / Vercel / Netlify
```

---

## 🗺️ Roadmap

- [ ] GPS live tracking integration
- [ ] Mobile-responsive PWA
- [ ] Predictive maintenance alerts (ML)
- [ ] Automated scheduled reports
- [ ] Multi-tenant / multi-company support
- [ ] IoT telematics integration

---

## 📝 License

ISC License — see [LICENSE](LICENSE)

---

*Built with ❤️ for efficient Indian fleet operations — all monetary values in ₹ (Indian Rupee)*