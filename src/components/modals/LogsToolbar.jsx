import React, { useRef } from "react";
import {
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
} from "@mui/material";
import { 
  RestartAltOutlined, 
  FilterList 
} from "@mui/icons-material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";

const LogsToolbar = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const {
    search,
    screen,
    action,
    from,
    to,
    userName,
  } = filters;

  const searchInputRef = useRef(null);

  const handleActionChange = (event) => {
    onFilterChange('action', event.target.value);
  };

  const handleScreenChange = (event) => {
    onFilterChange('screen', event.target.value);
  };

  const handleFromDateChange = (newValue) => {
    onFilterChange('from', newValue ? newValue.format('YYYY-MM-DD') : '');
  };

  const handleToDateChange = (newValue) => {
    onFilterChange('to', newValue ? newValue.format('YYYY-MM-DD') : '');
  };

  const handleReset = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    onResetFilters();
  };

  // Check if any filters are active
  const hasActiveFilters = search || screen || action || from || to || userName;

  const screenOptions = [
    { value: "Auth", label: "المصادقة" },
    { value: "Bank Accounts", label: "الحسابات البنكية" },
    { value: "Clients", label: "العملاء" },
    { value: "Journals", label: "القيود" },
    { value: "Loans", label: "السلف" },
    { value: "Partners", label: "الشركاء" },
    { value: "Repayments", label: "الأقساط" },
    { value: "Roles", label: "الأدوار" },
    { value: "Templates", label: "القوالب" },
    { value: "Users", label: "المستخدمين" },
  ];

  // Action options with Arabic translations
  const actionOptions = [
    { value: "CREATE", label: "إنشاء" },
    { value: "UPDATE", label: "تعديل" },
    { value: "DELETE", label: "حذف" },
    { value: "VIEW", label: "عرض" },
    { value: "login", label: "تسجيل دخول" },
    { value: "logout", label: "تسجيل خروج" },
  ];

  return (
    <Box 
      sx={{ 
        p: 3, 
        bgcolor: "background.paper", 
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        mb: 3
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          <Box sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            فلترة السجلات
          </Box>
        </Box>
        
        {hasActiveFilters && (
          <Chip
            label="بحث مفعل"
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {/* All filters in one row */}
      <Stack 
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        {/* Action and Screen Filters */}
        <Stack 
          direction="row" 
          spacing={4}
          alignItems="center"
          sx={{ flex: 1 }}
        >
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel shrink>نوع الإجراء</InputLabel>
            <Select
              value={action || ""}
              onChange={handleActionChange}
              label="نوع الإجراء"
              notched
            >
              <MenuItem value="">كل الإجراءات</MenuItem>
              {actionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel shrink>الشاشة</InputLabel>
            <Select
              value={screen || ""}
              onChange={handleScreenChange}
              label="الشاشة"
              notched
            >
              <MenuItem value="">كل الشاشات</MenuItem>
              {screenOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Date Range Filters */}
        <Stack 
          direction="row" 
          spacing={2}
          alignItems="center"
          sx={{ flex: 1, justifyContent: 'center' }}
        >
          <DatePicker
            label="من تاريخ"
            value={from ? dayjs(from) : null}
            onChange={handleFromDateChange}
            slotProps={{
              textField: {
                size: 'small',
                InputLabelProps: {
                  shrink: true,
                },
                sx: { 
                  width: '250px',
                }
              }
            }}
            format="DD/MM/YYYY"
          />
          
          <DatePicker
            label="إلى تاريخ"
            value={to ? dayjs(to) : null}
            onChange={handleToDateChange}
            slotProps={{
              textField: {
                size: 'small',
                InputLabelProps: {
                  shrink: true,
                },
                sx: {
                  width: '250px',
                }
              }
            }}
            format="DD/MM/YYYY"
          />
        </Stack>

        {/* Reset Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<RestartAltOutlined />}
              onClick={handleReset}
              color="inherit"
              size="small"
            >
              إعادة تعيين
            </Button>
          )}
        </Box>
      </Stack>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {search && (
              <Chip 
                label={`بحث: ${search}`} 
                size="small" 
                onDelete={() => onFilterChange('search', '')}
                variant="outlined"
              />
            )}
            {userName && (
              <Chip 
                label={`مستخدم: ${userName}`} 
                size="small" 
                onDelete={() => onFilterChange('userName', '')}
                variant="outlined"
              />
            )}
            {action && (
              <Chip 
                label={`إجراء: ${actionOptions.find(a => a.value === action)?.label}`} 
                size="small" 
                onDelete={() => onFilterChange('action', '')}
                variant="outlined"
              />
            )}
            {screen && (
              <Chip 
                label={`شاشة: ${screenOptions.find(s => s.value === screen)?.label}`} 
                size="small" 
                onDelete={() => onFilterChange('screen', '')}
                variant="outlined"
              />
            )}
            {from && (
              <Chip 
                label={`من: ${dayjs(from).format('DD/MM/YYYY')}`} 
                size="small" 
                onDelete={() => onFilterChange('from', '')}
                variant="outlined"
              />
            )}
            {to && (
              <Chip 
                label={`إلى: ${dayjs(to).format('DD/MM/YYYY')}`} 
                size="small" 
                onDelete={() => onFilterChange('to', '')}
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default LogsToolbar;