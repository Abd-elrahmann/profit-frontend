import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableFooter,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import { getTrialBalance } from './trialBalanceApi';
import { exportTrialBalanceToPDF, exportTrialBalanceToExcel } from '../../utilities/TrialBalanceExporter';
import { notifyError, notifySuccess } from '../../utilities/toastify';
import { handleApiError } from '../../config/Api';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import { useAuth } from '../../components/Contexts/AuthContext';

const formatAmount = (n) =>
  (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function TrialBalance() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { permissions } = usePermissions();
  const { user } = useAuth();
  const canExport = permissions.includes('trial-balance_Export');

  const [fromDate, setFromDate] = useState(() => dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [exporting, setExporting] = useState({ pdf: false, excel: false });

  const queryParams = useMemo(
    () => ({
      from: fromDate || undefined,
      to: toDate || undefined,
    }),
    [fromDate, toDate]
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['trial-balance', queryParams.from, queryParams.to],
    queryFn: () => getTrialBalance(queryParams),
    retry: 1,
  });

  const totals = data?.totals;
  const accounts = data?.accounts || [];
  const isBalanced = totals?.isBalanced;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleExportPdf = useCallback(async () => {
    if (!data) {
      notifyError('لا توجد بيانات للتصدير');
      return;
    }
    setExporting((p) => ({ ...p, pdf: true }));
    try {
      await exportTrialBalanceToPDF(data, {
        from: fromDate,
        to: toDate,
        userName: user?.name,
      });
      notifySuccess('تم تصدير PDF بنجاح');
    } catch (err) {
      notifyError('حدث خطأ أثناء تصدير PDF');
      handleApiError(err);
    } finally {
      setExporting((p) => ({ ...p, pdf: false }));
    }
  }, [data, fromDate, toDate, user?.name]);

  const handleExportExcel = useCallback(() => {
    if (!data) {
      notifyError('لا توجد بيانات للتصدير');
      return;
    }
    setExporting((p) => ({ ...p, excel: true }));
    try {
      exportTrialBalanceToExcel(data, { from: fromDate, to: toDate });
      notifySuccess('تم تصدير Excel بنجاح');
    } catch (err) {
      notifyError('حدث خطأ أثناء تصدير Excel');
      handleApiError(err);
    } finally {
      setExporting((p) => ({ ...p, excel: false }));
    }
  }, [data, fromDate, toDate]);

  const loading = isLoading || isFetching;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: isMobile ? 2 : 3,
      }}
    >
      <Helmet>
        <title>ميزان المراجعة</title>
        <meta name="description" content="ميزان المراجعة" />
      </Helmet>

      {/* Filters & actions */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              flex: 1,
              maxWidth: { md: 520 },
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 0.75, fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5 }}
              >
                من تاريخ
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 0.75, fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5 }}
              >
                إلى تاريخ
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
            {canExport && (
              <>
                <Button
                  variant="outlined"
                  color="success"
                  size="medium"
                  disabled={loading || exporting.excel || !data}
                  onClick={handleExportExcel}
                  startIcon={exporting.excel ? <CircularProgress size={18} color="success" /> : <DescriptionIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '& .MuiButton-startIcon': { marginInlineEnd: '10px' },
                  }}
                >
                  Excel
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="medium"
                  disabled={loading || exporting.pdf || !data}
                  onClick={handleExportPdf}
                  startIcon={exporting.pdf ? <CircularProgress size={18} color="error" /> : <PictureAsPdfIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '& .MuiButton-startIcon': { marginInlineEnd: '10px' },
                  }}
                >
                  PDF
                </Button>
              </>
            )}
            <Button
              variant="contained"
              color="primary"
              size="medium"
              disabled={loading}
              onClick={handleRefresh}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
                boxShadow: (t) => `0 4px 14px ${t.palette.primary.main}33`,
                '& .MuiButton-startIcon': { marginInlineEnd: '10px' },
              }}
            >
              تحديث البيانات
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.response?.data?.message || 'تعذر تحميل البيانات. جرّب تغيير الفترة أو التحديث.'}
        </Alert>
      )}

      {/* Main table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <TableContainer sx={{ maxHeight: { xs: 480, md: 'calc(100vh - 420px)' } }}>
          <Table
            size="small"
            stickyHeader
            sx={{
              '& th, & td': { textAlign: 'center' },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.7rem', py: 2 }}>
                  كود الحساب
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.7rem' }}>
                  اسم الحساب
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.7rem' }}>
                  مدين
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.7rem' }}>
                  دائن
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.7rem' }}>
                  الرصيد
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !accounts.length ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    لا توجد حركات ضمن الفترة المحددة
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((row) => (
                  <TableRow key={row.accountId} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell align="center" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontWeight: 600 }}>
                      {row.code}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      {row.name}
                    </TableCell>
                    <TableCell align="center" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatAmount(row.debit)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatAmount(row.credit)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 800,
                        color: Number(row.balance) >= 0 ? 'primary.main' : 'error.main',
                      }}
                    >
                      {formatAmount(row.balance)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {totals && data && (
              <TableFooter>
                <TableRow
                  sx={{
                    bgcolor: (t) => (t.palette.mode === 'dark' ? 'primary.dark' : 'primary.50'),
                    borderTop: '2px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{ fontWeight: 900, fontSize: '1rem', color: 'primary.main', py: 2.5 }}
                  >
                    الإجمالي
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
                    {formatAmount(totals.totalDebit)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 900, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
                    {formatAmount(totals.totalCredit)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      icon={isBalanced ? <VerifiedUserIcon sx={{ fontSize: 18 }} /> : <WarningAmberIcon sx={{ fontSize: 18 }} />}
                      label={isBalanced ? 'النظام متوازن' : 'غير متوازن'}
                      color={isBalanced ? 'success' : 'warning'}
                      sx={{ fontWeight: 800 }}
                    />
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </TableContainer>
      </Paper>

      {/* Stats cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: 0.6 }}>
              إجمالي المدين
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 900, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>
              {totals ? formatAmount(totals.totalDebit) : '—'}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                حركة المدين في الفترة
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.6,
                color: (t) => (t.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
              }}
            >
              إجمالي الدائن
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mt: 1,
                fontWeight: 900,
                fontVariantNumeric: 'tabular-nums',
                color: (t) => (t.palette.mode === 'dark' ? '#ffcc80' : '#bf360c'),
              }}
            >
              {totals ? formatAmount(totals.totalCredit) : '—'}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <TrendingDownIcon
                sx={{
                  fontSize: 20,
                  color: (t) => (t.palette.mode === 'dark' ? '#ffab91' : '#d84315'),
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: (t) => (t.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
                }}
              >
                حركة الدائن في الفترة
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            background: (t) =>
              t.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #0d3320 0%, #052e16 100%)'
                : 'linear-gradient(135deg, #047857 0%, #064e3b 100%)',
            color: '#fff',
            position: 'relative',
          }}
        >
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.6, color: 'rgba(255,255,255,0.85)' }}>
              حالة المراجعة
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, fontWeight: 800 }}>
              {isBalanced ? 'مطابق تماماً' : 'غير مطابق'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.85, lineHeight: 1.6 }}>
              {isBalanced
                ? 'تم التحقق من توازن إجمالي المدين والدائن ضمن الفترة المحددة.'
                : 'يُنصح بمراجعة القيود المعتمدة أو الفترة المختارة.'}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VerifiedUserIcon />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {loading ? 'جاري التحديث...' : 'جاهز للمراجعة'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
