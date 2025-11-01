import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  InputAdornment,
  IconButton,
  Stack,
  InputBase,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Search, Add, Edit, Delete } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBanks, deleteBank } from "./bankApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import DeleteModal from "../../components/modals/DeleteModal";
import AddBank from "../../components/modals/AddBank";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { useTranslation } from "react-i18next";
const Banks = () => {
  const { i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [bankToDelete, setBankToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const queryClient = useQueryClient();

  const { data: banksData, isLoading } = useQuery({
    queryKey: ["banks", page, searchQuery],
    queryFn: () => getBanks(page, searchQuery),
    retry: 1,
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleDeleteBank = async (bankId) => {
    try {
      await deleteBank(bankId);
      notifySuccess("تم حذف الحساب البنكي بنجاح");
      queryClient.invalidateQueries(["banks"]);
      setIsDeleteModalOpen(false);
      setBankToDelete(null);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء حذف الحساب البنكي"
      );
    }
  };

  const handleEditBank = (bank) => {
    setSelectedBank(bank);
    setIsEditMode(true);
    setIsAddBankOpen(true);
  };

  const handleAddBank = () => {
    setSelectedBank(null);
    setIsEditMode(false);
    setIsAddBankOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddBankOpen(false);
    setSelectedBank(null);
    setIsEditMode(false);
  };

  const handleSuccess = () => {
    handleCloseModal();
    queryClient.invalidateQueries(["banks"]);
  };

  return (
    <Box sx={{ bgcolor: "#f6f6f8", minHeight: "100vh", p: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="#333">
          الحسابات البنكية
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddBank}
          sx={{
            bgcolor: "#0d40a5",
            "&:hover": { bgcolor: "#0b3589" },
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: "bold",
          }}
        >
          إضافة حساب بنكي
        </Button>
      </Box>

      {/* Search Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <InputBase
          placeholder="ابحث باسم الحساب أو رقم الحساب..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "300px",
            backgroundColor: "#f9fafb",
            borderRadius: "6px",
          }}
        />
      </Box>
      {/* Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                >
                  #
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                >
                  اسم الحساب
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                >
                  رقم الحساب
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                >
                  رقم الايبان
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                >
                  السلف المسموح بها
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                >
                  الحالة
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                >
                  الإجراءات
                </StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={5} align="center">
                    <CircularProgress size={20} />
                  </StyledTableCell>
                </StyledTableRow>
              ) : banksData?.data?.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={8} align="center">
                    <Typography>لا توجد حسابات بنكية</Typography>
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                banksData?.data?.map((bank) => (
                  <StyledTableRow key={bank.id} hover>
                    <StyledTableCell align="center">{bank.id}</StyledTableCell>
                    <StyledTableCell align="center">
                      {bank.name}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {bank.accountNumber}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {bank.IBAN}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {bank.limit}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Chip
                        label={
                          i18n.language === "ar"
                            ? bank.status === "Expired"
                              ? "منتهي"
                              : bank.status === "Active"
                              ? "نشط"
                              : bank.status
                            : bank.status
                        }
                        color={
                          bank.status === "Active"
                            ? "success"
                            : bank.status === "Expired"
                            ? "warning"
                            : ""
                        }
                        variant="outlined"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "16px",
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditBank(bank)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setBankToDelete(bank);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {banksData && (
          <TablePagination
            component="div"
            count={banksData.total || 0}
            page={page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
            labelDisplayedRows={({ from, to, count }) =>
              `عرض ${from}-${to} من ${count}`
            }
            labelRowsPerPage="صفوف لكل صفحة:"
          />
        )}
      </Paper>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBankToDelete(null);
        }}
        onConfirm={() => handleDeleteBank(bankToDelete?.id)}
        title="حذف الحساب البنكي"
        message={`هل أنت متأكد من حذف الحساب البنكي ${bankToDelete?.name}؟`}
        ButtonText="حذف"
      />

      {/* Add/Edit Bank Modal */}
      <AddBank
        open={isAddBankOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        bank={selectedBank}
        isEditMode={isEditMode}
      />
    </Box>
  );
};

export default Banks;
