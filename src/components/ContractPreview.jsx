/**
 * ContractPreview
 *
 * Displays legally approved contract templates for mudarabah agreements.
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
import { isValidTemplate, injectContractData } from '../utilities/sanitize';

const ContractPreview = ({
  open,
  onClose,
  contractHtml,
  onGeneratePDF,
  loading = false,
  contractTitle = "معاينة العقد",
  contractData = {} 
}) => {
  const safeContractHtml = React.useMemo(() => {
    if (!contractHtml) return '';

    try {
      if (!isValidTemplate(contractHtml)) {
        console.error('Invalid contract template: contains potentially dangerous content');
        return '<div style="color: red; text-align: center; padding: 20px;">خطأ: قالب العقد غير آمن</div>';
      }

      return injectContractData(contractHtml, contractData);
    } catch (error) {
      console.error('Error processing contract template:', error);
      return '<div style="color: red; text-align: center; padding: 20px;">خطأ في معالجة قالب العقد</div>';
    }
  }, [contractHtml, contractData]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullScreen={true}
      fullWidth
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
        <Typography variant="h6" fontWeight="bold">
          {contractTitle}
        </Typography>
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
          id="contract-preview"
          sx={{
            m: 3,
            p: 0,
            minHeight: '500px',
            bgcolor: 'transparent',
            boxShadow: 'none',
            border: 'none',
            '@media print': {
              m: '0 !important',
              p: '0 !important',
              boxShadow: 'none !important',
              border: 'none !important',
              minHeight: 'auto !important',
              maxHeight: 'none !important',
              height: 'auto !important'
            }
          }}
        >
          {safeContractHtml ? (
            <Box
              dangerouslySetInnerHTML={{ __html: safeContractHtml }}
              sx={{
                '& *': {
                  wordSpacing: 'normal',
                  letterSpacing: 'normal'
                },

                '& .contract-wrapper': {
                  background: '#f8f9fc',
                  padding: '15px',
                  fontFamily: '"Cairo", "Tajawal", "Noto Sans Arabic", sans-serif',
                  direction: 'rtl',
                  textAlign: 'right'
                },

                '& .contract-container': {
                  maxWidth: '900px',
                  margin: 'auto',
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                },

                '& .contract-header': {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px solid rgba(46, 139, 69, 0.2)',
                  paddingBottom: '8px',
                  marginBottom: '15px',
                  pageBreakInside: 'avoid'
                },

                '& .header-left': {
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                },

                '& .contract-logo': {
                  maxWidth: '40px',
                  maxHeight: '40px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '8px'
                },

                '& .contract-title': {
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#2e7d32'
                },

                '& .contract-dates': {
                  fontSize: '14px',
                  color: '#555',
                  textAlign: 'left'
                },

                '& .contract-dates p': {
                  margin: '5px 0'
                },

                '& .section-title': {
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#000',
                  margin: '20px 0 15px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid rgba(46, 139, 69, 0.2)',
                  pageBreakInside: 'avoid'
                },

                '& .parties-grid': {
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '30px',
                  pageBreakInside: 'avoid'
                },

                '& .party-card': {
                  background: '#ffffff',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(46, 139, 69, 0.2)',
                  pageBreakInside: 'avoid'
                },

                '& .party-title': {
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#000',
                  marginBottom: '15px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid rgba(46, 139, 69, 0.2)'
                },

                '& .sub-party': {
                  marginBottom: '20px',
                  pageBreakInside: 'avoid'
                },

                '& .sub-party:last-child': {
                  marginBottom: 0
                },

                '& .sub-party-title': {
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#4a4a4a',
                  marginBottom: '10px',
                  paddingRight: '10px'
                },

                '& .party-details': {
                  marginBottom: '15px'
                },

                '& .detail-row': {
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(46, 139, 69, 0.1)',
                  pageBreakInside: 'avoid'
                },

                '& .detail-label': {
                  color: '#666',
                  fontWeight: 500,
                  fontSize: '14px',
                  minWidth: '120px'
                },

                '& .detail-value': {
                  color: '#111',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textAlign: 'left',
                  flex: 1
                },

                '& .party-reference': {
                  color: '#777',
                  fontSize: '13px',
                  marginTop: '15px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(46, 139, 69, 0.2)'
                },

                '& .preamble-box': {
                  background: '#ffffff',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(46, 139, 69, 0.2)',
                  marginBottom: '30px',
                  pageBreakInside: 'avoid'
                },

                '& .preamble-title': {
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#000',
                  marginBottom: '15px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid rgba(46, 139, 69, 0.2)'
                },

                '& .preamble-text': {
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: 1.8,
                  textAlign: 'justify'
                },

                '& .clause': {
                  background: '#ffffff',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(46, 139, 69, 0.2)',
                  marginBottom: '20px',
                  pageBreakInside: 'avoid'
                },

                '& .clause:last-child': {
                  marginBottom: 0
                },

                '& .clause-title': {
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#2e7d32',
                  marginBottom: '15px',
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '4px',
                  borderBottom: '1px solid rgba(46, 139, 69, 0.2)'
                },

                '& .clause-content': {
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: 1.8
                },

                '& .clause-content p': {
                  marginBottom: '10px',
                  pageBreakInside: 'avoid'
                },

                '& .clause-content p:last-child': {
                  marginBottom: 0
                },

                '& .clause-text': {
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: 1.8
                },

                '& .clause-list': {
                  listStyle: 'none',
                  padding: 0,
                  margin: '15px 0',
                  pageBreakInside: 'avoid'
                },

                '& .clause-list li': {
                  padding: '8px 0',
                  paddingRight: '25px',
                  position: 'relative',
                  borderBottom: '1px solid rgba(46, 139, 69, 0.1)',
                  pageBreakInside: 'avoid'
                },

                '& .clause-list li:before': {
                  content: '"•"',
                  color: '#2E8B45',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  position: 'absolute',
                  right: 0,
                  top: '5px'
                },

                '& .clause-list li:last-child': {
                  borderBottom: 'none'
                },

                '& .percentage': {
                  display: 'inline-block',
                  background: '#2E8B45',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginLeft: '5px'
                },

                '& .placeholder': {
                  color: '#2E8B45',
                  fontWeight: 600,
                  background: 'rgba(46, 139, 69, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(46, 139, 69, 0.3)'
                },

                '& .clause-content strong': {
                  color: '#2E8B45 !important'
                },

                '& .signatures-section': {
                  marginTop: '40px',
                  paddingTop: '20px',
                  borderTop: '2px solid rgba(46, 139, 69, 0.2)',
                  pageBreakInside: 'avoid'
                },

                '& .signatures-header': {
                  textAlign: 'center',
                  marginBottom: '30px',
                  pageBreakInside: 'avoid'
                },

                '& .signatures-title': {
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#2e7d32'
                },

                '& .signatures-grid': {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px',
                  marginBottom: '20px',
                  pageBreakInside: 'avoid'
                },

                '& .signature-box': {
                  textAlign: 'center',
                  padding: '20px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid rgba(46, 139, 69, 0.2)',
                  pageBreakInside: 'avoid'
                },

                '& .signature-party': {
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#000',
                  marginBottom: '15px'
                },

                '& .signature-details': {
                  marginBottom: '20px',
                  pageBreakInside: 'avoid'
                },

                '& .signature-name': {
                  color: '#555',
                  fontSize: '14px'
                },

                '& .signature-line': {
                  width: '100%',
                  height: '1px',
                  background: '#222',
                  margin: '15px 0'
                },

                '& .signature-fields': {
                  color: '#666',
                  fontSize: '13px',
                  marginTop: '25px'
                },

                '& .signature-fields p': {
                  margin: '5px 0'
                },

                '& .english-number': {
                  fontFamily: "'Arial', sans-serif",
                  direction: 'ltr',
                  unicodeBidi: 'embed'
                },

                '@media (max-width: 768px)': {
                  '& .parties-grid, & .signatures-grid': {
                    gridTemplateColumns: '1fr'
                  },
                  '& .contract-header': {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '15px'
                  },
                  '& .contract-dates': {
                    textAlign: 'right'
                  }
                },
                
                '@media print': {
                  '@page': {
                    size: 'A4',
                    margin: '10mm'
                  },
                  '& .contract-wrapper': {
                    background: '#fff !important',
                    padding: '0 !important',
                    margin: '0 !important',
                    'page-break-inside': 'avoid !important',
                    'break-inside': 'avoid !important',
                    width: '100% !important',
                    'max-width': '100% !important'
                  },
                  '& .contract-container': {
                    margin: '0 auto !important',
                    padding: '15mm !important',
                    'page-break-inside': 'avoid !important',
                    'break-inside': 'avoid !important',
                    'box-shadow': 'none !important',
                    border: 'none !important',
                    width: '100% !important',
                    'max-width': '180mm !important',
                    background: '#fff !important',
                    maxWidth: '100%',
                    pageBreakInside: 'avoid'
                  },
                  '& *': {
                    wordWrap: 'break-word !important',
                    overflowWrap: 'break-word !important',
                    WebkitPrintColorAdjust: 'exact !important',
                    colorAdjust: 'exact !important'
                  },
                  '& .contract-header, & .section-title, & .party-card, & .preamble-box, & .clause, & .signature-box, & .signatures-section': {
                    pageBreakInside: 'avoid !important',
                    pageBreakAfter: 'avoid !important',
                    breakInside: 'avoid !important'
                  },
                  '& .parties-grid': {
                    marginBottom: '15px'
                  },
                  '& .party-card': {
                    padding: '15px'
                  },
                  '& .clause': {
                    padding: '15px',
                    marginBottom: '15px'
                  },
                  '& .preamble-box': {
                    padding: '15px',
                    marginBottom: '15px'
                  },
                  '& .signatures-grid': {
                    gap: '15px',
                    marginBottom: '15px'
                  },
                  '& .signature-box': {
                    padding: '15px'
                  },
                  '& .clause-content p, & .preamble-text, & .clause-text, & .party-reference': {
                    orphans: 3,
                    widows: 3,
                    pageBreakInside: 'avoid'
                  },
                  '& .clause-list li': {
                    pageBreakInside: 'avoid'
                  },
                  '& .detail-row, & .clause-list li, & .signature-line': {
                    borderColor: '#000 !important'
                  },
                  '& .party-card, & .preamble-box, & .clause, & .signature-box': {
                    background: '#ffffff !important',
                    border: '1px solid #000 !important'
                  },
                  '& .percentage': {
                    background: '#2E8B45 !important',
                    color: 'white !important'
                  },
                  '& .placeholder': {
                    background: 'transparent !important',
                    border: '1px dashed #000 !important',
                    color: '#000 !important'
                  },
                  '& .section-title, & .party-title, & .preamble-title, & .signature-party': {
                    color: '#000 !important'
                  },
                  '& .clause-title': {
                    color: '#2e7d32 !important'
                  },
                  '& .contract-title': {
                    color: '#2e7d32 !important'
                  },
                  '& .signatures-title': {
                    color: '#2e7d32 !important'
                  },
                  '& .clause-content strong': {
                    color: '#2E8B45 !important'
                  }
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
                يرجى التأكد من وجود قالب العقد وبيانات المستثمر
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
          onClick={onGeneratePDF}
          disabled={loading || !safeContractHtml}
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "#1b5e20" },
            minWidth: '140px'
          }}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ كـ PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractPreview;