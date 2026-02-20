import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material/styles';

const tabStyles = (theme) => ({
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTab-root': {
    fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
    fontWeight: 600,
    minHeight: { xs: 48, sm: 56, md: 64 },
    px: { xs: 1.5, sm: 2, md: 3 },
    color: theme.palette.text.primary,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
});

const DashboardTabs = React.memo(({ value, onChange, tabs }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 3 },
        display: 'flex',
        justifyContent: 'center',
        overflowX: 'auto',
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        variant={isSmallScreen ? 'scrollable' : 'standard'}
        scrollButtons="auto"
        sx={tabStyles(theme)}
      >
        {tabs.map((tab) => (
          <Tab key={tab.permission} label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
});

DashboardTabs.displayName = 'DashboardTabs';

export default DashboardTabs;
