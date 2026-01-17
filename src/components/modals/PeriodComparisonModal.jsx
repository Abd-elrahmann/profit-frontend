import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  LinearProgress,
  Divider,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InsightsIcon from "@mui/icons-material/Insights";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const PeriodComparisonModal = ({ open, onClose, comparison, isLoading }) => {
  if (!open) return null;

  const renderComparisonContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      );
    }


    if (!comparison) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography>لا توجد بيانات للمقارنة</Typography>
        </Box>
      );
    }

    const comparisonData = comparison.comparison || comparison;
    const { period1, period2, changes, performance } = comparisonData;

    if (!period1 || !period2 || !changes || !performance) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography>البيانات غير مكتملة</Typography>
        </Box>
      );
    }

    const mainColor = performance.profitabilityImproved
      ? "#2e8a45"
      : "#dc2626";

    const StatusIcon = performance.profitabilityImproved
      ? CheckCircleIcon
      : ErrorIcon;

    const performanceScore = Math.max(
      0,
      Math.min(100, 50 + changes.netProfitChangePercent)
    );

    return (
      <Stack spacing={3}>
    
        <Paper elevation={0} sx={{ p: 4, border: "1px solid #e0e0e0", borderRadius: 2, width: '95%', maxWidth: '1400px', mx: 'auto', textAlign: 'center' }}>
         
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} lg={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  height: "100%",
                  textAlign: 'center',
                  minWidth: '400px'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" color="primary" mb={1}>
                  الفترة الأولى
                </Typography>

                <Stack spacing={1.5} alignItems="center">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      اسم الفترة
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {period1.name}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      الحالة
                    </Typography>
                    <Chip
                      label={period1.isClosed ? "مغلقة" : "مفتوحة"}
                      color={period1.isClosed ? "success" : "warning"}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      الفترة الزمنية
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(period1.startDate)} - {formatDate(period1.endDate)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1, width: '100%' }} />

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      صافي الربح
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={period1.netProfit >= 0 ? "success.main" : "error.main"}
                    >
                      {period1.netProfit.toLocaleString()} ريال
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      نسبة التعثر
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {period1.delinquency}%
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  height: "100%",
                  textAlign: 'center',
                  minWidth: '400px'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" color="primary" mb={1}>
                  الفترة الثانية
                </Typography>

                <Stack spacing={1.5} alignItems="center">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      اسم الفترة
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {period2.name}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      الحالة
                    </Typography>
                    <Chip
                      label={period2.isClosed ? "مغلقة" : "مفتوحة"}
                      color={period2.isClosed ? "success" : "warning"}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      الفترة الزمنية
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(period2.startDate)} - {formatDate(period2.endDate)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1, width: '100%' }} />

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      صافي الربح
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={period2.netProfit >= 0 ? "success.main" : "error.main"}
                    >
                      {period2.netProfit.toLocaleString()} ريال
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      نسبة التعثر
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {period2.delinquency}%
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 4, border: "1px solid #e0e0e0", borderRadius: 2, width: '95%', maxWidth: '1400px', mx: 'auto', textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            تحليل التغيرات
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} lg={5} sx={{width:'400px'}}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#f8f9fa", textAlign: 'center' }}>
                <Stack spacing={1} alignItems="center">
                  <Typography variant="body1" color="textSecondary">
                    تغير صافي الربح
                  </Typography>

                  <Stack direction="column" spacing={1} alignItems="center">
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={changes.netProfitChange >= 0 ? "success.main" : "error.main"}
                    >
                      {changes.netProfitChange >= 0 ? "+" : ""}{changes.netProfitChange.toLocaleString()} ريال
                    </Typography>

                    <Chip
                      icon={changes.netProfitChangePercent >= 0 ?
                        <ArrowUpwardIcon sx={{ fontSize: 16,marginLeft:'10px' }} /> :
                        <ArrowDownwardIcon sx={{ fontSize: 16,marginLeft:'10px' }} />
                      }
                      label={`${changes.netProfitChangePercent >= 0 ? "+" : ""}${changes.netProfitChangePercent}%`}
                      size="small"
                      color={changes.netProfitChangePercent >= 0 ? "success" : "error"}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="body1">
                    {changes.netProfitChange >= 0
                      ? "زيادة في الربحية"
                      : "انخفاض في الربحية"}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={5} sx={{width:'400px'}}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#f8f9fa", textAlign: 'center' }}>
                <Stack spacing={2} alignItems="center">
                  <Typography variant="body1" color="textSecondary">
                    تغير نسبة التعثر
                  </Typography>

                  <Stack direction="column" spacing={1} alignItems="center">
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={changes.delinquencyChange <= 0 ? "success.main" : "error.main"}
                    >
                      {changes.delinquencyChange >= 0 ? "+" : ""}{changes.delinquencyChange}%
                    </Typography>

                    <Chip
                      icon={changes.delinquencyChange <= 0 ?
                        <ArrowDownwardIcon sx={{ fontSize: 16,marginLeft:'10px' }} /> :
                        <ArrowUpwardIcon sx={{ fontSize: 16,marginLeft:'10px' }} />
                      }
                      label={`${changes.delinquencyChangePercent >= 0 ? "+" : ""}${changes.delinquencyChangePercent}%`}
                      size="small"
                      color={changes.delinquencyChange <= 0 ? "success" : "error"}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="body1">
                    {changes.delinquencyChange <= 0
                      ? `تحسن في معدل التعثر (${changes.delinquencyChangePercent >= 0 ? "+" : ""}${changes.delinquencyChangePercent}%)`
                      : `تدهور في معدل التعثر (${changes.delinquencyChangePercent >= 0 ? "+" : ""}${changes.delinquencyChangePercent}%)`}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
                      
        <Paper elevation={0} sx={{ p: 4, border: "1px solid #e0e0e0", borderRadius: 2, width: '95%', maxWidth: '1400px', mx: 'auto', textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            تقييم الأداء
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} lg={5} sx={{width:'400px'}}>
              <Stack spacing={1} alignItems="center">
                <Typography variant="body1" fontWeight="bold">
                  الربحية:
                </Typography>
                <Chip
                  icon={performance.profitabilityImproved ?
                    <CheckCircleIcon sx={{ fontSize: 16,marginLeft:'10px' }} /> :
                    <ErrorIcon sx={{ fontSize: 16,marginLeft:'10px' }} />
                  }
                  label={performance.profitabilityStatus}
                  color={performance.profitabilityImproved ? "success" : "error"}
                  size="small"
                />
              </Stack>
            </Grid>

            <Grid item xs={12} lg={5} sx={{width:'400px'}}>
              <Stack spacing={1} alignItems="center">
                <Typography variant="body1" fontWeight="bold">
                  التعثر:
                </Typography>
                <Chip
                  icon={performance.delinquencyImproved ?
                    <CheckCircleIcon sx={{ fontSize: 16,marginLeft:'10px' }} /> :
                    <ErrorIcon sx={{ fontSize: 16,marginLeft:'10px' }} />
                  }
                  label={performance.delinquencyStatus}
                  color={performance.delinquencyImproved ? "success" : "error"}
                  size="small"
                />
              </Stack>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Stack direction="row" justifyContent="center" mb={2} spacing={3}>
              <Typography variant="body1" fontWeight="bold">    
                مؤشر الأداء العام
              </Typography>
              <Typography variant="body1" fontWeight="bold" color={mainColor}>
                {Math.round(performanceScore)} / 100
              </Typography>
            </Stack>

            <Box sx={{ maxWidth: 600, mx: 'auto', px: 4 }}>
              <LinearProgress
                variant="determinate"
                value={performanceScore}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  "& .MuiLinearProgress-bar": {
                    bgcolor: mainColor,
                    borderRadius: 6,
                  },
                }}
              />

              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography variant="body1" fontWeight="medium" color="textSecondary">
                  ضعيف
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="textSecondary">
                  جيد
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="textSecondary">
                  ممتاز
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Stack>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            مقارنة الفترات
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent dividers sx={{ py: 2 }}>
        {renderComparisonContent()}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary" size="large">
          إغلاق
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PeriodComparisonModal;