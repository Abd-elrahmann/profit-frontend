// AddEmployee.jsx - مودال إضافة/تعديل الموظفين
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Api from '../../config/Api';
import { notifySuccess, notifyError } from '../../utilities/toastify';

// Create dynamic validation schema based on mode
const createValidationSchema = (mode) => {
  return Yup.object().shape({
    name: Yup.string()
      .required('الاسم مطلوب')
      .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
    email: mode === 'add' 
      ? Yup.string()
          .email('البريد الإلكتروني غير صالح')
          .required('البريد الإلكتروني مطلوب')
      : Yup.string().email('البريد الإلكتروني غير صالح'),
    password: mode === 'add'
      ? Yup.string()
          .required('كلمة المرور مطلوبة')
          .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      : Yup.string(),
    phone: Yup.string()
      .required('رقم الهاتف مطلوب')
      .matches(/^[0-9]+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط')
  });
};

const passwordChangeSchema = Yup.object().shape({
  oldPassword: Yup.string().required('كلمة المرور الحالية مطلوبة'),
  newPassword: Yup.string()
    .required('كلمة المرور الجديدة مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: Yup.string()
    .required('تأكيد كلمة المرور مطلوب')
    .oneOf([Yup.ref('newPassword')], 'كلمات المرور غير متطابقة')
});

const AddEmployee = ({ open, onClose, refetchUsers, mode = 'add', editData = null, isMobile = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    if (mode === 'edit' && editData) {
      setInitialValues({
        name: editData.name || '',
        email: editData.email || '',
        phone: editData.phone || '',
        password: ''
      });
    } else if (mode === 'add') {
      setInitialValues({
        name: '',
        email: '',
        password: '',
        phone: ''
      });
    }
    
    setShowPasswordSection(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, [mode, editData, open]);

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        await Api.post('/api/users', values);
        notifySuccess('تم إضافة الموظف بنجاح');
      } else {
        const { name, phone } = values;
        await Api.patch(`/api/users/${editData.id}`, { name, phone });
        notifySuccess('تم تعديل بيانات الموظف بنجاح');
      }
      resetForm();
      refetchUsers();
      onClose();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء العملية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (values, { resetForm }) => {
    setIsUpdatingPassword(true);
    try {
      await Api.patch('/api/auth/update-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      notifySuccess('تم تغيير كلمة المرور بنجاح');
      resetForm();
      setShowPasswordSection(false);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={isMobile ? "xs" : "sm"}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          direction: 'rtl'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        position: isMobile ? 'sticky' : 'static',
        top: 0,
        bgcolor: 'background.paper',
        zIndex: 1
      }}>
        {mode === 'add' ? 'إضافة موظف جديد' : 'تعديل بيانات الموظف'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={createValidationSchema(mode)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <DialogContent sx={{ pb: 1 }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  name="name"
                  placeholder="الاسم"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      '&:hover fieldset': {
                        borderColor: '#0d40a5',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  name="email"
                  placeholder="البريد الإلكتروني"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  disabled={mode === 'edit'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      '&:hover fieldset': {
                        borderColor: '#0d40a5',
                      },
                    },
                  }}
                />

                {mode === 'add' && (
                  <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="كلمة المرور"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        '&:hover fieldset': {
                          borderColor: '#0d40a5',
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <VisibilityOff size={15} /> : <Visibility size={15} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                <TextField
                  fullWidth
                  name="phone"
                  placeholder="رقم الهاتف"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      '&:hover fieldset': {
                        borderColor: '#0d40a5',
                      },
                    },
                  }}
                />

                {/* Password Change Section - Only in Edit Mode */}
                {mode === 'edit' && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        تغيير كلمة المرور
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {showPasswordSection ? 'إخفاء' : 'إظهار'}
                      </Button>
                    </Box>
                    
                    {showPasswordSection && (
                      <Formik
                        initialValues={{
                          oldPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        }}
                        validationSchema={passwordChangeSchema}
                        onSubmit={handlePasswordChange}
                      >
                        {({ values: pwdValues, errors: pwdErrors, touched: pwdTouched, handleChange: pwdHandleChange, handleBlur: pwdHandleBlur }) => (
                          <Form>
                            <Stack spacing={2}>
                              <TextField
                                fullWidth
                                name="oldPassword"
                                type={showOldPassword ? 'text' : 'password'}
                                placeholder="كلمة المرور الحالية"
                                value={pwdValues.oldPassword}
                                onChange={pwdHandleChange}
                                onBlur={pwdHandleBlur}
                                error={pwdTouched.oldPassword && Boolean(pwdErrors.oldPassword)}
                                helperText={pwdTouched.oldPassword && pwdErrors.oldPassword}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    '&:hover fieldset': {
                                      borderColor: '#0d40a5',
                                    },
                                  },
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                      >
                                        {showOldPassword ? <VisibilityOff size={15} /> : <Visibility size={15} />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <TextField
                                fullWidth
                                name="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="كلمة المرور الجديدة"
                                value={pwdValues.newPassword}
                                onChange={pwdHandleChange}
                                onBlur={pwdHandleBlur}
                                error={pwdTouched.newPassword && Boolean(pwdErrors.newPassword)}
                                helperText={pwdTouched.newPassword && pwdErrors.newPassword}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    '&:hover fieldset': {
                                      borderColor: '#0d40a5',
                                    },
                                  },
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                      >
                                        {showNewPassword ? <VisibilityOff size={15} /> : <Visibility size={15} />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <TextField
                                fullWidth
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="تأكيد كلمة المرور الجديدة"
                                value={pwdValues.confirmPassword}
                                onChange={pwdHandleChange}
                                onBlur={pwdHandleBlur}
                                error={pwdTouched.confirmPassword && Boolean(pwdErrors.confirmPassword)}
                                helperText={pwdTouched.confirmPassword && pwdErrors.confirmPassword}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '6px',
                                    '&:hover fieldset': {
                                      borderColor: '#0d40a5',
                                    },
                                  },
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      >
                                        {showConfirmPassword ? <VisibilityOff size={15} /> : <Visibility size={15} />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              <Button
                                type="submit"
                                variant="contained"
                                disabled={isUpdatingPassword}
                                sx={{
                                  bgcolor: "#dc2626",
                                  "&:hover": { bgcolor: "#b91c1c" },
                                  mt: 1
                                }}
                              >
                                {isUpdatingPassword ? (
                                  <CircularProgress size={20} color="inherit" />
                                ) : (
                                  'تغيير كلمة المرور'
                                )}
                              </Button>
                            </Stack>
                          </Form>
                        )}
                      </Formik>
                    )}
                  </Box>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ 
              px: 3, 
              py: 2, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 2,
              flexDirection:'row-reverse',
              position: isMobile ? 'sticky' : 'static',
              bottom: 0,
              bgcolor: 'background.paper',
              borderTop: isMobile ? '1px solid' : 'none',
              borderColor: 'divider'
            }}>
              <Button 
                onClick={onClose}
                variant="outlined"
                color="inherit"
                disabled={isSubmitting}
                fullWidth={isMobile}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                fullWidth={isMobile}
                sx={{
                  bgcolor: "#1E40AF",
                  "&:hover": { bgcolor: "#1E3A8A" },
                  minWidth: isMobile ? 'auto' : 120
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  mode === 'add' ? 'إضافة' : 'تعديل'
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddEmployee;