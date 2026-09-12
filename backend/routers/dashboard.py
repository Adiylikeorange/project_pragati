from fastapi import APIRouter
from typing import Dict, List, Any
from schemas.dashboard import DashboardSummaryResponse
from services.dashboard_service import (
    get_dashboard_summary,
    get_risk_distribution,
    get_projects_by_sector,
    get_status_distribution
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary_endpoint():
    """
    Returns aggregated dashboard statistics, KPIs, and metrics.
    """
    return get_dashboard_summary()

@router.get("/risk-distribution")
def get_risk_distribution_endpoint():
    """
    Returns counts of projects grouped by risk level (Low, Medium, High, Critical).
    """
    return get_risk_distribution()

@router.get("/projects-by-sector")
def get_projects_by_sector_endpoint():
    """
    Returns project counts grouped by sector.
    """
    return get_projects_by_sector()

@router.get("/status-distribution")
def get_status_distribution_endpoint():
    """
    Returns project counts grouped by execution status.
    """
    return get_status_distribution()
