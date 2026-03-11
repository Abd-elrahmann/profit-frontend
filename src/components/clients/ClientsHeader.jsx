import React from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Save, ArrowBack } from "@mui/icons-material";
import { TAB_LABELS } from "./constants";
export default function ClientsHeader({
  clientDetails,
  tab,
  editMode,
  permissions,
  isMobile = false,
  isSmallScreen = false,
  onTabChange,
  onEditModeToggle,
  onSaveChanges,
  onBackToList,
}) {
  const showEditButtons =
    tab !== 1 && tab !== 2 && tab !== 3 && tab !== 4 && tab !== 5;
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isMobile && onBackToList && (
            <IconButton
              onClick={onBackToList}
              size="small"
              sx={{ flexShrink: 0, transform: "scaleX(-1)" }}
              aria-label="العودة للقائمة"
            >
              <ArrowBack />
            </IconButton>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {clientDetails?.client?.name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              رقم الهوية: {clientDetails?.client?.nationalId}
            </Typography>
          </Box>
        </Box>
        {showEditButtons && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {permissions.includes("clients_Update") && (
              <Button
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                startIcon={<Edit sx={{ marginLeft: "10px" }} />}
                onClick={onEditModeToggle}
              >
                {editMode ? "إلغاء التعديل" : "تعديل"}
              </Button>
            )}
            {permissions.includes("clients_Update") && (
              <Button
                variant="contained"
                size={isMobile ? "small" : "medium"}
                startIcon={<Save sx={{ marginLeft: "10px" }} />}
                sx={{
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
                disabled={!editMode}
                onClick={onSaveChanges}
              >
                حفظ التغييرات
              </Button>
            )}
          </Box>
        )}
      </Box>
      {(isMobile || isSmallScreen) ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <FormControl sx={{ minWidth: 200, maxWidth: 320, width: "100%" }}>
            <Select
            value={tab}
            onChange={(e) => onTabChange(null, e.target.value)}
            displayEmpty
            size="small"
            sx={{
              "& .MuiSelect-select": {
                textAlign: "center",
                py: 1.25,
              },
            }}
          >
            {TAB_LABELS.map((label, index) => (
              <MenuItem key={index} value={index}>
                {label}
              </MenuItem>
            ))}
          </Select>
          </FormControl>
        </Box>
      ) : (
        <Tabs
          value={tab}
          onChange={onTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile={false}
          sx={{
            mb: 3,
            minHeight: 48,
            "& .MuiTab-root": {
              color: "text.primary",
              minWidth: 160,
              "&.Mui-selected": {
                color: "primary.main",
              },
            },
          }}
        >
          {TAB_LABELS.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      )}
    </>
  );
}