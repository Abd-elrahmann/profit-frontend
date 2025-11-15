import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast'
import routes from './routes';
import Layout from './components/layouts/Layout';
import theme from './theme/theme';
import Installments from './pages/Installments/Installments';
import PaymentReceipt from './components/modals/PaymentReceipt';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import { PermissionProvider, usePermissions } from './components/Contexts/PermissionsContext';
import { notifyError } from './utilities/toastify';

// Helper function to find first accessible page based on permissions
const getFirstAccessiblePage = (permissions) => {
  // Convert module name to permission format
  const convertModuleToPermission = (module) => {
    switch (module) {
      case "messages-templates":
        return "messagesTemplates";
      case "journal-entries":
        return "journalEntries";
      case "contract-templates":
        return "contractTemplates";
      case "general-ledger":
        return "generalLedger";
      default:
        return module;
    }
  };

  // Find first route user has permission for
  for (const route of routes) {
    if (route.protected && route.requiresPermissions && route.module) {
      const moduleKey = convertModuleToPermission(route.module);
      const hasPermission = permissions.includes(`${moduleKey}_View`);
      
      if (hasPermission) {
        return route.path;
      }
    }
  }

  // If no accessible page found, return dashboard (will be handled by ProtectedRoute)
  return '/dashboard';
};

const RestrictedNavigationRoute = ({ children }) => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    const handleKeyDown = (event) => {
      // منع اختصارات التنقل مثل Alt + ArrowLeft/ArrowRight
      if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return children;
};

const AppLayout = () => {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        {routes
          .filter(route => !route.protected)
          .map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PublicRoute>
                  <route.element />
                </PublicRoute>
              }
            />
          ))}
        
        {/* Auth routes - Forgot Password & Reset Password */}
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes */}
        {routes
          .filter(route => route.protected)
          .map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute route={route}>
                  <route.element />
                </ProtectedRoute>
              }
            />
          ))}
        
        {/* Default redirect - will be handled by ProtectedRoute */}
        <Route 
          path="/" 
          element={
            <DefaultRedirectRoute />
          } 
        />

<Route path="/installments/:loanId" element={<Installments />} />
<Route path="/payment-receipt/:loanId/:repaymentId/:clientName" element={<RestrictedNavigationRoute><PaymentReceipt /></RestrictedNavigationRoute>} />
      </Routes>
    </Layout>
  );
};

const ProtectedRoute = ({ children, route }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, loading } = usePermissions();

  useEffect(() => {
    // Wait for permissions to load
    if (loading) return;

    // If no token, redirect to login
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Save current path as last valid path if user has permission
    if (route?.requiresPermissions && route?.module) {
      // Convert module name to permission format
      let moduleKey = route.module;
      switch (route.module) {
        case "messages-templates":
          moduleKey = "messagesTemplates";
          break;
        case "journal-entries":
          moduleKey = "journalEntries";
          break;
        case "contract-templates":
          moduleKey = "contractTemplates";
          break;
        case "general-ledger":
          moduleKey = "generalLedger";
          break;
        default:
          moduleKey = route.module;
      }

      // Check if user has View permission for this module
      const hasPermission = permissions.includes(`${moduleKey}_View`);

      if (!hasPermission) {
        notifyError('ليس لديك صلاحية للوصول إلى هذه الصفحة');
        // If trying to access dashboard without permission, find first accessible page
        if (location.pathname === '/dashboard' || location.pathname === '/') {
          const firstPage = getFirstAccessiblePage(permissions);
          navigate(firstPage, { replace: true });
        } else {
          // Get last valid path from sessionStorage or find first accessible page
          const lastValidPath = sessionStorage.getItem('lastValidPath');
          if (lastValidPath) {
            navigate(lastValidPath, { replace: true });
          } else {
            const firstPage = getFirstAccessiblePage(permissions);
            navigate(firstPage, { replace: true });
          }
        }
        return;
      } else {
        // Save current path as last valid path
        sessionStorage.setItem('lastValidPath', location.pathname);
      }
    } else {
      // For routes that don't require permissions, save as last valid path
      sessionStorage.setItem('lastValidPath', location.pathname);
    }
  }, [token, permissions, loading, route, location, navigate]);

  // Show loading while checking permissions
  if (loading) {
    return null; // or a loading spinner
  }

  // If no token, don't render children (will redirect in useEffect)
  if (!token) {
    return null;
  }

  // If route requires permissions, check them
  if (route?.requiresPermissions && route?.module) {
    let moduleKey = route.module;
    switch (route.module) {
      case "messages-templates":
        moduleKey = "messagesTemplates";
        break;
      case "journal-entries":
        moduleKey = "journalEntries";
        break;
      case "contract-templates":
        moduleKey = "contractTemplates";
        break;
      case "general-ledger":
        moduleKey = "generalLedger";
        break;
      default:
        moduleKey = route.module;
    }

    const hasPermission = permissions.includes(`${moduleKey}_View`);

    if (!hasPermission) {
      // If trying to access dashboard without permission, find first accessible page
      if (location.pathname === '/dashboard' || location.pathname === '/') {
        const firstPage = getFirstAccessiblePage(permissions);
        navigate(firstPage, { replace: true });
      }
      return null; // Don't render, will redirect in useEffect
    }
  }

  return children;
};

const DefaultRedirectRoute = () => {
  const token = localStorage.getItem('token');
  const { permissions, loading } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if (loading) return;

    // Find first accessible page
    const firstPage = getFirstAccessiblePage(permissions);
    navigate(firstPage, { replace: true });
  }, [token, permissions, loading, navigate]);

  return null;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return children;
  }

  // If user is logged in, redirect to dashboard (ProtectedRoute will handle finding first accessible page)
  return <Navigate to="/dashboard" replace />;
};



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
          <PermissionProvider>
            <AppLayout />
          </PermissionProvider>
        <Toaster
        position="top-center"
        gutter={8}
        containerStyle={{ margin: '12px' }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 3000,
          },
        
          style: {
            fontSize: '16px',
            padding: '16px 24px',
          },
        }}
      />
      </Router>
    </ThemeProvider>
  );
}

export default App;