import React from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  PictureAsPdf as PDFIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
export default function JournalsActions({
  totals,
  isAddMode,
  journalData,
  isEditMode,
  permissions,
  isJournalBalanced,
  onExportPDF,
  onExportExcel,
  onCreateJournal,
  onCancelAdd,
  onEditClick,
  onPostJournal,
  onDeleteClick,
  onUpdateJournal,
  onCancelEdit,
  onUnpostJournal,
}) {
  const showExportButtons =
    !isAddMode && journalData && permissions.includes("journals_Export");
  const isDraft = journalData?.status === "DRAFT";
  const isPosted = journalData?.status === "POSTED";
  const canEdit = isDraft && !isEditMode && permissions.includes("journals_Update");
  const canSaveEdit =
    isDraft && isEditMode && permissions.includes("journals_Update");
  const balanced = totals
    ? isJournalBalanced(totals.totalDebit, totals.totalCredit)
    : false;

  const actionButtonSx = {
    minWidth: 120,
    px: 2.25,
    py: 0.85,
    fontSize: "0.85rem",
    lineHeight: 1.4,
    borderRadius: 2,
    whiteSpace: "nowrap",
  };
  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="subtitle1" color="primary" fontWeight="bold">
          الإجراءات
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        {showExportButtons && (
          <>
            <Button
              variant="outlined"
              startIcon={<PDFIcon />}
              onClick={onExportPDF}
              size="small"
              color="error"
              sx={actionButtonSx}
            >
              تصدير PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
              onClick={onExportExcel}
              size="small"
              color="success"
              sx={actionButtonSx}
            >
              تصدير Excel
            </Button>
          </>
        )}
        {isAddMode ? (
          <>
            <Button
              variant="contained"
              startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
              onClick={onCreateJournal}
              disabled={!balanced}
              size="small"
              sx={{ ...actionButtonSx, bgcolor: "success.main", py: 1.2 }}
            >
              حفظ القيد
            </Button>
          </>
        ) : canEdit ? (
          <>
            <Button
              variant="contained"
              startIcon={<EditIcon sx={{ marginLeft: "10px" }} />}
              onClick={onEditClick}
              size="small"
              sx={actionButtonSx}
            >
              تعديل القيد
            </Button>
            {permissions.includes("journals_Post") && (
              <Button
                variant="contained"
                startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
                onClick={onPostJournal}
                size="small"
                sx={{ ...actionButtonSx, bgcolor: "success.main" }}
              >
                اعتماد القيد
              </Button>
            )}
            {permissions.includes("journals_Delete") && (
              <Button
                variant="outlined"
                startIcon={<DeleteIcon sx={{ marginLeft: "10px" }} />}
                onClick={onDeleteClick}
                size="small"
                color="error"
                sx={actionButtonSx}
              >
                حذف القيد
              </Button>
            )}
          </>
        ) : canSaveEdit ? (
          <>
            <Button
              variant="contained"
              startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
              onClick={onUpdateJournal}
              disabled={!balanced}
              size="small"
              sx={{ ...actionButtonSx, bgcolor: "success.main" }}
            >
              حفظ التعديلات
            </Button>
            <Button
              variant="outlined"
              onClick={onCancelEdit}
              size="small"
              sx={actionButtonSx}
            >
              إلغاء التعديل
            </Button>
          </>
        ) : isPosted && permissions.includes("journals_Post") ? (
          <Button
            variant="outlined"
            startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
            onClick={onUnpostJournal}
            size="small"
            color="error"
            sx={actionButtonSx}
          >
            إلغاء الاعتماد
          </Button>
        ) : null}
        </Box>
      </Box>
    </Paper>
  );
}
