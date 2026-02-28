import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
export default function InstallmentsStatusFilter({ value, onChange, options, fullWidth = false }) {
  return (
    <FormControl size="small" sx={{ minWidth: fullWidth ? 0 : 180, width: fullWidth ? '100%' : 'auto' }}>
      <InputLabel id="installments-status-filter-label">فلتر الحالة</InputLabel>
      <Select
        labelId="installments-status-filter-label"
        id="installments-status-filter"
        value={value}
        label="فلتر الحالة"
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}