import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Checkbox,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  getStatusColor,
  getStatusText,
  hasPendingDocuments,
} from './installmentsUtils';

export default function InstallmentsCards({
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
  const totalDiscounts = installments.reduce((sum, inst) => sum + (inst.discount || 0), 0);
  const showCheckbox = permissions.includes('repayments_Post') && !isSettlementCompleted();

  return (
    <Box sx={{ p: 1 }}>
      {showCheckbox && installments.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            checked={selectedInstallments.length === installments.length && installments.length > 0}
            indeterminate={
              selectedInstallments.length > 0 && selectedInstallments.length < installments.length
            }
            onChange={onSelectAll}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            اختيار الكل
          </Typography>
        </Box>
      )}
      <Stack spacing={2}>
        {installments.map((installment) => (
          <Card
            key={installment.id}
            variant="outlined"
            sx={{
              borderRadius: 2,
              border: hasPendingDocuments(installment) ? '2px solid' : '1px solid',
              borderColor: hasPendingDocuments(installment) ? 'primary.main' : 'divider',
              borderLeft: hasPendingDocuments(installment) ? '4px solid' : 'none',
              borderLeftColor: hasPendingDocuments(installment) ? 'primary.main' : 'transparent',
              backgroundColor:
                activeInstallmentId === installment.id
                  ? 'action.selected'
                  : hasPendingDocuments(installment)
                    ? 'action.selected'
                    : 'inherit',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor:
                  activeInstallmentId === installment.id
                    ? 'action.hover'
                    : hasPendingDocuments(installment)
                      ? 'action.selected'
                      : 'background.default',
              },
            }}
            onClick={() => onRowClick(installment)}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {showCheckbox && (
                      <Checkbox
                        checked={selectedInstallments.includes(installment.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          onInstallmentSelect(installment.id);
                        }}
                        size="small"
                        disabled={installment.status === 'COMPLETED'}
                      />
                    )}
                    {(installment.status === 'PAID' || installment.status === 'EARLY_PAID') && (
                      <Checkbox checked size="small" />
                    )}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }} color="primary">
                        دفعة #{installment.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(installment.dueDate).format('DD/MM/YYYY')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 0.5,
                    }}
                  >
                    <Chip
                      label={getStatusText(installment.status, installment)}
                      color={getStatusColor(installment.status, installment)}
                      size="small"
                      sx={{ fontWeight: '500' }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMenuOpen(e, installment);
                      }}
                      disabled={shouldDisableActions()}
                      sx={{
                        opacity: shouldDisableActions() ? 0.5 : 1,
                        cursor: shouldDisableActions() ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      قيمة الدفعة
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {installment.amount?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      المبلغ الأصلي
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {installment.principalAmount?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      الفائدة
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                      {installment.interestAmount?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      المبلغ المدفوع
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: installment.paidAmount > 0 ? 'green' : 'red' }}
                    >
                      {installment.paidAmount > 0
                        ? `${installment.paidAmount.toFixed(2)}`
                        : '0.00'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      مبلغ الخصم
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: (installment.discount || 0) > 0 ? 'warning.main' : 'text.secondary',
                      }}
                    >
                      {(installment.discount || 0) > 0
                        ? `${installment.discount.toFixed(2)}`
                        : '0.00'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      الرصيد المتبقي
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color:
                          installment.remaining === 0 ? 'text.primary' : 'error.main',
                      }}
                    >
                      {installment.remaining?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  {installment.paymentDate && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        تاريخ الدفع
                      </Typography>
                      <Typography variant="body2">
                        {dayjs(installment.paymentDate).format('DD/MM/YYYY')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}

        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '2px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }} mb={1.5}>
              الإجمالي
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  الدفعات المدفوعة
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {paidCount}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  إجمالي الدفعات
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  إجمالي المدفوع
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'green' }}>
                  {totalPaid.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  إجمالي الخصم
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.main' }}>
                  {totalDiscounts.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  إجمالي المتبقي
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'red' }}>
                  {totalRemaining.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
