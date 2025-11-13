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
} from '@mui/material';
import { Close as CloseIcon, Download } from '@mui/icons-material';

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
              color: activeTab === 0 ? '#0d40a5' : 'text.secondary'
            }}
          />
          <Tab 
            label="سند الأمر" 
            sx={{
              fontWeight: activeTab === 1 ? 'bold' : 'normal',
              color: activeTab === 1 ? '#0d40a5' : 'text.secondary'
            }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ 
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        '@media print': {
          p: 0,
          m: 0
        }
      }}>
        {contracts.map((contract, index) => (
          <Box
            key={contract.id}
            id={`contract-tab-${index}`}
            sx={{
              display: activeTab === index ? 'block' : 'none',
              '@media print': {
                display: 'block !important',
                pageBreakAfter: index === 0 ? 'always' : 'auto'
              }
            }}
          >
            <Paper 
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
              {contract.html ? (
                <Box

                  dangerouslySetInnerHTML={{ __html: contract.html }}
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
                    يرجى التأكد من وجود قالب العقد وبيانات العميل
                  </Typography>
                </Box>
              )}
            </Paper>
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
          variant="contained"
          startIcon={<Download sx={{marginLeft: '10px'}} />}
          onClick={() => onSaveContracts('both')}
          disabled={loading || !debtAckHtml || !promissoryNoteHtml}
          sx={{
            bgcolor: "#2e7d32",
            "&:hover": { bgcolor: "#1b5e20" },
            minWidth: '180px'
          }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ كلا العقدين'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default LoanContractsPreview;