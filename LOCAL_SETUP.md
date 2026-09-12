# PRAGATI + SIH2026 — Local Setup & Development Guide

> **Enterprise Infrastructure Risk & Monitoring Platform**  
> Complete with JWT Authentication, Relational Database, Alembic Migrations, and SIH 2026 AI/ML Layer

---

## Quick Start

Open **two terminals**, run one command in each:

### Terminal 1 — Backend (FastAPI + SQLite/PostgreSQL)
```bash
cd /Users/aditya/Documents/PRAGATI/backend
source venv/bin/activate

# Apply database migrations
alembic upgrade head

# Start FastAPI server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2 — Frontend (React + Vite)
```bash
cd /Users/aditya/Documents/PRAGATI
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## User Account Creation & First Login

1. When visiting `http://localhost:5173` for the first time, you will see the **PRAGATI Portal Overview**.
2. Click **Get Started** or visit `http://localhost:5173/signup`.
3. Fill in:
   - **Full Name**: e.g. `Aditya Kumar`
   - **Email**: e.g. `aditya@pragati.gov.in`
   - **Organisation**: e.g. `PMO / Cabinet Secretariat`
   - **Role**: `PMO Officer`
   - **Password**: `YourPassword123!`
4. Click **Create account**. You are immediately logged in with an active JWT session and redirected to the Central Monitoring Dashboard.
5. In the top right navigation bar, your name and initials avatar will appear. Clicking on your profile grants access to **My Account & Settings** (`/account`) where you can adjust notification thresholds and pin projects to your personal watchlist.

---

## Environment Configuration

### Backend (`backend/.env`)
A development `.env` is automatically configured to use SQLite so no PostgreSQL installation is required for local testing:
```env
ENV=development
APP_NAME=PRAGATI
HOST=127.0.0.1
PORT=8000
DATABASE_URL=sqlite:///./pragati_dev.db
SECRET_KEY=dev-secret-key-pragati-2026-not-for-production
JWT_SECRET=dev-jwt-secret-pragati-2026-not-for-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
FRONTEND_URL=http://localhost:5173
EMAIL_ENABLED=false
```

*(For testing with PostgreSQL locally, simply update `DATABASE_URL` to `postgresql://user:pass@localhost:5432/pragati`)*

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=PRAGATI
```

---

## Database Migrations (Alembic)

The backend uses **Alembic** for schema migrations:

```bash
cd backend
source venv/bin/activate

# Apply migrations
alembic upgrade head

# Generate a new migration after modifying models
alembic revision --autogenerate -m "describe_changes"

# Rollback one migration
alembic downgrade -1
```

---

## Running the Automated Test Suite

40 automated tests verify all authentication flows, rate limiting, and AI live inference:

```bash
cd backend
source venv/bin/activate
pytest tests/test_auth.py tests/test_api.py -v
```

All 40 tests execute in ~6 seconds.

---

## Key Backend Dependencies

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | `0.128.8` | REST API framework |
| `sqlalchemy` | `2.0.52` | Relational ORM |
| `alembic` | `1.16.5` | Database migration engine |
| `python-jose` | `3.5.0` | JWT token generation & verification |
| `passlib` + `bcrypt` | `1.7.4` / `4.3.0` | Secure password hashing (cost factor 12) |
| `slowapi` | `0.1.10` | IP-based rate limiting |
| `xgboost` | `2.1.4` | ML predictive risk model |
| `scikit-learn` | `1.6.1` | IsolationForest anomaly model |
| `pandas` / `numpy` | `2.3.3` / `2.0.2` | Data processing pipeline |
