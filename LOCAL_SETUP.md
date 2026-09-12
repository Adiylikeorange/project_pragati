# PRAGATI + SIH2026 — Local Setup Guide

> **Infrastructure Risk & Monitoring Platform**  
> Integrated with SIH 2026 Problem 26013 AI/ML Intelligence Layer

---

## Quick Start

Open **two terminals**, run one command in each:

### Terminal 1 — Backend (FastAPI)
```bash
cd /Users/aditya/Documents/PRAGATI/backend
source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2 — Frontend (React + Vite)
```bash
cd /Users/aditya/Documents/PRAGATI
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | ≥ 18 | `node --version` |
| npm | ≥ 9 | `npm --version` |
| Python | 3.9+ | `python3 --version` |
| Git | any | `git --version` |
| Homebrew | any | `brew --version` |

---

## What's Installed

### Backend Virtual Environment
```
/Users/aditya/Documents/PRAGATI/backend/venv/
```
All packages installed. To reinstall:
```bash
cd /Users/aditya/Documents/PRAGATI/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Key Packages
| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.128.8 | REST API framework |
| uvicorn | 0.39.0 | ASGI server |
| pydantic | 2.13.5 | Data validation |
| pandas | 2.3.3 | SIH2026 data processing |
| numpy | 2.0.2 | ML numerics |
| scikit-learn | 1.6.1 | IsolationForest anomaly model |
| xgboost | 2.1.4 | Predictive risk model |
| joblib | 1.5.3 | Model serialization |

### System Dependency (Mac)
XGBoost requires OpenMP runtime, installed via Homebrew:
```bash
brew install libomp
# Symlink (already done):
ln -sf /opt/homebrew/Cellar/libomp/23.1.1/lib/libomp.dylib /opt/homebrew/lib/libomp.dylib
```

---

## API Endpoints

### PRAGATI Core Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard/summary` | Main dashboard data |
| GET | `/api/projects` | List all projects |
| GET | `/api/projects/search` | Search/filter projects |
| GET | `/api/projects/{id}` | Project detail |
| GET | `/api/projects/{id}/risk` | Risk prediction for project |
| GET | `/api/risks/high-risk` | High risk projects |
| GET | `/api/risks/summary` | Risk breakdown |
| GET | `/api/alerts` | Early warning alerts |
| GET | `/api/alerts/{id}` | Alert detail |

### SIH2026 AI/ML Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sih2026/status` | ML pipeline health |
| GET | `/api/sih2026/dashboard` | Full ML dashboard (2,144 projects) |
| GET | `/api/sih2026/national-summary` | National KPIs |
| GET | `/api/sih2026/risk-distribution` | Risk band distribution |
| GET | `/api/sih2026/sector-breakdown` | Sector-wise risk |
| GET | `/api/sih2026/top-projects?limit=25` | Top priority projects |
| GET | `/api/sih2026/early-warnings` | ML-generated warnings |
| GET | `/api/sih2026/projects` | SIH2026 project list |
| GET | `/api/sih2026/projects/{id}/risk` | Project ML risk profile |
| GET | `/api/sih2026/warning-summary` | Warning type counts |
| GET | `/api/sih2026/anomaly-summary` | Anomaly detection summary |
| GET | `/api/sih2026/predictive-summary` | XGBoost model metrics |

Full interactive documentation: **http://localhost:8000/docs**

---

## Architecture

```
PRAGATI (localhost:5173)
│
├── src/
│   ├── App.jsx                    # Main app + routing
│   ├── components/
│   │   ├── SIH2026Intelligence.jsx  # [NEW] AI Intelligence panel
│   │   ├── KPICards.jsx
│   │   ├── ProjectTable.jsx
│   │   ├── RiskMonitoring.jsx
│   │   ├── EarlyWarnings.jsx
│   │   └── DelayAnalysis.jsx
│   └── services/
│       ├── api.js                 # PRAGATI core API
│       └── sih2026Api.js          # [NEW] SIH2026 API client
│
└── backend/ (localhost:8000)
    ├── main.py                    # FastAPI app + routers
    ├── routers/
    │   ├── dashboard.py
    │   ├── projects.py
    │   ├── risks.py
    │   ├── alerts.py
    │   └── sih2026.py             # [NEW] SIH2026 router
    ├── services/
    │   ├── dashboard_service.py
    │   ├── project_service.py
    │   ├── risk_service.py        # [UPGRADED] uses SIH2026 ML
    │   └── sih2026_service.py     # [NEW] SIH2026 integration
    ├── models/                    # [NEW] Trained ML models
    │   ├── pragati_xgboost_model.joblib
    │   └── pragati_isolation_forest.joblib
    └── sih2026_outputs/           # [NEW] Pre-computed ML outputs
        ├── pragati_dashboard.json
        ├── pragati_priority_queue.csv
        ├── pragati_early_warnings.csv
        └── ... (other CSVs and JSONs)
```

---

## Data

### PRAGATI Demo Data
- **10 demo projects** (PRG-001 to PRG-010)
- Stored in `backend/data/mock_data.py`
- No database required (pure in-memory)

### SIH2026 ML Data
- **2,144 real PRAGATI infrastructure projects**
- **Jan–Jul 2026** government flash report monitoring data
- Sources: Ministry of Railways, Water Resources, Healthcare, etc.
- Pre-computed by the SIH2026 ML pipeline

---

## Navigation

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | KPIs, project table, risk monitoring |
| Projects | `/projects` | All PRAGATI projects |
| Sectors | `/sectors` | Sector directory |
| Risk Monitoring | `/risk` | Risk analysis |
| Early Warnings | `/warnings` | Alert monitoring |
| **AI Intelligence** | `/intelligence` | **SIH2026 ML dashboard** |
| Reports | `/reports` | Reports |

---

## Troubleshooting

### Backend won't start
```bash
cd /Users/aditya/Documents/PRAGATI/backend
source venv/bin/activate
python3 -c "import fastapi, uvicorn; print('OK')"
```

### XGBoost error (libomp)
```bash
brew install libomp
ln -sf /opt/homebrew/Cellar/libomp/23.1.1/lib/libomp.dylib /opt/homebrew/lib/libomp.dylib
```

### Frontend won't start
```bash
cd /Users/aditya/Documents/PRAGATI
npm install
npm run dev
```

### SIH2026 data not loading
Check that these files exist:
```
backend/models/pragati_xgboost_model.joblib
backend/models/pragati_isolation_forest.joblib
backend/sih2026_outputs/pragati_dashboard.json
backend/sih2026_outputs/pragati_priority_queue.csv
backend/sih2026_outputs/pragati_early_warnings.csv
```

### CORS errors in browser
The backend is configured for `localhost:5173` and `localhost:3000`.  
If you're running on a different port, update `main.py` CORS origins.
