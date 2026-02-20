import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * Loading state for dashboard sections
 */
const SectionLoader = React.memo(({ height = 400 }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, minHeight: height }}>
    <CircularProgress size={60} />
  </Box>
));

SectionLoader.displayName = 'SectionLoader';

export default SectionLoader;
