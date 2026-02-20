import React from 'react';
import { Box } from '@mui/material';
import PageSkeleton from '../../../components/PageSkeleton';

const TabPanel = React.memo(({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`dashboard-tabpanel-${index}`}
    aria-labelledby={`dashboard-tab-${index}`}
  >
    {value === index && (
      <Box sx={{ py: 3 }}>
        <React.Suspense fallback={<PageSkeleton type="dashboard" />}>
          {children}
        </React.Suspense>
      </Box>
    )}
  </div>
));

TabPanel.displayName = 'TabPanel';

export default TabPanel;
