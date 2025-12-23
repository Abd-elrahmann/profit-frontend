import React from "react";
import {
  Typography,
  Stack,
  Box,
  Paper,
  Alert,
  Divider,
  Chip,
} from "@mui/material";

const LoanSimulation = ({
  isSmallScreen,
  simulationSummary,
  loanForm,
  isViewMode,
  isEditMode,
  formatAmount,
}) => {
  if (!isSmallScreen) {
    // Desktop version - sidebar simulation
    return (
      <Box
        sx={{
          width: isSmallScreen ? "300px" : "350px",
          borderRight: "1px solid #ddd",
          bgcolor: "#fafafa",
          height: "100%",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            p: isSmallScreen ? 2 : 3,
            borderBottom: "1px solid #ddd",
            bgcolor: "#fafafa",
          }}
        >
          <Typography
            variant={isSmallScreen ? "subtitle1" : "h6"}
            fontWeight="bold"
            mb={isSmallScreen ? 2 : 3}
          >
            محاكاة السلفة
          </Typography>
          {simulationSummary && loanForm.type ? (
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography color="text.secondary">
                  {simulationSummary.loanType === "DAILY"
                    ? "عدد الأيام"
                    : simulationSummary.loanType === "WEEKLY"
                    ? "عدد الأسابيع"
                    : "عدد الأشهر"}
                </Typography>
                <Typography
                  color="primary.main"
                  fontWeight="bold"
                  fontSize="20px"
                >
                  {simulationSummary.durationText}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography color="text.secondary">
                  إجمالي الفائدة
                </Typography>
                <Typography color="#333" fontSize="16px">
                  {formatAmount(simulationSummary.totalInterest.toFixed(2))}{" "}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography color="text.secondary">
                  المبلغ الإجمالي المستحق
                </Typography>
                <Typography color="#333" fontSize="16px">
                  {formatAmount(simulationSummary.totalAmount.toFixed(2))}{" "}
                </Typography>
              </Box>


              <Divider />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography color="text.secondary">حالة السلفة</Typography>
                <Chip
                  label={
                    isViewMode
                      ? "عرض"
                      : isEditMode
                      ? "تحت التعديل"
                      : "جديد"
                  }
                  sx={{
                    backgroundColor: isViewMode
                      ? "rgba(100, 100, 100, 0.2)"
                      : isEditMode
                      ? "rgba(214, 158, 46, 0.2)"
                      : "rgba(56, 161, 105, 0.2)",
                    color: isViewMode
                      ? "#666"
                      : isEditMode
                      ? "#D69E2E"
                      : "#38A169",
                    fontWeight: "bold",
                  }}
                />
              </Box>
            </Stack>
          ) : (
            <Alert severity="info">أدخل بيانات السلفة لعرض المحاكاة</Alert>
          )}
        </Box>
      </Box>
    );
  }

  // Mobile version - inline simulation
  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        bgcolor: "#fafafa",
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        محاكاة السلفة
      </Typography>
      {simulationSummary && loanForm.type ? (
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              {simulationSummary.loanType === "DAILY"
                ? "الدفعة اليومية"
                : simulationSummary.loanType === "WEEKLY"
                ? "الدفعة الأسبوعية"
                : "الدفعة الشهرية"}
            </Typography>
            <Typography
              color="primary.main"
              fontWeight="bold"
              fontSize="18px"
            >
              {formatAmount(simulationSummary.paymentAmount.toString())}{" "}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              {simulationSummary.durationLabel}
            </Typography>
            <Typography
              color="primary.main"
              fontWeight="bold"
              fontSize="16px"
            >
              {simulationSummary.durationText}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              إجمالي الفائدة
            </Typography>
            <Typography color="#333" fontSize="14px">
              {formatAmount(simulationSummary.totalInterest.toFixed(2))}{" "}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              المبلغ الإجمالي المستحق
            </Typography>
            <Typography color="#333" fontSize="14px">
              {formatAmount(simulationSummary.totalAmount.toFixed(2))}{" "}
            </Typography>
          </Box>

          <Divider />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              حالة السلفة
            </Typography>
            <Chip
              label={
                isViewMode
                  ? "عرض"
                  : isEditMode
                  ? "تحت التعديل"
                  : "جديد"
              }
              size="small"
              sx={{
                backgroundColor: isViewMode
                  ? "rgba(100, 100, 100, 0.2)"
                  : isEditMode
                  ? "rgba(214, 158, 46, 0.2)"
                  : "rgba(56, 161, 105, 0.2)",
                color: isViewMode
                  ? "#666"
                  : isEditMode
                  ? "#D69E2E"
                  : "#38A169",
                fontWeight: "bold",
              }}
            />
          </Box>
        </Stack>
      ) : (
        <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
          أدخل بيانات السلفة لعرض المحاكاة
        </Alert>
      )}
    </Paper>
  );
};

export default LoanSimulation;
