import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';
import ColumnsVisibilityMenu from '../ui/ColumnsVisibilityMenu';
const iconSx = { marginLeft: '8px' };
const ClientCollectionsToolbar = ({
  isSmallScreen,
  hasExportPermission,
  isLoading,
  hasData,
  onColumnMenuClick,
  onPrint,
  onExportPDF,
  onExportExcel,
  anchorEl,
  onColumnMenuClose,
  columns,
  onColumnToggle,
  onSelectAllColumns,
  onDeselectAllColumns,
}) => {
  if (!hasExportPermission) return null;
  const isDisabled = isLoading || !hasData;
  return (
    <>
      <Stack
        direction={isSmallScreen ? 'column' : 'row'}
        spacing={1}
        sx={{ width: isSmallScreen ? '100%' : 'auto', gap: 2 }}
      >
        <Button
          variant="contained"
          size={isSmallScreen ? 'small' : 'medium'}
          color="warning"
          startIcon={<ViewColumnIcon sx={iconSx} />}
          onClick={onColumnMenuClick}
          fullWidth={isSmallScreen}
          sx={{ fontWeight: 'bold' }}
        >
          الأعمدة
        </Button>
        <Button
          variant="contained"
          size={isSmallScreen ? 'small' : 'medium'}
          color="primary"
          startIcon={<PrintIcon sx={iconSx} />}
          onClick={onPrint}
          disabled={isDisabled}
          fullWidth={isSmallScreen}
          sx={{ fontWeight: 'bold' }}
        >
          طباعة
        </Button>
        <Button
          variant="contained"
          size={isSmallScreen ? 'small' : 'medium'}
          color="error"
          startIcon={<FileDownloadIcon sx={iconSx} />}
          onClick={onExportPDF}
          disabled={isDisabled}
          fullWidth={isSmallScreen}
          sx={{ fontWeight: 'bold' }}
        >
          تصدير PDF
        </Button>
        <Button
          variant="contained"
          size={isSmallScreen ? 'small' : 'medium'}
          color="success"
          startIcon={<FileDownloadIcon sx={iconSx} />}
          onClick={onExportExcel}
          disabled={isDisabled}
          fullWidth={isSmallScreen}
          sx={{ fontWeight: 'bold' }}
        >
          تصدير Excel
        </Button>
      </Stack>
      <ColumnsVisibilityMenu
        anchorEl={anchorEl}
        onClose={onColumnMenuClose}
        columns={columns}
        onColumnToggle={onColumnToggle}
        onSelectAll={onSelectAllColumns}
        onDeselectAll={onDeselectAllColumns}
        isSmallScreen={isSmallScreen}
      />
    </>
  );
};
export default React.memo(ClientCollectionsToolbar);