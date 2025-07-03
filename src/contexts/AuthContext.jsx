import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const savedAuth = localStorage.getItem('market-scanner-auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.timestamp && Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
          setAuthToken(process.env.REACT_APP_ACCESS_PASSWORD);
        } else {
          localStorage.removeItem('market-scanner-auth');
          setAuthToken(null);
        }
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        localStorage.removeItem('market-scanner-auth');
        setAuthToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (password) => {
    const correctPassword = process.env.REACT_APP_ACCESS_PASSWORD;
    
    if (!correctPassword) {
      console.error('Access password not configured');
      return false;
    }

    if (password === correctPassword) {
      setIsAuthenticated(true);
      setAuthToken(correctPassword);
      localStorage.setItem('market-scanner-auth', JSON.stringify({
        authenticated: true,
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    localStorage.removeItem('market-scanner-auth');
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 