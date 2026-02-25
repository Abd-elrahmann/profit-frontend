import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { ExpandMore, MonetizationOn, TrendingUp as TrendingUpIcon, MoneyOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import {
  formatNumber,
  formatCapitalNumber,
  negformatCapitalNumber,
  getChipColor,
} from './incomeStatementUtils';

const accordionSx = (theme, color) => ({
  mb: 2,
  borderRadius: 2,
  '&:before': { display: 'none' },
  boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(255,255,255,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
});

const summarySx = (theme, color) => ({
  bgcolor: theme.palette[color].main + '08',
  borderRadius: 2,
  '&:hover': { bgcolor: theme.palette[color].main + '12' },
});

const IncomeStatementDetailsSection = ({ incomeData }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 700, color: theme.palette.text.primary }}>
        من أين جاء الربح؟
      </Typography>
      <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: theme.palette.text.secondary }}>
        تفاصيل مصادر الدخل والمصروفات - اضغط على أي قسم لرؤية التفاصيل الكاملة
      </Typography>

      {/* Capital Section */}
      <Accordion defaultExpanded={false} sx={accordionSx(theme, 'primary')}>
        <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx(theme, 'primary')}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <MonetizationOn sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 28 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                رأس المال المدفوع الفعلي
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                إجمالي رأس المال المساهم به في الشركة
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: theme.palette.primary.main }}>
              {formatNumber(incomeData.totalCapital)}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.main + '05' }}>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الشريك</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>رأس المال المدفوع</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>رأس المال الأصلي</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>رأس المال الجديد</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الأرباح</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incomeData.capitalByPartner?.map((partner, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>{partner.partnerName}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: theme.palette.text.secondary }}>
                      {formatCapitalNumber(partner.totalAmount)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>
                      {negformatCapitalNumber(partner.capitalAmount)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: theme.palette.warning.main }}>
                      {formatCapitalNumber(partner.newCapitalAmount)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: theme.palette.success.main }}>
                      {formatCapitalNumber(partner.totalProfit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Revenue Section */}
      <Accordion defaultExpanded={true} sx={accordionSx(theme, 'success')}>
        <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx(theme, 'success')}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 2, fontSize: 28 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                الإيرادات التشغيلية
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                إجمالي الدخل المحقق من العملاء خلال الفترة
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: theme.palette.success.main }}>
              {formatNumber(incomeData.revenues?.total || 0)}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{ p: 2, bgcolor: theme.palette.success.main + '03' }}>
            <Typography sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
              إيرادات العملاء
            </Typography>
            {incomeData.revenueByClient?.map((client, clientIndex) => (
              <Accordion
                key={clientIndex}
                sx={{
                  mb: 1,
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 48 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                    <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>{client.clientName}</Typography>
                    <Typography sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                      {formatNumber(client.totalRevenue)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>الوصف</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>المبلغ</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>التاريخ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {client.companyRevenue > 0 && (
                          <TableRow sx={{ bgcolor: theme.palette.primary.main + '05', '&:hover': { bgcolor: theme.palette.primary.main + '08' } }}>
                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>
                              حصة الشركة
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>
                              {formatNumber(client.companyRevenue)}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', color: theme.palette.text.secondary }}>
                              -
                            </TableCell>
                          </TableRow>
                        )}
                        {client.partnersRevenue > 0 && (
                          <TableRow sx={{ bgcolor: theme.palette.primary.main + '05', '&:hover': { bgcolor: theme.palette.primary.main + '08' } }}>
                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>
                              حصة الشركاء
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>
                              {formatNumber(client.partnersRevenue)}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', color: theme.palette.text.secondary }}>
                              -
                            </TableCell>
                          </TableRow>
                        )}
                        {client.entries?.map((entry, entryIndex) => (
                          <TableRow key={entryIndex} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>{entry.description}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 500 }}>
                              {formatNumber(entry.rawShare || entry.amount)}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                              {dayjs(entry.date).format('DD/MM/YYYY')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Expenses Section */}
      <Accordion defaultExpanded={true} sx={accordionSx(theme, 'error')}>
        <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx(theme, 'error')}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <MoneyOff sx={{ color: theme.palette.error.main, mr: 2, fontSize: 28 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                المصروفات التشغيلية
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                إجمالي المصروفات والنفقات خلال الفترة
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: theme.palette.error.main }}>
              {formatNumber(incomeData.totalExpenses)}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.error.main + '05' }}>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الوصف</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>النوع</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الموظف</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>المبلغ</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>التاريخ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incomeData.detailedExpenses?.map((expense, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                    <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                      {expense.description || expense.type}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={expense.type}
                        size="small"
                        color={getChipColor(expense.type)}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>{expense.employee || '-'}</TableCell>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: theme.palette.error.main }}>
                      {formatNumber(expense.amount)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                      {dayjs(expense.createdAt).format('DD/MM/YYYY')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default React.memo(IncomeStatementDetailsSection);
