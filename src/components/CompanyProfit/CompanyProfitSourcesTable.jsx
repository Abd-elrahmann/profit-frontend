import React from 'react';
import { Box, Typography, Table, TableContainer, TableHead, TableBody } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';

const COLUMNS = [
  { key: 'periodName', label: 'الفترة', format: (v, i) => v || `الفترة ${i + 1}` },
  { key: 'totalPeriodProfit', label: 'إجمالي الأرباح', format: (v) => (v || 0).toLocaleString('en-US') },
  { key: 'companyPercentage', label: 'نسبة الشركة', format: (v) => `${v || 0}%` },
  { key: 'companyProfit', label: 'أرباح الشركة', format: (v) => (v || 0).toLocaleString('en-US'), color: 'primary.main' },
  { key: 'cents', label: 'باقي أرباح الشركاء', format: (v) => (v || 0).toLocaleString('en-US'), color: 'warning.main' },
  { key: 'totalCompany', label: 'إجمالي أرباح الشركة', format: (v) => (v || 0).toLocaleString('en-US'), color: 'success.main' },
];

const CompanyProfitSourcesTable = ({ periods, isSmallScreen }) => {
  if (!periods?.length) return null;

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        مصادر أرباح الشركة
      </Typography>

      <TableContainer sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <StyledTableRow>
              {COLUMNS.map((col) => (
                <StyledTableCell key={col.key} align="center" sx={{ fontWeight: 'bold' }}>
                  {col.label}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {periods.map((period, index) => (
              <StyledTableRow key={index} hover>
                {COLUMNS.map((col) => {
                  const value = period[col.key];
                  const display = col.format ? col.format(value, index) : value;
                  return (
                    <StyledTableCell key={col.key} align="center">
                      <Typography
                        variant="body2"
                        fontWeight={col.color ? 'bold' : 'medium'}
                        {...(col.color && { color: col.color })}
                      >
                        {display}
                      </Typography>
                    </StyledTableCell>
                  );
                })}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default React.memo(CompanyProfitSourcesTable);
