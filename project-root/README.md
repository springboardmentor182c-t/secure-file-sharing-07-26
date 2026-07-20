# SecureShare — Secure End-to-End Encrypted File Sharing System

SecureShare is a full-stack, production-ready secure file storage and sharing platform. It combines a **FastAPI** backend with a **React** frontend and delivers **client-side End-to-End Encryption (E2EE)** using the browser's native Web Crypto API. The server never sees your plaintext filenames, file types, or file contents.

---

## ✨ Features

### Security
- **🔒 AES-GCM 256-bit E2EE** — Files and metadata are encrypted in the browser before upload using the Web Crypto API. Decryption keys never leave the client.
- **🔑 JWT Authentication** — Access tokens + refresh tokens with automatic silent refresh on expiry.
- **🛡️ Multi-Factor Authentication (MFA)** — TOTP-based 2FA (setup, enable, disable, verify).
- **🌐 OAuth Social Login** — Google, Microsoft, and GitHub sign-in via authorization code flow.
- **🔐 Password Reset** — Token-based forgot-password / reset-password flow.
- **📋 Role-Based Access Control** — User roles: `admin`, `member`, `guest`.

### File Management
- **📁 Folder Hierarchy** — Create nested folders; physical directories are mirrored under `server/uploads/`.
- **⬆️ File Upload with Progress** — Chunked upload with real-time progress bar and storage quota enforcement.
- **⬇️ Secure Download** — Encrypted files are decrypted in-memory in the browser on download.
- **🗑️ Hard Deletion** — Deleting a file or folder removes both the database record and the file on disk.
- **🔄 Toggle Encryption** — Lock / unlock any file at any time with a single click.
- **🔍 Real-time Search** — Filter files instantly by name across the full list.

### UI & UX
- **📊 List & Grid Views** — Toggle between a sortable table and a rich card-based grid.
- **↕️ Column Sorting & Filtering** — Sort by Name, Size, Date, or Status; filter to show only encrypted or plaintext files.
- **🌙 Dark / Light Mode** — Persistent theme toggle saved to `localStorage`.
- **✨ Encryption Glow Effect** — Encrypted files pulse with an emerald green glow.
- **📈 Analytics Dashboard** — Storage usage and file statistics at a glance.

### Backend
- **⚡ FastAPI v2** — Async-capable API with auto-generated Swagger (`/docs`) and ReDoc (`/redoc`) docs.
- **💾 SQLite (default) / PostgreSQL** — Configurable via `DATABASE_URL` in `.env`.
- **🗄️ SQLAlchemy ORM** — Fully typed models with UUID primary keys.
- **📝 Audit Logs** — Every significant action is recorded in an audit trail.
- **🔔 Notifications** — In-app notification system with mark-read and delete.
- **🧪 Pytest Test Suite** — Unit and E2E tests under `server/tests/`.

---

## 🏗️ Project Structure

```
project-root/
├── client/                        # React 18 SPA (Create React App)
│   └── src/
│       ├── App.js                 # Router + AuthProvider + AnalyticsProvider
│       ├── context/
│       │   ├── AuthContext.js     # JWT auth state (login, register, logout)
│       │   └── AnalyticsContext.js
│       ├── layout/
│       │   └── ProtectedRoute.js  # Guards authenticated routes
│       ├── pages/
│       │   ├── Files.js           # Main file manager (full E2EE UI)
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   └── ForgotPassword.js
│       ├── components/
│       │   └── Modals/Modal.js    # Reusable modal component
│       └── utils/
│           ├── api.js             # Axios client + all API bindings
│           └── crypto.js          # Web Crypto API (AES-GCM E2EE helpers)
│
└── server/                        # FastAPI backend (Python 3.10+)
    ├── src/
    │   ├── api.py                 # App factory, CORS, router registration
    │   ├── main.py                # Uvicorn entry point
    │   ├── auth/                  # JWT, MFA, OAuth, password reset
    │   ├── files/                 # Upload, download, encrypt toggle, delete
    │   ├── folders/               # Folder CRUD + physical directory sync
    │   ├── shares/                # Secure link sharing
    │   ├── notifications/         # In-app notification system
    │   ├── audit/                 # Audit trail
    │   ├── analytics/             # Storage & usage stats
    │   ├── admin/                 # Admin user management
    │   ├── entities/              # SQLAlchemy ORM models (User, File, Folder…)
    │   └── database/              # Engine, session, init_db
    ├── tests/                     # Pytest unit + E2E tests
    ├── uploads/                   # Physical file storage root
    ├── app.db                     # SQLite database (default)
    ├── requirements.txt
    └── .env                       # Configuration (copy from .env.example)
```

