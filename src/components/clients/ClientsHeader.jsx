import React from "react";
import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import { Edit, Save } from "@mui/icons-material";
import { TAB_LABELS } from "./constants";

export default function ClientsHeader({
  clientDetails,
  tab,
  editMode,
  permissions,
  onTabChange,
  onEditModeToggle,
  onSaveChanges,
}) {
  const showEditButtons =
    tab !== 1 && tab !== 2 && tab !== 3 && tab !== 4 && tab !== 5;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {clientDetails?.client?.name}
          </Typography>
          <Typography color="text.secondary">
            رقم الهوية: {clientDetails?.client?.nationalId}
          </Typography>
        </Box>
        {showEditButtons && (
          <Box sx={{ display: "flex", gap: 2 }}>
            {permissions.includes("clients_Update") && (
              <Button
                variant="outlined"
                startIcon={<Edit sx={{ marginLeft: "10px" }} />}
                onClick={onEditModeToggle}
              >
                {editMode ? "إلغاء التعديل" : "تعديل"}
              </Button>
            )}
            {permissions.includes("clients_Update") && (
              <Button
                variant="contained"
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
      <Tabs
        value={tab}
        onChange={onTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            color: "text.primary",
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
    </>
  );
}
