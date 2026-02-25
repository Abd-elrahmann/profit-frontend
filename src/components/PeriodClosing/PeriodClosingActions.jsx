import React from "react";
import { Paper, Typography, Stack, Button } from "@mui/material";
import { Check as CheckIcon, Cancel as CancelIcon } from "@mui/icons-material";

export default function PeriodClosingActions({
  periodData,
  permissions,
  onClosePeriod,
  onUnpostClosing,
}) {
  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
        الإجراءات
      </Typography>
      <Stack spacing={1}>
        {!periodData?.isClosed && permissions.includes("period_Post") && (
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={onClosePeriod}
            fullWidth
            size="small"
            sx={{ bgcolor: "success.main" }}
          >
            تقفيل الفترة
          </Button>
        )}

        {periodData?.isClosed && permissions.includes("period_Post") && (
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onUnpostClosing}
            fullWidth
            size="small"
            color="error"
          >
            إلغاء التقفيل
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
