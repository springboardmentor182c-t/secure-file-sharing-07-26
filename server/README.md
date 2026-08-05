# Secure File Sharing System — Backend (Shared Links module)

This is the **existing team backend** (`server/`), with the Shared Links
module implemented inside it. Nothing was moved, renamed, or replaced —
`entities/`, `todos/`, `users/`, `auth/`, `database/`, `api.py`, `main.py`
all still exist exactly where they were. This module only:

- **Populated** previously-empty shared infrastructure files that nothing
  else had defined yet: `database/core.py`, `api.py`, `exceptions.py`,
  `logging.py`, and `entities/user.py` (minimal — the Auth team owns this
  long-term).
- **Added** a new `src/shared_links/` folder (mirroring the existing
  `todos/`/`users/`/`auth/` module layout: `models.py`, `service.py`,
  `controller.py`) plus new entities: `file.py`, `shared_link.py`,
  `access_log.py`, `notification.py`.
- **Fixed** `requirements.txt`'s encoding (was UTF-16, which breaks
  `pip install -r`) and appended the new packages this module needs.

`todos/`, `users/`, `auth/` are still empty stubs — untouched, ready for
whoever owns those modules.

## Database: PostgreSQL

**This project uses PostgreSQL — not SQLite** — matching the rest of the
team. `DATABASE_URL` in `.env` is already set to a Postgres connection
string, and I tested this entire module against a real local PostgreSQL 16
instance (not just SQLite) before handing it to you: created the schema via
Alembic, ran the full API flow, and confirmed data lands correctly with
`psql` directly. A SQLite URL is still *accepted* as an explicit opt-in
(`DATABASE_URL=sqlite:///./file.db`) purely for a zero-install smoke test,
but it is not the default and isn't what you should run day to day.

## Tech stack

