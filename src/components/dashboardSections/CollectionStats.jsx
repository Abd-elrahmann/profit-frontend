import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getMonthlyCollection } from '../../pages/dashboard/dashboardApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@mui/material';
import { useCountUp } from '../../hooks/useCountUp';

const CollectionStats = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: stats, isLoading } = useQuery({
    queryKey: ['monthly-collection'],
    queryFn: getMonthlyCollection,
  });

  // Animated counters
  const animatedTotalRepayment = useCountUp(stats?.totalRepayment || 0, 600, !isLoading);
  const animatedTotalPaid = useCountUp(stats?.totalPaid || 0, 600, !isLoading);
  const animatedTotalRemaining = useCountUp(stats?.totalRemaining || 0, 600, !isLoading);
  const animatedPercentage = useCountUp(stats?.collectionPercentage || 0, 600, !isLoading);
  const animatedAvailableForLending = useCountUp(stats?.availableForLending || 0, 600, !isLoading);

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  // Prepare data for bar chart
  const collectionBarData = [
    {
      name: 'إجمالي المستحق',
      value: stats?.totalRepayment || 0,
      color: theme.palette.primary.main,
    },
    {
      name: 'إجمالي المدفوع',
      value: stats?.totalPaid || 0,
      color: theme.palette.success.main,
    },
    {
      name: 'المتبقي للتحصيل',
      value: stats?.totalRemaining || 0,
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
      {/* Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 }, justifyContent: 'center', maxWidth: '1200px', px: { xs: 1, sm: 0 } }}>
        {/* ملخص التحصيل */}
        <Grid item xs={12} sm={12} md={8}>
          <Card sx={{ bgcolor: 'primary.50', height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', gap: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
                <Box sx={{ textAlign: 'center', minWidth: { xs: '100%', sm: '150px' }, flex: { xs: '0 0 100%', sm: '0 0 auto' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    إجمالي المستحق
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' } }}>
                    {formatCurrency(animatedTotalRepayment)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: { xs: '100%', sm: '150px' }, flex: { xs: '0 0 100%', sm: '0 0 auto' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    الواصل من التحصيل
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' } }}>
                    {formatCurrency(animatedTotalPaid)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: { xs: '100%', sm: '150px' }, flex: { xs: '0 0 100%', sm: '0 0 auto' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    المتبقي للتحصيل
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' } }}>
                    {formatCurrency(animatedTotalRemaining)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* نسبة التحصيل + المبلغ المتاح */}
        <Grid item xs={12} sm={12} md={4}>
          <Card sx={{ bgcolor: 'info.50', height: '100%' }}>
            <CardContent>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  نسبة التحصيل
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main" sx={{ mb: 2, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {animatedPercentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  المبلغ المتاح للإقراض
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {formatCurrency(animatedAvailableForLending)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
        <Card sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 300, sm: 350, md: 400 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            ملخص التحصيل الشهري
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={collectionBarData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
                {collectionBarData.map((entry, index) => (
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

export default CollectionStats;