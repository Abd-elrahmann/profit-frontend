import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { VolunteerActivism as ZakatIcon } from '@mui/icons-material';
const WithdrawZakah = ({ open, onClose, onWithdraw, accountBalance }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (parseFloat(amount) > accountBalance) {
      setError('المبلغ المدخل أكبر من رصيد حساب الزكاة');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onWithdraw(parseFloat(amount));
      setAmount('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء السحب');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ZakatIcon color="primary" sx={{marginRight: "10px"}} />
          <Typography variant="h6" fontWeight="bold">
            سحب مبلغ الزكاة
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          الرصيد المتاح: {accountBalance?.toLocaleString() || 0}
        </Typography>
        <TextField
          fullWidth
          label="المبلغ المطلوب سحبه"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onFocus={() => setError('')}
          sx={{ mb: 2 }}
          inputProps={{ min: 0, step: 0.01 }}
        />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1, flexDirection: 'row-reverse' }}>
        <Button onClick={handleClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !amount}
          startIcon={loading ? <CircularProgress size={16} /> : <ZakatIcon sx={{marginLeft: "10px"}} />}
        >
          {loading ? 'جاري السحب...' : 'سحب المبلغ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default WithdrawZakah;