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
import { AttachMoney, TrendingUp } from '@mui/icons-material';
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
          <Card sx={{
            height: { xs: '300px', sm: '250px', md: '250px' },
            width: { xs: '250px', sm: '100%', md: '700px' },
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 30px 0 rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: 3,
                  backgroundColor: 'primary.50',
                  mr: 3
                }}>
                  <AttachMoney sx={{ fontSize: '1.75rem', color: 'primary.main' }} />
                </Box>
                <Typography variant="h6" fontWeight="600" color="text.primary" textAlign="center">
                  ملخص التحصيل
                </Typography>
              </Box>
              
              <Grid container spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: { xs: 'center', sm: 'space-between' } }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: 'primary.50',
                    border: `1px solid ${theme.palette.primary[100]}`,
                    height: '100%'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                      إجمالي المستحق
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color="primary.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                      {formatCurrency(animatedTotalRepayment)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: 'success.50',
                    border: `1px solid ${theme.palette.success[100]}`,
                    height: '100%'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                      الواصل من التحصيل
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                      {formatCurrency(animatedTotalPaid)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: 'warning.50',
                    border: `1px solid ${theme.palette.warning[100]}`,
                    height: '100%'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                      المتبقي للتحصيل
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color="warning.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                      {formatCurrency(animatedTotalRemaining)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* نسبة التحصيل + المبلغ المتاح */}
        <Grid item xs={12} sm={12} md={4}>
          <Card sx={{
            height: { xs: '250px', sm: '250px', md: '250px' },
            width: { xs: '250px', sm: '100%', md: '300px' },
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 30px 0 rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center' }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 3,
                backgroundColor: 'info.50',
                mb: 1
              }}>
                <TrendingUp sx={{ fontSize: '1.75rem', color: 'info.main' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                نسبة التحصيل
              </Typography>
              <Typography variant="h3" fontWeight="700" color="info.main" sx={{ mb: 1, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                {animatedPercentage}%
              </Typography>
              <Box sx={{ 
                p: 1,
                borderRadius: 2,
                backgroundColor: 'primary.50',
                border: `1px solid ${theme.palette.primary[100]}`
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                  المبلغ المتاح للإقراض
                </Typography>
                <Typography variant="h3" fontWeight="700" color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                  {formatCurrency(animatedAvailableForLending)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
        <Card sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          height: { xs: 300, sm: 350, md: 400 },
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)'
        }}>
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