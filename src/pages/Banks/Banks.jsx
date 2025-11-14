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
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import { Search, Add, Edit, Delete } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBanks, deleteBank } from "./bankApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import DeleteModal from "../../components/modals/DeleteModal";
import AddBank from "../../components/modals/AddBank";
import { Helmet } from "react-helmet-async";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { useTranslation } from "react-i18next";
import { usePermissions } from "../../components/Contexts/PermissionsContext";

const Banks = () => {
  const { i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [bankToDelete, setBankToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;
  
  const { permissions } = usePermissions();
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

  // Render table for large screens
  const renderTable = () => (
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
              اسم المالك
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
              <StyledTableCell colSpan={8} align="center">
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
                <StyledTableCell align="center">{bank.name}</StyledTableCell>
                <StyledTableCell align="center">{bank.owner}</StyledTableCell>
                <StyledTableCell align="center">{bank.accountNumber}</StyledTableCell>
                <StyledTableCell align="center">{bank.IBAN}</StyledTableCell>
                <StyledTableCell align="center">{bank.limit}</StyledTableCell>
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
                    {permissions.includes("banks_Update") && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditBank(bank)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    )}
                    {permissions.includes("banks_Delete") && (
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
                    )}
                  </Stack>
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render cards for small screens
  const renderCards = () => (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : banksData?.data?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            لا توجد حسابات بنكية
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {banksData?.data?.map((bank) => (
            <Grid item xs={12} key={bank.id}>
              <Card 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Stack spacing={2}>
                    {/* Header Row - Bank Name and Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1
                    }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {bank.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          #{bank.id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {permissions.includes("banks_Update") && (
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditBank(bank)}
                            size="small"
                            title="تعديل"
                          >
                            <Edit fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                        {permissions.includes("banks_Delete") && (
                          <IconButton 
                            color="error" 
                            onClick={() => {
                              setBankToDelete(bank);
                              setIsDeleteModalOpen(true);
                            }}
                            size="small"
                            title="حذف"
                          >
                            <Delete fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    <Divider />

                    {/* Bank Details */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          اسم المالك:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {bank.owner}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          رقم الحساب:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {bank.accountNumber}
                        </Typography>
                      </Box>
                    </Box>

                    {/* IBAN and Limit */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          رقم الايبان:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', wordBreak: 'break-all' }}>
                          {bank.IBAN}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          السلف المسموح بها:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {bank.limit}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
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
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          padding: "4px 8px",
                          borderRadius: "16px",
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
    <Box sx={{ bgcolor: "#f6f6f8", minHeight: "100vh", p: isMobile ? 2 : 4 }}>
      <Helmet>
        <title>الحسابات البنكية</title>
        <meta name="description" content="الحسابات البنكية" />
      </Helmet>
      
      {/* Header */}
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
        <Typography variant="h5" fontWeight="bold" color="#333">
          الحسابات البنكية
        </Typography>
        
        {permissions.includes("banks_Add") && (
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
              minWidth: isSmallScreen ? '100%' : 'auto',
            }}
          >
            إضافة حساب بنكي
          </Button>
        )}
      </Box>

      {/* Search Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: isSmallScreen ? "stretch" : "space-between",
          alignItems: "center",
          mb: 4,
          flexDirection: isSmallScreen ? "column" : "row",
          gap: 2,
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
            width: isSmallScreen ? '100%' : "300px",
            backgroundColor: "#f9fafb",
            borderRadius: "6px",
            p: 1,
          }}
        />
      </Box>

      {/* Table for large screens, Cards for small screens */}
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
        {isSmallScreen ? renderCards() : renderTable()}

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
        isMobile={isMobile}
      />
    </Box>
  );
};

export default Banks;