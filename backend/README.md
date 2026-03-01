# FleetFlow — Backend API Server

This folder contains the **Node.js / Express** backend for FleetFlow. It handles authentication, database connections (PostgreSQL), business logic, and acts as a secure proxy to the Python AI microservice.

## 🛠️ Tech Stack
- **Framework:** Express.js 5
- **Database:** PostgreSQL (Neon.tech)
- **ORM / Query Builder:** `pg` module
- **Authentication:** JWT + bcryptjs
- **File Uploads:** Cloudinary (via Multer)
- **WebSockets:** Socket.io (for real-time fleet updates)
- **Security:** Helmet, CORS

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── app.js                   # Express application setup & middleware
│   ├── server.js                # Server entry point & Socket.io init
│   ├── config/
│   │   ├── db.js                # PostgreSQL connection pool
│   │   └── env.js               # Environment variables loader
│   ├── controllers/             # Request handlers (logic)
│   ├── routes/                  # Express routers
│   │   └── ai.routes.js         # Proxy to Python FastAPI (Port 8001)
│   ├── middleware/              # Auth guards, Error handlers
│   ├── services/                # Database queries and external APIs
│   └── sockets/                 # Socket.io event handlers
├── .env                         # Environment variables (DB URL, JWT Secret)
└── package.json
```

## 🚀 Setup & Launch

1. **Install dependencies:**
    ```bash
    npm install
    ```

2. **Configure Environment:**
    Copy `.env.sample` to `.env` and fill in your PostgreSQL URL, JWT Secret, and Cloudinary keys:
    ```bash
    cp .env.sample .env
    ```

3. **Initialize Database (One-time setup):**
    ```bash
    npm run db:init
    ```

4. **Start Development Server:**
    ```bash
    npm run dev
    ```
    *The server runs on `http://localhost:5001` (Note: The frontend Vite proxy routes `/api` to this port).*

## 🔌 API Proxying
The Node server acts as an intermediary for the AI Engine. 
Requests sent from the Frontend to `http://localhost:5001/api/ai/*` are automatically passed through to the Python `ai-service` running on port 8001, avoiding CORS issues and securing internal network ports.
