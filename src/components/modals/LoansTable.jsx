import React, { useState, useEffect } from "react";
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
  SwapHoriz,
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
import { StyledTableCell, StyledTableRow, ScrollableTableContainer } from "../layouts/tableLayout";
import dayjs from "dayjs";
import { usePermissions } from "../Contexts/PermissionsContext";
import { saveAs } from 'file-saver';
import { handleApiError } from "../../config/Api";
const LoansTable = ({ onViewDetails, onViewInstallments, onCreateAdditionalLoan, onConvertClient, statusFilter, searchQuery }) => {
  const [page, setPage] = useState(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Debounce search query - wait 500ms after user stops typing before making API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 when search query or status filter changes
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);
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

  const PAGE_SIZE = 15;

  const { data: loansData, isLoading } = useQuery({
    queryKey: ["loans", page, debouncedSearchQuery, PAGE_SIZE, statusFilter],
    queryFn: () => getLoans(page, debouncedSearchQuery, PAGE_SIZE, statusFilter),
    retry: 1,
  });

  const totals = React.useMemo(() => {
    const list = loansData?.data || [];
    return list.reduce(
      (acc, loan) => ({
        amount: acc.amount + Number(loan.amount || 0),
        paymentAmount: acc.paymentAmount + Number(loan.paymentAmount || 0),
      }),
      { amount: 0, paymentAmount: 0 }
    );
  }, [loansData?.data]);


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
      
      const decodedName = decodeURIComponent(fileUrl.split('/').pop());
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
  
      const decodedName = decodeURIComponent(fileUrl.split('/').pop());
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

      // Check if clipboard API is available before using it
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fileUrl);
        notifySuccess("تم نسخ رابط الملف إلى الحافظة");
      } else {
        // Fallback: try to use the older execCommand method
        const textArea = document.createElement('textarea');
        textArea.value = fileUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          notifySuccess("تم نسخ رابط الملف إلى الحافظة");
        } catch (err) {
          console.warn('Fallback copy method also failed:', err);
          notifyError("تعذرت نسخ رابط الملف تلقائياً — يرجى نسخه يدوياً");
        } finally {
          document.body.removeChild(textArea);
        }
      }
  
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

  const getSourceText = (source) => {
    switch (source) {
      case "GENERAL":
        return "عام";
      case "NEW_CAPITAL":
        return "رأس مال جديد";
      case "MIX":
        return "عام و رأس مال جديد";
      default:
        return source || "غير محدد";
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
                  {loan.fromclient && (
                    <Typography variant="caption" sx={{ fontSize: '12px', color: 'warning.main', fontWeight: 'bold', mt: 0.5, display: 'block' }}>
                      منقولة من: {loan.fromclient.name}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Chip
                    label={getStatusText(loan.status)}
                    color={getStatusColor(loan.status)}
                    size="small"
                    sx={{ fontWeight: '500' }}
                  />
                  {(permissions.includes("loans_Post") || permissions.includes("loans_Add") || permissions.includes("loans_Delete")) && (
                    <IconButton
                      size="small"
                      onClick={(event) => handleMenuOpen(event, loan)}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  )}
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
                    الفائدة
                  </Typography>
                  <Typography variant="body2">
                    {loan.interestAmount?.toLocaleString()} ({loan.interestRate}%)
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
                    مصدر السلفة
                  </Typography>
                  <Typography variant="body2">
                    {getSourceText(loan.source)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="caption" color="text.secondary">
                    تاريخ الإنشاء
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {dayjs(loan.createdAt).format("DD/MM/YYYY")}
                    </Typography>
                    {loan.createdAtHijri && (
                      <Typography variant="caption" color="text.secondary">
                        {loan.createdAtHijri}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="caption" color="text.secondary">
                    تاريخ الانتهاء
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    {loan.status === "COMPLETED" && loan.endDate ? (
                      <>
                        <Typography variant="body2" fontWeight="bold">
                          {dayjs(loan.endDate).format("DD/MM/YYYY")}
                        </Typography>
                        {loan.endDateHijri && (
                          <Typography variant="caption" color="text.secondary">
                            {loan.endDateHijri}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        لم تنتهي بعد
                      </Typography>
                    )}
                  </Box>
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
  const hasActions = permissions.includes("loans_Post") || permissions.includes("loans_Add") || permissions.includes("loans_Delete");

  const renderDesktopTable = () => (
    <ScrollableTableContainer maxHeight="100%">
      <Table stickyHeader sx={{ minWidth: 1200 }}>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              العميل
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              {" "}
              المستثمر
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الحساب البنكي
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              مصدر السلفة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              مبلغ السلفة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              مبلغ الدفعة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الفائدة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              النوع / يوم الاستحقاق
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الحالة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ الإنشاء
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ الانتهاء
            </StyledTableCell>
            {hasActions && (
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                الإجراءات
              </StyledTableCell>
            )}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={hasActions ? 14 : 13} align="center">
                <CircularProgress size={20} />
              </StyledTableCell>
            </StyledTableRow>
          ) : loansData?.data?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={hasActions ? 14 : 13} align="center">
                <Typography>لا توجد سلف</Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            loansData?.data?.map((loan) => (
              <StyledTableRow key={loan.id} hover>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  <Stack spacing={0.25} sx={{ whiteSpace: "nowrap" }}>
                    <Typography variant="body2" fontWeight="bold">
                      {loan.client?.name}
                    </Typography>
                    {loan.kafeel?.name && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '14px' }}>
                        الكفيل: {loan.kafeel.name}
                      </Typography>
                    )}
                    {loan.fromclient && (
                      <Typography variant="caption" sx={{ fontSize: '13px', color: 'warning.main', fontWeight: 'bold' }}>
                        منقولة من: {loan.fromclient.name}
                      </Typography>
                    )}
                  </Stack>
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
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {getSourceText(loan.source)}
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
                  {loan.interestAmount?.toLocaleString()} ({loan.interestRate}%)
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  <Stack spacing={0.25} sx={{ whiteSpace: "nowrap" }}>
                    <Typography variant="body2">
                      {getTypeText(loan.type)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '14px' }}>
                      يوم الاستحقاق: {loan.repaymentDay}
                    </Typography>
                  </Stack>
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
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {dayjs(loan.createdAt).format("DD/MM/YYYY")}
                    </Typography>
                    {loan.createdAtHijri && (
                      <Typography variant="caption" color="text.secondary">
                        {loan.createdAtHijri}
                      </Typography>
                    )}
                  </Box>
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  <Box>
                    {loan.status === "COMPLETED" && loan.endDate ? (
                      <>
                        <Typography variant="body2" fontWeight="bold">
                          {dayjs(loan.endDate).format("DD/MM/YYYY")}
                        </Typography>
                        {loan.endDateHijri && (
                          <Typography variant="caption" color="text.secondary">
                            {loan.endDateHijri}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        لم تنتهي بعد
                      </Typography>
                    )}
                  </Box>
                </StyledTableCell>
                {hasActions && (
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
                )}
              </StyledTableRow>
            ))
          )}
          {/* Totals row */}
          {!isLoading && loansData?.data?.length > 0 && (
            <StyledTableRow>
              <StyledTableCell
                colSpan={4}
                align="center"
                sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
              >
                الإجمالي
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
              >
                {totals.amount.toLocaleString()}
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
              >
                {totals.paymentAmount.toLocaleString()}
              </StyledTableCell>
              <StyledTableCell colSpan={hasActions ? 6 : 5} />
            </StyledTableRow>
          )}
        </TableBody>
      </Table>
    </ScrollableTableContainer>
  );

  const showPagination = loansData && loansData.total > PAGE_SIZE;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >

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
      {showPagination && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: isSmallScreen ? 1 : 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          {isSmallScreen ? (
            <Pagination
              count={Math.ceil(loansData.total / PAGE_SIZE)}
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
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
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
                    sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
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
                    sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
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
                    sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
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

            {/* Payment Proofs */}
            {selectedLoanContracts?.PAYMENT_PROOF && selectedLoanContracts.PAYMENT_PROOF.length > 0 && (
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description color="success" />
                    <Typography variant="h6" fontWeight="bold">
                      إثباتات الدفع ({selectedLoanContracts.PAYMENT_PROOF.length})
                    </Typography>
                  </Box>
                </Box>
                <Stack spacing={1}>
                  {selectedLoanContracts.PAYMENT_PROOF.map((proof, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ flex: 1, textAlign: 'right' }}>
                        إثبات دفع #{index + 1}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility sx={{marginLeft:'10px'}} />}
                          onClick={() => handleViewContract(proof)}
                          size="small"
                        >
                          عرض
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Download sx={{marginLeft:'10px'}} />}
                          onClick={() => handleDownloadContract(proof, `إثبات_دفع_${index + 1}`)}
                          size="small"
                        >
                          تحميل
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Print sx={{marginLeft:'10px'}} />}
                          onClick={() => handlePrintContract(proof)}
                          size="small"
                        >
                          طباعة
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Share sx={{marginLeft:'10px'}} />}
                          onClick={() => handleShareContract(proof, `إثبات_دفع_${index + 1}`)}
                          size="small"
                        >
                          مشاركة
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Card>
            )}

            {!selectedLoanContracts?.DEBT_ACKNOWLEDGMENT && !selectedLoanContracts?.PROMISSORY_NOTE && !(selectedLoanContracts?.status === "COMPLETED" && selectedLoanContracts?.SETTLEMENT) && (!selectedLoanContracts?.PAYMENT_PROOF || selectedLoanContracts.PAYMENT_PROOF.length === 0) && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  لا توجد عقود أو إثباتات دفع متاحة لهذه السلفة
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
            sx={{ color: "success.main", fontWeight: 'bold', fontSize: '0.875rem' }}
          >

            <ListItemIcon>
              <PlayArrow fontSize="small" sx={{ color: "success.main" }} />
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
          sx={{ color: "info.main", fontWeight: 'bold', fontSize: '0.875rem' }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" sx={{ color: "info.main" }} />
          </ListItemIcon>
          عرض السلفة
        </MenuItem>

        {/* View Installments */}
        <MenuItem
          onClick={() => {
            handleViewInstallmentsClick(selectedLoanForMenu);
            handleMenuClose();
          }}
          sx={{ color: "warning.main", fontWeight: 'bold', fontSize: '0.875rem' }}
        >

          <ListItemIcon>
            <Schedule fontSize="small" sx={{ color: "warning.main" }} />
          </ListItemIcon>
          عرض الأقساط
        </MenuItem>

        {/* View Contracts */}
        {(selectedLoanForMenu?.DEBT_ACKNOWLEDGMENT || selectedLoanForMenu?.PROMISSORY_NOTE || selectedLoanForMenu?.SETTLEMENT) && (
          <MenuItem
            onClick={() => {
              handleViewContracts(selectedLoanForMenu);
            }}
            sx={{ color: "#9c27b0", fontWeight: 'bold', fontSize: '0.875rem' }}
          >
            <ListItemIcon>
              <Description fontSize="small" sx={{ color: "#9c27b0" }} />
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
            sx={{ color: "text.primary", fontWeight: 'bold', fontSize: '0.875rem' }}
          >
            <ListItemIcon>
              <Add fontSize="small" sx={{ color: "text.primary" }} />
            </ListItemIcon>
            سلفة إضافية
          </MenuItem>
        )}

        {/* Convert Client (ACTIVE loans with remaining balance) */}
        {selectedLoanForMenu?.status === "ACTIVE" && selectedLoanForMenu?.remainingBalance > 0 && permissions.includes("loans_Update") && (
          <MenuItem
            onClick={() => {
              onConvertClient(selectedLoanForMenu);
              handleMenuClose();
            }}
            sx={{ color: "warning.main", fontWeight: 'bold', fontSize: '0.875rem' }}
          >
            <ListItemIcon>
              <SwapHoriz fontSize="small" sx={{ color: "warning.main" }} />
            </ListItemIcon>
            نقل مديونيه
          </MenuItem>
        )}

        {/* Deactivate Loan (ACTIVE) */}
        {selectedLoanForMenu?.status === "ACTIVE" && permissions.includes("loans_Post") && (
          <MenuItem
            onClick={() => {
              handleDeactivateLoan(selectedLoanForMenu?.id);
              handleMenuClose();
            }}
            sx={{ color: "error.main", fontWeight: 'bold', fontSize: '0.875rem' }}
          >
            <ListItemIcon>
              <Pause fontSize="small" sx={{ color: "error.main" }} />
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
            sx={{ color: "error.main", fontWeight: 'bold', fontSize: '0.875rem' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: "error.main" }} />
            </ListItemIcon>
            حذف السلفة
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default LoansTable;
