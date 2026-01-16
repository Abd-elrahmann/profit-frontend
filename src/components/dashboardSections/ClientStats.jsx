import React, { useState, useMemo } from 'react';
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
import { People, CheckCircle } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getClientStats } from '../../pages/dashboard/dashboardApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@mui/material';
import { useCountUp } from '../../hooks/useCountUp';
import { useTheme as useCustomTheme } from '../../theme/ThemeContext';

const ClientStats = React.memo(() => {
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
              {`${entry.name}: ${Math.round(entry.value).toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['client-stats', filter],
    queryFn: () => getClientStats(filter),
  });

  // Animated counters
  const animatedCount = useCountUp(stats?.count || 0, 600, !isLoading);
  const animatedNewClients = useCountUp(stats?.newClientsToday || 0, 600, !isLoading);
  const animatedActive = useCountUp(stats?.activeCount || 0, 600, !isLoading);
  const animatedOverdue = useCountUp(stats?.overdueCount || 0, 600, !isLoading);

  // Prepare data for bar chart - memoized for performance
  const clientBarData = useMemo(() => [
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
  ], [stats, theme.palette]);


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

      {/* Summary Cards - Row 1: إجمالي العملاء + حالة العملاء */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 5 }, maxWidth: '1200px', justifyContent: 'center' }}>
        {/* إجمالي العملاء + عملاء جدد */}
        <Grid item xs={6} sm={12} md={3}>
          <Card sx={{
            height: { xs: '180px', sm: '100%', md: '300px' },
            width: { xs: '250px', sm: '100%', md: '400px' },
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
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
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
                  إجمالي العملاء
                </Typography>
                <Typography variant="h4" fontWeight="800" sx={{ 
                  mb: 2.5, 
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {animatedCount}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.dark}08 100%)`,
                  border: `1px solid ${theme.palette.success.main}30`,
                  boxShadow: `0 2px 8px ${theme.palette.success.main}10`
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
            height: { xs: '180px', sm: '100%', md: '300px' },
            width: { xs: '250px', sm: '100%', md: '400px' },
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
            <CardContent sx={{ p: { xs: 2.5, sm: 3 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
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
                  عملاء نشطين
                </Typography>
                <Typography variant="h4" fontWeight="800" sx={{ 
                  mb: 2.5, 
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {animatedActive}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.error.main}15 0%, ${theme.palette.error.dark}08 100%)`,
                  border: `1px solid ${theme.palette.error.main}30`,
                  boxShadow: `0 2px 8px ${theme.palette.error.main}10`
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


      {/* Bar Charts */}
      <Box sx={{ width: '100vw', maxWidth: '100%', mb: { xs: 2, sm: 3 }, px: { xs: 1, sm: 0 } }}>
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
          '&:hover': {
            boxShadow: `
              0 4px 16px ${theme.palette.primary.main}15,
              0 16px 48px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `,
          }
        }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            توزيع العملاء حسب الحالة
          </Typography>
          <ResponsiveContainer width="100%" height="90%" minWidth={280} minHeight={250}>
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
              <Tooltip content={<CustomTooltip />} />
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


    </Box>
  );
});

export default ClientStats;