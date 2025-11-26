import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  IconButton,
  Chip,
  Stack,
  Typography,
  CircularProgress,
  InputBase,
  Menu,
  MenuItem,
  ListItemIcon,
  Card,
  CardContent,
  useMediaQuery,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Visibility,
  Delete,
  PlayArrow,
  Schedule,
  Pause,
  MoreVert,
  Add,
  Description,
  Download,
  Print,
  Share,
  Close,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLoans,
  deleteLoan,
  activateLoan,
  deactivateLoan,
} from "../../pages/Loans/loanApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import DeleteModal from "../../components/modals/DeleteModal";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";
import { usePermissions } from "../Contexts/PermissionsContext";
import { saveAs } from 'file-saver';
import { handleApiError } from "../../config/Api";
const LoansTable = ({ onViewDetails, onViewInstallments, onCreateAdditionalLoan }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLoanForMenu, setSelectedLoanForMenu] = useState(null);
  const [isContractsModalOpen, setIsContractsModalOpen] = useState(false);
  const [selectedLoanContracts, setSelectedLoanContracts] = useState(null);
  const { permissions } = usePermissions();

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet; 
  const handleMenuOpen = (event, loan) => {
    setAnchorEl(event.currentTarget);
    setSelectedLoanForMenu(loan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLoanForMenu(null);
  };

  const { data: loansData, isLoading } = useQuery({
    queryKey: ["loans", page, searchQuery],
    queryFn: () => getLoans(page, searchQuery),
    retry: 1,
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDeleteLoan = async (loanId) => {
    try {
      await deleteLoan(loanId);
      notifySuccess("تم حذف السلفة بنجاح");
      queryClient.invalidateQueries(["loans"]);
      setIsDeleteModalOpen(false);
      setLoanToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف السلفة");
    }
  };

  const handleActivateLoan = async (loanId) => {
    try {
      await activateLoan(loanId);
      notifySuccess("تم تفعيل السلفة بنجاح");
      queryClient.invalidateQueries(["loans"]);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء تفعيل السلفة"
      );
    }
  };

  const handleDeactivateLoan = async (loanId) => {
    try {
      await deactivateLoan(loanId);
      notifySuccess("تم إلغاء تفعيل السلفة بنجاح");
      queryClient.invalidateQueries(["loans"]);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء إلغاء تفعيل السلفة"
      );
    }
  };

  const handleViewInstallmentsClick = (loan) => {
    if (loan.status === "PENDING") {
      notifyError("يجب تفعيل السلفة أولاً لعرض الأقساط");
      return;
    }
    onViewInstallments(loan);
  };

  const handleViewContracts = (loan) => {
    setSelectedLoanContracts(loan);
    setIsContractsModalOpen(true);
    handleMenuClose();
  };

  const handleDownloadContract = async (fileUrl, contractName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      const originalName = fileUrl.split('/').pop();
      const decodedName = decodeURIComponent(originalName);
      const newFileName = `${contractName}_${decodedName}`;
      
      saveAs(blob, newFileName);
      notifySuccess("تم تحميل الملف بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تحميل الملف");
      handleApiError(error);
    }
  };

  const handlePrintContract = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const printWindow = window.open(blobUrl, '_blank');
      
      printWindow?.addEventListener('load', () => {
        printWindow.print();
        printWindow.addEventListener('afterprint', () => {
          URL.revokeObjectURL(blobUrl);
        });
      }, { once: true });
      
    } catch (error) {
      notifyError("حدث خطأ أثناء محاولة الطباعة");
      handleApiError(error);
    }
  };

  const handleShareContract = async (fileUrl, contractName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
  
      const originalName = fileUrl.split('/').pop();
      const decodedName = decodeURIComponent(originalName);
      const fileName = `${contractName}_${decodedName}`;
  
      const file = new File([blob], fileName, { type: blob.type });
  
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: fileName,
          text: `مشاركة ${contractName}`,
          files: [file],
        });
        return;
      }
  
      await navigator.clipboard.writeText(fileUrl);
      notifySuccess("تم نسخ رابط الملف إلى الحافظة");
  
    } catch (error) {
      console.error("Share error:", error);
      notifyError("تعذرت مشاركة الملف");
    }
  };

  const handleViewContract = (fileUrl) => {
    try {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      notifyError("حدث خطأ أثناء فتح الملف");
      handleApiError(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "ACTIVE":
        return "success";
      case "COMPLETED":
        return "info";
      case "DEFAULTED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "قيد المراجعة";
      case "ACTIVE":
        return "نشط";
      case "COMPLETED":
        return "مكتمل";
      case "DEFAULTED":
        return "متأخر";
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "DAILY":
        return "يومي";
      case "WEEKLY":
        return "أسبوعي";
      case "MONTHLY":
        return "شهري";
      default:
        return type;
    }
  };

  // Render mobile loan cards
  const renderMobileLoanCards = () => (
    <Stack spacing={2} sx={{ p: 2 }}>
      {loansData?.data?.map((loan) => (
        <Card key={loan.id} variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {loan.code}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" sx={{ mt: 0.5 }}>
                    {loan.client?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Chip
                    label={getStatusText(loan.status)}
                    color={getStatusColor(loan.status)}
                    size="small"
                    sx={{ fontWeight: '500' }}
                  />
                  <IconButton
                    size="small"
                    onClick={(event) => handleMenuOpen(event, loan)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Loan Details */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    مبلغ السلفة
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {loan.amount?.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    مبلغ الدفعة
                  </Typography>
                  <Typography variant="body2">
                    {loan.paymentAmount?.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    معدل الفائدة
                  </Typography>
                  <Typography variant="body2">
                    {loan.interestRate}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    النوع
                  </Typography>
                  <Typography variant="body2">
                    {getTypeText(loan.type)}
                  </Typography>
                </Box>

                {loan.kafeel?.name && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      الكفيل
                    </Typography>
                    <Typography variant="body2">
                      {loan.kafeel.name}
                    </Typography>
                  </Box>
                )}

                {loan.partner?.name && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      المستثمر
                    </Typography>
                    <Typography variant="body2">
                      {loan.partner.name}
                    </Typography>
                  </Box>
                )}

                {loan.bankAccount?.name && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      الحساب البنكي
                    </Typography>
                    <Typography variant="body2">
                      {loan.bankAccount.name}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    تاريخ البدء
                  </Typography>
                  <Typography variant="body2">
                    {dayjs(loan.startDate).format("DD/MM/YYYY")}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    يوم الاستحقاق
                  </Typography>
                  <Typography variant="body2">
                    {loan.repaymentDay}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  // Render desktop table
  const renderDesktopTable = () => (
    <TableContainer sx={{ height: "100%", width: "100%" }}>
      <Table stickyHeader sx={{ width: "100%" }}>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              رقم السلفة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              العميل
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الكفيل
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              {" "}
              المستثمر
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الحساب البنكي
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              مبلغ السلفة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              مبلغ الدفعة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              معدل الفائدة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              النوع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              {" "}
              يوم الاستحقاق
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الحالة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ البدء
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الإجراءات
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={13} align="center">
                <CircularProgress size={20} />
              </StyledTableCell>
            </StyledTableRow>
          ) : loansData?.data?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={13} align="center">
                <Typography>لا توجد سلف</Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            loansData?.data?.map((loan) => (
              <StyledTableRow key={loan.id} hover>
                <StyledTableCell>{loan.code}</StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {loan.client?.name}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {loan.kafeel?.name || "-"}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {loan.partner?.name}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {loan.bankAccount?.name}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
                >
                  {loan.amount?.toLocaleString()}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {loan.paymentAmount?.toLocaleString()}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {loan.interestRate}%
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {getTypeText(loan.type)}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {loan.repaymentDay}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  <Chip
                    label={getStatusText(loan.status)}
                    color={getStatusColor(loan.status)}
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {dayjs(loan.startDate).format("DD/MM/YYYY")}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  <IconButton
                    size="small"
                    onClick={(event) => handleMenuOpen(event, loan)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Search Bar */}
      <Box
        sx={{
          p: isSmallScreen ? 1.5 : 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <InputBase
          placeholder="ابحث باسم العميل أو رقم السلفة..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: isSmallScreen ? "100%" : "280px",
            borderRadius: "6px",
            p: isSmallScreen ? 1 : 0.5,
          }}
        />
      </Box>

      {/* Table/Cards */}
      <Paper sx={{ flex: 1, width: "100%", overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress size={40} />
          </Box>
        ) : loansData?.data?.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد سلف
            </Typography>
            <Typography variant="body2" color="text.secondary">
              لم يتم العثور على أي سلف  
            </Typography>
          </Box>
        ) : (
          <>
            {isSmallScreen ? renderMobileLoanCards() : renderDesktopTable()}
          </>
        )}
      </Paper>

      {/* Pagination */}
      {loansData && loansData.total > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: isSmallScreen ? 1 : 2,
          borderTop: '1px solid #e0e0e0'
        }}>
          {isSmallScreen ? (
            <Pagination
              count={Math.ceil(loansData.total / 10)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="small"
              showFirstButton
              showLastButton
            />
          ) : (
            <TablePagination
              component="div"
              count={loansData.total || 0}
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
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLoanToDelete(null);
        }}
        onConfirm={() => handleDeleteLoan(loanToDelete?.id)}
        title="حذف السلفة"
        message={`هل أنت متأكد من حذف سلفة العميل ${loanToDelete?.client?.name}؟`}
        ButtonText="حذف"
      />

      {/* Contracts Modal */}
      <Dialog
        open={isContractsModalOpen}
        onClose={() => {
          setIsContractsModalOpen(false);
          setSelectedLoanContracts(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            direction: 'rtl'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" fontWeight="bold">
            عقود السلفة - {selectedLoanContracts?.code}
          </Typography>
          <IconButton 
            onClick={() => {
              setIsContractsModalOpen(false);
              setSelectedLoanContracts(null);
            }}
            size="small"
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Debt Acknowledgment Contract */}
            {selectedLoanContracts?.DEBT_ACKNOWLEDGMENT && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      إقرار الدين
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Visibility sx={{marginLeft:'10px'}} />}
                    onClick={() => handleViewContract(selectedLoanContracts.DEBT_ACKNOWLEDGMENT)}
                    size="small"
                    sx={{ bgcolor: "#1976D2", "&:hover": { bgcolor: "#1565C0" } }}
                  >
                    عرض
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download sx={{marginLeft:'10px'}} />}
                    onClick={() => handleDownloadContract(selectedLoanContracts.DEBT_ACKNOWLEDGMENT, 'إقرار_الدين')}
                    size="small"
                  >
                    تحميل
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Print sx={{marginLeft:'10px'}} />}
                    onClick={() => handlePrintContract(selectedLoanContracts.DEBT_ACKNOWLEDGMENT)}
                    size="small"
                  >
                    طباعة
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share sx={{marginLeft:'10px'}} />}
                    onClick={() => handleShareContract(selectedLoanContracts.DEBT_ACKNOWLEDGMENT, 'إقرار_الدين')}
                    size="small"
                  >
                    مشاركة
                  </Button>
                </Box>
              </Card>
            )}

            {/* Promissory Note Contract */}
            {selectedLoanContracts?.PROMISSORY_NOTE && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      سند لأمر
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Visibility sx={{marginLeft:'10px'}} />}
                    onClick={() => handleViewContract(selectedLoanContracts.PROMISSORY_NOTE)}
                    size="small"
                    sx={{ bgcolor: "#1976D2", "&:hover": { bgcolor: "#1565C0" } }}
                  >
                    عرض
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download sx={{marginLeft:'10px'}} />}
                    onClick={() => handleDownloadContract(selectedLoanContracts.PROMISSORY_NOTE, 'سند_لأمر')}
                    size="small"
                  >
                    تحميل
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Print sx={{marginLeft:'10px'}} />}
                    onClick={() => handlePrintContract(selectedLoanContracts.PROMISSORY_NOTE)}
                    size="small"
                  >
                    طباعة
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share sx={{marginLeft:'10px'}} />}
                    onClick={() => handleShareContract(selectedLoanContracts.PROMISSORY_NOTE, 'سند_لأمر')}
                    size="small"
                  >
                    مشاركة
                  </Button>
                </Box>
              </Card>
            )}

            {/* Settlement Contract - Only for COMPLETED loans */}
            {selectedLoanContracts?.status === "COMPLETED" && selectedLoanContracts?.SETTLEMENT && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description color="success" />
                    <Typography variant="h6" fontWeight="bold">
                      عقد التسوية
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Visibility sx={{marginLeft:'10px'}} />}
                    onClick={() => handleViewContract(selectedLoanContracts.SETTLEMENT)}
                    size="small"
                    sx={{ bgcolor: "#1976D2", "&:hover": { bgcolor: "#1565C0" } }}
                  >
                    عرض
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download sx={{marginLeft:'10px'}} />}
                    onClick={() => handleDownloadContract(selectedLoanContracts.SETTLEMENT, 'عقد_التسوية')}
                    size="small"
                  >
                    تحميل
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Print sx={{marginLeft:'10px'}} />}
                    onClick={() => handlePrintContract(selectedLoanContracts.SETTLEMENT)}
                    size="small"
                  >
                    طباعة
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share sx={{marginLeft:'10px'}} />}
                    onClick={() => handleShareContract(selectedLoanContracts.SETTLEMENT, 'عقد_التسوية')}
                    size="small"
                  >
                    مشاركة
                  </Button>
                </Box>
              </Card>
            )}

            {!selectedLoanContracts?.DEBT_ACKNOWLEDGMENT && !selectedLoanContracts?.PROMISSORY_NOTE && !(selectedLoanContracts?.status === "COMPLETED" && selectedLoanContracts?.SETTLEMENT) && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  لا توجد عقود متاحة لهذه السلفة
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: 'row-reverse' }}>
          <Button
            onClick={() => {
              setIsContractsModalOpen(false);
              setSelectedLoanContracts(null);
            }}
            variant="contained"
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* Activate Loan (PENDING) - First Item */}
        {selectedLoanForMenu?.status === "PENDING" && permissions.includes("loans_Post") && (
          <MenuItem
            onClick={() => {
              handleActivateLoan(selectedLoanForMenu?.id);
              handleMenuClose();
            }}
            sx={{ color: "#2E7D32", fontWeight: 'bold', fontSize: '0.875rem' }} // Green
          >

            <ListItemIcon>
              <PlayArrow fontSize="small" sx={{ color: "#2E7D32" }} />
            </ListItemIcon>
            تفعيل السلفة
          </MenuItem>
        )}

        {/* View Loan Details */}
        <MenuItem
          onClick={() => {
            onViewDetails(selectedLoanForMenu?.id);
            handleMenuClose();
          }}
          sx={{ color: "#1976D2", fontWeight: 'bold', fontSize: '0.875rem' }} // Blue
        >
          <ListItemIcon>
            <Visibility fontSize="small" sx={{ color: "#1976D2" }} />
          </ListItemIcon>
          عرض السلفة
        </MenuItem>

        {/* View Installments */}
        <MenuItem
          onClick={() => {
            handleViewInstallmentsClick(selectedLoanForMenu);
            handleMenuClose();
          }}
          sx={{ color: "#2E7D32", fontWeight: 'bold', fontSize: '0.875rem' }} // Green
        >

          <ListItemIcon>
            <Schedule fontSize="small" sx={{ color: "#2E7D32" }} />
          </ListItemIcon>
          عرض الأقساط
        </MenuItem>

        {/* View Contracts */}
        {(selectedLoanForMenu?.DEBT_ACKNOWLEDGMENT || selectedLoanForMenu?.PROMISSORY_NOTE || selectedLoanForMenu?.SETTLEMENT) && (
          <MenuItem
            onClick={() => {
              handleViewContracts(selectedLoanForMenu);
            }}
            sx={{ color: "#7B1FA2", fontWeight: 'bold', fontSize: '0.875rem' }} // Purple
          >
            <ListItemIcon>
              <Description fontSize="small" sx={{ color: "#7B1FA2" }} />
            </ListItemIcon>
            عرض عقود السلفة
          </MenuItem>
        )}

        {/* Create Additional Loan */}
        {permissions.includes("loans_Add") && (
          <MenuItem
            onClick={() => {
              onCreateAdditionalLoan(selectedLoanForMenu?.client);
              handleMenuClose();
            }}
            sx={{ color: "black", fontWeight: 'bold', fontSize: '0.875rem' }}
          >
            <ListItemIcon>
              <Add fontSize="small" sx={{ color: "black" }} />
            </ListItemIcon>
            سلفة إضافية
          </MenuItem>
        )}

        {/* Deactivate Loan (ACTIVE) */}
        {selectedLoanForMenu?.status === "ACTIVE" && permissions.includes("loans_Post") && (
          <MenuItem
            onClick={() => {
              handleDeactivateLoan(selectedLoanForMenu?.id);
              handleMenuClose();
            }}
            sx={{ color: "red", fontWeight: 'bold', fontSize: '0.875rem' }}
          >
            <ListItemIcon>
              <Pause fontSize="small" sx={{ color: "red" }} />
            </ListItemIcon>
            إلغاء تفعيل السلفة
          </MenuItem>
        )}

        {/* Delete Loan */}
        {selectedLoanForMenu?.status !== "ACTIVE" && permissions.includes("loans_Delete") && (
          <MenuItem
            onClick={() => {
              setLoanToDelete(selectedLoanForMenu);
              setIsDeleteModalOpen(true);
              handleMenuClose();
            }}
            sx={{ color: "#D32F2F", fontWeight: 'bold', fontSize: '0.875rem' }} // Red
          >
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: "#D32F2F" }} />
            </ListItemIcon>
            حذف السلفة
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default LoansTable;
