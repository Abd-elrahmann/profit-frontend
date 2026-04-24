import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { TableChart } from '@mui/icons-material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
export default function TreasuryExportButtons({
  tab,
  isExporting,
  hasData,
  hasJournals,
  onExportStatisticsExcel,
  onExportExcel,
  onExportPdf,
  isSmallScreen,
}) {
  if (tab === 0 || tab === 1) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
        <Button
          variant="outlined"
          startIcon={
            isExporting ? <CircularProgress size={16} /> : <TableChart sx={{ marginLeft: '5px' }} />
          }
          onClick={onExportStatisticsExcel}
          disabled={isExporting || !hasData}
          size={isSmallScreen ? 'small' : 'medium'}
          sx={{ color: 'success.main', borderColor: 'success.main' }}
        >
          {isSmallScreen ? 'Excel' : 'تصدير إحصائيات Excel'}
        </Button>
      </Box>
    );
  }
  if (tab === 2) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
        <Button
          variant="outlined"
          startIcon={isExporting ? <CircularProgress size={16} /> : <PictureAsPdfIcon sx={{ marginLeft: '5px' }} />}
          onClick={onExportPdf}
          disabled={isExporting || !hasJournals}
          size={isSmallScreen ? 'small' : 'medium'}
          sx={{ color: 'error.main', borderColor: 'error.main' }}
        >
          {isSmallScreen ? 'PDF' : 'تصدير PDF'}
        </Button>
        <Button
          variant="outlined"
          startIcon={
            isExporting ? <CircularProgress size={16} /> : <TableChart sx={{ marginLeft: '5px' }} />
          }
          onClick={onExportExcel}
          disabled={isExporting || !hasJournals}
          size={isSmallScreen ? 'small' : 'medium'}
          sx={{ color: 'success.main', borderColor: 'success.main' }}
        >
          {isSmallScreen ? 'Excel' : 'تصدير Excel'}
        </Button>
      </Box>
    );
  }
  return null;
}
