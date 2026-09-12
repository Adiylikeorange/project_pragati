# PRAGATI + SIH2026 Integration Guide

> SIH 2026 Problem 26013 — AI/ML Intelligence Layer integrated into PRAGATI

---

## What Was Integrated

The SIH2026 repository (`https://github.com/zeus-xs/Sih2026.git`) is a
complete ML pipeline built on real PRAGATI monitoring data (Jan–Jul 2026).
It was integrated **into** PRAGATI as an AI intelligence layer — not as a
separate application.

---

## What SIH2026 Contributed

### Data
| File | Description |
|------|-------------|
| `data/pragati_jan_jul_2026_master.csv` | 13,200 rows — 2,144 projects × 7 months |

### Trained Models (saved to `backend/models/`)
| File | Algorithm | Purpose |
|------|-----------|---------|
| `pragati_xgboost_model.joblib` | XGBoost Classifier | Predicts future progress deterioration |
| `pragati_isolation_forest.joblib` | IsolationForest | Detects anomalous project patterns |

### Pre-computed Outputs (saved to `backend/sih2026_outputs/`)
| File | Rows | Description |
|------|------|-------------|
| `pragati_dashboard.json` | — | Full national dashboard |
| `pragati_priority_queue.csv` | 2,144 | All projects ranked by risk |
| `pragati_early_warnings.csv` | 1,312 | ML-generated warnings |
| `pragati_features.csv` | 13,200 | Engineered features |
| `pragati_risk_scores.csv` | 13,200 | Historical risk scores |
| `pragati_project_risk_profiles.csv` | 2,144 | Risk profiles |
| `pragati_anomaly_snapshot.csv` | 2,144 | Anomaly detection output |
| `pragati_predictive_risk.csv` | 2,144 | XGBoost predictions |

---

## Integration Points

### Backend

#### New Service: `backend/services/sih2026_service.py`
Central service layer that:
- Loads pre-computed outputs from `sih2026_outputs/`
- Loads trained models from `models/`
- Exposes clean functions for all ML data

Key functions:
```python
get_national_summary()             # KPIs: 2,144 projects
get_sih2026_risk_distribution()    # LOW/MEDIUM/HIGH/CRITICAL counts
get_top_priority_projects(n)       # Top N by risk score
get_sih2026_early_warnings(...)    # ML-generated warnings
get_all_sih2026_projects(...)      # Paginated project list
get_project_risk_from_sih2026(id)  # Per-project ML risk profile
get_sih2026_service_status()       # Health check
```

#### New Router: `backend/routers/sih2026.py`
12 REST endpoints under `/api/sih2026/`:
```
GET /api/sih2026/status
GET /api/sih2026/dashboard
GET /api/sih2026/national-summary
GET /api/sih2026/risk-distribution
GET /api/sih2026/sector-breakdown
GET /api/sih2026/top-projects
GET /api/sih2026/early-warnings
GET /api/sih2026/projects
GET /api/sih2026/projects/{id}/risk
GET /api/sih2026/warning-summary
GET /api/sih2026/anomaly-summary
GET /api/sih2026/predictive-summary
```

#### Upgraded: `backend/services/risk_service.py`
The AI integration point now has a **3-tier priority**:
1. **SIH2026 ML pipeline** (real XGBoost + IsolationForest) — 2,144 projects
2. **Mock prediction database** — PRAGATI demo projects (PRG-001 etc.)
3. **Generic fallback** — any other project ID

### Frontend

#### New Service: `src/services/sih2026Api.js`
API client with graceful fallbacks for all SIH2026 endpoints.
Every function catches errors silently so PRAGATI never crashes if ML data is unavailable.

#### New Component: `src/components/SIH2026Intelligence.jsx`
Four-tab intelligence panel embedded in PRAGATI:

| Tab | Content |
|-----|---------|
| **Overview** | National KPIs, risk distribution chart, warning type summary |
| **Priority Queue** | Top 15 critical projects table with ML scores |
| **Sector Breakdown** | Per-sector risk distribution grid |
| **AI Model Info** | XGBoost metrics, IsolationForest params, fusion methodology |

#### Navigation
- **Header**: "AI Intelligence" link added → `/intelligence`
- **Dashboard**: SIH2026 panel embedded below Delay Analysis section
- **Route**: `/intelligence` → dedicated full-page AI Intelligence view

