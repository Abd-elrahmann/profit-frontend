import React from 'react';
import {
  Box,
  Skeleton,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack
} from '@mui/material';

// Dashboard skeleton for better UX
export const DashboardSkeleton = () => {
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={500} height={24} />
      </Box>

      {/* Stats cards skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="40%" height={32} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Content area skeleton */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
        <Box sx={{ height: 300 }}>
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 1 }} />
        </Box>
      </Paper>
    </Box>
  );
};

// Generic page skeleton
const PageSkeleton = ({ type = 'page' }) => {
  if (type === 'dashboard') {
    return <DashboardSkeleton />;
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={400} height={20} />
      </Box>

      {/* Content area */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
          {/* Table header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width={150} height={28} />
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          </Box>

          {/* Table skeleton */}
          <Box>
            {/* Table headers */}
            <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="text" width={120} height={20} />
              ))}
            </Box>

            {/* Table rows */}
            {[...Array(8)].map((_, rowIndex) => (
              <Box key={rowIndex} sx={{ display: 'flex', mb: 1.5, gap: 2, alignItems: 'center' }}>
                {[...Array(5)].map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    variant="text"
                    width={120}
                    height={16}
                  />
                ))}
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Skeleton variant="rectangular" width={300} height={40} sx={{ borderRadius: 1 }} />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default PageSkeleton;
