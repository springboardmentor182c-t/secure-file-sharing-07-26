# SecureShare

### 🔍 Global Search
- **Live Search Bar**: Real-time debounced search bar in the Navbar with popover results overlay.
- **Multi-Entity Matching**: Searches across pages (Dashboard, Analytics, Activity Logs, Settings, Notifications), Users, Folders, and Audit Logs.

### 📊 Analytics & Activity Logs
- **Analytics Dashboard**: Storage usage metrics, activity trend charts (7d, 30d, 90d), top active users, and live system health response monitoring.
- **Real-Time Activity Logs**: Paginated audit log tracking user actions (`LOGIN`, `UPLOAD`, `DOWNLOAD`, `SHARE`, `THREAT`, `LOGIN_FAILED`) with IP logging and severity levels.


## ⚙️ Running Commands

### 1. Backend Setup (FastAPI)

```bash
cd server
```

**Create and activate a virtual environment:**
- **Windows**:
  ```powershell
  python -m venv .venv
  .venv\Scripts\activate
  ```
- **macOS / Linux**:
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  ```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Configure environment file:**
```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

**Start the Backend Server:**
```bash
python -m uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload
```

- **Backend Base URL**: `http://localhost:8000`
- **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc API Docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Frontend Setup (React)

```bash
cd client
```

**Install Node dependencies:**
```bash
npm install
```

**Start the Development Server:**
```bash
npm start
```

- **Frontend Application URL**: [http://localhost:3000](http://localhost:3000)

---

### 3. Docker Setup (PostgreSQL & Full Stack)

**Start PostgreSQL Database only:**
```bash
cd server
docker compose up -d db
```

**Start Full Stack (PostgreSQL + Backend + Frontend):**
```bash
cd server
docker compose up --build
```

---

### 4. Running Tests

```bash
cd server
pytest
```
