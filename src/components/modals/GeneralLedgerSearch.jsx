import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Modal,
  Autocomplete,
  Stack,
  TextField,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useFormik } from 'formik';
import Api from '../../config/Api';
import { Search, Cancel, CheckCircle, RestartAlt } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '450px', sm: '600px', md: '700px', lg: '600px' },
  bgcolor: 'background.paper',
  border: '1px solid var(--primary)',
  boxShadow: 24,
  p: 4,
  borderRadius: 3,
};

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

  const options = searchInput.trim().length > 2 ? searchResults : accounts;

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      aria-labelledby="general-ledger-search-title"
    >
      <Box sx={style}>
        <Typography
          id="general-ledger-search-title"
          variant="h6"
          component="h2"
          sx={{ 
            fontSize: '1.3rem', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: 'primary.main',
            textAlign: 'center'
          }}
        >
          بحث في دفتر الأستاذ
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        {option.code} - {option.name}
                      </Typography>
                    </Box>
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
                />
              )}
              loading={isLoading}
              noOptionsText="لا توجد حسابات مطابقة"
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
                />
              )}
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
                />
              )}
            />

            {/* Action Buttons */}
            <Stack direction="row" gap={2}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleReset}
                startIcon={<RestartAlt sx={{marginLeft: '10px'}} />}
                sx={{
                  color: 'text.secondary',
                  borderColor: 'text.secondary',
                  '&:hover': {
                    borderColor: 'text.primary',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                إعادة تعيين
              </Button>
              <Button 
                variant="contained" 
                fullWidth 
                type="submit" 
                disabled={!formik.values.account}
                startIcon={<Search sx={{marginLeft: '10px'}} />}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                  minWidth: 120,
                  '&:disabled': {
                    bgcolor: 'action.disabled',
                    color: 'text.disabled'
                  }
                }}
              >
                بحث
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};



export default GeneralLedgerSearch;