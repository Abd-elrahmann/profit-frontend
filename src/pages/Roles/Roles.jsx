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
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Dashboard,
} from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';
import { transparentSearchTextFieldSx } from '../../utilities/searchInputStyles';
import Api from "../../config/Api";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import AddRole from "../../components/modals/AddRole";
import DeleteModal from "../../components/modals/DeleteModal";
import DashboardPermissions from "../../components/modals/DashboardPermissions";
import { debounce } from '../../utilities/debounce';
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { Helmet } from "react-helmet-async";
import { useTheme } from '../../theme/ThemeContext';

// eslint-disable-next-line no-unused-vars
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

  const renderTable = () => (
    <TableContainer sx={{ borderRadius: 2, overflowX: 'auto' }}>
      <Table stickyHeader>
        <TableHead sx={{ bgcolor: isDarkMode ? 'background.paper' : '#F3F4F6' }}>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>اسم الدور</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الوصف</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>تاريخ الإنشاء</StyledTableCell>
            {(permissions.includes("roles_Update") || permissions.includes("roles_Delete")) && (
              <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الإجراءات</StyledTableCell>
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
          ) : rolesData?.roles?.map((role) => (
            <StyledTableRow key={role.id} hover>
              <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                {role.name}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ color: "gray" }}>
                {role.description}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ color: "gray" }}>
                {dayjs(role.createdAt).format("DD/MM/YYYY")}
              </StyledTableCell>
              {(permissions.includes("roles_Update") || permissions.includes("roles_Delete")) && (
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(role)}
                          title="تعديل الدور"
                          sx={{
                            transition: 'all 0.1s ease-in-out',
                            '&:hover': { transform: 'scale(1.1)' },
                            '&:active': { transform: 'scale(0.95)' }
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="info"
                          onClick={() => handleDashboardPermissions(role)}
                          title="صلاحيات الداشبورد"
                          sx={{
                            transition: 'all 0.1s ease-in-out',
                            '&:hover': { transform: 'scale(1.1)' },
                            '&:active': { transform: 'scale(0.95)' }
                          }}
                        >
                          <Dashboard />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => openDeleteModal(role.id)}
                          title="حذف الدور"
                          sx={{
                            transition: 'all 0.1s ease-in-out',
                            '&:hover': { transform: 'scale(1.1)' },
                            '&:active': { transform: 'scale(0.95)' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                </StyledTableCell>
              )}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={rolesData?.total || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="عدد العناصر في الصفحة"
      />
    </TableContainer>
  );

  const renderCards = () => (
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
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {role.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {(permissions.includes("roles_Update") || permissions.includes("roles_Delete") || permissions.includes("roles_Add")) && (
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(role)}
                            size="small"
                            title="تعديل الدور"
                            sx={{
                              transition: 'all 0.1s ease-in-out',
                              '&:hover': { transform: 'scale(1.1)' },
                              '&:active': { transform: 'scale(0.95)' }
                            }}
                          >
                            <Edit fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                        {permissions.includes("roles_Update") && (
                          <IconButton
                            color="info"
                            onClick={() => handleDashboardPermissions(role)}
                            size="small"
                            title="صلاحيات الداشبورد"
                            sx={{
                              transition: 'all 0.1s ease-in-out',
                              '&:hover': { transform: 'scale(1.1)' },
                              '&:active': { transform: 'scale(0.95)' }
                            }}
                          >
                            <Dashboard fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                        {permissions.includes("roles_Delete") && (
                          <IconButton
                            color="error"
                            onClick={() => openDeleteModal(role.id)}
                            size="small"
                            title="حذف الدور"
                            sx={{
                              transition: 'all 0.1s ease-in-out',
                              '&:hover': { transform: 'scale(1.1)' },
                              '&:active': { transform: 'scale(0.95)' }
                            }}
                          >
                            <Delete fontSize={isMobile ? "small" : "medium"} />
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
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                        }}
                      >
                        {dayjs(role.createdAt).format("DD/MM/YYYY")}
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

        <Paper sx={{ 
          width: "100%", 
          maxWidth: '100%',
          overflow: "hidden", 
          borderRadius: 2,
          minHeight: 400
        }}>
          {isSmallScreen ? renderCards() : renderTable()}

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