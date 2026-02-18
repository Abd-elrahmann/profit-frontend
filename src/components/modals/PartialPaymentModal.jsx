import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";

const PartialPaymentModal = ({
  open,
  onClose,
  selectedActionInstallment,
  paidAmount,
  onAmountChange,
  onConfirm,
}) => {
  const [amountError, setAmountError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setAmountError("");
      setTouched(false);
    }
  }, [open]);

  const validateAmount = (value) => {
    if (!value || value.trim() === "") {
      return "مبلغ الدفع مطلوب";
    }

    const amount = parseFloat(value);
    if (isNaN(amount)) {
      return "يرجى إدخال مبلغ صحيح";
    }

    if (amount <= 0) {
      return "مبلغ الدفع يجب أن يكون أكبر من صفر";
    }

    const remaining = selectedActionInstallment?.remaining || 0;
    if (amount > remaining) {
      return `مبلغ الدفع يجب أن يكون أقل من أو يساوي المبلغ المتبقي (${remaining.toFixed(2)} ريال)`;
    }

    if (remaining > 1 && amount < 1) {
      return "مبلغ الدفع الجزئي يجب أن يكون على الأقل 1 ريال";
    }

    return "";
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;

    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(e);
      
      if (amountError) {
        setAmountError("");
      }
    }
  };

  const handleAmountBlur = () => {
    setTouched(true);
    const error = validateAmount(paidAmount);
    setAmountError(error);
  };

  const handleConfirm = () => {
    setTouched(true);
    const error = validateAmount(paidAmount);
    setAmountError(error);

    if (!error) {
      onConfirm();
    }
  };

  const remainingAmount = selectedActionInstallment?.remaining || 0;
  const paidAmountNum = parseFloat(paidAmount) || 0;
  const remainingAfterPayment = Math.max(0, remainingAmount - paidAmountNum);

  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>إضافة دفع جزئي</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          الدفعة: #{selectedActionInstallment?.count} - المبلغ الأصلي:{" "}
          {selectedActionInstallment?.amount?.toFixed(2)} ريال
        </Typography>

        <Typography variant="body2" color="primary" fontWeight="bold" mb={1}>
          المبلغ المتبقي الحالي: {remainingAmount.toFixed(2)} ريال
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          المبلغ المتبقي بعد الدفع: <strong>{remainingAfterPayment.toFixed(2)}</strong> ريال
        </Typography>

        {touched && amountError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {amountError}
          </Alert>
        )}

        <TextField
          fullWidth
          type="number"
          label="المبلغ المدفوع (بالريال السعودي)"
          value={paidAmount}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          sx={{ mt: 2 }}
          required
          error={touched && !!amountError}
          InputProps={{
            inputProps: {
              min: 0,
              max: remainingAmount,
              step: 0.01,
            },
          }}
          helperText={
            touched && amountError ? amountError :
            `أدخل المبلغ الذي تريد دفعه (الحد الأقصى: ${remainingAmount.toFixed(2)} ريال)`
          }
        />
      </DialogContent>
      <DialogActions
        sx={{ px: 3, py: 2, gap: 2, flexDirection: "row-reverse" }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
        >
          إلغاء
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!paidAmount || parseFloat(paidAmount) <= 0}
        >
          تأكيد الدفع الجزئي
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartialPaymentModal;