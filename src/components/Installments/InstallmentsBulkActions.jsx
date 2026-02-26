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
  isSmallScreen = false,
  isMobile = false,
}) {
  const btnHeight = isMobile ? '32px' : '38px';
  return (
    <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stack
        direction={isSmallScreen ? 'column' : 'row'}
        spacing={1.5}
        alignItems={isSmallScreen ? 'stretch' : 'center'}
        sx={{ gap: 1.5 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: isSmallScreen ? 'center' : 'inherit' }}>
          تم اختيار {selectedCount} دفعة
        </Typography>
        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent={isSmallScreen ? 'center' : 'flex-start'}
          sx={{ gap: isSmallScreen ? 1 : 2 }}
        >
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
                height: btnHeight,
                fontSize: isMobile ? '13px' : '14px',
              }}
            >
              {isSmallScreen ? 'إيصال مجمع' : 'إنشاء إيصال سداد مجمع'}
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
              height: btnHeight,
              fontSize: isMobile ? '13px' : '14px',
            }}
          >
            {isSmallScreen ? 'رفض' : 'رفض الدفعات المحددة'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onClearSelection}
            disabled={isLoading}
            sx={{ height: btnHeight, fontSize: isMobile ? '13px' : '14px' }}
          >
            {isSmallScreen ? 'إلغاء' : 'إلغاء اختيار الدفعات المحددة'}
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
