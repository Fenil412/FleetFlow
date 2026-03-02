# FleetFlow — Backend API Server

**Node.js / Express 5** backend for FleetFlow. Handles authentication, PostgreSQL database access, business logic, Socket.io real-time events, and acts as a secure proxy to the Python AI microservice.

---

## 🛠️ Tech Stack

| Package | Purpose |
|---------|---------|
| Express 5 | Web framework |
| `pg` | PostgreSQL client (Neon.tech) |
| jsonwebtoken + bcryptjs | Stateless JWT auth + password hashing |
| Socket.io | Real-time fleet status WebSocket server |
| Multer + Cloudinary | Profile photo uploads |
| Helmet + Morgan | Security headers + request logging |
| CORS | Configured for production (Vercel/Render) |
| Axios | Internal HTTP proxy to AI service |

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── app.js                   # Express setup, CORS, middleware, proxy routes
│   ├── server.js                # HTTP server entry + Socket.io init
│   ├── config/
│   │   ├── db.js                # PostgreSQL connection pool
│   │   └── env.js               # Environment variable loader
│   ├── controllers/             # Route logic handlers
│   ├── routes/
│   │   ├── ai.routes.js         # Proxy → Python FastAPI (port 8001)
│   │   ├── auth.routes.js       # Register, login, OTP, profile
│   │   ├── vehicle.routes.js
│   │   ├── driver.routes.js
│   │   ├── trip.routes.js
│   │   ├── maintenance.routes.js
│   │   ├── fuel.routes.js
│   │   └── analytics.routes.js
│   ├── middleware/              # JWT auth guard, RBAC role check, error handler
│   ├── services/                # DB queries + Cloudinary service
│   └── sockets/                 # Socket.io event handlers (fleet updates)
├── .env
├── .env.sample
└── package.json
```

---

## 🚀 Setup & Launch

1. **Install:**
   ```bash
   npm install
   ```

2. **Configure `.env`:**
   ```bash
   cp .env.sample .env
   # Fill in: DATABASE_URL, JWT_SECRET, CLOUDINARY_*, FRONTEND_URL, AI_SERVICE_URL
   ```

3. **Init Database (one-time):**
   ```bash
   npm run db:init
   ```

4. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Backend runs on **`http://localhost:3000`**.

---

## 🔌 API Summary

### Auth
```
POST  /api/auth/register
POST  /api/auth/login
POST  /api/auth/forgot-password
POST  /api/auth/verify-otp
POST  /api/auth/reset-password
GET   /api/auth/profile            [JWT]
PATCH /api/auth/profile            [JWT]
POST  /api/auth/profile/avatar     [JWT]
PATCH /api/auth/profile/password   [JWT]
```

### Fleet Resources
```
GET|POST|PATCH|DELETE  /api/vehicles
GET|POST|PATCH|DELETE  /api/drivers
GET|POST|PATCH|DELETE  /api/trips
GET|POST|PATCH|DELETE  /api/maintenance
GET|POST|PATCH|DELETE  /api/fuel
```

### Analytics
```
GET /api/analytics/roi
GET /api/analytics/efficiency
GET /api/analytics/financial
GET /api/analytics/daily-profit
GET /api/analytics/geography
```

### AI Proxy
```
POST /api/ai/maintenance
POST /api/ai/fuel
POST /api/ai/delay
POST /api/ai/eco-score
POST /api/ai/driver-score
POST /api/ai/carbon
POST /api/ai/route
GET  /api/ai/health
```

---

## 🔒 Security

- JWT bearer tokens (7-day expiry)
- bcrypt password hashing (10 rounds)
- RBAC middleware per route (`FLEET_MANAGER`, `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`)
- Parameterized SQL queries
- Helmet HTTP headers
- Production CORS locked to `FRONTEND_URL` env variable
- Socket.io configured for Render WebSocket proxy (forced WebSocket transport)
