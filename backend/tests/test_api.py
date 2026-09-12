"""
API Test Suite for Pragati Backend.
Verifies all routes return expected status codes and valid JSON payloads.
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Pragati backend is running" in data["message"]

def test_list_projects():
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert isinstance(projects, list)
    assert len(projects) >= 8

def test_search_projects():
    response = client.get("/api/projects/search?sector=Transportation")
    assert response.status_code == 200
    results = response.json()
    assert all(p["sector"] == "Transportation" for p in results)

def test_get_project_by_id():
    response = client.get("/api/projects/PRG-001")
    assert response.status_code == 200
    project = response.json()
    assert project["id"] == "PRG-001"
    assert "name" in project

def test_get_project_not_found():
    response = client.get("/api/projects/PRG-99999")
    assert response.status_code == 404

def test_project_risk_prediction():
    response = client.get("/api/projects/PRG-002/risk")
    assert response.status_code == 200
    risk = response.json()
    assert risk["project_id"] == "PRG-002"
    assert "risk_score" in risk
    assert "risk_level" in risk
    assert "risk_factors" in risk

def test_high_risk_projects():
    response = client.get("/api/risks/high-risk")
    assert response.status_code == 200
    high_risk = response.json()
    assert all(p["risk_level"] in ["High", "Critical"] or p["riskLevel"] in ["High", "Critical"] for p in high_risk)

def test_risk_summary():
    response = client.get("/api/risks/summary")
    assert response.status_code == 200
    summary = response.json()
    assert "total_projects" in summary
    assert "high_risk" in summary
    assert "critical_risk" in summary

def test_list_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)
    assert len(alerts) > 0

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_projects" in data
    assert "projects_on_track" in data
    assert "projects_delayed" in data
    assert "high_risk_projects" in data
    assert "critical_projects" in data

def test_dashboard_distributions():
    res_risk = client.get("/api/dashboard/risk-distribution")
    assert res_risk.status_code == 200
    
    res_sector = client.get("/api/dashboard/projects-by-sector")
    assert res_sector.status_code == 200
    
    res_status = client.get("/api/dashboard/status-distribution")
    assert res_status.status_code == 200
