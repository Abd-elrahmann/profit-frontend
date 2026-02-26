import React from 'react';
import {
  Paper,
  Grid,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { CalendarMonth, CalendarToday } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { MONTHS } from './constants';

const selectSx = (theme) => ({
  bgcolor: theme.palette.background.default,
  '& .MuiSelect-select': {
    fontWeight: 500,
    color: theme.palette.text.primary,
    textAlign: 'center',
  },
});

const inputSx = (theme) => ({
  bgcolor: theme.palette.background.default,
  '& .MuiInputBase-input': {
    fontWeight: 500,
    color: theme.palette.text.primary,
    textAlign: 'center',
  },
});

const IncomeStatementPeriodFilter = ({
  periodType,
  onPeriodTypeChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  selectedPeriodId,
  onPeriodChange,
  accountingPeriods,
  years,
  isSmallScreen = false,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'transparent',
        borderRadius: 2,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={2}>
          <Select
            fullWidth
            size="small"
            value={periodType}
            onChange={(e) => onPeriodTypeChange(e.target.value)}
            sx={selectSx(theme)}
          >
            <MenuItem value="period" sx={{ textAlign: 'center' }}>فترة محاسبية</MenuItem>
            <MenuItem value="monthly" sx={{ textAlign: 'center' }}>شهري</MenuItem>
            <MenuItem value="custom" sx={{ textAlign: 'center' }}>فترة مخصصة</MenuItem>
          </Select>
        </Grid>

        {periodType === 'period' && (
          <Grid item xs={12} md={3}>
            <Autocomplete
              fullWidth
              size="small"
              value={accountingPeriods.find((p) => p.id === selectedPeriodId) || null}
              onChange={(event, newValue) => onPeriodChange(newValue?.id || '')}
              options={accountingPeriods}
              getOptionLabel={(option) =>
                option?.name
                  ? `${option.name} (${option.startDateHijri || (option.startDate ? dayjs(option.startDate).format('DD/MM/YYYY') : '')} - ${option.endDateHijri || (option.endDate ? dayjs(option.endDate).format('DD/MM/YYYY') : 'مفتوحة')})`
                  : ''
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="اختر الفترة المحاسبية"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: isSmallScreen ? '100%' : '350px', maxWidth: '100%', ...inputSx(theme) }}
                />
              )}
            />
          </Grid>
        )}

        {periodType === 'monthly' && (
          <Grid item xs={12} md={3}>
            <Select
              fullWidth
              size="small"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              sx={selectSx(theme)}
            >
              {MONTHS.map((month, index) => (
                <MenuItem key={index} value={index} sx={{ textAlign: 'center' }}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        )}

        {periodType === 'monthly' && (
          <Grid item xs={12} md={3} sx={{ width: '250px', maxWidth: '100%' }}>
            <Autocomplete
              fullWidth
              size="small"
              value={selectedYear}
              onChange={(event, newValue) => onYearChange(newValue)}
              options={years}
              getOptionLabel={(option) => option.toString()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="اختر السنة"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx(theme)}
                />
              )}
            />
          </Grid>
        )}

        {periodType === 'custom' && (
          <>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="من تاريخ"
                value={fromDate}
                onChange={(newValue) => onFromDateChange(newValue)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    sx: {
                      bgcolor: theme.palette.background.default,
                      '& .MuiInputBase-input': {
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                      },
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="إلى تاريخ"
                value={toDate}
                onChange={(newValue) => onToDateChange(newValue)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    sx: {
                      bgcolor: theme.palette.background.default,
                      '& .MuiInputBase-input': {
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                      },
                    },
                  },
                }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
};

export default React.memo(IncomeStatementPeriodFilter);
