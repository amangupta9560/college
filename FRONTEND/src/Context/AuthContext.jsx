import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_DOMAIN_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

// Create customized Axios instance
export const api = axios.create({
  baseURL: BASE_DOMAIN_URL,
  withCredentials: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup request interceptor to add authorization header
  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
    };
  }, [token]);

  // Setup response interceptor to handle token refresh automatically on 401
  useEffect(() => {
    const resInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
            const newToken = refreshRes.data.data.accessToken;
            setToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            setUser(null);
            setToken(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  // Fetch current user if valid session exists on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get('/api/users/me');
        setUser(res.data.data.user);
      } catch (err) {
        console.log('No active session found.');
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const loginUser = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setUser(res.data.data.user);
    setToken(res.data.data.accessToken);
    return res.data;
  };

  const registerUser = async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    return res.data;
  };

  const verifyOTPCode = async (email, otp) => {
    const res = await api.post('/api/auth/verify-otp', { email, otp });
    setUser(res.data.data.user);
    setToken(res.data.data.accessToken);
    return res.data;
  };

  const logoutUser = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = async (updatedData) => {
    const res = await api.patch('/api/users/me', updatedData);
    setUser(res.data.data.user);
    return res.data;
  };

  const updateAvatar = async (formData) => {
    const res = await api.post('/api/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setUser((prev) => (prev ? { ...prev, avatar: res.data.data.avatarURL } : null));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login: loginUser,
      register: registerUser,
      verifyOTP: verifyOTPCode,
      logout: logoutUser,
      updateUser,
      updateAvatar,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
