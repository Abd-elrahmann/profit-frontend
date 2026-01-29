import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, IconButton, CircularProgress } from '@mui/material';
import { Sync as SyncIcon } from '@mui/icons-material';
import Api from '../../config/Api';
import { notifyError, notifySuccess } from '../../utilities/toastify';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
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
    const checkLoginStatus = () => {
      // Check if user is on a protected route (not auth pages)
      const isProtectedRoute = location.pathname !== '/login' 
        && location.pathname !== '/register'
        && location.pathname !== '/forgot-password'
        && location.pathname !== '/reset-password'
        && location.pathname !== '/check-connection'
        && !location.pathname.startsWith('/payment-receipt');
      
      setIsLoggedIn(isProtectedRoute);
    };

    checkLoginStatus();
    
    // Listen for login/logout events
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
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const response = await Api.get('/api');
      if (response.data && response.data.refresh === true) {
        window.location.reload();
        notifySuccess('تم تحديث البيانات بنجاح');
      } else {
        notifyError('فشل في تحديث البيانات');
      }
    } catch (error) {
      notifyError('حدث خطأ أثناء تحديث البيانات');
      console.error('تحديث البيانات error:', error);
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

  if (isAuthPage || isPaymentReceiptPage || isCheckConnectionPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      overflow: 'hidden' 
    }}>
      <Navbar 
        onMenuToggle={handleMenuToggle} 
        isSidebarOpen={isSidebarOpen} 
      />
    
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        mt: '64px', 
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '100vw' 
      }}>
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            p: isLoggedIn ? 3 : 0,
            transition: 'margin-right 0.2s ease-out, width 0.2s ease-out', 
            marginRight: { 
              xs: 0, 
              md: (isLoggedIn && isInitialized && isSidebarOpen) ? '240px' : '0' 
            },
            width: {
              xs: '100%',
              md: (isLoggedIn && isInitialized && isSidebarOpen) ? 'calc(100% - 240px)' : '100%'
            },
            maxWidth: {
              xs: '100vw',
              md: (isLoggedIn && isInitialized && isSidebarOpen) ? 'calc(100vw - 240px)' : '100vw'
            },
            backgroundColor: 'background.paper',
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto', 
            overflowX: 'hidden' 
          }}
        >
          {children}
        </Box>
      </Box>
      
      {isLoggedIn && isInitialized && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          onToggle={handleMenuToggle}
        />
      )}

      {isLoggedIn && !isAuthPage && !isPaymentReceiptPage && (
        <IconButton
          onClick={handleSync}
          disabled={isSyncing}
          style={{
            position: 'fixed',
            bottom: 3,
            left: 20,
          }}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            color: 'white',
            zIndex: 9999,
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          {isSyncing ? (
            <CircularProgress size={24} />
          ) : (
            <SyncIcon sx={{ fontSize: 30 }} />
          )}
        </IconButton>
      )}
    </Box>
  );
};

export default Layout;
