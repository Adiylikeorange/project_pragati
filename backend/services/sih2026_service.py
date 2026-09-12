"""
SIH2026 Integration Service for PRAGATI.

This service integrates the SIH2026 ML pipeline outputs and trained models
into the PRAGATI backend. It provides:

1. Pre-computed risk profiles (priority queue) for 2,144 real PRAGATI projects
2. ML-powered early warnings from the SIH2026 pipeline
3. National dashboard summary (2,144 projects, Jan–Jul 2026)
4. Sector-wise risk breakdown
5. Top priority projects (ranked by final risk score)
6. Live inference via saved XGBoost + IsolationForest models

AI/ML INTEGRATION POINT:
  - Model: XGBoost (pragati_xgboost_model.joblib) — predicts future progress deterioration
  - Model: IsolationForest (pragati_isolation_forest.joblib) — anomaly detection
  - Replace or retrain these models with updated data as new months become available.
  - The feature schema is documented in FEATURE_CANDIDATES below.

Author: PRAGATI + SIH2026 Integration
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────────────────────────────────────────

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
_SIH_OUTPUTS = _BACKEND_ROOT / "sih2026_outputs"
_MODELS_DIR = _BACKEND_ROOT / "models"

_DASHBOARD_JSON = _SIH_OUTPUTS / "pragati_dashboard.json"
_PRIORITY_QUEUE_CSV = _SIH_OUTPUTS / "pragati_priority_queue.csv"
_EARLY_WARNINGS_CSV = _SIH_OUTPUTS / "pragati_early_warnings.csv"

_XGBOOST_MODEL = _MODELS_DIR / "pragati_xgboost_model.joblib"
_ISOLATION_FOREST = _MODELS_DIR / "pragati_isolation_forest.joblib"

# ─────────────────────────────────────────────────────────────────────────────
# CACHED DATA (loaded once at first call, not at import time)
# ─────────────────────────────────────────────────────────────────────────────

_dashboard_cache: Optional[Dict[str, Any]] = None
_priority_df_cache = None   # pandas DataFrame
_warnings_df_cache = None   # pandas DataFrame
_xgboost_bundle: Optional[Dict[str, Any]] = None
_isolation_bundle: Optional[Dict[str, Any]] = None


def _load_dashboard() -> Dict[str, Any]:
    global _dashboard_cache
    if _dashboard_cache is None:
        if not _DASHBOARD_JSON.exists():
            logger.warning("SIH2026 dashboard JSON not found: %s", _DASHBOARD_JSON)
            _dashboard_cache = {}
        else:
            with open(_DASHBOARD_JSON, encoding="utf-8") as f:
                _dashboard_cache = json.load(f)
    return _dashboard_cache


def _load_priority_df():
    global _priority_df_cache
    if _priority_df_cache is None:
        try:
            import pandas as pd
            if _PRIORITY_QUEUE_CSV.exists():
                _priority_df_cache = pd.read_csv(_PRIORITY_QUEUE_CSV, low_memory=False)
            else:
                logger.warning("Priority queue CSV not found: %s", _PRIORITY_QUEUE_CSV)
                import pandas as pd
                _priority_df_cache = pd.DataFrame()
        except ImportError:
            logger.error("pandas not installed — SIH2026 CSV features unavailable")
            _priority_df_cache = None
    return _priority_df_cache


def _load_warnings_df():
    global _warnings_df_cache
    if _warnings_df_cache is None:
        try:
            import pandas as pd
            if _EARLY_WARNINGS_CSV.exists():
                _warnings_df_cache = pd.read_csv(_EARLY_WARNINGS_CSV)
            else:
                logger.warning("Early warnings CSV not found: %s", _EARLY_WARNINGS_CSV)
                _warnings_df_cache = pd.DataFrame()
        except ImportError:
            _warnings_df_cache = None
    return _warnings_df_cache


def _load_xgboost_bundle() -> Optional[Dict[str, Any]]:
    global _xgboost_bundle
    if _xgboost_bundle is None and _XGBOOST_MODEL.exists():
        try:
            import joblib
            _xgboost_bundle = joblib.load(_XGBOOST_MODEL)
            logger.info("XGBoost model loaded from %s", _XGBOOST_MODEL)
        except Exception as exc:
            logger.warning("Could not load XGBoost model: %s", exc)
    return _xgboost_bundle


def _load_isolation_bundle() -> Optional[Dict[str, Any]]:
    global _isolation_bundle
    if _isolation_bundle is None and _ISOLATION_FOREST.exists():
        try:
            import joblib
            _isolation_bundle = joblib.load(_ISOLATION_FOREST)
            logger.info("IsolationForest model loaded from %s", _ISOLATION_FOREST)
        except Exception as exc:
            logger.warning("Could not load IsolationForest model: %s", exc)
    return _isolation_bundle


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC API
# ─────────────────────────────────────────────────────────────────────────────

def get_sih2026_dashboard() -> Dict[str, Any]:
    """
    Returns the full SIH2026 national dashboard summary.
    Covers 2,144 PRAGATI projects, Jan–Jul 2026.
    """
    data = _load_dashboard()
    return data


def get_national_summary() -> Dict[str, Any]:
    """Returns national-level KPIs from the SIH2026 pipeline."""
    data = _load_dashboard()
    return data.get("national_summary", {
        "projects": 2144,
        "project_months": 13200,
        "complete_history_projects": 1358
    })


def get_sih2026_risk_distribution() -> Dict[str, int]:
    """Returns risk distribution across 2,144 projects."""
    data = _load_dashboard()
    return data.get("risk_distribution", {
        "LOW": 1029, "MEDIUM": 609, "HIGH": 282, "CRITICAL": 141, "REVIEW_DATA": 83
    })


def get_sih2026_sector_breakdown() -> Dict[str, Any]:
    """Returns sector-wise risk distribution."""
    data = _load_dashboard()
    return data.get("sector_wise_risk_summary", {})


def get_top_priority_projects(limit: int = 25) -> List[Dict[str, Any]]:
    """Returns top N priority projects ranked by final_risk_score."""
    data = _load_dashboard()
    projects = data.get("top_priority_projects", [])
    return projects[:limit]


def get_warning_summary() -> Dict[str, Any]:
    """Returns count of early warnings by type."""
    data = _load_dashboard()
    return data.get("warning_summary", {})


def get_anomaly_summary() -> Dict[str, Any]:
    """Returns anomaly detection summary."""
    data = _load_dashboard()
    return data.get("anomaly_summary", {})


def get_predictive_summary() -> Dict[str, Any]:
    """Returns XGBoost predictive model summary."""
    data = _load_dashboard()
    return data.get("predictive_summary", {})


def get_sih2026_early_warnings(
    severity: Optional[str] = None,
    warning_type: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Returns early warnings from the SIH2026 ML pipeline.
    Can be filtered by severity (CRITICAL/HIGH/MEDIUM/LOW) or warning_type.
    """
    df = _load_warnings_df()
    if df is None or (hasattr(df, 'empty') and df.empty):
        return []

    result = df.copy()

    if severity:
        result = result[result["severity"].str.upper() == severity.upper()]

    if warning_type:
        result = result[result["warning_type"].str.upper() == warning_type.upper()]

    result = result.head(limit)

    return result.fillna("").to_dict(orient="records")


