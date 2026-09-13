"""
Alert Service: Handles early warning alerts and status updates.
Pulls real project impasse reasons and solutions from the SIH2026 dataset.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

_alerts_cache: Optional[List[Dict[str, Any]]] = None

def _build_dataset_alerts(limit: int = 50) -> List[Dict[str, Any]]:
    backend_root = Path(__file__).resolve().parents[1]
    csv_path = backend_root / "sih2026_outputs" / "pragati_priority_queue.csv"
    
    if not csv_path.exists():
        logger.warning("pragati_priority_queue.csv not found, using fallback alerts")
        from data.mock_data import ALERTS
        return ALERTS

    try:
        import pandas as pd
        df = pd.read_csv(csv_path, low_memory=False)
        # Filter for valid project names and critical/high risk categories
        valid_mask = (
            df["project_name"].notna() & 
            (df["project_name"].astype(str).str.strip() != "") & 
            (df["project_name"].astype(str).str.lower() != "nan") &
            df["risk_category"].isin(["CRITICAL", "HIGH"])
        )
        subset = df[valid_mask].sort_values(
            by="final_risk_score", ascending=False
        ).head(limit)
        
        alerts = []
        for _, r in subset.iterrows():
            pid = str(r["project_id"])
            score = int(round(float(r.get("final_risk_score") or 85)))
            sev = "Critical" if str(r.get("risk_category")).upper() == "CRITICAL" else "High"
            
            det_prob = r.get("future_deterioration_probability")
            if pd.notna(det_prob) and float(det_prob) > 0:
                prob = int(round(float(det_prob) * 100))
            else:
                prob = max(60, min(95, score - 10))
                
            parts = []
            gap = r.get("expenditure_progress_gap_pct")
            esc = r.get("cost_escalation_pct")
            vel = r.get("progress_velocity_3m")
            status = r.get("trajectory_status")
            drivers = [str(r.get(f"risk_driver_{i}") or "") for i in range(1, 4)]
            drivers = [d for d in drivers if d and d != "nan"]
            
            if "HIGH_EXPENDITURE_PROGRESS_GAP" in drivers and pd.notna(gap) and gap > 0:
                parts.append(f"Outlay is +{gap:.1f}% ahead of physical completion")
            if "HIGH_COST_ESCALATION" in drivers and pd.notna(esc) and esc > 0:
                parts.append(f"Sanctioned cost has escalated by +{esc:.1f}%")
            if "PROGRESS_STAGNATION" in drivers:
                parts.append("Physical milestone progress stagnating (0.0% velocity over recent cycles)")
            elif "PROGRESS_DETERIORATION" in drivers and pd.notna(vel):
                parts.append(f"Completion velocity is declining ({vel:.1f}%/month)")
            elif status == "DETERIORATING":
                parts.append("Physical trajectory status is deteriorating")
                
            if not parts:
                exp = r.get("risk_explanation")
                if exp and str(exp) != "nan":
                    parts.append(str(exp))
                else:
                    parts.append("Multi-dimensional schedule and expenditure slippage detected")
            reason = "; ".join(parts) + "."
            
            action = str(r.get("recommended_action") or "").strip()
            ministry = str(r.get("line_ministry") or "").strip()
            if not action or action == "nan":
                action = "Prioritise milestone-level review and identify implementation bottlenecks."
            if ministry and ministry != "nan":
                solution = f"{action} Convene resolution summit with {ministry}."
            else:
                solution = f"{action} Expedite inter-ministerial taskforce intervention."
                
            alert = {
                "id": f"EW-{pid}",
                "project_id": pid,
                "projectId": pid,
                "project_name": str(r["project_name"]),
                "projectName": str(r["project_name"]),
                "sector": str(r.get("sector") or "Infrastructure"),
                "state": str(r.get("line_ministry") or "National Pipeline"),
                "severity": sev,
                "riskScore": score,
                "delayProbability": prob,
                "title": f"Priority Impasse: {str(r['project_name'])[:45]}",
                "message": reason,
                "description": reason,
                "mandatedAction": solution,
                "created_at": "2026-07-01T08:30:00Z",
                "timestamp": "2026-07-01T08:30:00Z",
                "is_read": False
            }
            alerts.append(alert)
        return alerts
    except Exception as e:
        logger.error("Error building dataset alerts: %s", e)
        from data.mock_data import ALERTS
        return ALERTS

def get_all_alerts() -> List[Dict[str, Any]]:
    global _alerts_cache
    if _alerts_cache is None:
        _alerts_cache = _build_dataset_alerts(limit=50)
    return _alerts_cache

def get_alert_by_id(alert_id: str) -> Optional[Dict[str, Any]]:
    alerts = get_all_alerts()
    for alert in alerts:
        if str(alert["id"]).lower() == str(alert_id).lower() or str(alert.get("project_id", "")).lower() == str(alert_id).lower():
            return alert
    return None

def create_alert(data: Dict[str, Any]) -> Dict[str, Any]:
    new_id = f"EW-0{len(ALERTS) + 1:02d}"
    project_id = data.get("project_id") or data.get("projectId") or "PRG-001"
    project_name = data.get("project_name") or data.get("projectName") or "Infrastructure Project"
    
    new_alert = {
        "id": new_id,
        "project_id": project_id,
        "projectId": project_id,
        "project_name": project_name,
        "projectName": project_name,
        "sector": data.get("sector", "Infrastructure"),
        "state": data.get("state", "National"),
        "severity": data["severity"],
        "title": data.get("title") or f"{data['severity']} Alert on {project_name}",
        "message": data.get("message") or data.get("description") or "Immediate action required.",
        "description": data.get("description") or data.get("message") or "Immediate action required.",
        "mandatedAction": data.get("mandatedAction") or "Review and intervene.",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "is_read": False
    }
    ALERTS.insert(0, new_alert)
    return new_alert

def update_alert(alert_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    alert = get_alert_by_id(alert_id)
    if not alert:
        return None
    for key, value in updates.items():
        if value is not None:
            alert[key] = value
    return alert

def mark_alert_as_read(alert_id: str) -> Optional[Dict[str, Any]]:
    alert = get_alert_by_id(alert_id)
    if not alert:
        return None
    alert["is_read"] = True
    return alert

def delete_alert(alert_id: str) -> bool:
    alert = get_alert_by_id(alert_id)
    if alert:
        ALERTS.remove(alert)
        return True
    return False
