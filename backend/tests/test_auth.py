"""
Auth & User API Test Suite for PRAGATI.
Tests the complete authentication flow: register, login, refresh, profile, watchlist, password reset.
Uses an in-memory SQLite database so no external DB is required.
"""

import os
import pytest
from fastapi.testclient import TestClient

# Use SQLite in-memory for testing — MUST be set before importing main
os.environ["DATABASE_URL"] = "sqlite:///./test_pragati.db"
os.environ["JWT_SECRET"] = "test-jwt-secret-32charslongexact"
os.environ["SECRET_KEY"] = "test-secret-key-32charslongexact"

from main import app
from database import create_tables

# Create tables once before tests run
create_tables()

client = TestClient(app)

# ── Fixtures ──────────────────────────────────────────────────────────────────

TEST_USER = {
    "email": "auth_test@pragati.test",
    "password": "TestPass2026!",
    "full_name": "Pragati Tester",
    "organization": "Test Ministry",
    "role": "Analyst",
}


def _register_and_login():
    """Helper: register (or skip if exists) + login, return tokens + user."""
    reg = client.post("/api/auth/register", json=TEST_USER)
    # If already registered from a previous test run, that's fine
    if reg.status_code not in (201, 400):
        reg.raise_for_status()

    login = client.post("/api/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
    })
    assert login.status_code == 200, login.text
    return login.json()


# ── Register Tests ────────────────────────────────────────────────────────────

class TestRegister:
    def test_register_success(self):
        """New user can register."""
        import uuid
        unique_email = f"user_{uuid.uuid4().hex[:8]}@pragati.test"
        resp = client.post("/api/auth/register", json={
            "email": unique_email,
            "password": "ValidPass123!",
            "full_name": "New User",
        })
        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == unique_email

    def test_register_duplicate_email(self):
        """Registering with an existing email returns 400."""
        import uuid
        dup_email = f"dup_{uuid.uuid4().hex[:8]}@pragati.test"
        payload = {
            "email": dup_email,
            "password": "ValidPass123!",
            "full_name": "Dup User",
        }
        client.post("/api/auth/register", json=payload)  # first reg
        resp = client.post("/api/auth/register", json=payload)  # duplicate
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"]

    def test_register_short_password(self):
        """Password shorter than 8 chars is rejected."""
        resp = client.post("/api/auth/register", json={
            "email": "shortpass@pragati.test",
            "password": "short",
            "full_name": "Short Pass",
        })
        assert resp.status_code == 422

    def test_register_invalid_email(self):
        """Invalid email format is rejected."""
        resp = client.post("/api/auth/register", json={
            "email": "not-an-email",
            "password": "ValidPass123!",
            "full_name": "Bad Email",
        })
        assert resp.status_code == 422

    def test_register_missing_name(self):
        """Empty full_name is rejected."""
        resp = client.post("/api/auth/register", json={
            "email": "noname@pragati.test",
            "password": "ValidPass123!",
            "full_name": "   ",
        })
        assert resp.status_code == 422


# ── Login Tests ───────────────────────────────────────────────────────────────

class TestLogin:
    def setup_method(self):
        """Ensure test user exists."""
        client.post("/api/auth/register", json=TEST_USER)

    def test_login_success(self):
        """Valid credentials return tokens."""
        resp = client.post("/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == TEST_USER["email"]

    def test_login_wrong_password(self):
        """Wrong password returns 401 (generic message)."""
        resp = client.post("/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": "WrongPassword!",
        })
        assert resp.status_code == 401
        assert "Invalid" in resp.json()["detail"]

    def test_login_unknown_email(self):
        """Unknown email returns 401 (same generic message — no user enumeration)."""
        resp = client.post("/api/auth/login", json={
            "email": "nobody@pragati.test",
            "password": "SomePass123!",
        })
        assert resp.status_code == 401

    def test_login_missing_fields(self):
        """Missing fields return 422."""
        resp = client.post("/api/auth/login", json={"email": TEST_USER["email"]})
        assert resp.status_code == 422


# ── Token & Refresh Tests ─────────────────────────────────────────────────────

