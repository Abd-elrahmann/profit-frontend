import React from "react";
import {
  Paper,
  Typography,
  Stack,
  Button,
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

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
        الإجراءات
      </Typography>
      <Stack spacing={1}>
        {showExportButtons && (
          <>
            <Button
              variant="outlined"
              startIcon={<PDFIcon />}
              onClick={onExportPDF}
              fullWidth
              size="small"
              color="error"
            >
              تصدير PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
              onClick={onExportExcel}
              fullWidth
              size="small"
              color="success"
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
              fullWidth
              size="small"
              sx={{ bgcolor: "success.main" }}
            >
              حفظ القيد
            </Button>
            <Button
              variant="outlined"
              onClick={onCancelAdd}
              fullWidth
              size="small"
            >
              إلغاء
            </Button>
          </>
        ) : canEdit ? (
          <>
            <Button
              variant="contained"
              startIcon={<EditIcon sx={{ marginLeft: "10px" }} />}
              onClick={onEditClick}
              fullWidth
              size="small"
            >
              تعديل القيد
            </Button>
            {permissions.includes("journals_Post") && (
              <Button
                variant="contained"
                startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
                onClick={onPostJournal}
                fullWidth
                size="small"
                sx={{ bgcolor: "success.main" }}
              >
                اعتماد القيد
              </Button>
            )}
            {permissions.includes("journals_Delete") && (
              <Button
                variant="outlined"
                startIcon={<DeleteIcon sx={{ marginLeft: "10px" }} />}
                onClick={onDeleteClick}
                fullWidth
                size="small"
                color="error"
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
              fullWidth
              size="small"
              sx={{ bgcolor: "success.main" }}
            >
              حفظ التعديلات
            </Button>
            <Button
              variant="outlined"
              onClick={onCancelEdit}
              fullWidth
              size="small"
            >
              إلغاء التعديل
            </Button>
          </>
        ) : isPosted && permissions.includes("journals_Post") ? (
          <Button
            variant="outlined"
            startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
            onClick={onUnpostJournal}
            fullWidth
            size="small"
            color="error"
          >
            إلغاء الاعتماد
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}
