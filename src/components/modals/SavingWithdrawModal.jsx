import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { previewGlobalSavingWithdrawal, withdrawFromAllPartnersSavings } from '../../pages/Saving/savingApi';
import { notifySuccess, notifyError, notifyWarning } from '../../utilities/toastify';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
const SavingWithdrawModal = ({ open, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [amountError, setAmountError] = useState('');
  const [touched, setTouched] = useState(false);

  // Auto preview when amount changes
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (numAmount && numAmount > 0) {
      previewMutation.mutate(numAmount);
    } else {
      setPreviewData(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: previewGlobalSavingWithdrawal,
    onSuccess: (data) => {
      setPreviewData(data);
    },
    onError: (error) => {
      notifyError('خطأ في عرض المعاينة: ' + (error.response?.data?.message || error.message));
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: ({ amount, description }) => withdrawFromAllPartnersSavings(amount, description),
    onSuccess: (data) => {
      notifySuccess('تم السحب الجماعي من التوفير بنجاح');
      onSuccess && onSuccess(data);
      handleClose();
    },
    onError: (error) => {
      notifyError('خطأ في السحب: ' + (error.response?.data?.message || error.message));
    },
  });

  const validateAmount = (value) => {
    if (!value || value.trim() === "") {
      return "مبلغ السحب مطلوب";
    }

    const numAmount = parseFloat(value);
    if (isNaN(numAmount)) {
      return "يرجى إدخال مبلغ صحيح";
    }

    if (numAmount <= 0) {
      return "مبلغ السحب يجب أن يكون أكبر من صفر";
    }

    if (numAmount > 10000000) { // 10 million limit
      return "مبلغ السحب يجب أن يكون أقل من 10,000,000 ريال";
    }

    // Check against total available savings if preview data exists
    if (previewData && numAmount > previewData.totalSaving) {
      return `مبلغ السحب يجب أن يكون أقل من أو يساوي إجمالي التوفير المتاح (${previewData.totalSaving.toLocaleString()} ريال)`;
    }

    return "";
  };

  const handleAmountChange = (value) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);

      // Clear error when user starts typing
      if (amountError) {
        setAmountError("");
      }
    }
  };

  const handleAmountBlur = () => {
    setTouched(true);
    const error = validateAmount(amount);
    setAmountError(error);
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setPreviewData(null);
    setAmountError('');
    setTouched(false);
    onClose();
  };

  const handleWithdraw = () => {
    setTouched(true);
    const error = validateAmount(amount);
    setAmountError(error);

    if (error) {
      return;
    }

    if (!previewData) {
      notifyWarning('يرجى انتظار تحديث المعاينة');
      return;
    }

    const numAmount = parseFloat(amount);
    withdrawMutation.mutate({ amount: numAmount, description });
  };


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.8rem',
          color: 'primary.main',
          bgcolor: 'primary.50',
          py: 3,
          borderRadius: '12px 12px 0 0'
        }}
      >
        سحب مدخرات
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Input Section */}
          <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="المبلغ المراد سحبه"
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  onBlur={handleAmountBlur}
                  required
                  error={touched && !!amountError}
                  InputProps={{
                    inputProps: { min: 0, step: 0.01, max: 10000000 },
                  }}
                  helperText={
                    touched && amountError ? amountError : "أدخل المبلغ بالريال السعودي (الحد الأقصى: 10,000,000 ريال)"
                  }
                  sx={{ width: 250 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="الوصف (اختياري)"
                  multiline
                  rows={1}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText="وصف العملية المالية"
                  sx={{ width: 250 }}
                />
              </Grid>
            </Grid>

            {/* Loading indicator for auto preview */}
            {previewMutation.isPending && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
                <Typography sx={{ ml: 2 }}>جاري تحديث المعاينة...</Typography>
              </Box>
            )}
          </Box>

          {/* Preview Results */}
          {previewData && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />

              {/* Summary Cards */}
          <Box sx={{ width: '100%', maxWidth: 800, mb: 4 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'primary.50', textAlign: 'center', minHeight: 80 }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {previewData.amount}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        المبلغ المطلوب
                      </Typography>
                    </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'success.50', textAlign: 'center', minHeight: 80 }}>
                    <CardContent>
                      <Typography variant="h6" color="success.main" fontWeight="bold">
                        {previewData.totalSaving}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        إجمالي التوفير المتاح
                      </Typography>
                    </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'info.50', textAlign: 'center', minHeight: 80 }}>
                    <CardContent>
                      <Typography variant="h6" color="info.main" fontWeight="bold">
                        {previewData.partnersCount}
                      </Typography>
                      <Typography variant="body2" color="info.main">
                        عدد الشركاء
                      </Typography>
                    </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

              {/* Distribution Table */}
              <Box sx={{ width: '100%', maxWidth: 1400 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
                  تفاصيل التوزيع على الشركاء
                </Typography>

                <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2,width:'800px' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <StyledTableRow sx={{ bgcolor: 'grey.50' }}>
                        <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                          اسم الشريك
                        </StyledTableCell>
                        <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                          التوفير قبل السحب
                        </StyledTableCell>
                        <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                          مبلغ السحب
                        </StyledTableCell>
                        <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                          التوفير بعد السحب
                        </StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.distribution.map((item) => (
                        <StyledTableRow key={item.partnerId} hover>
                          <StyledTableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>
                            {item.partnerName || 'غير معروف'}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ py: 2 }}>
                            {item.savingBefore}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ py: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: item.withdraw > 0 ? 'success.main' : 'text.secondary',
                                fontWeight: 'bold'
                              }}
                            >
                              {item.withdraw}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ py: 2 }}>
                            {item.savingAfter}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Validation Alert */}
              {previewData.amount > previewData.totalSaving && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  المبلغ المطلوب أكبر من إجمالي التوفير المتاح. سيتم سحب كل الرصيد المتاح.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 4, gap: 3, justifyContent: 'center', bgcolor: 'grey.50',flexDirection:'row-reverse' }}>
        <Button
          onClick={handleClose}
          color="inherit"
          variant="outlined"
          sx={{
            minWidth: 140,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          إلغاء
        </Button>
        <Button
          onClick={handleWithdraw}
          variant="contained"
          color="error"
          disabled={!previewData || withdrawMutation.isPending || !amount}
          sx={{
            minWidth: 160,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {withdrawMutation.isPending ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              جاري السحب...
            </>
          ) : (
            'تأكيد السحب'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingWithdrawModal;
