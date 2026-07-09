# TrustShare — User Authentication Module

Full-stack authentication system: **React (CRA) client**, **FastAPI server**, **PostgreSQL** database.

Covers:
1. User registration & login
2. Multi-factor authentication (TOTP + backup codes)
3. Password recovery (email-token based reset)
4. Session management (revocable, rotated refresh tokens per device)
5. JWT authentication (short-lived access token + httpOnly refresh cookie)
6. OAuth2 (Google + Microsoft)

## Project structure

```
project-root/
├── client/                          # React app (Create React App + Tailwind)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── assets/
│       │   └── global.css
│       ├── components/
│       │   ├── Buttons/             # PrimaryButton, SecondaryButton, OAuthButtons
│       │   ├── Form/                # InputField, CodeInput
│       │   └── Modals/              # Modal, RevokeSessionModal
│       ├── context/
│       │   ├── AuthContext.js       # session state, silent refresh, login/logout
│       │   └── AnalyticsContext.js  # swap-in point for Segment/PostHog/GA4/etc.
│       ├── data/
│       │   └── constants.js
│       ├── features/
│       │   └── authentication/
│       │       ├── components/      # LoginForm, SignupForm, MfaForm, ForgotPasswordForm, ResetPasswordForm
│       │       ├── hooks/            # useAuthentication
│       │       └── services/         # authService.js (all backend calls)
│       ├── hooks/                    # app-wide shared hooks (empty scaffold)
│       ├── layout/
│       │   └── AuthLayout.js
│       ├── pages/                    # SignInPage, SignUpPage, MfaVerifyPage, ForgotPasswordPage, ResetPasswordPage, DashboardPage
│       ├── utils/
│       │   └── apiClient.js          # fetch wrapper with automatic token refresh
│       ├── App.js
│       ├── index.js
│       └── reportWebVitals.js
│   └── package.json
├── server/                           # FastAPI app
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py               # register, login, refresh, logout, sessions
│   │   │   ├── mfa.py                # TOTP setup/enable/verify/disable
│   │   │   ├── password_reset.py     # forgot/reset
│   │   │   └── oauth.py              # Google + Microsoft
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── security.py
│   │   ├── dependencies.py
│   │   ├── email_utils.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## 1. Database setup (PostgreSQL)

```bash
psql postgres
CREATE DATABASE trustshare;
CREATE USER trustshare_user WITH PASSWORD 'trustshare_pass';
GRANT ALL PRIVILEGES ON DATABASE trustshare TO trustshare_user;
\q
```

Tables are created automatically on first server startup via `Base.metadata.create_all()`
(see `server/app/main.py`). For production, switch to Alembic migrations:

```bash
cd server
alembic init alembic
# configure alembic.ini + env.py to import app.database.Base and app.models
alembic revision --autogenerate -m "init"
alembic upgrade head
```

## 2. Server setup (FastAPI)

```bash
cd server
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: DATABASE_URL, JWT_SECRET_KEY, OAuth client IDs/secrets

uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

Generate a strong JWT secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

## 3. Client setup (React)

```bash
cd client
npm install
cp .env.example .env       # REACT_APP_API_URL=http://localhost:8000
npm start
```

Visit `http://localhost:3000`.

## 4. OAuth2 provider setup

**Google** — [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services →
Credentials → OAuth Client ID (Web application).
- Authorized redirect URI: `http://localhost:8000/api/auth/oauth/google/callback`

**Microsoft** — [Azure Portal](https://portal.azure.com/) → App registrations → New registration.
- Redirect URI (Web): `http://localhost:8000/api/auth/oauth/microsoft/callback`
- Create a client secret under "Certificates & secrets"

Copy both providers' client ID/secret into `server/.env`.

## Architecture notes

**Tokens**
- **Access token**: JWT, 15 min expiry, kept in memory in React (never localStorage — avoids XSS token theft).
- **Refresh token**: opaque random string, stored **hashed** in Postgres (`user_sessions` table),
  sent as an `httpOnly`, `SameSite=Lax` cookie scoped to `/api/auth`. Rotated on every use.
- `client/src/utils/apiClient.js` transparently retries a request once after a silent
  `/api/auth/refresh` call if it gets a 401.

**MFA**
- TOTP via `pyotp`, QR code generated server-side.
- 8 single-use backup codes issued on enable, stored as SHA-256 hashes.
- Login with MFA enabled is two steps: `/login` returns a short-lived `mfa_token` instead
  of an access token; `/mfa/verify` exchanges `mfa_token` + code for the real access token.

**Password recovery**
- `/password/forgot` always returns 202 regardless of whether the email exists (no enumeration).
- Reset tokens are random, stored hashed, single-use, 15-minute expiry.
- A successful reset revokes every active session for that user.

**Sessions**
- Each login/OAuth/MFA-verify creates a row in `user_sessions` (device info, IP, expiry).
- `GET /api/auth/sessions` lists active sessions; `DELETE /api/auth/sessions/{id}` revokes one
  remotely — wired into `DashboardPage.js` with a confirmation modal.

**Before production**
- Set `ENVIRONMENT=production` in the server `.env` so refresh cookies get `Secure` set.
- Serve everything over HTTPS — required for `Secure` cookies to work.
- Add rate limiting on `/login`, `/mfa/verify`, `/password/forgot` (e.g. `slowapi`).
- Wire `server/app/email_utils.py` to a real email provider (currently logs to console).
- Consider enforcing email verification before granting full account access.

## Pushing to GitHub

This folder is already an initialized git repo with a commit. To push:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `venv/`, and `.env` files — only
the `.env.example` templates get committed.
