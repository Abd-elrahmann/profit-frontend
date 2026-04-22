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
  bankAccountOptions = null,
  selectedBankAccount = null,
  onBankAccountChange,
}) {
  const filterLabel =
    selectedYear && selectedMonth
      ? `عرض بيانات ${ALL_MONTHS.find((m) => m.value === selectedMonth)?.label} ${selectedYear}`
      : selectedYear
        ? `عرض بيانات سنة ${selectedYear}`
        : 'عرض جميع البيانات';
  const hasAccountPicker =
    Array.isArray(bankAccountOptions) &&
    bankAccountOptions.length > 0 &&
    typeof onBankAccountChange === 'function';
  const yearMd = showTransactionCount ? 3 : hasAccountPicker ? 4 : 4;
  const monthMd = showTransactionCount ? 3 : hasAccountPicker ? 4 : 4;
  const accountMd = hasAccountPicker ? 4 : 0;
  const labelMd = showTransactionCount ? 3 : hasAccountPicker ? 12 : 4;
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
        <Grid item xs={12} md={labelMd}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: isSmallScreen ? 1 : 0 }}
          >
            {filterLabel}
          </Typography>
        </Grid>
        <Grid item xs={12} md={yearMd}>
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
        <Grid item xs={12} md={monthMd}>
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
        {hasAccountPicker && (
          <Grid item xs={12} md={accountMd}>
            <Autocomplete
              value={selectedBankAccount}
              onChange={onBankAccountChange}
              options={bankAccountOptions}
              getOptionLabel={(option) =>
                option?.id == null
                  ? option.accountName || ''
                  : `${option.accountCode || ''} — ${option.accountName || ''}`
              }
              isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="اختر الحساب"
                  size="small"
                  placeholder="حساب فرعي"
                  sx={{
                    '& .MuiInputLabel-root': { color: isDarkMode ? 'text.secondary' : 'inherit' },
                    '& .MuiOutlinedInput-root input': { color: isDarkMode ? 'text.primary' : 'inherit' },
                  }}
                />
              )}
              sx={{ width: 300, minWidth: 300, maxWidth: '100%' }}
            />
          </Grid>
        )}
        {showTransactionCount && (
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {transactionCount} قيد
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
