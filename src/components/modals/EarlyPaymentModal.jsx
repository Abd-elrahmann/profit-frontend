import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";

const EarlyPaymentModal = ({
  open,
  onClose,
  sortedInstallments,
  discountAmount,
  onDiscountChange,
  onConfirm,
}) => {
  const pendingInstallments = sortedInstallments.filter((inst) => inst.status === "PENDING");

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      open={open}
      onClose={onClose}
    >
      <DialogTitle
        sx={{ textAlign: "center" }}
      >
        سداد مبكر للدفعة
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" mb={2}>
          أنت على وشك إجراء سداد مبكر للدفعات المعلقة فقط
        </Typography>

        {/* عرض الأقساط المعلقة فقط */}
        <Box sx={{ mb: 2, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            الدفعات المعلقة (
            {pendingInstallments.length}
            ):
          </Typography>
          {pendingInstallments.map((installment, index) => (
            <Box
              key={installment.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2">
                دفعة #{installment.count} -{" "}
                {dayjs(installment.dueDate).format("DD/MM/YYYY")}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {installment.amount?.toFixed(2)}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" fontWeight="bold">
              المبلغ الإجمالي للدفعات المعلقة:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color="primary.main"
            >
              {pendingInstallments
                .reduce((sum, inst) => sum + (inst.amount || 0), 0)
                .toLocaleString()}{" "}
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          type="number"
          label="قيمة الخصم (اختياري)"
          value={discountAmount}
          onChange={onDiscountChange}
          InputProps={{
            inputProps: {
              min: 0,
              step: 0.01,
            },
          }}
          helperText="ادخل قيمة الخصم إذا كان هناك خصم على السداد المبكر"
          sx={{ mt: 2 }}
        />

        {discountAmount > 0 && (
          <Box
            sx={{ mt: 2, p: 2, borderRadius: 1 }}
          >
            <Typography
              variant="body2"
              fontWeight="bold"
              color="primary.main"
            >
              المبلغ بعد الخصم:{" "}
              {(
                pendingInstallments
                  .reduce((sum, inst) => sum + (inst.amount || 0), 0) -
                parseFloat(discountAmount || 0)
              ).toLocaleString()}{" "}
            </Typography>
          </Box>
        )}

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            تنبيه:
          </Typography>
          <Typography variant="body2">
            بعد السداد المبكر، سيتم تحويل الدفعات المعلقة فقط إلى حالة "مدفوع
            مسبقاً" وإخفاء أزرار الإجراءات لها. الدفعات المدفوعة مسبقاً لن
            تتأثر.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions
        sx={{ px: 3, py: 2, gap: 2, flexDirection: "row-reverse" }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
        >
          إلغاء
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="success"
          disabled={pendingInstallments.length === 0}
          sx={{
            bgcolor: "success.main",
            "&:hover": { bgcolor: "success.dark" },
            "&:disabled": {
              bgcolor: "action.disabled",
              color: "text.disabled",
            },
          }}
        >
          تأكيد السداد المبكر
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EarlyPaymentModal;