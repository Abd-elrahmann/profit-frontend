import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Download, Print } from '@mui/icons-material';
import { isValidTemplate, injectContractData } from '../../utilities/sanitize';
import { preloadContractFonts } from '../../utilities/fontLoader';

const PartnerWithdrawVoucherPreview = ({
  open,
  onClose,
  voucherHtml,
  onSaveVoucher,
  loading = false,
  partnerName = '',
  amount = 0,
  monthYear = '',
  voucherData = {},
}) => {

  const safeVoucherHtml = React.useMemo(() => {
    if (!voucherHtml) return '';
    try {
      if (!isValidTemplate(voucherHtml)) {
        console.error('Invalid voucher template: contains potentially dangerous content');
        return '<div style="color: red; text-align: center; padding: 20px;">خطأ: قالب السند غير آمن</div>';
      }
      return injectContractData(voucherHtml, voucherData);
    } catch (error) {
      console.error('Error processing voucher template:', error);
      return '<div style="color: red; text-align: center; padding: 20px;">خطأ في معالجة قالب السند</div>';
    }
  }, [voucherHtml, voucherData]);

  React.useEffect(() => {
    if (open && voucherHtml) {
      preloadContractFonts();
    }
  }, [open, voucherHtml]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '95vh',
          minHeight: '70vh',
        },
      }}
    >
      <DialogTitle
        className="no-print"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fafafa',
          '@media print': {
            display: 'none !important',
          },
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#2E8B45">
            معاينة سند الصرف
          </Typography>
          {partnerName && (
            <Typography variant="body2" color="text.secondary">
              المساهم: {partnerName} - المبلغ: {amount?.toLocaleString()} ر.س
              {monthYear && ` - ${monthYear}`}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8f9fc',
          overflow: 'auto',
          '@media print': {
            p: 0,
            m: 0,
            backgroundColor: 'white',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%',
            overflow: 'auto',
            p: 2,
            '@media print': {
              display: 'block !important',
              p: 0,
            },
          }}
        >
          {safeVoucherHtml ? (
            <Paper
              sx={{
                width: '100%',
                maxWidth: '850px',
                minHeight: '500px',
                maxHeight: 'calc(100vh - 280px)',
                bgcolor: 'white',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0',
                overflow: 'auto',
                '@media print': {
                  m: 0,
                  p: 0,
                  boxShadow: 'none',
                  border: 'none',
                  minHeight: 'auto',
                  maxHeight: 'none',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  width: '100%',
                  maxWidth: '100%',
                },
              }}
            >
              <Box
                dangerouslySetInnerHTML={{ __html: safeVoucherHtml }}
                sx={{
                  '& *': {
                    fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif !important',
                  },
                  '@media print': {
                    '& .contract-wrapper': {
                      background: 'white !important',
                      padding: '0 !important',
                      margin: '0 !important',
                    },
                    '& .contract-container': {
                      border: 'none !important',
                      boxShadow: 'none !important',
                      margin: '0 !important',
                      padding: '15mm !important',
                    },
                  },
                }}
              />
            </Paper>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
                flexDirection: 'column',
                color: 'text.secondary',
              }}
            >
              <Typography variant="h6" mb={2}>
                لا يوجد محتوى للعرض
              </Typography>
              <Typography variant="body2">
                يرجى التأكد من وجود بيانات الدفعة والمساهم
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider className="no-print" />

      <DialogActions
        className="no-print"
        sx={{
          p: 2,
          gap: 2,
          flexDirection: 'row-reverse',
          bgcolor: '#fafafa',
          '@media print': {
            display: 'none !important',
          },
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            minWidth: '100px',
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: 'grey.50',
            },
          }}
        >
          إغلاق
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? null : <Download sx={{ marginLeft: '10px' }} />}
          onClick={onSaveVoucher}
          disabled={loading || !voucherHtml}
          sx={{
            bgcolor: '#2E8B45',
            '&:hover': { bgcolor: '#1b5e20' },
            minWidth: '180px',
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'حفظ السند'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartnerWithdrawVoucherPreview;
