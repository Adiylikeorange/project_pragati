from pydantic import BaseModel, Field
from typing import Optional

class ProjectCreate(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "National Highway Development"})
    sector: str = Field(..., json_schema_extra={"example": "Infrastructure"})
    location: str = Field(..., json_schema_extra={"example": "Delhi"})
    description: Optional[str] = Field(None, json_schema_extra={"example": "Highway development project"})
    budget: float = Field(..., json_schema_extra={"example": 500000000.0})
    progress: Optional[float] = 0.0
    status: Optional[str] = "In Progress"
    start_date: Optional[str] = "2025-01-10"
    expected_end_date: Optional[str] = "2027-06-30"
    risk_score: Optional[int] = 30
    risk_level: Optional[str] = "Low"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = None
    progress: Optional[float] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    expected_end_date: Optional[str] = None
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    sector: str
    location: str
    state: Optional[str] = None
    description: Optional[str] = None
    budget: float
    cost: Optional[float] = None
    progress: float
    status: str
    start_date: Optional[str] = None
    expected_end_date: Optional[str] = None
    expectedCompletion: Optional[str] = None
    slippage: Optional[str] = None
    risk_score: int
    risk_level: str
    executingAgency: Optional[str] = None
    ministry: Optional[str] = None
