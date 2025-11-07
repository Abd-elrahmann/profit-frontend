import React from 'react';
import { Box, Typography } from '@mui/material';
import { Helmet } from "react-helmet-async";
const Dashboard = () => {
  return (
    <Box>
      <Helmet>
        <title>لوحة التحكم</title>
        <meta name="description" content="لوحة التحكم" />
      </Helmet>
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
