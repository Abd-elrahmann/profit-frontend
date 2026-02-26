import React from "react";
import {
  Stack,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Alert,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { isJournalBalanced } from "./journalsUtils";

export default function JournalsLinesCards({
  journalLines,
  totalsForTable,
  isEditMode,
  isAddMode,
  isDarkMode,
  onEditLine,
  onDeleteLine,
}) {
  const formatNumber = (value) =>
    value ? Math.round(value).toLocaleString() : "0";

  const getBalanceColor = (balance) => {
    if ((balance || 0) === 0) return "text.primary";
    return (balance || 0) > 0 ? "error" : "success.main";
  };

  const canEdit = isEditMode || isAddMode;
  const unbalanced = !isJournalBalanced(
    totalsForTable.totalDebit,
    totalsForTable.totalCredit
  );

  return (
    <Stack spacing={2} sx={{ alignItems: "center", maxWidth: 420, mx: "auto", width: "100%" }}>
      {journalLines.map((line, index) => (
        <Card
          key={line.id || index}
          variant="outlined"
          sx={{ borderRadius: 2, width: "100%" }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="primary"
                  >
                    {line.account?.code} - {line.account?.name}
                  </Typography>
                  {line.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {line.description}
                    </Typography>
                  )}
                </Box>
                {canEdit && (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEditLine(index)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteLine(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    نوع الحساب
                  </Typography>
                  <Chip
                    label={(line.debit || 0) > 0 ? "مدين" : "دائن"}
                    color={(line.debit || 0) > 0 ? "error" : "success"}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography variant="caption" color="text.secondary">
                    مدين
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="error"
                  >
                    {formatNumber(line.debit)}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography variant="caption" color="text.secondary">
                    دائن
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {formatNumber(line.credit)}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography variant="caption" color="text.secondary">
                    الإجمالي
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={getBalanceColor(line.balance)}
                  >
                    {typeof line.balance === "number"
                      ? formatNumber(line.balance)
                      : "0"}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          width: "100%",
          backgroundColor: isDarkMode ? "background.default" : "grey.100",
          border: "2px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>
            الإجمالي
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">
                إجمالي المدين
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="error">
                {formatNumber(totalsForTable.totalDebit)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">
                إجمالي الدائن
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {formatNumber(totalsForTable.totalCredit)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">
                الفرق
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatNumber(totalsForTable.totalBalance)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {unbalanced && (
        <Alert severity="error">
          القيد غير متوازن! إجمالي المدين:{" "}
          {formatNumber(totalsForTable.totalDebit)} ≠ إجمالي الدائن:{" "}
          {formatNumber(totalsForTable.totalCredit)} (الفرق:{" "}
          {formatNumber(Math.abs(totalsForTable.totalBalance))})
        </Alert>
      )}
    </Stack>
  );
}
