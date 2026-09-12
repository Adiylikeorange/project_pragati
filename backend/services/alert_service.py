"""
Alert Service: Handles early warning alerts and status updates.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from data.mock_data import ALERTS

def get_all_alerts() -> List[Dict[str, Any]]:
    return ALERTS

def get_alert_by_id(alert_id: str) -> Optional[Dict[str, Any]]:
    for alert in ALERTS:
        if str(alert["id"]).lower() == str(alert_id).lower():
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
