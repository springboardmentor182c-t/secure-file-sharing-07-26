# TrustShare - Secure File-Sharing System

This repository contains the Dashboard module for TrustShare.

Official stack:

- React frontend
- Tailwind CSS
- Recharts
- FastAPI backend APIs
- PostgreSQL database

The implemented scope is intentionally limited to the Dashboard module. It does not build authentication, file management, secure sharing workflows, encryption workflows, notification delivery, admin dashboard, analytics module, settings, or global routing/layout ownership.

## Structure

```text
client/src/features/dashboard/
  components/
  constants/
  data/
  hooks/
  services/
  Dashboard.jsx

client/src/pages/Dashboard.jsx

server/app/api/v1/dashboard/
  routes.py
  controller.py
  service.py
  schemas.py

server/app/models/dashboard.py
server/app/database/session.py
server/app/core/config.py
server/scripts/seed_dashboard.py
```

## PostgreSQL Setup

Create a local PostgreSQL database:

```sql
CREATE DATABASE trustshare;
CREATE USER trustshare WITH PASSWORD 'trustshare';
GRANT ALL PRIVILEGES ON DATABASE trustshare TO trustshare;
```

Create `server/.env` from `server/.env.example`:

```env
DATABASE_URL=postgresql+psycopg://trustshare:trustshare@localhost:5432/trustshare
DASHBOARD_SEED_ON_STARTUP=true
BACKEND_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

The dashboard tables are created on FastAPI startup. Seed data is inserted automatically when `DASHBOARD_SEED_ON_STARTUP=true`.

Manual seed command:

```bash
cd server
python -m scripts.seed_dashboard
```

## FastAPI Server

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Health check:

```text
GET http://localhost:8000/health
```

Dashboard API endpoints:

```text
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/recent-files
GET /api/v1/dashboard/recent-activity
GET /api/v1/dashboard/notifications
GET /api/v1/dashboard/storage
GET /api/v1/dashboard/security-status
GET /api/v1/dashboard/charts
GET /api/v1/dashboard/team-activity
```

## React Frontend

Create `client/.env` from `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run the dashboard:

```bash
cd client
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend loads all dashboard content from the FastAPI endpoints backed by PostgreSQL. When the API is unavailable, the dashboard shows an error state with a retry action instead of displaying hardcoded fallback data.

## Integration

Use the page wrapper:

```jsx
import Dashboard from './pages/Dashboard';
```

Or mount the feature directly inside a teammate-owned app shell:

```jsx
import Dashboard from './features/dashboard/Dashboard';
```

The Dashboard includes a reference-style sidebar/topbar for the standalone module preview, but it does not implement real global routing, authentication, or teammate-owned modules.
