import React from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Pagination,
  Typography,
  IconButton,
  Chip,
  Skeleton,
  Card,
  CardContent,
  Stack,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import { formatArabicDate, getTransactionTypeText, getTransactionTypeColor } from "./investorsUtils";


const TransactionsTab = ({
  transactionsData,
  isLoading,
  transactionsPage,
  onPageChange,
  onAddTransaction,
  onDeleteTransaction,
  permissions,
  isDarkMode,
  isMobile = false,
}) => {
  const transactions = transactionsData?.transactions || [];
  const hasTransactions = transactions.length > 0;

  const renderTable = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        {permissions.includes("partners_Add") && (
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ marginLeft: '10px' }} />}
            onClick={onAddTransaction}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              fontWeight: "bold",
            }}
          >
            إضافة عملية مالية
          </Button>
        )}
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: isDarkMode ? 'background.default' : 'grey.50' }}>
              <StyledTableRow>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>رقم المرجع</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>نوع العملية</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>المبلغ</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>التاريخ</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الإجراءات</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <>
                  {[...Array(3)].map((_, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell><Skeleton height={40} /></StyledTableCell>
                      <StyledTableCell><Skeleton height={40} /></StyledTableCell>
                      <StyledTableCell><Skeleton height={40} /></StyledTableCell>
                      <StyledTableCell><Skeleton height={40} /></StyledTableCell>
                      <StyledTableCell><Skeleton height={40} /></StyledTableCell>
                    </StyledTableRow>
                  ))}
                </>
              ) : transactionsData?.transactions?.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={5} align="center">
                    <Typography>لا توجد عمليات مالية</Typography>
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                transactionsData?.transactions?.map((transaction) => (
                  <StyledTableRow key={transaction.id} hover>
                    <StyledTableCell align="center">{transaction.reference}</StyledTableCell>
                    <StyledTableCell align="center">
                      <Chip
                        label={getTransactionTypeText(transaction.type)}
                        color={getTransactionTypeColor(transaction.type)}
                        size="small"
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{
                      color: transaction.type === "DEPOSIT" ? "success.main" : "error.main",
                      fontWeight: "bold"
                    }}>
                      {transaction.amount?.toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                          {formatArabicDate(transaction.date)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {transaction.dateHijri}
                        </Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {permissions.includes("partners_Delete") && (
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => onDeleteTransaction(transaction)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {transactionsData && transactionsData.totalPages > 1 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 2, 
            borderTop: '1px solid #eee',
          }}>
            <Pagination
              count={transactionsData.totalPages}
              page={transactionsPage}
              onChange={onPageChange}
              color="primary"
              size="small"
              siblingCount={1}
              boundaryCount={1}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );

  const renderCards = () => (
    <Box>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        {permissions.includes("partners_Add") && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddTransaction}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              fontWeight: "bold",
            }}
          >
            إضافة عملية مالية
          </Button>
        )}
      </Box>
      {isLoading ? (
        <Stack spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Card key={i} sx={{ p: 2 }}>
              <Skeleton height={60} />
            </Card>
          ))}
        </Stack>
      ) : hasTransactions ? (
        <Stack spacing={2}>
          {transactions.map((t) => (
            <Card
              key={t.id}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight="600">
                      {t.reference}
                    </Typography>
                    <Chip
                      label={getTransactionTypeText(t.type)}
                      color={getTransactionTypeColor(t.type)}
                      size="small"
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">المبلغ</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={t.type === "DEPOSIT" ? "success.main" : "error.main"}
                    >
                      {t.amount?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">التاريخ</Typography>
                    <Typography variant="body2">{formatArabicDate(t.date)}</Typography>
                  </Box>
                  {permissions.includes("partners_Delete") && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => onDeleteTransaction(t)}
                      sx={{ alignSelf: "flex-start", mt: 1 }}
                    >
                      حذف
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">لا توجد عمليات مالية</Typography>
        </Paper>
      )}
      {hasTransactions && transactionsData?.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={transactionsData.totalPages}
            page={transactionsPage}
            onChange={onPageChange}
            color="primary"
            size="small"
          />
        </Box>
      )}
    </Box>
  );

  return isMobile ? renderCards() : renderTable();
};

export default TransactionsTab;
