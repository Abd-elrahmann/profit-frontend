import React, { useState, useCallback } from 'react';
import { Box, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import {
  exportClientCollectionsToPDF,
  exportClientCollectionsToExcel,
  printClientCollections,
} from '../../utilities/clientCollectionsExporter';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import {
  ClientCollectionsTabs,
  ClientCollectionsToolbar,
  ClientCollectionsTable,
  useClientCollectionsData,
  AVAILABLE_COLUMNS,
} from '../../components/ClientCollections';
const ClientCollections = () => {
  const [clientsTab, setClientsTab] = useState(0);
  const [columns, setColumns] = useState(AVAILABLE_COLUMNS);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isSmallScreen = isMobile || isTablet;
  const { permissions } = usePermissions();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { data: clientsData, isLoading: isClientsLoading } = useClientCollectionsData(clientsTab);
  const handleColumnMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleColumnMenuClose = () => setAnchorEl(null);
  const handleColumnToggle = useCallback((columnId) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId && !col.required ? { ...col, show: !col.show } : col
      )
    );
  }, []);
  const handleSelectAllColumns = useCallback(() => {
    setColumns((prev) => prev.map((col) => ({ ...col, show: true })));
  }, []);
  const handleDeselectAllColumns = useCallback(() => {
    setColumns((prev) =>
      prev.map((col) => (col.required ? col : { ...col, show: false }))
    );
  }, []);
  const status = clientsTab === 0 ? 'ACTIVE' : 'COMPLETE';
  const visibleColumns = columns.filter((col) => col.show);
  const handleExportPDF = useCallback(async () => {
    try {
      await exportClientCollectionsToPDF(clientsData, status, visibleColumns);
      notifySuccess('تم تصدير ملف PDF بنجاح');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      notifyError('حدث خطأ أثناء تصدير ملف PDF');
    }
  }, [clientsData, status, visibleColumns]);
  const handleExportExcel = useCallback(async () => {
    try {
      await exportClientCollectionsToExcel(clientsData, status, visibleColumns);
      notifySuccess('تم تصدير ملف Excel بنجاح');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      notifyError('حدث خطأ أثناء تصدير ملف Excel');
    }
  }, [clientsData, status, visibleColumns]);
  const handlePrint = useCallback(async () => {
    try {
      await printClientCollections(clientsData, status, visibleColumns);
    } catch (error) {
      console.error('Error printing:', error);
      notifyError('حدث خطأ أثناء الطباعة');
    }
  }, [clientsData, status, visibleColumns]);
  const hasExportPermission = permissions.includes('client-report_Export');
  const hasData = Boolean(clientsData?.data?.length);
  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? 'background.default' : '#f6f6f8',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Helmet>
        <title>كشف تحصيل العملاء</title>
        <meta name="description" content="إدارة تحصيل العملاء والمستحقات" />
      </Helmet>
      <Box
        sx={{
          flex: 1,
          p: isSmallScreen ? 2 : 3,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: isSmallScreen ? 'column' : 'row',
                gap: 2,
              }}
            >
              <ClientCollectionsTabs
                value={clientsTab}
                onChange={setClientsTab}
                isSmallScreen={isSmallScreen}
              />
              <ClientCollectionsToolbar
                isSmallScreen={isSmallScreen}
                hasExportPermission={hasExportPermission}
                isLoading={isClientsLoading}
                hasData={hasData}
                onColumnMenuClick={handleColumnMenuClick}
                onPrint={handlePrint}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                anchorEl={anchorEl}
                onColumnMenuClose={handleColumnMenuClose}
                columns={columns}
                onColumnToggle={handleColumnToggle}
                onSelectAllColumns={handleSelectAllColumns}
                onDeselectAllColumns={handleDeselectAllColumns}
              />
            </Box>
          </Box>
          <Paper
            sx={{
              flex: 1,
              width: '100%',
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            <ClientCollectionsTable
              isLoading={isClientsLoading}
              clientsData={clientsData}
              visibleColumns={visibleColumns}
              isSmallScreen={isSmallScreen}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
export default ClientCollections;