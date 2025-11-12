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
import { Close as CloseIcon, Download } from '@mui/icons-material';

const InstallmentSettlementPreview = ({ 
  open, 
  onClose, 
  settlementHtml, 
  onSaveSettlement, 
  loading = false,
  clientName = "",
  installmentAmount = 0,
  installmentNumber = ""
}) => {
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
            معاينة سند التسوية
          </Typography>
          {clientName && (
            <Typography variant="body2" color="text.secondary">
              العميل: {clientName} - القسط: {installmentNumber} - المبلغ: {installmentAmount.toLocaleString()}
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
          id="settlement-receipt-content"
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
          {settlementHtml ? (
            <Box
              dangerouslySetInnerHTML={{ __html: settlementHtml }}
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
          onClick={onSaveSettlement}
          disabled={loading || !settlementHtml}
          sx={{
            bgcolor: "#0d40a5",
            "&:hover": { bgcolor: "#0b3589" },
            minWidth: '140px'
          }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ كـ PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstallmentSettlementPreview;