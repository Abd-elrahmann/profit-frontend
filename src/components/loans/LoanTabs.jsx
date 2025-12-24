import React from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";

const LoanTabs = ({
  activeTab,
  setActiveTab,
  resetLoanForm,
  isSmallScreen,
  permissions,
  isClientConversion,
  isViewMode,
  isEditMode,
  isAdditionalLoan,
  searchQuery,
  onSearchChange,
}) => {

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        mb: isSmallScreen ? 2 : 4,
      }}
    >
      {/* Header with Tabs and Search */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
        }}
      >
        <Tabs
        value={activeTab}
        onChange={(e, newValue) => {
          setActiveTab(newValue);
          if (newValue === 0 || newValue === 2 || newValue === 3) {
            resetLoanForm();
          }
        }}
        variant={"scrollable"}
        scrollButtons={"auto"}
        sx={{
          "& .MuiTab-root": {
            fontSize: isSmallScreen ? "0.875rem" : "0.85rem",
            minWidth: isSmallScreen ? "auto" : 72,
            padding: isSmallScreen ? "12px 8px" : "12px 16px",
          },
        }}
      >
        <Tab
          label="جميع السلفات"
          sx={{
            fontWeight: "bold",
            borderBottom: activeTab === 0 ? "3px solid" : "none",
            borderBottomColor: activeTab === 0 ? "primary.main" : "transparent",
            color: activeTab === 0 ? "primary.main" : "black",
          }}
        />
        {permissions.includes("loans_Add") && (
          <Tab
            label={
              isClientConversion
                ? "نقل مديونية السلفة"
                : isViewMode
                ? "عرض تفاصيل السلفة"
                : isEditMode
                ? "تعديل السلفة"
                : isAdditionalLoan
                ? "إنشاء سلفة إضافية"
                : "إنشاء سلفة جديدة"
            }
            sx={{
              fontWeight: "bold",
              borderBottom: activeTab === 1 ? "3px solid" : "none",
              borderBottomColor: activeTab === 1 ? "primary.main" : "transparent",
              color: activeTab === 1 ? "primary.main" : "black",
            }}
          />
        )}
        <Tab
          label="إنشاء سلفة بدون فائدة"
          sx={{
            fontWeight: "bold",
            borderBottom: activeTab === 2 ? "3px solid" : "none",
            borderBottomColor: activeTab === 2 ? "primary.main" : "transparent",
            color: activeTab === 2 ? "primary.main" : "black",
          }}
        />
        <Tab
          label="عرض السلفات بدون فائدة"
          sx={{
            fontWeight: "bold",
            borderBottom: activeTab === 3 ? "3px solid" : "none",
            borderBottomColor: activeTab === 3 ? "primary.main" : "transparent",
            color: activeTab === 3 ? "primary.main" : "black",
          }}
        />
      </Tabs>

      {/* Search Bar - Only show in tab 0 (جميع السلفات) */}
      {activeTab === 0 && (
        <TextField
          size="small"
          placeholder="ابحث باسم العميل أو رقم السلفة..."
          value={searchQuery || ""}
          onChange={(e) => onSearchChange && onSearchChange(e)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            width: isSmallScreen ? "200px" : "300px",
            "& .MuiOutlinedInput-root": {
              height: "40px",
            },
          }}
        />
      )}
    </Box>
    </Box>
  );
};

export default LoanTabs;
