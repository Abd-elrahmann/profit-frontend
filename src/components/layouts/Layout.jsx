import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize sidebar state
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

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
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

  // Check if current page is an auth page
  const isAuthPage = location.pathname === '/login' 
    || location.pathname === '/register'
    || location.pathname === '/forgot-password'
    || location.pathname === '/reset-password';

  // Check if current page is a payment receipt page
  const isPaymentReceiptPage = location.pathname.startsWith('/payment-receipt/');

  // For auth pages and payment receipt pages, render children without layout
  if (isAuthPage || isPaymentReceiptPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      overflow: 'hidden' 
    }}>
      {/* Navbar */}
      <Navbar 
        onMenuToggle={handleMenuToggle} 
        isSidebarOpen={isSidebarOpen} 
      />
    
      {/* Main content area */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        mt: '64px', 
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '100vw' 
      }}>
        {/* Main content */}
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
            backgroundColor: isLoggedIn ? '#f8f9fa' : 'transparent',
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto', 
            overflowX: 'hidden' 
          }}
        >
          {children}
        </Box>
      </Box>
      
      {/* Sidebar */}
      {isLoggedIn && isInitialized && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={handleSidebarClose}
          onToggle={handleMenuToggle}
        />
      )}
    </Box>
  );
};

export default Layout;
