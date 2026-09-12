import sys
import logging
from contextlib import asynccontextmanager
from pathlib import Path

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import get_settings
from routers import projects, risks, alerts, dashboard, sih2026, test_portal
from routers import auth, users

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s"
)
logger = logging.getLogger(__name__)
settings = get_settings()

# Rate limiter (shared, keyed by client IP)
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Startup and shutdown lifecycle events."""
    # ── Startup ───────────────────────────────────────────────
    logger.info("Starting PRAGATI API (env=%s)", settings.ENV)
    try:
        from database import create_tables, check_db_connection
        if check_db_connection():
            create_tables()
            logger.info("Database ready.")
        else:
            logger.warning(
                "Database not reachable at startup. "
                "Auth features will fail until DB is available. "
                "Set DATABASE_URL in .env to fix this."
            )
    except Exception as exc:
        logger.warning("DB startup check failed (non-fatal): %s", exc)
    yield
    # ── Shutdown ──────────────────────────────────────────────
    logger.info("PRAGATI API shutting down.")

app = FastAPI(
    title="Pragati Infrastructure Risk & Monitoring API",
    description="REST API backend for Pragati infrastructure monitoring, predictive risk scoring, early warning alerts, and dashboard analytics.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — loaded from environment variable ALLOWED_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──────────────────────────────────────────────────────────

# Auth routes (no auth required)
app.include_router(auth.router)

# User profile routes (all authenticated)
app.include_router(users.router)

# Data routes
app.include_router(projects.router)
app.include_router(risks.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)
app.include_router(sih2026.router)

# Test portal (dev only — HTML test UI)
if not settings.is_production:
    app.include_router(test_portal.router)




# ── Global Exception Handler ──────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all: never expose stack traces to clients in production."""
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    if settings.is_production:
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred."}
        )
    # In dev, let FastAPI show the full error
    raise exc


# ── Health & Root ─────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    from database import check_db_connection
    db_ok = check_db_connection()
    return {
        "status": "ok",
        "message": "Pragati backend is running",
        "env": settings.ENV,
        "database": "connected" if db_ok else "unavailable",
        "version": "2.0.0",
    }

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Pragati Infrastructure Risk & Monitoring API",
        "version": "2.0.0",
        "health": "/api/health",
        "documentation": "/docs" if not settings.is_production else "disabled in production",
        "endpoints": {
            "auth": ["/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/auth/refresh", "/api/auth/me", "/api/auth/forgot-password", "/api/auth/reset-password"],
            "users": ["/api/users/me/profile", "/api/users/me/watchlist"],
            "projects": ["/api/projects", "/api/projects/search", "/api/projects/{id}"],
            "risks": ["/api/projects/{id}/risk", "/api/risks/high-risk", "/api/risks/summary"],
            "alerts": ["/api/alerts", "/api/alerts/{id}"],
            "dashboard": ["/api/dashboard/summary"],
            "ai": ["/api/sih2026/status", "/api/sih2026/dashboard", "/api/sih2026/predict"],
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=not settings.is_production)
