import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
const formatCurrency = (amount) => amount?.toLocaleString() ?? '0';
const ZakahPartnerSidebar = ({
  partnerZakahData,
  selectedYear,
  onYearChange,
}) => {
  const currentYearData = Array.isArray(partnerZakahData)
    ? partnerZakahData.find((item) => item.year === selectedYear)
    : partnerZakahData;
  return (
    <div className="w-80 flex-shrink-0 border-r border-primary/10 bg-white dark:bg-background-dark h-full overflow-y-auto">
      <div className="p-6 border-b border-primary/10">
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          ملخص الزكاة
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>رأس المال:</Typography>
            <Typography fontWeight="bold" color="text.primary">
              {formatCurrency(currentYearData?.capitalAmount)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>الزكاة السنوية:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {formatCurrency(currentYearData?.annualZakat)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>الزكاة السنوية الحالية:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {formatCurrency(currentYearData?.currentAnnualZakat)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>المدفوع:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {formatCurrency(currentYearData?.totalPaid)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>المتبقي:</Typography>
            <Typography
              fontWeight="bold"
              color={currentYearData?.remaining > 0 ? 'error.main' : 'primary.main'}
            >
              {formatCurrency(currentYearData?.remaining)}
            </Typography>
          </Box>
        </Stack>
      </div>
      <div className="p-6">
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          السنوات المتاحة
        </Typography>
        <Stack spacing={1}>
          {Array.isArray(partnerZakahData) ? (
            partnerZakahData.map((yearData) => (
              <Button
                key={yearData.year}
                variant={selectedYear === yearData.year ? 'contained' : 'outlined'}
                onClick={() => onYearChange(yearData.year)}
                sx={{ justifyContent: 'flex-start', textAlign: 'right' }}
              >
                {yearData.year} - {formatCurrency(yearData.annualZakat)}
              </Button>
            ))
          ) : (
            <Button variant="contained" sx={{ justifyContent: 'flex-start' }}>
              {selectedYear} - {formatCurrency(currentYearData?.annualZakat)}
            </Button>
          )}
        </Stack>
      </div>
    </div>
  );
};
export default ZakahPartnerSidebar;