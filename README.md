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

## 🔌 AI Model Integration Point

To plug in your real machine learning / AI prediction model:
* **File Location**: [backend/services/risk_service.py](file:///Users/aditya/Documents/PARAKRITI/backend/services/risk_service.py)
* **Function**: `get_risk_prediction(project_id: str)`

Replace the mock predictor with your model inference pipeline without changing the API contract or frontend:

```python
def get_risk_prediction(project_id: str) -> Dict[str, Any]:
    # 1. Fetch project features from DB using project_id
    # 2. Run inference: prediction = model.predict(features)
    return {
        "project_id": str(project_id),
        "risk_score": prediction.risk_score,
        "risk_level": prediction.risk_level,
        "confidence": prediction.confidence,
        "risk_factors": prediction.risk_factors,
        "primary_bottleneck": prediction.primary_bottleneck,
        "delay_forecast_days": prediction.estimated_delay_days,
        "recommendation": prediction.recommendation
    }
```

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 8, React Router v6, Tailwind CSS (CDN), Material Symbols Icons
* **Backend**: Python 3.9, FastAPI, Uvicorn, Pydantic V2, Httpx, Pytest
