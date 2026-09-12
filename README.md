# PRAGATI — Infrastructure Risk & Monitoring Platform (Production Ready)

**PRAGATI (Pro-Active Governance and Timely Implementation)** is an enterprise-grade infrastructure project monitoring platform with real-time predictive risk scoring, machine learning early warning detection, inter-ministerial bottleneck resolution tracking, and secure multi-user role management.

---

## 🌐 Live Public Deployment

The application is deployed live with public HTTPS domains and accessible worldwide:

| Service | Public URL | Status |
| :--- | :--- | :--- |
| **Production Web Portal (Vercel)** | **[https://project-pragati-six.vercel.app](https://project-pragati-six.vercel.app)** | `LIVE (HTTP 200)` |
| **Production Backend API (Cloudflare)** | **[https://treat-cancellation-affiliate-involves.trycloudflare.com](https://treat-cancellation-affiliate-involves.trycloudflare.com)** | `LIVE (HTTP 200)` |
| **Interactive API Docs (Swagger)** | **[https://treat-cancellation-affiliate-involves.trycloudflare.com/docs](https://treat-cancellation-affiliate-involves.trycloudflare.com/docs)** | `LIVE (HTTP 200)` |
| **Standalone AI Test Portal** | **[https://treat-cancellation-affiliate-involves.trycloudflare.com/test](https://treat-cancellation-affiliate-involves.trycloudflare.com/test)** | `LIVE (HTTP 200)` |

---

## 🏗️ Production Architecture

```text
React 19 SPA (Vite + Tailwind) ──JWT Auth (Bearer)──► FastAPI Backend ──► SQLAlchemy ORM ──► PostgreSQL / SQLite
                                                      │                      │
                                                      ├── Auth & Profile     └── Alembic Migrations
                                                      ├── Watchlist System
                                                      └── AI / ML Layer (XGBoost + Isolation Forest)
```

### Key Production Capabilities
* **Full Authentication & User System**: Secure registration, login, token refresh rotation, password reset via time-limited tokens, and session deactivation.
* **Persistent PostgreSQL / SQLite Database**: Relational schema managed via Alembic migrations with tables for `users`, `user_profiles`, `user_watchlists`, `password_reset_tokens`, and `refresh_tokens`.
* **User Accounts & Custom Watchlist**: Track critical projects, configure personalized notification thresholds for critical/high risks, and edit official profile credentials.
* **Predictive AI Risk Analytics**: 3-tier risk scoring engine fusing XGBoost deterioration modeling, Isolation Forest anomaly detection, and domain heuristics over 2,144 national projects.
* **Early Warning System**: Automated alerts for schedule slippages with recommended mitigation actions.
* **Production Hardened**: Rate limiting on authentication endpoints, strict CORS policy, environment variable configuration, and stack traces hidden in production.
* **Automated Test Coverage**: 40 automated tests covering API endpoints, ML live inference, user registration, login, token rotation, and password reset.

---

## 🚀 Quick Start Guide (Local Development)

### 1. Prerequisites
* **Node.js**: `v18+`
* **Python**: `3.9+`

---

### 2. Run FastAPI Backend

```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (SQLite dev database is pre-configured)
alembic upgrade head

# Run unit tests (40 tests)
pytest tests/test_auth.py tests/test_api.py -v

# Start FastAPI server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

* **Interactive API Documentation (Swagger)**: `http://127.0.0.1:8000/docs`
* **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

### 3. Run React Frontend

In a new terminal window from the project root:

```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

* **Web Application URL**: `http://localhost:5173`
* **Sign In / Create Account**: `http://localhost:5173/login` or `http://localhost:5173/signup`

---

## ☁️ Production Deployment

The project is fully prepared for one-click production deployment:
* **Backend**: [Render](https://render.com) using `render.yaml` or `Procfile`
* **Frontend**: [Vercel](https://vercel.com) or Netlify with automatic SPA routing
* **Database**: [Supabase](https://supabase.com) managed PostgreSQL

Detailed instructions, environment variable keys, and custom domain setup are documented in **[`DEPLOYMENT.md`](DEPLOYMENT.md)**.

---

## 🤖 SIH 2026 AI / ML Intelligence Layer

The platform includes the **SIH 2026 Problem 26013** machine learning pipeline trained over **2,144 national infrastructure projects** (Jan–Jul 2026 government monitoring data):
* **XGBoost Classifier** (`backend/models/pragati_xgboost_model.joblib`): Predicts future physical progress deterioration probability.
* **Isolation Forest** (`backend/models/pragati_isolation_forest.joblib`): Unsupervised anomaly detection flagging high-risk spending/progress divergence.
* **Risk Fusion Engine**: Fuses 70% domain risk + 15% progress velocity + 10% anomaly signal + 5% XGBoost predictive score.
* **Early Warning Feed**: 1,312 automated ML-generated early warnings across 6 categories.

---

## 🧪 Interactive Testing Sites & Sandboxes

| Interface | URL | Purpose |
| :--- | :--- | :--- |
| **Interactive React Test Workbench** | `http://localhost:5173/test` | Live parameter simulation (*Cost, Progress, Velocity*), 1-click model inference, and latency benchmark. |
| **User Account & Watchlist** | `http://localhost:5173/account` | Profile management, alert preference controls, and project watchlists. |
| **Standalone Backend Test Portal** | `http://localhost:8000/test` | Zero-dependency testing console served directly by FastAPI. |
| **Interactive API Documentation** | `http://localhost:8000/docs` | Test all 26 REST endpoints directly in browser. |
| **Production Deployment Guide** | [`DEPLOYMENT.md`](DEPLOYMENT.md) | Supabase, Render, Vercel & custom domain setup. |
| **Full Local Setup Guide** | [`LOCAL_SETUP.md`](LOCAL_SETUP.md) | Detailed local installation & troubleshooting guide. |
| **ML Technical Reference** | [`INTEGRATION.md`](INTEGRATION.md) | Architecture, feature contracts, and model specifications. |

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 8, React Router v6, Tailwind CSS, Material Symbols Icons
* **Backend**: Python 3.9, FastAPI, Uvicorn, Pydantic V2, SQLAlchemy, Alembic, SlowAPI
* **Authentication**: JWT (python-jose), Bcrypt password hashing, token rotation
* **Database**: PostgreSQL (Production) / SQLite (Development)
* **Machine Learning**: Scikit-Learn, XGBoost, Pandas, NumPy, Joblib
