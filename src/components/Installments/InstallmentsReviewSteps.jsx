import React from 'react';
import { Box, Typography, Stepper, Step, StepLabel, Alert, Divider } from '@mui/material';
import { Download, Share as ShareIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { extractFileName, hasFiles } from './installmentsUtils';
import { downloadFile, handleShareFile } from './installmentsUtils';

export default function InstallmentsReviewSteps({
  activeStep,
  steps,
  selectedInstallment,
  activeInstallmentId,
  onDownloadFile,
  onShareFile,
}) {
  const stepMessages = {
    0: 'في انتظار رفع الإيصال من العميل',
    1: 'جاري مراجعة الإيصال المرفوع',
    2: 'تم إتمام العملية بنجاح',
  };
  const stepSeverity = { 0: 'info', 1: 'warning', 2: 'success' };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        خطوات المراجعة
      </Typography>

      <Stepper orientation="vertical" activeStep={activeStep} sx={{ mb: 2 }}>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Divider sx={{ my: 2 }} />

      {activeInstallmentId ? (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            الدفعة المحددة: #{selectedInstallment?.count}
          </Typography>

          {selectedInstallment && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              المبلغ: {selectedInstallment.amount?.toFixed(2)}
            </Typography>
          )}

          <Alert severity={stepSeverity[activeStep]} sx={{ mb: 2 }}>
            {stepMessages[activeStep]}
          </Alert>

          {hasFiles(selectedInstallment) ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                الملفات المرفوعة:
              </Typography>

              {selectedInstallment?.attachments && selectedInstallment.attachments.length > 0 && (
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    المستندات:
                  </Typography>
                  {selectedInstallment.attachments.map((attachment, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        p: 1,
                        borderRadius: 1,
                        mb: 1,
                      }}
                      onClick={() => window.open(attachment, '_blank')}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {extractFileName(attachment)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadFile(attachment, extractFileName(attachment));
                        }}
                      >
                        <Download />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {selectedInstallment?.RepaymentPayment?.length > 0 && (
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    إيصالات الدفع:
                  </Typography>
                  {selectedInstallment.RepaymentPayment.map((payment, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        p: 1,
                        borderRadius: 1,
                      }}
                      onClick={() => window.open(payment.proofUrl, '_blank')}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {extractFileName(payment.proofUrl)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadFile(
                            payment.proofUrl,
                            extractFileName(payment.proofUrl)
                          );
                        }}
                      >
                        <Download />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareFile(
                            payment.proofUrl,
                            extractFileName(payment.proofUrl)
                          );
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              هذه الدفعة لا يحتوي على أي ملفات
            </Alert>
          )}
        </Box>
      ) : (
        <Alert severity="info">اختر دفعة لعرض التفاصيل</Alert>
      )}
    </Box>
  );
}
