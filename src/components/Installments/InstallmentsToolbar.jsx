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
}) {
  const showEarlyPayment =
    !isSettlementCompleted && hasPendingInstallments && hasEarlyPaymentPermission;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
      <Button
        variant="contained"
        startIcon={<PDFIcon sx={{ marginLeft: '8px' }} />}
        onClick={onExportPDF}
        disabled={isExporting}
        sx={{
          bgcolor: '#d32f2f',
          '&:hover': { bgcolor: '#b71c1c' },
          height: '36px',
          fontSize: '14px',
          fontWeight: 'bold',
          minWidth: '150px',
          borderRadius: 2,
        }}
      >
        تصدير PDF
        {isExporting && (
          <CircularProgress size={14} color="inherit" style={{ marginRight: 8 }} />
        )}
      </Button>
      <Button
        variant="outlined"
        startIcon={<ExcelIcon sx={{ marginLeft: '8px' }} />}
        onClick={onExportExcel}
        disabled={isExporting}
        sx={{
          borderColor: 'success.main',
          color: 'success.main',
          '&:hover': {
            bgcolor: 'success.50',
            borderColor: 'success.dark',
          },
          height: '36px',
          fontSize: '14px',
          fontWeight: 'bold',
          minWidth: '150px',
          borderRadius: 2,
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
          onClick={onEarlyPayment}
          sx={{
            bgcolor: 'success.main',
            '&:hover': { bgcolor: 'success.dark' },
            height: '36px',
            fontSize: '14px',
            fontWeight: 'bold',
            minWidth: '150px',
            borderRadius: 2,
          }}
        >
          سداد مبكر
        </Button>
      )}
    </Box>
  );
}
