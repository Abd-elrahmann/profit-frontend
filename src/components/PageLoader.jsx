import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const PageLoader = ({ message = "جاري التحميل..." }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: 3
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ mb: 2, color: 'primary.main' }}
        />
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ mt: 1 }}
        >
          يرجى الانتظار...
        </Typography>
      </Paper>
    </Box>
  );
};

export default PageLoader;
