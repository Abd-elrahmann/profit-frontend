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
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, ExpandMore } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Api from '../../config/Api';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { getAvailableModules } from '../../routes';
import { useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '../Contexts/PermissionsContext';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('اسم الدور مطلوب')
    .min(2, 'اسم الدور يجب أن يكون حرفين على الأقل'),
  description: Yup.string()
    .required('وصف الدور مطلوب')
    .min(5, 'الوصف يجب أن يكون 5 أحرف على الأقل'),
  permissions: Yup.array().of(
    Yup.object().shape({
      module: Yup.string().required(),
      canView: Yup.boolean(),
      canAdd: Yup.boolean(),
      canUpdate: Yup.boolean(),
      canDelete: Yup.boolean(),
      canPost: Yup.boolean(),
    })
  )
});

const availableModules = getAvailableModules();

const AddRole = ({ open, onClose, refetchRoles, mode = 'add', editData = null, isMobile = false }) => {
  const queryClient = useQueryClient();
  const { refreshPermissions } = usePermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    permissions: availableModules.map(module => ({
      module: module.value,
      canView: false,
      canAdd: false,
      canUpdate: false,
      canDelete: false,
      canPost: false
    }))
  });

  useEffect(() => {
    if (mode === 'edit' && editData) {
      const formattedPermissions = availableModules.map(module => {
        const existingPermission = editData.permissions?.find(p => p.module === module.value);
        return {
          module: module.value,
          canView: existingPermission?.canView || false,
          canAdd: existingPermission?.canAdd || false,
          canUpdate: existingPermission?.canUpdate || false,
          canDelete: existingPermission?.canDelete || false,
          canPost: existingPermission?.canPost || false
        };
      });

      setInitialValues({
        name: editData.name || '',
        description: editData.description || '',
        permissions: formattedPermissions
      });
    } else {
      setInitialValues({
        name: '',
        description: '',
        permissions: availableModules.map(module => ({
          module: module.value,
          canView: false,
          canAdd: false,
          canUpdate: false,
          canDelete: false,
          canPost: false
        }))
      });
    }
  }, [mode, editData, open]);

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: values.name,
        description: values.description,
        permissions: values.permissions
      };

      if (mode === 'add') {
        await Api.post('/api/roles', payload);
        notifySuccess('تم إضافة الدور بنجاح');
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        queryClient.invalidateQueries({ queryKey: ['employees'] });
      } else {
        await Api.patch(`/api/roles/${editData.id}`, payload);
        notifySuccess('تم تعديل الدور بنجاح');
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        queryClient.invalidateQueries({ queryKey: ['employees'] });
      }
      
      // Refresh permissions to update sidebar immediately
      await refreshPermissions();
      
      resetForm();
      refetchRoles();
      onClose();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء العملية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (values, setFieldValue, moduleIndex, field, value) => {
    const updatedPermissions = [...values.permissions];
    updatedPermissions[moduleIndex] = {
      ...updatedPermissions[moduleIndex],
      [field]: value
    };
    setFieldValue('permissions', updatedPermissions);
  };

  const handleSelectAll = (values, setFieldValue, field, value) => {
    const updatedPermissions = values.permissions.map(permission => ({
      ...permission,
      [field]: value
    }));
    setFieldValue('permissions', updatedPermissions);
  };

  // Render permissions section for desktop
  const renderDesktopPermissions = (values, errors, touched, handleChange, handleBlur, setFieldValue) => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        الصلاحيات
      </Typography>
      
      {/* Header with Select All checkboxes */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr repeat(5, auto)',
        gap: 1,
        alignItems: 'center',
        mb: 2,
        p: 1,
        bgcolor: '#f5f5f5',
        borderRadius: 1
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          الصلاحيات
        </Typography>
        {['عرض', 'إضافة', 'تعديل', 'حذف', 'اعتماد'].map((action, index) => (
          <Box key={action} sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
              {action}
            </Typography>
            <Checkbox
              size="small"
              onChange={(e) => handleSelectAll(
                values, 
                setFieldValue, 
                ['canView', 'canAdd', 'canUpdate', 'canDelete', 'canPost'][index], 
                e.target.checked
              )}
            />
          </Box>
        ))}
      </Box>

      {/* Permissions List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 400, overflow: 'auto' }}>
        {values.permissions.map((permission, index) => {
          const moduleConfig = availableModules.find(m => m.value === permission.module);
          return (
            <Box
              key={permission.module}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr repeat(5, auto)',
                gap: 1,
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                bgcolor: index % 2 === 0 ? 'transparent' : '#f9f9f9'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666',fontSize: '0.875rem' }}>
                {index + 1}-
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: '500' }}>
                {moduleConfig?.label || permission.module}
              </Typography>
              
              {['canView', 'canAdd', 'canUpdate', 'canDelete', 'canPost'].map((field) => (
                <Box key={field} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={permission[field]}
                        onChange={(e) => handlePermissionChange(
                          values, 
                          setFieldValue, 
                          index, 
                          field, 
                          e.target.checked
                        )}
                      />
                    }
                    label=""
                  />
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  // Render permissions section for mobile
  const renderMobilePermissions = (values, setFieldValue) => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        الصلاحيات
      </Typography>
      
      <Stack spacing={2}>
        {values.permissions.map((permission, index) => {
          const moduleConfig = availableModules.find(m => m.value === permission.module);
          return (
            <Accordion key={permission.module} sx={{ boxShadow: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2" sx={{ fontWeight: '500' }}>
                  {moduleConfig?.label || permission.module}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {[
                    { field: 'canView', label: 'عرض' },
                    { field: 'canAdd', label: 'إضافة' },
                    { field: 'canUpdate', label: 'تعديل' },
                    { field: 'canDelete', label: 'حذف' },
                    { field: 'canPost', label: 'اعتماد' }
                  ].map(({ field, label }) => (
                    <FormControlLabel
                      key={field}
                      control={
                        <Checkbox
                          checked={permission[field]}
                          onChange={(e) => handlePermissionChange(
                            values, 
                            setFieldValue, 
                            index, 
                            field, 
                            e.target.checked
                          )}
                        />
                      }
                      label={label}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );

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
        {mode === 'add' ? 'إضافة دور جديد' : 'تعديل الدور'}
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
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <DialogContent sx={{ pb: 1 }}>
              <Stack spacing={3}>
                {/* Role Name and Description */}
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                  <TextField
                    name="name"
                    label="اسم الدور"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    fullWidth={isMobile}
                    sx={{ 
                      minWidth: isMobile ? 'auto' : 250,
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
                    name="description"
                    label="وصف الدور"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    fullWidth={isMobile}
                    sx={{ 
                      minWidth: isMobile ? 'auto' : 250,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        '&:hover fieldset': {
                          borderColor: '#0d40a5',
                        },
                      },
                    }}
                  />
                </Box>
                
                <Divider />

                {/* Permissions Section */}
                {isMobile ? renderMobilePermissions(values, setFieldValue) : renderDesktopPermissions(values, errors, touched, handleChange, handleBlur, setFieldValue)}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ 
              px: 3, 
              py: 2, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 2,
              flexDirection: 'row-reverse',
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

export default AddRole;