import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
export default function TreasuryMonthlyBalanceChart({
  data,
  isSmallScreen,
  isDarkMode,
}) {
  if (!data || data.length === 0) return null;
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12}>
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
            تطور الوارد والصادر والرصيد
          </Typography>
          <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#424242' : '#e0e0e0'} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#ffffff' : '#666'} />
              <YAxis
                stroke={isDarkMode ? '#ffffff' : '#666'}
                tickFormatter={(value) => value?.toLocaleString?.('en-US') || value}
              />
              <Tooltip
                formatter={(value, name) => [`${Number(value || 0).toLocaleString('en-US')}`, name]}
                contentStyle={{
                  borderRadius: '8px',
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                  border: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                  color: isDarkMode ? '#ffffff' : '#333',
                }}
              />
              <Legend />
              <Bar dataKey="الوارد" name="الوارد" fill="#00C49F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="الصادر" name="الصادر" fill="#FF8042" radius={[4, 4, 0, 0]} />
              <Bar dataKey="الرصيد" name="الرصيد" fill="#2e7d32" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}