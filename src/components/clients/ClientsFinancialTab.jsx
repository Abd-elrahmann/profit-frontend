import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { getStatusColor } from "./clientsUtils";

const cardStyles = {
  blue: {
    bg: { light: "#f0fdf4", dark: "rgba(46, 139, 69, 0.15)" },
    border: { light: "#bbf7d0", dark: "rgba(46, 139, 69, 0.4)" },
    label: { light: "#166534", dark: "#86efac" },
    value: "primary.main",
  },
  green: {
    bg: { light: "#f0fdf4", dark: "rgba(34, 197, 94, 0.15)" },
    border: { light: "#bbf7d0", dark: "rgba(34, 197, 94, 0.4)" },
    label: { light: "#166534", dark: "#86efac" },
    value: "success.main",
  },
  red: {
    bg: { light: "#fef2f2", dark: "rgba(239, 68, 68, 0.15)" },
    border: { light: "#fecaca", dark: "rgba(239, 68, 68, 0.4)" },
    label: { light: "#991b1b", dark: "#fca5a5" },
    value: "error.main",
  },
};

export default function ClientsFinancialTab({ clientDetails, isMobile = false }) {
  const client = clientDetails?.client;
  if (!client) return null;

  const FinancialCard = ({ label, value, styleKey, unit }) => {
    const s = cardStyles[styleKey];
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? s.bg.dark : s.bg.light,
          border: "1px solid",
          borderColor: (theme) =>
            theme.palette.mode === "dark" ? s.border.dark : s.border.light,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            color: (theme) =>
              theme.palette.mode === "dark" ? s.label.dark : s.label.light,
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
        <Typography variant="h5" fontWeight="bold" color={s.value}>
          {value}
          {unit && (
            <Box component="span" sx={{ fontSize: "0.875rem", fontWeight: 500, ml: 0.5 }}>
              {unit}
            </Box>
          )}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ pt: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "text.primary" }}>
        الملخص المالي
      </Typography>
      <Grid
        container
        spacing={3}
        sx={{
          maxWidth: 1100,
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Grid item xs={12} sm={4} sx={{ minWidth: 280 }}>
          <FinancialCard
            label="الراتب"
            value={client.salary?.toLocaleString() || 0}
            styleKey="blue"
            unit="ريال"
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={{ minWidth: 280 }}>
          <FinancialCard
            label="الالتزامات"
            value={client.obligations?.toLocaleString() || 0}
            styleKey="red"
            unit="ريال"
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={{ minWidth: 280 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? cardStyles.green.bg.dark
                  : cardStyles.green.bg.light,
              border: "1px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark"
                  ? cardStyles.green.border.dark
                  : cardStyles.green.border.light,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                color: (theme) =>
                  theme.palette.mode === "dark"
                    ? cardStyles.green.label.dark
                    : cardStyles.green.label.light,
                fontWeight: 500,
              }}
            >
              الحالة
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color={getStatusColor(client.status)}
            >
              {client.status}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
