import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Stack,
  FormControl,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";

const TransactionModal = ({
  isOpen,
  onClose,
  transactionForm,
  onInputChange,
  onSave,
  isSaving = false,
  permissions
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!transactionForm.type || transactionForm.type.trim() === "") {
      newErrors.type = "نوع العملية مطلوب";
    }

    if (!transactionForm.amount || transactionForm.amount.trim() === "") {
      newErrors.amount = "المبلغ مطلوب";
    } else {
      const amount = parseFloat(transactionForm.amount);
      if (isNaN(amount)) {
        newErrors.amount = "يرجى إدخال مبلغ صحيح";
      } else if (amount <= 0) {
        newErrors.amount = "المبلغ يجب أن يكون أكبر من صفر";
      } else if (amount > 10000000) {
        newErrors.amount = "المبلغ يجب أن يكون أقل من 10,000,000 ريال";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    onInputChange(field, value);

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSave = () => {
    setTouched({ type: true, amount: true });

    if (validateForm()) {
      onSave();
    }
  };

  const handleClose = () => {
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          إضافة عملية مالية
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              يرجى تصحيح الأخطاء أدناه قبل الحفظ
            </Alert>
          )}

          <FormControl fullWidth size="small" error={touched.type && !!errors.type}>
            <TextField
              select
              label="نوع العملية"
              value={transactionForm.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              onBlur={() => handleBlur('type')}
              error={touched.type && !!errors.type}
              helperText={touched.type && errors.type}
              required
            >
              <MenuItem value="DEPOSIT">إيداع</MenuItem>
              <MenuItem value="WITHDRAWAL">سحب من رأس المال</MenuItem>
              <MenuItem value="PROFIT_WITHDRAWAL">سحب أرباح</MenuItem>
              <MenuItem value="SAVING_WITHDRAWAL">سحب ادخار</MenuItem>
            </TextField>
          </FormControl>

          <TextField
            label="المبلغ (بالريال السعودي)"
            type="number"
            value={transactionForm.amount}
            onChange={(e) => {
              const value = e.target.value; 
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                handleInputChange('amount', value);
              }
            }}
            onBlur={() => handleBlur('amount')}
            fullWidth
            required
            error={touched.amount && !!errors.amount}
            helperText={touched.amount && errors.amount}
            inputProps={{
              min: 0,
              step: 0.01,
              max: 10000000
            }}
            InputProps={{
              inputProps: { min: 0, step: 0.01 }
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, flexDirection: 'row-reverse' }}>
        <Button
          onClick={handleClose}
          color="inherit"
        >
          إلغاء
        </Button>
        {permissions.includes("partners_Add") && (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TransactionModal;