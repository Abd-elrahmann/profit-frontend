import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Dashboard } from '@mui/icons-material';
import dayjs from 'dayjs';
const RolesCards = ({
  rolesData,
  isLoading,
  onEdit,
  onDelete,
  onDashboardPermissions,
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
        {rolesData?.roles?.map((role) => (
          <Card
            key={role.id}
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
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {role.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {(permissions.includes('roles_Update') || permissions.includes('roles_Delete') || permissions.includes('roles_Add')) && (
                      <IconButton
                        color="primary"
                        onClick={() => onEdit(role)}
                        size="small"
                        title="تعديل الدور"
                        sx={{
                          transition: 'all 0.1s ease-in-out',
                          '&:hover': { transform: 'scale(1.1)' },
                          '&:active': { transform: 'scale(0.95)' },
                        }}
                      >
                        <Edit fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )}
                    {permissions.includes('roles_Update') && (
                      <IconButton
                        color="info"
                        onClick={() => onDashboardPermissions(role)}
                        size="small"
                        title="صلاحيات الداشبورد"
                        sx={{
                          transition: 'all 0.1s ease-in-out',
                          '&:hover': { transform: 'scale(1.1)' },
                          '&:active': { transform: 'scale(0.95)' },
                        }}
                      >
                        <Dashboard fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )}
                    {permissions.includes('roles_Delete') && (
                      <IconButton
                        color="error"
                        onClick={() => onDelete(role.id)}
                        size="small"
                        title="حذف الدور"
                        sx={{
                          transition: 'all 0.1s ease-in-out',
                          '&:hover': { transform: 'scale(1.1)' },
                          '&:active': { transform: 'scale(0.95)' },
                        }}
                      >
                        <Delete fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    الوصف:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {role.description}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    تاريخ الإنشاء:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                    {dayjs(role.createdAt).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    )}
  </Box>
);
export default RolesCards;