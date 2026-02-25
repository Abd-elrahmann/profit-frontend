import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { calculateJournalTotals, formatNumber } from "./periodClosingUtils.jsx";

export default function PeriodClosingSummaryCards({ periodData }) {
  const journals = periodData?.journals || [];
  const { totalDebit, totalCredit, totalBalance } =
    calculateJournalTotals(journals);
  const balanceColor = totalBalance >= 0 ? "success.main" : "error.main";

  const cards = [
    {
      label: "القيود",
      value: journals.length,
      bgColor: "rgba(25, 118, 210, 0.1)",
      color: "primary.main",
    },
    {
      label: "إجمالي المدين",
      value: formatNumber(totalDebit),
      bgColor: "rgba(76, 175, 80, 0.1)",
      color: "success.main",
    },
    {
      label: "إجمالي الدائن",
      value: formatNumber(totalCredit),
      bgColor: "rgba(244, 67, 54, 0.1)",
      color: "error.main",
    },
    {
      label: "إجمالي الرصيد",
      value: formatNumber(totalBalance),
      bgColor:
        totalBalance >= 0
          ? "rgba(76, 175, 80, 0.1)"
          : "rgba(244, 67, 54, 0.1)",
      color: balanceColor,
    },
    {
      label: "إجمالي الأرباح",
      value: (periodData?.grossProfit?.total || 0).toLocaleString(),
      bgColor: "rgba(46, 125, 50, 0.1)",
      color: "success.main",
    },
    {
      label: "المصروفات",
      value: `-${(periodData?.expenseDistribution?.totalExpenses || 0).toLocaleString()}`,
      bgColor: "rgba(244, 67, 54, 0.1)",
      color: "error.main",
    },
    {
      label: "صافي أرباح الشركاء",
      value: (periodData?.totalPartnerProfit || 0).toLocaleString(),
      bgColor: "rgba(46, 125, 50, 0.1)",
      color: "success.main",
    },
  ];

  return (
    <Grid container spacing={2} mb={3}>
      {cards.map((card) => (
        <Grid item xs={6} md={4} key={card.label}>
          <Card sx={{ bgcolor: card.bgColor, textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color={card.color}>
                {card.label}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={card.color}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
