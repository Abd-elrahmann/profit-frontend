import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { PictureAsPdf, TableChart } from '@mui/icons-material';
const iconSx = { marginLeft: '10px' };
const CompanyProfitToolbar = ({
  isSmallScreen,
  hasWithdrawPermission,
  hasExportPermission,
  profitData,
  isExporting,
  onWithdrawClick,
  onExportPDF,
  onExportExcel,
  theme,
}) => (
  <Box sx={{ display: 'flex', gap: 1, flexDirection: isSmallScreen ? 'column' : 'row' }}>
    {hasWithdrawPermission && (
      <Button
        variant="contained"
        onClick={onWithdrawClick}
        disabled={!profitData || profitData.availableAmount <= 0}
        sx={{
          minWidth: isSmallScreen ? '100%' : 'auto',
          fontWeight: 'bold',
          '&:hover': {
            bgcolor: theme.palette.primary.main,
            color: 'white',
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        سحب أرباح
      </Button>
    )}
    {hasExportPermission && (
      <>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdf sx={iconSx} />}
          onClick={onExportPDF}
          disabled={isExporting}
          sx={{
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main,
            '&:hover': {
              bgcolor: theme.palette.error.main,
              color: 'white',
              borderColor: theme.palette.error.main,
            },
            '&:disabled': {
              bgcolor: theme.palette.grey[200],
              color: theme.palette.grey[400],
              borderColor: theme.palette.grey[400],
            },
            minWidth: isSmallScreen ? '100%' : 'auto',
          }}
        >
          {isExporting ? <CircularProgress size={16} /> : 'تصدير PDF'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<TableChart sx={iconSx} />}
          onClick={onExportExcel}
          disabled={isExporting}
          sx={{
            color: theme.palette.primary.main,
            borderColor: 'success.main',
            '&:hover': {
              bgcolor: 'success.main',
              color: 'white',
              borderColor: 'success.main',
            },
            '&:disabled': {
              bgcolor: 'grey.200',
              color: 'grey.400',
              borderColor: 'grey.400',
            },
            minWidth: isSmallScreen ? '100%' : 'auto',
          }}
        >
          {isExporting ? <CircularProgress size={16} /> : 'تصدير Excel'}
        </Button>
      </>
    )}
  </Box>
);
export default React.memo(CompanyProfitToolbar);