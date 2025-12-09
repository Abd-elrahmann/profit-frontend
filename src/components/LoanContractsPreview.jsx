// components/contracts/LoanContractsPreview.jsx
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
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Download, Print } from '@mui/icons-material';

const LoanContractsPreview = ({ 
  open, 
  onClose, 
  debtAckHtml, 
  promissoryNoteHtml, 
  onSaveContracts, 
  loading = false,
  clientName = "",
  loanAmount = 0
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [isPrinting, setIsPrinting] = React.useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      
      // Get the current active contract content
      const currentHtml = activeTab === 0 ? debtAckHtml : promissoryNoteHtml;
      
      if (!currentHtml) {
        console.error('No contract content available for printing');
        return;
      }

      // Create a new window for printing
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
          <title>${activeTab === 0 ? 'إقرار الدين' : 'سند الأمر'}</title>
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
          ${currentHtml}
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
      console.error('Error printing contract:', error);
      alert('حدث خطأ أثناء الطباعة');
    } finally {
      setIsPrinting(false);
    }
  };

  const contracts = [
    { 
      name: 'إقرار الدين', 
      html: debtAckHtml,
      id: 'debt-acknowledgment'
    },
    { 
      name: 'سند الأمر', 
      html: promissoryNoteHtml,
      id: 'promissory-note'
    }
  ];

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
          <Typography variant="h6" fontWeight="bold" color="#0d40a5">
            معاينة عقود السلفة
          </Typography>
          {clientName && (
            <Typography variant="body2" color="text.secondary">
              العميل: {clientName} - المبلغ: {loanAmount.toLocaleString()} ر.س
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Box 
        className="no-print"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: '#f8f9fa',
          '@media print': {
            display: 'none !important'
          }
        }}
      >
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab 
            label="إقرار الدين" 
            sx={{
              fontWeight: activeTab === 0 ? 'bold' : 'normal',
              color: activeTab === 0 ? '#0d40a5' : 'text.secondary',
              minWidth: 120
            }}
          />
          <Tab 
            label="سند الأمر" 
            sx={{
              fontWeight: activeTab === 1 ? 'bold' : 'normal',
              color: activeTab === 1 ? '#0d40a5' : 'text.secondary',
              minWidth: 120
            }}
          />
        </Tabs>
      </Box>

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
        {contracts.map((contract, index) => (
          <Box
            key={contract.id}
            id={`contract-tab-${index}`}
            sx={{
              display: activeTab === index ? 'flex' : 'none',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              width: '100%',
              height: '100%',
              overflow: 'auto',
              p: 2,
              '@media print': {
                display: 'block !important',
                pageBreakAfter: index === 0 ? 'always' : 'auto',
                p: 0
              }
            }}
          >
            {contract.html ? (
              <Paper
                sx={{
                  width: '100%',
                  maxWidth: '900px',
                  minHeight: '600px',
                  maxHeight: 'calc(100vh - 300px)', // Prevent it from being too tall
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
                  dangerouslySetInnerHTML={{ __html: contract.html }}
                  sx={{
                    '& *': {
                      fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif !important',
                    },
                    '@media print': {
                      '& .contract-wrapper': {
                        background: 'white !important',
                        padding: '0 !important',
                        margin: '0 !important'
                      },
                      '& .contract-container': {
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
                  يرجى التأكد من وجود قالب العقد وبيانات العميل
                </Typography>
              </Box>
            )}
          </Box>
        ))}
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
          disabled={isPrinting || !debtAckHtml || !promissoryNoteHtml}
          sx={{
            borderColor: '#0d40a5',
            color: '#0d40a5',
            minWidth: '120px',
            '&:hover': {
              bgcolor: 'rgba(13, 64, 165, 0.1)'
            }
          }}
        >
          {isPrinting ? <CircularProgress size={20} /> : 'طباعة'}
        </Button>
        
        <Button
          variant="contained"
          startIcon={loading ? null : <Download sx={{marginLeft: '10px'}} />}
          onClick={() => onSaveContracts('both')}
          disabled={loading || !debtAckHtml || !promissoryNoteHtml}
          sx={{
            bgcolor: "#2e7d32",
            "&:hover": { bgcolor: "#1b5e20" },
            minWidth: '180px'
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'حفظ العقود'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanContractsPreview;