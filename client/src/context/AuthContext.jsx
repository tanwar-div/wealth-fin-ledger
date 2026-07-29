import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fhb_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem('fhb_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('fhb_token', res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    localStorage.setItem('fhb_token', res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the API call fails, clear local state so the user can log out.
    }
    localStorage.removeItem('fhb_token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.user);
    return res.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
