"""
SQLAlchemy database engine and session factory for PRAGATI.
Reads DATABASE_URL from environment via config.
"""

import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Use the correct async/sync pool arguments for SQLite vs PostgreSQL
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """FastAPI dependency: yields a database session, closes on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables from ORM models. Safe to call on startup in dev."""
    from models.db_models import Base  # import here to avoid circular imports
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified.")


def check_db_connection() -> bool:
    """Check if database is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error("Database connection failed: %s", exc)
        return False