from pydantic import BaseModel
from typing import List, Optional

class KeyRiskDriver(BaseModel):
    factor: str
    contribution: int

class RiskPredictionResponse(BaseModel):
    project_id: str
    risk_score: int
    risk_level: str
    confidence: float
    risk_factors: Optional[List[str]] = []
    primary_bottleneck: Optional[str] = None
    delay_forecast_days: Optional[int] = None
    key_risk_drivers: Optional[List[KeyRiskDriver]] = []
    recommendation: Optional[str] = None
