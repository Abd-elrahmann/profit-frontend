import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';

// Import components
import ClientStats from '../../components/dashboardSections/ClientStats';
import PartnerStats from '../../components/dashboardSections/PartnerStats';
import LoanStats from '../../components/dashboardSections/LoanStats';
import CollectionStats from '../../components/dashboardSections/CollectionStats';

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        bgcolor: '#f6f6f8',
        minHeight: '100vh',
        py: 3,
      }}
    >
      <Helmet>
        <title>لوحة التحكم - النظام المالي</title>
        <meta name="description" content="لوحة التحكم الرئيسية للنظام المالي" />
      </Helmet>

      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant={isSmallScreen ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
                fontWeight: 600,
                minHeight: { xs: 48, sm: 56, md: 64 },
                px: { xs: 1.5, sm: 2, md: 3 },
              },
            }}
          >
            <Tab label="إحصائيات العملاء" />
            <Tab label="إحصائيات الشركاء" />
            <Tab label="إحصائيات السلف والقروض" />
            <Tab label="التحصيل الشهري" />
          </Tabs>
        </Box>

        <TabPanel value={value} index={0}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <ClientStats />
          </Box>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <PartnerStats />
          </Box>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <LoanStats />
          </Box>
        </TabPanel>

        <TabPanel value={value} index={3}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <CollectionStats />
          </Box>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Dashboard;