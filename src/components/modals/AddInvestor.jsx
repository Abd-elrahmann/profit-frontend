import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import Api, { handleApiError } from "../../config/Api";
import { notifyError, notifySuccess } from "../../utilities/toastify";

const AddInvestor = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    address: "",
    phone: "",
    email: "",
    orgProfitPercent: "",
    capitalAmount: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.nationalId.trim()) newErrors.nationalId = 'رقم الهوية مطلوب';
    if (!formData.address.trim()) newErrors.address = 'العنوان مطلوب';
    if (!formData.phone.trim()) newErrors.phone = 'رقم الجوال مطلوب';
    if (!formData.orgProfitPercent) newErrors.orgProfitPercent = 'نسبة أرباح المنشأة مطلوبة';
    if (!formData.capitalAmount) newErrors.capitalAmount = 'رأس المال مطلوب';
    
    if (formData.nationalId && !/^\d{14}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'رقم الهوية يجب أن يكون 14 رقمًا';
    }
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الجوال يجب أن يحتوي على 10 أرقام';
    }
    
    if (formData.orgProfitPercent && (formData.orgProfitPercent < 0 || formData.orgProfitPercent > 100)) {
      newErrors.orgProfitPercent = 'النسبة يجب أن تكون بين 0 و 100';
    }
    
    if (formData.capitalAmount && formData.capitalAmount <= 0) {
      newErrors.capitalAmount = 'رأس المال يجب أن يكون أكبر من صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await Api.post("/api/partners", {
        ...formData,
        orgProfitPercent: parseInt(formData.orgProfitPercent),
        capitalAmount: parseInt(formData.capitalAmount),
      });
      
      notifySuccess('تم إضافة المستثمر بنجاح');
      onSuccess();
      handleClose();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إضافة المستثمر');
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      nationalId: "",
      address: "",
      phone: "",
      email: "",
      orgProfitPercent: "",
      capitalAmount: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          إضافة مستثمر جديد
        </Typography>
      </DialogTitle>

      <Divider />
      
      <DialogContent sx={{ py: 3 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" mb={3}>
            المعلومات الشخصية
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="الاسم الكامل"
                value={formData.name}
                onChange={handleChange('name')}
                fullWidth
                error={!!errors.name}
                helperText={errors.name}
                required
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="رقم الهوية الوطنية"
                value={formData.nationalId}
                onChange={handleChange('nationalId')}
                fullWidth
                error={!!errors.nationalId}
                helperText={errors.nationalId}
                required
                inputProps={{ maxLength: 14 }}
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="رقم الجوال"
                value={formData.phone}
                onChange={handleChange('phone')}
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone}
                required
                placeholder="05XXXXXXXX"
                inputProps={{ maxLength: 10 }}
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="البريد الإلكتروني (اختياري)"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                fullWidth
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="العنوان"
                value={formData.address}
                onChange={handleChange('address')}
                fullWidth
                error={!!errors.address}
                helperText={errors.address}
                required
                multiline
                rows={1}
                size="medium"
                sx={{width: '520px'}}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="bold" mt={4} mb={3}>
            المعلومات المالية
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="رأس المال (ريال)"
                type="number"
                value={formData.capitalAmount}
                onChange={handleChange('capitalAmount')}
                fullWidth
                error={!!errors.capitalAmount}
                helperText={errors.capitalAmount}
                required
                InputProps={{ inputProps: { min: 0 } }}
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="نسبة أرباح المنشأة (%)"
                type="number"
                value={formData.orgProfitPercent}
                onChange={handleChange('orgProfitPercent')}
                fullWidth
                error={!!errors.orgProfitPercent}
                helperText={errors.orgProfitPercent}
                required
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <Divider />
      
      <DialogActions sx={{ p: 2.5, gap: 1,flexDirection: 'row-reverse' }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ 
            minWidth: '100px',
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: 'grey.50'
            }
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
            minWidth: '100px'
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'إضافة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddInvestor;