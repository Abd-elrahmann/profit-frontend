import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '../../theme/ThemeContext';

// تعريف ثابت لحقول الصلاحيات (مصدر واحد للحقيقة)
const PERMISSION_FIELDS = [
  { field: 'canView', label: 'عرض' },
  { field: 'canAdd', label: 'إضافة' },
  { field: 'canUpdate', label: 'تعديل' },
  { field: 'canDelete', label: 'حذف' },
  { field: 'canPost', label: 'اعتماد' },
  { field: 'canExport', label: 'تصدير' },
];

const validationSchema = Yup.object().shape({
  permissions: Yup.array().of(
    Yup.object().shape({
      module: Yup.string().required(),
      canView: Yup.boolean(),
      canAdd: Yup.boolean(),
      canUpdate: Yup.boolean(),
      canDelete: Yup.boolean(),
      canPost: Yup.boolean(),
      canExport: Yup.boolean(),
    })
  )
});

const AddRole = ({ open, onClose, refetchRoles, mode = 'add', editData = null, isMobile = false }) => {
  const queryClient = useQueryClient();
  const { refreshPermissions } = usePermissions();
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize available modules to avoid recalculating on every render
  const availableModules = useMemo(() => getAvailableModules(), []);

  // Memoize initial values to avoid heavy calculations on every render
  const initialValues = useMemo(() => {
    if (mode === 'edit' && editData) {
      const formattedPermissions = availableModules.map(module => {
        const existingPermission = editData.permissions?.find(p => p.module === module.value);

        // إنشاء كائن الإذن مع جميع الحقول المطلوبة
        const permissionObj = { module: module.value };
        PERMISSION_FIELDS.forEach(({ field }) => {
          permissionObj[field] = existingPermission?.[field] || false;
        });

        return permissionObj;
      });

      return {
        name: editData.name || '',
        description: editData.description || '',
        permissions: formattedPermissions
      };
    } else {
      const defaultPermissions = availableModules.map(module => {
        const permissionObj = { module: module.value };
        PERMISSION_FIELDS.forEach(({ field }) => {
          permissionObj[field] = false;
        });
        return permissionObj;
      });

      return {
        name: '',
        description: '',
        permissions: defaultPermissions
      };
    }
  }, [mode, editData, availableModules]);

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

  const handleSelectAllPermissions = (values, setFieldValue, checked) => {
    const updatedPermissions = values.permissions.map(permission => {
      const updatedPermission = { ...permission };
      PERMISSION_FIELDS.forEach(({ field }) => {
        updatedPermission[field] = checked;
      });
      return updatedPermission;
    });
    
    setFieldValue('permissions', updatedPermissions);
  };

  const isAllSelected = (values, field) => {
    if (!values.permissions || values.permissions.length === 0) return false;
    return values.permissions.every(permission => Boolean(permission[field]) === true);
  };

  const isAnySelected = (values, field) => {
    if (!values.permissions || values.permissions.length === 0) return false;
    return values.permissions.some(permission => Boolean(permission[field]) === true);
  };

  const isAllPermissionsSelected = (values) => {
    if (!values.permissions || values.permissions.length === 0) return false;
    return PERMISSION_FIELDS.every(({ field }) =>
      values.permissions.every(permission => Boolean(permission[field]) === true)
    );
  };

  const getModuleLabel = (moduleValue) => {
    const module = availableModules.find(m => m.value === moduleValue);
    return module?.label || moduleValue;
  };

  // Render permissions section for desktop
  const renderDesktopPermissions = (values, setFieldValue) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          الصلاحيات
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleSelectAllPermissions(values, setFieldValue, !isAllPermissionsSelected(values))}
          sx={{
            minWidth: 120,
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5
          }}
        >
          {isAllPermissionsSelected(values) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
        </Button>
      </Box>
      
      {/* Header with Select All checkboxes */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr repeat(6, auto)',
        gap: 1,
        alignItems: 'center',
        mb: 2,
        p: 1,
        bgcolor: isDarkMode ? 'background.paper' : '#f5f5f5',
        borderRadius: 1
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          الصلاحيات
        </Typography>
        {PERMISSION_FIELDS.map(({ field, label }) => {
          const allSelected = isAllSelected(values, field);
          const someSelected = isAnySelected(values, field);
          return (
            <Box key={field} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                {label}
              </Typography>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={(e) => handleSelectAll(
                  values,
                  setFieldValue,
                  field,
                  e.target.checked
                )}
                sx={{
                  color: "#2E8B45",
                  "&.Mui-checked": {
                    color: "#2E8B45",
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Permissions List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 400, overflow: 'auto' }}>
        {values.permissions?.map((permission, index) => (
          <Box
            key={`${permission.module}-${index}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr repeat(6, auto)',
              gap: 1,
              alignItems: 'center',
              p: 1,
              borderRadius: 1,
              bgcolor: index % 2 === 0 ? 'transparent' : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9')
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666',fontSize: '0.875rem' }}>
              {index + 1}-
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: '600' }}>
              {getModuleLabel(permission.module)}
            </Typography>
            
            {PERMISSION_FIELDS.map(({ field }) => (
              <Box key={field} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Checkbox
                  size="small"
                  checked={Boolean(permission[field])}
                  onChange={(e) => handlePermissionChange(
                    values,
                    setFieldValue,
                    index,
                    field,
                    e.target.checked
                  )}
                  sx={{
                    color: "#2E8B45",
                    "&.Mui-checked": {
                      color: "#2E8B45",
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );

  // Render permissions section for mobile
  const renderMobilePermissions = (values, setFieldValue) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          الصلاحيات
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleSelectAllPermissions(values, setFieldValue, !isAllPermissionsSelected(values))}
          sx={{
            minWidth: 120,
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5
          }}
        >
          {isAllPermissionsSelected(values) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
        </Button>
      </Box>
      
      <Stack spacing={2}>
        {values.permissions?.map((permission, index) => (
          <Accordion key={`${permission.module}-${index}`} sx={{ boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="body2" sx={{ fontWeight: '600' }}>
                {getModuleLabel(permission.module)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {PERMISSION_FIELDS.map(({ field, label }) => (
                  <FormControlLabel
                    key={field}
                    control={
                      <Checkbox
                        checked={Boolean(permission[field])}
                        onChange={(e) => handlePermissionChange(
                          values,
                          setFieldValue,
                          index,
                          field,
                          e.target.checked
                        )}
                        sx={{
                          color: "#2E8B45",
                          "&.Mui-checked": {
                            color: "#2E8B45",
                          },
                        }}
                      />
                    }
                    label={label}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
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
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {mode === 'add' ? 'إضافة دور جديد' : 'تعديل الدور'}
        </Typography>
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
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
                        borderRadius: '6px',
                        '&:hover fieldset': {
                          borderColor: '#2E8B45',
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
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb',
                        borderRadius: '6px',
                        '&:hover fieldset': {
                          borderColor: '#2E8B45',
                        },
                      },
                    }}
                  />
                </Box>
                
                <Divider />

                {/* Permissions Section */}
                {isMobile ? renderMobilePermissions(values, setFieldValue) : renderDesktopPermissions(values, setFieldValue)}
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
                  bgcolor: "#2E8B45",
                  "&:hover": { bgcolor: "#1e5a2e" },
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