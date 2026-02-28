import React from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Dashboard } from '@mui/icons-material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import dayjs from 'dayjs';
const RolesTable = ({
  rolesData,
  isLoading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onDashboardPermissions,
  permissions,
  isDarkMode,
}) => (
  <TableContainer sx={{ borderRadius: 2, overflowX: 'auto' }}>
    <Table stickyHeader>
      <TableHead sx={{ bgcolor: isDarkMode ? 'background.paper' : '#F3F4F6' }}>
        <StyledTableRow>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>اسم الدور</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>الوصف</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>تاريخ الإنشاء</StyledTableCell>
          {(permissions.includes('roles_Update') || permissions.includes('roles_Delete')) && (
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>الإجراءات</StyledTableCell>
          )}
        </StyledTableRow>
      </TableHead>
      <TableBody>
        {isLoading ? (
          <StyledTableRow>
            <StyledTableCell colSpan={4} align="center">
              <CircularProgress />
            </StyledTableCell>
          </StyledTableRow>
        ) : (
          rolesData?.roles?.map((role) => (
            <StyledTableRow key={role.id} hover>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                {role.name}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ color: 'gray' }}>
                {role.description}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ color: 'gray' }}>
                {dayjs(role.createdAt).format('DD/MM/YYYY')}
              </StyledTableCell>
              {(permissions.includes('roles_Update') || permissions.includes('roles_Delete')) && (
                <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                  <IconButton
                    color="primary"
                    onClick={() => onEdit(role)}
                    title="تعديل الدور"
                    sx={{
                      transition: 'all 0.1s ease-in-out',
                      '&:hover': { transform: 'scale(1.1)' },
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="info"
                    onClick={() => onDashboardPermissions(role)}
                    title="صلاحيات الداشبورد"
                    sx={{
                      transition: 'all 0.1s ease-in-out',
                      '&:hover': { transform: 'scale(1.1)' },
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    <Dashboard />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => onDelete(role.id)}
                    title="حذف الدور"
                    sx={{
                      transition: 'all 0.1s ease-in-out',
                      '&:hover': { transform: 'scale(1.1)' },
                      '&:active': { transform: 'scale(0.95)' },
                    }}
                  >
                    <Delete />
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
      count={rolesData?.total || 0}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      labelRowsPerPage="عدد العناصر في الصفحة"
    />
  </TableContainer>
);
export default RolesTable;