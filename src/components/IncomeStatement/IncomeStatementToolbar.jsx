import React from 'react';
import { Stack, Button } from '@mui/material';
import { Print, TableChart, FileUpload } from '@mui/icons-material';

const IncomeStatementToolbar = ({ onPrint, onExportExcel, onExportPDF, isSmallScreen = false }) => (
  <Stack
    direction="row"
    flexWrap="wrap"
    justifyContent={isSmallScreen ? 'center' : 'flex-end'}
    sx={{ gap: 1 }}
  >
    <Button
      variant="outlined"
      startIcon={<Print />}
      onClick={onPrint}
      size="small"
      sx={{
        borderColor: '#F97316',
        color: '#F97316',
        fontWeight: 600,
        '&:hover': {
          borderColor: '#EA580C',
          bgcolor: '#FEF3C7',
          color: '#EA580C',
        },
      }}
    >
      طباعة
    </Button>

    <Button
      variant="contained"
      startIcon={<TableChart />}
      onClick={onExportExcel}
      size="small"
      sx={{
        bgcolor: '#DC2626',
        fontWeight: 600,
        '&:hover': { bgcolor: '#B91C1C' },
      }}
    >
      Excel
    </Button>

    <Button
      variant="contained"
      startIcon={<FileUpload />}
      onClick={onExportPDF}
      size="small"
      sx={{
        bgcolor: '#2E8B45',
        fontWeight: 600,
        '&:hover': { bgcolor: '#257239' },
      }}
    >
      PDF
    </Button>
  </Stack>
);

export default React.memo(IncomeStatementToolbar);
