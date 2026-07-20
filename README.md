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

```bash
cd client
npm install
npm run dev
```
The client app will open at: **`http://localhost:5173`**