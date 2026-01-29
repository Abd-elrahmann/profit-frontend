import React, { useEffect, useRef, Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast'
import routes from './routes';
import Layout from './components/layouts/Layout';
import { ThemeProviderWrapper } from './theme/ThemeContext';
const Installments = React.lazy(() => import('./pages/Installments/Installments'));
const PaymentReceipt = React.lazy(() => import('./components/modals/PaymentReceipt'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));
import { PermissionProvider, usePermissions } from './components/Contexts/PermissionsContext';
import { AuthProvider, useAuth } from './components/Contexts/AuthContext';
import { notifyError } from './utilities/toastify';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Api from './config/Api';
import PageLoader from './components/PageLoader';
import { usePrefetch } from './hooks/usePrefetch';
const CheckConnection = React.lazy(() => import('./pages/CheckConnection'));

const getFirstAccessiblePage = (permissions) => {
  const convertModuleToPermission = (module) => {
    switch (module) {
      case "messages-templates":
        return "messagesTemplates";
      case "journal-entries":
        return "journalEntries";
      case "contract-templates":
        return "contractTemplates";
      default:
        return module;
    }
  };

  for (const route of routes) {
    if (route.protected && route.requiresPermissions && route.module) {
      const moduleKey = convertModuleToPermission(route.module);
      const hasPermission = permissions.includes(`${moduleKey}_View`);
      
      if (hasPermission) {
        return route.path;
      }
    }
  }

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

const LoadingFallback = () => <PageLoader message="جاري تحميل الصفحة..." />;

const ConnectionWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOffline = () => {
      const lastVisited = `${location.pathname}${location.search}`;
      if (location.pathname !== '/check-connection') {
        sessionStorage.setItem('lastOnlinePath', lastVisited);
      }
      navigate('/check-connection', { replace: true });
    };

    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (navigator.onLine && location.pathname !== '/check-connection') {
      sessionStorage.setItem('lastOnlinePath', `${location.pathname}${location.search}`);
    }
  }, [location.pathname, location.search]);

  return null;
};

const AppLayout = () => {
  const { prefetchCommonPages } = usePrefetch();

  useEffect(() => {
    prefetchCommonPages();
  }, [prefetchCommonPages]);

  return (
    <Layout>
      <ConnectionWatcher />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
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
        
        <Route 
          path="/check-connection" 
          element={<CheckConnection />} 
        />
        
        
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
        
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />

        <Route path="/installments/:loanId" element={<Installments />} />
        <Route path="/payment-receipt" element={<RestrictedNavigationRoute><PaymentReceipt /></RestrictedNavigationRoute>} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const ProtectedRoute = ({ children, route }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const { permissions, loading } = usePermissions();
  const permissionErrorShownRef = useRef(false);

  useEffect(() => {
    permissionErrorShownRef.current = false;
  }, [location.pathname]);

  // Show loading while checking authentication
  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions if required
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
      default:
        moduleKey = route.module;
    }

    const hasPermission = permissions.includes(`${moduleKey}_View`);

    if (!hasPermission) {
      if (!permissionErrorShownRef.current) {
        notifyError('ليس لديك صلاحية للوصول إلى هذه الصفحة');
        permissionErrorShownRef.current = true;
      }

      const firstPage = getFirstAccessiblePage(permissions);
      return <Navigate to={firstPage} replace />;
    } else {
      sessionStorage.setItem('lastValidPath', location.pathname);
    }
  } else {
    sessionStorage.setItem('lastValidPath', location.pathname);
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { permissions, loading } = usePermissions();
  
  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return children;
  }

  // If authenticated, redirect to first accessible page
  const firstPage = getFirstAccessiblePage(permissions);
  return <Navigate to={firstPage} replace />;
};



function App() {
  return (
    <ThemeProviderWrapper>
      <Router>
        <AuthProvider>
          <PermissionProvider>
            <AppLayout />
          </PermissionProvider>
        </AuthProvider>
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
    </ThemeProviderWrapper>
  );
}

export default App;