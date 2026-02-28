import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
const PageLoader = ({ message }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        gap: 2,
      }}
    >
      <CircularProgress size={48} thickness={4} sx={{ color: 'primary.main' }} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};
export default PageLoader;