def get_project_risk_from_sih2026(project_id: str) -> Optional[Dict[str, Any]]:
    """
    Looks up a project in the SIH2026 priority queue by project_id.
    Returns enriched risk data from the ML pipeline if found, else None.

    The project_id can be either a string or numeric (e.g. '705458' or 705458).
    """
    df = _load_priority_df()
    if df is None or (hasattr(df, 'empty') and df.empty):
        return None

    try:
        # Try matching by project_id (numeric or string)
        pid = str(project_id).strip()
        mask = df["project_id"].astype(str).str.strip() == pid
        if not mask.any():
            # Try canonical_project_id
            mask = df["canonical_project_id"].astype(str).str.strip() == pid
        if not mask.any():
            return None

        row = df[mask].iloc[0]
        row_dict = row.where(row.notna(), other=None).to_dict()

        # Build a clean, normalized risk profile
        risk_category = str(row_dict.get("risk_category") or "").upper()
        risk_level_map = {
            "CRITICAL": "Critical",
            "HIGH": "High",
            "MEDIUM": "Medium",
            "LOW": "Low",
            "REVIEW_DATA": "Unknown"
        }
        risk_level = risk_level_map.get(risk_category, "Unknown")

        final_score = row_dict.get("final_risk_score")
        risk_score = int(round(float(final_score))) if final_score is not None else None

        det_prob = row_dict.get("future_deterioration_probability")
        confidence = float(det_prob) if det_prob is not None else None

        drivers = []
        for key in ["risk_driver_1", "risk_driver_2", "risk_driver_3"]:
            val = row_dict.get(key)
            if val and str(val) not in ("", "nan", "None"):
                drivers.append(str(val).replace("_", " ").title())

        return {
            "project_id": str(project_id),
            "canonical_project_id": str(row_dict.get("canonical_project_id") or ""),
            "project_name": str(row_dict.get("project_name") or ""),
            "sector": str(row_dict.get("sector") or ""),
            "line_ministry": str(row_dict.get("line_ministry") or ""),
            "source": "SIH2026_ML_PIPELINE",

            # Core risk scores (SIH2026 ML)
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_category": risk_category,
            "final_risk_score": final_score,
            "base_risk_score": row_dict.get("base_risk_score"),
            "data_confidence_score": row_dict.get("data_confidence_score"),
            "data_confidence_category": str(row_dict.get("data_confidence_category") or ""),

            # Confidence = future deterioration probability
            "confidence": confidence,
            "future_deterioration_probability": det_prob,
            "predictive_risk_band": str(row_dict.get("predictive_risk_band") or ""),
            "predicted_future_deterioration": row_dict.get("predicted_future_deterioration"),

            # Trajectory & anomaly
            "trajectory_status": str(row_dict.get("trajectory_status") or ""),
            "anomaly_flag": bool(row_dict.get("anomaly_flag")),
            "anomaly_score": row_dict.get("anomaly_score"),
            "anomaly_category": str(row_dict.get("anomaly_category") or ""),

            # Risk drivers
            "risk_factors": drivers,
            "primary_bottleneck": str(row_dict.get("primary_risk_driver") or "").replace("_", " ").title(),
            "secondary_risk_driver": str(row_dict.get("secondary_risk_driver") or "").replace("_", " ").title(),
            "risk_explanation": str(row_dict.get("risk_explanation") or ""),
            "recommended_action": str(row_dict.get("recommended_action") or ""),

            # Delay forecast from priority_rank
            "priority_rank": row_dict.get("priority_rank"),
            "priority_band": str(row_dict.get("priority_band") or ""),

            # Financial data from SIH2026
            "physical_progress_pct": row_dict.get("physical_progress_pct"),
            "cost_escalation_pct": row_dict.get("cost_escalation_pct"),
            "expenditure_progress_gap": row_dict.get("expenditure_progress_gap"),
            "progress_velocity_3m": row_dict.get("progress_velocity_3m"),

            # Observation data
            "observation_month": str(row_dict.get("observation_month_x") or ""),
            "source_file": str(row_dict.get("source_file") or ""),

            # Risk fusion method (transparency)
            "risk_fusion_method": str(row_dict.get("risk_fusion_method") or ""),
        }

    except Exception as exc:
        logger.warning("Error looking up SIH2026 risk for project %s: %s", project_id, exc)
        return None


