import React from 'react';
import { Box, Tabs, Tab, FormControl, Select, MenuItem } from '@mui/material';
const TAB_LABELS = [
  { value: 0, label: 'كشف المدخرات العام' },
  { value: 1, label: 'صندوق الادخار' },
];
const SavingTabs = ({ activeTab, onTabChange, isMobile, theme }) => {
  if (isMobile) {
    return (
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <Select
            value={activeTab}
            onChange={(e) => onTabChange(Number(e.target.value))}
            sx={{ fontWeight: 'bold', '& .MuiSelect-select': { textAlign: 'right', py: 1.5 } }}
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
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4, overflowX: 'auto' }}>
      <Tabs value={activeTab} onChange={(e, newValue) => onTabChange(newValue)} sx={{ '& .MuiTab-root': { minWidth: 160 } }}>
        {TAB_LABELS.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            sx={{
              fontWeight: 'bold',
              borderBottom: activeTab === tab.value ? `3px solid ${theme.palette.primary.main}` : 'none',
              color: activeTab === tab.value ? theme.palette.primary.main : theme.palette.text.primary,
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};
export default SavingTabs;