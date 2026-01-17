import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Api from '../../config/Api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await Api.post('/api/auth/refresh');
        
        if (response.data) {
          const { accessToken: token, user: userData } = response.data;
          
          const { setAccessToken: setApiToken } = await import('../../config/Api');
          setApiToken(token);
          
          setAccessToken(token);
          setUser(userData);
          setIsAuthenticated(true);
          
          window.dispatchEvent(new Event('userLoggedIn'));
        }
      } catch {
        console.log('No valid session found');
        setIsAuthenticated(false);
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const handleTokenRefresh = (event) => {
      const { accessToken: token, user: userData } = event.detail;
      setAccessToken(token);
      if (userData) {
        setUser(userData);
      }
    };

    const handleAuthFailed = () => {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh);
    window.addEventListener('authFailed', handleAuthFailed);

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
      window.removeEventListener('authFailed', handleAuthFailed);
    };
  }, []);

  const login = useCallback(async (token, userData) => {
    const { setAccessToken: setApiToken } = await import('../../config/Api');
    setApiToken(token);
    
    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    
    window.dispatchEvent(new Event('userLoggedIn'));
  }, []);

  const logout = useCallback(async () => {
    try {
      await Api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const updateAccessToken = useCallback((token) => {
    setAccessToken(token);
  }, []);

  const value = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    updateAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
