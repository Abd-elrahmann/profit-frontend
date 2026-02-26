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

  const cardSx = {
    width: "100%",
    minWidth: "100%",
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
    minHeight: 280,
  };

  const rowSx = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    py: 1,
    borderBottom: `1px solid ${theme.palette.divider}`,
  };

  return (
    <Box sx={{ width: "100%", py: 2, px: 0, boxSizing: "border-box" }}>
      <Grid container spacing={2} sx={{ width: "100%" }}>
        {closedPeriods?.map((period) => (
          <Grid item xs={12} key={period.periodId} sx={{ width: "100%", maxWidth: "100%" }}>
            <Card
              sx={cardSx}
              onClick={() => onViewDetails(period.periodId)}
            >
              <CardContent sx={{ p: 2, width: "100%", boxSizing: "border-box" }}>
                <Stack spacing={0}>
                  <Box sx={rowSx}>
                    <Typography variant="body2" color="textSecondary">
                      اسم الفترة
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {period.name}
                    </Typography>
                  </Box>
                  <Box sx={rowSx}>
                    <Typography variant="body2" color="textSecondary">
                      تاريخ البداية
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(period.startDate)}
                    </Typography>
                  </Box>
                  <Box sx={rowSx}>
                    <Typography variant="body2" color="textSecondary">
                      تاريخ النهاية
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(period.endDate)}
                    </Typography>
                  </Box>
                  <Box sx={rowSx}>
                    <Typography variant="body2" color="textSecondary">
                      أرباح الشركة
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatNumber(period.companyProfit) || 0}
                    </Typography>
                  </Box>
                  <Box sx={rowSx}>
                    <Typography variant="body2" color="textSecondary">
                      إجمالي أرباح الشركاء
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {formatNumber(period.totalAfterSaving) || 0}
                    </Typography>
                  </Box>
                  <Box sx={rowSx}>
                    <Typography variant="body2" color="textSecondary">
                      المبلغ المدخر
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      {formatNumber(period.totalSaving) || 0}
                    </Typography>
                  </Box>
                  <Box sx={rowSx}>
                    <Typography variant="body2" color="textSecondary">
                      حالة التوزيع
                    </Typography>
                    <Chip
                      label={hasDistribution(period) ? "موزعة" : "غير موزعة"}
                      color={hasDistribution(period) ? "success" : "warning"}
                      size="small"
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                      pt: 1.5,
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
