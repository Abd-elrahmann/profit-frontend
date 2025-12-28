// components/contracts/ZakatContractPreview.jsx
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
import { Close as CloseIcon, Download } from '@mui/icons-material';

const ZakatContractPreview = ({ 
  open, 
  onClose, 
  contractHtml, 
  onSaveContract, 
  loading = false,
  amount = 0,
}) => {
  const printContract = () => {
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طباعة سند صرف الزكاة</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Cairo', 'Tajawal', sans-serif;
            direction: rtl;
            background: white;
          }
          
          .contract-wrapper {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            background: white !important;
          }
        </style>
      </head>
      <body>
        ${contractHtml}
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
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
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fafafa',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#0d40a5">
            معاينة سند صرف الزكاة
          </Typography>
          {amount > 0 && (
            <Typography variant="body2" color="text.secondary">
              المبلغ: {amount.toLocaleString()} ريال
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
          }}
        >
          {contractHtml ? (
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
              }}
            >
              <Box
                dangerouslySetInnerHTML={{ __html: contractHtml }}
                sx={{
                  '& *': {
                    fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif !important',
                  },
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
                يرجى التأكد من وجود قالب العقد وبيانات السحب
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions 
        sx={{ 
          p: 3, 
          gap: 2,
          flexDirection: 'row-reverse',
          bgcolor: '#fafafa',
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
          onClick={printContract}
          sx={{
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1565c0" },
            minWidth: '120px'
          }}
        >
          طباعة
        </Button>
        
        <Button
          variant="contained"
          startIcon={loading ? null : <Download sx={{marginLeft: '10px'}} />}
          onClick={() => onSaveContract(contractHtml)}
          disabled={loading || !contractHtml}
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "#1b5e20" },
            minWidth: '180px'
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'حفظ السند'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ZakatContractPreview;