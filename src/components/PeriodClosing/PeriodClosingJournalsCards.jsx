import React from "react";
import {
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Box,
  Chip as MuiChip,
} from "@mui/material";
import {
  getJournalTypeText,
  getJournalStatusText,
  formatNumber,
  calculateJournalTotals,
} from "./periodClosingUtils.jsx";

const formatDate = (dateString) => {
  if (!dateString) return "لم تنتهي بعد";
  return new Date(dateString).toLocaleDateString("en-US");
};

export default function PeriodClosingJournalsCards({
  journals,
  onViewJournal,
}) {
  const { totalDebit, totalCredit, totalBalance } =
    calculateJournalTotals(journals);

  const getBalanceColor = (balance) => {
    if (balance > 0) return "success.main";
    if (balance < 0) return "error.main";
    return "text.primary";
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
        قيود الفترة ({journals.length})
      </Typography>

      <Stack spacing={2}>
        {journals.map((journal) => {
          const balance =
            (journal.totalDebit || 0) - (journal.totalCredit || 0);
          return (
            <Card key={journal.id} variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="primary"
                    >
                      {journal.reference || journal.description || "-"}
                    </Typography>
                    <MuiChip
                      label={getJournalStatusText(journal.status)}
                      color={journal.status === "POSTED" ? "success" : "default"}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2">{journal.description}</Typography>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {getJournalTypeText(journal.type)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(journal.date)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">
                      مدين: {formatNumber(journal.totalDebit)}
                    </Typography>
                    <Typography variant="body2">
                      دائن: {formatNumber(journal.totalCredit)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      الرصيد:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={getBalanceColor(balance)}
                    >
                      {formatNumber(balance)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}

        {journals.length > 0 && (
          <Card sx={{ bgcolor: "#f5f5f5", border: "2px solid #e0e0e0" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                mb={1}
                textAlign="center"
              >
                الإجمالي
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" fontWeight="bold">
                  مدين: {formatNumber(totalDebit)}
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  دائن: {formatNumber(totalCredit)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 1,
                  pt: 1,
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  الرصيد:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={getBalanceColor(totalBalance)}
                >
                  {formatNumber(totalBalance)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Paper>
  );
}
