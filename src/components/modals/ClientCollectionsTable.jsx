import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  TablePagination,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  IconButton,
} from '@mui/material';
import {
  StyledTableCell,
  StyledTableRow,
} from '../../components/layouts/tableLayout';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
const ClientCollectionsTable = ({ onViewDetails, isLoading, clientsData }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  // Get status color based on remaining amount
  const getStatusColor = (remaining) => {
    if (remaining > 0) return 'error'; // مديون
    if (remaining === 0) return 'success'; // مدفوع بالكامل
    return 'info'; // لديه رصيد (paid more than required)
  };

  const getStatusText = (remaining) => {
    if (remaining > 0) return 'مديون';
    if (remaining === 0) return 'مدفوع بالكامل';
    return 'لديه رصيد';
  };

  // Render desktop table
  const renderDesktopTable = () => (
    <TableContainer component={Paper} sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
      <Table>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              اسم العميل
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              إجمالي المديونية
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              إجمالي المدفوع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              المتبقي
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الحالة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الإجراءات
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={9} align="center">
                <CircularProgress size={30} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  جاري تحميل البيانات...
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : clientsData?.data?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={9} align="center">
                <Typography variant="body1" color="textSecondary">
                  لا توجد عملاء
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            clientsData?.data
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((client) => (
                <StyledTableRow
                  key={client.id}
                >
                  <StyledTableCell align="center">
                    <Typography fontWeight="medium">
                      {client.name}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography
                      fontWeight="bold"
                      color="error.main"
                    >
                      {formatCurrency(client.totalDebit)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography
                      fontWeight="bold"
                      color="success.main"
                    >
                      {formatCurrency(client.totalPaid)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography
                      fontWeight="bold"
                      color={getStatusColor(client.remaining)}
                    >
                      {formatCurrency(Math.abs(client.remaining))}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip
                      label={getStatusText(client.remaining)}
                      color={getStatusColor(client.remaining)}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      aria-label="عرض التفاصيل"
                      onClick={() => onViewDetails(client.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <VisibilityIcon color="primary" />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))
          )}
        </TableBody>
      </Table>
      {clientsData?.data?.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={clientsData.totalClients || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="عدد الصفوف:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} من ${count}`
          }
        />
      )}
    </TableContainer>
  );

  // Render mobile cards
  const renderMobileCards = () => (
    <Box sx={{ p: 1 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : clientsData?.data?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            لا توجد عملاء
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {clientsData?.data
            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((client) => (
              <Card
                key={client.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  },
                  cursor: 'pointer',
                }}
                onClick={() => onViewDetails(client.id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {client.name}
                      </Typography>
                      <Chip
                        label={getStatusText(client.remaining)}
                        color={getStatusColor(client.remaining)}
                        size="small"
                      />
                    </Box>

                    {/* Contact Info */}
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        الهاتف: {client.phone}
                      </Typography>
                    </Box>

                    {/* Counts */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          القروض
                        </Typography>
                        <Chip
                          label={client.loansCount}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="primary.main">
                          الدفعات
                        </Typography>
                        <Chip
                          label={client.repaymentsCount}
                          color="secondary"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Financial Summary */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          المديونية
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          {formatCurrency(client.totalDebit)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          المدفوع
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(client.totalPaid)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Remaining */}
                    <Box sx={{ textAlign: 'center', pt: 1, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" color="textSecondary">
                        المتبقي
                      </Typography>
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        color={getStatusColor(client.remaining)}
                      >
                        {formatCurrency(Math.abs(client.remaining))}
                      </Typography>
                    </Box>

                    {/* Action */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <IconButton
                        aria-label="عرض التفاصيل"
                        onClick={() => onViewDetails(client.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <VisibilityIcon color="primary" />
                      </IconButton>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          }
        </Stack>
      )}
      
      {clientsData?.data?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={clientsData.totalClients || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="عدد الصفوف:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} من ${count}`
            }
          />
        </Box>
      )}
    </Box>
  );

  return isMobile ? renderMobileCards() : renderDesktopTable();
};

export default ClientCollectionsTable;