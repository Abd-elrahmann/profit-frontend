import React, { useState, useCallback } from 'react';
import {
  Add,
  Visibility,
  Undo,
  AccountBalanceWallet,
  Delete as DeleteIcon,
  CurrencyExchange,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import {
  getExternalInvestments,
  getBanksForExternalInvestments,
  withdrawExternalInvestment,
  returnExternalInvestment,
  distributeExternalProfit,
  reverseExternalDistribution,
  deleteExternalInvestment,
} from './externalInvestmentApi';
import { Autocomplete, TextField } from '@mui/material';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import WithdrawExternalModal from './WithdrawExternalModal';
import ReturnExternalModalSection from './ReturnExternalModalSection';
import ExternalModal from './ExternalModal';
import { inputClass, labelClass } from './inputClasses';

const formatMoney = (n) =>
  (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const statusLabel = (s) => (s === 'CLOSED' ? 'مغلق' : 'مفتوح');

const iconBtn = 'p-2 rounded-lg transition-colors';
const iconBtnPrimary = `${iconBtn} text-primary hover:bg-primary/10`;
const iconBtnSecondary = `${iconBtn} text-violet-600 dark:text-violet-400 hover:bg-violet-500/10`;
const iconBtnSuccess = `${iconBtn} text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10`;
const iconBtnWarning = `${iconBtn} text-amber-600 dark:text-amber-400 hover:bg-amber-500/10`;
const iconBtnDanger = `${iconBtn} text-red-600 dark:text-red-400 hover:bg-red-500/10`;

const btnHeader =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-5 py-3 shadow-lg shadow-primary/30 transition-colors';

const btnSecondary =
  'px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const btnPrimary =
  'px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const btnDanger =
  'px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const ExternalInvestments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();

  const canView = permissions.includes('external-investments_View');
  const canAdd = permissions.includes('external-investments_Add');
  const canPost = permissions.includes('external-investments_Post');
  const canDelete = permissions.includes('external-investments_Delete');

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [bankFilter, setBankFilter] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [returnRow, setReturnRow] = useState(null);
  const [returnAmount, setReturnAmount] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ type: null, id: null, title: '', body: '' });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'external-investments',
      page,
      rowsPerPage,
      bankFilter?.id,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      getExternalInvestments(page, {
        limit: rowsPerPage,
        bankAccountId: bankFilter?.id,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    enabled: canView,
    retry: 1,
  });

  const { data: banksListData, isLoading: banksFilterLoading } = useQuery({
    queryKey: ['banks', 'external-investments-filter'],
    queryFn: getBanksForExternalInvestments,
    enabled: canView,
    retry: 1,
  });
  const bankOptions = banksListData?.data ?? [];

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['external-investments'] }),
    [queryClient]
  );

  const withdrawMut = useMutation({
    mutationFn: withdrawExternalInvestment,
    onSuccess: () => {
      notifySuccess('تم تسجيل السحب بنجاح');
      setWithdrawOpen(false);
      invalidate();
    },
  });

  const returnMut = useMutation({
    mutationFn: ({ id, amount }) => returnExternalInvestment(id, { amount }),
    onSuccess: () => {
      notifySuccess('تم تسجيل الإرجاع وإغلاق العملية');
      setReturnRow(null);
      setReturnAmount('');
      invalidate();
    },
  });

  const distributeMut = useMutation({
    mutationFn: (id) => distributeExternalProfit(id),
    onSuccess: (res) => {
      notifySuccess(res?.message || 'تم توزيع الربح');
      setConfirmDialog({ type: null, id: null, title: '', body: '' });
      invalidate();
    },
  });

  const reverseMut = useMutation({
    mutationFn: (id) => reverseExternalDistribution(id),
    onSuccess: (res) => {
      notifySuccess(res?.message || 'تم عكس التوزيع');
      setConfirmDialog({ type: null, id: null, title: '', body: '' });
      invalidate();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteExternalInvestment(id),
    onSuccess: (res) => {
      notifySuccess(res?.message || 'تم حذف السجل');
      setConfirmDialog({ type: null, id: null, title: '', body: '' });
      invalidate();
    },
  });

  const handleReturnSubmit = () => {
    if (!returnRow) return;
    const n = parseFloat(String(returnAmount).replace(/,/g, ''));
    if (!n || n <= 0) {
      notifyError('أدخل المبلغ المُرجع (يشمل الربح)');
      return;
    }
    returnMut.mutate({ id: returnRow.id, amount: n });
  };

  const rows = data?.data ?? [];
  const total = data?.count ?? 0;
  const totals = data?.totals ?? {};
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage) || 1);
  const fromIdx = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const toIdx = Math.min(page * rowsPerPage, total);
  const totalCards = [
    { label: 'إجمالي المسحوب', value: totals.totalWithdrawn },
    { label: 'إجمالي المسدد', value: totals.totalPaid },
    { label: 'إجمالي الربح', value: totals.totalProfit },
    { label: 'ربح الشركاء', value: totals.totalPartnerProfit },
    { label: 'ربح الشركة', value: totals.totalCompanyProfit },
  ];

  const openConfirm = (type, id, title, body) => {
    setConfirmDialog({ type, id, title, body });
  };

  const runConfirm = () => {
    const { type, id } = confirmDialog;
    if (type === 'distribute') distributeMut.mutate(id);
    if (type === 'reverse') reverseMut.mutate(id);
    if (type === 'delete') deleteMut.mutate(id);
  };

  const processing =
    confirmDialog.type &&
    (distributeMut.isPending || reverseMut.isPending || deleteMut.isPending);

  if (!canView) {
    return (
      <div className="w-full p-6" dir="rtl">
        <p className="text-slate-700 dark:text-slate-300">لا تملك صلاحية عرض هذه الصفحة.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>الأرباح الخارجية</title>
      </Helmet>
      <div className="w-full p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">الأرباح الخارجية</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed max-w-2xl">
              سحب من الصندوق نحو البنك، ثم تسجيل المبلغ المُرجع بما يتضمّن الربح وتوزيعه على المساهمين
              عند الإغلاق.
            </p>
          </div>
          {canAdd && (
            <button type="button" onClick={() => setWithdrawOpen(true)} className={btnHeader}>
              <Add style={{ fontSize: 22 }} />
              سحب من الصندوق
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {totalCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-sm p-4"
            >
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
              <p className="text-lg font-black text-primary tabular-nums">{formatMoney(card.value)}</p>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-5 mb-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-3">الفلترة</h2>
          <div className="flex flex-col sm:flex-row sm:flex-nowrap sm:items-end gap-4 w-full min-w-0">
            <div className="w-full min-w-0 sm:min-w-[200px] sm:flex-[1.4]">
              <label className={labelClass} id="ext-filter-bank-label" htmlFor="ext-filter-bank">
                الحساب البنكي
              </label>
              <Autocomplete
                size="small"
                fullWidth
                options={bankOptions}
                getOptionLabel={(o) => o?.name || ''}
                isOptionEqualToValue={(a, b) => a?.id === b?.id}
                value={bankFilter}
                onChange={(_, v) => {
                  setBankFilter(v);
                  setPage(1);
                }}
                loading={banksFilterLoading}
                slotProps={{
                  popper: {
                    style: { zIndex: 1400 },
                    placement: 'bottom-start',
                    modifiers: [{ name: 'flip', enabled: false }],
                  },
                }}
                className="w-full"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    hiddenLabel
                    size="small"
                    placeholder="الكل"
                    fullWidth
                    inputProps={{ ...params.inputProps, 'aria-labelledby': 'ext-filter-bank-label' }}
                  />
                )}
              />
            </div>
            <div className="w-full min-w-0 sm:flex-1 sm:min-w-[160px]">
              <label className={labelClass} htmlFor="ext-from">
                من تاريخ
              </label>
              <input
                id="ext-from"
                type="date"
                className={inputClass}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full min-w-0 sm:flex-1 sm:min-w-[160px]">
              <label className={labelClass} htmlFor="ext-to">
                إلى تاريخ
              </label>
              <input
                id="ext-to"
                type="date"
                className={inputClass}
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-primary text-white sticky top-0 z-[1] shadow-sm">
                    <tr>
                      {['#', 'التاريخ', 'الحساب البنكي', 'المسحوب', 'الحالة', 'المرتجع', 'الربح', 'التوزيع', 'الإجراءات'].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-2 sm:px-3 py-3 text-center font-bold text-white border-b border-white/20 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isFetching && rows.length > 0 && (
                      <tr>
                        <td colSpan={9} className="px-3 py-2 text-center text-xs text-slate-500">
                          جارٍ التحديث...
                        </td>
                      </tr>
                    )}
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                          لا توجد بيانات
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80"
                        >
                          <td className="px-2 sm:px-3 py-2.5 text-center text-slate-800 dark:text-slate-200">
                            {row.id}
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 text-center whitespace-nowrap text-slate-800 dark:text-slate-200">
                            {row.createdAt ? new Date(row.createdAt).toLocaleDateString('ar-EG') : '—'}
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 text-center text-slate-800 dark:text-slate-200">
                            {row.bankAccount?.name ?? '—'}
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 text-center tabular-nums text-slate-800 dark:text-slate-200">
                            {formatMoney(row.amount)}
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                row.status === 'CLOSED'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {statusLabel(row.status)}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 text-center tabular-nums text-slate-800 dark:text-slate-200">
                            {row.returnedAmount != null ? formatMoney(row.returnedAmount) : '—'}
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 text-center tabular-nums text-slate-800 dark:text-slate-200">
                            {row.profit != null ? formatMoney(row.profit) : '—'}
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 text-center text-slate-800 dark:text-slate-200">
                            {row.isDistributed ? 'موزع' : 'غير موزع'}
                          </td>
                          <td className="px-1 py-2 text-center">
                            <div className="inline-flex flex-wrap items-center justify-center gap-0.5">
                              <button
                                type="button"
                                className={iconBtnPrimary}
                                title="تفاصيل"
                                onClick={() => navigate(`/external-investments/${row.id}`)}
                              >
                                <Visibility style={{ fontSize: 20 }} />
                              </button>
                              {row.status === 'OPEN' && canPost && (
                                <button
                                  type="button"
                                  className={iconBtnSecondary}
                                  title="إرجاع مع الربح"
                                  onClick={() => {
                                    setReturnRow(row);
                                    setReturnAmount('');
                                  }}
                                >
                                  <CurrencyExchange style={{ fontSize: 20 }} />
                                </button>
                              )}
                              {row.status === 'CLOSED' && !row.isDistributed && (row.profit ?? 0) > 0 && canPost && (
                                <button
                                  type="button"
                                  className={iconBtnSuccess}
                                  title="توزيع الربح"
                                  onClick={() =>
                                    openConfirm(
                                      'distribute',
                                      row.id,
                                      'تأكيد التوزيع',
                                      `سيتم توزيع الربح ${formatMoney(row.profit)} على المساهمين. المتابعة؟`
                                    )
                                  }
                                >
                                  <AccountBalanceWallet style={{ fontSize: 20 }} />
                                </button>
                              )}
                              {row.isDistributed && canPost && (
                                <button
                                  type="button"
                                  className={iconBtnWarning}
                                  title="عكس التوزيع"
                                  onClick={() =>
                                    openConfirm(
                                      'reverse',
                                      row.id,
                                      'عكس التوزيع',
                                      'سيتم عكس قيد التوزيع وتراجع أرباح المساهمين. المتابعة؟'
                                    )
                                  }
                                >
                                  <Undo style={{ fontSize: 20 }} />
                                </button>
                              )}
                              {canDelete && !row.isDistributed && (
                                <button
                                  type="button"
                                  className={iconBtnDanger}
                                  title="حذف السجل"
                                  onClick={() =>
                                    openConfirm(
                                      'delete',
                                      row.id,
                                      'حذف العملية',
                                      'حذف السجل والقيود المرتبطة (إن وُجدت) بعد إلغاء الترحيل. المتابعة؟'
                                    )
                                  }
                                >
                                  <DeleteIcon style={{ fontSize: 20 }} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:px-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                  {fromIdx}–{toIdx} من {total}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span>عدد الصفوف</span>
                    <select
                      className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(1);
                      }}
                    >
                      {[10, 25, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      السابق
                    </button>
                    <span className="px-2 text-sm text-slate-600 dark:text-slate-400">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      التالي
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <WithdrawExternalModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        isSubmitting={withdrawMut.isPending}
        onSubmit={(body) => withdrawMut.mutate(body)}
      />

      <ExternalModal
        open={!!returnRow}
        onClose={() => {
          if (!returnMut.isPending) {
            setReturnRow(null);
            setReturnAmount('');
          }
        }}
        title="تسجيل الإرجاع (إغلاق العملية)"
        disableBackdropClose={returnMut.isPending}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setReturnRow(null);
                setReturnAmount('');
              }}
              disabled={returnMut.isPending}
              className={btnSecondary}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleReturnSubmit}
              disabled={returnMut.isPending}
              className={btnPrimary}
            >
              {returnMut.isPending ? '...' : 'تأكيد'}
            </button>
          </>
        }
      >
        {returnRow && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              أدخل المبلغ الكامل المُرجع من البنك (رأس مال + ربح) — يُحدَّث الربح ورصيد الصندوق أثناء إدخال
              المبلغ.
            </p>
            <ReturnExternalModalSection
              withdrawnAmount={returnRow.amount}
              bankAccountId={returnRow.bankAccountId}
              returnAmount={returnAmount}
              onReturnAmountChange={setReturnAmount}
              inputId="ext-return-amt"
              inputDisabled={returnMut.isPending}
            />
          </div>
        )}
      </ExternalModal>

      <ExternalModal
        open={!!confirmDialog.type}
        onClose={() => !processing && setConfirmDialog({ type: null, id: null, title: '', body: '' })}
        title={confirmDialog.title}
        disableBackdropClose={!!processing}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmDialog({ type: null, id: null, title: '', body: '' })}
              disabled={!!processing}
              className={btnSecondary}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={runConfirm}
              disabled={!!processing}
              className={confirmDialog.type === 'delete' ? btnDanger : btnPrimary}
            >
              {processing ? '...' : 'تأكيد'}
            </button>
          </>
        }
      >
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{confirmDialog.body}</p>
      </ExternalModal>
    </>
  );
};

export default ExternalInvestments;
