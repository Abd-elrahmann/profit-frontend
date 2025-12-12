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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  StyledTableCell,
  StyledTableRow,
  ScrollableTableContainer
} from '../../components/layouts/tableLayout';
import { usePermissions } from '../Contexts/PermissionsContext';
const ClientCollectionsTable = ({ isLoading, clientsData, onUpdateNote }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const { permissions } = usePermissions();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenNoteDialog = (client) => {
    setSelectedClient(client);
    setNoteText(client.note || '');
    setOpenNoteDialog(true);
  };

  const handleCloseNoteDialog = () => {
    setOpenNoteDialog(false);
    setSelectedClient(null);
    setNoteText('');
  };

  const handleSaveNote = async () => {
    if (!selectedClient) return;
    
    setIsSavingNote(true);
    try {
      await onUpdateNote(selectedClient.id, noteText);
      handleCloseNoteDialog();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };


  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  const getStatusColor = (remaining) => {
    if (remaining > 0) return 'error';
    if (remaining === 0) return 'success';
    return 'info';
  };

  const getStatusText = (remaining) => {
    if (remaining > 0) return 'مديون';
    if (remaining === 0) return 'مدفوع بالكامل';
    return 'لديه رصيد';
  };

  const renderDesktopTable = () => (
    <>
      <ScrollableTableContainer maxHeight={650} minWidth={2000}>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              اسم العميل
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              العنوان
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              عدد السلف
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الدفعات المدفوعة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الدفعات المتبقية
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              إجمالي المديونية
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              إجمالي المدفوع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              إجمالي الفوائد
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الخصومات
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              المتبقي
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الحالة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              ملاحظات
            </StyledTableCell>
            {(permissions.includes("client-report_Add") || permissions.includes("client-report_Update")) && (
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الإجراءات
            </StyledTableCell>
            )}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={13} align="center">
                <CircularProgress size={30} />
                  جاري تحميل البيانات...
              </StyledTableCell>
            </StyledTableRow>
          ) : clientsData?.data?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={13} align="center">
                  لا توجد عملاء
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
                    <Typography fontWeight="medium">{client.name}</Typography>
                    <Typography variant="body2" color="primary.main" fontWeight="bold">{client.phone}</Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                      {client.address || '-'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Chip label={`${client.loansSummary.loansCount} سلفة`} size="small" color="primary" variant="outlined" />
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Chip label={`${client.loansSummary.activeLoans} نشط`} size="small" color="success" sx={{ fontSize: '0.7rem' }} />
                        <Chip label={`${client.loansSummary.completedLoans} مكتمل`} size="small" color="info" sx={{ fontSize: '0.7rem' }} />
                        {client.loansSummary.overdueLoans > 0 && (
                          <Chip label={`${client.loansSummary.overdueLoans} متأخر`} size="small" color="error" sx={{ fontSize: '0.7rem' }} />
                        )}
                      </Box>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip 
                      label={client.repaymentSummary.paidRepayments} 
                      color="success" 
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip 
                      label={client.repaymentSummary.remainingRepayments} 
                      color="warning" 
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="black">
                      {formatCurrency(client.financials.totalDebit)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="success.main">
                      {formatCurrency(client.financials.totalPaid)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="info.main">
                      {formatCurrency(client.financials.totalInterestPaid || 0)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="warning.main">
                      {formatCurrency(client.financials.totalDiscounts || 0)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography 
                      fontWeight="bold" 
                      color={client.financials.remaining > 0 ? "error" : "success.main"}
                    >
                      {formatCurrency(Math.abs(client.financials.remaining))}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip
                      label={getStatusText(client.financials.remaining)}
                      color={getStatusColor(client.financials.remaining)}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {client.note || '-'}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {(permissions.includes("client-report_Add") || permissions.includes("client-report_Update")) && (
                    <IconButton
                      title="إضافة ملاحظة"
                      size="small"
                      color="primary"
                      onClick={() => handleOpenNoteDialog(client)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <AddIcon sx={{ fontSize: '20px' }} />
                    </IconButton>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </ScrollableTableContainer>
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
    </>
  );

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
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {client.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {client.phone}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusText(client.financials.remaining)}
                        color={getStatusColor(client.financials.remaining)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          إجمالي السلف
                        </Typography>
                        <Chip
                          label={client.loansSummary.loansCount}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          النشطة
                        </Typography>
                        <Chip
                          label={client.loansSummary.activeLoans}
                          color="success"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          المكتملة
                        </Typography>
                        <Chip
                          label={client.loansSummary.completedLoans}
                          color="info"
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          إجمالي الدفعات
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {client.repaymentSummary.totalRepayments}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          المدفوعة
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {client.repaymentSummary.paidRepayments}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          المتبقية
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          {client.repaymentSummary.remainingRepayments}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          المديونية
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          {formatCurrency(client.financials.totalDebit)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          المدفوع
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          {formatCurrency(client.financials.totalPaid)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', pt: 1, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" color="textSecondary">
                        المتبقي
                      </Typography>
                      <Typography 
                        variant="h6" 
                        fontWeight="bold" 
                        color={client.financials.remaining > 0 ? "error" : "success.main"}
                      >
                        {formatCurrency(Math.abs(client.financials.remaining))}
                      </Typography>
                    </Box>

                    {/* Notes Section */}
                    {client.note && (
                      <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0', textAlign: 'right' }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          ملاحظات:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {client.note}
                        </Typography>
                      </Box>
                    )}

                    {/* Add Note Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, borderTop: '1px solid #e0e0e0' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenNoteDialog(client)}
                        fullWidth
                      >
                        {client.note ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
                      </Button>
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

  return (
    <>
      {isMobile ? renderMobileCards() : renderDesktopTable()}
      
      {/* Note Dialog */}
      <Dialog 
        open={openNoteDialog} 
        onClose={handleCloseNoteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'right', fontWeight: 'bold' }}>
          إضافة / تعديل ملاحظة
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب ملاحظاتك هنا..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  textAlign: 'right',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleCloseNoteDialog}
            variant="outlined"
            disabled={isSavingNote}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleSaveNote}
            variant="contained"
            disabled={isSavingNote}
            sx={{ minWidth: '100px' }}
          >
            {isSavingNote ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientCollectionsTable;