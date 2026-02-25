import React from 'react';
import { Paper, Grid, Typography, Autocomplete, TextField } from '@mui/material';
import { ALL_MONTHS } from './constants';

export default function TreasuryMonthYearFilter({
  selectedMonth,
  selectedYear,
  allYears,
  onMonthChange,
  onYearChange,
  isDarkMode,
  isSmallScreen,
  showTransactionCount,
  transactionCount,
}) {
  const filterLabel =
    selectedYear && selectedMonth
      ? `عرض بيانات ${ALL_MONTHS.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`
      : selectedYear
        ? `عرض بيانات سنة ${selectedYear}`
        : 'عرض جميع البيانات';

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        bgcolor: 'background.paper',
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={showTransactionCount ? 3 : 4}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: isSmallScreen ? 1 : 0 }}
          >
            {filterLabel}
          </Typography>
        </Grid>
        <Grid item xs={12} md={showTransactionCount ? 4.5 : 4}>
          <Autocomplete
            value={allYears.find((y) => y.value === selectedYear) || null}
            onChange={onYearChange}
            options={allYears}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                label="اختر السنة"
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { color: isDarkMode ? 'text.secondary' : 'inherit' },
                  '& .MuiOutlinedInput-root input': { color: isDarkMode ? 'text.primary' : 'inherit' },
                }}
              />
            )}
            sx={{ width: '100%', minWidth: '200px' }}
          />
        </Grid>
        <Grid item xs={12} md={showTransactionCount ? 4.5 : 4}>
          <Autocomplete
            value={ALL_MONTHS.find((m) => m.value === selectedMonth) || null}
            onChange={onMonthChange}
            options={ALL_MONTHS}
            getOptionLabel={(option) => option.label}
            disabled={!selectedYear}
            renderInput={(params) => (
              <TextField
                {...params}
                label="اختر الشهر"
                size="small"
                placeholder={!selectedYear ? 'اختر السنة أولاً' : 'اختر الشهر'}
                sx={{
                  '& .MuiInputLabel-root': { color: isDarkMode ? 'text.secondary' : 'inherit' },
                  '& .MuiOutlinedInput-root input': { color: isDarkMode ? 'text.primary' : 'inherit' },
                }}
              />
            )}
            sx={{ width: '100%', minWidth: '200px' }}
          />
        </Grid>
        {showTransactionCount && (
          <Grid item xs={12} md={1}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {transactionCount} قيد
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
