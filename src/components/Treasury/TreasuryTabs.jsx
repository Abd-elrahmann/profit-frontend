import React from 'react';
import { Box, Tabs, Tab, FormControl, Select, MenuItem } from '@mui/material';
import { TrendingUp, AccountBalance } from '@mui/icons-material';

const TAB_LABELS = [
  { value: 0, label: 'الصندوق العام' },
  { value: 1, label: 'الصندوق الخاص (رؤوس الأموال الجديدة)' },
  { value: 2, label: 'سجل القيود' },
];

export default function TreasuryTabs({ value, onChange, isSmallScreen, isDarkMode }) {
  if (isSmallScreen) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <FormControl size="small" sx={{ minWidth: 220, maxWidth: '100%' }} fullWidth>
          <Select
            value={value}
            onChange={(e) => onChange(null, e.target.value)}
            sx={{ '& .MuiSelect-select': { textAlign: 'center', py: 1.25 } }}
          >
            {TAB_LABELS.map((tab) => (
              <MenuItem key={tab.value} value={tab.value}>
                {tab.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }

  return (
    <Tabs
      value={value}
      onChange={onChange}
      textColor="primary"
      sx={{
        flex: 1,
        px: 2,
        '& .MuiTab-root': {
          fontWeight: '600',
          fontSize: '0.95rem',
          py: 2,
          minHeight: '60px',
        },
      }}
    >
      <Tab
        label="الصندوق العام"
        icon={<TrendingUp />}
        iconPosition="start"
        sx={{
          color: value === 0 ? 'primary.main' : isDarkMode ? 'text.secondary' : 'black',
        }}
      />
      <Tab
        label="الصندوق الخاص (رؤوس الأموال الجديدة)"
        icon={<AccountBalance />}
        iconPosition="start"
        sx={{
          color: value === 1 ? 'primary.main' : isDarkMode ? 'text.secondary' : 'black',
        }}
      />
      <Tab
        label="سجل القيود"
        icon={<AccountBalance />}
        iconPosition="start"
        sx={{
          color: value === 2 ? 'primary.main' : isDarkMode ? 'text.secondary' : 'black',
        }}
      />
    </Tabs>
  );
}
