import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  InputBase,
  InputAdornment,
} from "@mui/material";
import { Search, Add, PictureAsPdf as PdfIcon, TableChart as ExcelIcon } from "@mui/icons-material";
import { transparentSearchInputBaseSx } from "../../utilities/searchInputStyles";
const BanksToolbar = ({
  searchQuery,
  onSearchChange,
  onExportPDF,
  onExportExcel,
  onAddBank,
  hasExportPermission,
  hasAddPermission,
  hasData,
  isSmallScreen,
  isDarkMode,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: isSmallScreen ? "column" : "row-reverse",
      justifyContent: isSmallScreen ? "center" : "space-between",
      alignItems: isSmallScreen ? "center" : "center",
      mb: 2,
      gap: isSmallScreen ? 2 : 1,
    }}
  >
    {isSmallScreen && (
      <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ textAlign: "center", width: "100%" }}>
        الحسابات البنكية
      </Typography>
    )}
    <InputBase
      placeholder="ابحث باسم الحساب أو رقم الحساب..."
      value={searchQuery}
      onChange={onSearchChange}
      startAdornment={
        <InputAdornment position="start">
          <Search />
        </InputAdornment>
      }
      sx={{
        width: isSmallScreen ? "100%" : "300px",
        maxWidth: isSmallScreen ? 320 : "none",
        borderRadius: "6px",
        p: 1,
        border: "1px solid",
        borderColor: "divider",
        ...transparentSearchInputBaseSx,
      }}
    />
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      justifyContent={isSmallScreen ? "center" : "flex-start"}
      sx={{ width: isSmallScreen ? "100%" : "auto", maxWidth: isSmallScreen ? 320 : "none" }}
    >
      {hasExportPermission && (
        <>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PdfIcon sx={{ marginLeft: "6px" }} />}
            onClick={onExportPDF}
            disabled={!hasData}
            sx={{
              borderColor: "error.main",
              color: "error.main",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(211, 47, 47, 0.2)" : "rgba(211, 47, 47, 0.1)",
                borderColor: "error.dark"
              },
              borderRadius: 2,
              px: isSmallScreen ? 1.5 : 2,
              py: isSmallScreen ? 1 : 1,
              fontWeight: "bold",
            }}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ExcelIcon sx={{ marginLeft: "6px" }} />}
            onClick={onExportExcel}
            disabled={!hasData}
            sx={{
              borderColor: "success.main",
              color: "success.main",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(46, 125, 50, 0.2)" : "rgba(46, 125, 50, 0.1)",
                borderColor: "success.dark"
              },
              borderRadius: 2,
              px: isSmallScreen ? 1.5 : 2,
              py: isSmallScreen ? 1 : 1,
              fontWeight: "bold",
            }}
          >
            Excel
          </Button>
        </>
      )}
      {hasAddPermission && (
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={onAddBank}
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
            borderRadius: 2,
            px: isSmallScreen ? 2 : 3,
            py: isSmallScreen ? 1 : 1,
            fontWeight: "bold",
          }}
        >
          {isSmallScreen ? "إضافة" : "إضافة حساب بنكي"}
        </Button>
      )}
    </Stack>
  </Box>
);
export default BanksToolbar;