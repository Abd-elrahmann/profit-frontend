import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast'
import routes from './routes';
import Layout from './components/layouts/Layout';
import theme from './theme/theme';
import Installments from './pages/Installments/Installments';
import PaymentReceipt from './components/modals/PaymentReceipt';

// مكون لمنع التنقل من صفحة إيصال الدفع
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
        
        {/* Protected routes */}
        {routes
          .filter(route => route.protected)
          .map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute>
                  <route.element />
                </ProtectedRoute>
              }
            />
          ))}
        
        {/* Default redirect to dashboard */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } 
        />

<Route path="/installments/:loanId" element={<Installments />} />
<Route path="/payment-receipt/:loanId/:repaymentId/:clientName" element={<RestrictedNavigationRoute><PaymentReceipt /></RestrictedNavigationRoute>} />
      </Routes>
    </Layout>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return !token ? children : <Navigate to="/login" />;
};



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppLayout />
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
