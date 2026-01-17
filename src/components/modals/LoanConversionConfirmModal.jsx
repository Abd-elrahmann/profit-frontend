import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Paper,
  Alert,
  TextField,
} from "@mui/material";
import { FaExchangeAlt } from "react-icons/fa";

const LoanConversionConfirmModal = ({
  open,
  onClose,
  onConfirm,
  fromClient,
  toClient,
  selectedKafeel,
  remainingAmount,
  isLoading,
  transferType = "full",
  partialAmount,
  onPartialAmountChange,
  maxPartialAmount,
}) => {
  const [localPartialAmount, setLocalPartialAmount] = useState(partialAmount || "");

  useEffect(() => {
    if (open && transferType === "partial") {
      setLocalPartialAmount(partialAmount || "");
    }
  }, [open, partialAmount, transferType]);

  const handlePartialAmountChange = (value) => {
    const numericValue = value.replace(/,/g, "");
    if (!isNaN(numericValue) && numericValue >= 0) {
      const formatted = numericValue ? parseFloat(numericValue).toLocaleString() : "";
      setLocalPartialAmount(formatted);
      if (onPartialAmountChange) {
        onPartialAmountChange(formatted);
      }
    }
  };

  const isPartialValid = transferType === "full" || (localPartialAmount && parseFloat(localPartialAmount.replace(/,/g, "")) > 0);

  const referenceAmount = parseFloat(String(remainingAmount || "0").replace(/,/g, ""));

  const actualRemainingAmount = transferType === "partial" && localPartialAmount
    ? referenceAmount - parseFloat(localPartialAmount.replace(/,/g, ""))
    : referenceAmount;


  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <FaExchangeAlt size={24} color="#1976d2" />
          <Typography variant="h6" fontWeight="bold">
            تأكيد {transferType === "partial" ? "نقل جزء من المديونية" : "نقل المديونية"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Alert severity="warning" sx={{ mb: 3, maxWidth: 500, width: '100%' }}>
            <Typography variant="body2" fontWeight="bold">
              تحذير مهم: هذه العملية لا يمكن التراجع عنها
            </Typography>
            <Typography variant="body2">
              {transferType === "partial"
                ? "سيتم نقل المبلغ المحدد من السلفة إلى العميل الجديد"
                : "سيتم نقل جميع المبالغ المتبقية من السلفة إلى العميل الجديد"
              }
            </Typography>
          </Alert>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Paper
              sx={{
                p: 2,
                border: "1px solid #e3f2fd",
                bgcolor: "#f8f9fa",
                minWidth: 400,
                flex: 1,
                maxWidth: 500,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="text.secondary"
                mb={2}
                textAlign="center"
              >
                العميل الحالي (المصدر)
              </Typography>
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={12} sm={6} textAlign="center">
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    الاسم:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" textAlign="center">
                    {fromClient?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} textAlign="center">
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    رقم الهوية:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" textAlign="center">
                    {fromClient?.nationalId}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: 1 }}>
              <FaExchangeAlt size={32} color="#1976d2" />
            </Box>

            <Paper
              sx={{
                p: 2,
                border: "2px solid #1976d2",
                bgcolor: "#f3f9ff",
                minWidth: 400,
                flex: 1,
                maxWidth: 500,
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="primary.main"
                mb={2}
                textAlign="center"
              >
                العميل الجديد (الهدف)
              </Typography>
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={12} sm={6} textAlign="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    الاسم:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                    {toClient?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} textAlign="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    رقم الهوية:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                    {toClient?.nationalId}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {selectedKafeel && (
            <Paper
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid #e3f2fd",
                bgcolor: "#f8f9fa",
                maxWidth: 500,
                width: '100%',
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="text.secondary"
                mb={2}
                textAlign="center"
              >
                كفيل العميل الجديد
              </Typography>
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={12} sm={6} textAlign="center">
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    الاسم:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" textAlign="center">
                    {selectedKafeel?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} textAlign="center">
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    رقم الهوية:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" textAlign="center">
                    {selectedKafeel?.nationalId}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {transferType === "partial" && (
            <Paper
              sx={{
                p: 2,
                mb: 2,
                minWidth: 800,
                maxWidth: 800,

              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="text.secondary"
                mb={2}
                textAlign="center"
              >
                مبلغ النقل الجزئي
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} textAlign="center">
                  <TextField
                    fullWidth
                    label="المبلغ المراد نقله"
                    value={localPartialAmount}
                    onChange={(e) => handlePartialAmountChange(e.target.value)}
                    InputProps={{
                      inputProps: { style: { textAlign: 'center', fontSize: '18px', fontWeight: 'bold' } }
                    }}
                    sx={{ minWidth: 400, maxWidth: 500, mx: 'auto' }}
                    error={localPartialAmount && parseFloat(localPartialAmount.replace(/,/g, "")) > parseFloat(String(maxPartialAmount || "0").replace(/,/g, ""))}
                    helperText={localPartialAmount && parseFloat(localPartialAmount.replace(/,/g, "")) > parseFloat(String(maxPartialAmount || "0").replace(/,/g, "")) ? "المبلغ يتجاوز المبلغ المتبقي" : ""}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          <Paper
            sx={{
              p: 2,
              mb: 2,
              minWidth: 800,
              maxWidth: 800,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="text.secondary"
              mb={2}
              textAlign="center"
            >
              {transferType === "partial" && localPartialAmount ? "المبلغ المتبقي بعد النقل الجزئي" : "المبلغ المتبقي للنقل"}
            </Typography>
            <Grid container spacing={2} justifyContent="space-around" flexDirection="row-reverse">
              <Grid item xs={12} sm={6} textAlign="center" justifyContent="center">
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  المبلغ المتبقي:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main" textAlign="center">
                  {transferType === "partial" && localPartialAmount
                    ? actualRemainingAmount.toLocaleString()
                    : referenceAmount.toLocaleString()}
                </Typography>
              </Grid>
              {transferType === "partial" && localPartialAmount && (
                <Grid item xs={12} sm={6} textAlign="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    سيتم نقله:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main" textAlign="center">
                    {localPartialAmount}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
              
          <Alert severity="info" sx={{ minWidth: 800, maxWidth: 800, width: '100%' }}>
            <Typography variant="body2" fontWeight="bold" mb={1}>
              ملاحظات مهمة:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {transferType === "partial" ? (
                <>
                  <li>سيتم إنشاء سلفة جديدة للعميل الجديد بالمبلغ المحدد</li>
                  <li>سيتم توزيع المبلغ على الأقساط المتبقية في السلفة الأصلية</li>
                  <li>السلفة الأصلية ستظل موجودة مع المبلغ المتبقي</li>
                </>
              ) : (
                <li>سيتم نقل جميع الأقساط المتبقية إلى العميل الجديد</li>
              )}
              <li>سيتم تحديث جميع السجلات المحاسبية تلقائياً</li>
              <li>لا يمكن التراجع عن هذه العملية بعد التأكيد</li>
              <li>يجب التأكد من صحة بيانات العميل الجديد</li>
            </Box>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row-reverse",
          gap: 2,
          px: 3,
          py: 2,
        }}
      >
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          size="large"
        >
          إلغاء
        </Button>
        <Button
          onClick={() => onConfirm(transferType === "partial" ? localPartialAmount : null)}
          variant="contained"
          color="primary"
          disabled={isLoading || !isPartialValid || (transferType === "partial" && localPartialAmount && parseFloat(localPartialAmount.replace(/,/g, "")) > parseFloat(String(maxPartialAmount || "0").replace(/,/g, "")))}
          size="large"
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FaExchangeAlt style={{ marginLeft: 10 }} />
            )
          }
        >
          {isLoading ? `جاري ${transferType === "partial" ? "النقل الجزئي" : "النقل"}...` : `تأكيد ${transferType === "partial" ? "النقل الجزئي" : "النقل"}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanConversionConfirmModal;
