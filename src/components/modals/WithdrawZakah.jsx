import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Autocomplete,
} from '@mui/material';
import { VolunteerActivism as ZakatIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getBanks } from '../../pages/Banks/bankApis';
import BankAccountBalanceInline from '../loans/BankAccountBalanceInline';
import { debounce } from '../../utilities/debounce';

const WithdrawZakah = ({ open, onClose, onWithdraw, accountBalance }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [banksPage, setBanksPage] = useState(1);
  const [banksSearch, setBanksSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const debouncedBanksSearch = useMemo(
    () => debounce((v) => { setBanksSearch(v); setBanksPage(1); }, 400),
    []
  );
  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ['banks', 'zakat-withdraw', banksPage, banksSearch],
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
  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (!selectedBank?.id) {
      setError('يرجى اختيار الحساب البنكي');
      return;
    }
    if (parseFloat(amount) > accountBalance) {
      setError('المبلغ المدخل أكبر من رصيد حساب الزكاة');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onWithdraw(parseFloat(amount), selectedBank.id);
      setAmount('');
      setSelectedBank(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء السحب');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setAmount('');
    setError('');
    setSelectedBank(null);
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ZakatIcon color="primary" sx={{marginRight: "10px"}} />
          <Typography variant="h6" fontWeight="bold">
            سحب مبلغ الزكاة
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          الرصيد المتاح: {accountBalance?.toLocaleString() || 0}
        </Typography>
        <Autocomplete
          sx={{ mb: 2 }}
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
        <TextField
          fullWidth
          label="المبلغ المطلوب سحبه"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onFocus={() => setError('')}
          sx={{ mb: 2 }}
          inputProps={{ min: 0, step: 0.01 }}
        />
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1, flexDirection: 'row-reverse' }}>
        <Button onClick={handleClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !amount}
          startIcon={loading ? <CircularProgress size={16} /> : <ZakatIcon sx={{marginLeft: "10px"}} />}
        >
          {loading ? 'جاري السحب...' : 'سحب المبلغ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default WithdrawZakah;
