import React, { useState, useEffect, useCallback } from "react";
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
import { updateExpense } from "../../pages/Expenses/expensesApi";
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

// Function to extract expense type from description
const extractExpenseType = (description) => {
  if (!description) return 'مصروفات اخرى';
  
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('بنزين') || lowerDesc.includes('وقود')) {
    return 'مصروف بنزين';
  } else if (lowerDesc.includes('انترنت') || lowerDesc.includes('نت')) {
    return 'مصروفات انترنت';
  } else if (lowerDesc.includes('ورق')) {
    return 'مصروفات ورقية';
  } else if (lowerDesc.includes('كهرباء') || lowerDesc.includes('كهربا')) {
    return 'مصروفات كهرباء';
  } else if (lowerDesc.includes('تشغيل') || lowerDesc.includes('تشغيلية')) {
    return 'مصروفات تشغيلية';
  } else if (lowerDesc.includes('راتب') || lowerDesc.includes('مرتب')) {
    return 'مصروف رواتب';
  } else {
    return 'مصروفات اخرى';
  }
};


// Function to extract employee name for salary expenses
const extractEmployeeName = (description) => {
  if (!description || !description.includes('-')) return null;
  
  const parts = description.split('-');
  if (parts[0].includes('راتب') || parts[0].includes('صرف راتب')) {
    return parts[1]?.trim() || null;
  }
  
  return null;
};

const EditExpense = ({ open, onClose, onSuccess, expense, isMobile = false }) => {
  const [expenses, setExpenses] = useState([
    { type: "", amount: "", description: "", userId: null }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Debounced user search function
  const debouncedUserSearch = useCallback(
    (searchTerm) => {
      let timeout;
      return function executedFunction() {
        const later = async () => {
          clearTimeout(timeout);
          try {
            setUsersLoading(true);
            const params = searchTerm ? { name: searchTerm } : {};
            const response = await Api.get('/api/expenses/users/list', { params });
            setUsers(response.data || []);
          } catch (error) {
            console.error('Error fetching users:', error);
            notifyError('فشل في تحميل قائمة الموظفين');
          } finally {
            setUsersLoading(false);
          }
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, 300);
      }();
    },
    []
  );

  useEffect(() => {
    if (open) {
      // Load users when modal opens
      debouncedUserSearch('');
    }
  }, [open, debouncedUserSearch]);

  // Find user by name
  const findUserByName = (name) => {
    return users.find(user => user.name === name) || null;
  };

  useEffect(() => {
    if (open && expense) {

      if (expense.lines && expense.lines.length > 0) {
        // Filter expense lines (exclude bank line which has credit > 0)
        const expenseLines = expense.lines.filter(line => line.debit > 0);

        const formattedExpenses = expenseLines.map((line) => {

          // Extract information from line.type (the API structure has type directly)
          const type = line.type || "";
          const description = type; // Use type as description for display

          // Determine expense type based on the type field
          let expenseType;
          if (EXPENSE_TYPES.includes(type)) {
            expenseType = type;
          } else {
            expenseType = extractExpenseType(type);
          }

          // Extract employee name for salary expenses (from type field)
          const employeeName = extractEmployeeName(type);

          // Find user for salary expenses
          let userId = null;
          if (expenseType === 'مصروف رواتب' && employeeName) {
            const user = findUserByName(employeeName);
            userId = user ? user.id : null;
          }

          return {
            type: expenseType,
            amount: line.debit || line.amount || "",
            description: description,
            userId: userId
          };
        });

        setExpenses(formattedExpenses.length > 0 ? formattedExpenses : [{ type: "", amount: "", description: "", userId: null }]);
      } else {
        setExpenses([{ type: "", amount: "", description: "", userId: null }]);
      }

      setErrors([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense, users]);

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

    // If changing type and it's not salary expense, clear userId
    if (field === 'type' && value !== 'مصروف رواتب') {
      newExpenses[index].userId = null;
      newExpenses[index].description = newExpenses[index].description.replace(/ - .*$/, '');
    }

    // If clearing userId for salary expense, remove employee name from description
    if (field === 'userId' && !value && newExpenses[index].type === 'مصروف رواتب') {
      newExpenses[index].description = newExpenses[index].description.replace(/ - .*$/, '');
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

      if (!expense.description || expense.description.trim() === "") {
        expenseErrors.description = "الوصف مطلوب";
        isValid = false;
      }

      // Validate user selection for salary expenses
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
      const formattedExpenses = expenses.map(expense => {
        let description = expense.description.trim();
        
        // For salary expenses, add employee name to description
        if (expense.type === 'مصروف رواتب' && expense.userId) {
          const employee = users.find(user => user.id === expense.userId);
          if (employee) {
            description = `${description} - ${employee.name}`;
          }
        }
        
        return {
          type: expense.type.trim(),
          amount: parseFloat(expense.amount),
          description: description,
          ...(expense.userId && { userId: expense.userId })
        };
      });

      
      await updateExpense(expense.journalId, { expenses: formattedExpenses });
      notifySuccess("تم تعديل المصروفات بنجاح");
      onSuccess();
      onClose();
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء تعديل المصروفات"
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
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "primary.main" }}>
        تعديل المصروفات
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {expenses.map((expenseItem, index) => (
            <Box key={index} sx={{ position: "relative" }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: "black" }}>
                مصروف #{index + 1}
              </Typography>
              
              <Stack spacing={2}>
                <FormControl fullWidth required error={!!errors[index]?.type}>
                  <InputLabel>نوع المصروف</InputLabel>
                  <Select
                    name="type"
                    value={expenseItem.type}
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

                {expenseItem.type === 'مصروف رواتب' && (
                  <Autocomplete
                    options={users}
                    getOptionLabel={(option) => option.name || ''}
                    value={users.find(user => user.id === expenseItem.userId) || null}
                    onChange={(event, newValue) => {
                      const value = newValue ? newValue.id : null;
                      const newExpenses = [...expenses];
                      newExpenses[index].userId = value;
                      
                      // Update description with employee name
                      if (newValue) {
                        let description = newExpenses[index].description;
                        // Remove any existing employee name
                        description = description.replace(/ - .*$/, '');
                        newExpenses[index].description = description;
                      }
                      
                      setExpenses(newExpenses);

                      // Clear error for this field
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
                    onInputChange={(event, newInputValue) => {
                      if (newInputValue) {
                        debouncedUserSearch(newInputValue);
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
                  value={expenseItem.amount}
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
                  value={expenseItem.description}
                  onChange={handleChange(index, "description")}
                  fullWidth
                  required
                  error={!!errors[index]?.description}
                  helperText={errors[index]?.description}
                  multiline
                  rows={2}
                  placeholder={expenseItem.type === 'مصروف رواتب' ? 'مثال: صرف راتب ديسمبر' : 'مثال: مصروف بنزين السيارة'}
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
      <DialogActions sx={{ p: 2, gap: 1,flexDirection: "row-reverse",justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: "primary.main",
            "&:hover": { bgcolor: "#2E8B41" },
           }}
        >
          {loading ? <CircularProgress size={20} /> : "تعديل المصروفات"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditExpense;