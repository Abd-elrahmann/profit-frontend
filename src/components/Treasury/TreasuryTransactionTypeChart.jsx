import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TreasuryTransactionTypeChart({
  data,
  isSmallScreen,
  isDarkMode,
}) {
  if (!data || data.length === 0 || !data.some((item) => item.value > 0)) return null;

  return (
    <Box sx={{ mb: 3 }}>
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
          توزيع المعاملات
        </Typography>
        <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value.toLocaleString('en-US')}`, name]}
              contentStyle={{
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                border: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                color: isDarkMode ? '#ffffff' : '#333',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => `${value}: ${entry.payload.value.toLocaleString('en-US')}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
