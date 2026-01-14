import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Stack,
  FormControl,
  MenuItem,
} from "@mui/material";

const TransactionModal = ({
  isOpen,
  onClose,
  transactionForm,
  onInputChange,
  onSave,
  permissions
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          إضافة عملية مالية
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth size="small">
            <TextField
              select
              label="نوع العملية"
              value={transactionForm.type}
              onChange={(e) => onInputChange('type', e.target.value)}
            >
              <MenuItem value="DEPOSIT">إيداع</MenuItem>
              <MenuItem value="WITHDRAWAL">سحب من رأس المال</MenuItem>
              <MenuItem value="PROFIT_WITHDRAWAL">سحب أرباح</MenuItem>
              <MenuItem value="SAVING_WITHDRAWAL">سحب ادخار</MenuItem>
            </TextField>
          </FormControl>

          <TextField
            label="المبلغ"
            type="number"
            value={transactionForm.amount}
            onChange={(e) => onInputChange('amount', e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, flexDirection: 'row-reverse' }}>
        <Button
          onClick={onClose}
          color="inherit"
        >
          إلغاء
        </Button>
        {permissions.includes("partners_Add") && (
          <Button
            onClick={onSave}
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            حفظ
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TransactionModal;