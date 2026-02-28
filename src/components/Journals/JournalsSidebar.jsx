import React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
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
export default function JournalsSidebar({
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
  const formatNumber = (value) =>
    value ? Math.round(value).toLocaleString() : "0";
  const showExportButtons =
    !isAddMode && journalData && permissions.includes("journals_Export");
  const isDraft = journalData?.status === "DRAFT";
  const isPosted = journalData?.status === "POSTED";
  const canEdit = isDraft && !isEditMode && permissions.includes("journals_Update");
  const canSaveEdit =
    isDraft && isEditMode && permissions.includes("journals_Update");
  const balanced = isJournalBalanced(totals.totalDebit, totals.totalCredit);
  return (
    <Box
      sx={{
        width: "350px",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        flexShrink: 0,
      }}
    >
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          معلومات القيد
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="error">إجمالي المدين:</Typography>
            <Typography fontWeight="bold" color="error">
              {formatNumber(totals.totalDebit)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="success.main">إجمالي الدائن:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {formatNumber(totals.totalCredit)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.primary">الفرق:</Typography>
            <Typography
              fontWeight="bold"
              color={(totals.totalBalance || 0) === 0 ? "success.main" : "error"}
            >
              {formatNumber(totals.totalBalance)}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          الإجراءات
        </Typography>
        <Stack spacing={2}>
          {showExportButtons && (
            <>
              <Button
                variant="outlined"
                startIcon={<PDFIcon sx={{ marginLeft: "10px" }} />}
                onClick={onExportPDF}
                sx={{
                  borderColor: "#d32f2f",
                  color: "#d32f2f",
                  "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                }}
              >
                تصدير PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
                onClick={onExportExcel}
                sx={{
                  borderColor: "#2e7d32",
                  color: "#2e7d32",
                  "&:hover": { bgcolor: "rgba(46, 125, 50, 0.1)" },
                }}
              >
                تصدير Excel
              </Button>
              <Divider />
            </>
          )}
          {isAddMode ? (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
                onClick={onCreateJournal}
                disabled={!balanced}
                sx={{
                  bgcolor: "success.main",
                  "&:hover": { bgcolor: "success.dark" },
                }}
              >
                حفظ القيد
              </Button>
              <Button
                variant="outlined"
                onClick={onCancelAdd}
                sx={{
                  borderColor: "grey.500",
                  color: "text.primary",
                }}
              >
                إلغاء
              </Button>
            </>
          ) : canEdit ? (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon sx={{ marginLeft: "10px" }} />}
                onClick={onEditClick}
                sx={{
                  borderColor: "warning.main",
                  color: "warning.main",
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "warning.dark" },
                }}
              >
                تعديل القيد
              </Button>
              {permissions.includes("journals_Post") && (
                <Button
                  variant="contained"
                  startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
                  onClick={onPostJournal}
                  sx={{
                    bgcolor: "success.main",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "success.dark" },
                  }}
                >
                  اعتماد القيد
                </Button>
              )}
              {permissions.includes("journals_Delete") && (
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon sx={{ marginLeft: "10px" }} />}
                  onClick={onDeleteClick}
                  sx={{
                    borderColor: "error.main",
                    color: "error.main",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                  }}
                >
                  حذف القيد
                </Button>
              )}
            </>
          ) : canSaveEdit ? (
            <>
              <Button
                variant="outlined"
                startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
                onClick={onUpdateJournal}
                disabled={!balanced}
                sx={{
                  borderColor: "success.main",
                  color: "success.main",
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "success.dark" },
                }}
              >
                حفظ التعديلات
              </Button>
              <Button
                variant="outlined"
                onClick={onCancelEdit}
                sx={{
                  borderColor: "grey.500",
                  color: "text.primary",
                }}
              >
                إلغاء التعديل
              </Button>
            </>
          ) : isPosted && permissions.includes("journals_Post") ? (
            <Button
              variant="outlined"
              startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
              onClick={onUnpostJournal}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
              }}
            >
              إلغاء الاعتماد
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}