import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Alert,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getBanks } from "../../pages/Banks/bankApis";
import BankAccountBalanceInline from "../loans/BankAccountBalanceInline";
import { debounce } from "../../utilities/debounce";

const PartialPaymentModal = ({
  open,
  onClose,
  selectedActionInstallment,
  paidAmount,
  onAmountChange,
  onConfirm,
}) => {
  const [amountError, setAmountError] = useState("");
  const [touched, setTouched] = useState(false);
  const [bankError, setBankError] = useState("");
  const [banksPage, setBanksPage] = useState(1);
  const [banksSearch, setBanksSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const debouncedBanksSearch = useMemo(
    () =>
      debounce((value) => {
        setBanksSearch(value);
        setBanksPage(1);
      }, 400),
    []
  );
  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ["banks", "partial-payment-modal", banksPage, banksSearch],
    queryFn: () => getBanks(banksPage, banksSearch),
    enabled: open,
    retry: 1,
  });
  useEffect(() => {
    if (open) {
      setAmountError("");
      setTouched(false);
      setBankError("");
      setSelectedBank(null);
      setBanksSearch("");
      setBanksPage(1);
    }
  }, [open]);
  const validateAmount = (value) => {
    if (!value || value.trim() === "") {
      return "مبلغ الدفع مطلوب";
    }
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      return "يرجى إدخال مبلغ صحيح";
    }
    if (amount <= 0) {
      return "مبلغ الدفع يجب أن يكون أكبر من صفر";
    }
    const remaining = selectedActionInstallment?.remaining || 0;
    if (amount > remaining) {
      return `مبلغ الدفع يجب أن يكون أقل من أو يساوي المبلغ المتبقي (${remaining.toFixed(2)} ريال)`;
    }
    if (remaining > 1 && amount < 1) {
      return "مبلغ الدفع الجزئي يجب أن يكون على الأقل 1 ريال";
    }
    return "";
  };
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(e);
      if (amountError) {
        setAmountError("");
      }
    }
  };
  const handleAmountBlur = () => {
    setTouched(true);
    const error = validateAmount(paidAmount);
    setAmountError(error);
  };
  const handleConfirm = () => {
    setTouched(true);
    const error = validateAmount(paidAmount);
    setAmountError(error);
    if (!selectedBank?.id) {
      setBankError("يرجى اختيار الحساب البنكي");
      return;
    }
    setBankError("");
    if (!error) {
      onConfirm(selectedBank.id);
    }
  };
  const remainingAmount = selectedActionInstallment?.remaining || 0;
  const paidAmountNum = parseFloat(paidAmount) || 0;
  const remainingAfterPayment = Math.max(0, remainingAmount - paidAmountNum);
  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>إضافة دفع جزئي</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          الدفعة: #{selectedActionInstallment?.count} - المبلغ الأصلي:{" "}
          {selectedActionInstallment?.amount?.toFixed(2)} ريال
        </Typography>
        <Typography variant="body2" color="primary" fontWeight="bold" mb={1}>
          المبلغ المتبقي الحالي: {remainingAmount.toFixed(2)} ريال
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          المبلغ المتبقي بعد الدفع: <strong>{remainingAfterPayment.toFixed(2)}</strong> ريال
        </Typography>
        <Autocomplete
          options={banksData?.data || []}
          getOptionLabel={(option) => `${option.name} - ${option.accountNumber}`}
          value={selectedBank}
          onChange={(_, newValue) => {
            setSelectedBank(newValue);
            setBankError("");
          }}
          onInputChange={(_, value, reason) => {
            if (reason === "input") debouncedBanksSearch(value);
          }}
          loading={isBanksLoading}
          sx={{ mb: 2 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="الحساب البنكي (استلام السداد)"
              placeholder="ابحث باسم الحساب أو رقم الحساب"
              required
              error={!!bankError}
              helperText={bankError}
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
        {touched && amountError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {amountError}
          </Alert>
        )}
        <TextField
          fullWidth
          type="number"
          label="المبلغ المدفوع (بالريال السعودي)"
          value={paidAmount}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          sx={{ mt: 2 }}
          required
          error={touched && !!amountError}
          InputProps={{
            inputProps: {
              min: 0,
              max: remainingAmount,
              step: 0.01,
            },
          }}
          helperText={
            touched && amountError ? amountError :
            `أدخل المبلغ الذي تريد دفعه (الحد الأقصى: ${remainingAmount.toFixed(2)} ريال)`
          }
        />
      </DialogContent>
      <DialogActions
        sx={{ px: 3, py: 2, gap: 2, flexDirection: "row-reverse" }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
        >
          إلغاء
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!paidAmount || parseFloat(paidAmount) <= 0}
        >
          تأكيد الدفع الجزئي
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default PartialPaymentModal;
