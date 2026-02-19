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
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
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
        const capital = investorDetails.capitalAmount || 0;
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

      {/* Edit Actions */}
      {investorDetails?.WithdrawingStatus !== 'WITHDRAWING' && investorDetails?.WithdrawingStatus !== 'WITHDRAWN' && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, justifyContent: 'flex-end' }}>
          {permissions.includes("partners_Update") && (
            <Button
              variant="outlined"
              startIcon={<EditIcon sx={{marginLeft: '10px'}} />}
              onClick={onEditModeToggle}
              size="small"
            >
              {editMode ? 'إلغاء التعديل' : 'تعديل'}
            </Button>
          )}
          {permissions.includes("partners_Add") && (
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon sx={{marginLeft: '10px'}} />}
              sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
              disabled={!editMode || isSaving}
              onClick={onSaveChanges}
              size="small"
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          )}
        </Box>
      )}

      {/* Editable Fields */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" mb={1} fontWeight={500}>رأس المال</Typography>
          <TextField
            value={editMode ? (editFormData.capitalAmount || '') : (investorDetails.capitalAmount?.toLocaleString() || '0')}
            onChange={(e) => onInputChange('capitalAmount', e.target.value)}
            fullWidth
            disabled={!editMode}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                borderRadius: '6px',
                width: '280px',
                '&:hover fieldset': {
                  borderColor: editMode ? 'primary.main' : undefined,
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" mb={1} fontWeight={500}>نسبة أرباح المنشأة</Typography>
          <TextField 
            value={editMode ? editFormData.orgProfitPercent : investorDetails.orgProfitPercent} 
            onChange={(e) => onInputChange('orgProfitPercent', e.target.value)}
            fullWidth
            disabled={!editMode}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                borderRadius: '6px',
                width: '280px',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" mb={1} fontWeight={500}>نسبة أرباح المستثمر بالنسبة لباقي المستثمرين</Typography>
          <TextField
            value={investorDetails.partnerProfitPercent}
            fullWidth
            disabled
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                borderRadius: '6px',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" mb={1} fontWeight={500}>حساب رأس المال</Typography>
          <TextField 
            value={investorDetails.AccountEquity?.name} 
            fullWidth
            disabled
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                borderRadius: '6px',
                width: '280px',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" mb={1} fontWeight={500}>حساب المستحقات</Typography>
          <TextField 
            value={investorDetails.AccountPayable?.name} 
            fullWidth
            disabled
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                borderRadius: '6px',
                width: '280px',
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Contract Generation Button */}
      {hasDataChanged && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon sx={{ marginLeft: '10px' }} />}
            onClick={onGenerateContract}
            sx={{
              borderColor: "#d32f2f",
              color: "#d32f2f",
              "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
            }}
          >
            توليد عقد مضاربة جديد
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default FinancialInfoTab;
