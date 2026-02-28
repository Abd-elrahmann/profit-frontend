import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Api from '../../config/Api';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authStatus =
    isLoading ? 'checking'
    : isAuthenticated ? 'authenticated'
    : 'unauthenticated';
  useEffect(() => {
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
      oldAuthKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
        }
      });
    };
    const AUTH_REFRESH_TIMEOUT = 10000;
    const initializeAuth = async () => {
      cleanupOldAuth();
      try {
        const response = await Promise.race([
          Api.post('/api/auth/refresh'),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth check timeout')), AUTH_REFRESH_TIMEOUT)
          ),
        ]);
        if (response.data && response.data.user) {
          const { user: userData } = response.data;
          setUser(userData);
          setIsAuthenticated(true);
          window.dispatchEvent(new CustomEvent('userLoggedIn', { 
            detail: { user: userData } 
          }));
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (error) {
        if (error?.response?.status !== 401) {
          console.warn('⚠️ Auth initialization failed:', error.message);
        } else {
        }
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
    const handleTokenRefresh = (event) => {
      const { user: userData } = event.detail;
      if (userData) {
        setUser(userData);
      }
    };
    const handleAuthFailed = () => {
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
  const login = useCallback(async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);
  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    const keysToPreserve = [
      'theme',
      'language',
      'sidebarOpen',
      'rememberedEmail',
      'darkMode',
      'cached_permissions',
      'cached_permissions_timestamp'
    ];
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (!keysToPreserve.includes(key) && !key.startsWith('persist_')) {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
    try {
      await Api.post('/api/auth/logout');
    } catch {
    }
  }, []);
  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);
  const value = {
    user,
    isAuthenticated,
    isLoading,
    authStatus,
    login,
    logout,
    updateUser
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