import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AccountBalanceWallet as AccountBalanceWalletIcon, Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";
import { Autocomplete, Chip, TextField } from "@mui/material";
const SavingPercentage = ({
  open,
  onClose,
  onApply,
  currentPercentage = "",
  partners = [],
  selectedPartnerIds = [],
}) => {
  const [savingAmount, setSavingAmount] = useState("");
  const [calculatedPercentage, setCalculatedPercentage] = useState(0);
  const [error, setError] = useState("");
  const partnerOptions = useMemo(
    () =>
      partners.map((partner) => ({
        id: Number(partner.partnerId),
        name: partner.partnerName || "شريك",
        profit: Number(partner.finalProfit || partner.totalProfit || 0),
      })),
    [partners]
  );
  const [selectedPartners, setSelectedPartners] = useState([]);

  const selectedPartnersProfit = selectedPartners.reduce(
    (sum, partner) => sum + Number(partner.profit || 0),
    0
  );

  useEffect(() => {
    if (!open) return;

    if (!partnerOptions.length) {
      setSelectedPartners([]);
      return;
    }

    const hasSelection = Array.isArray(selectedPartnerIds) && selectedPartnerIds.length > 0;
    const initialSelection = hasSelection
      ? partnerOptions.filter((option) => selectedPartnerIds.includes(option.id))
      : [];

    setSelectedPartners(initialSelection);
  }, [open, partnerOptions, selectedPartnerIds]);

  useEffect(() => {
    if (open && currentPercentage && selectedPartnersProfit > 0) {
      const amount = (currentPercentage / 100) * selectedPartnersProfit;
      setSavingAmount(amount.toString());
      setCalculatedPercentage(currentPercentage);
    } else if (open) {
      setSavingAmount("");
      setCalculatedPercentage(0);
    }
  }, [open, currentPercentage, selectedPartnersProfit]);

  const handleSubmit = () => {
    if (!selectedPartners.length) {
      setError("من فضلك اختر مساهم واحد على الأقل");
      return;
    }

    if (savingAmount === "") {
      setError("من فضلك ادخل مبلغ الادخار");
      return;
    }
    const numericAmount = Number(savingAmount);
    if (numericAmount <= 0) {
      setError("المبلغ يجب أن يكون أكبر من صفر");
      return;
    }
    if (selectedPartnersProfit > 0 && numericAmount > selectedPartnersProfit) {
      setError("لا يمكن أن يكون مبلغ الادخار أكبر من إجمالي أرباح المساهمين المختارين");
      return;
    }
    const percentage = selectedPartnersProfit > 0 ? (numericAmount / selectedPartnersProfit) * 100 : 0;
    onApply({
      percentage,
      partnerIds: selectedPartners.map((partner) => partner.id),
    });
    onClose();
  };
  const handleClose = useCallback(() => {
    setSavingAmount("");
    setCalculatedPercentage(0);
    setError("");
    onClose();
  }, [onClose]);
  const handleAmountChange = (value) => {
    setSavingAmount(value);
    if (value === "") {
      setCalculatedPercentage(0);
      setError("");
      return;
    }
    const numericAmount = Number(value);
    if (selectedPartnersProfit > 0) {
      const percentage = (numericAmount / selectedPartnersProfit) * 100;
      setCalculatedPercentage(Math.min(100, Math.max(0, percentage)));
    }
    setError("");
  };
  const fmt = (n) => (n ?? 0).toLocaleString("en-US");
  const remaining = selectedPartnersProfit - Number(savingAmount || 0);
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative bg-white dark:bg-background-dark rounded-xl shadow-xl max-w-md w-full overflow-visible">
        {}
        <div className="flex items-center justify-center gap-2 p-4 border-b border-primary/10 bg-primary/5">
          <AccountBalanceWalletIcon className="text-primary" sx={{ fontSize: 28 }} />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            مبلغ الادخار
          </h2>
        </div>
        {}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              المساهمين المراد الادخار لهم
            </label>
            <Autocomplete
              multiple
              size="small"
              disablePortal
              filterSelectedOptions
              options={partnerOptions}
              value={selectedPartners}
              onChange={(_, value) => {
                setSelectedPartners(value);
                setError("");
              }}
              disableCloseOnSelect
              getOptionLabel={(option) => option?.name || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="اختر المساهمين"
                  variant="outlined"
                />
              )}
            />
            <p className="text-xs text-slate-500 mt-1">
              تم اختيار {selectedPartners.length} من {partnerOptions.length}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              مبلغ الادخار
            </label>
            <input
              type="number"
              value={savingAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              min={0}
              step={0.01}
              placeholder="أدخل مبلغ الادخار"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          {calculatedPercentage > 0 && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                النسبة المحسوبة:{" "}
                <span className="font-bold text-primary">
                  {calculatedPercentage.toFixed(2)}%
                </span>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                من إجمالي أرباح المختارين: {fmt(selectedPartnersProfit)}
              </p>
              <p className="text-sm">
                المبلغ المتبقي:{" "}
                <span className="font-bold text-primary">{fmt(remaining)}</span>
              </p>
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <strong>ملاحظة:</strong> سيتم خصم {calculatedPercentage.toFixed(2)}% (
              {savingAmount || 0}) من إجمالي الأرباح قبل توزيعها على الشركاء.
            </p>
            <p className="mt-1 font-medium">
              المبلغ المتبقي للتوزيع: {fmt(remaining)}
            </p>
          </div>
        </div>
        {}
        <div className="flex gap-2 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-bold"
          >
            <CheckIcon sx={{ fontSize: 18 }} />
            تطبيق المبلغ
          </button>
        </div>
      </div>
    </div>
  );
};
export default SavingPercentage;
