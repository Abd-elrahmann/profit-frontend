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
import { Search, Add, Edit, Delete,PictureAsPdf as PdfIcon,TableChart as ExcelIcon} from "@mui/icons-material";
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
import { exportBanksToPDF, exportBanksToExcel } from "../../utilities/banksExporter";
import { useTheme } from "../../theme/ThemeContext";
const Banks = () => {
  const { i18n } = useTranslation();
  const { isDarkMode } = useTheme();
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

  const handleExportPDF = async () => {
    if (!banksData?.data || banksData.data.length === 0) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    
    try {
      await exportBanksToPDF(banksData.data, searchQuery);
      notifySuccess("تم تصدير الحسابات البنكية إلى PDF بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error('PDF export error:', error);
    }
  };

  const handleExportExcel = async () => {
    if (!banksData?.data || banksData.data.length === 0) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    
    try {
      await exportBanksToExcel(banksData.data, searchQuery);
      notifySuccess("تم تصدير الحسابات البنكية إلى Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error('Excel export error:', error);
    }
  };

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

  const handleSuccess = (updatedBankData = null, operationType = null) => {
    handleCloseModal();

    if (updatedBankData && operationType === 'update') {
      queryClient.setQueryData(["banks", page, searchQuery], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: oldData.data.map(bank =>
            bank.id === updatedBankData.id ? { ...bank, ...updatedBankData } : bank
          )
        };
      });
    } else {
      queryClient.invalidateQueries(["banks"]);
    }
  };

  const renderTable = () => (
    <TableContainer sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}
            >
              #
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}
            >
              اسم الحساب
            </StyledTableCell>  
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}
            >
              اسم المالك
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}
            >
              رقم الحساب
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}
            >
              رقم الايبان
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}
            >
              السلف المسموح بها
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}
            >
              الحالة
            </StyledTableCell>
            {(permissions.includes("banks_Update") || permissions.includes("banks_Delete") || permissions.includes("banks_Add")) && (
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}
            >
              الإجراءات
            </StyledTableCell>
            )}
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
                {(permissions.includes("banks_Update") || permissions.includes("banks_Delete") || permissions.includes("banks_Add")) && (
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
                )}
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
                  border: '1px solid',
                  borderColor: 'grey.300',
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
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {bank.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          #{bank.id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(permissions.includes("banks_Update")) && (
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditBank(bank)}
                            size="small"
                            title="تعديل"
                          >
                            <Edit fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        )}
                        {(permissions.includes("banks_Delete")) && (
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
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh", p: isMobile ? 2 : 3 }}>
      <Helmet>
        <title>الحسابات البنكية</title>
        <meta name="description" content="الحسابات البنكية" />
      </Helmet>
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection:'row-reverse',
          alignItems: isSmallScreen ? "stretch" : "center",
          mb: 2,
          gap: 1,
        }}
      >
        <InputBase
          placeholder="ابحث باسم الحساب أو رقم الحساب..."
          value={searchQuery}
          onChange={handleSearchChange}
          startAdornment={
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          }
          sx={{
            width: isSmallScreen ? '100%' : "300px",
            borderRadius: "6px",
            p: 1,
          }}
        />
      
        <Stack 
          direction={isSmallScreen ? "column" : "row"} 
          spacing={1}
          sx={{ minWidth: isSmallScreen ? '100%' : 'auto' }}
        >
          {(permissions.includes("banks_Export")) && (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PdfIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleExportPDF}
              disabled={!banksData?.data || banksData.data.length === 0}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": {
                  bgcolor: isDarkMode ? "rgba(211, 47, 47, 0.2)" : "rgba(211, 47, 47, 0.1)",
                  borderColor: "error.dark"
                },
                borderRadius: 2,
                px: 2,
                fontWeight: "bold",
                minWidth: isSmallScreen ? '50%' : 'auto',
              }}
            >
              PDF
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleExportExcel}
              disabled={!banksData?.data || banksData.data.length === 0}
              sx={{
                borderColor: "success.main",
                color: "success.main",
                "&:hover": {
                  bgcolor: isDarkMode ? "rgba(46, 125, 50, 0.2)" : "rgba(46, 125, 50, 0.1)",
                  borderColor: "success.dark"
                },
                borderRadius: 2,
                px: 2,
                fontWeight: "bold",
                minWidth: isSmallScreen ? '50%' : 'auto',
              }}
            >
              Excel
            </Button>
          </Stack>
          )}
          {(permissions.includes("banks_Add")) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddBank}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
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
        </Stack>
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
        {isSmallScreen ? renderCards() : renderTable()}

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