import React from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { PictureAsPdf, TableChart } from "@mui/icons-material";
import {
  StyledTableCell,
  StyledTableRow,
} from "../layouts/tableLayout";
import { formatDate } from "./clientsUtils";

export default function ClientsStatementTab({
  clientStatement,
  fromDate,
  toDate,
  permissions,
  isDarkMode,
  onDateFilterChange,
  onExportPDF,
  onExportExcel,
}) {
  const transactions = clientStatement?.transactions || [];
  const hasTransactions = transactions.length > 0;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf sx={{ marginLeft: "10px" }} />}
              onClick={onExportPDF}
              disabled={!clientStatement}
              sx={{
                borderColor: "#d32f2f",
                color: "#d32f2f",
                "&:hover": {
                  borderColor: "#b71c1c",
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
              }}
            >
              تصدير PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<TableChart sx={{ marginLeft: "10px" }} />}
              onClick={onExportExcel}
              disabled={!clientStatement}
              sx={{
                borderColor: "#2e7d32",
                color: "#2e7d32",
                "&:hover": {
                  borderColor: "#1b5e20",
                  backgroundColor: "rgba(46, 125, 50, 0.04)",
                },
              }}
            >
              تصدير Excel
            </Button>
          </Box>
        )}
      </Box>

      {clientStatement && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: isDarkMode ? "background.paper" : "#f8f9fa",
          }}
        >
          <Grid
            container
            spacing={6}
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                إجمالي المدين
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="error">
                {clientStatement.client?.debit?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                إجمالي الدائن
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="success.main"
              >
                {clientStatement.client?.credit?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                الرصيد الحالي
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {clientStatement.client?.balance?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                عدد المعاملات
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="info.main">
                {clientStatement.totalTransactions || 0}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="كشف حساب العميل">
            <TableHead>
              <TableRow>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", minWidth: 120 }}
                >
                  التاريخ
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", minWidth: 100 }}
                >
                  المرجع
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", minWidth: 200 }}
                >
                  الوصف
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", minWidth: 120 }}
                >
                  مدين
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", minWidth: 120 }}
                >
                  دائن
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{ fontWeight: "bold", minWidth: 120 }}
                >
                  الرصيد
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hasTransactions ? (
                transactions.map((transaction) => (
                  <StyledTableRow key={transaction.id} hover>
                    <StyledTableCell align="center">
                      {formatDate(transaction.date)}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Typography variant="body2" fontWeight="500">
                        {transaction.reference}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {transaction.description}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{
                        color:
                          transaction.debit > 0
                            ? "error.main"
                            : "text.primary",
                      }}
                    >
                      {transaction.debit > 0
                        ? transaction.debit.toLocaleString()
                        : 0}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{
                        color:
                          transaction.credit > 0
                            ? "success.main"
                            : "text.primary",
                      }}
                    >
                      {transaction.credit > 0
                        ? transaction.credit.toLocaleString()
                        : 0}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold" }}
                    >
                      {transaction.balance.toLocaleString()}
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      لا توجد معاملات
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {hasTransactions && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderTop: "1px solid #e0e0e0",
              bgcolor: isDarkMode ? "background.paper" : "#fafafa",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              إجمالي المعاملات:{" "}
              {clientStatement.totalTransactions || transactions.length}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
