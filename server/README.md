# FastAPI Backend

This is the backend server of our application, built with **FastAPI** using **Clean Architecture** patterns.

## Directory Structure

```text
server/
├── src/
│   ├── auth/           # Authentication controllers, models, and service logic
│   ├── database/       # DB session and base class
│   ├── entities/       # SQLAlchemy database entities (shared tables)
│   ├── todos/          # Todos CRUD module
│   ├── users/          # Users management module
│   ├── api.py          # Unified router mapping
│   ├── exceptions.py   # Global exception handling
│   ├── logging.py      # Logger configuration
│   ├── main.py         # App initialization & middlewares
│   └── rate_limiter.py # Custom rate limiter middleware
├── tests/              # Test suite (unit, service, e2e)
├── Dockerfile
├── docker-compose.yml
├── pytest.ini
├── requirements.txt
└── requirements-dev.txt
```

## Running the Server Locally

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
2. Install requirements:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```
3. Run the development server:
   ```bash
   uvicorn src.main:app --reload
   ```
4. Access API docs at `http://localhost:8000/docs`.

## Running Tests
Run pytest from this directory:
```bash
pytest
```
