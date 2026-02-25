import React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  FormControlLabel,
  Checkbox,
  Chip,
} from "@mui/material";
import { Check as CheckIcon, Cancel as CancelIcon, Savings as SavingsIcon } from "@mui/icons-material";
import { formatNumber, hasDistribution } from "./profitDistributionUtils";

export default function ProfitDistributionSidebar({
  periodData,
  theme,
  permissions,
  enableSaving,
  savingPercentage,
  profitAfterSaving,
  onEnableSavingChange,
  onOpenSavingDialog,
  onOpenDistributionDialog,
  selectedPeriod,
}) {
  const distributed = hasDistribution(periodData);

  const partnerProfitDisplay =
    enableSaving && savingPercentage > 0
      ? formatNumber(profitAfterSaving.partnerProfit)
      : formatNumber(
          periodData?.totalAfterSaving ||
            periodData?.partners?.reduce(
              (sum, p) => sum + (p.totalAfterSaving || p.totalProfit || 0),
              0
            ) ||
            0
        );

  const savedAmountDisplay =
    enableSaving && savingPercentage > 0
      ? profitAfterSaving.savedAmount
      : periodData?.totalSaving ||
        periodData?.partners?.reduce((sum, p) => sum + (p.savingAmount || 0), 0) ||
        0;

  return (
    <Box
      sx={{
        width: "350px",
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.default,
        height: "100%",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="h6"
          color={theme.palette.primary.main}
          fontWeight="bold"
          mb={3}
        >
          ملخص التوزيع
        </Typography>
        <Stack spacing={2}>
          {!distributed && (
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableSaving}
                    onChange={(e) => {
                      onEnableSavingChange(e.target.checked);
                      if (e.target.checked && savingPercentage === 0) {
                        onOpenSavingDialog();
                      }
                    }}
                    color="primary"
                  />
                }
                label="هل تريد الادخار من هذا التوزيع؟"
              />

              {enableSaving && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    bgcolor: theme.palette.primary[50] || "rgba(25, 118, 210, 0.08)",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">نسبة الادخار:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {savingPercentage.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<SavingsIcon sx={{ marginLeft: "10px" }} />}
                    onClick={onOpenSavingDialog}
                    sx={{ mt: 1 }}
                  >
                    تعديل المبلغ
                  </Button>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>أرباح الشركة:</Typography>
            <Typography fontWeight="bold" color={theme.palette.primary.main}>
              {formatNumber(periodData?.companyProfit) || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>إجمالي أرباح الشركاء:</Typography>
            <Typography fontWeight="bold" color={theme.palette.primary.main}>
              {partnerProfitDisplay}
            </Typography>
          </Box>

          {(enableSaving && savingPercentage > 0) || (periodData?.totalSaving > 0) ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pt: 1,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="body2"
                color={theme.palette.warning.main}
              >
                المبلغ المدخر{" "}
                {enableSaving && savingPercentage > 0
                  ? `(${savingPercentage.toFixed(2)}%)`
                  : ""}
                :
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color={theme.palette.warning.main}
              >
                {formatNumber(savedAmountDisplay)}
              </Typography>
            </Box>
          ) : null}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>عدد الشركاء:</Typography>
            <Typography fontWeight="bold" color={theme.palette.text.primary}>
              {periodData?.partners?.length || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>الحالة:</Typography>
            <Chip
              label={distributed ? "موزعة" : "غير موزعة"}
              color={distributed ? "success" : "warning"}
              size="small"
            />
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography
          variant="h6"
          color={theme.palette.primary.main}
          fontWeight="bold"
          mb={3}
        >
          الإجراءات
        </Typography>
        <Stack spacing={2}>
          {!distributed && permissions?.includes("distribution_Post") && (
            <Button
              variant="contained"
              startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
              onClick={() =>
                onOpenDistributionDialog(
                  selectedPeriod,
                  periodData?.name,
                  "post"
                )
              }
              sx={{
                bgcolor: theme.palette.primary.main,
                "&:hover": { bgcolor: theme.palette.primary.dark },
              }}
            >
              توزيع الأرباح
            </Button>
          )}

          {distributed && permissions?.includes("distribution_Post") && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
              onClick={() =>
                onOpenDistributionDialog(
                  selectedPeriod,
                  periodData?.name,
                  "unpost"
                )
              }
              sx={{
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                "&:hover": {
                  bgcolor: theme.palette.error.main + "20",
                },
              }}
            >
              إلغاء التوزيع
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