def get_all_sih2026_projects(
    sector: Optional[str] = None,
    risk_category: Optional[str] = None,
    limit: int = 200
) -> List[Dict[str, Any]]:
    """
    Returns a list of SIH2026 projects from the priority queue.
    Can be filtered by sector or risk_category.
    Sorted by priority_rank (highest risk first).
    """
    df = _load_priority_df()
    if df is None or (hasattr(df, 'empty') and df.empty):
        return []

    result = df.copy()

    if sector:
        mask = result["sector"].fillna("").str.lower().str.contains(sector.lower(), na=False)
        result = result[mask]

    if risk_category:
        result = result[result["risk_category"].fillna("").str.upper() == risk_category.upper()]

    # Sort by priority_rank
    if "priority_rank" in result.columns:
        result = result.sort_values("priority_rank", ascending=True)

    result = result.head(limit)

    records = []
    for _, row in result.iterrows():
        row_dict = row.where(row.notna(), other=None).to_dict()
        risk_category_val = str(row_dict.get("risk_category") or "").upper()
        risk_level_map = {"CRITICAL": "Critical", "HIGH": "High", "MEDIUM": "Medium", "LOW": "Low", "REVIEW_DATA": "Unknown"}
        final_score = row_dict.get("final_risk_score")

        records.append({
            "id": str(row_dict.get("canonical_project_id") or row_dict.get("project_id") or ""),
            "project_id": row_dict.get("project_id"),
            "name": str(row_dict.get("project_name") or ""),
            "sector": str(row_dict.get("sector") or ""),
            "ministry": str(row_dict.get("line_ministry") or ""),
            "risk_score": int(round(float(final_score))) if final_score is not None else 0,
            "risk_level": risk_level_map.get(risk_category_val, "Unknown"),
            "risk_category": risk_category_val,
            "trajectory_status": str(row_dict.get("trajectory_status") or ""),
            "anomaly_flag": bool(row_dict.get("anomaly_flag")),
            "priority_rank": row_dict.get("priority_rank"),
            "physical_progress_pct": row_dict.get("physical_progress_pct"),
            "future_deterioration_probability": row_dict.get("future_deterioration_probability"),
            "predictive_risk_band": str(row_dict.get("predictive_risk_band") or ""),
            "recommended_action": str(row_dict.get("recommended_action") or ""),
            "observation_month": str(row_dict.get("observation_month_x") or ""),
            "source": "SIH2026_ML_PIPELINE",
        })

    return records


