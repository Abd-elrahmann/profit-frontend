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
import { People, CheckCircle, BusinessCenter, TrendingUp } from '@mui/icons-material';
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
    <Box sx={{ 
      width: '100%', 
      p: { xs: 2, sm: 3, md: 4 }, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      backgroundColor: 'background.default'
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
        {/* إجمالي الشركاء */}
        <Grid item xs={3} sm={3} md={3}>
          <Card sx={{
            height: { xs: '200px', sm: '100%', md: '200px' },
            width: { xs: '250px', sm: '100%', md: '200px' },
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
                <People sx={{ fontSize: '2rem', color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                إجمالي الشركاء
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {animatedPartnersCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* شركاء نشطين */}
        <Grid item xs={3} sm={3} md={3}>
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
                شركاء نشطين
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {animatedActivePartners}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* إجمالي رأس المال */}
        <Grid item xs={3} sm={3} md={3}>
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
                <BusinessCenter sx={{ fontSize: '2rem', color: theme.palette.warning.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                إجمالي رأس المال
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {formatCurrency(animatedCapital)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* إجمالي الأرباح */}
        <Grid item xs={3} sm={3} md={3}>
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
                <TrendingUp sx={{ fontSize: '2rem', color: theme.palette.info.main }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}>
                إجمالي الأرباح
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {formatCurrency(animatedProfit)}
              </Typography>
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