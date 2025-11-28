import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  IconButton,
  Chip,
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
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getZakahByYear } from '../../pages/Zakah/zakahApi';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import { usePermissions } from '../Contexts/PermissionsContext';

const ZakahTable = ({ onViewDetails, isMobile = false }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const totals = zakahData?.reduce((acc, item) => ({
    capitalAmount: acc.capitalAmount + (item.capitalAmount || 0),
    annualZakat: acc.annualZakat + (item.annualZakat || 0),
    totalPaid: acc.totalPaid + (item.totalPaid || 0),
    remaining: acc.remaining + (item.remaining || 0),
  }), { capitalAmount: 0, annualZakat: 0, totalPaid: 0, remaining: 0 }) || {
    capitalAmount: 0, annualZakat: 0, totalPaid: 0, remaining: 0
  };

  const renderTable = () => (
    <Box>
      <TableContainer sx={{ height: "100%", width: "100%" }}>
        <Table stickyHeader sx={{ width: "100%" }}>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                اسم الشريك
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                رأس المال
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                الزكاة السنوية
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                الزكاة الشهرية
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                المدفوع
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                المتبقي
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
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
                <StyledTableRow 
                  key={zakah.partnerId} 
                >
                  <StyledTableCell align="center">
                    {zakah.partnerName}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {zakah.capitalAmount?.toLocaleString() || 0}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Typography fontWeight="bold" color="primary.main">
                      {zakah.annualZakat?.toLocaleString() || 0}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {zakah.monthlyZakat?.toLocaleString() || 0}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Typography fontWeight="bold" color="success.main">
                      {zakah.totalPaid?.toLocaleString() || 0}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Typography 
                      fontWeight="bold" 
                      color={zakah.remaining > 0 ? "error" : "success.main"}
                    >
                      {zakah.remaining?.toLocaleString() || 0}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {permissions.includes("zakat_View") && (
                        <IconButton
                          title="عرض التفاصيل"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(zakah.partnerId, selectedYear);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
            
            {zakahData && zakahData.length > 0 && (
              <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold">الإجمالي</Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold">
                    {totals.capitalAmount.toLocaleString()}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold" color="primary.main">
                    {totals.annualZakat.toLocaleString()}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold">-</Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold" color="success.main">
                    {totals.totalPaid.toLocaleString()}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography 
                    fontWeight="bold" 
                    color={totals.remaining > 0 ? "error" : "success.main"}
                  >
                    {totals.remaining.toLocaleString()}
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
            `${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
          }
          sx={{
            direction: 'rtl',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontFamily: 'inherit',
            },
          }}
        />
      )}
    </Box>
  );

  const renderCards = () => (
    <Box sx={{ p: 1 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Alert severity="error">
            حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.
          </Alert>
        </Box>
      ) : zakahData?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            لا توجد بيانات زكاة للعام {selectedYear}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {zakahData?.map((zakah) => (
            <Grid item xs={12} key={zakah.partnerId} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  width: '300px',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {zakah.partnerName}
                      </Typography>
                      <Chip
                        label={`العام: ${zakah.year}`}
                        color="primary"
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          رأس المال:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {zakah.capitalAmount?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          الزكاة السنوية:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {zakah.annualZakat?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          الزكاة الشهرية:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {zakah.monthlyZakat?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          المدفوع:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {zakah.totalPaid?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        المتبقي:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        color={zakah.remaining > 0 ? "error" : "success.main"}
                      >
                        {zakah.remaining?.toLocaleString() || 0}
                      </Typography>
                    </Box>

                    {permissions.includes("zakat_View") && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                        <IconButton
                          title="عرض التفاصيل"
                          size="small"
                          color="primary"
                          onClick={() => onViewDetails(zakah.partnerId, selectedYear)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <Box sx={{ mb: 2 }}>
        <Autocomplete
          options={years}
          value={selectedYear}
          onChange={handleYearChange}
          getOptionLabel={(option) => option.toString()}
          isOptionEqualToValue={(option, value) => option === value}
          renderInput={(params) => (
            <TextField
              {...params}
              label="اختر السنة"
              size="small"
              sx={{ width: '250px' }}
            />
          )}
        />
      </Box>

      <Paper sx={{ flex: 1, width: "100%", overflow: "hidden", borderRadius: 2 }}>
        {isMobile ? renderCards() : renderTable()}

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
                    إجمالي الزكاة:
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
                    color={totals.remaining > 0 ? "error" : "success.main"}
                  >
                    {totals.remaining.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {isMobile && zakahData && zakahData.length > 0 && (
          <Box sx={{ p: 2 }}>
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
              sx={{
                direction: 'rtl',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ZakahTable;