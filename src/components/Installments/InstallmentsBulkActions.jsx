import React from 'react';
import { Paper, Stack, Typography, Button, Alert } from '@mui/material';
import { Check as ApproveIcon, Close as RejectIcon } from '@mui/icons-material';

export default function InstallmentsBulkActions({
  selectedCount,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  isLoading,
  canApprove,
}) {
  return (
    <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          تم اختيار {selectedCount} دفعة
        </Typography>
        <Stack direction="row" sx={{ gap: 2 }}>
          {canApprove && (
            <Button
              variant="contained"
              size="small"
              startIcon={<ApproveIcon sx={{ marginLeft: '6px' }} />}
              onClick={onBulkApprove}
              disabled={isLoading}
              sx={{
                bgcolor: 'success.main',
                '&:hover': { bgcolor: 'success.dark' },
                height: '32px',
                fontSize: '13px',
              }}
            >
              إنشاء إيصال سداد مجمع
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RejectIcon sx={{ marginLeft: '6px' }} />}
            onClick={onBulkReject}
            disabled={isLoading}
            sx={{
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' },
              height: '32px',
              fontSize: '13px',
            }}
          >
            رفض الدفعات المحددة
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onClearSelection}
            disabled={isLoading}
            sx={{ height: '32px', fontSize: '13px' }}
          >
            إلغاء اختيار الدفعات المحددة
          </Button>
        </Stack>
      </Stack>
      {isLoading && (
        <Alert severity="info" sx={{ mt: 1 }}>
          جاري معالجة العملية...
        </Alert>
      )}
    </Paper>
  );
}
