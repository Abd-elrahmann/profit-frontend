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
  Pagination,
  Stack,
  useMediaQuery,
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Search,
  Download,
  Print,
  Share,
  RestartAlt,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import Api from '../../config/Api';
import dayjs from 'dayjs';
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';
import GeneralLedgerSearch from '../../components/modals/GeneralLedgerSearch';
import { exportGeneralLedgerToPDF, exportGeneralLedgerToExcel } from '../../utilities/GeneralLedgerExporter';
import { notifySuccess, notifyError } from '../../utilities/toastify';

const getAccountLedger = async (accountId, fromDate = null, toDate = null, page = 1, limit = 10) => {
  const params = new URLSearchParams();
  if (fromDate) {
    params.append('from', fromDate);
  }
  if (toDate) {
    params.append('to', toDate);
  }
  params.append('limit', limit.toString());
  
  const queryString = params.toString();
  const response = await Api.get(`/api/accounts/${accountId}/${page}${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

export default function GeneralLedger() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [exportLoading, setExportLoading] = useState({ pdf: false, excel: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  // Query for account ledger data
  const { data: ledgerData, isLoading: isLoadingLedger, error } = useQuery({
    queryKey: ['account-ledger', searchParams?.account?.id, searchParams?.fromDate, searchParams?.toDate, currentPage, pageLimit],
    queryFn: () => 
      searchParams ? 
      getAccountLedger(searchParams.account.id, searchParams.fromDate, searchParams.toDate, currentPage, pageLimit) : 
      null,
    enabled: !!searchParams,
    retry: 1,
  });

  const handleSearch = (params) => {
    setSearchParams(params);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleReset = () => {
    setSearchParams(null);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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

  const totalDebit = ledgerData?.journals?.reduce((sum, journal) => {
    return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.debit || 0), 0);
  }, 0) || 0;
  
  const totalCredit = ledgerData?.journals?.reduce((sum, journal) => {
    return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.credit || 0), 0);
  }, 0) || 0;
  
  const closingBalance = ledgerData?.account?.balance || 0;

  // Render mobile journal cards
  const renderMobileJournalCards = () => (
    <Stack spacing={2}>
      {ledgerData.journals?.map((journal) => 
        journal.lines.map((line) => (
          <Card key={`${journal.id}-${line.id}`} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      {journal.reference}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(journal.date).format('DD/MM/YYYY')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {dayjs(journal.date).format('HH:mm')}
                    </Typography>
                  </Box>
                  <Chip 
                    label={journal.status === 'POSTED' ? 'مرحل' : 'مسودة'} 
                    size="small"
                    color={journal.status === 'POSTED' ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ fontWeight: '500', minWidth: 60 }}
                  />
                </Box>

                {/* Description */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }} fontWeight="medium">
                    {line.description}
                  </Typography>
                  {journal.postedBy && (
                    <Typography variant="caption" color="text.secondary">
                      بواسطة: {journal.postedBy}
                    </Typography>
                  )}
                </Box>

                {/* Amounts */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      مدين
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      color={line.debit > 0 ? "success.main" : "text.secondary"}
                    >
                      {line.debit > 0 ? line.debit.toLocaleString('en-US') : '0'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      دائن
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      color={line.credit > 0 ? "error.main" : "text.secondary"}
                    >
                      {line.credit > 0 ? line.credit.toLocaleString('en-US') : '0'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      الرصيد
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={line.balance >= 0 ? "primary.main" : "error.main"}
                    >
                      {line.balance.toLocaleString('en-US')}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );

  // Render desktop table
  const renderDesktopTable = () => (
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
          {ledgerData.journals?.map((journal) => 
            journal.lines.map((line) => (
              <StyledTableRow key={`${journal.id}-${line.id}`} hover>
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
                    {line.description}
                  </Typography>
                  {journal.postedBy && (
                    <Typography variant="caption" color="text.secondary">
                      بواسطة: {journal.postedBy}
                    </Typography>
                  )}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {line.debit > 0 ? (
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {line.debit.toLocaleString('en-US')}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      0
                    </Typography>
                  )}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {line.credit > 0 ? (
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {line.credit.toLocaleString('en-US')}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      0
                    </Typography>
                  )}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography variant="body2" fontWeight="bold"
                    color={line.balance >= 0 ? 'primary.main' : 'error.main'}>
                    {line.balance.toLocaleString('en-US')}
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
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f6f8" }}>
      <Helmet>
        <title>دفتر الأستاذ العام</title>
        <meta name="description" content="دفتر الأستاذ العام للمحاسبة" />
      </Helmet>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          p: isSmallScreen ? 2 : 3,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            color="primary"
            sx={{ mb: 2, textAlign: isSmallScreen ? 'center' : 'right' }}
          >
            دفتر الأستاذ العام
          </Typography>

          {/* Toolbar */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isSmallScreen ? 'column' : 'row',
            gap: 2,
            justifyContent: 'space-between',
            alignItems: isSmallScreen ? 'stretch' : 'center',
          }}>
            {/* Export Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              justifyContent: isSmallScreen ? 'center' : 'flex-start',
              order: isSmallScreen ? 2 : 1
            }}>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf sx={{marginLeft:'10px'}} />}
                onClick={handleExportPDF}
                disabled={exportLoading.pdf || !ledgerData}
                size={isSmallScreen ? "small" : "medium"}
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
                startIcon={<TableChart sx={{marginLeft:'10px'}} />}
                onClick={handleExportExcel}
                disabled={exportLoading.excel || !ledgerData}
                size={isSmallScreen ? "small" : "medium"}
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

            {/* Search and Reset Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              justifyContent: isSmallScreen ? 'center' : 'flex-end',
              order: isSmallScreen ? 1 : 2
            }}>
              {searchParams && (
                <Button
                  variant="outlined"
                  startIcon={<RestartAlt sx={{marginLeft:'10px'}} />}
                  onClick={handleReset}
                  size={isSmallScreen ? "small" : "medium"}
                  sx={{
                    borderColor: 'warning.main',
                    color: 'warning.main',
                    '&:hover': {
                      borderColor: 'warning.dark',
                      backgroundColor: 'rgba(237, 108, 2, 0.04)'
                    }
                  }}
                >
                  {isSmallScreen ? 'إعادة' : 'إعادة تعيين'}
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<Search sx={{marginLeft:'10px'}} />}
                onClick={() => setSearchModalOpen(true)}
                size={isSmallScreen ? "small" : "medium"}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                بحث
              </Button>
            </Box>
          </Box>

          {/* Selected Account Info */}
          {searchParams && (
            <Paper sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 2,
              bgcolor: 'primary.50'
            }}>
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
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    justifyContent: isSmallScreen ? 'flex-start' : 'flex-end',
                    flexWrap: 'wrap'
                  }}>
                    <Chip 
                      label={`من: ${searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'البداية'}`}
                      variant="outlined"
                      size={isSmallScreen ? "small" : "medium"}
                    />
                    <Chip 
                      label={`إلى: ${searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'النهاية'}`}
                      variant="outlined"
                      size={isSmallScreen ? "small" : "medium"}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          {!searchParams ? (
            // Empty State
            <Paper sx={{ 
              borderRadius: 2, 
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
              overflow: 'hidden',
              textAlign: 'center',
              p: 6
            }}>
              <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                اختر حساباً من خلال زر البحث لعرض القيود المحاسبية
              </Typography>
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
              <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
                <Grid item xs={6} md={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'rgba(211, 47, 47, 0.1)'
                  }}>
                    <CardContent sx={{ p: isSmallScreen ? 1 : 2 }}>
                      <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight="bold" color="error.main">
                        {totalDebit.toLocaleString('en-US')}
                      </Typography>
                      <Typography variant={isSmallScreen ? "caption" : "body2"} color="text.secondary">
                        إجمالي المدين
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'rgba(46, 125, 50, 0.1)'
                  }}>
                    <CardContent sx={{ p: isSmallScreen ? 1 : 2 }}>
                      <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight="bold" color="success.main">
                        {totalCredit.toLocaleString('en-US')}
                      </Typography>
                      <Typography variant={isSmallScreen ? "caption" : "body2"} color="text.secondary">
                        إجمالي الدائن
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'rgba(237, 108, 2, 0.1)'
                  }}>
                    <CardContent sx={{ p: isSmallScreen ? 1 : 2 }}>
                      <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight="bold" color="warning.main">
                        {ledgerData.totalJournals || 0}
                      </Typography>
                      <Typography variant={isSmallScreen ? "caption" : "body2"} color="text.secondary">
                        إجمالي القيود
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'rgba(25, 118, 210, 0.1)'
                  }}>
                    <CardContent sx={{ p: isSmallScreen ? 1 : 2 }}>
                      <Typography 
                        variant={isSmallScreen ? "h6" : "h5"} 
                        fontWeight="bold" 
                        color={closingBalance >= 0 ? 'primary.main' : 'error.main'}
                      >
                        {closingBalance.toLocaleString('en-US')}
                      </Typography>
                      <Typography variant={isSmallScreen ? "caption" : "body2"} color="text.secondary">
                        الرصيد الختامي
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Journals Table/Cards */}
              <Paper sx={{ 
                borderRadius: 2, 
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                overflow: 'hidden',
                p: isSmallScreen ? 2 : 3
              }}>
                {isSmallScreen ? renderMobileJournalCards() : renderDesktopTable()}

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

                {/* Pagination */}
                {ledgerData.totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
                    <Pagination
                      count={ledgerData.totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size={isSmallScreen ? "small" : "large"}
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </Box>
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