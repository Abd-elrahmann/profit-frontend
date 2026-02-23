/**
 * InstallmentSettlementPreview
 *
 * Displays legally approved installment settlement receipt templates.
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

const InstallmentSettlementPreview = ({
  open,
  onClose,
  settlementHtml,
  onSaveSettlement,
  loading = false,
  clientName = "",
  installmentAmount = 0,
  settlementData = {} 
}) => {
  const safeSettlementHtml = React.useMemo(() => {
    if (!settlementHtml) return '';

    try {
      if (!isValidTemplate(settlementHtml)) {
        console.error('Invalid settlement template: contains potentially dangerous content');
        return '<div style="color: red; text-align: center; padding: 20px;">خطأ: قالب التسوية غير آمن</div>';
      }

      return injectContractData(settlementHtml, settlementData);
    } catch (error) {
      console.error('Error processing settlement template:', error);
      return '<div style="color: red; text-align: center; padding: 20px;">خطأ في معالجة قالب التسوية</div>';
    }
  }, [settlementHtml, settlementData]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSaveAndClose = async () => {
    if (onSaveSettlement) {
      await onSaveSettlement();
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
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
            معاينة سند التسوية
          </Typography>
          {clientName && (
            <Typography variant="body2" color="text.secondary">
              العميل: {clientName} - المبلغ: {installmentAmount.toLocaleString()} ر.س
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
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
          id="settlement-receipt-content"
          sx={{ 
            m: 1, 
            p: 1, 
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
          {safeSettlementHtml ? (
            <Box
              dangerouslySetInnerHTML={{ __html: safeSettlementHtml }}
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
                يرجى التأكد من وجود قالب السند وبيانات العميل
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
          onClick={handleClose}
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
          onClick={handleSaveAndClose} 
          disabled={loading || !settlementHtml}
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "#2563EB" },
            minWidth: '140px'
          }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ السند'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstallmentSettlementPreview;