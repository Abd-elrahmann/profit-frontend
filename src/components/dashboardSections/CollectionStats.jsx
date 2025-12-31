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
import { AttachMoney, TrendingUp, AccountBalance, TrendingDown, CheckCircle } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getMonthlyCollection } from '../../pages/dashboard/dashboardApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@mui/material';
import { useCountUp } from '../../hooks/useCountUp';
import { useTheme as useCustomTheme } from '../../theme/ThemeContext';

const CollectionStats = () => {
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
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['monthly-collection', filter],
    queryFn: () => getMonthlyCollection(filter),
  });

  // Animated counters
  const animatedPercentage = useCountUp(stats?.currentMonth?.collectionPercentage || 0, 600, !isLoading);
  
  // New animated counters for bank account
  const animatedBankDebit = useCountUp(stats?.bankAccount?.debit || 0, 600, !isLoading);
  const animatedBankCredit = useCountUp(stats?.bankAccount?.credit || 0, 600, !isLoading);
  const animatedBankBalance = useCountUp(stats?.bankAccount?.balance || 0, 600, !isLoading);
  const animatedLoansBalance = useCountUp(stats?.loansBalance || 0, 600, !isLoading);

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  // Prepare data for bar chart - Collection
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

  // Prepare data for bank account bar chart
  const bankAccountBarData = [
    {
      name: 'الوارد',
      value: stats?.bankAccount?.debit || 0,
      color: theme.palette.success.main,
    },
    {
      name: 'الصادر',
      value: stats?.bankAccount?.credit || 0,
      color: theme.palette.error.main,
    },
    {
      name: 'الرصيد',
      value: stats?.bankAccount?.balance || 0,
      color: theme.palette.primary.main,
    },
  ];

  // Prepare data for repayments summary chart
  const repaymentsBarData = [
    {
      name: 'إجمالي التحصيلات',
      value: stats?.currentMonth?.totalAmount || 0,
      color: theme.palette.primary.main,
    },
    {
      name: 'تم تحصيله',
      value: stats?.currentMonth?.paidUntilNow || 0,
      color: theme.palette.success.main,
    },
    {
      name: 'المتبقي',
      value: stats?.currentMonth?.remaining || 0,
      color: theme.palette.warning.main,
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
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

      {/* Summary Cards - Row 1: حساب البنك */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 }, justifyContent: 'center', maxWidth: '1200px', px: { xs: 1, sm: 0 } }}>
        {/* الوارد */}
        <Grid item xs={2.4} sm={2.4} md={2.4}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '100%', sm: '100%', md: '250px' },
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
                <TrendingUp sx={{ fontSize: '2rem', color: theme.palette.success.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                الوارد
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {formatCurrency(animatedBankDebit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* الصادر */}
        <Grid item xs={2.4} sm={2.4} md={2.4}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '100%', sm: '100%', md: '250px' },
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
                <TrendingDown sx={{ fontSize: '2rem', color: theme.palette.error.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                الصادر
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {formatCurrency(animatedBankCredit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* الرصيد */}
        <Grid item xs={2.4} sm={2.4} md={2.4}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '100%', sm: '100%', md: '250px' },
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
                <AccountBalance sx={{ fontSize: '2rem', color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                رصيد الصندوق
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {formatCurrency(animatedBankBalance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* رصيد السلف */}
        <Grid item xs={2.4} sm={2.4} md={2.4}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '100%', sm: '100%', md: '250px' },
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
                <AccountBalance sx={{ fontSize: '2rem', color: theme.palette.warning.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                رصيد السلف
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {formatCurrency(animatedLoansBalance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Cards - Row 2: ملخص التحصيلات + نسبة التحصيل + المبلغ المتاح */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 }, justifyContent: 'center', maxWidth: '1200px', px: { xs: 1, sm: 0 } }}>

        {/* ملخص التحصيلات الشهري */}
        {stats?.currentMonth && (
          <Grid item xs={12} sm={12} md={5}>
            <Card sx={{
              height: { xs: '300px', sm: '250px', md: '230px' },
              width: { xs: '100%', sm: '100%', md: '650px' },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.success.main}10 0%, ${theme.palette.success.dark}05 100%)`,
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
                transform: 'translateY(-4px)',
                boxShadow: `
                  0 4px 16px ${theme.palette.success.main}20,
                  0 16px 48px rgba(0,0,0,0.12),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
                borderColor: `${theme.palette.success.main}40`,
              }
            }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 }, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                  <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '16px',
                    mr: 1.5,
                  }}>
                    <CheckCircle sx={{ fontSize: '1.75rem', color: theme.palette.success.main }} />
                  </Box>
                  <Typography variant="h6" fontWeight="700" sx={{
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    ملخص التحصيلات الشهري
                  </Typography>
                </Box>
                
                <Grid container spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: { xs: 'center', sm: 'space-between' } }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.dark}08 100%)`,
                      border: `1px solid ${theme.palette.primary.main}30`,
                      height: '100%',
                      boxShadow: `0 2px 8px ${theme.palette.primary.main}10`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 16px ${theme.palette.primary.main}20`,
                      }
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                        إجمالي التحصيلات
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{
                        fontSize: { xs: '1.5rem', sm: '1.75rem' },
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        {formatCurrency(stats?.currentMonth?.totalAmount || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.dark}08 100%)`,
                      border: `1px solid ${theme.palette.success.main}30`,
                      height: '100%',
                      boxShadow: `0 2px 8px ${theme.palette.success.main}10`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 16px ${theme.palette.success.main}20`,
                      }
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                        تم تحصيله
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{
                        fontSize: { xs: '1.5rem', sm: '1.75rem' },
                        background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        {formatCurrency(stats?.currentMonth?.paidUntilNow || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.dark}08 100%)`,
                      border: `1px solid ${theme.palette.warning.main}30`,
                      height: '100%',
                      boxShadow: `0 2px 8px ${theme.palette.warning.main}10`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 16px ${theme.palette.warning.main}20`,
                      }
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                        المتبقي
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{
                        fontSize: { xs: '1.5rem', sm: '1.75rem' },
                        background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        {formatCurrency(stats?.currentMonth?.remaining || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* نسبة التحصيل + المبلغ المتاح */}
        <Grid item xs={12} sm={12} md={4}>
          <Card sx={{
            height: { xs: '300px', sm: '250px', md: '230px' },
            width: { xs: '100%', sm: '100%', md: '350px' },
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
                <TrendingUp sx={{ fontSize: '2rem', color: theme.palette.info.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                نسبة التحصيل
              </Typography>
              <Typography variant="h3" fontWeight="800" sx={{ 
                mb: 1, 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {animatedPercentage}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bar Charts */}
      <Box sx={{ width: '100%', maxWidth: '1200px', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
        {/* Chart 1: ملخص التحصيل */}
        <Card sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          height: { xs: 300, sm: 350, md: 400 },
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.dark}05 100%)`,
          border: `1px solid ${theme.palette.primary.main}20`,
          boxShadow: `
            0 2px 8px ${theme.palette.primary.main}10,
            0 8px 24px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.5)
          `,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          mb: 3,
          '&:hover': {
            boxShadow: `
              0 4px 16px ${theme.palette.primary.main}15,
              0 16px 48px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `,
          }
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            ملخص التحصيل
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
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: isSmallScreen ? '12px' : '14px' }} />
              <Bar dataKey="value">
                {collectionBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 2: حساب البنك */}
        <Card sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          height: { xs: 300, sm: 350, md: 400 },
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.success.main}08 0%, ${theme.palette.success.dark}05 100%)`,
          border: `1px solid ${theme.palette.success.main}20`,
          boxShadow: `
            0 2px 8px ${theme.palette.success.main}10,
            0 8px 24px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.5)
          `,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          mb: 3,
          '&:hover': {
            boxShadow: `
              0 4px 16px ${theme.palette.success.main}15,
              0 16px 48px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `,
          }
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            حساب البنك
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={bankAccountBarData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
              <YAxis 
                width={isSmallScreen ? 40 : 60}
                tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: isSmallScreen ? '12px' : '14px' }} />
              <Bar dataKey="value">
                {bankAccountBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Chart 3: ملخص التحصيلات الشهري */}
        {stats?.currentMonth && (
          <Card sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            height: { xs: 300, sm: 350, md: 400 },
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.warning.main}08 0%, ${theme.palette.warning.dark}05 100%)`,
            border: `1px solid ${theme.palette.warning.main}20`,
            boxShadow: `
              0 2px 8px ${theme.palette.warning.main}10,
              0 8px 24px rgba(0,0,0,0.08),
              inset 0 1px 0 rgba(255,255,255,0.5)
            `,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: `
                0 4px 16px ${theme.palette.warning.main}15,
                0 16px 48px rgba(0,0,0,0.1),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
            }
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              ملخص التحصيلات الشهري
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={repaymentsBarData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
                <YAxis 
                  width={isSmallScreen ? 40 : 60}
                  tick={{ fontSize: { xs: 12, sm: 14, md: 16 } }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: isSmallScreen ? '12px' : '14px' }} />
                <Bar dataKey="value">
                  {repaymentsBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </Box>

    </Box>
  );
};

export default CollectionStats;