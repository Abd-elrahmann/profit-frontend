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
} from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';
import Api from "../../config/Api";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import AddRole from "../../components/modals/AddRole";
import DeleteModal from "../../components/modals/DeleteModal";
import { debounce } from 'lodash';
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { Helmet } from "react-helmet-async";

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
  
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;
  
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

  const handleEdit = (role) => {
    setSelectedRole(role);
    setEditMode('edit');
    setIsAddModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedRole(null);
    setEditMode('add');
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/api/roles/${id}`);
      refetch();
      setIsDeleteModalOpen(false);
      setSelectedRoleId(null);
      
      // Refresh permissions to update sidebar immediately after deletion
      await refreshPermissions();
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const openDeleteModal = (roleId) => {
    setSelectedRoleId(roleId);
    setIsDeleteModalOpen(true);
  };

  const getPermissionCount = (permissions) => {
    if (!permissions) return 0;
    return permissions.reduce((count, perm) => {
      const hasPermissions = perm.canView || perm.canAdd || perm.canUpdate || perm.canDelete;
      return count + (hasPermissions ? 1 : 0);
    }, 0);
  };

  // Render table for large screens
  const renderTable = () => (
    <TableContainer  sx={{ borderRadius: 2 }}>
      <Table stickyHeader>
        <TableHead sx={{ bgcolor: "#F3F4F6" }}>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>اسم الدور</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الوصف</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>عدد الصلاحيات</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>تاريخ الإنشاء</StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الإجراءات</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={5} align="center">
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
              <StyledTableCell align="center">
                <Chip
                  label={`${getPermissionCount(role.permissions)} صلاحية`}
                  sx={{
                    bgcolor: "rgba(16,185,129,0.1)",
                    color: "#10B981",
                    fontWeight:"bold",
                  }}
                />
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ color: "gray" }}>
                {dayjs(role.createdAt).format("DD/MM/YYYY")}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                {permissions.includes("roles_Update") && (
                <IconButton color="primary" onClick={() => handleEdit(role)}>
                  <Edit />
                </IconButton>
                )}
                {permissions.includes("roles_Delete") && (
                <IconButton color="error" onClick={() => openDeleteModal(role.id)}>
                  <Delete />
                </IconButton>
                )}
              </StyledTableCell>
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

  // Render cards for small screens
  const renderCards = () => (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {rolesData?.roles?.map((role) => (
            <Grid item xs={12} md={6} lg={4} key={role.id}>
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
                    {/* Header Row - Role Name and Actions */}
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
                        {permissions.includes("roles_Update") && (
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEdit(role)}
                            size="small"
                          >
                            <Edit fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                        {permissions.includes("roles_Delete") && (
                          <IconButton 
                            color="error" 
                            onClick={() => openDeleteModal(role.id)}
                            size="small"
                          >
                            <Delete fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    <Divider />

                    {/* Description */}
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        الوصف:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {role.description}
                      </Typography>
                    </Box>

                    {/* Permissions and Date Row */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-start',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1,
                      width: '100%'
                    }}>
                      <Chip
                        label={`${getPermissionCount(role.permissions)} صلاحية`}
                        sx={{
                          bgcolor: "rgba(16,185,129,0.1)",
                          color: "#10B981",
                          fontWeight: "bold",
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
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
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Helmet>
        <title>الأدوار</title>
        <meta name="description" content="الأدوار" />
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
            placeholder="البحث عن دور بالاسم"
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
          
          {permissions.includes("roles_Add") && (          
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
              إضافة دور جديد
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
    </Box>
  );
}