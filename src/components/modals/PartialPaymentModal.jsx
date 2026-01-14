import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
} from "@mui/material";

const PartialPaymentModal = ({
  open,
  onClose,
  selectedActionInstallment,
  paidAmount,
  onAmountChange,
  onConfirm,
}) => {
  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>إضافة دفع جزئي</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          الدفعة: #{selectedActionInstallment?.count} - المبلغ:{" "}
          {selectedActionInstallment?.amount?.toFixed(2)}
        </Typography>
        <TextField
          fullWidth
          type="number"
          label="المبلغ المدفوع"
          value={paidAmount}
          onChange={onAmountChange}
          sx={{ mt: 2 }}
          InputProps={{
            inputProps: {
              min: 0,
              max: selectedActionInstallment?.remaining,
              step: 0.01,
            },
          }}
          helperText={`الحد الأقصى: ${selectedActionInstallment?.remaining?.toFixed(
            2
          )}`}
        />
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
          color="primary"
        >
          تأكيد الدفع الجزئي
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartialPaymentModal;