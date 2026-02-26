import React from 'react';
import {
  Button,
  Autocomplete,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from '@mui/material';
import {
  AccountBalance,
  Paid as PaidIcon,
  Pending as PendingIcon,
  AccountBalanceWallet,
  PictureAsPdf,
  TableChart,
} from '@mui/icons-material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

const formatCurrency = (amount) => amount?.toLocaleString() ?? '0';

const formatArabicDate = (date) =>
  dayjs(date)
    .locale('ar')
    .format('D [من] MMMM [الساعة] h:mm') +
  ' ' +
  (dayjs(date).hour() < 12 ? 'صباحًا' : 'مساءً');

const monthOptions = [
  { value: 1, label: 'يناير' },
  { value: 2, label: 'فبراير' },
  { value: 3, label: 'مارس' },
  { value: 4, label: 'أبريل' },
  { value: 5, label: 'مايو' },
  { value: 6, label: 'يونيو' },
  { value: 7, label: 'يوليو' },
  { value: 8, label: 'أغسطس' },
  { value: 9, label: 'سبتمبر' },
  { value: 10, label: 'أكتوبر' },
  { value: 11, label: 'نوفمبر' },
  { value: 12, label: 'ديسمبر' },
];

const yearOptions = Array.from({ length: 31 }, (_, i) => ({
  value: 2020 + i,
  label: (2020 + i).toString(),
}));

const SummaryCard = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 bg-white dark:bg-slate-800 border border-primary/10 shadow-sm">
    <div className="flex items-center justify-between text-primary/60">
      <p className="text-sm font-bold">{label}</p>
      <Icon sx={{ fontSize: 24 }} />
    </div>
    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 break-words">
      {formatCurrency(value)}
    </p>
  </div>
);

