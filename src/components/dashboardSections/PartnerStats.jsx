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
import { getPartnerStats } from '../../pages/dashboard/dashboardApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useCountUp } from '../../hooks/useCountUp';

const PartnerStats = () => {
  const [filter, setFilter] = useState('all');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: stats, isLoading } = useQuery({
    queryKey: ['partner-stats', filter],
    queryFn: () => getPartnerStats(filter),
  });

  // Animated counters
  const animatedPartnersCount = useCountUp(stats?.partnersCount || 0, 600, !isLoading);
  const animatedActivePartners = useCountUp(stats?.activePartners || 0, 600, !isLoading);
  const animatedCapital = useCountUp(stats?.totalCapitalAmount || 0, 600, !isLoading);
  const animatedProfit = useCountUp(stats?.totalProfit || 0, 600, !isLoading);

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  const statusData = [
    { name: 'نشط', value: stats?.activePartners || 0 },
    { name: 'غير نشط', value: stats?.inactivePartners || 0 },
  ];

  const COLORS = [theme.palette.success.main, theme.palette.grey[400]];

  // Prepare data for bar chart
  const partnerBarData = [
    {
      name: 'إجمالي الشركاء',
      value: Math.round(stats?.partnersCount || 0),
      color: theme.palette.primary.main,
    },
    {
      name: 'شركاء نشطين',
      value: Math.round(stats?.activePartners || 0),
      color: theme.palette.success.main,
    },
    {
      name: 'شركاء غير نشطين',
      value: Math.round(stats?.inactivePartners || 0),
      color: theme.palette.error.main,
    },
  ];

  const financialBarData = [
    {
      name: 'رأس المال',
      value: stats?.totalCapitalAmount || 0,
      color: theme.palette.warning.main,
    },
    {
      name: 'الأرباح',
      value: stats?.totalProfit || 0,
      color: theme.palette.success.main,
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
                  إجمالي الشركاء
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {animatedPartnersCount}
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
                  شركاء نشطين
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {animatedActivePartners}
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
                  إجمالي رأس المال
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {formatCurrency(animatedCapital)}
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
                  إجمالي الأرباح
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                  {formatCurrency(animatedProfit)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bar Charts */}
      <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
        <Card sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 300, sm: 350, md: 400 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            توزيع الشركاء حسب الحالة
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={partnerBarData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
                {partnerBarData.map((entry, index) => (
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
            رأس المال والأرباح
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

      {/* Pie Chart */}
      {statusData.some(item => item.value > 0) && (
        <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
          <Card sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: { xs: 300, sm: 350, md: 400 } }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              حالة الشركاء
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

export default PartnerStats;