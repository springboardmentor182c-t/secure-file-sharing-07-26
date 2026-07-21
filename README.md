<<<<<<< HEAD
# TrustShare - Secure File-Sharing System

This repository currently contains the Dashboard module for TrustShare.

Official stack:

- React frontend
- FastAPI backend APIs
- PostgreSQL database

The implemented backend scope is intentionally limited to dashboard overview data. It does not include authentication, file management, sharing workflows, encryption workflows, notification delivery, admin dashboard, analytics, or settings modules.

## Project Structure

```text
client/
  src/features/dashboard/
  src/pages/Dashboard.jsx

server/
  app/api/v1/dashboard/
  app/models/dashboard.py
  app/database/session.py
  app/core/config.py
```

## PostgreSQL Setup

Create a PostgreSQL database and user for local development:

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

The FastAPI app creates dashboard tables on startup and seeds dashboard development data when `DASHBOARD_SEED_ON_STARTUP=true`.

You can also seed manually:

```bash
cd server
python -m scripts.seed_dashboard
```

## FastAPI Server

Install backend dependencies:

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Run the API:

```bash
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

Install and run:
=======
# TrustShare Security Dashboard

This repository contains the standalone **TrustShare Security Dashboard** module, structured into separate Frontend (`client`) and Backend (`server`) layers.

Original design reference: [Figma Design Link](https://www.figma.com/design/bzHpb3v3Oj5XXKXy26YMxB/Build-web-app-from-design)

---

## 📂 Repository Structure

* **`client/`**: React + Tailwind + Vite frontend client that connects to the backend REST API.
* **`server/`**: FastAPI + SQLAlchemy + PostgreSQL backend service hosting security logs, authentication status, and encryption key rotation logic.

---

## 🚀 How to Run the Application

### 1. Database Setup (PostgreSQL)
Ensure you have a PostgreSQL server running. Create a database for the application:
```sql
CREATE DATABASE security_dashboard;
```

By default, the backend expects a connection URL matching:
`postgresql+pg8000://postgres:postgres@localhost:5432/security_dashboard`

You can customize this by setting the `DATABASE_URL` environment variable.

### 2. Start the Backend Server (`server`)
Navigate to the `server` directory, install dependencies, and start the FastAPI dev server:

```bash
cd server
pip install -r requirements.txt
# Optional: set custom DB credentials
# export DATABASE_URL="postgresql+pg8000://username:password@host:port/database_name"
uvicorn src.main:app --reload
```
The API server will run at: **`http://localhost:8000`**

### 3. Start the Frontend Client (`client`)
Open a new terminal window, navigate to the `client` directory, install dependencies, and run the development server:
>>>>>>> origin/main-group-B

```bash
cd client
npm install
npm run dev
```
<<<<<<< HEAD

Open:

```text
http://localhost:5173
```

The dashboard first calls the FastAPI endpoints. If the backend is unavailable during development, the frontend falls back to local dashboard mock data from `client/src/features/dashboard/data/mockDashboardData.js`.

## Dashboard Integration

Use the page wrapper inside the shared app router:

```jsx
import Dashboard from './pages/Dashboard';
```

Or mount the feature directly inside a teammate-owned layout:

```jsx
import Dashboard from './features/dashboard/Dashboard';
```

The Dashboard component does not include global sidebar, header, routing, authentication, or unrelated modules.
=======
The client app will open at: **`http://localhost:5173`**
>>>>>>> origin/main-group-B
