import React from "react";
import { Box, Tabs, Tab, Typography, InputBase, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

export default function PeriodClosingHeader({
  activeTab,
  onTabChange,
  selectedPeriod,
  searchQuery,
  onSearchChange,
  onBackToList,
  isSmallScreen,
}) {
  const tabStyles = (theme, isActive) => ({
    fontWeight: "bold",
    borderBottom: isActive ? `3px solid ${theme.palette.primary.main}` : "none",
    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
  });

  return isSmallScreen ? (
    <Box sx={{ mb: 3 }}>
      {activeTab === 1 ? (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={onBackToList} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
            تفاصيل الفترة
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            تقفيل الفترات
          </Typography>
          <InputBase
            placeholder="ابحث باسم الفترة..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{
              width: "100%",
              borderRadius: "6px",
              p: 1,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: "background.paper",
            }}
          />
        </Box>
      )}
    </Box>
  ) : (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => onTabChange(newValue)}
      >
        <Tab
          label="عرض جميع الفترات"
          sx={(theme) => tabStyles(theme, activeTab === 0)}
        />
        <Tab
          label={selectedPeriod ? "تفاصيل الفترة" : "فترة محددة"}
          sx={(theme) => tabStyles(theme, activeTab === 1)}
        />
      </Tabs>
    </Box>
  );
}
