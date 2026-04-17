import React from "react";
import {
  Paper,
  Typography,
  Stack,
  Box,
  TextField,
  MenuItem,
  Chip as MuiChip,
  Grid,
} from "@mui/material";
import { JOURNAL_TYPES } from "./constants";
import { getJournalSourceTypeText, getStatusText } from "./journalsUtils";
export default function JournalsDetailsForm({
  journalData,
  editForm,
  newJournalForm,
  isAddMode,
  isEditMode,
  onInputChange,
  variant = "mobile",
  embed = false,
}) {
  const form = isAddMode ? newJournalForm : editForm;
  const isEditable = isEditMode || isAddMode;
  const isDesktop = variant === "desktop";
  const getTypeLabel = (type) => {
    const found = JOURNAL_TYPES.find((t) => t.value === type);
    return found?.label || "-";
  };
  const dateValue = isAddMode
    ? newJournalForm.date
    : isEditMode
    ? editForm.date
    : journalData?.date
    ? journalData.date.split("T")[0]
    : "";
  const typeValue = isAddMode
    ? newJournalForm.type
    : isEditMode
    ? editForm.type
    : journalData?.type || "";
  const descriptionValue = isAddMode
    ? newJournalForm.description
    : isEditMode
    ? editForm.description
    : journalData?.description || "";
  if (isDesktop) {
    const desktopContent = (
      <>
        <Typography
          variant="h6"
          color="primary"
          fontWeight="bold"
          mb={3}
          textAlign="center"
        >
          {isAddMode ? "إضافة قيد جديد" : "تفاصيل القيد"}
        </Typography>
        {isAddMode ? (
          <Grid
            container
            spacing={2}
            mb={4}
            alignItems="center"
            justifyContent="center"
            sx={{ width: "100%", m: 0 }}
          >
            <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
              <TextField
                sx={{ width: 250 }}
                label="التاريخ"
                type="date"
                value={dateValue}
                onChange={(e) => onInputChange("date", e.target.value)}
                disabled={!isEditable}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
              <TextField
                sx={{ width: 250 }}
                label="نوع القيد"
                select
                value={typeValue}
                onChange={(e) => onInputChange("type", e.target.value)}
                disabled={!isEditable}
                InputLabelProps={{ shrink: true }}
              >
                {JOURNAL_TYPES.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
              <TextField
                sx={{ width: 250 }}
                label="الوصف"
                value={descriptionValue}
                onChange={(e) => onInputChange("description", e.target.value)}
                disabled={!isEditable}
                multiline
                rows={1}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3} mb={4} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label="التاريخ"
                type="date"
                value={dateValue}
                onChange={(e) => onInputChange("date", e.target.value)}
                disabled={!isEditable}
                InputLabelProps={{ shrink: true }}
                sx={{ width: "250px" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="نوع القيد"
                select
                value={typeValue}
                onChange={(e) => onInputChange("type", e.target.value)}
                disabled={!isEditable}
                InputLabelProps={{ shrink: true }}
                sx={{ width: "250px" }}
              >
                {JOURNAL_TYPES.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="نوع المصدر"
                value={
                  journalData?.sourceType
                    ? getJournalSourceTypeText(journalData.sourceType)
                    : "لا يوجد"
                }
                disabled
                InputLabelProps={{ shrink: true }}
                sx={{ width: "250px" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="الحالة"
                value={getStatusText(journalData?.status)}
                disabled
                InputLabelProps={{ shrink: true }}
                sx={{ width: "250px" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="المعتمد بواسطة"
                value={journalData?.postedBy?.name || "لم يتم الاعتماد "}
                disabled
                InputLabelProps={{ shrink: true }}
                sx={{ width: "250px" }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="الوصف"
                value={descriptionValue}
                onChange={(e) => onInputChange("description", e.target.value)}
                disabled={!isEditable}
                multiline
                rows={1}
                InputLabelProps={{ shrink: true }}
                sx={{ width: "450px" }}
              />
            </Grid>
          </Grid>
        )}
      </>
    );
    if (embed) {
      return desktopContent;
    }
    return (
      <Paper sx={{ p: 4, borderRadius: 2, bgcolor: "background.paper" }}>
        {desktopContent}
      </Paper>
    );
  }
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        mb: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
        معلومات القيد
      </Typography>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            التاريخ
          </Typography>
          {isEditable ? (
            <TextField
              type="date"
              value={form.date}
              onChange={(e) => onInputChange("date", e.target.value)}
              sx={{ width: "250px" }}
            />
          ) : (
            <Typography variant="body1" fontWeight="bold">
              {journalData?.date
                ? new Date(journalData.date).toLocaleDateString("ar-EG")
                : "-"}
            </Typography>
          )}
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            نوع القيد
          </Typography>
          {isEditable ? (
            <TextField
              select
              value={form.type}
              onChange={(e) => onInputChange("type", e.target.value)}
              sx={{ width: "250px" }}
              InputLabelProps={{ shrink: true }}
            >
              {JOURNAL_TYPES.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Typography variant="body1" fontWeight="bold">
              {getTypeLabel(journalData?.type)}
            </Typography>
          )}
        </Box>
        {!isAddMode && (
          <>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                نوع المصدر
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {getJournalSourceTypeText(journalData?.sourceType)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                الحالة
              </Typography>
              <MuiChip
                label={getStatusText(journalData?.status)}
                color={
                  journalData?.status === "POSTED"
                    ? "success"
                    : journalData?.status === "DRAFT"
                    ? "warning"
                    : "error"
                }
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                المعتمد بواسطة
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {journalData?.postedBy?.name || "لم يتم الاعتماد"}
              </Typography>
            </Box>
          </>
        )}
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            الوصف
          </Typography>
          {isEditable ? (
            <TextField
              value={form.description}
              onChange={(e) => onInputChange("description", e.target.value)}
              multiline
              rows={2}
              sx={{ width: "250px" }}
              InputLabelProps={{ shrink: true }}
            />
          ) : (
            <Typography variant="body1" fontWeight="medium">
              {journalData?.description || "-"}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
