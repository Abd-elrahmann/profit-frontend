import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { formatNumber, formatDate, hasDistribution } from "./profitDistributionUtils";

export default function ProfitDistributionCards({
  closedPeriods,
  isLoading,
  theme,
  permissions,
  onViewDetails,
  onOpenDistributionDialog,
}) {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (closedPeriods?.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          لا توجد فترات مقفلة
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={2}>
        {closedPeriods?.map((period) => (
          <Grid item xs={12} key={period.periodId}>
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: `0 2px 4px ${
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)"
                }`,
                "&:hover": {
                  boxShadow: `0 4px 8px ${
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.15)"
                  }`,
                },
                cursor: "pointer",
              }}
              onClick={() => onViewDetails(period.periodId)}
            >
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
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {period.name}
                    </Typography>
                    <Chip
                      label={hasDistribution(period) ? "موزعة" : "غير موزعة"}
                      color={hasDistribution(period) ? "success" : "warning"}
                      size="small"
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        من:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(period.startDate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        إلى:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(period.endDate)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      أرباح الشركة:
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      {formatNumber(period.companyProfit) || 0}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      عدد الشركاء:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {period.partners?.length || 0}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                      pt: 1,
                    }}
                  >
                    {permissions?.includes("distribution_View") && (
                      <IconButton
                        title="عرض التفاصيل"
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(period.periodId);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                    {permissions?.includes("distribution_Post") && (
                      <IconButton
                        title={
                          hasDistribution(period)
                            ? "إلغاء التوزيع"
                            : "توزيع الأرباح"
                        }
                        size="small"
                        color={hasDistribution(period) ? "error" : "success"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDistributionDialog(
                            period.periodId,
                            period.name,
                            hasDistribution(period) ? "unpost" : "post"
                          );
                        }}
                      >
                        {hasDistribution(period) ? (
                          <CancelIcon style={{ fontSize: "20px" }} />
                        ) : (
                          <CheckIcon style={{ fontSize: "20px" }} />
                        )}
                      </IconButton>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
