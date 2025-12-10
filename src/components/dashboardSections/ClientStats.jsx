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
import { People, CheckCircle, AttachMoney } from '@mui/icons-material';
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
        alignItems: 'center', 
        gap: 15,
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
          إحصائيات العملاء
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

      {/* Summary Cards - Row 1: إجمالي العملاء + حالة العملاء */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 5 }, maxWidth: '1200px', justifyContent: 'center' }}>
        {/* إجمالي العملاء + عملاء جدد */}
        <Grid item xs={6} sm={12} md={3}>
          <Card sx={{
            height: { xs: '180px', sm: '100%', md: '230px' },
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
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ textAlign: 'center' }}>
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
                  <People sx={{ fontSize: '1.75rem', color: 'primary.main' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                  إجمالي العملاء
                </Typography>
                <Typography variant="h4" fontWeight="700" color="primary.main" sx={{ mb: 2.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                  {animatedCount}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: 'success.50',
                  border: `1px solid ${theme.palette.success[100]}`
                }}>
                  <Typography variant="body2" color="success.main" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, fontWeight: 600 }}>
                    عملاء جدد اليوم
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    {animatedNewClients}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* حالة العملاء */}
        <Grid item xs={6} sm={12} md={3}>
          <Card sx={{
            height: { xs: '180px', sm: '100%', md: '230px' },
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
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ textAlign: 'center' }}>
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
                  عملاء نشطين
                </Typography>
                <Typography variant="h4" fontWeight="700" color="success.main" sx={{ mb: 2.5, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                  {animatedActive}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: 'error.50',
                  border: `1px solid ${theme.palette.error[100]}`
                }}>
                  <Typography variant="body2" color="error.main" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, fontWeight: 600 }}>
                    عملاء متعثرين
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="error.main" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                    {animatedOverdue}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Cards - Row 2: المديونية والمدفوعات */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 5 }, maxWidth: '1200px', justifyContent: 'center' }}>
        {/* المديونية والمدفوعات */}
        <Grid item xs={12} sm={12} md={12}>
          <Card sx={{
            height: { xs: '450px', sm: '100%', md: '230px' },
            width: { xs: '100%', sm: '100%', md: '100%' },
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
                  backgroundColor: 'warning.50',
                  mr: 1
                }}>
                  <AttachMoney sx={{ fontSize: '1.75rem', color: 'warning.main' }} />
                </Box>
                <Typography variant="h6" fontWeight="600" color="text.primary" textAlign="center">
                  المديونية والمدفوعات
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
                      إجمالي المديونية
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color="primary.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                      {formatCurrency(animatedDebit)}
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
                      المبلغ المدفوع
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                      {formatCurrency(animatedPaid)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: 'info.50',
                    border: `1px solid ${theme.palette.info[100]}`,
                    height: '100%'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                      المتبقي للتحصيل
                    </Typography>
                    <Typography variant="h3" fontWeight="700" color="info.main" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                      {formatCurrency(animatedRemaining)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bar Charts */}
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