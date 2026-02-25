import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { withdrawCompanyProfit } from '../../pages/companyProfit/CompanyProfitApi';
import { notifySuccess, notifyError } from '../../utilities/toastify';

const WithdrawCompanyProfitModal = ({ open, onClose, availableAmount, onSuccess }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleClose = useCallback(() => {
    onClose();
    setWithdrawAmount('');
    setWithdrawError('');
  }, [onClose]);

  const validateAmount = useCallback(
    (value) => {
      if (!value || !availableAmount) return '';
      const amount = parseFloat(value);
      if (amount > availableAmount) {
        return `المبلغ المدخل (${amount.toLocaleString('en-US')}) يتجاوز الرصيد المتاح (${availableAmount.toLocaleString('en-US')})`;
      }
      if (amount <= 0) return 'يجب أن يكون المبلغ أكبر من صفر';
      return '';
    },
    [availableAmount]
  );

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    setWithdrawError(validateAmount(value));
  };

  const handleSubmit = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      notifyError('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (withdrawError) {
      notifyError('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }

    setIsWithdrawing(true);
    try {
      await withdrawCompanyProfit(amount);
      notifySuccess('تم سحب الأرباح بنجاح');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Withdraw Error:', error);
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء سحب الأرباح');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isSubmitDisabled =
    isWithdrawing ||
    !withdrawAmount ||
    parseFloat(withdrawAmount) <= 0 ||
    !!withdrawError;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          سحب أرباح الشركة
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body1" color="text.secondary" mb={2} fontWeight="bold">
            الرصيد المتاح: {(availableAmount || 0).toLocaleString('en-US')}
          </Typography>
          <TextField
            fullWidth
            label="مبلغ السحب"
            type="number"
            value={withdrawAmount}
            onChange={handleAmountChange}
            inputProps={{ min: 0, step: 0.01 }}
            helperText={withdrawError || 'أدخل المبلغ المراد سحبه من أرباح الشركة'}
            error={!!withdrawError}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexDirection: 'row-reverse' }}>
        <Button onClick={handleClose} color="inherit">
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitDisabled}
          sx={{
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'white',
              borderColor: 'primary.main',
            },
          }}
        >
          {isWithdrawing ? <CircularProgress size={20} /> : 'سحب'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WithdrawCompanyProfitModal;
