"""
Risk Prediction Service.

AI MODEL INTEGRATION POINT:
This is where the real ML model / AI risk predictor is integrated.

For projects found in the SIH2026 dataset (2,144 real PRAGATI projects,
Jan–Jul 2026), this service uses the REAL XGBoost + IsolationForest
predictions from the SIH2026 ML pipeline.

For PRAGATI mock projects (PRG-001 to PRG-010), it uses the mock
prediction system as a fallback.

To plug in a new/updated AI model in the future:
  - Replace or retrain the joblib models in backend/models/
  - Or update sih2026_service.py to load a new model
  - The API contract (risk_score, risk_level, confidence, etc.) is preserved
"""

from typing import List, Dict, Any, Optional
from data.mock_data import PROJECTS


def get_risk_prediction(project_id: str) -> Dict[str, Any]:
    """
    Returns AI risk score, confidence, risk factors, and bottleneck breakdown.

    Priority order:
    1. SIH2026 ML pipeline (real XGBoost+IsolationForest model) — 2,144 projects
    2. Mock prediction database — PRAGATI demo projects (PRG-001, PRG-002, etc.)
    3. Generic fallback for any other project
    """

    # ─── 1. TRY SIH2026 ML PIPELINE FIRST ──────────────────────────────────
    try:
        from services.sih2026_service import get_project_risk_from_sih2026
        sih_result = get_project_risk_from_sih2026(project_id)
        if sih_result is not None:
            # Map SIH2026 output to PRAGATI risk contract
            confidence = sih_result.get("confidence")
            if confidence is None:
                confidence = 0.85

            risk_score = sih_result.get("risk_score")
            if risk_score is None:
                final = sih_result.get("final_risk_score") or 50
                risk_score = int(round(float(final)))

            delay_forecast = None
            if sih_result.get("trajectory_status") == "DETERIORATING":
                delay_forecast = 90
            elif sih_result.get("trajectory_status") == "STAGNATING":
                delay_forecast = 45
            else:
                delay_forecast = 30

            return {
                "project_id": str(project_id),
                "risk_score": risk_score,
                "risk_level": sih_result.get("risk_level", "Unknown"),
                "confidence": float(confidence),
                "risk_factors": sih_result.get("risk_factors", []),
                "primary_bottleneck": sih_result.get("primary_bottleneck", ""),
                "delay_forecast_days": delay_forecast,
                "key_risk_drivers": _build_key_risk_drivers(sih_result),
                "recommendation": sih_result.get("recommended_action", ""),
                # Extended SIH2026 fields
                "sih2026": {
                    "source": "SIH2026_ML_PIPELINE",
                    "trajectory_status": sih_result.get("trajectory_status"),
                    "anomaly_flag": sih_result.get("anomaly_flag"),
                    "anomaly_score": sih_result.get("anomaly_score"),
                    "anomaly_category": sih_result.get("anomaly_category"),
                    "future_deterioration_probability": sih_result.get("future_deterioration_probability"),
                    "predictive_risk_band": sih_result.get("predictive_risk_band"),
                    "final_risk_score": sih_result.get("final_risk_score"),
                    "base_risk_score": sih_result.get("base_risk_score"),
                    "data_confidence_score": sih_result.get("data_confidence_score"),
                    "data_confidence_category": sih_result.get("data_confidence_category"),
                    "risk_explanation": sih_result.get("risk_explanation"),
                    "risk_fusion_method": sih_result.get("risk_fusion_method"),
                    "priority_rank": sih_result.get("priority_rank"),
                    "observation_month": sih_result.get("observation_month"),
                    "source_file": sih_result.get("source_file"),
                }
            }
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning(
            "SIH2026 lookup failed for %s: %s", project_id, exc
        )

    # ─── 2. PRAGATI DEMO MOCK DATABASE ──────────────────────────────────────
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

    pid = str(project_id)
    if pid in mock_database:
        return mock_database[pid]

    # ─── 3. GENERIC FALLBACK ─────────────────────────────────────────────────
    project = next(
        (p for p in PROJECTS if str(p.get("id")).lower() == pid.lower()),
        None
    )
    risk_score = (project.get("risk_score") or project.get("riskScore") or 78) if project else 78
    risk_level = (project.get("risk_level") or project.get("riskLevel") or "High") if project else "High"

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


def _build_key_risk_drivers(sih_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Build PRAGATI-format key_risk_drivers from SIH2026 risk drivers."""
    drivers = []
    contributions = [40, 35, 25]
    for i, key in enumerate(["risk_driver_1", "risk_driver_2", "risk_driver_3"]):
        val = sih_result.get(key) or sih_result.get(
            "primary_bottleneck" if i == 0 else "secondary_risk_driver" if i == 1 else None
        )
        if val and str(val) not in ("", "nan", "None"):
            drivers.append({
                "factor": str(val).replace("_", " ").title(),
                "contribution": contributions[i] if i < len(contributions) else 10
            })
    if not drivers:
        drivers = [{"factor": "Risk Assessment Pending", "contribution": 100}]
    return drivers


def get_high_risk_projects(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Returns list of projects with High or Critical risk level.
    Draws from PRAGATI mock data.
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
