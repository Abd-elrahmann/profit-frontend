import React from "react";
import { Box, Grid, Card, CardContent, Typography, Stack } from "@mui/material";
import {
  TrendingDown as DebitIcon,
  TrendingUp as CreditIcon,
  Balance as BalanceIcon,
} from "@mui/icons-material";

export default function JournalsSummaryCards({ totals, isDarkMode = false, isSmallScreen = false }) {
  const formatNumber = (value) =>
    value ? Math.round(value).toLocaleString() : "0";

  const cards = [
    {
      label: "إجمالي المدين",
      value: formatNumber(totals.totalDebit),
      unit: "",
      icon: <DebitIcon sx={{ fontSize: 32 }} />,
      iconBg: "rgba(211, 47, 47, 0.1)",
      iconColor: "#D91656",
    },
    {
      label: "إجمالي الدائن",
      value: formatNumber(totals.totalCredit),
      unit: "",
      icon: <CreditIcon sx={{ fontSize: 32 }} />,
      iconBg: "rgba(46, 139, 69, 0.1)",
      iconColor: "#2E8B45",
    },
    {
      label: "الفرق",
      value: formatNumber(totals.totalBalance),
      unit: "",
      icon: <BalanceIcon sx={{ fontSize: 32 }} />,
      iconBg: (totals.totalBalance || 0) === 0
        ? isDarkMode ? "rgba(46, 139, 69, 0.15)" : "rgba(46, 139, 69, 0.08)"
        : "rgba(211, 47, 47, 0.1)",
      iconColor: (totals.totalBalance || 0) === 0 ? "#2E8B45" : "#D91656",
      valueColor: (totals.totalBalance || 0) === 0 ? "#2E8B45" : "#D91656",
    },
  ];

  const cardContent = (card) => (
    <Card
            sx={{
              bgcolor: isDarkMode ? "background.paper" : "#ffffff",
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(46, 139, 69, 0.15)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: card.iconBg,
                    color: card.valueColor || card.iconColor,
                  }}
                >
                  {card.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.875rem",
                      mb: 0.5,
                    }}
                  >
                    {card.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: card.valueColor || (isDarkMode ? "text.primary" : "#1e293b"),
                      fontSize: { xs: "1.5rem", sm: "1.75rem" },
                    }}
                  >
                    {card.value}
                    {card.unit && (
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 400,
                          color: "text.secondary",
                          ml: 0.5,
                        }}
                      >
                        {card.unit}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
  );

  if (isSmallScreen) {
    return (
      <Stack spacing={2} sx={{ mt: 4, mb: 3, maxWidth: 420, mx: "auto", width: "100%" }}>
        {cards.map((card) => (
          <Box key={card.label} sx={{ width: "100%" }}>
            {cardContent(card)}
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: 4, mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} md={4} key={card.label}>
          {cardContent(card)}
        </Grid>
      ))}
    </Grid>
  );
}
