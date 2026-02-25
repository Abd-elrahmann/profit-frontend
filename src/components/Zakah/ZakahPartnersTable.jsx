import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  TextField,
  Autocomplete,
  Alert,
  TablePagination,
  Button,
  Tooltip,
  Box,
} from '@mui/material';
import { Visibility, PictureAsPdf, TableChart } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getZakahByYear } from '../../pages/Zakah/zakahApi';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import { usePermissions } from '../Contexts/PermissionsContext';
import { exportZakahToPDF, exportZakahToExcel } from '../../utilities/zakahExporter';

const formatInt = (value) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString();
};

const ZakahPartnersTable = ({
  onViewDetails,
  isMobile = false,
  selectedYear: controlledYear,
  onYearChange,
  onTotalsChange,
}) => {
  const [internalYear, setInternalYear] = useState(new Date().getFullYear());
  const selectedYear = controlledYear ?? internalYear;
  const setSelectedYear = onYearChange ?? setInternalYear;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState({ pdf: false, excel: false });
  const { permissions } = usePermissions();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 + 2 }, (_, i) => 2020 + i);

  const { data: zakahResponse, isLoading, error } = useQuery({
    queryKey: ['zakah-year', selectedYear, page + 1, rowsPerPage],
    queryFn: () => getZakahByYear(selectedYear, page + 1, rowsPerPage),
    enabled: !!selectedYear && selectedYear >= 2000 && selectedYear <= 2100,
    staleTime: 30000,
  });

  const zakahData = zakahResponse?.data || [];
  const pagination = zakahResponse?.pagination || {
    totalPartners: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  };

  const handleYearChange = (event, newValue) => {
    if (newValue !== null && newValue !== undefined) {
      setSelectedYear(newValue);
      setPage(0);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchAllZakahByYear = async () => {
    const totalPages = zakahResponse?.pagination?.totalPages || 1;
    const limit = rowsPerPage || 10;
    const all = [];
    let pageIndex = 1;
    while (pageIndex <= totalPages) {
      const res = await getZakahByYear(selectedYear, pageIndex, limit);
      if (Array.isArray(res?.data)) all.push(...res.data);
      pageIndex += 1;
    }
    return all;
  };

  const handleExport = async (type) => {
    if (!zakahData || zakahData.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    setIsExporting((prev) => ({ ...prev, [type]: true }));
    try {
      const totalPartners = zakahResponse?.pagination?.totalPartners || zakahData.length;
      const allData =
        zakahData.length < totalPartners ? await fetchAllZakahByYear() : zakahData;
      const filters = { year: selectedYear };
      if (type === 'pdf') await exportZakahToPDF(allData, filters);
      else if (type === 'excel') await exportZakahToExcel(allData, filters);
    } catch (err) {
      console.error('Error exporting zakah:', err);
      alert(`خطأ في التصدير: ${err.message}`);
    } finally {
      setIsExporting((prev) => ({ ...prev, [type]: false }));
    }
  };

  const totals =
    zakahData?.reduce(
      (acc, item) => ({
        capitalAmount: acc.capitalAmount + (item.capitalAmount || 0),
        annualZakat: acc.annualZakat + (item.annualZakat || 0),
        monthlyZakat: acc.monthlyZakat + (item.monthlyZakat || 0),
        totalPaid: acc.totalPaid + (item.totalPaid || 0),
        remaining: acc.remaining + (item.remaining || 0),
      }),
      { capitalAmount: 0, annualZakat: 0, monthlyZakat: 0, totalPaid: 0, remaining: 0 }
    ) || {
      capitalAmount: 0,
      annualZakat: 0,
      monthlyZakat: 0,
      totalPaid: 0,
      remaining: 0,
    };

  React.useEffect(() => {
    if (onTotalsChange && zakahData?.length) {
      onTotalsChange(totals);
    }
  }, [
    onTotalsChange,
    zakahData?.length,
    totals.capitalAmount,
    totals.annualZakat,
    totals.totalPaid,
    totals.remaining,
  ]);

  const renderTable = () => (
    <>
      {permissions.includes('zakat_Export') && (
        <div className="flex justify-end gap-2 mb-4">
          <Tooltip title="تصدير إلى PDF">
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled={isExporting.pdf || zakahData.length === 0}
              onClick={() => handleExport('pdf')}
              startIcon={<PictureAsPdf />}
              sx={{ fontWeight: 'bold', minWidth: '120px' }}
            >
              {isExporting.pdf ? (
                <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
              ) : (
                'PDF'
              )}
            </Button>
          </Tooltip>
          <Tooltip title="تصدير إلى Excel">
            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={isExporting.excel || zakahData.length === 0}
              onClick={() => handleExport('excel')}
              startIcon={<TableChart />}
              sx={{ fontWeight: 'bold', minWidth: '120px' }}
            >
              {isExporting.excel ? (
                <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
              ) : (
                'Excel'
              )}
            </Button>
          </Tooltip>
        </div>
      )}
      <TableContainer>
        <Table stickyHeader sx={{ width: '100%' }}>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                اسم الشريك
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                رأس المال
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                الزكاة السنوية
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                المدفوع
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                المتبقي
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                الإجراءات
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={7} align="center">
                  <CircularProgress size={20} />
                </StyledTableCell>
              </StyledTableRow>
            ) : error ? (
              <StyledTableRow>
                <StyledTableCell colSpan={7} align="center">
                  <Alert severity="error">
                    حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.
                  </Alert>
                </StyledTableCell>
              </StyledTableRow>
            ) : zakahData?.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={7} align="center">
                  <Typography>لا توجد بيانات زكاة للعام {selectedYear}</Typography>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              zakahData?.map((zakah) => (
                <StyledTableRow key={zakah.partnerId} className="group">
                  <StyledTableCell align="center">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {zakah.partnerName}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    {formatInt(zakah.capitalAmount)}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Typography fontWeight="bold" color="primary.main">
                      {formatInt(zakah.annualZakat)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Typography fontWeight="bold" color="success.main">
                      {formatInt(zakah.totalPaid)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Typography
                      fontWeight="bold"
                      color={zakah.remaining > 0 ? 'error' : 'success.main'}
                    >
                      {formatInt(zakah.remaining)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {permissions.includes('zakat_View') && (
                      <Tooltip title="عرض التفاصيل">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(zakah.partnerId, selectedYear);
                          }}
                          className="hover:bg-primary/10 rounded-full"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
            {zakahData && zakahData.length > 0 && (
              <StyledTableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold">الإجمالي</Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold">
                    {formatInt(totals.capitalAmount)}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold" color="primary.main">
                    {formatInt(totals.annualZakat)}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold" color="success.main">
                    {formatInt(totals.totalPaid)}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography
                    fontWeight="bold"
                    color={totals.remaining > 0 ? 'error' : 'success.main'}
                  >
                    {formatInt(totals.remaining)}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">-</StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!isMobile && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={pagination.totalPartners || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="عدد العناصر لكل صفحة:"
          labelDisplayedRows={({ from, to, count }) =>
            `عرض ${from}–${to} من أصل ${count !== -1 ? count : `أكثر من ${to}`} شركاء`
          }
          sx={{
            direction: 'rtl',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontFamily: 'inherit',
            },
          }}
        />
      )}
    </>
  );

  const renderCards = () => (
    <div className="p-4 space-y-4">
      {permissions.includes('zakat_Export') && (
        <div className="flex justify-center gap-2 flex-wrap">
          <Button
            variant="contained"
            color="error"
            size="small"
            disabled={isExporting.pdf || zakahData.length === 0}
            onClick={() => handleExport('pdf')}
            startIcon={<PictureAsPdf />}
            sx={{ fontWeight: 'bold' }}
          >
            {isExporting.pdf ? 'جاري التصدير...' : 'PDF'}
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            disabled={isExporting.excel || zakahData.length === 0}
            onClick={() => handleExport('excel')}
            startIcon={<TableChart />}
            sx={{ fontWeight: 'bold' }}
          >
            {isExporting.excel ? 'جاري التصدير...' : 'Excel'}
          </Button>
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <CircularProgress size={30} />
        </div>
      ) : zakahData?.length === 0 ? (
        <div className="flex justify-center py-8">
          <Typography variant="h6" color="textSecondary">
            لا توجد بيانات زكاة للعام {selectedYear}
          </Typography>
        </div>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {zakahData?.map((zakah) => (
            <Grid item xs={12} key={zakah.partnerId} className="flex justify-center">
              <Card
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  width: '300px',
                  minHeight: '280px',
                  '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {zakah.partnerName}
                      </Typography>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        العام: {zakah.year}
                      </span>
                    </Box>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          رأس المال:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatInt(zakah.capitalAmount)}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          الزكاة السنوية:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {formatInt(zakah.annualZakat)}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          المدفوع:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatInt(zakah.totalPaid)}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" color="textSecondary">
                          المتبقي:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={zakah.remaining > 0 ? 'error' : 'success.main'}
                        >
                          {formatInt(zakah.remaining)}
                        </Typography>
                      </div>
                    </div>
                    {permissions.includes('zakat_View') && (
                      <div className="flex justify-center pt-2">
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onViewDetails(zakah.partnerId, selectedYear)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {isMobile && zakahData && zakahData.length > 0 && (
        <Card sx={{ m: 1, bgcolor: 'primary.50' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              ملخص الإجماليات
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  إجمالي رأس المال:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {totals.capitalAmount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  إجمالي الزكاة السنوية:
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  {totals.annualZakat.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  إجمالي المدفوع:
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {totals.totalPaid.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  إجمالي المتبقي:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={totals.remaining > 0 ? 'error' : 'success.main'}
                >
                  {totals.remaining.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      {isMobile && zakahData && zakahData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.totalPartners || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="عدد العناصر:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
          }
          sx={{ direction: 'rtl' }}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <Autocomplete
          options={years}
          value={selectedYear}
          onChange={handleYearChange}
          getOptionLabel={(opt) => opt.toString()}
          isOptionEqualToValue={(opt, val) => opt === val}
          renderInput={(params) => (
            <TextField
              {...params}
              label="اختر السنة"
              size="small"
              sx={{ width: '200px' }}
            />
          )}
          sx={{ flexShrink: 0 }}
        />
        <Typography variant="body2" color="textSecondary">
          عدد الشركاء: {zakahData?.length || 0}
        </Typography>
      </div>

      <div className="bg-white dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        {isMobile ? renderCards() : renderTable()}
      </div>
    </div>
  );
};

export default ZakahPartnersTable;
