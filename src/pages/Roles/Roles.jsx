import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Paper,
  TablePagination,
  useMediaQuery,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { transparentSearchTextFieldSx } from '../../utilities/searchInputStyles';
import Api from "../../config/Api";
import { useQuery } from "@tanstack/react-query";
import AddRole from "../../components/modals/AddRole";
import DeleteModal from "../../components/modals/DeleteModal";
import DashboardPermissions from "../../components/modals/DashboardPermissions";
import { RolesTable, RolesCards } from "../../components/roles";
import { debounce } from '../../utilities/debounce';
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { useTheme } from '../../theme/ThemeContext';
import { Helmet } from "react-helmet-async";
const getRoles = async (page = 1, name = '') => {
  const response = await Api.get(`/api/roles?name=${name}`);
  return response.data;
};
export default function Roles() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editMode, setEditMode] = useState('add');
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [selectedRoleForDashboard, setSelectedRoleForDashboard] = useState(null);
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;
  const { isDarkMode } = useTheme();
  const { permissions, refreshPermissions } = usePermissions();
  const { data: rolesData, isLoading, refetch } = useQuery({
    queryKey: ["roles", page + 1, searchQuery],
    queryFn: () => getRoles(page + 1, searchQuery),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  const debouncedSearch = debounce((value) => setSearchQuery(value), 500);
  const handleSearchChange = (event) => debouncedSearch(event.target.value);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleEdit = React.useCallback((role) => {
    setSelectedRole(role);
    setEditMode('edit');
    setIsAddModalOpen(true);
  }, []);
  const handleAdd = React.useCallback(() => {
    setSelectedRole(null);
    setEditMode('add');
    setIsAddModalOpen(true);
  }, []);
  const handleDelete = async (id) => {
    try {
      await Api.delete(`/api/roles/${id}`);
      refetch();
      setIsDeleteModalOpen(false);
      setSelectedRoleId(null);
      await refreshPermissions();
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };
  const handleDashboardPermissions = (role) => {
    setSelectedRoleForDashboard(role);
    setIsDashboardModalOpen(true);
  };
  const openDeleteModal = (roleId) => {
    setSelectedRoleId(roleId);
    setIsDeleteModalOpen(true);
  };
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: '100%', overflowX: 'hidden' }}>
      <Helmet>
        <title>الأدوار</title>
        <meta name="description" content="الأدوار" />
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
            placeholder="البحث عن دور بالاسم"
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
          {permissions.includes("roles_Add") && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
              sx={{
                bgcolor: "#2E8B45",
                "&:hover": { bgcolor: "#2E8B45" },
                fontWeight: "bold",
                minWidth: isSmallScreen ? '100%' : 'auto',
                py: isSmallScreen ? 1.5 : 1,
                transition: 'all 0.1s ease-in-out',
                cursor: 'pointer',
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              إضافة دور جديد
            </Button>
          )}
        </Box>
        <Paper sx={{ width: "100%", maxWidth: '100%', overflow: "hidden", borderRadius: 2, minHeight: 400 }}>
          {isSmallScreen ? (
            <RolesCards
              rolesData={rolesData}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onDashboardPermissions={handleDashboardPermissions}
              permissions={permissions}
              isMobile={isMobile}
            />
          ) : (
            <RolesTable
              rolesData={rolesData}
              isLoading={isLoading}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              onDashboardPermissions={handleDashboardPermissions}
              permissions={permissions}
              isDarkMode={isDarkMode}
            />
          )}
          {isSmallScreen && rolesData && (
            <TablePagination
              component="div"
              count={rolesData?.total || 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="صفوف لكل صفحة:"
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
      <AddRole
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refetchRoles={refetch}
        mode={editMode}
        editData={selectedRole}
        isMobile={isMobile}
      />
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(selectedRoleId)}
        title="حذف الدور"
        message="هل أنت متأكد من حذف هذا الدور؟"
        ButtonText="حذف"
      />
      <DashboardPermissions
        open={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        roleId={selectedRoleForDashboard?.id}
        roleName={selectedRoleForDashboard?.name}
        refetchRoles={refetch}
        isMobile={isMobile}
      />
    </Box>
  );
}