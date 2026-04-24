import React, { useState } from 'react';
import {
  ArrowBack,
  CurrencyExchange,
  AccountBalanceWallet,
  Undo,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import {
  getExternalInvestmentById,
  returnExternalInvestment,
  distributeExternalProfit,
  reverseExternalDistribution,
  deleteExternalInvestment,
} from './externalInvestmentApi';
import { notifySuccess } from '../../utilities/toastify';
import ExternalModal from './ExternalModal';
import ReturnExternalModalSection from './ReturnExternalModalSection';

const formatMoney = (n) =>
  (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const statusLabel = (s) => (s === 'CLOSED' ? 'مغلق' : 'مفتوح');

const cardClass =
  'p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-sm';

const btnSecondary =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors';

const btnSuccess =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors';

const btnWarning =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-amber-500 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-colors';

const btnDangerOutline =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-red-500 text-red-700 dark:text-red-300 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100/80 dark:hover:bg-red-900/30 transition-colors';

const btnCancel =
  'px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const btnPrimary =
  'px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const btnDangerSolid =
  'px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const ExternalInvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const recordId = parseInt(id, 10);
  const { permissions } = usePermissions();

  const canPost = permissions.includes('external-investments_Post');
  const canDelete = permissions.includes('external-investments_Delete');

  const [returnAmount, setReturnAmount] = useState('');
  const [returnOpen, setReturnOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ type: null, title: '', body: '' });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['external-investments', recordId, 'details'],
    queryFn: () => getExternalInvestmentById(recordId),
    enabled: Number.isFinite(recordId) && recordId > 0,
    retry: 1,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['external-investments'] });
  };

  const returnMut = useMutation({
    mutationFn: (amount) => returnExternalInvestment(recordId, { amount }),
    onSuccess: () => {
      notifySuccess('تم تسجيل الإرجاع وإغلاق العملية');
      setReturnOpen(false);
      setReturnAmount('');
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['external-investments', recordId, 'details'] });
    },
  });

  const distributeMut = useMutation({
    mutationFn: () => distributeExternalProfit(recordId),
    onSuccess: (res) => {
      notifySuccess(res?.message || 'تم توزيع الربح');
      setConfirmDialog({ type: null, title: '', body: '' });
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['external-investments', recordId, 'details'] });
    },
  });

  const reverseMut = useMutation({
    mutationFn: () => reverseExternalDistribution(recordId),
    onSuccess: (res) => {
      notifySuccess(res?.message || 'تم عكس التوزيع');
      setConfirmDialog({ type: null, title: '', body: '' });
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['external-investments', recordId, 'details'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteExternalInvestment(recordId),
    onSuccess: (res) => {
      notifySuccess(res?.message || 'تم حذف السجل');
      navigate('/external-investments', { replace: true });
    },
  });

  const processing = distributeMut.isPending || reverseMut.isPending || deleteMut.isPending;

  if (!Number.isFinite(recordId) || recordId <= 0) {
    return (
      <div className="w-full p-6" dir="rtl">
        <p className="text-slate-800 dark:text-slate-200 mb-4">معرّف غير صالح</p>
        <button type="button" onClick={() => navigate('/external-investments')} className={btnPrimary}>
          رجوع
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-6" dir="rtl">
        <p className="text-red-600 dark:text-red-400 mb-4">تعذر تحميل التفاصيل: {error?.message}</p>
        <button
          type="button"
          onClick={() => navigate('/external-investments')}
          className={`${btnSecondary} gap-2`}
        >
          <ArrowBack style={{ fontSize: 20 }} />
          العودة للقائمة
        </button>
      </div>
    );
  }

  const breakdown = data?.partnerBreakdown ?? [];
  const canReturn = data?.status === 'OPEN' && canPost;
  const canDistribute =
    data?.status === 'CLOSED' && !data?.isDistributed && (data?.profit ?? 0) > 0 && canPost;
  const canReverse = data?.isDistributed && canPost;
  const canDeleteRecord = canDelete && !data?.isDistributed;

  const handleReturnSubmit = () => {
    const n = parseFloat(String(returnAmount).replace(/,/g, ''));
    if (!n || n <= 0) return;
    returnMut.mutate(n);
  };

  return (
    <>
      <Helmet>
        <title>{`تفاصيل استثمار خارجي #${recordId}`}</title>
      </Helmet>
      <div className="w-full max-w-none p-4 sm:p-6 md:p-8" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/external-investments')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="رجوع"
            >
              <ArrowBack style={{ fontSize: 28 }} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                تفاصيل الاستثمار الخارجي #{data.id}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {data.user?.name && `الموظف: ${data.user.name}`}
                {data.bankAccount?.name && ` — البنك: ${data.bankAccount.name}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            {canReturn && (
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  setReturnOpen(true);
                  setReturnAmount('');
                }}
              >
                <CurrencyExchange style={{ fontSize: 20 }} />
                إرجاع مع الربح
              </button>
            )}
            {canDistribute && (
              <button
                type="button"
                className={btnSuccess}
                onClick={() =>
                  setConfirmDialog({
                    type: 'distribute',
                    title: 'تأكيد التوزيع',
                    body: `سيتم توزيع الربح ${formatMoney(data.profit)} على المساهمين.`,
                  })
                }
              >
                <AccountBalanceWallet style={{ fontSize: 20 }} />
                توزيع الربح
              </button>
            )}
            {canReverse && (
              <button
                type="button"
                className={btnWarning}
                onClick={() =>
                  setConfirmDialog({
                    type: 'reverse',
                    title: 'عكس التوزيع',
                    body: 'سيتم عكس قيد التوزيع وتراجع أرباح المساهمين.',
                  })
                }
              >
                <Undo style={{ fontSize: 20 }} />
                عكس التوزيع
              </button>
            )}
            {canDeleteRecord && (
              <button
                type="button"
                className={btnDangerOutline}
                onClick={() =>
                  setConfirmDialog({
                    type: 'delete',
                    title: 'حذف السجل',
                    body: 'حذف العملية والقيود المرتبطة. لا يُنصح إذا كان السجل مُرحّلاً ببيئة إنتاج دون تنسيق.',
                  })
                }
              >
                <DeleteIcon style={{ fontSize: 20 }} />
                حذف
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className={cardClass}>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">المسحوب</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
              {formatMoney(data.amount)}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">الحالة</p>
            <span
              className={`inline-flex mt-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                data.status === 'CLOSED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {statusLabel(data.status)}
            </span>
          </div>
          <div className={cardClass}>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">التوزيع</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {data.isDistributed ? 'موزع' : 'غير موزع'}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">المرتجع</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
              {data.returnedAmount != null ? formatMoney(data.returnedAmount) : '—'}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">الربح</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">
              {data.profit != null ? formatMoney(data.profit) : '—'}
            </p>
          </div>
          <div className={cardClass}>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">تاريخ الإرجاع</p>
            <p className="text-slate-800 dark:text-slate-200 mt-1 text-sm sm:text-base">
              {data.returnedAt ? new Date(data.returnedAt).toLocaleString('ar-EG') : '—'}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">تفصيل نصيب المساهمين (عند الإغلاق)</h2>
        <div
          className={`${cardClass} p-0 overflow-hidden mb-4`}
        >
          <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary text-white sticky top-0 shadow-sm">
                <tr>
                  {[
                    'المساهم',
                    'نسبة رأس المال %',
                    'نسبة الربح للشركة %',
                    'نصيب الربح الخام',
                    'نصيب الشركة',
                    'الصافي للمساهم',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-2 sm:px-3 py-2.5 text-center font-bold text-white border-b border-white/20 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdown.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                      {data.status === 'OPEN'
                        ? 'يُحسب تفصيل المساهمين بعد إغلاق العملية وإرجاع المبلغ.'
                        : 'لا توجد بيانات تفصيل.'}
                    </td>
                  </tr>
                ) : (
                  breakdown.map((row) => (
                    <tr
                      key={row.partnerId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80"
                    >
                      <td className="px-2 sm:px-3 py-2 text-center text-slate-800 dark:text-slate-200">
                        {row.partnerName}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center tabular-nums text-slate-800 dark:text-slate-200">
                        {row.sharePercent != null ? formatMoney(row.sharePercent) : '—'}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center tabular-nums text-slate-800 dark:text-slate-200">
                        {row.orgProfitPercent != null ? formatMoney(row.orgProfitPercent) : '—'}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center tabular-nums text-slate-800 dark:text-slate-200">
                        {row.rawProfitShare != null ? formatMoney(row.rawProfitShare) : '—'}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center tabular-nums text-slate-800 dark:text-slate-200">
                        {row.orgCut != null ? formatMoney(row.orgCut) : '—'}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center tabular-nums text-slate-800 dark:text-slate-200">
                        {row.partnerFinal != null ? formatMoney(row.partnerFinal) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ExternalModal
        open={returnOpen}
        onClose={() => {
          if (!returnMut.isPending) {
            setReturnOpen(false);
            setReturnAmount('');
          }
        }}
        title="تسجيل الإرجاع"
        disableBackdropClose={returnMut.isPending}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setReturnOpen(false);
                setReturnAmount('');
              }}
              disabled={returnMut.isPending}
              className={btnCancel}
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
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            أدخل المبلغ الكامل المُرجع (رأس مال + ربح) — يُحدَّث الربح ورصيد الصندوق أثناء إدخال المبلغ.
          </p>
          <ReturnExternalModalSection
            withdrawnAmount={data.amount}
            bankAccountId={data.bankAccountId}
            returnAmount={returnAmount}
            onReturnAmountChange={setReturnAmount}
            inputId="ext-detail-return"
            inputDisabled={returnMut.isPending}
          />
        </div>
      </ExternalModal>

      <ExternalModal
        open={!!confirmDialog.type}
        onClose={() => !processing && setConfirmDialog({ type: null, title: '', body: '' })}
        title={confirmDialog.title}
        disableBackdropClose={!!processing}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmDialog({ type: null, title: '', body: '' })}
              disabled={!!processing}
              className={btnCancel}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirmDialog.type === 'distribute') distributeMut.mutate();
                if (confirmDialog.type === 'reverse') reverseMut.mutate();
                if (confirmDialog.type === 'delete') deleteMut.mutate();
              }}
              disabled={!!processing}
              className={confirmDialog.type === 'delete' ? btnDangerSolid : btnPrimary}
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

export default ExternalInvestmentDetails;
