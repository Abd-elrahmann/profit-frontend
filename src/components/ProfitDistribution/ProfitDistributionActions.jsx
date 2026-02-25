import React from "react";
import {
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Check as CheckIcon, Cancel as CancelIcon, Savings as SavingsIcon } from "@mui/icons-material";
import { hasDistribution } from "./profitDistributionUtils";

export default function ProfitDistributionActions({
  periodData,
  theme,
  permissions,
  enableSaving,
  savingPercentage,
  onEnableSavingChange,
  onOpenSavingDialog,
  onOpenDistributionDialog,
  selectedPeriod,
}) {
  const distributed = hasDistribution(periodData);

  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography
        variant="h6"
        color={theme.palette.primary.main}
        fontWeight="bold"
        mb={2}
      >
        الإجراءات
      </Typography>

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
            label="ادخار من التوزيع"
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
                fullWidth
                sx={{ mt: 1 }}
              >
                تعديل المبلغ
              </Button>
            </Box>
          )}
        </Box>
      )}

      <Stack spacing={1}>
        {!distributed && permissions?.includes("distribution_Post") && (
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() =>
              onOpenDistributionDialog(
                selectedPeriod,
                periodData?.name,
                "post"
              )
            }
            fullWidth
            size="small"
            sx={{ bgcolor: theme.palette.primary.main }}
          >
            توزيع الأرباح
          </Button>
        )}

        {distributed && permissions?.includes("distribution_Post") && (
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() =>
              onOpenDistributionDialog(
                selectedPeriod,
                periodData?.name,
                "unpost"
              )
            }
            fullWidth
            size="small"
            sx={{ color: theme.palette.error.main }}
          >
            إلغاء التوزيع
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
