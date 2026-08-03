<<<<<<< HEAD
=======
# Auth Module

A standalone user-authentication module: sign up, sign in, TOTP-based
multi-factor authentication, and password recovery. FastAPI + PostgreSQL
on the backend, React (JS) + Tailwind on the frontend.

## Files

```
backend/
  main.py          # models, schemas, security helpers, and all routes
  schema.sql        # Postgres tables (users, password_reset_tokens)
  requirements.txt
  .env.example
frontend/
  src/
    api.js           # fetch wrapper for the backend
    AuthContext.jsx   # holds the session, exposes login/register/logout
    pages/Auth.jsx     # shared UI + sign in, sign up, forgot/reset, MFA screens
    pages/Dashboard.jsx # post-login page with MFA enrollment
    App.jsx            # routes
```

## Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # edit DATABASE_URL and JWT_SECRET
createdb authdb              # or use psql -f schema.sql once the db exists
uvicorn main:app --reload    # tables are also auto-created on startup
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                  # http://localhost:5173
```

## Endpoints

| Method | Path                    | Purpose                              |
|--------|-------------------------|---------------------------------------|
| POST   | /auth/register          | Create an account                     |
| POST   | /auth/login             | Sign in (returns `mfa_required` flag) |
| POST   | /auth/mfa/verify        | Complete login with a TOTP code       |
| POST   | /auth/mfa/setup         | Generate a TOTP secret (authed)       |
| POST   | /auth/mfa/enable        | Confirm code, turn MFA on (authed)    |
| POST   | /auth/mfa/disable       | Turn MFA off (authed)                 |
| GET    | /auth/me                | Current user (authed)                 |
| POST   | /auth/logout            | Logout (authed)                       |
| POST   | /auth/forgot-password   | Request a reset token                 |
| POST   | /auth/reset-password    | Set a new password with the token     |

## Notes

- Passwords are hashed with bcrypt; access/refresh/MFA tokens are signed JWTs.
- `forgot-password` returns the raw reset token in the response for local
  testing only — wire it to a real email provider before deploying.
>>>>>>> 8590378 (Add user authentication module and database schema)
