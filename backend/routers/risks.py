from fastapi import APIRouter, Query, status
from typing import List, Optional, Dict, Any
from schemas.risk import RiskPredictionResponse
from schemas.project import ProjectResponse
from services.risk_service import get_risk_prediction, get_high_risk_projects, get_risk_summary

router = APIRouter(tags=["Risk Oversight"])

@router.get("/api/projects/{project_id}/risk", response_model=RiskPredictionResponse)
def get_project_risk_endpoint(project_id: str):
    """
    Returns AI risk score, confidence, bottleneck, and risk factors for a project.
    """
    return get_risk_prediction(project_id)

@router.get("/api/risks/high-risk", response_model=List[ProjectResponse])
def get_high_risk_projects_endpoint(limit: Optional[int] = Query(None, description="Maximum number of projects to return")):
    """
    Returns projects whose risk level is High or Critical.
    """
    return get_high_risk_projects(limit=limit)

@router.get("/api/risks/summary")
def get_risk_summary_endpoint():
    """
    Returns risk breakdown counts (Low, Medium, High, Critical).
    """
    return get_risk_summary()
