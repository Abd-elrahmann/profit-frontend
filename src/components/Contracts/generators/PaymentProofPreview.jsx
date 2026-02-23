
/**
 * PaymentProofPreview
 *
 * Displays legally approved payment proof receipt templates.
 * HTML templates are internally seeded and trusted from the database.
 * Dynamic values are sanitized before injection to prevent XSS attacks.
 * All templates undergo validation to ensure they contain no malicious content.
 */

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
} from '@mui/material';
import { Close as CloseIcon, Print, Download } from '@mui/icons-material';
import { isValidTemplate, injectContractData } from '../../../utilities/sanitize';

const PaymentProofPreview = ({
  open,
  onClose,
  paymentProofHtml,
  onSaveProof,
  loading = false,
  clientName = "",
  installmentAmount = 0,
  discount = 0,
  paymentData = {} // Additional dynamic data for template injection
}) => {
  const finalAmount = Math.max(0, installmentAmount - discount);

  // Safely process payment proof HTML with XSS protection
  const safePaymentProofHtml = React.useMemo(() => {
    if (!paymentProofHtml) return '';

    try {
      // Validate template safety
      if (!isValidTemplate(paymentProofHtml)) {
        console.error('Invalid payment proof template: contains potentially dangerous content');
        return '<div style="color: red; text-align: center; padding: 20px;">خطأ: قالب إيصال السداد غير آمن</div>';
      }

      // Inject additional sanitized data if provided
      return injectContractData(paymentProofHtml, paymentData);
    } catch (error) {
      console.error('Error processing payment proof template:', error);
      return '<div style="color: red; text-align: center; padding: 20px;">خطأ في معالجة قالب إيصال السداد</div>';
    }
  }, [paymentProofHtml, paymentData]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={true}
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '100vh'
        }
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
          '@media print': {
            display: 'none !important'
          }
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            معاينة إيصال السداد
          </Typography>
          {clientName && (
            <Typography variant="body2" color="text.secondary">
              العميل: {clientName} - المبلغ: {finalAmount.toLocaleString()} ر.س
              {discount > 0 && (
                <span style={{ color: '#d32f2f' }}>
                  {' '}({installmentAmount.toLocaleString()} - خصم {discount.toLocaleString()})
                </span>
              )}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 0,
        '@media print': {
          p: 0,
          m: 0
        }
      }}>
        <Paper 
          id="payment-proof-content"
          sx={{ 
            m: 3, 
            p: 4, 
            minHeight: '500px',
            bgcolor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
            '@media print': {
              m: 0,
              p: 2,
              boxShadow: 'none',
              border: 'none',
              minHeight: 'auto',
              pageBreakInside: 'avoid'
            }
          }}
        >
          {safePaymentProofHtml ? (
            <Box
              dangerouslySetInnerHTML={{ __html: safePaymentProofHtml }}
              sx={{
                '& *': {
                  fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                  lineHeight: 1.8
                },
                '& h1, & h2, & h3': {
                  textAlign: 'center',
                  color: '#1976d2',
                  marginBottom: '20px'
                },
                '& p': {
                  marginBottom: '15px',
                  textAlign: 'justify'
                },
                '& strong': {
                  color: '#1976d2',
                  fontWeight: 'bold'
                }
              }}
            />
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '400px',
              flexDirection: 'column',
              color: 'text.secondary'
            }}>
              <Typography variant="h6" mb={2}>
                لا يوجد محتوى للعرض
              </Typography>
              <Typography variant="body2">
                يرجى التأكد من وجود قالب الإيصال وبيانات العميل
              </Typography>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <Divider className="no-print" />

      <DialogActions 
        className="no-print"
        sx={{ 
          p: 3, 
          gap: 2,
          flexDirection: 'row-reverse',
          bgcolor: '#fafafa',
          '@media print': {
            display: 'none !important'
          }
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
              bgcolor: 'grey.50'
            }
          }}
        >
          إغلاق
        </Button>

        <Button
          variant="contained"
          startIcon={<Download sx={{marginLeft: '10px'}} />}
          onClick={onSaveProof}
          disabled={loading || !paymentProofHtml}
          sx={{
            bgcolor: "primary.main",
            minWidth: '140px',
            "&:hover": { bgcolor: "primary.main" },
          }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ الإيصال'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default PaymentProofPreview;