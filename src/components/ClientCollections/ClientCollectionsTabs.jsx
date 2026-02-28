import React from 'react';
import { Tabs, Tab, Box, FormControl, Select, MenuItem } from '@mui/material';
import { TAB_CONFIG } from './constants';
const ClientCollectionsTabs = ({ value, onChange, isSmallScreen }) => {
  if (isSmallScreen) {
    return (
      <Box sx={{ width: '100%', maxWidth: 320, alignSelf: 'center' }}>
        <FormControl fullWidth size="small">
          <Select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            sx={{ '& .MuiSelect-select': { textAlign: 'center', py: 1.25 } }}
          >
            <MenuItem value={0}>{TAB_CONFIG.ACTIVE.shortLabel}</MenuItem>
            <MenuItem value={1}>{TAB_CONFIG.COMPLETE.shortLabel}</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  }
  return (
    <Tabs
      value={value}
      onChange={(e, newValue) => onChange(newValue)}
      variant="standard"
      sx={{ flex: 1 }}
    >
      <Tab
        label={TAB_CONFIG.ACTIVE.label}
        sx={{
          fontWeight: 'bold',
          borderBottom: value === 0 ? `3px solid ${TAB_CONFIG.ACTIVE.color}` : 'none',
          color: value === 0 ? TAB_CONFIG.ACTIVE.color : 'text.primary',
        }}
      />
      <Tab
        label={TAB_CONFIG.COMPLETE.label}
        sx={{
          fontWeight: 'bold',
          borderBottom: value === 1 ? `3px solid ${TAB_CONFIG.COMPLETE.color}` : 'none',
          color: value === 1 ? TAB_CONFIG.COMPLETE.color : 'text.primary',
        }}
      />
    </Tabs>
  );
};
export default React.memo(ClientCollectionsTabs);