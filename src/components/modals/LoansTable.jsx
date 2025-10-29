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
} from "@mui/material";
import {
  Visibility,
  Delete,
  PlayArrow,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLoans, deleteLoan, activateLoan } from '../../pages/Loans/loanApis';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import DeleteModal from '../../components/modals/DeleteModal';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import dayjs from 'dayjs';
const LoansTable = ({ onViewDetails }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: loansData, isLoading } = useQuery({
    queryKey: ['loans', page, searchQuery],
    queryFn: () => getLoans(page, searchQuery),
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
      notifySuccess('تم حذف السلفة بنجاح');
      queryClient.invalidateQueries(['loans']);
      setIsDeleteModalOpen(false);
      setLoanToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء حذف السلفة');
    }
  };

  const handleActivateLoan = async (loanId) => {
    try {
      await activateLoan(loanId);
      notifySuccess('تم تفعيل السلفة بنجاح');
      queryClient.invalidateQueries(['loans']);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تفعيل السلفة');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'DEFAULTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'قيد المراجعة';
      case 'ACTIVE':
        return 'نشط';
      case 'COMPLETED':
        return 'مكتمل';
      case 'DEFAULTED':
        return 'متأخر';
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'DAILY':
        return 'يومي';
      case 'WEEKLY':
        return 'أسبوعي';
      case 'MONTHLY':
        return 'شهري';
      default:
        return type;
    }
  };

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      {/* Search Bar */}
      <Box sx={{ p: 2 }}>
        <InputBase
          placeholder="ابحث باسم العميل أو رقم السلفة..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: '280px',
            borderRadius: '6px',
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>#</StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>العميل</StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>مبلغ السلفة</StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>معدل الفائدة</StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>المدة</StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>النوع</StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}> يوم الاستحقاق</StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>الحالة</StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>تاريخ البدء</StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>الإجراءات</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={10} align="center">
                  <CircularProgress size={20} />
                </StyledTableCell>
              </StyledTableRow>
            ) : loansData?.data?.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={10} align="center">
                  <Typography>لا توجد سلف</Typography>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              loansData?.data?.map((loan, index) => (
                <StyledTableRow key={loan.id} hover>
                  <StyledTableCell>{(page - 1) * 10 + index + 1}</StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    {loan.client?.name}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap',fontWeight: 'bold' }}>{loan.amount?.toLocaleString()} ر.س</StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{loan.interestRate}%</StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{loan.durationMonths} شهر</StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{getTypeText(loan.type)}</StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{loan.repaymentDay}</StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Chip 
                      label={getStatusText(loan.status)} 
                      color={getStatusColor(loan.status)}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    {dayjs(loan.startDate).format('DD/MM/YYYY')}
                  </StyledTableCell>
                  <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onViewDetails(loan.id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      
                      {loan.status === 'PENDING' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleActivateLoan(loan.id)}
                        >
                          <PlayArrow fontSize="small" />
                        </IconButton>
                      )}
                      
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setLoanToDelete(loan);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
    </Paper>
  );
};

export default LoansTable;