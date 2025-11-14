// AssignRole.jsx - مودال تعيين الأدوار
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Radio,
  FormControlLabel,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Api from '../../config/Api';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { useQueryClient } from '@tanstack/react-query';

const AssignRole = ({ open, onClose, user, refetchUsers, isMobile = false }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemovingRole, setIsRemovingRole] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  useEffect(() => {
    if (user && open) {
      setSelectedRoleId(user.role?.id || null);
    }
  }, [user, open]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await Api.get('/api/roles');
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      notifyError('حدث خطأ في تحميل الأدوار');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (roleId) => {
    if (!user?.role) {
      setSelectedRoleId(roleId);
    }
  };

  const handleRemoveCurrentRole = async () => {
    if (!user?.role) return;

    setIsRemovingRole(true);
    try {
      await Api.patch(`/api/users/${user.id}/role`, {
        roleId: null
      });
      
      notifySuccess('تم إزالة الدور من الموظف بنجاح');
      setSelectedRoleId(null);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    } catch (error) {
      console.error('Error removing role:', error);
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إزالة الدور');
    } finally {
      setIsRemovingRole(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRoleId) {
      notifyError('يرجى اختيار دور للموظف');
      return;
    }

    if (user?.role) {
      notifyError('لا يمكن تعيين دور جديد للموظف لأنه يمتلك دوراً بالفعل. يرجى إزالة الدور الحالي أولاً.');
      return;
    }

    setIsSubmitting(true);
    try {
      await Api.patch(`/api/users/${user.id}/role`, {
        roleId: parseInt(selectedRoleId)
      });
      
      notifySuccess('تم تعيين الدور للموظف بنجاح');
      onClose();
      setSelectedRoleId(null);
      refetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تعيين الدور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRoleId(null);
    onClose();
  };

  const hasCurrentRole = user?.role;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
          {hasCurrentRole ? 'إدارة دور الموظف' : 'تعيين دور للموظف'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {user && (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity={hasCurrentRole ? "warning" : "info"} 
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                الموظف: {user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'gray', mt: 0.5 }}>
                {hasCurrentRole ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <span>الدور الحالي:</span>
                    <Chip
                      label={user.role.name}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(59,130,246,0.1)',
                        color: '#3B82F6',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                ) : (
                  'لا يوجد دور معين حالياً'
                )}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Remove Current Role Button */}
        {hasCurrentRole && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleRemoveCurrentRole}
              disabled={isRemovingRole}
              fullWidth={isMobile}
              sx={{
                borderColor: '#EF4444',
                color: '#EF4444',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.04)',
                  borderColor: '#DC2626'
                }
              }}
            >
              {isRemovingRole ? (
                <CircularProgress size={20} color="error" />
              ) : (
                'إزالة الدور الحالي'
              )}
            </Button>
          </Box>
        )}

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          {hasCurrentRole ? 'الأدوار المتاحة (غير مفعلة)' : 'اختر دور للموظف:'}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : roles.length === 0 ? (
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray', py: 3 }}>
            لا توجد أدوار متاحة
          </Typography>
        ) : (
          <Stack spacing={2}>
            {roles.map((role) => {
              const isCurrentRole = user?.role?.id === role.id;
              const isDisabled = hasCurrentRole && !isCurrentRole;
              
              return (
                <Box
                  key={role.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    border: '1px solid',
                    borderColor: isCurrentRole ? '#10B981' : 
                                selectedRoleId === role.id ? '#1E40AF' : '#E5E7EB',
                    borderRadius: 2,
                    bgcolor: isCurrentRole ? 'rgba(16,185,129,0.05)' : 
                             selectedRoleId === role.id ? 'rgba(30, 64, 175, 0.05)' : 'transparent',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1,
                    '&:hover': {
                      bgcolor: isDisabled ? 'transparent' : 
                              isCurrentRole ? 'rgba(16,185,129,0.08)' :
                              selectedRoleId === role.id ? 'rgba(30, 64, 175, 0.08)' : '#F9FAFB',
                    },
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative'
                  }}
                  onClick={() => !isDisabled && handleRoleChange(role.id)}
                >
                  {isCurrentRole && (
                    <Chip
                      label="الدور الحالي"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: '#10B981',
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <FormControlLabel
                      control={
                        <Radio
                          checked={isCurrentRole || selectedRoleId === role.id}
                          onChange={() => !isDisabled && handleRoleChange(role.id)}
                          value={role.id}
                          color={isCurrentRole ? "success" : "primary"}
                          disabled={isDisabled}
                        />
                      }
                      label={
                        <Box sx={{ opacity: isDisabled ? 0.7 : 1 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: isCurrentRole ? '#10B981' : 'inherit',
                              fontSize: isMobile ? '0.9rem' : '1rem'
                            }}
                          >
                            {role.name}
                            {isCurrentRole && ' ✓'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'gray', mt: 0.5 }}>
                            {role.description}
                          </Typography>
                          {role.permissions && (
                            <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 0.5 }}>
                              {role.permissions.length} صلاحية
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ width: '100%', mr: 0 }}
                    />
                  </Box>
                  
                  {!isDisabled && (
                    <AddIcon 
                      sx={{ 
                        color: isCurrentRole ? '#10B981' : 
                              selectedRoleId === role.id ? '#1E40AF' : '#9CA3AF',
                        transition: 'color 0.2s ease-in-out'
                      }} 
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        )}

        {hasCurrentRole && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              لا يمكن تعيين دور جديد للموظف لأنه يمتلك دوراً بالفعل. يرجى إزالة الدور الحالي أولاً لتمكين تعيين دور جديد.
            </Typography>
          </Alert>
        )}
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
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          disabled={isSubmitting || isRemovingRole}
          fullWidth={isMobile}
        >
          إغلاق
        </Button>
        
        {!hasCurrentRole && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || !selectedRoleId}
            fullWidth={isMobile}
            sx={{
              bgcolor: "#1E40AF",
              "&:hover": { bgcolor: "#1E3A8A" },
              minWidth: isMobile ? 'auto' : 120,
              '&:disabled': {
                bgcolor: '#E5E7EB',
                color: '#9CA3AF'
              }
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'تعيين الدور'
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignRole;