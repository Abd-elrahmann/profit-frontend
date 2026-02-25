import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { AccountBalanceWallet } from "@mui/icons-material";
import { getStatusColor } from "./clientsUtils";

export default function ClientsFinancialTab({ clientDetails }) {
  const client = clientDetails?.client;
  if (!client) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        className="flex items-center gap-2 pb-2 mb-4"
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <AccountBalanceWallet sx={{ fontSize: 24, color: "primary.main" }} />
        <Typography variant="h6" fontWeight="bold">
          المعلومات المالية
        </Typography>
      </Box>
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        <Grid item xs={12} md={4} sx={{ width: "280px" }}>
          <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              الراتب
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {client.salary?.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ width: "280px" }}>
          <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              الالتزامات
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="error">
              {client.obligations?.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ width: "280px" }}>
          <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              الحالة
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color={getStatusColor(client.status)}
            >
              {client.status}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
