import React, { useEffect, useRef, Suspense, useState } from 'react';
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

const RootRedirect = () => {
  const { authStatus } = useAuth();
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (authStatus === 'checking') return;
    if (authStatus === 'unauthenticated') {
      hasRedirectedRef.current = false;
      navigate('/login', { replace: true });
      return;
    }
    // authenticated: توجيه مرة واحدة لـ /dashboard (مش على تغيير الـ permissions)
    if (authStatus === 'authenticated' && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      navigate('/dashboard', { replace: true });
    }
  }, [authStatus, navigate]);

  if (authStatus === 'checking') {
    return <PageLoader message="جاري التحقق من جلستك..." />;
  }
  return null;
};

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
          element={<RootRedirect />} 
        />

        <Route path="/installments/:loanId" element={<Installments />} />
        <Route path="/payment-receipt" element={<RestrictedNavigationRoute><PaymentReceipt /></RestrictedNavigationRoute>} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const ProtectedRoute = ({ children, route }) => {
  const { authStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);
  const permissionErrorShownRef = useRef(false);

  useEffect(() => {
    permissionErrorShownRef.current = false;
    setShouldRedirect(false);
  }, [location.pathname]);

  useEffect(() => {
    if (shouldRedirect && redirectPath) {
      notifyError('ليس لديك صلاحية للوصول إلى هذه الصفحة');
      navigate(redirectPath, { replace: true });
    }
  }, [shouldRedirect, redirectPath, navigate]);

  // 1) Auth فقط: تحقق الجلسة يمنع التقديم حتى ينتهي
  if (authStatus === 'checking') {
    console.log('ProtectedRoute: Checking auth status...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (authStatus === 'unauthenticated') {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // 2) صلاحيات: فشلها = توجيه داخلي فقط (بدون logout)
  if (route?.requiresPermissions && route?.module) {
    if (permissionsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

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
      if (!permissionErrorShownRef.current && !shouldRedirect) {
        permissionErrorShownRef.current = true;
        const firstPage = getFirstAccessiblePage(permissions);
        setRedirectPath(firstPage);
        setShouldRedirect(true);
      }
      return null;
    }
  }

  sessionStorage.setItem('lastValidPath', location.pathname);
  return children;
};

const PublicRoute = ({ children }) => {
  const { authStatus, isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // صفحة الدخول: النموذج مباشرة، التحقق من الجلسة في الخلفية؛ لو مسجل فعلاً نوجّه لـ /dashboard
  if (isLoginPage) {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  // صفحات عامة أخرى: ننتظر Auth فقط (مش الـ permissions)
  if (authStatus === 'checking') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!isAuthenticated) return children;
  return <Navigate to="/dashboard" replace />;
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