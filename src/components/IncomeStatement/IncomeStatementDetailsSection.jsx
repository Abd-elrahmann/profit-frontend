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
  Card,
  CardContent,
  Stack,
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

const IncomeStatementDetailsSection = ({ incomeData, isSmallScreen = false }) => {
  const theme = useTheme();

  const accordionSummarySx = (color) => ({
    ...summarySx(theme, color),
    flexDirection: isSmallScreen ? 'column' : 'row',
    alignItems: isSmallScreen ? 'flex-start' : 'center',
  });

  return (
    <Box sx={{ mb: 3, overflowX: 'auto' }}>
      <Typography
        variant="h5"
        sx={{
          textAlign: 'center',
          mb: 3,
          fontWeight: 700,
          color: theme.palette.text.primary,
          fontSize: { xs: '1.25rem', md: '1.5rem' },
        }}
      >
        من أين جاء الربح؟
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          mb: 4,
          color: theme.palette.text.secondary,
          fontSize: { xs: '0.875rem', md: '1rem' },
          px: { xs: 1, md: 0 },
        }}
      >
        تفاصيل مصادر الدخل والمصروفات - اضغط على أي قسم لرؤية التفاصيل الكاملة
      </Typography>

      {/* Capital Section */}
      <Accordion defaultExpanded={false} sx={accordionSx(theme, 'primary')}>
        <AccordionSummary expandIcon={<ExpandMore />} sx={accordionSummarySx('primary')}>
          <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', alignItems: isSmallScreen ? 'flex-start' : 'center', width: '100%', gap: isSmallScreen ? 1 : 0 }}>
            <MonetizationOn sx={{ color: theme.palette.primary.main, mr: isSmallScreen ? 0 : 2, fontSize: { xs: 24, md: 28 } }} />
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
          {isSmallScreen ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {incomeData.capitalByPartner?.map((partner, index) => (
                <Card key={index} variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1.5, fontSize: '0.95rem' }}>
                      {partner.partnerName}
                    </Typography>
                    <Stack spacing={0.75}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">رأس المال المدفوع</Typography>
                        <Typography variant="body2" fontWeight={600}>{formatCapitalNumber(partner.totalAmount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">رأس المال الأصلي</Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.main">{negformatCapitalNumber(partner.capitalAmount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">رأس المال الجديد</Typography>
                        <Typography variant="body2" fontWeight={600} color="warning.main">{formatCapitalNumber(partner.newCapitalAmount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">الأرباح</Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">{formatCapitalNumber(partner.totalProfit)}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
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
          )}
        </AccordionDetails>
      </Accordion>

      {/* Revenue Section */}
      <Accordion defaultExpanded={true} sx={accordionSx(theme, 'success')}>
        <AccordionSummary expandIcon={<ExpandMore />} sx={accordionSummarySx('success')}>
          <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', alignItems: isSmallScreen ? 'flex-start' : 'center', width: '100%', gap: isSmallScreen ? 1 : 0 }}>
            <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: isSmallScreen ? 0 : 2, fontSize: 28 }} />
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
          <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: theme.palette.success.main + '03' }}>
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
                  {isSmallScreen ? (
                    <Stack spacing={1}>
                      {client.companyRevenue > 0 && (
                        <Card variant="outlined" sx={{ borderRadius: 1, bgcolor: theme.palette.primary.main + '05' }}>
                          <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight={600} color="primary.main">حصة الشركة</Typography>
                              <Typography variant="body2" fontWeight={600} color="primary.main">{formatNumber(client.companyRevenue)}</Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                      {client.partnersRevenue > 0 && (
                        <Card variant="outlined" sx={{ borderRadius: 1, bgcolor: theme.palette.primary.main + '05' }}>
                          <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight={600} color="primary.main">حصة الشركاء</Typography>
                              <Typography variant="body2" fontWeight={600} color="primary.main">{formatNumber(client.partnersRevenue)}</Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                      {client.entries?.map((entry, entryIndex) => (
                        <Card key={entryIndex} variant="outlined" sx={{ borderRadius: 1 }}>
                          <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">الوصف</Typography>
                              <Typography variant="body2" fontWeight={500}>{entry.description}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">المبلغ</Typography>
                              <Typography variant="body2" fontWeight={500}>{formatNumber(entry.rawShare || entry.amount)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">التاريخ</Typography>
                              <Typography variant="body2">{dayjs(entry.date).format('DD/MM/YYYY')}</Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
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
                              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>حصة الشركة</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>{formatNumber(client.companyRevenue)}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', color: theme.palette.text.secondary }}>-</TableCell>
                            </TableRow>
                          )}
                          {client.partnersRevenue > 0 && (
                            <TableRow sx={{ bgcolor: theme.palette.primary.main + '05', '&:hover': { bgcolor: theme.palette.primary.main + '08' } }}>
                              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>حصة الشركاء</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>{formatNumber(client.partnersRevenue)}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', color: theme.palette.text.secondary }}>-</TableCell>
                            </TableRow>
                          )}
                          {client.entries?.map((entry, entryIndex) => (
                            <TableRow key={entryIndex} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>{entry.description}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 500 }}>{formatNumber(entry.rawShare || entry.amount)}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>{dayjs(entry.date).format('DD/MM/YYYY')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Expenses Section */}
      <Accordion defaultExpanded={true} sx={accordionSx(theme, 'error')}>
        <AccordionSummary expandIcon={<ExpandMore />} sx={accordionSummarySx('error')}>
          <Box sx={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', alignItems: isSmallScreen ? 'flex-start' : 'center', width: '100%', gap: isSmallScreen ? 1 : 0 }}>
            <MoneyOff sx={{ color: theme.palette.error.main, mr: isSmallScreen ? 0 : 2, fontSize: 28 }} />
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
          {isSmallScreen ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {incomeData.detailedExpenses?.map((expense, index) => (
                <Card key={index} variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontWeight: 600, color: theme.palette.error.main, mb: 1.5, fontSize: '0.95rem' }}>
                      {expense.description || expense.type}
                    </Typography>
                    <Stack spacing={0.75}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">النوع</Typography>
                        <Chip label={expense.type} size="small" color={getChipColor(expense.type)} sx={{ fontSize: '0.7rem' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">الموظف</Typography>
                        <Typography variant="body2" fontWeight={500}>{expense.employee || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">المبلغ</Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">{formatNumber(expense.amount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">التاريخ</Typography>
                        <Typography variant="body2">{dayjs(expense.createdAt).format('DD/MM/YYYY')}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
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
                      <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>{expense.description || expense.type}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip label={expense.type} size="small" color={getChipColor(expense.type)} sx={{ fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>{expense.employee || '-'}</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: theme.palette.error.main }}>{formatNumber(expense.amount)}</TableCell>
                      <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>{dayjs(expense.createdAt).format('DD/MM/YYYY')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default React.memo(IncomeStatementDetailsSection);
