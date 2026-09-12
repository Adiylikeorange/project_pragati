"""
Authentication router for PRAGATI.
Endpoints: register, login, logout, refresh, forgot-password, reset-password, /me
"""

import logging
import re
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from config import get_settings
from database import get_db
from models.db_models import User, UserProfile, PasswordResetToken
from services.auth_service import (
    hash_password, verify_password,
    create_access_token, create_refresh_token_str,
    create_password_reset_token, hash_token,
    save_refresh_token, revoke_refresh_token,
    validate_and_rotate_refresh_token,
    revoke_all_user_refresh_tokens,
    get_current_user,
)
from services.email_service import send_reset_email

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ── Request / Response Schemas ────────────────────────────────────────────────

_EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_email(v: str) -> str:
    if not _EMAIL_REGEX.match(v):
        raise ValueError("Invalid email address format.")
    return v.lower().strip()


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    organization: str = ""
    role: str = ""

    @field_validator("email")
    @classmethod
    def email_format(cls, v):
        return _validate_email(v)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Full name cannot be empty.")
        return v.strip()


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_format(cls, v):
        return _validate_email(v)


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def email_format(cls, v):
        return _validate_email(v)


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class UserMeResponse(BaseModel):
    id: str
    email: str
    full_name: str
    organization: str = ""
    role: str = ""
    phone: str = ""
    is_active: bool
    created_at: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "organization": user.organization or "",
        "role": user.role or "",
        "phone": user.phone or "",
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new PRAGATI account."""
    # Check for existing email (timing-safe: same error message either way)
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        organization=payload.organization or None,
        role=payload.role or None,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.flush()  # get user.id before commit

    # Create empty profile
    profile = UserProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)

    logger.info("New user registered: %s", user.email)

    # Issue tokens immediately (auto-login after registration)
    access_token = create_access_token(user.id, user.email)
    raw_refresh = create_refresh_token_str()
    save_refresh_token(db, user.id, raw_refresh)

    return {
        "access_token": access_token,
        "refresh_token": raw_refresh,
        "token_type": "bearer",
        "user": _user_to_dict(user),
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password. Returns access + refresh tokens."""
    # Use a generic error to prevent user enumeration
    invalid_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password."
    )

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise invalid_error

    if not verify_password(payload.password, user.hashed_password):
        logger.warning("Failed login attempt for email: %s", payload.email)
        raise invalid_error

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated."
        )

    # Update last login
    user.last_login_at = datetime.utcnow()
    db.commit()

    access_token = create_access_token(user.id, user.email)
    raw_refresh = create_refresh_token_str()
    save_refresh_token(db, user.id, raw_refresh)

    logger.info("User logged in: %s", user.email)
    return {
        "access_token": access_token,
        "refresh_token": raw_refresh,
        "token_type": "bearer",
        "user": _user_to_dict(user),
    }


@router.post("/logout")
def logout(payload: RefreshRequest, db: Session = Depends(get_db)):
    """Logout: revoke the refresh token."""
    revoke_refresh_token(db, payload.refresh_token)
    return {"message": "Logged out successfully."}


@router.post("/refresh")
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    """Rotate refresh token and issue new access token."""
    user, new_raw_refresh = validate_and_rotate_refresh_token(db, payload.refresh_token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token. Please log in again."
        )

    access_token = create_access_token(user.id, user.email)
    return {
        "access_token": access_token,
        "refresh_token": new_raw_refresh,
        "token_type": "bearer",
        "user": _user_to_dict(user),
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's info."""
    return _user_to_dict(current_user)


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request a password reset link.
    Always returns 200 (prevents user enumeration — never reveal if email exists).
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if user and user.is_active:
        raw_token, token_hash = create_password_reset_token()
        expires = datetime.utcnow() + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires,
        )
        db.add(reset_token)
        db.commit()

        await send_reset_email(user.email, user.full_name, raw_token)

    return {
        "message": "If an account with that email exists, a password reset link has been sent."
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using a valid reset token."""
    token_hash = hash_token(payload.token)

    stored = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used_at.is_(None)
    ).first()

    if not stored or stored.is_expired or stored.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired. Please request a new one."
        )

    user = db.query(User).filter(User.id == stored.user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset request.")

    # Update password
    user.hashed_password = hash_password(payload.new_password)
    user.updated_at = datetime.utcnow()

    # Mark token as used
    stored.used_at = datetime.utcnow()

    # Revoke all refresh tokens (force re-login on all devices)
    revoke_all_user_refresh_tokens(db, user.id)

    db.commit()
    logger.info("Password reset completed for user: %s", user.email)

    return {"message": "Password has been reset successfully. Please log in with your new password."}
