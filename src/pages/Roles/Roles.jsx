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
} from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';
import Api from "../../config/Api";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import AddRole from "../../components/modals/AddRole";
import DeleteModal from "../../components/modals/DeleteModal";
import { debounce } from 'lodash';

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
            placeholder="البحث عن دور بالاسم"
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
            إضافة دور جديد
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                  <StyledTableCell colSpan={5} align="center"><CircularProgress /></StyledTableCell>
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
                    <IconButton color="primary" onClick={() => handleEdit(role)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => openDeleteModal(role.id)}>
                      <Delete />
                    </IconButton>
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
      </Box>

      <AddRole 
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refetchRoles={refetch}
        mode={editMode}
        editData={selectedRole}
      />
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => handleDelete(selectedRoleId)}
        title="حذف الدور"
        message="هل أنت متأكد من حذف هذا الدور؟"
        ButtonText="حذف"
      />
    </Box>
  );
}