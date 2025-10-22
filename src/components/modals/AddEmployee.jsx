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
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Api from '../../config/Api';
import { notifySuccess, notifyError } from '../../utilities/toastify';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('الاسم مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: Yup.string()
    .email('البريد الإلكتروني غير صالح')
    .when('mode', {
      is: 'add',
      then: Yup.string().required('البريد الإلكتروني مطلوب')
    }),
  password: Yup.string()
    .when('mode', {
      is: 'add', 
      then: Yup.string()
        .required('كلمة المرور مطلوبة')
        .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    }),
  phone: Yup.string()
    .required('رقم الهاتف مطلوب')
    .matches(/^[0-9]+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط')
});

const AddEmployee = ({ open, onClose, refetchUsers, mode = 'add', editData = null }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    mode: mode
  });

  useEffect(() => {
    if (mode === 'edit' && editData) {
      setInitialValues({
        name: editData.name || '',
        email: editData.email || '',
        phone: editData.phone || '',
        password: '',
        mode: 'edit'
      });
    }
  }, [mode, editData]);

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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          direction: 'rtl'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        {mode === 'add' ? 'إضافة موظف جديد' : 'تعديل بيانات الموظف'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <DialogContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.875rem',
                    }
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
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.875rem',
                    }
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
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.875rem',
                      }
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
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.875rem',
                    }
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2,flexDirection:'row-reverse' }}>
              <Button 
                onClick={onClose}
                variant="outlined"
                color="inherit"
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  bgcolor: "#1E40AF",
                  "&:hover": { bgcolor: "#1E3A8A" },
                  minWidth: 120
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
