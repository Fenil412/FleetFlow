# FleetFlow — React Frontend

A modern, mobile-first **SaaS dashboard** built with React 18 + Vite. Features a fully responsive enterprise UI with glassmorphism, 3D animations, Framer Motion transitions, and a rich analytics suite.

---

## 🛠️ Tech Stack

| Package | Purpose |
|---------|---------|
| React 18 + Vite | UI framework + blazing-fast build |
| React Router DOM v6 | Nested lazy-loaded routing |
| Tailwind CSS | Utility-first design system |
| Framer Motion | Page transitions, stagger, 3D hover |
| Lucide React | Icon set |
| Axios | API client |
| Socket.io Client | Real-time fleet updates |
| Chart.js + react-chartjs-2 | 7 chart types (Line, Bar, Doughnut, Radar, PolarArea, Scatter, Stacked) |
| D3.js | India Heatmap (booking geography) |
| React Hot Toast | Toast notifications |
| jsPDF + autotable | PDF export |

---

## 📁 Directory Structure

```text
frontend/
├── public/               # Static assets
├── src/
│   ├── api/              # Axios instances (axios.js, ai.js)
│   ├── components/
│   │   ├── layout/       # Sidebar (collapsible + tooltips), Topbar, DashboardLayout
│   │   └── ui/           # CustomCursor, PageHeader, StatCard, DataTable,
│   │                     # ModalWrapper, FormField, EmptyState
│   ├── context/          # ThemeContext (dark/light), AuthContext
│   ├── features/auth/    # AuthContext, ProtectedRoute
│   ├── pages/
│   │   ├── landing/      # LandingPage + LandingNavbar (public)
│   │   ├── Dashboard.jsx
│   │   ├── Vehicles.jsx
│   │   ├── Drivers.jsx
│   │   ├── Trips.jsx
│   │   ├── Maintenance.jsx
│   │   ├── FuelLogs.jsx
│   │   ├── Analytics.jsx # 7 chart types + D3 India heatmap
│   │   ├── History.jsx
│   │   ├── AIHub.jsx     # Interactive AI inference UI
│   │   ├── About.jsx
│   │   └── Profile.jsx
│   ├── routes/           # ProtectedRoute with RBAC
│   ├── utils/            # exportUtils (CSV/PDF)
│   ├── App.jsx           # Router + CustomCursor mount
│   ├── main.jsx          # React DOM entry
│   └── index.css         # Design tokens, global utilities
├── .env
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 🎨 Design System

- **Color tokens** — `--color-primary`, `--color-card`, `--color-border`, etc., with full dark/light switching
- **Custom Cursor** — 56px ring + 14px dot, theme-aware (indigo glow dark / deep indigo light), works on all screen sizes
- **Reusable components** — `PageHeader`, `StatCard` (3D tilt), `DataTable` (skeleton + empty state), `ModalWrapper` (AnimatePresence), `FormField`
- **Landing Page** — Full SaaS homepage with hero, features, animations, D3 charts, auth-aware navbar

---

## 🚀 Setup & Launch

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env`:**
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_SOCKET_URL=http://localhost:3000
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   Runs on **`http://localhost:5173`**. Ensure the backend is running on `:3000`.

4. **Production build:**
   ```bash
   npm run build
   # Deploy dist/ to Vercel / Netlify / nginx
   ```

---

## 📊 Analytics Page — Chart Types

| Chart | Metric |
|-------|--------|
| Line | Fleet Efficiency Index (L/100km) |
| Bar | Top 5 Lifecycle Costs |
| Bar | Net Daily Profit (current month) |
| Doughnut | Operational Cost Breakdown |
| Radar | Multi-KPI Performance (this vs last month) |
| Stacked Bar | Monthly Revenue vs Fuel Cost vs Maintenance |
| Polar Area | Maintenance by Service Category |
| Scatter | Fuel consumption vs Distance (per vehicle) |
| Line | Weekly Trip Completion Rate |
| D3 SVG | India Geographic Booking Heatmap |
