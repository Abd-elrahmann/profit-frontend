import  React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Alert,
  Box,
  Stack,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';

const WithdrawModal = ({
  isOpen,
  onClose,
  isEditMode,
  setIsEditMode,
  withdrawAmount,
  setWithdrawAmount,
  withdrawalPreview,
  isLoadingPreview,
  investorDetails,
  permissions,
  isWithdrawing,
  onWithdraw,
  setWithdrawPreviewData,
  isDarkMode
}) => {
  const [amountError, setAmountError] = useState("");
  const [touched, setTouched] = useState(false);

  const validateAmount = (value) => {
    if (!value || value.trim() === "") {
      return "مبلغ السحب مطلوب";
    }

    const amount = parseFloat(value);
    if (isNaN(amount)) {
      return "يرجى إدخال مبلغ صحيح";
    }

    if (amount <= 0) {
      return "مبلغ السحب يجب أن يكون أكبر من صفر";
    }

    if (amount > 1000000) {
      return "مبلغ السحب الشهري يجب أن يكون أقل من 1,000,000 ريال";
    }

    if (investorDetails?.total && amount > investorDetails.total * 0.5) {
      return "مبلغ السحب الشهري يجب أن يكون أقل من 50% من رأس المال";
    }

    return "";
  };

  const handleAmountChange = (value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setWithdrawAmount(value);

      if (amountError) {
        setAmountError("");
      }
    }
  };

  const handleAmountBlur = () => {
    setTouched(true);
    const error = validateAmount(withdrawAmount);
    setAmountError(error);
  };

  const handleClose = () => {
    onClose();
    setWithdrawAmount("");
    setWithdrawPreviewData(null);
    setIsEditMode(false);
    setAmountError("");
    setTouched(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {isEditMode ? 'تعديل مبلغ الانسحاب الشهري' : 'إنسحاب المستثمر من توزيعات الأرباح'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {isLoadingPreview ? (
            <Box sx={{ py: 4 }}>
              <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="text" width="100%" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={32} />
            </Box>
          ) : isEditMode ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                🔔 يمكنك تعديل المبلغ الشهري للانسحاب. سيتم إعادة حساب جدول السداد تلقائياً
              </Typography>
            </Alert>
          ) : (investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN') && !isEditMode ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                ⚠️ هذا المستثمر في حالة انسحاب بالفعل (الحالة: {
                  investorDetails?.WithdrawingStatus === 'WITHDRAWING' ? 'جاري السحب' : 'تم الانسحاب'
                })
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                لا يمكن إنشاء طلب انسحاب جديد لمستثمر منسحب. يرجى مراجعة صفحة المستثمرين المنسحبين.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                🔔 أدخل المبلغ الشهري وسيتم عرض محاكاة السداد والمعادلات الحسابية
              </Typography>
            </Alert>
          )}

          <Paper sx={{ p: 2.5, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>رأس المال الأصلي</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {investorDetails?.totalAmount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>نسبة أرباح المنشأة</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {investorDetails?.orgProfitPercent}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>المدخرات</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {investorDetails?.totalSaving?.toLocaleString() || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>إجمالي الأرباح</Typography>
                <Typography variant="h6" fontWeight="bold" color="info.main">
                  {investorDetails?.totalProfit?.toLocaleString() || 0}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {isEditMode && investorDetails?.withdrawalInfo?.monthlyAmount && (
            <Paper sx={{ p: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
              <Typography variant="body2" color="text.secondary" mb={0.5}>المبلغ الشهري الحالي</Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {investorDetails?.withdrawalInfo?.monthlyAmount?.toLocaleString() || "غير محدد"}
              </Typography>
            </Paper>
          )}

          <TextField
            label={isEditMode ? "المبلغ الشهري الجديد للسحب" : "المبلغ الشهري للسحب"}
            type="number"
            value={withdrawAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onBlur={handleAmountBlur}
            fullWidth
            required
            disabled={
              !isEditMode && (
                investorDetails?.WithdrawingStatus === 'WITHDRAWING' ||
                investorDetails?.WithdrawingStatus === 'WITHDRAWN'
              )
            }
            error={touched && !!amountError}
            helperText={
              touched && amountError ? amountError :
              isEditMode
                ? "أدخل المبلغ الشهري الجديد الذي يتم سحبه (بالريال السعودي)"
                : (investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN')
                  ? "المستثمر منسحب بالفعل"
                  : "أدخل المبلغ الشهري الذي يتم سحبه (بالريال السعودي)"
            }
            InputProps={{
              inputProps: {
                min: 0,
                step: 0.01,
                max: 1000000
              }
            }}
          />

          {withdrawalPreview && (isEditMode || (
           investorDetails?.WithdrawingStatus !== 'WITHDRAWING' &&
           investorDetails?.WithdrawingStatus !== 'WITHDRAWN')) && (
              <>
                <Divider sx={{ my: 1 }} />

                <Paper sx={{ p: 2.5, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={2} color="success.main">
                    📊 محاكاة العملية الحسابية :
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          ① رأس المال الأصلي
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {withdrawalPreview.originalCapital.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          ② إجمالي الأرباح
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                          + {withdrawalPreview.totalProfit.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          ③ إجمالي المبلغ
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          {withdrawalPreview.totalAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          = {withdrawalPreview.originalCapital.toLocaleString()} + {withdrawalPreview.totalProfit.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          ④ خصم التعثر (يُحسب من النظام)
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color={withdrawalPreview.estimatedDefaultShare > 0 ? 'error' : 'success'}>
                          {withdrawalPreview.estimatedDefaultShare > 0 ? `- ${withdrawalPreview.estimatedDefaultShare.toLocaleString()}` : 'لا يوجد'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          نسبة تشغيلية = (100 - {investorDetails.orgProfitPercent}%) / 100
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '2px solid', borderColor: 'primary.main' }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          ⑤ رأس المال للجدول
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {withdrawalPreview.remainingCapital.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          = {withdrawalPreview.totalAmount.toLocaleString()} - {withdrawalPreview.estimatedDefaultShare.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: isDarkMode ? 'background.default' : '#fffef0', borderRadius: 1, border: '1px solid #ffd700' }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          💰 الادخار (يُصرف منفصل)
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                          {withdrawalPreview.savingsAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          لا يدخل في حساب الجدول
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          📅 عدد الدفعات
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="info">
                          {withdrawalPreview.totalMonths} دفعة
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(() => {
                            const years = Math.floor(withdrawalPreview.totalMonths / 12);
                            const months = withdrawalPreview.totalMonths % 12;
                            if (years > 0 && months > 0) {
                              return `${years} سنة و ${months} شهر`;
                            } else if (years > 0) {
                              return `${years} سنة`;
                            } else {
                              return `${months} شهر`;
                            }
                          })()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2.5, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={2} color="info.main">
                    📅 جدول السداد الكامل ({withdrawalPreview.totalMonths} دفعة):
                  </Typography>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: 'info.100' }}>
                        <StyledTableRow>
                          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>الدفعة</StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>التاريخ</StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>المبلغ</StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>المتبقي</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {withdrawalPreview.schedule.map((item, index) => (
                          <StyledTableRow key={index} hover sx={{
                            bgcolor: index % 2 === 0 ? 'transparent' : 'rgba(25, 103, 210, 0.05)',
                            '&:hover': { bgcolor: 'rgba(25, 103, 210, 0.1)' }
                          }}>
                            <StyledTableCell align="center">{item.month}</StyledTableCell>
                            <StyledTableCell align="center">{item.date}</StyledTableCell>
                            <StyledTableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                              {item.amount.toLocaleString('en-US')}
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                              {item.remaining.toLocaleString('en-US')}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Alert severity="info" icon={<InfoIcon />}>
                  <Typography variant="body2">
                    ℹ️ <strong> منطق حساب الإنسحاب</strong>
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    • يتم حساب التعثر من القروض المتعثرة (حالة = متعثر) × النسبة التشغيلية<br/>
                    • رأس المال للجدول = (رأس المال + الأرباح) - خصم التعثر<br/>
                    • الادخار يُصرف منفصل ولا يدخل في جدول الدفعات<br/>
                    • عند التنفيذ الفعلي، سيتم حساب التعثر الحقيقي من القروض
                  </Typography>
                </Alert>
              </>
            )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, flexDirection: 'row-reverse' }}>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={isWithdrawing}
        >
          إلغاء
        </Button>
        {permissions.includes("partners_Add") && (
          <Button
            onClick={() => {
              const error = validateAmount(withdrawAmount);
              setAmountError(error);
              setTouched(true);

              if (!error) {
                onWithdraw();
              }
            }}
            variant="contained"
            disabled={
              isWithdrawing ||
              (!isEditMode && (
                investorDetails?.WithdrawingStatus === 'WITHDRAWING' ||
                investorDetails?.WithdrawingStatus === 'WITHDRAWN'
              ))
            }
            sx={{
              bgcolor: isEditMode ? "primary.main" : "#d32f2f",
              "&:hover": { bgcolor: isEditMode ? "primary.dark" : "#b71c1c" },
            }}
          >
            {isWithdrawing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (isEditMode ? 'تأكيد التعديل' : 'تأكيد الإنسحاب')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WithdrawModal;