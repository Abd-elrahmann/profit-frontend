import React from 'react';
import { Box, Typography } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: 'primary.main'
        }}
      >
        لوحة التحكم
      </Typography>
      
    </Box>
  );
};

export default Dashboard;
