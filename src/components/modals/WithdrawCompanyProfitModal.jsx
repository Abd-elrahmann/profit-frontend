import React, { useState, useCallback } from 'react';
import { withdrawCompanyProfit } from '../../pages/companyProfit/CompanyProfitApi';
import { notifySuccess, notifyError } from '../../utilities/toastify';
const WithdrawCompanyProfitModal = ({ open, onClose, availableAmount, onSuccess }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const handleClose = useCallback(() => {
    onClose();
    setWithdrawAmount('');
    setWithdrawError('');
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
    if (withdrawError) {
      notifyError('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }
    setIsWithdrawing(true);
    try {
      await withdrawCompanyProfit(amount);
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
    !!withdrawError;
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