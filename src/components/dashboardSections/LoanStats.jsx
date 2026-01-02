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
import { useTheme as useCustomTheme } from '../../theme/ThemeContext';

const LoanStats = () => {
  const [filter, setFilter] = useState('all');
  const theme = useTheme();
  const { isDarkMode } = useCustomTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Custom tooltip for dark mode compatibility
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          color: isDarkMode ? '#ffffff' : '#000000',
          fontSize: '14px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{
              margin: '4px 0',
              color: entry.color || (isDarkMode ? '#ffffff' : '#000000')
            }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
    }}>
      {/* Filter */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mb: { xs: 3, sm: 4, md: 5 },
        width: '100%',
        maxWidth: '1200px'
      }}>
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
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.dark}08 100%)`,
            border: `1px solid ${theme.palette.primary.main}20`,
            boxShadow: `
              0 2px 8px ${theme.palette.primary.main}10,
              0 8px 24px rgba(0,0,0,0.08),
              inset 0 1px 0 rgba(255,255,255,0.5)
            `,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `
                0 4px 16px ${theme.palette.primary.main}20,
                0 16px 48px rgba(0,0,0,0.12),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              borderColor: `${theme.palette.primary.main}40`,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.dark}10 100%)`,
                border: `2px solid ${theme.palette.primary.main}30`,
                mb: 2.5,
                boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: `0 6px 20px ${theme.palette.primary.main}30`,
                }
              }}>
                <Assessment sx={{ fontSize: '2rem', color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                إجمالي السلف
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
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
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.dark}08 100%)`,
            border: `1px solid ${theme.palette.warning.main}20`,
            boxShadow: `
              0 2px 8px ${theme.palette.warning.main}10,
              0 8px 24px rgba(0,0,0,0.08),
              inset 0 1px 0 rgba(255,255,255,0.5)
            `,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `
                0 4px 16px ${theme.palette.warning.main}20,
                0 16px 48px rgba(0,0,0,0.12),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              borderColor: `${theme.palette.warning.main}40`,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.warning.main}20 0%, ${theme.palette.warning.dark}10 100%)`,
                border: `2px solid ${theme.palette.warning.main}30`,
                mb: 2.5,
                boxShadow: `0 4px 12px ${theme.palette.warning.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: `0 6px 20px ${theme.palette.warning.main}30`,
                }
              }}>
                <Bolt sx={{ fontSize: '2rem', color: theme.palette.warning.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                سلف نشطة
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
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
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.dark}08 100%)`,
            border: `1px solid ${theme.palette.success.main}20`,
            boxShadow: `
              0 2px 8px ${theme.palette.success.main}10,
              0 8px 24px rgba(0,0,0,0.08),
              inset 0 1px 0 rgba(255,255,255,0.5)
            `,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `
                0 4px 16px ${theme.palette.success.main}20,
                0 16px 48px rgba(0,0,0,0.12),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              borderColor: `${theme.palette.success.main}40`,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.success.main}20 0%, ${theme.palette.success.dark}10 100%)`,
                border: `2px solid ${theme.palette.success.main}30`,
                mb: 2.5,
                boxShadow: `0 4px 12px ${theme.palette.success.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: `0 6px 20px ${theme.palette.success.main}30`,
                }
              }}>
                <CheckCircle sx={{ fontSize: '2rem', color: theme.palette.success.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                سلف مكتملة
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
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
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.error.main}15 0%, ${theme.palette.error.dark}08 100%)`,
            border: `1px solid ${theme.palette.error.main}20`,
            boxShadow: `
              0 2px 8px ${theme.palette.error.main}10,
              0 8px 24px rgba(0,0,0,0.08),
              inset 0 1px 0 rgba(255,255,255,0.5)
            `,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `
                0 4px 16px ${theme.palette.error.main}20,
                0 16px 48px rgba(0,0,0,0.12),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              borderColor: `${theme.palette.error.main}40`,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.error.main}20 0%, ${theme.palette.error.dark}10 100%)`,
                border: `2px solid ${theme.palette.error.main}30`,
                mb: 2.5,
                boxShadow: `0 4px 12px ${theme.palette.error.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: `0 6px 20px ${theme.palette.error.main}30`,
                }
              }}>
                <ErrorOutline sx={{ fontSize: '2rem', color: theme.palette.error.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                سلف متأخرة
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
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
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.dark}08 100%)`,
            border: `1px solid ${theme.palette.info.main}20`,
            boxShadow: `
              0 2px 8px ${theme.palette.info.main}10,
              0 8px 24px rgba(0,0,0,0.08),
              inset 0 1px 0 rgba(255,255,255,0.5)
            `,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `
                0 4px 16px ${theme.palette.info.main}20,
                0 16px 48px rgba(0,0,0,0.12),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              borderColor: `${theme.palette.info.main}40`,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.info.main}20 0%, ${theme.palette.info.dark}10 100%)`,
                border: `2px solid ${theme.palette.info.main}30`,
                mb: 2.5,
                boxShadow: `0 4px 12px ${theme.palette.info.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: `0 6px 20px ${theme.palette.info.main}30`,
                }
              }}>
                <AttachMoney sx={{ fontSize: '2rem', color: theme.palette.info.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                إجمالي مبلغ السلف
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
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
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.dark}08 100%)`,
            border: `1px solid ${theme.palette.info.main}20`,
            boxShadow: `
              0 2px 8px ${theme.palette.info.main}10,
              0 8px 24px rgba(0,0,0,0.08),
              inset 0 1px 0 rgba(255,255,255,0.5)
            `,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            },
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `
                0 4px 16px ${theme.palette.info.main}20,
                0 16px 48px rgba(0,0,0,0.12),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              borderColor: `${theme.palette.info.main}40`,
            }
          }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.info.main}20 0%, ${theme.palette.info.dark}10 100%)`,
                border: `2px solid ${theme.palette.info.main}30`,
                mb: 2.5,
                boxShadow: `0 4px 12px ${theme.palette.info.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: `0 6px 20px ${theme.palette.info.main}30`,
                }
              }}>
                <AccountBalance sx={{ fontSize: '2rem', color: theme.palette.info.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                رصيد البنك
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
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
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
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
                <Tooltip content={<CustomTooltip />} />
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
              <Tooltip content={<CustomTooltip />} />
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
              <Tooltip content={<CustomTooltip />} />
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
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
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
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default LoanStats;