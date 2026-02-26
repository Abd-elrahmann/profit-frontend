import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const PageLoader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}
    >
      <CircularProgress size={48} thickness={4} sx={{ color: 'primary.main' }} />
    </Box>
  );
};

export default PageLoader;