def get_sih2026_service_status() -> Dict[str, Any]:
    """Health/status check for SIH2026 integration."""
    status = {
        "dashboard_json": _DASHBOARD_JSON.exists(),
        "priority_queue_csv": _PRIORITY_QUEUE_CSV.exists(),
        "early_warnings_csv": _EARLY_WARNINGS_CSV.exists(),
        "xgboost_model": _XGBOOST_MODEL.exists(),
        "isolation_forest_model": _ISOLATION_FOREST.exists(),
    }

    df = _load_priority_df()
    if df is not None and not (hasattr(df, 'empty') and df.empty):
        status["priority_queue_rows"] = len(df)

    warnings_df = _load_warnings_df()
    if warnings_df is not None and not (hasattr(warnings_df, 'empty') and warnings_df.empty):
        status["early_warning_rows"] = len(warnings_df)

    dash = _load_dashboard()
    if dash:
        ns = dash.get("national_summary", {})
        status["national_projects"] = ns.get("projects", 0)

    return status


def predict_live_risk(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes real-time live inference on custom/new project metrics
    using the loaded XGBoost and IsolationForest models.
    """
    import pandas as pd
    import numpy as np

    xgb_bundle = _load_xgboost_bundle()
    iso_bundle = _load_isolation_bundle()

    if not xgb_bundle or not iso_bundle:
        raise RuntimeError("ML models not available for live inference")

    # 1. Prepare features for XGBoost
    xgb_features = xgb_bundle["features"]
    xgb_medians = xgb_bundle["train_medians"]
    
    # Derivations if raw numbers are provided
    orig_cost = inputs.get("original_cost_cr")
    rev_cost = inputs.get("revised_cost_cr", inputs.get("cost_cr"))
    exp = inputs.get("cumulative_expenditure_cr", inputs.get("expenditure_cr"))
    prog = inputs.get("physical_progress_pct", inputs.get("progress"))

    feature_dict = {}
    for f in xgb_features:
        if f in inputs and inputs[f] is not None:
            feature_dict[f] = float(inputs[f])
        else:
            feature_dict[f] = float(xgb_medians.get(f, 0.0))

    if "cost_escalation_pct" not in inputs and orig_cost and rev_cost and float(orig_cost) > 0:
        feature_dict["cost_escalation_pct"] = ((float(rev_cost) - float(orig_cost)) / float(orig_cost)) * 100.0

    if "expenditure_ratio_pct" not in inputs and rev_cost and exp and float(rev_cost) > 0:
        feature_dict["expenditure_ratio_pct"] = (float(exp) / float(rev_cost)) * 100.0

    if "expenditure_progress_gap" not in inputs and "expenditure_ratio_pct" in feature_dict and prog is not None:
        feature_dict["expenditure_progress_gap"] = feature_dict["expenditure_ratio_pct"] - float(prog)

    if prog is not None:
        feature_dict["physical_progress_pct"] = float(prog)

    # 2. XGBoost Inference
    X_xgb = pd.DataFrame([feature_dict])[xgb_features]
    prob = float(xgb_bundle["model"].predict_proba(X_xgb)[0, 1])
    is_deteriorating = int(prob >= 0.5)

    if prob >= 0.70:
        band = "HIGH_PREDICTIVE_SIGNAL"
    elif prob >= 0.50:
        band = "ELEVATED"
    elif prob >= 0.30:
        band = "WATCH"
    else:
        band = "LOW_PREDICTIVE_SIGNAL"

    # 3. Isolation Forest Inference
    iso_features = iso_bundle["features"]
    iso_medians = iso_bundle["medians"]
    iso_dict = {f: feature_dict.get(f, float(iso_medians.get(f, 0.0))) for f in iso_features}
    X_iso = pd.DataFrame([iso_dict])[iso_features]

    raw_score = float(-iso_bundle["model"].decision_function(X_iso)[0])
    is_anomaly = bool(iso_bundle["model"].predict(X_iso)[0] == -1)
    anomaly_category = "HIGHLY_UNUSUAL" if raw_score > 0.1 else ("UNUSUAL" if is_anomaly else "NORMAL")

    # 4. Synthesize Composite Risk Assessment
    cost_esc = feature_dict.get("cost_escalation_pct", 0.0)
    gap = feature_dict.get("expenditure_progress_gap", 0.0)
    
    # Calculate approximate domain score (0-100)
    cost_risk = min(max(cost_esc, 0), 100)
    gap_risk = min(max(gap * 2, 0), 100)
    base_risk = (cost_risk * 0.4 + gap_risk * 0.4 + (100 - (prog or 50)) * 0.2)
    
    fused_score = round(base_risk * 0.7 + (prob * 100) * 0.2 + (50 if is_anomaly else 10) * 0.1, 2)
    risk_level = "Critical" if fused_score >= 80 else ("High" if fused_score >= 65 else ("Medium" if fused_score >= 40 else "Low"))

    drivers = []
    if cost_esc > 50:
        drivers.append("High Cost Escalation")
    if gap > 20:
        drivers.append("High Expenditure Progress Gap")
    if is_anomaly:
        drivers.append("Anomalous Portfolio Pattern")
    if prob >= 0.5:
        drivers.append("High Deterioration Probability")

    return {
        "status": "success",
        "live_inference": True,
        "fused_risk_score": fused_score,
        "risk_level": risk_level,
        "xgboost_prediction": {
            "future_deterioration_probability": round(prob, 4),
            "predicted_future_deterioration": is_deteriorating,
            "predictive_risk_band": band,
        },
        "isolation_forest_prediction": {
            "anomaly_flag": is_anomaly,
            "anomaly_score": round(raw_score, 4),
            "anomaly_category": anomaly_category,
        },
        "features_evaluated": feature_dict,
        "primary_risk_drivers": drivers or ["Normal Operational Parameters"]
    }

