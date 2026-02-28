import React from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
  Collapse,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import { formatArabicDate } from './expensesUtils';
const ExpenseTypeChip = ({ type }) => (
  <Chip
    label={type}
    color={type === 'مصروف رواتب' ? 'primary' : 'default'}
    size="small"
    variant="outlined"
  />
);
const ExpensesTable = ({
  groupedExpenses,
  isLoading,
  page,
  limit,
  expandedRows,
  onToggleExpand,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
  isDeleting,
}) => (
  <TableContainer sx={{ maxHeight: 600, borderRadius: 2 }}>
    <Table stickyHeader>
      <TableHead>
        <StyledTableRow>
          <StyledTableCell align="center">#</StyledTableCell>
          <StyledTableCell align="center">التاريخ</StyledTableCell>
          <StyledTableCell align="center">عدد المصروفات</StyledTableCell>
          <StyledTableCell align="center">إجمالي المبلغ</StyledTableCell>
          <StyledTableCell align="center">مضافة بواسطة</StyledTableCell>
          <StyledTableCell align="center">الإجراءات</StyledTableCell>
        </StyledTableRow>
      </TableHead>
      <TableBody>
        {isLoading ? (
          <StyledTableRow>
            <StyledTableCell colSpan={6} align="center">
              <CircularProgress size={30} />
            </StyledTableCell>
          </StyledTableRow>
        ) : groupedExpenses.length === 0 ? (
          <StyledTableRow>
            <StyledTableCell colSpan={6} align="center">
              <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                لا توجد مصروفات
              </Typography>
            </StyledTableCell>
          </StyledTableRow>
        ) : (
          groupedExpenses.map((group, index) => (
            <React.Fragment key={group.journalId}>
              <StyledTableRow hover>
                <StyledTableCell align="center">
                  {(page - 1) * limit + index + 1}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                      {formatArabicDate(group.date)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {group.createdAtHijri}
                    </Typography>
                  </Box>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography variant="body2">{group.expenses.length}</Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    {group.totalAmount.toLocaleString('en-US')}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography variant="body2">{group.addedBy?.name || '-'}</Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      onClick={() => onToggleExpand(group.journalId)}
                      sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 1, fontWeight: 'bold' }}
                    >
                      {expandedRows.includes(group.journalId) ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                    </Button>
                    {canUpdate && (
                      <IconButton size="small" color="primary" onClick={() => onEdit(group)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(group.journalId)}
                        disabled={isDeleting}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </StyledTableCell>
              </StyledTableRow>
              <TableRow>
                <TableCell colSpan={6} sx={{ p: 0 }}>
                  <Collapse in={expandedRows.includes(group.journalId)} timeout="auto" unmountOnExit>
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        تفاصيل المصروفات - القيد #{group.journalId}
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">النوع</TableCell>
                            <TableCell align="center">المبلغ</TableCell>
                            <TableCell align="center">الوصف</TableCell>
                            <TableCell align="center">الموظف</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.expenses.map((expense, idx) => (
                            <TableRow key={idx}>
                              <TableCell align="center">
                                <ExpenseTypeChip type={expense.type} />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight="bold">
                                  {expense.amount.toLocaleString('en-US')}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">{expense.description || '-'}</Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {expense.employee?.name || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
);
export default React.memo(ExpensesTable);