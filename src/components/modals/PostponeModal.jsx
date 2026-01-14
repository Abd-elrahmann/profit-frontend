import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const PostponeModal = ({
  open,
  onClose,
  newDueDate,
  onDueDateChange,
  postponeReason,
  onReasonChange,
  onConfirm,
}) => {
  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>تأجيل الدفعة</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          type="date"
          label="التاريخ الجديد للاستحقاق"
          value={newDueDate}
          onChange={onDueDateChange}
          sx={{ mt: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          label="سبب التأجيل"
          value={postponeReason}
          onChange={onReasonChange}
          sx={{ mt: 2 }}
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
        <Button onClick={onConfirm} variant="contained">
          تأجيل
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostponeModal;