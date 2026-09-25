import React, { createContext, useContext, useState } from 'react';
import { apiService } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Always initialize user to null so the Welcome Landing Page is ALWAYS shown on launch!
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiService.login(email, password);
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await apiService.register(userData);
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (targetRole) => {
    setLoading(true);
    try {
      const res = await apiService.quickLogin(targetRole);
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true, user: res.data.user };
    } catch (err) {
      // Offline fallback mock users
      const fallbackUsers = {
        ADMIN: { id: 1, name: 'System Administrator', email: 'admin@water.gov', role: 'ADMIN', department: 'IT & SCADA Operations' },
        MUNICIPALITY_OFFICER: { id: 2, name: 'Ramesh Kumar', email: 'officer@water.gov', role: 'MUNICIPALITY_OFFICER', department: 'Water Supply Board' },
        FIELD_ENGINEER: { id: 3, name: 'Priya Sharma', email: 'engineer@water.gov', role: 'FIELD_ENGINEER', department: 'Distribution Maintenance' },
        CITIZEN: { id: 4, name: 'Ananya Gupta', email: 'citizen@water.gov', role: 'CITIZEN', department: 'Central Zone Resident' }
      };
      const selected = fallbackUsers[targetRole] || fallbackUsers.CITIZEN;
      setUser(selected);
      setToken('demo_token_' + targetRole.toLowerCase());
      return { success: true, user: selected };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch (e) {
        // Ignore
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role: user?.role || null,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      switchRole,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
