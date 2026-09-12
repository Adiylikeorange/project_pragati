import sys
from pathlib import Path

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import engine
from routers import projects, risks, alerts, dashboard


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Pragati Infrastructure Risk & Monitoring API",
    description=(
        "REST API backend for Pragati infrastructure monitoring, "
        "predictive risk scoring, early warning alerts, "
        "and dashboard analytics."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

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


# ============================================================
# REGISTER ROUTERS
# ============================================================

app.include_router(projects.router)
app.include_router(risks.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    """
    Check whether the FastAPI backend is running.
    """
    return {
        "status": "ok",
        "message": "Pragati backend is running"
    }


# ============================================================
# DATABASE CONNECTION TEST
# ============================================================

@app.get("/api/db-test")
def database_test():
    """
    Test the connection between FastAPI and PostgreSQL
    and verify that the projects table is accessible.
    """
    try:
        with engine.connect() as connection:

            # Test PostgreSQL connection
            connection.execute(text("SELECT 1"))

            # Count records in the actual projects table
            result = connection.execute(
                text("SELECT COUNT(*) FROM projects")
            )

            total_records = result.scalar()

        return {
            "status": "success",
            "message": "FastAPI is connected to PostgreSQL",
            "database": "project_pragati",
            "table": "projects",
            "total_records": total_records
        }

    except Exception as e:
        return {
            "status": "error",
            "message": "Database connection failed",
            "error": str(e)
        }


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Pragati Infrastructure Risk & Monitoring API",
        "health": "/api/health",
        "database_test": "/api/db-test",
        "documentation": "/docs",
        "endpoints": [
            "/api/health",
            "/api/db-test",
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


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )