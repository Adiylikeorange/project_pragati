# Pragati Infrastructure Risk & Monitoring - FastAPI Backend

A clean FastAPI Python backend prototype for the Pragati Infrastructure Monitoring Platform.

---

## 1. Python Version
* **Python**: `3.9+` (Tested on Python 3.9.6)

---

## 2. Setup & Installation Commands

### Virtual Environment Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Dependency Installation
```bash
pip install -r requirements.txt
```

---

## 3. Environment Variable Setup

Copy the example environment configuration:
```bash
cp .env.example .env
```

`.env` configuration keys:
```env
PORT=8000
HOST=127.0.0.1
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
DATABASE_URL=postgresql://username:password@localhost:5432/pragati
```

---

## 4. How to Start FastAPI

From the `backend` directory:
```bash
source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

---

## 5. API Documentation URLs

* **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
* **ReDoc**: `http://127.0.0.1:8000/redoc`

---

## 6. Main API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint (`{"status": "ok"}`) |
| `GET` | `/api/dashboard/summary` | Portfolio summary metrics & KPI statistics |
| `GET` | `/api/dashboard/risk-distribution` | Project counts by risk tier (Low, Medium, High, Critical) |
| `GET` | `/api/dashboard/projects-by-sector` | Project counts grouped by sector |
| `GET` | `/api/dashboard/status-distribution` | Project counts grouped by execution status |
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/projects/search` | Search/filter projects by sector, status, risk_level, location, search query |
| `GET` | `/api/projects/{project_id}` | Details for a specific project |
| `POST` | `/api/projects` | Create a project |
| `PUT` | `/api/projects/{project_id}` | Update a project |
| `DELETE` | `/api/projects/{project_id}` | Delete a project |
| `GET` | `/api/projects/{project_id}/risk` | AI risk score prediction & bottleneck breakdown |
| `GET` | `/api/risks/high-risk` | Filter High & Critical risk projects |
| `GET` | `/api/risks/summary` | Risk count summary breakdown |
| `GET` | `/api/alerts` | List all early-warning alerts |
| `GET` | `/api/alerts/{alert_id}` | Details for a specific alert |
| `POST` | `/api/alerts` | Create an early-warning alert |
| `PUT` | `/api/alerts/{alert_id}` | Update alert details |
| `PUT` | `/api/alerts/{alert_id}/read` | Mark alert as read |
| `DELETE` | `/api/alerts/{alert_id}` | Delete an alert |

---

## 7. Where the Future AI Model Should Be Connected

* **Module**: `backend/services/risk_service.py`
* **Function**: `get_risk_prediction(project_id: str)`

When integrating your real machine learning model:
1. Open `backend/services/risk_service.py`.
2. Load your model weights / pipeline (PyTorch, TensorFlow, Scikit-Learn, XGBoost, etc.).
3. Replace the mock function logic with model inference:
   ```python
   def get_risk_prediction(project_id: str) -> Dict[str, Any]:
       # 1. Fetch project features from DB using project_id
       # 2. Run inference: predictions = model.predict(features)
       return {
           "project_id": str(project_id),
           "risk_score": predictions.risk_score,
           "risk_level": predictions.risk_level,
           "confidence": predictions.confidence,
           "risk_factors": predictions.risk_factors,
           "primary_bottleneck": predictions.primary_bottleneck,
           "delay_forecast_days": predictions.estimated_delay_days,
           "recommendation": predictions.recommendation
       }
   ```

---

## 8. Running Automated Tests

To run the automated test suite:
```bash
source venv/bin/activate
pytest tests/test_api.py
```
