import { createContext, useContext, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const login = async (email, password) => {
    try {
      // 1. Submit login payload to backend
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const jwtToken = response.data; // Backend returns raw token string
      
      if (!jwtToken) {
        throw new Error('No token received from server');
      }

      // Save token temporarily so interceptor can pick it up
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);

      // 2. Fetch authenticated user data using the new token
      const meResponse = await axiosInstance.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const userData = meResponse.data;

      // Save complete session data
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      // Clear half-sessions on error
      logout();
      throw new Error(error.response?.data?.message || error.message || 'Invalid credentials');
    }
  };

  const register = async (name, email, password) => {
    try {
      // 1. Submit registration payload to backend
      const response = await axiosInstance.post('/api/auth/register', { name, email, password });
      const jwtToken = response.data;

      if (!jwtToken) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);

      // 2. Fetch new user info
      const meResponse = await axiosInstance.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const userData = meResponse.data;

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return userData;
    } catch (error) {
      logout();
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
