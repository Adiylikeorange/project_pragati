"""
Risk Prediction Service.

AI MODEL INTEGRATION POINT:
This is where your real ML model / AI risk predictor will be plugged in.
Replace the mock functions below with your real model inference pipeline.
"""

from typing import List, Dict, Any, Optional
from data.mock_data import PROJECTS

def get_risk_prediction(project_id: str) -> Dict[str, Any]:
    """
    Returns AI risk score, confidence, risk factors, and bottleneck breakdown.
    """
    mock_database = {
        "PRG-001": {
            "project_id": "PRG-001",
            "risk_score": 42,
            "risk_level": "Medium",
            "confidence": 0.88,
            "risk_factors": [
                "Contractor mobilization delay",
                "Land compensation dispute",
                "Environmental clearance pending"
            ],
            "primary_bottleneck": "Contractor mobilization delay in Section 3",
            "delay_forecast_days": 15,
            "key_risk_drivers": [
                {"factor": "Land Acquisition", "contribution": 35},
                {"factor": "Contractor Performance", "contribution": 45},
                {"factor": "Environmental Clearance", "contribution": 20}
            ],
            "recommendation": "Accelerate contractor milestone payout to incentivize labor deployment."
        },
        "PRG-002": {
            "project_id": "PRG-002",
            "risk_score": 91,
            "risk_level": "Critical",
            "confidence": 0.94,
            "risk_factors": [
                "Schedule delay",
                "Inter-tidal reclamation stay order",
                "CRZ clearance litigation",
                "Budget overrun pressure"
            ],
            "primary_bottleneck": "Inter-tidal reclamation stay order before High Court",
            "delay_forecast_days": 184,
            "key_risk_drivers": [
                {"factor": "Litigation & Stay Orders", "contribution": 60},
                {"factor": "Environmental Approvals", "contribution": 25},
                {"factor": "Fund Disbursement", "contribution": 15}
            ],
            "recommendation": "Convene High-Powered State Resolution Committee with Chief Secretary & Advocacy Team."
        },
        "PRG-005": {
            "project_id": "PRG-005",
            "risk_score": 87,
            "risk_level": "High",
            "confidence": 0.91,
            "risk_factors": [
                "Pali District land compensation dispute",
                "Utility shifting delays",
                "Contractor liquidity squeeze"
            ],
            "primary_bottleneck": "Land compensation dispute in Pali District",
            "delay_forecast_days": 45,
            "key_risk_drivers": [
                {"factor": "Land Acquisition", "contribution": 70},
                {"factor": "Utility Shifting", "contribution": 20},
                {"factor": "Contractor Cash-Flow", "contribution": 10}
            ],
            "recommendation": "Expedite District Collector intervention for enhanced land compensation package."
        }
    }

    if str(project_id) in mock_database:
        return mock_database[str(project_id)]

    # Fetch project details if present
    project = next((p for p in PROJECTS if str(p.get("id")).lower() == str(project_id).lower()), None)
    risk_score = project.get("risk_score") or project.get("riskScore") or 78
    risk_level = project.get("risk_level") or project.get("riskLevel") or "High"

    return {
        "project_id": str(project_id),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "confidence": 0.91,
        "risk_factors": [
            "Schedule slippage",
            "Budget pressure",
            "Resource shortage"
        ],
        "primary_bottleneck": "Statutory clearances & utility relocation delays",
        "delay_forecast_days": 60,
        "key_risk_drivers": [
            {"factor": "Statutory Clearances", "contribution": 40},
            {"factor": "Land Acquisition", "contribution": 35},
            {"factor": "Fund Release Velocity", "contribution": 25}
        ],
        "recommendation": "Initiate inter-ministerial review via PRAGATI monitoring portal."
    }

def get_high_risk_projects(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Returns list of projects with High or Critical risk level.
    """
    high_risk = [
        p for p in PROJECTS
        if p.get("risk_level") in ["High", "Critical", "high", "critical"]
        or p.get("riskLevel") in ["High", "Critical", "high", "critical"]
    ]
    if limit:
        return high_risk[:limit]
    return high_risk

def get_risk_summary() -> Dict[str, int]:
    """
    Returns risk count breakdown across all projects.
    """
    total = len(PROJECTS)
    low = len([p for p in PROJECTS if p.get("risk_level") in ["Low", "low"] or p.get("riskLevel") in ["Low", "low"]])
    medium = len([p for p in PROJECTS if p.get("risk_level") in ["Medium", "medium"] or p.get("riskLevel") in ["Medium", "medium"]])
    high = len([p for p in PROJECTS if p.get("risk_level") in ["High", "high"] or p.get("riskLevel") in ["High", "high"]])
    critical = len([p for p in PROJECTS if p.get("risk_level") in ["Critical", "critical"] or p.get("riskLevel") in ["Critical", "critical"]])

    return {
        "total_projects": total,
        "low_risk": low,
        "medium_risk": medium,
        "high_risk": high,
        "critical_risk": critical
    }
