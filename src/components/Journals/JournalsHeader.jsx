import React from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
const buttonStyles = {
  borderColor: "#0d40a5",
  color: "#0d40a5",
  "&:hover": { bgcolor: "rgba(13, 64, 165, 0.1)" },
};
export default function JournalsHeader({
  activeTab,
  isAddMode,
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
  const hasSearch = Object.keys(searchFilters || {}).length > 0;
  const canAdd = permissions?.includes("journals_Add");
  const isAddFormView = activeTab === 1 && isAddMode;
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
            {hasSearch && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={onClearSearch}
                size="small"
                fullWidth
              >
                مسح البحث
              </Button>
            )}
          </Box>
        )}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        borderBottom: activeTab === 0 && !isAddFormView ? 1 : 0,
        borderColor: "divider",
        mb: isAddFormView ? 0 : 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {activeTab === 0 && !isAddFormView && (
        <Typography variant="h6" fontWeight="bold">
          القيود المحاسبية
        </Typography>
      )}

      {activeTab === 0 ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SearchIcon sx={{ marginLeft: "10px" }} />}
            onClick={onOpenAdvancedSearch}
            sx={buttonStyles}
          >
            بحث متقدم
          </Button>
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
      ) : null}

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