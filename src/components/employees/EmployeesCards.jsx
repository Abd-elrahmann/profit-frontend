import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, AdminPanelSettingsOutlined as AdminPanelSettings, History as HistoryIcon } from '@mui/icons-material';
import { formatArabicDate } from '../../utilities/dateUtils';
const EmployeesCards = ({
  usersData,
  isLoading,
  onEdit,
  onDelete,
  onAssignRole,
  onViewLogs,
  permissions,
  isMobile,
}) => (
  <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%', maxWidth: '100%' }}>
    {isLoading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={30} />
      </Box>
    ) : (
      <Stack spacing={2}>
        {usersData?.map((user) => (
          <Card
            key={user.id}
            sx={{
              border: '1px solid #e0e0e0',
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {permissions.includes('users_Update') && (
                      <IconButton color="primary" onClick={() => onEdit(user)} size="small" title="تعديل">
                        <Edit fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )}
                    {permissions.includes('users_Delete') && (
                      <IconButton color="error" onClick={() => onDelete(user.id)} size="small" title="حذف">
                        <Delete fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )}
                    {permissions.includes('users_Update') && (
                      <IconButton color="info" onClick={() => onAssignRole(user)} size="small" title="تعيين دور">
                        <AdminPanelSettings fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )}
                    {permissions.includes('users_View') && (
                      <IconButton color="black" onClick={() => onViewLogs(user)} size="small" title="عرض سجل الأنشطة">
                        <HistoryIcon fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      رقم الهاتف:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {user.phone}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      تاريخ الإنشاء:
                    </Typography>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                        {formatArabicDate(user.createdAt)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {user.hijriCreatedAt}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row', gap: 1, width: '100%' }}>
                  <Chip
                    label={user.isActive ? 'نشط' : 'غير نشط'}
                    sx={{
                      bgcolor: user.isActive ? 'rgba(16,185,129,0.1)' : '#E5E7EB',
                      color: user.isActive ? '#10B981' : '#6B7280',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                    }}
                  />
                  <Chip
                    label={user.role?.name || 'بدون دور'}
                    sx={{
                      bgcolor: user.role?.name ? 'rgba(46,139,69,0.1)' : '#E5E7EB',
                      color: user.role?.name ? '#2E8B45' : '#6B7280',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    )}
  </Box>
);
export default EmployeesCards;