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
} from "@mui/material";
import { FaExclamationTriangle } from "react-icons/fa";
import { Delete, Close } from "@mui/icons-material";

const DeleteModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
  ButtonText,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        {title || "حذف الموظف"}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 2,
          }}
        >
          <FaExclamationTriangle size={48} color="#f44336" />
          <Typography>
            {message || "هل أنت متأكد من حذف هذا الموظف؟"}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row-reverse",
          gap: 2,
          px: 2,
          py: 2,
          pb: 2,
        }}
      >
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          startIcon={<Close />}
          size="small"
        >
          { "إلغاء"}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isLoading}
          startIcon={<Delete />}
          size="small"
        >
          {ButtonText || "حذف"}
          {isLoading && (
            <CircularProgress
              size={16}
              color="inherit"
              style={{ marginLeft: 8 }}
            />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteModal;
