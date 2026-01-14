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
  Stack,
  CircularProgress,
} from "@mui/material";

const PartialPayWithdraw = ({
  open,
  onClose,
  partialAmount,
  onAmountChange,
  selectedScheduleId,
  withdrawalDetails,
  onConfirm,
  isProcessing,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          دفع جزئي
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="المبلغ المدفوع"
            type="number"
            value={partialAmount}
            onChange={onAmountChange}
            fullWidth
            InputProps={{
              inputProps: { min: 0, step: 0.01 },
            }}
          />
          {partialAmount && parseFloat(partialAmount) > 0 && withdrawalDetails?.schedule && selectedScheduleId && (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              {(() => {
                const currentSchedule = withdrawalDetails.schedule.find(s => s.id === selectedScheduleId);
                const totalAmount = currentSchedule ? (currentSchedule.amount + (currentSchedule.carryAmount || 0)) : 0;
                const remainingAmount = currentSchedule ? (totalAmount - parseFloat(partialAmount)) : 0;
                return (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      سيتم دفع مبلغ <strong>{parseFloat(partialAmount).toLocaleString()}</strong>
                    </Typography>
                    <Typography variant="body2">
                      وترحيل مبلغ <strong>{remainingAmount.toLocaleString()}</strong> إلى الدفعة المقبلة
                    </Typography>
                  </>
                );
              })()}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, flexDirection: "row-reverse" }}>
        <Button onClick={onClose} color="inherit" disabled={isProcessing}>
          إلغاء
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={isProcessing || !partialAmount || parseFloat(partialAmount) <= 0}
          sx={{
            bgcolor: "warning.main",
            "&:hover": { bgcolor: "warning.dark" },
          }}
        >
          {isProcessing ? <CircularProgress size={20} sx={{ color: "white" }} /> : "تأكيد"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartialPayWithdraw;