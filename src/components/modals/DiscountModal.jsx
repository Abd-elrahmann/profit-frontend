import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { CircularProgress } from '@mui/material';

const DiscountModal = ({
  open,
  onClose,
  onConfirm,
  installmentAmount = 0,
  loading = false,
  title = "تطبيق خصم على الدفعة"
}) => {
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const discountValue = parseFloat(discount) || 0;

    if (discountValue < 0) {
      setError('الخصم لا يمكن أن يكون قيمة سالبة');
      return;
    }

    if (discountValue > installmentAmount) {
      setError(`الخصم لا يمكن أن يتجاوز مبلغ الدفعة (${installmentAmount.toLocaleString()})`);
      return;
    }

    setError('');
    onConfirm({
      discount: discountValue,
      notes: notes.trim() || (discountValue > 0 ? 'تم تطبيق خصم على الدفعة' : 'تمت الموافقة على الدفعة')
    });

    setDiscount('');
    setNotes('');
  };

  const handleClose = () => {
    setDiscount('');
    setNotes('');
    setError('');
    onClose();
  };

  const finalAmount = Math.max(0, installmentAmount - (parseFloat(discount) || 0));
  const hasDiscount = (parseFloat(discount) || 0) > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            مبلغ الدفعة: <strong>{installmentAmount.toLocaleString()}</strong>
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            ملاحظة: مبلغ الخصم يجب ألا يتعدى مبلغ الدفعة ({installmentAmount.toLocaleString()})
          </Typography>
        </Alert>

        <TextField
          fullWidth
          label="مبلغ الخصم"
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          sx={{ mb: 2 }}
          inputProps={{
            min: 0,
            step: 0.01
          }}
        />

        <TextField
          fullWidth
          label="سبب الخصم (اختياري)"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
        />

        {finalAmount !== installmentAmount && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              المبلغ النهائي بعد الخصم: <strong>{finalAmount.toLocaleString()}</strong>
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, display: 'flex', justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          إلغاء
        </Button>

        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {hasDiscount ? 'تطبيق الخصم' : 'الموافقة علي الدفعة'}
          {loading && <CircularProgress size={20} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscountModal;
