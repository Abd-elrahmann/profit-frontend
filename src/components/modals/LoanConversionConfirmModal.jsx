import React from "react";
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
}) => {


  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <FaExchangeAlt size={24} color="#1976d2" />
          <Typography variant="h6" fontWeight="bold">
            تأكيد نقل المديونية
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
              سيتم نقل جميع المبالغ المتبقية من السلفة إلى العميل الجديد
            </Typography>
          </Alert>

          {/* Current Client Info */}
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

          {/* Arrow */}
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <FaExchangeAlt size={32} color="#1976d2" />
          </Box>

          {/* New Client Info */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              border: "2px solid #1976d2",
              bgcolor: "#f3f9ff",
              maxWidth: 500,
              width: '100%',
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

          {/* Selected Kafeel Info - Show if kafeel is selected */}
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

          {/* Loan and Amount Info */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid #fff3cd",
              bgcolor: "#fffbf0",
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
              المبلغ المتبقي للنقل
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6} textAlign="center" justifyContent="center">
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  المبلغ المتبقي:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main" textAlign="center">
                  {remainingAmount}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Important Notes */}
          <Alert severity="info" sx={{ maxWidth: 500, width: '100%' }}>
            <Typography variant="body2" fontWeight="bold" mb={1}>
              ملاحظات مهمة:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>سيتم نقل جميع الأقساط المتبقية إلى العميل الجديد</li>
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
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={isLoading}
          size="large"
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FaExchangeAlt style={{ marginLeft: 10 }} />
            )
          }
        >
          {isLoading ? "جاري النقل..." : "تأكيد النقل"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanConversionConfirmModal;
