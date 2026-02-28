import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { PictureAsPdf, TableChart, Search, RestartAlt } from '@mui/icons-material';
const iconSx = { marginLeft: '10px' };
const GeneralLedgerToolbar = ({
  isSmallScreen,
  hasExportPermission,
  searchParams,
  ledgerData,
  exportLoading,
  onExportPDF,
  onExportExcel,
  onReset,
  onSearchClick,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: isSmallScreen ? 'column' : 'row',
      gap: 2,
      justifyContent: 'space-between',
      alignItems: isSmallScreen ? 'stretch' : 'center',
    }}
  >
    {hasExportPermission && (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: isSmallScreen ? 'center' : 'flex-start',
          order: isSmallScreen ? 2 : 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={
            exportLoading.pdf ? (
              <CircularProgress size={20} sx={{ color: '#d32f2f' }} />
            ) : (
              <PictureAsPdf sx={iconSx} />
            )
          }
          onClick={onExportPDF}
          disabled={exportLoading.pdf || !ledgerData}
          size={isSmallScreen ? 'small' : 'medium'}
          sx={{
            borderColor: '#d32f2f',
            color: '#d32f2f',
            '&:hover': {
              borderColor: '#b71c1c',
              backgroundColor: 'rgba(211, 47, 47, 0.04)',
            },
          }}
        >
          PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={
            exportLoading.excel ? (
              <CircularProgress size={20} sx={{ color: '#2e7d32' }} />
            ) : (
              <TableChart sx={iconSx} />
            )
          }
          onClick={onExportExcel}
          disabled={exportLoading.excel || !ledgerData}
          size={isSmallScreen ? 'small' : 'medium'}
          sx={{
            borderColor: '#2e7d32',
            color: '#2e7d32',
            '&:hover': {
              borderColor: '#1b5e20',
              backgroundColor: 'rgba(46, 125, 50, 0.04)',
            },
          }}
        >
          Excel
        </Button>
      </Box>
    )}
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: isSmallScreen ? 'center' : 'flex-end',
        order: isSmallScreen ? 1 : 2,
      }}
    >
      {searchParams && (
        <Button
          variant="outlined"
          startIcon={<RestartAlt sx={iconSx} />}
          onClick={onReset}
          size={isSmallScreen ? 'small' : 'medium'}
          sx={{
            borderColor: 'warning.main',
            color: 'warning.main',
            '&:hover': {
              borderColor: 'warning.dark',
              backgroundColor: 'rgba(237, 108, 2, 0.04)',
            },
          }}
        >
          {isSmallScreen ? 'إعادة' : 'إعادة تعيين'}
        </Button>
      )}
      <Button
        variant="contained"
        startIcon={<Search sx={iconSx} />}
        onClick={onSearchClick}
        size={isSmallScreen ? 'small' : 'medium'}
        sx={{
          bgcolor: 'primary.main',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        بحث
      </Button>
    </Box>
  </Box>
);
export default React.memo(GeneralLedgerToolbar);