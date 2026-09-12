from pydantic import BaseModel
from pydantic import ConfigDict
from typing import List, Dict, Any, Optional

class PortfolioMetrics(BaseModel):
    model_config = ConfigDict(extra='allow')
    totalProjects: int
    onTrack: int
    inProgress: int
    atRisk: int
    delayed: int
    completed: int
    totalAllocation: str

class RiskSummary(BaseModel):
    model_config = ConfigDict(extra='allow')
    critical: int
    high: int
    medium: int
    low: int

class DashboardSummaryResponse(BaseModel):
    model_config = ConfigDict(extra='allow')
    total_projects: int
    high_risk_projects: int
    critical_projects: int
    projects_on_track: int
    projects_delayed: int
    portfolioMetrics: PortfolioMetrics
    riskSummary: RiskSummary
    riskFactors: List[Dict[str, Any]]
    delayCauses: List[Dict[str, Any]]
    delayedProjects: List[Dict[str, Any]]
