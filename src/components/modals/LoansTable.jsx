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
} from "@mui/material";
import {
  Visibility,
  Delete,
  PlayArrow,
  Schedule,
  Pause,
  MoreVert,
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

const LoansTable = ({ onViewDetails, onViewInstallments }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLoanForMenu, setSelectedLoanForMenu] = useState(null);

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
          p: 2,
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
            width: "280px",
            borderRadius: "6px",
          }}
        />
      </Box>

      {/* Table */}
      <Paper sx={{ flex: 1, width: "100%", overflow: "hidden" }}>
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
                  معدل الفائدة
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  المدة
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
                  <StyledTableCell colSpan={12} align="center">
                    <CircularProgress size={20} />
                  </StyledTableCell>
                </StyledTableRow>
              ) : loansData?.data?.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={12} align="center">
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
                      {loan.amount?.toLocaleString()} ر.س
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
                      {loan.durationMonths} شهر
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
      </Paper>
      {/* Pagination */}
      {loansData && (
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

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* View Loan Details */}
        <MenuItem
          onClick={() => {
            onViewDetails(selectedLoanForMenu?.id);
            handleMenuClose();
          }}
          sx={{ color: "#1976D2" }} // Blue
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
          sx={{ color: "#2E7D32" }} // Green
        >
          <ListItemIcon>
            <Schedule fontSize="small" sx={{ color: "#2E7D32" }} />
          </ListItemIcon>
          عرض الأقساط
        </MenuItem>

        {/* Activate Loan (PENDING) */}
        {selectedLoanForMenu?.status === "PENDING" && (
          <MenuItem
            onClick={() => {
              handleActivateLoan(selectedLoanForMenu?.id);
              handleMenuClose();
            }}
            sx={{ color: "#FB8C00" }} // Orange
          >
            <ListItemIcon>
              <PlayArrow fontSize="small" sx={{ color: "#FB8C00" }} />
            </ListItemIcon>
            تفعيل السلفة
          </MenuItem>
        )}

        {/* Deactivate Loan (ACTIVE) */}
        {selectedLoanForMenu?.status === "ACTIVE" && (
          <MenuItem
            onClick={() => {
              handleDeactivateLoan(selectedLoanForMenu?.id);
              handleMenuClose();
            }}
            sx={{ color: "#8E24AA" }} // Purple
          >
            <ListItemIcon>
              <Pause fontSize="small" sx={{ color: "#8E24AA" }} />
            </ListItemIcon>
            إلغاء تفعيل السلفة
          </MenuItem>
        )}

        {/* Delete Loan */}
        {selectedLoanForMenu?.status !== "ACTIVE" && (
          <MenuItem
            onClick={() => {
              setLoanToDelete(selectedLoanForMenu);
              setIsDeleteModalOpen(true);
              handleMenuClose();
            }}
            sx={{ color: "#D32F2F" }} // Red
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
