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
  const location = useLocation();
  const navigate = useNavigate();
  const { prefetchCommonPages } = usePrefetch();

  // Prefetch common pages on app load
  useEffect(() => {
    prefetchCommonPages();
  }, [prefetchCommonPages]);

  // Validate token on app load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      // If there's a token, verify it with the server
      if (token && userStr) {
        try {
          // Try to fetch user profile or any protected endpoint to validate token
          const response = await Api.get('/api/auth/profile');
          
          // If successful, update user data if needed
          if (response.data) {
            const currentUser = JSON.parse(userStr);
            const serverUser = response.data;
            
            // If user ID doesn't match, clear auth data
            if (currentUser.id !== serverUser.id) {
              console.warn('User ID mismatch. Clearing authentication data...');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('profile');
              localStorage.removeItem('rememberedEmail');
              
              // Clear all cached permissions
              const keysToRemove = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('cached_permissions_') || key.startsWith('cached_permissions_timestamp_'))) {
                  keysToRemove.push(key);
                }
              }
              keysToRemove.forEach(key => localStorage.removeItem(key));
              
              if (location.pathname !== '/login') {
                navigate('/login', { replace: true });
              }
            }
          }
        } catch (error) {
          // Token is invalid or user doesn't exist on this server
          if (error.response?.status === 401 || error.response?.status === 404) {
            console.warn('Token validation failed. Clearing authentication data...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('profile');
            localStorage.removeItem('rememberedEmail');
            
            // Clear all cached permissions
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('cached_permissions_') || key.startsWith('cached_permissions_timestamp_'))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            if (location.pathname !== '/login') {
              navigate('/login', { replace: true });
            }
          }
        }
      }
    };

    validateToken();
  }, []); // Run only once on mount

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
          element={
            <DefaultRedirectRoute />
          } 
        />

        <Route path="/installments/:loanId" element={<Installments />} />
        <Route path="/payment-receipt" element={<RestrictedNavigationRoute><PaymentReceipt /></RestrictedNavigationRoute>} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

const ProtectedRoute = ({ children, route }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, loading } = usePermissions();
  const permissionErrorShownRef = useRef(false);

  useEffect(() => {
    permissionErrorShownRef.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

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

        if (location.pathname === '/dashboard' || location.pathname === '/') {
          const firstPage = getFirstAccessiblePage(permissions);
          navigate(firstPage, { replace: true });
        } else {
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
        sessionStorage.setItem('lastValidPath', location.pathname);
      }
    } else {
      sessionStorage.setItem('lastValidPath', location.pathname);
    }
  }, [token, permissions, loading, route, location, navigate]);

  if (loading) {
    return null;
  }

  if (!token) {
    return null;
  }


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
    <ThemeProviderWrapper>
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
    </ThemeProviderWrapper>
  );
}

export default App;