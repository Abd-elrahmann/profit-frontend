import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getClientStats } from '../../pages/dashboard/dashboardApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@mui/material';
import { useCountUp } from '../../hooks/useCountUp';

const ClientStats = () => {
  const [filter, setFilter] = useState('all');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: stats, isLoading } = useQuery({
    queryKey: ['client-stats', filter],
    queryFn: () => getClientStats(filter),
  });

  // Animated counters
  const animatedCount = useCountUp(stats?.count || 0, 600, !isLoading);
  const animatedNewClients = useCountUp(stats?.newClientsToday || 0, 600, !isLoading);
  const animatedActive = useCountUp(stats?.activeCount || 0, 600, !isLoading);
  const animatedOverdue = useCountUp(stats?.overdueCount || 0, 600, !isLoading);
  const animatedDebit = useCountUp(stats?.totalDebit || 0, 600, !isLoading);
  const animatedPaid = useCountUp(stats?.totalPaid || 0, 600, !isLoading);
  const animatedRemaining = useCountUp(stats?.remaining || 0, 600, !isLoading);

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  // Prepare data for bar chart
  const clientBarData = [
    {
      name: 'إجمالي العملاء',
      value: Math.round(stats?.count || 0),
      color: theme.palette.primary.main,
    },
    {
      name: 'عملاء نشطين',
      value: Math.round(stats?.activeCount || 0),
      color: theme.palette.success.main,
    },
    {
      name: 'عملاء متعثرين',
      value: Math.round(stats?.overdueCount || 0),
      color: theme.palette.error.main,
    },
  ];

  const financialBarData = [
    {
      name: 'إجمالي المديونية',
      value: stats?.totalDebit || 0,
      color: theme.palette.primary.main,
    },
    {
      name: 'المدفوع',
      value: stats?.totalPaid || 0,
      color: theme.palette.success.main,
    },
    {
      name: 'المتبقي',
      value: stats?.remaining || 0,
      color: theme.palette.error.main,
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100vw', maxWidth: '100%', p: { xs: 1.5, sm: 2, md: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header and Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: { xs: 2, sm: 3, md: 4 }, width: '100%', maxWidth: '1200px', px: { xs: 1, sm: 0 } }}>
        <FormControl sx={{ minWidth: { xs: 100, sm: 120 } }} size="small">
          <InputLabel>الفترة</InputLabel>
          <Select
            value={filter}
            label="الفترة"
            onChange={(e) => setFilter(e.target.value)}
            size="small"
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="daily">يومي</MenuItem>
            <MenuItem value="monthly">شهري</MenuItem>
            <MenuItem value="yearly">سنوي</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 }, justifyContent: 'center', maxWidth: '1200px', px: { xs: 1, sm: 0 } }}>
        {/* إجمالي العملاء + عملاء جدد */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.50', height: '100%' }}>
            <CardContent>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  إجمالي العملاء
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mb: 2, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {animatedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  عملاء جدد اليوم
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {animatedNewClients}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* حالة العملاء */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.50', height: '100%' }}>
            <CardContent>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  عملاء نشطين
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mb: 2, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {animatedActive}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  عملاء متعثرين
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {animatedOverdue}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* المديونية والمدفوعات */}
        <Grid item xs={12} sm={12} md={6}>
          <Card sx={{ bgcolor: 'warning.50', height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', gap: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
                <Box sx={{ textAlign: 'center', minWidth: { xs: '100%', sm: '150px' }, flex: { xs: '0 0 100%', sm: '0 0 auto' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    إجمالي المديونية
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' } }}>
                    {formatCurrency(animatedDebit)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: { xs: '100%', sm: '150px' }, flex: { xs: '0 0 100%', sm: '0 0 auto' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    المبلغ المدفوع
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' } }}>
                    {formatCurrency(animatedPaid)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: { xs: '100%', sm: '150px' }, flex: { xs: '0 0 100%', sm: '0 0 auto' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    المتبقي للتحصيل
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="info.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' } }}>
                    {formatCurrency(animatedRemaining)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bar Charts */}
      <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
        <Card sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 300, sm: 350, md: 400 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            توزيع العملاء حسب الحالة
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={clientBarData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
              <YAxis 
                allowDecimals={false} 
                width={isSmallScreen ? 40 : 60}
                tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => [Math.round(value).toLocaleString(), '']} />
              <Legend wrapperStyle={{ fontSize: isSmallScreen ? '12px' : '14px' }} />
              <Bar dataKey="value">
                {clientBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>

      <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
        <Card sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 300, sm: 350, md: 400 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            المديونية والمدفوعات
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={financialBarData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
              <YAxis 
                width={isSmallScreen ? 40 : 60}
                tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
              <Legend wrapperStyle={{ fontSize: isSmallScreen ? '12px' : '14px' }} />
              <Bar dataKey="value">
                {financialBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>

    </Box>
  );
};

export default ClientStats;