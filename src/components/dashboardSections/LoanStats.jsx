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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Assessment, AttachMoney, Bolt, AccountBalance, CheckCircle, ErrorOutline } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getLoanStats } from '../../pages/dashboard/dashboardApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useCountUp } from '../../hooks/useCountUp';

const LoanStats = () => {
  const [filter, setFilter] = useState('all');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: stats, isLoading } = useQuery({
    queryKey: ['loan-stats', filter],
    queryFn: () => getLoanStats(filter),
  });

  // Animated counters
  const animatedLoansCount = useCountUp(stats?.loans?.count || 0, 600, !isLoading);
  const animatedTotalAmount = useCountUp(stats?.loans?.totalAmount || 0, 600, !isLoading);
  const animatedActiveLoans = useCountUp(stats?.loans?.byStatus?.ACTIVE || 0, 600, !isLoading);
  const animatedCompletedLoans = useCountUp(stats?.loans?.byStatus?.COMPLETED || 0, 600, !isLoading);
  const animatedOverdueLoans = useCountUp(stats?.loans?.byStatus?.OVERDUE || 0, 600, !isLoading);
  const animatedBankBalance = useCountUp(stats?.bank?.balance || 0, 600, !isLoading);

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  // Prepare data for charts
  const statusData = stats?.loans?.byStatus ? Object.entries(stats.loans.byStatus).map(([status, count]) => ({
    name: getStatusText(status),
    value: count,
    color: getStatusColor(status)
  })) : [];

  function getStatusText(status) {
    const statusMap = {
      'ACTIVE': 'نشط',
      'COMPLETED': 'مكتمل',
      'PENDING': 'معلق',
      'OVERDUE': 'متأخر'
    };
    return statusMap[status] || status;
  }

  function getStatusColor(status) {
    const colorMap = {
      'ACTIVE': theme.palette.success.main,
      'COMPLETED': theme.palette.primary.main,
      'PENDING': theme.palette.warning.main,
      'OVERDUE': theme.palette.error.main
    };
    return colorMap[status] || theme.palette.grey[500];
  }

  // Prepare data for bar chart - loans by status (count only)
  const loanStatusBarData = statusData.length > 0 ? statusData.map(item => ({
    name: item.name,
    value: Math.round(item.value),
    color: item.color
  })) : [];

  // Prepare summary data - separate charts for count and amount
  const summaryCountData = [
    {
      name: 'إجمالي السلف',
      value: stats?.loans?.count || 0,
      color: theme.palette.primary.main,
    },
    {
      name: 'سلف نشطة',
      value: stats?.loans?.byStatus?.ACTIVE || 0,
      color: theme.palette.success.main,
    },
  ];

  const summaryAmountData = [
    {
      name: 'إجمالي المبلغ',
      value: stats?.loans?.totalAmount || 0,
      color: theme.palette.warning.main,
    },
    {
      name: 'رصيد البنك',
      value: stats?.bank?.balance || 0,
      color: theme.palette.info.main,
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
    <Box sx={{ 
      width: '100%', 
      p: { xs: 2, sm: 3, md: 4 }, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      backgroundColor: 'background.default'
    }}>
      {/* Header and Filter */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 15,
        alignItems: 'center', 
        mb: { xs: 3, sm: 4, md: 5 }, 
        width: '100%', 
        maxWidth: '1200px'
      }}>
        <Typography 
          variant="h5" 
          fontWeight="600" 
          sx={{ 
            color: 'text.primary',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
          }}
        >
          إحصائيات السلف
        </Typography>
        <FormControl sx={{ minWidth: { xs: 120, sm: 140 } }} size="small">
          <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>الفترة</InputLabel>
          <Select
            value={filter}
            label="الفترة"
            onChange={(e) => setFilter(e.target.value)}
            size="small"
            sx={{
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="daily">يومي</MenuItem>
            <MenuItem value="monthly">شهري</MenuItem>
            <MenuItem value="yearly">سنوي</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 5 }, maxWidth: '1200px', justifyContent: 'center' }}>
        {/* إجمالي السلف */}
        <Grid item xs={6} sm={12} md={3}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '250px', sm: '100%', md: '250px' },
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
                width: 48,
                height: 48,
                borderRadius: 3,
                backgroundColor: 'primary.50',
                mb: 2
              }}>
                <Assessment sx={{ fontSize: '1.75rem', color: 'primary.main' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                إجمالي السلف
              </Typography>
              <Typography variant="h4" fontWeight="700" color="text.primary" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                {animatedLoansCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* سلف نشطة */}
        <Grid item xs={6} sm={12} md={3}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '250px', sm: '100%', md: '250px' },
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
                width: 48,
                height: 48,
                borderRadius: 3,
                backgroundColor: 'warning.50',
                mb: 2
              }}>
                <Bolt sx={{ fontSize: '1.75rem', color: 'warning.main' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                سلف نشطة
              </Typography>
              <Typography variant="h4" fontWeight="700" color="warning.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                {animatedActiveLoans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* سلف مكتملة */}
        <Grid item xs={6} sm={12} md={3}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '250px', sm: '100%', md: '250px' },
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
                width: 48,
                height: 48,
                borderRadius: 3,
                backgroundColor: 'success.50',
                mb: 2
              }}>
                <CheckCircle sx={{ fontSize: '1.75rem', color: 'success.main' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                سلف مكتملة
              </Typography>
              <Typography variant="h4" fontWeight="700" color="success.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                {animatedCompletedLoans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* سلف متأخرة */}
        <Grid item xs={6} sm={12} md={3}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '250px', sm: '100%', md: '250px' },
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
                width: 48,
                height: 48,
                borderRadius: 3,
                backgroundColor: 'error.50',
                mb: 2
              }}>
                <ErrorOutline sx={{ fontSize: '1.75rem', color: 'error.main' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                سلف متأخرة
              </Typography>
              <Typography variant="h4" fontWeight="700" color="error.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                {animatedOverdueLoans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* إجمالي مبلغ السلف */}
        <Grid item xs={6} sm={12} md={3}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '250px', sm: '100%', md: '250px' },
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
                width: 48,
                height: 48,
                borderRadius: 3,
                backgroundColor: 'success.50',
                mb: 2
              }}>
                <AttachMoney sx={{ fontSize: '1.75rem', color: 'success.main' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                إجمالي مبلغ السلف
              </Typography>
              <Typography variant="h4" fontWeight="700" color="success.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                {formatCurrency(animatedTotalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* رصيد البنك */}
        <Grid item xs={6} sm={12} md={3}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '250px', sm: '100%', md: '250px' },
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
                width: 48,
                height: 48,
                borderRadius: 3,
                backgroundColor: 'info.50',
                mb: 2
              }}>
                <AccountBalance sx={{ fontSize: '1.75rem', color: 'info.main' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                رصيد البنك
              </Typography>
              <Typography variant="h4" fontWeight="700" color="info.main" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                {formatCurrency(animatedBankBalance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bar Charts with 100vw width */}
      {loanStatusBarData.length > 0 && (
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
            <Typography variant="h6" fontWeight="600" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              توزيع السلف حسب الحالة
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={loanStatusBarData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
                <YAxis 
                  allowDecimals={false} 
                  width={isSmallScreen ? 40 : 60}
                  tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(value) => [Math.round(value).toLocaleString(), 'العدد']} />
                <Legend wrapperStyle={{ fontSize: isSmallScreen ? '12px' : '14px' }} />
                <Bar dataKey="value">
                  {loanStatusBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Box>
      )}

      <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
        <Card sx={{ 
          p: { xs: 1.5, sm: 2, md: 3 }, 
          height: { xs: 300, sm: 350, md: 400 },
          borderRadius: 3,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            ملخص عدد السلف
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={summaryCountData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
              <YAxis 
                allowDecimals={false}
                width={isSmallScreen ? 40 : 60}
                tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => [Math.round(value).toLocaleString(), 'العدد']} />
              <Legend wrapperStyle={{ fontSize: isSmallScreen ? '12px' : '14px' }} />
              <Bar dataKey="value">
                {summaryCountData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>

      <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
        <Card sx={{ 
          p: { xs: 1.5, sm: 2, md: 3 }, 
          height: { xs: 300, sm: 350, md: 400 },
          borderRadius: 3,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" fontWeight="600" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            ملخص المبالغ المالية
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={summaryAmountData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
              <YAxis 
                width={isSmallScreen ? 40 : 60}
                tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip formatter={(value) => [formatCurrency(value), 'المبلغ']} />
              <Legend wrapperStyle={{ fontSize: isSmallScreen ? '12px' : '14px' }} />
              <Bar dataKey="value">
                {summaryAmountData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>

      {/* Pie Chart with 100vw width */}
      {statusData.length > 0 && (
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
            <Typography variant="h6" fontWeight="600" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              حالة السلف
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={isSmallScreen ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'العدد']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default LoanStats;