import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBankAccountBalance } from '../Banks/bankApis';
import { inputClass, labelClass } from './inputClasses';

const formatMoney = (n) =>
  (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * واجهة: رصيد الحساب (من API)، المسحوب، الربح = المُرجع − المسحوب.
 * «رصيد الصندوق بعد الإرجاع» = رصيد الحساب الحالي + المبلغ المُرجع كاملاً.
 */
const ReturnExternalModalSection = ({
  withdrawnAmount,
  bankAccountId,
  returnAmount,
  onReturnAmountChange,
  inputId = 'ext-return-amount',
  inputDisabled = false,
}) => {
  const amountNumeric = useMemo(() => {
    const t = String(returnAmount).replace(/,/g, '').trim();
    if (t === '' || t === '.') return 0;
    const n = parseFloat(t);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
  }, [returnAmount]);

  const { data: accountBalance, isLoading: balanceLoading, isError: balanceError } = useQuery({
    queryKey: ['bank-account-balance', 'return-preview', bankAccountId],
    queryFn: () => getBankAccountBalance(bankAccountId),
    enabled: !!bankAccountId,
    retry: 1,
  });

  const B = useMemo(
    () => (typeof accountBalance === 'number' ? accountBalance : parseFloat(accountBalance) || 0),
    [accountBalance]
  );

  const profitPreview = useMemo(() => amountNumeric - withdrawnAmount, [amountNumeric, withdrawnAmount]);

  /** رصيد الصندوق بعد الإرجاع = الرصيد الحالي + المبلغ المُرجع (كامل) */
  const fundAfter = useMemo(() => B + amountNumeric, [B, amountNumeric]);

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass} htmlFor={inputId}>
          المبلغ المُرجع
        </label>
        <input
          id={inputId}
          type="text"
          className={inputClass}
          value={returnAmount}
          onChange={(e) => onReturnAmountChange(e.target.value)}
          autoComplete="off"
          disabled={inputDisabled}
        />
      </div>

      {bankAccountId && balanceLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          جارٍ جلب رصيد الحساب...
        </div>
      )}

      {bankAccountId && balanceError && (
        <p className="text-sm text-amber-700 dark:text-amber-300">تعذر جلب رصيد الحساب.</p>
      )}

      {bankAccountId && !balanceLoading && !balanceError && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 dark:bg-primary/10 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 space-y-1.5">
          <p>
            <span className="text-slate-500 dark:text-slate-400">رصيد الحساب: </span>
            <span className="font-bold tabular-nums">{formatMoney(B)}</span>
          </p>
          <p>
            <span className="text-slate-500 dark:text-slate-400">المسحوب في العملية: </span>
            <span className="font-bold tabular-nums">{formatMoney(withdrawnAmount)}</span>
          </p>
          {amountNumeric > 0 && (
            <p>
              <span className="text-slate-500 dark:text-slate-400">الربح المُقدَّر (المُرجع − المسحوب): </span>
              <span
                className={`font-bold tabular-nums ${
                  profitPreview < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {formatMoney(profitPreview)}
              </span>
            </p>
          )}
          {amountNumeric > 0 && (
            <p className="text-primary font-semibold pt-1 border-t border-primary/15">
              رصيد الصندوق بعد الإرجاع:{' '}
              <span className="tabular-nums text-slate-900 dark:text-white">{formatMoney(fundAfter)}</span>
            </p>
          )}
        </div>
      )}

      {!bankAccountId && (
        <p className="text-xs text-amber-700 dark:text-amber-300">لا يوجد حساب بنكي مربوط — لا يمكن عرض رصيد الصندوق.</p>
      )}
    </div>
  );
};

export default ReturnExternalModalSection;
