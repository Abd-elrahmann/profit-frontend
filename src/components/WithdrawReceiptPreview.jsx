/**
 * WithdrawReceiptPreview
 *
 * Displays legally approved withdrawal receipt templates.
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
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Download, Print } from '@mui/icons-material';
import { isValidTemplate, injectContractData } from '../utilities/sanitize';

const WithdrawReceiptPreview = ({
  open,
  onClose,
  receiptHtml,
  onSaveReceipt,
  loading = false,
  investorName = "",
  totalAmount = 0,
  receiptData = {} 
}) => {
  const [isPrinting, setIsPrinting] = React.useState(false);

  const safeReceiptHtml = React.useMemo(() => {
    if (!receiptHtml) return '';

    try {
      if (!isValidTemplate(receiptHtml)) {
        console.error('Invalid receipt template: contains potentially dangerous content');
        return '<div style="color: red; text-align: center; padding: 20px;">خطأ: قالب المخالصة غير آمن</div>';
      }

      return injectContractData(receiptHtml, receiptData);
    } catch (error) {
      console.error('Error processing receipt template:', error);
      return '<div style="color: red; text-align: center; padding: 20px;">خطأ في معالجة قالب المخالصة</div>';
    }
  }, [receiptHtml, receiptData]);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      
      if (!safeReceiptHtml) {
        console.error('No receipt content available for printing');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('يجب السماح بالنوافذ المنبثقة للطباعة');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>مخالصة مالية</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              background: white;
              font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page { margin: 15mm; }
          </style>
        </head>
        <body>
          ${safeReceiptHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.close();
              }, 1000);
            }
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
      
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('حدث خطأ أثناء الطباعة');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={false}
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '95vh',
          minHeight: '80vh'
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
          backgroundColor: '#fafafa',
          '@media print': {
            display: 'none !important'
          }
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#1976d2">
            معاينة المخالصة المالية
          </Typography>
          {investorName && (
            <Typography variant="body2" color="text.secondary">
              المستثمر: {investorName} - المبلغ الإجمالي: {totalAmount.toLocaleString()} ر.س
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fc',
        overflow: 'auto',
        '@media print': {
          p: 0,
          m: 0,
          backgroundColor: 'white'
        }
      }}>
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
              p: 0
            }
          }}
        >
          {safeReceiptHtml ? (
            <Paper
              sx={{
                width: '100%',
                maxWidth: '900px',
                minHeight: '600px',
                maxHeight: 'calc(100vh - 300px)',
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
                  maxWidth: '100%'
                }
              }}
            >
              <Box
                dangerouslySetInnerHTML={{ __html: safeReceiptHtml }}
                sx={{
                  '& *': {
                    fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif !important',
                  },
                  '@media print': {
                    '& .receipt-wrapper': {
                      background: 'white !important',
                      padding: '0 !important',
                      margin: '0 !important'
                    },
                    '& .receipt-container': {
                      border: 'none !important',
                      boxShadow: 'none !important',
                      margin: '0 !important',
                      padding: '15mm !important'
                    }
                  }
                }}
              />
            </Paper>
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
                يرجى التأكد من وجود قالب المخالصة وبيانات المستثمر
              </Typography>
            </Box>
          )}
        </Box>
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
          variant="outlined"
          startIcon={<Print sx={{marginLeft: '10px'}} />}
          onClick={handlePrint}
          disabled={isPrinting || !receiptHtml}
          sx={{
            borderColor: '#1976d2',
            color: '#1976d2',
            minWidth: '120px',
            '&:hover': {
              bgcolor: 'rgba(25, 118, 210, 0.1)'
            }
          }}
        >
          {isPrinting ? <CircularProgress size={20} /> : 'طباعة'}
        </Button>
        
        <Button
          variant="contained"
          startIcon={loading ? null : <Download sx={{marginLeft: '10px'}} />}
          onClick={onSaveReceipt}
          disabled={loading || !receiptHtml}
          sx={{
            bgcolor: "#2e7d32",
            "&:hover": { bgcolor: "#1b5e20" },
            minWidth: '180px'
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'حفظ المخالصة'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WithdrawReceiptPreview;