import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken, getStoredToken } from '../api/client';
import { loginUser, registerUser, getCurrentUser, refreshToken } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      if (token) {
        setAuthToken(token);
        try {
          const response = await getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to get current user:', error);
          // Token might be expired, try to refresh
          try {
            const refreshResponse = await refreshToken();
            const newToken = refreshResponse.data.access_token;
            setAuthToken(newToken);
            const storageKey = process.env.REACT_APP_TOKEN_STORAGE_KEY || 'market-scanner-auth';
            localStorage.setItem(storageKey, JSON.stringify(refreshResponse.data));
            setUser(refreshResponse.data.user);
            setIsAuthenticated(true);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Clear invalid token
            setAuthToken(null);
            const storageKey = process.env.REACT_APP_TOKEN_STORAGE_KEY || 'market-scanner-auth';
            localStorage.removeItem(storageKey);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await loginUser({ email, password });
      const { access_token, user: userData } = response.data;
      
      // Store token and user data
      setAuthToken(access_token);
      const storageKey = process.env.REACT_APP_TOKEN_STORAGE_KEY || 'market-scanner-auth';
      localStorage.setItem(storageKey, JSON.stringify(response.data));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await registerUser(userData);
      const { access_token, user: newUser } = response.data;
      
      // Store token and user data
      setAuthToken(access_token);
      const storageKey = process.env.REACT_APP_TOKEN_STORAGE_KEY || 'market-scanner-auth';
      localStorage.setItem(storageKey, JSON.stringify(response.data));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    const storageKey = process.env.REACT_APP_TOKEN_STORAGE_KEY || 'market-scanner-auth';
    localStorage.removeItem(storageKey);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};