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
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Person,
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

  const { data: usersData, isLoading, refetch } = useQuery({ 
    queryKey: ["users", page + 1, searchQuery], 
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

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Main Content */}
      <Box sx={{ p: 5 }}>
        {/* Search and Add Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
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
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{
              bgcolor: "#1E40AF",
              "&:hover": { bgcolor: "#1E3A8A" },
              fontWeight: "bold",
            }}
          >
            إضافة مدير جديد
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                  <StyledTableCell colSpan={7} align="center"><CircularProgress /></StyledTableCell>
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
                    <IconButton color="primary" onClick={() => handleEdit(user)} title="تعديل">
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => openDeleteModal(user.id)} title="حذف">
                      <Delete />
                    </IconButton>
                    <IconButton 
                      color="info" 
                      onClick={() => handleAssignRole(user)}
                      title="تعيين دور"
                    >
                      <AdminPanelSettings />
                    </IconButton>
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
      </Box>

      <AddEmployee 
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refetchUsers={refetch}
        mode={editMode}
        editData={selectedUser}
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
      />
      <LogsTable
        open={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        userId={selectedUserForLogs?.id}
        userName={selectedUserForLogs?.name}
      />
    </Box>
  );
}