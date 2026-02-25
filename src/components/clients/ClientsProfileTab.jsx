import React from "react";
import { AccountCircle, LocationOn, Work, Note } from "@mui/icons-material";
import { Box, Typography, TextField, Grid, Paper } from "@mui/material";

export default function ClientsProfileTab({
  clientDetails,
  clientFormData,
  editMode,
  isDarkMode,
  onClientInputChange,
}) {
  const client = clientDetails?.client;
  if (!client) return null;

  const getValue = (field) =>
    editMode ? clientFormData[field] : client[field];

  const getDisplayValue = (field, fallback = "") =>
    editMode ? clientFormData[field] ?? "" : client[field] ?? fallback;

  const textFieldSx = (isEditable) => ({
    "& .MuiOutlinedInput-root": {
      backgroundColor: isEditable
        ? isDarkMode
          ? "background.paper"
          : "#fff"
        : isDarkMode
        ? "background.default"
        : "#f9fafb",
      borderRadius: "6px",
      "&:hover fieldset": isEditable
        ? { borderColor: "primary.main" }
        : undefined,
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper sx={{ p: 3, mb: 0 }}>
        {/* المعلومات الشخصية */}
        <Box
          className="flex items-center gap-2 pb-2 mb-4"
          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
        >
          <AccountCircle sx={{ fontSize: 24, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            المعلومات الشخصية
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>الاسم الكامل</Typography>
            <TextField
              value={getValue("name")}
              onChange={(e) => onClientInputChange("name", e.target.value)}
              fullWidth
              disabled={!editMode}
              sx={{ ...textFieldSx(editMode), "& .MuiOutlinedInput-root": { width: "280px" } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>البريد الإلكتروني</Typography>
            <TextField
              value={getDisplayValue("email", "لا يوجد بريد إلكتروني")}
              onChange={(e) => onClientInputChange("email", e.target.value)}
              fullWidth
              disabled={!editMode}
              sx={{ "& .MuiOutlinedInput-root": { width: "280px" } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>رقم الهوية الوطنية</Typography>
            <TextField value={client.nationalId} fullWidth disabled sx={{ "& .MuiOutlinedInput-root": { width: "280px" } }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>رقم الجوال</Typography>
            <TextField
              value={getValue("phone")}
              onChange={(e) => onClientInputChange("phone", e.target.value)}
              fullWidth
              disabled={!editMode}
              sx={textFieldSx(editMode)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>تاريخ الميلاد</Typography>
            <TextField
              value={
                editMode
                  ? clientFormData.birthDate ?? ""
                  : client.birthDate
                  ? new Date(client.birthDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => onClientInputChange("birthDate", e.target.value)}
              fullWidth
              type="date"
              disabled={!editMode}
              sx={textFieldSx(editMode)}
            />
          </Grid>
        </Grid>

        {/* بيانات العنوان - سطر جديد كامل، ثم حقوله تحته */}
        <Box sx={{ width: "100%", mt: 4 }}>
          <Box
            className="flex items-center gap-2 pb-2 mb-2"
            sx={{ borderBottom: "1px solid", borderColor: "divider" }}
          >
            <LocationOn sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              بيانات العنوان
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>المدينة</Typography>
              <TextField
                value={getValue("city")}
                onChange={(e) => onClientInputChange("city", e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={textFieldSx(editMode)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>الحي</Typography>
              <TextField
                value={getValue("district")}
                onChange={(e) => onClientInputChange("district", e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={textFieldSx(editMode)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>العنوان التفصيلي</Typography>
              <TextField
                value={getDisplayValue("address")}
                onChange={(e) => onClientInputChange("address", e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={textFieldSx(editMode)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* بيانات العمل والدخل - سطر جديد كامل، ثم حقوله تحته */}
        <Box sx={{ width: "100%", mt: 4 }}>
          <Box
            className="flex items-center gap-2 pb-2 mb-2"
            sx={{ borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Work sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              بيانات العمل والدخل
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>جهة العمل</Typography>
              <TextField
                value={getValue("employer")}
                onChange={(e) => onClientInputChange("employer", e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={textFieldSx(editMode)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>الراتب الشهري</Typography>
              <TextField
                value={getValue("salary")}
                onChange={(e) => onClientInputChange("salary", e.target.value)}
                fullWidth
                type="number"
                disabled={!editMode}
                sx={textFieldSx(editMode)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>الالتزامات الشهرية</Typography>
              <TextField
                value={getValue("obligations")}
                onChange={(e) => onClientInputChange("obligations", e.target.value)}
                fullWidth
                type="number"
                disabled={!editMode}
                sx={textFieldSx(editMode)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>سبب الإنشاء</Typography>
              <TextField
                value={getDisplayValue("creationReason")}
                onChange={(e) => onClientInputChange("creationReason", e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={textFieldSx(editMode)}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box
          className="flex items-center gap-2 pb-2 mb-4"
          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Note sx={{ fontSize: 24, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            ملاحظات
          </Typography>
        </Box>
        <TextField
          value={getDisplayValue("notes")}
          onChange={(e) => onClientInputChange("notes", e.target.value)}
          fullWidth
          multiline
          rows={3}
          disabled={!editMode}
          placeholder="لا توجد ملاحظات"
          sx={textFieldSx(editMode)}
        />
      </Paper>
    </Box>
  );
}
