import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Send as SendIcon,
} from "@mui/icons-material";

const CollectionModal = ({ 
  open, 
  onClose, 
  installment, 
  clientName,
  onCollectionSuccess,
  onNotificationSent 
}) => {
  const [activeTab, setActiveTab] = useState("SMS");
  const [message, setMessage] = useState("");
  const [linkCreated, setLinkCreated] = useState(false);

  const paymentLink = `http://localhost:3001/payment-receipt/${installment?.loanId}/${installment?.id}/${encodeURIComponent(clientName || '')}`;
  
  const defaultMessage = `مرحباً ${clientName}، نود تذكيرك بأن قسطك بمبلغ ${installment?.amount?.toFixed(2) || '0.00'} ريال سعودي مستحق الدفع. يرجى استخدام الرابط التالي لإتمام عملية الدفع: ${paymentLink}`;

  useEffect(() => {
    if (open && installment) {
      setLinkCreated(false);
      setMessage(defaultMessage);
    }
  }, [open, installment, defaultMessage]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    
    if (!linkCreated && onCollectionSuccess) {
      onCollectionSuccess(paymentLink);
      setLinkCreated(true);
    }
  };

  const handleSendNotification = () => {
    console.log("Sending notification:", {
      to: clientName,
      message: message || defaultMessage,
      channel: activeTab,
      link: paymentLink
    });
    
    if (onNotificationSent) {
      onNotificationSent();
    }
    
    if (!linkCreated && onCollectionSuccess) {
      onCollectionSuccess(paymentLink);
      setLinkCreated(true);
    }
    
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold">
          بدء التحصيل الذكي
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              العميل
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {clientName} (قسط #{installment?.id})
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              المبلغ: {installment?.amount?.toFixed(2)}
            </Typography>
          </Paper>
        </Box>

        <Stepper activeStep={linkCreated ? 1 : 0} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>إنشاء الرابط</StepLabel>
          </Step>
          <Step>
            <StepLabel>إرسال التنبيه</StepLabel>
          </Step>
        </Stepper>

        <Box sx={{ spaceY: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium" color="text.secondary" mb={2}>
              1. إنشاء رابط دفع فريد
            </Typography>
            <TextField
              fullWidth
              value={paymentLink}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      startIcon={<CopyIcon sx={{marginLeft:'10px'}} />} 
                      onClick={handleCopyLink}
                      sx={{ color: '#1E40AF' }}
                    >
                      نسخ الرابط
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: 'grey.100'
                }
              }}
            />
            {linkCreated && (
              <Alert severity="success" sx={{ mt: 1 }}>
                تم إنشاء رابط الدفع بنجاح
              </Alert>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium" color="text.secondary" mb={2}>
              2. مراجعة وتخصيص الرسالة
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Button
                variant={activeTab === "SMS" ? "contained" : "outlined"}
                onClick={() => setActiveTab("SMS")}
                sx={{ 
                  mr: 1,
                  bgcolor: activeTab === "SMS" ? "#1E40AF" : "transparent",
                  color: activeTab === "SMS" ? "white" : "grey.600"
                }}
              >
                SMS
              </Button>
              <Button
                variant={activeTab === "Telegram" ? "contained" : "outlined"}
                onClick={() => setActiveTab("Telegram")}
                sx={{ 
                  bgcolor: activeTab === "Telegram" ? "#1E40AF" : "transparent",
                  color: activeTab === "Telegram" ? "white" : "grey.600"
                }}
              >
                Telegram
              </Button>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك المخصصة هنا..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#1E40AF",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1E40AF",
                  },
                }
              }}
            />
          </Box>

        </Box>

      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button onClick={onClose} variant="outlined">
          إلغاء
        </Button>
        <Button
          variant="contained"
          startIcon={<SendIcon sx={{marginLeft:'10px'}} />}
          onClick={handleSendNotification}
          disabled={!linkCreated}
          sx={{
            bgcolor: linkCreated ? "#1E40AF" : "grey.400",
            "&:hover": { 
              bgcolor: linkCreated ? "#153482" : "grey.400" 
            }
          }}
        >
          إرسال التنبيه
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CollectionModal;