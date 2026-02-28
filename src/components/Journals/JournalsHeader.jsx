import React from "react";
import {
  Box,
  Tabs,
  Tab,
  Button,
  InputBase,
  IconButton,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { transparentSearchInputBaseSx } from "../../utilities/searchInputStyles";
const tabStyles = (isActive) => ({
  fontWeight: "bold",
  borderBottom: isActive ? "3px solid #0d40a5" : "none",
  color: isActive ? "#0d40a5" : "text.primary",
});
const buttonStyles = {
  borderColor: "#0d40a5",
  color: "#0d40a5",
  "&:hover": { bgcolor: "rgba(13, 64, 165, 0.1)" },
};
export default function JournalsHeader({
  activeTab,
  onTabChange,
  selectedJournal,
  isAddMode,
  searchQuery,
  onSearchChange,
  searchFilters,
  onOpenAdvancedSearch,
  onClearSearch,
  onAddNew,
  fromPeriod,
  fromProfitDistribution,
  fromInvestorsWithdrawal,
  onBackToPeriodClosing,
  onBackToProfitDistribution,
  onBackToInvestorsWithdrawal,
  onBackToList,
  isSmallScreen,
  permissions,
}) {
  const hasSearch = Object.keys(searchFilters || {}).length > 0 || searchQuery;
  const canAdd = permissions?.includes("journals_Add");
  if (isSmallScreen) {
    return (
      <Box sx={{ mb: 3 }}>
        {activeTab === 1 ? (
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              onClick={
                fromInvestorsWithdrawal
                  ? onBackToInvestorsWithdrawal
                  : fromProfitDistribution
                  ? onBackToProfitDistribution
                  : fromPeriod
                  ? onBackToPeriodClosing
                  : onBackToList
              }
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
              {isAddMode ? "إضافة قيد جديد" : "تفاصيل القيد"}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              القيود المحاسبية
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={onOpenAdvancedSearch}
                size="small"
                sx={buttonStyles}
              >
                بحث متقدم
              </Button>
              {canAdd && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onAddNew}
                  size="small"
                >
                  إضافة
                </Button>
              )}
            </Box>
            <Box sx={{ mb: 2 }}>
              <InputBase
                placeholder="ابحث برقم القيد أو الوصف..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{
                  width: "100%",
                  borderRadius: "6px",
                  p: 1,
                  border: "1px solid #e0e0e0",
                  ...transparentSearchInputBaseSx,
                }}
              />
              {hasSearch && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onClearSearch}
                  size="small"
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  مسح البحث
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => onTabChange(newValue)}
      >
        <Tab label="عرض جميع القيود" sx={tabStyles(activeTab === 0)} />
        <Tab
          label={
            selectedJournal || isAddMode
              ? isAddMode
                ? "إضافة قيد جديد"
                : "تفاصيل القيد"
              : "قيد محدد"
          }
          sx={tabStyles(activeTab === 1)}
        />
      </Tabs>
      {activeTab === 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {canAdd && (
            <InputBase
              placeholder="ابحث برقم القيد..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{
                width: "280px",
                borderRadius: "6px",
                p: 1,
                border: "1px solid #e0e0e0",
                ...transparentSearchInputBaseSx,
              }}
            />
          )}
          {canAdd && (
            <Button
              variant="outlined"
              startIcon={<SearchIcon sx={{ marginLeft: "10px" }} />}
              onClick={onOpenAdvancedSearch}
              sx={buttonStyles}
            >
              بحث متقدم
            </Button>
          )}
          {hasSearch && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClearSearch}
              size="small"
            >
              مسح البحث
            </Button>
          )}
          {canAdd && (
            <Button
              sx={{ fontWeight: "bold" }}
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddNew}
            >
              إضافة قيد جديد
            </Button>
          )}
        </Box>
      )}
      {activeTab === 1 && fromPeriod && (
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBackToPeriodClosing}
          sx={buttonStyles}
        >
          رجوع لتقفيل الفترات
        </Button>
      )}
      {activeTab === 1 && fromProfitDistribution && (
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBackToProfitDistribution}
          sx={buttonStyles}
        >
          رجوع لتوزيع الأرباح
        </Button>
      )}
      {activeTab === 1 && fromInvestorsWithdrawal && (
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBackToInvestorsWithdrawal}
          sx={buttonStyles}
        >
          رجوع لانسحابات المستثمرين
        </Button>
      )}
    </Box>
  );
}