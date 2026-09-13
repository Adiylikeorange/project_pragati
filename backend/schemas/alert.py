from pydantic import BaseModel, Field
from typing import Optional

class AlertCreate(BaseModel):
    project_id: str = Field(..., json_schema_extra={"example": "PRG-002"})
    project_name: str = Field(..., json_schema_extra={"example": "Mumbai Coastal Infrastructure"})
    severity: str = Field(..., json_schema_extra={"example": "Critical"})
    title: Optional[str] = Field(None, json_schema_extra={"example": "Major Schedule Delay"})
    message: str = Field(..., json_schema_extra={"example": "Project progress is significantly below planned baseline."})
    description: Optional[str] = None
    mandatedAction: Optional[str] = None

class AlertUpdate(BaseModel):
    severity: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    description: Optional[str] = None
    mandatedAction: Optional[str] = None
    is_read: Optional[bool] = None

class EarlyWarningResponse(BaseModel):
    id: str
    project_id: str
    project_name: str
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    sector: Optional[str] = "Infrastructure"
    state: Optional[str] = "National"
    severity: str
    riskScore: Optional[int] = 85
    delayProbability: Optional[int] = 75
    title: Optional[str] = None
    message: Optional[str] = None
    description: Optional[str] = None
    mandatedAction: Optional[str] = None
    created_at: str
    is_read: bool = False

    class Config:
        extra = "allow"
