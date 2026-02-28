import React from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  InputBase,
  IconButton,
  Stack,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PDFIcon,
  TableRows as ExcelIcon,
} from "@mui/icons-material";
import { transparentSearchInputBaseSx } from "../../utilities/searchInputStyles";
export default function ProfitDistributionHeader({
  activeTab,
  onTabChange,
  selectedPeriod,
  searchQuery,
  onSearchChange,
  onBackToList,
  onBackToSaving,
  onBackToPeriodClosing,
  cameFromSaving,
  cameFromPeriodClosing,
  isSmallScreen,
  theme,
  permissions,
  onExportPDF,
  onExportExcel,
  isExporting,
}) {
  const tabStyles = (isActive) => ({
    fontWeight: "bold",
    borderBottom: isActive
      ? `3px solid ${theme.palette.primary.main}`
      : "none",
    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
  });
  if (isSmallScreen) {
    return (
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select
            value={activeTab}
            onChange={(e) => onTabChange(Number(e.target.value))}
            sx={{
              fontWeight: "bold",
              "& .MuiSelect-select": { textAlign: "right", py: 1.5 },
            }}
          >
            <MenuItem value={0}>الفترات المقفلة</MenuItem>
            <MenuItem value={1}>{selectedPeriod ? "تفاصيل التوزيع" : "توزيع محدد"}</MenuItem>
          </Select>
        </FormControl>
        {activeTab === 1 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              justifyContent: "center",
            }}
          >
            {cameFromPeriodClosing ? (
              <IconButton onClick={onBackToPeriodClosing} size="small">
                <ArrowBackIcon />
              </IconButton>
            ) : cameFromSaving ? (
              <IconButton onClick={onBackToSaving} size="small">
                <ArrowBackIcon />
              </IconButton>
            ) : (
              <IconButton onClick={onBackToList} size="small">
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                تفاصيل التوزيع
              </Typography>
              {permissions?.includes("distribution_Export") && (
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={onExportPDF}
                    disabled={isExporting}
                    sx={{ color: "#d32f2f" }}
                    title="تصدير PDF"
                  >
                    <PDFIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={onExportExcel}
                    disabled={isExporting}
                    sx={{ color: "success.main" }}
                    title="تصدير Excel"
                  >
                    <ExcelIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              توزيع الأرباح
            </Typography>
            <InputBase
              placeholder="ابحث باسم الفترة..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              sx={{
                width: "100%",
                borderRadius: "6px",
                p: 1,
                border: `1px solid ${theme.palette.divider}`,
                ...transparentSearchInputBaseSx,
              }}
            />
          </Box>
        )}
      </Box>
    );
  }
  return (
    <>
      {(cameFromSaving || cameFromPeriodClosing) && activeTab === 1 && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={
              cameFromPeriodClosing ? onBackToPeriodClosing : onBackToSaving
            }
            size="small"
            sx={{ mr: 1 }}
            title={
              cameFromPeriodClosing
                ? "العودة إلى صفحة التقفيل"
                : "العودة إلى صفحة المدخرات"
            }
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {cameFromPeriodClosing
              ? "العودة إلى صفحة التقفيل"
              : "العودة إلى صفحة المدخرات"}
          </Typography>
        </Box>
      )}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => onTabChange(newValue)}>
          <Tab
            label="الفترات المقفلة"
            sx={tabStyles(activeTab === 0)}
          />
          <Tab
            label={selectedPeriod ? "تفاصيل التوزيع" : "توزيع محدد"}
            sx={tabStyles(activeTab === 1)}
          />
        </Tabs>
      </Box>
    </>
  );
}