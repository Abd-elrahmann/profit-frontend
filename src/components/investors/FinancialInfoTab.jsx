import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Paper,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EditIcon from "@mui/icons-material/Edit";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MosqueIcon from "@mui/icons-material/Mosque";
import SavingsIcon from "@mui/icons-material/Savings";
import InfoIcon from "@mui/icons-material/Info";
import BankAccountAutocomplete from "../loans/BankAccountAutocomplete";
const FinancialInfoTab = ({
  investorDetails,
  isMobile = false,
  editMode,
  editFormData,
  banksData,
  isBanksLoading,
  onBanksSearchChange,
  hasDataChanged,
  onEditModeToggle,
  onInputChange,
  onSaveChanges,
  onGenerateContract,
  isSaving = false,
  permissions,
  isDarkMode,
}) => {
  const resolvedBank =
    editMode && editFormData.bankAccountId != null
      ? banksData?.data?.find((b) => b.id === editFormData.bankAccountId) ||
        investorDetails.bankAccount ||
        null
      : investorDetails.bankAccount || null;
  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      {}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
          الأرباح والمعاملات
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>
      {}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <AccountBalanceWalletIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
            الاستثمار
          </Typography>
        </Box>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'primary.light',
              bgcolor: 'primary.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  رأس المال الأصلي
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.25rem' }}>
                  {investorDetails.capitalAmount?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'info.light',
              bgcolor: 'info.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  رأس المال الجديد
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="info.main" sx={{ fontSize: '1.25rem' }}>
                  {investorDetails.newCapitalAmount?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'success.light',
              bgcolor: 'success.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  إجمالي مبلغ الاستثمار
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1.25rem' }}>
                  {investorDetails.total?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'warning.light',
              bgcolor: 'warning.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  نسبة رأس المال الجديد
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.25rem' }}>
                  {investorDetails.newCapitalPercent || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
            الأرباح والمدخرات
          </Typography>
        </Box>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'primary.light',
              bgcolor: 'primary.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  الأرباح القادمة
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.25rem' }}>
                  {(investorDetails.upcomingProfit || 0)?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'secondary.light',
              bgcolor: 'secondary.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  إجمالي الأرباح الفعلي
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.25rem' }}>
                  {investorDetails.totalProfit?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'info.light',
              bgcolor: 'info.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  إجمالي الادخار
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="info.main" sx={{ fontSize: '1.25rem' }}>
                  {investorDetails.totalSaving?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <SavingsIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
            تفاصيل المدخرات
          </Typography>
        </Box>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'success.light',
              bgcolor: 'success.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  الرصيد المتاح للسحب
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1.25rem' }}>
                  {investorDetails.totalAvilableSaving?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'warning.light',
              bgcolor: 'warning.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  المبلغ المسحوب
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.25rem' }}>
                  {investorDetails.totalWithdrawal?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
            النسب والمعدلات
          </Typography>
        </Box>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'success.light',
              bgcolor: 'success.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  نسبة أرباح المستثمر بالنسبة لباقي المستثمرين
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {investorDetails.partnerProfitPercent}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'warning.light',
              bgcolor: 'warning.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  نسبة أرباح المنشأة
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {investorDetails.orgProfitPercent}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <MosqueIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
            الزكاة السنوية
          </Typography>
        </Box>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'warning.light',
              bgcolor: 'warning.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  المستحقة
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.1rem' }}>
                  {investorDetails.yearlyZakatRequired?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'success.light',
              bgcolor: 'success.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  المدفوعة
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1.1rem' }}>
                  {investorDetails.yearlyZakatPaid?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{
              border: '1px solid',
              borderColor: 'error.light',
              bgcolor: 'error.50',
              minWidth: '280px',
              maxWidth: '350px',
              mx: 'auto'
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  الرصيد
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main" sx={{ fontSize: '1.1rem' }}>
                  {investorDetails.yearlyZakatBalance?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {}
      {(() => {
        const capital = investorDetails.capitalAmount > 0
          ? investorDetails.capitalAmount
          : (investorDetails.newCapitalAmount || investorDetails.total || 0);
        const saving = investorDetails.totalSaving || 0;
        const difference = capital - saving;
        if (saving === 0) return null;
        return (
          <Alert
            severity={difference <= 0 ? "success" : "info"}
            icon={<InfoIcon />}
            sx={{ mb: 3, mt: 2 }}
          >
            <Typography variant="body2">
              رأس مالك {capital.toLocaleString()} • ادخارك {saving.toLocaleString()}
              {difference > 0 && (
                <Typography component="span" fontWeight="bold" color="primary.main">
                  {" • ناقص " + difference.toLocaleString() + " عشان ينتهي ادخارك"}
                </Typography>
              )}
              {difference === 0 && (
                <Typography component="span" fontWeight="bold" color="success.main">
                  {" • رائع! وصل ادخارك لرأس المال بالضبط 🎉"}
                </Typography>
              )}
              {difference < 0 && (
                <Typography component="span" fontWeight="bold" color="success.main">
                  {" • مبروك! تجاوز ادخارك رأس المال بـ " + Math.abs(difference).toLocaleString() + " 🎊"}
                </Typography>
              )}
            </Typography>
          </Alert>
        );
      })()}
      {}
      <Box
        sx={{
          border: "2px solid",
          borderColor: "primary.main",
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(46, 139, 69, 0.1)" : "rgba(46, 139, 69, 0.05)",
          mt: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon sx={{ color: "primary.main" }} />
            تعديل البيانات المالية
          </Typography>
          {investorDetails?.WithdrawingStatus !== "WITHDRAWING" &&
            investorDetails?.WithdrawingStatus !== "WITHDRAWN" && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {permissions.includes("partners_Update") && (
                  <Button
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    onClick={onEditModeToggle}
                    startIcon={<EditIcon />}
                    sx={{
                      color: "text.secondary",
                      borderColor: "divider",
                      "&:hover": { bgcolor: "action.hover", borderColor: "text.secondary" },
                    }}
                  >
                    {editMode ? "إلغاء التعديل" : "تعديل"}
                  </Button>
                )}
                {permissions.includes("partners_Add") && (
                  <Button
                    variant="contained"
                    size={isMobile ? "small" : "medium"}
                    onClick={onSaveChanges}
                    disabled={!editMode || isSaving}
                    startIcon={
                      isSaving ? (
                        <span className="animate-spin inline-block">
                          <AutorenewIcon sx={{ fontSize: 20 }} />
                        </span>
                      ) : (
                        <CheckCircleIcon />
                      )
                    }
                    sx={{
                      bgcolor: "primary.main",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                )}
              </Box>
            )}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">رأس المال</label>
            <input
              value={editMode ? (editFormData.capitalAmount || '') : (editFormData.capitalAmount ? Number(editFormData.capitalAmount).toLocaleString() : '0')}
              onChange={(e) => onInputChange('capitalAmount', e.target.value)}
              disabled={!editMode}
              className={`w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 transition-all ${
                editMode
                  ? 'bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-slate-100'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 cursor-not-allowed'
              }`}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">نسبة أرباح المنشأة</label>
            <input
              type="number"
              value={editMode ? editFormData.orgProfitPercent : investorDetails.orgProfitPercent}
              onChange={(e) => onInputChange('orgProfitPercent', e.target.value)}
              disabled={!editMode}
              className={`w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 transition-all ${
                editMode
                  ? 'bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-slate-100'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 cursor-not-allowed'
              }`}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">نسبة أرباح المستثمر بالنسبة لباقي المستثمرين</label>
            <input
              value={investorDetails.partnerProfitPercent}
              disabled
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 text-slate-600 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">حساب رأس المال</label>
            <input
              value={investorDetails.AccountEquity?.name || ''}
              disabled
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 text-slate-600 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">حساب المستحقات</label>
            <input
              value={investorDetails.AccountPayable?.name || ''}
              disabled
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 text-slate-600 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">الحساب البنكي</label>
            {editMode ? (
              <BankAccountAutocomplete
                variant="field"
                fullWidth
                isSmallScreen={isMobile}
                selectedBank={resolvedBank}
                banksData={banksData}
                isBanksLoading={isBanksLoading}
                handleBankSelect={(_, newValue) =>
                  onInputChange("bankAccountId", newValue?.id ?? null)
                }
                handleBanksSearchChange={onBanksSearchChange}
                isReadOnlyMode={false}
              />
            ) : (
              <input
                value={
                  investorDetails.bankAccount
                    ? `${investorDetails.bankAccount.name} - ${investorDetails.bankAccount.accountNumber}`
                    : "—"
                }
                disabled
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
            )}
          </div>
        </Box>
        {hasDataChanged && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              onClick={onGenerateContract}
              startIcon={<PictureAsPdfIcon />}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": { borderColor: "error.dark", bgcolor: "error.50" },
              }}
            >
              توليد عقد مضاربة جديد
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
export default FinancialInfoTab;
