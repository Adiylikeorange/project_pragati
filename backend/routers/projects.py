from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from services.project_service import (
    get_all_projects,
    search_projects,
    get_project_by_id,
    create_project,
    update_project,
    delete_project
)

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(sector: Optional[str] = None, status: Optional[str] = None):
    """
    Returns a list of all monitored infrastructure projects.
    """
    if sector or status:
        return search_projects(sector=sector, status=status)
    return get_all_projects()

@router.get("/search", response_model=List[ProjectResponse])
def search_projects_endpoint(
    sector: Optional[str] = Query(None, description="Filter by project sector"),
    status: Optional[str] = Query(None, description="Filter by status (e.g. On Track, Delayed, At Risk)"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (Low, Medium, High, Critical)"),
    location: Optional[str] = Query(None, description="Filter by location/state"),
    search: Optional[str] = Query(None, description="Free text search on name or description")
):
    """
    Search and filter projects using sector, status, risk_level, location, or keyword search.
    """
    return search_projects(
        sector=sector,
        status=status,
        risk_level=risk_level,
        location=location,
        search=search
    )

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str):
    """
    Returns complete details of a specific project by ID.
    """
    project = get_project_by_id(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return project

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def add_project(payload: ProjectCreate):
    """
    Creates a new project.
    """
    return create_project(payload.dict())

@router.put("/{project_id}", response_model=ProjectResponse)
def edit_project(project_id: str, payload: ProjectUpdate):
    """
    Updates an existing project.
    """
    updated = update_project(project_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return updated

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(project_id: str):
    """
    Deletes a project by ID.
    """
    success = delete_project(project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found."
        )
    return None
