import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";

const LoanContractPreview = ({
  open,
  onClose,
  contractHtml,
  onGeneratePDF,
  loading,
  title = "معاينة العقد"
}) => {

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: "Cairo","Noto Sans Arabic",sans-serif !important;
              padding: 20px;
              direction: rtl;
            }
          </style>
        </head>
        <body>${contractHtml}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography fontWeight="bold">{title}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          height: "80vh",
          overflow: "auto",
          bgcolor: "#fff",
          border: "1px solid #ddd",
        }}
      >
        <Box
          id="contract-preview"
          sx={{
            p: 3,
            "& *": { fontFamily: `"Cairo","Noto Sans Arabic",sans-serif` },
          }}
          dangerouslySetInnerHTML={{ __html: contractHtml }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          طباعة
        </Button>

        <Button
          variant="contained"
          disabled={loading}
          startIcon={<DownloadIcon />}
          onClick={onGeneratePDF}
        >
          {loading ? "جاري التصدير..." : "تصدير PDF"}
        </Button>

        <Button variant="text" onClick={onClose}>
          إغلاق
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanContractPreview;
