import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Api, { setAccessToken as setApiAccessToken } from '../../config/Api';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // مصدر واحد للحقيقة: قرار الـ auth فقط (مش مرتبط بالـ permissions)
  const authStatus =
    isLoading ? 'checking'
    : isAuthenticated ? 'authenticated'
    : 'unauthenticated';

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

    const AUTH_REFRESH_TIMEOUT = 10000; // 10 seconds - منع تعليق الموقع

    const initializeAuth = async () => {

      // Clean up old authentication data first
      cleanupOldAuth();

      try {
        const response = await Promise.race([
          Api.post('/api/auth/refresh'),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth check timeout')), AUTH_REFRESH_TIMEOUT)
          ),
        ]);
        
        if (response.data && response.data.accessToken) {
          const { accessToken: token, user: userData } = response.data;

          if (!token) {
            throw new Error('No access token in response');
          }

          setAccessToken(token);
          setApiAccessToken(token);
          setUser(userData);
          setIsAuthenticated(true);

          console.log('AuthContext: Session restored successfully');
          window.dispatchEvent(new CustomEvent('userLoggedIn', { 
            detail: { accessToken: token, user: userData } 
          }));
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (error) {
        const status = error?.response?.status;
        
        // فقط نسجل الخطأ - لا نعتبر كل خطأ = logout
        if (status === 401 || status === 403) {
          console.log('AuthContext: No valid session (401/403)');
        } else if (error.message === 'Auth check timeout') {
          console.warn('AuthContext: Session check timeout - treating as no session');
        } else {
          console.warn('AuthContext: Session check failed:', error.message);
        }
        
        setIsAuthenticated(false);
        setUser(null);
        setAccessToken(null);
        setApiAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const handleUserLoggedIn = (event) => {
      const { accessToken: token, user: userData } = event.detail;
      console.log('AuthContext: User logged in from Login page');
      setAccessToken(token);
      setApiAccessToken(token);
      setUser(userData);
      setIsAuthenticated(true);
    };

    const handleTokenRefresh = (event) => {
      const { accessToken: token, user: userData } = event.detail;
      console.log('AuthContext: Token refreshed successfully');
      setAccessToken(token);
      setApiAccessToken(token);
      if (userData) {
        setUser(userData);
      }
    };

    const handleAuthFailed = () => {
      console.log('AuthContext: Auth failed event received - logging out user');
      setAccessToken(null);
      setApiAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('tokenRefreshed', handleTokenRefresh);
    window.addEventListener('authFailed', handleAuthFailed);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
      window.removeEventListener('authFailed', handleAuthFailed);
    };
  }, []);

  const login = useCallback(async (token, userData) => {
    console.log('AuthContext: User logging in');
    setAccessToken(token);
    setApiAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);

    window.dispatchEvent(new CustomEvent('userLoggedIn', {
      detail: { accessToken: token, user: userData }
    }));
  }, []);

  const logout = useCallback(async () => {
    console.log('AuthContext: User logging out');
    // Clear all auth data first
    setAccessToken(null);
    setApiAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear only auth-related data, preserve other important settings
    const keysToPreserve = [
      'theme',
      'language',
      'sidebarOpen',
      'rememberedEmail',
      'darkMode',
      'cached_permissions',
      'cached_permissions_timestamp'
    ];
    
    // Clear localStorage - but keep important settings
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (!keysToPreserve.includes(key) && !key.startsWith('persist_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage completely (it's temporary)
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
    authStatus,
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
