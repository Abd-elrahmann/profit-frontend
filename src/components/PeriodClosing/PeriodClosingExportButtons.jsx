import React from "react";
import { Box, Button } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

export default function PeriodClosingExportButtons({
  onExportPDF,
  onExportExcel,
  isExporting,
  permissions,
  size = "small",
  variant = "outlined",
}) {
  if (!permissions?.includes("period_Export")) return null;

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button
        variant={variant}
        size={size}
        startIcon={<PictureAsPdfIcon />}
        onClick={onExportPDF}
        disabled={isExporting}
        sx={{
          color: "#d32f2f",
          borderColor: "#d32f2f",
          "&:hover": {
            borderColor: "#b71c1c",
            bgcolor: "rgba(211, 47, 47, 0.04)",
          },
        }}
      >
        PDF
      </Button>
      <Button
        variant={variant}
        size={size}
        startIcon={<DescriptionIcon />}
        onClick={onExportExcel}
        disabled={isExporting}
        sx={{
          color: "#2e7d32",
          borderColor: "#2e7d32",
          "&:hover": {
            borderColor: "#1b5e20",
            bgcolor: "rgba(46, 125, 50, 0.04)",
          },
        }}
      >
        Excel
      </Button>
    </Box>
  );
}
