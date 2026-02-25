import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Pagination,
  Button,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Visibility } from "@mui/icons-material";
import dayjs from "dayjs";
import {
  ScrollableTableContainer,
  StyledTableCell,
  StyledTableRow,
} from "../layouts/tableLayout";
import { getStatusColor, getStatusText, getTypeText, getSourceText } from "./clientsUtils";

export default function ClientsLoansTab({
  clientLoans,
  loansPage,
  permissions,
  isDarkMode,
  onLoansPageChange,
  onViewLoanDetails,
}) {
  const loans = clientLoans?.data || [];
  const hasLoans = loans.length > 0;
  const totalPages = clientLoans?.totalPages || 1;
  const total = clientLoans?.total || 0;

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={3}>
          سلفات العميل
        </Typography>

        {hasLoans ? (
          <Box>
            <ScrollableTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      كود السلفة
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      الشريك
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      الكفيل
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      الحساب البنكي
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      مصدر السلفة
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      مبلغ السلفة
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      مبلغ الدفعة
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      الفائدة
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      النوع / يوم الاستحقاق
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      الحالة
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      تاريخ الإنشاء
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 120 }}
                    >
                      تاريخ الانتهاء
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{ fontWeight: "bold", minWidth: 80 }}
                    >
                      عرض التفاصيل
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.map((loan) => (
                    <StyledTableRow key={loan.id} hover>
                      <StyledTableCell align="center">
                        <Typography variant="body2" fontWeight="500">
                          {loan.code}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {loan.partner?.name || "-"}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {loan.kafeel?.name || "-"}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {loan.bankAccount?.name || "-"}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {getSourceText(loan.source)}
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                        {loan.amount?.toLocaleString()}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {loan.paymentAmount?.toLocaleString()}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {loan.interestAmount?.toLocaleString()} (
                        {loan.interestRate}%)
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Stack spacing={0.25} sx={{ whiteSpace: "nowrap" }}>
                          <Typography variant="body2">
                            {getTypeText(loan.type)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "14px" }}
                          >
                            يوم الاستحقاق: {loan.repaymentDay}
                          </Typography>
                        </Stack>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Chip
                          label={getStatusText(loan.status)}
                          color={getStatusColor(loan.status)}
                          size="small"
                          variant="outlined"
                        />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {dayjs(loan.createdAt).format("DD/MM/YYYY")}
                          </Typography>
                          {loan.createdAtHijri && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {loan.createdAtHijri}
                            </Typography>
                          )}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Box>
                          {loan.status === "COMPLETED" && loan.endDate ? (
                            <>
                              <Typography variant="body2" fontWeight="bold">
                                {dayjs(loan.endDate).format("DD/MM/YYYY")}
                              </Typography>
                              {loan.endDateHijri && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
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
                      <StyledTableCell align="center">
                        {permissions.includes("loans_View") && (
                          <IconButton
                            size="small"
                            onClick={() => onViewLoanDetails(loan.id)}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                backgroundColor: "rgba(13, 64, 165, 0.1)",
                              },
                            }}
                            title="عرض التفاصيل"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        )}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollableTableContainer>

            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  borderTop: "1px solid #e0e0e0",
                  bgcolor: isDarkMode ? "background.paper" : "#fafafa",
                  mt: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  عرض {(loansPage - 1) * 10 + 1} -{" "}
                  {Math.min(loansPage * 10, total)} من {total} سلفة
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ChevronRight />}
                    disabled={loansPage === 1}
                    onClick={() => onLoansPageChange(null, loansPage - 1)}
                    sx={{
                      minWidth: "70px",
                      fontSize: "0.75rem",
                      "&:disabled": { opacity: 0.5 },
                    }}
                  >
                    السابق
                  </Button>
                  <Pagination
                    count={totalPages}
                    page={loansPage}
                    onChange={onLoansPageChange}
                    color="primary"
                    size="small"
                    siblingCount={0}
                    boundaryCount={1}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: "0.75rem",
                        minWidth: "28px",
                        height: "28px",
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ChevronLeft />}
                    disabled={loansPage === totalPages}
                    onClick={() => onLoansPageChange(null, loansPage + 1)}
                    sx={{
                      minWidth: "70px",
                      fontSize: "0.75rem",
                      "&:disabled": { opacity: 0.5 },
                    }}
                  >
                    التالي
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              لا توجد سلفات لهذا العميل
            </Typography>
          </Paper>
        )}
      </Paper>
    </Box>
  );
}
