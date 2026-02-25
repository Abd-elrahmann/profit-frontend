import React from "react";
import { AccountCircle, LocationOn, Work, Add, Edit, Save, Delete } from "@mui/icons-material";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Button,
} from "@mui/material";

const inputSx = (isEditing, isDarkMode) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: isEditing
      ? isDarkMode
        ? "background.paper"
        : "#fff"
      : isDarkMode
      ? "background.default"
      : "#f9fafb",
    borderRadius: "6px",
  },
});

function KafeelFormFields({
  kafeel,
  formData,
  isEditing,
  isDarkMode,
  onInputChange,
}) {
  const data = isEditing ? formData : kafeel;

  const getValue = (field) => {
    if (isEditing) return formData?.[field] ?? "";
    if (field === "birthDate" && kafeel?.birthDate) {
      return new Date(kafeel.birthDate).toISOString().split("T")[0];
    }
    return kafeel?.[field] ?? "";
  };

  return (
    <>
      <Box
        className="flex items-center gap-2 pb-2 mb-3"
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <AccountCircle sx={{ fontSize: 24, color: 'primary.main' }} />
        <Typography variant="subtitle1" fontWeight="bold">
          المعلومات الشخصية
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            اسم الكفيل
          </Typography>
          <TextField
            value={getValue("name")}
            onChange={(e) => onInputChange("name", e.target.value)}
            fullWidth
            disabled={!isEditing}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            رقم هوية الكفيل
          </Typography>
          <TextField
            value={getValue("nationalId")}
            onChange={(e) => onInputChange("nationalId", e.target.value)}
            fullWidth
            disabled={!isEditing}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            تاريخ الميلاد
          </Typography>
          <TextField
            value={getValue("birthDate")}
            onChange={(e) => onInputChange("birthDate", e.target.value)}
            fullWidth
            type="date"
            disabled={!isEditing}
            InputLabelProps={{ shrink: true }}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            className="flex items-center gap-6 pb-2 mt-2 mb-2"
            sx={{ borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Box className="flex items-center gap-2">
              <LocationOn sx={{ fontSize: 24, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                بيانات العنوان
              </Typography>
            </Box>
            <Box className="flex items-center gap-2">
              <Work sx={{ fontSize: 24, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                بيانات العمل والدخل
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            المدينة
          </Typography>
          <TextField
            value={getValue("city")}
            onChange={(e) => onInputChange("city", e.target.value)}
            fullWidth
            disabled={!isEditing}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            جهة العمل
          </Typography>
          <TextField
            value={getValue("employer")}
            onChange={(e) => onInputChange("employer", e.target.value)}
            fullWidth
            disabled={!isEditing}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            الحي
          </Typography>
          <TextField
            value={getValue("district")}
            onChange={(e) => onInputChange("district", e.target.value)}
            fullWidth
            disabled={!isEditing}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            الراتب
          </Typography>
          <TextField
            value={getValue("salary")}
            onChange={(e) => onInputChange("salary", e.target.value)}
            fullWidth
            type="number"
            disabled={!isEditing}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            رقم الجوال
          </Typography>
          <TextField
            value={getValue("phone")}
            onChange={(e) => onInputChange("phone", e.target.value)}
            fullWidth
            disabled={!isEditing}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" mb={1} fontWeight={500}>
            الالتزامات
          </Typography>
          <TextField
            value={getValue("obligations")}
            onChange={(e) => onInputChange("obligations", e.target.value)}
            fullWidth
            type="number"
            disabled={!isEditing}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            البريد الإلكتروني
          </Typography>
          <TextField
            value={getValue("email")}
            onChange={(e) => onInputChange("email", e.target.value)}
            fullWidth
            disabled={!isEditing}
            sx={inputSx(isEditing, isDarkMode)}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default function ClientsKafeelTab({
  clientDetails,
  selectedClient,
  editMode,
  selectedKafeelId,
  kafeelFormData = {}, // Default to empty object
  permissions = [], // Default to empty array
  isDarkMode,
  onAddKafeel,
  onEditKafeel,
  onCancelEdit,
  onSaveKafeel,
  onDeleteKafeel,
  onKafeelInputChange,
}) {
  const hasMultipleKafeels =
    clientDetails?.kafeels && clientDetails.kafeels.length > 0;
  const hasSingleKafeel = clientDetails?.kafeel;

  if (!clientDetails) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">معلومات الكفيل</Typography>
        {selectedClient && permissions.includes("clients_Add") && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddKafeel}
            sx={{
              bgcolor: "primary.main",
              fontWeight: "bold",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {hasMultipleKafeels || hasSingleKafeel ? "إضافة كفيل آخر" : "إضافة كفيل"}
          </Button>
        )}
      </Box>

      {hasMultipleKafeels ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {clientDetails.kafeels.map((kafeel, index) => {
            const isEditingThisKafeel =
              editMode &&
              selectedKafeelId !== null &&
              Number(selectedKafeelId) === Number(kafeel.id);
            const currentFormData = isEditingThisKafeel
              ? kafeelFormData
              : kafeel;

            return (
              <Box key={kafeel.id || index}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" color="primary">
                    الكفيل {index + 1} -{" "}
                    {isEditingThisKafeel
                      ? currentFormData?.name || kafeel.name
                      : kafeel.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {permissions.includes("clients_Update") && (
                      <>
                        {!isEditingThisKafeel ? (
                          <Button
                            variant="outlined"
                            startIcon={<Edit sx={{ ml: 1 }} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const kafeelIdToEdit = Number(kafeel.id);
                              if (!kafeelIdToEdit || isNaN(kafeelIdToEdit)) {
                                return;
                              }
                              onEditKafeel(kafeel);
                            }}
                          >
                            تعديل
                          </Button>
                        ) : (
                          <>
                            <Button variant="outlined" onClick={onCancelEdit}>
                              إلغاء
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<Save sx={{ ml: 1 }} />}
                              sx={{
                                bgcolor: "primary.main",
                                "&:hover": { bgcolor: "primary.dark" },
                              }}
                              onClick={() => onSaveKafeel(kafeel.id)}
                            >
                              حفظ
                            </Button>
                          </>
                        )}
                      </>
                    )}
                    {permissions.includes("clients_Delete") &&
                      !isEditingThisKafeel && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete sx={{ ml: 1 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDeleteKafeel(kafeel);
                        }}
                      >
                        حذف
                      </Button>
                    )}
                  </Box>
                </Box>
                <KafeelFormFields
                  kafeel={kafeel}
                  formData={kafeelFormData}
                  isEditing={isEditingThisKafeel}
                  isDarkMode={isDarkMode}
                  onInputChange={onKafeelInputChange}
                />
                {index < clientDetails.kafeels.length - 1 && (
                  <Box
                    sx={{ borderBottom: "1px solid #e0e0e0", my: 3 }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      ) : hasSingleKafeel ? (
        <Box>
          <KafeelFormFields
            kafeel={clientDetails.kafeel}
            formData={kafeelFormData}
            isEditing={editMode}
            isDarkMode={isDarkMode}
            onInputChange={onKafeelInputChange}
          />
        </Box>
      ) : (
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
        >
          لا يوجد كفيل لهذا العميل
        </Typography>
      )}
    </Paper>
  );
}