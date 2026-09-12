"""
SIH2026 API Router for PRAGATI.

Exposes the SIH2026 ML pipeline outputs through the PRAGATI FastAPI backend.
All endpoints are prefixed with /api/sih2026/

Endpoints:
  GET /api/sih2026/status              — integration health check
  GET /api/sih2026/dashboard           — full SIH2026 national dashboard
  GET /api/sih2026/national-summary    — KPI summary (2,144 projects)
  GET /api/sih2026/risk-distribution   — risk band distribution
  GET /api/sih2026/sector-breakdown    — sector-wise risk breakdown
  GET /api/sih2026/top-projects        — top N critical projects
  GET /api/sih2026/early-warnings      — ML-generated early warnings
  GET /api/sih2026/projects            — paginated project list
  GET /api/sih2026/projects/{id}/risk  — project-level ML risk profile
  GET /api/sih2026/warning-summary     — warning type counts
  GET /api/sih2026/anomaly-summary     — anomaly detection summary
  GET /api/sih2026/predictive-summary  — XGBoost predictive model summary
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Any, Dict, List, Optional

from services.sih2026_service import (
    get_sih2026_dashboard,
    get_national_summary,
    get_sih2026_risk_distribution,
    get_sih2026_sector_breakdown,
    get_top_priority_projects,
    get_sih2026_early_warnings,
    get_all_sih2026_projects,
    get_project_risk_from_sih2026,
    get_warning_summary,
    get_anomaly_summary,
    get_predictive_summary,
    get_sih2026_service_status,
    predict_live_risk,
)

router = APIRouter(prefix="/api/sih2026", tags=["SIH2026 AI/ML Intelligence"])


@router.get("/status")
def sih2026_status():
    """
    Health check for the SIH2026 integration.
    Reports which models and data files are available.
    """
    return get_sih2026_service_status()


@router.get("/dashboard")
def sih2026_dashboard():
    """
    Full SIH2026 national dashboard JSON.
    Covers 2,144 PRAGATI projects, Jan–Jul 2026.
    Includes national summary, risk distribution, sector breakdown,
    top 25 critical projects, warning summary, and anomaly summary.
    """
    return get_sih2026_dashboard()


@router.get("/national-summary")
def national_summary():
    """
    National-level KPIs from the SIH2026 ML pipeline.
    Returns total project count, project-months, complete history count.
    """
    return get_national_summary()


@router.get("/risk-distribution")
def risk_distribution():
    """
    Risk band distribution across all 2,144 SIH2026 projects.
    Returns counts for LOW / MEDIUM / HIGH / CRITICAL / REVIEW_DATA.
    """
    return get_sih2026_risk_distribution()


@router.get("/sector-breakdown")
def sector_breakdown():
    """
    Sector-wise risk distribution.
    Returns per-sector counts of LOW / MEDIUM / HIGH / CRITICAL projects.
    """
    return get_sih2026_sector_breakdown()


@router.get("/top-projects")
def top_projects(
    limit: int = Query(25, ge=1, le=100, description="Number of top priority projects to return")
):
    """
    Top N projects ranked by final_risk_score (highest = most critical).
    Includes ML risk score, predictive band, anomaly flag, and recommended action.
    """
    return get_top_priority_projects(limit=limit)


@router.get("/early-warnings")
def early_warnings(
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, HIGH, MEDIUM, LOW"),
    warning_type: Optional[str] = Query(None, description="Filter by type: PROGRESS_STAGNATION, COST_ESCALATION, etc."),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of warnings to return")
):
    """
    ML-generated early warnings from the SIH2026 pipeline.
    1,313 warnings covering 6 warning types across 2,144 projects.

    Warning types:
      PROGRESS_STAGNATION, PROGRESS_DETERIORATION,
      COST_ESCALATION, EXPENDITURE_PROGRESS_DIVERGENCE,
      ANOMALOUS_TRAJECTORY, DATA_QUALITY_REVIEW
    """
    return get_sih2026_early_warnings(
        severity=severity,
        warning_type=warning_type,
        limit=limit
    )


@router.get("/projects")
def list_sih2026_projects(
    sector: Optional[str] = Query(None, description="Filter by sector"),
    risk_category: Optional[str] = Query(None, description="Filter by risk category: CRITICAL, HIGH, MEDIUM, LOW"),
    limit: int = Query(100, ge=1, le=2000, description="Number of projects to return")
):
    """
    Returns SIH2026 projects from the priority queue, sorted by risk rank.
    Covers 2,144 real PRAGATI infrastructure projects.
    """
    return get_all_sih2026_projects(
        sector=sector,
        risk_category=risk_category,
        limit=limit
    )


@router.get("/projects/{project_id}/risk")
def sih2026_project_risk(project_id: str):
    """
    ML risk profile for a specific project from the SIH2026 pipeline.

    Returns XGBoost predictive score, IsolationForest anomaly signal,
    trajectory status, risk drivers, and recommended action.

    The project_id should match the numeric project IDs in the SIH2026 dataset
    (e.g. '705458', '400298').

    Returns 404 if the project is not found in the SIH2026 dataset.
    """
    result = get_project_risk_from_sih2026(project_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{project_id}' not found in SIH2026 ML dataset."
        )
    return result


@router.get("/warning-summary")
def warning_summary():
    """
    Count of ML-generated warnings by type.
    """
    return get_warning_summary()


@router.get("/anomaly-summary")
def anomaly_summary():
    """
    IsolationForest anomaly detection summary.
    """
    return get_anomaly_summary()


@router.get("/predictive-summary")
def predictive_summary():
    """
    XGBoost predictive model validation summary.
    Includes test metrics, risk band distribution, and model parameters.
    """
    return get_predictive_summary()


@router.post("/predict")
def live_predict(payload: Dict[str, Any]):
    """
    Real-time live inference endpoint.
    Pass custom project metrics and receive instantaneous forward-looking
    predictions from the loaded XGBoost model and IsolationForest model.
    """
    try:
        return predict_live_risk(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Live model inference error: {str(exc)}"
        )

