import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, IconButton, CircularProgress } from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';
import Api from '../../config/Api';
import { notifyError, notifySuccess } from '../../utilities/toastify';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../Contexts/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isLoading: authLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const initializeSidebar = () => {
      try {
        const savedSidebarState = localStorage.getItem('sidebarOpen');
        if (savedSidebarState !== null) {
          setIsSidebarOpen(JSON.parse(savedSidebarState));
        } else {
          setIsSidebarOpen(true);
        }
      } catch (error) {
        console.warn('Error loading sidebar state:', error);
        setIsSidebarOpen(true);
      }
      setIsInitialized(true);
    };
    const timer = setTimeout(initializeSidebar, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isProtectedRoute = location.pathname !== '/login'
      && location.pathname !== '/register'
      && location.pathname !== '/forgot-password'
      && location.pathname !== '/reset-password'
      && location.pathname !== '/check-connection'
      && !location.pathname.startsWith('/payment-receipt');
    setIsLoggedIn(isProtectedRoute);

    const showRefreshSuccess = sessionStorage.getItem('showRefreshSuccess');
    if (showRefreshSuccess === 'true') {
      sessionStorage.removeItem('showRefreshSuccess');
      notifySuccess('تم تحديث البيانات بنجاح');
    }

    const handleUserLogin = () => setIsLoggedIn(true);
    const handleAuthFailed = () => setIsLoggedIn(false);
    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('authFailed', handleAuthFailed);
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('authFailed', handleAuthFailed);
    };
  }, [location]);

  const handleMenuToggle = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  const handleSidebarClose = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const response = await Api.get('/api');
      if (response.data?.refresh === true) {
        sessionStorage.setItem('showRefreshSuccess', 'true');
        window.location.reload();
      } else {
        notifyError('فشل في تحديث البيانات');
      }
    } catch {
      notifyError('حدث خطأ أثناء تحديث البيانات');
    } finally {
      setIsSyncing(false);
    }
  };

  const isAuthPage = location.pathname === '/login'
    || location.pathname === '/register'
    || location.pathname === '/forgot-password'
    || location.pathname === '/reset-password'
    || location.pathname === '/';
  const isPaymentReceiptPage = location.pathname.startsWith('/payment-receipt');
  const isCheckConnectionPage = location.pathname === '/check-connection';

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-light dark:bg-background-dark">
        <CircularProgress />
      </div>
    );
  }

  if (isAuthPage || isPaymentReceiptPage || isCheckConnectionPage) {
    return <>{children}</>;
  }

  const sidebarWidth = 256;
  const showSidebar = isLoggedIn && isInitialized && isSidebarOpen;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <Navbar onMenuToggle={handleMenuToggle} />

      <main
        className="flex-1 flex flex-col overflow-hidden transition-all duration-200 pt-16"
        style={{
          marginRight: showSidebar ? sidebarWidth : 0,
        }}
      >
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark"
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          {isLoggedIn ? (
            <div className="p-4 md:p-6 lg:p-8">
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      {isLoggedIn && isInitialized && (
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
      )}

      {isLoggedIn && !isAuthPage && !isPaymentReceiptPage && (
        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="fixed bottom-3 left-5 z-[9999] w-10 h-10 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
        >
          {isSyncing ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            <SyncIcon sx={{ fontSize: 24 }} />
          )}
        </button>
      )}
    </div>
  );
};

export default Layout;
