import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { TAB_CONFIG } from './constants';

const ClientCollectionsTabs = ({ value, onChange, isSmallScreen }) => (
  <Tabs
    value={value}
    onChange={(e, newValue) => onChange(newValue)}
    variant={isSmallScreen ? 'fullWidth' : 'standard'}
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

export default React.memo(ClientCollectionsTabs);
