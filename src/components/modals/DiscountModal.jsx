import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getBanks } from '../../pages/Banks/bankApis';
import BankAccountBalanceInline from '../loans/BankAccountBalanceInline';
import { debounce } from '../../utilities/debounce';

const DiscountModal = ({
  open,
  onClose,
  onConfirm,
  installmentAmount = 0,
  loading = false,
  title = "تطبيق خصم على الدفعة"
}) => {
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [banksPage, setBanksPage] = useState(1);
  const [banksSearch, setBanksSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const debouncedBanksSearch = useMemo(
    () => debounce((value) => {
      setBanksSearch(value);
      setBanksPage(1);
    }, 400),
    []
  );
  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ['banks', 'discount-modal', banksPage, banksSearch],
    queryFn: () => getBanks(banksPage, banksSearch),
    enabled: open,
    retry: 1,
  });
  const handleConfirm = () => {
    const discountValue = parseFloat(discount) || 0;
    if (discountValue < 0) {
      setError('الخصم لا يمكن أن يكون قيمة سالبة');
      return;
    }
    if (discountValue > installmentAmount) {
      setError(`الخصم لا يمكن أن يتجاوز مبلغ الدفعة (${installmentAmount.toLocaleString()})`);
      return;
    }
    if (!selectedBank?.id) {
      setError('يرجى اختيار الحساب البنكي');
      return;
    }
    setError('');
    onConfirm({
      discount: discountValue,
      notes: notes.trim() || (discountValue > 0 ? 'تم تطبيق خصم على الدفعة' : 'تمت الموافقة على الدفعة'),
      BankId: selectedBank.id,
    });
    setDiscount('');
    setNotes('');
    setSelectedBank(null);
  };
  const handleClose = () => {
    setDiscount('');
    setNotes('');
    setError('');
    setSelectedBank(null);
    setBanksSearch('');
    setBanksPage(1);
    onClose();
  };
  const finalAmount = Math.max(0, installmentAmount - (parseFloat(discount) || 0));
  const hasDiscount = (parseFloat(discount) || 0) > 0;
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            مبلغ الدفعة: <strong>{installmentAmount.toLocaleString()}</strong>
          </Typography>
        </Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            ملاحظة: مبلغ الخصم يجب ألا يتعدى مبلغ الدفعة ({installmentAmount.toLocaleString()})
          </Typography>
        </Alert>
        <Autocomplete
          options={banksData?.data || []}
          getOptionLabel={(option) => `${option.name} - ${option.accountNumber}`}
          value={selectedBank}
          onChange={(_, newValue) => setSelectedBank(newValue)}
          onInputChange={(_, value, reason) => {
            if (reason === 'input') debouncedBanksSearch(value);
          }}
          loading={isBanksLoading}
          sx={{ mb: 2 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="الحساب البنكي (استلام السداد)"
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
        <TextField
          fullWidth
          label="مبلغ الخصم"
          type="number"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          sx={{ mb: 2 }}
          inputProps={{
            min: 0,
            step: 0.01
          }}
        />
        <TextField
          fullWidth
          label="سبب الخصم (اختياري)"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
        />
        {finalAmount !== installmentAmount && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              المبلغ النهائي بعد الخصم: <strong>{finalAmount.toLocaleString()}</strong>
            </Typography>
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1, display: 'flex', justifyContent: 'space-between', flexDirection: 'row-reverse' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          إلغاء
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {hasDiscount ? 'تطبيق الخصم' : 'الموافقة علي الدفعة'}
          {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DiscountModal;
