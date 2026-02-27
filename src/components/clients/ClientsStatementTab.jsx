import React from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Button,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack,
} from "@mui/material";
import { PictureAsPdf, TableChart } from "@mui/icons-material";
import {
  StyledTableCell,
  StyledTableRow,
} from "../layouts/tableLayout";
import { formatDate, numberToArabicWords } from "./clientsUtils";

const SYSTEM_GREEN = "#2E8B45";

const getRepaymentStatusText = (status) => {
  const textMap = {
    PENDING: "قيد الانتظار",
    COMPLETED: "مكتمل",
    PAID: "مدفوع",
    PARTIAL_PAID: "مدفوع جزئياً",
    OVERDUE: "متأخر",
    EARLY_PAID: "مدفوع مبكراً",
  };
  return textMap[status] || status;
};

export default function ClientsStatementTab({
  clientStatement,
  clientDetails,
  fromDate,
  toDate,
  permissions,
  isDarkMode,
  isMobile = false,
  onDateFilterChange,
  onExportPDF,
  onExportExcel,
  statementPage,
  onStatementPageChange,
}) {
  const repayments = clientStatement?.repayments || [];
  const hasRepayments = repayments.length > 0;
  const totalRepayments = clientStatement?.totalRepayments || 0;
  const totalPages = Math.ceil(totalRepayments / 20) || 1;

  const renderTable = () => (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            label="من تاريخ"
            type="date"
            value={fromDate}
            onChange={(e) => onDateFilterChange("from", e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: 150 }}
          />
          <TextField
            label="إلى تاريخ"
            type="date"
            value={toDate}
            onChange={(e) => onDateFilterChange("to", e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: 150 }}
          />
        </Box>
        {permissions.includes("clients_Export") && (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdf sx={{ marginLeft: "10px" }} />}
              onClick={onExportPDF}
              disabled={!clientStatement}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": {
                  borderColor: "error.dark",
                  backgroundColor: "rgba(211, 47, 47, 0.08)",
                },
              }}
            >
              تصدير PDF
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TableChart sx={{ marginLeft: "10px" }} />}
              onClick={onExportExcel}
              disabled={!clientStatement}
              sx={{
                borderColor: SYSTEM_GREEN,
                color: SYSTEM_GREEN,
                "&:hover": {
                  borderColor: "#256B36",
                  backgroundColor: "rgba(46, 139, 69, 0.08)",
                },
              }}
            >
              تصدير Excel
            </Button>
          </Box>
        )}
      </Box>

      {clientStatement && (
        <>
          <div
            className={`p-4 sm:p-6 mb-6 rounded-xl border-r-4 border-r-primary shadow-sm ${
              isDarkMode ? "bg-[#141e16]" : "bg-[#f8f9fa]"
            }`}
          >
            <h3 className="text-lg font-bold text-primary mb-2 text-center">
              كشف حساب - {clientDetails?.client?.name || clientStatement.client?.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
              من تاريخ: {fromDate || "—"} إلى تاريخ: {toDate || "—"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">إجمالي المدين</p>
                <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                  {(clientStatement.client?.debit || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">إجمالي الدائن</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {(clientStatement.client?.credit || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">الرصيد الحالي</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {(clientStatement.client?.balance || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">عدد المعاملات</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {clientStatement.totalTransactions || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">الدفعات المدفوعة</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {clientStatement.paidRepaymentsCount || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">المتبقي</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {(clientStatement.totalRemainingAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>
            {(clientStatement.client?.balance || 0) > 0 && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-base font-bold text-primary">
                  مدين/عليه {numberToArabicWords(clientStatement.client?.balance || 0)} ريال سعودي
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="جدول الدفعات">
            <TableHead>
              <TableRow sx={{ bgcolor: `${SYSTEM_GREEN}15` }}>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", minWidth: 60 }}>
                  #
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", minWidth: 90 }}>
                  رقم السلفة
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", minWidth: 110 }}>
                  تاريخ الاستحقاق
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", minWidth: 90 }}>
                  المبلغ
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", minWidth: 90 }}>
                  المدفوع
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", minWidth: 90 }}>
                  المتبقي
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", minWidth: 100 }}>
                  الحالة
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold", minWidth: 110 }}>
                  تاريخ الدفع
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hasRepayments ? (
                repayments.map((repayment) => (
                  <StyledTableRow key={repayment.id} hover>
                    <StyledTableCell align="center">{repayment.count}</StyledTableCell>
                    <StyledTableCell align="center">{repayment.loanCode || repayment.loanId}</StyledTableCell>
                    <StyledTableCell align="center">
                      {typeof repayment.dueDate === "string"
                        ? repayment.dueDate.split(" ")[0]
                        : formatDate(repayment.dueDate)}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {(repayment.amount || 0).toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {(repayment.paidAmount || 0).toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {(repayment.remaining || 0).toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {getRepaymentStatusText(repayment.status)}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {repayment.paymentDate
                        ? (typeof repayment.paymentDate === "string"
                            ? repayment.paymentDate
                            : formatDate(repayment.paymentDate)
                          ).split(" ")[0]
                        : "—"}
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      لا توجد دفعات
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {hasRepayments && totalRepayments > 20 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: isDarkMode ? "background.paper" : "#fafafa",
            }}
          >
            <Pagination
              count={totalPages}
              page={statementPage}
              onChange={(e, p) => onStatementPageChange(e, p)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
    </Box>
  );

  const renderCards = () => (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            label="من تاريخ"
            type="date"
            value={fromDate}
            onChange={(e) => onDateFilterChange("from", e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 120, flex: 1 }}
          />
          <TextField
            label="إلى تاريخ"
            type="date"
            value={toDate}
            onChange={(e) => onDateFilterChange("to", e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 120, flex: 1 }}
          />
        </Box>
        {permissions.includes("clients_Export") && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdf />}
              onClick={onExportPDF}
              disabled={!clientStatement}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.08)" },
              }}
            >
              PDF
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TableChart />}
              onClick={onExportExcel}
              disabled={!clientStatement}
              sx={{
                borderColor: SYSTEM_GREEN,
                color: SYSTEM_GREEN,
                "&:hover": { backgroundColor: "rgba(46, 139, 69, 0.08)" },
              }}
            >
              Excel
            </Button>
          </Box>
        )}
      </Box>

      {clientStatement && (
        <div
          className={`p-4 mb-6 rounded-xl border-r-4 border-r-primary shadow-sm ${
            isDarkMode ? "bg-[#141e16]" : "bg-[#f8f9fa]"
          }`}
        >
          <h3 className="text-base font-bold text-primary mb-4 text-center">
            كشف حساب - {clientDetails?.client?.name || clientStatement.client?.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#141e16] p-4 rounded-xl border border-primary/10 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">إجمالي المدين</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {(clientStatement.client?.debit || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-[#141e16] p-4 rounded-xl border border-primary/10 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">إجمالي الدائن</p>
              <p className="text-lg font-bold text-primary">
                {(clientStatement.client?.credit || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-[#141e16] p-4 rounded-xl border border-primary/10 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">الرصيد الحالي</p>
              <p className="text-lg font-bold text-primary">
                {(clientStatement.client?.balance || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-[#141e16] p-4 rounded-xl border border-primary/10 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">عدد المعاملات</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {clientStatement.totalTransactions || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-[#141e16] p-4 rounded-xl border border-primary/10 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">الدفعات المدفوعة</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {clientStatement.paidRepaymentsCount || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-[#141e16] p-4 rounded-xl border border-primary/10 shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">المتبقي</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {(clientStatement.totalRemainingAmount || 0).toLocaleString()}
              </p>
            </div>
          </div>
          {(clientStatement.client?.balance || 0) > 0 && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-bold text-primary">
                مدين/عليه {numberToArabicWords(clientStatement.client?.balance || 0)} ريال سعودي
              </p>
            </div>
          )}
        </div>
      )}

      {hasRepayments ? (
        <Stack spacing={2}>
          {repayments.map((repayment) => (
            <Paper
              key={repayment.id}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRight: `3px solid ${SYSTEM_GREEN}`,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" fontWeight="600">
                  دفعة #{repayment.count} - سلفة {repayment.loanCode || repayment.loanId}
                </Typography>
                <Typography variant="body2" sx={{ color: SYSTEM_GREEN }}>
                  {getRepaymentStatusText(repayment.status)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                استحقاق: {typeof repayment.dueDate === "string" ? repayment.dueDate.split(" ")[0] : formatDate(repayment.dueDate)}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
                <Typography variant="body2">المبلغ: {(repayment.amount || 0).toLocaleString()}</Typography>
                <Typography variant="body2">المدفوع: {(repayment.paidAmount || 0).toLocaleString()}</Typography>
                <Typography variant="body2">المتبقي: {(repayment.remaining || 0).toLocaleString()}</Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            لا توجد دفعات
          </Typography>
        </Paper>
      )}
    </Box>
  );

  return isMobile ? renderCards() : renderTable();
}
