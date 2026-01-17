import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
  Typography,
  IconButton,
  Divider,
  Paper,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Grid,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const PeriodsAdvancedSearch = ({
  open,
  onClose,
  onApplyFilters,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    name: '',
    startDate: null,
    endDate: null,
    isClosed: null,
    limit: 10,
  });

  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    if (open) {
      const newFilters = {
        name: initialFilters.name || '',
        startDate: initialFilters.startDate ? dayjs(initialFilters.startDate) : null,
        endDate: initialFilters.endDate ? dayjs(initialFilters.endDate) : null,
        isClosed: initialFilters.isClosed !== undefined ? initialFilters.isClosed : null,
        limit: initialFilters.limit || 10,
      };
      setFilters(newFilters);
      updateActiveFilters(newFilters);
    }
  }, [open, initialFilters]);

  const updateActiveFilters = (filterValues) => {
    const active = [];
    
    if (filterValues.name) {
      active.push({ key: 'name', label: `اسم: ${filterValues.name}` });
    }
    
    if (filterValues.startDate) {
      active.push({ 
        key: 'startDate', 
        label: `من: ${dayjs(filterValues.startDate).format('YYYY-MM-DD')}` 
      });
    }
    
    if (filterValues.endDate) {
      active.push({ 
        key: 'endDate', 
        label: `إلى: ${dayjs(filterValues.endDate).format('YYYY-MM-DD')}` 
      });
    }
    
    if (filterValues.isClosed !== null) {
      const statusText = filterValues.isClosed ? 'مقفلة' : 'مفتوحة';
      active.push({ key: 'isClosed', label: `الحالة: ${statusText}` });
    }
    
    setActiveFilters(active);
  };

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);
    
    if (['name', 'startDate', 'endDate', 'isClosed'].includes(field)) {
      const filterForChips = { ...filters, [field]: value };
      updateActiveFilters(filterForChips);
    }
  };

  const handleApply = () => {
    const apiFilters = {
      ...filters,
      startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : undefined,
      endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : undefined,
      isClosed: filters.isClosed !== null ? filters.isClosed : undefined,
      limit: filters.limit,
    };
    
    Object.keys(apiFilters).forEach(key => {
      if (apiFilters[key] === undefined || apiFilters[key] === '') {
        delete apiFilters[key];
      }
    });
    
    onApplyFilters(apiFilters);
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters = {
      name: '',
      startDate: null,
      endDate: null,
      isClosed: null,
      limit: 10,
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
  };

  const handleRemoveFilter = (filterKey) => {
    const updatedFilters = { ...filters };
    
    switch (filterKey) {
      case 'name':
        updatedFilters.name = '';
        break;
      case 'startDate':
        updatedFilters.startDate = null;
        break;
      case 'endDate':
        updatedFilters.endDate = null;
        break;
      case 'isClosed':
        updatedFilters.isClosed = null;
        break;
      default:
        break;
    }
    
    setFilters(updatedFilters);
    
    const newActiveFilters = activeFilters.filter(filter => filter.key !== filterKey);
    setActiveFilters(newActiveFilters);
  };

  const handleReset = () => {
    const initialFilterValues = {
      name: initialFilters.name || '',
      startDate: initialFilters.startDate ? dayjs(initialFilters.startDate) : null,
      endDate: initialFilters.endDate ? dayjs(initialFilters.endDate) : null,
      isClosed: initialFilters.isClosed !== undefined ? initialFilters.isClosed : null,
      limit: initialFilters.limit || 10,
    };
    setFilters(initialFilterValues);
    updateActiveFilters(initialFilterValues);
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.name) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.isClosed !== null) count++;
    return count;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="advanced-search-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '80%', md: 600 },
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              بحث متقدم في الفترات
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={onClose} size="small">
              <ClearIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {activeFilters.length > 0 && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                bgcolor: 'grey.50',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                الفلاتر النشطة ({activeFilters.length})
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {activeFilters.map((filter) => (
                  <Chip
                    key={filter.key}
                    label={filter.label}
                    size="small"
                    onDelete={() => handleRemoveFilter(filter.key)}
                    sx={{ mb: 0.5 }}
                  />
                ))}
                <Chip
                  label="مسح الكل"
                  size="small"
                  variant="outlined"
                  onClick={handleClearAll}
                  sx={{ mb: 0.5 }}
                />
              </Stack>
            </Paper>
          )}

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="اسم الفترة"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="ابحث باسم الفترة..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                نطاق التاريخ
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="تاريخ البداية من"
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange('startDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="تاريخ النهاية إلى"
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>
                  حالة الفترة
                </FormLabel>
                <RadioGroup
                  row
                  value={filters.isClosed !== null ? filters.isClosed.toString() : 'all'}
                  onChange={(e) => {
                    const value = e.target.value;
                    let isClosedValue = null;
                    if (value === 'true') {
                      isClosedValue = true;
                    } else if (value === 'false') {
                      isClosedValue = false;
                    }
                    handleFilterChange('isClosed', isClosedValue);
                  }}
                >
                  <FormControlLabel
                    value="all"
                    control={<Radio size="small" />}
                    label="الكل"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio size="small" />}
                    label="مفتوحة"
                  />
                  <FormControlLabel
                    value="true"
                    control={<Radio size="small" />}
                    label="مقفلة"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                عدد النتائج في الصفحة
              </Typography>
              <TextField
                select
                fullWidth
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                SelectProps={{
                  native: true,
                }}
                size="small"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </TextField>
            </Box>
          </Stack>
                
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<ClearIcon />}
              disabled={
                filters.name === '' &&
                !filters.startDate &&
                !filters.endDate &&
                filters.isClosed === null
              }
            >
              إعادة تعيين
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              startIcon={<SearchIcon />}
              disabled={getFilterCount() === 0}
            >
              تطبيق البحث ({getFilterCount()})
            </Button>
          </Box>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default PeriodsAdvancedSearch;