# FleetFlow — React Frontend

This folder contains the **React 18 / Vite** frontend for FleetFlow. It is a modern, highly interactive, dark-themed dashboard application built with Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack
- **Framework:** React 18 + Vite
- **Routing:** React Router DOM V6 (Lazy loaded nested routes)
- **Styling:** Tailwind CSS (Vanilla CSS variables in `index.css`)
- **Animations:** Framer Motion (Page transitions, 3D hover effects)
- **Icons:** Lucide-React
- **API Client:** Axios
- **Real-time Data:** Socket.io Client
- **Charts:** Recharts
- **PDF Generation:** jsPDF + autotable
- **Notifications:** React Hot Toast

## 📁 Directory Structure

```text
frontend/
├── public/                 # Static assets (images, fonts, manifest)
├── src/
│   ├── api/                # Axios API clients for Backend & AI endpoints
│   ├── assets/             # Global CSS and raw graphic assets
│   ├── components/
│   │   ├── layout/         # Sidebar, Topbar, Dashboard wrapper
│   │   └── ui/             # Reusable UI (Cards, Buttons, Modals, Spinners)
│   ├── context/            # React Context (Auth context, User state)
│   ├── hooks/              # Custom React Hooks
│   ├── pages/              # Main Route Views
│   │   ├── AIHub.jsx       # 🧠 Master-Detail AI interactive UI
│   │   ├── Dashboard.jsx   # Live KPI charts & Socket streams
│   │   ├── Vehicles.jsx    # Fleet inventory
│   │   ├── Drivers.jsx     # Staff listing
│   │   ├── Trips.jsx       # Dispatch and logistics
│   │   ├── FuelLogs.jsx    # Expenses and emissions (₹) 
│   │   └── Maintenance.jsx # Service tracking
│   ├── App.jsx             # React Router configuration
│   └── main.jsx            # React DOM Mount (Root)
├── .env                    # Vite Environment variables
├── postcss.config.js       # Tailwind PostCSS
├── tailwind.config.js      # Custom theme colors and screens
└── vite.config.js          # Development server and proxy config
```

## 🚀 Setup & Launch

1. **Install dependencies:**
    ```bash
    npm install
    ```

2. **Configure Environment:**
    Ensure your `.env` file points to the Node backend API url:
    ```bash
    VITE_API_URL=http://localhost:5001/api
    VITE_SOCKET_URL=http://localhost:5001
    ```

3. **Start Development Server:**
    ```bash
    npm run dev
    ```
    *The site runs on `http://localhost:5173`. Make sure the Node server is running on `:5001` or the API requests will fail.*

## 🧠 AI Hub Interface
The `AIHub.jsx` page is a complex Master-Detail component mapping to 7 distinct AI models parsed through the backend. It features dynamic, editable input form schemas mapped uniquely to each model.
