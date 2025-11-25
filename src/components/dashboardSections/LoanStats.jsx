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

  // Prepare data for bar chart - loans by status
  const loanStatusBarData = statusData.length > 0 ? statusData.map(item => ({
    name: item.name,
    value: Math.round(item.value),
    color: item.color
  })) : [];

  // Prepare summary bar data
  const summaryBarData = [
    {
      name: 'إجمالي السلف',
      value: stats?.loans?.count || 0,
    },
    {
      name: 'إجمالي المبلغ',
      value: stats?.loans?.totalAmount || 0,
    },
    {
      name: 'رصيد البنك',
      value: stats?.bank?.balance || 0,
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
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.50', height: '100%' }}>
            <CardContent>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  إجمالي السلف
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {animatedLoansCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.50', height: '100%' }}>
            <CardContent>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  إجمالي مبلغ السلف
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {formatCurrency(animatedTotalAmount)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.50', height: '100%' }}>
            <CardContent>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  سلف نشطة
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {animatedActiveLoans}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.50', height: '100%' }}>
            <CardContent>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  رصيد البنك
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {formatCurrency(animatedBankBalance)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bar Charts */}
      {loanStatusBarData.length > 0 && (
        <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
          <Card sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 300, sm: 350, md: 400 } }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
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
                <Tooltip formatter={(value) => [Math.round(value).toLocaleString(), '']} />
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
        <Card sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 300, sm: 350, md: 400 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            ملخص السلف والبنك
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={summaryBarData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
              <Bar dataKey="value" fill={theme.palette.info.main} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Box>

      {/* Pie Chart */}
      {statusData.length > 0 && (
        <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
          <Card sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 300, sm: 350, md: 400 } }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default LoanStats;