---

## ML Risk Fusion Methodology

The final risk score fuses four signals:

| Signal | Weight | Source |
|--------|--------|--------|
| Current Domain Risk | 70% | Cost escalation + schedule slippage + progress velocity + expenditure/progress gap |
| Trajectory Risk | 15% | 3-month progress velocity trend (DETERIORATING/STAGNATING/STABLE/IMPROVING) |
| Anomaly Signal | 10% | IsolationForest unsupervised outlier detection |
| XGBoost Predictive | 5% | Future progress deterioration probability |

### Risk Categories
| Category | Description |
|----------|-------------|
| CRITICAL | Final score ≥ 95th percentile of portfolio |
| HIGH | Final score ≥ 80th percentile |
| MEDIUM | Final score ≥ 50th percentile |
| LOW | Below median |
| REVIEW_DATA | Insufficient data confidence (< 40%) |

### Predictive Risk Bands (XGBoost)
| Band | Probability |
|------|-------------|
| HIGH_PREDICTIVE_SIGNAL | ≥ 0.70 |
| ELEVATED | 0.50 – 0.69 |
| WATCH | 0.30 – 0.49 |
| LOW_PREDICTIVE_SIGNAL | < 0.30 |

---

## ML Model Details

### XGBoost Classifier
- **Target**: `1` if `physical_progress_pct(t+1) < physical_progress_pct(t)`, else `0`
- **Training periods**: Jan→Feb, Feb→Mar, Mar→Apr, Apr→May 2026
- **Validation**: May→Jun 2026
- **Test**: Jun→Jul 2026
- **Features**: cost_escalation_pct, expenditure_ratio_pct, expenditure_progress_gap, physical_progress_pct, progress_change_1m/3m, progress_velocity_3m, expenditure_change_1m/3m/velocity_3m
- **Parameters**: n_estimators=200, max_depth=3, learning_rate=0.05, subsample=0.8

### IsolationForest
- **Type**: Unsupervised anomaly detection
- **Contamination**: 5%
- **N estimators**: 300
- **Features**: cost_escalation_pct, expenditure_ratio_pct, physical_progress_pct, expenditure_progress_gap, progress_velocity_3m, expenditure_velocity_3m

---

## Dataset

- **Source**: PRAGATI monitoring flash reports (Jan–Jul 2026)
- **Scope**: 2,144 infrastructure projects across 22 sectors
- **Observation window**: 7 months (Jan 2026 – Jul 2026)
- **Coverage**: Roads & Highways, Railways, Water Resources, Healthcare, Education, Energy, Telecoms, etc.

### National Portfolio Statistics (Jul 2026)
| Metric | Value |
|--------|-------|
| Total projects | 2,144 |
| CRITICAL risk | 141 (6.6%) |
| HIGH risk | 282 (13.2%) |
| ML anomalies detected | 108 (5%) |
| XGBoost deterioration predictions | 303 |
| ML early warnings generated | 1,312 |

---

## What Was NOT Integrated

Per the user's directive, these SIH2026 elements were **not** brought in:

- **Frontend/UI**: SIH2026 had no frontend (pure Python pipeline)
- **Separate dashboard**: SIH2026 data is surfaced through PRAGATI's existing UI
- **Pipeline scripts**: `featureextract.py`, `predictive_model.py`, etc. are not exposed as API endpoints (they are data-generation utilities)

---

## Extending the Integration

### Adding New Monthly Data
1. Run the SIH2026 pipeline with new flash report CSVs
2. Replace files in `backend/sih2026_outputs/`
3. Update `backend/models/` with retrained models
4. Restart the backend — changes are picked up automatically

### Plugging In a New ML Model
The integration point is `backend/services/risk_service.py`:
```python
def get_risk_prediction(project_id: str):
    # 1. SIH2026 ML pipeline (priority 1)
    # 2. Demo mock data (priority 2)
    # 3. Generic fallback (priority 3)
```
Replace the SIH2026 lookup with your new model's inference function.

### Using the CSV Data Directly
```python
from services.sih2026_service import _load_priority_df
df = _load_priority_df()
# df is a pandas DataFrame with 2,144 rows and 70+ columns
```
