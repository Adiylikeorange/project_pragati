"""
User profile and watchlist router for PRAGATI.
All endpoints require authentication.
"""

import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import User, UserProfile, UserWatchlist
from services.auth_service import get_current_user, verify_password, hash_password, revoke_all_user_refresh_tokens

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["Users"])


# ── Request Schemas ───────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    notify_critical: Optional[bool] = None
    notify_high: Optional[bool] = None
    notify_medium: Optional[bool] = None
    notify_low: Optional[bool] = None
    default_sector_filter: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters long.")
        return v


class WatchlistAddRequest(BaseModel):
    project_name: Optional[str] = None
    notes: Optional[str] = None


# ── Profile Endpoints ─────────────────────────────────────────────────────────

@router.get("/me/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return the current user's full profile."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "organization": current_user.organization or "",
        "role": current_user.role or "",
        "phone": current_user.phone or "",
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login_at": current_user.last_login_at.isoformat() if current_user.last_login_at else None,
        "profile": {
            "location": profile.location if profile else "",
            "bio": profile.bio if profile else "",
            "avatar_url": profile.avatar_url if profile else None,
            "notify_critical": profile.notify_critical if profile else True,
            "notify_high": profile.notify_high if profile else True,
            "notify_medium": profile.notify_medium if profile else False,
            "notify_low": profile.notify_low if profile else False,
            "default_sector_filter": profile.default_sector_filter if profile else None,
            "dashboard_layout": profile.dashboard_layout if profile else "default",
        }
    }


@router.put("/me/profile")
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's profile and preferences."""
    # Update User fields
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.organization is not None:
        current_user.organization = payload.organization
    if payload.role is not None:
        current_user.role = payload.role
    if payload.phone is not None:
        current_user.phone = payload.phone

    # Update UserProfile fields
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    if payload.location is not None:
        profile.location = payload.location
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.notify_critical is not None:
        profile.notify_critical = payload.notify_critical
    if payload.notify_high is not None:
        profile.notify_high = payload.notify_high
    if payload.notify_medium is not None:
        profile.notify_medium = payload.notify_medium
    if payload.notify_low is not None:
        profile.notify_low = payload.notify_low
    if payload.default_sector_filter is not None:
        profile.default_sector_filter = payload.default_sector_filter

    profile.updated_at = datetime.utcnow()
    current_user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(current_user)
    db.refresh(profile)

    return {"message": "Profile updated successfully."}


@router.put("/me/password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change the current user's password (requires current password)."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password."
        )

    current_user.hashed_password = hash_password(payload.new_password)
    current_user.updated_at = datetime.utcnow()

    # Revoke all refresh tokens to force re-login on all devices
    revoke_all_user_refresh_tokens(db, current_user.id)

    db.commit()
    return {"message": "Password changed successfully. Please log in again."}


@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soft-delete the current user's account (sets is_active=False)."""
    current_user.is_active = False
    current_user.updated_at = datetime.utcnow()
    revoke_all_user_refresh_tokens(db, current_user.id)
    db.commit()
    return {"message": "Account has been deactivated."}


# ── Watchlist Endpoints ───────────────────────────────────────────────────────

@router.get("/me/watchlist")
def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return all projects in the current user's watchlist."""
    items = db.query(UserWatchlist).filter(UserWatchlist.user_id == current_user.id).all()
    return [
        {
            "id": item.id,
            "project_id": item.project_id,
            "project_name": item.project_name or "",
            "notes": item.notes or "",
            "added_at": item.added_at.isoformat() if item.added_at else None,
        }
        for item in items
    ]


@router.post("/me/watchlist/{project_id}", status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    project_id: str,
    payload: WatchlistAddRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a project to the current user's watchlist."""
    # Check if already exists
    existing = db.query(UserWatchlist).filter(
        UserWatchlist.user_id == current_user.id,
        UserWatchlist.project_id == project_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is already in your watchlist."
        )

    item = UserWatchlist(
        user_id=current_user.id,
        project_id=project_id,
        project_name=payload.project_name,
        notes=payload.notes,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "message": f"Project {project_id} added to watchlist.",
        "project_id": project_id,
    }


@router.delete("/me/watchlist/{project_id}", status_code=status.HTTP_200_OK)
def remove_from_watchlist(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a project from the current user's watchlist."""
    item = db.query(UserWatchlist).filter(
        UserWatchlist.user_id == current_user.id,
        UserWatchlist.project_id == project_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found in your watchlist."
        )

    db.delete(item)
    db.commit()
    return {"message": f"Project {project_id} removed from watchlist."}
