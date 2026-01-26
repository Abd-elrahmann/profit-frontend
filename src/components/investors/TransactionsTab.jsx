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
}) => {
  return (
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
};

export default TransactionsTab;
