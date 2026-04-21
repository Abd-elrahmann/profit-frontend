import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Autocomplete,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getBanks } from '../../pages/Banks/bankApis';
import BankAccountBalanceInline from '../loans/BankAccountBalanceInline';
import { debounce } from '../../utilities/debounce';
import { formatNumber } from './profitDistributionUtils';

const ProfitDistributionConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  periodName,
  enableSaving,
  savingPercentage,
  savedAmount,
  isDistributing,
}) => {
  const [banksPage, setBanksPage] = useState(1);
  const [banksSearch, setBanksSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankError, setBankError] = useState('');
  const debouncedBanksSearch = useMemo(
    () => debounce((value) => {
      setBanksSearch(value);
      setBanksPage(1);
    }, 400),
    []
  );
  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ['banks', 'profit-distribution-confirm', banksPage, banksSearch],
    queryFn: () => getBanks(banksPage, banksSearch),
    enabled: open,
    retry: 1,
  });
  useEffect(() => {
    if (!open) {
      setSelectedBank(null);
      setBankError('');
      setBanksSearch('');
      setBanksPage(1);
    }
  }, [open]);
  const handleConfirm = () => {
    if (!selectedBank?.id) {
      setBankError('يرجى اختيار الحساب البنكي');
      return;
    }
    setBankError('');
    onConfirm(selectedBank.id);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          توزيع الأرباح
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          هل أنت متأكد من توزيع أرباح الفترة &quot;{periodName}&quot;؟
        </Typography>
        <Autocomplete
          sx={{ mt: 2 }}
          options={banksData?.data || []}
          getOptionLabel={(option) => `${option.name} - ${option.accountNumber}`}
          value={selectedBank}
          onChange={(_, v) => {
            setSelectedBank(v);
            setBankError('');
          }}
          onInputChange={(_, value, reason) => {
            if (reason === 'input') debouncedBanksSearch(value);
          }}
          loading={isBanksLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="الحساب البنكي"
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
        {enableSaving && savingPercentage > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>ملاحظة:</strong> سيتم ادخار {savingPercentage.toFixed(2)}% من الأرباح قبل التوزيع
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              المبلغ المدخر: {formatNumber(savedAmount)} ({savingPercentage.toFixed(2)}%)
            </Typography>
          </Alert>
        )}
        <Alert severity="warning" sx={{ mt: 2 }}>
          سيتم إنشاء قيد محاسبي لتوزيع الأرباح على الشركاء
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1, flexDirection: 'row-reverse' }}>
        <Button onClick={onClose} disabled={isDistributing}>
          إلغاء
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          startIcon={<CheckIcon sx={{ marginLeft: '10px' }} />}
          disabled={isDistributing}
        >
          تأكيد التوزيع
          {isDistributing && (
            <CircularProgress size={16} color="inherit" style={{ marginLeft: 8 }} />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ProfitDistributionConfirmDialog;
