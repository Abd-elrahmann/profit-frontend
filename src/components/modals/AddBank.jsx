import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { createBank, updateBank } from "../../pages/Banks/bankApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";

const AddBank = ({ open, onClose, onSuccess, bank, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    IBAN: "",
    limit: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bank && isEditMode) {
      setFormData({
        name: bank.name || "",
        accountNumber: bank.accountNumber || "",
        IBAN: bank.IBAN || "",
        limit: parseInt(bank.limit) || "",
      });
    } else {
      setFormData({
        name: "",
        accountNumber: "",
        IBAN: "",
        limit: "",
      });
    }
    setErrors({});
  }, [bank, isEditMode, open]);

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

    if (!formData.name.trim()) {
      newErrors.name = "اسم الحساب مطلوب";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "رقم الحساب مطلوب";
    } else if (!/^\d+$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "رقم الحساب يجب أن يحتوي على أرقام فقط";
    } else if (
      formData.accountNumber.length < 10 ||
      formData.accountNumber.length > 14
    ) {
      newErrors.accountNumber = "رقم الحساب يجب أن يكون بين 10 و 14 رقم";
    }

    if (!formData.IBAN.trim()) {
        newErrors.IBAN = "IBAN مطلوب";
      } else if (!/^[A-Za-z0-9]+$/.test(formData.IBAN)) {
        newErrors.IBAN = "IBAN يجب أن يحتوي على أحرف وأرقام فقط";
      } else if (formData.IBAN.length > 24) {
        newErrors.IBAN = "IBAN يجب أن يكون 24 حرف/رقم";
      }
      

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditMode && bank) {
        await updateBank(bank.id, {...formData, limit: parseInt(formData.limit)});
        notifySuccess("تم تعديل الحساب البنكي بنجاح");
      } else {
        await createBank({...formData, limit: parseInt(formData.limit)});
        notifySuccess("تم إضافة الحساب البنكي بنجاح");
      }

      onSuccess();
    } catch (error) {
      notifyError(
        error.response?.data?.message ||
          `حدث خطأ أثناء ${isEditMode ? "تعديل" : "إضافة"} الحساب البنكي`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      accountNumber: "",
      IBAN: "",
      limit: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth dir="rtl">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          {isEditMode ? "تعديل حساب بنكي" : "إضافة حساب بنكي جديد"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box>
          <TextField
            label="اسم الحساب"
            value={formData.name}
            onChange={handleChange("name")}
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
            required
            sx={{ mb: 2, mt: 2 }}
          />

          <TextField
            label="رقم الحساب"
            type="text"
            value={formData.accountNumber}
            onChange={handleChange("accountNumber")}
            fullWidth
            error={!!errors.accountNumber}
            helperText={errors.accountNumber}
            required
            sx={{ mb: 2, mt: 2 }}
            inputProps={{
              inputMode: "text",
              maxLength: 14,
              min: 0,
              max:14
            }}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "+") e.preventDefault();
            }}
          />

          <TextField
            label="رقم الايبان"
            type="text"
            value={formData.IBAN}
            onChange={handleChange("IBAN")}
            fullWidth
            error={!!errors.IBAN}
            helperText={errors.IBAN}
            required
            sx={{ mb: 2, mt: 2 }}
            inputProps={{
              inputMode: "text",
              maxLength: 24,
              min: 0,
              max:24
            }}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "+") e.preventDefault();
            }}
          />

          <TextField
            label=" السلف المسموح بها للحساب البنكي"
            type="number"
            value={formData.limit}
            onChange={handleChange("limit")}
            fullWidth
            error={!!errors.limit}
            helperText={errors.limit}
            required
            sx={{ mb: 2, mt: 2 }}
            inputProps={{
              inputMode: "numeric",
              min: 0,
            }}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "+") e.preventDefault();
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, flexDirection: "row-reverse" }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{
            minWidth: "100px",
            borderColor: "grey.300",
            color: "text.secondary",
            "&:hover": {
              borderColor: "grey.400",
              bgcolor: "grey.50",
            },
          }}
        >
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: "#0d40a5",
            "&:hover": { bgcolor: "#0b3589" },
            minWidth: "100px",
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isEditMode ? (
            "تعديل"
          ) : (
            "إضافة"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBank;
