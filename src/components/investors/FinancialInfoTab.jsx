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

/**
 * FinancialInfoTab Component - Tab displaying financial information
 * Shows investment details, profits, savings, ratios, and zakat information
 */
const FinancialInfoTab = ({
  // Investor data
  investorDetails,
  
  // Edit mode
  editMode,
  editFormData,
  hasDataChanged,
  onEditModeToggle,
  onInputChange,
  onSaveChanges,
  onGenerateContract,
  isSaving = false,
  
  // Permissions & Theme
  permissions,
  isDarkMode,
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
          الأرباح والمعاملات
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      {/* Investment Group */}
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

      {/* Profits Group */}
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

      {/* Savings Details Group */}
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

      {/* Ratios Group */}
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

      {/* Zakat Group */}
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

      {/* Saving Progress Alert */}
      {(() => {
        // للمستثمرين الجدد: capitalAmount = 0، ورأس المال الفعلي في newCapitalAmount
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

      {/* Edit Actions & Editable Fields */}
      <div className="border-2 border-primary/10 rounded-xl p-6 bg-primary/5 dark:bg-primary/10 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <EditIcon sx={{ color: 'primary.main' }} />
            تعديل البيانات المالية
          </h3>
          {investorDetails?.WithdrawingStatus !== 'WITHDRAWING' && investorDetails?.WithdrawingStatus !== 'WITHDRAWN' && (
            <div className="flex gap-2">
              {permissions.includes("partners_Update") && (
                <button
                  type="button"
                  onClick={onEditModeToggle}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <EditIcon sx={{ fontSize: 20 }} />
                  {editMode ? 'إلغاء التعديل' : 'تعديل'}
                </button>
              )}
              {permissions.includes("partners_Add") && (
                <button
                  type="button"
                  onClick={onSaveChanges}
                  disabled={!editMode || isSaving}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin inline-block"><AutorenewIcon sx={{ fontSize: 20 }} /></span>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon sx={{ fontSize: 20 }} />
                      حفظ التغييرات
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {hasDataChanged && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onGenerateContract}
              className="px-4 py-2 rounded-lg border-2 border-red-500 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
            >
              <PictureAsPdfIcon sx={{ fontSize: 24 }} />
              توليد عقد مضاربة جديد
            </button>
          </div>
        )}
      </div>
    </Paper>
  );
};

export default FinancialInfoTab;
