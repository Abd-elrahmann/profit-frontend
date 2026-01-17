import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Grid,
} from '@mui/material';
import { Savings as SavingsIcon } from '@mui/icons-material';

const SavingPercentage = ({ open, onClose, onApply, currentPercentage = "", totalProfit = 0 }) => {
  const [savingAmount, setSavingAmount] = useState('');
  const [calculatedPercentage, setCalculatedPercentage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && currentPercentage && totalProfit > 0) {
      const amount = (currentPercentage / 100) * totalProfit;
      setSavingAmount(amount.toString());
      setCalculatedPercentage(currentPercentage);
    } else if (open) {
      setSavingAmount('');
      setCalculatedPercentage(0);
    }
  }, [open, currentPercentage, totalProfit]);

  const handleSubmit = () => {
    if (savingAmount === "") {
      setError("من فضلك ادخل مبلغ الادخار");
      return;
    }

    const numericAmount = Number(savingAmount);

    if (numericAmount < 0) {
      setError('يجب أن يكون مبلغ الادخار أكبر من أو يساوي صفر');
      return;
    }

    if (totalProfit > 0 && numericAmount > totalProfit) {
      setError('لا يمكن أن يكون مبلغ الادخار أكبر من إجمالي الأرباح');
      return;
    }

    const percentage = totalProfit > 0 ? (numericAmount / totalProfit) * 100 : 0;

    onApply(percentage);
    onClose();
  };

  const handleClose = () => {
    setSavingAmount('');
    setCalculatedPercentage(0);
    setError('');
    onClose();
  };

  const handleAmountChange = (value) => {
    setSavingAmount(value);

    if (value === "") {
      setCalculatedPercentage(0);
      setError('');
      return;
    }

    const numericAmount = Number(value);

    if (totalProfit > 0) {
      const percentage = (numericAmount / totalProfit) * 100;
      setCalculatedPercentage(Math.min(100, Math.max(0, percentage)));
    }

    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <SavingsIcon color="primary" />
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            مبلغ الادخار
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} justifyContent="center" alignItems="center" mt={2}>
          <Grid item xs={12}>
            <TextField
              label="مبلغ الادخار"
              type="number"
              value={savingAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ width: "300px" }}
              placeholder="أدخل مبلغ الادخار"
            />
          </Grid>
          {calculatedPercentage > 0 && (
            <Grid item xs={12}>
              <Box sx={{
                p: 2,
                bgcolor: 'primary.50',
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body1" fontWeight="bold" color="primary.main">
                  النسبة المحسوبة: <strong>{calculatedPercentage.toFixed(2)}%</strong>
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="text.secondary">
                  من إجمالي الأرباح: {totalProfit?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  المبلغ المتبقي: <strong>{(totalProfit - Number(savingAmount || 0))?.toLocaleString() || 0} ريال</strong>
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body1" fontWeight="bold">
            <strong>ملاحظة:</strong> سيتم خصم {calculatedPercentage.toFixed(2)}% ({savingAmount || 0} ريال) من إجمالي الأرباح قبل توزيعها على الشركاء
            <br />
            المبلغ المتبقي للتوزيع: <strong>{(totalProfit - Number(savingAmount || 0))?.toLocaleString() || 0} ريال</strong>
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1, flexDirection: 'row-reverse' }}>
        <Button onClick={handleClose}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          startIcon={<SavingsIcon sx={{marginLeft:"10px"}} />}
        >
          تطبيق المبلغ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingPercentage;
