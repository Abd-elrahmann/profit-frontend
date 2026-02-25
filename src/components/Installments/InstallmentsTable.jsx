import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableContainer,
  Box,
  Typography,
  Chip,
  IconButton,
  Checkbox,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  StyledTableCell,
  StyledTableRow,
  ScrollableTableContainer,
} from '../layouts/tableLayout';
import {
  getStatusColor,
  getStatusText,
  hasPendingDocuments,
} from './installmentsUtils';

export default function InstallmentsTable({
  installments,
  selectedInstallments,
  activeInstallmentId,
  permissions,
  isSettlementCompleted,
  onRowClick,
  onInstallmentSelect,
  onSelectAll,
  onMenuOpen,
  shouldDisableActions,
}) {
  const paidCount = installments.filter(
    (inst) => inst.status === 'PAID' || inst.status === 'EARLY_PAID'
  ).length;
  const totalAmount = installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
  const totalPaid = installments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
  const totalRemaining = installments.reduce((sum, inst) => sum + (inst.remaining || 0), 0);
  const showCheckbox = permissions.includes('repayments_Post') && !isSettlementCompleted();

  return (
    <ScrollableTableContainer>
      <Table stickyHeader size="small">
        <TableHead>
          <StyledTableRow>
            {showCheckbox && (
              <StyledTableCell
                align="center"
                sx={{ whiteSpace: 'nowrap', width: '40px', px: 0.5, py: 1 }}
              >
                <Checkbox
                  checked={
                    selectedInstallments.length === installments.length && installments.length > 0
                  }
                  indeterminate={
                    selectedInstallments.length > 0 &&
                    selectedInstallments.length < installments.length
                  }
                  onChange={onSelectAll}
                  size="small"
                  sx={{
                    color: 'white',
                    '&.Mui-checked': { color: 'white' },
                    padding: 0,
                  }}
                />
              </StyledTableCell>
            )}
            <StyledTableCell align="center" sx={{ width: '50px', px: 0.5, py: 1 }}>
              ✓
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '60px', px: 0.5, py: 1 }}>
              #رقم
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '90px', px: 0.5, py: 1 }}>
              تاريخ الاستحقاق
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '80px', px: 0.5, py: 1 }}>
              الدفعة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '80px', px: 0.5, py: 1 }}>
              الأصل
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '70px', px: 0.5, py: 1 }}>
              الفائدة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '80px', px: 0.5, py: 1 }}>
              المدفوع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '70px', px: 0.5, py: 1 }}>
              الخصم
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '80px', px: 0.5, py: 1 }}>
              المتبقي
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '70px', px: 0.5, py: 1 }}>
              الحالة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '90px', px: 0.5, py: 1 }}>
              تاريخ الدفع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ width: '60px', px: 0.5, py: 1 }}>
              الإجراءات
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {installments.map((installment) => (
            <StyledTableRow
              key={installment.id}
              hover
              onClick={() => onRowClick(installment)}
              sx={{
                cursor: 'pointer',
                fontSize: '13px',
                border: hasPendingDocuments(installment) ? '2px solid' : 'none',
                borderColor: hasPendingDocuments(installment) ? 'primary.main' : 'transparent',
                borderLeft: hasPendingDocuments(installment) ? '4px solid' : 'none',
                borderLeftColor: hasPendingDocuments(installment) ? 'primary.main' : 'transparent',
                backgroundColor:
                  activeInstallmentId === installment.id
                    ? 'action.selected'
                    : hasPendingDocuments(installment)
                      ? 'action.selected'
                      : 'inherit',
                '&:hover': {
                  backgroundColor:
                    activeInstallmentId === installment.id
                      ? 'action.hover'
                      : hasPendingDocuments(installment)
                        ? 'action.selected'
                        : 'background.default',
                },
              }}
            >
              {showCheckbox && (
                <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
                  <Checkbox
                    checked={selectedInstallments.includes(installment.id)}
                    onChange={() => onInstallmentSelect(installment.id)}
                    size="small"
                    disabled={installment.status === 'COMPLETED'}
                    sx={{ padding: 0 }}
                  />
                </StyledTableCell>
              )}
              <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
                {(installment.status === 'PAID' || installment.status === 'EARLY_PAID') && (
                  <Checkbox checked size="small" sx={{ padding: 0 }} />
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
                {installment.count}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
                <Box sx={{ lineHeight: 1.2 }}>
                  <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                    {dayjs(installment.dueDate).format('DD/MM/YYYY')}
                  </Typography>
                  {installment.dueDateHijri && (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '11px', color: 'text.secondary' }}
                    >
                      {installment.dueDateHijri}
                    </Typography>
                  )}
                </Box>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ px: 0.5, py: 1, fontWeight: 500, fontSize: '13px' }}>
                {installment.amount?.toFixed(2)}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ px: 0.5, py: 1, fontWeight: 500, fontSize: '13px' }}>
                {installment.principalAmount?.toFixed(2) || '0.00'}
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{ px: 0.5, py: 1, color: 'primary.main', fontWeight: 500, fontSize: '13px' }}
              >
                {installment.interestAmount?.toFixed(2) || '0.00'}
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{
                  px: 0.5,
                  py: 1,
                  color: installment.paidAmount > 0 ? 'green' : 'red',
                  fontWeight: 500,
                  fontSize: '13px',
                }}
              >
                {installment.paidAmount > 0 ? `${installment.paidAmount.toFixed(2)}` : '0.00'}
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{
                  px: 0.5,
                  py: 1,
                  color: (installment.discount || 0) > 0 ? 'warning.main' : 'text.secondary',
                  fontWeight: 500,
                  fontSize: '13px',
                }}
              >
                {(installment.discount || 0) > 0 ? `${installment.discount.toFixed(2)}` : '0.00'}
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{
                  px: 0.5,
                  py: 1,
                  color: installment.remaining === 0 ? 'text.primary' : 'error.main',
                  fontWeight: 500,
                  fontSize: '13px',
                }}
              >
                {installment.remaining?.toFixed(2) || '0.00'}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
                <Chip
                  label={getStatusText(installment.status, installment)}
                  color={getStatusColor(installment.status, installment)}
                  size="small"
                  sx={{ fontSize: '11px', height: '24px' }}
                />
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
                <Box sx={{ lineHeight: 1.2 }}>
                  <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                    {installment.paymentDate
                      ? dayjs(installment.paymentDate).format('DD/MM/YYYY')
                      : 'لم يأتي بعد'}
                  </Typography>
                  {installment.paymentDateHijri && (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '11px', color: 'text.secondary' }}
                    >
                      {installment.paymentDateHijri}
                    </Typography>
                  )}
                </Box>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => onMenuOpen(e, installment)}
                  disabled={shouldDisableActions()}
                  sx={{
                    padding: 0.5,
                    opacity: shouldDisableActions() ? 0.5 : 1,
                    cursor: shouldDisableActions() ? 'not-allowed' : 'pointer',
                  }}
                >
                  <MoreVertIcon sx={{ fontSize: '18px' }} />
                </IconButton>
              </StyledTableCell>
            </StyledTableRow>
          ))}
          {/* صف الإجمالي */}
          <StyledTableRow
            sx={{
              backgroundColor: 'background.paper',
              fontSize: '13px',
              '& td': {
                fontWeight: 500,
                fontSize: '13px',
                borderTop: '2px solid',
                borderTopColor: 'divider',
                px: 0.5,
                py: 1,
              },
            }}
          >
            {showCheckbox && (
              <StyledTableCell align="center" sx={{ width: '40px' }} />
            )}
            <StyledTableCell align="center" sx={{ width: '50px' }}>
              {paidCount > 0 && (
                <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                  {paidCount}
                </Typography>
              )}
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                الإجمالي
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center">-</StyledTableCell>
            <StyledTableCell align="center">
              <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                {totalAmount.toFixed(2)}
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                {installments
                  .reduce((sum, inst) => sum + (inst.principalAmount || 0), 0)
                  .toFixed(2)}
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography
                variant="body2"
                sx={{ fontSize: '13px', fontWeight: 500, color: 'primary.main' }}
              >
                {installments
                  .reduce((sum, inst) => sum + (inst.interestAmount || 0), 0)
                  .toFixed(2)}
              </Typography>
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ color: 'green', fontWeight: 500, fontSize: '13px' }}
            >
              {totalPaid.toFixed(2)}
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography
                variant="body2"
                sx={{ fontSize: '13px', fontWeight: 500, color: 'warning.main' }}
              >
                {installments
                  .reduce((sum, inst) => sum + (inst.discount || 0), 0)
                  .toFixed(2)}
              </Typography>
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ color: 'red', fontWeight: 500, fontSize: '13px' }}
            >
              {totalRemaining.toFixed(2)}
            </StyledTableCell>
            <StyledTableCell align="center">-</StyledTableCell>
            <StyledTableCell align="center">-</StyledTableCell>
            <StyledTableCell align="center">-</StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </ScrollableTableContainer>
  );
}
