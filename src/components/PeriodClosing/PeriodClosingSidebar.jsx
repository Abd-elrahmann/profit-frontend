import React from "react";
import {
  Box,
  Typography,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { Check as CheckIcon, Cancel as CancelIcon } from "@mui/icons-material";
import {
  formatNumber,
  calculateJournalTotals,
} from "./periodClosingUtils.jsx";
export default function PeriodClosingSidebar({
  periodData,
  theme,
  permissions,
  onClosePeriod,
  onUnpostClosing,
}) {
  const journals = periodData?.journals || [];
  const { totalDebit, totalCredit, totalBalance } =
    calculateJournalTotals(journals);
  const balanceColor = totalBalance >= 0 ? "success.main" : "error.main";
  return (
    <Box
      sx={{
        width: "350px",
        borderRight: "1px solid #ddd",
        bgcolor: theme.palette.background.default,
        height: "100%",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid #ddd",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          ملخص الفترة
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>عدد القيود:</Typography>
            <Typography fontWeight="bold">{journals.length}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>إجمالي المدين:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {formatNumber(totalDebit)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>إجمالي الدائن:</Typography>
            <Typography fontWeight="bold" color="error.main">
              {formatNumber(totalCredit)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>إجمالي الرصيد:</Typography>
            <Typography fontWeight="bold" color={balanceColor}>
              {formatNumber(totalBalance)}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight="bold">
              الأرباح الإجمالية (قبل الخصم):
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>أرباح الشركاء:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {(periodData?.grossProfit?.partnerTotal || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>أرباح الشركة:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {(periodData?.grossProfit?.companyTotal || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              ml: 2,
              mb: 1,
            }}
          >
            <Typography>الإجمالي:</Typography>
            <Typography fontWeight="bold">
              {(periodData?.grossProfit?.total || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight="bold">المصروفات المخصومة:</Typography>
            <Typography fontWeight="bold" color="error.main">
              -{(periodData?.expenseDistribution?.totalExpenses || 0).toLocaleString()}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight="bold">صافي الأرباح (بعد الخصم):</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>أرباح الشركاء:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {(periodData?.totalPartnerProfit || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>باقي أرباح الشركاء:</Typography>
            <Typography fontWeight="bold" color="warning.main">
              {(periodData?.centCollected || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>أرباح الشركة:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {(periodData?.companyProfit || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>الإجمالي:</Typography>
            <Typography fontWeight="bold">
              {(periodData?.totalProfit || 0).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          الإجراءات
        </Typography>
        <Stack spacing={2}>
          {!periodData?.isClosed && permissions.includes("period_Post") && (
            <Button
              variant="contained"
              startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
              onClick={onClosePeriod}
              sx={{
                bgcolor: "success.main",
                "&:hover": { bgcolor: "success.dark" },
              }}
            >
              تقفيل الفترة
            </Button>
          )}
          {periodData?.isClosed && permissions.includes("period_Post") && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
              onClick={onUnpostClosing}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
              }}
            >
              إلغاء التقفيل
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}