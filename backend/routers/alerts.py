from fastapi import APIRouter, HTTPException, status
from typing import List
from schemas.alert import EarlyWarningResponse, AlertCreate, AlertUpdate
from services.alert_service import (
    get_all_alerts,
    get_alert_by_id,
    create_alert,
    update_alert,
    mark_alert_as_read,
    delete_alert
)

router = APIRouter(prefix="/api/alerts", tags=["Early Warnings"])

@router.get("", response_model=List[EarlyWarningResponse])
def list_alerts():
    """
    Returns list of early warning alerts.
    """
    return get_all_alerts()

@router.get("/{alert_id}", response_model=EarlyWarningResponse)
def get_alert(alert_id: str):
    """
    Returns details of a specific early warning alert.
    """
    alert = get_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found."
        )
    return alert

@router.post("", response_model=EarlyWarningResponse, status_code=status.HTTP_201_CREATED)
def add_alert(payload: AlertCreate):
    """
    Creates a new early warning alert.
    """
    return create_alert(payload.dict())

@router.put("/{alert_id}", response_model=EarlyWarningResponse)
def edit_alert(alert_id: str, payload: AlertUpdate):
    """
    Updates an early warning alert.
    """
    updated = update_alert(alert_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found."
        )
    return updated

@router.put("/{alert_id}/read", response_model=EarlyWarningResponse)
def mark_read(alert_id: str):
    """
    Marks an early warning alert as read.
    """
    updated = mark_alert_as_read(alert_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found."
        )
    return updated

@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_alert(alert_id: str):
    """
    Deletes an alert.
    """
    success = delete_alert(alert_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found."
        )
    return None