const ZakahAccountTab = ({
  accountReport,
  isAccountLoading,
  accountError,
  selectedFilterMonth,
  selectedFilterYear,
  onMonthChange,
  onYearChange,
  onWithdrawClick,
  handleExportPDF,
  handleExportExcel,
  isExporting,
  hasAccountExportData,
  permissions,
  isSmallScreen = false,
  isMobile = false,
}) => {
  if (isAccountLoading && !accountReport) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <CircularProgress size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[1200px] w-full space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center flex-wrap">
        <Autocomplete
          value={monthOptions.find((o) => o.value === selectedFilterMonth) || null}
          onChange={(e, newValue) =>
            onMonthChange(newValue ? newValue.value : new Date().getMonth() + 1)
          }
          options={monthOptions}
          getOptionLabel={(o) => o.label}
          renderInput={(params) => (
            <TextField {...params} label="الشهر" sx={{ width: '100%', minWidth: 200 }} />
          )}
          sx={{ width: { xs: '100%', sm: 250 } }}
        />
        <Autocomplete
          value={yearOptions.find((o) => o.value === selectedFilterYear) || null}
          onChange={(e, newValue) =>
            onYearChange(newValue ? newValue.value : new Date().getFullYear())
          }
          options={yearOptions}
          getOptionLabel={(o) => o.label}
          renderInput={(params) => (
            <TextField {...params} label="السنة" sx={{ width: '100%', minWidth: 200 }} />
          )}
          sx={{ width: { xs: '100%', sm: 250 } }}
        />
      </div>

      {/* Export Buttons */}
      {permissions.includes('zakat_Export') && accountReport && (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="contained"
            color="error"
            startIcon={<PictureAsPdf sx={{ fontSize: 18 }} />}
            onClick={handleExportPDF}
            disabled={isExporting || !hasAccountExportData}
          >
            {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<TableChart sx={{ fontSize: 18 }} />}
            onClick={handleExportExcel}
            disabled={isExporting || !hasAccountExportData}
          >
            {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </Button>
        </div>
      )}

      {accountError && !isAccountLoading && (
        <Alert severity="error" className="mb-4">
          فشل في تحميل بيانات الزكاة: {accountError.message || 'حدث خطأ غير متوقع'}
        </Alert>
      )}

      {/* Summary Cards */}
      {!isAccountLoading && !accountError && accountReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <SummaryCard
            icon={AccountBalance}
            label="رصيد الحساب"
            value={accountReport?.account?.balance}
          />
          <SummaryCard
            icon={PaidIcon}
            label="الزكاة المدفوعة"
            value={accountReport?.account?.credit}
          />
          <SummaryCard
            icon={PendingIcon}
            label="الزكاة المسحوبة"
            value={accountReport?.account?.debit}
          />
          <SummaryCard
            icon={AccountBalanceWallet}
            label="إجمالي العمليات"
            value={accountReport?.totalJournalEntries || 0}
          />
        </div>
      )}

      {/* Withdraw Button (mobile only) */}
      {permissions.includes('zakat_Add') && accountReport && isSmallScreen && (
        <div className="flex justify-center">
          <Button
            variant="contained"
            onClick={onWithdrawClick}
            disabled={
              !accountReport?.account?.balance || accountReport?.account?.balance <= 0
            }
            startIcon={<PaidIcon sx={{ marginLeft: '10px' }} />}
          >
            سحب الزكاة
          </Button>
        </div>
      )}

      {/* Financial Operations Table */}
      {accountReport?.journalsByMonth &&
      Object.keys(accountReport.journalsByMonth).length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-primary/10">
            <h2 className="text-slate-900 dark:text-slate-100 text-lg sm:text-xl font-bold">
              العمليات المالية
            </h2>
          </div>
          <div className="divide-y divide-primary/10 overflow-x-auto">
            {Object.entries(accountReport.journalsByMonth).map(([month, data]) => (
              <div key={month} className="p-4 sm:p-6">
                <h3 className="text-primary font-bold mb-4 p-3 bg-primary/5 rounded-lg">
                  شهر {month}
                </h3>
                {isMobile && data.entries && data.entries.length > 0 ? (
                  <div className="space-y-3">
                    {data.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-lg border border-primary/10 p-4 bg-white dark:bg-slate-800/50 space-y-2"
                      >
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {formatArabicDate(entry.date)}
                          {entry.hijriDate && (
                            <span className="mr-2 text-primary font-bold">{entry.hijriDate}</span>
                          )}
                        </div>
                        <p className="text-slate-800 dark:text-slate-100 font-medium">{entry.description}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span>مدين: <strong>{formatCurrency(entry.debit)}</strong></span>
                          <span>دائن: <strong>{formatCurrency(entry.credit)}</strong></span>
                          <span>الرصيد: <strong>{formatCurrency(entry.balance)}</strong></span>
                        </div>
                      </div>
                    ))}
                    <div className="rounded-lg bg-primary/5 p-3 flex flex-wrap gap-3 text-sm font-bold">
                      <span>الإجمالي - مدين: {formatCurrency(data.totalDebit)}</span>
                      <span>دائن: {formatCurrency(data.totalCredit)}</span>
                      <span>الرصيد: {formatCurrency(data.totalBalance)}</span>
                    </div>
                  </div>
                ) : (
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 400 }}>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell align="center">التاريخ</StyledTableCell>
                          <StyledTableCell align="center">الوصف</StyledTableCell>
                          <StyledTableCell align="center">مدين</StyledTableCell>
                          <StyledTableCell align="center">دائن</StyledTableCell>
                          <StyledTableCell align="center">الرصيد</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {data.entries && data.entries.length > 0 ? (
                          data.entries.map((entry) => (
                            <StyledTableRow key={entry.id}>
                              <StyledTableCell align="center">
                                <div>
                                  <div className="text-sm font-medium mb-0.5">
                                    {formatArabicDate(entry.date)}
                                  </div>
                                  {entry.hijriDate && (
                                    <div className="text-xs font-bold text-primary">
                                      {entry.hijriDate}
                                    </div>
                                  )}
                                </div>
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {entry.description}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {formatCurrency(entry.debit)}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {formatCurrency(entry.credit)}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {formatCurrency(entry.balance)}
                              </StyledTableCell>
                            </StyledTableRow>
                          ))
                        ) : (
                          <StyledTableRow>
                            <StyledTableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <span className="text-slate-500">
                                لا توجد عمليات مالية لهذا الشهر
                              </span>
                            </StyledTableCell>
                          </StyledTableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        !isAccountLoading &&
        !accountError && (
          <Alert severity="info">لا توجد عمليات مالية لحساب الزكاة</Alert>
        )
      )}
    </div>
  );
};

export default ZakahAccountTab;
