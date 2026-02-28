import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, AdminPanelSettingsOutlined as AdminPanelSettings, History as HistoryIcon } from '@mui/icons-material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import { formatArabicDate } from '../../utilities/dateUtils';
const EmployeesTable = ({
  usersData,
  isLoading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onAssignRole,
  onViewLogs,
  permissions,
  isDarkMode,
}) => (
  <TableContainer sx={{ borderRadius: 2, overflowX: 'auto' }}>
    <Table stickyHeader>
      <TableHead sx={{ bgcolor: isDarkMode ? 'background.paper' : '#F3F4F6' }}>
        <StyledTableRow>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>الاسم</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>البريد الإلكتروني</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>رقم الهاتف</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>الحالة</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>الدور</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>تاريخ الإنشاء</StyledTableCell>
          {(permissions.includes('users_Update') || permissions.includes('users_Delete') || permissions.includes('users_Add')) && (
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>الإجراءات</StyledTableCell>
          )}
        </StyledTableRow>
      </TableHead>
      <TableBody>
        {isLoading ? (
          <StyledTableRow>
            <StyledTableCell colSpan={7} align="center">
              <CircularProgress />
            </StyledTableCell>
          </StyledTableRow>
        ) : (
          usersData?.map((user) => (
            <StyledTableRow key={user.id} hover>
              <StyledTableCell align="center">{user.name}</StyledTableCell>
              <StyledTableCell align="center" sx={{ color: 'gray' }}>{user.email}</StyledTableCell>
              <StyledTableCell align="center" sx={{ color: 'gray' }}>{user.phone}</StyledTableCell>
              <StyledTableCell align="center">
                <Chip
                  label={user.isActive ? 'نشط' : 'غير نشط'}
                  sx={{
                    bgcolor: user.isActive ? 'rgba(16,185,129,0.1)' : '#E5E7EB',
                    color: user.isActive ? '#10B981' : '#6B7280',
                    fontWeight: 'bold',
                  }}
                />
              </StyledTableCell>
              <StyledTableCell align="center">
                <Chip
                  label={user.role?.name || 'بدون دور'}
                  sx={{
                    bgcolor: user.role?.name ? 'rgba(46,139,69,0.1)' : '#E5E7EB',
                    color: user.role?.name ? '#2E8B45' : '#6B7280',
                    fontWeight: 'bold',
                  }}
                />
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ color: 'gray' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                    {formatArabicDate(user.createdAt)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {user.hijriCreatedAt}
                  </Typography>
                </Box>
              </StyledTableCell>
              {(permissions.includes('users_Update') || permissions.includes('users_Delete') || permissions.includes('users_Add')) && (
                <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                  {permissions.includes('users_Update') && (
                    <IconButton color="primary" onClick={() => onEdit(user)} title="تعديل">
                      <Edit />
                    </IconButton>
                  )}
                  {permissions.includes('users_Delete') && (
                    <IconButton color="error" onClick={() => onDelete(user.id)} title="حذف">
                      <Delete />
                    </IconButton>
                  )}
                  {permissions.includes('users_Add') && (
                    <IconButton color="info" onClick={() => onAssignRole(user)} title="تعيين دور">
                      <AdminPanelSettings />
                    </IconButton>
                  )}
                  <IconButton color="black" onClick={() => onViewLogs(user)} title="عرض سجل الأنشطة">
                    <HistoryIcon />
                  </IconButton>
                </StyledTableCell>
              )}
            </StyledTableRow>
          ))
        )}
      </TableBody>
    </Table>
    <TablePagination
      component="div"
      count={usersData?.totalUsers || 0}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      labelRowsPerPage="عدد العناصر في الصفحة"
    />
  </TableContainer>
);
export default EmployeesTable;