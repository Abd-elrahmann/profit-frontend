import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ChevronRight,
  ExpandMore,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAccountsTree,
  createAccount,
  updateAccount,
  deleteAccount,
} from './chartApi';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import DeleteModal from '../../components/modals/DeleteModal';

const ChartOfAccount = () => {
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Fetch accounts tree
  const {
    data: accountsTree = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['accountsTree'],
    queryFn: getAccountsTree,
  });

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
        if (isEditing) {
          await updateAccount(selectedAccount.id, values);
          notifySuccess('تم تحديث الحساب بنجاح');
          const updatedAccount = { ...selectedAccount, ...values };
          setSelectedAccount(updatedAccount);
          queryClient.invalidateQueries(['accountsTree']);
          setIsEditing(false);
          setIsAdding(false);
          formik.setValues(updatedAccount);
        } else {
          await createAccount(values);
          notifySuccess('تم إنشاء الحساب بنجاح');
          queryClient.invalidateQueries(['accountsTree']);
          resetForm();
        }
      } catch (error) {
        notifyError(error.response?.data?.message || 'فشلت العملية');
      }
    },
  });

  const resetForm = () => {
    formik.resetForm();
    setIsEditing(false);
    setIsAdding(false);
    if (selectedAccount) {
      formik.setValues(selectedAccount);
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setIsEditing(false);
    setIsAdding(false);
    formik.setValues(account);
  };

  const handleAdd = () => {
    if (!selectedAccount) {
      notifyError('يرجى اختيار الحساب الرئيسي أولاً');
      return;
    }

    setIsAdding(true);
    setIsEditing(false);
    
    formik.setValues({
      name: '',
      code: generateChildCode(selectedAccount),
      parentId: selectedAccount.id,
      type: selectedAccount.type,
      nature: selectedAccount.nature,
      accountBasicType: '',
      level: selectedAccount.level + 1,
      isActive: true,
    });
  };

  const handleEdit = () => {
    if (!selectedAccount) {
      notifyError('يرجى اختيار حساب للتعديل');
      return;
    }
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleDelete = () => {
    if (!selectedAccount) {
      notifyError('يرجى اختيار حساب للحذف');
      return;
    }
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAccount(selectedAccount.id);
      notifySuccess('تم حذف الحساب بنجاح');
      queryClient.invalidateQueries(['accountsTree']);
      setSelectedAccount(null);
      resetForm();
      setDeleteModalOpen(false);
    } catch (error) {
      notifyError(error.response?.data?.message || 'فشل الحذف');
    }
  };

  const generateChildCode = (parent) => {
    if (!parent.children || parent.children.length === 0) {
      const baseCode = parseInt(parent.code);
      return String(baseCode + 1000).padStart(5, '0');
    }
    
    const lastChild = parent.children[parent.children.length - 1];
    const lastCode = parseInt(lastChild.code);
    return String(lastCode + 100).padStart(5, '0');
  };

  const toggleExpand = (accountId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedItems(newExpanded);
  };

  const renderAccountItem = (account, depth = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedItems.has(account.id);

    return (
      <Box key={account.id}>
        <ListItem
          sx={{
            pl: depth * 3,
            backgroundColor: selectedAccount?.id === account.id ? 'action.selected' : 'transparent',
            borderLeft: selectedAccount?.id === account.id ? '3px solid' : 'none',
            borderColor: 'primary.main',
          }}
          secondaryAction={
            hasChildren && (
              <IconButton
                size="small"
                onClick={() => toggleExpand(account.id)}
                sx={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              >
                <ExpandMore />
              </IconButton>
            )
          }
          disablePadding
        >
          <ListItemButton onClick={() => handleAccountSelect(account)}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {account.code}
                  </Typography>
                  <Typography variant="body1">{account.name}</Typography>
                  <Chip
                    label={getAccountTypeLabel(account.type)}
                    size="small"
                    color={
                      account.type === 'ASSET' ? 'primary' :
                      account.type === 'LIABILITY' ? 'secondary' :
                      account.type === 'EQUITY' ? 'success' :
                      account.type === 'REVENUE' ? 'warning' : 'error'
                    }
                  />
                  <Chip
                    label={`${account.balance.toLocaleString()}`}
                    size="small"
                    variant="outlined"
                    color={account.balance >= 0 ? 'success' : 'error'}
                  />
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {account.children.map(child => renderAccountItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const getAccountTypeLabel = (type) => {
    const typeMap = {
      'ASSET': 'أصول',
      'LIABILITY': 'خصوم',
      'EQUITY': 'حقوق ملكية',
      'REVENUE': 'إيرادات',
      'EXPENSE': 'مصروفات'
    };
    return typeMap[type] || type;
  };


  const accountTypes = [
    { value: 'ASSET', label: 'أصول' },
    { value: 'LIABILITY', label: 'خصوم' },
    { value: 'EQUITY', label: 'حقوق ملكية' },
    { value: 'REVENUE', label: 'إيرادات' },
    { value: 'EXPENSE', label: 'مصروفات' },
  ];

  const accountBasicTypes = [
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

  const natureTypes = [
    { value: 'DEBIT', label: 'مدين' },
    { value: 'CREDIT', label: 'دائن' },
  ];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        فشل تحميل الحسابات: {error.message}
      </Alert>
    );
  }

  return (
    <>
      <Helmet>
        <title>شجرة الحسابات</title>
      </Helmet>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 3 }, 
        minHeight: '70vh', 
        width: '100%' 
      }}>
        <Box sx={{ 
          flex: { md: '1 1 50%' }, 
          width: { xs: '100%', md: 'auto' },
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: 0 
        }}>
          <Box sx={{ 
            p: { xs: 1, sm: 2 }, 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            height: { xs: 'auto', md: '100%' },
            minHeight: { xs: '300px', md: 'auto' }
          }}>
            <Typography variant="h5" gutterBottom color='primary.main' fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              شجرة الحسابات
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List sx={{ flex: 1, overflow: 'auto', maxHeight: { xs: '400px', md: '70vh' } }}>
              {accountsTree.map(account => renderAccountItem(account))}
            </List>
          </Box>
        </Box>

        <Box sx={{ 
          flex: { md: '1 1 50%' }, 
          width: { xs: '100%', md: 'auto' },
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: 0 
        }}>
          <Box sx={{ 
            p: { xs: 1, sm: 2 }, 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1, sm: 2 }} 
              sx={{ mb: 2, gap: { xs: 1, sm: 2 } }}
            >
              {permissions.includes('accounts_Add') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{marginLeft: { xs: 0, sm: "10px" }}} />}
                  onClick={handleAdd}
                  disabled={!selectedAccount}
                  color="success"
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '120px' }
                  }}
                >
                  إضافة حساب فرعي
                </Button>
              )}
              {permissions.includes('accounts_Update') && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon sx={{marginLeft: { xs: 0, sm: "10px" }}} />}
                  onClick={handleEdit}
                  disabled={!selectedAccount}
                  color="warning"
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '120px' }
                  }}
                >
                  تعديل
                </Button>
              )}
              {permissions.includes('accounts_Delete') && (
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon sx={{marginLeft: { xs: 0, sm: "10px" }}} />}
                  onClick={handleDelete}
                  disabled={!selectedAccount}
                  color="error"
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { sm: '120px' }
                  }}
                >
                  حذف
                </Button>
              )}
            </Stack>

            <form onSubmit={formik.handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                {/* الصف الأول: اسم الحساب والنوع */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                  <TextField
                    sx={{ width: { xs: '100%', sm: '250px' } }}
                    label="اسم الحساب"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    disabled={!isEditing && !isAdding}
                    required
                    size="small"
                  />
                  <FormControl sx={{ width: { xs: '100%', sm: '250px' } }} disabled={!isAdding} size="small">
                    <InputLabel>نوع الحساب</InputLabel>
                    <Select
                      name="type"
                      value={formik.values.type}
                      onChange={formik.handleChange}
                      label="نوع الحساب"
                      required
                    >
                      {accountTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* الصف الثاني: الكود والطبيعة */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                  <TextField
                    sx={{ width: { xs: '100%', sm: '250px' } }}
                    label="كود الحساب"
                    name="code"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    disabled={!isAdding}
                    required
                    size="small"
                  />
                  <FormControl sx={{ width: { xs: '100%', sm: '250px' } }} disabled={!isAdding} size="small">
                    <InputLabel>طبيعة الحساب</InputLabel>
                    <Select
                      name="nature"
                      value={formik.values.nature}
                      onChange={formik.handleChange}
                      label="طبيعة الحساب"
                      required
                    >
                      {natureTypes.map(nature => (
                        <MenuItem key={nature.value} value={nature.value}>
                          {nature.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* الصف الثالث: النوع الأساسي والمستوى */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                  <FormControl sx={{ width: { xs: '100%', sm: '250px' } }} disabled={!isAdding} size="small">
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
                      {accountBasicTypes.map(basicType => (
                        <MenuItem key={basicType.value} value={basicType.value}>
                          {basicType.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    sx={{ width: { xs: '100%', sm: '250px' } }}
                    type="number"
                    label="المستوى"
                    name="level"
                    value={formik.values.level}
                    onChange={formik.handleChange}
                    disabled={!isAdding}
                    InputProps={{ inputProps: { min: 1 } }}
                    size="small"
                  />
                </Box>

                {/* الصف الرابع: الحالة */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                  <FormControl sx={{ width: { xs: '100%', sm: '250px' } }} disabled={!isAdding} size="small">
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
                </Box>

                {/* الصف الخامس والسادس: أرصدة الحساب */}
                {selectedAccount && (
                  <>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                      <TextField
                        sx={{ width: { xs: '100%', sm: '250px' } }}
                        label="مدين"
                        value={selectedAccount.debit?.toLocaleString() || '0'}
                        disabled
                        size="small"
                      />
                      <TextField
                        sx={{ width: { xs: '100%', sm: '250px' } }}
                        label="دائن"
                        value={selectedAccount.credit?.toLocaleString() || '0'}
                        disabled
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
                      <TextField
                        sx={{
                          width: { xs: '100%', sm: '250px' },
                          '& .MuiInputBase-input': {
                            color: selectedAccount.balance >= 0 ? 'success.main' : 'error.main',
                            fontWeight: 'bold',
                          },
                        }}
                        label="الرصيد"
                        value={selectedAccount.balance?.toLocaleString() || '0'}
                        disabled
                        size="small"
                      />
                    </Box>
                  </>
                )}

                {/* الصف الأخير: أزرار الحفظ والإلغاء */}
                {(isEditing || isAdding) && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 2 }, 
                    mt: 2 
                  }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      startIcon={<SaveIcon sx={{marginLeft: { xs: 0, sm: "10px" }}} />}
                      disabled={formik.isSubmitting}
                      sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { sm: '120px' }
                      }}
                    >
                      {formik.isSubmitting ? <CircularProgress size={24} /> : 'حفظ'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon sx={{marginLeft: { xs: 0, sm: "10px" }}} />}
                      onClick={resetForm}
                      disabled={formik.isSubmitting}
                      sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { sm: '120px' }
                      }}
                    >
                      إلغاء
                    </Button>
                  </Box>
                )}
              </Box>
            </form>
          </Box>
        </Box>
      </Box>

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف الحساب"
        message={`هل أنت متأكد من رغبتك في حذف الحساب "${selectedAccount?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </>
  );
};

export default ChartOfAccount;