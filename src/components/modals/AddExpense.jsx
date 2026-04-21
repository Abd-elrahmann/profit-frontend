import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { getBanks } from "../../pages/Banks/bankApis";
import BankAccountBalanceInline from "../loans/BankAccountBalanceInline";
import { debounce } from "../../utilities/debounce";
import { useAuth } from "../Contexts/AuthContext";
import { createExpense, getNextExpenseVoucherNumber } from "../../pages/Expenses/expensesApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import Api from "../../config/Api";
import ExpenseVoucherGenerator from "../receipts/ExpenseVoucherGenerator";
import ExpenseVoucherPreview from "../receipts/ExpenseVoucherPreview";
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
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([
    { type: "", amount: "", description: "", userId: null }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [voucherPreviewOpen, setVoucherPreviewOpen] = useState(false);
  const [voucherHtml, setVoucherHtml] = useState("");
  const [formattedExpensesForSubmit, setFormattedExpensesForSubmit] = useState(null);
  const [voucherReference, setVoucherReference] = useState(null);
  const voucherGeneratorRef = useRef(null);
  const [banksPage, setBanksPage] = useState(1);
  const [banksSearchQuery, setBanksSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const debouncedBanksSearch = useMemo(
    () => debounce((v) => { setBanksSearchQuery(v); setBanksPage(1); }, 400),
    []
  );
  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ["banks", "add-expense", banksPage, banksSearchQuery],
    queryFn: () => getBanks(banksPage, banksSearchQuery),
    enabled: open,
    retry: 1,
  });
  useEffect(() => {
    if (open) {
      setExpenses([{ type: "", amount: "", description: "", userId: null }]);
      setSelectedBank(null);
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
    if (!selectedBank?.id) {
      notifyError("يرجى اختيار الحساب البنكي");
      return false;
    }
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
  const handleShowVoucher = async () => {
    if (!validateForm()) return;
    const formatted = expenses.map((expenseItem) => ({
      type: expenseItem.type.trim(),
      amount: parseFloat(expenseItem.amount),
      description: expenseItem.description?.trim() || "",
      BankId: selectedBank.id,
      ...(expenseItem.userId && { userId: expenseItem.userId }),
    }));
    const expenseData = { expenses: formatted };
    setFormattedExpensesForSubmit(formatted);
    try {
      const nextNum = await getNextExpenseVoucherNumber();
      const ref = `EXP-${nextNum}`;
      setVoucherReference(ref);
      const html = voucherGeneratorRef.current?.generateVoucher(expenseData, nextNum);
      if (html) {
        setVoucherHtml(html);
        setVoucherPreviewOpen(true);
      }
    } catch (error) {
      notifyError("فشل في جلب رقم السند");
    }
  };

  const handleSaveVoucherAndExpense = async () => {
    if (!formattedExpensesForSubmit?.length) {
      notifyError("لا توجد بيانات مصروفات");
      return;
    }
    setLoading(true);
    try {
      const voucherUrl = await voucherGeneratorRef.current?.generatePDF();
      await createExpense({ expenses: formattedExpensesForSubmit }, voucherUrl, voucherReference);
      notifySuccess("تم حفظ السند وإضافة المصروفات بنجاح");
      onSuccess();
      setVoucherPreviewOpen(false);
      setVoucherHtml("");
      setFormattedExpensesForSubmit(null);
      setVoucherReference(null);
      onClose();
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء حفظ السند وإضافة المصروفات"
      );
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = formattedExpensesForSubmit?.reduce((sum, e) => sum + (e.amount || 0), 0) ?? 0;
  const expenseTypeLabel = formattedExpensesForSubmit?.length === 1
    ? formattedExpensesForSubmit[0].type
    : formattedExpensesForSubmit?.map((e) => e.type).join("، ");
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
          <Autocomplete
            options={banksData?.data || []}
            getOptionLabel={(option) => `${option.name} - ${option.accountNumber}`}
            value={selectedBank}
            onChange={(_, v) => setSelectedBank(v)}
            onInputChange={(_, v, reason) => {
              if (reason === "input") debouncedBanksSearch(v);
            }}
            loading={isBanksLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="الحساب البنكي (صرف المصروفات)"
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
          onClick={handleShowVoucher}
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
        >
          عرض السند وحفظ
        </Button>
      </DialogActions>
      <ExpenseVoucherGenerator
        ref={voucherGeneratorRef}
        expenseData={formattedExpensesForSubmit ? { expenses: formattedExpensesForSubmit } : null}
        employeesList={users}
        currentUserName={user?.name || ''}
      />
      <ExpenseVoucherPreview
        open={voucherPreviewOpen}
        onClose={() => {
          setVoucherPreviewOpen(false);
          setVoucherHtml("");
          setFormattedExpensesForSubmit(null);
          setVoucherReference(null);
        }}
        voucherHtml={voucherHtml}
        onSaveVoucher={handleSaveVoucherAndExpense}
        loading={loading}
        totalAmount={totalAmount}
        expenseType={expenseTypeLabel}
      />
    </Dialog>
  );
};
export default AddExpense;