import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { withdrawCompanyProfit } from '../../pages/companyProfit/CompanyProfitApi';
import { getBanks } from '../../pages/Banks/bankApis';
import BankAccountBalanceInline from '../loans/BankAccountBalanceInline';
import { debounce } from '../../utilities/debounce';
import { notifySuccess, notifyError } from '../../utilities/toastify';

const WithdrawCompanyProfitModal = ({ open, onClose, availableAmount, onSuccess }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [banksPage, setBanksPage] = useState(1);
  const [banksSearch, setBanksSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const debouncedBanksSearch = useMemo(
    () => debounce((v) => { setBanksSearch(v); setBanksPage(1); }, 400),
    []
  );
  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ['banks', 'company-withdraw', banksPage, banksSearch],
    queryFn: () => getBanks(banksPage, banksSearch),
    enabled: open,
    retry: 1,
  });
  useEffect(() => {
    if (!open) {
      setSelectedBank(null);
      setBanksSearch('');
      setBanksPage(1);
    }
  }, [open]);
  const handleClose = useCallback(() => {
    onClose();
    setWithdrawAmount('');
    setWithdrawError('');
    setSelectedBank(null);
  }, [onClose]);
  const validateAmount = useCallback(
    (value) => {
      if (!value || !availableAmount) return '';
      const amount = parseFloat(value);
      if (amount > availableAmount) {
        return `المبلغ المدخل (${amount.toLocaleString('en-US')}) يتجاوز الرصيد المتاح (${availableAmount.toLocaleString('en-US')})`;
      }
      if (amount <= 0) return 'يجب أن يكون المبلغ أكبر من صفر';
      return '';
    },
    [availableAmount]
  );
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    setWithdrawError(validateAmount(value));
  };
  const handleSubmit = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      notifyError('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (!selectedBank?.id) {
      notifyError('يرجى اختيار الحساب البنكي');
      return;
    }
    if (withdrawError) {
      notifyError('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }
    setIsWithdrawing(true);
    try {
      await withdrawCompanyProfit(amount, selectedBank.id);
      notifySuccess('تم سحب الأرباح بنجاح');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Withdraw Error:', error);
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء سحب الأرباح');
    } finally {
      setIsWithdrawing(false);
    }
  };
  const isSubmitDisabled =
    isWithdrawing ||
    !withdrawAmount ||
    parseFloat(withdrawAmount) <= 0 ||
    !!withdrawError ||
    !selectedBank?.id;
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => !isWithdrawing && handleClose()}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-modal-title"
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 id="withdraw-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
            سحب أرباح الشركة
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
            الرصيد المتاح: {(availableAmount || 0).toLocaleString('en-US')}
          </p>
          <Box sx={{ mb: 1 }}>
            <Autocomplete
              options={banksData?.data || []}
              getOptionLabel={(option) => `${option.name} - ${option.accountNumber}`}
              value={selectedBank}
              onChange={(_, v) => setSelectedBank(v)}
              onInputChange={(_, v, reason) => {
                if (reason === 'input') debouncedBanksSearch(v);
              }}
              loading={isBanksLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="الحساب البنكي"
                  placeholder="ابحث باسم الحساب أو رقم الحساب"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isBanksLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <BankAccountBalanceInline bankAccountId={selectedBank?.id} />
          </Box>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              مبلغ السحب
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={handleAmountChange}
              min={0}
              step={0.01}
              placeholder="أدخل المبلغ"
              className={`w-full px-4 py-2.5 rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                withdrawError
                  ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-600'
              }`}
            />
            <p className={`mt-1 text-xs ${withdrawError ? 'text-red-500' : 'text-slate-500'}`}>
              {withdrawError || 'أدخل المبلغ المراد سحبه من أرباح الشركة'}
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between gap-3 flex-row-reverse">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 min-w-[80px]"
          >
            {isWithdrawing ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              'سحب'
            )}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={isWithdrawing}
            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
export default WithdrawCompanyProfitModal;
