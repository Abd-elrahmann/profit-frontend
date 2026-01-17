/**
 * LoanContractsPreview
 *
 * Displays legally approved contract templates for loan agreements.
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
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Download, Print } from '@mui/icons-material';
import { isValidTemplate, injectContractData } from '../utilities/sanitize';

const LoanContractsPreview = ({
  open,
  onClose,
  debtAckHtml,
  promissoryNoteHtml,
  onSaveContracts,
  loading = false,
  clientName = "",
  loanAmount = 0,
  contractData = {} 
}) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const safeContracts = React.useMemo(() => {
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

    return contracts.map(contract => {
      try {
        if (!isValidTemplate(contract.html)) {
          console.error(`Invalid contract template for ${contract.name}: contains potentially dangerous content`);
          return {
            ...contract,
            html: '<div style="color: red; text-align: center; padding: 20px;">خطأ: قالب العقد غير آمن</div>'
          };
        }

        const safeHtml = injectContractData(contract.html, contractData);

        return {
          ...contract,
          html: safeHtml
        };
      } catch (error) {
        console.error(`Error processing contract template for ${contract.name}:`, error);
        return {
          ...contract,
          html: '<div style="color: red; text-align: center; padding: 20px;">خطأ في معالجة قالب العقد</div>'
        };
      }
    });
  }, [debtAckHtml, promissoryNoteHtml, contractData]);

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
        {safeContracts.map((contract, index) => (
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
          variant="contained"
          startIcon={loading ? null : <Download sx={{marginLeft: '10px'}} />}
          onClick={() => onSaveContracts('both')}
          disabled={loading || !debtAckHtml || !promissoryNoteHtml}
          sx={{
            bgcolor: "primary.main",
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