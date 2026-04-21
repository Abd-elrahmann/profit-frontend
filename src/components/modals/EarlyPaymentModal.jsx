import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Divider,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getBanks } from "../../pages/Banks/bankApis";
import BankAccountBalanceInline from "../loans/BankAccountBalanceInline";
import { debounce } from "../../utilities/debounce";

const EarlyPaymentModal = ({
  open,
  onClose,
  sortedInstallments,
  isLoadingAllRepayments = false,
  discountAmount,
  onDiscountChange,
  onConfirm,
}) => {
  const [discountError, setDiscountError] = useState("");
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
    queryKey: ["banks", "early-payment-modal", banksPage, banksSearch],
    queryFn: () => getBanks(banksPage, banksSearch),
    enabled: open,
    retry: 1,
  });
  const pendingInstallments = (sortedInstallments || []).filter((inst) => inst.status === "PENDING" || inst.status === "PARTIAL_PAID");
  useEffect(() => {
    if (open) {
      setDiscountError("");
      setTouched(false);
      setBankError("");
      setSelectedBank(null);
      setBanksSearch("");
      setBanksPage(1);
    }
  }, [open]);
  const validateDiscount = (value) => {
    if (!value || value.trim() === "") {
      return "";
    }
    const discount = parseFloat(value);
    if (isNaN(discount)) {
      return "يرجى إدخال قيمة خصم صحيحة";
    }
    if (discount < 0) {
      return "قيمة الخصم لا يمكن أن تكون سالبة";
    }
    const totalPending = pendingInstallments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
    if (discount > totalPending) {
      return `قيمة الخصم لا يمكن أن تتجاوز إجمالي الدفعات المعلقة (${totalPending.toLocaleString()} ريال)`;
    }
    if (discount > totalPending * 0.5) {
      return "قيمة الخصم لا يمكن أن تتجاوز 50% من إجمالي الدفعات المعلقة";
    }
    return "";
  };
  const handleDiscountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      onDiscountChange(e);
      if (discountError) {
        setDiscountError("");
      }
    }
  };
  const handleDiscountBlur = () => {
    setTouched(true);
    const error = validateDiscount(discountAmount);
    setDiscountError(error);
  };
  const handleConfirmClick = () => {
    setTouched(true);
    const error = validateDiscount(discountAmount);
    setDiscountError(error);
    if (!selectedBank?.id) {
      setBankError("يرجى اختيار الحساب البنكي");
      return;
    }
    setBankError("");
    if (!error) {
      onConfirm(selectedBank.id);
    }
  };
  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      open={open}
      onClose={onClose}
    >
      <DialogTitle
        sx={{ textAlign: "center" }}
      >
        سداد مبكر للدفعة
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" mb={2}>
          أنت على وشك إجراء سداد مبكر للدفعات المعلقة فقط
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
        {isLoadingAllRepayments ? (
          <Box sx={{ mb: 2, p: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              جاري تحميل جميع الدفعات المعلقة...
            </Typography>
          </Box>
        ) : (
        <Box sx={{ mb: 2, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            الدفعات المعلقة (
            {pendingInstallments.length}
            ):
          </Typography>
          {pendingInstallments.map((installment) => (
            <Box
              key={installment.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2">
                دفعة #{installment.count} -{" "}
                {dayjs(installment.dueDate).format("DD/MM/YYYY")}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {installment.remaining?.toFixed(2)}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" fontWeight="bold">
              المبلغ الإجمالي للدفعات المعلقة:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color="primary.main"
            >
              {pendingInstallments
                .reduce((sum, inst) => sum + (inst.remaining || 0), 0)
                .toLocaleString()}{" "}
            </Typography>
          </Box>
        </Box>
        )}
        <TextField
          fullWidth
          type="number"
          label="قيمة الخصم (اختياري)"
          value={discountAmount}
          onChange={handleDiscountChange}
          onBlur={handleDiscountBlur}
          error={touched && !!discountError}
          InputProps={{
            inputProps: {
              min: 0,
              step: 0.01,
              max: pendingInstallments.reduce((sum, inst) => sum + (inst.remaining || 0), 0),
            },
          }}
          helperText={
            touched && discountError ? discountError :
            "ادخل قيمة الخصم إذا كان هناك خصم على السداد المبكر (بالريال السعودي)"
          }
          sx={{ mt: 2 }}
        />
        {discountAmount > 0 && (
          <Box
            sx={{ mt: 2, p: 2, borderRadius: 1 }}
          >
            <Typography
              variant="body2"
              fontWeight="bold"
              color="primary.main"
            >
              المبلغ بعد الخصم:{" "}
              {(
                pendingInstallments
                  .reduce((sum, inst) => sum + (inst.remaining || 0), 0) -
                parseFloat(discountAmount || 0)
              ).toLocaleString()}{" "}
            </Typography>
          </Box>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            تنبيه:
          </Typography>
          <Typography variant="body2">
            بعد السداد المبكر، سيتم تحويل الدفعات المعلقة فقط إلى حالة "مدفوع
            مسبقاً" وإخفاء أزرار الإجراءات لها. الدفعات المدفوعة مسبقاً لن
            تتأثر.
          </Typography>
        </Alert>
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
          onClick={handleConfirmClick}
          variant="contained"
          color="success"
          disabled={isLoadingAllRepayments || pendingInstallments.length === 0}
          sx={{
            bgcolor: "success.main",
            "&:hover": { bgcolor: "success.dark" },
            "&:disabled": {
              bgcolor: "action.disabled",
              color: "text.disabled",
            },
          }}
        >
          تأكيد السداد المبكر
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default EarlyPaymentModal;
