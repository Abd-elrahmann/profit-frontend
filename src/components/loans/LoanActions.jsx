import React from "react";
import {
  Typography,
  Stack,
  Box,
  Paper,
  Alert,
  Button,
} from "@mui/material";

const LoanActions = ({
  isViewMode,
  selectedLoan,
  canEditLoan,
  handleEditLoan,
  handleSaveLoan,
  isFormValid,
  isEditMode,
  handleOpenPreview,
  savedLoanData,
  // eslint-disable-next-line no-unused-vars
  selectedLoan: selectedLoanForPreview,
  onCancelEdit,
  isClientConversion,
  selectedClient,
  isConverting,
  onCancelConversion,
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        الإجراءات
      </Typography>
      <Stack spacing={1.5}>
        {isClientConversion && selectedClient && (
          <>
            <Button
              variant="contained"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('convert-loan'));
              }}
              disabled={isConverting}
              fullWidth
              sx={{
                bgcolor: "primary.main",
                height: "44px",
                fontSize: "14px",
                fontWeight: "bold",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              تأكيد نقل المديونيه
            </Button>

            <Button
              variant="outlined"
              onClick={onCancelConversion}
              disabled={isConverting}
              fullWidth
              sx={{
                borderColor: "rgba(255, 0, 0, 0.5)",
                color: "error.main",
                height: "44px",
                fontSize: "14px",
                fontWeight: "bold",
                "&:hover": { bgcolor: "rgba(255, 0, 0, 0.1)" },
              }}
            >
              إلغاء
            </Button>
          </>
        )}

        {isViewMode && selectedLoan?.status === "ACTIVE" && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-installments', { detail: selectedLoan.id }))}
                sx={{ fontWeight: "bold" }}
              >
                عرض الدفعات
              </Button>
            }
          >
            لا يمكنك تعديل هذه السلفة لأنها في حالة نشطة. للتعديل يجب إلغاء تفعيل السلفة أولاً.
          </Alert>
        )}

        {!isViewMode && !isClientConversion && (
          <Button
            variant="contained"
            onClick={handleSaveLoan}
            disabled={!isFormValid}
            fullWidth
            sx={{
              bgcolor: "primary.main",
              height: "44px",
              fontSize: "14px",
              fontWeight: "bold",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {isClientConversion ? "تأكيد نقل المديونيه" : isEditMode ? "حفظ التعديلات" : "إنشاء السلفة"}
          </Button>
        )}

        {isViewMode && canEditLoan && (
          <Button
            variant="contained"
            onClick={handleEditLoan}
            fullWidth
            sx={{
              bgcolor: "primary.main",
              height: "44px",
              fontSize: "14px",
              fontWeight: "bold",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            تعديل السلفة
          </Button>
        )}

        {!isClientConversion && (
          <Button
            variant="outlined"
            onClick={handleOpenPreview}
            disabled={!savedLoanData && (!isViewMode || (selectedLoan?.DEBT_ACKNOWLEDGMENT && selectedLoan?.PROMISSORY_NOTE))}
            fullWidth
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              height: "44px",
              fontSize: "14px",
              fontWeight: "bold",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.1)" },
            }}
          >
            معاينة العقود
          </Button>
        )}

        {isEditMode && (
          <Button
            variant="outlined"
            onClick={onCancelEdit}
            fullWidth
            sx={{
              borderColor: "rgba(255, 0, 0, 0.5)",
              color: "error.main",
              height: "44px",
              fontSize: "14px",
              fontWeight: "bold",
              "&:hover": { bgcolor: "rgba(255, 0, 0, 0.1)" },
            }}
          >
            إلغاء التعديل
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default LoanActions;
