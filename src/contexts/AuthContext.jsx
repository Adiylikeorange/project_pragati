import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import { API_BASE_URL as API_BASE } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getStoredRefreshToken = () => localStorage.getItem('pragati_refresh_token');
  const storeRefreshToken = (token) => localStorage.setItem('pragati_refresh_token', token);
  const clearStoredRefreshToken = () => localStorage.removeItem('pragati_refresh_token');

  const storeAccessToken = (token) => {
    if (token) localStorage.setItem('pragati_access_token', token);
    else localStorage.removeItem('pragati_access_token');
  };

  const scheduleTokenRefresh = useCallback((expiresInMs) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    // Refresh 2 minutes before expiry
    const refreshIn = Math.max(expiresInMs - 2 * 60 * 1000, 10000);
    refreshTimerRef.current = setTimeout(() => {
      refreshAccessToken();
    }, refreshIn);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Token Refresh ─────────────────────────────────────────────────────────

  const refreshAccessToken = useCallback(async () => {
    const savedDemo = localStorage.getItem('pragati_demo_user');
    if (savedDemo) {
      try {
        const demoObj = JSON.parse(savedDemo);
        setUser(demoObj);
        const tok = localStorage.getItem('pragati_access_token') || 'demo-access-token';
        setAccessToken(tok);
        setLoading(false);
        return tok;
      } catch (e) {
        localStorage.removeItem('pragati_demo_user');
      }
    }

    const rt = getStoredRefreshToken();
    if (!rt) {
      setUser(null);
      setAccessToken(null);
      setLoading(false);
      return null;
    }
    try {
      const resp = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!resp.ok) {
        clearStoredRefreshToken();
        setUser(null);
        setAccessToken(null);
        setLoading(false);
        return null;
      }
      const data = await resp.json();
      setAccessToken(data.access_token);
      storeAccessToken(data.access_token);
      storeRefreshToken(data.refresh_token);
      setUser(data.user);
      // Schedule next refresh (access token expires in 30 min = 1800000ms)
      scheduleTokenRefresh(1800000);
      setLoading(false);
      return data.access_token;
    } catch {
      clearStoredRefreshToken();
      storeAccessToken(null);
      setUser(null);
      setAccessToken(null);
      setLoading(false);
      return null;
    }
  }, [scheduleTokenRefresh]);

  // ── Bootstrap: check if user is already logged in ─────────────────────────

  useEffect(() => {
    refreshAccessToken();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth API ──────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    const resp = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail || 'Login failed.');
    setAccessToken(data.access_token);
    storeAccessToken(data.access_token);
    storeRefreshToken(data.refresh_token);
    setUser(data.user);
    scheduleTokenRefresh(1800000);
    return data.user;
  };

  const register = async (payload) => {
    const resp = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail || 'Registration failed.');
    setAccessToken(data.access_token);
    storeAccessToken(data.access_token);
    storeRefreshToken(data.refresh_token);
    setUser(data.user);
    scheduleTokenRefresh(1800000);
    return data.user;
  };

  const loginDemo = async () => {
    setLoading(true);
    try {
      // First attempt genuine backend login
      const res = await login('demo@pragati.gov.in', 'Pragati@2026');
      setLoading(false);
      return res;
    } catch (err) {
      console.warn('Backend login fallback to instant offline demo session:', err);
      const demoUser = {
        id: 'demo-officer-pmo',
        email: 'demo@pragati.gov.in',
        full_name: 'Demo Officer (PMO)',
        organization: 'Cabinet Secretariat',
        role: 'PMO Officer',
        phone: '+91 98765 43210',
        is_active: true,
        is_verified: true,
      };
      setUser(demoUser);
      setAccessToken('demo-instant-access-token');
      storeAccessToken('demo-instant-access-token');
      localStorage.setItem('pragati_demo_user', JSON.stringify(demoUser));
      setLoading(false);
      return demoUser;
    }
  };

  const logout = async () => {
    const rt = getStoredRefreshToken();
    if (rt) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: rt }),
        });
      } catch { /* best-effort logout */ }
    }
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    clearStoredRefreshToken();
    localStorage.removeItem('pragati_demo_user');
    storeAccessToken(null);
    setAccessToken(null);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    const resp = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail || 'Request failed.');
    return data.message;
  };

  const resetPassword = async (token, newPassword) => {
    const resp = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.detail || 'Reset failed.');
    return data.message;
  };

  // ── Authenticated fetch helper ────────────────────────────────────────────

  const authFetch = useCallback(async (url, options = {}) => {
    let token = accessToken;
    if (!token) token = await refreshAccessToken();
    if (!token) throw new Error('Not authenticated');

    const resp = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (resp.status === 401) {
      // Token may have expired — try one refresh
      token = await refreshAccessToken();
      if (!token) throw new Error('Session expired. Please log in again.');
      const retry = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
      return retry;
    }
    return resp;
  }, [accessToken, refreshAccessToken]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      loading,
      isAuthenticated: !!user,
      login,
      loginDemo,
      register,
      logout,
      forgotPassword,
      resetPassword,
      authFetch,
      refreshAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
