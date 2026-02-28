import React from 'react';
import {
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from '@mui/material';
import {
  Payments,
  Description,
  CheckCircle,
  PendingActions,
  ChevronLeft,
  PictureAsPdf,
  TableChart,
} from '@mui/icons-material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
const formatCurrency = (amount) => amount?.toLocaleString() ?? '0';
const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const getMonthName = (month, year) => {
  const name = MONTH_NAMES[month - 1] || month;
  return `${name} ${year}`;
};
const getStatusBadge = (status) => {
  if (status === 'PAID') {
    return (
      <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        تم الدفع
      </span>
    );
  }
  return (
    <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      قيد الانتظار
    </span>
  );
};
const SummaryCard = ({ icon: Icon, label, value, variant = 'default' }) => (
  <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 bg-white dark:bg-slate-800 border border-primary/10 shadow-sm">
    <div className="flex items-center justify-between text-primary/60">
      <p className="text-sm font-bold">{label}</p>
      <Icon sx={{ fontSize: 24 }} />
    </div>
    <p
      className={`text-xl sm:text-2xl font-bold break-words ${
        variant === 'primary'
          ? 'text-primary'
          : variant === 'error'
            ? 'text-red-600'
            : 'text-slate-900 dark:text-slate-100'
      }`}
    >
      {formatCurrency(value)}
    </p>
  </div>
);
const ZakahPartnerDetails = ({
  partnerZakahData,
  selectedYear,
  isSmallScreen,
  isMobile = false,
  isPartnerLoading,
  isExporting,
  hasPartnerExportData,
  onExportPDF,
  onExportExcel,
  onBackToRoot,
  permissions,
}) => {
  const currentYearData = Array.isArray(partnerZakahData)
    ? partnerZakahData.find((item) => item.year === selectedYear)
    : partnerZakahData;
  const partnerName = currentYearData?.partnerName || partnerZakahData?.partnerName || '—';
  const monthlyBreakdown = currentYearData?.monthlyBreakdown || [];
  if (isPartnerLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <CircularProgress size={40} />
      </div>
    );
  }
  if (!partnerZakahData) {
    return (
      <Alert severity="error" className="mt-4">
        حدث خطأ في تحميل بيانات الزكاة
      </Alert>
    );
  }
  return (
    <div className="flex flex-col max-w-[1200px] w-full space-y-8">
      {}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBackToRoot}
          className="text-primary/70 text-sm font-medium hover:underline"
        >
          الزكاة
        </button>
        <ChevronLeft sx={{ fontSize: 16, color: 'primary.main', opacity: 0.4 }} />
        <span className="text-slate-900 dark:text-slate-100 text-sm font-bold">
          تفاصيل زكاة الشريك
        </span>
      </div>
      {}
      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-stretch sm:items-end gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-slate-900 dark:text-slate-100 text-xl sm:text-2xl md:text-3xl font-black leading-tight break-words">
            تفاصيل زكاة الشريك:{' '}
            <span className="text-primary">{partnerName}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            تقرير تفصيلي لتوزيع الزكاة السنوية والمدفوعات الشهرية لعام {selectedYear}
          </p>
        </div>
        {permissions.includes('zakat_Export') && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdf sx={{ fontSize: 18 }} />}
              onClick={onExportPDF}
              disabled={isExporting || !hasPartnerExportData}
            >
              {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<TableChart sx={{ fontSize: 18 }} />}
              onClick={onExportExcel}
              disabled={isExporting || !hasPartnerExportData}
            >
              {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
            </Button>
          </div>
        )}
      </div>
      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          icon={Payments}
          label="رأس المال الحالي"
          value={currentYearData?.capitalAmount}
        />
        <SummaryCard
          icon={Description}
          label="الالتزام السنوي (2.5%)"
          value={currentYearData?.annualZakat}
          variant="primary"
        />
        <SummaryCard
          icon={CheckCircle}
          label="المسدد حتى الآن"
          value={currentYearData?.totalPaid}
        />
        <SummaryCard
          icon={PendingActions}
          label="الرصيد المتبقي"
          value={currentYearData?.remaining}
          variant={currentYearData?.remaining > 0 ? 'error' : 'default'}
        />
      </div>
      {}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h2 className="text-slate-900 dark:text-slate-100 text-lg sm:text-xl font-bold">
            تفصيل الدفعات الشهرية
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
            {selectedYear}
          </span>
        </div>
        <div className="overflow-x-auto w-full">
          {isMobile && monthlyBreakdown.length > 0 ? (
            <div className="p-4 space-y-3">
              {monthlyBreakdown.map((row) => (
                <div
                  key={`${row.month}-${row.year || selectedYear}`}
                  className="rounded-lg border border-primary/10 p-4 bg-white dark:bg-slate-800/50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {getMonthName(row.month, row.year || selectedYear)}
                    </span>
                    {getStatusBadge(row.status)}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span>الزكاة المستحقة: <strong>{formatCurrency(row.amount)}</strong></span>
                    <span>المدفوع: <strong>{row.status === 'PAID' ? formatCurrency(row.amount) : '0'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TableContainer sx={{ minWidth: 320 }}>
          <Table sx={{ minWidth: 320 }}>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="center">الشهر</StyledTableCell>
                <StyledTableCell align="center">الزكاة المستحقة</StyledTableCell>
                <StyledTableCell align="center">المبلغ المدفوع</StyledTableCell>
                <StyledTableCell align="center">الحالة</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {monthlyBreakdown.length > 0 ? (
                monthlyBreakdown.map((row) => (
                  <StyledTableRow key={`${row.month}-${row.year || selectedYear}`}>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {getMonthName(row.month, row.year || selectedYear)}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {formatCurrency(row.amount)}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.status === 'PAID' ? formatCurrency(row.amount) : '0'}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {getStatusBadge(row.status)}
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    لا توجد دفعات شهرية مسجلة
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
          </TableContainer>
          )}
        </div>
        <div className="px-6 py-4 bg-primary/5 text-slate-600 dark:text-slate-400 text-sm italic">
          * يتم حساب الزكاة شهرياً بناءً على رأس المال القائم في نهاية كل شهر ميلادي بمقدار 2.5% سنوياً.
        </div>
      </div>
    </div>
  );
};
export default ZakahPartnerDetails;