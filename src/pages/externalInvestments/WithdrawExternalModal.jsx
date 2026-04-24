import React, { useState, useEffect, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { getBanksForExternalInvestments } from './externalInvestmentApi';
import { getBankAccountBalance } from '../Banks/bankApis';
import { useQuery } from '@tanstack/react-query';
import { notifyError } from '../../utilities/toastify';
import ExternalModal from './ExternalModal';
import { inputClass, labelClass } from './inputClasses';

const btnSecondary =
  'px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const btnPrimary =
  'px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const formatMoney = (n) =>
  (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const WithdrawExternalModal = ({ open, onClose, onSubmit, isSubmitting }) => {
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState(null);

  const { data: banksData, isLoading: banksLoading } = useQuery({
    queryKey: ['banks', 'external-withdraw'],
    queryFn: getBanksForExternalInvestments,
    enabled: open,
    retry: 1,
  });

  const bankOptions = banksData?.data ?? [];

  const { data: accountBalance, isLoading: balanceLoading, isError: balanceError } = useQuery({
    queryKey: ['bank-account-balance', bank?.id],
    queryFn: () => getBankAccountBalance(bank.id),
    enabled: open && !!bank?.id,
    retry: 1,
  });

  /** مبلغ السحب كما في الإدخال — يتغيّر مع كل مفتاح لتحديث الحساب مباشرة */
  const amountNumeric = useMemo(() => {
    const t = String(amount).replace(/,/g, '').trim();
    if (t === '' || t === '.') return 0;
    const n = parseFloat(t);
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
  }, [amount]);

  const balanceNumber = useMemo(
    () => (typeof accountBalance === 'number' ? accountBalance : parseFloat(accountBalance) || 0),
    [accountBalance]
  );

 
  const projectedBalance = useMemo(
    () => Math.max(0, balanceNumber - amountNumeric),
    [balanceNumber, amountNumeric]
  );

  const canShowBalance = bank && !balanceLoading && !balanceError;

  useEffect(() => {
    if (!open) {
      setAmount('');
      setBank(null);
    }
  }, [open]);

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('');
      setBank(null);
      onClose();
    }
  };

  const handleSubmit = () => {
    if (!amountNumeric || amountNumeric <= 0) {
      notifyError('أدخل مبلغاً صحيحاً');
      return;
    }
    if (!bank?.id) {
      notifyError('اختر الحساب البنكي');
      return;
    }
    onSubmit({ amount: amountNumeric, BankId: bank.id });
  };

  return (
    <ExternalModal
      open={open}
      onClose={handleClose}
      title="سحب من الصندوق (استثمار خارجي)"
      disableBackdropClose={isSubmitting}
      footer={
        <>
          <button type="button" onClick={handleClose} disabled={isSubmitting} className={btnSecondary}>
            إلغاء
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className={btnPrimary}>
            {isSubmitting ? 'جارٍ التنفيذ...' : 'تأكيد السحب'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          يُسحب المبلغ من الاستثمار الخارجي ويُودع في الحساب البنكي المختار، مع توزيع النسب
          حسب رؤوس أموال المساهمين.
        </p>

        <div>
          <label className={labelClass} id="ext-withdraw-bank-lbl" htmlFor="ext-withdraw-bank">
            الحساب البنكي
          </label>
          <Autocomplete
            size="small"
            fullWidth
            options={bankOptions}
            getOptionLabel={(o) => o?.name || ''}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            value={bank}
            onChange={(_, v) => setBank(v)}
            loading={banksLoading}
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
                id="ext-withdraw-bank"
                hiddenLabel
                size="small"
                placeholder="— اختر —"
                fullWidth
                inputProps={{ ...params.inputProps, 'aria-labelledby': 'ext-withdraw-bank-lbl' }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {banksLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="ext-withdraw-amount">
            المبلغ
          </label>
          <input
            id="ext-withdraw-amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            autoComplete="off"
          />
        </div>

        {bank && balanceLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            جارٍ جلب رصيد الحساب...
          </div>
        )}

        {bank && balanceError && (
          <p className="text-sm text-amber-700 dark:text-amber-300">تعذر جلب رصيد الحساب.</p>
        )}

        {canShowBalance && (
          <div className="rounded-xl border border-primary/25 bg-primary/5 dark:bg-primary/10 px-3 py-2.5 text-sm text-primary space-y-1">
            <p className="font-semibold">
              متبقي في الصندوق: {formatMoney(projectedBalance)}
            </p>
            <p className="text-xs font-normal text-slate-600 dark:text-slate-400">
              الرصيد {formatMoney(balanceNumber)} − مبلغ السحب {formatMoney(amountNumeric)} — قبل التأكيد
            </p>
          </div>
        )}
      </div>
    </ExternalModal>
  );
};

export default WithdrawExternalModal;
