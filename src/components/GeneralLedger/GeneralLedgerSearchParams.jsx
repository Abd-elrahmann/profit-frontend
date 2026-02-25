import React from 'react';
import { Paper, Grid, Typography, Box, Chip } from '@mui/material';
import dayjs from 'dayjs';
import { getAccountTypeArabic } from './generalLedgerUtils';

const GeneralLedgerSearchParams = ({ searchParams, isSmallScreen }) => {
  if (!searchParams) return null;

  return (
    <Paper
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: 'primary.50',
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            {searchParams.account.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchParams.account.code} - {getAccountTypeArabic(searchParams.account.type)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: isSmallScreen ? 'flex-start' : 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <Chip
              label={`من: ${searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'البداية'}`}
              variant="outlined"
              size={isSmallScreen ? 'small' : 'medium'}
            />
            <Chip
              label={`إلى: ${searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'النهاية'}`}
              variant="outlined"
              size={isSmallScreen ? 'small' : 'medium'}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(GeneralLedgerSearchParams);
