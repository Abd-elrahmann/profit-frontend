import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Modal,
  Autocomplete,
  Stack,
  TextField,
  CircularProgress,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import Api from '../../config/Api';
import { Search, RestartAlt, Close as CloseIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

// Responsive modal styles
const getModalStyle = (isSmallScreen) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: isSmallScreen ? '95vw' : { xs: '450px', sm: '500px', md: '600px' },
  maxWidth: '600px',
  maxHeight: isSmallScreen ? '90vh' : '80vh',
  bgcolor: 'background.paper',
  border: '1px solid #e0e0e0',
  boxShadow: 24,
  p: isSmallScreen ? 2 : 4,
  borderRadius: 3,
  overflow: 'auto',
});

// API functions
const getAccounts = async (page = 1, searchQuery = '') => {
  const params = new URLSearchParams();
  if (searchQuery) {
    params.append('search', searchQuery);
  }
  params.append('limit', '10');
  
  const response = await Api.get(`/api/accounts/all/${page}${params.toString() ? `?${params.toString()}` : ''}`);
  return response.data;
};

const searchAccounts = async (searchQuery) => {
  const response = await Api.get(`/api/accounts/all/1?search=${encodeURIComponent(searchQuery)}&limit=10`);
  return response.data;
};

const GeneralLedgerSearch = ({ open, onClose, onSearch }) => {
  const [accounts, setAccounts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  // Fetch initial accounts
  useEffect(() => {
    const fetchInitialAccounts = async () => {
      if (open) {
        setIsLoading(true);
        try {
          const data = await getAccounts(1, '');
          setAccounts(data.accounts || []);
          setSearchResults(data.accounts || []);
        } catch (error) {
          console.error('Error fetching accounts:', error);
          setAccounts([]);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInitialAccounts();
  }, [open]);

  // Handle account search
  useEffect(() => {
    const searchAccountsData = async () => {
      if (searchInput.trim().length > 2) {
        setIsLoading(true);
        try {
          const results = await searchAccounts(searchInput);
          setSearchResults(results.accounts || []);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults(accounts);
      }
    };

    const timeoutId = setTimeout(searchAccountsData, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput, accounts]);

  const formik = useFormik({
    initialValues: {
      account: null,
      fromDate: null,
      toDate: null,
    },
    onSubmit: (values) => {
      onSearch({
        account: values.account,
        fromDate: values.fromDate ? values.fromDate.format('YYYY-MM-DD') : null,
        toDate: values.toDate ? values.toDate.format('YYYY-MM-DD') : null,
      });
      onClose(); // Close modal after search
    },
  });

  const handleReset = () => {
    formik.resetForm();
    setSearchInput('');
  };

  const handleAccountChange = (event, value) => {
    formik.setFieldValue('account', value);
  };

  const handleInputChange = (event, value) => {
    setSearchInput(value);
  };

  const handleClose = () => {
    formik.resetForm();
    setSearchInput('');
    onClose();
  };

  const options = searchInput.trim().length > 2 ? searchResults : accounts;

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="general-ledger-search-title"
      sx={{
        backdropFilter: 'blur(2px)',
      }}
    >
      <Box sx={getModalStyle(isSmallScreen)}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography
            id="general-ledger-search-title"
            variant={isSmallScreen ? "h6" : "h5"}
            component="h2"
            sx={{ 
              fontWeight: '600',
              color: 'primary.main',
            }}
          >
            بحث في دفتر الأستاذ
          </Typography>
          <IconButton 
            onClick={handleClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={isSmallScreen ? 2 : 3}>
            {/* Account Selection */}
            <Autocomplete
              id="account-autocomplete"
              options={options}
              value={formik.values.account}
              onChange={handleAccountChange}
              onInputChange={handleInputChange}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography variant="body1" fontWeight="500" noWrap>
                      {option.code} - {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getAccountTypeArabic(option.type)}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="اختر الحساب"
                  placeholder="ابحث باسم الحساب أو الكود..."
                  variant="outlined"
                  required
                  error={formik.touched.account && !formik.values.account}
                  helperText={
                    formik.touched.account && !formik.values.account
                      ? 'الحساب مطلوب'
                      : ''
                  }
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
              size={isSmallScreen ? "small" : "medium"}
            />
              )}
              loading={isLoading}
              noOptionsText="لا توجد حسابات مطابقة"
              size={isSmallScreen ? "small" : "medium"}
            />

            {/* Date Range */}
            <DatePicker
              label="من تاريخ"
              value={formik.values.fromDate}
              onChange={(newValue) => formik.setFieldValue('fromDate', newValue)}
              maxDate={formik.values.toDate || dayjs()}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  variant="outlined"
                  size={isSmallScreen ? "small" : "medium"}
                  InputLabelProps={{ shrink: true }}
                />
              )}
              slotProps={{
                textField: {
                  size: isSmallScreen ? "small" : "medium",
                  InputLabelProps: {
                    shrink: true,
                  },
                  sx: { 
                    width: '100%',
                  }
                }
              }}
            />

            <DatePicker
              label="إلى تاريخ"
              value={formik.values.toDate}
              onChange={(newValue) => formik.setFieldValue('toDate', newValue)}
              minDate={formik.values.fromDate || dayjs().startOf('month')}
              maxDate={dayjs()}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  variant="outlined"
                  size={isSmallScreen ? "small" : "medium"}
                  InputLabelProps={{ shrink: true }}
                />
              )}
              slotProps={{
                textField: {
                  size: isSmallScreen ? "small" : "medium",
                  InputLabelProps: {
                    shrink: true,
                  },
                  sx: { 
                    width: '100%',
                  }
                }
              }}
            />

            {/* Action Buttons */}
            <Stack 
              direction={isSmallScreen ? "column" : "row"} 
              gap={2}
              sx={{ mt: 2 }}
            >
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleReset}
                startIcon={<RestartAlt />}
                size={isSmallScreen ? "medium" : "large"}
                sx={{
                  color: 'text.secondary',
                  borderColor: 'text.secondary',
                  '&:hover': {
                    borderColor: 'text.primary',
                    bgcolor: 'action.hover'
                  },
                  order: isSmallScreen ? 2 : 1
                }}
              >
                إعادة تعيين
              </Button>
              <Button 
                variant="contained" 
                fullWidth 
                type="submit" 
                disabled={!formik.values.account}
                startIcon={<Search />}
                size={isSmallScreen ? "medium" : "large"}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&:disabled': {
                    bgcolor: 'action.disabled',
                    color: 'text.disabled'
                  },
                  order: isSmallScreen ? 1 : 2
                }}
              >
                بحث
              </Button>
            </Stack>

            {/* Selected Account Info (when account is selected) */}
            {formik.values.account && (
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.100',
                  mt: 1
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main" gutterBottom>
                  الحساب المحدد:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formik.values.account.code} - {formik.values.account.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  النوع: {getAccountTypeArabic(formik.values.account.type)}
                </Typography>
              </Box>
            )}
          </Stack>
        </form>

        {/* Footer Help Text */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f0f0f0' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            اختر الحساب وتاريخ البداية والنهاية لعرض القيود المحاسبية
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

const getAccountTypeArabic = (type) => {
  const typeMap = {
    'ASSET': 'أصول',
    'LIABILITY': 'خصوم',
    'EQUITY': 'حقوق ملكية',
    'REVENUE': 'إيرادات',
    'EXPENSE': 'مصروفات'
  };
  return typeMap[type] || type;
};

export default GeneralLedgerSearch;