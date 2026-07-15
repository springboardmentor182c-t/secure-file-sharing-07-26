# React + FastAPI Internship Project

This repository contains a full-stack web application with a FastAPI backend (`server/`) and a React frontend (`client/`).

## Project Layout

```text
project-root/
├── client/          # React frontend
├── server/          # FastAPI backend
├── README.md
└── .gitignore
```

## Quick Start

### 1. Backend Setup (FastAPI)
Navigate to the `server/` directory, set up your Python environment, and install dependencies:
```bash
cd server
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### 2. Frontend Setup (React)
Navigate to the `client/` directory and start the development server:
```bash
cd client
npm install
npm start
```
The React app will be served at `http://localhost:3000` and proxy backend requests to `http://localhost:8000`.