---

## ⚙️ Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 16+ |
| npm | 8+ |

---

### 1. Backend Setup (FastAPI)

```bash
cd server
```

Create and activate a virtual environment:

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables:

```bash
# Copy the example and edit as needed
cp .env.example .env
```

> **SQLite (default — no setup needed):**
> ```env
> DATABASE_URL=sqlite:///./app.db
> ```
>
> **PostgreSQL (optional):**
> ```env
> DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/secureshare
> ```

Start the API server:

```bash
python -m uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload
```

The backend runs at **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**

---

### 2. Frontend Setup (React)

```bash
cd client
npm install
npm start
```

The React app opens at **http://localhost:3000** and auto-proxies API calls to port 8000.

---

## 🔒 Security Architecture — E2EE Deep Dive

SecureShare implements a **zero-knowledge server model**:

1. **Key Derivation** (`crypto.js` → `getEncryptionKey`)
   A stable 256-bit AES-GCM key is derived entirely in the browser using PBKDF2 + the Web Crypto API. The key is never transmitted.

2. **Metadata Encryption** (`encryptText`)
   Filenames and MIME types are AES-GCM encrypted to Base64 strings prefixed with `e2ee:` before being sent to the server. The database stores only ciphertext.

3. **Content Encryption** (`encryptFileBytes`)
   Raw file bytes are encrypted in-browser into a binary blob (12-byte IV prepended) before upload. The server stores an opaque binary object.

4. **In-Browser Decryption** (`decryptText`, `decryptFileBytes`)
   Decryption always happens in-memory in the browser. Downloaded blobs are decrypted and offered as native files. The server never processes plaintext.

### Verify zero-knowledge storage

```bash
sqlite3 server/app.db "SELECT original_name FROM files LIMIT 5;"
```

All values will be `e2ee:…` ciphertext — never plaintext filenames.

---

## 🔌 API Reference

| Prefix | Module | Description |
|---|---|---|
| `/api/auth` | `auth` | Login, signup, MFA, OAuth, token refresh, password reset |
| `/api/files` | `files` | List, upload, download, delete, toggle encryption |
| `/api/folders` | `folders` | Create, list, delete folders |
| `/api/shares` | `shares` | Create / revoke shareable links |
| `/api/notifications` | `notifications` | List, mark-read, delete notifications |
| `/api/audit` | `audit` | Paginated audit log |
| `/api/analytics` | `analytics` | Storage and usage summary |
| `/api/admin` | `admin` | User management (admin role only) |
| `/health` | system | Health check — `{"status": "ok"}` |

Full interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Running Tests

```bash
cd server
pytest
```

Tests use a separate `test.db` SQLite database (configured in `pytest.ini`) and cover auth service, user service, and E2E API flows.

---

## 🌐 OAuth Setup (Optional)

To enable social login, register an app with each provider and add the credentials to `.env`:

| Provider | Console | Redirect URI |
|---|---|---|
| Google | [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) | `http://localhost:8000/api/auth/oauth/google/callback` |
| Microsoft | [portal.azure.com](https://portal.azure.com) | `http://localhost:8000/api/auth/oauth/microsoft/callback` |
| GitHub | [github.com/settings/developers](https://github.com/settings/developers) | `http://localhost:8000/api/auth/oauth/github/callback` |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, Lucide React, Chart.js |
| Encryption | Web Crypto API (AES-GCM 256-bit, PBKDF2) |
| Backend | FastAPI 0.110+, Uvicorn, SQLAlchemy 2.0, Pydantic v2 |
| Auth | python-jose (JWT), passlib + bcrypt, pyotp (TOTP/MFA), httpx (OAuth) |
| Database | SQLite (default) or PostgreSQL via psycopg2 |
| Testing | Pytest |

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.
