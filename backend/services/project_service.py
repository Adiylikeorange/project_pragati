"""
Project Service: Handles project query, search/filtering, and CRUD operations.
"""

from typing import List, Optional, Dict, Any
from data.mock_data import PROJECTS

def get_all_projects() -> List[Dict[str, Any]]:
    return PROJECTS

def search_projects(
    sector: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None
) -> List[Dict[str, Any]]:
    results = PROJECTS
    if sector:
        results = [p for p in results if p.get("sector", "").lower() == sector.lower()]
    if status:
        results = [p for p in results if p.get("status", "").lower() == status.lower()]
    if risk_level:
        results = [p for p in results if p.get("risk_level", "").lower() == risk_level.lower() or p.get("riskLevel", "").lower() == risk_level.lower()]
    if location:
        results = [p for p in results if location.lower() in p.get("location", "").lower() or location.lower() in p.get("state", "").lower()]
    if search:
        query = search.lower()
        results = [
            p for p in results
            if query in p.get("name", "").lower()
            or query in p.get("description", "").lower()
            or query in p.get("sector", "").lower()
            or query in p.get("location", "").lower()
        ]
    return results

def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    for proj in PROJECTS:
        if str(proj.get("id")).lower() == str(project_id).lower():
            return proj
    return None

def create_project(data: Dict[str, Any]) -> Dict[str, Any]:
    new_id = f"PRG-0{len(PROJECTS) + 1:02d}"
    cost = data.get("budget") or data.get("cost") or data.get("sanctionedCost") or 10000.0
    new_project = {
        "id": new_id,
        "name": data["name"],
        "sector": data["sector"],
        "location": data.get("location") or data.get("state") or "India",
        "state": data.get("state") or data.get("location") or "India",
        "description": data.get("description") or f"{data['name']} project",
        "budget": float(cost),
        "cost": float(cost / 10000000.0) if cost > 1000000 else float(cost),
        "progress": float(data.get("progress") or 0.0),
        "status": data.get("status") or "In Progress",
        "start_date": data.get("start_date") or "2025-01-01",
        "expected_end_date": data.get("expected_end_date") or "2027-12-31",
        "expectedCompletion": data.get("expectedCompletion") or "Dec 2027",
        "slippage": None,
        "risk_score": int(data.get("risk_score") or 30),
        "risk_level": data.get("risk_level") or "Low",
        "riskScore": int(data.get("risk_score") or 30),
        "riskLevel": data.get("risk_level") or "Low",
        "executingAgency": data.get("executingAgency") or "N/A",
        "ministry": data.get("ministry") or "N/A",
        "commencement": data.get("commencement") or "Jan 2025",
        "originalTarget": data.get("originalTarget") or "Dec 2027",
        "financialProgress": float(data.get("financialProgress") or 0.0),
        "sanctionedCost": float(cost / 10000000.0) if cost > 1000000 else float(cost),
        "capexReleased": float((cost / 10000000.0) * 0.5) if cost > 1000000 else float(cost * 0.5),
    }
    PROJECTS.insert(0, new_project)
    return new_project

def update_project(project_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    project = get_project_by_id(project_id)
    if not project:
        return None
    for key, value in updates.items():
        if value is not None:
            project[key] = value
            # Sync alternative key names
            if key == "risk_level":
                project["riskLevel"] = value
            elif key == "risk_score":
                project["riskScore"] = value
    return project

def delete_project(project_id: str) -> bool:
    project = get_project_by_id(project_id)
    if project:
        PROJECTS.remove(project)
        return True
    return False
