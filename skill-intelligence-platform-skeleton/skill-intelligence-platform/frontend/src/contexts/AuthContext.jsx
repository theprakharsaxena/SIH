import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:8000';

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);   // { id, full_name, email, role_code, is_admin, onboarding_complete, ... }
  const [token, setToken]   = useState(() => localStorage.getItem('sip_token'));
  const [loading, setLoading] = useState(true);

  /* ── Rehydrate user from stored token ── */
  useEffect(() => {
    if (token) {
      fetchMe(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (t) => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser(res.data);
    } catch {
      // Token invalid / expired
      setToken(null);
      setUser(null);
      localStorage.removeItem('sip_token');
    }
  };

  const login = useCallback(async (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const res = await axios.post(`${API_BASE}/auth/login`, form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token, ...userData } = res.data;
    localStorage.setItem('sip_token', access_token);
    setToken(access_token);
    // Fetch full profile
    await fetchMe(access_token);
    return res.data;  // caller needs is_admin to redirect
  }, []);

  const register = useCallback(async (payload) => {
    const res = await axios.post(`${API_BASE}/auth/register`, payload);
    const { access_token } = res.data;
    localStorage.setItem('sip_token', access_token);
    setToken(access_token);
    await fetchMe(access_token);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sip_token');
  }, []);

  const refreshUser = useCallback(() => {
    if (token) fetchMe(token);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
