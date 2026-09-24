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
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      if (res.data.success) {
        localStorage.setItem('foodresq_token', res.data.token);
        localStorage.setItem('foodresq_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
      }
      throw new Error(res.data.message || 'Login failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Invalid email or password');
    }
  };

  const register = async (formData) => {
    try {
      const sanitized = {
        ...formData,
        email: (formData.email || '').trim().toLowerCase(),
        password: (formData.password || '').trim(),
        name: (formData.name || '').trim()
      };
      const res = await api.post('/auth/register', sanitized);
      if (res.data.success) {
        localStorage.setItem('foodresq_token', res.data.token);
        localStorage.setItem('foodresq_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const quickDemoLogin = async (role) => {
    if (role === 'admin') {
      throw new Error('Quick demo bypass is disabled for Administrator accounts. Please log in with credentials.');
    }
    try {
      const res = await api.post('/auth/demo-login', { role });
      if (res.data.success) {
        localStorage.setItem('foodresq_token', res.data.token);
        localStorage.setItem('foodresq_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
      }
      throw new Error(res.data.message || 'Demo login failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Demo login failed');
    }
  };

  const adminLogin = async (email, password, securityCode) => {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      const res = await api.post('/auth/admin-login', { email: cleanEmail, password: cleanPassword, securityCode });
      if (res.data.success) {
        localStorage.setItem('foodresq_token', res.data.token);
        localStorage.setItem('foodresq_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
      }
      throw new Error(res.data.message || 'Administrator authentication failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Administrator authentication failed');
    }
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