FastAPI · Python 3.12 · **SQLAlchemy 2.0 (synchronous — matches this
project's existing dependencies)** · **PostgreSQL** (psycopg2) · Alembic ·
Pydantic v2 · Passlib/bcrypt · FastAPI-Mail · APScheduler · Pytest

## Architecture (matches the existing project's convention)

```
controller.py (FastAPI routes)  ->  service.py (business logic + queries)  ->  entities/*.py (SQLAlchemy models)
```

- `src/entities/` - SQLAlchemy ORM models (`user.py`, `file.py`,
  `shared_link.py`, `access_log.py`, `notification.py`, `base.py`, `guid.py`)
- `src/shared_links/models.py` - Pydantic request/response schemas (named
  `models.py` to match the existing `todos`/`users`/`auth` convention -
  these are NOT the ORM models, those live in `entities/`)
- `src/shared_links/service.py` - all business logic + DB queries (no
  separate repository layer, matching this project's existing flat style)
- `src/shared_links/controller.py` - FastAPI routes; thin, delegates to `service.py`
- `src/shared_links/scheduler.py` - hourly background job (link expiration)
- `src/shared_links/email_service.py` - FastAPI-Mail wrapper
- `src/database/core.py` - Postgres engine/session (shared by every module)
- `src/api.py` - registers every module's router (add yours here too)
- `src/exceptions.py` / `src/logging.py` - shared across all modules

## Temporary auth

Every owner-facing endpoint reads the caller's identity from:
```
X-User-Id: <uuid>
```
This header is **always required** - there is no dummy fallback user
anymore. If it's missing or not a valid UUID, the API returns `401
Unauthorized`. Use `python -m src.database.seed` (below) to create a real
user row and get a real id to send in this header. When the Auth
teammate's module is ready (they already have `python-jose` in
`requirements.txt` for JWT), open `src/shared_links/dependencies.py` and
replace `get_current_user_id()`'s body with real JWT verification -
nothing else changes.

Public link-access endpoints (`/share/{id}/access`, `/share/{id}/download`)
need **no auth** - that's the recipient's flow.

---

## Step-by-step: running it on your laptop

### 1. Install PostgreSQL

- **Windows/Mac:** download from https://www.postgresql.org/download/ (or
  `brew install postgresql@16` on Mac)
- **Linux:** `sudo apt install postgresql postgresql-contrib`

Start the service (installer usually does this automatically; on Linux:
`sudo service postgresql start`).

### 2. Create the database + user

Open a terminal and run:

```bash
sudo -u postgres psql
```
Then, inside the `psql` prompt:
```sql
CREATE USER sharedlinks_user WITH PASSWORD 'sharedlinks_pass';
CREATE DATABASE sharedlinks_db OWNER sharedlinks_user;
GRANT ALL PRIVILEGES ON DATABASE sharedlinks_db TO sharedlinks_user;
\q
```
(On Windows, use pgAdmin's Query Tool, or `psql` from the Start Menu, to run
the same three `CREATE`/`GRANT` lines.)

If you'd rather use different credentials, that's fine - just update
`DATABASE_URL` in `.env` in step 5 to match.

### 3. Check Python is installed
```bash
python3 --version
```
Need 3.12+. Get it from python.org if missing.

### 4. Install dependencies
```bash
cd "Secure File Sharing System/secure-file-sharing-07-26/server"
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Configure `.env`
A `.env` file is already included, pointed at the database from step 2:
```env
DATABASE_URL=postgresql+psycopg2://sharedlinks_user:sharedlinks_pass@localhost:5432/sharedlinks_db
```
Only change this if you used different credentials/db name in step 2.
Leave the rest as-is for local testing (`MAIL_ENABLED=false` just logs
emails to the console instead of sending them).

### 6. Run the Alembic migration (creates the tables)
```bash
alembic upgrade head
```
This creates `users`, `files`, `shared_links`, `access_logs`,
`notifications` in your Postgres database. Verify with:
```bash
psql -h localhost -U sharedlinks_user -d sharedlinks_db -c "\dt"
```

### 7. Create a real dev user
There's no fabricated seed data anymore - this creates exactly **one real
row** in your `users` table so you have a real id to authenticate with:
```bash
python -m src.database.seed --email you@example.com --name "Your Name"
```
Copy the printed `user id` (a UUID) - you'll use it as the `X-User-Id`
header on every request below. (The React app does this same step for you
automatically the first time it runs - see the client README section.)

### 8. Run the API
```bash
uvicorn src.main:app --reload
```
- API root: http://127.0.0.1:8000
- **Interactive docs: http://127.0.0.1:8000/docs** <- test every endpoint here
- Health check: http://127.0.0.1:8000/health

In Swagger UI, use "Try it out" on any owner-facing endpoint and add header
`X-User-Id: <the uuid you got in step 7>`. There is no fallback anymore -
every request needs this header.

### 9. Quick manual test with curl
```bash
BASE=http://127.0.0.1:8000
UID=<the uuid you got in step 7>

# should be an empty list the first time - no dummy data is pre-loaded
curl -s "$BASE/shared-links" -H "X-User-Id: $UID" | python3 -m json.tool

# analytics overview
curl -s "$BASE/analytics/overview" -H "X-User-Id: $UID" | python3 -m json.tool
```

### 10. Run the automated tests
Tests run against an isolated **in-memory SQLite** database - they never
touch your real Postgres data.
```bash
pytest -v
```
You should see `10 passed`.

### 11. Manually trigger the expiration job (optional)
Normally runs automatically every hour. To trigger it once by hand (create
a link with a near-future `expires_at` first so there's something to flip):
```bash
python3 -c "from src.shared_links.scheduler import run_expiration_check; run_expiration_check()"
```
Then re-fetch `/shared-links` - any link past its `expires_at` will have
flipped from `active` to `expired`.

### 12. Connect your React frontend
The client already talks to this API for real (see
`client/src/features/sharedLinks/services/sharedLinksApi.js`) - no mock
data, no UI changes needed. Just make sure:
- `client/.env` has `VITE_API_URL=http://127.0.0.1:8000`
- `CORS_ORIGINS` in the server `.env` includes your Vite dev server's
  origin - by default that's `http://localhost:5173`, so set
  `CORS_ORIGINS=http://localhost:5173` (comma-separate if you need more
  than one origin).

---

## API surface summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/shared-links` | owner | create a link |
| GET | `/shared-links` | owner | search/filter/sort/paginate |
| GET | `/shared-links/{id}` | owner | get one |
| PATCH | `/shared-links/{id}` | owner | edit permission/expiry/password |
| PATCH | `/shared-links/{id}/status` | owner | set status directly |
| POST | `/shared-links/{id}/toggle` | owner | enable/disable |
| POST | `/shared-links/{id}/revoke` | owner | revoke (terminal) |
| DELETE | `/shared-links/{id}` | owner | delete |
| POST | `/share/{id}/access` | **public** | recipient views the link |
| POST | `/share/{id}/download` | **public** | recipient downloads |
| GET | `/analytics/overview` | owner | stats + chart + top files + recent activity |
| GET | `/notifications` | owner | in-app notifications |
| POST/GET | `/users`, `/files` | - / owner | **dev/testing only** - delete once Auth/Files modules land |

Full request/response schemas + "Try it out" are in Swagger at `/docs`.

## Verifying against Postgres directly

```bash
psql -h localhost -U sharedlinks_user -d sharedlinks_db
\d shared_links          -- see the schema
SELECT * FROM shared_links;
SELECT * FROM access_logs ORDER BY created_at DESC LIMIT 10;
```

## Known local-dev notes

- A harmless `passlib`/`bcrypt` version-detection warning may print on
  first password hash - doesn't affect correctness (confirmed via the test
  suite and live Postgres testing). If it bothers you, `pip install
  "bcrypt==4.2.1"` explicitly (already pinned in `requirements.txt`).
- `todos/`, `users/`, `auth/` module folders are still empty - that's
  expected, they belong to other teammates. `src/api.py` has commented-out
  lines showing where to add their routers once ready.
