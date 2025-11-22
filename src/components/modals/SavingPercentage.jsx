import React, { useState } from 'react';
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

const SavingPercentage = ({ open, onClose, onApply, currentPercentage = "" }) => {
  const [percentage, setPercentage] = useState(currentPercentage);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // لو فاضي
    if (percentage === "") {
      setError("من فضلك ادخل نسبة صحيحة");
      return;
    }

    const numericValue = Number(percentage);

    if (numericValue < 0 || numericValue > 100) {
      setError('يجب أن تكون النسبة بين 0% و 100%');
      return;
    }

    onApply(numericValue);
    onClose();
  };

  const handleClose = () => {
    setPercentage(currentPercentage);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <SavingsIcon color="primary" />
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            نسبة ادخار الأرباح
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} justifyContent="center" alignItems="center" mt={2}>
          <Grid item xs={12}>
            <TextField
              label="نسبة الادخار %"
              type="number"
              value={percentage}
              onChange={(e) => {
                let value = e.target.value;

                // لو فاضي
                if (value === "") {
                  setPercentage("");
                  return;
                }

                // تحويل لرقم + منع ادخال اكتر من 100
                const numeric = Math.min(100, Math.max(0, Number(value)));

                setPercentage(numeric);
                setError('');
              }}
              inputProps={{ min: 0, max: 100, step: 1 }}
              sx={{ width: "300px" }}
            />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>ملاحظة:</strong> سيتم خصم {percentage || 0}% من إجمالي الأرباح قبل توزيعها على الشركاء
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
          تطبيق النسبة
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingPercentage;
