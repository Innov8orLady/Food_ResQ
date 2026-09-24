import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('foodresq_token');
      const savedUser = localStorage.getItem('foodresq_user');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('foodresq_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('foodresq_token', res.data.token);
      localStorage.setItem('foodresq_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('foodresq_token', res.data.token);
      localStorage.setItem('foodresq_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const quickDemoLogin = async (role) => {
    if (role === 'admin') {
      throw new Error('Quick demo bypass is disabled for Administrator accounts. Please log in with credentials.');
    }
    const res = await api.post('/auth/demo-login', { role });
    if (res.data.success) {
      localStorage.setItem('foodresq_token', res.data.token);
      localStorage.setItem('foodresq_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Demo login failed');
  };

  const adminLogin = async (email, password, securityCode) => {
    const res = await api.post('/auth/admin-login', { email, password, securityCode });
    if (res.data.success) {
      localStorage.setItem('foodresq_token', res.data.token);
      localStorage.setItem('foodresq_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.message || 'Administrator authentication failed');
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('foodresq_user', JSON.stringify(updated));
  };

  const logout = () => {
    localStorage.removeItem('foodresq_token');
    localStorage.removeItem('foodresq_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, quickDemoLogin, adminLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);