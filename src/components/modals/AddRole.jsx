import React, { useState, useMemo } from 'react';
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
  Tabs,
  Tab,
} from '@mui/material';
import { Close as CloseIcon, ExpandMore, Security, Folder } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Api from '../../config/Api';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { getAvailableModules, getFileAccessModules } from '../../routes';
import { useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '../Contexts/PermissionsContext';
import { useTheme } from '../../theme/ThemeContext';
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
  const [permissionTab, setPermissionTab] = useState(0);
  const availableModules = useMemo(() => getAvailableModules(), []);
  const fileAccessModules = useMemo(() => getFileAccessModules(), []);
  const initialValues = useMemo(() => {
    const allModules = [...availableModules, ...fileAccessModules];
    if (mode === 'edit' && editData) {
      const formattedPermissions = allModules.map(module => {
        const existingPermission = editData.permissions?.find(p => p.module === module.value);
        const permissionObj = { module: module.value };
        PERMISSION_FIELDS.forEach(({ field }) => {
          permissionObj[field] = existingPermission?.[field] || false;
        });
        if (module.value.startsWith('files-')) {
          ['canAdd', 'canUpdate', 'canDelete', 'canPost', 'canExport'].forEach(f => {
            permissionObj[f] = false;
          });
        }
        return permissionObj;
      });
      return {
        name: editData.name || '',
        description: editData.description || '',
        permissions: formattedPermissions
      };
    } else {
      const defaultPermissions = allModules.map(module => {
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
  }, [mode, editData, availableModules, fileAccessModules]);
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      const permissions = values.permissions.map(p => {
        if (p.module.startsWith('files-')) {
          return { ...p, canAdd: false, canUpdate: false, canDelete: false, canPost: false, canExport: false };
        }
        return p;
      });
      const payload = {
        name: values.name,
        description: values.description,
        permissions
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
    const updatedPermissions = values.permissions.map(permission =>
      permission.module.startsWith('files-') ? permission : { ...permission, [field]: value }
    );
    setFieldValue('permissions', updatedPermissions);
  };
  const handleSelectAllPermissions = (values, setFieldValue, checked) => {
    const updatedPermissions = values.permissions.map(permission => {
      if (permission.module.startsWith('files-')) return permission;
      const updatedPermission = { ...permission };
      PERMISSION_FIELDS.forEach(({ field }) => {
        updatedPermission[field] = checked;
      });
      return updatedPermission;
    });
    setFieldValue('permissions', updatedPermissions);
  };
  const handleSelectAllFilePermissions = (values, setFieldValue, checked) => {
    const updatedPermissions = values.permissions.map(permission => {
      if (!permission.module.startsWith('files-')) return permission;
      return { ...permission, canView: checked };
    });
    setFieldValue('permissions', updatedPermissions);
  };
  const pagePermissions = (values) => values.permissions?.filter(p => !p.module.startsWith('files-')) || [];
  const filePermissionsList = (values) => values.permissions?.filter(p => p.module.startsWith('files-')) || [];
  const isAllSelected = (values, field) => {
    const list = pagePermissions(values);
    if (list.length === 0) return false;
    return list.every(permission => Boolean(permission[field]) === true);
  };
  const isAnySelected = (values, field) => {
    const list = pagePermissions(values);
    if (list.length === 0) return false;
    return list.some(permission => Boolean(permission[field]) === true);
  };
  const isAllPermissionsSelected = (values) => {
    const list = pagePermissions(values);
    if (list.length === 0) return false;
    return PERMISSION_FIELDS.every(({ field }) =>
      list.every(permission => Boolean(permission[field]) === true)
    );
  };
  const isAllFilePermissionsSelected = (values) => {
    const list = filePermissionsList(values);
    if (list.length === 0) return false;
    return list.every(p => Boolean(p.canView) === true);
  };
  const isAnyFilePermissionSelected = (values) => {
    const list = filePermissionsList(values);
    if (list.length === 0) return false;
    return list.some(p => Boolean(p.canView) === true);
  };
  const getModuleLabel = (moduleValue) => {
    const module = availableModules.find(m => m.value === moduleValue);
    if (module) return module.label;
    const fileModule = fileAccessModules.find(m => m.value === moduleValue);
    return fileModule?.label || moduleValue;
  };
  const renderPagePermissionsTab = (values, setFieldValue) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          اختر الصلاحيات لكل صفحة
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
          الصفحات
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 350, overflow: 'auto' }}>
        {pagePermissions(values).map((permission, idx) => {
          const index = values.permissions.findIndex(p => p.module === permission.module);
          return (
            <Box
              key={`${permission.module}-${index}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr repeat(6, auto)',
                gap: 1,
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                bgcolor: idx % 2 === 0 ? 'transparent' : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9')
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666', fontSize: '0.875rem' }}>
                {idx + 1}-
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
          );
        })}
      </Box>
    </Box>
  );

  const renderFilePermissionsTab = (values, setFieldValue) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          اختر الصفحات التي يمكن للدور عرض ملفاتها
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleSelectAllFilePermissions(values, setFieldValue, !isAllFilePermissionsSelected(values))}
          sx={{
            minWidth: 120,
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5
          }}
        >
          {isAllFilePermissionsSelected(values) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
        </Button>
      </Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 1,
        alignItems: 'center',
        p: 1,
        borderRadius: 1,
        bgcolor: isDarkMode ? 'background.paper' : '#f5f5f5',
        mb: 2
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          #
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          الصفحة
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
            عرض
          </Typography>
          <Checkbox
            size="small"
            checked={isAllFilePermissionsSelected(values)}
            indeterminate={isAnyFilePermissionSelected(values) && !isAllFilePermissionsSelected(values)}
            onChange={(e) => handleSelectAllFilePermissions(values, setFieldValue, e.target.checked)}
            sx={{
              color: "#2E8B45",
              "&.Mui-checked": {
                color: "#2E8B45",
              },
            }}
          />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 350, overflow: 'auto' }}>
        {filePermissionsList(values).map((permission, idx) => {
          const index = values.permissions.findIndex(p => p.module === permission.module);
          return (
            <Box
              key={`file-${permission.module}-${index}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 1,
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                bgcolor: idx % 2 === 0 ? 'transparent' : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9')
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666', fontSize: '0.875rem' }}>
                {idx + 1}-
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: '600' }}>
                {getModuleLabel(permission.module)}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Checkbox
                  size="small"
                  checked={Boolean(permission.canView)}
                  onChange={(e) => handlePermissionChange(
                    values,
                    setFieldValue,
                    index,
                    'canView',
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
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  const renderDesktopPermissions = (values, setFieldValue) => (
    <Box>
      <Tabs
        value={permissionTab}
        onChange={(e, newValue) => setPermissionTab(newValue)}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            fontWeight: 'bold',
            fontSize: '0.875rem',
            minHeight: 48,
          },
          '& .Mui-selected': {
            color: '#2E8B45 !important',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#2E8B45',
          },
        }}
      >
        <Tab 
          icon={<Security sx={{ fontSize: 20 }} />} 
          iconPosition="start" 
          label="صلاحيات الصفحات" 
        />
        <Tab 
          icon={<Folder sx={{ fontSize: 20 }} />} 
          iconPosition="start" 
          label="صلاحيات الوصول للملفات" 
        />
      </Tabs>
      {permissionTab === 0 && renderPagePermissionsTab(values, setFieldValue)}
      {permissionTab === 1 && renderFilePermissionsTab(values, setFieldValue)}
    </Box>
  );
  const renderMobilePagePermissions = (values, setFieldValue) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          اختر الصلاحيات لكل صفحة
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleSelectAllPermissions(values, setFieldValue, !isAllPermissionsSelected(values))}
          sx={{
            minWidth: 100,
            fontSize: '0.7rem',
            py: 0.5,
            px: 1
          }}
        >
          {isAllPermissionsSelected(values) ? 'إلغاء الكل' : 'تحديد الكل'}
        </Button>
      </Box>
      <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
        {pagePermissions(values).map((permission) => {
          const index = values.permissions.findIndex(p => p.module === permission.module);
          return (
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
          );
        })}
      </Stack>
    </Box>
  );

  const renderMobileFilePermissions = (values, setFieldValue) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          اختر الصفحات التي يمكن عرض ملفاتها
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleSelectAllFilePermissions(values, setFieldValue, !isAllFilePermissionsSelected(values))}
          sx={{
            minWidth: 100,
            fontSize: '0.7rem',
            py: 0.5,
            px: 1
          }}
        >
          {isAllFilePermissionsSelected(values) ? 'إلغاء الكل' : 'تحديد الكل'}
        </Button>
      </Box>
      <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
        {filePermissionsList(values).map((permission, idx) => {
          const index = values.permissions.findIndex(p => p.module === permission.module);
          return (
            <Box key={`file-${permission.module}-${index}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 1, bgcolor: idx % 2 === 0 ? 'transparent' : (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9') }}>
              <Typography variant="body2" sx={{ fontWeight: '600' }}>
                {getModuleLabel(permission.module)}
              </Typography>
              <Checkbox
                checked={Boolean(permission.canView)}
                onChange={(e) => handlePermissionChange(
                  values,
                  setFieldValue,
                  index,
                  'canView',
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
      </Stack>
    </Box>
  );

  const renderMobilePermissions = (values, setFieldValue) => (
    <Box>
      <Tabs
        value={permissionTab}
        onChange={(e, newValue) => setPermissionTab(newValue)}
        variant="fullWidth"
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            fontWeight: 'bold',
            fontSize: '0.75rem',
            minHeight: 40,
            px: 1,
          },
          '& .Mui-selected': {
            color: '#2E8B45 !important',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#2E8B45',
          },
        }}
      >
        <Tab 
          icon={<Security sx={{ fontSize: 18 }} />} 
          iconPosition="start" 
          label="الصفحات" 
        />
        <Tab 
          icon={<Folder sx={{ fontSize: 18 }} />} 
          iconPosition="start" 
          label="الملفات" 
        />
      </Tabs>
      {permissionTab === 0 && renderMobilePagePermissions(values, setFieldValue)}
      {permissionTab === 1 && renderMobileFilePermissions(values, setFieldValue)}
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