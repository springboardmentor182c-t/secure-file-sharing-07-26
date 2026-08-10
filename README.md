# 🔒 TrustShare — Secure File Sharing System

TrustShare is a modern, enterprise-grade, end-to-end encrypted file-sharing platform built with **React**, **FastAPI**, and **PostgreSQL**. It offers zero-knowledge file encryption, versioned key rotation, granular access controls, real-time analytics, dynamic user management, and automated SMTP email notification dispatches.

---

## 🌟 Key Features

* **🛡️ Zero-Knowledge Security & Key Management**:
  * Dynamic **AES-256-GCM** key generation for every uploaded file.
  * Versioned encryption key rotation (`v1` ➔ `v2` ➔ `v3`) with audit tracking and persistent deletion handling.
* **📊 Real-Time Analytics & Usage Monitoring**:
  * Live tracking of active links, total file views, downloads, and storage usage.
  * Monthly activity trends, top performing files, and recent file access audit logs with dynamic file name resolution.
* **👥 Interactive Admin Dashboard**:
  * Real-time User Management table with instant role switching (`Admin`, `Editor`, `Viewer`), Multi-Factor Authentication (MFA) toggles, account activation/suspension, and soft/hard user deletion.
  * Live server system health status cards (Database connections, SMTP service status, Active sessions, System storage stats).
* **🔗 Granular Public Link Controls**:
  * Share links with view/download permissions, optional password protection, custom expiration dates, and immediate link revocation/toggling.
* **⏳ 30-Day Auto-Purge Trash Vault**:
  * Deleted files are moved to Trash with a 30-day retention countdown policy, urgency badges (`Expiring Today` / `X days left`), and auto-purge target dates.
* **📧 Automated SMTP Email Engine**:
  * Branded HTML email notifications dispatched automatically for file sharing, link access alerts, and expiration warnings.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, Vite 6, Tailwind CSS v4, Lucide React Icons, Recharts, React Hot Toast |
| **Backend API** | Python 3.12+, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn, FastAPI-Mail |
| **Database** | PostgreSQL (`pg8000` driver) |
| **Styling & Aesthetics** | Dark Glassmorphism, Responsive Modern Aesthetics |

---

## 📋 System Prerequisites

Before starting, ensure you have the following installed on your environment:

1. **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
2. **Python**: `v3.10.0` or higher ([Download Python](https://www.python.org/))
3. **PostgreSQL**: `v14.0` or higher ([Download PostgreSQL](https://www.postgresql.org/))

---

## 🚀 Installation & Setup Guide

### 1. Database Setup (PostgreSQL)

Create a new PostgreSQL database named `security_dashboard`:

```sql
CREATE DATABASE security_dashboard;
```

---

### 2. Backend Setup (`server/`)

1. Open terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Create and activate a Python virtual environment:
   * **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **Linux/macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create or configure the environment file at `server/.env`:
   ```env
   # PostgreSQL Database Connection
   DATABASE_URL=postgresql+pg8000://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/security_dashboard

   # SMTP Email Configuration
   MAIL_ENABLED=true
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-16-character-app-password
   MAIL_FROM=no-reply@trustshare.com
   MAIL_FROM_NAME=TrustShare
   MAIL_STARTTLS=true
   MAIL_SSL_TLS=false
   ```

---

### 3. Frontend Setup (`client/`)

1. Open terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```

2. Install Node modules:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables at `client/.env`:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

---

## 📧 SMTP Email Setup Guide (Gmail Example)

To enable real-time email delivery when sharing files or sending link expiration warnings:

1. Log in to your Google Account and navigate to **[Security Settings](https://myaccount.google.com/security)**.
2. Enable **2-Step Verification**.
3. Under *2-Step Verification*, navigate to **[App Passwords](https://myaccount.google.com/apppasswords)**.
4. Enter an App Name (e.g., `TrustShare`) and click **Create**.
5. Copy the generated **16-character password** (e.g., `abcd efgh ijkl mnop`).
6. Paste the credentials into `server/.env`:
   ```env
   MAIL_ENABLED=true
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your_actual_email@gmail.com
   MAIL_PASSWORD=abcdefghijklmnop
   ```

> 💡 **Note**: If `MAIL_USERNAME` or `MAIL_PASSWORD` are left blank, TrustShare automatically switches to **Email Simulation Mode**, logging dispatched emails to the backend terminal without failing requests.

---

## 🏃 Running the Application

### Launch Backend Server
In the `server/` directory:
```bash
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```
* **API Documentation (Swagger UI)**: `http://127.0.0.1:8000/docs`
* **API Health Check**: `http://127.0.0.1:8000/health`

### Launch Frontend Client
In the `client/` directory:
```bash
npm run dev
```
* **Web Dashboard**: `http://localhost:5173`

---

## 🔍 Troubleshooting Guide

### 1. Navigating to `/share/:id` returns Raw Backend JSON
* **Symptom**: Browser at `http://localhost:5173/share/27` outputs raw JSON string `{"success":true, "data":{...}}`.
* **Cause**: `vite.config.ts` dev server proxy caught `/share` requests and routed them directly to FastAPI port 8000.
* **Fix**: Ensure `client/vite.config.ts` proxies **only** `/api` routes:
  ```typescript
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  }
  ```

### 2. Database Connection Error (`pg8000.exceptions.DatabaseError`)
* **Symptom**: Backend logs `FATAL: password authentication failed for user "postgres"`.
* **Fix**: Verify your PostgreSQL username and password in `server/.env`:
  `DATABASE_URL=postgresql+pg8000://<username>:<password>@localhost:5432/security_dashboard`

### 3. SMTP Authentication Error (`SMTPAuthenticationError: 334`)
* **Symptom**: Backend prints `fastapi_mail.errors.ConnectionErrors: Exception raised (334, 'UGFzc3dvcmQ6')`.
* **Cause**: Incorrect email or normal account password used instead of a 16-character App Password.
* **Fix**: Ensure 2-Step Verification is active on Google and use a generated **App Password** in `MAIL_PASSWORD`.

### 4. PostCSS `@import` Statement Warnings in Terminal
* **Symptom**: `[vite:css][postcss] @import must precede all other statements`.
* **Fix**: Place Google Font `@import` statements at the very top of `common.css` or include font tags directly in `index.html`.

---

## 🛠️ Key API Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Files** | `/files` | `POST / GET` | Upload, list, search, filter non-trashed files |
| **Shared Links** | `/shared-links` | `POST / GET` | Create, list, search, and update share links |
| **Public Viewer**| `/share/{id}` | `GET` | View public shared file details |
| **Security** | `/api/security/dashboard` | `GET` | Security status, AES-256 keys, rotation |
| **Dashboard** | `/api/dashboard/users` | `GET / PATCH / DELETE` | Interactive admin user management |
| **Analytics** | `/analytics/overview` | `GET` | Real-time usage statistics and trends |
| **Trash** | `/files/trash` | `GET / DELETE` | View and manage trashed files retention |
| **Recent** | `/api/files/recent` | `GET` | Retrieve live file activity history |
| **Notifications**| `/notifications` | `GET` | User activity notifications list |

---

## 📝 License & Summary

Developed for secure, transparent, and scalable enterprise file sharing. All encryption routines strictly enforce standard AES-256-GCM authenticated encryption.
