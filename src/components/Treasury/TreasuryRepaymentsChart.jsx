import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function TreasuryRepaymentsChart({
  paidRepaymentsUntilNow,
  remainingRepayments,
  totalRepaymentsAmount,
  isSmallScreen,
  isDarkMode,
}) {
  if (!totalRepaymentsAmount || totalRepaymentsAmount <= 0) return null;

  const chartData = [
    { name: 'الواصل حتى الآن', value: paidRepaymentsUntilNow, color: '#00C49F' },
    { name: 'المتبقي', value: remainingRepayments, color: '#FF8042' },
    { name: 'الإجمالي', value: totalRepaymentsAmount, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        sx={{
          p: isSmallScreen ? 2 : 3,
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={3} color="text.primary">
          توزيع التحصيل المقترض
        </Typography>
        <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#424242' : '#e0e0e0'} />
            <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#ffffff' : '#666', fontSize: 14 }} />
            <YAxis
              tick={{ fill: isDarkMode ? '#ffffff' : '#666', fontSize: 14 }}
              tickFormatter={(value) => `${value.toLocaleString('en-US')}`}
            />
            <Tooltip
              formatter={(value, name) => [`${value.toLocaleString('en-US')}`, name]}
              contentStyle={{
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                border: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                color: isDarkMode ? '#ffffff' : '#333',
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="value" name="المبلغ" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
