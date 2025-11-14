import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import { createBank, updateBank } from "../../pages/Banks/bankApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";

const AddBank = ({ open, onClose, onSuccess, bank, isEditMode = false, isMobile = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    IBAN: "",
    limit: "",
    owner: "",
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
        owner: bank.owner || "",
      });
    } else {
      setFormData({
        name: "",
        accountNumber: "",
        IBAN: "",
        limit: "",
        owner: "",
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
      
    if (!formData.owner.trim()) {
      newErrors.owner = "اسم المالك مطلوب";
    }

    if (!formData.limit) {
      newErrors.limit = "السلف المسموح بها مطلوبة";
    } else if (parseInt(formData.limit) < 0) {
      newErrors.limit = "السلف المسموح بها يجب أن تكون رقم موجب";
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
      owner: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth={isMobile ? "xs" : "sm"} 
      fullWidth 
      fullScreen={isMobile}
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, position: isMobile ? 'sticky' : 'static', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          {isEditMode ? "تعديل حساب بنكي" : "إضافة حساب بنكي جديد"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="اسم الحساب"
            value={formData.name}
            onChange={handleChange("name")}
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
            required
            size={isMobile ? "small" : "medium"}
          />

          <TextField
            label="اسم المالك"
            type="text"
            value={formData.owner}
            onChange={handleChange("owner")}
            fullWidth
            error={!!errors.owner}
            helperText={errors.owner}
            required
            size={isMobile ? "small" : "medium"}
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
            size={isMobile ? "small" : "medium"}
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
            size={isMobile ? "small" : "medium"}
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
            size={isMobile ? "small" : "medium"}
            inputProps={{
              inputMode: "numeric",
              min: 0,
            }}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "+") e.preventDefault();
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        gap: 1, 
        flexDirection: "row-reverse",
        position: isMobile ? 'sticky' : 'static',
        bottom: 0,
        bgcolor: 'background.paper',
        borderTop: isMobile ? '1px solid' : 'none',
        borderColor: 'divider'
      }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          fullWidth={isMobile}
          sx={{
            minWidth: isMobile ? 'auto' : "100px",
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
          fullWidth={isMobile}
          sx={{
            bgcolor: "#0d40a5",
            "&:hover": { bgcolor: "#0b3589" },
            minWidth: isMobile ? 'auto' : "100px",
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