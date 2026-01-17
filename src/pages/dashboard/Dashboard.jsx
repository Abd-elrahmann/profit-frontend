import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import Api, { handleApiError } from '../../config/Api';
import PageSkeleton from '../../components/PageSkeleton';

const ClientStats = React.lazy(() => import('../../components/dashboardSections/ClientStats'));
const PartnerStats = React.lazy(() => import('../../components/dashboardSections/PartnerStats'));
const LoanStats = React.lazy(() => import('../../components/dashboardSections/LoanStats'));
const CollectionStats = React.lazy(() => import('../../components/dashboardSections/CollectionStats'));
const UpcomingRepayments = React.lazy(() => import('../../components/dashboardSections/UpcomingRepayments'));
const LastActions = React.lazy(() => import('../../components/dashboardSections/LastActions'));

const TabPanel = React.memo(({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          <Suspense fallback={<PageSkeleton type="dashboard" />}>
            {children}
          </Suspense>
        </Box>
      )}
    </div>
  );
});

const Dashboard = React.memo(() => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { permissions } = usePermissions();
  const queryClient = useQueryClient();

  const { data: dashboardPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['dashboard-permissions', permissions?.length || 0],
    queryFn: async () => {
      try {
        const response = await Api.get('/api/roles/permissions');
        const rolePermissions = response.data.permissions || [];
        return rolePermissions.filter(p => p.canView && [
          'client-stats',
          'partner-stats',
          'loan-stats',
          'monthly-collection',
          'Upcoming-Repayments',
          'Last-Actions'
        ].includes(p.module));
      } catch (error) {
        handleApiError(error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!permissions?.length,
  });

  const prevPermissionsLength = useRef(permissions?.length || 0);
  useEffect(() => {
    const currentLength = permissions?.length || 0;
    if (currentLength !== prevPermissionsLength.current && currentLength > 0) {
      prevPermissionsLength.current = currentLength;
      queryClient.invalidateQueries({ queryKey: ['dashboard-permissions'] });
    }
  }, [permissions, queryClient]);

  const allTabs = useMemo(() => [
    {
      label: "إحصائيات العملاء",
      Component: ClientStats,
      permission: 'client-stats',
      index: 0
    },
    {
      label: "إحصائيات الشركاء",
      Component: PartnerStats,
      permission: 'partner-stats',
      index: 1
    },
    {
      label: "إحصائيات السلف",
      Component: LoanStats,
      permission: 'loan-stats',
      index: 2
    },
    {
      label: "التحصيل الشهري",
      Component: CollectionStats,
      permission: 'monthly-collection',
      index: 3
    },
    {
      label: "الدفعات القادمة",
      Component: UpcomingRepayments,
      permission: 'Upcoming-Repayments',
      index: 4
    },
    {
      label: "آخر الأنشطة",
      Component: LastActions,
      permission: 'Last-Actions',
      index: 5
    }
  ], []);

  const availableTabs = useMemo(() => {
    if (!dashboardPermissions) return [];
    return allTabs.filter(tab =>
      dashboardPermissions.some(perm => perm.module === tab.permission && perm.canView)
    );
  }, [dashboardPermissions, allTabs]);

  useEffect(() => {
    if (availableTabs.length > 0 && value >= availableTabs.length) {
      setValue(0);
    }
  }, [availableTabs.length, value]);

  const handleChange = useCallback((event, newValue) => {
    setValue(newValue);
  }, []);

  if (permissionsLoading || !dashboardPermissions) {
    return (
      <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', py: 1 }}>
        <Helmet>
          <title>لوحة التحكم - النظام المالي</title>
        </Helmet>
        <PageSkeleton type="dashboard" />
      </Box>
    );
  }

  if (availableTabs.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
          py: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Helmet>
          <title>لوحة التحكم - النظام المالي</title>
        </Helmet>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            لا توجد صلاحيات لعرض الداشبورد
          </Typography>
          <Typography variant="body2" color="textSecondary">
            يرجى التواصل مع مدير النظام لمنحك الصلاحيات المطلوبة
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 0,
      }}
    >
      <Helmet>
        <title>لوحة التحكم - النظام المالي</title>
        <meta name="description" content="لوحة التحكم الرئيسية للنظام المالي" />
      </Helmet>

      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant={isSmallScreen ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
                fontWeight: 600,
                minHeight: { xs: 48, sm: 56, md: 64 },
                px: { xs: 1.5, sm: 2, md: 3 },
                color: theme.palette.text.primary,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            {availableTabs.map((tab) => (
              <Tab key={tab.permission} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {availableTabs.map((tab, index) => (
          <TabPanel key={tab.permission} value={value} index={index}>
            <Box sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              px: { xs: 1, sm: 2 }
            }}>
              <Box sx={{
                width: '100%',
                maxWidth: '1200px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <tab.Component />
              </Box>
            </Box>
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
});

export default Dashboard;