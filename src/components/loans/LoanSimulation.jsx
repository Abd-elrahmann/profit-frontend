import React from "react";
import {
  Typography,
  Stack,
  Box,
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
    return (
      <Box
        sx={{
          width: isSmallScreen ? "300px" : "350px",
          bgcolor: 'background.paper',
          height: "100%",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            p: isSmallScreen ? 2 : 3,
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
                <Typography color="text.primary" fontSize="16px">
                  {formatAmount(simulationSummary.totalInterest.toFixed(2))}{" "}
                </Typography>
              </Box>
              {simulationSummary.hasAdvanceBreakdown && (
                <>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: 1,
                      borderColor: "error.light",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(211, 47, 47, 0.12)"
                          : "rgba(211, 47, 47, 0.06)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography color="error.main" fontWeight={600}>
                        الدفع المقدم
                      </Typography>
                      <Typography color="error.main" fontWeight={700} fontSize="16px">
                        {formatAmount(simulationSummary.advancePayment.toFixed(2))}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5 }}>
                      يُخصم من أصل السلفة المدخل في النموذج فقط، ولا يُخصم من إجمالي الفائدة.
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
                      أصل السلفة بعد خصم الدفع المقدم
                    </Typography>
                    <Typography color="text.primary" fontSize="16px">
                      {formatAmount(simulationSummary.principalNet.toFixed(2))}
                    </Typography>
                  </Box>
                </>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography color="success.main" fontWeight={600}>
                  المبلغ الإجمالي المستحق
                </Typography>
                <Typography color="success.main" fontSize="16px" fontWeight={700}>
                  {formatAmount(simulationSummary.totalAmount.toFixed(2))}{" "}
                </Typography>
              </Box>
              {simulationSummary.hasAdvanceBreakdown && (
                <Typography variant="caption" color="text.secondary">
                  (= أصل السلفة بعد الخصم + إجمالي الفائدة)
                </Typography>
              )}
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
                      ? "text.secondary"
                      : isEditMode
                      ? "warning.main"
                      : "success.main",
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
  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        bgcolor: 'background.paper',
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
            <Typography color="text.primary" fontSize="14px">
              {formatAmount(simulationSummary.totalInterest.toFixed(2))}{" "}
            </Typography>
          </Box>
          {simulationSummary.hasAdvanceBreakdown && (
            <>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  border: 1,
                  borderColor: "error.light",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(211, 47, 47, 0.12)"
                      : "rgba(211, 47, 47, 0.06)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography color="error.main" variant="body2" fontWeight={600}>
                    الدفع المقدم
                  </Typography>
                  <Typography color="error.main" fontWeight={700} fontSize="14px">
                    {formatAmount(simulationSummary.advancePayment.toFixed(2))}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.45 }}>
                  يُخصم من أصل السلفة فقط، لا من الفائدة.
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
                  أصل السلفة بعد الخصم
                </Typography>
                <Typography color="text.primary" fontSize="14px">
                  {formatAmount(simulationSummary.principalNet.toFixed(2))}
                </Typography>
              </Box>
            </>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography color="success.main" variant="body2" fontWeight={600}>
              المبلغ الإجمالي المستحق
            </Typography>
            <Typography color="success.main" fontSize="14px" fontWeight={700}>
              {formatAmount(simulationSummary.totalAmount.toFixed(2))}{" "}
            </Typography>
          </Box>
          {simulationSummary.hasAdvanceBreakdown && (
            <Typography variant="caption" color="text.secondary">
              (= أصل السلفة بعد الخصم + إجمالي الفائدة)
            </Typography>
          )}
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
                  ? "text.secondary"
                  : isEditMode
                  ? "warning.main"
                  : "success.main",
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
    </Box>
  );
};
export default LoanSimulation;