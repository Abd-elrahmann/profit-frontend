import React from 'react';
import { Box, Typography } from '@mui/material';

const DashboardEmptyState = React.memo(() => (
  <Box
    sx={{
      bgcolor: 'background.default',
      minHeight: '100vh',
      py: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        لا توجد صلاحيات لعرض الداشبورد
      </Typography>
      <Typography variant="body2" color="textSecondary">
        يرجى التواصل مع مدير النظام لمنحك الصلاحيات المطلوبة
      </Typography>
    </Box>
  </Box>
));

DashboardEmptyState.displayName = 'DashboardEmptyState';

export default DashboardEmptyState;
