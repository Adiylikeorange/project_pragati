# PRAGATI — Infrastructure Risk & Monitoring Platform

**PRAGATI (Pro-Active Governance and Timely Implementation)** is a full-stack infrastructure project monitoring portal with predictive risk scoring, early warning detection, and inter-ministerial bottleneck resolution tracking.

---

## 🏗️ Project Architecture

```text
Frontend (React + Vite + Tailwind)  ──HTTP (REST)──►  FastAPI Backend  ──►  Backend Services  ──►  Risk Service  ──(AI Model Integration Point)
```

### Key Features
* **Executive Monitoring Dashboard**: Real-time KPI tiles (Monitored Budget, Projects On-Track, Delayed, At Risk), sector-wise project overview, and physical/financial progress tracking.
* **Predictive AI Risk Analytics**: Project-level risk scoring, confidence metrics, key risk factor drivers, and primary bottleneck breakdown.
* **Early Warning System**: Automated alerts for critical schedule slippages with secretarial protocol initiation handlers.
* **Delay Analysis Matrix**: Root-cause impediment categorizations (Land acquisition, Statutory clearances, Contractor insolvencies).
* **Modular FastAPI Backend**: Clean architecture with Pydantic validation, stateful data layer, REST endpoints, and 100% automated test coverage.

---

## 🚀 Quick Start Guide

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

# (Optional) Run unit tests
pytest tests/test_api.py

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

---

## 🤖 SIH 2026 AI / ML Intelligence Layer

The platform is integrated with the **SIH 2026 Problem 26013** machine learning pipeline trained over **2,144 national infrastructure projects** (Jan–Jul 2026 government monitoring data):
* **XGBoost Classifier** (`backend/models/pragati_xgboost_model.joblib`): Predicts future physical progress deterioration probability.
* **Isolation Forest** (`backend/models/pragati_isolation_forest.joblib`): Unsupervised anomaly detection flagging high-risk spending/progress divergence.
* **Risk Fusion Engine**: Fuses 70% domain risk + 15% progress velocity + 10% anomaly signal + 5% XGBoost predictive score.
* **Early Warning Feed**: 1,312 automated ML-generated early warnings across 6 categories.

---

## 🧪 Interactive Testing Sites & Sandboxes

| Interface | URL | Purpose |
| :--- | :--- | :--- |
| **Interactive React Test Workbench** | `http://localhost:5173/test` | Live parameter simulation (*Cost, Progress, Velocity*), 1-click model inference, project risk inspector, and latency benchmark. |
| **Standalone Backend Test Portal** | `http://localhost:8000/test` | Zero-dependency testing console served directly by FastAPI. |
| **Interactive API Documentation (Swagger)** | `http://localhost:8000/docs` | Test all 22 REST endpoints directly in browser. |
| **Full Local Setup Guide** | [`LOCAL_SETUP.md`](LOCAL_SETUP.md) | Detailed local installation & troubleshooting guide. |
| **ML Technical Reference** | [`INTEGRATION.md`](INTEGRATION.md) | Architecture, feature contracts, and model specifications. |

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 8, React Router v6, Tailwind CSS, Material Symbols Icons
* **Backend**: Python 3.9, FastAPI, Uvicorn, Pydantic V2, Httpx, Pytest
* **Machine Learning**: Scikit-Learn, XGBoost, Pandas, NumPy, Joblib
