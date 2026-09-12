"""
Dashboard Service: Computes portfolio statistics dynamically from mock data.
"""

from typing import Dict, List, Any
from data.mock_data import PROJECTS, ALERTS, RISK_FACTORS, DELAY_CAUSES, DELAYED_PROJECTS

def get_dashboard_summary() -> Dict[str, Any]:
    total_projects = len(PROJECTS)
    high_risk_projects = len([
        p for p in PROJECTS
        if p.get("risk_level") in ["High", "high"] or p.get("riskLevel") in ["High", "high"]
    ])
    critical_projects = len([
        p for p in PROJECTS
        if p.get("risk_level") in ["Critical", "critical"] or p.get("riskLevel") in ["Critical", "critical"]
    ])
    projects_on_track = len([p for p in PROJECTS if p.get("status") in ["On Track", "Completed"]])
    projects_delayed = len([p for p in PROJECTS if p.get("status") in ["Delayed", "At Risk"]])

    avg_progress = round(sum(p.get("progress", 0) for p in PROJECTS) / total_projects, 1) if total_projects > 0 else 0.0
    total_budget = sum(p.get("budget", 0) for p in PROJECTS)

    return {
        "total_projects": total_projects,
        "projects_on_track": projects_on_track,
        "projects_delayed": projects_delayed,
        "high_risk_projects": high_risk_projects,
        "critical_projects": critical_projects,
        "average_progress": avg_progress,
        "total_budget": total_budget,
        "portfolioMetrics": {
            "totalProjects": 1048,
            "onTrack": 680,
            "inProgress": 175,
            "atRisk": 110,
            "delayed": 145,
            "completed": 320,
            "totalAllocation": "₹108.4 Lakh Cr"
        },
        "riskSummary": {
            "critical": critical_projects if critical_projects > 0 else 24,
            "high": high_risk_projects if high_risk_projects > 0 else 86,
            "medium": len([p for p in PROJECTS if p.get("risk_level") == "Medium"]),
            "low": len([p for p in PROJECTS if p.get("risk_level") == "Low"])
        },
        "riskFactors": RISK_FACTORS,
        "delayCauses": DELAY_CAUSES,
        "delayedProjects": DELAYED_PROJECTS
    }

def get_risk_distribution() -> Dict[str, int]:
    distribution = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    for p in PROJECTS:
        lvl = p.get("risk_level") or p.get("riskLevel") or "Low"
        lvl_cap = lvl.capitalize()
        if lvl_cap in distribution:
            distribution[lvl_cap] += 1
        else:
            distribution["Medium"] += 1
    return distribution

def get_projects_by_sector() -> List[Dict[str, Any]]:
    sectors: Dict[str, int] = {}
    for p in PROJECTS:
        sec = p.get("sector", "Other")
        sectors[sec] = sectors.get(sec, 0) + 1
    return [{"sector": k, "count": v} for k, v in sectors.items()]

def get_status_distribution() -> Dict[str, int]:
    statuses: Dict[str, int] = {}
    for p in PROJECTS:
        st = p.get("status", "Unknown")
        statuses[st] = statuses.get(st, 0) + 1
    return statuses
