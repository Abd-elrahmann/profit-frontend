import React from 'react';
import { Box, Button } from '@mui/material';
const SavingToolbar = ({
  onWithdrawClick,
  onExportPDF,
  onExportExcel,
  isLoading,
  hasData,
}) => {
  const disabled = isLoading || !hasData;
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, auto)' },
        gap: 1.5,
        justifyContent: { sm: 'center' },
      }}
    >
      <Button
        variant="contained"
        color="error"
        onClick={onWithdrawClick}
        disabled={disabled}
        sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
      >
        سحب مبلغ ادخار
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={onExportPDF}
        disabled={disabled}
        sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
      >
        تصدير PDF
      </Button>
      <Button
        variant="outlined"
        color="success"
        onClick={onExportExcel}
        disabled={disabled}
        sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
      >
        تصدير Excel
      </Button>
    </Box>
  );
};
export default SavingToolbar;