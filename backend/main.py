import sys
from pathlib import Path

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import projects, risks, alerts, dashboard

app = FastAPI(
    title="Pragati Infrastructure Risk & Monitoring API",
    description="REST API backend for Pragati infrastructure monitoring, predictive risk scoring, early warning alerts, and dashboard analytics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for development frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(projects.router)
app.include_router(risks.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)

@app.get("/api/health")
def health_check():
    """
    Health check endpoint verifying that the backend is active.
    """
    return {
        "status": "ok",
        "message": "Pragati backend is running"
    }

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Pragati Infrastructure Risk & Monitoring API",
        "health": "/api/health",
        "documentation": "/docs",
        "endpoints": [
            "/api/health",
            "/api/dashboard/summary",
            "/api/projects",
            "/api/projects/search",
            "/api/projects/{project_id}",
            "/api/projects/{project_id}/risk",
            "/api/risks/high-risk",
            "/api/risks/summary",
            "/api/alerts",
            "/api/alerts/{alert_id}"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
