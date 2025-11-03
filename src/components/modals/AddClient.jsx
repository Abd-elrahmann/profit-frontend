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
  Switch,
  FormControlLabel,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload, Delete } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Api from '../../config/Api';
import { useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '../../utilities/toastify';
// Create dynamic validation schema based on hasKafeel value
const createClientValidationSchema = (hasKafeel) => {
  return Yup.object().shape({
    // Client Information
    name: Yup.string().required('اسم العميل مطلوب'),
    phone: Yup.string().required('رقم الجوال مطلوب'),
    email: Yup.string().email('البريد الإلكتروني غير صالح'),
    nationalId: Yup.string().required('رقم الهوية الوطنية مطلوب'),
    birthDate: Yup.date().required('تاريخ الميلاد مطلوب'),
    city: Yup.string().required('المدينة مطلوبة'),
    district: Yup.string().required('الحي مطلوب'),
    address: Yup.string().required('العنوان مطلوب'),
    employer: Yup.string().required('جهة العمل مطلوبة'),
    salary: Yup.number().required('الراتب مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر'),
    obligations: Yup.number().required('الالتزامات مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر'),
    creationReason: Yup.string().required('سبب الإنشاء مطلوب'),
    notes: Yup.string(),

    // Kafeel Information (conditionally required)
    hasKafeel: Yup.boolean(),
    kafeelName: hasKafeel 
      ? Yup.string().required('اسم الكفيل مطلوب')
      : Yup.string(),
    kafeelNationalId: hasKafeel 
      ? Yup.string().required('رقم هوية الكفيل مطلوب')
      : Yup.string(),
    kafeelPhone: hasKafeel 
      ? Yup.string().required('رقم جوال الكفيل مطلوب')
      : Yup.string(),
    kafeelEmail: hasKafeel 
      ? Yup.string().email('البريد الإلكتروني غير صالح')
      : Yup.string().email('البريد الإلكتروني غير صالح'),
    kafeelEmployer: hasKafeel 
      ? Yup.string().required('جهة عمل الكفيل مطلوبة')
      : Yup.string(),
    kafeelSalary: hasKafeel 
      ? Yup.number().required('راتب الكفيل مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر')
      : Yup.number(),
    kafeelObligations: hasKafeel 
      ? Yup.number().required('التزامات الكفيل مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر')
      : Yup.number(),
  });
};

const AddClient = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const queryClient = useQueryClient();
  const steps = ['المعلومات الأساسية', 'معلومات الكفيل', 'المستندات'];

  const initialValues = {
    // Client Information
    name: '',
    phone: '',
    email: '',
    nationalId: '',
    birthDate: '',
    city: '',
    district: '',
    address: '',
    employer: '',
    salary: '',
    obligations: '',
    creationReason: '',
    notes: '',

    // Kafeel Information
    hasKafeel: false,
    kafeelName: '',
    kafeelNationalId: '',
    kafeelBirthDate: '',  
    kafeelCity: '',
    kafeelDistrict: '',
    kafeelEmployer: '',
    kafeelSalary: '',
    kafeelObligations: '',
    kafeelPhone: '',
    kafeelEmail: '',
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

      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });

      Object.keys(uploadedFiles).forEach(key => {
        formData.append(key, uploadedFiles[key]);
      });

      await Api.post('/api/clients', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      notifySuccess('تم إضافة العميل بنجاح');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
      setActiveStep(0);
      setUploadedFiles({});
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إضافة العميل');
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
          إضافة عميل جديد
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
        validationSchema={createClientValidationSchema(initialValues.hasKafeel)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, submitForm }) => (
          <Form onSubmit={(e) => e.preventDefault()}>
            <DialogContent sx={{ pb: 1, minHeight: 400 }}>
              {/* Step 1: Client Information */}
              {activeStep === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>المعلومات الشخصية للعميل</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="name"
                        label="اسم العميل"
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
                        label="رقم الهوية الوطنية"
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
                        name="email"
                        label=" البريد الإلكتروني (اختياري)" 
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
                        name="birthDate"
                        label="تاريخ الميلاد"
                        type="date"
                        value={values.birthDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.birthDate && Boolean(errors.birthDate)}
                        helperText={touched.birthDate && errors.birthDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />  
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="رقم الجوال"
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
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="address"
                        label="العنوان التفصيلي"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.address && Boolean(errors.address)}
                        helperText={touched.address && errors.address}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="employer"
                        label="جهة العمل"
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
                        label="الراتب"
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
                        label="الالتزامات"
                        type="number"
                        value={values.obligations}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.obligations && Boolean(errors.obligations)}
                        helperText={touched.obligations && errors.obligations}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="creationReason"
                        label="سبب الإنشاء"
                        value={values.creationReason}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.creationReason && Boolean(errors.creationReason)}
                        helperText={touched.creationReason && errors.creationReason}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="notes"
                        label="ملاحظات"
                        multiline
                        rows={2}
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.notes && Boolean(errors.notes)}
                        helperText={touched.notes && errors.notes}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                           width: '800px',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.hasKafeel}
                        onChange={(e) => setFieldValue('hasKafeel', e.target.checked)}
                      />
                    }
                    label="هل يوجد كفيل؟"
                  />
                </Box>
              )}

              {/* Step 2: Kafeel Information */}
              {activeStep === 1 && values.hasKafeel && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>معلومات الكفيل</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelName"
                        label="اسم الكفيل"
                        value={values.kafeelName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelName && Boolean(errors.kafeelName)}
                        helperText={touched.kafeelName && errors.kafeelName}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelNationalId"
                        label="رقم هوية الكفيل"
                        value={values.kafeelNationalId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelNationalId && Boolean(errors.kafeelNationalId)}
                        helperText={touched.kafeelNationalId && errors.kafeelNationalId}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelBirthDate"
                        label="تاريخ الميلاد"
                        type="date"
                        value={values.kafeelBirthDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelBirthDate && Boolean(errors.kafeelBirthDate)}
                        helperText={touched.kafeelBirthDate && errors.kafeelBirthDate}
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelPhone"
                        label="رقم جوال الكفيل"
                        value={values.kafeelPhone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelPhone && Boolean(errors.kafeelPhone)}
                        helperText={touched.kafeelPhone && errors.kafeelPhone}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelEmail"
                        label="البريد الإلكتروني (اختياري)"
                        type="email"
                        value={values.kafeelEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelEmail && Boolean(errors.kafeelEmail)}
                        helperText={touched.kafeelEmail && errors.kafeelEmail}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelCity"
                        label="المدينة"
                        value={values.kafeelCity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelCity && Boolean(errors.kafeelCity)}
                        helperText={touched.kafeelCity && errors.kafeelCity}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelDistrict"
                        label="الحي"
                        value={values.kafeelDistrict}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelDistrict && Boolean(errors.kafeelDistrict)}
                        helperText={touched.kafeelDistrict && errors.kafeelDistrict}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelEmployer"
                        label="جهة عمل الكفيل"
                        value={values.kafeelEmployer}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelEmployer && Boolean(errors.kafeelEmployer)}
                        helperText={touched.kafeelEmployer && errors.kafeelEmployer}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelSalary"
                        label="راتب الكفيل"
                        type="number"
                        value={values.kafeelSalary}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelSalary && Boolean(errors.kafeelSalary)}
                        helperText={touched.kafeelSalary && errors.kafeelSalary}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="kafeelObligations"
                        label="التزامات الكفيل"
                        type="number"
                        value={values.kafeelObligations}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.kafeelObligations && Boolean(errors.kafeelObligations)}
                        helperText={touched.kafeelObligations && errors.kafeelObligations}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 1 && !values.hasKafeel && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  تم تعطيل معلومات الكفيل. يمكنك المتابعة إلى الخطوة التالية.
                </Alert>
              )}

              {/* Step 3: Documents */}
              {activeStep === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6">مستندات العميل</Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DocumentDropzone
                        fieldName="clientIdImage"
                        label="صورة هوية العميل"
                        acceptedTypes={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DocumentDropzone
                        fieldName="clientWorkCard"
                        label="بطاقة عمل العميل"
                        acceptedTypes={{ 
                          'application/pdf': ['.pdf'],
                          'image/*': ['.png', '.jpg', '.jpeg'] 
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DocumentDropzone
                        fieldName="salaryReport"
                        label="تقرير الراتب"
                        acceptedTypes={{ 
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc', '.docx'] 
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DocumentDropzone
                        fieldName="simaReport"
                        label="تقرير سمة"
                        acceptedTypes={{ 
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc', '.docx'] 
                        }}
                      />
                    </Grid>
                  </Grid>

                  {values.hasKafeel && (
                    <>
                      <Typography variant="h6" sx={{ mt: 3 }}>مستندات الكفيل</Typography>
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
                    </>
                  )}
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
                      (activeStep === 1 && values.hasKafeel && Object.keys(errors).some(key => key.startsWith('kafeel'))) ||
                      (activeStep === 0 && (!values.name || !values.phone || !values.nationalId || !values.birthDate || 
                        !values.city || !values.district || !values.address || !values.employer || !values.salary || 
                        !values.obligations || !values.creationReason))
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
                      'إضافة العميل'
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

export default AddClient;