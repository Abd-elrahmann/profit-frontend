import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  TableContainer,
  TableHead,
  TableBody,
  Paper,
  Chip,
  Table,
  TablePagination,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  Typography,
  Grid,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  AdminPanelSettingsOutlined as AdminPanelSettings,
  History as HistoryIcon
} from "@mui/icons-material";

import {StyledTableCell, StyledTableRow} from '../../components/layouts/tableLayout';
import Api from "../../config/Api";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import AddEmployee from "../../components/modals/AddEmployee";
import DeleteModal from "../../components/modals/DeleteModal";
import AssignRole from "../../components/modals/AssignRole";
import LogsTable from "../../components/modals/LogsTable";
import { debounce } from 'lodash';
import { notifyError, notifySuccess } from "../../utilities/toastify";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";

const getUsers = async (page = 1, searchQuery = '') => {
  const response = await Api.get(`/api/users/${page}?name=${searchQuery}`);
  return response.data.users;
};

export default function Employees() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editMode, setEditMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [userForRoleAssignment, setUserForRoleAssignment] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState(null);
  
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;
  
  const { permissions } = usePermissions();
  const { data: usersData, isLoading, refetch } = useQuery({ 
    queryKey: ["employees", page + 1, searchQuery], 
    queryFn: () => getUsers(page + 1, searchQuery),
    retry:1,
  });

  const debouncedSearch = debounce((value) => {
    setSearchQuery(value);
  }, 500);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditMode('edit');
    setIsAddModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setEditMode('add');
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/api/users/${id}`);
      refetch();
      setIsDeleteModalOpen(false);
      setSelectedUserId(null);
      notifySuccess("تم حذف الموظف بنجاح");
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف الموظف");
    }
  };

  const handleAssignRole = (user) => {
    setUserForRoleAssignment(user);
    setIsAssignRoleModalOpen(true);
  };

  const handleViewLogs = (user) => {
    setSelectedUserForLogs(user);
    setIsLogsModalOpen(true);
  };

  const openDeleteModal = (userId) => {
    setSelectedUserId(userId);
    setIsDeleteModalOpen(true);
  };

  // Render table for large screens
  const renderTable = () => (
    <TableContainer  sx={{ borderRadius: 2 }}>
      <Table stickyHeader>
        <TableHead sx={{ bgcolor: "#F3F4F6" }}>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الاسم</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>البريد الإلكتروني</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>رقم الهاتف</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الحالة</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الدور</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>تاريخ الإنشاء</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الإجراءات</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={7} align="center">
                <CircularProgress />
              </StyledTableCell>
            </StyledTableRow>
          ) : usersData?.map((user) => (
            <StyledTableRow key={user.id} hover>
              <StyledTableCell align="center">{user.name}</StyledTableCell>
              <StyledTableCell align="center" sx={{ color: "gray" }}>{user.email}</StyledTableCell>
              <StyledTableCell align="center" sx={{ color: "gray" }}>{user.phone}</StyledTableCell>
              <StyledTableCell align="center">
                {user.isActive ? (
                  <Chip
                    label="نشط"
                    sx={{
                      bgcolor: "rgba(16,185,129,0.1)",
                      color: "#10B981",
                      fontWeight: "bold",
                    }}
                  />
                ) : (
                  <Chip
                    label="غير نشط"
                    sx={{
                      bgcolor: "#E5E7EB",
                      color: "#6B7280",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </StyledTableCell>
              <StyledTableCell align="center">
                <Chip
                  label={user.role?.name || "بدون دور"}
                  sx={{
                    bgcolor: user.role?.name ? "rgba(59,130,246,0.1)" : "#E5E7EB",
                    color: user.role?.name ? "#3B82F6" : "#6B7280",
                    fontWeight: "bold",
                  }}
                />
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ color: "gray" }}>
                {dayjs(user.createdAt).format("DD/MM/YYYY")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                {permissions.includes("users_Update") && (
                <IconButton color="primary" onClick={() => handleEdit(user)} title="تعديل">
                  <Edit />
                </IconButton>
                )}
                {permissions.includes("users_Delete") && (
                <IconButton color="error" onClick={() => openDeleteModal(user.id)} title="حذف">
                  <Delete />
                </IconButton>
                )}
                {permissions.includes("users_Add") && (
                <IconButton 
                  color="info" 
                  onClick={() => handleAssignRole(user)}
                  title="تعيين دور"
                >
                  <AdminPanelSettings />
                </IconButton>
                )}
                <IconButton 
                  color="black" 
                  onClick={() => handleViewLogs(user)}
                  title="عرض سجل الأنشطة"
                >
                  <HistoryIcon />
                </IconButton>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={usersData?.totalUsers || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="عدد العناصر في الصفحة"
      />
    </TableContainer>
  );

  // Render cards for small screens
  const renderCards = () => (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {usersData?.map((user) => (
            <Grid item xs={12} md={6} lg={4} key={user.id}>
              <Card 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  width: '400px',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Stack spacing={2}>
                    {/* Header Row - User Name and Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1
                    }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {permissions.includes("users_Update") && (
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(user)}
                            size="small"
                            title="تعديل"
                          >
                            <Edit fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                        {permissions.includes("users_Delete") && (
                          <IconButton 
                            color="error" 
                            onClick={() => openDeleteModal(user.id)}
                            size="small"
                            title="حذف"
                          >
                            <Delete fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                        {permissions.includes("users_Add") && (
                          <IconButton 
                            color="info" 
                            onClick={() => handleAssignRole(user)}
                            size="small"
                            title="تعيين دور"
                          >
                            <AdminPanelSettings fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                        <IconButton 
                          color="black" 
                          onClick={() => handleViewLogs(user)}
                          size="small"
                          title="عرض سجل الأنشطة"
                        >
                          <HistoryIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Divider />

                    {/* User Details */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {dayjs(user.createdAt).format("DD/MM/YYYY")}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status and Role */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      flexDirection: 'row',
                      gap: 1,
                      width: '100%'
                    }}>
                      <Chip
                        label={user.isActive ? "نشط" : "غير نشط"}
                        sx={{
                          bgcolor: user.isActive ? "rgba(16,185,129,0.1)" : "#E5E7EB",
                          color: user.isActive ? "#10B981" : "#6B7280",
                          fontWeight: "bold",
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}
                      />
                      
                      <Chip
                        label={user.role?.name || "بدون دور"}
                        sx={{
                          bgcolor: user.role?.name ? "rgba(59,130,246,0.1)" : "#E5E7EB",
                          color: user.role?.name ? "#3B82F6" : "#6B7280",
                          fontWeight: "bold",
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Helmet>
        <title>الموظفين</title>
        <meta name="description" content="الموظفين" />
      </Helmet>
      
      {/* Main Content */}
      <Box sx={{ p: isMobile ? 2 : 5 }}>
        {/* Search and Add Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isSmallScreen ? "stretch" : "center",
            mb: 4,
            flexDirection: isSmallScreen ? "column" : "row",
            gap: 2,
          }}
        >
          <TextField
            placeholder="البحث عن موظف بالاسم أو البريد الإلكتروني"
            variant="outlined"
            onChange={handleSearchChange}
            sx={{
              flex: 1,
              bgcolor: "#F3F4F6",
              borderRadius: 2,
              "& fieldset": { border: "none" },
              minWidth: isSmallScreen ? '100%' : 'auto',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          
          {permissions.includes("users_Add") && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
              sx={{
                bgcolor: "#1E40AF",
                "&:hover": { bgcolor: "#1E3A8A" },
                fontWeight: "bold",
                minWidth: isSmallScreen ? '100%' : 'auto',
                py: isSmallScreen ? 1.5 : 1,
              }}
            >
              إضافة مدير جديد
            </Button>
          )}
        </Box>

        {/* Table for large screens, Cards for small screens */}
        <Paper sx={{ 
          width: "100%", 
          overflow: "hidden", 
          borderRadius: 2,
          minHeight: 400
        }}>
          {isSmallScreen ? renderCards() : renderTable()}

          {/* Pagination for cards view */}
          {isSmallScreen && usersData && (
            <TablePagination
              component="div"
              count={usersData?.totalUsers || 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="عدد العناصر في الصفحة"
              sx={{
                '& .MuiTablePagination-toolbar': {
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0,
                  padding: isMobile ? 1 : 2
                },
                '& .MuiTablePagination-spacer': {
                  display: isMobile ? 'none' : 'block'
                }
              }}
            />
          )}
        </Paper>
      </Box>

      <AddEmployee 
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refetchUsers={refetch}
        mode={editMode}
        editData={selectedUser}
        isMobile={isMobile}
      />
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(selectedUserId)}
        title="حذف الموظف"
        message="هل أنت متأكد من حذف هذا الموظف؟"
        ButtonText="حذف"
      />
      <AssignRole
        open={isAssignRoleModalOpen}
        onClose={() => setIsAssignRoleModalOpen(false)}
        user={userForRoleAssignment}
        refetchUsers={refetch}
        isMobile={isMobile}
      />
      <LogsTable
        open={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        userId={selectedUserForLogs?.id}
        userName={selectedUserForLogs?.name}
        isMobile={isMobile}
      />
    </Box>
  );
}