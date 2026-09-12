"""
Authentication service for PRAGATI.
Handles password hashing, JWT tokens, current user dependency.
"""

import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import get_settings
from database import get_db
from models.db_models import User, RefreshToken

settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token extractor
bearer_scheme = HTTPBearer(auto_error=False)


# ── Password Hashing ─────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Hash a plaintext password using bcrypt. Truncates to 72 bytes (bcrypt limit)."""
    # bcrypt only uses first 72 bytes; truncate explicitly for passlib 1.7.4 + bcrypt 4+
    truncated = plain.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.hash(truncated)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    truncated = plain.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.verify(truncated, hashed)


# ── JWT Token Creation ────────────────────────────────────────────────────────

def create_access_token(user_id: str, email: str) -> str:
    """Create a short-lived JWT access token."""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token_str() -> str:
    """Create a cryptographically secure refresh token string."""
    return secrets.token_urlsafe(64)


def hash_token(token: str) -> str:
    """Hash a token string with SHA-256 for safe DB storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token. Returns payload or None."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


# ── Password Reset Tokens ─────────────────────────────────────────────────────

def create_password_reset_token() -> Tuple[str, str]:
    """
    Generate a secure password reset token.
    Returns (raw_token, hashed_token).
    raw_token is sent to the user via email.
    hashed_token is stored in the database.
    """
    raw = secrets.token_urlsafe(48)
    hashed = hash_token(raw)
    return raw, hashed


# ── FastAPI Auth Dependency ───────────────────────────────────────────────────

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency: extracts and validates JWT, returns current User.
    Raises 401 if token is missing or invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Please log in.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if user is None:
        raise credentials_exception

    return user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Like get_current_user but returns None instead of raising 401.
    Useful for endpoints that work both authenticated and unauthenticated.
    """
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()


# ── Refresh Token DB Operations ───────────────────────────────────────────────

def save_refresh_token(db: Session, user_id: str, raw_token: str) -> RefreshToken:
    """Store a hashed refresh token in the database."""
    token = RefreshToken(
        user_id=user_id,
        token_hash=hash_token(raw_token),
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def revoke_refresh_token(db: Session, raw_token: str) -> bool:
    """Revoke a refresh token. Returns True if found and revoked."""
    token_hash = hash_token(raw_token)
    token = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked_at.is_(None)
    ).first()
    if not token:
        return False
    token.revoked_at = datetime.utcnow()
    db.commit()
    return True


def validate_and_rotate_refresh_token(
    db: Session, raw_token: str
) -> Tuple[Optional[User], Optional[str]]:
    """
    Validate a refresh token, revoke it, and return (user, new_raw_token).
    Returns (None, None) if invalid.
    """
    token_hash = hash_token(raw_token)
    stored = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash
    ).first()

    if not stored or not stored.is_valid:
        return None, None

    user = db.query(User).filter(User.id == stored.user_id, User.is_active == True).first()
    if not user:
        return None, None

    # Revoke old token
    stored.revoked_at = datetime.utcnow()
    db.commit()

    # Create new refresh token
    new_raw = create_refresh_token_str()
    save_refresh_token(db, user.id, new_raw)

    return user, new_raw


def revoke_all_user_refresh_tokens(db: Session, user_id: str) -> int:
    """Revoke all active refresh tokens for a user (e.g., on password change)."""
    now = datetime.utcnow()
    tokens = db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked_at.is_(None)
    ).all()
    for t in tokens:
        t.revoked_at = now
    db.commit()
    return len(tokens)
