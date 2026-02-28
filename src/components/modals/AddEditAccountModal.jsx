import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import { createAccount, updateAccount } from '../../pages/chartOfAccounts/chartApi';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { generateChildCode } from '../ChartOfAccounts/chartOfAccountsUtils';
const ACCOUNT_TYPES = [
  { value: 'ASSET', label: 'أصول' },
  { value: 'LIABILITY', label: 'خصوم' },
  { value: 'EQUITY', label: 'حقوق ملكية' },
  { value: 'REVENUE', label: 'إيرادات' },
  { value: 'EXPENSE', label: 'مصروفات' },
];
const ACCOUNT_BASIC_TYPES = [
  { value: 'OTHER', label: 'أخرى' },
  { value: 'BANK', label: 'بنك' },
  { value: 'LOANS_RECEIVABLE', label: 'سلفات للعملاء' },
  { value: 'SMALL_LOANS_RECEIVABLE', label: 'سلفات صغيرة للعملاء' },
  { value: 'PARTNER_PAYABLE', label: 'مستحق للشركاء' },
  { value: 'PARTNER_EQUITY', label: 'رأس مال الشريك' },
  { value: 'LOAN_INCOME', label: 'إيراد السلفات' },
  { value: 'COMPANY_SHARES', label: 'حصص الشركة' },
  { value: 'PARTNER_SHARES_EXPENSES', label: 'مصروفات توزيع الأرباح' },
];
const NATURE_TYPES = [
  { value: 'DEBIT', label: 'مدين' },
  { value: 'CREDIT', label: 'دائن' },
];
const AddEditAccountModal = ({ open, onClose, account, parentAccount, onSuccess, isEdit }) => {
  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      parentId: null,
      type: '',
      nature: '',
      accountBasicType: '',
      level: 1,
      isActive: true,
    },
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await updateAccount(account.id, values);
          notifySuccess('تم تحديث الحساب بنجاح');
        } else {
          await createAccount(values);
          notifySuccess('تم إنشاء الحساب بنجاح');
        }
        onSuccess?.();
        onClose();
      } catch (error) {
        notifyError(error.response?.data?.message || 'فشلت العملية');
      }
    },
  });
  useEffect(() => {
    if (open) {
      if (isEdit && account) {
        formik.setValues({
          name: account.name,
          code: account.code,
          parentId: account.parentId,
          type: account.type,
          nature: account.nature,
          accountBasicType: account.accountBasicType || '',
          level: account.level ?? 1,
          isActive: account.isActive !== false,
        });
      } else if (parentAccount) {
        formik.setValues({
          name: '',
          code: generateChildCode(parentAccount),
          parentId: parentAccount.id,
          type: parentAccount.type,
          nature: parentAccount.nature,
          accountBasicType: '',
          level: (parentAccount.level ?? 1) + 1,
          isActive: true,
        });
      } else {
        formik.setValues({
          name: '',
          code: '',
          parentId: null,
          type: 'ASSET',
          nature: 'DEBIT',
          accountBasicType: '',
          level: 1,
          isActive: true,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, account, parentAccount]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'تعديل الحساب' : 'إضافة حساب جديد'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <div className="flex flex-col gap-4">
            <TextField
              fullWidth
              label="اسم الحساب"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              required
              size="small"
            />
            <TextField
              fullWidth
              label="كود الحساب"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              required
              size="small"
              disabled={isEdit}
            />
            <FormControl fullWidth size="small" disabled={!!parentAccount}>
              <InputLabel>نوع الحساب</InputLabel>
              <Select
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                label="نوع الحساب"
                required
              >
                {ACCOUNT_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={!!parentAccount}>
              <InputLabel>طبيعة الحساب</InputLabel>
              <Select
                name="nature"
                value={formik.values.nature}
                onChange={formik.handleChange}
                label="طبيعة الحساب"
                required
              >
                {NATURE_TYPES.map((n) => (
                  <MenuItem key={n.value} value={n.value}>
                    {n.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={!!parentAccount}>
              <InputLabel>النوع الأساسي</InputLabel>
              <Select
                name="accountBasicType"
                value={formik.values.accountBasicType}
                onChange={formik.handleChange}
                label="النوع الأساسي"
              >
                <MenuItem value="">
                  <em>لا شيء</em>
                </MenuItem>
                {ACCOUNT_BASIC_TYPES.map((b) => (
                  <MenuItem key={b.value} value={b.value}>
                    {b.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="المستوى"
              name="level"
              value={formik.values.level}
              onChange={formik.handleChange}
              required
              size="small"
              disabled={!!parentAccount}
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth size="small" disabled={!!parentAccount}>
              <InputLabel>الحالة</InputLabel>
              <Select
                name="isActive"
                value={formik.values.isActive}
                onChange={formik.handleChange}
                label="الحالة"
              >
                <MenuItem value={true}>نشط</MenuItem>
                <MenuItem value={false}>غير نشط</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting}
            startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {formik.isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default AddEditAccountModal;