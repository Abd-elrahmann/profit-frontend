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
  Alert
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import Api from '../../config/Api';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { useQueryClient } from '@tanstack/react-query';
const AssignRole = ({ open, onClose, user }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setSelectedRoleId(roleId);
  };

  const handleSubmit = async () => {
    if (!selectedRoleId) {
      notifyError('يرجى اختيار دور للموظف');
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
      queryClient.invalidateQueries({ queryKey: ['employees'] });
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

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
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
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          تعيين دور للموظف
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {user && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                الموظف: {user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'gray', mt: 0.5 }}>
                {user.role ? `الدور الحالي: ${user.role.name}` : 'لا يوجد دور معين حالياً'}
              </Typography>
            </Alert>
          </Box>
        )}

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          اختر دور للموظف:
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {roles.map((role) => (
              <Box
                key={role.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  border: '1px solid',
                  borderColor: selectedRoleId === role.id ? '#1E40AF' : '#E5E7EB',
                  borderRadius: 2,
                  bgcolor: selectedRoleId === role.id ? 'rgba(30, 64, 175, 0.05)' : 'transparent',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: selectedRoleId === role.id ? 'rgba(30, 64, 175, 0.08)' : '#F9FAFB',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => handleRoleChange(role.id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={selectedRoleId === role.id}
                        onChange={() => handleRoleChange(role.id)}
                        value={role.id}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {role.name}
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
                  />
                </Box>
                
                <AddIcon 
                  sx={{ 
                    color: selectedRoleId === role.id ? '#1E40AF' : '#9CA3AF',
                    transition: 'color 0.2s ease-in-out'
                  }} 
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 2,
        flexDirection: 'row-reverse' 
      }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !selectedRoleId}
          sx={{
            bgcolor: "#1E40AF",
            "&:hover": { bgcolor: "#1E3A8A" },
            minWidth: 120,
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
      </DialogActions>
    </Dialog>
  );
};

export default AssignRole;