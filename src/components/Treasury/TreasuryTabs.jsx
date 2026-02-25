import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { TrendingUp, AccountBalance } from '@mui/icons-material';

export default function TreasuryTabs({ value, onChange, isSmallScreen, isDarkMode }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      textColor="primary"
      sx={{
        flex: 1,
        px: isSmallScreen ? 1 : 2,
        '& .MuiTab-root': {
          fontWeight: '600',
          fontSize: isSmallScreen ? '0.8rem' : '0.95rem',
          py: isSmallScreen ? 1 : 2,
          minHeight: isSmallScreen ? '48px' : '60px',
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
