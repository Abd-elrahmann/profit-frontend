import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Paper,
  TablePagination,
  useMediaQuery,
  Stack,
} from "@mui/material";
import { Add, Search, PictureAsPdf as PdfIcon, TableChart as ExcelIcon } from "@mui/icons-material";
import Api, { handleApiError } from "../../config/Api";
import { useQuery } from "@tanstack/react-query";
import AddEmployee from "../../components/modals/AddEmployee";
import DeleteModal from "../../components/modals/DeleteModal";
import AssignRole from "../../components/modals/AssignRole";
import LogsTable from "../../components/modals/LogsTable";
import { EmployeesTable, EmployeesCards } from "../../components/employees";
import { debounce } from '../../utilities/debounce';
import { notifyError, notifySuccess } from "../../utilities/toastify";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { exportEmployeesToPDF, exportEmployeesToExcel } from "../../utilities/employeesExporter";
import { useTheme } from '../../theme/ThemeContext';
import { transparentSearchTextFieldSx } from '../../utilities/searchInputStyles';
const getUsers = async (page = 1, searchQuery = '') => {
  const response = await Api.get(`/api/users/${page}?name=${searchQuery}`);
  return response.data;
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
  const { isDarkMode } = useTheme();
  const { permissions } = usePermissions();
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ["employees", page + 1, searchQuery],
    queryFn: () => getUsers(page + 1, searchQuery),
    retry: 1,
  });
  const handleExportPDF = async () => {
    if (!usersData?.users?.length) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    try {
      await exportEmployeesToPDF(usersData.users, searchQuery);
      notifySuccess("تم تصدير بيانات الموظفين إلى PDF بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      handleApiError(error);
    }
  };
  const handleExportExcel = async () => {
    if (!usersData?.users?.length) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    try {
      await exportEmployeesToExcel(usersData.users, searchQuery);
      notifySuccess("تم تصدير بيانات الموظفين إلى Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      handleApiError(error);
    }
  };
  const debouncedSearch = debounce((value) => setSearchQuery(value), 500);
  const handleSearchChange = (event) => debouncedSearch(event.target.value);
  const handleChangePage = (event, newPage) => setPage(newPage);
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
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: '100%', overflowX: 'hidden' }}>
      <Helmet>
        <title>الموظفين</title>
        <meta name="description" content="الموظفين" />
      </Helmet>
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, maxWidth: '100%', overflowX: 'hidden' }}>
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
              borderRadius: 2,
              minWidth: isSmallScreen ? '100%' : 'auto',
              ...transparentSearchTextFieldSx,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Stack
            direction={isSmallScreen ? "column" : "row"}
            spacing={1}
            alignItems={isSmallScreen ? "center" : "stretch"}
            sx={{ minWidth: isSmallScreen ? '100%' : 'auto', flexWrap: 'wrap' }}
          >
            {permissions.includes("users_Add") && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAdd}
                sx={{
                  bgcolor: "#2E8B45",
                  "&:hover": { bgcolor: "#2E8B45" },
                  fontWeight: "bold",
                  width: isSmallScreen ? '100%' : 'auto',
                  minWidth: isSmallScreen ? '100%' : 'auto',
                  py: isSmallScreen ? 1.5 : 1,
                }}
              >
                إضافة موظف جديد
              </Button>
            )}
            {permissions.includes("users_Export") && (
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={isSmallScreen ? "center" : "flex-start"} sx={{ width: isSmallScreen ? '100%' : 'auto' }}>
                <Button
                  variant="outlined"
                  startIcon={<PdfIcon sx={{ marginLeft: "10px" }} />}
                  onClick={handleExportPDF}
                  disabled={!usersData?.users?.length}
                  sx={{
                    borderColor: "#d32f2f",
                    color: "#d32f2f",
                    "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                    borderRadius: 2,
                    px: 2,
                    py: isSmallScreen ? 1.5 : 1,
                    fontWeight: "bold",
                    minWidth: isSmallScreen ? '50%' : 'auto',
                    flex: isSmallScreen ? 1 : 'none',
                  }}
                >
                  PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
                  onClick={handleExportExcel}
                  disabled={!usersData?.users?.length}
                  sx={{
                    borderColor: "#2e7d32",
                    color: "#2e7d32",
                    "&:hover": { bgcolor: "rgba(46, 125, 50, 0.1)" },
                    borderRadius: 2,
                    px: 2,
                    py: isSmallScreen ? 1.5 : 1,
                    fontWeight: "bold",
                    minWidth: isSmallScreen ? '50%' : 'auto',
                    flex: isSmallScreen ? 1 : 'none',
                  }}
                >
                  Excel
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>
        <Paper sx={{ width: "100%", maxWidth: '100%', overflow: "hidden", borderRadius: 2, minHeight: 400 }}>
          {isSmallScreen ? (
            <EmployeesCards
              usersData={usersData?.users}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onAssignRole={handleAssignRole}
              onViewLogs={handleViewLogs}
              permissions={permissions}
              isMobile={isMobile}
            />
          ) : (
            <EmployeesTable
              usersData={usersData?.users}
              isLoading={isLoading}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onAssignRole={handleAssignRole}
              onViewLogs={handleViewLogs}
              permissions={permissions}
              isDarkMode={isDarkMode}
            />
          )}
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