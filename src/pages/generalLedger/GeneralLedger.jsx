import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Search,
  Download,
  Print,
  Share,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import Api from '../../config/Api';
import dayjs from 'dayjs';
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';
import GeneralLedgerSearch from '../../components/modals/GeneralLedgerSearch';
import { exportGeneralLedgerToPDF, exportGeneralLedgerToExcel } from '../../utilities/GeneralLedgerExporter';
import { notifySuccess, notifyError } from '../../utilities/toastify';

// API function to get account details with journals
const getAccountLedger = async (accountId, fromDate = null, toDate = null) => {
  const params = new URLSearchParams();
  if (fromDate) {
    params.append('fromDate', fromDate);
  }
  if (toDate) {
    params.append('toDate', toDate);
  }
  
  const queryString = params.toString();
  const response = await Api.get(`/api/accounts/${accountId}${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

export default function GeneralLedger() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [exportLoading, setExportLoading] = useState({ pdf: false, excel: false });

  // Query for account ledger data
  const { data: ledgerData, isLoading: isLoadingLedger, error } = useQuery({
    queryKey: ['account-ledger', searchParams?.account?.id, searchParams?.fromDate, searchParams?.toDate],
    queryFn: () => 
      searchParams ? 
      getAccountLedger(searchParams.account.id, searchParams.fromDate, searchParams.toDate) : 
      null,
    enabled: !!searchParams,
    retry: 1,
  });

  const handleSearch = (params) => {
    setSearchParams(params);
  };

  const handleExportPDF = async () => {
    if (!ledgerData || !searchParams) return;
    
    setExportLoading(prev => ({ ...prev, pdf: true }));
    try {
      await exportGeneralLedgerToPDF(ledgerData, searchParams.account, searchParams);
      notifySuccess("تم تصدير دفتر الأستاذ بصيغة PDF بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error("PDF Export Error:", error);
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleExportExcel = async () => {
    if (!ledgerData || !searchParams) return;
    
    setExportLoading(prev => ({ ...prev, excel: true }));
    try {
      await exportGeneralLedgerToExcel(ledgerData, searchParams.account, searchParams);
      notifySuccess("تم تصدير دفتر الأستاذ بصيغة Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error("Excel Export Error:", error);
    } finally {
      setExportLoading(prev => ({ ...prev, excel: false }));
    }
  };

  // Calculate summary statistics
  const totalDebit = ledgerData?.journals?.reduce((sum, journal) => sum + (journal.debit || 0), 0) || 0;
  const totalCredit = ledgerData?.journals?.reduce((sum, journal) => sum + (journal.credit || 0), 0) || 0;
  const closingBalance = ledgerData?.account?.balance || 0;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Helmet>
        <title>دفتر الأستاذ العام</title>
        <meta name="description" content="دفتر الأستاذ العام للمحاسبة" />
      </Helmet>

      {/* Toolbar */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Export Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={handleExportPDF}
                disabled={exportLoading.pdf || !ledgerData}
                sx={{
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': {
                    borderColor: '#b71c1c',
                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                  }
                }}
              >
                {exportLoading.pdf ? (
                  <CircularProgress size={20} sx={{ color: '#d32f2f' }} />
                ) : (
                  'PDF'
                )}
              </Button>
              <Button
                variant="outlined"
                startIcon={<TableChart />}
                onClick={handleExportExcel}
                disabled={exportLoading.excel || !ledgerData}
                sx={{
                  borderColor: '#2e7d32',
                  color: '#2e7d32',
                  '&:hover': {
                    borderColor: '#1b5e20',
                    backgroundColor: 'rgba(46, 125, 50, 0.04)'
                  }
                }}
              >
                {exportLoading.excel ? (
                  <CircularProgress size={20} sx={{ color: '#2e7d32' }} />
                ) : (
                  'Excel'
                )}
              </Button>
            </Box>

            {/* Search Button */}
            <Button
              variant="contained"
              startIcon={<Search sx={{marginLeft: '10px'}} />}
              onClick={() => setSearchModalOpen(true)}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
                minWidth: 120
              }}
            >
              بحث
            </Button>
          </Box>

          {/* Selected Account Info */}
          {searchParams && (
            <Box sx={{ mt: 2, p: 2, borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {searchParams.account.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchParams.account.code} - {getAccountTypeArabic(searchParams.account.type)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Chip 
                      label={`من: ${searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'البداية'}`}
                      variant="outlined"
                    />
                    <Chip 
                      label={`إلى: ${searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'النهاية'}`}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {!searchParams ? (
          // Show table header instead of empty state
          <Paper sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '150px' }}>
                      التاريخ
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                      المرجع
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', minWidth: '200px' }}>
                      الوصف
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                      مدين
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                      دائن
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                      الرصيد
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                      الحالة
                    </StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  <StyledTableRow>
                    <StyledTableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        دفتر الأستاذ العام
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        اختر حساباً من خلال زر البحث لعرض القيود المحاسبية
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : isLoadingLedger ? (
          // Loading State
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          // Error State
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            حدث خطأ في تحميل بيانات الحساب: {error.message}
          </Alert>
        ) : (
          // Data State
          <Box>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {totalDebit.toLocaleString('en-US')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي المدين
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {totalCredit.toLocaleString('en-US')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الدائن
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {ledgerData.journals?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      عدد القيود
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" 
                      color={closingBalance >= 0 ? 'primary.main' : 'error.main'}>
                      {closingBalance.toLocaleString('en-US')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      الرصيد الختامي
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Journals Table */}
            <Paper sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '150px' }}>
                        التاريخ
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                        المرجع
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ fontWeight: 'bold', minWidth: '200px' }}>
                        الوصف
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                        مدين
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                        دائن
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                        الرصيد
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                        الحالة
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {ledgerData.journals?.map((journal) => (
                      <StyledTableRow key={journal.id} hover>
                        <StyledTableCell align="center">
                          <Typography variant="body2">
                            {dayjs(journal.date).format('DD/MM/YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(journal.date).format('HH:mm')}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography variant="body2" fontWeight="500" color="primary">
                            {journal.reference}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {journal.description}
                          </Typography>
                          {journal.postedBy && (
                            <Typography variant="caption" color="text.secondary">
                              بواسطة: {journal.postedBy}
                            </Typography>
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {journal.debit > 0 ? (
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {journal.debit.toLocaleString('en-US')}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              0
                            </Typography>
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {journal.credit > 0 ? (
                            <Typography variant="body2" fontWeight="bold" color="error.main">
                              {journal.credit.toLocaleString('en-US')}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              0
                            </Typography>
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Typography variant="body2" fontWeight="bold"
                            color={journal.balance >= 0 ? 'primary.main' : 'error.main'}>
                            {journal.balance.toLocaleString('en-US')}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Chip 
                            label={journal.status === 'POSTED' ? 'مرحل' : 'مسودة'} 
                            size="small"
                            color={journal.status === 'POSTED' ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: '500' }}
                          />
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {(!ledgerData.journals || ledgerData.journals.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    لا توجد قيود في الفترة المحددة
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    لم يتم تسجيل أي قيود للحساب في الفترة المحددة
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Search Modal */}
      <GeneralLedgerSearch
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSearch={handleSearch}
      />
    </Box>
  );
};

const getAccountTypeArabic = (type) => {
  const typeMap = {
    'ASSET': 'أصول',
    'LIABILITY': 'خصوم',
    'EQUITY': 'حقوق ملكية',
    'REVENUE': 'إيرادات',
    'EXPENSE': 'مصروفات'
  };
  return typeMap[type] || type;
};