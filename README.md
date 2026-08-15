# Secure File Sharing System — AI Duplicate File Detection Engine

This project combines a secure file-sharing platform with an AI-powered duplicate and similarity detection engine. It is built with FastAPI, SQLAlchemy, React/Vite, and a mix of SHA-256, TF-IDF similarity, and perceptual image hashing to prevent duplicate uploads before they are stored.

---

## 🌟 Key Features

- **Cryptographic Exact Matching (SHA-256)**: Detects byte-for-byte duplicate files before storage.
- **NLP Text Similarity (TF-IDF + Cosine Similarity)**: Identifies near-duplicate text documents using configurable thresholds.
- **Perceptual Image Hashing (aHash)**: Detects visually similar variants after resize, recompression, or format changes.
- **Secure File Sharing**: Supports user management, file access, public links, notifications, and admin controls.
- **Zero-Knowledge Security Patterns**: Uses encrypted key handling and audit-friendly security flows.
- **Real-Time Analytics & Dashboard**: Tracks usage, storage, system health, activity, and duplicate prevention outcomes.

---

## 📸 Project Screenshots

### AI Duplicate File Detection Hub Dashboard
![Dashboard Screenshot](dashboard_screenshot.png)

### AI Duplicate Prevention Ledger
![Duplicate Prevention Ledger](duplicate_prevention_ledger.png)

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, Tailwind CSS |
| **Backend API** | Python 3.10+, FastAPI, SQLAlchemy, Pydantic |
| **Database** | SQLite for local/dev, PostgreSQL-ready for production |
| **AI Detection** | SHA-256, TF-IDF, Cosine Similarity, aHash |

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js**: v18 or higher
2. **Python**: v3.10 or higher
3. **PostgreSQL**: recommended for production, optional for local development

---

## 🚀 Quick Start

### 1. Backend Setup

Open a terminal in the `server/` directory and create a virtual environment:

```bash
cd server
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables in `server/.env` if needed:

```env
DATABASE_URL=sqlite:///./app.db
```

For PostgreSQL:

```env
DATABASE_URL=postgresql+pg8000://postgres:YOUR_PASSWORD@localhost:5432/security_dashboard
```

### 2. Run the Backend

```bash
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

API docs:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/health`

### 3. Frontend Setup

Open a terminal in the `client/` directory:

```bash
cd client
npm install
npm run dev
```

The dashboard should be available at:

- `http://localhost:5173`

### 4. Run Tests

```bash
python -m unittest server/backend/test_duplicate_detector.py
```

---

## 🔍 Troubleshooting

### 1. Database initialization fails

If the app cannot create tables automatically, confirm your `DATABASE_URL` and ensure the database exists.

### 2. Frontend proxy issues

Ensure the dev server only proxies `/api` routes when routing backend requests.

### 3. Email setup

If SMTP is not configured, the app can fall back to simulation mode, logging email actions instead of sending real mail.

---

## 🧩 Repository Structure

```text
.
├── client/                  # React/Vite frontend
├── server/                  # FastAPI backend and service modules
├── storage/                 # Uploaded files storage area
├── README.md                # Project overview
├── run.py                   # App launcher
├── report.md                # Project report
└── requirements.txt         # Root environment dependencies
```

---

## 📝 Summary

This codebase unifies secure file sharing with AI-based duplicate detection so users can safely store and manage files while preventing redundant uploads and storage waste.
