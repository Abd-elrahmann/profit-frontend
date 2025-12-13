import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Stack,
} from "@mui/material";
import { updateExpense } from "../../pages/Expenses/expensesApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";

const EditExpense = ({ open, onClose, onSuccess, expense, isMobile = false }) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && expense) {
      setFormData({
        amount: expense.debit?.toString() || "",
        description: expense.description || "",
      });
      setErrors({});
    }
  }, [open, expense]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || formData.amount.trim() === "") {
      newErrors.amount = "المبلغ مطلوب";
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "يرجى إدخال مبلغ صحيح";
      }
    }

    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = "الوصف مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await updateExpense(expense.journalId, {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
      });
      notifySuccess("تم تحديث المصروف بنجاح");
      onSuccess();
      onClose();
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء تحديث المصروف"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>
        تعديل المصروف
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            name="amount"
            label="المبلغ"
            type="number"
            value={formData.amount}
            onChange={handleChange("amount")}
            fullWidth
            required
            error={!!errors.amount}
            helperText={errors.amount}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            name="description"
            label="الوصف"
            value={formData.description}
            onChange={handleChange("description")}
            fullWidth
            required
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1, flexDirection: "row-reverse", justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ "&:hover": { bgcolor: "primary.main" } }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "حفظ التغييرات"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditExpense;
