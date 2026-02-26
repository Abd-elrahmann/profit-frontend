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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  useMediaQuery,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Delete,
  Payment,
  MoreVert,
  Visibility,
  Edit,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSmallLoans,
  deleteSmallLoan,
  paySmallLoan
} from "../../pages/Loans/loanApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import DeleteModal from "../../components/modals/DeleteModal";
import { transparentSearchInputBaseSx } from "../../utilities/searchInputStyles";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";
import "dayjs/locale/ar";

const SmallLoansTable = ({ onEditLoan }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    notes: "",
  });
  const [isPayLoading, setIsPayLoading] = useState(false);
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLoanForMenu, setSelectedLoanForMenu] = useState(null);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isSmallScreen = isMobile || isTablet;

  const PAGE_SIZE = 15;

  const { data: smallLoansData, isLoading } = useQuery({
    queryKey: ["small-loans", page, searchQuery, PAGE_SIZE],
    queryFn: () => getSmallLoans(page, searchQuery, PAGE_SIZE),
    retry: 1,
  });

  const formatArabicDate = (date) => {
    return dayjs(date)
      .locale("ar")
      .format("D [من] MMMM")
      + " " ;
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleMenuOpen = (event, loan) => {
    setAnchorEl(event.currentTarget);
    setSelectedLoanForMenu(loan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLoanForMenu(null);
  };

  const handleDeleteLoan = async (loanId) => {
    try {
      await deleteSmallLoan(loanId);
      notifySuccess("تم حذف السلفة الصغيرة بنجاح");
      queryClient.invalidateQueries(["small-loans"]);
      queryClient.invalidateQueries(["unposted-small-loan-journals"]);
      queryClient.invalidateQueries(["unposted-journals-all"]);
      setIsDeleteModalOpen(false);
      setLoanToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف السلفة الصغيرة");
    }
  };

  const handleOpenPayModal = (loan) => {
    setSelectedLoanForPayment(loan);
    setPaymentData({
      amount: "",
      notes: "",
    });
    setIsPayModalOpen(true);
  };

  const handleClosePayModal = () => {
    setIsPayModalOpen(false);
    setSelectedLoanForPayment(null);
    setPaymentData({
      amount: "",
      notes: "",
    });
  };


  const handlePaymentSubmit = async () => {
    if (!paymentData.amount) {
      notifyError("يرجى إدخال مبلغ الدفعة");
      return;
    }

    const paymentAmount = parseFloat(paymentData.amount.replace(/,/g, ""));
    if (paymentAmount <= 0) {
      notifyError("مبلغ الدفعة يجب أن يكون أكبر من صفر");
      return;
    }

    if (paymentAmount > selectedLoanForPayment.remaining) {
      notifyError("مبلغ الدفعة أكبر من المبلغ المتبقي");
      return;
    }

    try {
      setIsPayLoading(true);

      const submitData = {
        amount: paymentAmount,
        notes: paymentData.notes.trim(),
      };

      await paySmallLoan(selectedLoanForPayment.id, submitData);
      notifySuccess("تم سداد الدفعة بنجاح");

      queryClient.invalidateQueries(["small-loans"]);
      queryClient.invalidateQueries(["unposted-small-loan-journals"]);
      queryClient.invalidateQueries(["unposted-journals-all"]);
      handleClosePayModal();
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء سداد الدفعة");
    } finally {
      setIsPayLoading(false);
    }
  };

  const handlePaymentInputChange = (field, value) => {
    if (field === "amount") {
      const rawValue = value.replace(/,/g, "");
      if (!isNaN(rawValue) && rawValue !== "") {
        const numValue = parseFloat(rawValue);
        if (numValue >= 0) {
          value = numValue.toLocaleString();
        }
      } else if (rawValue === "") {
        value = "";
      }
    }

    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const getStatusText = (status) => {
    switch (status) {
      case "OPEN":
        return "مفتوحة";
      case "PAID":
        return "مدفوعة";
      case "PARTIALLY_PAID":
        return "مدفوعة جزئياً";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "warning";
      case "PAID":
        return "success";
      case "PARTIALLY_PAID":
        return "info";
      default:
        return "default";
    }
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "0";
    return amount.toLocaleString();
  };

  const renderMobileLoanCards = () => (
    <Stack spacing={1.5} sx={{ p: 1, width: "100%" }}>
      {smallLoansData?.data?.map((loan) => (
        <Paper key={loan.id} variant="outlined" sx={{ borderRadius: 2, p: 2, width: "100%", border: "1px solid", borderColor: "divider", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="primary">
                  {loan.Name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  ID: {loan.id}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                <Chip
                  label={getStatusText(loan.status)}
                  color={getStatusColor(loan.status)}
                  size="small"
                  sx={{ fontWeight: '500' }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  المبلغ الإجمالي
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatAmount(loan.amount)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  المبلغ المدفوع
                </Typography>
                <Typography variant="body2">
                  {formatAmount(loan.paidAmount)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  المبلغ المتبقي
                </Typography>
                <Typography variant="body2" color="error" fontWeight="bold">
                  {formatAmount(loan.remaining)}
                </Typography>
              </Box>

              {loan.notes && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    الملاحظات
                  </Typography>
                  <Typography variant="body2">
                    {loan.notes}
                  </Typography>
                </Box>
              )}

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
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <IconButton
                size="small"
                onClick={(event) => handleMenuOpen(event, loan)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );

  const renderDesktopTable = () => (
    <Table>
      <TableHead>
        <StyledTableRow>
          <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
            الاسم
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
            المبلغ الإجمالي
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
            المبلغ المدفوع
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
            المبلغ المتبقي
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
            الحالة
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
            الملاحظات
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
            تاريخ الإنشاء
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
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
        ) : smallLoansData?.data?.length === 0 ? (
          <StyledTableRow>
            <StyledTableCell colSpan={8} align="center">
              <Typography>لا توجد سلف صغيرة</Typography>
            </StyledTableCell>
          </StyledTableRow>
        ) : (
          smallLoansData?.data?.map((loan) => (
            <StyledTableRow key={loan.id} hover>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {loan.Name}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                {formatAmount(loan.amount)}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {formatAmount(loan.paidAmount)}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap", color: "error.main", fontWeight: "bold" }}>
                {formatAmount(loan.remaining)}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                <Chip
                  label={getStatusText(loan.status)}
                  color={getStatusColor(loan.status)}
                  size="small"
                />
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                {loan.notes && (
                  <Tooltip title={loan.notes}>
                    <Typography variant="body2">
                      {loan.notes}
                    </Typography>
                  </Tooltip>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {formatArabicDate(loan.createdAt)}
                  </Typography>
                  {loan.createdAtHijri && (
                    <Typography variant="caption" color="text.secondary">
                      {loan.createdAtHijri}
                    </Typography>
                  )}
                </Box>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
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
  );

  const showPagination = smallLoansData && smallLoansData.total > PAGE_SIZE;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <Box
        sx={{
          p: isSmallScreen ? 1.5 : 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <InputBase
          placeholder="ابحث باسم صاحب السلفة..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: isSmallScreen ? "100%" : "280px",
            borderRadius: "6px",
            p: isSmallScreen ? 1 : 0.5,
            ...transparentSearchInputBaseSx,
          }}
        />
      </Box>

      <Paper sx={{ flex: 1, width: "100%", overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress size={40} />
          </Box>
        ) : smallLoansData?.data?.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد سلف صغيرة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              لم يتم العثور على أي سلف صغيرة
            </Typography>
          </Box>
        ) : (
          <>
            {isSmallScreen ? renderMobileLoanCards() : (
              <TableContainer sx={{ maxHeight: "100%" }}>
                {renderDesktopTable()}
              </TableContainer>
            )}
          </>
        )}
      </Paper>

      {showPagination && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          p: isSmallScreen ? 1 : 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          {isSmallScreen ? (
            <TablePagination
              component="div"
              count={smallLoansData.total || 0}
              page={page - 1}
              onPageChange={handleChangePage}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
              labelDisplayedRows={({ from, to, count }) =>
                `عرض ${from}-${to} من ${count}`
              }
              labelRowsPerPage="صفوف لكل صفحة:"
            />
          ) : (
            <TablePagination
              component="div"
              count={smallLoansData.total || 0}
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

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLoanToDelete(null);
        }}
        onConfirm={() => handleDeleteLoan(loanToDelete?.id)}
        title="حذف السلفة الصغيرة"
        message={`هل أنت متأكد من حذف سلفة ${loanToDelete?.Name}؟`}
        ButtonText="حذف"
      />

      <Dialog
        open={isPayModalOpen}
        onClose={handleClosePayModal}
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
            سداد الدفعة - {selectedLoanForPayment?.Name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="مبلغ الدفعة"
                value={paymentData.amount}
                onChange={(e) => handlePaymentInputChange("amount", e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "56px",
                    width: "250px",
                    backgroundColor: "background.paper",
                  },
                }}
                placeholder="أدخل مبلغ الدفعة"
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "+") {
                    e.preventDefault();
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="الملاحظات"
                value={paymentData.notes}
                onChange={(e) => handlePaymentInputChange("notes", e.target.value)}
                multiline
                rows={1}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "background.paper",
                    width: "250px",
                  },
                }}
                placeholder="أدخل الملاحظات (اختياري)"
              />
            </Grid>
            {selectedLoanForPayment && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: "action.disabledBackground", borderRadius: 1, width: "250px",height: "56px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    معلومات السلفة:
                  </Typography>
                  <Typography variant="body2">
                    المبلغ المتبقي: {formatAmount(selectedLoanForPayment.remaining)}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
          <Button
            onClick={handleClosePayModal}
            variant="outlined"
          >
            إلغاء
          </Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            disabled={!paymentData.amount || isPayLoading}
            sx={{ mr: 1 }}
          >
            {isPayLoading ? "جاري سداد الدفعة..." : "سداد الدفعة"}
          </Button>
        </DialogActions>
      </Dialog>


      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedLoanForMenu?.status === "OPEN" && (
          <MenuItem
            onClick={() => {
              if (onEditLoan) {
                onEditLoan(selectedLoanForMenu);
              }
              handleMenuClose();
            }}
            sx={{ color: "#FF9800", fontWeight: 'bold', fontSize: '0.875rem' }}
          >
            <Edit fontSize="small" sx={{ mr: 1, color: "#FF9800" }} />
            تعديل السلفة
          </MenuItem>
        )}


        <MenuItem
          onClick={() => {
            if (selectedLoanForMenu?.status === "PAID") return;
            handleOpenPayModal(selectedLoanForMenu);
            handleMenuClose();
          }}
          disabled={selectedLoanForMenu?.status === "PAID"}
          sx={{
            color: selectedLoanForMenu?.status === "PAID" ? "#9E9E9E" : "#2E7D32",
            fontWeight: 'bold',
            fontSize: '0.875rem',
            opacity: selectedLoanForMenu?.status === "PAID" ? 0.5 : 1,
            cursor: selectedLoanForMenu?.status === "PAID" ? "not-allowed" : "pointer"
          }}
        >
          <Payment fontSize="small" sx={{ mr: 1, color: selectedLoanForMenu?.status === "PAID" ? "#9E9E9E" : "#2E7D32" }} />
          سداد الدفعة
        </MenuItem>

          <MenuItem
            onClick={() => {
              setLoanToDelete(selectedLoanForMenu);
              setIsDeleteModalOpen(true);
              handleMenuClose();
            }}
            sx={{ color: "#D32F2F", fontWeight: 'bold', fontSize: '0.875rem' }}
          >
            <Delete fontSize="small" sx={{ mr: 1, color: "#D32F2F" }} />
            حذف السلفة
          </MenuItem>
      </Menu>
    </Box>
  );
};

export default SmallLoansTable;