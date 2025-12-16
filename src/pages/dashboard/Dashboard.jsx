import React, { useState, useEffect, useRef } from 'react';
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
import Api from '../../config/Api';

// Import components
import ClientStats from '../../components/dashboardSections/ClientStats';
import PartnerStats from '../../components/dashboardSections/PartnerStats';
import LoanStats from '../../components/dashboardSections/LoanStats';
import CollectionStats from '../../components/dashboardSections/CollectionStats';
import UpcomingRepayments from '../../components/dashboardSections/UpcomingRepayments';
import LastActions from '../../components/dashboardSections/LastActions';

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { permissions } = usePermissions();
  const queryClient = useQueryClient();

  // Fetch dashboard permissions - تحديث تلقائي عند تغيير المستخدم
  const { data: dashboardPermissions } = useQuery({
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
        console.error('Error fetching dashboard permissions:', error);
        return [];
      }
    },
    staleTime: 0, // تحديث فوري عند تغيير الصلاحيات
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // تحديث تلقائي عند تغيير الصلاحيات
  const prevPermissionsLength = useRef(permissions?.length || 0);
  useEffect(() => {
    const currentLength = permissions?.length || 0;
    if (currentLength !== prevPermissionsLength.current && currentLength > 0) {
      prevPermissionsLength.current = currentLength;
      queryClient.invalidateQueries({ queryKey: ['dashboard-permissions'] });
    }
  }, [permissions, queryClient]);

  // Define all available tabs with their permissions
  const allTabs = [
    {
      label: "إحصائيات العملاء",
      component: <ClientStats />,
      permission: 'client-stats',
      index: 0
    },
    {
      label: "إحصائيات الشركاء",
      component: <PartnerStats />,
      permission: 'partner-stats',
      index: 1
    },
    {
      label: "إحصائيات السلف",
      component: <LoanStats />,
      permission: 'loan-stats',
      index: 2
    },
    {
      label: "التحصيل الشهري",
      component: <CollectionStats />,
      permission: 'monthly-collection',
      index: 3
    },
    {
      label: "الدفعات القادمة",
      component: <UpcomingRepayments />,
      permission: 'Upcoming-Repayments',
      index: 4
    },
    {
      label: "آخر الأنشطة",
      component: <LastActions />,
      permission: 'Last-Actions',
      index: 5
    }
  ];

  // Filter tabs based on permissions
  const availableTabs = allTabs.filter(tab =>
    dashboardPermissions?.some(perm => perm.module === tab.permission && perm.canView)
  );

  // Adjust selected tab if it's out of bounds after filtering
  useEffect(() => {
    if (availableTabs.length > 0 && value >= availableTabs.length) {
      setValue(0);
    }
  }, [availableTabs.length, value]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Show loading or empty state if no permissions
  if (!dashboardPermissions) {
    return (
      <Box
        sx={{
          bgcolor: '#f6f6f8',
          minHeight: '100vh',
          py: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Helmet>
          <title>لوحة التحكم - النظام المالي</title>
        </Helmet>
        <Typography>جاري التحميل...</Typography>
      </Box>
    );
  }

  if (availableTabs.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: '#f6f6f8',
          minHeight: '100vh',
          py: 3,
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
        bgcolor: '#f6f6f8',
        minHeight: '100vh',
        py: 3,
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
                color: 'text.primary',
                '&.Mui-selected': {
                  color: 'primary.main',
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
                {tab.component}
              </Box>
            </Box>
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
};

export default Dashboard;