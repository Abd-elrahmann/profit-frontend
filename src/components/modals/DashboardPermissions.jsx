import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Close as CloseIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Api from '../../config/Api';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { useQueryClient } from '@tanstack/react-query';
const dashboardSections = [
  {
    module: 'client-stats',
    label: 'إحصائيات العملاء',
    description: 'عرض إحصائيات العملاء والأرباح والخسائر'
  },
  {
    module: 'partner-stats',
    label: 'إحصائيات الشركاء',
    description: 'عرض إحصائيات الشركاء ورؤوس الأموال والأرباح'
  },
  {
    module: 'loan-stats',
    label: 'إحصائيات السلف',
    description: 'عرض إحصائيات السلف والبنك'
  },
  {
    module: 'monthly-collection',
    label: 'التحصيل الشهري',
    description: 'عرض التحصيل الشهري والأرباح المتوقعة'
  },
  {
    module: 'expense-stats',
    label: 'احصائيات المصاريف',
    description: 'تحليل المصاريف وتوزيعها حسب الفئة'
  },
  {
    module: 'Upcoming-Repayments',
    label: 'الدفعات القادمة',
    description: 'عرض الدفعات القادمة'
  },
  {
    module: 'Last-Actions',
    label: 'آخر الأنشطة',
    description: 'عرض آخر الأنشطة والعمليات في النظام'
  }
];
const validationSchema = Yup.object().shape({
  permissions: Yup.array().of(
    Yup.object().shape({
      module: Yup.string().required(),
      canView: Yup.boolean(),
    })
  )
});
const DashboardPermissions = ({
  open,
  onClose,
  roleId,
  roleName,
  refetchRoles,
  isMobile = false
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [initialValues, setInitialValues] = useState({
    permissions: dashboardSections.map(section => ({
      module: section.module,
      canView: false,
    }))
  });
  useEffect(() => {
    if (open && roleId) {
      const fetchCurrentPermissions = async () => {
        setIsLoadingPermissions(true);
        try {
          let permissionsPayload = null;
          try {
            const dashRes = await Api.get(`/api/roles/${roleId}/dashboard-permissions`);
            if (dashRes?.data) {
              const data = dashRes.data;
              if (Array.isArray(data?.permissions)) {
                permissionsPayload = data.permissions;
              } else if (Array.isArray(data)) {
                permissionsPayload = data;
              } else {
                permissionsPayload = [];
              }
            }
          } catch (err) {
            console.warn('Dashboard permissions endpoint not available, falling back to role payload', err);
          }
          if (!permissionsPayload) permissionsPayload = [];
          const formattedPermissions = dashboardSections.map((section) => {
            const found = permissionsPayload.find(
              (p) => p.module?.toLowerCase() === section.module.toLowerCase()
            );
              return {
                module: section.module,
              canView: found?.canView || false,
              };
            });
            setInitialValues({
            permissions: formattedPermissions,
            });
        } catch (error) {
          console.error('Error fetching current permissions:', error);
        } finally {
          setIsLoadingPermissions(false);
        }
      };
      fetchCurrentPermissions();
    }
  }, [open, roleId]);
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        permissions: values.permissions
      };
      await Api.post(`/api/roles/${roleId}/dashboard-permissions`, payload);
      notifySuccess('تم تحديث صلاحيات الداشبورد بنجاح');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-permissions'] });
      await queryClient.refetchQueries({ queryKey: ['dashboard-permissions'] });
      refetchRoles();
      onClose();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحديث الصلاحيات');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handlePermissionChange = (values, setFieldValue, sectionIndex, value) => {
    const updatedPermissions = [...values.permissions];
    updatedPermissions[sectionIndex] = {
      ...updatedPermissions[sectionIndex],
      canView: value
    };
    setFieldValue('permissions', updatedPermissions);
  };
  const handleSelectAll = (values, setFieldValue, checked) => {
    const updatedPermissions = values.permissions.map(permission => ({
      ...permission,
      canView: checked
    }));
    setFieldValue('permissions', updatedPermissions);
  };
  const isAllSelected = (values) => {
    return values.permissions.every(permission => permission.canView === true);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 2,
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            صلاحيات لوحة التحكم - {roleName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <Form>
            <DialogContent sx={{ p: 3 }}>
              {isLoadingPermissions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    أقسام لوحة التحكم
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSelectAll(values, setFieldValue, !isAllSelected(values))}
                    sx={{
                      minWidth: 120,
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1.5
                    }}
                  >
                    {isAllSelected(values) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </Button>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  حدد الأقسام التي يمكن للمسؤولين الذين لديهم هذا الدور الوصول إليها في لوحة التحكم
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                  {dashboardSections.map((section, index) => (
                    <Grid item xs={12} sm={6} md={4} key={section.module} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card
                        variant="outlined"
                        sx={{
                          width: 250,
                          border: values.permissions[index]?.canView
                            ? '2px solid #1976d2'
                            : '1px solid #e0e0e0',
                          bgcolor: values.permissions[index]?.canView
                            ? 'rgba(25, 118, 210, 0.04)'
                            : 'transparent',
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={values.permissions[index]?.canView || false}
                                onChange={(e) => handlePermissionChange(values, setFieldValue, index, e.target.checked)}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  {section.label}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                  {section.description}
                                </Typography>
                              </Box>
                            }
                            sx={{ width: '100%', m: 0 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'space-between',flexDirection: 'row-reverse' }}>
              <Button
                onClick={onClose}
                variant="outlined"
                sx={{ minWidth: 100 }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  minWidth: 100,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};
export default DashboardPermissions;