class TestTokens:
    def setup_method(self):
        tokens = _register_and_login()
        self.access_token = tokens["access_token"]
        self.refresh_token = tokens["refresh_token"]

    def test_get_me_with_valid_token(self):
        """Authenticated /me returns user data."""
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        assert resp.status_code == 200
        assert resp.json()["email"] == TEST_USER["email"]

    def test_get_me_without_token(self):
        """Unauthenticated /me returns 401."""
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_get_me_invalid_token(self):
        """Tampered token returns 401."""
        resp = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer thisisnotavalidtoken"}
        )
        assert resp.status_code == 401

    def test_refresh_token(self):
        """Valid refresh token issues new token pair."""
        resp = client.post("/api/auth/refresh", json={"refresh_token": self.refresh_token})
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        # New tokens should be different
        assert data["refresh_token"] != self.refresh_token

    def test_refresh_token_rotation(self):
        """Old refresh token cannot be used after rotation."""
        resp1 = client.post("/api/auth/refresh", json={"refresh_token": self.refresh_token})
        assert resp1.status_code == 200

        # Try the old token again — should fail
        resp2 = client.post("/api/auth/refresh", json={"refresh_token": self.refresh_token})
        assert resp2.status_code == 401

    def test_logout(self):
        """Logout invalidates refresh token."""
        resp = client.post("/api/auth/logout", json={"refresh_token": self.refresh_token})
        assert resp.status_code == 200

        # After logout, refresh should fail
        resp2 = client.post("/api/auth/refresh", json={"refresh_token": self.refresh_token})
        assert resp2.status_code == 401


# ── Profile Tests ─────────────────────────────────────────────────────────────

class TestProfile:
    def setup_method(self):
        tokens = _register_and_login()
        self.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    def test_get_profile(self):
        """Authenticated user can get their profile."""
        resp = client.get("/api/users/me/profile", headers=self.headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == TEST_USER["email"]
        assert "profile" in data

    def test_update_profile(self):
        """User can update profile fields."""
        resp = client.put("/api/users/me/profile", headers=self.headers, json={
            "full_name": "Updated Name",
            "organization": "Updated Org",
            "location": "New Delhi",
            "notify_critical": True,
            "notify_medium": True,
        })
        assert resp.status_code == 200

        # Verify changes persisted
        profile_resp = client.get("/api/users/me/profile", headers=self.headers)
        data = profile_resp.json()
        assert data["full_name"] == "Updated Name"
        assert data["profile"]["location"] == "New Delhi"
        assert data["profile"]["notify_medium"] is True

    def test_profile_requires_auth(self):
        """Profile endpoint requires authentication."""
        resp = client.get("/api/users/me/profile")
        assert resp.status_code == 401


# ── Watchlist Tests ───────────────────────────────────────────────────────────

class TestWatchlist:
    def setup_method(self):
        tokens = _register_and_login()
        self.headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    def test_add_to_watchlist(self):
        """User can add a project to watchlist."""
        resp = client.post(
            "/api/users/me/watchlist/PRG-001",
            headers=self.headers,
            json={"project_name": "Delhi-Mumbai Expressway", "notes": "High priority"},
        )
        assert resp.status_code in (201, 400)  # 400 if already added in previous test

    def test_get_watchlist(self):
        """User can get their watchlist."""
        # Ensure at least one item exists
        client.post(
            "/api/users/me/watchlist/PRG-TEST-99",
            headers=self.headers,
            json={"project_name": "Test Project"},
        )
        resp = client.get("/api/users/me/watchlist", headers=self.headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_remove_from_watchlist(self):
        """User can remove a project from watchlist."""
        pid = "PRG-REMOVE-TEST"
        # Add first
        client.post(f"/api/users/me/watchlist/{pid}", headers=self.headers, json={})
        # Remove
        resp = client.delete(f"/api/users/me/watchlist/{pid}", headers=self.headers)
        assert resp.status_code == 200

    def test_remove_nonexistent_watchlist_item(self):
        """Removing a non-existent watchlist item returns 404."""
        resp = client.delete("/api/users/me/watchlist/NONEXISTENT-9999", headers=self.headers)
        assert resp.status_code == 404


# ── Forgot Password Tests ─────────────────────────────────────────────────────

class TestPasswordReset:
    def setup_method(self):
        client.post("/api/auth/register", json=TEST_USER)

    def test_forgot_password_always_200(self):
        """Forgot password returns 200 even for unknown emails (prevent enumeration)."""
        resp = client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})
        assert resp.status_code == 200

    def test_forgot_password_known_email(self):
        """Forgot password works for known emails too."""
        resp = client.post("/api/auth/forgot-password", json={"email": TEST_USER["email"]})
        assert resp.status_code == 200
        assert "sent" in resp.json()["message"]

    def test_reset_password_invalid_token(self):
        """Invalid reset token returns 400."""
        resp = client.post("/api/auth/reset-password", json={
            "token": "totallyinvalidtoken",
            "new_password": "NewPassword123!",
        })
        assert resp.status_code == 400
