import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { formatNumber } from './profitDistributionUtils';
const ProfitDistributionConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  periodName,
  enableSaving,
  savingPercentage,
  savedAmount,
  isDistributing,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          توزيع الأرباح
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          هل أنت متأكد من توزيع أرباح الفترة &quot;{periodName}&quot;؟
        </Typography>
        {enableSaving && savingPercentage > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>ملاحظة:</strong> سيتم ادخار {savingPercentage.toFixed(2)}% من الأرباح قبل التوزيع
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              المبلغ المدخر: {formatNumber(savedAmount)} ({savingPercentage.toFixed(2)}%)
            </Typography>
          </Alert>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          سيتم إنشاء قيد محاسبي لتوزيع الأرباح على الشركاء
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1, flexDirection: 'row-reverse' }}>
        <Button onClick={onClose} disabled={isDistributing}>
          إلغاء
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="success"
          startIcon={<CheckIcon sx={{ marginLeft: '10px' }} />}
          disabled={isDistributing}
        >
          تأكيد التوزيع
          {isDistributing && (
            <CircularProgress size={16} color="inherit" style={{ marginLeft: 8 }} />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ProfitDistributionConfirmDialog;