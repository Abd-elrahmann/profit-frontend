import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Stack,
  Box,
  IconButton,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { createExpense } from "../../pages/Expenses/expensesApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import Api from "../../config/Api";
const EXPENSE_TYPES = [
  "مصروف رواتب",
  "مصروف بنزين",
  "مصروفات انترنت",
  "مصروفات ورقية",
  "مصروفات كهرباء",
  "مصروفات تشغيلية",
  "مصروفات اخرى"
];
const AddExpense = ({ open, onClose, onSuccess, isMobile = false, isSmallScreen }) => {
  const [expenses, setExpenses] = useState([
    { type: "", amount: "", description: "", userId: null }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  useEffect(() => {
    if (open) {
      setExpenses([{ type: "", amount: "", description: "", userId: null }]);
      setErrors([]);
      const fetchUsers = async () => {
        try {
          setUsersLoading(true);
          const response = await Api.get('/api/expenses/users/list');
          setUsers(response.data || []);
        } catch (error) {
          console.error('Error fetching users:', error);
          notifyError('فشل في تحميل قائمة الموظفين');
        } finally {
          setUsersLoading(false);
        }
      };
      fetchUsers();
    }
  }, [open]);
  const handleAddExpense = () => {
    setExpenses([...expenses, { type: "", amount: "", description: "", userId: null }]);
  };
  const handleRemoveExpense = (index) => {
    if (expenses.length > 1) {
      const newExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(newExpenses);
      const newErrors = [...errors];
      newErrors.splice(index, 1);
      setErrors(newErrors);
    }
  };
  const handleChange = (index, field) => (event) => {
    const value = event.target.value;
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    if (field === 'type' && value !== 'مصروف رواتب') {
      newExpenses[index].userId = null;
    }
    setExpenses(newExpenses);
    if (errors[index]?.[field]) {
      const newErrors = [...errors];
      if (newErrors[index]) {
        newErrors[index][field] = "";
        if (Object.values(newErrors[index]).every(val => !val)) {
          newErrors.splice(index, 1);
        }
        setErrors(newErrors);
      }
    }
  };
  const validateForm = () => {
    const newErrors = [];
    let isValid = true;
    expenses.forEach((expense, index) => {
      const expenseErrors = {};
      if (!expense.type || expense.type.trim() === "") {
        expenseErrors.type = "نوع المصروف مطلوب";
        isValid = false;
      }
      if (!expense.amount || expense.amount.trim() === "") {
        expenseErrors.amount = "المبلغ مطلوب";
        isValid = false;
      } else {
        const amount = parseFloat(expense.amount);
        if (isNaN(amount) || amount <= 0) {
          expenseErrors.amount = "يرجى إدخال مبلغ صحيح";
          isValid = false;
        }
      }
      if (expense.type === 'مصروف رواتب' && !expense.userId) {
        expenseErrors.userId = "يجب اختيار الموظف عند إضافة مصروف رواتب";
        isValid = false;
      }
      if (Object.keys(expenseErrors).length > 0) {
        newErrors[index] = expenseErrors;
      }
    });
    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const formattedExpenses = expenses.map(expenseItem => ({
        type: expenseItem.type.trim(),
        amount: parseFloat(expenseItem.amount),
        description: expenseItem.description.trim(),
        ...(expenseItem.userId && { userId: expenseItem.userId })
      }));
      await createExpense({ expenses: formattedExpenses });
      notifySuccess("تم إضافة المصروفات بنجاح");
      onSuccess();
      onClose();
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء إضافة المصروفات"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
      fullScreen={isSmallScreen ?? isMobile}
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "primary.main", bgcolor: 'background.paper' }}>
        إضافة مصروفات جديدة
      </DialogTitle>
      <DialogContent sx={{ bgcolor: 'background.paper' }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {expenses.map((expense, index) => (
            <Box key={index} sx={{ position: "relative" }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: "text.primary" }}>
                مصروف #{index + 1}
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth required error={!!errors[index]?.type}>
                  <InputLabel>نوع المصروف</InputLabel>
                  <Select
                    name="type"
                    value={expense.type}
                    onChange={handleChange(index, "type")}
                    label="نوع المصروف"
                  >
                    {EXPENSE_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[index]?.type && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, mr: 2 }}>
                      {errors[index]?.type}
                    </Typography>
                  )}
                </FormControl>
                {expense.type === 'مصروف رواتب' && (
                  <Autocomplete
                    options={users}
                    getOptionLabel={(option) => option.name || ''}
                    value={users.find(user => user.id === expense.userId) || null}
                    onChange={(event, newValue) => {
                      const value = newValue ? newValue.id : null;
                      const newExpenses = [...expenses];
                      newExpenses[index].userId = value;
                      setExpenses(newExpenses);
                      if (errors[index]?.userId) {
                        const newErrors = [...errors];
                        if (newErrors[index]) {
                          newErrors[index].userId = "";
                          if (Object.values(newErrors[index]).every(val => !val)) {
                            newErrors.splice(index, 1);
                          }
                          setErrors(newErrors);
                        }
                      }
                    }}
                    loading={usersLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="اختر الموظف"
                        required
                        error={!!errors[index]?.userId}
                        helperText={errors[index]?.userId}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                    noOptionsText="لا توجد نتائج"
                    loadingText="جاري البحث..."
                  />
                )}
                <TextField
                  name="amount"
                  label="المبلغ"
                  type="number"
                  value={expense.amount}
                  onChange={handleChange(index, "amount")}
                  fullWidth
                  required
                  error={!!errors[index]?.amount}
                  helperText={errors[index]?.amount}
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  name="description"
                  label="الوصف"
                  value={expense.description}
                  onChange={handleChange(index, "description")}
                  fullWidth
                  error={!!errors[index]?.description}
                  helperText={errors[index]?.description}
                  multiline
                  rows={2}
                  placeholder={
                    expense.type === 'مصروف رواتب' ? 'مثال: راتب شهر ديسمبر' :
                    expense.type === 'مصروف بنزين' ? 'مثال: مصروف بنزين السيارة' :
                    expense.type === 'مصروفات انترنت' ? 'مثال: فاتورة الانترنت' :
                    expense.type === 'مصروفات ورقية' ? 'مثال: شراء أوراق مكتبية' :
                    expense.type === 'مصروفات كهرباء' ? 'مثال: فاتورة الكهرباء' :
                    expense.type === 'مصروفات تشغيلية' ? 'مثال: مصروفات تشغيلية للمكتب' :
                    'مثال: مصروفات أخرى'
                  }
                />
              </Stack>
              {expenses.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveExpense(index)}
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
              {index < expenses.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddExpense}
            sx={{ alignSelf: "flex-start" }}
          >
            إضافة مصروف آخر
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1, flexDirection: "row-reverse", justifyContent: "space-between", bgcolor: 'background.paper' }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
        >
          {loading ? <CircularProgress size={20} /> : "حفظ المصروفات"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AddExpense;