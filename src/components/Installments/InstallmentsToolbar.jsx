import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { PictureAsPdf as PDFIcon, TableChart as ExcelIcon } from '@mui/icons-material';
export default function InstallmentsToolbar({
  onExportPDF,
  onExportExcel,
  onEarlyPayment,
  isExporting,
  isSettlementCompleted,
  hasPendingInstallments,
  hasEarlyPaymentPermission,
  isSmallScreen = false,
  isMobile = false,
}) {
  const showEarlyPayment =
    !isSettlementCompleted && hasPendingInstallments && hasEarlyPaymentPermission;
  const btnSx = {
    height: isMobile ? '32px' : '38px',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: 'bold',
    minWidth: isSmallScreen ? 0 : '150px',
    borderRadius: 2,
    px: isMobile ? 1.5 : 2,
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: isSmallScreen ? 1 : 2,
        mb: 2,
      }}
    >
      <Button
        variant="contained"
        size={isMobile ? 'small' : 'medium'}
        startIcon={<PDFIcon sx={{ marginLeft: '6px' }} />}
        onClick={onExportPDF}
        disabled={isExporting}
        sx={{
          bgcolor: '#d32f2f',
          '&:hover': { bgcolor: '#b71c1c' },
          ...btnSx,
        }}
      >
        تصدير PDF
        {isExporting && (
          <CircularProgress size={14} color="inherit" style={{ marginRight: 8 }} />
        )}
      </Button>
      <Button
        variant="outlined"
        size={isMobile ? 'small' : 'medium'}
        startIcon={<ExcelIcon sx={{ marginLeft: '6px' }} />}
        onClick={onExportExcel}
        disabled={isExporting}
        sx={{
          borderColor: 'success.main',
          color: 'success.main',
          '&:hover': {
            bgcolor: 'success.50',
            borderColor: 'success.dark',
          },
          ...btnSx,
        }}
      >
        تصدير Excel
        {isExporting && (
          <CircularProgress size={14} color="inherit" style={{ marginRight: 8 }} />
        )}
      </Button>
      {showEarlyPayment && (
        <Button
          variant="contained"
          size={isMobile ? 'small' : 'medium'}
          onClick={onEarlyPayment}
          sx={{
            bgcolor: 'success.main',
            '&:hover': { bgcolor: 'success.dark' },
            ...btnSx,
          }}
        >
          سداد مبكر
        </Button>
      )}
    </Box>
  );
}