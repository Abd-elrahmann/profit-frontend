import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
const PERIOD_OPTIONS = [
  { value: 'all', label: 'الكل' },
  { value: 'daily', label: 'يومي' },
  { value: 'monthly', label: 'شهري' },
  { value: 'yearly', label: 'سنوي' },
];
const PeriodFilter = React.memo(({ value, onChange, sx = {} }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      mb: { xs: 3, sm: 4, md: 5 },
      width: '100%',
      maxWidth: '1200px',
      ...sx,
    }}
  >
    <FormControl sx={{ minWidth: { xs: 120, sm: 140 } }} size="small">
      <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>الفترة</InputLabel>
      <Select
        value={value}
        label="الفترة"
        onChange={(e) => onChange(e.target.value)}
        size="small"
        sx={{
          borderRadius: 2,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
        }}
      >
        {PERIOD_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Box>
));
PeriodFilter.displayName = 'PeriodFilter';
export default PeriodFilter;