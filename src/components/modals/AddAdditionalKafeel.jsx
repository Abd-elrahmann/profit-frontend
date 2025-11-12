import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload, Delete } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Api from '../../config/Api';
import { useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '../../utilities/toastify';

const kafeelValidationSchema = Yup.object().shape({
  name: Yup.string().required('اسم الكفيل مطلوب'),
  nationalId: Yup.string().required('رقم هوية الكفيل مطلوب'),
  phone: Yup.string().required('رقم جوال الكفيل مطلوب'),
  email: Yup.string().email('البريد الإلكتروني غير صالح'),
  employer: Yup.string().required('جهة عمل الكفيل مطلوبة'),
  salary: Yup.number().required('الراتب مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر'),
  obligations: Yup.number().required('التزامات الكفيل مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر'),
});

const AddAdditionalKafeel = ({ open, onClose, clientId }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const queryClient = useQueryClient();
  const steps = ['معلومات الكفيل', 'مستندات الكفيل'];

  const initialValues = {
    name: '',
    nationalId: '',
    birthDate: '',
    city: '',
    district: '',
    employer: '',
    salary: '',
    obligations: '',
    phone: '',
    email: '',
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleDrop = (acceptedFiles, fieldName) => {
    if (acceptedFiles.length > 0) {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: acceptedFiles[0]
      }));
    }
  };

  const removeFile = (fieldName) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fieldName];
      return newFiles;
    });
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const DocumentDropzone = ({ fieldName, label, acceptedTypes }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: acceptedTypes,
      onDrop: (files) => handleDrop(files, fieldName),
      multiple: false,
    });

    const file = uploadedFiles[fieldName];

    return (
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : '#ccc',
          textAlign: 'center',
          bgcolor: isDragActive ? 'action.hover' : '#fafafa',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        {file ? (
          <Box>
            {file.type.startsWith('image/') ? (
              <Box>
                <img 
                  src={getFilePreview(file)} 
                  alt={file.name}
                  style={{ maxWidth: '200px', maxHeight: 120, marginBottom: 8 }}
                />
                <Typography variant="body2">{file.name}</Typography>
              </Box>
            ) : (
              <Box>
                <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2">{file.name}</Typography>
              </Box>
            )}
            <Button
              startIcon={<Delete />}
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(fieldName);
              }}
              sx={{ mt: 1 }}
            >
              إزالة
            </Button>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 40, color: '#9e9e9e', mb: 1 }} />
            <Typography variant="body2">{label}</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              اسحب وأفلت الملف هنا أو انقر للاختيار
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add kafeel data
      Object.keys(values).forEach(key => {
        if (values[key] !== '') {
          formData.append(`kafeel[${key}]`, values[key]);
        }
      });

      // Add documents
      Object.keys(uploadedFiles).forEach(key => {
        formData.append(key, uploadedFiles[key]);
      });

      await Api.post(`/api/clients/${clientId}/kafeels`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      notifySuccess('تم إضافة الكفيل بنجاح');
      queryClient.invalidateQueries({ queryKey: ['client-details', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
      setActiveStep(0);
      setUploadedFiles({});
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إضافة الكفيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
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
        <Typography variant="h6" fontWeight="bold">
          إضافة كفيل جديد
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Stepper activeStep={activeStep} sx={{ p: 3, pb: 0 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Formik
        initialValues={initialValues}
        validationSchema={kafeelValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, submitForm }) => (
          <Form onSubmit={(e) => e.preventDefault()}>
            <DialogContent sx={{ pb: 1, minHeight: 400 }}>
              {/* Step 1: Kafeel Information */}
              {activeStep === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>معلومات الكفيل</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="name"
                        label="اسم الكفيل"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="nationalId"
                        label="رقم هوية الكفيل"
                        value={values.nationalId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.nationalId && Boolean(errors.nationalId)}
                        helperText={touched.nationalId && errors.nationalId}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="birthDate"
                        label="تاريخ الميلاد"
                        type="date"
                        value={values.birthDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.birthDate && Boolean(errors.birthDate)}
                        helperText={touched.birthDate && errors.birthDate}
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="رقم جوال الكفيل"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phone && Boolean(errors.phone)}
                        helperText={touched.phone && errors.phone}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="email"
                        label="البريد الإلكتروني (اختياري)"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="city"
                        label="المدينة"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.city && Boolean(errors.city)}
                        helperText={touched.city && errors.city}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="district"
                        label="الحي"
                        value={values.district}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.district && Boolean(errors.district)}
                        helperText={touched.district && errors.district}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="employer"
                        label="جهة عمل الكفيل"
                        value={values.employer}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.employer && Boolean(errors.employer)}
                        helperText={touched.employer && errors.employer}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="salary"
                        label="راتب الكفيل"
                        type="number"
                        value={values.salary}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.salary && Boolean(errors.salary)}
                        helperText={touched.salary && errors.salary}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="obligations"
                        label="التزامات الكفيل"
                        type="number"
                        value={values.obligations}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.obligations && Boolean(errors.obligations)}
                        helperText={touched.obligations && errors.obligations}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 2: Documents */}
              {activeStep === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6">مستندات الكفيل</Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DocumentDropzone
                        fieldName="kafeelIdImage"
                        label="صورة هوية الكفيل"
                        acceptedTypes={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DocumentDropzone
                        fieldName="kafeelWorkCard"
                        label="بطاقة عمل الكفيل"
                        acceptedTypes={{ 
                          'application/pdf': ['.pdf'],
                          'image/*': ['.png', '.jpg', '.jpeg'] 
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ 
              px: 3, 
              py: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
            }}>
              <Box>
                {activeStep > 0 && (
                  <Button onClick={handleBack} disabled={isSubmitting}>
                    رجوع
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  onClick={onClose}
                  variant="outlined"
                  color="inherit"
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    disabled={
                      activeStep === 0 && (!values.name || !values.nationalId || !values.phone || 
                        !values.employer || !values.salary || !values.obligations)
                    }
                    sx={{
                      bgcolor: "#0d40a5",
                      "&:hover": { bgcolor: "#0b3589" },
                    }}
                  >
                    التالي
                  </Button>
                ) : (
                  <Button
                    onClick={submitForm}
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      bgcolor: "#0d40a5",
                      "&:hover": { bgcolor: "#0b3589" },
                      minWidth: 120
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'إضافة الكفيل'
                    )}
                  </Button>
                )}
              </Box>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddAdditionalKafeel;

