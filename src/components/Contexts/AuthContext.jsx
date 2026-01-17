import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Api, { setAccessToken as setApiAccessToken } from '../../config/Api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clean up old localStorage-based authentication
    const cleanupOldAuth = () => {
      const oldAuthKeys = [
        'accessToken',
        'refreshToken', 
        'token',
        'user',
        'userData',
        'auth',
        'authToken',
        'jwt'
      ];
      
      oldAuthKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage as well
      oldAuthKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
        }
      });
    };

    const initializeAuth = async () => {
      // Clean up old authentication data first
      cleanupOldAuth();
      
      try {
        const response = await Api.post('/api/auth/refresh');
        
        if (response.data) {
          const { accessToken: token, user: userData } = response.data;

          setAccessToken(token);
          setApiAccessToken(token); // Set token in Api.js
          setUser(userData);
          setIsAuthenticated(true);
          
          window.dispatchEvent(new Event('userLoggedIn'));
        }
      } catch {
        console.log('No valid session found');
        setIsAuthenticated(false);
        setUser(null);
        setAccessToken(null);
        setApiAccessToken(null); // Clear token in Api.js
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const handleTokenRefresh = (event) => {
      const { accessToken: token, user: userData } = event.detail;
      setAccessToken(token);
      setApiAccessToken(token); // Set token in Api.js
      if (userData) {
        setUser(userData);
      }
    };

    const handleAuthFailed = () => {
      setAccessToken(null);
      setApiAccessToken(null); // Clear token in Api.js
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
    setAccessToken(token);
    setApiAccessToken(token); // Set token in Api.js
    setUser(userData);
    setIsAuthenticated(true);
    
    window.dispatchEvent(new Event('userLoggedIn'));
  }, []);

  const logout = useCallback(async () => {
    // Clear all auth data first
    setAccessToken(null);
    setApiAccessToken(null); // Clear token in Api.js
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear any remaining localStorage/sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Try to call logout endpoint (but don't fail if it errors)
    try {
      await Api.post('/api/auth/logout');
    } catch {
      // Ignore logout errors - user is already logged out locally
      console.log('Logout endpoint call failed (already logged out)');
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const updateAccessToken = useCallback((token) => {
    setAccessToken(token);
    setApiAccessToken(token); // Set token in Api.js
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
